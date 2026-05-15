import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;

    const { rows } = await pool.query(
      `SELECT id, ime, priimek, indeks, fakulteta, iban FROM "StudentPodatki" WHERE "userId" = $1`,
      [userId]
    );

    if (rows.length === 0) return NextResponse.json({ error: "Ni podatkov" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[GET /api/profil/student]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;
    const { ime, priimek, indeks, fakulteta, iban } = await req.json();

    if (!ime?.trim() || !priimek?.trim() || !indeks?.trim() || !fakulteta?.trim() || !iban?.trim()) {
      return NextResponse.json({ error: "Vsa polja so obvezna" }, { status: 400 });
    }
    if (!iban.trim().startsWith("SI56")) {
      return NextResponse.json({ error: "IBAN mora začeti s SI56" }, { status: 400 });
    }

    await pool.query(
      `UPDATE "StudentPodatki"
       SET ime = $1, priimek = $2, indeks = $3, fakulteta = $4, iban = $5, "updatedAt" = NOW()
       WHERE "userId" = $6`,
      [ime.trim(), priimek.trim(), indeks.trim(), fakulteta, iban.trim(), userId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/profil/student]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
