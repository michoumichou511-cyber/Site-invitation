"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { ORDER_STATUSES, orders } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth/guard";
import { canTransition } from "@/lib/orders/status";

const input = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("status"), orderId: z.uuid(), status: z.enum(ORDER_STATUSES) }),
  z.object({ kind: z.literal("assign"), orderId: z.uuid() }),
  z.object({ kind: z.literal("notes"), orderId: z.uuid(), notes: z.string().max(4000) }),
]);

/** Admin : statut (transitions contrôlées), assignation, notes internes. */
export async function updateOrder(raw: z.input<typeof input>) {
  const admin = await requireAdmin();
  const data = input.parse(raw);
  const db = await getDb();
  const order = await db.query.orders.findFirst({ where: eq(orders.id, data.orderId) });
  if (!order) return { ok: false as const };
  if (data.kind === "status") {
    if (!canTransition(order.status, data.status)) return { ok: false as const };
    await db
      .update(orders)
      .set({
        status: data.status,
        ...(data.status === "livree" ? { deliveredAt: new Date() } : {}),
      })
      .where(eq(orders.id, order.id));
    await logActivity(db, {
      actorId: admin.profileId,
      action: "order.status",
      entity: "orders",
      entityId: order.id,
      details: { from: order.status, to: data.status },
    });
  } else if (data.kind === "assign") {
    await db.update(orders).set({ assignedTo: admin.profileId }).where(eq(orders.id, order.id));
    await logActivity(db, {
      actorId: admin.profileId,
      action: "order.assign",
      entity: "orders",
      entityId: order.id,
    });
  } else {
    await db.update(orders).set({ internalNotes: data.notes }).where(eq(orders.id, order.id));
    await logActivity(db, {
      actorId: admin.profileId,
      action: "order.notes",
      entity: "orders",
      entityId: order.id,
    });
  }
  return { ok: true as const };
}
