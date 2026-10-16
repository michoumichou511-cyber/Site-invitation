"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { createOrder } from "@/actions/createOrder";
import { Link, useRouter } from "@/i18n/navigation";
import { Turnstile } from "@/invitation/engine/Turnstile";
import { contactSchema } from "@/lib/orders/draft";
import { PACK_PRICES, type Pack } from "@/lib/orders/pricing";
import { dataUrlToFile, getMusicFile, saveDraft, toOrderDraft, useDraft } from "./draft";
import { primaryBtn, TextField, Toggle } from "./fields";

export type PackInfo = { id: Pack; name: string; price: string; delay: string; items: string[] };

/** Choix du pack + coordonnées, puis création de la commande. */
export function PackForm({
  packs,
  turnstileSiteKey,
  initialPack,
}: {
  packs: PackInfo[];
  turnstileSiteKey: string | null;
  initialPack?: Pack;
}) {
  const t = useTranslations("order");
  const locale = useLocale() as "fr" | "ar";
  const router = useRouter();
  const { draft } = useDraft();
  const [pack, setPack] = useState<Pack>(initialPack ?? "premium");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [serverError, setServerError] = useState("");
  const onToken = useCallback((tk: string | null) => setToken(tk), []);

  if (draft === undefined) return <div className="min-h-[50vh]" aria-busy="true" />;
  if (!draft?.templateSlug) {
    return (
      <p className="py-10 text-center">
        <Link href="/commander" className={primaryBtn}>
          {t("title")}
        </Link>
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contact = { name, whatsapp, email, consent };
    const parsed = contactSchema.safeParse(contact);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const f = String(i.path[0]);
        errs[f] = f === "whatsapp" ? t("contactWhatsappError") : t("required");
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError("");
    setStatus("sending");
    try {
      const form = new FormData();
      form.set("draft", JSON.stringify(toOrderDraft(draft)));
      form.set("contact", JSON.stringify(contact));
      form.set("pack", pack);
      form.set("locale", locale);
      if (token) form.set("turnstile", token);
      const src = new URLSearchParams(location.search).get("src");
      if (src) form.set("source", src);
      if (!draft.discreet) {
        for (const [i, photo] of draft.photos.entries())
          form.set(`photo-${i}`, await dataUrlToFile(photo, `photo-${i}`));
      }
      const music = getMusicFile();
      if (draft.music === "upload" && music) form.set("music", music);
      const res = await createOrder(form);
      if (!res.ok) {
        setServerError(t(`errors.${res.error}`));
        setStatus("idle");
        return;
      }
      saveDraft(null);
      router.push(`/commander/paiement?code=${res.trackingCode}`);
    } catch {
      setServerError(t("errors.server"));
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <h1 className="text-[28px] text-cedar">{t("packTitle")}</h1>
      <fieldset className="grid gap-3">
        <legend className="sr-only">{t("packTitle")}</legend>
        {packs.map((p) => (
          <label
            key={p.id}
            className="block cursor-pointer rounded-card border-2 border-wall bg-surface p-4 has-[:checked]:border-sea has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sea"
          >
            <input
              type="radio"
              name="pack"
              value={p.id}
              checked={pack === p.id}
              onChange={() => setPack(p.id)}
              className="sr-only"
            />
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-xl font-bold text-cedar">{p.name}</span>
              <span className="font-bold text-sea">{p.price}</span>
            </span>
            <span className="block text-sm text-ink-soft">{p.delay}</span>
            <span className="mt-2 block text-sm">{p.items.slice(0, 4).join(" · ")}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-xl font-bold text-cedar">{t("contactTitle")}</legend>
        <TextField
          label={t("contactName")}
          value={name}
          onChange={setName}
          autoComplete="name"
          maxLength={80}
          error={errors.name}
        />
        <TextField
          label={t("contactWhatsapp")}
          help={t("contactWhatsappHelp")}
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          value={whatsapp}
          onChange={setWhatsapp}
          error={errors.whatsapp}
        />
        <TextField
          label={t("contactEmail")}
          help={t("contactEmailHelp")}
          type="email"
          dir="ltr"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <Toggle label={t("consent")} checked={consent} onChange={setConsent} />
        {errors.consent && <p className="text-sm text-danger">{t("required")}</p>}
        <p className="text-sm">
          <Link href="/legal/cgv" className="text-sea underline">
            CGV
          </Link>{" "}
          ·{" "}
          <Link href="/legal/confidentialite" className="text-sea underline">
            {t("consent").split(" ").slice(-2).join(" ")}
          </Link>
        </p>
      </fieldset>

      {turnstileSiteKey && <Turnstile siteKey={turnstileSiteKey} lang={locale} onToken={onToken} />}

      <div className="flex items-center justify-between rounded-card bg-surface p-4">
        <span className="font-bold">{t("total")}</span>
        <span className="text-2xl font-bold text-sea">
          {new Intl.NumberFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR").format(
            PACK_PRICES[pack],
          )}{" "}
          DA
        </span>
      </div>
      {serverError && (
        <p role="alert" className="rounded-field bg-danger/10 p-3 text-danger">
          {serverError}
        </p>
      )}
      <button type="submit" className={`${primaryBtn} w-full`} disabled={status === "sending"}>
        {status === "sending" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
