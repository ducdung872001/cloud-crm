import { Page, BrowserContext } from "@playwright/test";
import fs from "fs";
import path from "path";

const PHONE = process.env.E2E_PHONE || "0971234599";
const PASSWORD = process.env.E2E_PASSWORD || "Reborn@12345";

// CRM_URL env: chuyển giữa local (http://localhost:4000) và prod (https://tnpm.reborn.vn)
export const CRM = (process.env.CRM_URL || "http://localhost:4000").replace(/\/+$/, "");
const CRM_HOST = new URL(CRM).host;

// ─── E2E demo bypasses (chạy trên mọi page trong context) ───────────────────
// 1) Mark onboarding "login" tour done với mọi userId → tắt hẳn welcome tour
// 2) Hide gold-package expiration banner (CSS) → demo sạch không banner đỏ
// 3) Hide tour overlay residue nếu user lỡ kích hoạt
const DEMO_INIT_SCRIPT = `
(() => {
  try {
    const _get = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
      if (typeof k === "string" && /^reborn_onboarding_.+_login$/.test(k)) return "1";
      return _get.call(this, k);
    };
  } catch (e) {}

  const injectHideCss = () => {
    if (document.getElementById("__pw_demo_hide__")) return;
    const style = document.createElement("style");
    style.id = "__pw_demo_hide__";
    style.textContent = \`
      .notification__warning--package,
      .tour-tooltip, .onboarding-tour, .tour-overlay,
      [class*="onboarding" i], [class*="tour-tooltip" i] {
        display: none !important;
        visibility: hidden !important;
      }
    \`;
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectHideCss, { once: true });
  } else {
    injectHideCss();
  }
})();
`;

// Intercept /employee/info → kéo dài endDate thêm 1 năm để bỏ banner đỏ
async function setupApiIntercepts(context: BrowserContext) {
  await context.route("**/employee/info*", async (route) => {
    try {
      const response = await route.fetch();
      const ct = response.headers()["content-type"] || "";
      if (!ct.includes("application/json")) {
        return route.fulfill({ response });
      }
      const json = await response.json();
      const orgApp = json?.result?.lstOrgApp?.[0];
      if (orgApp) {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        orgApp.endDate = futureDate.toISOString();
      }
      return route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: JSON.stringify(json),
      });
    } catch {
      return route.continue();
    }
  });
}

// Auth cache — sau lần login đầu, lưu cookies + localStorage để các spec sau bypass SSO
const AUTH_FILE = path.join(__dirname, ".auth.json");
const AUTH_TTL_MS = 45 * 60 * 1000; // 45 phút — token reborn.vn thường ≥ 50 phút lifetime

interface AuthState {
  cookies: any[];
  localStorage: Record<string, string>;
  savedAt: number;
  crmHost: string; // để invalidate nếu chuyển local↔prod
}

function readAuthCache(): AuthState | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null;
    const state = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8")) as AuthState;
    const age = Date.now() - state.savedAt;
    if (age > AUTH_TTL_MS) {
      console.log(`[auth-cache] expired (age=${Math.round(age / 60000)}min) — sẽ login lại`);
      return null;
    }
    if (state.crmHost !== CRM_HOST) {
      console.log(`[auth-cache] host mismatch (${state.crmHost} vs ${CRM_HOST}) — login lại`);
      return null;
    }
    return state;
  } catch (e) {
    console.log(`[auth-cache] read error: ${(e as Error).message}`);
    return null;
  }
}

function writeAuthCache(state: AuthState) {
  try {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));
    console.log(`[auth-cache] saved (${state.cookies.length} cookies, ${Object.keys(state.localStorage).length} localStorage keys)`);
  } catch (e) {
    console.log(`[auth-cache] write error: ${(e as Error).message}`);
  }
}

async function captureAuthState(page: Page, context: BrowserContext) {
  const cookies = await context.cookies();
  const localStorage = await page.evaluate(() => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)!;
      obj[k] = window.localStorage.getItem(k) || "";
    }
    return obj;
  }).catch(() => ({}));
  writeAuthCache({ cookies, localStorage, savedAt: Date.now(), crmHost: CRM_HOST });
}

