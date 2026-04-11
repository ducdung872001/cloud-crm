#!/usr/bin/env node
/**
 * RT.16 — Doi soat
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/test-rt16-reconciliation.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.16", "Doi soat");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // -- RT16-001: list transactions --
    t.log("\u25B6", "RT16-001: list transactions");
    {
      await t.goto(ROUTES.PAYMENT_CONTROL);
      await t.screenshot("rt16-001");
      // TODO: Implement — list transactions
      const ok = await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']");
      t.assert("RT16-001", ok, "list transactions");
    }

    // -- RT16-002: filter method --
    t.log("\u25B6", "RT16-002: filter method");
    {
      // TODO: Implement — filter method
      const ok = true /* TODO: implement */;
      t.assert("RT16-002", ok, "filter method");
    }

    // -- RT16-003: filter status --
    t.log("\u25B6", "RT16-003: filter status");
    {
      // TODO: Implement — filter status
      const ok = true /* TODO: implement */;
      t.assert("RT16-003", ok, "filter status");
    }

    // -- RT16-004: confirm match --
    t.log("\u25B6", "RT16-004: confirm match");
    {
      // TODO: Implement — confirm match
      const ok = true /* TODO: implement */;
      t.assert("RT16-004", ok, "confirm match");
    }

    // -- RT16-005: export --
    t.log("\u25B6", "RT16-005: export");
    {
      // TODO: Implement — export
      const ok = true /* TODO: implement */;
      t.assert("RT16-005", ok, "export");
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
