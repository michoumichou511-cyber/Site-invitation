"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { deleteGuest, importGuests, markGuestsSent } from "@/actions/client/guests";
import { Field, inputClass, primaryBtn, secondaryBtn, TextField } from "@/components/order/fields";
import { useRouter } from "@/i18n/navigation";
import {
  normalizePhone,
  parseCsv,
  parseGuestRows,
  type GuestInput,
  type ImportError,
} from "@/lib/guests/import";
import { guestWhatsapp, type ShareTexts } from "@/lib/guests/share";

export type GuestRow = {
  id: string;
  name: string;
  phone: string | null;
  groupLabel: string | null;
  maxSeats: number;
  code: string;
  locale: string | null;
  sentAt: number | null;
  firstOpenedAt: number | null;
};

export function GuestsManager({
  invitationId,
  guests,
  linkBase,
  title,
  defaultLang,
  texts,
}: {
  invitationId: string;
  guests: GuestRow[];
  linkBase: string;
  title: { fr: string; ar: string };
  defaultLang: "fr" | "ar";
  texts: ShareTexts;
}) {
  const t = useTranslations("account.guests");
  const e = useTranslations("account.errors");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", group: "", seats: "1", lang: "" });
  const [preview, setPreview] = useState<{ valid: GuestInput[]; errors: ImportError[] } | null>(
    null,
  );
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? guests.filter(
          (g) => g.name.toLowerCase().includes(q) || g.groupLabel?.toLowerCase().includes(q),
        )
      : guests;
  }, [guests, query]);

  const save = (rows: GuestInput[]) =>
    start(async () => {
      const r = await importGuests(invitationId, rows);
      if (r.ok) {
        setMsg(t("imported", { count: r.count ?? rows.length }));
        setPreview(null);
        setAdding(false);
        setForm({ name: "", phone: "", group: "", seats: "1", lang: "" });
      } else setMsg(e(r.error));
      router.refresh();
    });

  const onFile = async (file: File) => {
    let rows: unknown[][];
    if (/\.xlsx$/i.test(file.name)) {
      const { readSheet } = await import("read-excel-file/browser");
      rows = (await readSheet(file)) as unknown[][];
    } else rows = parseCsv(await file.text());
    setPreview(
      parseGuestRows(
        rows,
        guests.map((g) => g.name),
      ),
    );
  };

  const downloadTemplate = async () => {
    const { default: write } = await import("write-excel-file/browser");
    await write([
      ["Nom", "Téléphone", "Groupe", "Places", "Langue"],
      ["Karim Benali", "0550 12 34 56", "Amis", 2, "fr"],
      ["عمي محمد", "0661 00 00 00", "عائلة العريس", 4, "ar"],
    ]).toFile("invites-modele.xlsx");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] text-cedar">
          {t("title")}{" "}
          <span className="text-lg text-ink-soft">· {t("count", { count: guests.length })}</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          <button className={primaryBtn} onClick={() => setAdding((a) => !a)}>
            {t("add")}
          </button>
          <label
            className={`${secondaryBtn} cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-3`}
          >
            {t("import")}
            <input
              type="file"
              accept=".xlsx,.csv,text/csv"
              className="sr-only"
              onChange={(ev) => ev.target.files?.[0] && onFile(ev.target.files[0])}
            />
          </label>
        </div>
      </div>
      <p className="text-sm text-ink-soft">
        {t("importHelp")}{" "}
        <button type="button" className="font-bold text-sea underline" onClick={downloadTemplate}>
          {t("template")}
        </button>
      </p>

      {adding && (
        <form
          className="grid gap-4 rounded-card bg-surface p-4 md:grid-cols-2"
          onSubmit={(ev) => {
            ev.preventDefault();
            const phone = normalizePhone(form.phone);
            if (!form.name.trim() || phone === false) return setMsg(e("invalid"));
            save([
              {
                name: form.name.trim(),
                phone,
                groupLabel: form.group.trim() || null,
                maxSeats: Math.min(50, Math.max(1, Number(form.seats) || 1)),
                locale: form.lang === "fr" || form.lang === "ar" ? form.lang : null,
              },
            ]);
          }}
        >
          <TextField
            label={t("name")}
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
            maxLength={80}
            required
          />
          <TextField
            label={t("phone")}
            type="tel"
            dir="ltr"
            value={form.phone}
            onChange={(phone) => setForm({ ...form, phone })}
          />
          <TextField
            label={t("group")}
            help={t("groupHelp")}
            value={form.group}
            onChange={(group) => setForm({ ...form, group })}
            maxLength={60}
          />
          <TextField
            label={t("seats")}
            type="number"
            min={1}
            max={50}
            value={form.seats}
            onChange={(seats) => setForm({ ...form, seats })}
          />
          <Field label={t("lang")}>
            {(p) => (
              <select
                {...p}
                className={inputClass}
                value={form.lang}
                onChange={(ev) => setForm({ ...form, lang: ev.target.value })}
              >
                <option value="">{t("langAuto")}</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            )}
          </Field>
          <div className="flex items-end">
            <button className={`${primaryBtn} w-full`} disabled={pending}>
              {t("save")}
            </button>
          </div>
        </form>
      )}

      {preview && (
        <section
          className="space-y-3 rounded-card border-2 border-sea bg-surface p-4"
          aria-label={t("preview")}
        >
          <h2 className="text-xl text-cedar">{t("preview")}</h2>
          <p>
            <b className="text-zellige">{t("validRows", { count: preview.valid.length })}</b> ·{" "}
            <b className={preview.errors.length ? "text-danger" : ""}>
              {t("errorRows", { count: preview.errors.length })}
            </b>
          </p>
          {preview.errors.length > 0 && (
            <ul className="max-h-48 overflow-auto rounded-field bg-danger/10 p-3 text-sm text-danger">
              {preview.errors.map((er) => (
                <li key={er.line}>
                  {t("line", { line: er.line })} : {t(`errors.${er.reason}`)}
                </li>
              ))}
            </ul>
          )}
          <ul className="max-h-60 overflow-auto text-sm">
            {preview.valid.slice(0, 100).map((g, i) => (
              <li key={i} className="border-t border-wall py-1">
                {g.name} · <bdi>{g.phone ?? "—"}</bdi> · {g.groupLabel ?? "—"} ·{" "}
                {t("seatsN", { count: g.maxSeats })}
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <button
              className={primaryBtn}
              disabled={pending || preview.valid.length === 0}
              onClick={() => save(preview.valid)}
            >
              {t("confirmImport")}
            </button>
            <button className={secondaryBtn} onClick={() => setPreview(null)}>
              {t("cancel")}
            </button>
          </div>
        </section>
      )}

      {msg && (
        <p role="status" className="font-bold text-zellige">
          {msg}
        </p>
      )}

      {guests.length === 0 ? (
        <div className="rounded-card border border-dashed border-brass bg-surface p-8 text-center">
          <p className="text-xl font-bold">{t("empty")}</p>
          <p className="text-ink-soft">{t("emptyHelp")}</p>
        </div>
      ) : (
        <>
          <input
            className={inputClass}
            type="search"
            placeholder={t("search")}
            aria-label={t("search")}
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
          />
          <ul className="space-y-2">
            {filtered.map((g) => {
              const link = `${linkBase}/${g.code}`;
              return (
                <li
                  key={g.id}
                  className="space-y-2 rounded-card bg-surface p-4"
                  data-testid="guest"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <b className="text-lg">{g.name}</b>
                    <span className="text-sm text-ink-soft">
                      {g.groupLabel ?? ""} · {t("seatsN", { count: g.maxSeats })} ·{" "}
                      {g.firstOpenedAt ? t("opened") : t("notOpened")}
                    </span>
                  </div>
                  <p className="text-sm break-all text-ink-soft" dir="ltr">
                    {link}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={guestWhatsapp(g, { link, title, defaultLang, texts })}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex min-h-12 items-center rounded-full bg-whatsapp px-4 font-bold text-white"
                      onClick={() =>
                        start(async () => void (await markGuestsSent(invitationId, [g.id])))
                      }
                    >
                      {g.sentAt ? `${t("send")} ✓` : t("send")}
                    </a>
                    <button
                      type="button"
                      className={secondaryBtn}
                      onClick={async () => {
                        await navigator.clipboard.writeText(link).catch(() => {});
                        setCopied(g.id);
                      }}
                    >
                      {copied === g.id ? t("copied") : t("copy")}
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-12 items-center px-3 font-bold text-danger"
                      onClick={() =>
                        confirm(t("confirmDelete", { name: g.name })) &&
                        start(
                          async () =>
                            void (await deleteGuest(invitationId, g.id), router.refresh()),
                        )
                      }
                    >
                      {t("delete")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
