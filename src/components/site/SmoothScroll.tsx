"use client";

import { useEffect } from "react";
import { onIdle } from "@/lib/idle";

/**
 * Défilement fluide Lenis, chargé après l'affichage et seulement si
 * l'utilisateur n'a pas demandé moins de mouvement. Synchronisé avec ScrollTrigger.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    const start = async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      destroy = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    };
    const cancelIdle = onIdle(() => void start());
    return () => {
      cancelled = true;
      cancelIdle();
      destroy?.();
    };
  }, []);
  return null;
}
