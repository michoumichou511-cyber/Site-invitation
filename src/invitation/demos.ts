/**
 * Invitations de démonstration du catalogue. Les dates sont recalculées à l'affichage
 * (aujourd'hui + 60 jours) : celles-ci ne servent que de base. Fichier sans import
 * pour pouvoir être lu par scripts/seed-demo.ts.
 */
export const DEMO_BASE_DATE = Date.UTC(2026, 0, 10, 18, 0); // 19:00 à Alger

export const DEMOS = [
  {
    slug: "demo-karakou",
    template: {
      slug: "karakou",
      name: { fr: "Karakou", ar: "كاراكو" },
      description: {
        fr: "Velours bordeaux et or fetla, enveloppe à sceau de cire.",
        ar: "مخمل عنابي وذهب الفتلة، ظرف بختم من الشمع.",
      },
      eventTypes: ["mariage", "henne", "tasdira"],
      style: "karakou",
      tags: ["prestige", "traditionnel"],
      basePriceDa: 2500,
      badges: ["nouveau"],
      sortOrder: 1,
    },
    eventType: "mariage",
    config: {
      variant: "velours",
      names: { first: { fr: "Amine", ar: "أمين" }, second: { fr: "Sara", ar: "سارة" } },
      initials: "A&S",
      hosts: {
        fr: "Les familles Benali et Haddad ont l'honneur de vous convier au mariage de leurs enfants",
        ar: "تتشرف عائلتا بن علي وحداد بدعوتكم لحضور حفل زفاف أبنائهما",
      },
      basmala: true,
      verse: "ar-rum-30-21",
      program: [
        {
          time: "19:00",
          title: { fr: "Accueil des invités", ar: "استقبال الضيوف" },
          note: { fr: "Thé, gâteaux traditionnels", ar: "شاي وحلويات تقليدية" },
        },
        {
          time: "20:30",
          title: { fr: "Entrée des mariés", ar: "دخول العروسين" },
          note: { fr: "Zorna et karkabou", ar: "زرنة وقرقابو" },
        },
        {
          time: "22:00",
          title: { fr: "Dîner", ar: "العشاء" },
          note: { fr: "Jusqu'au bout de la nuit", ar: "حتى آخر الليل" },
        },
      ],
      gallery: [],
      music: null,
      contactPhone: "+213550000000",
      genericMaxSeats: 4,
    },
    events: [
      {
        id: "demo-karakou-fete",
        type: "fete_mixte",
        title: { fr: "La fête", ar: "الحفل" },
        offsetMinutes: 0,
        durationMinutes: 300,
        venueName: "Salle des fêtes El Djazira",
        address: "Chéraga, Alger",
        lat: 36766000,
        lng: 2959000,
      },
    ],
    guests: [
      { id: "demo-karakou-g1", name: "Karim", code: "karimdemo2", maxSeats: 3, locale: "fr" },
      { id: "demo-karakou-g2", name: "يمينة", code: "yaminademo", maxSeats: 2, locale: "ar" },
    ],
  },
] as const;
