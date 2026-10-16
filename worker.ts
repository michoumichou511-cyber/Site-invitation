/* eslint-disable @typescript-eslint/ban-ts-comment -- point d'entrée hors programme TypeScript (voir tsconfig) */
// @ts-nocheck -- importe .open-next/worker.js, généré par le build ; la logique est dans src/lib/purge.ts (typée et testée).
/**
 * Point d'entrée Cloudflare : le Worker OpenNext (site) + la tâche planifiée de nuit.
 * Voir https://opennext.js.org/cloudflare/howtos/custom-worker
 */
import { drizzle } from "drizzle-orm/d1";
import { default as handler } from "./.open-next/worker.js";
import * as schema from "./src/db/schema";
import { purgeExpiredInvitations } from "./src/lib/purge";

export default {
  fetch: handler.fetch,

  /** Chaque nuit (cron de wrangler.jsonc) : purge des données invités expirées. */
  async scheduled(_controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        const db = drizzle(env.DB, { schema });
        const { invitations, r2Keys } = await purgeExpiredInvitations(db);
        for (const key of r2Keys) await env.FILES.delete(key);
        console.log(`Purge : ${invitations} invitation(s), ${r2Keys.length} fichier(s)`);
      })(),
    );
  },
} satisfies ExportedHandler<CloudflareEnv>;

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
