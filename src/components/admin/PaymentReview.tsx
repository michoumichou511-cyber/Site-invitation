"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { refusePayment } from "@/actions/admin/refusePayment";
import { validatePayment } from "@/actions/admin/validatePayment";
import { inputClass, primaryBtn, secondaryBtn } from "@/components/order/fields";
import { useRouter } from "@/i18n/navigation";

/** Valider ou refuser (avec motif) un reçu : un clic. */
export function PaymentReview({ paymentId }: { paymentId: string }) {
  const t = useTranslations("admin.payments");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [refusing, setRefusing] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div className="space-y-3">
      {!refusing ? (
        <div className="flex gap-3">
          <button
            className={`${primaryBtn} flex-1 bg-zellige`}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await validatePayment(paymentId);
                setMsg(r.ok ? t("validated") : "");
                router.refresh();
              })
            }
          >
            {t("validate")}
          </button>
          <button
            className={`${secondaryBtn} flex-1 border-danger text-danger`}
            onClick={() => setRefusing(true)}
          >
            {t("refuse")}
          </button>
        </div>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await refusePayment({ paymentId, reason });
              setMsg(r.ok ? t("refused") : "");
              router.refresh();
            });
          }}
        >
          <label className="block space-y-1.5">
            <span className="block font-bold">{t("reason")}</span>
            <input
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              minLength={3}
              maxLength={300}
              required
            />
          </label>
          <button
            className={`${primaryBtn} w-full bg-danger`}
            disabled={pending || reason.trim().length < 3}
          >
            {t("confirmRefuse")}
          </button>
        </form>
      )}
      {msg && (
        <p role="status" className="font-bold text-zellige">
          {msg}
        </p>
      )}
    </div>
  );
}
