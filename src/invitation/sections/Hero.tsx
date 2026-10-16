import { BASMALA, VERSES } from "../engine/verses";
import type { SectionProps } from "./types";
import { formatHijri, formatLongDate, formatTime } from "../engine/dates";

/** Premier écran : basmala, familles, prénoms, date grégorienne + hégire, lieu ; puis le verset. */
export function Hero({ vm, lang, t }: SectionProps) {
  const { config, guest, events } = vm;
  const first = events[0];
  const verse = config.verse ? VERSES[config.verse] : null;
  const hijri = first ? formatHijri(first.startsAt, lang) : "";

  return (
    <>
      {config.basmala && (
        <div className="inv-reveal inv-basmala-wrap">
          <div className="inv-basmala" lang="ar">
            {BASMALA}
          </div>
        </div>
      )}
      {config.hosts?.[lang] && <p className="inv-reveal inv-hosts">{config.hosts[lang]}</p>}
      <div className="inv-reveal inv-hero">
        <div className="inv-dear">
          {guest ? t("invitedNamed", { name: guest.name }) : t("invited")}
        </div>
        <h1 className="inv-names">
          <span className="n">{config.names.first[lang]}</span>
          {config.names.second && (
            <>
              <span className="amp">{t("and")}</span>
              <span className="n">{config.names.second[lang]}</span>
            </>
          )}
        </h1>
      </div>
      <div className="inv-reveal inv-rule" aria-hidden="true">
        ✦
      </div>
      {first && (
        <div className="inv-reveal inv-date">
          <span className="d1">
            {formatLongDate(first.startsAt, lang)} · <bdi>{formatTime(first.startsAt, lang)}</bdi>
          </span>
          {hijri && <span className="d2">{t("hijri", { date: hijri })}</span>}
          {first.venueName && <span className="d3">{first.venueName}</span>}
        </div>
      )}
      {verse && (
        <div className="inv-reveal inv-verse">
          <span lang="ar">{verse.ar}</span>
          {lang === "fr" && <small>{verse.fr}</small>}
        </div>
      )}
    </>
  );
}
