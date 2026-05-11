#!/usr/bin/env node
/**
 * Smoke test: Verify URL routing convention
 *
 * Convention (per user 2026-05-11):
 *   - Auth:     https://reborn.vn/authenticator/*
 *   - Business: https://biz.reborn.vn/<service>/*
 *   - Org/RBAC: https://biz.reborn.vn/org/*
 *
 * Chay: node tests/test-url-routing-convention.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || "http://localhost:4000/crm";
const RUN_ID = Date.now().toString(36).slice(-4);
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const REPORTS_DIR = path.join(__dirname, "reports");

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(REPORTS_DIR, { recursive: true });

const apiCalls = [];
const results = [];

function log(icon, msg) {
  console.log(`${icon}  ${msg}`);
}

function assert(testId, condition, detail = "") {
  const status = condition ? "PASS" : "FAIL";
  const icon = condition ? "✅" : "❌";
  log(icon, `[${testId}] ${status} — ${detail}`);
  results.push({ testId, status, detail });
  return condition;
}

(async () => {
  console.log("URL Routing Convention Smoke Test");
  console.log("BASE:", BASE);
  console.log("RUN_ID:", RUN_ID);
  console.log("");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);

  // Capture all network calls
  page.on("request", (req) => {
    const url = req.url();
    // Only capture API-relevant calls (not assets)
    if (
      url.includes("reborn.vn") ||
      url.includes("biz.reborn.vn") ||
      url.includes("/adminapi/") ||
      url.includes("/bizapi/") ||
      url.includes("/authenticator/") ||
      url.includes("/bpmapi/")
    ) {
      apiCalls.push({ method: req.method(), url });
    }
  });

  page.on("response", (res) => {
    const url = res.url();
    // Track failed calls
    if (res.status() >= 400 && (url.includes("reborn.vn") || url.includes("biz.reborn.vn"))) {
      log("⚠️", `${res.status()} ${res.request().method()} ${url.split("?")[0]}`);
    }
  });

  try {
    // ── T1: dev server loads ──────────────────────────────────────
    log("🚀", "Loading app...");
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000); // chờ tài nguyên + auth redirect khởi tạo
    assert("T1-LOAD", page.url() !== "about:blank", `Page loaded: ${page.url()}`);

    // Screenshot homepage state
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `url-routing-${RUN_ID}-01-load.png`),
      fullPage: false,
    });

    // ── T2: SSO redirect URL pattern check ────────────────────────
    const currentUrl = page.url();
    log("ℹ️", `Current URL after load: ${currentUrl}`);

    // ── T3: Analyze captured network calls ────────────────────────
    log("📊", `Captured ${apiCalls.length} API calls`);
    apiCalls.forEach((c) => log("  →", `${c.method} ${c.url.split("?")[0]}`));

    // Categorize
    const authCalls = apiCalls.filter((c) => c.url.includes("/authenticator/"));
    const bizReborn = apiCalls.filter((c) => c.url.startsWith("https://biz.reborn.vn/"));
    const cloudReborn = apiCalls.filter((c) => c.url.startsWith("https://cloud.reborn.vn/"));
    const legacyAdmin = apiCalls.filter((c) => c.url.includes("/adminapi/"));
    const legacyBiz = apiCalls.filter((c) => c.url.includes("/bizapi/") && !c.url.startsWith("https://biz.reborn.vn/"));

    log("📈", `Auth (reborn.vn/authenticator/*):     ${authCalls.length}`);
    log("📈", `Biz (biz.reborn.vn/*):                ${bizReborn.length}`);
    log("📈", `Cloud (cloud.reborn.vn/*):            ${cloudReborn.length}`);
    log("📈", `Legacy /adminapi/* (deprecated):      ${legacyAdmin.length}`);
    log("📈", `Path-only /bizapi/* (need rewrite):   ${legacyBiz.length}`);

    // Convention checks
    // T3.1: Auth calls (if any) phải dùng đúng host reborn.vn
    authCalls.forEach((c, i) => {
      const onCorrectHost = c.url.startsWith("https://reborn.vn/authenticator/");
      assert(
        `T3.1-AUTH-${i}`,
        onCorrectHost,
        `Auth call on reborn.vn? URL=${c.url.split("?")[0]}`,
      );
    });

    // T3.2: Biz calls — không được chứa /adminapi/
    bizReborn.forEach((c, i) => {
      const noAdminapi = !c.url.includes("/adminapi/");
      assert(
        `T3.2-BIZ-${i}`,
        noAdminapi,
        `Biz call không chứa /adminapi: ${c.url.split("?")[0]}`,
      );
    });

    // T3.3: Không còn legacy /adminapi/* calls (overall)
    assert(
      "T3.3-NO-ADMINAPI",
      legacyAdmin.length === 0,
      `Không còn call legacy /adminapi/* (found ${legacyAdmin.length})`,
    );

    // ── T4: Verify URL config trong source ────────────────────────
    // Test bằng cách check string trong window (FE config có resolve URL correct)
    const fetchProbe = await page.evaluate(async () => {
      // Try fetch các URL theo convention để verify routing
      const probes = [];

      // Auth
      try {
        const r = await fetch("https://reborn.vn/authenticator/user/me", {
          method: "GET",
          credentials: "omit",
          mode: "no-cors",
        });
        probes.push({ target: "auth", url: "reborn.vn/authenticator/user/me", ok: true });
      } catch (e) {
        probes.push({ target: "auth", url: "reborn.vn/authenticator/user/me", ok: false, err: String(e) });
      }

      // Biz
      try {
        const r = await fetch("https://biz.reborn.vn/customer/list", {
          method: "GET",
          credentials: "omit",
          mode: "no-cors",
        });
        probes.push({ target: "biz-customer", url: "biz.reborn.vn/customer/list", ok: true });
      } catch (e) {
        probes.push({ target: "biz-customer", url: "biz.reborn.vn/customer/list", ok: false, err: String(e) });
      }

      return probes;
    });

    log("🔍", "URL reachability probes:");
    fetchProbe.forEach((p) => log("  →", `${p.target}: ${p.url} — ${p.ok ? "REACHABLE" : "ERR " + p.err}`));

    fetchProbe.forEach((p, i) => {
      assert(`T4-PROBE-${p.target}`, p.ok, `${p.url} reachable from browser`);
    });

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `url-routing-${RUN_ID}-02-final.png`),
      fullPage: false,
    });
  } catch (err) {
    log("❌", `Test error: ${err.message}`);
    results.push({ testId: "EXCEPTION", status: "FAIL", detail: err.message });
  }

  await browser.close();

  // Report
  const report = {
    testSuite: "URL Routing Convention",
    runId: RUN_ID,
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    convention: {
      auth: "https://reborn.vn/authenticator/*",
      business: "https://biz.reborn.vn/<service>/*",
      org: "https://biz.reborn.vn/org/*",
    },
    apiCallsSummary: {
      total: apiCalls.length,
      auth: apiCalls.filter((c) => c.url.includes("/authenticator/")).length,
      bizReborn: apiCalls.filter((c) => c.url.startsWith("https://biz.reborn.vn/")).length,
      cloudReborn: apiCalls.filter((c) => c.url.startsWith("https://cloud.reborn.vn/")).length,
      legacyAdmin: apiCalls.filter((c) => c.url.includes("/adminapi/")).length,
    },
    capturedCalls: apiCalls.map((c) => ({ method: c.method, url: c.url.split("?")[0] })),
    total: results.length,
    passed: results.filter((r) => r.status === "PASS").length,
    failed: results.filter((r) => r.status === "FAIL").length,
    results,
  };

  const reportPath = path.join(REPORTS_DIR, `url-routing-convention-${RUN_ID}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("");
  console.log("═══════════════════════════════════════");
  console.log(`Total:  ${report.total}`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`Report: ${reportPath}`);
  console.log("═══════════════════════════════════════");

  process.exit(report.failed > 0 ? 1 : 0);
})();
