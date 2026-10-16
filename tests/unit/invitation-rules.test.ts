import { describe, expect, it } from "vitest";
import {
  clampSeats,
  countdownParts,
  isEventPast,
  rsvpState,
  shiftDemoDates,
} from "@/invitation/engine/rules";

const DAY = 86_400_000;
const now = Date.UTC(2026, 9, 16, 10, 0);

describe("places", () => {
  it("absent = 0 place", () => expect(clampSeats("non", 3, 4)).toBe(0));
  it("ne dépasse jamais le maximum du lien", () => expect(clampSeats("oui", 9, 4)).toBe(4));
  it("au moins 1 place si présent", () => expect(clampSeats("oui", 0, 4)).toBe(1));
});

describe("dates des démos", () => {
  it("le premier moment tombe 60 jours plus tard, à la même heure", () => {
    const base = Date.UTC(2026, 0, 10, 18, 0);
    const [e] = shiftDemoDates([{ startsAt: base, endsAt: base + 5 * 3_600_000 }], now);
    expect(Math.round((e.startsAt - now) / DAY)).toBe(60);
    expect(new Date(e.startsAt).getUTCHours()).toBe(18);
    expect(e.endsAt! - e.startsAt).toBe(5 * 3_600_000);
  });

  it("une démo n'est jamais passée", () => {
    const shifted = shiftDemoDates([{ startsAt: Date.UTC(2020, 0, 1), endsAt: null }], now);
    expect(isEventPast(shifted, now)).toBe(false);
  });
});

describe("après la date", () => {
  const events = [{ startsAt: now - 2 * DAY, endsAt: now - 2 * DAY + 3_600_000 }];
  it("l'événement est passé", () => expect(isEventPast(events, now)).toBe(true));
  it("le compte à rebours s'arrête", () => expect(countdownParts(now - 1, now)).toBeNull());
  it("le RSVP se ferme", () =>
    expect(
      rsvpState({
        sectionEnabled: true,
        published: true,
        rsvpOpen: true,
        deadline: null,
        isPast: true,
        now,
      }),
    ).toEqual({ kind: "past" }));
});

describe("état du RSVP", () => {
  const base = {
    sectionEnabled: true,
    published: true,
    rsvpOpen: true,
    deadline: null,
    isPast: false,
    now,
  };
  it("ouvert", () => expect(rsvpState(base).kind).toBe("open"));
  it("aperçu non payé : désactivé", () =>
    expect(rsvpState({ ...base, published: false }).kind).toBe("preview"));
  it("date limite passée", () =>
    expect(rsvpState({ ...base, deadline: now - 1 }).kind).toBe("deadline"));
  it("section désactivée", () =>
    expect(rsvpState({ ...base, sectionEnabled: false }).kind).toBe("off"));
});

describe("compte à rebours", () => {
  it("découpe jours / heures / minutes / secondes", () =>
    expect(countdownParts(now + DAY + 2 * 3_600_000 + 3 * 60_000 + 4000, now)).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
    }));
});
