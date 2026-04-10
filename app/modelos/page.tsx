"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";
import { formatPriceBRL } from "@/lib/pricing";
import { FORM_STORAGE_KEY, getResumeLinks, isFormEmpty, normalizeResumeData, type ResumeData } from "@/lib/resume";

type ResumeTemplate = {
  id: string;
  name: string;
  label: string;
  type: "ats" | "print";
  accentClass: string;
  layout: "ats" | "left-photo" | "top-photo" | "right-photo" | "banner-photo" | "compact-photo";
};

const TEMPLATE_STORAGE_KEY = "atsfacil_template";
const DEFAULT_PRINT_TEMPLATE_ID = "print-executivo";

const atsResumeTemplate: ResumeTemplate = {
  id: "ats-clean",
  name: "ATSFácil",
  label: "Modelo ATS",
  type: "ats",
  accentClass: "bg-blue-600",
  layout: "ats",
};

const printResumeTemplates: ResumeTemplate[] = [
  { id: "print-executivo", name: "Executivo", label: "Impressão", type: "print", accentClass: "bg-slate-900", layout: "left-photo" },
  { id: "print-editorial", name: "Editorial", label: "Impressão", type: "print", accentClass: "bg-emerald-700", layout: "top-photo" },
  { id: "print-tecnologia", name: "Tecnologia", label: "Impressão", type: "print", accentClass: "bg-blue-700", layout: "right-photo" },
  { id: "print-design", name: "Design", label: "Impressão", type: "print", accentClass: "bg-rose-600", layout: "banner-photo" },
  { id: "print-comercial", name: "Comercial", label: "Impressão", type: "print", accentClass: "bg-cyan-700", layout: "compact-photo" },
  { id: "print-administrativo", name: "Administrativo", label: "Impressão", type: "print", accentClass: "bg-zinc-700", layout: "left-photo" },
  { id: "print-estatistico", name: "Estatístico", label: "Impressão", type: "print", accentClass: "bg-teal-700", layout: "right-photo" },
  { id: "print-academico", name: "Acadêmico", label: "Impressão", type: "print", accentClass: "bg-indigo-700", layout: "top-photo" },
  { id: "print-minimal", name: "Minimal", label: "Impressão", type: "print", accentClass: "bg-neutral-950", layout: "compact-photo" },
  { id: "print-projetos", name: "Projetos", label: "Impressão", type: "print", accentClass: "bg-green-700", layout: "banner-photo" },
  { id: "print-analista", name: "Analista", label: "Impressão", type: "print", accentClass: "bg-sky-700", layout: "left-photo" },
  { id: "print-gestao", name: "Gestão", label: "Impressão", type: "print", accentClass: "bg-red-700", layout: "right-photo" },
  { id: "print-dev", name: "Desenvolvedor", label: "Impressão", type: "print", accentClass: "bg-violet-700", layout: "compact-photo" },
  { id: "print-marketing", name: "Marketing", label: "Impressão", type: "print", accentClass: "bg-pink-700", layout: "banner-photo" },
  { id: "print-operacoes", name: "Operações", label: "Impressão", type: "print", accentClass: "bg-lime-700", layout: "top-photo" },
  { id: "print-consultor", name: "Consultor", label: "Impressão", type: "print", accentClass: "bg-stone-800", layout: "left-photo" },
];

const allTemplates = [atsResumeTemplate, ...printResumeTemplates];
const printTemplateIds = new Set(printResumeTemplates.map((template) => template.id));

function previewText(formData: ResumeData | null) {
  return {
    name: formData?.nome_completo || "Seu nome",
    role: formData?.cargo_desejado || "Cargo desejado",
    contact: formData ? [formData.email, formData.telefone, formData.cidade].filter(Boolean).join(" | ") : "email | telefone | cidade",
  };
}

function Line({ className = "" }: { className?: string }) {
  return <span className={`block h-1.5 rounded-full bg-slate-200 ${className}`} />;
}

