import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { sendTaskPublishedEmail } from "@/lib/email";

const initPromise = pool.query(`
  CREATE TABLE IF NOT EXISTS "Naloga" (
    id          TEXT PRIMARY KEY,
    naslov      TEXT NOT NULL,
    opis        TEXT NOT NULL,
    cena        DOUBLE PRECISION NOT NULL,
    kategorija  TEXT NOT NULL,
    lokacija    TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'odprta',
    nujna       BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "narocnikId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
  )
`).catch((err) => console.error("[Naloga] init error:", err));

export async function GET(req: NextRequest) {
  await initPromise;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;
    const pogled = req.nextUrl.searchParams.get("pogled") ?? "narocnik";
    const tab = req.nextUrl.searchParams.get("tab"); // "sprejete" | "opravljene" | null

    if (pogled === "narocnik") {
      if (tab === "sprejete") {
        const { rows } = await pool.query(
          `SELECT * FROM "Naloga" WHERE "narocnikId" = $1 AND status IN ('sprejeta', 'v teku', 'plačano') ORDER BY "createdAt" DESC`,
          [userId]
        );
        return NextResponse.json(rows);
      }
      if (tab === "opravljene") {
        const { rows } = await pool.query(
          `SELECT * FROM "Naloga" WHERE "narocnikId" = $1 AND status = 'zaprta' ORDER BY "createdAt" DESC`,
          [userId]
        );
        return NextResponse.json(rows);
      }
      // All narocnik tasks (backward compat)
      const { rows } = await pool.query(
        `SELECT * FROM "Naloga" WHERE "narocnikId" = $1 ORDER BY "createdAt" DESC`,
        [userId]
      );
      return NextResponse.json(rows);
    }

    if (pogled === "izvajalec") {
      if (tab === "sprejete") {
        const { rows } = await pool.query(
          `SELECT n.*, u.ime AS "narocnikIme"
           FROM "Naloga" n
           JOIN "User" u ON u.id = n."narocnikId"
           WHERE n."izvajalecId" = $1 AND n.status != 'opravljeno'
           ORDER BY n."createdAt" DESC`,
          [userId]
        );
        const naloge = rows.map(({ narocnikIme, ...n }) => ({ ...n, narocnik: { ime: narocnikIme } }));
        return NextResponse.json(naloge);
      }
      if (tab === "opravljene") {
        const { rows } = await pool.query(
          `SELECT n.*, u.ime AS "narocnikIme"
           FROM "Naloga" n
           JOIN "User" u ON u.id = n."narocnikId"
           WHERE n."izvajalecId" = $1 AND n.status = 'opravljeno'
           ORDER BY n."createdAt" DESC`,
          [userId]
        );
        const naloge = rows.map(({ narocnikIme, ...n }) => ({ ...n, narocnik: { ime: narocnikIme } }));
        return NextResponse.json(naloge);
      }
      // All open tasks not created by user (used by /naloge/vse and backward compat)
      const { rows } = await pool.query(
        `SELECT n.*, u.ime AS "narocnikIme"
         FROM "Naloga" n
         JOIN "User" u ON u.id = n."narocnikId"
         WHERE n.status = 'odprta' AND n."narocnikId" != $1
         ORDER BY n."createdAt" DESC`,
        [userId]
      );
      const naloge = rows.map(({ narocnikIme, ...n }) => ({ ...n, narocnik: { ime: narocnikIme } }));
      return NextResponse.json(naloge);
    }

    return NextResponse.json({ error: "Neznan pogled" }, { status: 400 });
  } catch (err) {
    console.error("[GET /api/naloge]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await initPromise;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

    const userId = (token.sub ?? token.id) as string;

    const body = await req.json();
    const { naslov, opis, kategorija, lokacija } = body;
    const cena = typeof body.cena === "string" ? parseFloat(body.cena) : Number(body.cena);
    const nujna = body.nujna === true;

    if (!naslov || !opis || !kategorija || !lokacija || isNaN(cena) || cena < 0) {
      return NextResponse.json({ error: "Vsa polja so obvezna" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    const { rows } = await pool.query(
      `INSERT INTO "Naloga" (id, naslov, opis, cena, kategorija, lokacija, nujna, "narocnikId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, naslov, opis, cena, kategorija, lokacija, nujna, userId]
    );

    // Send confirmation email (fire-and-forget)
    pool.query(`SELECT ime, email FROM "User" WHERE id = $1`, [userId])
      .then(({ rows: u }) => {
        if (u.length > 0) {
          sendTaskPublishedEmail({
            to: u[0].email,
            ime: u[0].ime,
            naslov,
            kategorija,
            cena,
            nalogaId: id,
          });
        }
      })
      .catch(() => {});

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("[POST /api/naloge]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
