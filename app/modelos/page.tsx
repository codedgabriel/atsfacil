"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";
import { PhotoUploadModal } from "@/components/PhotoUploadModal";
import { PrintTemplatePreview } from "@/components/PrintTemplatePreview";
import {
  DEFAULT_PRINT_TEMPLATE_ID,
  PHOTO_STORAGE_KEY,
  TEMPLATE_STORAGE_KEY,
  getPrintTemplate,
  isPrintTemplateId,
  printResumeTemplates,
} from "@/lib/printTemplates";
import { FORM_STORAGE_KEY, isFormEmpty, normalizeResumeData, type ResumeData } from "@/lib/resume";

const atsResumeTemplate = {
  id: "ats-clean",
  name: "ATSFácil",
  label: "Modelo ATS",
};

function AtsPreview({ formData }: { formData: ResumeData | null }) {
  const contact = formData ? [formData.email, formData.telefone, formData.cidade].filter(Boolean).join(" | ") : "email | telefone | cidade";

  return (
    <div className="flex aspect-[3/4] min-h-0 flex-col border border-slate-200 bg-white p-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-950">{formData?.nome_completo || "Seu nome"}</p>
      <p className="mt-1 truncate text-[8px] text-slate-500">{contact}</p>
      <div className="mt-4 border-t border-slate-900 pt-2 text-left">
        <p className="text-[8px] font-bold uppercase text-slate-950">Resumo</p>
        <span className="mt-2 block h-1.5 w-full rounded-full bg-slate-200" />
        <span className="mt-1 block h-1.5 w-10/12 rounded-full bg-slate-200" />
        <span className="mt-1 block h-1.5 w-8/12 rounded-full bg-slate-200" />
      </div>
      <div className="mt-4 border-t border-slate-900 pt-2 text-left">
        <p className="text-[8px] font-bold uppercase text-slate-950">Experiência</p>
        <span className="mt-2 block h-1.5 w-11/12 rounded-full bg-slate-200" />
        <span className="mt-1 block h-1.5 w-full rounded-full bg-slate-200" />
        <span className="mt-1 block h-1.5 w-7/12 rounded-full bg-slate-200" />
      </div>
      <div className="mt-auto border-t border-slate-900 pt-2 text-left">
        <p className="text-[8px] font-bold uppercase text-slate-950">Habilidades</p>
        <span className="mt-2 block h-1.5 w-full rounded-full bg-slate-200" />
        <span className="mt-1 block h-1.5 w-9/12 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

function TemplateOption({
  templateId,
  title,
  label,
  selected,
  formData,
  onSelect,
}: {
  templateId: string;
  title: string;
  label: string;
  selected: boolean;
  formData: ResumeData | null;
  onSelect: (templateId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(templateId)}
      aria-pressed={selected}
      className={`group min-w-0 rounded-lg border p-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 ${
        selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-400"
      }`}
    >
      <PrintTemplatePreview templateId={templateId} formData={formData} />
      <div className="mt-3 flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{label}</p>
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

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Nao foi possivel carregar a imagem."));
    image.src = dataUrl;
  });
}

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie uma imagem em PNG, JPG ou WebP.");
  }

  const rawDataUrl = await readAsDataUrl(file);
  const image = await loadImage(rawDataUrl);
  const maxSide = 960;
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nao foi possivel preparar a imagem.");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export default function ModelosPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateForCheckout, setSelectedTemplateForCheckout] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

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
      return;
    }

    const savedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (savedTemplate && isPrintTemplateId(savedTemplate)) {
      setSelectedTemplate(savedTemplate);
    } else {
      setSelectedTemplate(DEFAULT_PRINT_TEMPLATE_ID);
    }

    const savedPhoto = localStorage.getItem(PHOTO_STORAGE_KEY);
    if (savedPhoto) setPhotoDataUrl(savedPhoto);
  }, [router]);

  const currentTemplate = useMemo(
    () => (selectedTemplate ? getPrintTemplate(selectedTemplate) : null),
    [selectedTemplate],
  );

  function selectTemplate(templateId: string) {
    setSelectedTemplate((current) => (current === templateId ? null : templateId));
  }

  function goAtsDownload() {
    router.push("/download?mode=ats");
  }

  function openPhotoModal() {
    if (!selectedTemplate) return;
    setSelectedTemplateForCheckout(selectedTemplate);
    setPhotoError("");
    setPhotoModalOpen(true);
  }

  function closePhotoModal() {
    setPhotoModalOpen(false);
    setPhotoError("");
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPhotoBusy(true);
      setPhotoError("");
      const optimized = await optimizeImage(file);
      setPhotoDataUrl(optimized);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Nao foi possivel processar a foto.");
    } finally {
      setPhotoBusy(false);
      event.target.value = "";
    }
  }

  function removePhoto() {
    setPhotoDataUrl("");
    localStorage.removeItem(PHOTO_STORAGE_KEY);
  }

  function confirmPhotoAndContinue() {
    if (!selectedTemplateForCheckout) return;
    if (!photoDataUrl) {
      setPhotoError("Adicione uma foto para continuar com a versao de impressao.");
      return;
    }

    localStorage.setItem(TEMPLATE_STORAGE_KEY, selectedTemplateForCheckout);
    localStorage.setItem(PHOTO_STORAGE_KEY, photoDataUrl);
    router.push("/download?mode=print");
  }

  return (
    <>
      <main id="main-content" className="h-[100svh] overflow-hidden bg-white px-4 py-3 sm:px-6 sm:py-5">
        <div className="mx-auto grid h-full min-h-0 max-w-7xl gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
          <aside className="flex min-h-0 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-200 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
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
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O ATS gratuito já está liberado. Se quiser, você também pode liberar uma versão para impressão com foto sem sair daqui.
            </p>

            <div className="mt-3 border-y border-slate-200 py-2">
              <p className="text-sm font-semibold text-slate-950">ATS incluso</p>
              <div className="mt-2 max-w-[140px]">
                <AtsPreview formData={formData} />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {currentTemplate ? `Impressão adicionada: ${currentTemplate.name}.` : "A versão para impressão é opcional."}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <Button type="button" variant="secondary" className="w-full" onClick={goAtsDownload}>
                Baixar ATS grátis
              </Button>
              <Button type="button" className="w-full" onClick={openPhotoModal} disabled={!selectedTemplate}>
                Liberar impressão grátis
              </Button>
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3 text-sm leading-6 text-slate-500">
              <p>{photoDataUrl ? "Foto pronta e salva neste navegador." : "A foto será pedida antes de liberar a versão para impressão."}</p>
              <p className="mt-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                Seu conteúdo continua salvo no navegador.
              </p>
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-col">
            <div className="shrink-0 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Galeria</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Currículos para impressão</h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-slate-500">
                Cada modelo tem uma composição própria e recebe a sua foto antes do download final.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {printResumeTemplates.map((template) => (
                  <TemplateOption
                    key={template.id}
                    templateId={template.id}
                    title={template.name}
                    label={`${template.label} · Espaço para foto`}
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

      <PhotoUploadModal
        open={photoModalOpen}
        templateName={selectedTemplateForCheckout ? getPrintTemplate(selectedTemplateForCheckout).name : "Impressão"}
        photoDataUrl={photoDataUrl}
        error={photoError}
        busy={photoBusy}
        onClose={closePhotoModal}
        onFileChange={handlePhotoChange}
        onRemove={removePhoto}
        onConfirm={confirmPhotoAndContinue}
      />
    </>
  );
}
