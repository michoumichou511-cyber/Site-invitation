import type { Metadata } from "next";
import { invitationMetadata } from "@/invitation/server/metadata";
import { renderInvitation } from "@/invitation/server/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/i/[slug]/[code]">): Promise<Metadata> {
  const { slug } = await params;
  return invitationMetadata(slug);
}

export default async function GuestInvitationPage({
  params,
  searchParams,
}: PageProps<"/i/[slug]/[code]">) {
  const [{ slug, code }, sp] = await Promise.all([params, searchParams]);
  return renderInvitation({ slug, code, lang: typeof sp.lang === "string" ? sp.lang : undefined });
}
