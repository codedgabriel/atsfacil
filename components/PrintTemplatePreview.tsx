"use client";

import type { CSSProperties } from "react";
import { Camera } from "lucide-react";
import { getPrintTemplate, type PrintTemplate } from "@/lib/printTemplates";
import type { ResumeData } from "@/lib/resume";

function previewText(formData: ResumeData | null) {
  return {
    name: formData?.nome_completo || "Seu nome",
    role: formData?.cargo_desejado || "Cargo desejado",
    contact: formData ? [formData.email, formData.telefone, formData.cidade].filter(Boolean).join(" | ") : "email | telefone | cidade",
  };
}

function Line({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span className={`block h-1.5 rounded-full bg-slate-200 ${className}`} style={style} />;
}

function PhotoSlot({
  shape,
  compact = false,
}: {
  shape: PrintTemplate["photoShape"];
  compact?: boolean;
}) {
  const shapeClass =
    shape === "wide"
      ? "h-10 w-16 rounded-lg"
      : shape === "portrait"
        ? "h-14 w-10 rounded-md"
        : shape === "soft"
          ? "rounded-lg"
          : "rounded-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-slate-300 bg-white text-slate-400 ${compact ? "h-10 w-10" : "h-14 w-14"} ${shapeClass}`}
    >
      <Camera className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
    </div>
  );
}

type PreviewProps = {
  templateId: string;
  formData: ResumeData | null;
};

