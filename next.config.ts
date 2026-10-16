import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Images déjà compressées en WebP à l'envoi : pas d'optimisation payante.
  images: { unoptimized: true },
  // Commande : jusqu'à 3 photos (WebP compressées) + une musique MP3 (3 Mo).
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
  async redirects() {
    return [
      { source: "/", destination: "/fr", permanent: false },
      // Démo plein écran d'un modèle du catalogue.
      { source: "/demo/:slug", destination: "/i/demo-:slug", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        // Invitations privées : jamais indexées.
        source: "/i/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

// Donne accès aux bindings Cloudflare (D1, KV) pendant `next dev`.
if (process.env.NODE_ENV === "development") {
  void initOpenNextCloudflareForDev();
}
