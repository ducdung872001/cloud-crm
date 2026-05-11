// Capture extra screenshots for CounterSales (POS) page
const { launch, ensureLoggedIn, pickRoleIfAsked, shot, BASE_URL } = require("./session");

async function closeAllModals(page) {
  for (let i = 0; i < 5; i++) {
    let clicked = false;
    for (const t of ["Tôi đã hiểu", "Đã hiểu", "Bỏ qua", "Để sau", "Skip", "Đóng", "Hoàn tất"]) {
      const b = page.getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") });
      if ((await b.count().catch(() => 0)) > 0 && (await b.first().isVisible().catch(() => false))) {
        await b.first().click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(450);
        clicked = true;
      }
    }
    if (!clicked) break;
  }
  await page.waitForTimeout(200);
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);
    await page.goto(BASE_URL + "/create_sale_add", { timeout: 60000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await pickRoleIfAsked(page);
    await closeAllModals(page);
    await page.waitForTimeout(800);

    // Main view
    await shot(page, "images/part-02-le-tan/B01-sale-main-empty.png");
    await shot(page, "images/part-02-le-tan/B02-sale-main-fullpage.png", { fullPage: true });

    // Click on first product card to add to cart
    const firstProduct = page.locator(".product-card, [class*='product-card'], [class*='ProductGrid'] > div > div").first();
    if ((await firstProduct.count().catch(() => 0)) > 0) {
      await firstProduct.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
      await closeAllModals(page);
      await shot(page, "images/part-02-le-tan/B10-sale-product-clicked.png");
      // If a variant modal opened, capture it
      const variantModal = page.locator(".modal.show, [class*='variant-modal']").first();
      if ((await variantModal.count().catch(() => 0)) > 0 && (await variantModal.isVisible().catch(() => false))) {
        await shot(page, "images/part-02-le-tan/B11-variant-modal.png");
        // Find and click "Thêm vào giỏ" or confirm
        const addBtn = page.locator('button:has-text("Thêm vào giỏ"), button:has-text("Chọn")').first();
        if ((await addBtn.count().catch(() => 0)) > 0) {
          await addBtn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(800);
        }
        await page.keyboard.press("Escape").catch(() => {});
        await page.waitForTimeout(400);
      }
    }

    // Cart with item captured
    await shot(page, "images/part-02-le-tan/B12-cart-with-item.png");

    // Quick add button (⚡)
    const quickAddBtn = page.locator('button:has-text("Thêm nhanh"), button:has-text("⚡"), [title*="Thêm nhanh"]').first();
    if ((await quickAddBtn.count().catch(() => 0)) > 0) {
      await quickAddBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1000);
      await shot(page, "images/part-02-le-tan/B13-quickadd-modal-empty.png");
      // Fill values
      const nameInput = page.locator('.qam-input[type="text"], input[placeholder*="Phí lắp đặt"]').first();
      if ((await nameInput.count().catch(() => 0)) > 0) {
        await nameInput.fill("Phí bảo trì máy").catch(() => {});
        await page.waitForTimeout(300);
        const priceInput = page.locator('input[placeholder="0"]').first();
        await priceInput.fill("250000").catch(() => {});
        await page.waitForTimeout(500);
        await shot(page, "images/part-02-le-tan/B14-quickadd-modal-filled.png");
      }
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(400);
    }

    // Customer picker
    const custBtn = page.locator('button:has-text("Chọn thành viên"), button:has-text("Thành viên"), [class*="cart-customer"] button').first();
    if ((await custBtn.count().catch(() => 0)) > 0) {
      await custBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1000);
      await shot(page, "images/part-02-le-tan/B15-customer-modal.png");
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(400);
    }

    // Pay button
    const payBtn = page.locator('button:has-text("Thanh toán"), button:has-text("Pay")').first();
    if ((await payBtn.count().catch(() => 0)) > 0) {
      await payBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1200);
      await shot(page, "images/part-02-le-tan/B16-pay-modal.png");
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(400);
    }

    // Topbar tabs: POS, Draft, Orders, Report
    const tabList = [
      { label: "Đơn tạm", slug: "B17-tab-draft" },
      { label: "Đơn hàng", slug: "B18-tab-orders" },
      { label: "Báo cáo", slug: "B19-tab-report" },
    ];
    for (const t of tabList) {
      const tab = page.locator(`text="${t.label}"`).first();
      if ((await tab.count().catch(() => 0)) > 0) {
        await tab.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1500);
        await closeAllModals(page);
        await shot(page, `images/part-02-le-tan/${t.slug}.png`);
      }
    }

    console.log("SALE CAPTURES DONE");
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, "images/part-02-le-tan/_sale-err.png").catch(() => {});
  } finally {
    await browser.close();
  }
})();
