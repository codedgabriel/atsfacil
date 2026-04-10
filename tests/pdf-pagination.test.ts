import test from "node:test";
import assert from "node:assert/strict";
import { generatePDF } from "../lib/generatePDF";
import { defaultResumeData } from "../lib/resume";

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
