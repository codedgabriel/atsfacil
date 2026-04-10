"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ProgressBar } from "@/components/ProgressBar";
import { Select } from "@/components/Select";
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

const stepDefinitions = [
  {
    title: "Dados Pessoais",
    description: "Preencha seu cabeçalho profissional, contatos principais e links úteis para o currículo.",
  },
  {
    title: "Cargo e Resumo",
    description: "Defina o foco do currículo e resuma sua proposta de valor em poucas linhas objetivas.",
  },
  {
    title: "Experiência Profissional",
    description: "Liste as experiências mais relevantes com cargo, empresa, período e resultados.",
  },
  {
    title: "Formação Acadêmica",
    description: "Adicione sua formação principal com nível, instituição e status de conclusão.",
  },
  {
    title: "Habilidades",
    description: "Misture competências técnicas e comportamentais para refletir seu perfil completo.",
  },
  {
    title: "Idiomas",
    description: "Inclua idiomas e níveis de proficiência para enriquecer seu currículo.",
  },
  {
    title: "Cursos e Certificações",
    description: "Use esta etapa opcional para reforçar cursos livres, certificações e capacitações recentes.",
  },
  {
    title: "Revisão",
    description: "Revise o conteúdo final, volte em qualquer etapa e siga para o pagamento quando estiver tudo certo.",
  },
] as const;

