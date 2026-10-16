import { z } from "zod";
import { baseConfigSchema } from "../../engine/config";

/** Champs modifiables du modèle (base commune + couleurs autorisées). */
export const schema = baseConfigSchema.extend({
  variant: z.string().max(20).optional(),
});
