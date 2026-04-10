import { ArrowRight, FileText, Lock, ShieldCheck } from "lucide-react";
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

const proofPoints = ["+500 candidatos", "Pix em segundos", "Sem assinatura", "PDF gerado no navegador"];

const howItWorks = [
  {
    title: "Preencha",
    description: "Dados pessoais, cargo, experiências, formação, habilidades, idiomas e cursos em etapas curtas.",
  },
  {
    title: "Revise",
    description: "Confira o conteúdo em uma tela limpa antes de seguir para o pagamento.",
  },
  {
    title: "Baixe",
    description: `Pague ${formatPriceBRL()} via Pix e receba o PDF ATS pronto para usar.`,
  },
];

const principles = [
  {
    title: "Formato ATS Aprovado",
    description: "Currículo em coluna única, com hierarquia simples e sem elementos que atrapalham leitores automáticos.",
  },
  {
    title: "Edição Sem Ruído",
    description: "O wizard mostra apenas a etapa atual para manter foco no conteúdo, não no layout.",
  },
  {
    title: "Pagamento Pontual",
    description: "Você preenche e revisa sem pagar. O Pix entra só quando o currículo estiver pronto para download.",
  },
];

export default function Home() {
  const priceLabel = formatPriceBRL();

  return (
    <main id="main-content" className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <EnvBanner />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-slate-950" translate="no">
                  ATSFácil
                </span>
                <span className="border border-blue-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-600">
                  Novo
                </span>
              </div>
              <p className="text-sm text-slate-500">Currículo ATS em minutos</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-sm font-medium text-slate-600 md:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Respostas protegidas
          </div>
        </div>
      </header>

      <section className="relative min-h-[620px] border-b border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=80"
          alt="Mesa de trabalho com documentos, notebook e caneta"
          width={1800}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-white/88" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[620px] max-w-6xl items-end px-5 py-12 sm:px-6 sm:py-16">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-blue-600">Currículo ATS em minutos</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 text-balance sm:text-6xl">
              Monte um currículo profissional sem brigar com layout.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              Preencha seus dados passo a passo, revise com calma e baixe um PDF objetivo para passar pelos filtros automáticos das empresas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <GoogleButton className="w-full sm:w-auto">
                Criar Meu Currículo Grátis
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </GoogleButton>
              <p className="text-sm font-medium text-slate-600">Você só paga {priceLabel} no momento do download.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-0 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {proofPoints.map((item) => (
            <div key={item} className="border-b border-slate-200 py-5 text-sm font-semibold text-slate-700 sm:border-r lg:border-b-0">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-blue-600">Como Funciona</p>
            <h2 className="mt-4 max-w-xl text-3xl font-bold text-slate-950 text-balance sm:text-4xl">
              O caminho é curto porque cada etapa tem uma função clara.
            </h2>
          </div>

          <ol className="border-t border-slate-200">
            {howItWorks.map((step, index) => (
              <li key={step.title} className="grid gap-4 border-b border-slate-200 py-6 sm:grid-cols-[80px_minmax(0,1fr)]">
                <span className="text-sm font-semibold tabular-nums text-blue-600">0{index + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
              alt="Pessoa trabalhando em um notebook com anotações ao lado"
              width={1400}
              height={900}
              className="h-auto w-full rounded-lg object-cover"
              loading="lazy"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-blue-600">Editor Minimalista</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-950 text-balance sm:text-4xl">
              Menos caixas na tela. Mais atenção no que o recrutador vai ler.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              O preenchimento guia você por uma superfície limpa, com divisores leves, campos objetivos e revisão final antes do pagamento.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-blue-600">Por Que Funciona</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-950 text-balance sm:text-4xl">
              Direto para sistemas ATS e confortável para leitura humana.
            </h2>
          </div>

          <div className="border-t border-slate-200">
            {principles.map((feature) => (
              <article key={feature.title} className="border-b border-slate-200 py-6">
                <h3 className="text-xl font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-emerald-700">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Pagamento único via Pix
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-950 text-balance sm:text-4xl">
              Revise primeiro. Pague {priceLabel} só para baixar.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Sem mensalidade, sem plano escondido e sem travar o preenchimento antes da revisão.
            </p>
          </div>

          <div className="min-w-[240px] border-t border-slate-200 pt-6 lg:border-l lg:border-t-0 lg:pl-8">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Preço Atual</p>
            <p className="mt-3 text-5xl font-bold text-slate-950">{priceLabel}</p>
            <p className="mt-2 text-sm text-slate-500">Pagamento único · Sem assinatura</p>
            <GoogleButton className="mt-6 w-full">Começar Agora</GoogleButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 sm:px-6">
        © 2025 <span translate="no">ATSFácil</span> · Feito por D.G
      </footer>
    </main>
  );
}
