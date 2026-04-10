import type { ResumeData } from "@/lib/resume";

export type AtsScoreLevel = "Inicial" | "Bom" | "Forte" | "Excelente";
export type AtsScoreStatus = "Completo" | "Parcial" | "Pendente";

export type AtsScoreCheck = {
  label: string;
  description: string;
  action: string;
  points: number;
  max: number;
  status: AtsScoreStatus;
  complete: boolean;
};

export type AtsScoreResult = {
  score: number;
  level: AtsScoreLevel;
  checks: AtsScoreCheck[];
  nextImprovement: Pick<AtsScoreCheck, "label" | "action" | "points" | "max">;
  completedChecks: number;
  totalChecks: number;
};

function filled(value: string) {
  return value.trim().length > 0;
}

function hasValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasAnyTerm(text: string, terms: string[]) {
  const normalizedText = normalize(text);
  return terms.some((term) => normalizedText.includes(normalize(term)));
}

function uniqueFilled(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function includesNumber(value: string) {
  return /\d/.test(value);
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

function getLevel(score: number): AtsScoreLevel {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Forte";
  if (score >= 50) return "Bom";
  return "Inicial";
}

function buildCheck(label: string, description: string, action: string, points: number, max: number): AtsScoreCheck {
  const safePoints = Math.min(points, max);

  return {
    label,
    description,
    action,
    points: safePoints,
    max,
    status: safePoints === max ? "Completo" : safePoints > 0 ? "Parcial" : "Pendente",
    complete: safePoints === max,
  };
}

function scoreContact(data: ResumeData) {
  let points = 0;
  if (filled(data.nome_completo)) points += 3;
  if (hasValidEmail(data.email)) points += 4;
  if (filled(data.telefone)) points += 3;
  if (filled(data.cidade) && filled(data.estado)) points += 3;
  if (filled(data.cargo_desejado)) points += 4;
  if (hasUsefulLink(data)) points += 1;

  return buildCheck(
    "Contato e alvo",
    "Nome, email válido, telefone, localização, cargo desejado e um link profissional.",
    "Preencha nome, email, telefone, cidade/UF, cargo desejado e pelo menos 1 link útil.",
    points,
    18,
  );
}

function scoreSummary(data: ResumeData) {
  const summary = data.resumo_profissional.trim();
  const hasSummary = filled(summary);
  const hasGoodLength = summary.length >= 80 && summary.length <= 500;
  const cargoTerms = data.cargo_desejado.split(/\s+/).filter((term) => term.length > 3);
  const hasRoleMatch = filled(data.cargo_desejado) && hasAnyTerm(summary, cargoTerms);
  const hasActionOrResult = hasAnyTerm(summary, [
    "desenvolv",
    "otimiz",
    "cria",
    "lider",
    "reduz",
    "aument",
    "automatiz",
    "anal",
    "gerenc",
    "entreg",
    "resultado",
    "performance",
  ]);

  let points = 0;
  if (hasSummary) points += 4;
  if (hasGoodLength) points += 5;
  if (hasRoleMatch) points += 3;
  if (hasActionOrResult) points += 3;
  if (hasSummary && summary.length <= 500) points += 2;

  return buildCheck(
    "Resumo profissional",
    "Resumo entre 80 e 500 caracteres, alinhado ao cargo e com resultado ou verbo de ação.",
    "Escreva 2 ou 3 frases com cargo-alvo, palavras-chave e impacto prático.",
    points,
    17,
  );
}

function scoreExperience(data: ResumeData) {
  if (data.sem_experiencia && hasCompleteEducation(data)) {
    return buildCheck(
      "Experiência",
      "Projetos, estágio, voluntariado ou aviso claro de primeiro emprego.",
      "Adicione 1 projeto acadêmico, freelance, voluntariado ou experiência prática com resultado.",
      8,
      22,
    );
  }

  const best = data.experiencias.reduce((highest, item) => {
    let points = 0;
    if (filled(item.empresa) && filled(item.cargo)) points += 5;
    if (filled(item.data_inicio) && filled(item.data_fim)) points += 4;
    if (item.descricao.trim().length >= 60) points += 5;
    if (
      hasAnyTerm(item.descricao, [
        "desenvolv",
        "implementei",
        "criei",
        "otimizei",
        "automatizei",
        "reduzi",
        "aumentei",
        "liderei",
        "organizei",
        "gerenciei",
        "analisei",
        "coordenei",
        "melhorei",
        "entreguei",
      ])
    ) {
      points += 4;
    }
    if (includesNumber(item.descricao)) points += 4;
    return Math.max(highest, points);
  }, 0);

  return buildCheck(
    "Experiência",
    "Cargo, empresa, período, descrição objetiva, verbos de ação e números de impacto.",
    "Complete uma experiência com período, 2 linhas de descrição, verbo de ação e algum número ou resultado.",
    best,
    22,
  );
}

function scoreEducation(data: ResumeData) {
  const best = data.formacoes.reduce((highest, item) => {
    let points = 0;
    const hasEducationCore = filled(item.curso) || filled(item.instituicao);
    if (filled(item.curso)) points += 4;
    if (filled(item.instituicao)) points += 4;
    if (hasEducationCore && filled(item.nivel)) points += 2;
    if (hasEducationCore && filled(item.data_conclusao)) points += 3;
    return Math.max(highest, points);
  }, 0);

  return buildCheck(
    "Formação",
    "Curso, instituição, nível e data ou status de conclusão.",
    "Complete sua formação principal com curso, instituição, nível e conclusão.",
    best,
    13,
  );
}

function scoreSkills(data: ResumeData) {
  const technicalSkills = uniqueFilled(data.habilidades_tecnicas);
  const softSkills = uniqueFilled(data.habilidades_comportamentais);
  let points = 0;
  if (technicalSkills.length >= 3) points += 8;
  if (technicalSkills.length >= 5) points += 4;
  if (softSkills.length >= 2) points += 4;
  if (technicalSkills.length >= 3 && softSkills.length >= 2) points += 2;

  return buildCheck(
    "Habilidades",
    "Pelo menos 5 técnicas e 2 comportamentais, sem repetição.",
    "Adicione 5 habilidades técnicas e 2 comportamentais relevantes para a vaga.",
    points,
    18,
  );
}

function scoreKeywords(data: ResumeData) {
  const relevantText = normalize(
    `${data.resumo_profissional} ${data.experiencias.map((item) => `${item.cargo} ${item.descricao}`).join(" ")}`,
  );
  const cargoTerms = uniqueFilled(data.cargo_desejado.split(/\s+/).filter((term) => term.length > 3));
  const technicalSkills = uniqueFilled(data.habilidades_tecnicas);

  let points = 0;
  if (cargoTerms.length > 0 && cargoTerms.some((term) => relevantText.includes(normalize(term)))) points += 3;
  if (technicalSkills.length > 0 && technicalSkills.some((skill) => relevantText.includes(normalize(skill)))) points += 3;

  return buildCheck(
    "Palavras-chave",
    "Cargo e habilidades importantes aparecem no resumo ou na experiência.",
    "Repita naturalmente o cargo desejado e 1 ou 2 habilidades técnicas no resumo ou nas experiências.",
    points,
    6,
  );
}

function scoreExtras(data: ResumeData) {
  const hasLanguage = data.idiomas.some((item) => filled(item.idioma) && filled(item.nivel));
  let points = 0;
  if (hasLanguage) points += 2;
  if (hasCourse(data)) points += 2;
  if (hasUsefulLink(data)) points += 2;

  return buildCheck(
    "Extras",
    "Idioma, curso/certificação e links úteis para fortalecer o perfil.",
    "Inclua idioma, 1 curso ou certificação e um link profissional como LinkedIn, GitHub ou portfólio.",
    points,
    6,
  );
}

function getNextImprovement(checks: AtsScoreCheck[]): AtsScoreResult["nextImprovement"] {
  const contact = checks.find((check) => check.label === "Contato e alvo");
  if (contact && contact.points < 11) {
    return {
      label: contact.label,
      action: contact.action,
      points: contact.points,
      max: contact.max,
    };
  }

  const next = checks
    .filter((check) => !check.complete)
    .sort((a, b) => b.max - b.points - (a.max - a.points))[0];

  if (!next) {
    return {
      label: "Currículo completo",
      action: "Currículo forte para baixar. Revise apenas se quiser ajustar o texto final.",
      points: 100,
      max: 100,
    };
  }

  return {
    label: next.label,
    action: next.action,
    points: next.points,
    max: next.max,
  };
}

export function calculateAtsScore(data: ResumeData): AtsScoreResult {
  const checks: AtsScoreCheck[] = [
    scoreContact(data),
    scoreSummary(data),
    scoreExperience(data),
    scoreEducation(data),
    scoreSkills(data),
    scoreKeywords(data),
    scoreExtras(data),
  ];
  const score = checks.reduce((total, check) => total + check.points, 0);
  const completedChecks = checks.filter((check) => check.complete).length;

  return {
    score,
    level: getLevel(score),
    checks,
    nextImprovement: getNextImprovement(checks),
    completedChecks,
    totalChecks: checks.length,
  };
}
