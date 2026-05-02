// Login local dev (vite :4000) bằng cách:
// 1) POST authenticator/user/authenticate qua HTTPS prod để lấy JWT token
// 2) Set cookie `token` trên origin localhost:4000
// 3) Navigate /crm/login → app sẽ tự fetch profile/permissions qua proxy đến reborn.vn (proxy đã cấu hình VITE_BE_PROXY)
// 4) Save storageState cho Playwright e2e
//
// Yêu cầu: dev server phải start với VITE_BE_PROXY=https://reborn.vn npm run dev
import { chromium, request as pwRequest } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, ".auth-state-local.json");

const APP_BASE = process.env.APP_BASE || "http://localhost:4000/crm";
const AUTH_ENDPOINT = process.env.AUTH_ENDPOINT || "https://reborn.vn/authenticator/user/authenticate";
const PHONE = process.env.TEST_USER || "0971234599";
const PASS = process.env.TEST_PASS || "Reborn@12345";

console.log(`[login-local] APP_BASE=${APP_BASE}  phone=${PHONE}`);

// Step 1 — fetch token directly from prod authenticator
const ctxApi = await pwRequest.newContext();
const authRes = await ctxApi.post(AUTH_ENDPOINT, {
  data: { phone: PHONE, plainPassword: PASS },
  headers: { "Content-Type": "application/json" },
});
const authJson = await authRes.json();
if (authJson.code !== 0 || !authJson?.result?.token) {
  console.error("[login-local] ❌ authenticate failed:", JSON.stringify(authJson).slice(0, 400));
  process.exit(1);
}
const TOKEN = authJson.result.token;
console.log("[login-local] ✅ got token (length=" + TOKEN.length + ")");

// Step 2 — open browser, set cookie, navigate
const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

await context.addCookies([
  {
    name: "token",
    value: TOKEN,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  },
]);

const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("[pageerror] " + e.message));
page.on("requestfailed", (r) => errors.push(`[reqfail ${r.method()} ${r.url().slice(0, 100)}] ${r.failure()?.errorText}`));

try {
  await page.goto(`${APP_BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log("[login-local] navigated /login, url=", page.url());

  // Wait for app to fetch profile/permissions
  const ok = await page.waitForFunction(
    () => !!localStorage.getItem("permissions"),
    null,
    { timeout: 30000 },
  ).then(() => true).catch(() => false);

  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  const role = await page.evaluate(() => localStorage.getItem("SelectedRole")).catch(() => null);
  const hasPerm = await page.evaluate(() => !!localStorage.getItem("permissions")).catch(() => false);
  console.log(`[login-local] hasPermissions=${hasPerm} role=${role} url=${page.url()}`);

  if (!hasPerm) {
    console.error("[login-local] ❌ permissions chưa load");
    console.error("ERRORS:", errors.slice(0, 10).join("\n"));
    await page.screenshot({ path: path.join(__dirname, "screenshots", "login-local-failed.png"), fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } else {
    await context.storageState({ path: STATE_PATH });
    console.log(`[login-local] ✅ saved → ${STATE_PATH}`);
  }
} finally {
  await browser.close();
}
