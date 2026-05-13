import { Page, BrowserContext } from "@playwright/test";
import fs from "fs";
import path from "path";

const PHONE = process.env.E2E_PHONE || "0971234599";
const PASSWORD = process.env.E2E_PASSWORD || "Reborn@12345";

// CRM_URL env: chuyển giữa local (http://localhost:4000) và prod (https://tnpm.reborn.vn)
export const CRM = (process.env.CRM_URL || "http://localhost:4000").replace(/\/+$/, "");
const CRM_HOST = new URL(CRM).host;

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
    // Cần load 1 trang trên CRM_HOST trước khi set localStorage
    await page.goto(`${CRM}/crm/dashboard`, { waitUntil: "commit", timeout: 30_000 });
    if (Object.keys(state.localStorage).length > 0) {
      await page.evaluate((items) => {
        for (const [k, v] of Object.entries(items)) {
          try { localStorage.setItem(k, v as string); } catch {}
        }
      }, state.localStorage);
    }
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(3500);

    // Verify: nếu vẫn ở /crm/login hoặc bị redirect ra SSO → auth không valid
    const url = page.url();
    const stillOnLogin = url.includes("/crm/login") || url.includes("localhost:8080") || /\/\/sso\./.test(url);
    if (stillOnLogin) {
      console.log("[auth-cache] restore failed — vẫn ở login, sẽ full login");
      return false;
    }
    console.log(`[auth-cache] restored OK → ${url}`);
    return true;
  } catch (e) {
    console.log(`[auth-cache] restore error: ${(e as Error).message}`);
    return false;
  }
}

async function fullSsoLogin(page: Page) {
  await page.goto(`${CRM}/crm/login`, { waitUntil: "commit", timeout: 60_000 }).catch(() => {});
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

    // Role chooser — tolerant
    const roleSelectors = [
      'text="Ban giám đốc"',
      'text=/giám đốc/i',
      'text=/admin/i',
      '.role-card, [class*="role" i]',
    ];
    for (const sel of roleSelectors) {
      const card = page.locator(sel).first();
      if (await card.isVisible().catch(() => false)) {
        await page.evaluate(() => {
          document.querySelectorAll(".tour-tooltip, [class*='tour' i]").forEach((el) => el.remove());
        });
        await card.click({ force: true }).catch(() => {});
        const confirm = page.locator('button:has-text("Xác nhận"), button:has-text("OK")').first();
        if (await confirm.isVisible().catch(() => false)) await confirm.click({ force: true });
        await page.waitForTimeout(6000);
        break;
      }
    }
  }
  await page.waitForURL(/\/crm\//, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

export async function loginAsBanGiamDoc(page: Page) {
  const context = page.context();
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
    await page.goto(`${CRM}/crm${routePath}`, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(2500);
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
