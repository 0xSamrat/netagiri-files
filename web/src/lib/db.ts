import "server-only";
import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("SUPABASE_DB_URL is not set");
  }
  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    ssl: { rejectUnauthorized: false },
  });
}

export const db: Pool = global.__pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global.__pgPool = db;
}
