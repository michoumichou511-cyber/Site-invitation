"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { EVENT_TYPES } from "@/db/schema";
import type { DraftEvent, OrderDraft } from "@/lib/orders/draft";

export type EventType = (typeof EVENT_TYPES)[number];
type I18n = { fr: string; ar: string };

export type WizardDraft = {
  v: 1;
  templateSlug: string;
  eventType: EventType;
  names: { first: I18n; second: I18n };
  initials: string;
  hosts: I18n;
  events: DraftEvent[];
  basmala: boolean;
  verse: "ar-rum-30-21" | null;
  program: { time: string; title: I18n }[];
  contactPhone: string;
  photos: string[];
  discreet: boolean;
  music: "generated" | "none" | "upload";
  languages: ("fr" | "ar")[];
  variant: string;
  accessCode: string;
  genericMaxSeats: number;
};

const KEY = "louloua-draft-v1";

const in60days = () => {
  const d = new Date(Date.now() + 60 * 86_400_000);
  return d.toISOString().slice(0, 10);
};

export function emptyDraft(templateSlug = "", eventType: EventType = "mariage"): WizardDraft {
  return {
    v: 1,
    templateSlug,
    eventType,
    names: { first: { fr: "", ar: "" }, second: { fr: "", ar: "" } },
    initials: "",
    hosts: { fr: "", ar: "" },
    events: [
      {
        type: "fete_mixte",
        title: { fr: "La fête", ar: "الحفل" },
        date: in60days(),
        time: "19:00",
        venueName: "",
        address: "",
        mapsUrl: "",
      },
    ],
    basmala: true,
    verse: eventType === "mariage" || eventType === "fiancailles" ? "ar-rum-30-21" : null,
    program: [],
    contactPhone: "",
    photos: [],
    discreet: false,
    music: "generated",
    languages: ["fr", "ar"],
    variant: "",
    accessCode: "",
    genericMaxSeats: 4,
  };
}

/* Brouillon gardé sur le téléphone (localStorage), partagé entre les pages de la commande. */
let cache: WizardDraft | null | undefined;
const listeners = new Set<() => void>();

function read(): WizardDraft | null {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as WizardDraft) : null;
  } catch {
    cache = null;
  }
  return cache;
}

export function saveDraft(draft: WizardDraft | null) {
  cache = draft;
  try {
    if (draft) localStorage.setItem(KEY, JSON.stringify(draft));
    else localStorage.removeItem(KEY);
  } catch {
    // Quota plein (photos) : le brouillon reste en mémoire pour cette visite.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** undefined pendant le rendu serveur, null s'il n'y a pas de brouillon. */
export function useDraft() {
  const draft = useSyncExternalStore(subscribe, read, () => undefined);
  const update = useCallback((patch: Partial<WizardDraft> | ((d: WizardDraft) => WizardDraft)) => {
    const current = read();
    if (!current) return;
    saveDraft(typeof patch === "function" ? patch(current) : { ...current, ...patch });
  }, []);
  return { draft, update };
}

/** Musique choisie : gardée en mémoire seulement (trop lourde pour le brouillon). */
let musicFile: File | null = null;
export const setMusicFile = (f: File | null) => {
  musicFile = f;
};
export const getMusicFile = () => musicFile;

const opt = (t: I18n) =>
  t.fr.trim() || t.ar.trim() ? { fr: t.fr.trim(), ar: t.ar.trim() || t.fr.trim() } : undefined;

/** Brouillon de l'assistant → format envoyé au serveur (validé par zod là-bas). */
export function toOrderDraft(d: WizardDraft): OrderDraft {
  const second = opt(d.names.second);
  const config: Record<string, unknown> = {
    names: {
      first: {
        fr: d.names.first.fr.trim(),
        ar: d.names.first.ar.trim() || d.names.first.fr.trim(),
      },
      ...(second ? { second } : {}),
    },
    initials: d.initials.trim() || autoInitials(d),
    hosts: opt(d.hosts),
    basmala: d.basmala,
    verse: d.verse,
    program: d.program
      .filter((p) => p.title.fr.trim() || p.title.ar.trim())
      .map((p) => ({
        time: p.time,
        title: {
          fr: p.title.fr.trim() || p.title.ar.trim(),
          ar: p.title.ar.trim() || p.title.fr.trim(),
        },
      })),
    contactPhone: d.contactPhone.replace(/[\s.-]/g, "").replace(/^0/, "+213") || undefined,
    genericMaxSeats: d.genericMaxSeats,
    ...(d.variant ? { variant: d.variant } : {}),
  };
  return {
    templateSlug: d.templateSlug,
    eventType: d.eventType,
    config,
    events: d.events,
    languages: d.languages,
    discreet: d.discreet,
    accessCode: d.accessCode,
    music: d.music,
  };
}

export function autoInitials(d: Pick<WizardDraft, "names">) {
  const a = d.names.first.fr.trim()[0] ?? d.names.first.ar.trim()[0] ?? "";
  const b = d.names.second.fr.trim()[0] ?? d.names.second.ar.trim()[0] ?? "";
  return (b ? `${a}&${b}` : a).toUpperCase() || "♥";
}

export async function dataUrlToFile(dataUrl: string, name: string) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type });
}
