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

    // First, get a customer ID from the list
    await page.goto(BASE_URL + "/customer_list", { timeout: 90000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(6000);
    await pickRoleIfAsked(page);
    await closeAll(page);
    await page.waitForTimeout(1000);

    // Try clicking first row's link or name cell to trigger navigation
    const firstNameCell = page.locator('.ag-cell[col-id="name"], [class*="CustomerName"], a[href*="detail_person"]').first();
    if ((await firstNameCell.count().catch(() => 0)) > 0) {
      await firstNameCell.click({ force: true }).catch(() => {});
      await page.waitForTimeout(5000);
      console.log("After click URL:", page.url());
    }

    // If still not on detail, try navigating directly to a "new" detail page
    if (!page.url().includes("detail_person")) {
      await page.goto(BASE_URL + "/detail_person/customerId/new", { timeout: 60000 }).catch(() => {});
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(6000);
      await pickRoleIfAsked(page);
      await closeAll(page);
    }
    await page.waitForTimeout(2000);
    await shot(page, `${OUT}/A20-detail-new.png`);
    await shot(page, `${OUT}/A20b-detail-new-fullpage.png`, { fullPage: true });

    console.log("DONE");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await browser.close();
  }
})();
