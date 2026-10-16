import { randomCode } from "@/invitation/engine/codes";

/** Code de suivi montré au client, ex. LLA-7K2Q9M. */
export const trackingCode = () => `LLA-${randomCode(6).toUpperCase()}`;

export const TRACKING_RE = /^LLA-[A-Z2-9]{6}$/;

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);

/** Slug d'invitation lisible mais non séquentiel : amine-sara-k7q2. */
export function invitationSlug(names: string[]) {
  const base = names.map(slugify).filter(Boolean).join("-") || "invitation";
  return `${base}-${randomCode(4)}`;
}
