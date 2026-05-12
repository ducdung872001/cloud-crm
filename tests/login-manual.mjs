/**
 * login-manual.mjs — mở browser headed, để bạn LOGIN TAY (Google/AppHub/SSO password gì cũng được).
 *
 * Sau khi bạn vào được dashboard, script tự detect localStorage.permissions có giá trị → lưu state.
 * Nếu cần, gõ Ctrl+C để hủy.
 *
 * Usage: node tests/login-manual.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, ".auth-state.json");

console.log(`\n🔐 LOGIN TAY — base ${CONFIG.BASE_URL}`);
console.log(`Mở browser → login bằng tài khoản của bạn → script tự lưu state khi dashboard load xong.\n`);

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: CONFIG.VIEWPORT,
  extraHTTPHeaders: { Hostname: "kcn.reborn.vn" },
});
const page = await context.newPage();
await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: "domcontentloaded" });
console.log("→ Vui lòng login trong cửa sổ browser vừa mở. Chờ tối đa 4 phút...");

try {
  await page.waitForFunction(
    () => {
      const perms = localStorage.getItem("permissions");
      const url = location.href;
      // Đã có permissions + đã rời /login → coi như login xong
      return perms && perms !== "null" && !url.includes("/crm/login");
    },
    null,
    { timeout: 240000, polling: 1500 },
  );
  console.log(`✓ Login OK — url=${page.url()}`);

  // Mark onboarding tours done
  await page.evaluate(() => {
    const uid = JSON.parse(localStorage.getItem("user.root") || "0") || 0;
    const tours = ["login", "shift", "pos", "barcode_print"];
    const now = new Date().toISOString();
    tours.forEach((t) => {
      localStorage.setItem(`reborn_onboarding_${uid}_${t}`, now);
      localStorage.setItem(`reborn_onboarding_0_${t}`, now);
    });
  });

  await context.storageState({ path: STATE_PATH });
  console.log(`✅ Đã lưu storageState → ${STATE_PATH}`);
  console.log(`Bây giờ chạy: node tests/fitpro-e2e/capture-all.mjs`);
} catch (e) {
  console.log(`❌ Timeout chờ login: ${e.message}`);
  console.log(`URL hiện tại: ${page.url()}`);
} finally {
  await page.waitForTimeout(2000);
  await browser.close();
}
