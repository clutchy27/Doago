import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;

    const { rows } = await pool.query(
      `SELECT n.id, n.naslov, n.status, n."narocnikId", n."izvajalecId",
              u_n.ime AS "narocnikIme",
              u_i.ime AS "izvajalecIme",
              COUNT(s.id)::int AS "messageCount",
              (SELECT s2.besedilo FROM "Sporocilo" s2
               WHERE s2."nalogaId" = n.id
               ORDER BY s2."createdAt" DESC LIMIT 1) AS "latestMessage",
              (SELECT s2."avtorId" FROM "Sporocilo" s2
               WHERE s2."nalogaId" = n.id
               ORDER BY s2."createdAt" DESC LIMIT 1) AS "latestMessageAvtorId",
              (SELECT u2.ime FROM "Sporocilo" s2
               LEFT JOIN "User" u2 ON u2.id = s2."avtorId"
               WHERE s2."nalogaId" = n.id
               ORDER BY s2."createdAt" DESC LIMIT 1) AS "latestMessageAvtorIme"
       FROM "Naloga" n
       JOIN "User" u_n ON u_n.id = n."narocnikId"
       LEFT JOIN "User" u_i ON u_i.id = n."izvajalecId"
       LEFT JOIN "Sporocilo" s ON s."nalogaId" = n.id
       WHERE n.status != 'odprta'
         AND (n."narocnikId" = $1 OR n."izvajalecId" = $1)
       GROUP BY n.id, u_n.ime, u_i.ime
       ORDER BY n."createdAt" DESC`,
      [userId]
    );

    const tasks = rows.map(({ narocnikIme, izvajalecIme, ...rest }) => ({
      ...rest,
      narocnik: { ime: narocnikIme },
      izvajalec: izvajalecIme ? { ime: izvajalecIme } : null,
    }));

    return NextResponse.json(tasks);
  } catch (err) {
    console.error("[GET /api/chat/naloge]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
