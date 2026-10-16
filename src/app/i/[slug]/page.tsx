import type { Metadata } from "next";
import { invitationMetadata } from "@/invitation/server/metadata";
import { renderInvitation } from "@/invitation/server/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return invitationMetadata(slug);
}

export default async function InvitationPage({ params, searchParams }: PageProps<"/i/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return renderInvitation({
    slug,
    code: null,
    lang: typeof sp.lang === "string" ? sp.lang : undefined,
  });
}
