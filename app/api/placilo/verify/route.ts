import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const SISTEM_BESEDILO = "✅ Plačilo potrjeno! Zmenita se za čas in kraj opravljanja naloge.";

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

    // Posodobi status — WHERE status = 'sprejeta' ščiti pred duplikacijo (webhook je morda že posodobil)
    const { rowCount } = await pool.query(
      `UPDATE "Naloga" SET status = 'plačano' WHERE id = $1 AND status = 'sprejeta'`,
      [nalogaId]
    );

    // Vstavi sistemsko sporočilo samo če še ne obstaja
    if (rowCount && rowCount > 0) {
      await pool.query(
        `INSERT INTO "Sporocilo" (id, besedilo, "avtorId", "nalogaId", "ustvarjenoOb")
         SELECT $1, $2, (SELECT "narocnikId" FROM "Naloga" WHERE id = $3), $3, NOW()
         WHERE NOT EXISTS (
           SELECT 1 FROM "Sporocilo" WHERE "nalogaId" = $3 AND besedilo LIKE '✅ Plačilo%'
         )`,
        [crypto.randomUUID(), SISTEM_BESEDILO, nalogaId]
      );
    }

    return NextResponse.json({ paid: true, nalogaId });
  } catch (err) {
    console.error("[GET /api/placilo/verify]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
