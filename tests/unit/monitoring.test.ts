import { afterEach, describe, expect, it, vi } from "vitest";
import { sendToSentry } from "@/lib/monitoring";

describe("Sentry sans SDK", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("n'envoie rien sans DSN", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await sendToSentry(undefined, { message: "x", source: "server" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("poste une enveloppe Sentry valide", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null));
    vi.stubGlobal("fetch", fetch);
    await sendToSentry("https://abc123@o42.ingest.sentry.io/777", {
      message: "boom",
      type: "TypeError",
      stack: "TypeError: boom\n    at render (app.js:10:5)",
      url: "/fr",
      source: "client",
    });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://o42.ingest.sentry.io/api/777/envelope/");
    const [header, item, event] = (init.body as string).split("\n").map((l) => JSON.parse(l));
    expect(header.dsn).toContain("abc123");
    expect(item).toEqual({ type: "event" });
    expect(event.exception.values[0]).toMatchObject({ type: "TypeError", value: "boom" });
    expect(event.exception.values[0].stacktrace.frames[0]).toMatchObject({
      filename: "app.js",
      lineno: 10,
    });
  });
});
