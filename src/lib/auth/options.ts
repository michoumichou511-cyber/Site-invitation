import type { BetterAuthOptions } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { twoFactor } from "better-auth/plugins/two-factor";

type MagicLinkSender = (data: { email: string; url: string }) => Promise<void>;

/**
 * Options Better Auth partagées entre le serveur (src/lib/auth/server.ts)
 * et la génération du schéma (`pnpm auth:generate`).
 * - Client : lien magique par e-mail, sans mot de passe.
 * - Admin : e-mail + mot de passe + 2FA (TOTP) obligatoire.
 */
export function authOptions(sendMagicLink: MagicLinkSender) {
  return {
    appName: "Lou'lou'a",
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12 },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, window: 60, max: 30 },
    // Cloudflare transmet l'IP réelle du visiteur dans cf-connecting-ip.
    advanced: { ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] } },
    plugins: [
      magicLink({
        expiresIn: 60 * 15,
        sendMagicLink: ({ email, url }) => sendMagicLink({ email, url }),
      }),
      twoFactor({ issuer: "Lou'lou'a" }),
    ],
  } satisfies BetterAuthOptions;
}
