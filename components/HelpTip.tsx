"use client";

import { CircleHelp } from "lucide-react";
import { useId } from "react";

type HelpTipProps = {
  label: string;
  children: string;
};

export function HelpTip({ label, children }: HelpTipProps) {
  const tooltipId = useId();

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={`Dica ATS para ${label}`}
        aria-describedby={tooltipId}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 top-6 z-20 hidden w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium leading-5 text-slate-700 shadow-sm group-hover:block group-focus-within:block"
      >
        {children}
      </span>
    </span>
  );
}
