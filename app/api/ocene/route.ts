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
`).catch((err) => console.error("[Rating] init error:", err));

export async function POST(req: NextRequest) {
  await initPromise;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const narocnikId = (token.sub ?? token.id) as string;
    const body = await req.json();
    const { nalogaId, zvezde, komentar } = body;

    if (!nalogaId || !zvezde || zvezde < 1 || zvezde > 5) {
      return NextResponse.json({ error: "Neveljavni podatki" }, { status: 400 });
    }

    const { rows: nalogaRows } = await pool.query(
      `SELECT id, "izvajalecId" FROM "Naloga"
       WHERE id = $1 AND "narocnikId" = $2 AND status IN ('sprejeta', 'plačano')`,
      [nalogaId, narocnikId]
    );

    if (nalogaRows.length === 0) {
      return NextResponse.json({ error: "Naloga ni na voljo za ocenjevanje" }, { status: 404 });
    }

    const izvajalecId = nalogaRows[0].izvajalecId;

    await pool.query(`UPDATE "Naloga" SET status = 'zaprta' WHERE id = $1`, [nalogaId]);

    const { rows } = await pool.query(
      `INSERT INTO "Rating" (id, zvezde, komentar, "nalogaId", "narocnikId", "izvajalecId")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [crypto.randomUUID(), zvezde, komentar || null, nalogaId, narocnikId, izvajalecId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("[POST /api/ocene]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
