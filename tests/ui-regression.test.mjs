import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = {
  landing: readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
  wizard: readFileSync(new URL("../app/wizard/page.tsx", import.meta.url), "utf8"),
  checkout: readFileSync(new URL("../app/checkout/page.tsx", import.meta.url), "utf8"),
  paymentRoute: readFileSync(new URL("../app/api/create-payment/route.ts", import.meta.url), "utf8"),
};

test("public pricing surfaces use R$ 1,90", () => {
  assert.match(files.landing, /R\$ ?1,90|formatPriceBRL\(\)/);
  assert.match(files.wizard, /R\$ ?1,90|formatPriceBRL\(\)/);
  assert.match(files.checkout, /R\$ ?1,90|formatPriceBRL\(\)/);
});

test("old pricing copy is gone from public flows", () => {
  assert.doesNotMatch(files.landing, /4,90|4\.90/);
  assert.doesNotMatch(files.wizard, /4,90|4\.90/);
  assert.doesNotMatch(files.checkout, /4,90|4\.90/);
});

test("mercado pago amount is 1.9", () => {
  assert.match(files.paymentRoute, /transaction_amount:\s*(1\.9|PIX_PRICE_AMOUNT)\b/);
});
