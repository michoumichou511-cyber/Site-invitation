import type { Lang } from "../engine/config";
import { translator, type Dicts } from "../engine/i18n";

function Shell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <div
      className="inv inv-standalone"
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
      style={
        {
          "--inv-ground": "#EDEAE4",
          "--inv-ground-deep": "#DCD8CF",
          "--inv-accent": "#045588",
          "--inv-soft": "#2B140A",
          "--inv-bright": "#2B140A",
          "--inv-paper": "#FFFFFF",
          "--inv-ink": "#2B140A",
          "--inv-action": "#045588",
          "--inv-on-action": "#FFFFFF",
        } as React.CSSProperties
      }
    >
      <div className="inv-paper">{children}</div>
    </div>
  );
}

export function InvalidGuestLink({
  lang,
  dicts,
  genericHref,
}: {
  lang: Lang;
  dicts: Dicts;
  genericHref: string | null;
}) {
  const t = translator(dicts, lang);
  return (
    <Shell lang={lang}>
      <p className="inv-notice">{t("invalidLink")}</p>
      {genericHref && (
        <p className="inv-notice">
          <a className="inv-btn is-ghost" href={genericHref}>
            {t("openLabel")}
          </a>
        </p>
      )}
    </Shell>
  );
}

export function ExpiredInvitation({ lang, dicts }: { lang: Lang; dicts: Dicts }) {
  const t = translator(dicts, lang);
  return (
    <Shell lang={lang}>
      <p className="inv-notice">{t("expired")}</p>
    </Shell>
  );
}

export { Shell as NoticeShell };
