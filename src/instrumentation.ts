import type { Instrumentation } from "next";

/** Erreurs serveur (pages, Server Actions, routes) → Sentry, si SENTRY_DSN est défini. */
export const onRequestError: Instrumentation.onRequestError = async (error, request) => {
  const err = error as Error & { digest?: string };
  try {
    const [{ getCloudflareContext }, { sendToSentry }] = await Promise.all([
      import("@opennextjs/cloudflare"),
      import("@/lib/monitoring"),
    ]);
    const { env } = await getCloudflareContext({ async: true });
    await sendToSentry((env as { SENTRY_DSN?: string }).SENTRY_DSN, {
      source: "server",
      message: err.message,
      type: err.name,
      stack: err.stack,
      url: request.path,
      method: request.method,
      digest: err.digest,
    });
  } catch {
    // Hors Cloudflare (build) : rien à faire.
  }
};
