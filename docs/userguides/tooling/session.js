const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "http://localhost:4000/crm";
const USERNAME = process.env.CRM_USER || "0971234599";
const PASSWORD = process.env.CRM_PASS || "Reborn@12345";
const STORAGE = path.resolve(__dirname, "auth.json");
const DEFAULT_ROLE = "Ban giám đốc";

async function launch({ headless = true, viewport = { width: 1680, height: 1000 } } = {}) {
  const browser = await chromium.launch({ headless });
  const ctxOpts = { viewport, deviceScaleFactor: 1, locale: "vi-VN" };
  if (fs.existsSync(STORAGE)) ctxOpts.storageState = STORAGE;
  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();
  return { browser, context, page };
}

async function dismissModals(page) {
  for (const t of ["Để sau", "Bỏ qua", "Đóng", "Skip", "Tôi đã hiểu"]) {
    const b = page.getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") });
    if (await b.count().catch(() => 0)) {
      await b.first().click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(350);
    }
  }
  await page.keyboard.press("Escape").catch(() => {});
}

async function pickRoleIfAsked(page) {
  // If a role-selection modal is shown, always pick "Ban giám đốc"
  const role = page.getByText(new RegExp(DEFAULT_ROLE, "i")).first();
  if (await role.count().catch(() => 0)) {
    const visible = await role.isVisible().catch(() => false);
    if (visible) {
      await role.click({ force: true, timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(400);
      // confirm button if present
      for (const t of ["Xác nhận", "Tiếp tục", "Đồng ý", "Chọn", "OK"]) {
        const b = page.getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") });
        if (await b.count().catch(() => 0)) {
          await b.first().click({ timeout: 1200 }).catch(() => {});
          await page.waitForTimeout(500);
          break;
        }
      }
    }
  }
}

async function ensureLoggedIn(page, context) {
  await page.goto(BASE_URL + "/", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // Check if redirected to SSO / login
  const needsLogin = (await page.locator('input[type="password"]').count().catch(() => 0)) > 0;
  if (needsLogin) {
    console.log("[session] logging in…");
    await page.getByPlaceholder(/email|số điện thoại|id/i).first().fill(USERNAME);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.getByRole("button", { name: /đăng nhập|login/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
  } else {
    console.log("[session] already logged in");
  }
  // Role modal may appear after first login OR on fresh session
  await pickRoleIfAsked(page);
  await dismissModals(page);
  // Always save current state
  await context.storageState({ path: STORAGE });
}

async function shot(page, outPath, opts = {}) {
  const abs = path.resolve(__dirname, "..", outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  await page.screenshot({ path: abs, fullPage: !!opts.fullPage, clip: opts.clip });
  console.log("[shot]", path.relative(path.resolve(__dirname, ".."), abs));
  return abs;
}

module.exports = { launch, ensureLoggedIn, shot, dismissModals, pickRoleIfAsked, BASE_URL };
