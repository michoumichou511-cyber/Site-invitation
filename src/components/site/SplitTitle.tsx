"use client";

import { useEffect, useRef } from "react";

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
    void (async () => {
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
    })();
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);
  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
