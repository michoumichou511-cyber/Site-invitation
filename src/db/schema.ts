/**
 * Lou'lou'a (nom provisoire) — schéma de la base Cloudflare D1 (SQLite) avec Drizzle ORM.
 *
 * - Les tables d'authentification (user, session, account, verification) sont générées
 *   par Better Auth : `npx @better-auth/cli generate --output src/db/auth-schema.ts`.
 *   `profiles.userId` pointe vers `user.id` (texte).
 * - Identifiants : UUID texte générés côté application.
 * - Dates : entiers en millisecondes (mode "timestamp_ms").
 * - Textes traduits : JSON `{ fr: string; ar: string }`.
 * - Montants : entiers en dinars algériens (DA), jamais de décimales.
 */
import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/* ------------------------------------------------------------------ */
/* Types partagés                                                      */
/* ------------------------------------------------------------------ */

export type I18nText = { fr: string; ar: string };

export const EVENT_TYPES = [
  "mariage",
  "fiancailles",
  "khotba",
  "henne",
  "tasdira",
  "walima",
  "anniversaire",
  "naissance",
  "aqiqa",
  "circoncision",
  "reussite",
  "hajj",
  "aid_ramadan",
  "entreprise",
] as const;

export const PACKS = ["essentiel", "premium", "prestige"] as const;

export const ORDER_STATUSES = [
  "nouvelle",
  "paiement_en_attente",
  "payee",
  "en_creation",
  "livree",
  "terminee",
  "annulee",
] as const;

export const PAYMENT_METHODS = ["baridimob", "ccp", "edahabia", "cib", "especes"] as const;

export const PAYMENT_STATUSES = ["en_attente", "valide", "refuse", "rembourse"] as const;

export const PROGRAM_TYPES = [
  "ceremonie",
  "henne",
  "fete_femmes",
  "fete_hommes",
  "fete_mixte",
  "cortege",
  "diner",
  "autre",
] as const;

export const RSVP_ANSWERS = ["oui", "non", "peut_etre"] as const;

/** Contrainte SQL : la colonne doit valoir une des valeurs autorisées. */
const inList = (col: Parameters<typeof sql>[1], values: readonly string[]) =>
  sql`${col} in (${sql.raw(values.map((v) => `'${v}'`).join(", "))})`;

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => new Date());

/* ------------------------------------------------------------------ */
/* Utilisateurs                                                        */
/* ------------------------------------------------------------------ */

