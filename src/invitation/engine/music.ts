"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Synth } from "./synth";

/**
 * Musique de l'invitation : démarre seulement au geste « Ouvrir » (les navigateurs
 * bloquent la lecture automatique). MP3 du client si présent, sinon mélodie générée.
 */
export function useMusic(src: string | null) {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const synth = useRef<Synth | null>(null);
  const ctx = useRef<AudioContext | null>(null);

  const start = useCallback(async () => {
    if (started) return;
    setStarted(true);
    const { createAudioContext, startSynth } = await import("./synth");
    ctx.current = createAudioContext();
    if (src) {
      const el = new Audio(src);
      el.loop = true;
      el.preload = "auto";
      audio.current = el;
      el.play().catch(() => {});
    } else if (ctx.current) {
      synth.current = startSynth(ctx.current);
    }
  }, [src, started]);

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (audio.current) audio.current.muted = next;
      synth.current?.setMuted(next);
      return next;
    });
  }, []);

  const youyou = useCallback(async () => {
    if (muted || !ctx.current) return;
    const { playYouyou } = await import("./synth");
    playYouyou(ctx.current, ctx.current.destination);
  }, [muted]);

  // Couper le son quand l'onglet passe en arrière-plan.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) {
        audio.current?.pause();
        ctx.current?.suspend().catch(() => {});
      } else {
        if (audio.current && !audio.current.muted) audio.current.play().catch(() => {});
        ctx.current?.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      audio.current?.pause();
      synth.current?.stop();
      ctx.current?.close().catch(() => {});
    };
  }, []);

  return { started, muted, start, toggle, youyou };
}
