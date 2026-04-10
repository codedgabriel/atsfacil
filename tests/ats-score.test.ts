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
    resumo_profissional: "Desenvolvedor Front-end com experiencia em React, Next.js e TypeScript. Otimizou interfaces responsivas, reduziu retrabalho em 25% e entregou melhorias de performance, acessibilidade e valor para produto.",
    experiencias: [
      {
        id: "exp-1",
        empresa: "Produto Co",
        cargo: "Desenvolvedor Front-end",
        data_inicio: "01/2023",
        data_fim: "Atual",
        descricao: "Liderei o desenvolvimento de interfaces responsivas, otimizei a performance e reduzi bugs em 30% com colaboracao entre produto, design e engenharia.",
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
    habilidades_tecnicas: ["React", "Next.js", "TypeScript", "HTML", "CSS"],
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
  assert.equal(result.nextImprovement.label, "Contato e alvo");
  assert.match(result.nextImprovement.action, /nome/i);
});

test("complete resume reaches a high ATS score", () => {
  const result = calculateAtsScore(completeResume());

  assert.equal(result.score, 100);
  assert.equal(result.level, "Excelente");
  assert.ok(result.checks.every((check) => check.complete));
  assert.equal(result.nextImprovement.label, "Currículo completo");
});

test("partial resume gives specific next improvement", () => {
  const data = {
    ...defaultResumeData(),
    nome_completo: "Davi Gabriel",
    email: "davi@example.com",
    cargo_desejado: "Designer UI",
    resumo_profissional: "Designer UI com foco em interfaces digitais.",
  };

  const result = calculateAtsScore(data);

  assert.ok(result.score > 0);
  assert.ok(result.score < 60);
  assert.equal(result.level, "Inicial");
  assert.equal(result.nextImprovement.label, "Experiência");
  assert.match(result.nextImprovement.action, /experiência|projeto/i);
});