/** Profil métier d'un utilisateur Better Auth (client ou admin). */
export const profiles = sqliteTable(
  "profiles",
  {
    id: id(),
    userId: text("user_id").notNull().unique(), // -> user.id (Better Auth)
    fullName: text("full_name").notNull(),
    phone: text("phone"), // format international +213...
    whatsapp: text("whatsapp"),
    locale: text("locale", { enum: ["fr", "ar"] })
      .notNull()
      .default("fr"),
    role: text("role", { enum: ["client", "admin"] })
      .notNull()
      .default("client"),
    partnerCodeId: text("partner_code_id").references(() => promoCodes.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("profiles_role_idx").on(t.role)],
);

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

/** Un modèle d'invitation = un thème de code + son schéma de configuration. */
export const templates = sqliteTable(
  "templates",
  {
    id: id(),
    slug: text("slug").notNull().unique(), // = dossier src/invitation/themes/<slug>
    name: text("name", { mode: "json" }).$type<I18nText>().notNull(),
    description: text("description", { mode: "json" }).$type<I18nText>(),
    eventTypes: text("event_types", { mode: "json" })
      .$type<(typeof EVENT_TYPES)[number][]>()
      .notNull(),
    style: text("style").notNull(), // karakou, zellige, casbah, kabyle, mzab, baie, tassili, aures...
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    previewImage: text("preview_image").notNull(), // clé R2
    previewVideo: text("preview_video"), // clé R2
    basePriceDa: integer("base_price_da").notNull(),
    minPack: text("min_pack", { enum: PACKS }).notNull().default("essentiel"),
    configSchemaVersion: integer("config_schema_version").notNull().default(1),
    badges: text("badges", { mode: "json" })
      .$type<("nouveau" | "populaire")[]>()
      .notNull()
      .default(sql`'[]'`),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("templates_active_sort_idx").on(t.isActive, t.sortOrder)],
);

/* ------------------------------------------------------------------ */
/* Commandes et paiements                                              */
/* ------------------------------------------------------------------ */

export const promoCodes = sqliteTable("promo_codes", {
  id: id(),
  code: text("code").notNull().unique(),
  kind: text("kind", { enum: ["pourcentage", "montant"] }).notNull(),
  value: integer("value").notNull(), // % ou DA selon kind
  partnerName: text("partner_name"), // salle, photographe, neggafa...
  partnerPhone: text("partner_phone"),
  commissionPercent: integer("commission_percent").notNull().default(0),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const orders = sqliteTable(
  "orders",
  {
    id: id(),
    trackingCode: text("tracking_code").notNull().unique(), // ex. LLA-7K2Q9M, montré au client
    customerId: text("customer_id").references(() => profiles.id, { onDelete: "set null" }),
    // coordonnées saisies avant la création du compte
    contactName: text("contact_name").notNull(),
    contactWhatsapp: text("contact_whatsapp").notNull(),
    contactEmail: text("contact_email"),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "restrict" }),
    pack: text("pack", { enum: PACKS }).notNull(),
    options: text("options", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    amountDa: integer("amount_da").notNull(),
    discountDa: integer("discount_da").notNull().default(0),
    promoCodeId: text("promo_code_id").references(() => promoCodes.id, { onDelete: "set null" }),
    status: text("status", { enum: ORDER_STATUSES }).notNull().default("nouvelle"),
    assignedTo: text("assigned_to").references(() => profiles.id, { onDelete: "set null" }),
    source: text("source"), // tiktok, instagram, partenaire, bouche_a_oreille...
    internalNotes: text("internal_notes"),
    dueAt: integer("due_at", { mode: "timestamp_ms" }), // livraison promise
    deliveredAt: integer("delivered_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("orders_status_idx").on(t.status, t.createdAt),
    index("orders_customer_idx").on(t.customerId),
    index("orders_assigned_idx").on(t.assignedTo),
    check("orders_status_ck", inList(t.status, ORDER_STATUSES)),
    check("orders_pack_ck", inList(t.pack, PACKS)),
    check("orders_amount_ck", sql`${t.amountDa} >= 0 and ${t.discountDa} >= 0`),
  ],
);

export const payments = sqliteTable(
  "payments",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    method: text("method", { enum: PAYMENT_METHODS }).notNull(),
    amountDa: integer("amount_da").notNull(),
    receiptKey: text("receipt_key"), // photo du reçu dans R2
    providerRef: text("provider_ref").unique(), // id Chargily (idempotence du webhook)
    status: text("status", { enum: PAYMENT_STATUSES }).notNull().default("en_attente"),
    refusalReason: text("refusal_reason"),
    validatedBy: text("validated_by").references(() => profiles.id, { onDelete: "set null" }),
    validatedAt: integer("validated_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [
    index("payments_status_idx").on(t.status, t.createdAt),
    index("payments_order_idx").on(t.orderId),
    check("payments_method_ck", inList(t.method, PAYMENT_METHODS)),
    check("payments_status_ck", inList(t.status, PAYMENT_STATUSES)),
    check("payments_amount_ck", sql`${t.amountDa} > 0`),
  ],
);

/* ------------------------------------------------------------------ */
/* Invitations                                                         */
/* ------------------------------------------------------------------ */

/** Configuration validée par le schéma zod du thème (src/invitation/themes/<slug>/schema.ts). */
export type InvitationConfig = Record<string, unknown>;

export const invitations = sqliteTable(
  "invitations",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").references(() => profiles.id, { onDelete: "set null" }),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(), // /i/<slug>, non séquentiel
    eventType: text("event_type", { enum: EVENT_TYPES }).notNull(),
    config: text("config", { mode: "json" }).$type<InvitationConfig>().notNull(),
    languages: text("languages", { mode: "json" })
      .$type<("fr" | "ar" | "tz")[]>()
      .notNull()
      .default(sql`'["fr","ar"]'`),
    discreetMode: integer("discreet_mode", { mode: "boolean" }).notNull().default(false),
    accessCodeHash: text("access_code_hash"), // code d'accès optionnel (haché)
    allowGenericLink: integer("allow_generic_link", { mode: "boolean" }).notNull().default(true),
    rsvpOpen: integer("rsvp_open", { mode: "boolean" }).notNull().default(true),
    rsvpDeadline: integer("rsvp_deadline", { mode: "timestamp_ms" }),
    musicKey: text("music_key"), // MP3 dans R2
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }), // purge des données invités
    viewCount: integer("view_count").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("invitations_owner_idx").on(t.ownerId),
    index("invitations_expires_idx").on(t.expiresAt),
    check("invitations_event_type_ck", inList(t.eventType, EVENT_TYPES)),
  ],
);

