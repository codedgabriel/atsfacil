import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const modelosPageUrl = new URL("../app/modelos/page.tsx", import.meta.url);

const files = {
  landing: readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
  wizard: readFileSync(new URL("../app/wizard/page.tsx", import.meta.url), "utf8"),
  checkout: readFileSync(new URL("../app/checkout/page.tsx", import.meta.url), "utf8"),
  download: readFileSync(new URL("../app/download/page.tsx", import.meta.url), "utf8"),
  modelos: existsSync(modelosPageUrl) ? readFileSync(modelosPageUrl, "utf8") : "",
  photoModal: readFileSync(new URL("../components/PhotoUploadModal.tsx", import.meta.url), "utf8"),
  paymentRoute: readFileSync(new URL("../app/api/create-payment/route.ts", import.meta.url), "utf8"),
  helpTip: readFileSync(new URL("../components/HelpTip.tsx", import.meta.url), "utf8"),
  printTemplates: readFileSync(new URL("../lib/printTemplates.ts", import.meta.url), "utf8"),
  printTestBypass: readFileSync(new URL("../lib/printTestBypass.ts", import.meta.url), "utf8"),
  tagInput: readFileSync(new URL("../components/TagInput.tsx", import.meta.url), "utf8"),
  pdf: readFileSync(new URL("../lib/generatePDF.ts", import.meta.url), "utf8"),
  resume: readFileSync(new URL("../lib/resume.ts", import.meta.url), "utf8"),
};

function assertMatchesAny(content, patterns) {
  assert.ok(
    patterns.some((pattern) => pattern.test(content)),
    `Expected content to match one of: ${patterns.map((pattern) => pattern.toString()).join(", ")}`,
  );
}

test("public pricing surfaces describe the product as free", () => {
  assert.match(files.landing, /grátis|grÃ¡tis|gratuito/);
  assert.match(files.wizard, /grátis|grÃ¡tis|gratuito/);
  assert.match(files.checkout, /grátis|grÃ¡tis|gratuito/);
});

test("old pricing copy is gone from public flows", () => {
  assert.doesNotMatch(files.landing, /1,90|1\.90|4,90|4\.90/);
  assert.doesNotMatch(files.wizard, /1,90|1\.90|4,90|4\.90/);
  assert.doesNotMatch(files.checkout, /1,90|1\.90|4,90|4\.90/);
});

test("mercado pago route still references configurable pricing", () => {
  assert.match(files.paymentRoute, /transaction_amount:\s*(0\.01|0|PIX_PRICE_AMOUNT)\b/);
});

test("wizard copy keeps portuguese accents in user-facing labels", () => {
  assertMatchesAny(files.wizard, [/Experiência Profissional/, /ExperiÃªncia Profissional/]);
  assertMatchesAny(files.wizard, [/Formação Acadêmica/, /FormaÃ§Ã£o AcadÃªmica/]);
  assertMatchesAny(files.wizard, [/Habilidades Técnicas/, /Habilidades TÃ©cnicas/]);
  assertMatchesAny(files.wizard, [/Prévia/, /PrÃ©via/]);
  assertMatchesAny(files.wizard, [/currículo/, /currÃ­culo/]);
  assertMatchesAny(files.wizard, [/Não tenho experiência profissional ainda/, /NÃ£o tenho experiÃªncia profissional ainda/]);
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
  assertMatchesAny(files.wizard, [/aria-label="Pontuação ATS"/, /aria-label="PontuaÃ§Ã£o ATS"/]);
  assertMatchesAny(files.wizard, [/Próxima melhoria/, /PrÃ³xima melhoria/]);
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
  assertMatchesAny(files.landing, [/Monte um currículo profissional sem brigar com layout/, /Monte um currÃ­culo profissional sem brigar com layout/]);
  assert.doesNotMatch(files.landing, /rounded-3xl|rounded-\[28px\]|shadow-soft/);
});

