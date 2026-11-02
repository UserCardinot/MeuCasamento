import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __db?: Db };

function criarDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada.");
  const client = postgres(url, { max: 10, idle_timeout: 30 });
  return drizzle(client, { schema });
}

/** Conexão preguiçosa: o build do Next não precisa do banco. */
export function getDb(): Db {
  if (!globalForDb.__db) globalForDb.__db = criarDb();
  return globalForDb.__db;
}

export { schema };
