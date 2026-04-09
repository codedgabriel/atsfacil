import { jsPDF } from "jspdf";
import type { ResumeData } from "@/lib/resume";

type GeneratePDFOptions = {
  save?: boolean;
};

const page = {
  margin: 20,
  width: 210,
  height: 297,
  bottom: 277,
};

function clean(text?: string) {
  return (text || "").replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function slugify(text: string) {
  return clean(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "curriculo";
}

function ensureSpace(doc: jsPDF, y: number, needed = 12) {
  if (y + needed <= page.bottom) return y;
  doc.addPage();
  return page.margin;
}

function split(doc: jsPDF, text: string, width = page.width - page.margin * 2) {
  return doc.splitTextToSize(clean(text), width) as string[];
}

function sectionHeader(doc: jsPDF, title: string, y: number) {
  y = ensureSpace(doc, y, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#000000");
  doc.text(title, page.margin, y);
  y += 3;
  doc.setDrawColor("#000000");
  doc.line(page.margin, y, page.width - page.margin, y);
  return y + 7;
}

function paragraph(doc: jsPDF, text: string, y: number) {
  const lines = split(doc, text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  for (const line of lines) {
    y = ensureSpace(doc, y, 7);
    doc.text(line, page.margin, y);
    y += 5.6;
  }
  return y + 2;
}

function keyValueLine(doc: jsPDF, label: string, value: string, y: number) {
  if (!value) return y;
  y = ensureSpace(doc, y, 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  doc.text(`${label}:`, page.margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(value, page.margin + 26, y);
  return y + 6;
}

export function generatePDF(formData: ResumeData, options: GeneratePDFOptions = {}) {
  const { save = true } = options;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = page.margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor("#000000");
  doc.text(clean(formData.nome_completo) || "Currículo", page.width / 2, y, { align: "center" });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  const location = [formData.cidade, formData.estado].filter(Boolean).join("-");
  const contact = [formData.email, formData.telefone, location].filter(Boolean).join(" | ");
  if (contact) {
    doc.text(contact, page.width / 2, y, { align: "center" });
    y += 5;
  }
  const links = [formData.linkedin, formData.portfolio].filter(Boolean).join(" · ");
  if (links) {
    doc.setTextColor("#475569");
    doc.text(links, page.width / 2, y, { align: "center" });
    y += 8;
  } else {
    y += 3;
  }

  if (clean(formData.resumo_profissional)) {
    y = sectionHeader(doc, "RESUMO PROFISSIONAL", y);
    y = paragraph(doc, formData.resumo_profissional, y);
  }

  const experiences = formData.sem_experiencia ? [] : [...formData.experiencias].filter((exp) => exp.empresa || exp.cargo || exp.descricao).reverse();
  if (experiences.length) {
    y = sectionHeader(doc, "EXPERIÊNCIA PROFISSIONAL", y);
    for (const exp of experiences) {
      y = ensureSpace(doc, y, 16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#000000");
      doc.text(clean(`${exp.cargo} — ${exp.empresa}`), page.margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#333333");
      const dateText = [exp.data_inicio, exp.data_fim].filter(Boolean).join(" – ");
      if (dateText) doc.text(dateText, page.width - page.margin, y, { align: "right" });
      y += 6;
      if (clean(exp.descricao)) y = paragraph(doc, exp.descricao, y);
    }
  }

  const education = formData.formacoes.filter((item) => item.curso || item.instituicao);
  if (education.length) {
    y = sectionHeader(doc, "FORMAÇÃO ACADÊMICA", y);
    for (const item of education) {
      y = ensureSpace(doc, y, 12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#000000");
      doc.text(clean(item.curso), page.margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#333333");
      doc.text(clean([item.instituicao, item.nivel, item.data_conclusao].filter(Boolean).join(" · ")), page.margin, y);
      y += 8;
    }
  }

  if (formData.habilidades_tecnicas.length || formData.habilidades_comportamentais.length) {
    y = sectionHeader(doc, "HABILIDADES", y);
    y = keyValueLine(doc, "Técnicas", formData.habilidades_tecnicas.join(", "), y);
    y = keyValueLine(doc, "Comportamentais", formData.habilidades_comportamentais.join(", "), y);
    y += 2;
  }

  const languages = formData.idiomas.filter((item) => item.idioma);
  if (languages.length) {
    y = sectionHeader(doc, "IDIOMAS", y);
    for (const item of languages) {
      y = paragraph(doc, `${item.idioma} — ${item.nivel}`, y);
    }
  }

  const courses = formData.cursos.filter((item) => item.nome_curso || item.instituicao);
  if (courses.length) {
    y = sectionHeader(doc, "CURSOS E CERTIFICAÇÕES", y);
    for (const item of courses) {
      const suffix = [item.ano ? `(${item.ano})` : "", item.carga_horaria].filter(Boolean).join(" · ");
      y = paragraph(doc, `${item.nome_curso} — ${item.instituicao}${suffix ? ` ${suffix}` : ""}`, y);
    }
  }

  const fileName = `curriculo-atsfacil-${slugify(formData.nome_completo)}.pdf`;
  if (save) doc.save(fileName);
  return doc;
}
