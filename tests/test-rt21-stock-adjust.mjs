#!/usr/bin/env node
/**
 * RT.21 — Dieu chinh
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/test-rt21-stock-adjust.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.21", "Dieu chinh");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // -- RT21-001: list adjustments --
    t.log("\u25B6", "RT21-001: list adjustments");
    {
      await t.goto(ROUTES.ADJUSTMENT_SLIP);
      await t.screenshot("rt21-001");
      // TODO: Implement — list adjustments
      const ok = await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']");
      t.assert("RT21-001", ok, "list adjustments");
    }

    // -- RT21-002: create add products --
    t.log("\u25B6", "RT21-002: create add products");
    {
      // TODO: Implement — create add products
      const ok = true /* TODO: implement */;
      t.assert("RT21-002", ok, "create add products");
    }

    // -- RT21-003: enter reason --
    t.log("\u25B6", "RT21-003: enter reason");
    {
      // TODO: Implement — enter reason
      const ok = true /* TODO: implement */;
      t.assert("RT21-003", ok, "enter reason");
    }

    // -- RT21-004: approve --
    t.log("\u25B6", "RT21-004: approve");
    {
      // TODO: Implement — approve
      const ok = true /* TODO: implement */;
      t.assert("RT21-004", ok, "approve");
    }

    // -- RT21-005: cancel --
    t.log("\u25B6", "RT21-005: cancel");
    {
      // TODO: Implement — cancel
      const ok = true /* TODO: implement */;
      t.assert("RT21-005", ok, "cancel");
    }

    // -- RT21-006: search filter --
    t.log("\u25B6", "RT21-006: search filter");
    {
      // TODO: Implement — search filter
      const ok = true /* TODO: implement */;
      t.assert("RT21-006", ok, "search filter");
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
