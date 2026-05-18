import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { sendReklamacijaEmail, sendReklamacijaPotrdilEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const { id } = await params;
    const narocnikId = (token.sub ?? token.id) as string;
    const { razlog } = await req.json();

    if (!razlog || typeof razlog !== "string" || razlog.trim().length < 20) {
      return NextResponse.json({ error: "Razlog mora vsebovati vsaj 20 znakov" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT n.*,
              u_i.email AS "izvajalecEmail",
              u_n.email AS "narocnikEmail"
       FROM "Naloga" n
       JOIN "User" u_i ON u_i.id = n."izvajalecId"
       JOIN "User" u_n ON u_n.id = n."narocnikId"
       WHERE n.id = $1 AND n."narocnikId" = $2 AND n.status = 'caka_zakljucek'`,
      [id, narocnikId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Naloga ni na voljo za reklamacijo" }, { status: 404 });
    }

    const naloga = rows[0];

    await pool.query(
      `UPDATE "Naloga" SET status = 'reklamacija', "reklamacijaRazlog" = $1 WHERE id = $2`,
      [razlog.trim(), id]
    );

    if (naloga.izvajalecEmail) {
      sendReklamacijaEmail({
        to: naloga.izvajalecEmail,
        naslov: naloga.naslov,
        razlog: razlog.trim(),
      }).catch(() => {});
    }

    if (naloga.narocnikEmail) {
      sendReklamacijaPotrdilEmail({
        to: naloga.narocnikEmail,
        naslov: naloga.naslov,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/naloge/[id]/reklamacija]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
