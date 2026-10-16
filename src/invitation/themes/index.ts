import type { z } from "zod";
import type { BaseConfig } from "../engine/config";
import type { ThemeDefinition } from "../engine/theme";
import { karakouSchema } from "./karakou/schema";
import { karakouTheme } from "./karakou/theme";

type ThemeEntry = { theme: ThemeDefinition; schema: z.ZodType<BaseConfig, unknown> };

/** Registre des thèmes : slug du modèle (templates.slug) → thème + schéma zod. */
export const THEMES: Record<string, ThemeEntry> = {
  karakou: { theme: karakouTheme, schema: karakouSchema },
};

export function getThemeEntry(slug: string): ThemeEntry | null {
  return THEMES[slug] ?? null;
}
