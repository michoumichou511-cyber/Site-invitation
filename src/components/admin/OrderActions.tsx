"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { publishInvitation } from "@/actions/admin/publishInvitation";
import { updateOrder } from "@/actions/admin/updateOrder";
import { inputClass, primaryBtn, secondaryBtn } from "@/components/order/fields";
import { useRouter } from "@/i18n/navigation";
import type { OrderStatus } from "@/lib/orders/status";

export function OrderActions({
  orderId,
  status,
  nextStatuses,
  notes,
  canPublish,
  published,
}: {
  orderId: string;
  status: OrderStatus;
  nextStatuses: OrderStatus[];
  notes: string;
  canPublish: boolean;
  published: boolean;
}) {
  const t = useTranslations("admin.order");
  const o = useTranslations("order");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [next, setNext] = useState<OrderStatus | "">(nextStatuses[0] ?? "");
  const [text, setText] = useState(notes);
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState<{
    link: string;
    loginLink: string | null;
    whatsapp: string;
    qr: string;
  } | null>(null);

  const run = (fn: () => Promise<{ ok: boolean }>) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? t("saved") : t("error"));
      router.refresh();
    });

  return (
    <div className="space-y-6">
      {nextStatuses.length > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 space-y-1.5">
            <span className="block font-bold">{t("changeStatus")}</span>
            <select
              className={inputClass}
              value={next}
              onChange={(e) => setNext(e.target.value as OrderStatus)}
            >
              {nextStatuses.map((s) => (
                <option key={s} value={s}>
                  {o(`statuses.${s}`)}
                </option>
              ))}
            </select>
          </label>
          <button
            className={secondaryBtn}
            disabled={pending || !next}
            onClick={() =>
              next && run(() => updateOrder({ kind: "status", orderId, status: next }))
            }
          >
            {t("apply")}
          </button>
        </div>
      )}
      <button
        className={secondaryBtn}
        disabled={pending}
        onClick={() => run(() => updateOrder({ kind: "assign", orderId }))}
      >
        {t("assign")}
      </button>
      <label className="block space-y-1.5">
        <span className="block font-bold">{t("notes")}</span>
        <textarea
          className={`${inputClass} min-h-28 py-2`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={4000}
        />
      </label>
      <button
        className={secondaryBtn}
        disabled={pending}
        onClick={() => run(() => updateOrder({ kind: "notes", orderId, notes: text }))}
      >
        {t("saveNotes")}
      </button>

      {canPublish && (
        <div className="space-y-3 rounded-card border-2 border-sea bg-surface p-4">
          <p className="text-ink-soft">{t("publishHelp")}</p>
          <button
            className={`${primaryBtn} w-full`}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await publishInvitation(orderId);
                if (!r.ok) return setMsg(t("error"));
                const QR = await import("qrcode");
                setResult({ ...r, qr: await QR.toDataURL(r.link, { margin: 1, width: 220 }) });
                setMsg(t("publishDone"));
                router.refresh();
              })
            }
          >
            {published ? `${t("publish")} ↻` : t("publish")}
          </button>
        </div>
      )}
      {result && (
        <div className="space-y-3 rounded-card bg-surface p-4">
          <a
            href={result.whatsapp}
            target="_blank"
            rel="noopener"
            className="flex min-h-12 items-center justify-center rounded-full bg-whatsapp px-4 font-bold text-white"
          >
            {t("sendWhatsapp")}
          </a>
          <p className="text-sm break-all" dir="ltr">
            <a href={result.link} className="text-sea underline">
              {result.link}
            </a>
          </p>
          {result.loginLink && (
            <p className="text-sm break-all">
              {t("loginLink")} : <span dir="ltr">{result.loginLink}</span>
            </p>
          )}
          <p className="font-bold">{t("qr")}</p>
          <a href={result.qr} download="invitation-qr.png">
            {/* eslint-disable-next-line @next/next/no-img-element -- QR généré */}
            <img src={result.qr} alt={t("qr")} width={220} height={220} />
          </a>
        </div>
      )}
      {msg && (
        <p role="status" className="font-bold text-zellige">
          {msg}
        </p>
      )}
      {status === "annulee" && null}
    </div>
  );
}
