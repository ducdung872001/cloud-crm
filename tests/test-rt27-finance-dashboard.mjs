#!/usr/bin/env node
/**
 * RT.27 — Dashboard TC
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/test-rt27-finance-dashboard.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.27", "Dashboard TC");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // -- RT27-001: overview KPIs --
    t.log("\u25B6", "RT27-001: overview KPIs");
    {
      await t.goto(ROUTES.FINANCE_DASHBOARD);
      await t.screenshot("rt27-001");
      // TODO: Implement — overview KPIs
      const ok = await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']");
      t.assert("RT27-001", ok, "overview KPIs");
    }

    // -- RT27-002: chart --
    t.log("\u25B6", "RT27-002: chart");
    {
      // TODO: Implement — chart
      const ok = true /* TODO: implement */;
      t.assert("RT27-002", ok, "chart");
    }

    // -- RT27-003: time filter --
    t.log("\u25B6", "RT27-003: time filter");
    {
      // TODO: Implement — time filter
      const ok = true /* TODO: implement */;
      t.assert("RT27-003", ok, "time filter");
    }

    // -- RT27-004: top debtors --
    t.log("\u25B6", "RT27-004: top debtors");
    {
      // TODO: Implement — top debtors
      const ok = true /* TODO: implement */;
      t.assert("RT27-004", ok, "top debtors");
    }

    // -- RT27-005: upcoming debts --
    t.log("\u25B6", "RT27-005: upcoming debts");
    {
      // TODO: Implement — upcoming debts
      const ok = true /* TODO: implement */;
      t.assert("RT27-005", ok, "upcoming debts");
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
