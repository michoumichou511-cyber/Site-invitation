import type { RsvpState } from "./types";

const DAY = 86_400_000;

/** Démos du catalogue : la date affichée est toujours aujourd'hui + 60 jours (même heure). */
export const DEMO_OFFSET_DAYS = 60;

export const isDemoSlug = (slug: string) => slug.startsWith("demo-");

/**
 * Décale les moments d'une démo pour que le premier tombe dans 60 jours,
 * en gardant l'heure et les écarts entre moments.
 */
export function shiftDemoDates<T extends { startsAt: number; endsAt: number | null }>(
  events: T[],
  now: number,
): T[] {
  if (events.length === 0) return events;
  const first = Math.min(...events.map((e) => e.startsAt));
  const target = new Date(now + DEMO_OFFSET_DAYS * DAY);
  const firstDate = new Date(first);
  target.setUTCHours(
    firstDate.getUTCHours(),
    firstDate.getUTCMinutes(),
    firstDate.getUTCSeconds(),
    0,
  );
  const delta = target.getTime() - first;
  return events.map((e) => ({
    ...e,
    startsAt: e.startsAt + delta,
    endsAt: e.endsAt === null ? null : e.endsAt + delta,
  }));
}

/** L'événement est passé quand le dernier moment est terminé (ou commencé depuis 12 h sans fin). */
export function isEventPast(events: { startsAt: number; endsAt: number | null }[], now: number) {
  if (events.length === 0) return false;
  const end = Math.max(...events.map((e) => e.endsAt ?? e.startsAt + 12 * 3_600_000));
  return now > end;
}

export function rsvpState(input: {
  sectionEnabled: boolean;
  published: boolean;
  rsvpOpen: boolean;
  deadline: number | null;
  isPast: boolean;
  now: number;
}): RsvpState {
  if (!input.sectionEnabled) return { kind: "off" };
  if (!input.published) return { kind: "preview" };
  if (input.isPast) return { kind: "past" };
  if (!input.rsvpOpen) return { kind: "off" };
  if (input.deadline !== null && input.now > input.deadline)
    return { kind: "deadline", deadline: input.deadline };
  return { kind: "open" };
}

/** Places acceptées pour une réponse : 0 si absent, sinon entre 1 et le maximum du lien. */
export function clampSeats(answer: "oui" | "non" | "peut_etre", seats: number, max: number) {
  if (answer === "non") return 0;
  return Math.min(Math.max(1, Math.trunc(seats)), max);
}

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

export function countdownParts(target: number, now: number): CountdownParts | null {
  const ms = target - now;
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
  };
}
