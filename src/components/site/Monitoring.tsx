"use client";

import { useEffect } from "react";

/** Remonte les erreurs JavaScript du navigateur (max 5 par page) vers /api/errors. */
export function ErrorReporter() {
  useEffect(() => {
    let sent = 0;
    const send = (message: string, type?: string, stack?: string) => {
      if (sent++ >= 5 || process.env.NODE_ENV !== "production") return;
      const body = JSON.stringify({ message, type, stack, url: location.pathname });
      navigator.sendBeacon?.("/api/errors", new Blob([body], { type: "application/json" }));
    };
    const onError = (e: ErrorEvent) => send(e.message, e.error?.name, e.error?.stack);
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as Error | undefined;
      send(r?.message ?? String(e.reason), r?.name, r?.stack);
    };
    addEventListener("error", onError);
    addEventListener("unhandledrejection", onRejection);
    return () => {
      removeEventListener("error", onError);
      removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}

/** Cloudflare Web Analytics : sans cookie, Core Web Vitals réels. Rien sans jeton. */
export function WebAnalytics({ token }: { token: string | null }) {
  if (!token) return null;
  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
