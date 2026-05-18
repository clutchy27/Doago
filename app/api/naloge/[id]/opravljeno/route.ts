import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { sendTaskCompletedEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const { id } = await params;
    const izvajalecId = (token.sub ?? token.id) as string;

    const { rows } = await pool.query(
      `UPDATE "Naloga"
       SET status = 'caka_zakljucek'
       WHERE id = $1 AND "izvajalecId" = $2 AND status = 'plačano'
       RETURNING *, (SELECT email FROM "User" WHERE id = "narocnikId") AS "narocnikEmail",
                   (SELECT ime FROM "User" WHERE id = "izvajalecId") AS "izvajalecIme"`,
      [id, izvajalecId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Naloga ni na voljo" }, { status: 409 });
    }

    const naloga = rows[0];

    await pool.query(
      `INSERT INTO "Obvestilo" (id, besedilo, "userId", "nalogaId")
       VALUES ($1, $2, $3, $4)`,
      [
        crypto.randomUUID(),
        `Izvajalec je označil nalogo "${naloga.naslov}" kot opravljeno. Prosimo potrdite in ocenite.`,
        naloga.narocnikId,
        naloga.id,
      ]
    );

    if (naloga.narocnikEmail) {
      sendTaskCompletedEmail({
        to: naloga.narocnikEmail,
        naslov: naloga.naslov,
        izvajalecIme: naloga.izvajalecIme ?? "Izvajalec",
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/naloge/[id]/opravljeno]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
