// Debug script — capture screenshot từng bước SSO để xem login fail ở đâu
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotDir = path.join(__dirname, "screenshots", "login-debug");
fs.mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: CONFIG.VIEWPORT,
  extraHTTPHeaders: { Hostname: "kcn.reborn.vn" },
});
const page = await context.newPage();

page.on("console", (m) => console.log(`  [console.${m.type()}]`, m.text().slice(0, 200)));
page.on("pageerror", (e) => console.log(`  [pageerror]`, e.message.slice(0, 200)));

async function shot(name) {
  await page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: false });
  console.log(`  📸 ${name}.png  url=${page.url()}`);
}

try {
  console.log("1. goto /crm/login");
  await page.goto(`${CONFIG.BASE_URL}/login`, { timeout: 30000 });
  await page.waitForTimeout(2000);
  await shot("01-after-goto-login");

  console.log("2. wait redirect to SSO");
  await page.waitForURL(/localhost:8080|sso\./, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await shot("02-sso-form-empty");

  console.log("3. dump SSO HTML structure");
  const html = await page.content();
  fs.writeFileSync(path.join(shotDir, "sso-page.html"), html);
  const inputCount = await page.evaluate(() => document.querySelectorAll("input").length);
  const buttonCount = await page.evaluate(() => document.querySelectorAll("button").length);
  const inputs = await page.evaluate(() => [...document.querySelectorAll("input")].map((i) => ({ type: i.type, name: i.name, placeholder: i.placeholder, id: i.id })));
  const buttons = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => ({ text: b.innerText?.trim().slice(0, 50), type: b.type, name: b.name })));
  console.log(`  inputs (${inputCount}):`, JSON.stringify(inputs));
  console.log(`  buttons (${buttonCount}):`, JSON.stringify(buttons));

  console.log("4. fill credentials");
  const userInput = await page.$('input[placeholder*="email"], input[placeholder*="số điện thoại"], input[type="text"]:not([type="password"])');
  const passInput = await page.$('input[type="password"]');
  if (!userInput) { console.log("  ❌ Không tìm thấy user input"); }
  else { await userInput.fill(CONFIG.USERNAME); }
  if (!passInput) { console.log("  ❌ Không tìm thấy pass input"); }
  else { await passInput.fill(CONFIG.PASSWORD); }
  await shot("03-filled");

  console.log("5. click submit");
  const submitBtn = await page.$('button:has-text("Đăng nhập"), button:has-text("đăng nhập"), button[type="submit"]');
  if (!submitBtn) { console.log("  ❌ Không tìm thấy submit button"); }
  else { await submitBtn.click(); }
  await page.waitForTimeout(5000);
  await shot("04-after-submit");
  console.log(`  url sau submit: ${page.url()}`);

  console.log("6. wait redirect to app");
  await page.waitForURL(/localhost:4000\/crm/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await shot("05-back-to-app");
  console.log(`  url cuối: ${page.url()}`);

  const ls = await page.evaluate(() => ({
    permissions: localStorage.getItem("permissions"),
    SelectedRole: localStorage.getItem("SelectedRole"),
    "user.root": localStorage.getItem("user.root"),
    keys: Object.keys(localStorage),
  }));
  console.log(`  localStorage:`, JSON.stringify(ls, null, 2));
} catch (e) {
  console.log("❌ Error:", e.message);
} finally {
  await browser.close();
}
