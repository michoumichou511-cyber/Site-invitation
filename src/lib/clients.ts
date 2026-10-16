import "server-only";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { Db } from "@/db";
import { user } from "@/db/auth-schema";
import { profiles } from "@/db/schema";
import { getAuth, NO_EMAIL_DOMAIN, takeMagicLink } from "@/lib/auth/server";

/** Adresse de connexion du client : son e-mail, ou une adresse technique dérivée de son WhatsApp. */
export const loginEmail = (email: string | null, whatsapp: string) =>
  email?.trim().toLowerCase() || `wa${whatsapp.replace(/\D/g, "")}${NO_EMAIL_DOMAIN}`;

/** Crée au besoin l'utilisateur Better Auth et le profil client ; renvoie l'id du profil. */
export async function ensureClientProfile(
  db: Db,
  c: { name: string; email: string | null; whatsapp: string; locale: "fr" | "ar" },
) {
  const email = loginEmail(c.email, c.whatsapp);
  let u = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (!u) {
    [u] = await db
      .insert(user)
      .values({ id: crypto.randomUUID(), name: c.name, email, emailVerified: false })
      .returning();
  }
  const existing = await db.query.profiles.findFirst({ where: eq(profiles.userId, u.id) });
  if (existing) return existing.id;
  const [p] = await db
    .insert(profiles)
    .values({
      userId: u.id,
      fullName: c.name,
      whatsapp: c.whatsapp,
      phone: c.whatsapp,
      locale: c.locale,
      role: "client",
    })
    .returning({ id: profiles.id });
  return p.id;
}

/** Génère un lien magique de connexion (envoyé par e-mail si le client en a un) et le renvoie. */
export async function createLoginLink(email: string, locale: "fr" | "ar") {
  const auth = await getAuth();
  await auth.api.signInMagicLink({
    body: { email, callbackURL: `/${locale}/compte` },
    headers: await headers(),
  });
  return takeMagicLink(email);
}
