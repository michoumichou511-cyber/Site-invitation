import { notFound } from "next/navigation";
import { loadInvitation } from "@/invitation/server/load";
import { invitationDicts } from "@/invitation/server/page";
import { AccessForm } from "./AccessForm";

export const dynamic = "force-dynamic";

/** Invitation protégée : demande le code d'accès donné par la famille. */
export default async function AccessPage({ params }: PageProps<"/i/[slug]/acces">) {
  const { slug } = await params;
  const inv = await loadInvitation(slug);
  if (!inv?.accessCodeHash) notFound();
  return <AccessForm slug={slug} lang={inv.languages[0] ?? "fr"} dicts={invitationDicts} />;
}
