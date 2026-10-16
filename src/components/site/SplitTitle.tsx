"use client";

import { useEffect, useRef } from "react";
import { onFirstInteraction } from "@/lib/idle";

/**
 * Titre révélé mot par mot (GSAP SplitText + ScrollTrigger), chargé à la demande.
 * Le texte est lisible tel quel si l'animation ne se lance pas.
 */
export function SplitTitle({
  as: Tag = "h2",
  className,
  children,
  id,
}: {
  as?: "h1" | "h2";
  className?: string;
  children: string;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    const run = async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
      ]);
      if (cancelled || !ref.current) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      const ctx = gsap.context(() => {
        const split = SplitText.create(ref.current!, { type: "words" });
        gsap.from(split.words, {
          yPercent: 60,
          opacity: 0,
          stagger: 0.06,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
      revert = () => ctx.revert();
    };
    // Titre déjà à l'écran au chargement : pas d'animation (il reste lisible tel quel).
    if (ref.current && ref.current.getBoundingClientRect().top < innerHeight) return;
    const cancelStart = onFirstInteraction(() => void run());
    return () => {
      cancelled = true;
      cancelStart();
      revert?.();
    };
  }, []);
  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
