import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

const initPromise = pool.query(`
  CREATE TABLE IF NOT EXISTS "Rating" (
    id             TEXT PRIMARY KEY,
    zvezde         INTEGER NOT NULL,
    komentar       TEXT,
    "nalogaId"     TEXT NOT NULL UNIQUE REFERENCES "Naloga"(id) ON DELETE CASCADE,
    "narocnikId"   TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "izvajalecId"  TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`).catch((err) => console.error("[Rating profil] init error:", err));

export async function GET(req: NextRequest) {
  await initPromise;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;

    const { rows: userRows } = await pool.query(
      `SELECT id, ime, email FROM "User" WHERE id = $1`,
      [userId]
    );
    if (userRows.length === 0) return NextResponse.json({ error: "Uporabnik ni najden" }, { status: 404 });

    const user = userRows[0];

    const [narocnikRes, izvajalecRes, oceneRes] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'zaprta') AS stevilo_opravljenih,
          COUNT(*) AS stevilo_objavljenih,
          COALESCE(SUM(cena) FILTER (WHERE status = 'zaprta'), 0) AS skupaj_porabljeno
         FROM "Naloga" WHERE "narocnikId" = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) AS stevilo, COALESCE(SUM(cena), 0) AS zasluzek
         FROM "Naloga" WHERE "izvajalecId" = $1 AND status = 'zaprta'`,
        [userId]
      ),
      pool.query(
        `SELECT AVG(zvezde) AS povprecje, COUNT(*) AS stevilo_ocen
         FROM "Rating" WHERE "izvajalecId" = $1`,
        [userId]
      ),
    ]);

    return NextResponse.json({
      ime: user.ime,
      email: user.email,
      narocnik: {
        steviloObjavljenih: parseInt(narocnikRes.rows[0].stevilo_objavljenih) || 0,
        steviloOpravljenih: parseInt(narocnikRes.rows[0].stevilo_opravljenih) || 0,
        skupajPorabljeno: parseFloat(narocnikRes.rows[0].skupaj_porabljeno) || 0,
      },
      izvajalec: {
        steviloOpravljenih: parseInt(izvajalecRes.rows[0].stevilo) || 0,
        skupniZasluzek: parseFloat(izvajalecRes.rows[0].zasluzek) || 0,
        povprecnaOcena: oceneRes.rows[0].povprecje ? parseFloat(oceneRes.rows[0].povprecje) : null,
        steviloOcen: parseInt(oceneRes.rows[0].stevilo_ocen) || 0,
      },
    });
  } catch (err) {
    console.error("[GET /api/profil]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;
    const { ime } = await req.json();

    if (!ime || !ime.trim()) {
      return NextResponse.json({ error: "Ime ne sme biti prazno" }, { status: 400 });
    }

    await pool.query(`UPDATE "User" SET ime = $1 WHERE id = $2`, [ime.trim(), userId]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/profil]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
