// Rechụp Part 13 với wait lâu hơn + click thử các tab nếu có.
const { launch, ensureLoggedIn, shot, dismissModals, BASE_URL } = require("./session");

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);

    const url = BASE_URL + "/fp_network_tree";
    console.log("[nav]", url);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch((e) => console.warn(" err", e.message));

    // Đợi lâu cho data load
    await page.waitForTimeout(8000);
    await dismissModals(page);
    await page.waitForTimeout(500);

    await shot(page, "images/part-13-mang-luoi/01-mang-luoi-tong-quan.png");
    await shot(page, "images/part-13-mang-luoi/02-mang-luoi-full.png", { fullPage: true });

    console.log("DONE.");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await browser.close();
  }
})();
