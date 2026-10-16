import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default {
  ...defineCloudflareConfig({ incrementalCache: r2IncrementalCache }),
  // `pnpm build` lance lui-même OpenNext sur Cloudflare : OpenNext appelle donc Next directement.
  buildCommand: "npx next build",
};
