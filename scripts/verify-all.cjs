// End-to-end: login + navigate all admin MH pages + portal pages.
const { chromium } = require("playwright");

const USERNAME = "0971234599";
const PASSWORD = "Reborn@12345";

const ADMIN_PATHS = [
  "/crm/mh/dashboard",
  "/crm/mh/courses",
  "/crm/mh/courses/new",
  "/crm/mh/students",
  "/crm/mh/calendar",
  "/crm/mh/live-session",
  "/crm/mh/session-review",
  "/crm/mh/feedback",
  "/crm/mh/tickets",
  "/crm/mh/chat",
  "/crm/mh/revenue",
  "/crm/mh/marketing",
  "/crm/mh/settings",
];

const PORTAL_PATHS = [
  "/crm/portal",
  "/crm/portal/courses/CRS-01",
  "/crm/portal/register/CRS-01",
  "/crm/portal/register/success?course=CRS-01&name=Test",
  "/crm/portal/feedback/SESS-001",
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // Portal first (no login needed)
  console.log("\n=== PORTAL PAGES (no login) ===");
  for (const p of PORTAL_PATHS) {
    errors.length = 0;
    await page.goto("http://localhost:4000" + p, { waitUntil: "domcontentloaded", timeout: 30000 }).catch((e) => console.log(`  goto err: ${e.message}`));
    await page.waitForTimeout(2000);
    const h1 = await page.locator("h1").first().textContent().catch(() => "");
    const bodyLen = await page.evaluate(() => (document.body?.innerText || "").length).catch(() => 0);
    const status = errors.length > 0 ? "✗" : bodyLen > 100 ? "✓" : "⚠";
    console.log(`  ${status} ${p.padEnd(46)} h1="${(h1 || "").slice(0, 40)}" len=${bodyLen} errs=${errors.length}`);
    if (errors.length > 0) errors.forEach((e) => console.log(`     ERR: ${e.slice(0, 120)}`));
  }

  // Login once
  console.log("\n=== LOGIN ===");
  await page.goto("http://localhost:4000/crm/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);
  if (page.url().startsWith("http://localhost:8080")) {
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.fill('input[type="text"]', USERNAME);
    await page.fill('input[type="password"]', PASSWORD);
    const btn = await page.$('button[type="submit"]') || await page.$("form button");
    if (btn) await btn.click();
    await page.waitForLoadState("domcontentloaded").catch(() => {});
  }
  await page.waitForTimeout(6000);
  console.log("  logged in, url: " + page.url());

  console.log("\n=== ADMIN MH PAGES (logged in) ===");
  for (const p of ADMIN_PATHS) {
    errors.length = 0;
    await page.goto("http://localhost:4000" + p, { waitUntil: "domcontentloaded", timeout: 30000 }).catch((e) => console.log(`  goto err: ${e.message}`));
    await page.waitForTimeout(2000);
    const h1 = await page.locator("h1").first().textContent().catch(() => "");
    const bodyLen = await page.evaluate(() => (document.body?.innerText || "").length).catch(() => 0);
    // Check for "Coming soon" stub content
    const hasComingSoon = await page.locator("text=Module đang hoàn thiện").count().catch(() => 0);
    const status = errors.length > 0 ? "✗" : hasComingSoon > 0 ? "STUB" : bodyLen > 200 ? "✓" : "⚠";
    console.log(`  ${status.padEnd(4)} ${p.padEnd(36)} h1="${(h1 || "").slice(0, 40)}" len=${bodyLen} errs=${errors.length}`);
    if (errors.length > 0) errors.slice(0, 2).forEach((e) => console.log(`       ERR: ${e.slice(0, 120)}`));
  }

  // Quick responsive check — render portal home at mobile width
  console.log("\n=== RESPONSIVE (375px mobile viewport) ===");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("http://localhost:4000/crm/portal", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "d:/tmp/portal-mobile.png", fullPage: false });
  console.log("  → portal home mobile screenshot: d:/tmp/portal-mobile.png");

  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("http://localhost:4000/crm/portal", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "d:/tmp/portal-desktop.png", fullPage: false });
  console.log("  → portal home desktop screenshot: d:/tmp/portal-desktop.png");

  await page.goto("http://localhost:4000/crm/portal/courses/CRS-01", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "d:/tmp/portal-detail.png", fullPage: true });
  console.log("  → portal course detail full page: d:/tmp/portal-detail.png");

  await browser.close();
})();
