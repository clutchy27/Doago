import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ needsSetup: false });

  const vloga = token.vloga as string;
  if (vloga !== "izvajalec") return NextResponse.json({ needsSetup: false });

  const userId = (token.sub ?? (token as any).id) as string;

  try {
    const { rows } = await pool.query(
      `SELECT "profilUrejen" FROM "SpPodatki" WHERE "userId" = $1`,
      [userId]
    );
    if (rows.length === 0) return NextResponse.json({ needsSetup: false });
    return NextResponse.json({ needsSetup: !rows[0].profilUrejen });
  } catch (err) {
    console.error("[GET /api/profil/setup-check]", err);
    return NextResponse.json({ needsSetup: false });
  }
}
