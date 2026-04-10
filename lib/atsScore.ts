import type { ResumeData } from "@/lib/resume";

export type AtsScoreCheck = {
  label: string;
  points: number;
  max: number;
  complete: boolean;
};

export type AtsScoreResult = {
  score: number;
  level: "Inicial" | "Bom" | "Forte";
  checks: AtsScoreCheck[];
};

function filled(value: string) {
  return value.trim().length > 0;
}

function hasCompleteExperience(data: ResumeData) {
  return data.experiencias.some((item) => filled(item.empresa) && filled(item.cargo));
}

function hasCompleteEducation(data: ResumeData) {
  return data.formacoes.some((item) => filled(item.curso) && filled(item.instituicao));
}

function hasUsefulLink(data: ResumeData) {
  return filled(data.linkedin) || filled(data.portfolio) || data.links_adicionais.some((item) => filled(item.url));
}

function hasCourse(data: ResumeData) {
  return data.cursos.some((item) => filled(item.nome_curso) || filled(item.instituicao));
}

function getLevel(score: number): AtsScoreResult["level"] {
  if (score >= 80) return "Forte";
  if (score >= 50) return "Bom";
  return "Inicial";
}

export function calculateAtsScore(data: ResumeData): AtsScoreResult {
  const hasCoreIdentity = filled(data.nome_completo) && filled(data.email) && filled(data.cargo_desejado);
  const hasLocationOrPhone = filled(data.telefone) && (filled(data.cidade) || filled(data.estado));
  const hasGoodSummary = data.resumo_profissional.trim().length >= 80;
  const completeExperience = hasCompleteExperience(data);
  const completeEducation = hasCompleteEducation(data);
  const enoughTechnicalSkills = data.habilidades_tecnicas.filter(filled).length >= 3;
  const enoughSoftSkills = data.habilidades_comportamentais.filter(filled).length >= 2;
  const hasLanguage = data.idiomas.some((item) => filled(item.idioma));
  const hasExtra = hasCourse(data) || hasUsefulLink(data);

  const checks: AtsScoreCheck[] = [
    {
      label: "Contato e cargo",
      points: (hasCoreIdentity ? 14 : 0) + (hasLocationOrPhone ? 4 : 0) + (hasUsefulLink(data) ? 2 : 0),
      max: 20,
      complete: hasCoreIdentity && hasLocationOrPhone && hasUsefulLink(data),
    },
    {
      label: "Resumo profissional",
      points: hasGoodSummary ? 15 : filled(data.resumo_profissional) ? 8 : 0,
      max: 15,
      complete: hasGoodSummary,
    },
    {
      label: "Experiência",
      points: completeExperience ? 20 : data.sem_experiencia && completeEducation ? 10 : 0,
      max: 20,
      complete: completeExperience,
    },
    {
      label: "Formação",
      points: completeEducation ? 15 : 0,
      max: 15,
      complete: completeEducation,
    },
    {
      label: "Habilidades",
      points: (enoughTechnicalSkills ? 12 : 0) + (enoughSoftSkills ? 8 : 0),
      max: 20,
      complete: enoughTechnicalSkills && enoughSoftSkills,
    },
    {
      label: "Extras",
      points: (hasLanguage ? 5 : 0) + (hasExtra ? 5 : 0),
      max: 10,
      complete: hasLanguage && hasExtra,
    },
  ];

  const score = checks.reduce((total, check) => total + check.points, 0);

  return {
    score,
    level: getLevel(score),
    checks,
  };
}
