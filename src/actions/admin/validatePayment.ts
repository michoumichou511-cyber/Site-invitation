"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { invitations, orders, payments } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth/guard";
import { customerLocale } from "@/lib/orders/lookup";
import { notifyCustomer, siteUrl } from "@/lib/orders/notify";
import { PACK_DELAY_HOURS } from "@/lib/orders/pricing";

/** Admin : valide un reçu → commande « Payée », échéance de livraison calculée. */
export async function validatePayment(paymentId: string) {
  const admin = await requireAdmin();
  const id = z.uuid().parse(paymentId);
  const db = await getDb();
  const payment = await db.query.payments.findFirst({ where: eq(payments.id, id) });
  if (!payment || payment.status !== "en_attente") return { ok: false as const };
  const order = await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) });
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.orderId, payment.orderId),
  });
  if (!order || !invitation) return { ok: false as const };
  const now = new Date();
  const dueAt = new Date(now.getTime() + PACK_DELAY_HOURS[order.pack] * 3_600_000);
  await db.batch([
    db
      .update(payments)
      .set({ status: "valide", validatedBy: admin.profileId, validatedAt: now })
      .where(eq(payments.id, id)),
    db.update(orders).set({ status: "payee", dueAt }).where(eq(orders.id, order.id)),
  ]);
  await logActivity(db, {
    actorId: admin.profileId,
    action: "payment.validate",
    entity: "payments",
    entityId: id,
    details: { orderId: order.id, amountDa: payment.amountDa },
  });
  const locale = customerLocale(invitation.languages);
  await notifyCustomer(
    "paid",
    { email: order.contactEmail, locale },
    {
      name: order.contactName,
      code: order.trackingCode,
      due: new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Africa/Algiers",
      }).format(dueAt),
      url: await siteUrl(`/${locale}/suivi?code=${order.trackingCode}`),
    },
  );
  return { ok: true as const };
}
