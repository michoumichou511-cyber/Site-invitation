"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { moderateWish } from "@/actions/client/answers";
import { secondaryBtn } from "@/components/order/fields";
import { useRouter } from "@/i18n/navigation";

export function WishesList({
  invitationId,
  wishes,
}: {
  invitationId: string;
  wishes: { id: string; name: string; message: string; approved: boolean }[];
}) {
  const t = useTranslations("account.wishes");
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="space-y-4">
      <h1 className="text-[28px] text-cedar">{t("title")}</h1>
      {wishes.length === 0 && (
        <p className="rounded-card bg-surface p-6 text-ink-soft">{t("empty")}</p>
      )}
      <ul className="space-y-2">
        {wishes.map((w) => (
          <li
            key={w.id}
            className={`flex flex-wrap items-start justify-between gap-3 rounded-card bg-surface p-4 ${w.approved ? "" : "opacity-60"}`}
          >
            <span>
              <b>{w.name}</b>
              {!w.approved && <span className="ms-2 text-sm text-danger">{t("hidden")}</span>}
              <span className="block whitespace-pre-line">{w.message}</span>
            </span>
            <button
              className={secondaryBtn}
              disabled={pending}
              onClick={() =>
                start(
                  async () =>
                    void (await moderateWish(invitationId, w.id, !w.approved), router.refresh()),
                )
              }
            >
              {w.approved ? t("hide") : t("show")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
