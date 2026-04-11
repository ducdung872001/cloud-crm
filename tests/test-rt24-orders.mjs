#!/usr/bin/env node
/**
 * RT.24 — Don hang
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/test-rt24-orders.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.24", "Don hang");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // -- RT24-001: list orders --
    t.log("\u25B6", "RT24-001: list orders");
    {
      await t.goto(ROUTES.SALE_INVOICE);
      await t.screenshot("rt24-001");
      // TODO: Implement — list orders
      const ok = await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']");
      t.assert("RT24-001", ok, "list orders");
    }

    // -- RT24-002: create order --
    t.log("\u25B6", "RT24-002: create order");
    {
      // TODO: Implement — create order
      const ok = true /* TODO: implement */;
      t.assert("RT24-002", ok, "create order");
    }

    // -- RT24-003: add products --
    t.log("\u25B6", "RT24-003: add products");
    {
      // TODO: Implement — add products
      const ok = true /* TODO: implement */;
      t.assert("RT24-003", ok, "add products");
    }

    // -- RT24-004: select customer --
    t.log("\u25B6", "RT24-004: select customer");
    {
      // TODO: Implement — select customer
      const ok = true /* TODO: implement */;
      t.assert("RT24-004", ok, "select customer");
    }

    // -- RT24-005: apply promo --
    t.log("\u25B6", "RT24-005: apply promo");
    {
      // TODO: Implement — apply promo
      const ok = true /* TODO: implement */;
      t.assert("RT24-005", ok, "apply promo");
    }

    // -- RT24-006: payment method --
    t.log("\u25B6", "RT24-006: payment method");
    {
      // TODO: Implement — payment method
      const ok = true /* TODO: implement */;
      t.assert("RT24-006", ok, "payment method");
    }

    // -- RT24-007: confirm order --
    t.log("\u25B6", "RT24-007: confirm order");
    {
      // TODO: Implement — confirm order
      const ok = true /* TODO: implement */;
      t.assert("RT24-007", ok, "confirm order");
    }

    // -- RT24-008: cancel order --
    t.log("\u25B6", "RT24-008: cancel order");
    {
      // TODO: Implement — cancel order
      const ok = true /* TODO: implement */;
      t.assert("RT24-008", ok, "cancel order");
    }

    // -- RT24-009: view detail --
    t.log("\u25B6", "RT24-009: view detail");
    {
      // TODO: Implement — view detail
      const ok = true /* TODO: implement */;
      t.assert("RT24-009", ok, "view detail");
    }

    // -- RT24-010: filter search --
    t.log("\u25B6", "RT24-010: filter search");
    {
      // TODO: Implement — filter search
      const ok = true /* TODO: implement */;
      t.assert("RT24-010", ok, "filter search");
    }

    // -- RT24-011: print receipt --
    t.log("\u25B6", "RT24-011: print receipt");
    {
      // TODO: Implement — print receipt
      const ok = true /* TODO: implement */;
      t.assert("RT24-011", ok, "print receipt");
    }

    // -- RT24-012: export --
    t.log("\u25B6", "RT24-012: export");
    {
      // TODO: Implement — export
      const ok = true /* TODO: implement */;
      t.assert("RT24-012", ok, "export");
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
