import { defineConfig } from "drizzle-kit";

// `out` = `migrations_dir` de wrangler.jsonc : Wrangler applique les mêmes fichiers SQL.
export default defineConfig({
  dialect: "sqlite",
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
  out: "./drizzle",
});
