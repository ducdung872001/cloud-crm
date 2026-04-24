const { launch, ensureLoggedIn, shot, dismissModals, BASE_URL } = require("./session");

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);
    const url = BASE_URL + "/fp_tax";
    console.log("[nav]", url);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => console.warn(" err", e.message));
    await page.waitForTimeout(8000);
    await dismissModals(page);
    await page.waitForTimeout(500);
    await shot(page, "images/part-15-fitpro-modules/08-khai-thue-tram.png");
    console.log("DONE.");
  } finally {
    await browser.close();
  }
})();
