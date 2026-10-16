/**
 * `pnpm build` :
 * - sur Cloudflare Workers Builds (WORKERS_CI=1) : prépare D1/R2/tables/secret puis construit
 *   le Worker OpenNext ; la commande de déploiement par défaut (`npx wrangler deploy`) publie ensuite ;
 * - ailleurs (ordinateur, CI GitHub) : simple `next build`.
 */
import { execFileSync } from "node:child_process";

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", env: process.env });

if (process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1") {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    console.warn(
      "⚠ Pas de CLOUDFLARE_API_TOKEN pendant le build : mettez « pnpm run cf:deploy » comme commande de déploiement.",
    );
  } else {
    const { prepare } = await import("./cf-prepare.mjs");
    prepare();
  }
  run("npx", ["opennextjs-cloudflare", "build"]);
} else {
  run("npx", ["next", "build"]);
}
