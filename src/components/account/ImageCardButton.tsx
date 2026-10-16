"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { secondaryBtn } from "@/components/order/fields";
import { translator, type Dicts } from "@/invitation/engine/i18n";
import { renderImageCard } from "@/invitation/engine/imageCard";
import type { InvitationViewModel } from "@/invitation/engine/types";
import { THEMES } from "@/invitation/themes";

/** Télécharge la « version image » (carte PNG + QR) de l'invitation. */
export function ImageCardButton({
  vm,
  link,
  dicts,
}: {
  vm: InvitationViewModel;
  link: string;
  dicts: Dicts;
}) {
  const t = useTranslations("account");
  const locale = useLocale() as "fr" | "ar";
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const theme = THEMES[vm.theme]?.theme;
  if (!theme) return null;
  const ti = translator(dicts, locale);
  return (
    <div ref={ref} className="space-y-2 rounded-card bg-surface p-4">
      <p className="font-bold">{ti("imageCard")}</p>
      <p className="text-sm text-ink-soft">{ti("imageCardHelp")}</p>
      <button
        type="button"
        className={`${secondaryBtn} w-full`}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const css = getComputedStyle(ref.current!);
            const v = (name: string, fallback: string) =>
              css.getPropertyValue(name).trim() || fallback;
            const lang = vm.languages.includes(locale) ? locale : vm.languages[0];
            const blob = await renderImageCard({
              vm,
              theme,
              lang,
              link,
              t: translator(dicts, lang),
              fonts: {
                display: v("--font-marcellus", "Georgia, serif"),
                body: v("--font-tajawal", "sans-serif"),
                script:
                  lang === "ar" ? v("--font-aref-ruqaa", "serif") : v("--font-pinyon", "cursive"),
              },
            });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `invitation-${vm.slug}.png`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 2000);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? t("edit.saving") : ti("imageCardDownload")}
      </button>
    </div>
  );
}
