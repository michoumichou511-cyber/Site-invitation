/** Téléphone de démo : la vraie invitation jouable dans un cadre de téléphone. */
export function PhoneDemo({
  src,
  title,
  fullscreenLabel,
}: {
  src: string;
  title: string;
  fullscreenLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative aspect-[375/760] w-[min(86vw,340px)] overflow-hidden rounded-[44px] border-[10px] border-[#2B140A] bg-[#2B140A] shadow-float">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          className="size-full border-0 bg-white"
          allow="autoplay; vibrate"
        />
      </div>
      <a
        href={src}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-12 items-center font-bold text-sea"
      >
        {fullscreenLabel}
      </a>
    </div>
  );
}
