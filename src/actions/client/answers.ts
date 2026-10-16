"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { guests, rsvps, wishes } from "@/db/schema";
import { getOwnedInvitation } from "@/lib/auth/access";

const manualInput = z.object({
  invitationId: z.uuid(),
  guestId: z.uuid().nullable(),
  name: z.string().trim().min(1).max(80),
  answer: z.enum(["oui", "non", "peut_etre"]),
  seats: z.number().int().min(0).max(50),
  message: z.string().trim().max(500).nullable(),
});

/** Client : ajoute (ou corrige) une réponse reçue par téléphone. */
export async function addManualRsvp(raw: z.input<typeof manualInput>) {
  const data = manualInput.safeParse(raw);
  if (!data.success) return { ok: false as const, error: "invalid" as const };
  const owned = await getOwnedInvitation(data.data.invitationId);
  if (!owned) return { ok: false as const, error: "forbidden" as const };
  const { db, invitation } = owned;
  const { guestId, name, answer, message } = data.data;
  let seats = answer === "non" ? 0 : Math.max(1, data.data.seats);
  if (guestId) {
    const guest = await db.query.guests.findFirst({
      where: and(eq(guests.id, guestId), eq(guests.invitationId, invitation.id)),
    });
    if (!guest) return { ok: false as const, error: "invalid" as const };
    seats = Math.min(seats, guest.maxSeats);
    const existing = await db.query.rsvps.findFirst({
      where: and(eq(rsvps.guestId, guestId), isNull(rsvps.eventId)),
    });
    if (existing) {
      await db
        .update(rsvps)
        .set({ name, answer, seats, message, source: "manuel" })
        .where(eq(rsvps.id, existing.id));
      return { ok: true as const };
    }
  }
  await db.insert(rsvps).values({
    invitationId: invitation.id,
    guestId,
    name,
    answer,
    seats,
    message,
    source: "manuel",
  });
  return { ok: true as const };
}

/** Client : masque ou affiche un vœu du livre d'or. */
export async function moderateWish(invitationId: string, wishId: string, approved: boolean) {
  const owned = await getOwnedInvitation(z.uuid().parse(invitationId));
  if (!owned) return { ok: false as const };
  await owned.db
    .update(wishes)
    .set({ isApproved: approved })
    .where(
      and(eq(wishes.id, z.uuid().parse(wishId)), eq(wishes.invitationId, owned.invitation.id)),
    );
  return { ok: true as const };
}
