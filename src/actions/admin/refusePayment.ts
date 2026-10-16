"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { invitations, orders, payments } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth/guard";
import { customerLocale } from "@/lib/orders/lookup";
import { notifyCustomer, siteUrl } from "@/lib/orders/notify";

const input = z.object({ paymentId: z.uuid(), reason: z.string().trim().min(3).max(300) });

/** Admin : refuse un reçu avec un motif ; le client peut en renvoyer un depuis /suivi. */
export async function refusePayment(raw: z.input<typeof input>) {
  const admin = await requireAdmin();
  const { paymentId, reason } = input.parse(raw);
  const db = await getDb();
  const payment = await db.query.payments.findFirst({ where: eq(payments.id, paymentId) });
  if (!payment || payment.status !== "en_attente") return { ok: false as const };
  const order = await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) });
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.orderId, payment.orderId),
  });
  if (!order || !invitation) return { ok: false as const };
  await db
    .update(payments)
    .set({
      status: "refuse",
      refusalReason: reason,
      validatedBy: admin.profileId,
      validatedAt: new Date(),
    })
    .where(eq(payments.id, paymentId));
  await logActivity(db, {
    actorId: admin.profileId,
    action: "payment.refuse",
    entity: "payments",
    entityId: paymentId,
    details: { orderId: order.id, reason },
  });
  const locale = customerLocale(invitation.languages);
  await notifyCustomer(
    "refused",
    { email: order.contactEmail, locale },
    {
      name: order.contactName,
      code: order.trackingCode,
      reason,
      url: await siteUrl(`/${locale}/suivi?code=${order.trackingCode}`),
    },
  );
  return { ok: true as const };
}
