import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

const initPromise = pool.query(`
  CREATE TABLE IF NOT EXISTS "Sporocilo" (
    id          TEXT PRIMARY KEY,
    besedilo    TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "avtorId"   TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "nalogaId"  TEXT NOT NULL REFERENCES "Naloga"(id) ON DELETE CASCADE
  )
`).catch((err) => console.error("[Sporocilo] init error:", err));

async function getParticipants(nalogaId: string) {
  const { rows } = await pool.query(
    `SELECT "narocnikId", "izvajalecId" FROM "Naloga" WHERE id = $1`,
    [nalogaId]
  );
  return rows[0] as { narocnikId: string; izvajalecId: string | null } | undefined;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initPromise;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const { id } = await params;
    const userId = (token.sub ?? token.id) as string;

    const naloga = await getParticipants(id);
    if (!naloga) return NextResponse.json({ error: "Naloga ne obstaja" }, { status: 404 });
    if (userId !== naloga.narocnikId && userId !== naloga.izvajalecId) {
      return NextResponse.json({ error: "Ni dostopa" }, { status: 403 });
    }

    const { rows } = await pool.query(
      `SELECT s.id, s.besedilo, s."createdAt", s."avtorId", u.ime AS "avtorIme"
       FROM "Sporocilo" s
       JOIN "User" u ON u.id = s."avtorId"
       WHERE s."nalogaId" = $1
       ORDER BY s."createdAt" ASC`,
      [id]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/naloge/[id]/sporocila]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initPromise;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const { id } = await params;
    const userId = (token.sub ?? token.id) as string;

    const naloga = await getParticipants(id);
    if (!naloga) return NextResponse.json({ error: "Naloga ne obstaja" }, { status: 404 });
    if (userId !== naloga.narocnikId && userId !== naloga.izvajalecId) {
      return NextResponse.json({ error: "Ni dostopa" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.besedilo?.trim()) {
      return NextResponse.json({ error: "Sporočilo je prazno" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO "Sporocilo" (id, besedilo, "avtorId", "nalogaId")
       VALUES ($1, $2, $3, $4)
       RETURNING id, besedilo, "createdAt", "avtorId"`,
      [crypto.randomUUID(), body.besedilo.trim(), userId, id]
    );

    const { rows: userRows } = await pool.query(
      `SELECT ime FROM "User" WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({ ...rows[0], avtorIme: userRows[0]?.ime }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/naloge/[id]/sporocila]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
