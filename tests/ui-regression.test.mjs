import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = {
  landing: readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
  wizard: readFileSync(new URL("../app/wizard/page.tsx", import.meta.url), "utf8"),
  checkout: readFileSync(new URL("../app/checkout/page.tsx", import.meta.url), "utf8"),
  paymentRoute: readFileSync(new URL("../app/api/create-payment/route.ts", import.meta.url), "utf8"),
  helpTip: readFileSync(new URL("../components/HelpTip.tsx", import.meta.url), "utf8"),
  tagInput: readFileSync(new URL("../components/TagInput.tsx", import.meta.url), "utf8"),
  pdf: readFileSync(new URL("../lib/generatePDF.ts", import.meta.url), "utf8"),
  resume: readFileSync(new URL("../lib/resume.ts", import.meta.url), "utf8"),
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

test("wizard editor fits inside the viewport shell", () => {
  assert.match(files.wizard, /h-\[100svh\]/);
  assert.match(files.wizard, /overflow-hidden/);
  assert.match(files.wizard, /min-h-0 flex-1 overflow-y-auto/);
  assert.match(files.wizard, /shrink-0 border-t/);
  assert.match(files.wizard, /MobileStepNav/);
  assert.match(files.wizard, /lg:hidden/);
  assert.match(files.wizard, /Resumo ATS/);
});

test("wizard removes the duplicated top progress header", () => {
  assert.doesNotMatch(files.wizard, /ProgressBar/);
  assert.doesNotMatch(files.wizard, /<header className=/);
  assert.match(files.wizard, /<main id="main-content" className="h-\[100svh\] overflow-hidden bg-white">/);
});

test("wizard step rail has quick navigation and styled scrollbars", () => {
  assert.match(files.wizard, /scrollAreaClass/);
  assert.match(files.wizard, /goToStep/);
  assert.match(files.wizard, /getWizardStepState/);
  assert.match(files.wizard, /Em preenchimento/);
  assert.match(files.wizard, /aria-label=\{`Ir para/);
  assert.match(files.wizard, /scrollbar-width:none/);
  assert.match(files.wizard, /::-webkit-scrollbar\]:hidden/);
  assert.match(files.wizard, /overflow-y-auto/);
});

test("wizard uses three columns with an ATS score panel", () => {
  assert.match(files.wizard, /calculateAtsScore/);
  assert.match(files.wizard, /Score ATS/);
  assert.match(files.wizard, /aria-label="Pontuação ATS"/);
  assert.match(files.wizard, /Próxima melhoria/);
  assert.match(files.wizard, /atsScore\.nextImprovement/);
  assert.match(files.wizard, /lg:grid-cols-\[190px_minmax\(0,1fr\)_280px\]/);
});

test("wizard groups professional links in one compact section", () => {
  assert.match(files.wizard, /Links profissionais/);
  assert.match(files.wizard, /Adicione LinkedIn, portf/);
  assert.doesNotMatch(files.wizard, /Outros links/);
});

test("wizard adds ATS help tips to high-impact fields", () => {
  assert.match(files.wizard, /helpTip=/);
  assert.match(files.wizard, /Use 2 ou 3 frases/);
  assert.match(files.wizard, /verbos de a/);
  assert.match(files.wizard, /5 habilidades t/);
  assert.match(files.wizard, /cargo desejado/);
});

test("help tips are not clipped or stuck after click", () => {
  assert.match(files.helpTip, /position:\s*"fixed"/);
  assert.match(files.helpTip, /getBoundingClientRect/);
  assert.match(files.helpTip, /onMouseEnter/);
  assert.match(files.helpTip, /onMouseLeave/);
  assert.match(files.helpTip, /onBlur/);
  assert.match(files.helpTip, /onClick/);
  assert.match(files.helpTip, /\.blur\(\)/);
  assert.doesNotMatch(files.helpTip, /group-focus-within:block|absolute right-0/);
});

test("landing page uses the editorial minimal direction", () => {
  assert.match(files.landing, /Editor Minimalista/);
  assert.match(files.landing, /Monte um currículo profissional sem brigar com layout/);
  assert.doesNotMatch(files.landing, /rounded-3xl|rounded-\[28px\]|shadow-soft/);
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

test("language levels keep portuguese accents and normalize old saved values", () => {
  assert.match(files.resume, /Básico/);
  assert.match(files.resume, /Intermediário/);
  assert.match(files.resume, /Avançado/);
  assert.match(files.resume, /normalizeLanguageLevel/);
  assert.match(files.wizard, /normalizeResumeData/);
});


test("education levels keep portuguese accents and formation date copy is clear", () => {
  assert.match(files.resume, /T\u00e9cnico/);
  assert.match(files.resume, /Gradua\u00e7\u00e3o/);
  assert.match(files.resume, /P\u00f3s-gradua\u00e7\u00e3o/);
  assert.match(files.resume, /normalizeEducationLevel/);
  assert.match(files.wizard, /Conclus\u00e3o prevista ou conclu\u00edda/);
  assert.match(files.wizard, /Status: Em andamento/);
});
