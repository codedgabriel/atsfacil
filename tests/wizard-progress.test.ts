import test from "node:test";
import assert from "node:assert/strict";
import { defaultResumeData, type ResumeData } from "../lib/resume";
import { getWizardStepState } from "../lib/wizardProgress";

function baseResume(): ResumeData {
  return defaultResumeData();
}

test("marks a step as started when the user has typed data before clicking next", () => {
  const data = {
    ...baseResume(),
    cargo_desejado: "Analista de Dados",
  };

  const state = getWizardStepState(data, 1, 0, 0);

  assert.equal(state.progress, "started");
  assert.equal(state.canNavigate, true);
});

test("marks professional experience as complete from saved form data", () => {
  const data = {
    ...baseResume(),
    experiencias: [
      {
        id: "exp-1",
        empresa: "Empresa Exemplo",
        cargo: "Desenvolvedor Front-end",
        data_inicio: "01/2024",
        data_fim: "Atual",
        descricao: "Criei telas em React e reduzi retrabalho em 20%.",
      },
    ],
  };

  const state = getWizardStepState(data, 2, 0, 0);

  assert.equal(state.progress, "complete");
  assert.equal(state.canNavigate, true);
});

test("keeps empty future steps locked when they have no saved data", () => {
  const state = getWizardStepState(baseResume(), 5, 0, 0);

  assert.equal(state.progress, "empty");
  assert.equal(state.canNavigate, false);
});
