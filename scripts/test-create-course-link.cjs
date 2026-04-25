// Test clicking "+ Tạo khoá mới" button actually navigates to CourseEdit form
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  // Login
  await page.goto("http://localhost:4000/crm/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);
  if (page.url().startsWith("http://localhost:8080")) {
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.fill('input[type="text"]', "0971234599");
    await page.fill('input[type="password"]', "Reborn@12345");
    const btn = await page.$('button[type="submit"]') || await page.$("form button");
    if (btn) await btn.click();
    await page.waitForLoadState("domcontentloaded").catch(() => {});
  }
  await page.waitForTimeout(6000);

  await page.goto("http://localhost:4000/crm/mh/courses", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Find "Tạo khoá mới" link, print its href
  const linkHref = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("a")).find((a) => a.textContent?.includes("Tạo khoá mới"));
    return el ? el.getAttribute("href") : "NOT FOUND";
  });
  console.log("Rendered href of '+ Tạo khoá mới':", linkHref);

  // Click it
  await page.click("a:has-text('Tạo khoá mới')").catch((e) => console.log("click error: " + e.message));
  await page.waitForTimeout(3000);
  console.log("URL after click:", page.url());
  const title = await page.title();
  console.log("Page title:", title);

  // Also check for h1
  const h1 = await page.locator("h1").first().textContent().catch(() => "(n/a)");
  console.log("h1 text:", h1);

  const bodyLen = await page.evaluate(() => (document.body?.innerText || "").length);
  console.log("body text length:", bodyLen);

  await page.screenshot({ path: "d:/tmp/course-new.png", fullPage: false });
  console.log("Screenshot: d:/tmp/course-new.png");

  await browser.close();
})();
