const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "http://localhost:4000/crm";
const USERNAME = process.env.CRM_USER || "0971234599";
const PASSWORD = process.env.CRM_PASS || "Reborn@12345";
const STORAGE = path.resolve(__dirname, "auth.json");

async function launch({ headless = true, viewport = { width: 1440, height: 900 } } = {}) {
  const browser = await chromium.launch({ headless });
  const ctxOpts = { viewport, deviceScaleFactor: 1, locale: "vi-VN" };
  if (fs.existsSync(STORAGE)) ctxOpts.storageState = STORAGE;
  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();
  return { browser, context, page };
}

async function ensureLoggedIn(page, context) {
  await page.goto(BASE_URL + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const url = page.url();
  if (/login|authenticat/i.test(url) || (await page.locator('input[type="password"]').count()) > 0) {
    console.log("[session] logging in…");
    const userInput = page.locator('input').filter({ hasNot: page.locator('[type="password"]') }).first();
    await userInput.fill(USERNAME);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    const loginBtn = page.locator('button').filter({ hasText: /đăng nhập|login/i }).first();
    await loginBtn.click();
    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await context.storageState({ path: STORAGE });
    console.log("[session] login complete, session saved");
  } else {
    console.log("[session] already logged in");
  }
}

async function shot(page, outPath, opts = {}) {
  const abs = path.resolve(__dirname, "..", outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  await page.screenshot({ path: abs, fullPage: !!opts.fullPage });
  console.log("[shot]", path.relative(path.resolve(__dirname, ".."), abs));
  return abs;
}

module.exports = { launch, ensureLoggedIn, shot, BASE_URL };
