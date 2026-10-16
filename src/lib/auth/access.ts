import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { invitations, orders, templates } from "@/db/schema";
import { getViewer } from "./viewer";

/**
 * Règle d'accès de l'espace client : un client ne touche que ses invitations ;
 * l'admin (2FA active) peut tout voir. Renvoie null si refusé.
 */
export async function getOwnedInvitation(invitationId: string) {
  const viewer = await getViewer();
  if (!viewer?.profileId) return null;
  const db = await getDb();
  const row = await db
    .select({ invitation: invitations, order: orders, template: templates })
    .from(invitations)
    .innerJoin(orders, eq(orders.id, invitations.orderId))
    .innerJoin(templates, eq(templates.id, invitations.templateId))
    .where(eq(invitations.id, invitationId))
    .get();
  if (!row) return null;
  const isAdmin = viewer.role === "admin" && viewer.twoFactorEnabled;
  if (!isAdmin && row.invitation.ownerId !== viewer.profileId) return null;
  return { ...row, viewer, isAdmin, db };
}
