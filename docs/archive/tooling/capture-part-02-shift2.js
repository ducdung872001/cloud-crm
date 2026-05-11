// Shift tabs are <li> in .menu-list; click each
const { launch, ensureLoggedIn, pickRoleIfAsked, shot, BASE_URL } = require("./session");

async function closeAllModals(page) {
  for (let i = 0; i < 5; i++) {
    let clicked = false;
    for (const t of ["Tôi đã hiểu", "Đã hiểu", "Bỏ qua", "Để sau", "Skip", "Đóng", "Hoàn tất"]) {
      const b = page.getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") });
      const cnt = await b.count().catch(() => 0);
      if (cnt > 0 && (await b.first().isVisible().catch(() => false))) {
        await b.first().click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(450);
        clicked = true;
      }
    }
    if (!clicked) break;
  }
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
}

async function clickShiftTab(page, label) {
  const li = page.locator(".menu-list li").filter({ hasText: label });
  if ((await li.count().catch(() => 0)) > 0) {
    await li.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(1500);
    await closeAllModals(page);
    return true;
  }
  return false;
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);
    await page.goto(BASE_URL + "/shift_management", { timeout: 60000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3500);
    await pickRoleIfAsked(page);
    await closeAllModals(page);
    await page.waitForTimeout(1000);

    const tabs = [
      { label: "Chưa vào ca", slug: "A10-preopen" },
      { label: "Vào ca", slug: "A11-open" },
      { label: "Đang ca", slug: "A12-onshift" },
      { label: "Đơn trong ca", slug: "A13-orders" },
      { label: "Đóng ca", slug: "A14-close" },
      { label: "Báo cáo kết ca", slug: "A15-report" },
      { label: "Báo cáo tổng quan", slug: "A16-overview" },
    ];

    for (const t of tabs) {
      const ok = await clickShiftTab(page, t.label);
      if (!ok) { console.log(`[skip] tab "${t.label}" not found`); continue; }
      await page.waitForTimeout(700);
      await shot(page, `images/part-02-le-tan/${t.slug}.png`);
      await shot(page, `images/part-02-le-tan/${t.slug}-fullpage.png`, { fullPage: true });
    }

    // Try to capture "Vào ca" in both modes (nhập tổng vs mệnh giá)
    await clickShiftTab(page, "Vào ca");
    await page.waitForTimeout(800);
    // Might need to click "Mở ca này" from preopen first; try directly first
    const denomBtn = page.locator("text=/Nhập theo mệnh giá/i").first();
    if ((await denomBtn.count().catch(() => 0)) > 0) {
      await denomBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(700);
      await shot(page, "images/part-02-le-tan/A11b-open-denom-mode.png");
      await shot(page, "images/part-02-le-tan/A11b-open-denom-fullpage.png", { fullPage: true });

      const totalBtn = page.locator("text=/Nhập tổng tiền/i").first();
      await totalBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
      const cashInput = page.locator('input[inputmode="numeric"]').first();
      if ((await cashInput.count().catch(() => 0)) > 0) {
        await cashInput.fill("2000000").catch(() => {});
        await page.waitForTimeout(500);
        await shot(page, "images/part-02-le-tan/A11c-open-total-filled.png");
      }
    }

    console.log("SHIFT CAPTURES DONE");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await browser.close();
  }
})();
