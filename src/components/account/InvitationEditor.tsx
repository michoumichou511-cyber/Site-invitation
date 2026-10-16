"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import {
  addInvitationPhoto,
  removeInvitationPhoto,
  updateInvitation,
} from "@/actions/client/updateInvitation";
import { dataUrlToFile, toOrderDraft, type WizardDraft } from "@/components/order/draft";
import {
  BilingualField,
  Choice,
  Field,
  ghostBtn,
  inputClass,
  primaryBtn,
  secondaryBtn,
  TextField,
  Toggle,
} from "@/components/order/fields";
import { compressPhoto } from "@/components/order/image";
import { previewViewModel } from "@/components/order/preview";
import { PROGRAM_TYPES } from "@/db/schema";
import { useRouter } from "@/i18n/navigation";
import { formatHijri } from "@/invitation/engine/dates";
import type { Dicts } from "@/invitation/engine/i18n";
import { InvitationApp } from "@/invitation/engine/InvitationApp";
import { THEMES } from "@/invitation/themes";
import { algiersToUtc } from "@/lib/orders/draft";

export type EditorState = WizardDraft & {
  eventIds: (string | null)[];
  rsvpOpen: boolean;
  rsvpDeadline: string;
  allowGenericLink: boolean;
  musicSrc: string | null;
};

