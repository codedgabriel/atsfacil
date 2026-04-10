import { jsPDF } from "jspdf";
import { getPrintTemplate } from "@/lib/printTemplates";
import { getResumeLinks, normalizeSoftSkillLabel, type ResumeData } from "@/lib/resume";

type GeneratePDFOptions = {
  save?: boolean;
  templateId?: string;
  photoDataUrl?: string;
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
  return (
    clean(text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "curriculo"
  );
}

function ensureSpace(doc: jsPDF, y: number, needed = 12) {
  if (y + needed <= page.bottom) return y;
  doc.addPage();
  return page.margin;
}

function split(doc: jsPDF, text: string, width = page.width - page.margin * 2) {
  return doc.splitTextToSize(clean(text), width) as string[];
}

function hexToRgb(hex: string): [number, number, number] {
  const safeHex = hex.replace("#", "");
  return [
    Number.parseInt(safeHex.slice(0, 2), 16),
    Number.parseInt(safeHex.slice(2, 4), 16),
    Number.parseInt(safeHex.slice(4, 6), 16),
  ];
}

function imageFormat(dataUrl: string) {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  return "JPEG";
}

function saveDocument(doc: jsPDF, formData: ResumeData, save: boolean, suffix = "ats") {
  const suffixPart = suffix ? `-${suffix}` : "";
  const fileName = `curriculo-atsfacil-${slugify(formData.nome_completo)}${suffixPart}.pdf`;
  if (save) doc.save(fileName);
  return doc;
}

function paragraph(doc: jsPDF, text: string, y: number, x = page.margin, width = page.width - page.margin * 2) {
  const lines = split(doc, text, width);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  for (const line of lines) {
    y = ensureSpace(doc, y, 7);
    doc.text(line, x, y);
    y += 5.6;
  }
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

function drawPhotoBlock(doc: jsPDF, photoDataUrl: string | undefined, x: number, y: number, width: number, height: number) {
  doc.setDrawColor("#cbd5e1");
  doc.setFillColor("#f8fafc");
  doc.rect(x, y, width, height, "FD");

  if (photoDataUrl) {
    doc.addImage(photoDataUrl, imageFormat(photoDataUrl), x + 1, y + 1, width - 2, height - 2);
    return;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor("#64748b");
  doc.text("Espaço para foto", x + width / 2, y + height / 2, { align: "center", maxWidth: width - 6 });
}

function printSectionHeader(doc: jsPDF, title: string, y: number, accentHex: string, pattern: string, index: number) {
  const [red, green, blue] = hexToRgb(accentHex);
  y = ensureSpace(doc, y, 14);

  switch (pattern) {
    case "pill":
      doc.setFillColor(red, green, blue);
      doc.roundedRect(page.margin, y - 5, 34, 7, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#ffffff");
      doc.text(title, page.margin + 3, y);
      return y + 7;

    case "block":
      doc.setFillColor(red, green, blue);
      doc.rect(page.margin, y - 5, 46, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#ffffff");
      doc.text(title, page.margin + 3, y);
      return y + 8;

    case "tab":
      doc.setFillColor(red, green, blue);
      doc.rect(page.margin, y - 6, 22, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#ffffff");
      doc.text(title.slice(0, Math.min(12, title.length)), page.margin + 2.5, y);
      doc.setDrawColor(red, green, blue);
      doc.line(page.margin + 24, y - 1.5, page.width - page.margin, y - 1.5);
      return y + 7;

    case "double":
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor("#111827");
      doc.text(title, page.margin, y);
      doc.setDrawColor(red, green, blue);
      doc.line(page.margin, y + 2, page.width - page.margin, y + 2);
      doc.line(page.margin, y + 4, page.width - page.margin - 12, y + 4);
      return y + 9;

    case "cap":
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor("#111827");
      doc.text(title.toUpperCase(), page.margin, y);
      doc.setDrawColor(red, green, blue);
      doc.line(page.margin, y + 2, page.margin + 16, y + 2);
      return y + 8;

    case "numbered":
      doc.setFillColor(red, green, blue);
      doc.circle(page.margin + 5, y - 1.5, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor("#ffffff");
      doc.text(String(index).padStart(2, "0"), page.margin + 5, y - 0.4, { align: "center" });
      doc.setFontSize(11);
      doc.setTextColor("#111827");
      doc.text(title, page.margin + 13, y);
      return y + 8;

    case "fine":
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#111827");
      doc.text(title, page.margin, y);
      doc.setDrawColor(red, green, blue);
      doc.line(page.margin, y + 2, page.margin + 24, y + 2);
      return y + 7;

    default:
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor("#111827");
      doc.text(title, page.margin, y);
      doc.setDrawColor(red, green, blue);
      doc.line(page.margin, y + 3, page.width - page.margin, y + 3);
      return y + 9;
  }
}

function drawHeader(
  doc: jsPDF,
  templateId: string,
  formData: ResumeData,
  photoDataUrl?: string,
) {
  const template = getPrintTemplate(templateId);
  const [red, green, blue] = hexToRgb(template.accentHex);
  const [surfaceRed, surfaceGreen, surfaceBlue] = hexToRgb(template.surfaceHex);
  const title = clean(formData.nome_completo) || "Currículo";
  const role = clean(formData.cargo_desejado);
  const contact = [
    formData.email ? `Email: ${formData.email}` : "",
    formData.telefone ? `Telefone: ${formData.telefone}` : "",
    [formData.cidade, formData.estado].filter(Boolean).join("-"),
  ]
    .filter(Boolean)
    .join(" | ");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(template.inkHex);

  switch (template.headerPattern) {
    case "executive":
      doc.setFillColor(red, green, blue);
      doc.rect(0, 0, page.width, 8, "F");
      drawPhotoBlock(doc, photoDataUrl, page.margin, 14, 26, 34);
      doc.setFontSize(18);
      doc.text(title, 52, 26);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, 52, 33, { maxWidth: 120 });
      doc.text(contact, 52, 40, { maxWidth: 130 });
      doc.setDrawColor(red, green, blue);
      doc.line(52, 45, page.width - page.margin, 45);
      return 58;

    case "editorial":
      doc.setFillColor(surfaceRed, surfaceGreen, surfaceBlue);
      doc.rect(0, 0, page.width, 48, "F");
      drawPhotoBlock(doc, photoDataUrl, page.margin, 14, 30, 30);
      doc.setFontSize(19);
      doc.text(title, 56, 25);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, 56, 32, { maxWidth: 120 });
      doc.setFillColor(red, green, blue);
      doc.rect(56, 36, 70, 5, "F");
      doc.text(contact, page.margin, 56, { maxWidth: page.width - page.margin * 2 });
      return 66;

    case "technology":
      doc.setFillColor(red, green, blue);
      doc.rect(0, 0, page.width, 18, "F");
      drawPhotoBlock(doc, photoDataUrl, page.width - page.margin - 24, 22, 24, 24);
      doc.setFontSize(18);
      doc.setTextColor("#111827");
      doc.text(title, page.margin, 30, { maxWidth: 130 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#334155");
      doc.text(role, page.margin, 37, { maxWidth: 120 });
      doc.setFillColor(surfaceRed, surfaceGreen, surfaceBlue);
      doc.roundedRect(page.margin, 42, 120, 8, 2, 2, "F");
      doc.text(contact, page.margin + 3, 47, { maxWidth: 112 });
      return 61;

    case "design":
      doc.setFillColor(red, green, blue);
      doc.rect(0, 0, page.width, 30, "F");
      doc.setFillColor(surfaceRed, surfaceGreen, surfaceBlue);
      doc.rect(0, 30, page.width, 18, "F");
      drawPhotoBlock(doc, photoDataUrl, page.margin, 18, 42, 22);
      doc.setFontSize(20);
      doc.setTextColor("#111827");
      doc.text(title, page.margin, 56, { maxWidth: 150 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, page.margin, 63, { maxWidth: 150 });
      doc.text(contact, page.margin, 70, { maxWidth: page.width - page.margin * 2 });
      return 82;

    case "commercial":
      doc.setFillColor(red, green, blue);
      doc.rect(page.margin, 12, page.width - page.margin * 2, 10, "F");
      drawPhotoBlock(doc, photoDataUrl, page.margin, 28, 22, 22);
      doc.setFontSize(18);
      doc.setTextColor("#111827");
      doc.text(title, 48, 36, { maxWidth: 120 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, 48, 43, { maxWidth: 120 });
      doc.setFillColor(surfaceRed, surfaceGreen, surfaceBlue);
      doc.roundedRect(page.margin, 56, page.width - page.margin * 2, 10, 2, 2, "F");
      doc.text(contact, page.margin + 3, 62, { maxWidth: page.width - page.margin * 2 - 6 });
      return 76;

    case "administrative":
      doc.setDrawColor(red, green, blue);
      doc.rect(page.margin, 12, page.width - page.margin * 2, 44);
      drawPhotoBlock(doc, photoDataUrl, page.width - page.margin - 20, 18, 20, 28);
      doc.setFontSize(17);
      doc.setTextColor("#111827");
      doc.text(title, page.margin + 4, 26, { maxWidth: 120 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, page.margin + 4, 34, { maxWidth: 118 });
      doc.text(contact, page.margin + 4, 42, { maxWidth: 118 });
      doc.line(page.margin + 4, 46, page.width - page.margin - 26, 46);
      return 68;

    case "statistical":
      doc.setFillColor(surfaceRed, surfaceGreen, surfaceBlue);
      doc.rect(0, 0, page.width, 54, "F");
      drawPhotoBlock(doc, photoDataUrl, page.width - page.margin - 24, 16, 24, 24);
      doc.setFontSize(19);
      doc.setTextColor("#111827");
      doc.text(title, page.margin, 26, { maxWidth: 120 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, page.margin, 34, { maxWidth: 120 });
      doc.setFillColor(red, green, blue);
      doc.rect(page.margin, 41, 18, 6, "F");
      doc.rect(page.margin + 22, 37, 18, 10, "F");
      doc.rect(page.margin + 44, 33, 18, 14, "F");
      doc.text(contact, 68, 45, { maxWidth: 100 });
      return 66;

    case "academic":
      doc.setDrawColor(red, green, blue);
      doc.line(page.margin, 18, page.width - page.margin, 18);
      doc.line(page.margin, 24, page.width - page.margin, 24);
      drawPhotoBlock(doc, photoDataUrl, page.width / 2 - 14, 30, 28, 28);
      doc.setFontSize(18);
      doc.setTextColor("#111827");
      doc.text(title, page.width / 2, 68, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, page.width / 2, 75, { align: "center", maxWidth: 150 });
      doc.text(contact, page.width / 2, 82, { align: "center", maxWidth: 160 });
      return 94;

    case "minimal":
      drawPhotoBlock(doc, photoDataUrl, page.width - page.margin - 20, 14, 20, 20);
      doc.setFontSize(20);
      doc.setTextColor("#111827");
      doc.text(title, page.margin, 25, { maxWidth: 130 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#525252");
      doc.text(role, page.margin, 32, { maxWidth: 120 });
      doc.line(page.margin, 38, page.width - page.margin, 38);
      doc.text(contact, page.margin, 45, { maxWidth: page.width - page.margin * 2 });
      return 58;

    case "projects":
      doc.setFillColor(red, green, blue);
      doc.rect(page.margin, 14, 70, 34, "F");
      doc.setFillColor(surfaceRed, surfaceGreen, surfaceBlue);
      doc.rect(96, 14, page.width - page.margin - 96, 34, "F");
      drawPhotoBlock(doc, photoDataUrl, page.margin + 6, 20, 20, 20);
      doc.setFontSize(18);
      doc.setTextColor("#ffffff");
      doc.text(title, page.margin + 32, 28, { maxWidth: 32 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(role, page.margin + 32, 35, { maxWidth: 32 });
      doc.setTextColor("#334155");
      doc.text(contact, 102, 29, { maxWidth: 72 });
      doc.text(getResumeLinks(formData).join(" | "), 102, 36, { maxWidth: 72 });
      return 62;

    case "analyst":
      doc.setFillColor(red, green, blue);
      doc.rect(0, 0, 24, page.width, "F");
      drawPhotoBlock(doc, photoDataUrl, 28, 16, 24, 30);
      doc.setFontSize(18);
      doc.setTextColor("#111827");
      doc.text(title, 58, 26, { maxWidth: 120 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, 58, 33, { maxWidth: 120 });
      doc.text(contact, 58, 40, { maxWidth: 120 });
      return 56;

    case "management":
      doc.setFillColor(red, green, blue);
      doc.rect(page.width - 58, 0, 58, 46, "F");
      drawPhotoBlock(doc, photoDataUrl, page.width - 48, 16, 28, 28);
      doc.setFontSize(20);
      doc.setTextColor("#111827");
      doc.text(title, page.width - page.margin, 26, { align: "right", maxWidth: 120 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, page.width - page.margin, 33, { align: "right", maxWidth: 120 });
      doc.text(contact, page.width - page.margin, 40, { align: "right", maxWidth: 120 });
      return 56;

    case "developer":
      doc.setFillColor(red, green, blue);
      doc.rect(0, 0, page.width, 34, "F");
      drawPhotoBlock(doc, photoDataUrl, page.width - page.margin - 22, 18, 22, 22);
      doc.setFontSize(18);
      doc.setTextColor("#ffffff");
      doc.text(title, page.margin, 25, { maxWidth: 120 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(role, page.margin, 31, { maxWidth: 120 });
      doc.setTextColor("#111827");
      doc.setDrawColor(red, green, blue);
      doc.rect(page.margin, 42, page.width - page.margin * 2, 10);
      doc.text(contact, page.margin + 3, 48, { maxWidth: page.width - page.margin * 2 - 6 });
      return 64;

    case "marketing":
      doc.setFillColor(surfaceRed, surfaceGreen, surfaceBlue);
      doc.rect(0, 0, page.width, 54, "F");
      doc.setFillColor(red, green, blue);
      doc.rect(page.width - 56, 0, 56, 54, "F");
      drawPhotoBlock(doc, photoDataUrl, page.width - 46, 14, 26, 26);
      doc.setFontSize(19);
      doc.setTextColor("#111827");
      doc.text(title, page.margin, 24, { maxWidth: 110 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, page.margin, 32, { maxWidth: 100 });
      doc.text(contact, page.margin, 43, { maxWidth: 100 });
      return 64;

    case "operations":
      doc.setFillColor(red, green, blue);
      doc.rect(page.margin, 14, 10, 48, "F");
      doc.rect(page.margin + 14, 14, page.width - page.margin * 2 - 14, 8, "F");
      drawPhotoBlock(doc, photoDataUrl, page.width - page.margin - 20, 28, 20, 28);
      doc.setFontSize(18);
      doc.setTextColor("#111827");
      doc.text(title, page.margin + 18, 33, { maxWidth: 110 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      doc.text(role, page.margin + 18, 40, { maxWidth: 110 });
      doc.text(contact, page.margin + 18, 47, { maxWidth: 110 });
      return 68;

    default:
      doc.setDrawColor(red, green, blue);
      doc.line(page.margin, 18, page.width - page.margin, 18);
      drawPhotoBlock(doc, photoDataUrl, page.margin, 24, 24, 24);
      doc.setFontSize(18);
      doc.setTextColor("#111827");
      doc.text(title, 52, 32, { maxWidth: 110 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#57534e");
      doc.text(role, 52, 39, { maxWidth: 110 });
      doc.text(contact, 52, 46, { maxWidth: 110 });
      doc.line(52, 51, page.width - page.margin, 51);
      return 63;
  }
}

function generatePrintPDF(formData: ResumeData, templateId: string, save: boolean, photoDataUrl?: string) {
  const template = getPrintTemplate(templateId);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = drawHeader(doc, templateId, formData, photoDataUrl);
  let sectionIndex = 0;

  const links = getResumeLinks(formData);
  if (links.length) {
    y = paragraph(doc, links.join(" | "), y);
  }

  if (clean(formData.resumo_profissional)) {
    sectionIndex += 1;
    y = printSectionHeader(doc, "Resumo", y, template.accentHex, template.sectionPattern, sectionIndex);
    y = paragraph(doc, formData.resumo_profissional, y);
  }

  const experiences = formData.sem_experiencia
    ? []
    : [...formData.experiencias].filter((item) => item.empresa || item.cargo || item.descricao).reverse();
  if (experiences.length) {
    sectionIndex += 1;
    y = printSectionHeader(doc, "Experiência", y, template.accentHex, template.sectionPattern, sectionIndex);
    for (const item of experiences) {
      y = ensureSpace(doc, y, 14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#111827");
      doc.text(clean(`${item.cargo} - ${item.empresa}`), page.margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#475569");
      const period = [item.data_inicio, item.data_fim].filter(Boolean).join(" - ");
      if (period) doc.text(period, page.width - page.margin, y, { align: "right" });
      y += 5.5;
      if (clean(item.descricao)) y = paragraph(doc, item.descricao, y);
    }
  }

  const education = formData.formacoes.filter((item) => item.curso || item.instituicao);
  if (education.length) {
    sectionIndex += 1;
    y = printSectionHeader(doc, "Formação", y, template.accentHex, template.sectionPattern, sectionIndex);
    for (const item of education) {
      y = ensureSpace(doc, y, 12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#111827");
      doc.text(clean(item.curso), page.margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#475569");
      doc.text(clean([item.instituicao, item.nivel, item.data_conclusao].filter(Boolean).join(" | ")), page.margin, y);
      y += 7;
    }
  }

  if (formData.habilidades_tecnicas.length || formData.habilidades_comportamentais.length) {
    sectionIndex += 1;
    y = printSectionHeader(doc, "Habilidades", y, template.accentHex, template.sectionPattern, sectionIndex);
    y = keyValueParagraph(doc, "Técnicas", formData.habilidades_tecnicas.join(", "), y);
    y = keyValueParagraph(doc, "Comportamentais", formData.habilidades_comportamentais.map(normalizeSoftSkillLabel).join(", "), y);
  }

  const languages = formData.idiomas.filter((item) => item.idioma);
  if (languages.length) {
    sectionIndex += 1;
    y = printSectionHeader(doc, "Idiomas", y, template.accentHex, template.sectionPattern, sectionIndex);
    for (const item of languages) {
      y = paragraph(doc, `${item.idioma} - ${item.nivel}`, y);
    }
  }

  const courses = formData.cursos.filter((item) => item.nome_curso || item.instituicao);
  if (courses.length) {
    sectionIndex += 1;
    y = printSectionHeader(doc, "Cursos e certificações", y, template.accentHex, template.sectionPattern, sectionIndex);
    for (const item of courses) {
      const suffix = [item.ano ? `(${item.ano})` : "", item.carga_horaria].filter(Boolean).join(" | ");
      y = paragraph(doc, `${item.nome_curso} - ${item.instituicao}${suffix ? ` ${suffix}` : ""}`, y);
    }
  }

  return saveDocument(doc, formData, save, "impressao");
}

export function generatePDF(formData: ResumeData, options: GeneratePDFOptions = {}) {
  const { save = true, templateId = "ats-clean", photoDataUrl } = options;
  if (templateId.startsWith("print-")) {
    return generatePrintPDF(formData, templateId, save, photoDataUrl);
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = page.margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor("#000000");
  doc.text(clean(formData.nome_completo) || "Currículo", page.width / 2, y, { align: "center" });
  y += 7;

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
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
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
    y = sectionHeader(doc, "EXPERIÊNCIA PROFISSIONAL", y);
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
      doc.text(clean([item.instituicao, item.nivel, item.data_conclusao].filter(Boolean).join(" | ")), page.margin, y);
      y += 8;
    }
  }

  if (formData.habilidades_tecnicas.length || formData.habilidades_comportamentais.length) {
    y = sectionHeader(doc, "HABILIDADES", y);
    y = keyValueParagraph(doc, "Técnicas", formData.habilidades_tecnicas.join(", "), y);
    y = keyValueParagraph(doc, "Comportamentais", formData.habilidades_comportamentais.map(normalizeSoftSkillLabel).join(", "), y);
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
    y = sectionHeader(doc, "CURSOS E CERTIFICAÇÕES", y);
    for (const item of courses) {
      const suffix = [item.ano ? `(${item.ano})` : "", item.carga_horaria].filter(Boolean).join(" | ");
      y = paragraph(doc, `${item.nome_curso} - ${item.instituicao}${suffix ? ` ${suffix}` : ""}`, y);
    }
  }

  return saveDocument(doc, formData, save, "ats");
}
