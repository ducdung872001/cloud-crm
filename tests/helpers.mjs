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
  const statePath = path.join(__dirname, ".auth-state.json");
  const hasSavedState = fs.existsSync(statePath);
  const context = await browser.newContext({
    viewport: CONFIG.VIEWPORT,
    ...(hasSavedState ? { storageState: statePath } : {}),
  });
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
    // Welcome tour CRM ("Chào mừng đến Reborn CRM") + tour tooltip đơn vị
    // Ưu tiên click "✕" (close tour hoàn toàn), fallback "Bỏ qua"
    for (let i = 0; i < 5; i++) {
      const clicked = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        // ưu tiên ✕ (close full)
        let target = btns.find((b) => {
          const t = (b.innerText || "").trim();
          return (t === "✕" || t === "×" || t === "X") && b.offsetHeight > 0;
        });
        if (!target) {
          target = btns.find((b) => {
            const t = (b.innerText || "").trim();
            return (t === "Bỏ qua" || t === "Đóng" || /skip/i.test(t)) && b.offsetHeight > 0;
          });
        }
        if (target) { target.click(); return true; }
        return false;
      });
      if (!clicked) break;
      await page.waitForTimeout(400);
    }
    // Force-remove tour overlay + modal backdrop + welcome tour containers
    await page.evaluate(() => {
      const selectors = [
        '.tour-overlay', '.tour-overlay__mask', '[class*="tour-overlay"]',
        '.tour-tooltip', '[class*="tour-tooltip"]',
        '[class*="welcome-tour"]', '[class*="onboarding"]',
      ];
      for (const sel of selectors) document.querySelectorAll(sel).forEach((el) => el.remove());
      // Modal chào mừng: tìm modal chứa text "Chào mừng đến Reborn CRM"
      const modals = [...document.querySelectorAll('.modal, [role="dialog"]')];
      for (const m of modals) {
        if ((m.innerText || "").includes("Chào mừng đến Reborn CRM")) m.remove();
      }
      document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
      const roleModal = document.querySelector('.modal.page__choose--role');
      if (roleModal) roleModal.remove();
    }).catch(() => {});
    await page.waitForTimeout(300);
  }

  async function login() {
    log("\uD83D\uDD10", "Khoi phuc phien dang nhap tu .auth-state.json");
    if (!hasSavedState) {
      log("\u274C", "Khong tim thay .auth-state.json. Chay truoc: node tests/login-save.mjs");
      assert("LOGIN", false, "Thieu .auth-state.json — chay 'node tests/login-save.mjs'");
      return false;
    }
    // storageState da duoc nap khi tao context — chi can navigate va dismiss tour.
    await page.goto(`${CONFIG.BASE_URL}/dashboard`, {
      waitUntil: "load",
      timeout: CONFIG.NAVIGATION_TIMEOUT,
    }).catch(() => {});
    await page.waitForTimeout(2500);
    await dismissTour();

    const onApp = page.url().includes("/crm/") && !page.url().includes("8080");
    if (!onApp) {
      assert("LOGIN", false, `Phien het han hoac redirect SSO: ${page.url()}. Chay lai login-save.mjs.`);
      return false;
    }
    assert("LOGIN", true, "Dung lai storageState da luu");
    return true;
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
