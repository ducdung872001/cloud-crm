// Focused capture for shift management page
const { launch, ensureLoggedIn, pickRoleIfAsked, shot, BASE_URL } = require("./session");

async function closeAllModals(page) {
  for (let i = 0; i < 5; i++) {
    let clicked = false;
    for (const t of ["Tôi đã hiểu", "Đã hiểu", "Để sau", "Bỏ qua", "Skip", "Đóng", "Tiếp theo"]) {
      const b = page.getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") });
      if (await b.count().catch(() => 0)) {
        const visible = await b.first().isVisible().catch(() => false);
        if (visible) {
          await b.first().click({ timeout: 1500 }).catch(() => {});
          await page.waitForTimeout(500);
          clicked = true;
        }
      }
    }
    if (!clicked) break;
  }
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    // Step 1: go to dashboard first (warmup)
    await page.goto(BASE_URL + "/dashboard", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await ensureLoggedIn(page, context);
    await pickRoleIfAsked(page);
    await closeAllModals(page);

    // Step 2: navigate to shift via click (more natural)
    await page.goto(BASE_URL + "/shift_management", { timeout: 60000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(5000);
    console.log("URL:", page.url());
    await shot(page, "images/part-02-le-tan/_shift-raw.png");

    // Aggressively close modals multiple times
    for (let i = 0; i < 4; i++) {
      await closeAllModals(page);
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(1200);
    await shot(page, "images/part-02-le-tan/A01-shift-landing.png");
    await shot(page, "images/part-02-le-tan/A02-shift-fullpage.png", { fullPage: true });

    // Find any tab-like elements visible
    const tabs = await page.locator(".tabs button, [role='tab'], .nav-tabs a, .tab, button.tab").evaluateAll((els) =>
      els.map((el, i) => ({ i, text: (el.innerText || "").trim().slice(0, 50) })).filter((x) => x.text)
    ).catch(() => []);
    console.log("Visible tabs:", tabs.length);
    tabs.forEach((t) => console.log("  -", t.text));

    // Click each unique tab and capture
    const seen = new Set();
    const order = [];
    for (const t of tabs) {
      if (!t.text || seen.has(t.text)) continue;
      seen.add(t.text);
      order.push(t);
    }
    let counter = 3;
    for (const t of order.slice(0, 6)) {
      const el = page.locator(`text="${t.text}"`).first();
      if (await el.count().catch(() => 0)) {
        await el.click({ force: true, timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(1500);
        await closeAllModals(page);
        const slug = t.text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
        const n = String(counter).padStart(2, "0");
        await shot(page, `images/part-02-le-tan/A${n}-shift-${slug}.png`);
        counter++;
      }
    }

    console.log("SHIFT CAPTURE DONE");
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, "images/part-02-le-tan/_shift-err.png").catch(() => {});
  } finally {
    await browser.close();
  }
})();
