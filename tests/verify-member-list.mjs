/**
 * Verify BE fix — tên KH trong Danh sách thành viên (loyalty_wallet)
 * Chạy: node tests/verify-member-list.mjs
 */
import { chromium } from "playwright";
import { CONFIG } from "./config.mjs";

const BASE = CONFIG.BASE_URL;

const browser = await chromium.launch({ headless: false, slowMo: 50 });
const context = await browser.newContext({ viewport: CONFIG.VIEWPORT });
const page = await context.newPage();
page.setDefaultTimeout(15000);

let walletPayload = null;
const apiCalls = [];
page.on("response", async (res) => {
  const u = res.url();
  if (u.includes("/bizapi/") || u.includes("biz.reborn.vn") || u.includes("/market/")) {
    apiCalls.push({ url: u.split("?")[0], status: res.status() });
  }
  if (u.includes("/market/loyaltyWallet/list")) {
    try { walletPayload = await res.json(); } catch { /* ignore */ }
  }
});

console.log("🔐 Login SSO...");
await page.goto(`${BASE}/login`, { waitUntil: "load", timeout: 30000 }).catch(() => {});

// Cho toi khi thay password input (SSO redirect xong)
let passInput = null;
try {
  passInput = await page.waitForSelector('input[type="password"]', { timeout: 20000 });
} catch {
  if (page.url().includes("/crm/") && !page.url().includes("/login")) {
    console.log("   Da co session san");
  } else {
    console.log("   ! Khong thay SSO form, URL=" + page.url());
  }
}

if (passInput) {
  console.log(`   Tim thay form SSO tai ${page.url()}`);
  const userInput = await page.$('input[type="text"], input[type="tel"], input[name*="user"], input[name*="phone"]');
  if (userInput) {
    await userInput.fill(CONFIG.USERNAME);
    await passInput.fill(CONFIG.PASSWORD);
    await page.waitForTimeout(400);
    await page.click('button[type="submit"], button.btn-submit-form, button:has-text("Đăng nhập")').catch(() => {});
    console.log("   ⏳ Cho SSO redirect...");
    // Cho toi khi vao crm
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      if (page.url().includes("/crm/") && !page.url().includes("/login")) break;
    }
    await page.waitForTimeout(3000);
  }
}

try {
  await page.waitForSelector('text=Chọn vai trò', { timeout: 6000 });
  console.log("👤 Pick role...");
  const picked = await page.evaluate(() => {
    const items = document.querySelectorAll(".item--role");
    for (const it of items) {
      if (it.textContent?.includes("Ban giám đốc")) { it.click(); return "Ban giám đốc"; }
    }
    items[0]?.click();
    return items[0]?.textContent?.trim() ?? "first";
  });
  console.log(`   picked: ${picked}`);
  await page.waitForTimeout(500);
  await page.click('button:has-text("Xác nhận")').catch(() => {});
  await page.waitForTimeout(5000);
} catch { /* no modal */ }

console.log("📃 Vao hub /member_list de chup anh + trigger session...");
await page.goto(`${BASE}/member_list`, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
await page.waitForTimeout(4000);

// Click card de vao list
await page.evaluate(() => {
  const cards = document.querySelectorAll(".item-menu");
  for (const c of cards) {
    if (c.textContent?.includes("Danh sách thành viên")) { c.click(); return; }
  }
});
await page.waitForTimeout(6000);

// Goi API truc tiep qua context.request — mang theo cookie cua session
console.log("\n🔎 Goi API truc tiep /market/loyaltyWallet/list...");
const cookies = await context.cookies();
const token = cookies.find(c => c.name === "token")?.value;
const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
const selectedRole = await page.evaluate(() => localStorage.getItem("SelectedRole"));

const reqUrl = "https://biz.reborn.vn/market/loyaltyWallet/list?page=1&limit=10";
console.log(`   GET ${reqUrl}`);
console.log(`   SelectedRole: ${selectedRole ?? "null"}`);

try {
  const apiRes = await context.request.get(reqUrl, {
    headers: {
      "Cookie": cookieHeader,
      "Authorization": token ? `Bearer ${token}` : "",
      "Selectedrole": selectedRole ?? "",
      "Hostname": "kcn.reborn.vn",
      "Accept": "application/json",
    },
    timeout: 15000,
  });
  console.log(`   status: ${apiRes.status()}`);
  const txt = await apiRes.text();
  try {
    walletPayload = JSON.parse(txt);
  } catch {
    console.log(`   body (khong phai JSON): ${txt.slice(0, 200)}`);
  }
} catch (e) {
  console.log(`   loi: ${e.message}`);
}

console.log(`\n📊 ${apiCalls.length} API calls:`);
apiCalls.slice(-15).forEach(c => console.log(`  ${c.status} ${c.url}`));

const rows = await page.evaluate(() => {
  const trs = document.querySelectorAll(".box-table tbody tr, table tbody tr");
  return Array.from(trs).slice(0, 10).map(tr => {
    const tds = tr.querySelectorAll("td");
    return Array.from(tds).map(td => td.innerText.trim());
  });
});

console.log("\n=== DOM TABLE (10 row dau) ===");
rows.forEach((r, i) => console.log(`[${i + 1}]`, r.slice(0, 5)));

console.log("\n=== API /market/loyaltyWallet/list ===");
if (walletPayload?.result?.items) {
  const items = walletPayload.result.items.slice(0, 10);
  const withName = items.filter(it => it.customerName && it.customerName.trim()).length;
  const total = items.length;
  console.log(`customerName có: ${withName}/${total}\n`);
  items.forEach((it, i) => {
    console.log(`[${i + 1}] id=${it.customerId} name="${it.customerName ?? "NULL"}" points=${it.totalEarn ?? 0} tier=${it.segmentName ?? "—"}`);
  });

  if (withName === total) {
    console.log("\n✅ PASS — Tất cả row đều có customerName");
  } else if (withName === 0) {
    console.log("\n❌ FAIL — Không row nào có customerName (BE vẫn trả null)");
  } else {
    console.log(`\n⚠️  PARTIAL — ${withName}/${total} có name, còn lại null`);
  }
} else {
  console.log("❌ Không bắt được response loyaltyWallet/list");
}

const shotPath = `tests/screenshots/member-list-verify-${Date.now()}.png`;
await page.screenshot({ path: shotPath, fullPage: false });
console.log(`\n📸 ${shotPath}`);

await page.waitForTimeout(1500);
await browser.close();
