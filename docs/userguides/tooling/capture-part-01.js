// Capture all screenshots for Part 01 — Bắt đầu
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = "http://localhost:4000/crm";
const USERNAME = "0971234599";
const PASSWORD = "Reborn@12345";
const OUT_DIR = path.resolve(__dirname, "..", "images/part-01-bat-dau");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function shot(page, name, opts = {}) {
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage: !!opts.fullPage, clip: opts.clip });
  console.log("[shot]", name);
}

async function dismissModals(page) {
  for (const t of ["Để sau", "Bỏ qua", "Đóng", "Skip"]) {
    const b = page.getByRole("button", { name: new RegExp(t, "i") });
    if (await b.count()) { await b.first().click().catch(() => {}); await page.waitForTimeout(400); }
  }
  await page.keyboard.press("Escape").catch(() => {});
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1680, height: 1000 }, locale: "vi-VN" });
  const page = await context.newPage();

  try {
    // 1) Empty login page
    await page.goto(BASE_URL + "/login", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await shot(page, "01-login-empty.png");

    // 2) Login filled
    const userInput = page.locator("input").filter({ hasNot: page.locator('[type="password"]') }).first();
    await userInput.fill(USERNAME);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.waitForTimeout(500);
    await shot(page, "02-login-filled.png");

    // 3) Click login
    await page.getByRole("button", { name: /đăng nhập/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await context.storageState({ path: path.resolve(__dirname, "auth.json") });

    // 4) Dashboard clean
    await page.goto(BASE_URL + "/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await dismissModals(page);
    await page.waitForTimeout(1500);
    await shot(page, "03-dashboard-overview.png");

    // 5) Full-page dashboard
    await shot(page, "04-dashboard-fullpage.png", { fullPage: true });

    // 6) Header zoom (top 70px)
    await shot(page, "05-header.png", { clip: { x: 0, y: 0, width: 1680, height: 75 } });

    // 7) Sidebar only (left 230px — assuming full width; fallback to 80px if collapsed)
    // First figure out actual sidebar width
    const sbBox = await page.locator(".sidebar, #sidebar, aside").first().boundingBox().catch(() => null);
    const sbW = sbBox ? Math.ceil(sbBox.width) : 230;
    await shot(page, "06-sidebar-collapsed.png", { clip: { x: 0, y: 0, width: sbW + 10, height: 900 } });

    // 8) User menu: click avatar area (top-right)
    const userArea = page.locator("header, .header, .app-header").first();
    const avatar = page.locator("img, .avatar, [class*='avatar']").last();
    await avatar.click({ force: true }).catch(() => {});
    await page.waitForTimeout(800);
    await shot(page, "07-user-menu.png");
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(400);

    // 9) Language switcher — click the "Tiếng Việt" button
    const langBtn = page.getByText(/tiếng việt|english/i).first();
    if (await langBtn.count()) {
      await langBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(600);
      await shot(page, "08-language-switcher.png");
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(400);
    }

    // 10) Hover over each top-level sidebar item to expand submenu, capture one combined sidebar-expanded view
    // Use keyboard navigation isn't reliable; instead just take sidebar with "hover" by clicking a group that has submenu indicator
    // Capture sidebar expanded by going to a page under each group in turn; we'll just take a second sidebar shot after navigating away
    await page.goto(BASE_URL + "/create_sale_add", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    await dismissModals(page);
    await shot(page, "09-sidebar-active-state.png", { clip: { x: 0, y: 0, width: 240, height: 900 } });

    console.log("ALL PART-01 SHOTS CAPTURED");
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, "_err.png").catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
