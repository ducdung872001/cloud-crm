const { launch, ensureLoggedIn, pickRoleIfAsked, shot, BASE_URL } = require("./session");

const OUT = "images/part-03-thanh-vien";

async function closeAll(page) {
  for (let i = 0; i < 4; i++) {
    let c = false;
    for (const t of ["Tôi đã hiểu", "Đã hiểu", "Bỏ qua", "Để sau", "Skip"]) {
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
    await page.waitForTimeout(1500);

    // List buttons to inspect them
    const btns = await page.locator("button").evaluateAll(els =>
      els.map(e => (e.innerText || "").trim().slice(0, 40)).filter(x => x && x.length < 40)
    ).catch(() => []);
    console.log("Buttons:", JSON.stringify(btns.slice(0, 30)));

    // Try "Thêm nhanh" first (visible in list)
    const btn = page.locator("button").filter({ hasText: /Thêm nhanh/i }).first();
    if ((await btn.count().catch(() => 0)) > 0) {
      await btn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(3000);
      await closeAll(page);
      await shot(page, `${OUT}/A10-add-modal-empty.png`);
      await shot(page, `${OUT}/A10b-add-modal-fullpage.png`, { fullPage: true });

      // Fill form — try name, phone, email
      try {
        const inputs = await page.locator('input').all();
        for (const inp of inputs) {
          const label = await inp.getAttribute("name").catch(() => "");
          const placeholder = await inp.getAttribute("placeholder").catch(() => "");
          const type = await inp.getAttribute("type").catch(() => "");
          if (label === "name" || /tên thành viên/i.test(placeholder)) {
            await inp.fill("Nguyễn Văn Mẫu").catch(() => {});
          } else if (label === "phone" || type === "tel" || /điện thoại/i.test(placeholder)) {
            await inp.fill("0912345678").catch(() => {});
          } else if (label === "email" || type === "email") {
            await inp.fill("mau@example.com").catch(() => {});
          }
        }
        await page.waitForTimeout(800);
        await shot(page, `${OUT}/A11-add-modal-filled.png`);
        await shot(page, `${OUT}/A11b-add-modal-filled-fullpage.png`, { fullPage: true });
      } catch (e) { console.log("fill err:", e.message); }

      // Close with Esc + any confirm-cancel
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(600);
      for (const t of ["Đồng ý", "Xác nhận", "Có"]) {
        const c = page.locator(`button:has-text("${t}")`).first();
        if ((await c.count().catch(() => 0)) > 0 && (await c.isVisible().catch(() => false))) {
          await c.click({ force: true }).catch(() => {});
          await page.waitForTimeout(400);
        }
      }
    } else {
      console.log("[no Thêm nhanh button found]");
    }

    // Try clicking a customer row DEEPLY to see detail — specifically click on Name link
    const nameLink = page.locator('table tbody tr a, .ag-row a, [class*="customer-name"]').first();
    console.log("nameLink count:", await nameLink.count());
    if ((await nameLink.count().catch(() => 0)) > 0) {
      await nameLink.click({ force: true }).catch(() => {});
      await page.waitForTimeout(5000);
      await closeAll(page);
      await shot(page, `${OUT}/A20-detail-view.png`);
      await shot(page, `${OUT}/A20b-detail-fullpage.png`, { fullPage: true });
    } else {
      // Alternative: double-click row
      const row = page.locator('table tbody tr, .ag-row').first();
      if ((await row.count().catch(() => 0)) > 0) {
        await row.dblclick({ force: true }).catch(() => {});
        await page.waitForTimeout(5000);
        await closeAll(page);
        await shot(page, `${OUT}/A20-detail-view.png`);
        await shot(page, `${OUT}/A20b-detail-fullpage.png`, { fullPage: true });
      }
    }

    console.log("DONE");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await browser.close();
  }
})();
