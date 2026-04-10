"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Edit3, Lock, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ProgressBar } from "@/components/ProgressBar";
import { Select } from "@/components/Select";
import { StepCard } from "@/components/StepCard";
import { TagInput } from "@/components/TagInput";
import { Textarea } from "@/components/Textarea";
import { formatPriceBRL } from "@/lib/pricing";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import {
  additionalLinkTypes,
  buildAdditionalLinkUrl,
  buildLinkedInUrl,
  defaultResumeData,
  educationLevels,
  emptyAdditionalLink,
  emptyCourse,
  emptyEducation,
  emptyExperience,
  emptyLanguage,
  FORM_STORAGE_KEY,
  getAdditionalLinkInputValue,
  getAdditionalLinkPrefix,
  getLinkedInHandle,
  getResumeLinks,
  languageLevels,
  softSkillSuggestions,
  technicalSkillSuggestions,
  type AdditionalLink,
  type Course,
  type Education,
  type Experience,
  type Language,
  type ResumeData,
} from "@/lib/resume";

type Errors = Record<string, string>;

const totalSteps = 8;

function formatMonthYearInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatYearInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

function isCurrentValue(value: string, label: string) {
  return value.trim().toLowerCase() === label.toLowerCase();
}

function focusFirstInvalidField() {
  window.setTimeout(() => {
    const firstInvalid = document.querySelector<HTMLElement>("[aria-invalid='true']");
    firstInvalid?.focus();
  }, 0);
}

