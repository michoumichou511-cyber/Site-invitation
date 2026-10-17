/**
 * Préparation Cloudflare (idempotente) avant la publication :
 *   1. crée la base D1 « louloua-db » et le stockage de fichiers (KV) s'ils n'existent pas ;
 *   2. écrit leurs identifiants dans wrangler.jsonc (copie de travail) ;
 *   3. applique les migrations et les 6 modèles du catalogue ;
 *   4. crée BETTER_AUTH_SECRET s'il manque (connexion admin et clients).
 * Lancé automatiquement par `pnpm build` dans Cloudflare Workers Builds, et par `pnpm cf:deploy`.
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const DB = "louloua-db";
// Nom du Worker = celui du projet Cloudflare (Workers Builds publie sous ce nom).
const WORKER = readFileSync("wrangler.jsonc", "utf8").match(/"name":\s*"([^"]+)"/)[1];
const KV_TITLE = "louloua-files";
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

  step("Stockage des fichiers (Workers KV)");
  const findKv = () =>
    JSON.parse(wrangler(["kv", "namespace", "list"])).find((n) => n.title === KV_TITLE);
  let kv = findKv();
  if (!kv) {
    wrangler(["kv", "namespace", "create", KV_TITLE], { inherit: true });
    kv = findKv();
  }
  if (!kv?.id) throw new Error(`Impossible de trouver ou créer le stockage ${KV_TITLE}`);
  console.log(`  id : ${kv.id}`);
  const withKv = readFileSync("wrangler.jsonc", "utf8").replace(
    /("binding":\s*"FILES",\s*"id":\s*")[^"]*(")/,
    `$1${kv.id}$2`,
  );
  writeFileSync("wrangler.jsonc", withKv);

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
