import "server-only";
import { activityLog } from "@/db/schema";
import type { Db } from "@/db";

/** Journal des actions sensibles (qui a fait quoi). */
export async function logActivity(
  db: Db,
  entry: {
    actorId: string | null;
    action: string;
    entity: string;
    entityId: string;
    details?: Record<string, unknown>;
  },
) {
  await db.insert(activityLog).values({ ...entry, details: entry.details ?? null });
}
