import { describe, expect, it } from "vitest";
import fr from "../../messages/fr.json";
import ar from "../../messages/ar.json";
import { buildIcs, mapsUrls } from "@/invitation/engine/calendar";
import { GUEST_CODE_RE, randomCode } from "@/invitation/engine/codes";
import { formatHijri } from "@/invitation/engine/dates";
import { format } from "@/invitation/engine/i18n";
import { DEMOS } from "@/invitation/demos";
import { THEMES } from "@/invitation/themes";

describe("mini-formateur ICU", () => {
  it("remplace les variables", () =>
    expect(format("Cher·e {name},", { name: "Karim" })).toBe("Cher·e Karim,"));
  it("accorde le pluriel en français", () => {
    expect(format(fr.invitation.seatsMax, { max: 1 }, "fr")).toBe(
      "Votre invitation est prévue pour 1 personne",
    );
    expect(format(fr.invitation.seatsMax, { max: 4 }, "fr")).toBe(
      "Votre invitation est prévue pour 4 personnes",
    );
  });
  it("accorde le duel et le pluriel en arabe", () => {
    expect(format(ar.invitation.seatsMax, { max: 2 }, "ar")).toBe("دعوتكم مخصّصة لـشخصين");
    expect(format(ar.invitation.seatsMax, { max: 4 }, "ar")).toBe("دعوتكم مخصّصة لـ4 أشخاص");
  });
});

describe("codes invités", () => {
  it("10 caractères aléatoires", () => {
    const codes = new Set(Array.from({ length: 500 }, () => randomCode()));
    expect(codes.size).toBe(500);
    for (const c of codes) expect(c).toMatch(GUEST_CODE_RE);
  });
});

describe("calendrier et cartes", () => {
  const event = {
    id: "e1",
    type: "fete_mixte",
    title: { fr: "La fête", ar: "الحفل" },
    startsAt: Date.UTC(2026, 11, 15, 18),
    endsAt: null,
    venueName: "Salle El Djazira",
    address: "Chéraga, Alger",
    mapsUrl: null,
    lat: 36766000,
    lng: 2959000,
  };
  it("fichier .ics valide", () => {
    const ics = buildIcs({
      slug: "s",
      title: { fr: "A & S", ar: "" },
      lang: "fr",
      events: [event],
      url: "https://x/i/s",
    });
    expect(ics).toContain("DTSTART:20261215T180000Z");
    expect(ics).toContain("DTEND:20261215T230000Z");
    expect(ics).toContain("LOCATION:Salle El Djazira\\, Chéraga\\, Alger");
  });
  it("Waze et Maps utilisent le point GPS", () => {
    const urls = mapsUrls(event);
    expect(urls.waze).toContain("ll=36.766%2C2.959");
    expect(urls.google).toContain("36.766");
  });
  it("date de l'hégire", () => expect(formatHijri(event.startsAt, "fr")).toMatch(/1448/));
});

describe("démos et thèmes", () => {
  it("chaque démo respecte le schéma zod de son thème", () => {
    for (const demo of DEMOS) {
      const entry = THEMES[demo.template.slug];
      expect(entry, demo.template.slug).toBeDefined();
      expect(entry.schema.safeParse(demo.config).success).toBe(true);
    }
  });
  it("un thème refuse une config inventée", () => {
    expect(THEMES.karakou.schema.safeParse({ names: {}, initials: "" }).success).toBe(false);
  });
});
