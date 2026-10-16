/**
 * Versets et formules validés à la main. Jamais de texte religieux inventé ou généré :
 * pour en ajouter un, vérifier le texte exact et la référence avant de l'écrire ici.
 */
export const VERSES = {
  "ar-rum-30-21": {
    ar: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا",
    fr: "« Et parmi Ses signes, Il a créé de vous des épouses… » (Coran 30:21)",
  },
} as const;

export const VERSE_IDS = Object.keys(VERSES) as [keyof typeof VERSES, ...(keyof typeof VERSES)[]];

export type VerseId = keyof typeof VERSES;

export const BASMALA = "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
