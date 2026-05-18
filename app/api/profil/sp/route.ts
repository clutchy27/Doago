import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;

    const { rows } = await pool.query(
      `SELECT id, ime, priimek, "davcnaStevilka", iban, naslov, opis, kategorije, mesta FROM "SpPodatki" WHERE "userId" = $1`,
      [userId]
    );

    if (rows.length === 0) return NextResponse.json({ error: "Ni podatkov" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[GET /api/profil/sp]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;
    const { opis, kategorije, mesta } = await req.json();

    const kategorijeStr = Array.isArray(kategorije) ? kategorije.join(",") : "";
    const mestaStr = Array.isArray(mesta) ? mesta.join(",") : "";

    const { rows } = await pool.query(
      `UPDATE "SpPodatki"
       SET opis = $1, kategorije = $2, mesta = $3, "updatedAt" = NOW()
       WHERE "userId" = $4
       RETURNING opis, kategorije, mesta`,
      [opis?.trim() ?? "", kategorijeStr, mestaStr, userId]
    );

    if (rows.length === 0) return NextResponse.json({ error: "Ni podatkov" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[PATCH /api/profil/sp]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;
    const { ime, priimek, davcnaStevilka, iban, naslov } = await req.json();

    if (!ime?.trim() || !priimek?.trim() || !davcnaStevilka?.trim() || !iban?.trim() || !naslov?.trim()) {
      return NextResponse.json({ error: "Vsa polja so obvezna" }, { status: 400 });
    }
    if (!/^\d{8}$/.test(davcnaStevilka.trim())) {
      return NextResponse.json({ error: "Davčna številka mora biti točno 8 številk" }, { status: 400 });
    }
    if (!iban.trim().startsWith("SI56")) {
      return NextResponse.json({ error: "IBAN mora začeti s SI56" }, { status: 400 });
    }

    await pool.query(
      `UPDATE "SpPodatki"
       SET ime = $1, priimek = $2, "davcnaStevilka" = $3, iban = $4, naslov = $5, "updatedAt" = NOW()
       WHERE "userId" = $6`,
      [ime.trim(), priimek.trim(), davcnaStevilka.trim(), iban.trim(), naslov.trim(), userId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/profil/sp]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
