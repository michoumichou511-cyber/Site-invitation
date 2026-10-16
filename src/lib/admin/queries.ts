import "server-only";
import { and, count, desc, eq, gte, inArray, lt, sql, sum } from "drizzle-orm";
import type { Db } from "@/db";
import {
  activityLog,
  invitations,
  media,
  orders,
  payments,
  profiles,
  templates,
} from "@/db/schema";

const startOfDay = () => {
  const d = new Date();
  d.setUTCHours(-1, 0, 0, 0); // minuit à Alger (UTC+1)
  return d.getTime() > Date.now() ? new Date(d.getTime() - 86_400_000) : d;
};

export async function dashboardStats(db: Db) {
  const now = new Date();
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [[today], [revenue], [late], [toCheck], top] = await Promise.all([
    db.select({ n: count() }).from(orders).where(gte(orders.createdAt, startOfDay())),
    db
      .select({ total: sum(payments.amountDa) })
      .from(payments)
      .where(and(eq(payments.status, "valide"), gte(payments.validatedAt, month))),
    db
      .select({ n: count() })
      .from(orders)
      .where(and(inArray(orders.status, ["payee", "en_creation"]), lt(orders.dueAt, now))),
    db.select({ n: count() }).from(payments).where(eq(payments.status, "en_attente")),
    db
      .select({ name: templates.name, n: count() })
      .from(orders)
      .innerJoin(templates, eq(templates.id, orders.templateId))
      .where(inArray(orders.status, ["payee", "en_creation", "livree", "terminee"]))
      .groupBy(templates.id)
      .orderBy(desc(count()))
      .limit(5),
  ]);
  return {
    today: today.n,
    revenue: Number(revenue.total ?? 0),
    late: late.n,
    toCheck: toCheck.n,
    top,
  };
}

export async function listOrders(db: Db, status?: (typeof orders.$inferSelect)["status"]) {
  return db
    .select({ order: orders, templateName: templates.name })
    .from(orders)
    .innerJoin(templates, eq(templates.id, orders.templateId))
    .where(
      and(
        status ? eq(orders.status, status) : undefined,
        sql`coalesce(${orders.source}, '') != 'demo'`,
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(200);
}

export async function orderDetail(db: Db, id: string) {
  const row = await db
    .select({ order: orders, invitation: invitations, template: templates })
    .from(orders)
    .innerJoin(invitations, eq(invitations.orderId, orders.id))
    .innerJoin(templates, eq(templates.id, orders.templateId))
    .where(eq(orders.id, id))
    .get();
  if (!row) return null;
  const [pays, history, assignee] = await Promise.all([
    db.select().from(payments).where(eq(payments.orderId, id)).orderBy(desc(payments.createdAt)),
    db
      .select({ log: activityLog, actor: profiles.fullName })
      .from(activityLog)
      .leftJoin(profiles, eq(profiles.id, activityLog.actorId))
      .where(
        sql`${activityLog.entityId} in (${id}, ${row.invitation.id}) or json_extract(${activityLog.details}, '$.orderId') = ${id}`,
      )
      .orderBy(desc(activityLog.createdAt))
      .limit(50),
    row.order.assignedTo
      ? db.query.profiles.findFirst({ where: eq(profiles.id, row.order.assignedTo) })
      : null,
  ]);
  return { ...row, payments: pays, history, assignee: assignee ?? null };
}

export async function pendingPayments(db: Db) {
  return db
    .select({ payment: payments, order: orders, templateName: templates.name })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .innerJoin(templates, eq(templates.id, orders.templateId))
    .where(eq(payments.status, "en_attente"))
    .orderBy(payments.createdAt);
}

export async function recentPayments(db: Db) {
  return db
    .select({ payment: payments, order: orders })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(inArray(payments.status, ["valide", "refuse"]))
    .orderBy(desc(payments.validatedAt))
    .limit(20);
}

export async function listClients(db: Db) {
  return db
    .select({
      name: orders.contactName,
      whatsapp: orders.contactWhatsapp,
      email: sql<string | null>`max(${orders.contactEmail})`,
      n: count(),
      last: sql<number>`max(${orders.createdAt})`,
      lastId: sql<string>`max(${orders.id})`,
    })
    .from(orders)
    .where(sql`coalesce(${orders.source}, '') != 'demo'`)
    .groupBy(orders.contactWhatsapp)
    .orderBy(desc(sql`max(${orders.createdAt})`))
    .limit(300);
}

export async function listMusic(db: Db) {
  return db
    .select()
    .from(media)
    .where(eq(media.kind, "musique"))
    .orderBy(desc(media.createdAt))
    .limit(100);
}
