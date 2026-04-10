export type Experience = {
  id: string;
  empresa: string;
  cargo: string;
  data_inicio: string;
  data_fim: string;
  descricao: string;
};

export type Education = {
  id: string;
  curso: string;
  instituicao: string;
  nivel: string;
  data_conclusao: string;
};

export type Language = {
  id: string;
  idioma: string;
  nivel: string;
};

export type Course = {
  id: string;
  nome_curso: string;
  instituicao: string;
  ano: string;
  carga_horaria: string;
};

export type AdditionalLinkType = "GitHub" | "GitLab" | "Behance" | "Portfolio" | "Site" | "Outro";

export type AdditionalLink = {
  id: string;
  tipo: AdditionalLinkType;
  url: string;
};

export type ResumeData = {
  nome_completo: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  linkedin: string;
  portfolio: string;
  links_adicionais: AdditionalLink[];
  cargo_desejado: string;
  resumo_profissional: string;
  sem_experiencia: boolean;
  experiencias: Experience[];
  formacoes: Education[];
  habilidades_tecnicas: string[];
  habilidades_comportamentais: string[];
  idiomas: Language[];
  cursos: Course[];
};

export const FORM_STORAGE_KEY = "atsfacil_form";

export const educationLevels = ["Técnico", "Graduação", "Pós-graduação", "MBA", "Mestrado", "Doutorado"];
export const languageLevels = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];
const legacyEducationLevels: Record<string, string> = {
  Tecnico: "Técnico",
  Graduacao: "Graduação",
  "Pos-graduacao": "Pós-graduação",
};
const legacyLanguageLevels: Record<string, string> = {
  Basico: "Básico",
  Intermediario: "Intermediário",
  Avancado: "Avançado",
};
const legacySoftSkillLabels: Record<string, string> = {
  Comunicacao: "Comunicação",
  Lideranca: "Liderança",
  "Resolucao de problemas": "Resolução de problemas",
  Organizacao: "Organização",
  "Pensamento analitico": "Pensamento analítico",
  "Gestao do tempo": "Gestão do tempo",
  "Atencao aos detalhes": "Atenção aos detalhes",
  Negociacao: "Negociação",
  "Tomada de decisao": "Tomada de decisão",
  "Visao estrategica": "Visão estratégica",
  Colaboracao: "Colaboração",
  "Aprendizado rapido": "Aprendizado rápido",
  "Comunicacao visual": "Comunicação visual",
  "Gestao de conflitos": "Gestão de conflitos",
  Resiliencia: "Resiliência",
  "Inteligencia emocional": "Inteligência emocional",
  "Capacidade de liderar reunioes": "Capacidade de liderar reuniões",
  "Pensamento critico": "Pensamento crítico",
  "Orientacao a resultados": "Orientação a resultados",
};
export const additionalLinkTypes: AdditionalLinkType[] = ["GitHub", "GitLab", "Behance", "Portfolio", "Site", "Outro"];
export const technicalSkillSuggestions = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Git",
  "GitHub",
  "Docker",
  "AWS",
  "Azure",
  "Linux",
  "REST API",
  "Figma",
  "UI Design",
  "UX Research",
  "Design System",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Power BI",
  "Excel",
  "Tableau",
  "R",
  "SPSS",
  "Estatistica",
  "Analise de Dados",
  "Machine Learning",
  "Pandas",
  "NumPy",
  "Jupyter",
  "Administração Financeira",
  "Gestao de Projetos",
  "Planejamento Estrategico",
  "CRM",
  "ERP",
  "BPM",
  "SEO",
  "Google Analytics",
  "Marketing Digital",
  "Scrum",
  "Kanban",
];
export const softSkillSuggestions = [
  "Comunicação",
  "Trabalho em equipe",
  "Liderança",
  "Proatividade",
  "Resolução de problemas",
  "Adaptabilidade",
  "Criatividade",
  "Organização",
  "Pensamento analítico",
  "Gestão do tempo",
  "Atenção aos detalhes",
  "Empatia",
  "Negociação",
  "Tomada de decisão",
  "Visão estratégica",
  "Colaboração",
  "Aprendizado rápido",
  "Autonomia",
  "Flexibilidade",
  "Escuta ativa",
  "Comunicação visual",
  "Senso de urgencia",
  "Gestão de conflitos",
  "Resiliência",
  "Inteligência emocional",
  "Capacidade de liderar reuniões",
  "Pensamento crítico",
  "Orientação a resultados",
];