const totalSteps = stepDefinitions.length;
const fieldLabelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";
const dividerClass = "border-t border-slate-200 pt-6";

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
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) next.email = "Informe um email válido.";
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
        if (!item.instituicao.trim()) next[`formacoes.${index}.instituicao`] = "Informe a instituição.";
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
    <main id="main-content" className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <header className="border-b border-slate-200 pb-6 sm:pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button type="button" className="text-left" onClick={() => router.push("/")}>
              <span className="text-xl font-bold text-slate-950" translate="no">
                ATSFácil
              </span>
            </button>
            <span className="text-sm font-medium text-slate-500">
              Passo {currentStep + 1} de {totalSteps}
            </span>
          </div>
          <div className="mt-5 max-w-3xl">
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
            <nav aria-label="Etapas do currículo">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Etapas</p>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {stepDefinitions.map((step, index) => {
                  const isCurrent = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <li key={step.title} aria-current={isCurrent ? "step" : undefined} className="border-b border-slate-200 pb-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            isCurrent
                              ? "bg-blue-600 text-white"
                              : isCompleted
                                ? "bg-blue-50 text-blue-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${isCurrent ? "text-slate-950" : "text-slate-600"}`}>{step.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {isCurrent ? "Etapa atual" : isCompleted ? "Preenchido" : "A seguir"}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="space-y-3 border-t border-slate-200 pt-6 text-sm leading-7 text-slate-600">
              <p>Seus dados ficam salvos automaticamente no navegador durante todo o preenchimento.</p>
              <p>O PDF ATS é liberado por {formatPriceBRL()} em pagamento único via Pix.</p>
            </div>
          </aside>

          <section aria-labelledby="step-heading" className="min-w-0">
            <div className="max-w-3xl">
              <div className="border-b border-slate-200 pb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Passo {currentStep + 1}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h1 id="step-heading" className="text-3xl font-bold text-slate-950 text-balance sm:text-4xl">
                    {stepDefinitions[currentStep].title}
                  </h1>
                  {currentStep === 6 ? (
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Opcional
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{stepDefinitions[currentStep].description}</p>
              </div>

              <div className="space-y-10 pt-8">
                {currentStep === 0 ? (
                  <div className="space-y-8">
                    <div className="grid gap-6">
                      <Input label="Nome completo" value={formData.nome_completo} onChange={(e) => update("nome_completo", e.target.value)} error={errors.nome_completo} />
                      <Input label="Email" type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
                      <Input label="Telefone" type="tel" inputMode="tel" value={formData.telefone} onChange={(e) => update("telefone", e.target.value)} />
                      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_96px]">
                        <Input label="Cidade" value={formData.cidade} onChange={(e) => update("cidade", e.target.value)} />
                        <Input label="Estado" maxLength={2} value={formData.estado} onChange={(e) => update("estado", e.target.value.toUpperCase())} error={errors.estado} />
                      </div>
                    </div>

                    <div className={dividerClass}>
                      <label className="block">
                        <span className={fieldLabelClass}>LinkedIn (opcional)</span>
                        <div className="border-b border-slate-300 transition-colors duration-200 focus-within:border-brand">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="whitespace-nowrap text-sm text-slate-500">linkedin.com/in/</span>
                            <input
                              type="text"
                              name="linkedin"
                              autoComplete="url"
                              spellCheck={false}
                              className="min-w-0 flex-1 border-0 bg-transparent px-0 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                              placeholder="seu-perfil"
                              value={linkedInHandle}
                              onChange={(e) => update("linkedin", buildLinkedInUrl(e.target.value))}
                            />
                          </div>
                        </div>
                      </label>

                      <div className="mt-6">
                        <Input
                          label="Portfólio (opcional)"
                          type="url"
                          value={formData.portfolio}
                          onChange={(e) => update("portfolio", e.target.value)}
                          placeholder="https://seusite.com/"
                        />
                      </div>
                    </div>

                    <div className={dividerClass}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-xl">
                          <h2 className="text-base font-semibold text-slate-950">Outros links úteis</h2>
                          <p className="mt-1 text-sm leading-7 text-slate-600">
                            Adicione GitHub, GitLab, Behance, site pessoal ou qualquer link relevante para seu currículo.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => formData.links_adicionais.length < 5 && update("links_adicionais", [...formData.links_adicionais, emptyAdditionalLink()])}
                        >
                          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                          Adicionar link
                        </Button>
                      </div>

                      {formData.links_adicionais.length === 0 ? (
                        <p className="mt-6 text-sm leading-7 text-slate-500">Nenhum link extra adicionado.</p>
                      ) : (
                        <div className="mt-6 space-y-6">
                          {formData.links_adicionais.map((link) => {
                            const prefix = getAdditionalLinkPrefix(link.tipo);
                            const inputValue = getAdditionalLinkInputValue(link.tipo, link.url);

                            return (
                              <div key={link.id} className="space-y-4 border-t border-slate-200 pt-6">
                                <div className="flex items-start justify-between gap-4">
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
                                    className="mt-7 text-slate-400 transition-colors duration-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
                                    onClick={() => removeListItem<AdditionalLink>("links_adicionais", link.id)}
                                    aria-label="Remover link"
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </div>

                                <label className="block">
                                  <span className={fieldLabelClass}>Link</span>
                                  <div className="border-b border-slate-300 transition-colors duration-200 focus-within:border-brand">
                                    <div className="flex min-w-0 items-center gap-3">
                                      {prefix ? <span className="whitespace-nowrap text-sm text-slate-500">{prefix.replace(/^https?:\/\//, "")}</span> : null}
                                      <input
                                        type="text"
                                        name={`link-${link.id}`}
                                        autoComplete="url"
                                        spellCheck={false}
                                        className="min-w-0 flex-1 border-0 bg-transparent px-0 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                                        placeholder={prefix ? "seu-usuario" : "https://seusite.com/"}
                                        value={inputValue}
                                        onChange={(e) => updateList<AdditionalLink>("links_adicionais", link.id, { url: buildAdditionalLinkUrl(link.tipo, e.target.value) })}
                                      />
                                    </div>
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {currentStep === 1 ? (
                  <div className="space-y-8">
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
                      placeholder="Escreva 2-3 frases sobre você e seus objetivos"
                      value={formData.resumo_profissional}
                      onChange={(e) => update("resumo_profissional", e.target.value)}
                      error={errors.resumo_profissional}
                    />
                  </div>
                ) : null}

                {currentStep === 2 ? (
                  <div className="space-y-8">
                    <label className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.sem_experiencia}
                        onChange={(e) => {
                          update("sem_experiencia", e.target.checked);
                          if (e.target.checked) update("experiencias", []);
                          if (!e.target.checked && formData.experiencias.length === 0) update("experiencias", [emptyExperience()]);
                        }}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand"
                      />
                      <span>Não tenho experiência profissional ainda.</span>
                    </label>

                    {!formData.sem_experiencia ? (
                      <div className="space-y-6">
                        {formData.experiencias.map((item, index) => (
                          <article key={item.id} className="space-y-5 border-t border-slate-200 pt-6">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Experiência {index + 1}</p>
                              <button
                                type="button"
                                className="text-slate-400 transition-colors duration-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
                                onClick={() => removeListItem<Experience>("experiencias", item.id)}
                                aria-label="Remover experiência"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>

                            <Input
                              label="Empresa"
                              value={item.empresa}
                              onChange={(e) => updateList<Experience>("experiencias", item.id, { empresa: e.target.value })}
                              error={errors[`experiencias.${index}.empresa`]}
                            />
                            <Input
                              label="Cargo"
                              value={item.cargo}
                              onChange={(e) => updateList<Experience>("experiencias", item.id, { cargo: e.target.value })}
                              error={errors[`experiencias.${index}.cargo`]}
                            />
                            <div className="grid gap-6 sm:grid-cols-2">
                              <Input
                                label="Data início"
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
                            <label className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                              <input
                                type="checkbox"
                                checked={isCurrentValue(item.data_fim, "Atual")}
                                onChange={(e) => updateList<Experience>("experiencias", item.id, { data_fim: e.target.checked ? "Atual" : "" })}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand"
                              />
                              <span>Trabalho atual</span>
                            </label>
                            <Textarea
                              label="Descrição"
                              rows={3}
                              placeholder="Descreva responsabilidades e conquistas com verbos de ação"
                              value={item.descricao}
                              onChange={(e) => updateList<Experience>("experiencias", item.id, { descricao: e.target.value })}
                            />
                          </article>
                        ))}

                        <Button type="button" variant="secondary" onClick={() => formData.experiencias.length < 5 && update("experiencias", [...formData.experiencias, emptyExperience()])}>
                          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                          Adicionar experiência
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {currentStep === 3 ? (
                  <div className="space-y-6">
                    {formData.formacoes.map((item, index) => (
                      <article key={item.id} className="space-y-5 border-t border-slate-200 pt-6">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Formação {index + 1}</p>
                          <button
                            type="button"
                            className="text-slate-400 transition-colors duration-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
                            onClick={() => removeListItem<Education>("formacoes", item.id)}
                            aria-label="Remover formação"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>

                        <Input
                          label="Curso"
                          value={item.curso}
                          onChange={(e) => updateList<Education>("formacoes", item.id, { curso: e.target.value })}
                          error={errors[`formacoes.${index}.curso`]}
                        />
                        <Input
                          label="Instituição"
                          value={item.instituicao}
                          onChange={(e) => updateList<Education>("formacoes", item.id, { instituicao: e.target.value })}
                          error={errors[`formacoes.${index}.instituicao`]}
                        />
                        <Select label="Nível" options={educationLevels} value={item.nivel} onChange={(e) => updateList<Education>("formacoes", item.id, { nivel: e.target.value })} />
                        <Input
                          label="Data de conclusão"
                          placeholder="MM/AAAA"
                          inputMode="numeric"
                          maxLength={7}
                          disabled={isCurrentValue(item.data_conclusao, "Em andamento")}
                          value={isCurrentValue(item.data_conclusao, "Em andamento") ? "" : formatMonthYearInput(item.data_conclusao)}
                          onChange={(e) => updateList<Education>("formacoes", item.id, { data_conclusao: formatMonthYearInput(e.target.value) })}
                        />
                        <label className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                          <input
                            type="checkbox"
                            checked={isCurrentValue(item.data_conclusao, "Em andamento")}
                            onChange={(e) => updateList<Education>("formacoes", item.id, { data_conclusao: e.target.checked ? "Em andamento" : "" })}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand"
                          />
                          <span>Em andamento</span>
                        </label>
                      </article>
                    ))}

                    <Button type="button" variant="secondary" onClick={() => formData.formacoes.length < 3 && update("formacoes", [...formData.formacoes, emptyEducation()])}>
                      <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                      Adicionar formação
                    </Button>
                  </div>
                ) : null}

                {currentStep === 4 ? (
                  <div className="space-y-8">
                    <TagInput
                      label="Habilidades Técnicas"
                      tags={formData.habilidades_tecnicas}
                      onChange={(tags) => update("habilidades_tecnicas", tags)}
                      placeholder="Ex: React, Python, Excel..."
                      suggestions={technicalSkillSuggestions}
                    />
                    <div className={dividerClass}>
                      <TagInput
                        label="Habilidades Comportamentais"
                        tags={formData.habilidades_comportamentais}
                        onChange={(tags) => update("habilidades_comportamentais", tags)}
                        placeholder="Ex: Liderança, Comunicação..."
                        suggestions={softSkillSuggestions}
                      />
                    </div>
                  </div>
                ) : null}

                {currentStep === 5 ? (
                  <div className="space-y-6">
                    {formData.idiomas.map((item, index) => (
                      <article key={item.id} className="space-y-5 border-t border-slate-200 pt-6">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Idioma {index + 1}</p>
                          <button
                            type="button"
                            className="text-slate-400 transition-colors duration-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
                            onClick={() => removeListItem<Language>("idiomas", item.id)}
                            aria-label="Remover idioma"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>

                        <Input
                          label="Idioma"
                          value={item.idioma}
                          onChange={(e) => updateList<Language>("idiomas", item.id, { idioma: e.target.value })}
                          error={errors[`idiomas.${index}.idioma`]}
                        />
                        <Select label="Nível" options={languageLevels} value={item.nivel} onChange={(e) => updateList<Language>("idiomas", item.id, { nivel: e.target.value })} />
                      </article>
                    ))}

                    <Button type="button" variant="secondary" onClick={() => formData.idiomas.length < 5 && update("idiomas", [...formData.idiomas, emptyLanguage()])}>
                      <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                      Adicionar idioma
                    </Button>
                  </div>
                ) : null}

                {currentStep === 6 ? (
                  <div className="space-y-6">
                    {formData.cursos.map((item, index) => (
                      <article key={item.id} className="space-y-5 border-t border-slate-200 pt-6">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Curso {index + 1}</p>
                          <button
                            type="button"
                            className="text-slate-400 transition-colors duration-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
                            onClick={() => removeListItem<Course>("cursos", item.id)}
                            aria-label="Remover curso"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>

                        <Input label="Nome do curso" value={item.nome_curso} onChange={(e) => updateList<Course>("cursos", item.id, { nome_curso: e.target.value })} />
                        <Input label="Instituição" value={item.instituicao} onChange={(e) => updateList<Course>("cursos", item.id, { instituicao: e.target.value })} />
                        <div className="grid gap-6 sm:grid-cols-2">
                          <Input
                            label="Ano"
                            inputMode="numeric"
                            maxLength={4}
                            value={formatYearInput(item.ano)}
                            onChange={(e) => updateList<Course>("cursos", item.id, { ano: formatYearInput(e.target.value) })}
                          />
                          <Input label="Carga horária" placeholder="Ex: 40h" value={item.carga_horaria} onChange={(e) => updateList<Course>("cursos", item.id, { carga_horaria: e.target.value })} />
                        </div>
                      </article>
                    ))}

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
                      <Button type="button" variant="secondary" onClick={() => formData.cursos.length < 6 && update("cursos", [...formData.cursos, emptyCourse()])}>
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Adicionar curso
                      </Button>
                      <button type="button" onClick={() => setCurrentStep(7)} className="text-sm font-semibold text-brand transition-colors duration-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100">
                        Pular esta etapa →
                      </button>
                    </div>
                  </div>
                ) : null}

                {currentStep === 7 ? (
                  <div className="space-y-2">
                    <div className="border-b border-slate-200 pb-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Prévia do currículo</p>
                      <h2 className="mt-3 text-3xl font-bold text-slate-950 text-balance">{formData.nome_completo || "Seu nome"}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {[formData.email, formData.telefone, `${formData.cidade}${formData.estado ? `-${formData.estado}` : ""}`].filter(Boolean).join(" | ")}
                      </p>
                      <p className="mt-3 text-base font-semibold text-blue-600">{formData.cargo_desejado || "Cargo desejado"}</p>
                    </div>

                    {[
                      ["Dados pessoais", 0, [formData.nome_completo, formData.email, ...getResumeLinks(formData)].filter(Boolean).join(" · ")],
                      ["Cargo e resumo", 1, `${formData.cargo_desejado} · ${formData.resumo_profissional}`],
                      ["Experiência", 2, formData.sem_experiencia ? "Sem experiência profissional" : `${formData.experiencias.length} item(ns)`],
                      ["Formação", 3, `${formData.formacoes.length} item(ns)`],
                      ["Habilidades", 4, [...formData.habilidades_tecnicas, ...formData.habilidades_comportamentais].join(", ")],
                      ["Idiomas", 5, `${formData.idiomas.length} item(ns)`],
                      ["Cursos", 6, formData.cursos.length ? `${formData.cursos.length} item(ns)` : "Opcional"],
                    ].map(([title, step, summary]) => (
                      <details key={String(title)} className="border-t border-slate-200 py-5" open={Number(step) < 2}>
                        <summary className="cursor-pointer list-none">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold text-slate-950">{title}</p>
                              <p className="mt-1 text-sm leading-7 text-slate-500">Clique para revisar o conteúdo desta etapa.</p>
                            </div>
                            <span className="text-sm text-slate-500">Abrir</span>
                          </div>
                        </summary>
                        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                          <p className="max-w-2xl break-words text-sm leading-7 text-slate-600">{summary || "Não preenchido"}</p>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(Number(step))}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors duration-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
                            aria-label={`Editar ${title}`}
                          >
                            <Edit3 className="h-4 w-4" aria-hidden="true" />
                            Editar
                          </button>
                        </div>
                      </details>
                    ))}

                    <div className="border-t border-slate-200 pt-8">
                      <Button type="button" className="w-full" onClick={goCheckout}>
                        Gerar meu currículo por {formatPriceBRL()}
                      </Button>
                      <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        Pagamento único via Pix · Sem assinatura
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {currentStep < 7 ? (
                <div className="mt-10 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
                  <Button type="button" variant="ghost" onClick={previousStep} disabled={currentStep === 0}>
                    Voltar
                  </Button>
                  <Button type="button" onClick={goReviewOrNext}>
                    {currentStep === 6 ? "Revisar currículo" : "Próximo"}
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
