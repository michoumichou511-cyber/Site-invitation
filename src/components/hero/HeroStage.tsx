"use client";

/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect -- code impératif
   canvas / three.js : les objets mutés (canvas, texture, caméra) ne sont pas de l'état React. */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { onFirstInteraction } from "@/lib/idle";
import { KarakouScreen } from "./KarakouScreen";
import { drawScreen, SCREEN_H, SCREEN_W } from "./screens";
import type { PhoneState } from "./PhoneScene";

const PhoneScene = dynamic(() => import("./PhoneScene"), { ssr: false });

export type HeroCopy = {
  lang: "fr" | "ar";
  eyebrow: string;
  title: string;
  lead: string;
  cta: string;
  ctaHref: string;
  how: string;
  howHref: string;
  phoneLabel: string;
  slides: string[];
  chips: { k: string; v: string; icon: "check" | "pin" | "music" | "clock" }[];
  dayTemplate: string;
};

const DAY = 86_400_000;

const ICONS = {
  check: <path d="M20 6 9 17l-5-5" />,
  pin: (
    <>
      <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </>
  ),
};

/** Téléphone 3D seulement sur un appareil qui peut le faire tourner à 60 i/s. */
function canRun3D() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 4) < 4 || (nav.hardwareConcurrency ?? 4) < 4) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

const POSITIONS = [
  "top-[8%] start-0",
  "top-[34%] end-0",
  "bottom-[24%] start-[2%]",
  "bottom-[6%] end-[4%]",
];

/**
 * Héro : le téléphone fait un tour complet au scroll et change de modèle quand il est
 * de profil (mariage → anniversaire → naissance). Sens inversé en arabe.
 * Le texte s'affiche d'abord ; la 3D se charge ensuite, si l'appareil le permet.
 */
