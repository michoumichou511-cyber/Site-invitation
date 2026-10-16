import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { getSession } from "./server";

export type Viewer = {
  userId: string;
  email: string;
  profileId: string | null;
  role: "client" | "admin";
  twoFactorEnabled: boolean;
};

/** Utilisateur connecté avec son profil métier (rôle), ou null. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await getSession();
  if (!session) return null;
  const db = await getDb();
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
    columns: { id: true, role: true },
  });
  return {
    userId: session.user.id,
    email: session.user.email,
    profileId: profile?.id ?? null,
    role: profile?.role ?? "client",
    twoFactorEnabled: Boolean(
      (session.user as { twoFactorEnabled?: boolean | null }).twoFactorEnabled,
    ),
  };
});
