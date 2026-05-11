#!/usr/bin/env node
/**
 * Smoke test: 4 tab UI mới trong /setting_loyalty
 *   - Earn rule nâng cao (BPM)
 *   - Thông báo gửi KH
 *   - API Key & Webhook
 *   - Audit Log
 *
 * Reuses saved cookies từ tests/.auth-cookies.json (chạy login-save.mjs trước nếu chưa có).
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
const COOKIE_FILE = path.join(__dirname, ".auth-cookies.json");
fs.mkdirSync(REPORTS_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

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
  console.log("Smoke test 4 tab UI mới trong /setting_loyalty");

  if (!fs.existsSync(COOKIE_FILE)) {
    console.error("❌ Không tìm thấy", COOKIE_FILE, "— chạy: node tests/login-save.mjs trước");
    process.exit(1);
  }
  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, "utf8"));

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);

  page.on("pageerror", (err) => {
    console.log("[pageerror]", err.message.substring(0, 200));
  });

  try {
    // Direct nav with cookies
    log("📍", "Nav to /setting_loyalty (with saved auth)");
    await page.goto(`${CONFIG.BASE_URL}/setting_loyalty`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);

    // Set SelectedRole if not set
    await page.evaluate(() => {
      if (!localStorage.getItem("SelectedRole")) localStorage.setItem("SelectedRole", "1");
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);

    // Wait for content
    await page.waitForSelector("text=Cấu hình Loyalty", { timeout: 15000 }).catch(() => {});

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `new-tabs-${RUN_ID}-00-overview.png`),
      fullPage: true,
    });

    // Check 4 new tabs
    const tabsExpected = [
      "Earn rule nâng cao (BPM)",
      "Thông báo gửi KH",
      "API Key & Webhook",
      "Audit Log",
    ];

    for (const tabName of tabsExpected) {
      const found = await page.getByText(tabName, { exact: false }).count();
      assert(`TAB-VISIBLE-${tabName.slice(0, 12)}`, found > 0, `Tab "${tabName}" (${found} matches)`);
    }

    // Click each tab and verify content
    const tabTests = [
      {
        name: "Earn rule nâng cao (BPM)",
        verify: ["Loyalty Quest", "BPM Engine", "Active process"],
        screenshot: "01-bpm",
      },
      {
        name: "Thông báo gửi KH",
        verify: ["Loại thông báo", "Preview", "Variables"],
        screenshot: "02-notification",
      },
      {
        name: "API Key & Webhook",
        verify: ["API Keys", "Webhooks", "Dead Letter"],
        screenshot: "03-apikey",
      },
      {
        name: "Audit Log",
        verify: ["Critical actions", "append-only", "Export CSV"],
        screenshot: "04-audit",
      },
    ];

    for (const t of tabTests) {
      log("🔹", `Open: ${t.name}`);
      try {
        const card = page.getByText(t.name, { exact: false }).first();
        await card.click({ timeout: 5000 });
        await page.waitForTimeout(3000);
      } catch (e) {
        log("⚠️", `Click error: ${e.message.substring(0, 100)}`);
      }

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `new-tabs-${RUN_ID}-${t.screenshot}.png`),
        fullPage: true,
      });

      for (const keyword of t.verify) {
        const found = await page.getByText(keyword, { exact: false }).count();
        assert(`CONTENT-${t.screenshot}-${keyword.slice(0, 10)}`, found > 0, `"${keyword}" (${found}x)`);
      }

      // Back to settings overview
      const backBtn = page.locator('button:has-text("Cấu hình Loyalty"), button:has-text("Quay lại")').first();
      if ((await backBtn.count()) > 0) {
        await backBtn.click().catch(() => {});
        await page.waitForTimeout(2000);
      } else {
        await page.goto(`${CONFIG.BASE_URL}/setting_loyalty`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(3000);
      }
    }
  } catch (err) {
    log("❌", `Exception: ${err.message}`);
    results.push({ testId: "EXCEPTION", status: "FAIL", detail: err.message });
  }

  await browser.close();

  const report = {
    suite: "New Loyalty UI Tabs",
    runId: RUN_ID,
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter((r) => r.status === "PASS").length,
    failed: results.filter((r) => r.status === "FAIL").length,
    results,
  };
  const reportPath = path.join(REPORTS_DIR, `new-loyalty-ui-tabs-${RUN_ID}.json`);
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
