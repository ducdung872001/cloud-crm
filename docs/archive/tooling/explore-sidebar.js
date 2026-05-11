const { launch, ensureLoggedIn, shot, BASE_URL } = require("./session");

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);
    await page.goto(BASE_URL + "/dashboard", { waitUntil: "domcontentloaded" }).catch(() => {});
    await page.waitForTimeout(3000);

    // dismiss onboarding modal if present
    const dismissBtns = ["Để sau", "Bỏ qua", "Đóng", "Skip"];
    for (const t of dismissBtns) {
      const b = page.getByRole("button", { name: new RegExp(t, "i") });
      if (await b.count()) { await b.first().click().catch(() => {}); await page.waitForTimeout(500); }
    }
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(1500);

    await shot(page, "images/_probe/10-dashboard-clean.png", { fullPage: false });

    // enumerate top-level sidebar items
    const items = await page.locator(".sidebar-menu a, .sidebar-menu li").evaluateAll((els) =>
      els.map((el) => ({
        text: (el.innerText || "").trim().split("\n")[0],
        href: el.getAttribute("href") || "",
        cls: el.className || "",
      }))
    );
    console.log("SIDEBAR ITEMS FOUND:", items.length);
    for (const it of items) {
      if (it.text) console.log(`- [${it.href}] ${it.text}`);
    }

    // Try hovering each top-level to reveal tooltip/submenu
    const tops = await page.locator(".sidebar-menu > div > *, .sidebar li.menu-item, .sidebar-item").all();
    console.log("top-level count:", tops.length);
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, "images/_probe/98-err.png").catch(() => {});
  } finally {
    await browser.close();
  }
})();
