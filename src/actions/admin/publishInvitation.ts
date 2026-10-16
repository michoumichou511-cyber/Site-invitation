"use server";

import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { getDb } from "@/db";
import { invitations, orders } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth/guard";
import { createLoginLink, ensureClientProfile, loginEmail } from "@/lib/clients";
import { customerLocale } from "@/lib/orders/lookup";
import { notifyCustomer, siteUrl } from "@/lib/orders/notify";
import { waLink } from "@/config/site";

/**
 * Admin : publie l'invitation d'une commande payée. Le filigrane disparaît, la commande
 * passe à « Livrée », le compte client est créé et ses liens lui sont envoyés.
 */
export async function publishInvitation(orderId: string) {
  const admin = await requireAdmin();
  const id = z.uuid().parse(orderId);
  const db = await getDb();
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  const invitation = await db.query.invitations.findFirst({ where: eq(invitations.orderId, id) });
  if (!order || !invitation) return { ok: false as const };
  if (!["payee", "en_creation", "livree"].includes(order.status)) return { ok: false as const };

  const locale = customerLocale(invitation.languages);
  const profileId = await ensureClientProfile(db, {
    name: order.contactName,
    email: order.contactEmail,
    whatsapp: order.contactWhatsapp,
    locale,
  });
  const now = new Date();
  await db.batch([
    db
      .update(invitations)
      .set({ isPublished: true, publishedAt: invitation.publishedAt ?? now, ownerId: profileId })
      .where(eq(invitations.id, invitation.id)),
    db
      .update(orders)
      .set({ status: "livree", deliveredAt: order.deliveredAt ?? now, customerId: profileId })
      .where(eq(orders.id, order.id)),
  ]);
  await logActivity(db, {
    actorId: admin.profileId,
    action: "invitation.publish",
    entity: "invitations",
    entityId: invitation.id,
    details: { orderId: order.id },
  });

  const link = await siteUrl(`/i/${invitation.slug}`);
  const loginLink = await createLoginLink(
    loginEmail(order.contactEmail, order.contactWhatsapp),
    locale,
  );
  const account = await siteUrl(`/${locale}/connexion`);
  await notifyCustomer(
    "delivered",
    { email: order.contactEmail, locale },
    { name: order.contactName, link, account },
  );
  const t = await getTranslations({ locale, namespace: "emails" });
  return {
    ok: true as const,
    link,
    loginLink,
    whatsapp: waLink(
      order.contactWhatsapp,
      t("deliveredWhatsapp", { link, account: loginLink ?? account }),
    ),
  };
}
