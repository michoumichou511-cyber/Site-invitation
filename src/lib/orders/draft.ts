import { z } from "zod";
import { EVENT_TYPES, PROGRAM_TYPES } from "@/db/schema";

/** Heure d'Alger (UTC+1, sans heure d'été) → millisecondes UTC. */
export function algiersToUtc(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh - 1, mm);
}

export const draftEventSchema = z.object({
  type: z.enum(PROGRAM_TYPES),
  title: z.object({ fr: z.string().trim().min(1).max(60), ar: z.string().trim().max(60) }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  venueName: z.string().trim().max(120).default(""),
  address: z.string().trim().max(200).default(""),
  mapsUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (u) =>
        u === "" ||
        /^https:\/\/(maps\.app\.goo\.gl|(www\.)?google\.[a-z.]+\/maps|goo\.gl\/maps|waze\.com)\//.test(
          u,
        ),
      {
        message: "maps",
      },
    )
    .default(""),
});

export type DraftEvent = z.infer<typeof draftEventSchema>;

/**
 * Brouillon de commande (assistant) : gardé sur le téléphone, envoyé à la commande.
 * La config est ensuite validée par le schéma zod du thème choisi.
 */
export const orderDraftSchema = z.object({
  templateSlug: z.string().min(1).max(60),
  eventType: z.enum(EVENT_TYPES),
  config: z.record(z.string(), z.unknown()),
  events: z.array(draftEventSchema).min(1).max(6),
  languages: z
    .array(z.enum(["fr", "ar"]))
    .min(1)
    .max(2),
  discreet: z.boolean().default(false),
  accessCode: z.string().trim().max(40).default(""),
  music: z.enum(["generated", "none", "upload"]).default("generated"),
});

export type OrderDraft = z.infer<typeof orderDraftSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(/^(\+213|0)[5-7]\d{8}$/)),
  email: z.union([z.literal(""), z.email().max(120)]).default(""),
  consent: z.literal(true),
});

/** Numéro algérien au format international (+213…). */
export const normalizeDzPhone = (phone: string) =>
  phone.startsWith("0") ? `+213${phone.slice(1)}` : phone;
