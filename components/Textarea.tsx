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
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <textarea
        id={inputId}
        name={name ?? inputId}
        autoComplete={autoComplete}
        className={clsx(
          "min-h-28 w-full resize-y rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm text-slate-950 outline-none transition-[border-color,box-shadow,color] duration-200 placeholder:text-slate-400 focus-visible:border-brand focus-visible:ring-0",
          error ? "border-red-500" : "border-slate-300",
          className,
        )}
        maxLength={maxLength}
        value={value}
        aria-invalid={Boolean(error)}
        {...props}
      />
      <span className="mt-2 flex items-center justify-between gap-3 text-xs">
        {error ? <span aria-live="polite" className="font-medium text-red-600">{error}</span> : <span />}
        {maxLength ? <span className="text-slate-500 tabular-nums">{value.length}/{maxLength}</span> : null}
      </span>
    </label>
  );
}
