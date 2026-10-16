"use client";

import { useId } from "react";

export const inputClass =
  "block min-h-12 w-full rounded-field border border-wall bg-surface px-3 text-base text-ink aria-[invalid=true]:border-danger focus-visible:border-sea";

export function Field({
  label,
  help,
  error,
  children,
}: {
  label: string;
  help?: string;
  error?: string | false;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => React.ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const errId = `${id}-err`;
  const describedBy =
    [help ? helpId : null, error ? errId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-bold">
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) })}
      {help && (
        <p id={helpId} className="text-sm text-ink-soft">
          {help}
        </p>
      )}
      {error && (
        <p id={errId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  help,
  error,
  value,
  onChange,
  dir,
  ...rest
}: {
  label: string;
  help?: string;
  error?: string | false;
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <Field label={label} help={help} error={error}>
      {(p) => (
        <input
          {...p}
          {...rest}
          dir={dir}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

/** Deux champs : français et arabe (l'arabe en droite-à-gauche). */
export function BilingualField({
  label,
  help,
  value,
  onChange,
  required,
  error,
  maxLength,
  labels,
}: {
  label: string;
  help?: string;
  value: { fr: string; ar: string };
  onChange: (v: { fr: string; ar: string }) => void;
  required?: boolean;
  error?: string | false;
  maxLength?: number;
  labels: { fr: string; ar: string };
}) {
  return (
    <fieldset className="space-y-3 rounded-card border border-wall bg-surface/60 p-4">
      <legend className="px-1 font-bold">{label}</legend>
      <TextField
        label={labels.fr}
        value={value.fr}
        dir="ltr"
        lang="fr"
        required={required}
        maxLength={maxLength}
        error={error}
        onChange={(fr) => onChange({ ...value, fr })}
      />
      <TextField
        label={labels.ar}
        value={value.ar}
        dir="rtl"
        lang="ar"
        maxLength={maxLength}
        onChange={(ar) => onChange({ ...value, ar })}
      />
      {help && <p className="text-sm text-ink-soft">{help}</p>}
    </fieldset>
  );
}

export function Toggle({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-6 flex-none accent-sea"
      />
      <label htmlFor={id} className="space-y-0.5">
        <span className="block font-bold">{label}</span>
        {help && <span className="block text-sm text-ink-soft">{help}</span>}
      </label>
    </div>
  );
}

export function Choice<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="inline-flex min-h-12 cursor-pointer items-center rounded-full border border-wall bg-surface px-4 has-[:checked]:border-sea has-[:checked]:bg-sea has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sea"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export const primaryBtn =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-sea px-6 font-bold text-white disabled:opacity-50";
export const secondaryBtn =
  "inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-sea px-6 font-bold text-sea";
export const ghostBtn =
  "inline-flex min-h-12 items-center justify-center px-3 font-bold text-sea underline-offset-4 hover:underline";
