// Capture all screenshots for Part 01 — Bắt đầu
const { launch, ensureLoggedIn, dismissModals, pickRoleIfAsked, shot, BASE_URL } = require("./session");
const path = require("path");
const fs = require("fs");

const OUT = "images/part-01-bat-dau";

(async () => {
  // ---------- Phase 1: logged-out capture for login screenshots ----------
  // We need to force-logout temporarily to capture the login screen.
  // Strategy: launch a SEPARATE context without auth.json.
  const { chromium } = require("playwright");
  const logoutBrowser = await chromium.launch({ headless: true });
  const logoutCtx = await logoutBrowser.newContext({ viewport: { width: 1680, height: 1000 }, locale: "vi-VN" });
  const loPage = await logoutCtx.newPage();
  try {
    await loPage.goto(BASE_URL + "/", { timeout: 60000 }).catch(() => {});
    await loPage.waitForSelector('input[type="password"]', { timeout: 30000 });
    await loPage.waitForTimeout(1200);
    await shot(loPage, `${OUT}/01-login-empty.png`);

    await loPage.getByPlaceholder(/email|số điện thoại|id/i).first().fill("0971234599");
    await loPage.locator('input[type="password"]').first().fill("Reborn@12345");
    await loPage.waitForTimeout(500);
    await shot(loPage, `${OUT}/02-login-filled.png`);

    console.log("[phase1] login screens captured");
  } catch (e) {
    console.error("PHASE1 ERR:", e.message);
    await shot(loPage, `${OUT}/_phase1-err.png`).catch(() => {});
  } finally {
    await logoutBrowser.close();
  }

  // ---------- Phase 2: logged-in capture using persistent auth.json ----------
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context); // uses/creates auth.json

    // Go to dashboard
    await page.goto(BASE_URL + "/dashboard", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(3500);
    await pickRoleIfAsked(page);
    await dismissModals(page);
    await page.waitForTimeout(1500);

    // 3) Dashboard viewport
    await shot(page, `${OUT}/03-dashboard-overview.png`);

    // 4) Dashboard full page
    await shot(page, `${OUT}/04-dashboard-fullpage.png`, { fullPage: true });

    // 5) Header clip
    await shot(page, `${OUT}/05-header.png`, { clip: { x: 0, y: 0, width: 1680, height: 72 } });

    // 6) Sidebar clip (default state on dashboard)
    await shot(page, `${OUT}/06-sidebar.png`, { clip: { x: 0, y: 0, width: 260, height: 1000 } });

    // 7) User menu — try clicking avatar area in header right
    const userBtn = page.locator("header *, .header *, .app-header *").filter({ hasText: /Hòa|Phan|Dũng|admin/i }).first();
    let userMenuOpened = false;
    if (await userBtn.count().catch(() => 0)) {
      await userBtn.click({ force: true, timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(800);
      await shot(page, `${OUT}/07-user-menu.png`);
      userMenuOpened = true;
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(400);
    } else {
      console.log("[skip] user menu button not found");
    }

    // 8) Language switcher
    const langBtn = page.locator("text=/Tiếng Việt|English/i").first();
    if (await langBtn.count().catch(() => 0)) {
      await langBtn.click({ force: true, timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(700);
      await shot(page, `${OUT}/08-language-switcher.png`);
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(400);
    }

    // 9) Sidebar while on 'Bán hàng tại quầy' (shows active state in group)
    await page.goto(BASE_URL + "/create_sale_add", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await dismissModals(page);
    await shot(page, `${OUT}/09-sidebar-active.png`, { clip: { x: 0, y: 0, width: 260, height: 1000 } });

    // 10) A full overview of the app with sidebar + content
    await page.goto(BASE_URL + "/dashboard", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await dismissModals(page);
    await shot(page, `${OUT}/10-dashboard-final.png`);

    console.log("ALL PART-01 SHOTS CAPTURED");
  } catch (e) {
    console.error("PHASE2 ERR:", e.message);
    await shot(page, `${OUT}/_phase2-err.png`).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
