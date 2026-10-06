import { SCHEMA } from "./schema";

export type Db = { query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }> };

export const dbEnabled = () => !!process.env.DATABASE_URL;

const g = globalThis as unknown as { __grrandDb?: Promise<Db>; __grrandTestDb?: Db };

/** Tests inject an in-process Postgres here. */
export function setTestDb(db: Db | undefined) { g.__grrandTestDb = db; g.__grrandDb = undefined; }

async function connect(): Promise<Db> {
  if (g.__grrandTestDb) return g.__grrandTestDb;
  const { Pool } = await import("pg");
  const url = new URL(process.env.DATABASE_URL as string);
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  url.searchParams.delete("sslmode"); // we set ssl ourselves; managed poolers use their own CA
  const pool = new Pool({
    connectionString: url.toString(),
    ssl: local ? undefined : { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });
  pool.on("error", () => { /* idle client dropped; the next query reconnects */ });
  const db: Db = { query: (sql, params) => pool.query(sql, params as unknown[]) as never };
  for (let attempt = 0; ; attempt++) {
    try { await db.query(SCHEMA); break; } catch (e) { if (attempt >= 1) throw e; }
  }
  return db;
}

/** Resolves to a ready database, or null when no DATABASE_URL is configured. */
export async function getDb(): Promise<Db | null> {
  if (!dbEnabled() && !g.__grrandTestDb) return null;
  if (!g.__grrandDb) {
    g.__grrandDb = connect().catch((e) => { g.__grrandDb = undefined; throw e; });
  }
  return g.__grrandDb;
}
