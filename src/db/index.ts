import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { connection } from "next/server";
import * as appSchema from "./schema";
import * as authSchema from "./auth-schema";

export const schema = { ...appSchema, ...authSchema };

/** Base D1 de la requête en cours. À n'appeler que côté serveur. */
export async function getDb() {
  return drizzle((await getEnv()).DB, { schema });
}

export type Db = Awaited<ReturnType<typeof getDb>>;

/**
 * Bindings Cloudflare de la requête en cours. `connection()` rend la page dynamique :
 * sans lui, `next build` pré-rendrait la page et lancerait un faux Cloudflare local
 * (échec « database is locked » sur Workers Builds).
 */
export async function getEnv() {
  await connection();
  const { env } = await getCloudflareContext({ async: true });
  return env;
}
