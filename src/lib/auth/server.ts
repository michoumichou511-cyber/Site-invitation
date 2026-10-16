import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { cache } from "react";
import { headers } from "next/headers";
import { getDb, getEnv, schema } from "@/db";
import { sendEmail } from "@/lib/email";
import { authOptions } from "./options";

/**
 * Derniers liens magiques générés (par e-mail), pour que l'admin puisse aussi les
 * transmettre sur WhatsApp. Les adresses « …@whatsapp.invalid » (clients sans e-mail)
 * ne reçoivent jamais d'e-mail.
 */
const lastLinks = new Map<string, string>();
export const takeMagicLink = (email: string) => {
  const url = lastLinks.get(email);
  lastLinks.delete(email);
  return url ?? null;
};
export const NO_EMAIL_DOMAIN = "@whatsapp.invalid";

async function sendMagicLink({ email, url }: { email: string; url: string }) {
  lastLinks.set(email, url);
  if (email.endsWith(NO_EMAIL_DOMAIN)) return;
  await sendEmail({
    to: email,
    subject: "Votre lien de connexion · رابط الدخول",
    text: `Bonjour,\n\nVoici votre lien pour ouvrir votre espace (valable 15 minutes) :\n${url}\n\nمرحباً، هذا رابط الدخول إلى فضائكم (صالح لمدة 15 دقيقة).`,
    html: `<p>Bonjour,</p><p>Voici votre lien pour ouvrir votre espace (valable 15 minutes) :</p><p><a href="${url}">Ouvrir mon espace</a></p><p dir="rtl">مرحباً، هذا رابط الدخول إلى فضائكم (صالح لمدة 15 دقيقة).</p>`,
  });
}

/** Instance Better Auth liée à la base D1 de la requête. */
export const getAuth = cache(async () => {
  const [db, env] = await Promise.all([getDb(), getEnv()]);
  const options = authOptions(sendMagicLink);
  return betterAuth({
    ...options,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [
      env.BETTER_AUTH_URL,
      env.PUBLIC_SITE_URL,
      // Développement et tests : n'importe quel port local.
      ...(env.BETTER_AUTH_URL.startsWith("http://localhost") ? ["http://localhost:*"] : []),
    ],
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    plugins: [...options.plugins, nextCookies()],
  });
});

/** Session de l'utilisateur connecté, ou null. */
export const getSession = cache(async () => {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
});
