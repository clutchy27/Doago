import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;

    const { rows } = await pool.query(
      `SELECT * FROM "Obvestilo" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 20`,
      [userId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/obvestila]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;

    await pool.query(
      `UPDATE "Obvestilo" SET prebrano = TRUE WHERE "userId" = $1 AND prebrano = FALSE`,
      [userId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/obvestila]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
