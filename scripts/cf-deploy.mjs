/**
 * Déploiement à la main : préparation (D1, R2, tables, modèles, secret) + build + publication.
 *   pnpm cf:deploy   (après `npx wrangler login`)
 */
import { execFileSync } from "node:child_process";
import { prepare } from "./cf-prepare.mjs";

prepare();
const env = { ...process.env, CI: "1" };
console.log("\n▶ Build Cloudflare");
execFileSync("npx", ["opennextjs-cloudflare", "build"], { env, stdio: "inherit" });
console.log("\n▶ Publication du Worker");
execFileSync("npx", ["opennextjs-cloudflare", "deploy"], { env, stdio: "inherit" });
console.log("\n✓ Déploiement terminé");
