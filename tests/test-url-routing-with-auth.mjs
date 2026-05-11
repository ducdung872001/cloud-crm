#!/usr/bin/env node
/**
 * E2E smoke test: Login → capture all API calls → verify URL routing convention
 *
 * Convention (per user 2026-05-11):
 *   - Auth/SSO:    https://reborn.vn/authenticator/*  (KHÔNG migrate sang biz)
 *   - Business:    https://biz.reborn.vn/<service>/*
 *   - Org/RBAC:    https://biz.reborn.vn/org/*  (pattern reborn-mentorhub)
 *   - Deprecated:  cloud.reborn.vn/adminapi/*  → tất cả phải migrate sang biz
 *
 * Account: 0971234599 / Reborn@12345
 * Chay: node tests/test-url-routing-with-auth.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUN_ID = Date.now().toString(36).slice(-4);
const REPORTS_DIR = path.join(__dirname, "reports");
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
fs.mkdirSync(REPORTS_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

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
  console.log("URL Routing Convention E2E Test (with auth)");
  console.log("Account:", CONFIG.USERNAME);
  console.log("");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  page.on("request", (req) => {
    const url = req.url();
    if (
      url.includes("reborn.vn") ||
      url.startsWith("https://biz.reborn.vn") ||
      url.includes("/adminapi/") ||
      url.includes("/bizapi/") ||
      url.includes("/authenticator/") ||
      url.includes("/bpmapi/") ||
      url.includes("/api/")
    ) {
      apiCalls.push({ method: req.method(), url, ts: Date.now() });
    }
  });

  try {
    // ── 1. Login flow ──
    log("🚀", "Loading login page...");
    await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: "load", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(5000);

    const ssoUrl = page.url();
    log("🔐", `SSO at: ${ssoUrl.split("?")[0]}`);

    if (ssoUrl.includes("8080") || ssoUrl.includes("sso")) {
      await page.evaluate((user) => {
        const el = document.querySelector('input[type="text"]');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(el, user);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }, CONFIG.USERNAME);

      await page.evaluate((pass) => {
        const el = document.querySelector('input[type="password"]');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(el, pass);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }, CONFIG.PASSWORD);

      await page.waitForTimeout(500);
      await page.click("button.btn-submit-form");
      log("⏳", "Waiting for SSO callback...");
      await page.waitForTimeout(10000);
    }

    // Handle role selection if shown
    try {
      await page.waitForSelector("text=Chọn vai trò", { timeout: 6000 });
      log("👤", "Selecting role...");
      const banGiamDoc = page.locator('label:has-text("Ban giám đốc")');
      if (await banGiamDoc.count() > 0) {
        await banGiamDoc.first().click();
      }
      await page.click('button:has-text("Xác nhận")').catch(() => {});
      await page.waitForTimeout(5000);
    } catch {
      await page.waitForTimeout(2000);
    }

    log("✓", `Logged in. Current URL: ${page.url()}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `routing-auth-${RUN_ID}-01-after-login.png`),
    });

    // ── 2. Navigate to a few pages to trigger API calls ──
    const pagesToVisit = [
      { name: "Customer list", url: `${CONFIG.BASE_URL}/customer` },
      { name: "Member list", url: `${CONFIG.BASE_URL}/member_list` },
      { name: "Setting", url: `${CONFIG.BASE_URL}/setting_loyalty` },
    ];

    for (const p of pagesToVisit) {
      log("📍", `Navigating: ${p.name} (${p.url})`);
      try {
        await page.goto(p.url, { waitUntil: "domcontentloaded", timeout: 10000 });
        await page.waitForTimeout(3000);
      } catch (e) {
        log("⚠️", `${p.name} nav err: ${e.message}`);
      }
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `routing-auth-${RUN_ID}-02-after-nav.png`),
    });

    // ── 3. Analyze captured calls ──
    log("📊", `Captured ${apiCalls.length} relevant network calls`);

    const uniqueUrls = [...new Set(apiCalls.map((c) => c.url.split("?")[0]))];

    // Categorize
    const authReborn = uniqueUrls.filter((u) => u.startsWith("https://reborn.vn/authenticator/"));
    const bizReborn = uniqueUrls.filter((u) => u.startsWith("https://biz.reborn.vn/"));
    const cloudReborn = uniqueUrls.filter((u) => u.startsWith("https://cloud.reborn.vn/"));
    const legacyAdmin = uniqueUrls.filter((u) => u.includes("/adminapi/"));
    const ssoLocal = uniqueUrls.filter(
      (u) => u.startsWith("http://localhost:8080") || u.startsWith("https://sso.reborn.vn"),
    );

    console.log("");
    log("📈", "Breakdown by host:");
    log("  ", `Auth (reborn.vn/authenticator/*): ${authReborn.length}`);
    authReborn.forEach((u) => log("    →", u));
    log("  ", `Biz (biz.reborn.vn/<svc>/*):       ${bizReborn.length}`);
    bizReborn.forEach((u) => log("    →", u));
    log("  ", `Cloud (cloud.reborn.vn/*):         ${cloudReborn.length}`);
    cloudReborn.forEach((u) => log("    →", u));
    log("  ", `SSO local/sso.reborn.vn:           ${ssoLocal.length}`);
    ssoLocal.forEach((u) => log("    →", u));
    log("  ", `Legacy /adminapi/* (BAD):          ${legacyAdmin.length}`);
    legacyAdmin.forEach((u) => log("    ❌ ", u));

    // ── Assertions ──
    console.log("");

    // Auth assertions
    assert(
      "AUTH-HOST",
      authReborn.length > 0 || ssoLocal.length > 0,
      `Có ít nhất 1 auth call (production reborn.vn hoặc local SSO)`,
    );

    // Production auth: nếu có call /authenticator/, phải on reborn.vn
    const authOnWrongHost = uniqueUrls.filter(
      (u) => u.includes("/authenticator/") && !u.startsWith("https://reborn.vn/authenticator/") && !u.includes("localhost"),
    );
    assert(
      "AUTH-CORRECT-HOST",
      authOnWrongHost.length === 0,
      `Tất cả /authenticator/ calls on reborn.vn (${authOnWrongHost.length} wrong)`,
    );

    // Business assertions: bất kỳ biz call phải on biz.reborn.vn (không trên cloud)
    assert(
      "BIZ-NO-CLOUD-ADMIN",
      cloudReborn.filter((u) => u.includes("/adminapi/")).length === 0,
      `Không còn cloud.reborn.vn/adminapi/* calls`,
    );

    assert("BIZ-NO-LEGACY-ADMINAPI", legacyAdmin.length === 0, `Zero /adminapi/* calls (deprecated)`);

    assert("BIZ-USES-BIZ-HOST", bizReborn.length > 0, `Có call đến biz.reborn.vn (${bizReborn.length} unique URLs)`);

    // Convention check: biz calls phải có service prefix sau host
    const bizMalformed = bizReborn.filter((u) => {
      const path = u.replace("https://biz.reborn.vn/", "");
      const firstSegment = path.split("/")[0];
      return !firstSegment || firstSegment.length < 2;
    });
    assert(
      "BIZ-HAS-SERVICE-PREFIX",
      bizMalformed.length === 0,
      `Mọi biz call có service prefix (/customer, /market, /care, /org, ...)`,
    );

    // List unique service prefixes used
    const services = new Set(
      bizReborn.map((u) => u.replace("https://biz.reborn.vn/", "").split("/")[0]),
    );
    log("📋", `Services hit: ${[...services].join(", ")}`);
  } catch (err) {
    log("❌", `Test exception: ${err.message}`);
    results.push({ testId: "EXCEPTION", status: "FAIL", detail: err.message });
  }

  await browser.close();

  const report = {
    testSuite: "URL Routing Convention (with auth)",
    runId: RUN_ID,
    timestamp: new Date().toISOString(),
    convention: {
      auth: "https://reborn.vn/authenticator/*",
      business: "https://biz.reborn.vn/<service>/*",
      org: "https://biz.reborn.vn/org/*",
    },
    totalApiCalls: apiCalls.length,
    uniqueUrls: [...new Set(apiCalls.map((c) => c.url.split("?")[0]))],
    breakdown: {
      authReborn: apiCalls.filter((c) => c.url.startsWith("https://reborn.vn/authenticator/")).length,
      bizReborn: apiCalls.filter((c) => c.url.startsWith("https://biz.reborn.vn/")).length,
      cloudReborn: apiCalls.filter((c) => c.url.startsWith("https://cloud.reborn.vn/")).length,
      legacyAdmin: apiCalls.filter((c) => c.url.includes("/adminapi/")).length,
      ssoLocal: apiCalls.filter((c) => c.url.startsWith("http://localhost:8080")).length,
    },
    total: results.length,
    passed: results.filter((r) => r.status === "PASS").length,
    failed: results.filter((r) => r.status === "FAIL").length,
    results,
  };

  const reportPath = path.join(REPORTS_DIR, `url-routing-with-auth-${RUN_ID}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("");
  console.log("═══════════════════════════════════════");
  console.log(`Total assertions: ${report.total}`);
  console.log(`Passed:           ${report.passed}`);
  console.log(`Failed:           ${report.failed}`);
  console.log(`Report: ${reportPath}`);
  console.log("═══════════════════════════════════════");

  process.exit(report.failed > 0 ? 1 : 0);
})();
