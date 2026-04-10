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
