import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = {
  landing: readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
  wizard: readFileSync(new URL("../app/wizard/page.tsx", import.meta.url), "utf8"),
  checkout: readFileSync(new URL("../app/checkout/page.tsx", import.meta.url), "utf8"),
  paymentRoute: readFileSync(new URL("../app/api/create-payment/route.ts", import.meta.url), "utf8"),
  tagInput: readFileSync(new URL("../components/TagInput.tsx", import.meta.url), "utf8"),
  pdf: readFileSync(new URL("../lib/generatePDF.ts", import.meta.url), "utf8"),
};

test("public pricing surfaces use R$ 0,01", () => {
  assert.match(files.landing, /R\$ ?0,01|formatPriceBRL\(\)/);
  assert.match(files.wizard, /R\$ ?0,01|formatPriceBRL\(\)/);
  assert.match(files.checkout, /R\$ ?0,01|formatPriceBRL\(\)/);
});

test("old pricing copy is gone from public flows", () => {
  assert.doesNotMatch(files.landing, /1,90|1\.90|4,90|4\.90/);
  assert.doesNotMatch(files.wizard, /1,90|1\.90|4,90|4\.90/);
  assert.doesNotMatch(files.checkout, /1,90|1\.90|4,90|4\.90/);
});

test("mercado pago amount is 0.01", () => {
  assert.match(files.paymentRoute, /transaction_amount:\s*(0\.01|PIX_PRICE_AMOUNT)\b/);
});

test("wizard copy keeps portuguese accents in user-facing labels", () => {
  assert.match(files.wizard, /Experiência Profissional/);
  assert.match(files.wizard, /Formação Acadêmica/);
  assert.match(files.wizard, /Habilidades Técnicas/);
  assert.match(files.wizard, /Prévia/);
  assert.match(files.wizard, /currículo/);
  assert.match(files.wizard, /Não tenho experiência profissional ainda/);
});

test("wizard editor uses a minimal shell instead of card wrapper", () => {
  assert.doesNotMatch(files.wizard, /StepCard/);
  assert.match(files.wizard, /Etapas/);
  assert.match(files.wizard, /aria-labelledby="step-heading"/);
});

test("pdf headings keep portuguese accents", () => {
  assert.match(files.pdf, /EXPERIÊNCIA PROFISSIONAL|EXPERI\\u00caNCIA PROFISSIONAL/);
  assert.match(files.pdf, /FORMAÇÃO ACADÊMICA|FORMA\\u00c7\\u00c3O ACAD\\u00caMICA/);
  assert.match(files.pdf, /CURSOS E CERTIFICAÇÕES|CURSOS E CERTIFICA\\u00c7\\u00d5ES/);
  assert.match(files.pdf, /Técnicas|T\\u00e9cnicas/);
});

test("pdf header contact line uses ATS-friendly labels", () => {
  assert.match(files.pdf, /Email:/);
  assert.match(files.pdf, /Telefone:/);
  assert.match(files.pdf, /Localiza/);
});

test("tag input pills and suggestions can wrap long content", () => {
  assert.match(files.tagInput, /min-w-0/);
  assert.match(files.tagInput, /break-words/);
});
