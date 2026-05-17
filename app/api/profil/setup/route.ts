import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

  const vloga = token.vloga as string;
  if (vloga !== "izvajalec") return NextResponse.json({ error: "Ni dostopa" }, { status: 403 });

  const userId = (token.sub ?? (token as any).id) as string;

  try {
    const { opis, kategorije, mesta } = await req.json();

    const kategorijeStr = Array.isArray(kategorije) ? kategorije.join(",") : "";
    const mestaStr = Array.isArray(mesta) ? mesta.join(",") : "";

    await pool.query(
      `UPDATE "SpPodatki"
       SET opis = $1, kategorije = $2, mesta = $3, "profilUrejen" = true, "updatedAt" = NOW()
       WHERE "userId" = $4`,
      [opis?.trim() ?? "", kategorijeStr, mestaStr, userId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/profil/setup]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
