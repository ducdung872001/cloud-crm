const { launch, ensureLoggedIn, dismissModals, shot, BASE_URL } = require("./session");

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);
    await page.goto(BASE_URL + "/dashboard", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await dismissModals(page);

    // Click avatar image in header — always top-right corner
    const avatar = page.locator("header img, .header img").last();
    await avatar.click({ force: true, timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(800);
    await shot(page, "images/part-01-bat-dau/07-user-menu.png");
    console.log("done");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await browser.close();
  }
})();
