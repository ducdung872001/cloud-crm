// Probe BE response shape — check selectedAddOns field trên list registrations
import { chromium } from "playwright";

const BASE = "https://hub.reborn.vn/crm";
const USER = "0898348348";
const PASS = "Reborn@12345";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForURL(/sso|reborn/i, { timeout: 20000 }).catch(() => {});
await page.waitForSelector('input[type="password"]', { timeout: 20000 });
const userInput = page
  .locator('input[type="text"], input[type="tel"], input:not([type]), input[type="email"]')
  .filter({ hasNot: page.locator('input[type="password"]') })
  .first();
await userInput.fill(USER);
await page.locator('input[type="password"]').first().fill(PASS);
await page.getByRole("button", { name: /đăng nhập|sign in|login/i }).first().click();
await page.waitForURL(/hub\.reborn\.vn\/crm/i, { timeout: 30000 });
await page.waitForFunction(() => !!localStorage.getItem("permissions"), null, { timeout: 25000 }).catch(() => {});

const data = await page.evaluate(async () => {
  const out = {};
  // 1. List registrations cho event 24
  const r1 = await fetch("/bizapi/market/events/registrations?eventId=24&limit=10", {
    headers: { Accept: "application/json" },
  }).then((r) => r.json()).catch((e) => ({ error: String(e) }));
  out.list = r1;

  // 2. Try alt endpoint
  const r2 = await fetch("/bizapi/market/events/registrations?eventId=24&limit=10", {
    headers: { Accept: "application/json" },
  }).then((r) => ({ status: r.status, contentType: r.headers.get("content-type") })).catch((e) => ({ error: String(e) }));
  out.alt = r2;

  return out;
});

console.log("=== /events/registrations/list?eventId=24 ===");
const items = data.list?.result?.items ?? data.list?.result;
if (Array.isArray(items) && items.length > 0) {
  console.log(`Total items: ${items.length}`);
  // Find E2E test registration
  const testReg = items.find((r) => (r.fullName || r.full_name || "").includes("E2E TEST"));
  const regToShow = testReg ?? items[0];
  console.log(`\nKeys của registration ${regToShow.id}:`);
  console.log(Object.keys(regToShow).sort());
  console.log(`\nselectedAddOns raw:`, JSON.stringify(regToShow.selectedAddOns ?? regToShow.selected_add_ons));
  console.log(`selectedAddOnsView raw:`, JSON.stringify(regToShow.selectedAddOnsView));
  console.log(`totalAmount:`, regToShow.totalAmount ?? regToShow.total_amount);
  console.log(`fullName:`, regToShow.fullName ?? regToShow.full_name);

  // List all reg shortcomings
  console.log(`\nAll regs summary:`);
  items.forEach((r) => {
    console.log(`  id=${r.id} name="${r.fullName || r.full_name}" selectedAddOns=${JSON.stringify(r.selectedAddOns ?? r.selected_add_ons)} totalAmount=${r.totalAmount ?? r.total_amount}`);
  });
} else {
  console.log("No items or wrong shape:", JSON.stringify(data.list).slice(0, 500));
}

await browser.close();
