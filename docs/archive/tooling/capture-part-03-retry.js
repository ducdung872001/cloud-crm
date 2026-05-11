// Retry pass for Part 03 — longer waits, better selectors
const { launch, ensureLoggedIn, pickRoleIfAsked, shot, BASE_URL } = require("./session");

const OUT = "images/part-03-thanh-vien";

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

async function gotoWait(page, url, extraWait = 6000) {
  await page.goto(url, { timeout: 90000 }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(extraWait);
  await pickRoleIfAsked(page);
  await closeAllModals(page);
  await page.waitForTimeout(1200);
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);

    // ═══════════════════════════════════════════
    // A. Customer List — with longer waits
    // ═══════════════════════════════════════════
    console.log("\n=== A. Customer List (retry) ===");
    await gotoWait(page, BASE_URL + "/customer_list", 8000);
    // wait for the table row or "Không có" text to confirm data loaded
    await page.waitForSelector('table tbody tr, .no-data, [class*="no-data"]', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await closeAllModals(page);
    await shot(page, `${OUT}/A01-list-main.png`);
    await shot(page, `${OUT}/A02-list-fullpage.png`, { fullPage: true });

    // Header row with buttons
    await shot(page, `${OUT}/A03-list-header.png`, { clip: { x: 230, y: 60, width: 1450, height: 140 } });

    // Click "Thêm thành viên" button — look for common text
    const addBtn = page.locator('button').filter({ hasText: /Thêm (thành viên|khách|mới|\+)/i }).first();
    console.log("addBtn count:", await addBtn.count());
    if ((await addBtn.count().catch(() => 0)) > 0) {
      await addBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(2500);
      await closeAllModals(page);
      await shot(page, `${OUT}/A10-add-modal-empty.png`);
      await shot(page, `${OUT}/A10b-add-modal-fullpage.png`, { fullPage: true });

      // Try filling form
      try {
        await page.locator('input[name="name"]').first().fill("Nguyễn Văn Mẫu").catch(() => {});
        await page.locator('input[name="phone"]').first().fill("0912345678").catch(() => {});
        await page.locator('input[name="email"]').first().fill("mau@example.com").catch(() => {});
        await page.waitForTimeout(600);
        await shot(page, `${OUT}/A11-add-modal-filled.png`);
        await shot(page, `${OUT}/A11b-add-modal-filled-fullpage.png`, { fullPage: true });
      } catch {}

      // close
      const cancelBtn = page.locator('button').filter({ hasText: /^\s*Hủy\s*$/ }).first();
      if ((await cancelBtn.count().catch(() => 0)) > 0) {
        await cancelBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(800);
        // confirm-cancel if appears
        for (const t of ["Đồng ý", "Xác nhận", "Có"]) {
          const c = page.locator(`button:has-text("${t}")`).first();
          if ((await c.count().catch(() => 0)) > 0 && (await c.isVisible().catch(() => false))) {
            await c.click({ force: true }).catch(() => {});
            await page.waitForTimeout(500);
          }
        }
      }
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(500);
    }

    // Click on first customer row for detail view
    const firstRow = page.locator('.ag-row, table tbody tr, [class*="customer-row"]').first();
    if ((await firstRow.count().catch(() => 0)) > 0) {
      await firstRow.click({ force: true }).catch(() => {});
      await page.waitForTimeout(4000);
      await closeAllModals(page);
      await shot(page, `${OUT}/A20-detail-view.png`);
      await shot(page, `${OUT}/A20b-detail-fullpage.png`, { fullPage: true });
    }

    // ═══════════════════════════════════════════
    // B. Setting Customer — longer wait
    // ═══════════════════════════════════════════
    console.log("\n=== B. Setting Customer (retry) ===");
    await gotoWait(page, BASE_URL + "/setting_customer", 8000);
    await page.waitForSelector('text=/Danh sách thẻ|Cài đặt/i', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await closeAllModals(page);
    await shot(page, `${OUT}/B01-setting-landing.png`);
    await shot(page, `${OUT}/B02-setting-fullpage.png`, { fullPage: true });

    // Click setting cards — using partial text match
    const cards = [
      { text: "ngành nghề", slug: "B13-nghenghiep" },
      { text: "mối quan hệ", slug: "B14-moiquanhe" },
      { text: "trường thông tin bổ sung", slug: "B15-fields" },
    ];
    for (const c of cards) {
      await gotoWait(page, BASE_URL + "/setting_customer", 5000);
      const card = page.getByText(new RegExp(c.text, "i")).first();
      if ((await card.count().catch(() => 0)) > 0) {
        await card.click({ force: true }).catch(() => {});
        await page.waitForTimeout(3500);
        await closeAllModals(page);
        await shot(page, `${OUT}/${c.slug}.png`);
        await shot(page, `${OUT}/${c.slug}-fullpage.png`, { fullPage: true });
      } else {
        console.log(`[still skip] ${c.text}`);
      }
    }

    console.log("\nRETRY PART-03 DONE");
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, `${OUT}/_retry-err.png`).catch(() => {});
  } finally {
    await browser.close();
  }
})();
