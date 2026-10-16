import type { Metadata, Viewport } from "next";
import { arefRuqaa, marcellus, pinyonScript, tajawalInvitation } from "../fonts";
import "@/invitation/invitation.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Mise en page racine des invitations (langue réglée ensuite par l'invitation). */
export default function InvitationLayout({ children }: LayoutProps<"/i">) {
  return (
    <html
      lang="fr"
      className={`${marcellus.variable} ${tajawalInvitation.variable} ${pinyonScript.variable} ${arefRuqaa.variable}`}
      suppressHydrationWarning
    >
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
