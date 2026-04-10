import { jsPDF } from "jspdf";
import { getResumeLinks, normalizeSoftSkillLabel, type ResumeData } from "@/lib/resume";

type GeneratePDFOptions = {
  save?: boolean;
  templateId?: string;
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

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  return [
    Number.parseInt(cleanHex.slice(0, 2), 16),
    Number.parseInt(cleanHex.slice(2, 4), 16),
    Number.parseInt(cleanHex.slice(4, 6), 16),
  ];
}

function getPrintTemplateColor(templateId: string) {
  const palette: Record<string, string> = {
    "print-executivo": "#111827",
    "print-editorial": "#047857",
    "print-tecnologia": "#1d4ed8",
    "print-design": "#e11d48",
    "print-comercial": "#0e7490",
    "print-administrativo": "#3f3f46",
    "print-estatistico": "#0f766e",
    "print-academico": "#4338ca",
    "print-minimal": "#171717",
    "print-projetos": "#15803d",
    "print-analista": "#0369a1",
    "print-gestao": "#b91c1c",
    "print-dev": "#6d28d9",
    "print-marketing": "#be185d",
    "print-operacoes": "#4d7c0f",
    "print-consultor": "#292524",
  };

  return palette[templateId] ?? "#2563eb";
}

function getPrintTemplateLayout(templateId: string) {
  if (templateId.includes("design") || templateId.includes("marketing") || templateId.includes("projetos")) return "banner";
  if (templateId.includes("tecnologia") || templateId.includes("gestao") || templateId.includes("estatistico")) return "right";
  if (templateId.includes("minimal") || templateId.includes("dev") || templateId.includes("comercial")) return "compact";
  return "left";
}

