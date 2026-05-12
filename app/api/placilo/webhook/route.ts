import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("[webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Napačen podpis" }, { status: 400 });
    }
  } else {
    // Brez webhook secret (dev okolje brez Stripe CLI)
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Neveljaven JSON" }, { status: 400 });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const nalogaId = session.metadata?.nalogaId;
      if (nalogaId) {
        await pool.query(
          `UPDATE "Naloga" SET status = 'plačano' WHERE id = $1 AND status IN ('sprejeta', 'plačano')`,
          [nalogaId]
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