function PhotoSlot({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex shrink-0 items-center justify-center border border-slate-300 bg-white text-slate-400 ${compact ? "h-10 w-10" : "h-14 w-14"}`}>
      <Camera className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
    </div>
  );
}

function TemplatePreview({ template, formData }: { template: ResumeTemplate; formData: ResumeData | null }) {
  const text = previewText(formData);

  if (template.layout === "ats") {
    return (
      <div className="flex aspect-[3/4] min-h-0 flex-col border border-slate-200 bg-white p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-950">{text.name}</p>
        <p className="mt-1 truncate text-[8px] text-slate-500">{text.contact}</p>
        <div className="mt-4 border-t border-slate-900 pt-2 text-left">
          <p className="text-[8px] font-bold uppercase text-slate-950">Resumo</p>
          <Line className="mt-2 w-full" />
          <Line className="mt-1 w-10/12" />
          <Line className="mt-1 w-8/12" />
        </div>
        <div className="mt-4 border-t border-slate-900 pt-2 text-left">
          <p className="text-[8px] font-bold uppercase text-slate-950">Experiência</p>
          <Line className="mt-2 w-11/12" />
          <Line className="mt-1 w-full" />
          <Line className="mt-1 w-7/12" />
        </div>
        <div className="mt-auto border-t border-slate-900 pt-2 text-left">
          <p className="text-[8px] font-bold uppercase text-slate-950">Habilidades</p>
          <Line className="mt-2 w-full" />
          <Line className="mt-1 w-9/12" />
        </div>
      </div>
    );
  }

  const photo = <PhotoSlot compact={template.layout === "compact-photo"} />;

  if (template.layout === "top-photo") {
    return (
      <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-3">
          {photo}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold text-slate-950">{text.name}</p>
            <p className="truncate text-[8px] font-medium text-slate-500">{text.role}</p>
          </div>
        </div>
        <div className={`mt-3 h-1.5 w-16 rounded-full ${template.accentClass}`} />
        <Line className="mt-4 w-full" />
        <Line className="mt-1 w-9/12" />
        <Line className="mt-5 w-full" />
        <Line className="mt-1 w-11/12" />
        <Line className="mt-1 w-7/12" />
      </div>
    );
  }

  if (template.layout === "right-photo") {
    return (
      <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold text-slate-950">{text.name}</p>
            <p className="truncate text-[8px] text-slate-500">{text.role}</p>
          </div>
          {photo}
        </div>
        <div className={`mt-4 h-14 w-full ${template.accentClass}`} />
        <Line className="mt-4 w-10/12" />
        <Line className="mt-1 w-full" />
        <Line className="mt-5 w-9/12" />
        <Line className="mt-1 w-11/12" />
      </div>
    );
  }

  if (template.layout === "banner-photo") {
    return (
      <div className="aspect-[3/4] border border-slate-200 bg-white">
        <div className={`h-14 ${template.accentClass}`} />
        <div className="-mt-7 flex justify-center">{photo}</div>
        <div className="p-3 text-center">
          <p className="truncate text-[10px] font-bold text-slate-950">{text.name}</p>
          <p className="truncate text-[8px] text-slate-500">{text.role}</p>
          <Line className="mx-auto mt-4 w-10/12" />
          <Line className="mx-auto mt-1 w-full" />
          <Line className="mx-auto mt-1 w-8/12" />
          <Line className="mx-auto mt-5 w-full" />
          <Line className="mx-auto mt-1 w-9/12" />
        </div>
      </div>
    );
  }

  if (template.layout === "compact-photo") {
    return (
      <div className="aspect-[3/4] border border-slate-200 bg-white p-3">
        <div className={`h-1.5 w-full rounded-full ${template.accentClass}`} />
        <div className="mt-3 flex items-center gap-3">
          {photo}
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold text-slate-950">{text.name}</p>
            <p className="truncate text-[8px] text-slate-500">{text.role}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-[1fr_2fr] gap-3">
          <div className="space-y-1">
            <Line className="w-full" />
            <Line className="w-9/12" />
            <Line className="w-11/12" />
          </div>
          <div className="space-y-1">
            <Line className="w-full" />
            <Line className="w-10/12" />
            <Line className="w-full" />
            <Line className="w-8/12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-[3/4] border border-slate-200 bg-white">
      <div className={`w-12 ${template.accentClass}`} />
      <div className="flex-1 p-3">
        {photo}
        <p className="mt-3 truncate text-[10px] font-bold text-slate-950">{text.name}</p>
        <p className="truncate text-[8px] text-slate-500">{text.role}</p>
        <Line className="mt-4 w-full" />
        <Line className="mt-1 w-10/12" />
        <Line className="mt-5 w-full" />
        <Line className="mt-1 w-8/12" />
      </div>
    </div>
  );
}

function TemplateOption({
  template,
  selected,
  formData,
  onSelect,
}: {
  template: ResumeTemplate;
  selected: boolean;
  formData: ResumeData | null;
  onSelect: (templateId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      aria-pressed={selected}
      className={`group min-w-0 rounded-lg border p-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 ${
        selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-400"
      }`}
    >
      <TemplatePreview template={template} formData={formData} />
      <div className="mt-3 flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">{template.name}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {template.type === "ats" ? template.label : `${template.label} · Espaço para foto`}
          </p>
        </div>
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"
          }`}
          aria-hidden="true"
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

export default function ModelosPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_PRINT_TEMPLATE_ID);

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (!saved) {
      router.replace("/wizard");
      return;
    }

    try {
      const parsed = normalizeResumeData(JSON.parse(saved) as ResumeData);
      if (isFormEmpty(parsed)) {
        router.replace("/wizard");
        return;
      }
      setFormData(parsed);
    } catch {
      router.replace("/wizard");
    }

    const savedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (savedTemplate && printTemplateIds.has(savedTemplate)) {
      setSelectedTemplate(savedTemplate);
    }
  }, [router]);

  const currentTemplate = useMemo(
    () => allTemplates.find((template) => template.id === selectedTemplate) ?? printResumeTemplates[0],
    [selectedTemplate],
  );

  function selectTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, templateId);
  }

  function goCheckout() {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, selectedTemplate);
    router.push("/checkout");
  }

  return (
    <main id="main-content" className="h-[100svh] overflow-hidden bg-white px-4 py-3 sm:px-6 sm:py-5">
      <div className="mx-auto grid h-full min-h-0 max-w-7xl gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          <button
            type="button"
            onClick={() => router.push("/wizard")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para revisão
          </button>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Modelos do currículo</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 text-balance">Escolha a impressão.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">O ATS já vai junto. Escolha a versão com foto.</p>

          <div className="mt-3 border-y border-slate-200 py-2">
            <p className="text-sm font-semibold text-slate-950">ATS incluso</p>
            <div className="mt-2 max-w-[140px]">
              <TemplateOption template={atsResumeTemplate} selected formData={formData} onSelect={() => undefined} />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">+ {currentTemplate.name} com foto.</p>
          </div>

          <Button type="button" className="mt-4 w-full" onClick={goCheckout}>
            Continuar para Pix · {formatPriceBRL()}
          </Button>
          <p className="mt-2 flex items-center gap-2 text-sm leading-6 text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            Seu conteúdo continua salvo no navegador.
          </p>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col">
          <div className="shrink-0 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Galeria</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Currículos para impressão</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-slate-500">Escolha o modelo de impressão que vai baixar junto com o ATS.</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {printResumeTemplates.map((template) => (
                <TemplateOption
                  key={template.id}
                  template={template}
                  selected={selectedTemplate === template.id}
                  formData={formData}
                  onSelect={selectTemplate}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
