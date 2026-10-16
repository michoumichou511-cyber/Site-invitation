/**
 * Déploiement Cloudflare tout-en-un (utilisé par Cloudflare Workers Builds, ou à la main) :
 *   1. crée la base D1 « louloua-db » et les stockages R2 s'ils n'existent pas ;
 *   2. écrit l'identifiant de la base dans wrangler.jsonc (copie de travail) ;
 *   3. applique les migrations et les 6 modèles du catalogue (idempotent) ;
 *   4. publie le Worker (site + tâche de nuit) ;
 *   5. crée BETTER_AUTH_SECRET s'il manque (connexion admin et clients).
 * Prérequis : `pnpm cf:build` (opennextjs-cloudflare build) déjà lancé.
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const DB = "louloua-db";
const BUCKETS = ["louloua-files", "louloua-opennext-cache"];
const env = { ...process.env, CI: "1", WRANGLER_SEND_METRICS: "false" };

const wrangler = (args, opts = {}) =>
  execFileSync("npx", ["wrangler", ...args], {
    env,
    encoding: "utf8",
    stdio: opts.inherit ? "inherit" : "pipe",
    input: opts.input,
  });

const step = (label) => console.log(`\n▶ ${label}`);

// 1. Base D1
step(`Base D1 « ${DB} »`);
const findDb = () => JSON.parse(wrangler(["d1", "list", "--json"])).find((d) => d.name === DB);
let db = findDb();
if (!db) {
  wrangler(["d1", "create", DB], { inherit: true });
  db = findDb();
}
if (!db?.uuid) throw new Error(`Impossible de trouver ou créer la base ${DB}`);
console.log(`  id : ${db.uuid}`);

// 2. Identifiant dans wrangler.jsonc
const config = readFileSync("wrangler.jsonc", "utf8");
const patched = config.replace(/("database_id":\s*")[^"]*(")/, `$1${db.uuid}$2`);
if (patched !== config) writeFileSync("wrangler.jsonc", patched);

// Stockages R2
step("Stockages R2");
for (const bucket of BUCKETS) {
  try {
    wrangler(["r2", "bucket", "create", bucket]);
    console.log(`  créé : ${bucket}`);
  } catch (e) {
    const out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    if (!/already exists|10004/i.test(out)) throw e;
    console.log(`  existe : ${bucket}`);
  }
}

// 3. Tables et catalogue
step("Migrations D1");
wrangler(["d1", "migrations", "apply", DB, "--remote"], { inherit: true });
step("Modèles du catalogue et démos");
execFileSync("node", ["scripts/seed-demo.ts"], { env, stdio: "inherit" });
wrangler(["d1", "execute", DB, "--remote", "--file", ".wrangler/seed-demo.sql"], { inherit: true });

// 4. Publication
step("Publication du Worker");
execFileSync("npx", ["opennextjs-cloudflare", "deploy"], { env, stdio: "inherit" });

// 5. Secret de connexion
step("Secret de connexion");
const secrets = JSON.parse(wrangler(["secret", "list", "--format", "json"]) || "[]");
if (secrets.some((s) => s.name === "BETTER_AUTH_SECRET")) {
  console.log("  BETTER_AUTH_SECRET déjà défini");
} else {
  wrangler(["secret", "put", "BETTER_AUTH_SECRET"], { input: randomBytes(32).toString("base64") });
  console.log("  BETTER_AUTH_SECRET créé (aléatoire)");
}
console.log("\n✓ Déploiement terminé");
