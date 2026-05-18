import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { sendTaskClosedEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const { id } = await params;
    const narocnikId = (token.sub ?? token.id) as string;
    const { zvezdice, komentar } = await req.json();

    if (!zvezdice || zvezdice < 1 || zvezdice > 5) {
      return NextResponse.json({ error: "Ocena mora biti med 1 in 5" }, { status: 400 });
    }

    const { rows: nalogaRows } = await pool.query(
      `SELECT n.*,
              u_i.id AS "izvajalecUserId",
              u_i.email AS "izvajalecEmail",
              u_i.vloga AS "izvajalecVloga"
       FROM "Naloga" n
       JOIN "User" u_i ON u_i.id = n."izvajalecId"
       WHERE n.id = $1 AND n."narocnikId" = $2 AND n.status = 'caka_zakljucek'`,
      [id, narocnikId]
    );

    if (nalogaRows.length === 0) {
      return NextResponse.json({ error: "Naloga ni na voljo za zaključek" }, { status: 404 });
    }

    const naloga = nalogaRows[0];
    const izvajalecId = naloga.izvajalecUserId;

    await pool.query(
      `INSERT INTO "Rating" (id, zvezde, komentar, "nalogaId", "narocnikId", "izvajalecId")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("nalogaId") DO NOTHING`,
      [crypto.randomUUID(), zvezdice, komentar?.trim() || null, id, narocnikId, izvajalecId]
    );

    await pool.query(
      `UPDATE "Naloga" SET status = 'zaprta' WHERE id = $1`,
      [id]
    );

    // Update SpPodatki only if the izvajalec is SP (has a SpPodatki row)
    await pool.query(
      `UPDATE "SpPodatki"
       SET
         "skupniZasluzek" = "skupniZasluzek" + $1,
         "povprecnaOcena" = CASE
           WHEN "steviloOcen" = 0 THEN $2
           ELSE ("povprecnaOcena" * "steviloOcen" + $2) / ("steviloOcen" + 1)
         END,
         "steviloOcen" = "steviloOcen" + 1,
         "updatedAt" = NOW()
       WHERE "userId" = $3`,
      [naloga.cena, zvezdice, izvajalecId]
    );

    await pool.query(
      `INSERT INTO "Obvestilo" (id, besedilo, "userId", "nalogaId")
       VALUES ($1, $2, $3, $4)`,
      [
        crypto.randomUUID(),
        `Naročnik je potrdil nalogo "${naloga.naslov}" in vas ocenil z ${zvezdice} zvezdicami.`,
        izvajalecId,
        id,
      ]
    );

    if (naloga.izvajalecEmail) {
      sendTaskClosedEmail({
        to: naloga.izvajalecEmail,
        naslov: naloga.naslov,
        zvezdice,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/naloge/[id]/zakljuci]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
