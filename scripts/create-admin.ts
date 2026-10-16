/**
 * Crée (ou remet à zéro) un compte admin : utilisateur Better Auth + mot de passe + profil admin.
 *   pnpm admin:create -- email@exemple.com "mot de passe long" "Prénom Nom" [--remote]
 * La double authentification sera demandée à la première connexion.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { hashPassword } from "better-auth/crypto";

const args = process.argv.slice(2).filter((a) => a !== "--");
const remote = args.includes("--remote");
const [email, password, name = "Admin"] = args.filter((a) => a !== "--remote");
if (!email || !password || password.length < 12) {
  console.error(
    'Usage : pnpm admin:create -- email "mot de passe (12 caractères min.)" "Nom" [--remote]',
  );
  process.exit(1);
}

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
const now = Date.now();
const userId = crypto.randomUUID();
const hash = await hashPassword(password);

const sql = `
INSERT INTO user (id, name, email, email_verified, created_at, updated_at) VALUES (${q(userId)}, ${q(name)}, ${q(email.toLowerCase())}, 1, ${now}, ${now})
  ON CONFLICT(email) DO UPDATE SET name = excluded.name;
DELETE FROM account WHERE provider_id = 'credential' AND user_id = (SELECT id FROM user WHERE email = ${q(email.toLowerCase())});
INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
  SELECT ${q(crypto.randomUUID())}, id, 'credential', id, ${q(hash)}, ${now}, ${now} FROM user WHERE email = ${q(email.toLowerCase())};
INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
  SELECT ${q(crypto.randomUUID())}, id, ${q(name)}, 'admin', ${now}, ${now} FROM user WHERE email = ${q(email.toLowerCase())}
  ON CONFLICT(user_id) DO UPDATE SET role = 'admin', full_name = excluded.full_name;
`;
const file = ".wrangler/create-admin.sql";
writeFileSync(file, sql);
execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "louloua-db", remote ? "--remote" : "--local", "--file", file],
  {
    stdio: "inherit",
  },
);
writeFileSync(file, "");
console.log(`Admin prêt : ${email}${remote ? " (production)" : " (local)"}`);