/** Modifier l'invitation avec aperçu en direct (même éditeur pour le client et l'admin). */
export function InvitationEditor({
  invitationId,
  initial,
  dicts,
}: {
  invitationId: string;
  initial: EditorState;
  dicts: Dicts;
}) {
  const t = useTranslations("account.edit");
  const o = useTranslations("order");
  const locale = useLocale() as "fr" | "ar";
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const update = (p: Partial<EditorState>) => setS((cur) => ({ ...cur, ...p }));
  const labels = { fr: o("inFrench"), ar: o("inArabic") };
  const theme = THEMES[s.templateSlug]?.theme;

  const vm = useMemo(() => previewViewModel(s, locale, s.musicSrc), [s, locale]);

  const save = () =>
    start(async () => {
      const draft = toOrderDraft(s);
      const r = await updateInvitation({
        invitationId,
        config: draft.config,
        events: s.events.map((e, i) => ({ ...e, id: s.eventIds[i] ?? null })),
        discreet: s.discreet,
        rsvpOpen: s.rsvpOpen,
        rsvpDeadline: s.rsvpDeadline || null,
        allowGenericLink: s.allowGenericLink,
      });
      setMsg(
        r.ok
          ? { ok: true, text: t("saved") }
          : { ok: false, text: r.error === "limit" ? t("limit") : t("error") },
      );
      if (r.ok) router.refresh();
    });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6 pb-28">
        <h1 className="text-[28px] text-cedar">{t("title")}</h1>
        <BilingualField
          label={o("first")}
          labels={labels}
          value={s.names.first}
          maxLength={40}
          onChange={(first) => update({ names: { ...s.names, first } })}
        />
        <BilingualField
          label={o("second")}
          labels={labels}
          value={s.names.second}
          maxLength={40}
          onChange={(second) => update({ names: { ...s.names, second } })}
        />
        <TextField
          label={o("initials")}
          value={s.initials}
          maxLength={5}
          dir="ltr"
          onChange={(initials) => update({ initials })}
        />
        <BilingualField
          label={o("hosts")}
          labels={labels}
          value={s.hosts}
          maxLength={240}
          onChange={(hosts) => update({ hosts })}
        />

        {s.events.map((m, i) => {
          const set = (p: Partial<typeof m>) =>
            update({ events: s.events.map((x, j) => (j === i ? { ...x, ...p } : x)) });
          const hijri =
            /^\d{4}-\d{2}-\d{2}$/.test(m.date) && /^\d{2}:\d{2}$/.test(m.time)
              ? formatHijri(algiersToUtc(m.date, m.time), locale)
              : "";
          return (
            <fieldset key={i} className="space-y-4 rounded-card border border-wall bg-surface p-4">
              <legend className="px-1 font-bold text-cedar">{o("moment", { n: i + 1 })}</legend>
              <Field label={o("momentType")}>
                {(p) => (
                  <select
                    {...p}
                    className={inputClass}
                    value={m.type}
                    onChange={(e) =>
                      set({ type: e.target.value as (typeof PROGRAM_TYPES)[number] })
                    }
                  >
                    {PROGRAM_TYPES.map((p) => (
                      <option key={p} value={p}>
                        {o(`programTypes.${p}`)}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <BilingualField
                label={o("momentTitle")}
                labels={labels}
                value={m.title}
                maxLength={60}
                onChange={(title) => set({ title })}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label={o("date")}
                  type="date"
                  value={m.date}
                  onChange={(date) => set({ date })}
                />
                <TextField
                  label={o("time")}
                  type="time"
                  value={m.time}
                  onChange={(time) => set({ time })}
                />
              </div>
              {hijri && (
                <p className="text-sm text-ink-soft">{o("hijriPreview", { date: hijri })}</p>
              )}
              <TextField
                label={o("venue")}
                value={m.venueName}
                maxLength={120}
                onChange={(venueName) => set({ venueName })}
              />
              <TextField
                label={o("address")}
                value={m.address}
                maxLength={200}
                onChange={(address) => set({ address })}
              />
              <TextField
                label={o("mapsUrl")}
                help={o("mapsHelp")}
                type="url"
                dir="ltr"
                value={m.mapsUrl}
                onChange={(mapsUrl) => set({ mapsUrl })}
              />
              {s.events.length > 1 && (
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={() =>
                    update({
                      events: s.events.filter((_, j) => j !== i),
                      eventIds: s.eventIds.filter((_, j) => j !== i),
                    })
                  }
                >
                  {o("removeMoment")}
                </button>
              )}
            </fieldset>
          );
        })}
        {s.events.length < 6 && (
          <button
            type="button"
            className={secondaryBtn}
            onClick={() =>
              update({
                events: [
                  ...s.events,
                  {
                    ...s.events[s.events.length - 1],
                    type: "henne",
                    title: { fr: o("programTypes.henne"), ar: "" },
                  },
                ],
                eventIds: [...s.eventIds, null],
              })
            }
          >
            {o("addMoment")}
          </button>
        )}

        <Toggle
          label={o("basmala")}
          checked={s.basmala}
          onChange={(basmala) => update({ basmala })}
        />
        <Choice
          legend={o("verse")}
          options={[
            { value: "none", label: o("verseNone") },
            { value: "ar-rum-30-21", label: o("verseRum") },
          ]}
          value={s.verse ?? "none"}
          onChange={(v) => update({ verse: v === "none" ? null : "ar-rum-30-21" })}
        />
        <fieldset className="space-y-3">
          <legend className="font-bold">{o("program")}</legend>
          {s.program.map((p, i) => {
            const set = (patch: Partial<typeof p>) =>
              update({ program: s.program.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            return (
              <div key={i} className="space-y-3 rounded-card border border-wall bg-surface p-4">
                <TextField
                  label={o("programTime")}
                  type="time"
                  value={p.time}
                  onChange={(time) => set({ time })}
                />
                <BilingualField
                  label={o("programTitle")}
                  labels={labels}
                  value={p.title}
                  maxLength={60}
                  onChange={(title) => set({ title })}
                />
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={() => update({ program: s.program.filter((_, j) => j !== i) })}
                >
                  {o("removeProgram")}
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className={secondaryBtn}
            onClick={() =>
              update({ program: [...s.program, { time: "20:00", title: { fr: "", ar: "" } }] })
            }
          >
            {o("addProgram")}
          </button>
        </fieldset>
        <TextField
          label={o("contactPhone")}
          type="tel"
          dir="ltr"
          value={s.contactPhone}
          onChange={(contactPhone) => update({ contactPhone })}
        />

        <Toggle
          label={o("discreet")}
          help={o("discreetHelp")}
          checked={s.discreet}
          onChange={(discreet) => update({ discreet })}
        />
        {!s.discreet && (
          <fieldset className="space-y-3">
            <legend className="font-bold">{t("photos")}</legend>
            <div className="grid grid-cols-3 gap-3">
              {s.photos.map((src) => (
                <div key={src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- photos WebP déjà optimisées */}
                  <img
                    src={src}
                    alt=""
                    className="aspect-[3/4] w-full rounded-t-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={o("removePhoto")}
                    className="absolute end-1 top-1 grid size-12 place-items-center rounded-full bg-surface/90 text-danger"
                    onClick={() =>
                      start(async () => {
                        await removeInvitationPhoto(invitationId, src);
                        update({ photos: s.photos.filter((p) => p !== src) });
                      })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <label className={`${secondaryBtn} cursor-pointer`}>
              {o("addPhoto")}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  start(async () => {
                    const form = new FormData();
                    form.set("invitationId", invitationId);
                    form.set("photo", await dataUrlToFile(await compressPhoto(file), "photo"));
                    await addInvitationPhoto(form);
                    router.refresh();
                  });
                }}
              />
            </label>
          </fieldset>
        )}

        {theme && Object.keys(theme.palettes).length > 1 && (
          <Choice
            legend={o("palette")}
            options={Object.keys(theme.palettes).map((p) => ({
              value: p,
              label: o.has(`palettes.${p}`) ? o(`palettes.${p}`) : p,
            }))}
            value={s.variant || theme.defaultPalette}
            onChange={(variant) => update({ variant })}
          />
        )}

        <fieldset className="space-y-3 rounded-card border border-wall bg-surface p-4">
          <legend className="px-1 font-bold">{t("rsvp")}</legend>
          <Toggle
            label={t("rsvpOpen")}
            checked={s.rsvpOpen}
            onChange={(rsvpOpen) => update({ rsvpOpen })}
          />
          <Toggle
            label={t("generic")}
            checked={s.allowGenericLink}
            onChange={(allowGenericLink) => update({ allowGenericLink })}
          />
          <TextField
            label={t("deadline")}
            type="date"
            value={s.rsvpDeadline}
            onChange={(rsvpDeadline) => update({ rsvpDeadline })}
          />
          <TextField
            label={o("seats")}
            help={o("seatsHelp")}
            type="number"
            min={1}
            max={20}
            value={String(s.genericMaxSeats)}
            onChange={(v) => update({ genericMaxSeats: Math.min(20, Math.max(1, Number(v) || 1)) })}
          />
        </fieldset>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-wall bg-bg/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 pe-16 md:pe-0">
            <button className={`${primaryBtn} flex-1`} disabled={pending} onClick={save}>
              {pending ? t("saving") : t("save")}
            </button>
            <button
              className={`${secondaryBtn} lg:hidden`}
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? t("hidePreview") : t("preview")}
            </button>
            {msg && (
              <p
                role="status"
                className={`w-full font-bold ${msg.ok ? "text-zellige" : "text-danger"}`}
              >
                {msg.text}
              </p>
            )}
          </div>
        </div>
      </div>

      <aside
        className={`${showPreview ? "fixed inset-0 z-30 overflow-auto bg-bg pb-24" : "hidden"} lg:sticky lg:top-20 lg:block lg:h-[calc(100dvh-6rem)]`}
      >
        <p className="p-2 text-center text-sm text-ink-soft">{t("preview")}</p>
        <div className="relative mx-auto h-[min(760px,calc(100%-2rem))] w-[360px] max-w-full [transform:translateZ(0)] overflow-auto rounded-[32px] border-8 border-[#2B140A]">
          {vm && THEMES[s.templateSlug] && (
            <InvitationApp
              key={JSON.stringify(s.languages)}
              vm={{ ...vm, preview: false, rsvp: { kind: "preview" } }}
              theme={THEMES[s.templateSlug].theme}
              dicts={dicts}
              embedded
            />
          )}
        </div>
      </aside>
    </div>
  );
}
