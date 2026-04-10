import type { ResumeData } from "@/lib/resume";

export type WizardStepProgress = "empty" | "started" | "complete";

export type WizardStepState = {
  progress: WizardStepProgress;
  canNavigate: boolean;
};

function filled(value: string) {
  return value.trim().length > 0;
}

function anyFilled(values: string[]) {
  return values.some(filled);
}

function hasUsefulLink(data: ResumeData) {
  return filled(data.linkedin) || filled(data.portfolio) || data.links_adicionais.some((item) => filled(item.url));
}

function hasExperienceContent(data: ResumeData) {
  return data.sem_experiencia || data.experiencias.some((item) => anyFilled([item.empresa, item.cargo, item.data_inicio, item.data_fim, item.descricao]));
}

function hasCompleteExperience(data: ResumeData) {
  return data.sem_experiencia || data.experiencias.some((item) => filled(item.empresa) && filled(item.cargo));
}

function hasEducationContent(data: ResumeData) {
  return data.formacoes.some((item) => anyFilled([item.curso, item.instituicao, item.data_conclusao]));
}

function hasCompleteEducation(data: ResumeData) {
  return data.formacoes.some((item) => filled(item.curso) && filled(item.instituicao));
}

function hasLanguageContent(data: ResumeData) {
  return data.idiomas.some((item) => filled(item.idioma));
}

function hasCourseContent(data: ResumeData) {
  return data.cursos.some((item) => anyFilled([item.nome_curso, item.instituicao, item.ano, item.carga_horaria]));
}

function getProgress(complete: boolean, started: boolean): WizardStepProgress {
  if (complete) return "complete";
  if (started) return "started";
  return "empty";
}

export function getWizardStepProgress(data: ResumeData, step: number): WizardStepProgress {
  if (step === 0) {
    const started = anyFilled([data.nome_completo, data.email, data.telefone, data.cidade, data.estado]) || hasUsefulLink(data);
    return getProgress(filled(data.nome_completo) && filled(data.email), started);
  }

  if (step === 1) {
    const started = anyFilled([data.cargo_desejado, data.resumo_profissional]);
    return getProgress(filled(data.cargo_desejado) && filled(data.resumo_profissional), started);
  }

  if (step === 2) {
    return getProgress(hasCompleteExperience(data), hasExperienceContent(data));
  }

  if (step === 3) {
    return getProgress(hasCompleteEducation(data), hasEducationContent(data));
  }

  if (step === 4) {
    const technicalCount = data.habilidades_tecnicas.filter(filled).length;
    const softCount = data.habilidades_comportamentais.filter(filled).length;
    return getProgress(technicalCount >= 3 && softCount >= 2, technicalCount + softCount > 0);
  }

  if (step === 5) {
    return getProgress(hasLanguageContent(data), hasLanguageContent(data));
  }

  if (step === 6) {
    return getProgress(hasCourseContent(data), hasCourseContent(data));
  }

  return getProgress(false, true);
}

export function getWizardStepState(data: ResumeData, step: number, currentStep: number, furthestStep: number): WizardStepState {
  const progress = getWizardStepProgress(data, step);

  return {
    progress,
    canNavigate: step <= currentStep || step <= furthestStep || progress !== "empty",
  };
}
