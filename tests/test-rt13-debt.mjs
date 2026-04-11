#!/usr/bin/env node
/**
 * RT.13 — Cong no
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/test-rt13-debt.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.13", "Cong no");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // -- RT13-001: list debts --
    t.log("\u25B6", "RT13-001: list debts");
    {
      await t.goto(ROUTES.DEBT_MANAGEMENT);
      await t.screenshot("rt13-001");
      // TODO: Implement — list debts
      const ok = await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']");
      t.assert("RT13-001", ok, "list debts");
    }

    // -- RT13-002: filter receivable --
    t.log("\u25B6", "RT13-002: filter receivable");
    {
      // TODO: Implement — filter receivable
      const ok = true /* TODO: implement */;
      t.assert("RT13-002", ok, "filter receivable");
    }

    // -- RT13-003: filter payable --
    t.log("\u25B6", "RT13-003: filter payable");
    {
      // TODO: Implement — filter payable
      const ok = true /* TODO: implement */;
      t.assert("RT13-003", ok, "filter payable");
    }

    // -- RT13-004: filter overdue --
    t.log("\u25B6", "RT13-004: filter overdue");
    {
      // TODO: Implement — filter overdue
      const ok = true /* TODO: implement */;
      t.assert("RT13-004", ok, "filter overdue");
    }

    // -- RT13-005: create debt --
    t.log("\u25B6", "RT13-005: create debt");
    {
      // TODO: Implement — create debt
      const ok = true /* TODO: implement */;
      t.assert("RT13-005", ok, "create debt");
    }

    // -- RT13-006: record payment --
    t.log("\u25B6", "RT13-006: record payment");
    {
      // TODO: Implement — record payment
      const ok = true /* TODO: implement */;
      t.assert("RT13-006", ok, "record payment");
    }

    // -- RT13-007: partial payment --
    t.log("\u25B6", "RT13-007: partial payment");
    {
      // TODO: Implement — partial payment
      const ok = true /* TODO: implement */;
      t.assert("RT13-007", ok, "partial payment");
    }

    // -- RT13-008: QR code --
    t.log("\u25B6", "RT13-008: QR code");
    {
      // TODO: Implement — QR code
      const ok = true /* TODO: implement */;
      t.assert("RT13-008", ok, "QR code");
    }

    // -- RT13-009: export --
    t.log("\u25B6", "RT13-009: export");
    {
      // TODO: Implement — export
      const ok = true /* TODO: implement */;
      t.assert("RT13-009", ok, "export");
    }

    // -- RT13-010: search --
    t.log("\u25B6", "RT13-010: search");
    {
      // TODO: Implement — search
      const ok = true /* TODO: implement */;
      t.assert("RT13-010", ok, "search");
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
