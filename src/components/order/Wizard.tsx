"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { SITE, waLink } from "@/config/site";
import { PROGRAM_TYPES } from "@/db/schema";
import { useRouter } from "@/i18n/navigation";
import { formatHijri } from "@/invitation/engine/dates";
import { THEMES } from "@/invitation/themes";
import { algiersToUtc, draftEventSchema } from "@/lib/orders/draft";
import {
  autoInitials,
  emptyDraft,
  saveDraft,
  setMusicFile,
  getMusicFile,
  useDraft,
  type EventType,
  type WizardDraft,
} from "./draft";
import {
  BilingualField,
  Choice,
  Field,
  inputClass,
  primaryBtn,
  secondaryBtn,
  ghostBtn,
  TextField,
  Toggle,
} from "./fields";
import { compressPhoto } from "./image";

export type WizardTemplate = {
  slug: string;
  name: { fr: string; ar: string };
  eventTypes: EventType[];
  previewImage: string;
};

const TWO_NAMES: EventType[] = ["mariage", "fiancailles", "khotba", "henne", "tasdira", "walima"];

export function Wizard({
  templates,
  initialModel,
}: {
  templates: WizardTemplate[];
  initialModel?: string;
}) {
  const t = useTranslations("order");
  const ev = useTranslations("events");
  const locale = useLocale() as "fr" | "ar";
  const router = useRouter();
  const { draft, update } = useDraft();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const top = useRef<HTMLDivElement>(null);

  // Premier passage (ou modèle choisi depuis une fiche) : brouillon initialisé.
  useEffect(() => {
    if (draft === undefined) return;
    const model = templates.find((m) => m.slug === initialModel);
    if (!draft) {
      saveDraft(emptyDraft(model?.slug ?? "", model?.eventTypes[0] ?? "mariage"));
    } else if (model && draft.templateSlug !== model.slug) {
      update({
        templateSlug: model.slug,
        eventType: model.eventTypes.includes(draft.eventType)
          ? draft.eventType
          : model.eventTypes[0],
      });
    }
  }, [draft, initialModel, templates, update]);

  if (!draft) return <div className="min-h-[60vh]" aria-busy="true" />;

  const eventTypes = [...new Set(templates.flatMap((m) => m.eventTypes))];
  const models = templates.filter((m) => m.eventTypes.includes(draft.eventType));
  const theme = THEMES[draft.templateSlug]?.theme;
  const req = t("required");

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0 && !models.some((m) => m.slug === draft.templateSlug)) e.model = req;
    if (s === 1) {
      if (!draft.names.first.fr.trim() && !draft.names.first.ar.trim()) e.first = req;
      if (
        TWO_NAMES.includes(draft.eventType) &&
        !draft.names.second.fr.trim() &&
        !draft.names.second.ar.trim()
      )
        e.second = req;
    }
    if (s === 2) {
      draft.events.forEach((m, i) => {
        const r = draftEventSchema.safeParse(m);
        if (!r.success) {
          for (const issue of r.error.issues) {
            const field = String(issue.path[0]);
            e[`ev${i}.${field}`] = field === "mapsUrl" ? t("mapsError") : req;
          }
        }
        if (!m.venueName.trim()) e[`ev${i}.venueName`] = req;
      });
    }
    if (s === 5 && draft.languages.length === 0) e.languages = req;
    return e;
  };

  const go = (to: number) => {
    if (to > step) {
      const e = validate(step);
      setErrors(e);
      if (Object.keys(e).length) {
        requestAnimationFrame(() =>
          document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(),
        );
        return;
      }
    }
    setErrors({});
    if (to === 6) {
      router.push("/commander/apercu");
      return;
    }
    setStep(to);
    top.current?.scrollIntoView({ block: "start" });
  };

  const labels = { fr: t("inFrench"), ar: t("inArabic") };
  const steps = t.raw("steps") as string[];

  return (
    <div ref={top} className="mx-auto max-w-2xl scroll-mt-20 px-4 pt-6 pb-40">
      {/* Barre de progression : étapes faites cliquables */}
      <nav aria-label={t("step", { n: step + 1 })}>
        <ol className="flex gap-1.5">
          {steps.map((label, i) => (
            <li key={label} className="flex-1">
              <button
                type="button"
                disabled={i > step}
                onClick={() => go(i)}
                aria-current={i === step ? "step" : undefined}
                aria-label={`${i + 1}. ${label}`}
                className={`block h-2 w-full rounded-full ${i <= step ? "bg-sea" : "bg-wall"}`}
              />
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-ink-soft">
          {t("step", { n: step + 1 })} · {steps[step]}
        </p>
      </nav>

      <div className="mt-6 space-y-6">
        {step === 0 && (
          <>
            <h1 className="text-[28px] text-cedar">{t("s1q")}</h1>
            <Choice
              legend={t("s1q")}
              options={eventTypes.map((e) => ({ value: e, label: ev(e) }))}
              value={draft.eventType}
              onChange={(eventType) => {
                const first = templates.find((m) => m.eventTypes.includes(eventType));
                update({
                  eventType,
                  templateSlug: models.some(
                    (m) => m.slug === draft.templateSlug && m.eventTypes.includes(eventType),
                  )
                    ? draft.templateSlug
                    : (first?.slug ?? ""),
                });
              }}
            />
            <fieldset>
              <legend className="mb-2 font-bold">{t("s1model")}</legend>
              {models.length === 0 && <p className="text-ink-soft">{t("s1none")}</p>}
              <div className="grid grid-cols-2 gap-3">
                {models.map((m) => (
                  <label
                    key={m.slug}
                    className="cursor-pointer rounded-card border-2 border-transparent bg-surface p-2 shadow-float has-[:checked]:border-sea has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sea"
                  >
                    <input
                      type="radio"
                      name="model"
                      className="sr-only"
                      checked={draft.templateSlug === m.slug}
                      onChange={() => update({ templateSlug: m.slug, variant: "" })}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element -- aperçus SVG/WebP */}
                    <img
                      src={m.previewImage}
                      alt=""
                      className="aspect-[3/4] w-full rounded-t-full object-cover object-top"
                    />
                    <span className="mt-2 block text-center font-bold">{m.name[locale]}</span>
                  </label>
                ))}
              </div>
              {errors.model && <p className="mt-2 text-sm text-danger">{errors.model}</p>}
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-[28px] text-cedar">{t("s2q")}</h1>
            <BilingualField
              label={t("first")}
              labels={labels}
              value={draft.names.first}
              maxLength={40}
              required
              error={errors.first}
              onChange={(first) => update({ names: { ...draft.names, first } })}
            />
            <BilingualField
              label={t("second")}
              labels={labels}
              help={TWO_NAMES.includes(draft.eventType) ? undefined : t("secondHelp")}
              value={draft.names.second}
              maxLength={40}
              error={errors.second}
              onChange={(second) => update({ names: { ...draft.names, second } })}
            />
            <TextField
              label={t("initials")}
              help={t("initialsHelp")}
              value={draft.initials}
              maxLength={5}
              dir="ltr"
              placeholder={autoInitials(draft)}
              onChange={(initials) => update({ initials })}
            />
            <BilingualField
              label={t("hosts")}
              labels={labels}
              help={t("hostsHelp")}
              value={draft.hosts}
              maxLength={240}
              onChange={(hosts) => update({ hosts })}
            />
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-[28px] text-cedar">{t("s3q")}</h1>
            {draft.events.map((m, i) => {
              const set = (patch: Partial<typeof m>) =>
                update({ events: draft.events.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
              const err = (f: string) => errors[`ev${i}.${f}`];
              const validDate = /^\d{4}-\d{2}-\d{2}$/.test(m.date) && /^\d{2}:\d{2}$/.test(m.time);
              const hijri = validDate ? formatHijri(algiersToUtc(m.date, m.time), locale) : "";
              return (
                <fieldset
                  key={i}
                  className="space-y-4 rounded-card border border-wall bg-surface p-4"
                >
                  <legend className="px-1 font-bold text-cedar">{t("moment", { n: i + 1 })}</legend>
                  <Field label={t("momentType")}>
                    {(p) => (
                      <select
                        {...p}
                        className={inputClass}
                        value={m.type}
                        onChange={(e) => {
                          const type = e.target.value as (typeof PROGRAM_TYPES)[number];
                          const fr = (t.raw("programTypes") as Record<string, string>)[type];
                          set({ type, title: { fr, ar: m.title.ar } });
                        }}
                      >
                        {PROGRAM_TYPES.map((p) => (
                          <option key={p} value={p}>
                            {t(`programTypes.${p}`)}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <BilingualField
                    label={t("momentTitle")}
                    labels={labels}
                    value={m.title}
                    maxLength={60}
                    error={err("title")}
                    onChange={(title) => set({ title })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label={t("date")}
                      type="date"
                      value={m.date}
                      error={err("date")}
                      onChange={(date) => set({ date })}
                    />
                    <TextField
                      label={t("time")}
                      type="time"
                      value={m.time}
                      error={err("time")}
                      onChange={(time) => set({ time })}
                    />
                  </div>
                  {hijri && (
                    <p className="text-sm text-ink-soft">{t("hijriPreview", { date: hijri })}</p>
                  )}
                  <TextField
                    label={t("venue")}
                    value={m.venueName}
                    maxLength={120}
                    error={err("venueName")}
                    onChange={(venueName) => set({ venueName })}
                  />
                  <TextField
                    label={t("address")}
                    value={m.address}
                    maxLength={200}
                    onChange={(address) => set({ address })}
                  />
                  <TextField
                    label={t("mapsUrl")}
                    help={t("mapsHelp")}
                    type="url"
                    inputMode="url"
                    dir="ltr"
                    value={m.mapsUrl}
                    error={err("mapsUrl")}
                    onChange={(mapsUrl) => set({ mapsUrl })}
                  />
                  {draft.events.length > 1 && (
                    <button
                      type="button"
                      className={ghostBtn}
                      onClick={() => update({ events: draft.events.filter((_, j) => j !== i) })}
                    >
                      {t("removeMoment")}
                    </button>
                  )}
                </fieldset>
              );
            })}
            {draft.events.length < 6 && (
              <button
                type="button"
                className={secondaryBtn}
                onClick={() =>
                  update({
                    events: [
                      ...draft.events,
                      {
                        ...draft.events[draft.events.length - 1],
                        type: "henne",
                        title: { fr: t("programTypes.henne"), ar: "" },
                      },
                    ],
                  })
                }
              >
                {t("addMoment")}
              </button>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-[28px] text-cedar">{t("s4q")}</h1>
            <Toggle
              label={t("basmala")}
              checked={draft.basmala}
              onChange={(basmala) => update({ basmala })}
            />
            <Choice
              legend={t("verse")}
              options={[
                { value: "none", label: t("verseNone") },
                { value: "ar-rum-30-21", label: t("verseRum") },
              ]}
              value={draft.verse ?? "none"}
              onChange={(v) => update({ verse: v === "none" ? null : "ar-rum-30-21" })}
            />
            <fieldset className="space-y-3">
              <legend className="font-bold">{t("program")}</legend>
              {draft.program.map((p, i) => {
                const set = (patch: Partial<typeof p>) =>
                  update({
                    program: draft.program.map((x, j) => (j === i ? { ...x, ...patch } : x)),
                  });
                return (
                  <div key={i} className="space-y-3 rounded-card border border-wall bg-surface p-4">
                    <TextField
                      label={t("programTime")}
                      type="time"
                      value={p.time}
                      onChange={(time) => set({ time })}
                    />
                    <BilingualField
                      label={t("programTitle")}
                      labels={labels}
                      value={p.title}
                      maxLength={60}
                      onChange={(title) => set({ title })}
                    />
                    <button
                      type="button"
                      className={ghostBtn}
                      onClick={() => update({ program: draft.program.filter((_, j) => j !== i) })}
                    >
                      {t("removeProgram")}
                    </button>
                  </div>
                );
              })}
              {draft.program.length < 12 && (
                <button
                  type="button"
                  className={secondaryBtn}
                  onClick={() =>
                    update({
                      program: [...draft.program, { time: "20:00", title: { fr: "", ar: "" } }],
                    })
                  }
                >
                  {t("addProgram")}
                </button>
              )}
            </fieldset>
            <TextField
              label={t("contactPhone")}
              help={t("contactPhoneHelp")}
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={draft.contactPhone}
              maxLength={20}
              onChange={(contactPhone) => update({ contactPhone })}
            />
          </>
        )}

        {step === 4 && <MediaStep draft={draft} update={update} />}

        {step === 5 && (
          <>
            <h1 className="text-[28px] text-cedar">{t("s6q")}</h1>
            <fieldset className="space-y-2">
              <legend className="font-bold">{t("languages")}</legend>
              {(["fr", "ar"] as const).map((l) => (
                <Toggle
                  key={l}
                  label={t(l === "fr" ? "langFr" : "langAr")}
                  checked={draft.languages.includes(l)}
                  onChange={(on) =>
                    update({
                      languages: on
                        ? [...new Set([...draft.languages, l])]
                        : draft.languages.filter((x) => x !== l),
                    })
                  }
                />
              ))}
              {errors.languages && <p className="text-sm text-danger">{errors.languages}</p>}
            </fieldset>
            {theme && Object.keys(theme.palettes).length > 1 && (
              <Choice
                legend={t("palette")}
                options={Object.keys(theme.palettes).map((p) => ({
                  value: p,
                  label: t.has(`palettes.${p}`) ? t(`palettes.${p}`) : p,
                }))}
                value={draft.variant || theme.defaultPalette}
                onChange={(variant) => update({ variant })}
              />
            )}
            <TextField
              label={t("accessCode")}
              help={t("accessCodeHelp")}
              value={draft.accessCode}
              maxLength={40}
              autoComplete="off"
              onChange={(accessCode) => update({ accessCode })}
            />
            <TextField
              label={t("seats")}
              help={t("seatsHelp")}
              type="number"
              min={1}
              max={20}
              inputMode="numeric"
              value={String(draft.genericMaxSeats)}
              onChange={(v) =>
                update({ genericMaxSeats: Math.min(20, Math.max(1, Number(v) || 1)) })
              }
            />
          </>
        )}
      </div>

      <p className="mt-8 text-sm text-ink-soft">
        {t("draftSaved")}{" "}
        <button
          type="button"
          className="font-bold text-sea underline"
          onClick={() => {
            saveDraft(emptyDraft());
            setMusicFile(null);
            setStep(0);
          }}
        >
          {t("reset")}
        </button>
      </p>

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="mt-4 rounded-field bg-danger/10 p-3 text-danger">
          {t("fixErrors")}
        </p>
      )}

      {/* Retour / Suivant fixés en bas, lien WhatsApp */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-wall bg-bg/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 pe-16 md:pe-0">
          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                className={`${secondaryBtn} flex-1`}
                onClick={() => go(step - 1)}
              >
                {t("prev")}
              </button>
            )}
            <button type="button" className={`${primaryBtn} flex-[2]`} onClick={() => go(step + 1)}>
              {step === 5 ? t("preview") : t("next")}
            </button>
          </div>
          <a
            href={waLink(SITE.whatsapp, t("whatsappHelp"))}
            target="_blank"
            rel="noopener"
            className="text-center text-sm font-bold text-zellige"
          >
            {t("preferWhatsapp")}
          </a>
        </div>
      </div>
    </div>
  );
}

function MediaStep({
  draft,
  update,
}: {
  draft: WizardDraft;
  update: (p: Partial<WizardDraft>) => void;
}) {
  const t = useTranslations("order");
  const [busy, setBusy] = useState(false);
  const [musicError, setMusicError] = useState("");
  const [musicName, setMusicName] = useState(getMusicFile()?.name ?? "");
  return (
    <>
      <h1 className="text-[28px] text-cedar">{t("s5q")}</h1>
      <Toggle
        label={t("discreet")}
        help={t("discreetHelp")}
        checked={draft.discreet}
        onChange={(discreet) => update({ discreet })}
      />
      {!draft.discreet && (
        <fieldset className="space-y-3">
          <legend className="font-bold">{t("photos")}</legend>
          <p className="text-sm text-ink-soft">{t("photosHelp")}</p>
          <div className="grid grid-cols-3 gap-3">
            {draft.photos.map((src, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local */}
                <img src={src} alt="" className="aspect-[3/4] w-full rounded-t-full object-cover" />
                <button
                  type="button"
                  aria-label={t("removePhoto")}
                  className="absolute end-1 top-1 grid size-12 place-items-center rounded-full bg-surface/90 text-danger"
                  onClick={() => update({ photos: draft.photos.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {draft.photos.length < 3 && (
            <label
              className={`${secondaryBtn} cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-3`}
              aria-busy={busy}
            >
              {t("addPhoto")}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setBusy(true);
                  try {
                    const dataUrl = await compressPhoto(file);
                    update({ photos: [...draft.photos, dataUrl].slice(0, 3) });
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
          )}
        </fieldset>
      )}
      <Choice
        legend={t("music")}
        options={[
          { value: "generated", label: t("musicGenerated") },
          { value: "none", label: t("musicNone") },
          { value: "upload", label: t("musicUpload") },
        ]}
        value={draft.music}
        onChange={(music) => update({ music })}
      />
      {draft.music === "upload" && (
        <div className="space-y-1">
          <input
            type="file"
            accept="audio/mpeg,.mp3"
            aria-label={t("musicUpload")}
            className="block w-full text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 3 * 1024 * 1024) {
                setMusicError(t("musicTooBig"));
                setMusicFile(null);
                setMusicName("");
                return;
              }
              setMusicError("");
              setMusicFile(f);
              setMusicName(f?.name ?? "");
            }}
          />
          {musicName && <p className="text-sm">{musicName}</p>}
          {musicError && <p className="text-sm text-danger">{musicError}</p>}
          <p className="text-sm text-ink-soft">{t("musicRights")}</p>
        </div>
      )}
    </>
  );
}
