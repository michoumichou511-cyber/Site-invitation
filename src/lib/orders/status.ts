import type { ORDER_STATUSES } from "@/db/schema";

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Transitions autorisées du statut d'une commande (back-office). */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  nouvelle: ["paiement_en_attente", "annulee"],
  paiement_en_attente: ["payee", "nouvelle", "annulee"],
  payee: ["en_creation", "livree", "annulee"],
  en_creation: ["livree", "annulee"],
  livree: ["terminee", "en_creation"],
  terminee: [],
  annulee: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) =>
  NEXT_STATUSES[from].includes(to);

/** Étapes affichées au client sur /suivi. */
export const TRACK_STEPS: OrderStatus[] = [
  "nouvelle",
  "paiement_en_attente",
  "payee",
  "en_creation",
  "livree",
];
