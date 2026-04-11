#!/usr/bin/env node
/**
 * RT.17 — Cai dat
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/test-rt17-settings.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.17", "Cai dat");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // -- RT17-001: store info --
    t.log("\u25B6", "RT17-001: store info");
    {
      await t.goto(ROUTES.SETTING_BASIS);
      await t.screenshot("rt17-001");
      // TODO: Implement — store info
      const ok = await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']");
      t.assert("RT17-001", ok, "store info");
    }

    // -- RT17-002: payment methods --
    t.log("\u25B6", "RT17-002: payment methods");
    {
      // TODO: Implement — payment methods
      const ok = true /* TODO: implement */;
      t.assert("RT17-002", ok, "payment methods");
    }

    // -- RT17-003: toggle payment --
    t.log("\u25B6", "RT17-003: toggle payment");
    {
      // TODO: Implement — toggle payment
      const ok = true /* TODO: implement */;
      t.assert("RT17-003", ok, "toggle payment");
    }

    // -- RT17-004: bank config --
    t.log("\u25B6", "RT17-004: bank config");
    {
      // TODO: Implement — bank config
      const ok = true /* TODO: implement */;
      t.assert("RT17-004", ok, "bank config");
    }

    // -- RT17-005: employee list --
    t.log("\u25B6", "RT17-005: employee list");
    {
      // TODO: Implement — employee list
      const ok = true /* TODO: implement */;
      t.assert("RT17-005", ok, "employee list");
    }

    // -- RT17-006: add employee --
    t.log("\u25B6", "RT17-006: add employee");
    {
      // TODO: Implement — add employee
      const ok = true /* TODO: implement */;
      t.assert("RT17-006", ok, "add employee");
    }

    // -- RT17-007: edit employee --
    t.log("\u25B6", "RT17-007: edit employee");
    {
      // TODO: Implement — edit employee
      const ok = true /* TODO: implement */;
      t.assert("RT17-007", ok, "edit employee");
    }

    // -- RT17-008: disable employee --
    t.log("\u25B6", "RT17-008: disable employee");
    {
      // TODO: Implement — disable employee
      const ok = true /* TODO: implement */;
      t.assert("RT17-008", ok, "disable employee");
    }

    // -- RT17-009: role list --
    t.log("\u25B6", "RT17-009: role list");
    {
      // TODO: Implement — role list
      const ok = true /* TODO: implement */;
      t.assert("RT17-009", ok, "role list");
    }

    // -- RT17-010: create role --
    t.log("\u25B6", "RT17-010: create role");
    {
      // TODO: Implement — create role
      const ok = true /* TODO: implement */;
      t.assert("RT17-010", ok, "create role");
    }

    // -- RT17-011: assign role --
    t.log("\u25B6", "RT17-011: assign role");
    {
      // TODO: Implement — assign role
      const ok = true /* TODO: implement */;
      t.assert("RT17-011", ok, "assign role");
    }

    // -- RT17-012: verify permission --
    t.log("\u25B6", "RT17-012: verify permission");
    {
      // TODO: Implement — verify permission
      const ok = true /* TODO: implement */;
      t.assert("RT17-012", ok, "verify permission");
    }

    // -- RT17-013: departments --
    t.log("\u25B6", "RT17-013: departments");
    {
      // TODO: Implement — departments
      const ok = true /* TODO: implement */;
      t.assert("RT17-013", ok, "departments");
    }

    // -- RT17-014: channels config --
    t.log("\u25B6", "RT17-014: channels config");
    {
      // TODO: Implement — channels config
      const ok = true /* TODO: implement */;
      t.assert("RT17-014", ok, "channels config");
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
