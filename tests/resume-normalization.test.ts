import test from "node:test";
import assert from "node:assert/strict";
import { defaultResumeData, normalizeResumeData, normalizeSoftSkillLabel } from "../lib/resume";

test("normalizes legacy soft skill labels with portuguese accents", () => {
  assert.equal(normalizeSoftSkillLabel("Comunicacao"), "Comunicação");
  assert.equal(normalizeSoftSkillLabel("Lideranca"), "Liderança");
  assert.equal(normalizeSoftSkillLabel("Resolucao de problemas"), "Resolução de problemas");
  assert.equal(normalizeSoftSkillLabel("Visao estrategica"), "Visão estratégica");
});

test("normalizes saved behavioral skills inside resume data", () => {
  const data = {
    ...defaultResumeData(),
    habilidades_comportamentais: ["Comunicacao", "Organizacao", "Gestao do tempo"],
  };

  const normalized = normalizeResumeData(data);

  assert.deepEqual(normalized.habilidades_comportamentais, ["Comunicação", "Organização", "Gestão do tempo"]);
});
