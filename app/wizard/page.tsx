"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ProgressBar } from "@/components/ProgressBar";
import { Select } from "@/components/Select";
import { StepCard } from "@/components/StepCard";
import { TagInput } from "@/components/TagInput";
import { Textarea } from "@/components/Textarea";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import {
  defaultResumeData,
  educationLevels,
  emptyCourse,
  emptyEducation,
  emptyExperience,
  emptyLanguage,
  FORM_STORAGE_KEY,
  languageLevels,
  softSkillSuggestions,
  type Course,
  type Education,
  type Experience,
  type Language,
  type ResumeData,
} from "@/lib/resume";

type Errors = Record<string, string>;

const totalSteps = 8;

function Required({ children }: { children: React.ReactNode }) {
  return <span>{children} <span className="text-red-500">*</span></span>;
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
      "Experiência Profissional",
      "Formação Acadêmica",
      "Habilidades",
      "Idiomas",
      "Cursos e Certificações",
      "Revisão",
    ],
    [],
  );

  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      try {
        setFormData({ ...defaultResumeData(), ...JSON.parse(saved) });
      } catch {
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
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
        if (email) setFormData((current) => ({ ...current, email: current.email || email }));
      });
  }, []);

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setFormData((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[String(key)];
      return next;
    });
  }

  function updateList<T extends Experience | Education | Language | Course>(key: keyof ResumeData, id: string, patch: Partial<T>) {
    setFormData((current) => ({
      ...current,
      [key]: (current[key] as T[]).map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function removeListItem<T extends Experience | Education | Language | Course>(key: keyof ResumeData, id: string) {
    setFormData((current) => ({ ...current, [key]: (current[key] as T[]).filter((item) => item.id !== id) }));
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
      formData.experiencias.forEach((exp, index) => {
        if (!exp.empresa.trim()) next[`experiencias.${index}.empresa`] = "Informe a empresa.";
        if (!exp.cargo.trim()) next[`experiencias.${index}.cargo`] = "Informe o cargo.";
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
    if (!validate()) return;
    if (currentStep === totalSteps - 1) return;
    setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function goReviewOrNext() {
    if (currentStep === totalSteps - 2) {
      if (!validate()) return;
      setCurrentStep(totalSteps - 1);
      return;
    }
    nextStep();
  }

  function goCheckout() {
    if (!validate(0) || !validate(1) || !validate(2) || !validate(3) || !validate(5)) return;
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    router.push("/checkout");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-5 flex items-center justify-between">
            <button className="text-xl font-bold text-gray-950" onClick={() => router.push("/")} type="button">
              ATSFácil
            </button>
            <span className="text-sm font-medium text-gray-500">{steps[currentStep]}</span>
          </div>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        <StepCard className={currentStep === 7 ? "max-w-3xl" : undefined}>
          {currentStep === 0 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-gray-950">Dados Pessoais</h1>
              <Input label="Nome completo" name="nome_completo" value={formData.nome_completo} onChange={(e) => update("nome_completo", e.target.value)} error={errors.nome_completo} />
              <Input label="Email" type="email" name="email" value={formData.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
              <Input label="Telefone" name="telefone" value={formData.telefone} onChange={(e) => update("telefone", e.target.value)} />
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <Input label="Cidade" name="cidade" value={formData.cidade} onChange={(e) => update("cidade", e.target.value)} />
                <Input label="Estado" name="estado" maxLength={2} value={formData.estado} onChange={(e) => update("estado", e.target.value.toUpperCase())} error={errors.estado} />
              </div>
              <Input label="LinkedIn" name="linkedin" type="url" value={formData.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
              <Input label="Portfolio" name="portfolio" type="url" value={formData.portfolio} onChange={(e) => update("portfolio", e.target.value)} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-gray-950">Cargo e Resumo</h1>
              <Input label="Cargo desejado" name="cargo_desejado" placeholder="Ex: Desenvolvedor Full Stack" value={formData.cargo_desejado} onChange={(e) => update("cargo_desejado", e.target.value)} error={errors.cargo_desejado} />
              <Textarea
                label="Resumo profissional"
                name="resumo_profissional"
                rows={4}
                maxLength={500}
                placeholder="Escreva 2-3 frases sobre você e seus objetivos"
                value={formData.resumo_profissional}
                onChange={(e) => update("resumo_profissional", e.target.value)}
                error={errors.resumo_profissional}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-950">Experiência Profissional</h1>
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
                  Não tenho experiência profissional ainda
                </label>
              </div>
              {!formData.sem_experiencia && (
                <>
                  {formData.experiencias.map((exp, index) => (
                    <div key={exp.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="font-semibold text-gray-950">Experiência {index + 1}</h2>
                        <button type="button" onClick={() => removeListItem<Experience>("experiencias", exp.id)} className="text-gray-400 hover:text-red-600" aria-label="Remover experiência">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Input label="Empresa" value={exp.empresa} onChange={(e) => updateList<Experience>("experiencias", exp.id, { empresa: e.target.value })} error={errors[`experiencias.${index}.empresa`]} />
                      <Input label="Cargo" value={exp.cargo} onChange={(e) => updateList<Experience>("experiencias", exp.id, { cargo: e.target.value })} error={errors[`experiencias.${index}.cargo`]} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Data início" placeholder="MM/AAAA" value={exp.data_inicio} onChange={(e) => updateList<Experience>("experiencias", exp.id, { data_inicio: e.target.value })} />
                        <Input label="Data fim" placeholder="MM/AAAA ou Atual" value={exp.data_fim} onChange={(e) => updateList<Experience>("experiencias", exp.id, { data_fim: e.target.value })} />
                      </div>
                      <Textarea label="Descrição" rows={3} placeholder="Descreva responsabilidades e conquistas com verbos de ação" value={exp.descricao} onChange={(e) => updateList<Experience>("experiencias", exp.id, { descricao: e.target.value })} />
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => formData.experiencias.length < 5 && update("experiencias", [...formData.experiencias, emptyExperience()])}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar experiência
                  </Button>
                </>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-gray-950">Formação Acadêmica</h1>
              {formData.formacoes.map((item, index) => (
                <div key={item.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-gray-950">Formação {index + 1}</h2>
                    <button type="button" onClick={() => removeListItem<Education>("formacoes", item.id)} className="text-gray-400 hover:text-red-600" aria-label="Remover formação">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input label="Curso" value={item.curso} onChange={(e) => updateList<Education>("formacoes", item.id, { curso: e.target.value })} error={errors[`formacoes.${index}.curso`]} />
                  <Input label="Instituição" value={item.instituicao} onChange={(e) => updateList<Education>("formacoes", item.id, { instituicao: e.target.value })} error={errors[`formacoes.${index}.instituicao`]} />
                  <Select label="Nível" options={educationLevels} value={item.nivel} onChange={(e) => updateList<Education>("formacoes", item.id, { nivel: e.target.value })} />
                  <Input label="Data de conclusão" placeholder="MM/AAAA ou Em andamento" value={item.data_conclusao} onChange={(e) => updateList<Education>("formacoes", item.id, { data_conclusao: e.target.value })} />
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => formData.formacoes.length < 3 && update("formacoes", [...formData.formacoes, emptyEducation()])}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar formação
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-7">
              <h1 className="text-2xl font-bold text-gray-950">Habilidades</h1>
              <TagInput label="Habilidades Técnicas" tags={formData.habilidades_tecnicas} onChange={(tags) => update("habilidades_tecnicas", tags)} placeholder="Ex: React, Python, Excel..." />
              <TagInput
                label="Habilidades Comportamentais"
                tags={formData.habilidades_comportamentais}
                onChange={(tags) => update("habilidades_comportamentais", tags)}
                placeholder="Ex: Liderança, Comunicação..."
                suggestions={softSkillSuggestions}
              />
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-gray-950">Idiomas</h1>
              {formData.idiomas.map((item, index) => (
                <div key={item.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-gray-950">Idioma {index + 1}</h2>
                    <button type="button" onClick={() => removeListItem<Language>("idiomas", item.id)} className="text-gray-400 hover:text-red-600" aria-label="Remover idioma">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input label="Idioma" value={item.idioma} onChange={(e) => updateList<Language>("idiomas", item.id, { idioma: e.target.value })} error={errors[`idiomas.${index}.idioma`]} />
                  <Select label="Nível" options={languageLevels} value={item.nivel} onChange={(e) => updateList<Language>("idiomas", item.id, { nivel: e.target.value })} />
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => formData.idiomas.length < 5 && update("idiomas", [...formData.idiomas, emptyLanguage()])}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar idioma
              </Button>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-950">Cursos e Certificações</h1>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">opcional</span>
              </div>
              {formData.cursos.map((item, index) => (
                <div key={item.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-gray-950">Curso {index + 1}</h2>
                    <button type="button" onClick={() => removeListItem<Course>("cursos", item.id)} className="text-gray-400 hover:text-red-600" aria-label="Remover curso">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input label="Nome do curso" value={item.nome_curso} onChange={(e) => updateList<Course>("cursos", item.id, { nome_curso: e.target.value })} />
                  <Input label="Instituição" value={item.instituicao} onChange={(e) => updateList<Course>("cursos", item.id, { instituicao: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Ano" maxLength={4} value={item.ano} onChange={(e) => updateList<Course>("cursos", item.id, { ano: e.target.value })} />
                    <Input label="Carga horária" placeholder="Ex: 40h" value={item.carga_horaria} onChange={(e) => updateList<Course>("cursos", item.id, { carga_horaria: e.target.value })} />
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
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-medium text-gray-500">Prévia</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-950">{formData.nome_completo || "Seu nome"}</h1>
                <p className="mt-1 text-sm text-gray-600">{[formData.email, formData.telefone, `${formData.cidade}${formData.estado ? `-${formData.estado}` : ""}`].filter(Boolean).join(" | ")}</p>
                <p className="mt-3 font-semibold text-brand">{formData.cargo_desejado || "Cargo desejado"}</p>
              </div>
              {[
                ["Dados pessoais", 0, `${formData.nome_completo} · ${formData.email}`],
                ["Cargo e resumo", 1, `${formData.cargo_desejado} · ${formData.resumo_profissional}`],
                ["Experiência", 2, formData.sem_experiencia ? "Sem experiência profissional" : `${formData.experiencias.length} item(ns)`],
                ["Formação", 3, `${formData.formacoes.length} item(ns)`],
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
                  <p className="mt-3 break-words text-sm leading-6 text-gray-600">{summary || "Não preenchido"}</p>
                </details>
              ))}
              <Button type="button" className="w-full" onClick={goCheckout}>Gerar meu currículo por R$4,90</Button>
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                <Lock className="h-4 w-4" /> Pagamento único via Pix · Sem assinatura
              </p>
            </div>
          )}
        </StepCard>

        {currentStep < 7 && (
          <div className="mx-auto mt-6 flex max-w-lg items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={previousStep} disabled={currentStep === 0}>Voltar</Button>
            <Button type="button" onClick={goReviewOrNext}>{currentStep === 6 ? "Revisar currículo" : "Próximo"}</Button>
          </div>
        )}
      </div>
    </main>
  );
}
