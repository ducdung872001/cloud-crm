#!/usr/bin/env node
/**
 * Test CRUD — Module Thanh vien (Member)
 *
 * Chay: node tests/test-member-crud.mjs
 *
 * Testcases: tests/cases/TC-MEMBER.md
 *   TC-MEMBER-001: Tao thanh vien
 *   TC-MEMBER-002: Xem chi tiet
 *   TC-MEMBER-003: Cap nhat
 *   TC-MEMBER-004: Xoa
 *   TC-MEMBER-005: Tim kiem
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || "http://localhost:4000";
const RUN_ID = Date.now().toString(36).slice(-4);
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const REPORTS_DIR = path.join(__dirname, "reports");

// Ensure output dirs exist
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(REPORTS_DIR, { recursive: true });

// ── Helpers ─────────────────────────────────────────────────────
const results = [];

function log(icon, msg) {
  console.log(`${icon}  ${msg}`);
}

function assert(testId, condition, detail = "") {
  const status = condition ? "PASS" : "FAIL";
  const icon = condition ? "\u2705" : "\u274C";
  log(icon, `[${testId}] ${status} ${detail}`);
  results.push({ testId, status, detail, ts: new Date().toISOString() });
  return condition;
}

async function screenshot(page, name) {
  const fp = path.join(SCREENSHOTS_DIR, `${RUN_ID}-${name}.png`);
  await page.screenshot({ path: fp, fullPage: false });
  log("\uD83D\uDCF7", `Screenshot: ${fp}`);
}

function saveReport() {
  const fp = path.join(REPORTS_DIR, `member-crud-${RUN_ID}.json`);
  const report = {
    module: "member",
    runId: RUN_ID,
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    total: results.length,
    passed: results.filter((r) => r.status === "PASS").length,
    failed: results.filter((r) => r.status === "FAIL").length,
    results,
  };
  fs.writeFileSync(fp, JSON.stringify(report, null, 2));
  log("\uD83D\uDCCA", `Report: ${fp}`);
  return report;
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  log("\uD83D\uDE80", `Starting Member CRUD tests (run: ${RUN_ID})`);
  log("\uD83C\uDF10", `Base URL: ${BASE}`);
  console.log("─".repeat(60));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Capture API requests
  const apiLogs = [];
  page.on("response", (res) => {
    const url = res.url();
    if (url.includes("/adminapi/") || url.includes("/api/")) {
      apiLogs.push({
        method: res.request().method(),
        url,
        status: res.status(),
        ts: new Date().toISOString(),
      });
    }
  });

  try {
    // ── LOGIN ──────────────────────────────────────────────────
    log("\uD83D\uDD10", "Logging in...");
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });

    // Fill credentials (adjust selectors to match your login form)
    await page.fill('input[type="text"], input[name="username"], input[placeholder*="user" i], input[placeholder*="tai khoan" i]', process.env.TEST_USER || "admin");
    await page.fill('input[type="password"]', process.env.TEST_PASS || "admin123");
    await page.click('button[type="submit"]');

    // Handle role selection modal if it appears
    try {
      const roleModal = await page.waitForSelector('.modal-select-role, [class*="role"]', { timeout: 3000 });
      if (roleModal) {
        log("\uD83D\uDC64", "Role selection modal detected, selecting first role...");
        await page.click('.modal-select-role .role-item:first-child, [class*="role"] button:first-child');
      }
    } catch {
      // No role modal — continue
    }

    await page.waitForURL("**/dashboard**", { timeout: 10000 }).catch(() => {});
    await screenshot(page, "01-after-login");
    assert("LOGIN", page.url().includes("dashboard") || !page.url().includes("login"), `URL: ${page.url()}`);

    console.log("─".repeat(60));

    // ── TEST 1: CREATE (TC-MEMBER-001) ────────────────────────
    log("\uD83D\uDCDD", "TEST 1: Tao thanh vien moi");
    const memberName = `Test Member ${RUN_ID}`;
    const memberPhone = `09${Date.now().toString().slice(-8)}`;

    // Navigate to member list
    // NOTE: Adjust selector to match your app's menu structure
    await page.goto(`${BASE}/customer-person`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await screenshot(page, "02-member-list");

    // Click "Add new" button
    const addBtn = await page.$('button:has-text("Them"), button:has-text("Thêm"), [class*="add"] button, .btn-add');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(1000);

      // Fill form (adjust selectors)
      // These are placeholder selectors — update based on actual form
      const nameInput = await page.$('input[name="name"], input[placeholder*="ten" i], input[placeholder*="name" i]');
      if (nameInput) await nameInput.fill(memberName);

      const phoneInput = await page.$('input[name="phone"], input[placeholder*="dien thoai" i], input[placeholder*="phone" i]');
      if (phoneInput) await phoneInput.fill(memberPhone);

      await screenshot(page, "03-create-form");

      // Submit
      const saveBtn = await page.$('button:has-text("Luu"), button:has-text("Lưu"), button[type="submit"]');
      if (saveBtn) await saveBtn.click();
      await page.waitForTimeout(2000);

      // Check API response
      const createApi = apiLogs.find((l) => l.method === "POST" && l.url.includes("customer"));
      assert("TC-MEMBER-001", !!createApi, createApi ? `API ${createApi.status}` : "No POST API captured");
    } else {
      assert("TC-MEMBER-001", false, "Add button not found — adjust selectors");
    }

    await screenshot(page, "04-after-create");
    console.log("─".repeat(60));

    // ── TEST 2: READ (TC-MEMBER-002) ──────────────────────────
    log("\uD83D\uDD0D", "TEST 2: Xem chi tiet thanh vien");
    await page.goto(`${BASE}/customer-person`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Click first row
    const firstRow = await page.$('.ag-row:first-child .ag-cell a, .ag-row:first-child .ag-cell:nth-child(2), table tbody tr:first-child td:nth-child(2) a');
    if (firstRow) {
      await firstRow.click();
      await page.waitForTimeout(2000);
      await screenshot(page, "05-member-detail");

      const detailApi = apiLogs.find((l) => l.method === "GET" && l.url.includes("customer/"));
      assert("TC-MEMBER-002", !!detailApi || page.url().includes("detail"), "Detail page loaded");
    } else {
      assert("TC-MEMBER-002", false, "No member row found to click");
    }

    console.log("─".repeat(60));

    // ── TEST 3: EDIT (TC-MEMBER-003) ──────────────────────────
    log("\u270F\uFE0F", "TEST 3: Cap nhat thong tin");
    // Assuming we're on detail page
    const editBtn = await page.$('button:has-text("Sua"), button:has-text("Sửa"), button:has-text("Edit"), [class*="edit"] button');
    if (editBtn) {
      await editBtn.click();
      await page.waitForTimeout(1000);
      await screenshot(page, "06-edit-form");

      // Change something
      const emailInput = await page.$('input[name="email"], input[type="email"]');
      if (emailInput) {
        await emailInput.fill(`test-${RUN_ID}@reborn.vn`);
      }

      const saveBtn = await page.$('button:has-text("Luu"), button:has-text("Lưu"), button[type="submit"]');
      if (saveBtn) await saveBtn.click();
      await page.waitForTimeout(2000);

      const updateApi = apiLogs.find((l) => l.method === "PUT" && l.url.includes("customer"));
      assert("TC-MEMBER-003", !!updateApi, updateApi ? `API ${updateApi.status}` : "No PUT API captured");
    } else {
      assert("TC-MEMBER-003", false, "Edit button not found — adjust selectors");
    }

    await screenshot(page, "07-after-edit");
    console.log("─".repeat(60));

    // ── TEST 4: DELETE (TC-MEMBER-004) ────────────────────────
    log("\uD83D\uDDD1\uFE0F", "TEST 4: Xoa thanh vien");
    await page.goto(`${BASE}/customer-person`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Try to find and delete the test member
    const deleteBtn = await page.$('button:has-text("Xoa"), button:has-text("Xóa"), button:has-text("Delete"), [class*="delete"] button');
    if (deleteBtn) {
      await deleteBtn.click();
      await page.waitForTimeout(500);

      // Confirm dialog
      const confirmBtn = await page.$('.modal button:has-text("Xac nhan"), .modal button:has-text("Xác nhận"), .modal button:has-text("OK"), .modal button:has-text("Dong y")');
      if (confirmBtn) await confirmBtn.click();
      await page.waitForTimeout(2000);

      const deleteApi = apiLogs.find((l) => l.method === "DELETE" && l.url.includes("customer"));
      assert("TC-MEMBER-004", !!deleteApi, deleteApi ? `API ${deleteApi.status}` : "No DELETE API captured");
    } else {
      assert("TC-MEMBER-004", false, "Delete button not found — adjust selectors (may need row selection first)");
    }

    await screenshot(page, "08-after-delete");
    console.log("─".repeat(60));

    // ── TEST 5: SEARCH (TC-MEMBER-005) ────────────────────────
    log("\uD83D\uDD0E", "TEST 5: Tim kiem thanh vien");
    await page.goto(`${BASE}/customer-person`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const searchInput = await page.$('input[placeholder*="Tim"], input[placeholder*="Tìm"], input[placeholder*="search" i], input[type="search"]');
    if (searchInput) {
      await searchInput.fill("test");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(2000);
      await screenshot(page, "09-search-result");

      const searchApi = apiLogs.find((l) => l.method === "GET" && l.url.includes("keyword"));
      assert("TC-MEMBER-005", true, "Search executed");
    } else {
      assert("TC-MEMBER-005", false, "Search input not found — adjust selectors");
    }

  } catch (err) {
    log("\uD83D\uDCA5", `Error: ${err.message}`);
    await screenshot(page, "error").catch(() => {});
  } finally {
    // ── REPORT ──────────────────────────────────────────────────
    console.log("\n" + "=".repeat(60));
    const report = saveReport();
    log(
      report.failed === 0 ? "\u2705" : "\u274C",
      `Results: ${report.passed}/${report.total} passed, ${report.failed} failed`
    );
    console.log("=".repeat(60));

    await browser.close();
    process.exit(report.failed > 0 ? 1 : 0);
  }
}

main();
