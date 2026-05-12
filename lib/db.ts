import { Pool } from "pg";

const g = globalThis as unknown as { _pgPool?: Pool };
if (!g._pgPool) {
  g._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    client_encoding: "utf8",
  });
}
export const pool = g._pgPool;
