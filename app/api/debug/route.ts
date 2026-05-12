import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );

    const cols: Record<string, string[]> = {};
    for (const row of tables.rows) {
      const c = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public'`,
        [row.table_name]
      );
      cols[row.table_name] = c.rows.map((r: { column_name: string }) => r.column_name);
    }

    return NextResponse.json({ tables: tables.rows.map((r: { table_name: string }) => r.table_name), columns: cols });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
