import { getTranslations } from "next-intl/server";
import type { OrderStatus } from "@/lib/orders/status";

const STYLE: Record<OrderStatus, [string, string]> = {
  nouvelle: ["bg-sea-light/50 text-ink", "●"],
  paiement_en_attente: ["bg-coral/40 text-ink", "⏳"],
  payee: ["bg-zellige text-white", "✓"],
  en_creation: ["bg-brass/60 text-ink", "✎"],
  livree: ["bg-sea text-white", "★"],
  terminee: ["bg-wall text-ink", "■"],
  annulee: ["bg-danger text-white", "✕"],
};

/** Statut : couleur + icône + mot (jamais la couleur seule). */
export async function StatusBadge({ status }: { status: OrderStatus }) {
  const t = await getTranslations("order");
  const [cls, icon] = STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold whitespace-nowrap ${cls}`}
    >
      <span aria-hidden="true">{icon}</span>
      {t(`statuses.${status}`)}
    </span>
  );
}
