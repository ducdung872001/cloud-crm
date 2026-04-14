// Capture all screenshots for Part 02 — Lễ tân (4 modules)
const { launch, ensureLoggedIn, dismissModals, pickRoleIfAsked, shot, BASE_URL } = require("./session");
const path = require("path");
const fs = require("fs");

const OUT = "images/part-02-le-tan";
fs.mkdirSync(path.resolve(__dirname, "..", OUT), { recursive: true });

async function gotoSafe(page, url) {
  await page.goto(url, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await pickRoleIfAsked(page);
  await dismissModals(page);
  await page.waitForTimeout(800);
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);

    // ═══════════════════════════════════════════
    // A. QUẢN LÝ CA LÀM VIỆC
    // ═══════════════════════════════════════════
    console.log("\n=== A. Quản lý ca ===");
    await gotoSafe(page, BASE_URL + "/shift_management");
    await shot(page, `${OUT}/A01-shift-landing.png`);
    await shot(page, `${OUT}/A02-shift-fullpage.png`, { fullPage: true });

    // Try to click "Nhập theo mệnh giá" mode
    const denomBtn = page.locator("text=/Nhập theo mệnh giá/i").first();
    if (await denomBtn.count().catch(() => 0)) {
      await denomBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
      await shot(page, `${OUT}/A03-shift-denom-mode.png`);
      await shot(page, `${OUT}/A03b-shift-denom-fullpage.png`, { fullPage: true });

      // Switch back to total mode
      const totalBtn = page.locator("text=/Nhập tổng tiền/i").first();
      if (await totalBtn.count().catch(() => 0)) {
        await totalBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(600);
      }
    }

    // Fill a sample amount to show the filled state
    const cashInput = page.locator('input[inputmode="numeric"], input[placeholder="0"]').first();
    if (await cashInput.count().catch(() => 0)) {
      await cashInput.fill("2000000").catch(() => {});
      await page.waitForTimeout(500);
      await shot(page, `${OUT}/A04-shift-total-filled.png`);
    }

    // ═══════════════════════════════════════════
    // B. BÁN HÀNG TẠI QUẦY
    // ═══════════════════════════════════════════
    console.log("\n=== B. Bán hàng tại quầy ===");
    await gotoSafe(page, BASE_URL + "/create_sale_add");
    await shot(page, `${OUT}/B01-sale-main-empty.png`);
    await shot(page, `${OUT}/B02-sale-main-fullpage.png`, { fullPage: true });

    // Open customer selector
    const custSelect = page.locator('.form-group').filter({ hasText: /Họ tên/i }).locator('.select-custom, [class*="select"]').first();
    await custSelect.click({ force: true, timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await shot(page, `${OUT}/B03-sale-customer-dropdown.png`);
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(400);

    // Focus customer search
    const custInput = page.locator('#nameCustomer, input[placeholder*="Chọn khách"]').first();
    if (await custInput.count().catch(() => 0)) {
      await custInput.click({ force: true }).catch(() => {});
      await page.waitForTimeout(600);
      await page.keyboard.type("Ngu", { delay: 80 }).catch(() => {});
      await page.waitForTimeout(1500);
      await shot(page, `${OUT}/B04-sale-customer-search.png`);
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(400);
    }

    // Tab "Thẻ dịch vụ"
    const tabCard = page.locator("text=/Danh sách thẻ dịch vụ cần bán/i").first();
    if (await tabCard.count().catch(() => 0)) {
      await tabCard.click({ force: true }).catch(() => {});
      await page.waitForTimeout(700);
      await shot(page, `${OUT}/B05-sale-tab-card.png`);
      // back to service/product tab
      const tabSvc = page.locator("text=/Danh sách dịch vụ\\/sản phẩm/i").first();
      if (await tabSvc.count().catch(() => 0)) {
        await tabSvc.click({ force: true }).catch(() => {});
        await page.waitForTimeout(600);
      }
    }

    // ═══════════════════════════════════════════
    // C. CHECK-IN / CỬA VÀO
    // ═══════════════════════════════════════════
    console.log("\n=== C. Check-in ===");
    await gotoSafe(page, BASE_URL + "/ch_checkin");
    await shot(page, `${OUT}/C01-checkin-main.png`);
    await shot(page, `${OUT}/C02-checkin-fullpage.png`, { fullPage: true });

    // Click to simulate scan (opens popup)
    const scanner = page.locator(".scanner-animation, .scanner-circle").first();
    if (await scanner.count().catch(() => 0)) {
      await scanner.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1000);
      await shot(page, `${OUT}/C03-checkin-popup.png`);
      await shot(page, `${OUT}/C03b-checkin-popup-fullpage.png`, { fullPage: true });
      // close popup
      const closeBtn = page.locator(".popup-close, button:has-text('Hủy')").first();
      if (await closeBtn.count().catch(() => 0)) {
        await closeBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
      } else {
        await page.keyboard.press("Escape").catch(() => {});
      }
    }

    // Manual search
    const manualInput = page.locator(".scanner-manual input, input[placeholder*='Tên, SĐT']").first();
    if (await manualInput.count().catch(() => 0)) {
      await manualInput.click({ force: true }).catch(() => {});
      await manualInput.fill("0912345678").catch(() => {});
      await page.waitForTimeout(400);
      await shot(page, `${OUT}/C04-checkin-manual-search.png`);
    }

    // ═══════════════════════════════════════════
    // D. TRỪ QUOTA DỊCH VỤ
    // ═══════════════════════════════════════════
    console.log("\n=== D. Trừ quota ===");
    await gotoSafe(page, BASE_URL + "/ch_services");
    await shot(page, `${OUT}/D01-svc-landing.png`);
    await shot(page, `${OUT}/D01b-svc-fullpage.png`, { fullPage: true });

    // Tab "Trừ quota"
    const tabDeduct = page.locator("button:has-text('Trừ quota')").first();
    if (await tabDeduct.count().catch(() => 0)) {
      await tabDeduct.click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
      await shot(page, `${OUT}/D02-svc-deduct.png`);
      await shot(page, `${OUT}/D02b-svc-deduct-fullpage.png`, { fullPage: true });
    }

    // Tab "Đặt lịch"
    const tabBook = page.locator("button:has-text('Đặt lịch')").first();
    if (await tabBook.count().catch(() => 0)) {
      await tabBook.click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
      await shot(page, `${OUT}/D03-svc-booking.png`);
      await shot(page, `${OUT}/D03b-svc-booking-fullpage.png`, { fullPage: true });
    }

    // Back to sell-card tab and capture member search + plan selection
    const tabSellCard = page.locator("button:has-text('Bán thẻ thành viên')").first();
    if (await tabSellCard.count().catch(() => 0)) {
      await tabSellCard.click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
      await shot(page, `${OUT}/D04-svc-sell-card.png`);

      // Fill member search + click find
      const mInput = page.locator('input[placeholder*="Tìm tên"]').first();
      if (await mInput.count().catch(() => 0)) {
        await mInput.fill("0912345678").catch(() => {});
        await page.waitForTimeout(300);
        const findBtn = page.locator('button:has-text("Tìm")').first();
        await findBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(800);
        await shot(page, `${OUT}/D05-svc-member-selected.png`);
      }

      // Select a plan (first plan card)
      const firstPlan = page.locator(".plan-card").first();
      if (await firstPlan.count().catch(() => 0)) {
        await firstPlan.click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
        await shot(page, `${OUT}/D06-svc-plan-selected.png`, { fullPage: true });
      }
    }

    console.log("\nALL PART-02 SHOTS CAPTURED");
  } catch (e) {
    console.error("ERR:", e.message, e.stack);
    await shot(page, `${OUT}/_err.png`).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
