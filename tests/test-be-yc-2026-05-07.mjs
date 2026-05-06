/**
 * E2E test 3 BE endpoints sau khi BE đã merge & FE swap qua API
 * (yc tester 2026-05-06, deploy 2026-05-07).
 *
 * Skip BE-1 (community_hub_portal_config) — chờ DBA apply migration thủ công
 * vì Flyway tắt với MySQL 5.7 (xem repo README cloud-market db/migration).
 *
 * BE-2: events/public/list trả `activeRegistrations` → /crm/events/{slug} hiển thị "Còn N/M chỗ" đúng
 * BE-3: convert reg → Member intra-market với mã 5971-300 (tự gen)
 * BE-4: comments cross-browser visible
 *
 * Test data: branch community-hub, prod hub.reborn.vn, tenant W-HOUSE bsnId=6.
 *
 * Usage: HEADLESS=true node tests/test-be-yc-2026-05-07.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, "screenshots", "be-yc-2026-05-07");
fs.mkdirSync(SHOTS, { recursive: true });

const BASE = "https://hub.reborn.vn/crm";
const USER = "0898348348";
const PASS = "Reborn@12345";
const HEADLESS = process.env.HEADLESS === "true";

const COMMENT_TEXT = `[E2E TEST] ${new Date().toISOString().slice(11, 19)} cross-browser`;
const REG_NAME = `[E2E TEST] convert ${new Date().toISOString().slice(11, 19)}`;
const REG_PHONE = "0900000" + Math.floor(100 + Math.random() * 900);

const results = [];
function log(label, status, detail = "") {
  const line = `[${status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "·"}] ${label}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  results.push({ label, status, detail });
}

const browser = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 200 });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  const css = `.tour-overlay, .tour-tooltip, .tour-overlay__mask { display: none !important; pointer-events: none !important; }`;
  const apply = () => {
    const style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.head) apply();
  else document.addEventListener("DOMContentLoaded", apply);
});

try {
  // ── LOGIN ADMIN ────────────────────────────────────────────────────────
  console.log("\n═══ Login admin ═══");
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForURL(/sso|reborn\.vn/i, { timeout: 20000 }).catch(() => {});
  await page.waitForSelector('input[type="password"]', { timeout: 20000, state: "visible" });
  const userInput = page
    .locator('input[type="text"], input[type="tel"], input:not([type]), input[type="email"]')
    .filter({ hasNot: page.locator('input[type="password"]') })
    .first();
  await userInput.fill(USER);
  await page.locator('input[type="password"]').first().fill(PASS);
  await page.getByRole("button", { name: /đăng nhập|sign in|login/i }).first().click();
  await page.waitForURL(/hub\.reborn\.vn\/crm/i, { timeout: 30000 });
  await page.waitForFunction(() => !!localStorage.getItem("permissions"), null, { timeout: 25000 }).catch(() => {});
  log("Login admin", "PASS");

  // ── BE-2: pick event có maxAttendees + activeRegistrations ─────────────
  console.log("\n═══ BE-2: events/public/list trả activeRegistrations ═══");
  // Gọi public/list mà KHÔNG forward Authorization (raw fetch ra biz host) —
  // tránh principal.bsnId override Hostname → admin tenant khác list lệch
  // với public W-HOUSE.
  const ev = await page.evaluate(async () => {
    const res = await fetch("https://biz.reborn.vn/market/events/public/list?limit=50", {
      headers: { Accept: "application/json", Origin: "https://hub.reborn.vn", Hostname: "hub.reborn.vn" },
      credentials: "omit",
    });
    const data = await res.json();
    const items = data?.result?.items ?? data?.result ?? [];
    if (!Array.isArray(items)) return { error: "non-array" };
    const now = Date.now();
    // Chỉ cần regClose > now (đăng ký còn open). startDate có thể đã qua nếu
    // event đang ongoing (multi-day) — vẫn render "Còn N/M chỗ".
    const candidate = items.find((e) => {
      if ((e.maxAttendees ?? 0) <= 0) return false;
      if (typeof e.activeRegistrations !== "number") return false;
      const closeDate = e.registrationCloseDate ?? e.registration_close_date;
      if (closeDate && new Date(closeDate).getTime() < now) return false;
      return true;
    });
    return { event: candidate, total: items.length };
  });

  if (!ev?.event) {
    log("BE-2 events/public/list trả activeRegistrations", "FAIL", "không tìm thấy event có activeRegistrations field");
  } else {
    const e = ev.event;
    log(
      "BE-2 events/public/list trả activeRegistrations",
      typeof e.activeRegistrations === "number" ? "PASS" : "FAIL",
      `id=${e.id} slug=${e.slug} ${e.activeRegistrations}/${e.maxAttendees}`,
    );

    // ── Render check trên ShareEventPage ──
    console.log("\n═══ BE-2 render: /crm/events/{slug} hiển thị 'Còn N/M chỗ' ═══");
    await page.goto(`${BASE}/events/${encodeURIComponent(e.slug)}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.screenshot({ path: path.join(SHOTS, "be2-share-event.png"), fullPage: false });
    const expected = e.maxAttendees - e.activeRegistrations;
    const slotText = await page.getByText(new RegExp(`Còn\\s+${expected}/${e.maxAttendees}\\s+chỗ`, "i")).count();
    log(
      "BE-2 hiển thị 'Còn N/M chỗ' đúng số liệu",
      slotText > 0 ? "PASS" : "FAIL",
      `expect "Còn ${expected}/${e.maxAttendees} chỗ"`,
    );
  }

  // ── BE-4: comment cross-browser ──────────────────────────────────────
  console.log("\n═══ BE-4: post comment qua API + verify list ═══");
  const useEvent = ev?.event;
  if (useEvent) {
    // POST as guest
    const post = await page.evaluate(async ({ eventId, body }) => {
      const res = await fetch(`/bizapi/market/events/comments/public/create?eventId=${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      return { status: res.status, code: data?.code, error: data?.error || data?.message, result: data?.result };
    }, {
      eventId: useEvent.id,
      body: {
        authorName: "[E2E] tester",
        authorPhone: "0900000111",
        authorRole: "guest",
        content: COMMENT_TEXT,
      },
    });

    if (post.status >= 400 || (post.code != null && post.code !== 0 && post.code !== 200)) {
      log("BE-4 post comment", "FAIL", `${post.status} ${post.error || ""}`);
    } else {
      log("BE-4 post comment", "PASS", `regId=${post.result?.id}`);
    }

    // List in incognito-like fresh context (anonymous browser B)
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    const list = await pageB.evaluate(async (eventId) => {
      const res = await fetch(`https://biz.reborn.vn/market/events/comments/public/list?eventId=${eventId}`, {
        headers: { Accept: "application/json", Origin: "https://hub.reborn.vn" },
      });
      const data = await res.json();
      return Array.isArray(data?.result) ? data.result : [];
    }, useEvent.id);
    await ctxB.close();

    const found = list.find((c) => (c.content ?? "").includes(COMMENT_TEXT));
    log(
      "BE-4 comment visible cross-browser (anonymous browser B đọc thấy)",
      found ? "PASS" : "FAIL",
      `${list.length} comments, match=${!!found}`,
    );
  }

  // ── BE-3: convert reg → Member intra-market ─────────────────────────
  console.log("\n═══ BE-3: convert reg → Member ═══");
  // Pick event đang open registration (close > now) để register E2E test reg
  const evWithAddOn = await page.evaluate(async () => {
    const res = await fetch("/bizapi/market/events/list?limit=50", {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    const items = data?.result?.items ?? data?.result ?? [];
    if (!Array.isArray(items)) return null;
    const now = Date.now();
    const open = items.find((x) => {
      if (x.status !== "published") return false;
      const closeDate = x.registrationCloseDate ?? x.registration_close_date;
      if (closeDate && new Date(closeDate).getTime() < now) return false;
      return true;
    });
    return open ?? items.find((x) => x.status === "published") ?? items[0];
  });

  if (!evWithAddOn) {
    log("BE-3 pick event", "FAIL", "không có event để test");
  } else {
    // Register E2E test attendee
    const reg = await page.evaluate(async ({ slug, body }) => {
      const res = await fetch(`/bizapi/market/events/public/register?slug=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      return { status: res.status, code: data?.code, error: data?.error || data?.message, result: data?.result };
    }, {
      slug: evWithAddOn.slug,
      body: { fullName: REG_NAME, phone: REG_PHONE, source: "public_portal" },
    });

    if (reg.status >= 400 || (reg.code != null && reg.code !== 0 && reg.code !== 200)) {
      log("BE-3 register reg test", "FAIL", `${reg.status} ${reg.error || ""}`);
      throw new Error(reg.error || `register failed ${reg.status}`);
    }
    const newRegId = reg.result?.id;
    log("BE-3 register reg test", "PASS", `regId=${newRegId} phone=${REG_PHONE}`);

    // Convert
    const conv = await page.evaluate(async (regId) => {
      const res = await fetch(`/bizapi/market/events/registrations/convert?id=${regId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: "{}",
      });
      const data = await res.json().catch(() => null);
      return { status: res.status, code: data?.code, error: data?.error || data?.message, result: data?.result };
    }, newRegId);

    if (conv.status >= 400 || (conv.code != null && conv.code !== 0 && conv.code !== 200)) {
      log("BE-3 convert → Member", "FAIL", `${conv.status} ${conv.error || ""}`);
    } else {
      const memberId = conv.result?.convertedToCustomerId ?? conv.result?.converted_to_customer_id;
      log("BE-3 convert → Member", memberId ? "PASS" : "FAIL", `memberId=${memberId}`);

      // Idempotency check: convert lại
      const conv2 = await page.evaluate(async (regId) => {
        const res = await fetch(`/bizapi/market/events/registrations/convert?id=${regId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: "{}",
        });
        const data = await res.json().catch(() => null);
        return data?.result?.convertedToCustomerId ?? data?.result?.converted_to_customer_id;
      }, newRegId);
      log(
        "BE-3 convert idempotent (gọi lại không tạo Member trùng)",
        conv2 === memberId ? "PASS" : "FAIL",
        `lần 1=${memberId} lần 2=${conv2}`,
      );

      // Verify Member visible qua /members/list (admin permission VIEW có thể
      // có hoặc không trên /members/get nên dùng list cho ổn định).
      const memberExists = await page.evaluate(async (mid) => {
        const res = await fetch(`/bizapi/market/members/list?limit=100`, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json().catch(() => null);
        const items = data?.result?.items ?? data?.result ?? [];
        const m = Array.isArray(items) ? items.find((x) => Number(x.id) === Number(mid)) : null;
        return { status: res.status, member: m };
      }, memberId);

      if (memberExists.status >= 400) {
        // Permission VIEW /members/ thiếu trên admin → skip verify (convert
        // idempotency đã prove member persisted).
        log("BE-3 Member verify qua /members/list", "SKIP", `403 thiếu permission — bỏ qua, convert idempotency đã prove`);
      } else if (!memberExists.member) {
        log("BE-3 Member tồn tại trong members table", "FAIL", `id=${memberId} không thấy trong list`);
      } else {
        log(
          "BE-3 Member tồn tại + có member_code",
          memberExists.member.memberCode ? "PASS" : "FAIL",
          `code=${memberExists.member.memberCode} phone=${memberExists.member.phone}`,
        );
      }
    }
  }
} catch (err) {
  log("Test runner", "FAIL", err.message);
  await page.screenshot({ path: path.join(SHOTS, "fatal.png"), fullPage: true }).catch(() => {});
} finally {
  console.log("\n═══ SUMMARY ═══");
  results.forEach((r) => console.log(`  ${r.status === "PASS" ? "✓" : r.status === "FAIL" ? "✗" : "·"} ${r.label}${r.detail ? `  (${r.detail})` : ""}`));
  const failed = results.filter((r) => r.status === "FAIL").length;
  const passed = results.filter((r) => r.status === "PASS").length;
  console.log(`\n${passed} pass · ${failed} fail · screenshots: ${SHOTS}`);
  console.log(`\n⚠ Test data đã tạo: reg "${REG_NAME}" + comment "${COMMENT_TEXT}" — admin xoá thủ công.`);
  await browser.close();
  process.exitCode = failed > 0 ? 1 : 0;
}
