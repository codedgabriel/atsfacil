"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Download, ShieldCheck } from "lucide-react";
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
      <main id="main-content" className="flex min-h-screen items-center justify-center px-5">
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
          <Spinner />
          Conferindo pagamento…
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-4xl font-bold text-slate-950 text-balance">Seu currículo está pronto.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Obrigado pelo pagamento. O arquivo final é gerado localmente no seu navegador, então o download começa sem depender de um servidor de PDF.
            </p>

            <Button className="mt-8 w-full sm:w-auto" onClick={() => formData && generatePDF(formData)}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Baixar Currículo em PDF
            </Button>

            <p className="mt-6 text-sm text-slate-600">Tem algum problema? fale@atsfacil.com.br</p>
            <p className="mt-2 text-xs text-slate-500">O arquivo é gerado localmente no navegador e baixa em seguida.</p>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-950">Camada extra de segurança</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  O botão só aparece depois da verificação do pagamento, e o PDF é montado no navegador usando os dados salvos localmente.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-5">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
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
