const { launch, ensureLoggedIn, pickRoleIfAsked, shot, BASE_URL } = require("./session");
const OUT = "images/part-03-thanh-vien";

async function closeAll(page) {
  for (let i = 0; i < 4; i++) {
    let c = false;
    for (const t of ["Tôi đã hiểu", "Đã hiểu", "Bỏ qua", "Để sau"]) {
      const b = page.getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") });
      if ((await b.count().catch(() => 0)) > 0 && (await b.first().isVisible().catch(() => false))) {
        await b.first().click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(400); c = true;
      }
    }
    if (!c) break;
  }
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);
    await page.goto(BASE_URL + "/customer_list", { timeout: 90000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(8000);
    await pickRoleIfAsked(page);
    await closeAll(page);
    await page.waitForTimeout(2000);

    // Try click on the first "eye" icon that opens customer detail, or context menu with "Xem"
    // Or use middle-click simulated via JS to get href
    const firstRowHrefs = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="detail_person"]'));
      return anchors.slice(0, 3).map(a => a.getAttribute("href"));
    });
    console.log("hrefs:", firstRowHrefs);

    if (firstRowHrefs.length > 0) {
      await page.goto(BASE_URL.replace("/crm", "") + firstRowHrefs[0], { timeout: 60000 }).catch(() => {});
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(6000);
      await pickRoleIfAsked(page);
      await closeAll(page);
      await page.waitForTimeout(2000);
      console.log("URL:", page.url());
      await shot(page, `${OUT}/A20-detail-view.png`);
      await shot(page, `${OUT}/A20b-detail-view-fullpage.png`, { fullPage: true });
    } else {
      // Fallback: click 3-dot menu on first row then "Xem chi tiết"
      const menuBtn = page.locator('.ag-row').first().locator('button, [class*="menu"], [class*="dots"]').first();
      if ((await menuBtn.count().catch(() => 0)) > 0) {
        await menuBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
        const viewItem = page.locator("text=/Xem chi tiết|Chi tiết/i").first();
        if ((await viewItem.count().catch(() => 0)) > 0) {
          await viewItem.click({ force: true }).catch(() => {});
          await page.waitForTimeout(5000);
          await closeAll(page);
          await shot(page, `${OUT}/A20-detail-view.png`);
          await shot(page, `${OUT}/A20b-detail-view-fullpage.png`, { fullPage: true });
        }
      }
    }

    console.log("DONE");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await browser.close();
  }
})();