export function HeroStage({ copy }: { copy: HeroCopy }) {
  const stage = useRef<HTMLElement>(null);
  const fallbackHost = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const state = useRef<PhoneState>({ ry: -0.42, rx: 0.08, y: 0 });
  const [screen, setScreen] = useState<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<"static" | "canvas" | "3d">("static");
  const [slide, setSlide] = useState(0);
  const [version, setVersion] = useState(0);
  const [eventDate] = useState(() => {
    const d = new Date(Date.now() + 60 * DAY);
    d.setHours(19, 0, 0, 0);
    return d;
  });
  const [countdown, setCountdown] = useState("");

  // Écran dessiné sur canvas, puis choix 3D / canvas plat.
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = SCREEN_W;
    c.height = SCREEN_H;
    setScreen(c);
    // La 3D attend le premier geste (défilement, toucher, clavier) : la page reste
    // légère au chargement. Sans geste, l'aperçu statique suffit.
    return onFirstInteraction(() => setMode(canRun3D() ? "3d" : "canvas"));
  }, []);

  useEffect(() => {
    if (!screen) return;
    const g = screen.getContext("2d");
    if (!g) return;
    const paint = () => {
      drawScreen(g, slide, { lang: copy.lang, date: eventDate });
      setVersion((v) => v + 1);
    };
    paint();
    document.fonts?.ready.then(paint).catch(() => {});
  }, [screen, slide, copy.lang, eventDate]);

  // Version plate (téléphone modeste, reduced-motion, pas de WebGL).
  useEffect(() => {
    if (mode !== "canvas" || !screen || !fallbackHost.current) return;
    screen.className = "h-full w-auto rounded-[34px] border-[10px] border-[#2B140A] shadow-float";
    screen.setAttribute("aria-hidden", "true");
    fallbackHost.current.replaceChildren(screen);
  }, [mode, screen]);

  useEffect(() => {
    const tick = () => {
      const ms = eventDate.getTime() - Date.now();
      setCountdown(
        copy.dayTemplate
          .replace("{days}", String(Math.floor(ms / DAY)))
          .replace("{hours}", String(Math.floor((ms % DAY) / 3_600_000))),
      );
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [eventDate, copy.dayTemplate]);

  // Chorégraphie au scroll (GSAP ScrollTrigger, chargé à la demande).
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let kill: (() => void) | undefined;
    let cancelled = false;
    // Chargé au premier geste : le téléphone ne bouge qu'au défilement de toute façon.
    const cancelStart = onFirstInteraction(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !stage.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const dir = copy.lang === "ar" ? -1 : 1;
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: stage.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            state.current.ry = dir * (-0.42 + p * Math.PI * 2);
            state.current.rx = 0.08 + Math.sin(p * Math.PI) * 0.12;
            state.current.y = Math.sin(p * Math.PI * 2) * 0.08;
            setSlide(p < 0.33 ? 0 : p < 0.66 ? 1 : 2);
          },
        });
        gsap.utils.toArray<HTMLElement>(chipsRef.current?.children ?? []).forEach((chip, i) => {
          gsap.to(chip, {
            y: (i % 2 ? -1 : 1) * 60,
            x: dir * (i < 2 ? 1 : -1) * 14,
            ease: "none",
            scrollTrigger: {
              trigger: stage.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          });
        });
      }, stage);
      kill = () => ctx.revert();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      cancelStart();
      kill?.();
    };
  }, [copy.lang]);

  return (
    <section ref={stage} className="relative h-[300vh] motion-reduce:h-auto">
      <div className="sticky top-0 mx-auto grid h-svh max-w-site grid-rows-[auto_1fr] content-start gap-2 px-4 pt-20 motion-reduce:relative md:grid-cols-2 md:grid-rows-1 md:items-center md:gap-6 md:pt-0">
        <div className="z-10 flex flex-col gap-3 md:gap-5">
          <span className="text-sm font-bold tracking-[0.14em] text-cedar uppercase rtl:tracking-normal">
            {copy.eyebrow}
          </span>
          <h1 className="text-[clamp(30px,8.5vw,40px)] [text-wrap:balance] text-ink md:text-[clamp(38px,5.4vw,64px)]">
            {copy.title}
          </h1>
          <p className="max-w-[44ch] text-ink-soft md:text-lg">{copy.lead}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={copy.ctaHref}
              className="inline-flex min-h-12 items-center rounded-full bg-sea px-6 font-bold text-white"
            >
              {copy.cta}
            </a>
            <a
              href={copy.howHref}
              className="hidden min-h-12 items-center rounded-full border-[1.5px] border-sea px-6 font-bold text-sea md:inline-flex"
            >
              {copy.how}
            </a>
          </div>
          <div className="mt-1 flex gap-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1 max-w-14 flex-1 rounded-sm transition-colors ${i <= slide ? "bg-coral" : "bg-wall"}`}
              />
            ))}
          </div>
          <p className="min-h-[1.6em] text-sm text-ink-soft" aria-live="polite">
            {copy.slides[slide]}
          </p>
        </div>

        <div
          className="relative h-[56svh] w-full md:h-[min(78svh,720px)]"
          role="img"
          aria-label={copy.phoneLabel}
        >
          <div className="absolute inset-x-[14%] top-[6%] bottom-0 rounded-t-full border border-b-0 border-wall bg-gradient-to-b from-wall to-transparent" />
          {mode === "3d" && screen ? (
            <div className="absolute inset-0">
              <PhoneScene screen={screen} state={state} version={version} />
            </div>
          ) : (
            <div ref={fallbackHost} className="absolute inset-0 grid place-items-center py-[6%]">
              <KarakouScreen className="h-full w-auto rounded-[34px] border-[10px] border-[#2B140A] bg-[#2B140A] shadow-float" />
            </div>
          )}
          <div ref={chipsRef} aria-hidden="true">
            {copy.chips.map((chip, i) => (
              <div
                key={chip.k}
                className={`absolute z-10 flex items-center gap-2.5 rounded-card border border-wall bg-surface px-3 py-2 text-xs leading-tight shadow-float md:px-3.5 md:py-2.5 md:text-sm ${POSITIONS[i]}`}
              >
                <span className="grid size-7 flex-none place-items-center rounded-[10px] bg-sea-light/40 text-sea md:size-8">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {ICONS[chip.icon]}
                  </svg>
                </span>
                <span>
                  <b className="block text-[11px] tracking-[0.1em] text-cedar uppercase rtl:tracking-normal">
                    {chip.k}
                  </b>
                  <span suppressHydrationWarning>
                    {chip.icon === "clock" ? countdown || chip.v : chip.v}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
