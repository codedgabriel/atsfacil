import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-800">{label}</span>
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-blue-100",
          error ? "border-red-400" : "border-gray-300",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
