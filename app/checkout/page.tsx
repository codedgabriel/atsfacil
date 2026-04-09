"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { FORM_STORAGE_KEY, isFormEmpty, type ResumeData } from "@/lib/resume";

type PaymentResponse = {
  qr_code: string;
  qr_code_base64: string;
  payment_id: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ResumeData | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  const timerText = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const createPayment = useCallback(async (data: ResumeData) => {
    setLoading(true);
    setError("");
    setStatus("pending");
    setSecondsLeft(15 * 60);
    try {
      let userEmail = data.email;
      if (hasSupabaseEnv()) {
        const { data: userData } = await createBrowserClient().auth.getUser();
        userEmail = userData.user?.email || data.email;
      }
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, userName: data.nome_completo }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Erro ao gerar cobrança. Tente novamente.");
      setPayment(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar cobrança. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (!saved) {
      router.replace("/wizard");
      return;
    }
    const parsed = JSON.parse(saved) as ResumeData;
    if (isFormEmpty(parsed)) {
      router.replace("/wizard");
      return;
    }
    setFormData(parsed);
    createPayment(parsed);
  }, [createPayment, router]);

  useEffect(() => {
    if (!payment || status !== "pending") return;
    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/check-payment?id=${payment.payment_id}`);
      const payload = (await response.json()) as { status: "pending" | "approved" | "rejected" };
      setStatus(payload.status);
      if (payload.status === "approved") {
        window.setTimeout(() => router.replace(`/download?payment_id=${payment.payment_id}`), 1500);
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [payment, router, status]);

  useEffect(() => {
    if (!payment || status !== "pending") return;
    const interval = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [payment, status]);

  async function copyCode() {
    if (!payment) return;
    await navigator.clipboard.writeText(payment.qr_code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
        <div className="flex items-center gap-3 text-gray-700">
          <Spinner /> Gerando cobrança Pix...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-bold text-gray-950">Erro ao gerar cobrança</h1>
          <p className="mt-3 text-gray-600">{error}</p>
          <Button className="mt-6" onClick={() => formData && createPayment(formData)}>Tentar novamente</Button>
        </div>
      </main>
    );
  }

  if (!payment) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-200 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Pague com Pix</p>
        <h1 className="mt-3 text-4xl font-bold text-gray-950">R$ 4,90</h1>

        {secondsLeft === 0 ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">QR Code expirado</p>
            <Button className="mt-4" onClick={() => formData && createPayment(formData)}>
              <RotateCcw className="mr-2 h-4 w-4" /> Gerar novo código
            </Button>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${payment.qr_code_base64}`} alt="QR Code Pix" width={200} height={200} className="mx-auto mt-8 h-[200px] w-[200px]" />
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
              <p className="max-h-28 overflow-auto break-all font-mono text-xs text-gray-700">{payment.qr_code}</p>
              <Button type="button" variant="secondary" className="mt-4 w-full" onClick={copyCode}>
                <Copy className="mr-2 h-4 w-4" /> {copied ? "Copiado!" : "Copiar código Pix"}
              </Button>
            </div>
            <ol className="mt-6 space-y-2 text-left text-sm text-gray-600">
              <li>1. Abra o app do seu banco.</li>
              <li>2. Escolha Pix Copia e Cola ou escaneie o QR Code.</li>
              <li>3. Confirme o pagamento de R$4,90.</li>
              <li>4. Aguarde a confirmação automática.</li>
            </ol>
            <div className={`mt-6 text-lg font-bold ${secondsLeft < 120 ? "text-red-600" : "text-gray-950"}`}>{timerText}</div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-brand">
              {status === "pending" && <><Spinner className="h-4 w-4" /> Aguardando pagamento...</>}
              {status === "approved" && <span className="text-green-700">Pagamento confirmado!</span>}
              {status === "rejected" && <span className="text-red-700">Pagamento recusado</span>}
            </div>
            {status === "rejected" ? <Button className="mt-5 w-full" onClick={() => formData && createPayment(formData)}>Tentar novamente</Button> : null}
          </>
        )}
      </section>
    </main>
  );
}
