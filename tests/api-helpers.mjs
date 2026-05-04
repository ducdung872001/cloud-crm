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

  /** Gọi fetch QUA NODE (context.request) — KHÔNG qua browser fetch ⇒ bỏ qua CORS.
   *  Kế thừa cookies từ storageState (token .reborn.vn). Tự thêm Hostname header để
   *  match BE multi-tenant convention. URL `/bizapi/*` được pre-rewrite về biz.reborn.vn,
   *  `/adminapi/*` về cloud.reborn.vn — đúng theo fetchConfig logic của FE.
   *
   *  Lý do bỏ browser fetch: BE production CORS chặn cross-origin POST/GET có
   *  Authorization header (browser → preflight OPTIONS → fail). Node request không
   *  bị CORS, gửi trực tiếp với cookie + headers. */
  function expandUrl(url) {
    if (typeof url !== "string") return url;
    if (url.startsWith("/bizapi/")) {
      return "https://biz.reborn.vn" + url.replace("/bizapi", "");
    }
    if (url.startsWith("/adminapi/")) {
      return "https://cloud.reborn.vn" + url;
    }
    return url;
  }

  // Hostname header — match host của page sau khi auth (noname/hub/...).
  const hostHeader = new URL(page.url()).host;
  // JWT token từ cookie (do BE expect Authorization Bearer header, không phải cookie).
  const cookies = await context.cookies();
  const tokenCookie = cookies.find((c) => c.name === "token");
  const authHeader = tokenCookie ? `Bearer ${tokenCookie.value}` : null;

  async function call(method, url, dataOrParams) {
    const expanded = expandUrl(url);
    let finalUrl = expanded;
    const headers = {
      "Content-Type": "application/json",
      "Hostname": hostHeader,
      ...(authHeader && !expanded.includes("/public/") ? { Authorization: authHeader } : {}),
    };
    const opts = { method, headers };

    if (method === "GET" && dataOrParams && typeof dataOrParams === "object") {
      const qs = new URLSearchParams(
        Object.entries(dataOrParams).filter(([, v]) => v !== undefined && v !== "")
      ).toString();
      if (qs) finalUrl = `${expanded}${expanded.includes("?") ? "&" : "?"}${qs}`;
    } else if (method !== "GET" && dataOrParams !== undefined) {
      opts.data = dataOrParams;
    }
    // Timeout 10s — BE prod admin endpoints có thể hang lâu (bug nghiêm trọng), không đợi quá lâu.
    opts.timeout = 10000;

    let status, body;
    try {
      const res = await context.request.fetch(finalUrl, opts);
      status = res.status();
      const text = await res.text();
      try { body = JSON.parse(text); } catch { body = text; }
    } catch (e) {
      status = -1;
      body = String(e);
    }
    apiLogs.push({ method, url, status });
    return { status, body, ...(typeof body === "object" && body !== null ? body : {}) };
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
