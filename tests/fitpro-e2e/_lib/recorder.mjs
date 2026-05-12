/**
 * FitPro E2E Recorder — chạy 1 role flow, sinh video + screenshots + caption manifest.
 *
 * Usage:
 *   import { createRoleRecorder } from "./_lib/recorder.mjs";
 *   const r = await createRoleRecorder({ role: "master", title: "Master BO / Founder" });
 *   await r.step({ url: "/dashboard", caption: "..." });
 *   ...
 *   await r.done(); // close browser, return manifest
 *
 * Output:
 *   tests/fitpro-e2e/output/<role>/
 *     screenshots/01-...png ...
 *     video/<auto>.webm   ← Playwright tự đặt tên
 *     manifest.json       ← steps + paths cho slideshow builder
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "../../config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_OUT = path.join(__dirname, "..", "output");

export async function createRoleRecorder({ role, title }) {
  const outDir = path.join(ROOT_OUT, role);
  const shotsDir = path.join(outDir, "screenshots");
  const videoDir = path.join(outDir, "video");
  fs.mkdirSync(shotsDir, { recursive: true });
  fs.mkdirSync(videoDir, { recursive: true });
  // Wipe old screenshots (giữ video cũ vì Playwright tự rename)
  for (const f of fs.readdirSync(shotsDir)) fs.unlinkSync(path.join(shotsDir, f));

  const statePath = path.join(__dirname, "..", "..", ".auth-state.json");
  const hasState = fs.existsSync(statePath);
  if (!hasState) {
    throw new Error("Thiếu .auth-state.json — chạy trước: node tests/login-save.mjs");
  }

  const browser = await chromium.launch({ headless: CONFIG.HEADLESS, slowMo: 80 });
  const context = await browser.newContext({
    viewport: CONFIG.VIEWPORT,
    storageState: statePath,
    extraHTTPHeaders: { Hostname: "kcn.reborn.vn" },
    recordVideo: { dir: videoDir, size: CONFIG.VIEWPORT },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.ACTION_TIMEOUT);

  const steps = [];
  let stepIdx = 0;

  async function dismissTour() {
    for (let i = 0; i < 4; i++) {
      let clicked = false;
      try {
        clicked = await page.evaluate(() => {
          const btns = [...document.querySelectorAll("button")];
          const t = btns.find((b) => {
            const txt = (b.innerText || "").trim();
            return (txt === "✕" || txt === "×" || txt === "X" || /Bỏ qua|Đóng|skip/i.test(txt)) && b.offsetHeight > 0;
          });
          if (t) { t.click(); return true; }
          return false;
        });
      } catch { break; }
      if (!clicked) break;
      await page.waitForTimeout(300);
    }
    try {
      await page.evaluate(() => {
        const sels = ['.tour-overlay', '[class*="tour-overlay"]', '.tour-tooltip', '[class*="tour-tooltip"]', '[class*="welcome-tour"]', '[class*="onboarding"]', '.modal-backdrop', '.modal.page__choose--role'];
        for (const s of sels) document.querySelectorAll(s).forEach((el) => el.remove());
        const modals = [...document.querySelectorAll('.modal, [role="dialog"]')];
        for (const m of modals) {
          if ((m.innerText || "").includes("Chào mừng đến Reborn CRM")) m.remove();
        }
      });
    } catch {}
  }

  /**
   * step({ url, caption, action?, waitMs?, name? })
   * - url     : route bắt đầu bằng "/" hoặc đầy đủ. Nếu trùng url hiện tại → skip navigate.
   * - caption : VN, hiển thị dưới slide.
   * - action  : optional async (page) => void, chạy SAU navigate, TRƯỚC screenshot.
   * - waitMs  : optional, đợi thêm trước screenshot (default 1500ms).
   * - name    : optional slug cho file (default: stepIdx + slug từ caption).
   */
  async function step({ url, caption, action, waitMs = 1500, name }) {
    stepIdx += 1;
    const idx = String(stepIdx).padStart(2, "0");
    const slug = name || `step-${idx}`;
    const fileName = `${idx}-${slug}.png`;
    const targetUrl = url.startsWith("http") ? url : `${CONFIG.BASE_URL}${url}`;
    const currentUrl = page.url();
    if (currentUrl !== targetUrl) {
      try {
        await page.goto(targetUrl, { waitUntil: "load", timeout: CONFIG.NAVIGATION_TIMEOUT });
      } catch (e) {
        console.warn(`  [${role}/${idx}] goto err: ${e.message}`);
      }
      await page.waitForTimeout(2200);
      await dismissTour();
    }
    if (action) {
      try { await action(page); } catch (e) { console.warn(`  [${role}/${idx}] action err: ${e.message}`); }
    }
    await page.waitForTimeout(waitMs);
    const shotPath = path.join(shotsDir, fileName);
    try {
      await page.screenshot({ path: shotPath, fullPage: false });
    } catch (e) {
      console.warn(`  [${role}/${idx}] screenshot err: ${e.message}`);
    }
    steps.push({ idx: stepIdx, file: `screenshots/${fileName}`, caption, url: page.url() });
    console.log(`  ✓ [${role}/${idx}] ${caption.slice(0, 80)}`);
  }

  async function done() {
    await context.close();
    await browser.close();
    // Tìm file video vừa sinh (Playwright đặt tên random)
    const videos = fs.readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
    const videoFile = videos.sort().pop() || null;
    const manifest = {
      role,
      title,
      generated_at: new Date().toISOString(),
      base_url: CONFIG.BASE_URL,
      video: videoFile ? `video/${videoFile}` : null,
      steps,
    };
    fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    return manifest;
  }

  return { page, step, done, dismissTour };
}
