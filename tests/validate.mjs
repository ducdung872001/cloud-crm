import { chromium } from "playwright";

const BASE = "http://localhost:4000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

let pass = 0;
let fail = 0;
const results = [];

async function check(label, fn) {
  try {
    await fn();
    pass++;
    results.push(`✓ ${label}`);
  } catch (e) {
    fail++;
    results.push(`✗ ${label} — ${e.message}`);
  }
}

// ============ Login: empty submit should show errors ============
await check("Login rejects empty submit", async () => {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const errors = await page.$$eval(".field-error", (els) => els.map((e) => e.textContent));
  if (errors.length < 2) throw new Error(`expected ≥2 errors, got ${errors.length}: ${JSON.stringify(errors)}`);
});

await check("Login rejects bad email", async () => {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "not-an-email");
  await page.fill('input[type="password"]', "abc");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const errors = await page.$$eval(".field-error", (els) => els.map((e) => e.textContent));
  const hasEmailErr = errors.some((e) => e && e.toLowerCase().includes("email"));
  if (!hasEmailErr) throw new Error("no email error shown: " + JSON.stringify(errors));
});

// ============ Reset password: mismatch ============
await check("Reset password catches mismatch", async () => {
  await page.goto(`${BASE}/reset-password`, { waitUntil: "networkidle" });
  const inputs = await page.$$('input[type="password"]');
  if (inputs.length < 2) throw new Error("expected 2 password inputs");
  await inputs[0].fill("ValidPass123");
  await inputs[1].fill("DifferentPass123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const errors = await page.$$eval(".field-error", (els) => els.map((e) => e.textContent).join(" | "));
  if (!errors.toLowerCase().includes("không khớp"))
    throw new Error("no mismatch error: " + errors);
});

await check("Reset password rejects weak", async () => {
  await page.goto(`${BASE}/reset-password`, { waitUntil: "networkidle" });
  const inputs = await page.$$('input[type="password"]');
  await inputs[0].fill("abc");
  await inputs[1].fill("abc");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const errors = await page.$$eval(".field-error", (els) => els.map((e) => e.textContent).join(" | "));
  if (!errors.toLowerCase().includes("tối thiểu 8"))
    throw new Error("no weak error: " + errors);
});

// ============ Forgot password: invalid email ============
await check("Forgot password rejects bad email", async () => {
  await page.goto(`${BASE}/forgot-password`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "bad-email");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const errors = await page.$$eval(".field-error", (els) => els.map((e) => e.textContent));
  if (errors.length === 0) throw new Error("no error shown");
});

// ============ Project Wizard: step 1 validation ============
await check("Project Wizard step 1 validates code format", async () => {
  await page.goto(`${BASE}/hub`, { waitUntil: "networkidle" });
  await page.click('button:has-text("Tạo project mới")');
  await page.waitForSelector(".modal");
  await page.fill('input[placeholder="Mega Mart DOOH"]', "Test Project");
  await page.fill('input[placeholder*="MEGAMART"]', "lowercase-code");
  await page.click('button.primary:has-text("Tiếp theo")');
  await page.waitForTimeout(300);
  const errors = await page.$$eval(".modal .field-error", (els) => els.map((e) => e.textContent).join(" | "));
  if (!errors.includes("HOA") && !errors.toLowerCase().includes("hoa"))
    throw new Error("no code format error: " + errors);
});

// ============ Client form: required fields ============
await check("Client form rejects empty", async () => {
  await page.goto(`${BASE}/clients`, { waitUntil: "networkidle" });
  await page.click('button:has-text("Thêm khách hàng")');
  await page.waitForSelector(".modal");
  await page.click('.modal button.primary:has-text("Lưu")');
  await page.waitForTimeout(300);
  const errors = await page.$$eval(".modal .field-error", (els) => els.map((e) => e.textContent));
  if (errors.length < 2) throw new Error(`expected ≥2 errors, got ${errors.length}`);
});

// ============ Team invite: empty emails ============
await check("Team invite rejects no emails", async () => {
  await page.goto(`${BASE}/team`, { waitUntil: "networkidle" });
  await page.click('button:has-text("Mời thành viên")');
  await page.waitForSelector(".modal");
  await page.click('.modal button.primary');
  await page.waitForTimeout(300);
  const errors = await page.$$eval(".modal .field-error", (els) => els.map((e) => e.textContent).join(" | "));
  if (!errors.toLowerCase().includes("email"))
    throw new Error("no email error: " + errors);
});

await browser.close();

console.log("=".repeat(60));
console.log("VALIDATION E2E REPORT");
console.log("=".repeat(60));
results.forEach((r) => console.log(r));
console.log("");
console.log(`TOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
