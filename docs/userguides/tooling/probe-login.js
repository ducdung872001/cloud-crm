const { launch, ensureLoggedIn, shot, BASE_URL } = require("./session");

(async () => {
  const { browser, context, page } = await launch({ headless: true });
  try {
    await page.goto(BASE_URL + "/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    await shot(page, "images/_probe/01-initial.png");
    console.log("URL after initial:", page.url());
    console.log("Has password input:", await page.locator('input[type="password"]').count());
    const allInputs = await page.locator('input').all();
    for (let i = 0; i < allInputs.length; i++) {
      const el = allInputs[i];
      const t = await el.getAttribute("type");
      const name = await el.getAttribute("name");
      const ph = await el.getAttribute("placeholder");
      console.log(`input[${i}] type=${t} name=${name} placeholder=${ph}`);
    }
    await ensureLoggedIn(page, context);
    await page.waitForTimeout(3000);
    await shot(page, "images/_probe/02-after-login.png", { fullPage: false });
    console.log("URL after login:", page.url());
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, "images/_probe/99-error.png").catch(() => {});
  } finally {
    await browser.close();
  }
})();
