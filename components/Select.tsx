import clsx from "clsx";
import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: string[];
};

export function Select({ label, error, className, options, id, name, autoComplete = "off", ...props }: SelectProps) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <select
        id={inputId}
        name={name ?? inputId}
        autoComplete={autoComplete}
        className={clsx(
          "w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm text-slate-950 outline-none transition-[border-color,box-shadow,color] duration-200 focus-visible:border-brand focus-visible:ring-0",
          error ? "border-red-500" : "border-slate-300",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <span aria-live="polite" className="mt-2 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
