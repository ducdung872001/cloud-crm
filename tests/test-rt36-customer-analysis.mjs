#!/usr/bin/env node
/**
 * RT.36 — Phan tich KH
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/test-rt36-customer-analysis.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.36", "Phan tich KH");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // -- RT36-001: overview --
    t.log("\u25B6", "RT36-001: overview");
    {
      await t.goto(ROUTES.CUSTOMER_ANALYSIS);
      await t.screenshot("rt36-001");
      // TODO: Implement — overview
      const ok = await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']");
      t.assert("RT36-001", ok, "overview");
    }

    // -- RT36-002: top revenue --
    t.log("\u25B6", "RT36-002: top revenue");
    {
      // TODO: Implement — top revenue
      const ok = true /* TODO: implement */;
      t.assert("RT36-002", ok, "top revenue");
    }

    // -- RT36-003: top frequency --
    t.log("\u25B6", "RT36-003: top frequency");
    {
      // TODO: Implement — top frequency
      const ok = true /* TODO: implement */;
      t.assert("RT36-003", ok, "top frequency");
    }

    // -- RT36-004: churn risk --
    t.log("\u25B6", "RT36-004: churn risk");
    {
      // TODO: Implement — churn risk
      const ok = true /* TODO: implement */;
      t.assert("RT36-004", ok, "churn risk");
    }

    // -- RT36-005: CLV --
    t.log("\u25B6", "RT36-005: CLV");
    {
      // TODO: Implement — CLV
      const ok = true /* TODO: implement */;
      t.assert("RT36-005", ok, "CLV");
    }

    // -- RT36-006: distribution --
    t.log("\u25B6", "RT36-006: distribution");
    {
      // TODO: Implement — distribution
      const ok = true /* TODO: implement */;
      t.assert("RT36-006", ok, "distribution");
    }

    // -- RT36-007: export --
    t.log("\u25B6", "RT36-007: export");
    {
      // TODO: Implement — export
      const ok = true /* TODO: implement */;
      t.assert("RT36-007", ok, "export");
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
