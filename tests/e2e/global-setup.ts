import { execSync } from "node:child_process";

export const ADMIN = { email: "admin@louloua.test", password: "motdepasse-admin-local" };
/** Un compte admin par fichier de test (les fichiers tournent en parallèle, chacun active sa 2FA). */
export const ADMINS = {
  admin: ADMIN,
  account: { email: "admin2@louloua.test", password: "motdepasse-admin-local-2" },
};

/** Base locale prête : migrations, démos, admin de test sans 2FA (activée pendant le test). */
export default function globalSetup() {
  const run = (cmd: string) =>
    execSync(cmd, { stdio: "inherit", env: { ...process.env, CI: "1" } });
  run("pnpm -s db:migrate:local");
  run("pnpm -s db:seed:local");
  for (const a of Object.values(ADMINS)) {
    run(`pnpm -s admin:create -- ${a.email} "${a.password}" "Admin Test"`);
    run(
      `npx wrangler d1 execute louloua-db --local --command "DELETE FROM two_factor WHERE user_id IN (SELECT id FROM user WHERE email = '${a.email}'); UPDATE user SET two_factor_enabled = 0 WHERE email = '${a.email}'; DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email = '${a.email}');"`,
    );
  }
}
