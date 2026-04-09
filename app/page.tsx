import { CheckCircle2, Download, FileText, Lock, Sparkles } from "lucide-react";
import { GoogleButton } from "@/components/GoogleButton";
import { hasSupabaseEnv } from "@/lib/supabase";

function EnvBanner() {
  if (hasSupabaseEnv()) return null;
  return (
    <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-3 text-center text-sm font-medium text-yellow-900">
      Login temporariamente indisponível: configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
    </div>
  );
}

export default function Home() {
  const features = [
    ["Formato ATS aprovado", "Estrutura limpa, direta e pensada para leitores automáticos."],
    ["Wizard passo a passo", "Cada etapa pede apenas o necessário para montar um currículo forte."],
    ["Download instantâneo", "Após o Pix, o PDF é gerado no seu navegador."],
  ];

  return (
    <main className="min-h-screen bg-white">
      <EnvBanner />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-950">ATSFácil</span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand">Novo</span>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pb-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 px-3 py-1 text-sm font-semibold text-brand">
            <Sparkles className="h-4 w-4" />
            Já ajudamos +500 candidatos
          </p>
          <h1 className="mt-7 max-w-3xl text-5xl font-bold tracking-tight text-gray-950 sm:text-6xl">Currículo ATS em minutos</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Preencha seus dados passo a passo, pague R$4,90 e baixe um currículo otimizado para passar pelos filtros automáticos das empresas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <GoogleButton className="w-full sm:w-auto">Criar meu currículo grátis</GoogleButton>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Prévia ATS</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-950">Ana Souza</h2>
            <p className="mt-1 text-sm text-gray-600">ana@email.com | São Paulo-SP</p>
          </div>
          <div className="space-y-5 py-5">
            {["Resumo Profissional", "Experiência Profissional", "Formação Acadêmica", "Habilidades"].map((title) => (
              <div key={title}>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-950">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  {title}
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100" />
                <div className="mt-2 h-2 w-3/4 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold text-gray-950">Como funciona</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Preencha", "Pague R$4,90", "Baixe o PDF"].map((step, index) => (
              <div key={step} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">{index + 1}</div>
                <h3 className="mt-5 text-xl font-bold text-gray-950">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-bold text-gray-950">Tudo no essencial</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map(([title, text]) => (
            <div key={title} className="rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-950">{title}</h3>
              <p className="mt-3 leading-7 text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="rounded-2xl border border-gray-200 p-8 text-center shadow-soft">
          <Lock className="mx-auto h-8 w-8 text-brand" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500">Pagamento único via Pix</p>
          <h2 className="mt-3 text-5xl font-bold text-gray-950">R$ 4,90</h2>
          <p className="mt-4 text-gray-600">Sem assinatura</p>
          <GoogleButton className="mt-8 w-full sm:w-auto">Criar meu currículo grátis</GoogleButton>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-5 py-8 text-center text-sm text-gray-500">
        © 2025 ATSFácil · Feito por D.G
      </footer>
    </main>
  );
}
