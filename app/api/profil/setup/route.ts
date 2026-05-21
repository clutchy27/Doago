import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

  const vloga = token.vloga as string;
  if (vloga !== "izvajalec" && vloga !== "student") {
    return NextResponse.json({ error: "Ni dostopa" }, { status: 403 });
  }

  const userId = (token.sub ?? (token as any).id) as string;

  try {
    const { opis, kategorije, mesta } = await req.json();

    if (vloga === "izvajalec") {
      const kategorijeStr = Array.isArray(kategorije) ? kategorije.join(",") : "";
      const mestaStr = Array.isArray(mesta) ? mesta.join(",") : "";
      await pool.query(
        `UPDATE "SpPodatki"
         SET opis = $1, kategorije = $2, mesta = $3, "profilUrejen" = true, "updatedAt" = NOW()
         WHERE "userId" = $4`,
        [opis?.trim() ?? "", kategorijeStr, mestaStr, userId]
      );
    } else {
      const kategorijeArr = Array.isArray(kategorije) ? kategorije : [];
      const mestaArr = Array.isArray(mesta) ? mesta : [];
      await pool.query(
        `INSERT INTO "StudentPodatki" (id, "userId", opis, kategorije, mesta, "profilUrejen")
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT ("userId") DO UPDATE
           SET opis = $3, kategorije = $4, mesta = $5, "profilUrejen" = true`,
        [crypto.randomUUID(), userId, opis?.trim() ?? "", kategorijeArr, mestaArr]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/profil/setup]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
