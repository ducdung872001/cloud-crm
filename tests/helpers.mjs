/**
 * Test Helpers — Reborn Retail CRM
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
      waitUntil: "networkidle",
      timeout: CONFIG.NAVIGATION_TIMEOUT,
      ...opts,
    }).catch(() => {
      // fallback: just wait for load
      return page.goto(url, { waitUntil: "load", timeout: CONFIG.NAVIGATION_TIMEOUT });
    });
    await page.waitForTimeout(1500);
  }

  async function login() {
    log("\uD83D\uDD10", `Dang nhap (${CONFIG.USERNAME})...`);
    await goto("/login");

    // Fill login form — try multiple selectors
    const userSelectors = [
      'input[name="username"]',
      'input[placeholder*="tai khoan" i]',
      'input[placeholder*="user" i]',
      'input[placeholder*="dang nhap" i]',
      'input[type="text"]:first-of-type',
    ];
    for (const sel of userSelectors) {
      const el = await page.$(sel);
      if (el) { await el.fill(CONFIG.USERNAME); break; }
    }

    await page.fill('input[type="password"]', CONFIG.PASSWORD);
    await page.click('button[type="submit"]');

    // Handle role selection modal
    try {
      const roleModal = await page.waitForSelector(
        '.modal-select-role, [class*="SelectRole"], [class*="select-role"]',
        { timeout: CONFIG.MODAL_TIMEOUT }
      );
      if (roleModal) {
        log("\uD83D\uDC64", "Chon role...");
        const roleBtn = await page.$(
          '.modal-select-role .role-item:first-child, [class*="role"] .item:first-child, [class*="SelectRole"] button:first-child'
        );
        if (roleBtn) await roleBtn.click();
      }
    } catch {
      // No role modal
    }

    await page.waitForTimeout(3000);
    const loggedIn = !page.url().includes("/login");
    assert("LOGIN", loggedIn, loggedIn ? "Dang nhap thanh cong" : `URL: ${page.url()}`);
    return loggedIn;
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
    RUN_ID,
  };
}
