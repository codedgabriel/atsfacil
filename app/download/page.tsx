"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { generatePDF } from "@/lib/generatePDF";
import {
  PHOTO_STORAGE_KEY,
  TEMPLATE_STORAGE_KEY,
  DEFAULT_PRINT_TEMPLATE_ID,
  type PrintTemplateId,
} from "@/lib/printTemplates";
import { FORM_STORAGE_KEY, type ResumeData } from "@/lib/resume";

function DownloadInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const mode = searchParams.get("mode");
  const [formData, setFormData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState<PrintTemplateId>(DEFAULT_PRINT_TEMPLATE_ID);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [downloadMode, setDownloadMode] = useState<"ats" | "print">("ats");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (!saved) {
        router.replace("/wizard");
        return;
      }

      setFormData(JSON.parse(saved));

      if (mode === "ats") {
        setDownloadMode("ats");
        setChecking(false);
        return;
      }

      if (mode === "print") {
        const savedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        const savedPhoto = localStorage.getItem(PHOTO_STORAGE_KEY);
        if (!savedTemplate || !savedTemplate.startsWith("print-") || !savedPhoto) {
          router.replace("/modelos");
          return;
        }

        setTemplateId(savedTemplate as PrintTemplateId);
        setPhotoDataUrl(savedPhoto);
        setDownloadMode("print");
        setChecking(false);
        return;
      }

      if (!paymentId) {
        router.replace("/checkout");
        return;
      }

      const savedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (!savedTemplate || !savedTemplate.startsWith("print-")) {
        router.replace("/modelos");
        return;
      }
      const savedPhoto = localStorage.getItem(PHOTO_STORAGE_KEY);
      if (!savedPhoto) {
        router.replace("/modelos");
        return;
      }

      const response = await fetch(`/api/check-payment?id=${paymentId}`);
      const payload = (await response.json()) as { status: string };

      if (payload.status !== "approved") {
        router.replace("/checkout");
        return;
      }

      setTemplateId(savedTemplate as PrintTemplateId);
      setPhotoDataUrl(savedPhoto);
      setDownloadMode("print");
      setChecking(false);
    }

    check();
  }, [mode, paymentId, router]);

  if (checking) {
    return (
      <main id="main-content" className="flex h-[100svh] items-center justify-center overflow-hidden bg-white px-5">
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
          <Spinner />
          Conferindo acesso...
        </div>
      </main>
    );
  }

  const isPrintMode = downloadMode === "print";

  return (
    <main id="main-content" className="flex h-[100svh] items-center justify-center overflow-hidden bg-white px-4 py-6 sm:px-6">
      <section className="w-full max-w-2xl border-y border-slate-200 py-8 text-center sm:py-10">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {isPrintMode ? "Impressão liberada" : "ATS liberado"}
        </div>

        <h1 className="mt-5 text-4xl font-bold text-slate-950 text-balance sm:text-5xl">
          {isPrintMode ? "Seu currículo está pronto." : "Seu currículo ATS está pronto."}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
          {isPrintMode
            ? "O ATS continua incluso e a versão para impressão com foto já pode ser baixada separadamente."
            : "Baixe agora a versão ATS gratuita. Se quiser uma versão para impressão com foto, escolha um modelo depois."}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              if (!formData) return;
              generatePDF(formData, { templateId: "ats-clean" });
            }}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Baixar ATS
          </Button>

          {isPrintMode ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                if (!formData) return;
                generatePDF(formData, { templateId, photoDataUrl });
              }}
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Baixar impressão
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-2 text-sm leading-6 text-slate-600 sm:grid-cols-2">
          <p>Gerado localmente no navegador.</p>
          <p>Problemas? atscurriculosaas@gmail.com</p>
        </div>
      </section>
    </main>
  );
}

export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-[100svh] items-center justify-center overflow-hidden bg-white px-5">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
            <Spinner />
            Carregando...
          </div>
        </main>
      }
    >
      <DownloadInner />
    </Suspense>
  );
}
