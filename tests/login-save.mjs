/**
 * login-save.mjs — đăng nhập 1 lần, lưu storageState để tất cả test scripts dùng chung.
 *
 * Flow: truy cập /crm/login → SSO redirect → fill credentials → app redirect về /crm/*
 *       → App.tsx tự pick role "Ban giám đốc" (đã sửa tạm) → lưu cookies + localStorage.
 *
 * Usage:  node tests/login-save.mjs
 * Output: tests/.auth-state.json  (dùng bởi helpers.mjs + các test scripts)
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, ".auth-state.json");

const APP_URL = CONFIG.BASE_URL; // http://localhost:4000/crm
const USER = CONFIG.USERNAME;
const PASS = CONFIG.PASSWORD;

console.log(`[login] BASE_URL=${APP_URL}  user=${USER}`);

const browser = await chromium.launch({ headless: CONFIG.HEADLESS });
const context = await browser.newContext({ viewport: CONFIG.VIEWPORT });
const page = await context.newPage();

try {
  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });

  // chờ redirect sang SSO
  await page.waitForURL(/localhost:8080|sso\./, { timeout: 15000 });
  console.log("[login] đã chuyển sang SSO:", page.url());

  // điền form SSO (placeholder VI)
  await page.locator('input[placeholder*="email"], input[placeholder*="số điện thoại"]').first().fill(USER);
  await page.locator('input[type="password"]').first().fill(PASS);
  await page.getByRole("button", { name: /đăng nhập/i }).first().click();

  // chờ quay lại app
  await page.waitForURL(/localhost:4000\/crm/, { timeout: 20000 });
  console.log("[login] đã redirect về app:", page.url());

  // chờ app xử lý token, gọi /user/me, takeRoles, auto-pick role
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  // đợi thêm cho chắc role được set vào localStorage
  await page.waitForFunction(() => !!localStorage.getItem("permissions"), null, { timeout: 20000 });
  const selectedRole = await page.evaluate(() => localStorage.getItem("SelectedRole"));
  console.log("[login] SelectedRole =", selectedRole);

  if (!selectedRole) {
    console.warn("[login] ⚠ Chưa có SelectedRole. Nếu user chỉ có 1 role, bỏ qua. Nếu > 1 role, kiểm tra auto-pick.");
  }

  // Mark all onboarding tours as done để tránh welcome tour chặn UI test
  const markedTours = await page.evaluate(() => {
    const uid = JSON.parse(localStorage.getItem("user.root") || "0") || 0;
    const tours = ["login", "shift", "pos", "barcode_print"];
    const now = new Date().toISOString();
    tours.forEach((t) => {
      localStorage.setItem(`reborn_onboarding_${uid}_${t}`, now);
      // cũng set cho uid=0 phòng khi user.root trống
      localStorage.setItem(`reborn_onboarding_0_${t}`, now);
    });
    return { uid, tours };
  });
  console.log(`[login] Đã mark onboarding tours done (uid=${markedTours.uid}):`, markedTours.tours.join(", "));

  // save storage state
  await context.storageState({ path: STATE_PATH });
  console.log(`[login] ✅ Đã lưu storageState → ${STATE_PATH}`);
} catch (err) {
  console.error("[login] ❌ Thất bại:", err.message);
  await page.screenshot({ path: path.join(__dirname, "screenshots", "login-failed.png") }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
