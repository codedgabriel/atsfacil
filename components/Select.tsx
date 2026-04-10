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
      <span className="mb-1.5 block text-sm font-medium text-gray-800">{label}</span>
      <select
        id={inputId}
        name={name ?? inputId}
        autoComplete={autoComplete}
        className={clsx(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-950 shadow-sm outline-none transition-colors duration-200 focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-blue-100",
          error ? "border-red-400" : "border-gray-300",
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
      {error ? <span aria-live="polite" className="mt-1.5 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
