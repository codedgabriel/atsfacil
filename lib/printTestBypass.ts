export const PRINT_TEST_MODE = "print-test";

export function canUsePrintTestBypass(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}
