/**
 * Préparation Cloudflare (idempotente) avant la publication :
 *   1. crée la base D1 « louloua-db » et les stockages R2 s'ils n'existent pas ;
 *   2. écrit l'identifiant de la base dans wrangler.jsonc (copie de travail) ;
 *   3. applique les migrations et les 6 modèles du catalogue ;
 *   4. crée BETTER_AUTH_SECRET s'il manque (connexion admin et clients).
 * Lancé automatiquement par `pnpm build` dans Cloudflare Workers Builds, et par `pnpm cf:deploy`.
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const DB = "louloua-db";
const WORKER = "louloua";
const BUCKETS = ["louloua-files", "louloua-opennext-cache"];
const env = { ...process.env, CI: "1", WRANGLER_SEND_METRICS: "false" };

const wrangler = (args, opts = {}) =>
  execFileSync("npx", ["wrangler", ...args], {
    env,
    encoding: "utf8",
    stdio: opts.inherit ? "inherit" : ["pipe", "pipe", "pipe"],
    input: opts.input,
  });
const step = (label) => console.log(`\n▶ ${label}`);

export function prepare() {
  step(`Base D1 « ${DB} »`);
  const findDb = () => JSON.parse(wrangler(["d1", "list", "--json"])).find((d) => d.name === DB);
  let db = findDb();
  if (!db) {
    wrangler(["d1", "create", DB], { inherit: true });
    db = findDb();
  }
  if (!db?.uuid) throw new Error(`Impossible de trouver ou créer la base ${DB}`);
  console.log(`  id : ${db.uuid}`);
  const config = readFileSync("wrangler.jsonc", "utf8");
  const patched = config.replace(/("database_id":\s*")[^"]*(")/, `$1${db.uuid}$2`);
  if (patched !== config) writeFileSync("wrangler.jsonc", patched);

  step("Stockages R2");
  for (const bucket of BUCKETS) {
    try {
      wrangler(["r2", "bucket", "create", bucket]);
      console.log(`  créé : ${bucket}`);
    } catch (e) {
      const out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
      if (!/already exists|10004/i.test(out)) {
        console.error(out);
        throw e;
      }
      console.log(`  existe : ${bucket}`);
    }
  }

  step("Migrations D1");
  wrangler(["d1", "migrations", "apply", DB, "--remote"], { inherit: true });
  step("Modèles du catalogue et démos");
  execFileSync("node", ["scripts/seed-demo.ts"], { env, stdio: "inherit" });
  wrangler(["d1", "execute", DB, "--remote", "--file", ".wrangler/seed-demo.sql"], {
    inherit: true,
  });

  step("Secret de connexion");
  let names = [];
  try {
    names = JSON.parse(
      wrangler(["secret", "list", "--name", WORKER, "--format", "json"]) || "[]",
    ).map((s) => s.name);
  } catch {
    // Le Worker n'existe pas encore : `secret put` le créera.
  }
  if (names.includes("BETTER_AUTH_SECRET")) {
    console.log("  BETTER_AUTH_SECRET déjà défini");
  } else {
    wrangler(["secret", "put", "BETTER_AUTH_SECRET", "--name", WORKER], {
      input: randomBytes(32).toString("base64"),
    });
    console.log("  BETTER_AUTH_SECRET créé (aléatoire)");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) prepare();