export default function WizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ResumeData>(() => defaultResumeData());
  const [errors, setErrors] = useState<Errors>({});
  const [hydrated, setHydrated] = useState(false);

  const steps = useMemo(
    () => [
      "Dados Pessoais",
      "Cargo e Resumo",
      "Experiencia Profissional",
      "Formacao Academica",
      "Habilidades",
      "Idiomas",
      "Cursos e Certificacoes",
      "Revisao",
    ],
    [],
  );

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (!saved) {
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<ResumeData>;
      setFormData({
        ...defaultResumeData(),
        ...parsed,
        links_adicionais: parsed.links_adicionais ?? [],
      });
    } catch {
      localStorage.removeItem(FORM_STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData, hydrated]);

  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    createBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        const email = data.user?.email;
        if (email) {
          setFormData((current) => ({ ...current, email: current.email || email }));
        }
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hydrated]);

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setFormData((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[String(key)];
      return next;
    });
  }

  function updateList<T extends Experience | Education | Language | Course | AdditionalLink>(
    key: keyof ResumeData,
    id: string,
    patch: Partial<T>,
  ) {
    setFormData((current) => ({
      ...current,
      [key]: (current[key] as T[]).map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function removeListItem<T extends Experience | Education | Language | Course | AdditionalLink>(key: keyof ResumeData, id: string) {
    setFormData((current) => ({
      ...current,
      [key]: (current[key] as T[]).filter((item) => item.id !== id),
    }));
  }

  function validate(step = currentStep) {
    const next: Errors = {};

    if (step === 0) {
      if (!formData.nome_completo.trim()) next.nome_completo = "Informe seu nome completo.";
      if (!formData.email.trim()) next.email = "Informe seu email.";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) next.email = "Informe um email valido.";
      if (formData.estado && formData.estado.length !== 2) next.estado = "Use a sigla com 2 letras.";
    }

    if (step === 1) {
      if (!formData.cargo_desejado.trim()) next.cargo_desejado = "Informe o cargo desejado.";
      if (!formData.resumo_profissional.trim()) next.resumo_profissional = "Escreva um resumo profissional.";
    }

    if (step === 2 && !formData.sem_experiencia) {
      formData.experiencias.forEach((item, index) => {
        if (!item.empresa.trim()) next[`experiencias.${index}.empresa`] = "Informe a empresa.";
        if (!item.cargo.trim()) next[`experiencias.${index}.cargo`] = "Informe o cargo.";
      });
    }

    if (step === 3) {
      formData.formacoes.forEach((item, index) => {
        if (!item.curso.trim()) next[`formacoes.${index}.curso`] = "Informe o curso.";
        if (!item.instituicao.trim()) next[`formacoes.${index}.instituicao`] = "Informe a instituicao.";
      });
    }

    if (step === 5) {
      formData.idiomas.forEach((item, index) => {
        if (!item.idioma.trim()) next[`idiomas.${index}.idioma`] = "Informe o idioma.";
      });
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function nextStep() {
    if (!validate()) {
      focusFirstInvalidField();
      return;
    }
    setCurrentStep((value) => Math.min(value + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  function goReviewOrNext() {
    if (currentStep === totalSteps - 2) {
      if (!validate()) {
        focusFirstInvalidField();
        return;
      }
      setCurrentStep(totalSteps - 1);
      return;
    }
    nextStep();
  }

  function goCheckout() {
    if (!validate(0) || !validate(1) || !validate(2) || !validate(3) || !validate(5)) {
      focusFirstInvalidField();
      return;
    }
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    router.push("/checkout");
  }

  const linkedInHandle = getLinkedInHandle(formData.linkedin);

  return (
    <main id="main-content" className="min-h-screen px-5 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft lg:block">
            <button type="button" className="text-left" onClick={() => router.push("/")}>
              <span className="text-lg font-bold text-slate-950" translate="no">
                ATSFácil
              </span>
            </button>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-brand">Etapa Atual</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 text-balance">{steps[currentStep]}</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Seus dados ficam salvos automaticamente no navegador, então você pode seguir etapa por etapa sem perder o que já preencheu.
            </p>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Resumo Rápido</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Fluxo em 8 passos, com revisão final antes do pagamento.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Campos essenciais, links úteis e blocos dinâmicos para experiência, cursos e idiomas.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>PDF ATS liberado por {formatPriceBRL()} em pagamento único.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-950">Experiência mais segura</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Validação por etapa, aviso antes de sair da página e checagem do pagamento antes do download.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <button type="button" className="text-left" onClick={() => router.push("/")}>
                  <span className="text-xl font-bold text-slate-950" translate="no">
                    ATSFácil
                  </span>
                </button>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                  {steps[currentStep]}
                </span>
              </div>
              <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
            </div>

            <StepCard className="max-w-none">
          {currentStep === 0 ? (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-gray-950">Dados Pessoais</h1>
              <Input label="Nome completo" value={formData.nome_completo} onChange={(e) => update("nome_completo", e.target.value)} error={errors.nome_completo} />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
              <Input label="Telefone" value={formData.telefone} onChange={(e) => update("telefone", e.target.value)} />
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <Input label="Cidade" value={formData.cidade} onChange={(e) => update("cidade", e.target.value)} />
                <Input label="Estado" maxLength={2} value={formData.estado} onChange={(e) => update("estado", e.target.value.toUpperCase())} error={errors.estado} />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-800">
                  LinkedIn <span className="font-normal text-gray-500">(opcional)</span>
                </span>
                <div className="flex overflow-hidden rounded-lg border border-gray-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="flex items-center bg-gray-50 px-3 text-sm text-gray-500">linkedin.com/in/</span>
                  <input
                    className="w-full border-0 px-3 py-2.5 text-sm text-gray-950 outline-none"
                    placeholder="seu-perfil"
                    value={linkedInHandle}
                    onChange={(e) => update("linkedin", buildLinkedInUrl(e.target.value))}
                  />
                </div>
              </div>

              <Input label="Portfolio" type="url" value={formData.portfolio} onChange={(e) => update("portfolio", e.target.value)} />

              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-950">Outros links uteis</h2>
                    <p className="text-sm text-gray-500">Adicione GitHub, GitLab, Behance, site pessoal ou qualquer link relevante.</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => formData.links_adicionais.length < 5 && update("links_adicionais", [...formData.links_adicionais, emptyAdditionalLink()])}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar link
                  </Button>
                </div>

                {formData.links_adicionais.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum link extra adicionado.</p>
                ) : (
                  formData.links_adicionais.map((link) => {
                    const prefix = getAdditionalLinkPrefix(link.tipo);
                    const inputValue = getAdditionalLinkInputValue(link.tipo, link.url);

                    return (
                      <div key={link.id} className="space-y-3 rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <Select
                            label="Tipo"
                            options={additionalLinkTypes}
                            value={link.tipo}
                            onChange={(e) =>
                              updateList<AdditionalLink>("links_adicionais", link.id, {
                                tipo: e.target.value as AdditionalLink["tipo"],
                                url: buildAdditionalLinkUrl(e.target.value as AdditionalLink["tipo"], inputValue),
                              })
                            }
                            className="flex-1"
                          />
                          <button
                            type="button"
                            className="mt-7 text-gray-400 hover:text-red-600"
                            onClick={() => removeListItem<AdditionalLink>("links_adicionais", link.id)}
                            aria-label="Remover link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div>
                          <span className="mb-1.5 block text-sm font-medium text-gray-800">Link</span>
                          <div className="flex overflow-hidden rounded-lg border border-gray-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-blue-100">
                            {prefix ? <span className="flex items-center bg-gray-50 px-3 text-sm text-gray-500">{prefix.replace(/^https?:\/\//, "")}</span> : null}
                            <input
                              className="w-full border-0 px-3 py-2.5 text-sm text-gray-950 outline-none"
                              placeholder={prefix ? "seu-usuario" : "https://seusite.com"}
                              value={inputValue}
                              onChange={(e) => updateList<AdditionalLink>("links_adicionais", link.id, { url: buildAdditionalLinkUrl(link.tipo, e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-gray-950">Cargo e Resumo</h1>
              <Input
                label="Cargo desejado"
                placeholder="Ex: Desenvolvedor Full Stack"
                value={formData.cargo_desejado}
                onChange={(e) => update("cargo_desejado", e.target.value)}
                error={errors.cargo_desejado}
              />
              <Textarea
                label="Resumo profissional"
                rows={4}
                maxLength={500}
                placeholder="Escreva 2-3 frases sobre voce e seus objetivos"
                value={formData.resumo_profissional}
                onChange={(e) => update("resumo_profissional", e.target.value)}
                error={errors.resumo_profissional}
              />
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-950">Experiencia Profissional</h1>
                <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.sem_experiencia}
                    onChange={(e) => {
                      update("sem_experiencia", e.target.checked);
                      if (e.target.checked) update("experiencias", []);
                      if (!e.target.checked && formData.experiencias.length === 0) update("experiencias", [emptyExperience()]);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-brand"
                  />
                  Nao tenho experiencia profissional ainda
                </label>
              </div>
              {!formData.sem_experiencia ? (
                <>
                  {formData.experiencias.map((item, index) => (
                    <div key={item.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="font-semibold text-gray-950">Experiencia {index + 1}</h2>
                        <button type="button" className="text-gray-400 hover:text-red-600" onClick={() => removeListItem<Experience>("experiencias", item.id)} aria-label="Remover experiencia">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Input label="Empresa" value={item.empresa} onChange={(e) => updateList<Experience>("experiencias", item.id, { empresa: e.target.value })} error={errors[`experiencias.${index}.empresa`]} />
                      <Input label="Cargo" value={item.cargo} onChange={(e) => updateList<Experience>("experiencias", item.id, { cargo: e.target.value })} error={errors[`experiencias.${index}.cargo`]} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Data inicio"
                          placeholder="MM/AAAA"
                          inputMode="numeric"
                          maxLength={7}
                          value={formatMonthYearInput(item.data_inicio)}
                          onChange={(e) => updateList<Experience>("experiencias", item.id, { data_inicio: formatMonthYearInput(e.target.value) })}
                        />
                        <Input
                          label="Data fim"
                          placeholder="MM/AAAA"
                          inputMode="numeric"
                          maxLength={7}
                          disabled={isCurrentValue(item.data_fim, "Atual")}
                          value={isCurrentValue(item.data_fim, "Atual") ? "" : formatMonthYearInput(item.data_fim)}
                          onChange={(e) => updateList<Experience>("experiencias", item.id, { data_fim: formatMonthYearInput(e.target.value) })}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={isCurrentValue(item.data_fim, "Atual")}
                          onChange={(e) => updateList<Experience>("experiencias", item.id, { data_fim: e.target.checked ? "Atual" : "" })}
                          className="h-4 w-4 rounded border-gray-300 text-brand"
                        />
                        Trabalho atual
                      </label>
                      <Textarea label="Descricao" rows={3} placeholder="Descreva responsabilidades e conquistas com verbos de acao" value={item.descricao} onChange={(e) => updateList<Experience>("experiencias", item.id, { descricao: e.target.value })} />
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => formData.experiencias.length < 5 && update("experiencias", [...formData.experiencias, emptyExperience()])}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar experiencia
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-gray-950">Formacao Academica</h1>
              {formData.formacoes.map((item, index) => (
                <div key={item.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-gray-950">Formacao {index + 1}</h2>
                    <button type="button" className="text-gray-400 hover:text-red-600" onClick={() => removeListItem<Education>("formacoes", item.id)} aria-label="Remover formacao">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input label="Curso" value={item.curso} onChange={(e) => updateList<Education>("formacoes", item.id, { curso: e.target.value })} error={errors[`formacoes.${index}.curso`]} />
                  <Input label="Instituicao" value={item.instituicao} onChange={(e) => updateList<Education>("formacoes", item.id, { instituicao: e.target.value })} error={errors[`formacoes.${index}.instituicao`]} />
                  <Select label="Nivel" options={educationLevels} value={item.nivel} onChange={(e) => updateList<Education>("formacoes", item.id, { nivel: e.target.value })} />
                  <Input
                    label="Data de conclusao"
                    placeholder="MM/AAAA"
                    inputMode="numeric"
                    maxLength={7}
                    disabled={isCurrentValue(item.data_conclusao, "Em andamento")}
                    value={isCurrentValue(item.data_conclusao, "Em andamento") ? "" : formatMonthYearInput(item.data_conclusao)}
                    onChange={(e) => updateList<Education>("formacoes", item.id, { data_conclusao: formatMonthYearInput(e.target.value) })}
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={isCurrentValue(item.data_conclusao, "Em andamento")}
                      onChange={(e) => updateList<Education>("formacoes", item.id, { data_conclusao: e.target.checked ? "Em andamento" : "" })}
                      className="h-4 w-4 rounded border-gray-300 text-brand"
                    />
                    Em andamento
                  </label>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => formData.formacoes.length < 3 && update("formacoes", [...formData.formacoes, emptyEducation()])}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar formacao
              </Button>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="space-y-7">
              <h1 className="text-2xl font-bold text-gray-950">Habilidades</h1>
              <TagInput
                label="Habilidades Tecnicas"
                tags={formData.habilidades_tecnicas}
                onChange={(tags) => update("habilidades_tecnicas", tags)}
                placeholder="Ex: React, Python, Excel…"
                suggestions={technicalSkillSuggestions}
              />
              <TagInput
                label="Habilidades Comportamentais"
                tags={formData.habilidades_comportamentais}
                onChange={(tags) => update("habilidades_comportamentais", tags)}
                placeholder="Ex: Lideranca, Comunicacao…"
                suggestions={softSkillSuggestions}
              />
            </div>
          ) : null}

          {currentStep === 5 ? (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-gray-950">Idiomas</h1>
              {formData.idiomas.map((item, index) => (
                <div key={item.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-gray-950">Idioma {index + 1}</h2>
                    <button type="button" className="text-gray-400 hover:text-red-600" onClick={() => removeListItem<Language>("idiomas", item.id)} aria-label="Remover idioma">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input label="Idioma" value={item.idioma} onChange={(e) => updateList<Language>("idiomas", item.id, { idioma: e.target.value })} error={errors[`idiomas.${index}.idioma`]} />
                  <Select label="Nivel" options={languageLevels} value={item.nivel} onChange={(e) => updateList<Language>("idiomas", item.id, { nivel: e.target.value })} />
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => formData.idiomas.length < 5 && update("idiomas", [...formData.idiomas, emptyLanguage()])}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar idioma
              </Button>
            </div>
          ) : null}

          {currentStep === 6 ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-950">Cursos e Certificacoes</h1>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">opcional</span>
              </div>
              {formData.cursos.map((item, index) => (
                <div key={item.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-gray-950">Curso {index + 1}</h2>
                    <button type="button" className="text-gray-400 hover:text-red-600" onClick={() => removeListItem<Course>("cursos", item.id)} aria-label="Remover curso">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input label="Nome do curso" value={item.nome_curso} onChange={(e) => updateList<Course>("cursos", item.id, { nome_curso: e.target.value })} />
                  <Input label="Instituicao" value={item.instituicao} onChange={(e) => updateList<Course>("cursos", item.id, { instituicao: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Ano"
                      inputMode="numeric"
                      maxLength={4}
                      value={formatYearInput(item.ano)}
                      onChange={(e) => updateList<Course>("cursos", item.id, { ano: formatYearInput(e.target.value) })}
                    />
                    <Input label="Carga horaria" placeholder="Ex: 40h" value={item.carga_horaria} onChange={(e) => updateList<Course>("cursos", item.id, { carga_horaria: e.target.value })} />
                  </div>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => formData.cursos.length < 6 && update("cursos", [...formData.cursos, emptyCourse()])}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar curso
              </Button>
              <button type="button" onClick={() => setCurrentStep(7)} className="block text-sm font-semibold text-brand hover:text-blue-700">
                Pular esta etapa →
              </button>
            </div>
          ) : null}

          {currentStep === 7 ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-medium text-gray-500">Previa</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-950">{formData.nome_completo || "Seu nome"}</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {[formData.email, formData.telefone, `${formData.cidade}${formData.estado ? `-${formData.estado}` : ""}`].filter(Boolean).join(" | ")}
                </p>
                <p className="mt-3 font-semibold text-brand">{formData.cargo_desejado || "Cargo desejado"}</p>
              </div>

              {[
                ["Dados pessoais", 0, [formData.nome_completo, formData.email, ...getResumeLinks(formData)].filter(Boolean).join(" · ")],
                ["Cargo e resumo", 1, `${formData.cargo_desejado} · ${formData.resumo_profissional}`],
                ["Experiencia", 2, formData.sem_experiencia ? "Sem experiencia profissional" : `${formData.experiencias.length} item(ns)`],
                ["Formacao", 3, `${formData.formacoes.length} item(ns)`],
                ["Habilidades", 4, [...formData.habilidades_tecnicas, ...formData.habilidades_comportamentais].join(", ")],
                ["Idiomas", 5, `${formData.idiomas.length} item(ns)`],
                ["Cursos", 6, formData.cursos.length ? `${formData.cursos.length} item(ns)` : "Opcional"],
              ].map(([title, step, summary]) => (
                <details key={String(title)} className="rounded-lg border border-gray-200 p-4" open={Number(step) < 2}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-gray-950">
                    {title}
                    <button type="button" onClick={() => setCurrentStep(Number(step))} className="text-brand" aria-label={`Editar ${title}`}>
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </summary>
                  <p className="mt-3 break-words text-sm leading-6 text-gray-600">{summary || "Nao preenchido"}</p>
                </details>
              ))}

              <Button type="button" className="w-full" onClick={goCheckout}>
                Gerar meu curriculo por {formatPriceBRL()}
              </Button>
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                <Lock className="h-4 w-4" /> Pagamento unico via Pix · Sem assinatura
              </p>
            </div>
          ) : null}
            </StepCard>

            {currentStep < 7 ? (
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button type="button" variant="ghost" onClick={previousStep} disabled={currentStep === 0}>
                  Voltar
                </Button>
                <Button type="button" onClick={goReviewOrNext}>
                  {currentStep === 6 ? "Revisar curriculo" : "Proximo"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
