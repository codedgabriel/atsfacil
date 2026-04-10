import test from "node:test";
import assert from "node:assert/strict";
import { calculateAtsScore } from "../lib/atsScore";
import { defaultResumeData, type ResumeData } from "../lib/resume";

function completeResume(): ResumeData {
  return {
    ...defaultResumeData(),
    nome_completo: "Davi Gabriel",
    email: "davi@example.com",
    telefone: "(11) 99999-9999",
    cidade: "Sao Paulo",
    estado: "SP",
    linkedin: "https://linkedin.com/in/davigabriel",
    cargo_desejado: "Desenvolvedor Front-end",
    resumo_profissional: "Desenvolvedor front-end com experiencia em React, Next.js e interfaces responsivas, focado em performance, acessibilidade e entrega de valor para produto.",
    experiencias: [
      {
        id: "exp-1",
        empresa: "Produto Co",
        cargo: "Desenvolvedor Front-end",
        data_inicio: "01/2023",
        data_fim: "Atual",
        descricao: "Desenvolvimento de interfaces, melhoria de performance e colaboracao com produto.",
      },
    ],
    formacoes: [
      {
        id: "edu-1",
        curso: "Analise e Desenvolvimento de Sistemas",
        instituicao: "Faculdade Exemplo",
        nivel: "Graduacao",
        data_conclusao: "12/2024",
      },
    ],
    habilidades_tecnicas: ["React", "Next.js", "TypeScript"],
    habilidades_comportamentais: ["Comunicacao", "Organizacao"],
    idiomas: [{ id: "lang-1", idioma: "Ingles", nivel: "Avancado" }],
    cursos: [{ id: "course-1", nome_curso: "UX para Devs", instituicao: "Escola", ano: "2024", carga_horaria: "20h" }],
  };
}

test("empty resume starts with a low ATS score", () => {
  const result = calculateAtsScore(defaultResumeData());

  assert.equal(result.score, 0);
  assert.equal(result.level, "Inicial");
  assert.ok(result.checks.every((check) => check.points === 0));
});

test("complete resume reaches a high ATS score", () => {
  const result = calculateAtsScore(completeResume());

  assert.equal(result.score, 100);
  assert.equal(result.level, "Forte");
  assert.ok(result.checks.every((check) => check.complete));
});
