export type PrintTemplateId =
  | "print-executivo"
  | "print-editorial"
  | "print-tecnologia"
  | "print-design"
  | "print-comercial"
  | "print-administrativo"
  | "print-estatistico"
  | "print-academico"
  | "print-minimal"
  | "print-projetos"
  | "print-analista"
  | "print-gestao"
  | "print-dev"
  | "print-marketing"
  | "print-operacoes"
  | "print-consultor";

export type PrintTemplate = {
  id: PrintTemplateId;
  name: string;
  label: string;
  accentHex: string;
  surfaceHex: string;
  inkHex: string;
  previewVariant:
    | "executive"
    | "editorial"
    | "technology"
    | "design"
    | "commercial"
    | "administrative"
    | "statistical"
    | "academic"
    | "minimal"
    | "projects"
    | "analyst"
    | "management"
    | "developer"
    | "marketing"
    | "operations"
    | "consulting";
  photoShape: "square" | "soft" | "portrait" | "wide";
  headerPattern:
    | "executive"
    | "editorial"
    | "technology"
    | "design"
    | "commercial"
    | "administrative"
    | "statistical"
    | "academic"
    | "minimal"
    | "projects"
    | "analyst"
    | "management"
    | "developer"
    | "marketing"
    | "operations"
    | "consulting";
  sectionPattern:
    | "rule"
    | "pill"
    | "block"
    | "tab"
    | "double"
    | "cap"
    | "numbered"
    | "fine";
};

export const TEMPLATE_STORAGE_KEY = "atsfacil_template";
export const PHOTO_STORAGE_KEY = "atsfacil_print_photo";
export const DEFAULT_PRINT_TEMPLATE_ID: PrintTemplateId = "print-executivo";

export const printResumeTemplates: PrintTemplate[] = [
  {
    id: "print-executivo",
    name: "Executivo",
    label: "Impressão",
    accentHex: "#111827",
    surfaceHex: "#f8fafc",
    inkHex: "#111827",
    previewVariant: "executive",
    photoShape: "portrait",
    headerPattern: "executive",
    sectionPattern: "rule",
  },
  {
    id: "print-editorial",
    name: "Editorial",
    label: "Impressão",
    accentHex: "#047857",
    surfaceHex: "#ecfdf5",
    inkHex: "#14532d",
    previewVariant: "editorial",
    photoShape: "soft",
    headerPattern: "editorial",
    sectionPattern: "pill",
  },
  {
    id: "print-tecnologia",
    name: "Tecnologia",
    label: "Impressão",
    accentHex: "#1d4ed8",
    surfaceHex: "#eff6ff",
    inkHex: "#1e3a8a",
    previewVariant: "technology",
    photoShape: "square",
    headerPattern: "technology",
    sectionPattern: "block",
  },
  {
    id: "print-design",
    name: "Design",
    label: "Impressão",
    accentHex: "#e11d48",
    surfaceHex: "#fff1f2",
    inkHex: "#881337",
    previewVariant: "design",
    photoShape: "wide",
    headerPattern: "design",
    sectionPattern: "pill",
  },
  {
    id: "print-comercial",
    name: "Comercial",
    label: "Impressão",
    accentHex: "#0e7490",
    surfaceHex: "#ecfeff",
    inkHex: "#155e75",
    previewVariant: "commercial",
    photoShape: "soft",
    headerPattern: "commercial",
    sectionPattern: "double",
  },
  {
    id: "print-administrativo",
    name: "Administrativo",
    label: "Impressão",
    accentHex: "#3f3f46",
    surfaceHex: "#fafafa",
    inkHex: "#27272a",
    previewVariant: "administrative",
    photoShape: "portrait",
    headerPattern: "administrative",
    sectionPattern: "fine",
  },
  {
    id: "print-estatistico",
    name: "Estatístico",
    label: "Impressão",
    accentHex: "#0f766e",
    surfaceHex: "#f0fdfa",
    inkHex: "#134e4a",
    previewVariant: "statistical",
    photoShape: "square",
    headerPattern: "statistical",
    sectionPattern: "numbered",
  },
  {
    id: "print-academico",
    name: "Acadêmico",
    label: "Impressão",
    accentHex: "#4338ca",
    surfaceHex: "#eef2ff",
    inkHex: "#312e81",
    previewVariant: "academic",
    photoShape: "soft",
    headerPattern: "academic",
    sectionPattern: "cap",
  },
  {
    id: "print-minimal",
    name: "Minimal",
    label: "Impressão",
    accentHex: "#171717",
    surfaceHex: "#fafafa",
    inkHex: "#171717",
    previewVariant: "minimal",
    photoShape: "square",
    headerPattern: "minimal",
    sectionPattern: "fine",
  },
  {
    id: "print-projetos",
    name: "Projetos",
    label: "Impressão",
    accentHex: "#15803d",
    surfaceHex: "#f0fdf4",
    inkHex: "#166534",
    previewVariant: "projects",
    photoShape: "wide",
    headerPattern: "projects",
    sectionPattern: "tab",
  },
  {
    id: "print-analista",
    name: "Analista",
    label: "Impressão",
    accentHex: "#0369a1",
    surfaceHex: "#f0f9ff",
    inkHex: "#0c4a6e",
    previewVariant: "analyst",
    photoShape: "portrait",
    headerPattern: "analyst",
    sectionPattern: "block",
  },
  {
    id: "print-gestao",
    name: "Gestão",
    label: "Impressão",
    accentHex: "#b91c1c",
    surfaceHex: "#fef2f2",
    inkHex: "#7f1d1d",
    previewVariant: "management",
    photoShape: "square",
    headerPattern: "management",
    sectionPattern: "double",
  },
  {
    id: "print-dev",
    name: "Desenvolvedor",
    label: "Impressão",
    accentHex: "#6d28d9",
    surfaceHex: "#f5f3ff",
    inkHex: "#4c1d95",
    previewVariant: "developer",
    photoShape: "soft",
    headerPattern: "developer",
    sectionPattern: "numbered",
  },
  {
    id: "print-marketing",
    name: "Marketing",
    label: "Impressão",
    accentHex: "#be185d",
    surfaceHex: "#fdf2f8",
    inkHex: "#831843",
    previewVariant: "marketing",
    photoShape: "wide",
    headerPattern: "marketing",
    sectionPattern: "pill",
  },
  {
    id: "print-operacoes",
    name: "Operações",
    label: "Impressão",
    accentHex: "#4d7c0f",
    surfaceHex: "#f7fee7",
    inkHex: "#365314",
    previewVariant: "operations",
    photoShape: "portrait",
    headerPattern: "operations",
    sectionPattern: "tab",
  },
  {
    id: "print-consultor",
    name: "Consultor",
    label: "Impressão",
    accentHex: "#292524",
    surfaceHex: "#fafaf9",
    inkHex: "#292524",
    previewVariant: "consulting",
    photoShape: "soft",
    headerPattern: "consulting",
    sectionPattern: "cap",
  },
];

export const printTemplateIds = new Set(printResumeTemplates.map((template) => template.id));

export function getPrintTemplate(templateId: string) {
  return printResumeTemplates.find((template) => template.id === templateId) ?? printResumeTemplates[0];
}

export function isPrintTemplateId(value: string): value is PrintTemplateId {
  return printTemplateIds.has(value as PrintTemplateId);
}
