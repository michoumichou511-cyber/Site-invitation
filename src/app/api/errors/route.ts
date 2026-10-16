import { z } from "zod";
import { getEnv } from "@/db";
import { sendToSentry } from "@/lib/monitoring";
import { rateLimit } from "@/lib/security";

const input = z.object({
  message: z.string().max(2000),
  type: z.string().max(100).optional(),
  stack: z.string().max(8000).optional(),
  url: z.string().max(500).optional(),
});

/** Erreurs du navigateur relayées vers Sentry (la clé reste côté serveur). */
export async function POST(request: Request) {
  if (!(await rateLimit("FORM_LIMITER", "errors"))) return new Response(null, { status: 429 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const env = await getEnv();
  await sendToSentry((env as { SENTRY_DSN?: string }).SENTRY_DSN, {
    ...parsed.data,
    source: "client",
  });
  return new Response(null, { status: 204 });
}
