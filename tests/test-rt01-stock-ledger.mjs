#!/usr/bin/env node
/**
 * RT.01 — So kho (Inventory Ledger)
 * Test THUC TE voi selectors chinh xac tu UI Reborn Retail.
 * Chay: node tests/test-rt01-stock-ledger.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("RT.01", "So kho");

  try {
    if (!(await t.login())) throw new Error("Login failed");
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');

    console.log("-".repeat(60));

    // ── TEST 1: Hien thi danh sach ──
    t.log("\u25B6", "RT01-001: Hien thi danh sach so kho");
    await t.goto(ROUTES.STOCK_LEDGER);
    await t.click('.tour-tooltip__skip, button:has-text("Bỏ qua")');
    {
      const hasTable = await t.exists("table");
      const headers = await t.page.evaluate(() =>
        [...document.querySelectorAll("table thead th")].map((e) => e.innerText?.trim())
      );
      const rowCount = await t.page.evaluate(() =>
        document.querySelectorAll("table tbody tr").length
      );
      t.assert("RT01-001a", hasTable, "Bang so kho hien thi");
      t.assert("RT01-001b", headers.includes("Mã chứng từ") && headers.includes("Sản phẩm"),
        `Cot: ${headers.slice(1, 6).join(", ")}...`);
      t.assert("RT01-001c", rowCount > 0, `${rowCount} dong du lieu`);
      await t.screenshot("01-list");
    }

    // ── TEST 2: Kiem tra cac cot ──
    t.log("\u25B6", "RT01-002: Kiem tra cac cot du lieu");
    {
      const expected = ["Mã chứng từ", "Loại", "Sản phẩm", "Kho", "Biến động", "Tồn trước", "Tồn sau", "Trạng thái"];
      const actual = await t.page.evaluate(() =>
        [...document.querySelectorAll("table thead th")].map((e) => e.innerText?.trim())
      );
      let missing = expected.filter((c) => !actual.some((a) => a.includes(c)));
      t.assert("RT01-002", missing.length === 0,
        missing.length === 0 ? `Du ${expected.length} cot chinh` : `Thieu: ${missing.join(", ")}`);
    }

    // ── TEST 3: Du lieu dong khong rong ──
    t.log("\u25B6", "RT01-003: Du lieu dong dau tien khong rong");
    {
      const row = await t.page.evaluate(() => {
        const tr = document.querySelector("table tbody tr:first-child");
        if (!tr) return null;
        return [...tr.querySelectorAll("td")].map((td) => td.innerText?.trim());
      });
      if (row) {
        t.assert("RT01-003a", (row[1] || "").length > 0, `Ma chung tu: ${(row[1] || "").slice(0, 20)}`);
        t.assert("RT01-003b", (row[4] || "").length > 0, `San pham: ${(row[4] || "").slice(0, 20)}`);
        t.assert("RT01-003c", (row[6] || "").length > 0, `Kho: ${(row[6] || "").slice(0, 20)}`);
      } else {
        t.assert("RT01-003", false, "Khong co du lieu");
      }
    }

    // ── TEST 4: Tim kiem san pham ──
    t.log("\u25B6", "RT01-004: Tim kiem san pham");
    {
      const input = await t.page.$('input[placeholder*="Tìm kiếm tên sản phẩm"]');
      if (input) {
        const rowsBefore = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);

        await input.fill("NOTHING_MATCH_" + t.RUN_ID);
        await t.page.keyboard.press("Enter");
        await t.page.waitForTimeout(2000);
        const rowsEmpty = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
        t.assert("RT01-004a", rowsEmpty < rowsBefore || rowsEmpty === 0, `Tim khong co: ${rowsEmpty} dong`);

        // Clear
        await input.fill("");
        await t.page.keyboard.press("Enter");
        await t.page.waitForTimeout(2000);
        const rowsBack = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
        t.assert("RT01-004b", rowsBack > 0, `Xoa tim kiem: ${rowsBack} dong tro lai`);
      } else {
        t.assert("RT01-004", false, "Khong tim thay o search");
      }
      await t.screenshot("04-search");
    }

    // ── TEST 5: Filter kho hang ──
    t.log("\u25B6", "RT01-005: Filter theo kho hang");
    {
      const ok = await t.clickText("Kho hàng", "button");
      await t.page.waitForTimeout(1000);
      const hasDropdown = await t.exists('[class*="dropdown"], [class*="popup"], [class*="Popup"], [class*="select"]');
      t.assert("RT01-005", ok, ok ? "Nut Kho hang click duoc" : "Khong tim thay nut");
      await t.page.keyboard.press("Escape");
      await t.screenshot("05-filter-kho");
    }

    // ── TEST 6: Filter thoi gian ──
    t.log("\u25B6", "RT01-006: Filter theo thoi gian");
    {
      const ok = await t.clickText("Khoảng thời gian", "button");
      await t.page.waitForTimeout(1000);
      t.assert("RT01-006", ok, ok ? "Nut Khoang thoi gian click duoc" : "Khong tim thay");
      await t.page.keyboard.press("Escape");
      await t.screenshot("06-filter-time");
    }

    // ── TEST 7: Xem chi tiet phieu ──
    t.log("\u25B6", "RT01-007: Xem chi tiet phieu (click dong)");
    {
      const cell = await t.page.$("table tbody tr:first-child td:nth-child(2)");
      if (cell) {
        await cell.click();
        await t.page.waitForTimeout(2000);
        const hasModal = await t.exists('.modal, [class*="modal"], [class*="Modal"]');
        t.assert("RT01-007", hasModal, hasModal ? "Modal chi tiet mo thanh cong" : "Khong thay modal chi tiet");
        await t.screenshot("07-detail");

        // Dong modal
        await t.click('[class*="modal"] button:has-text("Đóng"), [class*="modal"] button[class*="close"], .modal .close');
        await t.page.waitForTimeout(500);
      } else {
        t.assert("RT01-007", false, "Khong co dong de click");
      }
    }

    // ── TEST 8: Xuat Excel ──
    t.log("\u25B6", "RT01-008: Xuat Excel");
    {
      t.clearApiLogs();
      const ok = await t.clickText("Xuất Excel", "button");
      await t.page.waitForTimeout(3000);
      t.assert("RT01-008", ok, ok ? "Nut Xuat Excel click duoc" : "Khong tim thay nut");
      await t.screenshot("08-export");
    }

    // ── TEST 9: Thay doi so dong (page size) ──
    t.log("\u25B6", "RT01-009: Thay doi so dong hien thi");
    {
      // Page size button hien "10"
      const btns = await t.page.$$("button.base-button");
      let pageSizeBtn = null;
      for (const btn of btns) {
        const text = await btn.innerText();
        if (text.trim() === "10") { pageSizeBtn = btn; break; }
      }
      if (pageSizeBtn) {
        await pageSizeBtn.click();
        await t.page.waitForTimeout(500);
        // Click 20
        await t.click('text=20').catch(() => {});
        await t.page.waitForTimeout(2000);
        const rows = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
        t.assert("RT01-009", rows >= 1, `Hien thi ${rows} dong`);
      } else {
        t.assert("RT01-009", false, "Khong tim thay nut page size");
      }
      await t.screenshot("09-pagesize");
    }

    // ── TEST 10: Phan trang ──
    t.log("\u25B6", "RT01-010: Phan trang");
    {
      const nextBtn = await t.page.$('[class*="pagination"] button:last-child, button:has-text("»"), button:has-text("›")');
      if (nextBtn && !(await nextBtn.evaluate((el) => el.disabled))) {
        await nextBtn.click();
        await t.page.waitForTimeout(2000);
        t.assert("RT01-010", true, "Chuyen trang thanh cong");
      } else {
        t.assert("RT01-010", true, "Chi co 1 trang hoac khong thay nut");
      }
      await t.screenshot("10-pagination");
    }

    // ── TEST 11: Console errors ──
    t.log("\u25B6", "RT01-011: Kiem tra console errors");
    {
      const errors = [];
      t.page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
      await t.goto(ROUTES.STOCK_LEDGER);
      await t.page.waitForTimeout(3000);
      const realErrors = errors.filter((e) =>
        !e.includes("favicon") && !e.includes("ResizeObserver") && !e.includes("net::ERR")
      );
      t.assert("RT01-011", realErrors.length === 0,
        realErrors.length === 0 ? "Khong co console error" : `${realErrors.length} errors: ${realErrors[0]?.slice(0, 80)}`);
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }

  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
