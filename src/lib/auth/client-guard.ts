import "server-only";
import { notFound, redirect } from "next/navigation";
import { getOwnedInvitation } from "./access";
import { getViewer } from "./viewer";

/** Page de l'espace client : connecté avec un profil, sinon page de connexion. */
export async function requireClientPage(locale: string) {
  const viewer = await getViewer();
  if (!viewer?.profileId) redirect(`/${locale}/connexion`);
  return viewer as typeof viewer & { profileId: string };
}

/** Invitation de l'espace client : la sienne (ou admin), sinon 404. */
export async function requireOwnedInvitation(locale: string, id: string) {
  await requireClientPage(locale);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const owned = await getOwnedInvitation(id);
  if (!owned) notFound();
  return owned;
}
