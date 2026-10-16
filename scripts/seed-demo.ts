/**
 * Génère le SQL des invitations de démonstration (modèles du catalogue + démos).
 *   pnpm db:seed:local   /   pnpm db:seed:remote
 * Rejouable : met à jour sans effacer les réponses déjà reçues.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { DEMO_BASE_DATE, DEMOS } from "../src/invitation/demos.ts";

const q = (v: unknown) =>
  v === null || v === undefined
    ? "NULL"
    : typeof v === "number"
      ? String(v)
      : typeof v === "boolean"
        ? v
          ? "1"
          : "0"
        : `'${(typeof v === "string" ? v : JSON.stringify(v)).replace(/'/g, "''")}'`;

const lines: string[] = [];
for (const demo of DEMOS) {
  const t = demo.template;
  const templateId = `tpl-${t.slug}`;
  const orderId = `order-${demo.slug}`;
  const invitationId = `inv-${demo.slug}`;

  lines.push(
    `INSERT INTO templates (id, slug, name, description, event_types, style, tags, preview_image, base_price_da, badges, is_active, sort_order)
VALUES (${[templateId, t.slug, t.name, t.description, t.eventTypes, t.style, t.tags, `/themes/${t.slug}/preview.svg`, t.basePriceDa, t.badges, true, t.sortOrder].map(q).join(", ")})
ON CONFLICT(slug) DO UPDATE SET name = excluded.name, description = excluded.description, event_types = excluded.event_types, style = excluded.style, tags = excluded.tags, preview_image = excluded.preview_image, base_price_da = excluded.base_price_da, badges = excluded.badges, sort_order = excluded.sort_order;`,
    `INSERT OR IGNORE INTO orders (id, tracking_code, contact_name, contact_whatsapp, template_id, pack, amount_da, status, source)
VALUES (${[orderId, `DEMO-${t.slug.toUpperCase()}`, "Démo", "+213000000000", templateId, "premium", 0, "livree", "demo"].map(q).join(", ")});`,
    `INSERT INTO invitations (id, order_id, template_id, slug, event_type, config, languages, is_published, published_at)
VALUES (${[invitationId, orderId, templateId, demo.slug, demo.eventType, demo.config, ["fr", "ar"], true, DEMO_BASE_DATE].map(q).join(", ")})
ON CONFLICT(slug) DO UPDATE SET config = excluded.config, event_type = excluded.event_type, is_published = 1, rsvp_open = 1, expires_at = NULL;`,
  );
  demo.events.forEach((e, i) => {
    const start = DEMO_BASE_DATE + e.offsetMinutes * 60_000;
    lines.push(
      `INSERT INTO events (id, invitation_id, type, title, starts_at, ends_at, venue_name, address, lat_e6, lng_e6, sort_order)
VALUES (${[e.id, invitationId, e.type, e.title, start, start + e.durationMinutes * 60_000, e.venueName, e.address, e.lat, e.lng, i].map(q).join(", ")})
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, starts_at = excluded.starts_at, ends_at = excluded.ends_at, venue_name = excluded.venue_name, address = excluded.address, lat_e6 = excluded.lat_e6, lng_e6 = excluded.lng_e6, sort_order = excluded.sort_order;`,
    );
  });
  for (const g of demo.guests) {
    lines.push(
      `INSERT INTO guests (id, invitation_id, name, max_seats, code, locale)
VALUES (${[g.id, invitationId, g.name, g.maxSeats, g.code, g.locale].map(q).join(", ")})
ON CONFLICT(id) DO UPDATE SET name = excluded.name, max_seats = excluded.max_seats, locale = excluded.locale;`,
    );
  }
}

const out = process.argv[2] ?? ".wrangler/seed-demo.sql";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n") + "\n");
console.log(`SQL des démos écrit dans ${out}`);
