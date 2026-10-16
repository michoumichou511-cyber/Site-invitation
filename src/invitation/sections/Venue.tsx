import { googleCalendarUrl, mapsUrls } from "../engine/calendar";
import { formatLongDate, formatTime } from "../engine/dates";
import { CalendarIcon, PinIcon } from "../engine/icons";
import type { SectionProps } from "./types";

/** Lieux de chaque moment, Google Maps + Waze en un clic, ajout au calendrier. */
export function Venue({ vm, lang, t }: SectionProps) {
  const withPlace = vm.events.filter((e) => e.venueName || e.address);
  if (withPlace.length === 0) return null;
  const multi = vm.events.length > 1;
  const title = [vm.config.names.first[lang], vm.config.names.second?.[lang]]
    .filter(Boolean)
    .join(` ${t("and")} `);

  return (
    <section className="inv-reveal" aria-labelledby="h-venue">
      <h2 id="h-venue">{t(withPlace.length > 1 ? "venuesTitle" : "venueTitle")}</h2>
      {withPlace.map((e) => {
        const maps = mapsUrls(e);
        return (
          <div className="inv-venue" key={e.id}>
            <p>
              {multi && (
                <span className="when">
                  {e.title[lang]} · {formatLongDate(e.startsAt, lang)} ·{" "}
                  <bdi>{formatTime(e.startsAt, lang)}</bdi>
                </span>
              )}
              {e.venueName && <strong>{e.venueName}</strong>}
              {e.address && (
                <>
                  <br />
                  <span>{e.address}</span>
                </>
              )}
            </p>
            <div className="inv-btns">
              <a className="inv-btn is-solid" href={maps.google} target="_blank" rel="noopener">
                <PinIcon />
                {t("maps")}
              </a>
              <a className="inv-btn" href={maps.waze} target="_blank" rel="noopener">
                {t("waze")}
              </a>
              <a
                className="inv-btn"
                href={googleCalendarUrl(e, `${title} — ${e.title[lang]}`)}
                target="_blank"
                rel="noopener"
              >
                <CalendarIcon />
                {t("calendar")}
              </a>
              <a className="inv-btn" href={`/api/ics/${vm.slug}?lang=${lang}`} download>
                {t("calendarApple")}
              </a>
            </div>
          </div>
        );
      })}
    </section>
  );
}
