import "server-only";
import { desc, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { invitations, orders, payments, templates } from "@/db/schema";

/** Commande + invitation + dernier paiement, par code de suivi. */
export async function findOrderByTracking(db: Db, code: string) {
  const row = await db
    .select({ order: orders, invitation: invitations, template: templates })
    .from(orders)
    .innerJoin(invitations, eq(invitations.orderId, orders.id))
    .innerJoin(templates, eq(templates.id, orders.templateId))
    .where(eq(orders.trackingCode, code))
    .get();
  if (!row) return null;
  const lastPayment = await db.query.payments.findFirst({
    where: eq(payments.orderId, row.order.id),
    orderBy: desc(payments.createdAt),
  });
  return { ...row, lastPayment: lastPayment ?? null };
}

export const customerLocale = (languages: string[]): "fr" | "ar" =>
  languages[0] === "ar" ? "ar" : "fr";
