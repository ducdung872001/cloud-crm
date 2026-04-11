#!/usr/bin/env node
/**
 * Login 1 lan — Luu cookies/token ra file de dung lai.
 *
 * Chay: node tests/login-save.mjs
 * Token duoc luu tai: tests/.auth-cookies.json
 * Cac test script se tu dong doc file nay thay vi login lai.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COOKIE_FILE = path.join(__dirname, ".auth-cookies.json");

async function main() {
  console.log("🔐 Dang nhap SSO de lay token...\n");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Go to CRM → redirect to SSO
  await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: "load", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(6000);

  const ssoUrl = page.url();
  console.log(`   SSO: ${ssoUrl.split("?")[0]}`);

  if (ssoUrl.includes("8080") || ssoUrl.includes("sso")) {
    // Fill SSO form
    // Vue needs native input events
    await page.evaluate((user) => {
      const el = document.querySelector('input[type="text"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(el, user);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, CONFIG.USERNAME);

    await page.evaluate((pass) => {
      const el = document.querySelector('input[type="password"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(el, pass);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, CONFIG.PASSWORD);

    await page.waitForTimeout(500);
    await page.click("button.btn-submit-form");
    console.log("   ⏳ Cho SSO xu ly...");
    await page.waitForTimeout(10000);
  }

  // Handle role modal
  try {
    await page.waitForSelector('text=Chọn vai trò', { timeout: 8000 });
    console.log("   👤 Chon vai tro → Xac nhan");
    await page.click('button:has-text("Xác nhận")').catch(() => {});
    await page.waitForTimeout(5000);
  } catch {
    await page.waitForTimeout(2000);
  }

  // Luu SelectedRole vao localStorage de khong bi hoi lai role
  await page.evaluate(() => {
    const role = localStorage.getItem("SelectedRole");
    if (!role) localStorage.setItem("SelectedRole", "1");
  }).catch(() => {});

  // Save cookies
  const cookies = await context.cookies();
  const tokenCookie = cookies.find((c) => c.name === "token");

  if (tokenCookie) {
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
    console.log(`\n✅ Token luu tai: ${COOKIE_FILE}`);
    console.log(`   Token: ${tokenCookie.value.slice(0, 30)}...`);
    console.log(`   Expires: ${new Date(tokenCookie.expires * 1000).toLocaleString()}`);
    console.log(`   Cookies: ${cookies.length} entries\n`);
    console.log("   Gio chay test binh thuong:");
    console.log("   node tests/test-inventory-full.mjs");
  } else {
    console.log("\n❌ Khong tim thay token cookie!");
    console.log(`   URL hien tai: ${page.url()}`);
    console.log("   Co the login that bai. Thu lai.\n");

    // Show all cookies for debug
    console.log("   Cookies hien co:");
    cookies.forEach((c) => console.log(`     ${c.name} = ${c.value.slice(0, 20)}...`));
  }

  await browser.close();
}

main();
