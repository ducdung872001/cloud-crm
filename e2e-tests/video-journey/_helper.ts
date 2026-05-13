import { Page } from "@playwright/test";

const PHONE = "0971234599";
const PASSWORD = "Reborn@12345";
export const CRM = "http://localhost:4000";

export async function loginAsBanGiamDoc(page: Page) {
  await page.goto(`${CRM}/crm/login`, { waitUntil: "commit", timeout: 60_000 }).catch(() => {});
  await page
    .waitForFunction(
      () => location.host.includes("localhost:8080") && !!document.querySelector('input[type="password"]'),
      undefined,
      { timeout: 60_000 }
    )
    .catch(() => {});

  if (page.url().includes("localhost:8080")) {
    await page.locator('input[type="text"], input[type="tel"]').first().fill(PHONE);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForFunction(() => location.host.includes("localhost:4000"), undefined, { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(5000);

    const roleCard = page.locator('text="Ban giám đốc"').first();
    if (await roleCard.isVisible().catch(() => false)) {
      await page.evaluate(() => {
        document.querySelectorAll(".tour-tooltip, [class*='tour' i]").forEach((el) => el.remove());
      });
      await roleCard.click({ force: true });
      const confirm = page.locator('button:has-text("Xác nhận")').first();
      if (await confirm.isVisible().catch(() => false)) await confirm.click({ force: true });
      await page.waitForTimeout(6000);
    }
  }
  // ensure we're at dashboard
  await page.waitForURL(/\/crm\/dashboard|\/crm\/$|\/crm\/projects/, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

export interface RoleInfo {
  index: number;        // 1-7
  total: number;        // 7
  shortName: string;    // "CĐT"
  longName: string;     // "Chủ đầu tư"
  description: string;  // one-line tagline
  color: string;        // hex without #
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
        // Remove existing if any
        document.getElementById("__pw_role_badge__")?.remove();
        document.getElementById("__pw_caption_bar__")?.remove();

        // Role badge — top-left
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

        // Caption bar — bottom
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
  path: string,
  holdMs = 9000
) {
  // Navigate first (overlay will be wiped by reload)
  if (path) {
    await page.goto(`${CRM}/crm${path}`, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(2500); // let SPA render
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
  await page.waitForTimeout(2500); // let user read first
  try {
    await action(page);
  } catch (e) {
    /* keep recording */
  }
  await page.waitForTimeout(2000);
  // re-inject in case modal/page changed
  await injectOverlay(page, role, stepNum, totalSteps, narration);
  await page.waitForTimeout(holdMs - 2500);
}
