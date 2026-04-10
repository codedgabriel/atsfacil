"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { generatePDF } from "@/lib/generatePDF";
import { FORM_STORAGE_KEY, type ResumeData } from "@/lib/resume";

function DownloadInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const [formData, setFormData] = useState<ResumeData | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (!paymentId) {
        router.replace("/checkout");
        return;
      }

      const response = await fetch(`/api/check-payment?id=${paymentId}`);
      const payload = (await response.json()) as { status: string };

      if (payload.status !== "approved") {
        router.replace("/checkout");
        return;
      }

      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (!saved) {
        router.replace("/wizard");
        return;
      }

      setFormData(JSON.parse(saved));
      setChecking(false);
    }

    check();
  }, [paymentId, router]);

  if (checking) {
    return (
      <main id="main-content" className="flex h-[100svh] items-center justify-center overflow-hidden bg-white px-5">
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
          <Spinner />
          Conferindo pagamento…
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="flex h-[100svh] items-center justify-center overflow-hidden bg-white px-4 py-6 sm:px-6">
      <section className="w-full max-w-2xl border-y border-slate-200 py-8 text-center sm:py-10">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Pagamento confirmado
        </div>

        <h1 className="mt-5 text-4xl font-bold text-slate-950 text-balance sm:text-5xl">Seu currículo está pronto.</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
          Obrigado pelo pagamento. Clique abaixo para baixar seu PDF final.
        </p>

        <Button className="mt-8 w-full sm:w-auto" onClick={() => formData && generatePDF(formData)}>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Baixar currículo em PDF
        </Button>

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
            Carregando…
          </div>
        </main>
      }
    >
      <DownloadInner />
    </Suspense>
  );
}