/** Les moments de la fête (henné, fête des femmes, cortège...), chacun avec son lieu. */
export const events = sqliteTable(
  "events",
  {
    id: id(),
    invitationId: text("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    type: text("type", { enum: PROGRAM_TYPES }).notNull(),
    title: text("title", { mode: "json" }).$type<I18nText>().notNull(),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    venueName: text("venue_name"),
    address: text("address"),
    lat: integer("lat_e6"), // latitude * 1e6
    lng: integer("lng_e6"), // longitude * 1e6
    mapsUrl: text("maps_url"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    index("events_invitation_idx").on(t.invitationId, t.sortOrder),
    check("events_type_ck", inList(t.type, PROGRAM_TYPES)),
  ],
);

export const guests = sqliteTable(
  "guests",
  {
    id: id(),
    invitationId: text("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    groupLabel: text("group_label"), // famille du marié, famille de la mariée, amis...
    maxSeats: integer("max_seats").notNull().default(1),
    code: text("code").notNull().unique(), // 10 caractères aléatoires : lien /i/<slug>/<code> et QR
    allowedEventIds: text("allowed_event_ids", { mode: "json" }).$type<string[]>(), // null = tous
    locale: text("locale", { enum: ["fr", "ar"] }),
    tableLabel: text("table_label"), // « Trouver ma table » (V2)
    sentAt: integer("sent_at", { mode: "timestamp_ms" }),
    firstOpenedAt: integer("first_opened_at", { mode: "timestamp_ms" }),
    openCount: integer("open_count").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    index("guests_invitation_idx").on(t.invitationId),
    index("guests_name_idx").on(t.invitationId, t.name),
    check("guests_seats_ck", sql`${t.maxSeats} between 1 and 50`),
  ],
);

export const rsvps = sqliteTable(
  "rsvps",
  {
    id: id(),
    invitationId: text("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    guestId: text("guest_id").references(() => guests.id, { onDelete: "cascade" }), // null = lien générique
    eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }), // null = tout l'événement
    name: text("name").notNull(),
    answer: text("answer", { enum: RSVP_ANSWERS }).notNull(),
    seats: integer("seats").notNull().default(1),
    message: text("message"),
    source: text("source", { enum: ["lien", "manuel"] })
      .notNull()
      .default("lien"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("rsvps_invitation_idx").on(t.invitationId, t.answer),
    // une seule réponse par invité nominatif et par moment de la fête
    uniqueIndex("rsvps_guest_event_uq")
      .on(t.guestId, t.eventId)
      .where(sql`${t.eventId} is not null`),
    uniqueIndex("rsvps_guest_all_uq")
      .on(t.guestId)
      .where(sql`${t.eventId} is null and ${t.guestId} is not null`),
    check("rsvps_answer_ck", inList(t.answer, RSVP_ANSWERS)),
    check("rsvps_seats_ck", sql`${t.seats} >= 0`),
  ],
);

export const checkins = sqliteTable(
  "checkins",
  {
    id: id(),
    guestId: text("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }),
    scannedBy: text("scanned_by").references(() => profiles.id, { onDelete: "set null" }),
    seatsIn: integer("seats_in").notNull().default(1),
    scannedAt: createdAt(),
  },
  (t) => [
    uniqueIndex("checkins_guest_event_uq")
      .on(t.guestId, t.eventId)
      .where(sql`${t.eventId} is not null`),
    uniqueIndex("checkins_guest_all_uq")
      .on(t.guestId)
      .where(sql`${t.eventId} is null`),
  ],
);

export const wishes = sqliteTable(
  "wishes",
  {
    id: id(),
    invitationId: text("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    guestId: text("guest_id").references(() => guests.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    message: text("message"),
    audioKey: text("audio_key"), // vœu vocal (V3)
    isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("wishes_invitation_idx").on(t.invitationId, t.createdAt)],
);

export const media = sqliteTable(
  "media",
  {
    id: id(),
    ownerId: text("owner_id").references(() => profiles.id, { onDelete: "set null" }),
    invitationId: text("invitation_id").references(() => invitations.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["photo", "musique", "video", "recu", "audio"] }).notNull(),
    r2Key: text("r2_key").notNull().unique(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    uploadedByGuest: integer("uploaded_by_guest", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("media_invitation_idx").on(t.invitationId)],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1 à 5
    text: text("text"),
    screenshotKey: text("screenshot_key"),
    consentToPublish: integer("consent_to_publish", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [check("reviews_rating_ck", sql`${t.rating} between 1 and 5`)],
);

export const activityLog = sqliteTable(
  "activity_log",
  {
    id: id(),
    actorId: text("actor_id").references(() => profiles.id, { onDelete: "set null" }),
    action: text("action").notNull(), // ex. payment.validate, invitation.publish
    entity: text("entity").notNull(), // nom de table
    entityId: text("entity_id").notNull(),
    details: text("details", { mode: "json" }).$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index("activity_entity_idx").on(t.entity, t.entityId)],
);

/* ------------------------------------------------------------------ */
/* Relations (pour les requêtes Drizzle `with`)                        */
/* ------------------------------------------------------------------ */

export const profilesRelations = relations(profiles, ({ many, one }) => ({
  orders: many(orders, { relationName: "customer" }),
  invitations: many(invitations),
  partnerCode: one(promoCodes, { fields: [profiles.partnerCodeId], references: [promoCodes.id] }),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  orders: many(orders),
  invitations: many(invitations),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(profiles, {
    fields: [orders.customerId],
    references: [profiles.id],
    relationName: "customer",
  }),
  assignee: one(profiles, { fields: [orders.assignedTo], references: [profiles.id] }),
  template: one(templates, { fields: [orders.templateId], references: [templates.id] }),
  promoCode: one(promoCodes, { fields: [orders.promoCodeId], references: [promoCodes.id] }),
  payments: many(payments),
  invitation: one(invitations),
  review: one(reviews),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one, many }) => ({
  order: one(orders, { fields: [invitations.orderId], references: [orders.id] }),
  owner: one(profiles, { fields: [invitations.ownerId], references: [profiles.id] }),
  template: one(templates, { fields: [invitations.templateId], references: [templates.id] }),
  events: many(events),
  guests: many(guests),
  rsvps: many(rsvps),
  wishes: many(wishes),
  media: many(media),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  invitation: one(invitations, { fields: [events.invitationId], references: [invitations.id] }),
  rsvps: many(rsvps),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  invitation: one(invitations, { fields: [guests.invitationId], references: [invitations.id] }),
  rsvps: many(rsvps),
  checkins: many(checkins),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  invitation: one(invitations, { fields: [rsvps.invitationId], references: [invitations.id] }),
  guest: one(guests, { fields: [rsvps.guestId], references: [guests.id] }),
  event: one(events, { fields: [rsvps.eventId], references: [events.id] }),
}));

export const checkinsRelations = relations(checkins, ({ one }) => ({
  guest: one(guests, { fields: [checkins.guestId], references: [guests.id] }),
  event: one(events, { fields: [checkins.eventId], references: [events.id] }),
}));

export const wishesRelations = relations(wishes, ({ one }) => ({
  invitation: one(invitations, { fields: [wishes.invitationId], references: [invitations.id] }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  invitation: one(invitations, { fields: [media.invitationId], references: [invitations.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
}));

/* ------------------------------------------------------------------ */
/* Types d'insertion / lecture                                         */
/* ------------------------------------------------------------------ */

export type Template = typeof templates.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Rsvp = typeof rsvps.$inferSelect;
