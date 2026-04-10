import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className, id, name, autoComplete = "off", ...props }: InputProps) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <input
        id={inputId}
        name={name ?? inputId}
        autoComplete={autoComplete}
        className={clsx(
          "w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm text-slate-950 outline-none transition-[border-color,box-shadow,color] duration-200 placeholder:text-slate-400 focus-visible:border-brand focus-visible:ring-0",
          error ? "border-red-500" : "border-slate-300",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span aria-live="polite" className="mt-1.5 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
