import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/db/schema";
import { purgeExpiredInvitations } from "@/lib/purge";

const DAY = 86_400_000;

function freshDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  for (const f of readdirSync("drizzle")
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    for (const stmt of readFileSync(`drizzle/${f}`, "utf8").split("--> statement-breakpoint"))
      sqlite.exec(stmt);
  }
  return { sqlite, db: drizzle(sqlite, { schema }) };
}

function seed(sqlite: Database.Database, id: string, slug: string, expiresAt: number) {
  sqlite.exec(`
    INSERT OR IGNORE INTO templates (id, slug, name, event_types, style, preview_image, base_price_da) VALUES ('t', 'karakou', '{"fr":"K","ar":"ك"}', '["mariage"]', 'k', 'p', 2500);
    INSERT INTO orders (id, tracking_code, contact_name, contact_whatsapp, template_id, pack, amount_da) VALUES ('o-${id}', 'LLA-${id.toUpperCase()}', 'C', '+213', 't', 'premium', 5000);
    INSERT INTO invitations (id, order_id, template_id, slug, event_type, config, expires_at) VALUES ('${id}', 'o-${id}', 't', '${slug}', 'mariage', '{"gallery":[{"src":"/api/media/public/a.webp"}],"music":{"src":"/api/media/public/m.mp3"}}', ${expiresAt});
    INSERT INTO guests (id, invitation_id, name, code) VALUES ('g-${id}', '${id}', 'Karim', 'code${id.padEnd(6, "x")}');
    INSERT INTO rsvps (invitation_id, guest_id, name, answer, seats, id) VALUES ('${id}', 'g-${id}', 'Karim', 'oui', 2, 'r-${id}');
    INSERT INTO wishes (id, invitation_id, name, message) VALUES ('w-${id}', '${id}', 'Karim', 'Mabrouk');
    INSERT INTO media (id, invitation_id, kind, r2_key, mime_type, size_bytes) VALUES ('m-${id}', '${id}', 'photo', 'public/inv/${id}/a.webp', 'image/webp', 10);
  `);
}

describe("purge des données invités (6 mois après l'événement)", () => {
  let ctx: ReturnType<typeof freshDb>;
  beforeEach(() => {
    ctx = freshDb();
  });

  it("supprime invités, réponses, vœux et fichiers des invitations expirées seulement", async () => {
    const now = Date.now();
    seed(ctx.sqlite, "old", "amine-sara-x1", now - DAY);
    seed(ctx.sqlite, "new", "rayan-ines-x2", now + 30 * DAY);
    const res = await purgeExpiredInvitations(ctx.db, now);
    expect(res).toEqual({ invitations: 1, r2Keys: ["public/inv/old/a.webp"] });
    const count = (table: string, id: string) =>
      (
        ctx.sqlite.prepare(`select count(*) n from ${table} where invitation_id = ?`).get(id) as {
          n: number;
        }
      ).n;
    for (const table of ["guests", "rsvps", "wishes", "media"]) {
      expect(count(table, "old"), table).toBe(0);
      expect(count(table, "new"), table).toBe(1);
    }
    // La commande reste (comptabilité), l'invitation n'a plus de photos ni de musique.
    expect(ctx.sqlite.prepare("select count(*) n from orders").get()).toEqual({ n: 2 });
    const config = JSON.parse(
      (
        ctx.sqlite.prepare("select config from invitations where id = 'old'").get() as {
          config: string;
        }
      ).config,
    );
    expect(config).toEqual({ gallery: [], music: null });
  });

  it("ne touche jamais aux démos et peut être relancée sans effet", async () => {
    seed(ctx.sqlite, "demo", "demo-karakou", Date.now() - 400 * DAY);
    expect((await purgeExpiredInvitations(ctx.db)).invitations).toBe(0);
    seed(ctx.sqlite, "old", "x-x1", Date.now() - DAY);
    await purgeExpiredInvitations(ctx.db);
    expect((await purgeExpiredInvitations(ctx.db)).r2Keys).toEqual([]);
  });
});
