import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;
    const { nalogaId } = await req.json();

    if (!nalogaId) {
      return NextResponse.json({ error: "Manjka nalogaId" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT * FROM "Naloga" WHERE id = $1 AND "narocnikId" = $2 AND status = 'sprejeta'`,
      [nalogaId, userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Naloga ni na voljo za plačilo" }, { status: 404 });
    }

    const naloga = rows[0];
    const provizija = naloga.cena * 0.15;
    const skupaj = naloga.cena + provizija;
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: naloga.naslov,
              description: `Kategorija: ${naloga.kategorija}`,
            },
            unit_amount: Math.round(naloga.cena * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Doago provizija (15%)",
              description: "Storitev platforme Doago",
            },
            unit_amount: Math.round(provizija * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/placilo/uspeh?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/placilo/preklicano?naloga_id=${nalogaId}`,
      metadata: {
        nalogaId: naloga.id,
        narocnikId: userId,
        skupaj: skupaj.toFixed(2),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[POST /api/placilo/checkout]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
