import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { sendTaskAcceptedEmail, sendTaskConfirmedEmail, sendTaskRejectedEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const { id } = await params;
    const narocnikId = (token.sub ?? token.id) as string;
    const { action } = await req.json();

    if (action !== "potrdi" && action !== "zavrni") {
      return NextResponse.json({ error: "Neveljavna akcija" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT n.*,
              u_i.ime AS "izvajalecIme",
              u_i.email AS "izvajalecEmail",
              u_n.ime AS "narocnikIme",
              u_n.email AS "narocnikEmail"
       FROM "Naloga" n
       JOIN "User" u_n ON u_n.id = n."narocnikId"
       LEFT JOIN "User" u_i ON u_i.id = n."izvajalecId"
       WHERE n.id = $1 AND n."narocnikId" = $2 AND n.status = 'caka_potrditev'`,
      [id, narocnikId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Naloga ni na voljo" }, { status: 404 });
    }

    const naloga = rows[0];

    if (action === "potrdi") {
      await pool.query(
        `UPDATE "Naloga" SET status = 'sprejeta' WHERE id = $1`,
        [id]
      );

      if (naloga.izvajalecId) {
        await pool.query(
          `INSERT INTO "Obvestilo" (id, besedilo, "userId", "nalogaId")
           VALUES ($1, $2, $3, $4)`,
          [
            crypto.randomUUID(),
            `Naročnik je potrdil vašo prijavo na nalogo: "${naloga.naslov}"`,
            naloga.izvajalecId,
            naloga.id,
          ]
        );
      }

      // Sistemsko sporočilo — obvesti izvajalca (samo enkrat)
      await pool.query(
        `INSERT INTO "Sporocilo" (id, besedilo, "avtorId", "nalogaId")
         SELECT $1, $2, $3, $4
         WHERE NOT EXISTS (
           SELECT 1 FROM "Sporocilo"
           WHERE "nalogaId" = $4 AND besedilo LIKE '🤝 Naročnik%'
         )`,
        [
          crypto.randomUUID(),
          "🤝 Naročnik je potrdil vašo prijavo! Zmenita se za podrobnosti.",
          narocnikId,
          id,
        ]
      );

      if (naloga.narocnikEmail && naloga.izvajalecIme) {
        sendTaskAcceptedEmail({
          to: naloga.narocnikEmail,
          ime: naloga.narocnikIme,
          naslov: naloga.naslov,
          kategorija: naloga.kategorija,
          cena: naloga.cena,
          izvajalecIme: naloga.izvajalecIme,
        }).catch(() => {});
      }

      if (naloga.izvajalecEmail && naloga.narocnikIme) {
        sendTaskConfirmedEmail({
          to: naloga.izvajalecEmail,
          naslov: naloga.naslov,
          narocnikIme: naloga.narocnikIme,
        }).catch(() => {});
      }
    } else {
      await pool.query(
        `UPDATE "Naloga" SET status = 'odprta', "izvajalecId" = NULL WHERE id = $1`,
        [id]
      );

      if (naloga.izvajalecId) {
        await pool.query(
          `INSERT INTO "Obvestilo" (id, besedilo, "userId", "nalogaId")
           VALUES ($1, $2, $3, $4)`,
          [
            crypto.randomUUID(),
            `Naročnik ni potrdil vaše prijave na nalogo: "${naloga.naslov}"`,
            naloga.izvajalecId,
            naloga.id,
          ]
        );
      }

      if (naloga.izvajalecEmail) {
        sendTaskRejectedEmail({ to: naloga.izvajalecEmail, naslov: naloga.naslov }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/naloge/[id]/potrdi]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
