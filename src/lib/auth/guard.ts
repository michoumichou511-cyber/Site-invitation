import "server-only";
import { redirect } from "next/navigation";
import { getViewer, type Viewer } from "./viewer";

/** Page admin : connecté, rôle admin et double authentification activée. */
export async function requireAdminPage(locale: string): Promise<Viewer & { profileId: string }> {
  const viewer = await getViewer();
  if (!viewer || viewer.role !== "admin" || !viewer.profileId)
    redirect(`/${locale}/admin/connexion`);
  if (!viewer.twoFactorEnabled) redirect(`/${locale}/admin/2fa`);
  return viewer as Viewer & { profileId: string };
}

export class ForbiddenError extends Error {}

/** Server Action admin : même règle, sans redirection. */
export async function requireAdmin(): Promise<Viewer & { profileId: string }> {
  const viewer = await getViewer();
  if (!viewer || viewer.role !== "admin" || !viewer.profileId || !viewer.twoFactorEnabled) {
    throw new ForbiddenError("admin");
  }
  return viewer as Viewer & { profileId: string };
}
