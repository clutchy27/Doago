import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { ime, email, geslo, vloga, sp, student } = await req.json();

    if (!ime || !email || !geslo) {
      return NextResponse.json({ error: "Vsa polja so obvezna" }, { status: 400 });
    }

    const vlogaValue = vloga === "izvajalec" ? "izvajalec" : vloga === "student" ? "student" : "narocnik";

    if (vlogaValue === "izvajalec") {
      if (!sp || !sp.ime || !sp.priimek || !sp.davcnaStevilka || !sp.iban || !sp.naslov) {
        return NextResponse.json({ error: "Vsa polja s.p. so obvezna" }, { status: 400 });
      }
      if (!/^\d{8}$/.test(sp.davcnaStevilka)) {
        return NextResponse.json({ error: "Davčna številka mora biti točno 8 številk" }, { status: 400 });
      }
      if (!sp.iban.startsWith("SI56")) {
        return NextResponse.json({ error: "IBAN mora začeti s SI56" }, { status: 400 });
      }
    }

    if (vlogaValue === "student") {
      if (!student || !student.ime || !student.priimek || !student.indeks || !student.fakulteta || !student.iban) {
        return NextResponse.json({ error: "Vsa polja študenta so obvezna" }, { status: 400 });
      }
      if (!student.iban.startsWith("SI56")) {
        return NextResponse.json({ error: "IBAN mora začeti s SI56" }, { status: 400 });
      }
    }

    const obstojeci = await prisma.user.findUnique({ where: { email } });
    if (obstojeci) {
      return NextResponse.json({ error: "Email je že zaseden" }, { status: 400 });
    }

    const hashGeslo = await bcrypt.hash(geslo, 10);

    const user = await prisma.user.create({
      data: { ime, email, geslo: hashGeslo, vloga: vlogaValue },
    });

    if (vlogaValue === "izvajalec" && sp) {
      await prisma.spPodatki.create({
        data: {
          ime: sp.ime.trim(),
          priimek: sp.priimek.trim(),
          davcnaStevilka: sp.davcnaStevilka.trim(),
          iban: sp.iban.trim(),
          naslov: sp.naslov.trim(),
          userId: user.id,
        },
      });
    }

    if (vlogaValue === "student" && student) {
      await pool.query(
        `INSERT INTO "StudentPodatki" (id, ime, priimek, indeks, fakulteta, iban, "createdAt", "updatedAt", "userId")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW(), $6)`,
        [student.ime.trim(), student.priimek.trim(), student.indeks.trim(), student.fakulteta, student.iban.trim(), user.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Registration error:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json({ error: "Napaka na strežniku" }, { status: 500 });
  }
}
