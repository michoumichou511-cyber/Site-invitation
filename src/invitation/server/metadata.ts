import "server-only";
import type { Metadata } from "next";
import fr from "../../../messages/fr.json";
import { format } from "../engine/i18n";
import { loadInvitation } from "./load";

/** Titre et aperçu WhatsApp (« Mariage de Amine & Sara »). Jamais indexé. */
export async function invitationMetadata(slug: string): Promise<Metadata> {
  const inv = await loadInvitation(slug);
  const robots = { index: false, follow: false };
  if (!inv) return { robots };
  const names = [inv.config.names.first.fr, inv.config.names.second?.fr]
    .filter(Boolean)
    .join(" & ");
  const titles = fr.invitation.ogTitle as Record<string, string>;
  const title = format(titles[inv.eventType] ?? "{names}", { names });
  return {
    title,
    description: fr.invitation.rsvpCta,
    robots,
    openGraph: { title, description: fr.invitation.rsvpCta, type: "website" },
  };
}
