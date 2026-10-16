import type { BaseConfig, I18n, Lang } from "./config";

export type ViewEvent = {
  id: string;
  type: string;
  title: I18n;
  startsAt: number;
  endsAt: number | null;
  venueName: string | null;
  address: string | null;
  mapsUrl: string | null;
  lat: number | null;
  lng: number | null;
};

export type RsvpState =
  | { kind: "open" }
  | { kind: "off" }
  | { kind: "preview" }
  | { kind: "deadline"; deadline: number }
  | { kind: "past" };

export type ViewGuest = { name: string; code: string; maxSeats: number };

export type ViewRsvp = {
  answer: "oui" | "non" | "peut_etre";
  seats: number;
  message: string | null;
  name: string;
};

export type ViewWish = { id: string; name: string; message: string; createdAt: number };

/** Tout ce que le thème reçoit pour s'afficher. Aucune lecture de base dans le thème. */
export type InvitationViewModel<C extends BaseConfig = BaseConfig> = {
  slug: string;
  theme: string;
  eventType: string;
  languages: Lang[];
  defaultLang: Lang;
  config: C;
  events: ViewEvent[];
  guest: ViewGuest | null;
  rsvp: RsvpState;
  existingRsvp: ViewRsvp | null;
  maxSeats: number;
  isPast: boolean;
  preview: boolean;
  discreet: boolean;
  wishes: ViewWish[];
  turnstileSiteKey: string | null;
};
