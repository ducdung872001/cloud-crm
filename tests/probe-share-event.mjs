/**
 * Verify ShareEventPage không còn React error #310 sau fix.
 */
import { createTestRunner } from "./helpers.mjs";
import { CONFIG } from "./config.mjs";

(async () => {
  const t = await createTestRunner("SHARE-EVT", "Share Event Page");
  const ok = await t.login();
  if (!ok) return t.done();

  const consoleErrors = [];
  t.page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (!txt.includes("favicon") && !txt.includes("Failed to load resource") && !txt.toLowerCase().includes("websocket")) {
        consoleErrors.push(txt);
      }
    }
  });

  // Dùng slug event id=18 vừa tạo thật
  const slug = "workshop-yoga-cho-ngi-mi-bt-u-test-1776851006595-lt8";
  await t.goto(`/share_event?slug=${slug}`);
  await t.page.waitForTimeout(3500);
  await t.screenshot("share-event-page");

  const bodyText = await t.page.evaluate(() => document.body.innerText || "");

  const hasError = bodyText.includes("Đã xảy ra lỗi");
  const hasEventTitle = bodyText.includes("Workshop Yoga");
  const hasRegisterBtn = bodyText.includes("Đăng ký") || bodyText.includes("đăng ký");

  t.assert("no-error-boundary", !hasError, hasError ? "Còn ErrorBoundary 'Đã xảy ra lỗi'" : "Không error boundary");
  t.assert("render-title", hasEventTitle, hasEventTitle ? "Hiển thị title event" : `Không thấy title. body: ${bodyText.slice(0, 200)}`);
  t.assert("render-register", hasRegisterBtn, hasRegisterBtn ? "Có button đăng ký" : "Không có UI đăng ký");
  t.assert("no-console-error", consoleErrors.length === 0,
    consoleErrors.length === 0 ? "Clean console" : `${consoleErrors.length} errors: ${consoleErrors.slice(0, 2).join(" | ").slice(0, 300)}`);

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
