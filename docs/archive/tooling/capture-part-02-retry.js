// Retry captures for Part 02 that failed/were blocked in first pass
const { launch, ensureLoggedIn, dismissModals, pickRoleIfAsked, shot, BASE_URL } = require("./session");
const path = require("path");

const OUT = "images/part-02-le-tan";

async function closeOnboardingModals(page) {
  // HDSD / onboarding modals: "Tôi đã hiểu", "Tiếp theo", "Bỏ qua", "Để sau", "Đóng"
  for (let i = 0; i < 6; i++) {
    let clicked = false;
    for (const t of ["Tôi đã hiểu", "Đã hiểu", "Để sau", "Bỏ qua", "Skip", "Đóng", "Tiếp theo"]) {
      const b = page.getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") });
      if (await b.count().catch(() => 0)) {
        await b.first().click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(400);
        clicked = true;
      }
    }
    if (!clicked) break;
  }
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
}

async function gotoSafe(page, url) {
  await page.goto(url, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await pickRoleIfAsked(page);
  await closeOnboardingModals(page);
  await page.waitForTimeout(600);
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);

    // ═══════════════════════════════════════════
    // A. QUẢN LÝ CA — full tour
    // ═══════════════════════════════════════════
    console.log("\n=== A. Shift ===");
    await gotoSafe(page, BASE_URL + "/shift_management");
    await closeOnboardingModals(page);
    await page.waitForTimeout(800);
    await shot(page, `${OUT}/A01-shift-landing.png`);
    await shot(page, `${OUT}/A02-shift-fullpage.png`, { fullPage: true });

    // Walk through tabs on shift page
    // Tabs: "Đang mở ca", "Kết toán ca", "Đóng ca", "Báo cáo phân tích trong ca", "Báo cáo thống kê đơn trong ca"
    const tabLabels = [
      { label: "Kết toán ca", name: "A05-shift-reconcile" },
      { label: "Đóng ca", name: "A06-shift-close" },
      { label: "Báo cáo phân tích", name: "A07-shift-report-analysis" },
      { label: "Báo cáo thống kê", name: "A08-shift-report-orders" },
    ];
    for (const t of tabLabels) {
      const tab = page.locator(`text=/${t.label}/i`).first();
      if (await tab.count().catch(() => 0)) {
        await tab.click({ force: true, timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(1500);
        await closeOnboardingModals(page);
        await shot(page, `${OUT}/${t.name}.png`);
        await shot(page, `${OUT}/${t.name}-fullpage.png`, { fullPage: true });
      }
    }

    // Back to Đang mở ca
    const backTab = page.locator(`text=/Đang mở ca|Đang trong ca/i`).first();
    if (await backTab.count().catch(() => 0)) {
      await backTab.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1000);
    }

    // ═══════════════════════════════════════════
    // B. BÁN HÀNG — customer search + add new + product modal
    // ═══════════════════════════════════════════
    console.log("\n=== B. Sale extra ===");
    await gotoSafe(page, BASE_URL + "/create_sale_add");
    await closeOnboardingModals(page);
    await page.waitForTimeout(1200);

    // Focus + type in customer selector
    const custSelect = page.locator('[id="nameCustomer"], .select-custom input').first();
    if (await custSelect.count().catch(() => 0)) {
      await custSelect.click({ force: true }).catch(() => {});
      await page.waitForTimeout(700);
      await shot(page, `${OUT}/B03-sale-customer-dropdown.png`);

      await page.keyboard.type("a", { delay: 100 }).catch(() => {});
      await page.waitForTimeout(1500);
      await shot(page, `${OUT}/B04-sale-customer-search.png`);
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(400);
    }

    // Switch to card tab
    const tabCard = page.locator("text=/Danh sách thẻ dịch vụ/i").first();
    if (await tabCard.count().catch(() => 0)) {
      await tabCard.click({ force: true }).catch(() => {});
      await page.waitForTimeout(800);
      await shot(page, `${OUT}/B05-sale-tab-card.png`);
      // back
      const tabSvc = page.locator("text=/Danh sách dịch vụ\\/sản phẩm/i").first();
      if (await tabSvc.count().catch(() => 0)) {
        await tabSvc.click({ force: true }).catch(() => {});
        await page.waitForTimeout(600);
      }
    }

    // Click "Thêm sản phẩm" / "Thêm dịch vụ" button if present
    const addBtns = ["Thêm sản phẩm", "Thêm dịch vụ", "Thêm mới sản phẩm", "Thêm mới dịch vụ"];
    for (const lbl of addBtns) {
      const b = page.locator(`button:has-text("${lbl}")`).first();
      if (await b.count().catch(() => 0) && (await b.isVisible().catch(() => false))) {
        await b.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1200);
        const fname = lbl.replace(/\s/g, "-").toLowerCase();
        await shot(page, `${OUT}/B06-modal-${fname}.png`);
        await page.keyboard.press("Escape").catch(() => {});
        await page.waitForTimeout(500);
        break;
      }
    }

    console.log("\nRETRY DONE");
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, `${OUT}/_retry-err.png`).catch(() => {});
  } finally {
    await browser.close();
  }
})();
