"use client";

import type { InvitationViewModel } from "@/invitation/engine/types";
import { algiersToUtc } from "@/lib/orders/draft";
import { THEMES } from "@/invitation/themes";
import { toOrderDraft, type WizardDraft } from "./draft";

/** Modèle d'affichage de l'aperçu, construit sur le téléphone à partir du brouillon. */
export function previewViewModel(
  draft: WizardDraft,
  lang: "fr" | "ar",
  musicSrc: string | null,
): InvitationViewModel | null {
  const entry = THEMES[draft.templateSlug];
  if (!entry) return null;
  const order = toOrderDraft(draft);
  const parsed = entry.schema.safeParse({
    ...order.config,
    gallery: [],
    music: draft.music === "none" ? "none" : null,
  });
  if (!parsed.success) return null;
  // Photos et musique locales (data: / blob:) ajoutées après validation : elles ne
  // quittent pas le téléphone avant la commande.
  const config = {
    ...parsed.data,
    gallery: draft.discreet ? [] : draft.photos.map((src) => ({ src, alt: { fr: "", ar: "" } })),
    music: draft.music === "upload" && musicSrc ? { src: musicSrc } : parsed.data.music,
  };
  const events = draft.events.map((e, i) => ({
    id: `preview-${i}`,
    type: e.type,
    title: { fr: e.title.fr, ar: e.title.ar || e.title.fr },
    startsAt: algiersToUtc(e.date, e.time),
    endsAt: null,
    venueName: e.venueName || null,
    address: e.address || null,
    mapsUrl: e.mapsUrl || null,
    lat: null,
    lng: null,
  }));
  return {
    slug: "apercu",
    theme: draft.templateSlug,
    eventType: draft.eventType,
    languages: draft.languages,
    defaultLang: draft.languages.includes(lang) ? lang : draft.languages[0],
    config,
    events,
    guest: null,
    rsvp: { kind: "preview" },
    existingRsvp: null,
    maxSeats: draft.genericMaxSeats,
    isPast: false,
    preview: true,
    discreet: draft.discreet,
    wishes: [],
    turnstileSiteKey: null,
  };
}
