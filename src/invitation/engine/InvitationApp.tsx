"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "./config";
import { createConfetti } from "./confetti";
import { translator, type Dicts } from "./i18n";
import { SoundOffIcon, SoundOnIcon } from "./icons";
import { useMusic } from "./music";
import { paletteVars, type ThemeDefinition } from "./theme";
import type { InvitationViewModel } from "./types";
import { useReveal } from "./useReveal";
import { Doors } from "../openers/Doors";
import { Envelope } from "../openers/Envelope";
import { Gift } from "../openers/Gift";
import { Candle } from "../sections/Candle";
import { Closing } from "../sections/Closing";
import { Countdown } from "../sections/Countdown";
import { Gallery } from "../sections/Gallery";
import { Guestbook } from "../sections/Guestbook";
import { Hero } from "../sections/Hero";
import { Program } from "../sections/Program";
import { Rsvp } from "../sections/Rsvp";
import { Venue } from "../sections/Venue";

const OPENERS = { envelope: Envelope, doors: Doors, gift: Gift };

/** Moteur d'invitation : ouverture, outils (son, langue), sections du thème. */
export function InvitationApp({
  vm,
  theme,
  dicts,
  embedded = false,
}: {
  vm: InvitationViewModel;
  theme: ThemeDefinition;
  dicts: Dicts;
  /** Aperçu dans le site (assistant, espace client) : ne touche pas à <html>. */
  embedded?: boolean;
}) {
  const [lang, setLang] = useState<Lang>(vm.defaultLang);
  const [opened, setOpened] = useState(false);
  const [ctaHidden, setCtaHidden] = useState(Boolean(vm.existingRsvp));
  const t = useMemo(() => translator(dicts, lang), [dicts, lang]);
  const musicConfig = vm.config.music;
  const music = useMusic(
    musicConfig && musicConfig !== "none" ? musicConfig.src : null,
    musicConfig !== "none",
  );
  const main = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const confetti = useRef<ReturnType<typeof createConfetti> | null>(null);
  const palette =
    theme.palettes[(vm.config as { variant?: string }).variant ?? theme.defaultPalette] ??
    theme.palettes[theme.defaultPalette];

  useReveal(main, opened);

  // Langue : <html lang dir> suit la bascule FR / ع.
  useEffect(() => {
    if (embedded) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang, embedded]);

  // Pas de défilement tant que l'enveloppe est fermée.
  useEffect(() => {
    if (embedded) return;
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [opened, embedded]);

  useEffect(() => {
    if (!canvas.current) return;
    confetti.current = createConfetti(canvas.current, theme.confetti);
    return () => confetti.current?.destroy();
  }, [theme.confetti]);

  // Bouton « Je confirme » masqué quand le formulaire RSVP est à l'écran.
  useEffect(() => {
    const target = document.getElementById("rsvp");
    if (!target || !opened || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setCtaHidden(true);
      else if (!vm.existingRsvp) setCtaHidden(false);
    });
    io.observe(target);
    return () => io.disconnect();
  }, [opened, vm.existingRsvp]);

  // Service worker : l'invitation reste lisible sans réseau dans la salle.
  useEffect(() => {
    if (!embedded && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw-invitation.js", { scope: "/i/" }).catch(() => {});
    }
  }, [embedded]);

  const onOpen = useCallback(() => {
    void music.start();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => confetti.current?.burst(), reduce ? 0 : 900);
  }, [music]);

  const onAnswered = useCallback(
    (answer: "oui" | "non") => {
      setCtaHidden(true);
      if (answer === "oui") {
        confetti.current?.burst(0.6);
        void music.youyou();
      }
    },
    [music],
  );

  const props = { vm, lang, t };
  const Opener = OPENERS[theme.opener];
  const otherLang: Lang = lang === "fr" ? "ar" : "fr";
  const showLang = vm.languages.includes(otherLang);
  const cardText = [vm.config.names.first[lang], vm.config.names.second?.[lang]]
    .filter(Boolean)
    .join(lang === "ar" ? " و " : " & ");
  const rsvpVisible = vm.rsvp.kind === "open";

  return (
    <div
      className="inv"
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
      style={paletteVars(palette) as React.CSSProperties}
    >
      <div className="inv-pattern" style={{ backgroundImage: theme.pattern }} aria-hidden="true" />
      <canvas ref={canvas} className="inv-confetti" aria-hidden="true" />
      {vm.preview && (
        <div className="inv-watermark" aria-hidden="true">
          {t("preview")}
        </div>
      )}

      <div className="inv-tools">
        {music.started && (
          <button
            type="button"
            className="inv-pill"
            onClick={music.toggle}
            aria-label={music.muted ? t("soundOn") : t("soundOff")}
            aria-pressed={music.muted}
          >
            {music.muted ? <SoundOffIcon /> : <SoundOnIcon />}
          </button>
        )}
        {showLang && (
          <button
            type="button"
            className="inv-pill"
            lang={otherLang}
            onClick={() => setLang(otherLang)}
          >
            {otherLang === "ar" ? "ع" : "FR"}
          </button>
        )}
      </div>

      {!opened && (
        <noscript>
          <style>{`.env-intro{display:none}html{overflow:auto!important}`}</style>
        </noscript>
      )}
      <Opener
        t={t}
        cardText={cardText}
        initials={vm.config.initials}
        greeting={vm.guest ? t("greeting", { name: vm.guest.name }) : ""}
        onOpen={onOpen}
        onGone={() => setOpened(true)}
      />

      <main ref={main} className="inv-main">
        <Hero {...props} />
        {vm.config.sections.countdown && <Countdown {...props} />}
        {vm.config.sections.program && <Program {...props} />}
        {vm.config.sections.venue && <Venue {...props} />}
        {theme.candle && <Candle {...props} onBlow={() => confetti.current?.burst(0.5)} />}
        {vm.config.sections.gallery && <Gallery {...props} style={theme.galleryStyle} />}
        <Rsvp {...props} onAnswered={onAnswered} />
        <Guestbook {...props} />
        <Closing {...props} />
      </main>

      {rsvpVisible && opened && (
        <div className={`inv-cta${ctaHidden ? "is-hidden" : ""}`}>
          <a className="inv-btn is-solid" href="#rsvp">
            {t("rsvpCta")}
          </a>
        </div>
      )}
    </div>
  );
}