function drawPhotoPlaceholder(doc: jsPDF, x: number, y: number, size: number) {
  doc.setDrawColor("#cbd5e1");
  doc.setFillColor("#f8fafc");
  doc.rect(x, y, size, size, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor("#64748b");
  doc.text("Espaço para foto", x + size / 2, y + size / 2, { align: "center", maxWidth: size - 6 });
}

function printSectionHeader(doc: jsPDF, title: string, y: number, color: string) {
  y = ensureSpace(doc, y, 14);
  const [red, green, blue] = hexToRgb(color);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor("#111827");
  doc.text(title, page.margin, y);
  doc.setDrawColor(red, green, blue);
  doc.line(page.margin, y + 3, page.width - page.margin, y + 3);
  return y + 9;
}

function printItem(doc: jsPDF, title: string, details: string, y: number) {
  y = ensureSpace(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor("#111827");
  doc.text(clean(title), page.margin, y, { maxWidth: page.width - page.margin * 2 });
  y += 5;
  if (details) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#475569");
    doc.text(clean(details), page.margin, y, { maxWidth: page.width - page.margin * 2 });
    y += 6;
  }
  return y + 1;
}

function saveDocument(doc: jsPDF, formData: ResumeData, save: boolean, suffix = "ats") {
  const suffixPart = suffix ? `-${suffix}` : "";
  const fileName = `curriculo-atsfacil-${slugify(formData.nome_completo)}${suffixPart}.pdf`;
  if (save) doc.save(fileName);
  return doc;
}

function generatePrintPDF(formData: ResumeData, templateId: string, save: boolean) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const accent = getPrintTemplateColor(templateId);
  const [red, green, blue] = hexToRgb(accent);
  const layout = getPrintTemplateLayout(templateId);
  let y = page.margin;

  doc.setFillColor(red, green, blue);
  if (layout === "banner") {
    doc.rect(0, 0, page.width, 34, "F");
    drawPhotoPlaceholder(doc, page.width / 2 - 15, 20, 30);
    y = 58;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#111827");
    doc.text(clean(formData.nome_completo) || "Currículo", page.width / 2, y, { align: "center" });
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#475569");
    doc.text(clean(formData.cargo_desejado), page.width / 2, y, { align: "center", maxWidth: page.width - page.margin * 2 });
    y += 8;
  } else {
    doc.setFillColor(red, green, blue);
    doc.rect(0, 0, page.width, 8, "F");
    const photoX = layout === "right" ? page.width - page.margin - 34 : page.margin;
    drawPhotoPlaceholder(doc, photoX, page.margin + 2, layout === "compact" ? 26 : 34);
    const textX = layout === "right" ? page.margin : photoX + (layout === "compact" ? 34 : 44);
    const textWidth = layout === "right" ? page.width - page.margin * 2 - 44 : page.width - textX - page.margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#111827");
    doc.text(clean(formData.nome_completo) || "Currículo", textX, y + 8, { maxWidth: textWidth });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#475569");
    doc.text(clean(formData.cargo_desejado), textX, y + 16, { maxWidth: textWidth });
    y += layout === "compact" ? 44 : 50;
  }

  const location = [formData.cidade, formData.estado].filter(Boolean).join("-");
  const contact = [
    formData.email ? `Email: ${formData.email}` : "",
    formData.telefone ? `Telefone: ${formData.telefone}` : "",
    location ? `Localização: ${location}` : "",
  ].filter(Boolean);
  if (contact.length) y = paragraph(doc, contact.join(" | "), y);

  const links = getResumeLinks(formData);
  if (links.length) y = paragraph(doc, links.join(" | "), y);

  if (clean(formData.resumo_profissional)) {
    y = printSectionHeader(doc, "Resumo", y, accent);
    y = paragraph(doc, formData.resumo_profissional, y);
  }

  const experiences = formData.sem_experiencia
    ? []
    : [...formData.experiencias].filter((item) => item.empresa || item.cargo || item.descricao).reverse();
  if (experiences.length) {
    y = printSectionHeader(doc, "Experiência", y, accent);
    for (const item of experiences) {
      y = printItem(doc, `${item.cargo} - ${item.empresa}`, [item.data_inicio, item.data_fim].filter(Boolean).join(" - "), y);
      if (clean(item.descricao)) y = paragraph(doc, item.descricao, y);
    }
  }

  const education = formData.formacoes.filter((item) => item.curso || item.instituicao);
  if (education.length) {
    y = printSectionHeader(doc, "Formação", y, accent);
    for (const item of education) {
      y = printItem(doc, item.curso, [item.instituicao, item.nivel, item.data_conclusao].filter(Boolean).join(" | "), y);
    }
  }

  if (formData.habilidades_tecnicas.length || formData.habilidades_comportamentais.length) {
    y = printSectionHeader(doc, "Habilidades", y, accent);
    y = keyValueParagraph(doc, "Técnicas", formData.habilidades_tecnicas.join(", "), y);
    y = keyValueParagraph(doc, "Comportamentais", formData.habilidades_comportamentais.map(normalizeSoftSkillLabel).join(", "), y);
  }

  const languages = formData.idiomas.filter((item) => item.idioma);
  if (languages.length) {
    y = printSectionHeader(doc, "Idiomas", y, accent);
    for (const item of languages) y = paragraph(doc, `${item.idioma} - ${item.nivel}`, y);
  }

  const courses = formData.cursos.filter((item) => item.nome_curso || item.instituicao);
  if (courses.length) {
    y = printSectionHeader(doc, "Cursos e certificações", y, accent);
    for (const item of courses) {
      const suffix = [item.ano ? `(${item.ano})` : "", item.carga_horaria].filter(Boolean).join(" | ");
      y = paragraph(doc, `${item.nome_curso} - ${item.instituicao}${suffix ? ` ${suffix}` : ""}`, y);
    }
  }

  return saveDocument(doc, formData, save, "impressao");
}

export function generatePDF(formData: ResumeData, options: GeneratePDFOptions = {}) {
  const { save = true, templateId = "ats-clean" } = options;
  if (templateId.startsWith("print-")) {
    return generatePrintPDF(formData, templateId, save);
  }

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
    y = sectionHeader(doc, "CURSOS E CERTIFICA\u00c7\u00d5ES", y);
    for (const item of courses) {
      const suffix = [item.ano ? `(${item.ano})` : "", item.carga_horaria].filter(Boolean).join(" | ");
      y = paragraph(doc, `${item.nome_curso} - ${item.instituicao}${suffix ? ` ${suffix}` : ""}`, y);
    }
  }

  return saveDocument(doc, formData, save, "ats");
}
