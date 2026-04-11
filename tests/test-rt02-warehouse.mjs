#!/usr/bin/env node
/**
 * RT.02 — Quan ly kho (Warehouse Management)
 * Test THUC TE: CRUD kho, phieu nhap, chuyen kho, kiem ke
 * Chay: node tests/test-rt02-warehouse.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.02", "Quan ly kho");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    console.log("-".repeat(60));

    // ── 1: DS kho ──
    t.log("\u25B6", "RT02-001: DS kho");
    await t.goto("/warehouse");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-001", await t.exists('table, [class*="list"], [class*="card"]'), "Trang kho load OK");
    await t.screenshot("01-warehouse");

    // ── 2: Them kho ──
    t.log("\u25B6", "RT02-002: Them kho");
    const addOk = await t.clickText("Thêm kho", "button");
    await t.page.waitForTimeout(1000);
    t.assert("RT02-002", addOk, addOk ? "Nut Them kho OK" : "Khong co nut");
    await t.screenshot("02-add-kho");
    await t.click('[class*="modal"] button:has-text("Đóng"), [class*="modal"] button:has-text("Hủy"), [class*="modal"] .close');

    // ── 3: Phieu nhap ──
    t.log("\u25B6", "RT02-003: DS phieu nhap");
    await t.goto("/invoice_order");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-003", await t.exists('table, [class*="list"], [class*="card"], [class*="page"]'), "Phieu nhap load OK");
    await t.screenshot("03-import");

    // ── 4: Filter ──
    t.log("\u25B6", "RT02-004: Filter trang thai");
    t.assert("RT02-004", await t.clickText("Trạng thái", "button"), "Filter trang thai OK");
    await t.page.keyboard.press("Escape");

    t.log("\u25B6", "RT02-005: Filter ngay nhap");
    t.assert("RT02-005", await t.clickText("Ngày nhập", "button"), "Filter ngay OK");
    await t.page.keyboard.press("Escape");

    // ── 5: Them moi HD nhap ──
    t.log("\u25B6", "RT02-006: Them moi HD nhap");
    t.assert("RT02-006", await t.clickText("Thêm mới hoá đơn nhập hàng", "button"), "Nut them moi HD OK");
    await t.page.waitForTimeout(2000);
    await t.screenshot("06-create-import");

    // ── 6: Dieu chinh ──
    t.log("\u25B6", "RT02-007: Dieu chinh kho");
    await t.goto("/adjustment_slip");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-007", await t.exists('table, [class*="list"], [class*="page"]'), "Dieu chinh load OK");
    await t.screenshot("07-adjust");

    // ── 7: Xuat huy ──
    t.log("\u25B6", "RT02-008: Xuat huy");
    await t.goto("/destroy_slip");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-008", await t.exists('table, [class*="list"], [class*="page"]'), "Xuat huy load OK");
    await t.screenshot("08-destroy");

    // ── 8: Chuyen kho ──
    t.log("\u25B6", "RT02-009: Chuyen kho");
    await t.goto("/inventory_transfer_document");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-009", await t.exists('table, [class*="list"], [class*="page"]'), "Chuyen kho load OK");
    await t.screenshot("09-transfer");

    // ── 9: Kiem ke ──
    t.log("\u25B6", "RT02-010: Kiem ke");
    await t.goto("/inventory_checking");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-010", await t.exists('table, [class*="list"], [class*="page"]'), "Kiem ke load OK");
    await t.screenshot("10-checking");

    // ── 10: Ton kho SP ──
    t.log("\u25B6", "RT02-011: Ton kho SP");
    await t.goto("/product_inventory");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-011", await t.exists('table, [class*="list"], [class*="page"]'), "Ton kho SP load OK");
    await t.screenshot("11-product-inv");

    // ── 11: BC Kho ──
    t.log("\u25B6", "RT02-012: Bao cao kho");
    await t.goto("/report_warehouse");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-012", await t.exists('table, [class*="list"], canvas, [class*="chart"]'), "BC kho load OK");
    await t.screenshot("12-report");

    // ── 12: Xuat Excel ──
    t.log("\u25B6", "RT02-013: Xuat Excel phieu nhap");
    await t.goto("/invoice_order");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    t.assert("RT02-013", await t.clickText("Xuất Excel", "button"), "Xuat Excel OK");
    await t.page.waitForTimeout(2000);

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
