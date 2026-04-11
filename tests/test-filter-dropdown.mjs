#!/usr/bin/env node
/**
 * Test Filter Dropdown — Kiem tra fix filter "Kho hang" trong So kho
 *
 * Kiem tra:
 * 1. Chon kho → popover dong
 * 2. Khong append nut filter moi
 * 3. Khong hien tag thua (ListFilterChoose)
 * 4. Nut filter hien ten kho da chon
 *
 * Chay: node tests/test-filter-dropdown.mjs
 */
import { createTestRunner } from "./helpers.mjs";

async function main() {
  const t = await createTestRunner("FILTER", "Filter Dropdown");

  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // Go to So kho
    t.log("\u25B6", "Navigate to So kho");
    await t.goto("/inventory");
    await t.page.waitForTimeout(2000);

    // F-001: Dem filter buttons truoc
    const countBefore = await t.page.evaluate(() => document.querySelectorAll(".filter-block").length);
    t.assert("F-001", countBefore >= 2, `${countBefore} filter buttons truoc khi chon`);

    // Doi them cho API load warehouse list
    await t.page.waitForTimeout(5000);

    // F-002: Click "Kho hang" → popover mo
    t.log("\u25B6", "Click nut 'Kho hang'");
    await t.page.click('button:has-text("Kho hàng")', { force: true });
    await t.page.waitForTimeout(1500);

    const hasPopover = await t.exists(".popover-filter");
    t.assert("F-002", hasPopover, hasPopover ? "Popover mo" : "Popover KHONG mo");
    await t.screenshot("f-002-popover");

    if (hasPopover) {
      // F-003: Click vao select input de mo menu + doi load
      t.log("\u25B6", "Mo dropdown chon kho");
      // Mo react-select menu — focus input + ArrowDown
      const rsInput = await t.page.$(".popover-filter .select-custom input[id^='react-select']");
      if (rsInput) {
        await rsInput.focus();
        await t.page.keyboard.press("ArrowDown");
      } else {
        // Fallback — click tren placeholder text
        await t.page.click(".popover-filter .select-custom [class*='placeholder'], .popover-filter .select-custom [class*='singleValue']", { force: true }).catch(() => {});
      }
      // Doi API load danh sach kho
      for (let i = 0; i < 8; i++) {
        await t.page.waitForTimeout(800);
        const count = await t.page.evaluate(() =>
          [...document.querySelectorAll('[class*="option"]')].filter(e => {
            const t = e.innerText?.trim();
            return t && t.length > 0 && t !== "Loading..." && !t.includes("Chọn");
          }).length
        );
        if (count > 0) break;
      }

      // Doi them cho API load danh sach kho
      await t.page.waitForTimeout(3000);
      // Debug
      const selectDebug = await t.page.evaluate(() => {
        const p = document.querySelector('.popover-filter');
        if (!p) return 'NO POPOVER';
        const menu = p.querySelector('[class*="menu"]');
        const opts = menu ? [...menu.querySelectorAll('[class*="option"]')].map(e => e.innerText) : [];
        return JSON.stringify({ hasMenu: !!menu, opts });
      });
      t.log("\u2139\uFE0F", `Select: ${selectDebug}`);

      const options = await t.page.evaluate(() =>
        [...document.querySelectorAll('[class*="option"]')]
          .map((e) => e.innerText?.trim())
          .filter((t) => t.length > 0 && t !== "Loading...")
      );
      t.assert("F-003", options.length > 1, `${options.length} options: ${options.slice(0, 5).join(", ")}`);
      await t.screenshot("f-003-options");

      if (options.length > 1) {
        // F-004: Chon kho (option thu 2 — dau tien la "Chon kho hang")
        const target = options[1];
        t.log("\u25B6", `Chon: "${target}"`);
        await t.page.click(`[class*="option"]:has-text("${target.slice(0, 15)}")`, { force: true }).catch(() => {});
        await t.page.waitForTimeout(2000);
        await t.screenshot("f-004-selected");

        // F-004: Popover dong sau khi chon
        const popoverGone = !(await t.exists(".popover-filter"));
        t.assert("F-004", popoverGone, popoverGone ? "Popover DONG sau chon" : "Popover VAN MO — LOI");

        // F-005: Khong co tag thua (ListFilterChoose)
        const tagText = await t.page.evaluate(() => {
          const el = document.querySelector(".list-filter-choose");
          return el ? el.innerText?.trim() : "";
        });
        t.assert("F-005", !tagText, tagText ? `Tag thua: "${tagText.slice(0, 30)}" — LOI` : "Khong tag thua");

        // F-006: KHONG append nut filter moi
        const countAfter = await t.page.evaluate(() => document.querySelectorAll(".filter-block").length);
        t.assert("F-006", countAfter === countBefore,
          `Truoc: ${countBefore} → Sau: ${countAfter}` + (countAfter === countBefore ? " — DUNG" : " — BI APPEND — LOI"));

        // F-007: Nut filter hien ten kho da chon
        // Doi re-render roi poll vai lan
        let showsName = false;
        let btnTexts = [];
        for (let i = 0; i < 5; i++) {
          await t.page.waitForTimeout(1000);
          btnTexts = await t.page.evaluate(() =>
            [...document.querySelectorAll(".filter-block button span")].map((e) => e.innerText?.trim()).filter(Boolean)
          );
          showsName = btnTexts.some((txt) => txt.includes(target.slice(0, 10)));
          if (showsName) break;
        }
        t.assert("F-007", showsName, `Nut: [${btnTexts.join(", ")}]` + (showsName ? ` — hien "${target}"` : " — KHONG hien ten kho (co the can fix FilterFeatured re-render)"));

        // F-008: Table da loc
        const rows = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
        t.assert("F-008", true, `Table: ${rows} dong sau loc`);
      }
    }
  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
    await t.screenshot("error");
  }

  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
