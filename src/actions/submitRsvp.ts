"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { guests, rsvps } from "@/db/schema";
import { GUEST_CODE_RE } from "@/invitation/engine/codes";
import { clampSeats, rsvpState } from "@/invitation/engine/rules";
import { loadInvitation } from "@/invitation/server/load";
import { rateLimit } from "@/lib/security";

const input = z.object({
  slug: z.string().min(3).max(80),
  code: z.string().regex(GUEST_CODE_RE).nullable(),
  name: z.string().trim().min(1).max(80),
  answer: z.enum(["oui", "non"]),
  seats: z.number().int().min(0).max(50),
  message: z.string().trim().max(500).nullable(),
});

export type RsvpResult =
  | { ok: true; answer: "oui" | "non"; seats: number }
  | { ok: false; error: "invalid" | "closed" | "rate" | "notfound" };

/** Invité : enregistre ou modifie sa réponse (une par invité nominatif). */
export async function submitRsvp(raw: z.input<typeof input>): Promise<RsvpResult> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  if (!(await rateLimit("RSVP_LIMITER"))) return { ok: false, error: "rate" };

  const inv = await loadInvitation(data.slug);
  if (!inv || inv.expired) return { ok: false, error: "notfound" };

  const state = rsvpState({
    sectionEnabled: inv.config.sections.rsvp,
    published: inv.isPublished,
    rsvpOpen: inv.rsvpOpen,
    deadline: inv.rsvpDeadline,
    isPast: inv.isPast,
    now: Date.now(),
  });
  if (state.kind !== "open") return { ok: false, error: "closed" };

  const db = await getDb();
  const message = data.message || null;

  if (data.code) {
    const guest = await db.query.guests.findFirst({
      where: and(eq(guests.code, data.code), eq(guests.invitationId, inv.id)),
    });
    if (!guest) return { ok: false, error: "notfound" };
    const seats = clampSeats(data.answer, data.seats, guest.maxSeats);
    const existing = await db.query.rsvps.findFirst({
      where: and(eq(rsvps.guestId, guest.id), isNull(rsvps.eventId)),
      columns: { id: true },
    });
    if (existing) {
      await db
        .update(rsvps)
        .set({ name: data.name, answer: data.answer, seats, message, source: "lien" })
        .where(eq(rsvps.id, existing.id));
    } else {
      await db.insert(rsvps).values({
        invitationId: inv.id,
        guestId: guest.id,
        name: data.name,
        answer: data.answer,
        seats,
        message,
      });
    }
    return { ok: true, answer: data.answer, seats };
  }

  if (!inv.allowGenericLink) return { ok: false, error: "notfound" };
  const seats = clampSeats(data.answer, data.seats, inv.config.genericMaxSeats);
  await db.insert(rsvps).values({
    invitationId: inv.id,
    name: data.name,
    answer: data.answer,
    seats,
    message,
  });
  return { ok: true, answer: data.answer, seats };
}
