"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, QrCode, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { PHOTO_STORAGE_KEY, TEMPLATE_STORAGE_KEY } from "@/lib/printTemplates";
import { formatPriceBRL } from "@/lib/pricing";
import { FORM_STORAGE_KEY, isFormEmpty, type ResumeData } from "@/lib/resume";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

type PaymentResponse = {
  qr_code: string;
  qr_code_base64: string;
  payment_id: string;
};

function formatTemplateName(templateId: string) {
  return templateId
    .replace(/^print-/, "")
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export default function CheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
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

      if (!response.ok) {
        throw new Error(payload.error || "Erro ao gerar cobrança. Tente novamente.");
      }

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

    setSelectedTemplate(savedTemplate);
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

    const interval = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

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
      <main id="main-content" className="flex h-[100svh] items-center justify-center overflow-hidden bg-white px-5 py-10">
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
          <Spinner />
          Gerando cobrança Pix...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main id="main-content" className="flex h-[100svh] items-center justify-center overflow-hidden bg-white px-5 py-10">
        <section className="w-full max-w-lg border-y border-slate-200 py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-red-600">Cobrança indisponível</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 text-balance">Não deu para gerar o Pix agora.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{error}</p>
          <Button className="mt-6" onClick={() => formData && createPayment(formData)}>
            Tentar novamente
          </Button>
        </section>
      </main>
    );
  }

  if (!payment) return null;

  return (
    <main id="main-content" className="h-[100svh] overflow-hidden bg-white px-4 py-3 sm:px-6 sm:py-5">
      <section className="mx-auto flex h-full max-w-5xl flex-col">
        <div className="shrink-0 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand">Adicionar impressão</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{formatPriceBRL()}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className={`tabular-nums ${secondsLeft < 120 ? "text-red-600" : "text-slate-950"}`}>{timerText}</span>
              <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
              <span aria-live="polite" className={status === "approved" ? "text-emerald-700" : status === "rejected" ? "text-red-700" : "text-brand"}>
                {status === "pending" ? "Aguardando pagamento" : null}
                {status === "approved" ? "Pagamento confirmado" : null}
                {status === "rejected" ? "Pagamento recusado" : null}
              </span>
            </div>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            O ATS continua gratuito. Aqui você paga apenas pela versão para impressão com foto, liberada assim que o Pix confirmar.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:py-5">
          {secondsLeft === 0 ? (
            <div className="border-y border-red-200 bg-red-50 px-1 py-6 sm:px-4">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-red-700">Código expirado</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">Seu QR Code venceu.</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Gere um novo código para continuar o pagamento sem precisar preencher tudo de novo.
              </p>
              <Button className="mt-6" onClick={() => formData && createPayment(formData)}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Gerar novo código
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
              <div className="border-b border-slate-200 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <QrCode className="h-4 w-4 text-brand" aria-hidden="true" />
                  QR Code Pix
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${payment.qr_code_base64}`}
                  alt="QR Code Pix para pagamento"
                  width={180}
                  height={180}
                  className="mx-auto mt-4 h-[180px] w-[180px] bg-white p-1"
                />
                <p className="mt-3 text-center text-xs leading-5 text-slate-500">ID {payment.payment_id}</p>
              </div>

              <div className="min-w-0 space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Pix copia e cola</p>
                    <div aria-live="polite" className="min-h-5 text-right text-xs font-medium text-emerald-700">
                      {copied ? "Código copiado." : ""}
                    </div>
                  </div>
                  <p className="mt-3 max-h-24 overflow-auto break-all border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700">
                    {payment.qr_code}
                  </p>
                  <Button type="button" variant="secondary" className="mt-3 w-full sm:w-auto" onClick={copyCode}>
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                    {copied ? "Copiado" : "Copiar código Pix"}
                  </Button>
                </div>

                <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="inline-flex min-h-10 items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-brand">
                    {status === "pending" ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Aguardando pagamento...
                      </>
                    ) : null}
                    {status === "approved" ? <span className="text-emerald-700">Pagamento confirmado!</span> : null}
                    {status === "rejected" ? <span className="text-red-700">Pagamento recusado.</span> : null}
                  </div>
                  {status === "rejected" ? (
                    <Button onClick={() => formData && createPayment(formData)}>
                      Tentar novamente
                    </Button>
                  ) : null}
                </div>

                <div className="text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-950">Como pagar:</p>
                  <ol className="mt-2 grid gap-1 sm:grid-cols-2">
                    <li>1. Abra o app do banco.</li>
                    <li>2. Escaneie ou copie o Pix.</li>
                    <li>3. Confirme {formatPriceBRL()}.</li>
                    <li>4. O ATS segue grátis e a impressão libera em seguida.</li>
                  </ol>
                  {selectedTemplate ? (
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                      Modelo selecionado: {formatTemplateName(selectedTemplate)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