export function PrintTemplatePreview({ templateId, formData }: PreviewProps) {
  const template = getPrintTemplate(templateId);
  const text = previewText(formData);
  const accentStyle = { backgroundColor: template.accentHex };
  const surfaceStyle = { backgroundColor: template.surfaceHex };
  const inkStyle = { color: template.inkHex };

  switch (template.previewVariant) {
    case "executive":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="h-2 w-full" style={accentStyle} />
          <div className="mt-3 flex gap-3">
            <PhotoSlot shape={template.photoShape} />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <p className="truncate text-[8px] text-slate-500">{text.role}</p>
              <Line className="mt-3 w-20" />
              <Line className="mt-1 w-16" />
            </div>
          </div>
          <div className="mt-5 border-t border-slate-300 pt-3">
            <Line className="w-full" />
            <Line className="mt-1 w-10/12" />
            <Line className="mt-4 w-full" />
            <Line className="mt-1 w-8/12" />
          </div>
        </div>
      );

    case "editorial":
      return (
        <div className="aspect-[3/4] border border-slate-200 p-3" style={surfaceStyle}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-slate-500">Editorial</p>
              <p className="mt-2 truncate text-[11px] font-bold" style={inkStyle}>
                {text.name}
              </p>
            </div>
            <PhotoSlot shape={template.photoShape} />
          </div>
          <div className="mt-4 h-6 w-full rounded-md" style={accentStyle} />
          <Line className="mt-4 w-full" />
          <Line className="mt-1 w-11/12" />
          <Line className="mt-1 w-7/12" />
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Line className="w-full" />
            <Line className="w-full" />
          </div>
        </div>
      );

    case "technology":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <p className="mt-1 truncate text-[8px] text-slate-500">{text.contact}</p>
            </div>
            <PhotoSlot shape={template.photoShape} compact />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1">
            <div className="col-span-2 h-10 rounded-md" style={accentStyle} />
            <div className="rounded-md border border-slate-200" style={surfaceStyle} />
          </div>
          <div className="mt-4 space-y-1.5">
            <Line className="w-full" />
            <Line className="w-9/12" />
            <Line className="w-11/12" />
          </div>
        </div>
      );

    case "design":
      return (
        <div className="aspect-[3/4] overflow-hidden border border-slate-200 bg-white">
          <div className="h-12 w-full" style={accentStyle} />
          <div className="-mt-4 px-3">
            <PhotoSlot shape={template.photoShape} />
          </div>
          <div className="px-3 pt-2">
            <p className="truncate text-[11px] font-bold" style={inkStyle}>
              {text.name}
            </p>
            <p className="truncate text-[8px] text-slate-500">{text.role}</p>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex h-4 w-10 rounded-full" style={accentStyle} />
              <span className="inline-flex h-4 w-16 rounded-full bg-slate-200" />
            </div>
            <Line className="mt-4 w-full" />
            <Line className="mt-1 w-10/12" />
          </div>
        </div>
      );

    case "commercial":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <PhotoSlot shape={template.photoShape} compact />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <div className="mt-2 h-1 w-full" style={accentStyle} />
              <div className="mt-1 h-1 w-8/12 bg-slate-200" />
            </div>
          </div>
          <div className="mt-5 rounded-md border border-slate-200 p-2" style={surfaceStyle}>
            <Line className="w-full" />
            <Line className="mt-1 w-9/12" />
            <Line className="mt-4 w-full" />
            <Line className="mt-1 w-7/12" />
          </div>
        </div>
      );

    case "administrative":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="grid grid-cols-[1fr_40px] gap-3">
            <div className="min-w-0">
              <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-500">Administrativo</p>
              <p className="mt-2 truncate text-[10px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <p className="truncate text-[8px] text-slate-500">{text.role}</p>
            </div>
            <PhotoSlot shape={template.photoShape} compact />
          </div>
          <div className="mt-4 border-t border-dashed border-slate-300 pt-3">
            <Line className="w-full" />
            <Line className="mt-1 w-8/12" />
            <Line className="mt-4 w-full" />
            <Line className="mt-1 w-10/12" />
          </div>
        </div>
      );

    case "statistical":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="grid grid-cols-[1fr_44px] gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <div className="mt-3 grid grid-cols-4 gap-1">
                <span className="h-6 rounded-sm" style={accentStyle} />
                <span className="h-4 rounded-sm bg-slate-200" />
                <span className="h-8 rounded-sm bg-slate-300" />
                <span className="h-5 rounded-sm bg-slate-200" />
              </div>
            </div>
            <PhotoSlot shape={template.photoShape} compact />
          </div>
          <Line className="mt-4 w-full" />
          <Line className="mt-1 w-10/12" />
          <Line className="mt-1 w-7/12" />
        </div>
      );

    case "academic":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="mx-auto h-1.5 w-16 rounded-full" style={accentStyle} />
          <div className="mt-3 flex flex-col items-center gap-3 text-center">
            <PhotoSlot shape={template.photoShape} />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <p className="text-[8px] text-slate-500">{text.role}</p>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-3">
            <Line className="mx-auto w-full" />
            <Line className="mx-auto mt-1 w-9/12" />
            <Line className="mx-auto mt-4 w-11/12" />
          </div>
        </div>
      );

    case "minimal":
      return (
        <div className="aspect-[3/4] border border-slate-300 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <p className="mt-1 text-[8px] text-slate-500">{text.contact}</p>
            </div>
            <PhotoSlot shape={template.photoShape} compact />
          </div>
          <div className="mt-4 border-t border-slate-900 pt-3">
            <Line className="w-full bg-slate-300" />
            <Line className="mt-1 w-10/12 bg-slate-300" />
            <Line className="mt-5 w-full bg-slate-300" />
          </div>
        </div>
      );

    case "projects":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="rounded-lg p-3" style={surfaceStyle}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold" style={inkStyle}>
                  {text.name}
                </p>
                <p className="truncate text-[8px] text-slate-500">{text.role}</p>
              </div>
              <PhotoSlot shape={template.photoShape} compact />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="h-14 rounded-md" style={accentStyle} />
            <div className="col-span-2 rounded-md border border-slate-200 p-2">
              <Line className="w-full" />
              <Line className="mt-1 w-10/12" />
            </div>
          </div>
          <Line className="mt-4 w-11/12" />
        </div>
      );

    case "analyst":
      return (
        <div className="flex aspect-[3/4] border border-slate-200 bg-white">
          <div className="w-8" style={accentStyle} />
          <div className="flex-1 p-3">
            <PhotoSlot shape={template.photoShape} compact />
            <p className="mt-3 truncate text-[10px] font-bold" style={inkStyle}>
              {text.name}
            </p>
            <p className="truncate text-[8px] text-slate-500">{text.role}</p>
            <Line className="mt-4 w-full" />
            <Line className="mt-1 w-8/12" />
            <Line className="mt-4 w-10/12" />
          </div>
        </div>
      );

    case "management":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <PhotoSlot shape={template.photoShape} />
            <div className="min-w-0 text-right">
              <p className="truncate text-[11px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <p className="truncate text-[8px] text-slate-500">{text.role}</p>
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full" style={accentStyle} />
          <div className="mt-4 space-y-1.5">
            <Line className="ml-auto w-full" />
            <Line className="ml-auto w-10/12" />
            <Line className="ml-auto w-8/12" />
          </div>
        </div>
      );

    case "developer":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-slate-950 p-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold">{text.name}</p>
              <p className="truncate text-[8px] text-slate-300">{text.role}</p>
            </div>
            <PhotoSlot shape={template.photoShape} compact />
          </div>
          <div className="mt-4 rounded-md bg-white/10 p-2">
            <Line className="w-full bg-white/40" />
            <Line className="mt-1 w-10/12 bg-white/30" />
          </div>
          <div className="mt-3 rounded-md bg-white/10 p-2">
            <Line className="w-11/12 bg-white/30" />
            <Line className="mt-1 w-full bg-white/40" />
          </div>
        </div>
      );

    case "marketing":
      return (
        <div className="aspect-[3/4] overflow-hidden border border-slate-200 bg-white">
          <div className="grid grid-cols-[1.2fr_0.8fr]">
            <div className="p-3" style={surfaceStyle}>
              <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-500">Brand</p>
              <p className="mt-2 truncate text-[11px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <Line className="mt-4 w-full" />
              <Line className="mt-1 w-8/12" />
            </div>
            <div className="flex items-center justify-center" style={accentStyle}>
              <PhotoSlot shape={template.photoShape} compact />
            </div>
          </div>
          <div className="p-3">
            <Line className="w-full" />
            <Line className="mt-1 w-11/12" />
            <Line className="mt-4 w-9/12" />
          </div>
        </div>
      );

    case "operations":
      return (
        <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
          <div className="flex gap-2">
            <div className="w-2 rounded-full" style={accentStyle} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold" style={inkStyle}>
                    {text.name}
                  </p>
                  <p className="truncate text-[8px] text-slate-500">{text.role}</p>
                </div>
                <PhotoSlot shape={template.photoShape} compact />
              </div>
              <Line className="mt-4 w-full" />
              <Line className="mt-1 w-9/12" />
              <Line className="mt-4 w-10/12" />
            </div>
          </div>
        </div>
      );

    case "consulting":
      return (
        <div className="aspect-[3/4] border border-stone-200 bg-white p-3">
          <div className="flex items-start gap-3">
            <PhotoSlot shape={template.photoShape} />
            <div className="min-w-0">
              <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-stone-500">Consultoria</p>
              <p className="mt-2 truncate text-[10px] font-bold" style={inkStyle}>
                {text.name}
              </p>
              <p className="truncate text-[8px] text-slate-500">{text.contact}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-stone-300 pt-3">
            <Line className="w-full" style={{ backgroundColor: template.accentHex }} />
            <Line className="mt-1 w-10/12" />
            <Line className="mt-4 w-full" />
            <Line className="mt-1 w-8/12" />
          </div>
        </div>
      );
  }
}
