import { jsPDF } from "jspdf";
import { getResumeLinks, type ResumeData } from "@/lib/resume";

type GeneratePDFOptions = {
  save?: boolean;
};

const page = {
  margin: 20,
  width: 210,
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

function keyValueParagraph(doc: jsPDF, label: string, value: string, y: number) {
  const cleanValue = clean(value);
  if (!cleanValue) return y;

  const labelText = `${label}:`;
  const labelX = page.margin;

  doc.setFontSize(10);
  doc.setTextColor("#333333");
  doc.setFont("helvetica", "bold");
  const valueX = labelX + doc.getTextWidth(labelText) + 2;
  const valueWidth = page.width - page.margin - valueX;
  doc.setFont("helvetica", "normal");
  const lines = split(doc, cleanValue, valueWidth);

  lines.forEach((line, index) => {
    y = ensureSpace(doc, y, 7);
    if (index === 0) {
      doc.setFont("helvetica", "bold");
      doc.text(labelText, labelX, y);
    }
    doc.setFont("helvetica", "normal");
    doc.text(line, valueX, y);
    y += 5.6;
  });

  return y + 2;
}

function centeredMetaLine(doc: jsPDF, values: string[], y: number) {
  const text = values.filter(Boolean).join(" | ");
  if (!text) return y;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  doc.text(text, page.width / 2, y, { align: "center", maxWidth: page.width - page.margin * 2 });
  return y + 5;
}

export function generatePDF(formData: ResumeData, options: GeneratePDFOptions = {}) {
  const { save = true } = options;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = page.margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor("#000000");
  doc.text(clean(formData.nome_completo) || "Curr\u00edculo", page.width / 2, y, { align: "center" });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  const location = [formData.cidade, formData.estado].filter(Boolean).join("-");
  y = centeredMetaLine(
    doc,
    [
      formData.email ? `Email: ${formData.email}` : "",
      formData.telefone ? `Telefone: ${formData.telefone}` : "",
      location ? `Localização: ${location}` : "",
    ],
    y,
  );

  const links = getResumeLinks(formData).join(" | ");
  if (links) {
    doc.setTextColor("#475569");
    doc.text(links, page.width / 2, y, { align: "center", maxWidth: page.width - page.margin * 2 });
    y += 8;
  } else {
    y += 3;
  }

  if (clean(formData.resumo_profissional)) {
    y = sectionHeader(doc, "RESUMO PROFISSIONAL", y);
    y = paragraph(doc, formData.resumo_profissional, y);
  }

  const experiences = formData.sem_experiencia
    ? []
    : [...formData.experiencias].filter((item) => item.empresa || item.cargo || item.descricao).reverse();

  if (experiences.length) {
    y = sectionHeader(doc, "EXPERI\u00caNCIA PROFISSIONAL", y);
    for (const item of experiences) {
      y = ensureSpace(doc, y, 16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#000000");
      doc.text(clean(`${item.cargo} - ${item.empresa}`), page.margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#333333");
      const dateText = [item.data_inicio, item.data_fim].filter(Boolean).join(" - ");
      if (dateText) doc.text(dateText, page.width - page.margin, y, { align: "right" });
      y += 6;
      if (clean(item.descricao)) y = paragraph(doc, item.descricao, y);
    }
  }

  const education = formData.formacoes.filter((item) => item.curso || item.instituicao);
  if (education.length) {
    y = sectionHeader(doc, "FORMA\u00c7\u00c3O ACAD\u00caMICA", y);
    for (const item of education) {
      y = ensureSpace(doc, y, 12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#000000");
      doc.text(clean(item.curso), page.margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#333333");
      doc.text(clean([item.instituicao, item.nivel, item.data_conclusao].filter(Boolean).join(" | ")), page.margin, y);
      y += 8;
    }
  }

  if (formData.habilidades_tecnicas.length || formData.habilidades_comportamentais.length) {
    y = sectionHeader(doc, "HABILIDADES", y);
    y = keyValueParagraph(doc, "T\u00e9cnicas", formData.habilidades_tecnicas.join(", "), y);
    y = keyValueParagraph(doc, "Comportamentais", formData.habilidades_comportamentais.join(", "), y);
    y += 2;
  }

  const languages = formData.idiomas.filter((item) => item.idioma);
  if (languages.length) {
    y = sectionHeader(doc, "IDIOMAS", y);
    for (const item of languages) {
      y = paragraph(doc, `${item.idioma} - ${item.nivel}`, y);
    }
  }

  const courses = formData.cursos.filter((item) => item.nome_curso || item.instituicao);
  if (courses.length) {
    y = sectionHeader(doc, "CURSOS E CERTIFICA\u00c7\u00d5ES", y);
    for (const item of courses) {
      const suffix = [item.ano ? `(${item.ano})` : "", item.carga_horaria].filter(Boolean).join(" | ");
      y = paragraph(doc, `${item.nome_curso} - ${item.instituicao}${suffix ? ` ${suffix}` : ""}`, y);
    }
  }

  const fileName = `curriculo-atsfacil-${slugify(formData.nome_completo)}.pdf`;
  if (save) doc.save(fileName);
  return doc;
}
