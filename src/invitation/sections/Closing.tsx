import { ChatIcon, PhoneIcon } from "../engine/icons";
import type { SectionProps } from "./types";

/** Fin : appeler / écrire à la famille, signature. */
export function Closing({ vm, t }: SectionProps) {
  const phone = vm.config.contactPhone;
  return (
    <>
      {phone && (
        <section className="inv-reveal" aria-labelledby="h-contact">
          <h2 id="h-contact">{t("contactTitle")}</h2>
          <div className="inv-btns">
            <a className="inv-btn" href={`tel:${phone}`}>
              <PhoneIcon />
              {t("call")}
            </a>
            <a
              className="inv-btn"
              href={`https://wa.me/${phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener"
            >
              <ChatIcon />
              {t("whatsapp")}
            </a>
          </div>
        </section>
      )}
      <div className="inv-reveal inv-rule" aria-hidden="true">
        ✦
      </div>
      <p className="inv-foot">{t("madeWith")}</p>
    </>
  );
}