async function restoreAuthState(page: Page, context: BrowserContext, state: AuthState): Promise<boolean> {
  try {
    await context.addCookies(state.cookies);
    // Inject localStorage TRƯỚC khi page load để React đọc được SelectedRole ngay lần đầu
    // (tránh race: page goto → React boot → đọc localStorage rỗng → mở role chooser)
    if (Object.keys(state.localStorage).length > 0) {
      await context.addInitScript((items) => {
        for (const [k, v] of Object.entries(items)) {
          try { localStorage.setItem(k, v as string); } catch {}
        }
      }, state.localStorage);
    }
    await page.goto(`${CRM}/biz-prop/dashboard`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(3500);

    // Verify: nếu vẫn ở /biz-prop/login hoặc bị redirect ra SSO → auth không valid
    const url = page.url();
    const stillOnLogin = url.includes("/biz-prop/login") || url.includes("localhost:8080") || /\/\/sso\./.test(url);
    if (stillOnLogin) {
      console.log("[auth-cache] restore failed — vẫn ở login, sẽ full login");
      return false;
    }
    // Đóng role chooser nếu nó vẫn lỡ mở (do SelectedRole expired hoặc khác user)
    await dismissRoleChooserIfOpen(page);
    console.log(`[auth-cache] restored OK → ${url}`);
    return true;
  } catch (e) {
    console.log(`[auth-cache] restore error: ${(e as Error).message}`);
    return false;
  }
}

// Đóng role chooser nếu nó đang mở. Ưu tiên "Ban giám đốc" theo departmentName,
// fallback theo tên role chứa "giám đốc". Bấm "Xác nhận" sau khi state đã set.
async function dismissRoleChooserIfOpen(page: Page) {
  const modal = page.locator(".page__choose--role");
  if (!(await modal.isVisible().catch(() => false))) return;

  console.log("[role-chooser] visible — đang chọn 'Ban giám đốc'");
  const candidates = [
    '.item--role:has-text("Ban giám đốc")',
    '.item--role:has-text("Ban điều hành")',
    '.item--role:has-text("Giám đốc")',
    '.item--role',
  ];
  let clicked = false;
  for (const sel of candidates) {
    const card = page.locator(sel).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click({ force: true }).catch(() => {});
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    console.log("[role-chooser] không thấy card nào để click");
    return;
  }

  // Đợi state.dataRole set + button Xác nhận enable
  const confirm = page.locator('.page__choose--role button:has-text("Xác nhận")').first();
  await confirm.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  for (let i = 0; i < 10; i++) {
    const disabled = await confirm.getAttribute("disabled").catch(() => null);
    if (disabled === null) break;
    await page.waitForTimeout(300);
  }
  await confirm.click().catch(() => {});
  await page.waitForTimeout(3500);
}

async function fullSsoLogin(page: Page) {
  await page.goto(`${CRM}/biz-prop/login`, { waitUntil: "commit", timeout: 60_000 }).catch(() => {});
  await page
    .waitForFunction(
      (crmHost) => {
        const onSso =
          (location.host.startsWith("localhost:") && location.host !== crmHost) ||
          location.hostname.startsWith("sso.");
        return onSso && !!document.querySelector('input[type="password"]');
      },
      CRM_HOST,
      { timeout: 60_000 }
    )
    .catch(() => {});

  const url = page.url();
  const isOnSso = url.includes("localhost:8080") || /\/\/sso\./.test(url);
  if (isOnSso) {
    await page.locator('input[type="text"], input[type="tel"]').first().fill(PHONE);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForFunction((host) => location.host === host, CRM_HOST, { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(5000);
  }
  await page.waitForURL(/\/crm\//, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(3000);
  // Role chooser có thể mở dù SSO hay không (local dev có thể đã có session sẵn)
  await dismissRoleChooserIfOpen(page);
  await page.waitForTimeout(2000);
}

export async function loginAsBanGiamDoc(page: Page) {
  const context = page.context();

  // Setup TRƯỚC mọi thao tác: tắt tour + ẩn banner gói + gia hạn endDate qua intercept
  await context.addInitScript(DEMO_INIT_SCRIPT);
  await setupApiIntercepts(context);

  const cached = readAuthCache();

  if (cached) {
    const ok = await restoreAuthState(page, context, cached);
    if (ok) return;
  }

  // Cache miss hoặc invalid → full SSO login
  console.log("[auth-cache] doing full SSO login...");
  await fullSsoLogin(page);

  // Lưu cache cho lần sau
  await captureAuthState(page, context);
}

// ─── Overlay helpers (caption + role badge) ─────────────────────────────────

export interface RoleInfo {
  index: number;
  total: number;
  shortName: string;
  longName: string;
  description: string;
  color: string;
}

export async function injectOverlay(
  page: Page,
  role: RoleInfo,
  stepNum: number,
  totalSteps: number,
  narration: string
) {
  await page
    .evaluate(
      ({ role, stepNum, totalSteps, narration }) => {
        document.getElementById("__pw_role_badge__")?.remove();
        document.getElementById("__pw_caption_bar__")?.remove();

        const badge = document.createElement("div");
        badge.id = "__pw_role_badge__";
        badge.style.cssText = `
          position: fixed; top: 10px; left: 10px; z-index: 99999999;
          background: linear-gradient(135deg, #${role.color} 0%, #1a1a2e 100%);
          color: #fff; padding: 10px 16px; border-radius: 10px;
          font: 700 13px/1.3 -apple-system, system-ui, sans-serif;
          box-shadow: 0 6px 20px rgba(0,0,0,.35); border: 2px solid rgba(255,255,255,.2);
          pointer-events: none; min-width: 250px;
        `;
        badge.innerHTML = `
          <div style="font-size:10px;opacity:.85;letter-spacing:1px;text-transform:uppercase">
            Role ${role.index}/${role.total} · Step ${stepNum}/${totalSteps}
          </div>
          <div style="font-size:18px;margin-top:2px">${role.longName}</div>
          <div style="font-size:10px;opacity:.75;font-weight:400;margin-top:2px">${role.description}</div>
        `;
        document.body.appendChild(badge);

        const bar = document.createElement("div");
        bar.id = "__pw_caption_bar__";
        bar.style.cssText = `
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999998;
          background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.88) 100%);
          color: #fff; padding: 16px 32px;
          font: 600 16px/1.5 -apple-system, system-ui, sans-serif;
          border-top: 4px solid #${role.color};
          box-shadow: 0 -8px 24px rgba(0,0,0,.4);
          pointer-events: none;
          display: flex; align-items: center; gap: 12px;
        `;
        bar.innerHTML = `
          <span style="font-size:22px;flex-shrink:0">▶</span>
          <span style="flex:1">${narration}</span>
          <span style="font-size:11px;opacity:.5;flex-shrink:0;font-weight:400">tnpm.reborn.vn</span>
        `;
        document.body.appendChild(bar);
      },
      { role, stepNum, totalSteps, narration }
    )
    .catch(() => {});
}

// SPA-style navigation: pushState + popstate để React Router đổi route mà không reload trang
// → không còn màn trắng khi chuyển cảnh trong video. Fallback về page.goto nếu URL không đổi.
async function spaNavigate(page: Page, routePath: string): Promise<boolean> {
  const fullPath = `/crm${routePath}`;
  const currentPath = new URL(page.url()).pathname;
  if (currentPath === fullPath) return true; // đã ở route đó, không cần navigate

  // Snapshot main-content HTML để biết khi nào React đã re-render route mới
  const beforeContentHash = await page
    .evaluate(() => {
      const el = document.querySelector(".main-content__wrapper");
      return el ? el.innerHTML.length : 0;
    })
    .catch(() => 0);

  await page
    .evaluate((p) => {
      window.history.pushState({}, "", p);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, fullPath)
    .catch(() => {});

  // Đợi React thật sự render route mới: URL đổi VÀ content đổi
  const routerNavigated = await page
    .waitForFunction(
      ({ expected, prevLen }) => {
        if (new URL(location.href).pathname !== expected) return false;
        const el = document.querySelector(".main-content__wrapper");
        const curLen = el ? el.innerHTML.length : 0;
        return curLen !== prevLen; // content đã đổi → React Router đã nhận popstate
      },
      { expected: fullPath, prevLen: beforeContentHash },
      { timeout: 3_000 }
    )
    .then(() => true)
    .catch(() => false);

  if (!routerNavigated) {
    // React Router không nhận popstate (hiếm với v7, nhưng phòng hờ) → full reload
    console.log(`[spa-nav] popstate không trigger cho ${fullPath} — fallback page.goto`);
    await page.goto(`${CRM}${fullPath}`, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    return false;
  }

  // Đợi network idle (API call cho route mới settle xong)
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  return true;
}

export async function gotoStep(
  page: Page,
  role: RoleInfo,
  stepNum: number,
  totalSteps: number,
  narration: string,
  routePath: string,
  holdMs = 9000
) {
  if (routePath) {
    const usedSpa = await spaNavigate(page, routePath);
    // SPA nav nhanh (~1.5s đủ React render); full reload fallback cần lâu hơn
    await page.waitForTimeout(usedSpa ? 1500 : 2500);
  }
  await injectOverlay(page, role, stepNum, totalSteps, narration);
  await page.waitForTimeout(holdMs);
}

export async function actionStep(
  page: Page,
  role: RoleInfo,
  stepNum: number,
  totalSteps: number,
  narration: string,
  action: (page: Page) => Promise<void>,
  holdMs = 6000
) {
  await injectOverlay(page, role, stepNum, totalSteps, narration);
  await page.waitForTimeout(2500);
  try {
    await action(page);
  } catch {}
  await page.waitForTimeout(2000);
  await injectOverlay(page, role, stepNum, totalSteps, narration);
  await page.waitForTimeout(Math.max(holdMs - 2500, 2000));
}
