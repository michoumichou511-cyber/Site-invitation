"use server";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { guests } from "@/db/schema";
import { randomCode } from "@/invitation/engine/codes";
import { getOwnedInvitation } from "@/lib/auth/access";
import { guestInputSchema } from "@/lib/guests/import";

const MAX_GUESTS = 2000;

type Result =
  { ok: true; count?: number } | { ok: false; error: "forbidden" | "invalid" | "limit" };

/** Client : ajoute un ou plusieurs invités (import Excel/CSV), chacun avec un code de 10 caractères. */
export async function importGuests(invitationId: string, raw: unknown[]): Promise<Result> {
  const owned = await getOwnedInvitation(z.uuid().parse(invitationId));
  if (!owned) return { ok: false, error: "forbidden" };
  const parsed = z.array(guestInputSchema).min(1).max(1000).safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { db, invitation } = owned;
  const existing = await db.$count(guests, eq(guests.invitationId, invitation.id));
  if (existing + parsed.data.length > MAX_GUESTS) return { ok: false, error: "limit" };
  const rows = parsed.data.map((g) => ({
    ...g,
    invitationId: invitation.id,
    code: randomCode(10),
  }));
  // D1 : 100 variables SQL max par requête → lots de 10 invités (≈ 9 colonnes chacun),
  // envoyés ensemble dans un seul batch (une transaction).
  const chunks = [];
  for (let i = 0; i < rows.length; i += 10)
    chunks.push(db.insert(guests).values(rows.slice(i, i + 10)));
  await db.batch(chunks as [(typeof chunks)[number], ...typeof chunks]);
  return { ok: true, count: rows.length };
}

/** Client : retire un invité (ses réponses partent avec lui). */
export async function deleteGuest(invitationId: string, guestId: string): Promise<Result> {
  const owned = await getOwnedInvitation(z.uuid().parse(invitationId));
  if (!owned) return { ok: false, error: "forbidden" };
  await owned.db
    .delete(guests)
    .where(
      and(eq(guests.id, z.uuid().parse(guestId)), eq(guests.invitationId, owned.invitation.id)),
    );
  return { ok: true };
}

/** Client : note que les liens ont été envoyés sur WhatsApp. */
export async function markGuestsSent(invitationId: string, guestIds: string[]): Promise<Result> {
  const owned = await getOwnedInvitation(z.uuid().parse(invitationId));
  if (!owned) return { ok: false, error: "forbidden" };
  const ids = z.array(z.uuid()).max(1000).parse(guestIds);
  if (ids.length)
    await owned.db
      .update(guests)
      .set({ sentAt: new Date() })
      .where(and(eq(guests.invitationId, owned.invitation.id), inArray(guests.id, ids)));
  return { ok: true };
}
