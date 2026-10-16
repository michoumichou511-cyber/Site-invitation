import type { z } from "zod";
import type { BaseConfig } from "../engine/config";
import type { ThemeDefinition } from "../engine/theme";
import { schema as baieSchema } from "./baie-alger/schema";
import { baieTheme } from "./baie-alger/theme";
import { schema as kabyleSchema } from "./bijoux-kabyles/schema";
import { kabyleTheme } from "./bijoux-kabyles/theme";
import { schema as casbahSchema } from "./casbah/schema";
import { casbahTheme } from "./casbah/theme";
import { schema as cielSchema } from "./ciel/schema";
import { cielTheme } from "./ciel/theme";
import { karakouSchema } from "./karakou/schema";
import { karakouTheme } from "./karakou/theme";
import { schema as zelligeSchema } from "./zellige-tlemcen/schema";
import { zelligeTheme } from "./zellige-tlemcen/theme";

type ThemeEntry = { theme: ThemeDefinition; schema: z.ZodType<BaseConfig, unknown> };

/** Registre des thèmes : slug du modèle (templates.slug) → thème + schéma zod. */
export const THEMES: Record<string, ThemeEntry> = {
  karakou: { theme: karakouTheme, schema: karakouSchema },
  "zellige-tlemcen": { theme: zelligeTheme, schema: zelligeSchema },
  casbah: { theme: casbahTheme, schema: casbahSchema },
  "bijoux-kabyles": { theme: kabyleTheme, schema: kabyleSchema },
  ciel: { theme: cielTheme, schema: cielSchema },
  "baie-alger": { theme: baieTheme, schema: baieSchema },
};

export function getThemeEntry(slug: string): ThemeEntry | null {
  return THEMES[slug] ?? null;
}
