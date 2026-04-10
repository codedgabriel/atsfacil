import test from "node:test";
import assert from "node:assert/strict";
import { PRINT_TEST_MODE, canUsePrintTestBypass } from "../lib/printTestBypass";

test("print test mode uses a dedicated mode flag", () => {
  assert.equal(PRINT_TEST_MODE, "print-test");
});

test("print test bypass is allowed only for local development hosts", () => {
  assert.equal(canUsePrintTestBypass("localhost"), true);
  assert.equal(canUsePrintTestBypass("127.0.0.1"), true);
  assert.equal(canUsePrintTestBypass("0.0.0.0"), true);
  assert.equal(canUsePrintTestBypass("atsfacil.vercel.app"), false);
  assert.equal(canUsePrintTestBypass("preview-atsfacil.vercel.app"), false);
});
