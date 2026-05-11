import { chromium } from "playwright";
import { CONFIG } from "./config.mjs";

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    console.log(`[${msg.type()}]`, msg.text().substring(0, 200));
  }
});

page.on("pageerror", (err) => console.log("[pageerror]", err.message.substring(0, 200)));

await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: "load" });
await page.waitForTimeout(5000);
const u = page.url();
console.log("After login nav:", u);

if (u.includes("8080")) {
  await page.evaluate((u) => {
    const el = document.querySelector('input[type="text"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, u);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, CONFIG.USERNAME);
  await page.evaluate((p) => {
    const el = document.querySelector('input[type="password"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, p);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, CONFIG.PASSWORD);
  await page.click("button.btn-submit-form");
  await page.waitForTimeout(8000);
  console.log("After login submit:", page.url());
}

try {
  await page.waitForSelector("text=Chọn vai trò", { timeout: 5000 });
  const role = page.locator('label:has-text("Ban giám đốc")');
  if ((await role.count()) > 0) await role.first().click();
  await page.click('button:has-text("Xác nhận")');
  await page.waitForTimeout(5000);
  console.log("After role:", page.url());
} catch {}

console.log("Going to /setting_loyalty");
await page.goto(`${CONFIG.BASE_URL}/setting_loyalty`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(8000);
console.log("Final URL:", page.url());

const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
console.log("Page body text (first 500 chars):", bodyText);

await page.screenshot({ path: "tests/screenshots/debug-setting-loyalty.png", fullPage: true });
console.log("Screenshot saved");

await browser.close();
