// Capture screenshots for Part 03 — Thành viên
const { launch, ensureLoggedIn, pickRoleIfAsked, shot, BASE_URL } = require("./session");
const path = require("path");
const fs = require("fs");

const OUT = "images/part-03-thanh-vien";
fs.mkdirSync(path.resolve(__dirname, "..", OUT), { recursive: true });

async function closeAllModals(page) {
  for (let i = 0; i < 5; i++) {
    let clicked = false;
    for (const t of ["Tôi đã hiểu", "Đã hiểu", "Bỏ qua", "Để sau", "Skip", "Hoàn tất"]) {
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

async function gotoSafe(page, url) {
  await page.goto(url, { timeout: 60000 }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await pickRoleIfAsked(page);
  await closeAllModals(page);
  await page.waitForTimeout(800);
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);

    // ═══════════════════════════════════════════
    // A. Customer List
    // ═══════════════════════════════════════════
    console.log("\n=== A. Customer List ===");
    await gotoSafe(page, BASE_URL + "/customer_list");
    await shot(page, `${OUT}/A01-list-main.png`);
    await shot(page, `${OUT}/A02-list-fullpage.png`, { fullPage: true });

    // Click on search box
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"], input[placeholder*="Tên"], input[type="search"]').first();
    if ((await searchInput.count().catch(() => 0)) > 0) {
      await searchInput.click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
      await searchInput.fill("Nguyễn").catch(() => {});
      await page.waitForTimeout(1500);
      await shot(page, `${OUT}/A03-list-search.png`);
      await searchInput.fill("").catch(() => {});
      await page.waitForTimeout(800);
    }

    // Click "Thêm thành viên" or "Thêm mới"
    const addBtn = page.locator('button:has-text("Thêm thành viên"), button:has-text("Thêm mới"), button:has-text("Thêm khách")').first();
    if ((await addBtn.count().catch(() => 0)) > 0) {
      await addBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
      await closeAllModals(page);
      await shot(page, `${OUT}/A10-add-modal-empty.png`);
      await shot(page, `${OUT}/A10b-add-modal-fullpage.png`, { fullPage: true });

      // Fill the form
      const nameField = page.locator('input[name="name"]').first();
      if ((await nameField.count().catch(() => 0)) > 0) {
        await nameField.fill("Nguyễn Văn Mẫu").catch(() => {});
        await page.waitForTimeout(300);
      }
      const phoneField = page.locator('input[name="phone"]').first();
      if ((await phoneField.count().catch(() => 0)) > 0) {
        await phoneField.fill("0912345678").catch(() => {});
        await page.waitForTimeout(300);
      }
      const emailField = page.locator('input[name="email"]').first();
      if ((await emailField.count().catch(() => 0)) > 0) {
        await emailField.fill("mau@example.com").catch(() => {});
        await page.waitForTimeout(300);
      }
      // Pick gender "Nam" radio
      const genderNam = page.locator('label:has-text("Nam") input[type="radio"]').first();
      if ((await genderNam.count().catch(() => 0)) > 0) {
        await genderNam.click({ force: true }).catch(() => {});
        await page.waitForTimeout(300);
      }
      await shot(page, `${OUT}/A11-add-modal-filled.png`);
      await shot(page, `${OUT}/A11b-add-modal-filled-fullpage.png`, { fullPage: true });

      // Close modal
      const cancelBtn = page.locator('button:has-text("Hủy")').first();
      if ((await cancelBtn.count().catch(() => 0)) > 0) {
        await cancelBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(800);
        // If confirm-cancel dialog
        const confirmBtn = page.locator('button:has-text("Đồng ý"), button:has-text("Xác nhận"), button:has-text("Có")').first();
        if ((await confirmBtn.count().catch(() => 0)) > 0 && (await confirmBtn.isVisible().catch(() => false))) {
          await confirmBtn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(500);
        }
      }
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(500);
    }

    // Click on first customer to see detail view
    const firstRow = page.locator('table tbody tr, [class*="customer-row"]').first();
    if ((await firstRow.count().catch(() => 0)) > 0) {
      await firstRow.click({ force: true }).catch(() => {});
      await page.waitForTimeout(2500);
      await closeAllModals(page);
      await shot(page, `${OUT}/A20-detail-view.png`);
      await shot(page, `${OUT}/A20b-detail-fullpage.png`, { fullPage: true });
      // back to list
      await gotoSafe(page, BASE_URL + "/customer_list");
    }

    // ═══════════════════════════════════════════
    // B. Setting Customer
    // ═══════════════════════════════════════════
    console.log("\n=== B. Setting Customer ===");
    await gotoSafe(page, BASE_URL + "/setting_customer");
    await shot(page, `${OUT}/B01-setting-landing.png`);
    await shot(page, `${OUT}/B02-setting-fullpage.png`, { fullPage: true });

    // Click each setting card
    const cards = [
      { text: "Danh sách thẻ thành viên", slug: "B10-card-thethanhvien" },
      { text: "Danh sách nguồn thành viên", slug: "B11-nguon" },
      { text: "Danh sách nhóm thành viên", slug: "B12-nhom" },
      { text: "Danh sách ngành nghề", slug: "B13-nghenghiep" },
      { text: "Danh sách mối quan hệ", slug: "B14-moiquanhe" },
      { text: "Định nghĩa trường thông tin bổ sung", slug: "B15-fields" },
      { text: "Định nghĩa cấu trúc xem thông tin", slug: "B16-viewstructure" },
    ];

    for (const c of cards) {
      await gotoSafe(page, BASE_URL + "/setting_customer");
      const card = page.locator(`text="${c.text}"`).first();
      if ((await card.count().catch(() => 0)) > 0) {
        await card.click({ force: true }).catch(() => {});
        await page.waitForTimeout(2500);
        await closeAllModals(page);
        await shot(page, `${OUT}/${c.slug}.png`);
        await shot(page, `${OUT}/${c.slug}-fullpage.png`, { fullPage: true });
      } else {
        console.log(`[skip] card "${c.text}" not found`);
      }
    }

    console.log("\nALL PART-03 SHOTS CAPTURED");
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, `${OUT}/_err.png`).catch(() => {});
  } finally {
    await browser.close();
  }
})();
