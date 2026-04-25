// Verify new MentorHub sidebar shows only MH menu items (no legacy CH items).
const { chromium } = require("playwright");

const USERNAME = "0971234599";
const PASSWORD = "Reborn@12345";

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const log = (s) => console.log(s);

  await page.goto("http://localhost:4000/crm/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(4000);

  if (page.url().startsWith("http://localhost:8080")) {
    const userSel = 'input[type="text"]';
    const passSel = 'input[type="password"]';
    await page.waitForSelector(userSel, { timeout: 10000 });
    await page.fill(userSel, USERNAME);
    await page.fill(passSel, PASSWORD);
    const btn = await page.$('button[type="submit"]') || await page.$("form button");
    if (btn) {
      await btn.click();
      await page.waitForLoadState("domcontentloaded").catch(() => {});
    }
  }
  await page.waitForTimeout(6000);

  // Navigate to /mh/courses directly
  await page.goto("http://localhost:4000/crm/mh/courses", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(5000);

  log("Current URL: " + page.url());

  // Collect sidebar menu items (look for .navigation li span text)
  const sidebarItems = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll(".navigation li.level-1 > a span, .navigation li.level-1 > a").forEach((el) => {
      const txt = (el.textContent || "").trim();
      if (txt && txt.length < 50) items.push(txt);
    });
    // Dedupe
    return Array.from(new Set(items));
  }).catch(() => []);

  log("\n=== SIDEBAR ITEMS (" + sidebarItems.length + ") ===");
  sidebarItems.forEach((t, i) => log(`  ${i + 1}. ${t}`));

  // Check for any CH leftovers
  const badWords = ["Lưu trú", "Lễ tân", "Kho", "Đối tác", "Sự kiện", "Lưu trú", "Nguyên vật liệu"];
  const found = sidebarItems.filter((t) => badWords.some((bw) => t.includes(bw)));
  if (found.length > 0) {
    log("\n⚠️ LEGACY CH ITEMS STILL PRESENT:");
    found.forEach((t) => log("  ✗ " + t));
  } else {
    log("\n✅ No legacy CommunityHub items in sidebar.");
  }

  // Expected MH items
  const expectedMH = ["Tổng quan", "Khoá học", "Lịch dạy", "Học viên", "Sau buổi học", "Tăng trưởng", "Cài đặt"];
  const missingMH = expectedMH.filter((e) => !sidebarItems.some((s) => s.includes(e)));
  if (missingMH.length > 0) {
    log("\n⚠️ MISSING MH ITEMS:");
    missingMH.forEach((t) => log("  ✗ " + t));
  } else {
    log("\n✅ All expected MH items present.");
  }

  await page.screenshot({ path: "d:/tmp/mentorhub-sidebar.png", fullPage: false });
  log("\nScreenshot: d:/tmp/mentorhub-sidebar.png");

  await browser.close();
})();
