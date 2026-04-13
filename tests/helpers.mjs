/**
 * Test Helpers — Cloud CRM (Community Hub)
 *
 * Shared utilities for all test scripts.
 * Import: import { createTestRunner } from "./helpers.mjs";
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Ensure output dirs ──
fs.mkdirSync(path.join(__dirname, "screenshots"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "reports"), { recursive: true });

/**
 * Tao test runner cho 1 module.
 *
 * Usage:
 *   const t = await createTestRunner("RT.03", "POS");
 *   await t.login();
 *   await t.goto(ROUTES.COUNTER_SALES);
 *   t.assert("RT03-001", condition, "Mo ta");
 *   await t.screenshot("ten-anh");
 *   await t.done(); // in report + dong browser
 */
export async function createTestRunner(moduleCode, moduleName) {
  const RUN_ID = Date.now().toString(36).slice(-6);
  const results = [];
  const apiLogs = [];
  const startTime = Date.now();

  // ── Browser setup ──
  const browser = await chromium.launch({
    headless: CONFIG.HEADLESS,
    slowMo: CONFIG.SLOW_MO,
  });
  const context = await browser.newContext({ viewport: CONFIG.VIEWPORT });
  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.ACTION_TIMEOUT);

  // ── Capture API ──
  page.on("response", (res) => {
    const url = res.url();
    if (
      url.includes("/adminapi/") ||
      url.includes("/bizapi/") ||
      url.includes("/bpmapi/") ||
      url.includes("/api/")
    ) {
      apiLogs.push({
        method: res.request().method(),
        url: url.split("?")[0],
        status: res.status(),
        ts: new Date().toISOString(),
      });
    }
  });

  // ── Helpers ──
  function log(icon, msg) {
    console.log(`${icon}  ${msg}`);
  }

  function assert(testId, condition, detail = "") {
    const status = condition ? "PASS" : "FAIL";
    const icon = condition ? "\u2705" : "\u274C";
    log(icon, `[${testId}] ${status} — ${detail}`);
    results.push({ testId, status, detail, ts: new Date().toISOString() });
    return condition;
  }

  async function screenshot(name) {
    const fp = path.join(
      __dirname,
      "screenshots",
      `${moduleCode}-${RUN_ID}-${name}.png`
    );
    await page.screenshot({ path: fp, fullPage: false }).catch(() => {});
  }

  async function goto(route, opts = {}) {
    const url = `${CONFIG.BASE_URL}${route}`;
    await page.goto(url, {
      waitUntil: "load",
      timeout: CONFIG.NAVIGATION_TIMEOUT,
      ...opts,
    }).catch(() => {});
    await page.waitForTimeout(3000);
    // Auto-dismiss tour tooltip + remove overlay mask
    await dismissTour();
  }

  async function dismissTour() {
    // Click "Bo qua" to dismiss tour
    await page.click('.tour-tooltip__skip, button:has-text("Bỏ qua")').catch(() => {});
    await page.waitForTimeout(300);
    // Force-remove tour overlay + role modal backdrop that blocks clicks
    await page.evaluate(() => {
      document.querySelectorAll('.tour-overlay, .tour-overlay__mask, [class*="tour-overlay"]').forEach(el => el.remove());
      document.querySelectorAll('.tour-tooltip, [class*="tour-tooltip"]').forEach(el => el.remove());
      // Remove stale role modal backdrop
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      const roleModal = document.querySelector('.modal.page__choose--role');
      if (roleModal) roleModal.remove();
    }).catch(() => {});
    await page.waitForTimeout(300);
  }

  async function login() {
    log("\uD83D\uDD10", "Dang nhap...");

    // Try loading saved cookies first
    const cookieFile = path.join(__dirname, ".auth-cookies.json");
    if (fs.existsSync(cookieFile)) {
      try {
        const cookies = JSON.parse(fs.readFileSync(cookieFile, "utf8"));
        const tokenCookie = cookies.find((c) => c.name === "token");

        // Check if token still valid (not expired)
        if (tokenCookie && tokenCookie.expires * 1000 > Date.now()) {
          log("\uD83C\uDF6A", "Dung token da luu (con hieu luc)");
          await context.addCookies(cookies);

          // Navigate to CRM
          await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: "load", timeout: 20000 }).catch(() => {});
          await page.waitForTimeout(5000);
          await dismissTour();

          // Handle role modal — chon role + dismiss
          for (let attempt = 0; attempt < 3; attempt++) {
            const hasRoleModal = await page.evaluate(() =>
              !!(document.querySelector('.page__choose--role') ||
                 document.querySelector('.modal.show') ||
                 document.body?.innerText?.includes('Chọn vai trò'))
            );
            if (!hasRoleModal) break;
            log("\uD83D\uDC64", `Chon vai tro → Xac nhan (lan ${attempt + 1})`);
            await page.click('button:has-text("Xác nhận")').catch(() => {});
            await page.waitForTimeout(3000);
            await dismissTour();
          }
          // Luon set SelectedRole = role dau tien de skip modal chon role
          await page.evaluate(() => {
            localStorage.setItem("SelectedRole", localStorage.getItem("SelectedRole") || "1");
          }).catch(() => {});

          // Doi trang load noi dung (sau role selection)
          await page.waitForTimeout(3000);

          const loggedIn = page.url().includes("/crm/") && !page.url().includes("8080");
          if (loggedIn) {
            assert("LOGIN", true, "Dang nhap bang token da luu");
            return true;
          }
          log("\u26A0\uFE0F", "Token het han — can login lai");
        } else {
          log("\u26A0\uFE0F", "Token da het han");
        }
      } catch {
        log("\u26A0\uFE0F", "File cookies loi — can login lai");
      }
    }

    // No saved token — need SSO login
    log("\u274C", "Khong co token hop le. Chay truoc: node tests/login-save.mjs");
    assert("LOGIN", false, "Can chay 'node tests/login-save.mjs' truoc de luu token");
    return false;
  }

  // ── Click helpers ──
  async function click(selector, opts = {}) {
    try {
      await page.click(selector, { timeout: CONFIG.ACTION_TIMEOUT, ...opts });
      await page.waitForTimeout(800);
      return true;
    } catch {
      return false;
    }
  }

  async function clickText(text, tag = "button, a, div, span") {
    try {
      await page.click(`${tag}:has-text("${text}")`, { timeout: CONFIG.ACTION_TIMEOUT });
      await page.waitForTimeout(800);
      return true;
    } catch {
      return false;
    }
  }

  async function fill(selector, value) {
    try {
      await page.fill(selector, value, { timeout: CONFIG.ACTION_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  async function exists(selector) {
    try {
      return !!(await page.$(selector));
    } catch {
      return false;
    }
  }

  async function waitFor(selector, timeout) {
    try {
      await page.waitForSelector(selector, { timeout: timeout || CONFIG.ACTION_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  async function hasText(text) {
    try {
      const body = await page.textContent("body");
      return body.includes(text);
    } catch {
      return false;
    }
  }

  function findApi(method, urlPart) {
    return apiLogs.find(
      (l) => l.method === method && l.url.includes(urlPart)
    );
  }

  function findApis(method, urlPart) {
    return apiLogs.filter(
      (l) => l.method === method && l.url.includes(urlPart)
    );
  }

  function clearApiLogs() {
    apiLogs.length = 0;
  }

  // ── Report ──
  function saveReport() {
    const passed = results.filter((r) => r.status === "PASS").length;
    const failed = results.filter((r) => r.status === "FAIL").length;
    const report = {
      module: moduleCode,
      name: moduleName,
      runId: RUN_ID,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      baseUrl: CONFIG.BASE_URL,
      total: results.length,
      passed,
      failed,
      passRate: results.length ? `${Math.round((passed / results.length) * 100)}%` : "0%",
      results,
      apiCalls: apiLogs.length,
    };
    const fp = path.join(
      __dirname,
      "reports",
      `${moduleCode.toLowerCase()}-${RUN_ID}.json`
    );
    fs.writeFileSync(fp, JSON.stringify(report, null, 2));
    return report;
  }

  async function done() {
    console.log("\n" + "=".repeat(60));
    const report = saveReport();
    const icon = report.failed === 0 ? "\u2705" : "\u274C";
    log(
      icon,
      `[${moduleCode}] ${moduleName}: ${report.passed}/${report.total} passed (${report.passRate}), ${report.failed} failed`
    );
    log("\uD83D\uDCCA", `Report: tests/reports/${moduleCode.toLowerCase()}-${RUN_ID}.json`);
    log("\u23F1\uFE0F", `Duration: ${(report.durationMs / 1000).toFixed(1)}s`);
    console.log("=".repeat(60));
    await browser.close();
    return report;
  }

  // ── Public API ──
  log("\uD83D\uDE80", `[${moduleCode}] ${moduleName} — Run ${RUN_ID}`);
  console.log("-".repeat(60));

  return {
    page,
    context,
    browser,
    login,
    goto,
    click,
    clickText,
    fill,
    exists,
    waitFor,
    hasText,
    assert,
    screenshot,
    findApi,
    findApis,
    clearApiLogs,
    log,
    done,
    dismissTour,
    RUN_ID,
    /** Click nut Edit (but chi) tren dong co chua text */
    clickEditOnRow: async (text) => {
      const idx = await page.evaluate((t) => {
        return [...document.querySelectorAll("table tbody tr")].findIndex(tr => tr.innerText?.includes(t));
      }, text);
      if (idx < 0) return false;
      const btn = await page.$(`table tbody tr:nth-child(${idx + 1}) button[data-tip="Sửa"]`);
      if (!btn) return false;
      await btn.click({ force: true });
      await page.waitForTimeout(1500);
      return true;
    },
    /** Click nut Delete (thung rac) tren dong co chua text */
    clickDeleteOnRow: async (text) => {
      const idx = await page.evaluate((t) => {
        return [...document.querySelectorAll("table tbody tr")].findIndex(tr => tr.innerText?.includes(t));
      }, text);
      if (idx < 0) return false;
      const btn = await page.$(`table tbody tr:nth-child(${idx + 1}) button[data-tip="Xóa"]`);
      if (!btn) return false;
      await btn.click({ force: true });
      // Doi dialog hoac modal hien (co the async check)
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(800);
        const has = await page.evaluate(() =>
          !!document.querySelector('.dialog:not([style*="display: none"]), .modal.show')
        );
        if (has) return true;
      }
      return false;
    },
  };
}
