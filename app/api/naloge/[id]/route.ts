import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { sendTaskAcceptedEmail } from "@/lib/email";

const initPromise = Promise.all([
  pool.query(`ALTER TABLE "Naloga" ADD COLUMN IF NOT EXISTS "izvajalecId" TEXT REFERENCES "User"(id)`),
  pool.query(`
    CREATE TABLE IF NOT EXISTS "Obvestilo" (
      id          TEXT PRIMARY KEY,
      besedilo    TEXT NOT NULL,
      "userId"    TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "nalogaId"  TEXT REFERENCES "Naloga"(id) ON DELETE SET NULL,
      prebrano    BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `),
]).catch((err) => console.error("[init] error:", err));

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initPromise;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const { id } = await params;

    const { rows } = await pool.query(
      `SELECT n.*,
              u_n.ime AS "narocnikIme",
              u_i.ime AS "izvajalecIme"
       FROM "Naloga" n
       JOIN "User" u_n ON u_n.id = n."narocnikId"
       LEFT JOIN "User" u_i ON u_i.id = n."izvajalecId"
       WHERE n.id = $1`,
      [id]
    );

    if (rows.length === 0) return NextResponse.json({ error: "Naloga ne obstaja" }, { status: 404 });

    const { narocnikIme, izvajalecIme, ...rest } = rows[0];
    return NextResponse.json({
      ...rest,
      narocnik: { ime: narocnikIme },
      izvajalec: izvajalecIme ? { ime: izvajalecIme } : null,
    });
  } catch (err) {
    console.error("[GET /api/naloge/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initPromise;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const { id } = await params;
    const izvajalecId = (token.sub ?? token.id) as string;

    const { rows } = await pool.query(
      `UPDATE "Naloga"
       SET status = 'sprejeta', "izvajalecId" = $1
       WHERE id = $2 AND status = 'odprta' AND "narocnikId" != $1
       RETURNING *`,
      [izvajalecId, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Naloga ni na voljo" }, { status: 409 });
    }

    const naloga = rows[0];

    // Obvestilo za naročnika
    await pool.query(
      `INSERT INTO "Obvestilo" (id, besedilo, "userId", "nalogaId")
       VALUES ($1, $2, $3, $4)`,
      [
        crypto.randomUUID(),
        `Vaša naloga "${naloga.naslov}" je bila sprejeta.`,
        naloga.narocnikId,
        naloga.id,
      ]
    );

    // Send email to naročnik (fire-and-forget)
    pool.query(
      `SELECT u_narocnik.ime AS narocnik_ime, u_narocnik.email AS narocnik_email,
              u_izvajalec.ime AS izvajalec_ime
       FROM "User" u_narocnik
       JOIN "User" u_izvajalec ON u_izvajalec.id = $1
       WHERE u_narocnik.id = $2`,
      [izvajalecId, naloga.narocnikId]
    ).then(({ rows: u }) => {
      if (u.length > 0) {
        sendTaskAcceptedEmail({
          to: u[0].narocnik_email,
          ime: u[0].narocnik_ime,
          naslov: naloga.naslov,
          kategorija: naloga.kategorija,
          cena: naloga.cena,
          izvajalecIme: u[0].izvajalec_ime,
        });
      }
    }).catch(() => {});

    return NextResponse.json(naloga);
  } catch (err) {
    console.error("[PATCH /api/naloge/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
