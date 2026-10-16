import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = {
  // Pas de cache de pages : toutes les pages lisent D1 à chaque visite.
  ...defineCloudflareConfig(),
  // `pnpm build` lance lui-même OpenNext sur Cloudflare : OpenNext appelle donc Next directement.
  buildCommand: "npx next build",
};

export default config;
