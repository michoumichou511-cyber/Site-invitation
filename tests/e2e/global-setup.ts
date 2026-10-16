import { execSync } from "node:child_process";

export const ADMIN = { email: "admin@louloua.test", password: "motdepasse-admin-local" };

/** Base locale prête : migrations, démos, admin de test sans 2FA (activée pendant le test). */
export default function globalSetup() {
  const run = (cmd: string) =>
    execSync(cmd, { stdio: "inherit", env: { ...process.env, CI: "1" } });
  run("pnpm -s db:migrate:local");
  run("pnpm -s db:seed:local");
  run(`pnpm -s admin:create -- ${ADMIN.email} "${ADMIN.password}" "Admin Test"`);
  run(
    `npx wrangler d1 execute louloua-db --local --command "DELETE FROM two_factor WHERE user_id IN (SELECT id FROM user WHERE email = '${ADMIN.email}'); UPDATE user SET two_factor_enabled = 0 WHERE email = '${ADMIN.email}'; DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email = '${ADMIN.email}');"`,
  );
}
