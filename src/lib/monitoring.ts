/**
 * Envoi d'erreurs à Sentry sans SDK (poids du Worker et des invitations) : on poste
 * directement une « enveloppe » Sentry. Ne fait rien si SENTRY_DSN n'est pas défini.
 */
export type ErrorReport = {
  message: string;
  type?: string;
  stack?: string;
  url?: string;
  method?: string;
  source: "server" | "client";
  digest?: string;
};

export async function sendToSentry(
  dsn: string | undefined,
  report: ErrorReport,
  environment = "production",
) {
  if (!dsn) return;
  const m = /^https:\/\/([^@]+)@([^/]+)\/(\d+)$/.exec(dsn.trim());
  if (!m) return;
  const [, , host, projectId] = m;
  const eventId = crypto.randomUUID().replace(/-/g, "");
  const event = {
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: "javascript",
    level: "error",
    environment,
    tags: { source: report.source, runtime: "cloudflare-workers" },
    request: report.url ? { url: report.url, method: report.method } : undefined,
    exception: {
      values: [
        {
          type: report.type ?? "Error",
          value: report.message.slice(0, 2000),
          stacktrace: report.stack ? { frames: parseFrames(report.stack) } : undefined,
        },
      ],
    },
    extra: report.digest ? { digest: report.digest } : undefined,
  };
  const body = [
    JSON.stringify({ event_id: eventId, dsn, sent_at: new Date().toISOString() }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(event),
  ].join("\n");
  try {
    await fetch(`https://${host}/api/${projectId}/envelope/`, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-sentry-envelope" },
    });
  } catch {
    // Le suivi d'erreurs ne doit jamais casser une page.
  }
}

function parseFrames(stack: string) {
  return stack
    .split("\n")
    .slice(1, 30)
    .map((line) => {
      const match = /at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/.exec(line.trim());
      return match
        ? {
            function: match[1] ?? "?",
            filename: match[2],
            lineno: Number(match[3]),
            colno: Number(match[4]),
          }
        : { function: line.trim() };
    })
    .reverse();
}
