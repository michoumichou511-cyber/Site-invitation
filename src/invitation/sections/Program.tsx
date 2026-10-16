import type { SectionProps } from "./types";

export function Program({ vm, lang, t }: SectionProps) {
  const items = vm.config.program;
  if (items.length === 0) return null;
  return (
    <section className="inv-reveal" aria-labelledby="h-prog">
      <h2 id="h-prog">{t("programTitle")}</h2>
      <ol className="inv-prog">
        {items.map((item, i) => (
          <li key={i}>
            <time>{item.time}</time>
            <div>
              <strong>{item.title[lang]}</strong>
              {item.note?.[lang] && <small>{item.note[lang]}</small>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
