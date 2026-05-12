import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { ime, email, geslo } = await req.json();

    if (!ime || !email || !geslo) {
      return NextResponse.json({ error: "Vsa polja so obvezna" }, { status: 400 });
    }

    const obstojeci = await prisma.user.findUnique({ where: { email } });

    if (obstojeci) {
      return NextResponse.json({ error: "Email je že zaseden" }, { status: 400 });
    }

    const hashGeslo = await bcrypt.hash(geslo, 10);

    await prisma.user.create({
      data: {
        ime,
        email,
        geslo: hashGeslo,
        vloga: "oboje",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Registration error:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json({ error: "Napaka na strežniku" }, { status: 500 });
  }
}
