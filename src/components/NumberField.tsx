import type { ReactNode } from "react";

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export function NumberField({ label, value, onChange, prefix, suffix, placeholder }: NumberFieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</span>
      <div className="mt-1.5 flex items-center rounded-lg border border-ink-700 bg-ink-950 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition">
        {prefix && <span className="pl-3 text-sm text-ink-500">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          className="w-full min-w-0 bg-transparent py-2.5 px-3 text-sm font-medium text-ink-50 outline-none"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="pr-3 text-sm text-ink-500">{suffix}</span>}
      </div>
    </label>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</span>
      <input
        type="text"
        className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 px-3 text-sm font-medium text-ink-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</span>
      <select
        className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 px-3 text-sm font-medium text-ink-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

export function Card({
  title,
  icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-ink-800 bg-ink-900 p-5 shadow-sm shadow-black/20 ${className}`}>
      <h2 className="mb-4 flex items-center justify-between gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-300">
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {action}
      </h2>
      {children}
    </section>
  );
}
