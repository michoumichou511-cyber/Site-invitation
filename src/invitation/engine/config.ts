import { z } from "zod";
import { VERSE_IDS } from "./verses";

/** Texte saisi en français et en arabe. */
export const i18nText = (max: number) =>
  z.object({ fr: z.string().trim().max(max), ar: z.string().trim().max(max) });

export type I18n = { fr: string; ar: string };
export type Lang = "fr" | "ar";

/**
 * Champs communs à tous les thèmes. Chaque thème étend ce schéma dans
 * src/invitation/themes/<slug>/schema.ts. Sert à l'assistant de commande,
 * à l'espace client et à la validation serveur.
 */
export const baseConfigSchema = z.object({
  names: z.object({
    first: i18nText(40),
    second: i18nText(40).optional(),
  }),
  /** Initiales gravées dans le sceau, ex. « A&S ». */
  initials: z.string().trim().min(1).max(5),
  /** Phrase des familles qui invitent. */
  hosts: i18nText(240).optional(),
  basmala: z.boolean().default(true),
  verse: z.enum(VERSE_IDS).nullable().default(null),
  program: z
    .array(
      z.object({
        time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        title: i18nText(60),
        note: i18nText(80).optional(),
      }),
    )
    .max(12)
    .default([]),
  gallery: z
    .array(z.object({ src: z.string().max(300), alt: i18nText(120) }))
    .max(12)
    .default([]),
  /** MP3 choisi (URL publique R2) ; null = mélodie générée ; "none" = sans musique. */
  music: z
    .union([z.object({ src: z.string().max(300) }), z.literal("none")])
    .nullable()
    .default(null),
  /** Téléphone de la famille pour « Appeler » et « WhatsApp ». */
  contactPhone: z
    .string()
    .regex(/^\+?\d{8,15}$/)
    .optional(),
  /** Places proposées sur le lien générique (non nominatif). */
  genericMaxSeats: z.number().int().min(1).max(20).default(4),
  sections: z
    .object({
      countdown: z.boolean().default(true),
      program: z.boolean().default(true),
      venue: z.boolean().default(true),
      gallery: z.boolean().default(true),
      rsvp: z.boolean().default(true),
      guestbook: z.boolean().default(true),
    })
    .prefault({}),
});

export type BaseConfig = z.infer<typeof baseConfigSchema>;
