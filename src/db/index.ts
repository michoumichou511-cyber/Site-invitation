import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as appSchema from "./schema";
import * as authSchema from "./auth-schema";

export const schema = { ...appSchema, ...authSchema };

/** Base D1 de la requête en cours. À n'appeler que côté serveur. */
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}

export type Db = Awaited<ReturnType<typeof getDb>>;

export async function getEnv() {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}
