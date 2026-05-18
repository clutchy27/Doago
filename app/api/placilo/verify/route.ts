import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Manjka session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ paid: false });
    }

    const nalogaId = session.metadata?.nalogaId;
    if (!nalogaId) {
      return NextResponse.json({ paid: true, nalogaId: null });
    }

    const { rows } = await pool.query(
      `SELECT id FROM "Naloga" WHERE id = $1`,
      [nalogaId]
    );

    return NextResponse.json({ paid: true, nalogaId: rows[0]?.id ?? nalogaId });
  } catch (err) {
    console.error("[GET /api/placilo/verify]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
