import type { I18n, Lang } from "./config";
import type { ViewEvent } from "./types";

const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, "");

const escapeIcs = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

const DEFAULT_DURATION = 5 * 3_600_000;

export function eventLocation(e: Pick<ViewEvent, "venueName" | "address">) {
  return [e.venueName, e.address].filter(Boolean).join(", ");
}

export function googleCalendarUrl(e: ViewEvent, title: string) {
  const end = e.endsAt ?? e.startsAt + DEFAULT_DURATION;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(e.startsAt)}/${stamp(end)}`,
    location: eventLocation(e),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Fichier .ics (iPhone, Outlook…) pour tous les moments de l'invitation. */
export function buildIcs(input: {
  slug: string;
  title: I18n;
  lang: Lang;
  events: ViewEvent[];
  url: string;
}) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Louloua//Invitation//FR",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of input.events) {
    const end = e.endsAt ?? e.startsAt + DEFAULT_DURATION;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@${input.slug}`,
      `DTSTAMP:${stamp(Date.now())}`,
      `DTSTART:${stamp(e.startsAt)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escapeIcs(`${input.title[input.lang]} — ${e.title[input.lang]}`)}`,
      `LOCATION:${escapeIcs(eventLocation(e))}`,
      `URL:${input.url}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function mapsUrls(e: ViewEvent) {
  const query = eventLocation(e);
  const hasPoint = e.lat !== null && e.lng !== null;
  const ll = hasPoint ? `${(e.lat as number) / 1e6},${(e.lng as number) / 1e6}` : null;
  return {
    google:
      e.mapsUrl ??
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ll ?? query)}`,
    waze: ll
      ? `https://waze.com/ul?ll=${encodeURIComponent(ll)}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`,
  };
}