test("pdf headings keep portuguese accents", () => {
  assert.match(files.pdf, /EXPERIÊNCIA PROFISSIONAL|EXPERIÃŠNCIA PROFISSIONAL|EXPERI\\u00caNCIA PROFISSIONAL/);
  assert.match(files.pdf, /FORMAÇÃO ACADÊMICA|FORMAÃ‡ÃƒO ACADÃŠMICA|FORMA\\u00c7\\u00c3O ACAD\\u00caMICA/);
  assert.match(files.pdf, /CURSOS E CERTIFICAÇÕES|CURSOS E CERTIFICAÃ‡Ã•ES|CURSOS E CERTIFICA\\u00c7\\u00d5ES/);
  assert.match(files.pdf, /Técnicas|TÃ©cnicas|T\\u00e9cnicas/);
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

test("behavioral skill suggestions keep portuguese accents", () => {
  assert.match(files.resume, /Comunica\u00e7\u00e3o/);
  assert.match(files.resume, /Lideran\u00e7a/);
  assert.match(files.resume, /Resolu\u00e7\u00e3o de problemas/);
  assert.match(files.resume, /Vis\u00e3o estrat\u00e9gica/);
  assert.match(files.resume, /normalizeSoftSkillLabel/);
  assert.match(files.pdf, /normalizeSoftSkillLabel/);
});

test("language levels keep portuguese accents and normalize old saved values", () => {
  assertMatchesAny(files.resume, [/Básico/, /BÃ¡sico/]);
  assertMatchesAny(files.resume, [/Intermediário/, /IntermediÃ¡rio/]);
  assertMatchesAny(files.resume, [/Avançado/, /AvanÃ§ado/]);
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

test("wizard persists experience edits before refresh can drop them", () => {
  assert.match(files.wizard, /function commitFormData/);
  assert.match(files.wizard, /persistFormData\(next\)/);
  assert.match(files.wizard, /function setExperienceOptOut/);
  assert.match(files.wizard, /experiencias: checked \? \[\] : current\.experiencias\.length === 0 \? \[emptyExperience\(\)\] : current\.experiencias/);
  assert.doesNotMatch(files.wizard, /if \(e\.target\.checked\) update\("experiencias", \[\]\)/);
});

test("checkout now works as a lightweight free-release handoff", () => {
  assert.match(files.checkout, /h-\[100svh\]/);
  assert.match(files.checkout, /Liberando impress/);
  assert.match(files.checkout, /download\?mode=print/);
  assert.doesNotMatch(files.checkout, /qr_code|Como pagar:|Copiar c[oó]digo Pix|Aguardando pagamento/);
});

test("download screen uses a compact final-state layout", () => {
  assert.match(files.download, /h-\[100svh\]/);
  assert.match(files.download, /Impressão liberada|ImpressÃ£o liberada|ATS liberado/);
  assertMatchesAny(files.download, [/Seu currículo está pronto/, /Seu currÃ­culo estÃ¡ pronto/, /Seu currículo ATS está pronto/, /Seu currÃ­culo ATS estÃ¡ pronto/]);
  assert.match(files.download, /Gerado localmente no navegador/);
  assert.match(files.download, /atscurriculosaas@gmail\.com/);
  assert.doesNotMatch(files.download, /fale@atsfacil\.com\.br/);
  assert.doesNotMatch(files.download, /shadow-soft|rounded-\[32px\]|rounded-3xl/);
  assert.doesNotMatch(files.download, /Camada extra de segurança|Camada extra de seguranÃ§a|ShieldCheck/);
});
test("review sends users to a resume model gallery before checkout", () => {
  assert.match(files.wizard, /router\.push\("\/modelos"\)/);
  assert.match(files.modelos, /Modelo ATS/);
  assertMatchesAny(files.modelos, [/Currículos para impressão/, /CurrÃ­culos para impressÃ£o/]);
  assertMatchesAny(files.modelos, [/Espaço para foto/, /EspaÃ§o para foto/]);
  assert.match(files.modelos, /printResumeTemplates/);
  assert.match(files.modelos, /localStorage\.setItem\(TEMPLATE_STORAGE_KEY/);
  assert.match(files.modelos, /router\.push\("\/download\?mode=print"\)/);
  assert.match(files.download, /localStorage\.getItem\(TEMPLATE_STORAGE_KEY\)/);
  assert.match(files.download, /generatePDF\(formData, \{ templateId, photoDataUrl \}\)/);
});
test("ats stays free while print templates are optional paid add-ons", () => {
  assert.match(files.landing, /ATS grátis|ATS grÃ¡tis|gratuito|grátis|grÃ¡tis/);
  assertMatchesAny(files.modelos, [/Baixar ATS grátis/, /Baixar ATS grÃ¡tis/]);
  assertMatchesAny(files.modelos, [/Liberar impressão grátis/, /Liberar impressÃ£o grÃ¡tis/, /Liberar impressÃƒÂ£o grÃƒÂ¡tis/]);
  assert.match(files.modelos, /useState<string \| null>\(null\)/);
  assert.match(files.photoModal, /Adicionar foto/);
  assert.match(files.photoModal, /type="file"/);
  assert.match(files.photoModal, /Salvar foto e continuar/);
  assert.match(files.modelos, /localStorage\.setItem\(PHOTO_STORAGE_KEY/);
  assert.match(files.checkout, /download\?mode=print/);
  assert.match(files.download, /const mode = searchParams.get\("mode"\)/);
  assert.match(files.download, /localStorage\.getItem\(PHOTO_STORAGE_KEY\)/);
  assert.match(files.download, /mode === "ats"/);
  assert.match(files.download, /mode === "print"/);
  assert.match(files.download, /Baixar ATS/);
  assertMatchesAny(files.download, [/Baixar impressão/, /Baixar impressÃ£o/]);
});
test("local print bypass helper stays isolated for future debug use", () => {
  assert.match(files.printTestBypass, /PRINT_TEST_MODE = "print-test"/);
  assert.match(files.printTestBypass, /hostname === "localhost"/);
  assert.match(files.printTestBypass, /hostname === "127\.0\.0\.1"/);
});
test("model gallery fits the viewport with ats included on the left", () => {
  assert.match(files.modelos, /h-\[100svh\]/);
  assert.match(files.modelos, /overflow-hidden/);
  assert.match(files.modelos, /lg:grid-cols-\[320px_minmax\(0,1fr\)\]/);
  assert.match(files.modelos, /ATS incluso/);
  assertMatchesAny(files.modelos, [/Escolha a impressão\./, /Escolha a impressÃ£o\./]);
  assert.match(files.modelos, /text-2xl font-bold/);
  assert.match(files.modelos, /max-w-\[140px\]/);
  assert.match(files.modelos, /py-2/);
  assert.match(files.modelos, /<aside className="flex min-h-0 flex-col overflow-y-auto \[scrollbar-width:none\] \[-ms-overflow-style:none\] \[\&::-webkit-scrollbar\]:hidden/);
  assert.match(files.modelos, /<aside[\s\S]*ATS incluso[\s\S]*<AtsPreview/);
  assert.doesNotMatch(files.modelos, /Sempre incluso/);
  assertMatchesAny(files.modelos, [/Currículos para impressão/, /CurrÃ­culos para impressÃ£o/]);
  assert.match(files.modelos, /selectedTemplateForCheckout/);
  assert.match(files.printTemplates, /previewVariant: "consulting"/);
  assert.match(files.printTemplates, /headerPattern: "developer"/);
  assert.match(files.printTemplates, /sectionPattern: "numbered"/);
  assert.match(files.download, /generatePDF\(formData, \{ templateId: "ats-clean" \}\)/);
  assert.match(files.download, /generatePDF\(formData, \{ templateId, photoDataUrl \}\)/);
  assert.doesNotMatch(files.download, /Baixar ATS \+ impressão|Baixar ATS \+ impressÃ£o/);
});



