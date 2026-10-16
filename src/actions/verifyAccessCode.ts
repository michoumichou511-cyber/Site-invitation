"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { ACCESS_COOKIE, accessToken, hashAccessCode } from "@/invitation/server/access";
import { loadInvitation } from "@/invitation/server/load";
import { rateLimit } from "@/lib/security";

const input = z.object({ slug: z.string().min(3).max(80), code: z.string().trim().min(1).max(40) });

/** Invité : ouvre une invitation protégée par un code d'accès. */
export async function verifyAccessCode(raw: z.input<typeof input>) {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false as const };
  if (!(await rateLimit("FORM_LIMITER"))) return { ok: false as const };
  const inv = await loadInvitation(parsed.data.slug);
  if (!inv?.accessCodeHash) return { ok: false as const };
  const hash = await hashAccessCode(inv.slug, parsed.data.code);
  if (hash !== inv.accessCodeHash) return { ok: false as const };
  (await cookies()).set(ACCESS_COOKIE(inv.slug), await accessToken(hash), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: `/i/${inv.slug}`,
    maxAge: 60 * 60 * 24 * 180,
  });
  return { ok: true as const };
}
