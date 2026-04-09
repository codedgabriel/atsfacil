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

export type ResumeData = {
  nome_completo: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  linkedin: string;
  portfolio: string;
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
export const softSkillSuggestions = [
  "Comunicação",
  "Trabalho em equipe",
  "Liderança",
  "Proatividade",
  "Resolução de problemas",
  "Adaptabilidade",
  "Criatividade",
  "Organização",
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

export const defaultResumeData = (): ResumeData => ({
  nome_completo: "",
  email: "",
  telefone: "",
  cidade: "",
  estado: "",
  linkedin: "",
  portfolio: "",
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
