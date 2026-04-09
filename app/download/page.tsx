"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
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
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
        <div className="flex items-center gap-3 text-gray-700">
          <Spinner /> Conferindo pagamento...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-5 text-3xl font-bold text-gray-950">Seu currículo está pronto!</h1>
        <p className="mt-3 text-gray-600">Obrigado pelo pagamento. Clique abaixo para baixar.</p>
        <Button className="mt-8 w-full" onClick={() => formData && generatePDF(formData)}>
          Baixar currículo em PDF
        </Button>
        <p className="mt-6 text-sm text-gray-600">Tem algum problema? fale@atsfacil.com.br</p>
        <p className="mt-2 text-xs text-gray-500">O arquivo é gerado localmente no seu navegador.</p>
      </section>
    </main>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center"><Spinner /></main>}>
      <DownloadInner />
    </Suspense>
  );
}
