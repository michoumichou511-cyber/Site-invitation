"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateTemplate } from "@/actions/admin/updateTemplate";
import { inputClass, secondaryBtn, Toggle } from "@/components/order/fields";
import { useRouter } from "@/i18n/navigation";

export function TemplateRow({
  tpl,
}: {
  tpl: {
    id: string;
    name: string;
    isActive: boolean;
    basePriceDa: number;
    sortOrder: number;
    badges: ("nouveau" | "populaire")[];
    slug: string;
  };
}) {
  const t = useTranslations("admin.templates");
  const c = useTranslations("common");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setState] = useState(tpl);
  return (
    <form
      className="grid gap-3 rounded-card bg-surface p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await updateTemplate({
            id: state.id,
            isActive: state.isActive,
            basePriceDa: state.basePriceDa,
            sortOrder: state.sortOrder,
            badges: state.badges,
          });
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <p className="text-xl font-bold text-cedar">{state.name}</p>
        <a
          href={`/i/demo-${state.slug}`}
          target="_blank"
          rel="noopener"
          className="text-sea underline"
        >
          {t("preview")}
        </a>
        <Toggle
          label={state.isActive ? t("active") : t("hidden")}
          checked={state.isActive}
          onChange={(isActive) => setState({ ...state, isActive })}
        />
        <div className="flex gap-4">
          {(["nouveau", "populaire"] as const).map((b) => (
            <Toggle
              key={b}
              label={b}
              checked={state.badges.includes(b)}
              onChange={(on) =>
                setState({
                  ...state,
                  badges: on ? [...state.badges, b] : state.badges.filter((x) => x !== b),
                })
              }
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="block space-y-1">
          <span className="block font-bold">{t("price")}</span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={state.basePriceDa}
            onChange={(e) => setState({ ...state, basePriceDa: Number(e.target.value) })}
          />
        </label>
        <label className="block space-y-1">
          <span className="block font-bold">{t("order")}</span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={state.sortOrder}
            onChange={(e) => setState({ ...state, sortOrder: Number(e.target.value) })}
          />
        </label>
        <button className={secondaryBtn} disabled={pending}>
          {t("save")}
        </button>
        <span className="sr-only">{c("brand")}</span>
      </div>
    </form>
  );
}
