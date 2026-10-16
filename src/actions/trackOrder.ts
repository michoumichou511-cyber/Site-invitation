"use server";

import { getDb } from "@/db";
import { TRACKING_RE } from "@/lib/orders/codes";
import { findOrderByTracking } from "@/lib/orders/lookup";
import type { OrderStatus } from "@/lib/orders/status";
import { rateLimit } from "@/lib/security";

export type TrackedOrder = {
  code: string;
  status: OrderStatus;
  pack: string;
  amountDa: number;
  templateName: { fr: string; ar: string };
  createdAt: number;
  dueAt: number | null;
  payment: {
    status: "en_attente" | "valide" | "refuse" | "rembourse";
    refusalReason: string | null;
  } | null;
  canUploadReceipt: boolean;
  invitationUrl: string | null;
};

/** Visiteur : statut de sa commande par code de suivi (aucune donnée personnelle renvoyée). */
export async function trackOrder(rawCode: string): Promise<TrackedOrder | null> {
  const code = rawCode.trim().toUpperCase();
  if (!TRACKING_RE.test(code)) return null;
  if (!(await rateLimit("FORM_LIMITER", "track"))) return null;
  const db = await getDb();
  const found = await findOrderByTracking(db, code);
  if (!found) return null;
  const { order, invitation, template, lastPayment } = found;
  const refused = lastPayment?.status === "refuse";
  return {
    code,
    status: order.status,
    pack: order.pack,
    amountDa: order.amountDa - order.discountDa,
    templateName: template.name,
    createdAt: order.createdAt.getTime(),
    dueAt: order.dueAt?.getTime() ?? null,
    payment: lastPayment
      ? { status: lastPayment.status, refusalReason: lastPayment.refusalReason }
      : null,
    canUploadReceipt:
      order.status === "nouvelle" || (order.status === "paiement_en_attente" && refused),
    invitationUrl: invitation.isPublished ? `/i/${invitation.slug}` : null,
  };
}
