import { ArrowRight, CheckCircle2, FileText, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { GoogleButton } from "@/components/GoogleButton";
import { formatPriceBRL } from "@/lib/pricing";
import { hasSupabaseEnv } from "@/lib/supabase";

function EnvBanner() {
  if (hasSupabaseEnv()) return null;

  return (
    <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-3 text-center text-sm font-medium text-yellow-900" aria-live="polite">
      Login temporariamente indisponível: configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
    </div>
  );
}

const howItWorks = [
  {
    title: "Preencha com calma",
    description: "O wizard organiza seus dados em etapas curtas, com validação e salvamento automático.",
  },
  {
    title: `Pague ${formatPriceBRL()}`,
    description: "Pagamento único via Pix, sem assinatura escondida e sem travas depois do download.",
  },
  {
    title: "Baixe na hora",
    description: "Assim que o Pix for confirmado, o PDF ATS é gerado no seu navegador.",
  },
];

const featureGroups = [
  {
    title: "Feito para triagem automática",
    description: "Uma estrutura direta, em coluna única, pronta para leitores ATS sem sacrificar clareza para recrutadores.",
  },
  {
    title: "Fluxo guiado de verdade",
    description: "Cada passo mostra só o que importa agora, reduz o cansaço e evita campos soltos demais.",
  },
  {
    title: "Pagamento e geração isolados",
    description: "Sessões protegidas, respostas sem cache nas rotas de pagamento e PDF gerado localmente depois da aprovação.",
  },
];

const trustPoints = ["Já ajudamos +500 candidatos", "Pix em segundos", "Sem assinatura", "Sem instalar nada"];

export default function Home() {
  const priceLabel = formatPriceBRL();

  return (
    <main id="main-content" className="min-h-screen">
      <EnvBanner />

      <header className="border-b border-slate-200/80 bg-white/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white shadow-soft">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-950" translate="no">
                  ATSFácil
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand">
                  Novo
                </span>
              </div>
              <p className="text-sm text-slate-500">Currículo ATS em minutos</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-sm text-slate-500 md:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Respostas protegidas
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-brand">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {trustPoints[0]}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 text-balance sm:text-6xl">
            Monte um currículo ATS com cara profissional sem se perder em layout.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
            Preencha seus dados passo a passo, pague {priceLabel} e baixe um currículo objetivo, legível e pronto para passar pelos filtros automáticos das empresas.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <GoogleButton className="w-full sm:w-auto">
              Criar Meu Currículo Grátis
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </GoogleButton>
            <div className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600">
              Você só paga no momento do download.
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {trustPoints.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80"
              alt="Pessoa revisando currículo no notebook em um ambiente de trabalho"
              width={1400}
              height={900}
              className="h-full min-h-[320px] w-full object-cover"
              fetchPriority="high"
            />
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand">O que muda no fluxo</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 text-balance">Menos bagunça visual, mais foco no conteúdo que faz diferença.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Em vez de formular um currículo em uma tela lotada, você vai preenchendo blocos curtos, revisa tudo no final e só então libera o PDF final.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "Dados organizados por etapa",
                "Campos dinâmicos para experiências, cursos e idiomas",
                "PDF simples, direto e compatível com ATS",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand">Como Funciona</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950 text-balance sm:text-4xl">Do primeiro dado ao PDF final em 3 movimentos.</h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {howItWorks.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{index + 1}</div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand">Por Que Funciona</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 text-balance sm:text-4xl">A experiência foi refeita para ficar limpa, rápida e tranquila de usar.</h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {featureGroups.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Pagamento único via Pix
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950 text-balance sm:text-4xl">Tudo pronto para você baixar por {priceLabel}.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Sem mensalidade, sem conta premium e sem travar o preenchimento. O valor entra só quando o currículo já estiver revisado.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-7 text-left lg:min-w-[260px]">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Preço Atual</p>
            <p className="mt-3 text-5xl font-bold text-slate-950">{priceLabel}</p>
            <p className="mt-2 text-sm text-slate-500">Pagamento único · Sem assinatura</p>
            <GoogleButton className="mt-6 w-full">Começar Agora</GoogleButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 sm:px-6">
        © 2025 ATSFácil · Feito por D.G
      </footer>
    </main>
  );
}
