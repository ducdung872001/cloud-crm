/**
 * api-helpers.mjs — Shared API test runner (stable hơn UI test).
 * Dùng Playwright request context + storageState để auth.
 *
 * Usage:
 *   const api = await createApiRunner("CUSTOMER", "Thành viên");
 *   const res = await api.post("/adminapi/customer/update", { name: "..." });
 *   api.assert("TC-001", res.code === 0, "Tạo mới OK");
 *   await api.done();
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, ".auth-state.json");

/**
 * createApiRunner — gọi API qua page.evaluate() để hưởng fetchConfig (URL rewrite +
 * Hostname header + cookie) giống hệt khi user thao tác trong app. Ổn định và
 * chính xác hơn gọi thẳng từ Node.
 */
export async function createApiRunner(moduleCode, moduleName) {
  if (!fs.existsSync(STATE_PATH)) {
    throw new Error("Thiếu .auth-state.json — chạy 'node tests/login-save.mjs' trước.");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STATE_PATH, viewport: CONFIG.VIEWPORT });
  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.ACTION_TIMEOUT);

  // nạp app để fetchConfig được apply
  await page.goto(`${CONFIG.BASE_URL}/dashboard`, { waitUntil: "load", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  if (!page.url().includes("/crm/")) {
    await browser.close();
    throw new Error(`Phiên không hợp lệ, đang ở ${page.url()}. Chạy lại 'node tests/login-save.mjs'.`);
  }

  const RUN_ID = Date.now().toString(36).slice(-6);
  const results = [];
  const apiLogs = [];
  const startTime = Date.now();

  function log(icon, msg) {
    console.log(`${icon}  ${msg}`);
  }

  function assert(testId, cond, detail = "") {
    const ok = !!cond;
    results.push({ testId, status: ok ? "PASS" : "FAIL", detail, ts: new Date().toISOString() });
    log(ok ? "\u2705" : "\u274C", `[${testId}] ${ok ? "PASS" : "FAIL"} — ${detail}`);
    return ok;
  }

  /** Gọi fetch trong context browser — hưởng URL rewrite + Hostname header từ fetchConfig. */
  async function call(method, url, dataOrParams) {
    const result = await page.evaluate(async ({ method, url, payload }) => {
      const init = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      let fullUrl = url;
      if (method === "GET" && payload && typeof payload === "object") {
        const qs = new URLSearchParams(
          Object.entries(payload).filter(([, v]) => v !== undefined && v !== "")
        ).toString();
        if (qs) fullUrl = `${url}?${qs}`;
      } else if (method !== "GET" && payload !== undefined) {
        init.body = JSON.stringify(payload);
      }
      try {
        const res = await fetch(fullUrl, init);
        const text = await res.text();
        let body;
        try { body = JSON.parse(text); } catch { body = text; }
        return { status: res.status, body };
      } catch (e) {
        return { status: -1, body: String(e) };
      }
    }, { method, url, payload: dataOrParams });
    apiLogs.push({ method, url, status: result.status });
    return { status: result.status, body: result.body, ...(typeof result.body === "object" ? result.body : {}) };
  }

  const get  = (url, params) => call("GET",    url, params);
  const post = (url, data)   => call("POST",   url, data);
  const put  = (url, data)   => call("PUT",    url, data);
  const del  = (url)         => call("DELETE", url);

  async function done() {
    const passed = results.filter((r) => r.status === "PASS").length;
    const failed = results.filter((r) => r.status === "FAIL").length;
    const report = {
      module: moduleCode,
      name: moduleName,
      runId: RUN_ID,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      total: results.length,
      passed,
      failed,
      passRate: results.length ? `${Math.round((passed / results.length) * 100)}%` : "0%",
      results,
      apiCalls: apiLogs.length,
    };
    const fp = path.join(__dirname, "reports", `${moduleCode.toLowerCase()}-api-${RUN_ID}.json`);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(report, null, 2));

    console.log("\n" + "=".repeat(60));
    log(failed === 0 ? "\u2705" : "\u274C", `[${moduleCode}] ${moduleName}: ${passed}/${results.length} (${report.passRate}), ${failed} failed`);
    log("\uD83D\uDCCA", `Report: tests/reports/${moduleCode.toLowerCase()}-api-${RUN_ID}.json`);
    console.log("=".repeat(60));

    await browser.close();
    return report;
  }

  log("\uD83D\uDE80", `[${moduleCode}] ${moduleName} — API Run ${RUN_ID}`);
  console.log("-".repeat(60));

  return { get, post, put, del, assert, log, done, page, context, browser, RUN_ID };
}
