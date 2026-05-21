import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;

    const { rows } = await pool.query(
      `SELECT opis, kategorije, mesta FROM "StudentPodatki" WHERE "userId" = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ opis: null, kategorije: [], mesta: [] });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[GET /api/profil/student]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;
    const { opis, kategorije, mesta } = await req.json();

    const kategorijeArr = Array.isArray(kategorije) ? kategorije : [];
    const mestaArr = Array.isArray(mesta) ? mesta : [];

    const { rows } = await pool.query(
      `INSERT INTO "StudentPodatki" (id, "userId", opis, kategorije, mesta)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ("userId") DO UPDATE
         SET opis = $3, kategorije = $4, mesta = $5
       RETURNING opis, kategorije, mesta`,
      [crypto.randomUUID(), userId, opis?.trim() ?? "", kategorijeArr, mestaArr]
    );

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[PATCH /api/profil/student]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
