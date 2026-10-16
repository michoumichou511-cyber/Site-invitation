// Utilisé uniquement par le CLI Better Auth pour générer src/db/auth-schema.ts :
//   pnpm auth:generate
import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { authOptions } from "./src/lib/auth/options";

export const auth = betterAuth({
  ...authOptions(async () => {}),
  database: drizzleAdapter(drizzle(new Database(":memory:")), { provider: "sqlite" }),
});
