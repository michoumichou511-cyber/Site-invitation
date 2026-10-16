/** Contrat d'un thème : palette, polices et ouverture. Le thème ne lit jamais la base. */
export type ThemePalette = {
  /** Fond de la page */
  ground: string;
  /** Fond plus profond (dégradés, cases) */
  groundDeep: string;
  /** Couleur des détails (filets, titres de section) */
  accent: string;
  /** Texte doux sur le fond */
  soft: string;
  /** Prénoms, dates, gros texte sur le fond */
  bright: string;
  /** Papier des cartes (RSVP, enveloppe) */
  paper: string;
  /** Texte sur le papier */
  ink: string;
  /** Boutons pleins sur le papier */
  action: string;
  /** Texte des boutons pleins */
  onAction: string;
};

export type ThemeDefinition = {
  slug: string;
  opener: "envelope";
  palettes: Record<string, ThemePalette>;
  defaultPalette: string;
  /** Couleurs des pétales / paillettes à l'ouverture et au RSVP */
  confetti: string[];
  /** Motif SVG de fond (data URI), très léger */
  pattern: string;
};

export function paletteVars(p: ThemePalette): Record<string, string> {
  return {
    "--inv-ground": p.ground,
    "--inv-ground-deep": p.groundDeep,
    "--inv-accent": p.accent,
    "--inv-soft": p.soft,
    "--inv-bright": p.bright,
    "--inv-paper": p.paper,
    "--inv-ink": p.ink,
    "--inv-action": p.action,
    "--inv-on-action": p.onAction,
  };
}
