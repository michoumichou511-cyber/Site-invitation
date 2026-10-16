"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Dicts } from "@/invitation/engine/i18n";
import { InvitationApp } from "@/invitation/engine/InvitationApp";
import { THEMES } from "@/invitation/themes";
import { getMusicFile, useDraft } from "./draft";
import { previewViewModel } from "./preview";
import { primaryBtn, secondaryBtn } from "./fields";

/** Aperçu plein écran avec filigrane, construit sur le téléphone depuis le brouillon. */
export function PreviewClient({ dicts }: { dicts: Dicts }) {
  const t = useTranslations("order");
  const locale = useLocale() as "fr" | "ar";
  const { draft } = useDraft();
  const [musicSrc] = useState<string | null>(() => {
    const f = typeof window === "undefined" ? null : getMusicFile();
    return f ? URL.createObjectURL(f) : null;
  });
  useEffect(() => () => void (musicSrc && URL.revokeObjectURL(musicSrc)), [musicSrc]);

  const vm = useMemo(
    () => (draft ? previewViewModel(draft, locale, musicSrc) : null),
    [draft, locale, musicSrc],
  );
  if (draft === undefined) return <div className="min-h-dvh" aria-busy="true" />;
  if (!draft || !vm) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p>{t("previewEmpty")}</p>
        <Link href="/commander" className={`${primaryBtn} mt-6`}>
          {t("title")}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <h1 className="sr-only">{t("previewTitle")}</h1>
      <InvitationApp vm={vm} theme={THEMES[draft.templateSlug].theme} dicts={dicts} embedded />
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-wall bg-bg/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Link href="/commander" className={`${secondaryBtn} flex-1`}>
            {t("previewEdit")}
          </Link>
          <Link href="/commander/pack" className={`${primaryBtn} flex-[2]`}>
            {t("previewChoose")}
          </Link>
        </div>
      </div>
    </div>
  );
}
