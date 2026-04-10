"use client";

import { CircleHelp } from "lucide-react";
import { useId, useRef, useState } from "react";

type HelpTipProps = {
  label: string;
  children: string;
};

type TooltipPosition = {
  top: number;
  left: number;
  width: number;
};

export function HelpTip({ label, children }: HelpTipProps) {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  function showTooltip() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const margin = 12;
    const width = Math.min(256, window.innerWidth - margin * 2);
    const left = Math.min(Math.max(rect.right - width, margin), window.innerWidth - width - margin);
    const top = Math.min(rect.bottom + 8, window.innerHeight - margin);

    setPosition({ top, left, width });
  }

  function hideTooltip() {
    setPosition(null);
  }

  return (
    <span className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Dica ATS para ${label}`}
        aria-describedby={position ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onClick={(event) => {
          hideTooltip();
          event.currentTarget.blur();
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {position ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium leading-5 text-slate-700 shadow-sm"
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
          }}
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
