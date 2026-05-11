/**
 * Verify SSO redirect đi đúng host https://reborn.vn (auth convention).
 */
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const calls = [];
page.on("request", (req) => {
  const u = req.url();
  if (u.includes("reborn.vn") || u.includes("/authenticator/") || u.includes("sso")) {
    calls.push({ method: req.method(), url: u });
  }
});
try {
  await page.goto("http://localhost:4000/crm/login", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(4000);
} catch (e) {
  console.log("Nav err:", e.message);
}
console.log("Final URL:", page.url());
console.log("Captured auth-related calls:");
calls.forEach((r) => console.log(`  ${r.method} ${r.url.split("?")[0]}`));

const authReborn = calls.filter((c) => c.url.startsWith("https://reborn.vn/authenticator/"));
const ssoReborn = calls.filter((c) => c.url.includes("sso.reborn.vn"));
const wrongHost = calls.filter(
  (c) => c.url.includes("/authenticator/") && !c.url.startsWith("https://reborn.vn/authenticator/"),
);
console.log("");
console.log(`reborn.vn/authenticator/* calls: ${authReborn.length}`);
console.log(`sso.reborn.vn calls:             ${ssoReborn.length}`);
console.log(`/authenticator/* on WRONG host:  ${wrongHost.length}`);
if (wrongHost.length > 0) {
  wrongHost.forEach((c) => console.log(`  ❌ ${c.url}`));
}
await browser.close();
process.exit(wrongHost.length > 0 ? 1 : 0);
