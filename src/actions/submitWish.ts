"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { guests, wishes } from "@/db/schema";
import { GUEST_CODE_RE } from "@/invitation/engine/codes";
import { loadInvitation } from "@/invitation/server/load";
import { rateLimit, verifyTurnstile } from "@/lib/security";

const input = z.object({
  slug: z.string().min(3).max(80),
  code: z.string().regex(GUEST_CODE_RE).nullable(),
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(500),
  turnstileToken: z.string().max(2048).nullable(),
});

export type WishResult =
  | { ok: true; wish: { id: string; name: string; message: string; createdAt: number } }
  | { ok: false; error: "invalid" | "rate" | "notfound" | "captcha" | "closed" };

/** Invité : laisse un vœu dans le livre d'or (Turnstile + limite de requêtes). */
export async function submitWish(raw: z.input<typeof input>): Promise<WishResult> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  if (!(await rateLimit("FORM_LIMITER", "wish"))) return { ok: false, error: "rate" };
  if (!(await verifyTurnstile(data.turnstileToken))) return { ok: false, error: "captcha" };

  const inv = await loadInvitation(data.slug);
  if (!inv || inv.expired) return { ok: false, error: "notfound" };
  if (!inv.isPublished || !inv.config.sections.guestbook) return { ok: false, error: "closed" };

  const db = await getDb();
  let guestId: string | null = null;
  if (data.code) {
    const guest = await db.query.guests.findFirst({
      where: and(eq(guests.code, data.code), eq(guests.invitationId, inv.id)),
      columns: { id: true },
    });
    guestId = guest?.id ?? null;
  }
  const [row] = await db
    .insert(wishes)
    .values({ invitationId: inv.id, guestId, name: data.name, message: data.message })
    .returning({ id: wishes.id, createdAt: wishes.createdAt });
  return {
    ok: true,
    wish: {
      id: row.id,
      name: data.name,
      message: data.message,
      createdAt: row.createdAt.getTime(),
    },
  };
}
