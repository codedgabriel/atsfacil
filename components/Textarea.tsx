import clsx from "clsx";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  maxLength?: number;
  value?: string;
};

export function Textarea({ label, error, className, maxLength, value = "", name, autoComplete = "off", ...props }: TextareaProps) {
  const inputId = props.id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-800">{label}</span>
      <textarea
        id={inputId}
        name={name ?? inputId}
        autoComplete={autoComplete}
        className={clsx(
          "w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-950 shadow-sm outline-none transition-colors duration-200 placeholder:text-gray-400 focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-blue-100",
          error ? "border-red-400" : "border-gray-300",
          className,
        )}
        maxLength={maxLength}
        value={value}
        aria-invalid={Boolean(error)}
        {...props}
      />
      <span className="mt-1.5 flex items-center justify-between gap-3 text-xs">
        {error ? <span aria-live="polite" className="font-medium text-red-600">{error}</span> : <span />}
        {maxLength ? <span className="text-gray-500 tabular-nums">{value.length}/{maxLength}</span> : null}
      </span>
    </label>
  );
}
