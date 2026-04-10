import test from "node:test";
import assert from "node:assert/strict";
import { generatePDF } from "../lib/generatePDF";
import { defaultResumeData } from "../lib/resume";

function getPdfTextOperations(doc: ReturnType<typeof generatePDF>) {
  return ((doc.internal as unknown as { pages: string[][] }).pages || []).flat();
}

function getTextXInMm(doc: ReturnType<typeof generatePDF>, operation: string) {
  const match = operation.match(/([\d.]+)\s+[\d.]+\s+Td/);
  assert.ok(match, `Expected text operation coordinates in: ${operation}`);
  return Number(match[1]) / doc.internal.scaleFactor;
}

test("long skill lists paginate instead of overflowing one line", () => {
  const data = defaultResumeData();
  data.nome_completo = "Pessoa Teste";
  data.email = "teste@example.com";
  data.cargo_desejado = "Analista";
  data.resumo_profissional = "Resumo curto para manter o teste focado em habilidades.";
  data.habilidades_tecnicas = Array.from({ length: 90 }, (_, index) => `Habilidade tecnica muito longa ${index + 1}`);
  data.habilidades_comportamentais = Array.from({ length: 90 }, (_, index) => `Habilidade comportamental muito longa ${index + 1}`);

  const doc = generatePDF(data, { save: false });

  assert.ok(doc.getNumberOfPages() > 1);
});

test("soft skill text starts after the full comportamentais label", () => {
  const data = defaultResumeData();
  data.nome_completo = "Pessoa Teste";
  data.email = "teste@example.com";
  data.resumo_profissional = "Resumo.";
  data.habilidades_comportamentais = ["Visao estrategica", "Tomada de decisao", "Comunicacao"];

  const doc = generatePDF(data, { save: false });
  const operations = getPdfTextOperations(doc);
  const labelIndex = operations.findIndex((operation) => operation.includes("(Comportamentais:) Tj"));
  assert.notEqual(labelIndex, -1);

  const valueOperation = operations.slice(labelIndex + 1).find((operation) => operation.includes("(Vis"));
  assert.ok(valueOperation);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const labelX = getTextXInMm(doc, operations[labelIndex]);
  const valueX = getTextXInMm(doc, valueOperation);

  assert.ok(valueX >= labelX + doc.getTextWidth("Comportamentais:") + 1);
});

test("print template PDFs include a photo placeholder", () => {
  const data = defaultResumeData();
  data.nome_completo = "Pessoa Teste";
  data.email = "teste@example.com";
  data.telefone = "(85) 99999-9999";
  data.cargo_desejado = "Designer de Produto";
  data.resumo_profissional = "Profissional com foco em portfólio impresso e apresentação visual.";
  data.habilidades_tecnicas = ["Figma", "Design System", "Pesquisa"];

  const doc = generatePDF(data, { save: false, templateId: "print-design" });
  const operations = getPdfTextOperations(doc);

  assert.ok(operations.some((operation) => operation.includes("(Espa")));
});

test("uploaded photos replace the print placeholder text", () => {
  const data = defaultResumeData();
  data.nome_completo = "Pessoa Teste";
  data.email = "teste@example.com";
  data.cargo_desejado = "Designer Visual";

  const photoDataUrl =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDyeiiiv7TPwo//2Q==";

  const doc = generatePDF(data, { save: false, templateId: "print-editorial", photoDataUrl });
  const operations = getPdfTextOperations(doc);

  assert.ok(!operations.some((operation) => operation.includes("(Espa")));
});

test("each print template generates a distinct visual signature", () => {
  const data = defaultResumeData();
  data.nome_completo = "Pessoa Teste";
  data.email = "teste@example.com";
  data.telefone = "(85) 99999-9999";
  data.cargo_desejado = "Especialista";
  data.resumo_profissional = "Resumo suficiente para comparar a composição visual dos modelos.";
  data.experiencias[0].empresa = "Empresa Exemplo";
  data.experiencias[0].cargo = "Cargo Exemplo";
  data.formacoes[0].curso = "Curso Exemplo";
  data.formacoes[0].instituicao = "Instituição Exemplo";

  const templateIds = [
    "print-executivo",
    "print-editorial",
    "print-tecnologia",
    "print-design",
    "print-comercial",
    "print-administrativo",
    "print-estatistico",
    "print-academico",
    "print-minimal",
    "print-projetos",
    "print-analista",
    "print-gestao",
    "print-dev",
    "print-marketing",
    "print-operacoes",
    "print-consultor",
  ];

  const signatures = new Set(
    templateIds.map((templateId) =>
      getPdfTextOperations(generatePDF(data, { save: false, templateId }))
        .slice(0, 120)
        .join("\n"),
    ),
  );

  assert.equal(signatures.size, templateIds.length);
});
