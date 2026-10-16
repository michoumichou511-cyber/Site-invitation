import { z } from "zod";
import { baseConfigSchema } from "../../engine/config";

/** Champs modifiables du modèle Karakou. */
export const karakouSchema = baseConfigSchema.extend({
  /** Velours bordeaux (par défaut) ou bleu nuit, les deux mesurés sur des karakous d'Alger. */
  variant: z.enum(["velours", "nuit"]).default("velours"),
});

export type KarakouConfig = z.infer<typeof karakouSchema>;
