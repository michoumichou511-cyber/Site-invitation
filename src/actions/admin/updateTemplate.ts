"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { templates } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth/guard";

const input = z.object({
  id: z.string().min(1).max(60),
  isActive: z.boolean(),
  basePriceDa: z.number().int().min(0).max(1_000_000),
  sortOrder: z.number().int().min(0).max(999),
  badges: z.array(z.enum(["nouveau", "populaire"])).max(2),
});

/** Admin : activer / masquer un modèle, prix, ordre, badges (un modèle vendu n'est jamais supprimé). */
export async function updateTemplate(raw: z.input<typeof input>) {
  const admin = await requireAdmin();
  const data = input.parse(raw);
  const db = await getDb();
  await db
    .update(templates)
    .set({
      isActive: data.isActive,
      basePriceDa: data.basePriceDa,
      sortOrder: data.sortOrder,
      badges: data.badges,
    })
    .where(eq(templates.id, data.id));
  await logActivity(db, {
    actorId: admin.profileId,
    action: "template.update",
    entity: "templates",
    entityId: data.id,
    details: data,
  });
  return { ok: true as const };
}