export const emptyExperience = (): Experience => ({
  id: crypto.randomUUID(),
  empresa: "",
  cargo: "",
  data_inicio: "",
  data_fim: "",
  descricao: "",
});

export const emptyEducation = (): Education => ({
  id: crypto.randomUUID(),
  curso: "",
  instituicao: "",
  nivel: "Graduação",
  data_conclusao: "",
});

export const emptyLanguage = (): Language => ({
  id: crypto.randomUUID(),
  idioma: "",
  nivel: "Intermediário",
});

export const emptyCourse = (): Course => ({
  id: crypto.randomUUID(),
  nome_curso: "",
  instituicao: "",
  ano: "",
  carga_horaria: "",
});

export const emptyAdditionalLink = (): AdditionalLink => ({
  id: crypto.randomUUID(),
  tipo: "GitHub",
  url: "",
});

export const defaultResumeData = (): ResumeData => ({
  nome_completo: "",
  email: "",
  telefone: "",
  cidade: "",
  estado: "",
  linkedin: "",
  portfolio: "",
  links_adicionais: [],
  cargo_desejado: "",
  resumo_profissional: "",
  sem_experiencia: false,
  experiencias: [emptyExperience()],
  formacoes: [emptyEducation()],
  habilidades_tecnicas: [],
  habilidades_comportamentais: [],
  idiomas: [emptyLanguage()],
  cursos: [],
});

export function isFormEmpty(data: ResumeData | null) {
  if (!data) return true;
  return !data.nome_completo && !data.email && !data.cargo_desejado && !data.resumo_profissional;
}

export function normalizeLanguageLevel(level: string) {
  return legacyLanguageLevels[level] ?? level;
}

export function normalizeEducationLevel(level: string) {
  return legacyEducationLevels[level] ?? level;
}

export function normalizeSoftSkillLabel(label: string) {
  return legacySoftSkillLabels[label] ?? label;
}

export function normalizeResumeData(data: ResumeData) {
  return {
    ...data,
    habilidades_comportamentais: data.habilidades_comportamentais.map(normalizeSoftSkillLabel),
    formacoes: data.formacoes.map((item) => ({
      ...item,
      nivel: normalizeEducationLevel(item.nivel),
    })),
    idiomas: data.idiomas.map((item) => ({
      ...item,
      nivel: normalizeLanguageLevel(item.nivel),
    })),
  };
}

export function getLinkedInHandle(value: string) {
  return value
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")
    .replace(/^linkedin\.com\/in\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "")
    .trim();
}

export function buildLinkedInUrl(handle: string) {
  const cleanHandle = getLinkedInHandle(handle);
  return cleanHandle ? `https://linkedin.com/in/${cleanHandle}` : "";
}

export function getAdditionalLinkPrefix(type: AdditionalLinkType) {
  switch (type) {
    case "GitHub":
      return "https://github.com/";
    case "GitLab":
      return "https://gitlab.com/";
    case "Behance":
      return "https://behance.net/";
    default:
      return "";
  }
}

export function getAdditionalLinkInputValue(type: AdditionalLinkType, value: string) {
  const prefix = getAdditionalLinkPrefix(type);
  if (!prefix) return value;
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return value.replace(new RegExp(`^${escapedPrefix}`, "i"), "").replace(/\/+$/, "");
}

export function buildAdditionalLinkUrl(type: AdditionalLinkType, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const prefix = getAdditionalLinkPrefix(type);
  if (!prefix) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${prefix}${trimmed.replace(/^@/, "")}`;
}

export function getResumeLinks(data: ResumeData) {
  return [data.linkedin, data.portfolio, ...data.links_adicionais.map((link) => link.url)].filter(Boolean);
}
