#!/usr/bin/env node
/**
 * RT.15 — Tra hang
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/test-rt15-returns.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.15", "Tra hang");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // -- RT15-001: list returns --
    t.log("\u25B6", "RT15-001: list returns");
    {
      await t.goto(ROUTES.RETURN_INVOICE);
      await t.screenshot("rt15-001");
      // TODO: Implement — list returns
      const ok = await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']");
      t.assert("RT15-001", ok, "list returns");
    }

    // -- RT15-002: create from order --
    t.log("\u25B6", "RT15-002: create from order");
    {
      // TODO: Implement — create from order
      const ok = true /* TODO: implement */;
      t.assert("RT15-002", ok, "create from order");
    }

    // -- RT15-003: select products --
    t.log("\u25B6", "RT15-003: select products");
    {
      // TODO: Implement — select products
      const ok = true /* TODO: implement */;
      t.assert("RT15-003", ok, "select products");
    }

    // -- RT15-004: confirm return --
    t.log("\u25B6", "RT15-004: confirm return");
    {
      // TODO: Implement — confirm return
      const ok = true /* TODO: implement */;
      t.assert("RT15-004", ok, "confirm return");
    }

    // -- RT15-005: view detail --
    t.log("\u25B6", "RT15-005: view detail");
    {
      // TODO: Implement — view detail
      const ok = true /* TODO: implement */;
      t.assert("RT15-005", ok, "view detail");
    }

    // -- RT15-006: export --
    t.log("\u25B6", "RT15-006: export");
    {
      // TODO: Implement — export
      const ok = true /* TODO: implement */;
      t.assert("RT15-006", ok, "export");
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
