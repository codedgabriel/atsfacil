"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Lock, QrCode, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { formatPriceBRL } from "@/lib/pricing";
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
      <main id="main-content" className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
          <Spinner />
          Gerando cobrança Pix…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center px-5 py-10">
        <section className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-red-600">Cobrança indisponível</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 text-balance">Não deu para gerar o Pix agora.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{error}</p>
          <Button className="mt-6" onClick={() => formData && createPayment(formData)}>
            Tentar Novamente
          </Button>
        </section>
      </main>
    );
  }

  if (!payment) return null;

  return (
    <main id="main-content" className="min-h-screen px-5 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand">Pague com Pix</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950">{formatPriceBRL()}</h1>
              <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
                Escaneie o QR Code ou copie o código Pix. A confirmação é automática e o download libera logo depois.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              ID do pagamento <span className="font-semibold text-slate-950">{payment.payment_id}</span>
            </div>
          </div>

          {secondsLeft === 0 ? (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-red-700">Código expirado</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">Seu QR Code venceu.</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Gere um novo código para continuar o pagamento sem precisar preencher tudo de novo.
              </p>
              <Button className="mt-6" onClick={() => formData && createPayment(formData)}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Gerar Novo Código
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <QrCode className="h-4 w-4 text-brand" aria-hidden="true" />
                  QR Code Pix
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${payment.qr_code_base64}`}
                  alt="QR Code Pix para pagamento"
                  width={200}
                  height={200}
                  className="mx-auto mt-5 h-[200px] w-[200px] rounded-2xl bg-white p-2"
                />
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Pix Copia e Cola</p>
                    <div
                      aria-live="polite"
                      className="min-h-5 text-right text-xs font-medium text-emerald-700"
                    >
                      {copied ? "Código copiado." : ""}
                    </div>
                  </div>
                  <p className="mt-4 max-h-28 overflow-auto break-all rounded-2xl bg-white p-4 font-mono text-xs text-slate-700 shadow-inner">
                    {payment.qr_code}
                  </p>
                  <Button type="button" variant="secondary" className="mt-4 w-full" onClick={copyCode}>
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                    {copied ? "Copiado" : "Copiar Código Pix"}
                  </Button>
                </div>

                <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Tempo restante</p>
                    <p className={`mt-3 text-4xl font-bold tabular-nums ${secondsLeft < 120 ? "text-red-600" : "text-slate-950"}`}>{timerText}</p>
                  </div>

                  <div aria-live="polite" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Status</p>
                    <div className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-brand">
                      {status === "pending" ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Aguardando pagamento…
                        </>
                      ) : null}
                      {status === "approved" ? <span className="text-emerald-700">Pagamento confirmado!</span> : null}
                      {status === "rejected" ? <span className="text-red-700">Pagamento recusado.</span> : null}
                    </div>
                    {status === "rejected" ? (
                      <Button className="mt-4 w-full" onClick={() => formData && createPayment(formData)}>
                        Tentar Novamente
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Como pagar</p>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <li>1. Abra o app do seu banco.</li>
                    <li>2. Escaneie o QR Code ou toque em copiar o código Pix.</li>
                    <li>3. Confirme o valor de {formatPriceBRL()}.</li>
                    <li>4. Aguarde a confirmação automática para liberar o PDF.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
            <Lock className="h-4 w-4" aria-hidden="true" />
            Pagamento único
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-950 text-balance">Seu currículo fica salvo no navegador até o download.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Quando o pagamento aprovar, você segue direto para a tela de download sem preencher tudo outra vez.
          </p>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-950">Boas práticas aplicadas</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Rotas sem cache, validação do ID do pagamento e geração do PDF isolada no navegador após aprovação.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
