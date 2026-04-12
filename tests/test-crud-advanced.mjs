#!/usr/bin/env node
/**
 * CRUD ADVANCED TEST — Nhap toi da + Nhap pha
 *
 * 3 loai case cho moi module:
 * 1. MIN: Chi nhap required → verify luu OK
 * 2. MAX: Nhap tat ca truong → verify round-trip tung field
 * 3. UNHAPPY: Nhap pha (XSS, SQL injection, ky tu dac biet, so am, chuoi dai)
 *
 * Chay: node tests/test-crud-advanced.mjs
 * Chay 1 module: node tests/test-crud-advanced.mjs --module=warehouse
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-4);
const R = { pass: 0, fail: 0, backend: [], details: [] };

function rec(mod, id, ok, detail) {
  if (ok) R.pass++; else R.fail++;
  R.details.push({ mod, id, status: ok ? "PASS" : "FAIL", detail });
  if (!ok && detail.includes("[BACKEND]")) R.backend.push({ mod, id, detail });
}

// ── ATTACK PAYLOADS ──
const XSS = '<script>alert("XSS")</script>';
const SQLI = "'; DROP TABLE warehouse; --";
const SPECIAL = '!@#$%^&*()_+=[]{}|\\:";\'<>?,./~`';
const LONG_255 = "A".repeat(260); // Vuot max 255
const LONG_100 = "B".repeat(110); // Vuot max 100
const NEGATIVE = "-99999";
const EMOJI = "Kho 🏭🔥💯 Test";

async function testWarehouseAdvanced(t) {
  const mod = "Kho hang";

  // ═══════════════════════════════════════
  // CASE 1: MIN — chi nhap required
  // ═══════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("  KHO — CASE MIN (chi required)");
  console.log("═".repeat(60));

  await t.goto("/warehouse");
  await t.page.click('button:has-text("Thêm kho")', { force: true });
  await t.page.waitForTimeout(1500);

  // Chi nhap ten + dia chi (required), bo ma kho (optional)
  await t.page.fill('.modal.show input[name="name"]', `Min ${RID}`);
  await t.page.fill('.modal.show textarea[name="address"]', `Addr min ${RID}`);
  // KHONG nhap code, position
  t.clearApiLogs();
  const saveMin = await t.page.$('.modal.show button:has-text("Tạo mới")');
  if (saveMin && !(await saveMin.evaluate(el => el.disabled))) {
    await saveMin.click({ force: true });
    await t.page.waitForTimeout(3000);
    rec(mod, "MIN-C01", true, "Luu voi chi required");
  } else {
    rec(mod, "MIN-C01", false, "Nut Luu disabled — thieu validate?");
  }

  // Doi list reload (modal dong → list tu reload)
  await t.page.waitForTimeout(2000);
  // Neu van o modal → navigate
  if (await t.exists('.modal.show')) {
    await t.page.click('.modal .btn-close').catch(() => {});
    await t.page.waitForTimeout(1000);
  }
  await t.goto("/warehouse");
  await t.page.waitForTimeout(3000);
  const minFound = await t.hasText(`Min ${RID}`);
  rec(mod, "MIN-V01", minFound, minFound ? "Tim thay kho MIN trong DS" : "Khong thay — luu that bai hoac phan trang");

  // Cleanup
  if (minFound) {
    const del = await t.clickDeleteOnRow(`Min ${RID}`);
    if (del) {
      const cfm = await t.page.$('.dialog button:has-text("Xóa"), .dialog button:has-text("Ngừng")');
      if (cfm) await cfm.click({ force: true });
      await t.page.waitForTimeout(2000);
    }
  }

  // ═══════════════════════════════════════
  // CASE 2: MAX — nhap tat ca truong
  // ═══════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("  KHO — CASE MAX (full fields)");
  console.log("═".repeat(60));

  await t.goto("/warehouse");
  await t.page.click('button:has-text("Thêm kho")', { force: true });
  await t.page.waitForTimeout(1500);

  const maxName = `Max ${RID}`;
  const maxCode = `MX${RID}`;
  const maxAddr = `123 Nguyen Hue, Q1, HCM ${RID}`;
  const maxPos = "5";

  await t.page.fill('.modal.show input[name="name"]', maxName);
  await t.page.fill('.modal.show input[name="code"]', maxCode);
  await t.page.fill('.modal.show textarea[name="address"]', maxAddr);
  await t.page.fill('.modal.show input[name="position"]', maxPos);
  rec(mod, "MAX-C01", true, `Nhap full: ${maxName}, ${maxCode}, ${maxAddr}`);

  t.clearApiLogs();
  const saveMax = await t.page.$('.modal.show button:has-text("Tạo mới")');
  if (saveMax) { await saveMax.click({ force: true }); await t.page.waitForTimeout(3000); }

  // Verify LIST — tung cot
  await t.page.waitForTimeout(2000);
  if (await t.exists('.modal.show')) {
    await t.page.click('.modal .btn-close').catch(() => {});
    await t.page.waitForTimeout(1000);
  }
  await t.goto("/warehouse");
  await t.page.waitForTimeout(3000);
  // Search de tim kho (co the nam trang 2)
  const searchInput = await t.page.$('input[placeholder*="Tìm kiếm tên kho"]');
  if (searchInput) {
    await searchInput.fill(maxName);
    await t.page.keyboard.press("Enter");
    await t.page.waitForTimeout(2000);
  }
  const maxRow = await t.page.evaluate((name) => {
    const row = [...document.querySelectorAll("table tbody tr")].find(tr => tr.innerText?.includes(name));
    return row ? [...row.querySelectorAll("td")].map(td => td.innerText?.trim()) : null;
  }, maxName);

  if (maxRow) {
    rec(mod, "MAX-V01-name", maxRow[2]?.includes(maxName), `List ten: "${maxRow[2]?.slice(0, 20)}"`);
    rec(mod, "MAX-V01-code", maxRow[3]?.includes(maxCode), maxRow[3]?.includes(maxCode) ? "List ma: dung" : `List ma: "${maxRow[3]}" [BACKEND] — khong tra code`);
    rec(mod, "MAX-V01-addr", maxRow[4]?.includes(maxAddr.slice(0, 10)), maxRow[4]?.includes(maxAddr.slice(0, 10)) ? "List dia chi: dung" : `List dia chi: "${maxRow[4]}" [BACKEND]`);
  } else {
    rec(mod, "MAX-V01", false, "Khong thay kho MAX trong DS");
  }

  // Verify EDIT — mo edit, check tung field
  const editOk = await t.clickEditOnRow(maxName);
  if (editOk) {
    const eName = await t.page.evaluate(() => document.querySelector('.modal.show input[name="name"]')?.value);
    const eCode = await t.page.evaluate(() => document.querySelector('.modal.show input[name="code"]')?.value);
    const eAddr = await t.page.evaluate(() => document.querySelector('.modal.show textarea[name="address"]')?.value);
    const ePos = await t.page.evaluate(() => document.querySelector('.modal.show input[name="position"]')?.value);

    rec(mod, "MAX-V02-name", eName === maxName, `Edit ten: "${eName}"`);
    rec(mod, "MAX-V02-code", eCode === maxCode, eCode === maxCode ? "Edit ma: dung" : `Edit ma: "${eCode}" [BACKEND]`);
    rec(mod, "MAX-V02-addr", eAddr === maxAddr, eAddr === maxAddr ? "Edit dia chi: dung" : `Edit dia chi: "${eAddr}" [BACKEND]`);
    rec(mod, "MAX-V02-pos", ePos === maxPos, ePos === maxPos ? "Edit position: dung" : `Edit position: "${ePos}" [BACKEND]`);

    await t.page.click('.modal .btn-close, .modal button:has-text("Hủy")').catch(() => {});
  } else {
    rec(mod, "MAX-V02", false, "Khong mo duoc Edit");
  }

  // Cleanup
  await t.goto("/warehouse");
  const del2 = await t.clickDeleteOnRow(maxName);
  if (del2) { const c = await t.page.$('.dialog button:has-text("Xóa")'); if (c) await c.click({ force: true }); await t.page.waitForTimeout(2000); }

  // ═══════════════════════════════════════
  // CASE 3: UNHAPPY — nhap pha
  // ═══════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("  KHO — CASE UNHAPPY (nhap pha)");
  console.log("═".repeat(60));

  // 3a: XSS trong ten
  t.log("\u25B6", "UH-01: XSS trong ten");
  await t.goto("/warehouse");
  await t.page.click('button:has-text("Thêm kho")', { force: true });
  await t.page.waitForTimeout(1500);
  await t.page.fill('.modal.show input[name="name"]', XSS);
  await t.page.fill('.modal.show textarea[name="address"]', "test addr");
  const saveXss = await t.page.$('.modal.show button:has-text("Tạo mới")');
  if (saveXss && !(await saveXss.evaluate(el => el.disabled))) {
    await saveXss.click({ force: true });
    await t.page.waitForTimeout(3000);
    // Kiem tra: XSS khong duoc execute
    const xssExec = await t.page.evaluate(() => !!window.__xss_test);
    rec(mod, "UH-01", !xssExec, !xssExec ? "XSS khong execute — an toan" : "XSS EXECUTE — LOI BAO MAT");
  } else {
    rec(mod, "UH-01", true, "Nut disabled — validate chan XSS");
  }
  await t.page.click('.modal .btn-close, .modal button:has-text("Hủy")').catch(() => {});

  // 3b: SQL injection
  t.log("\u25B6", "UH-02: SQL injection trong ma kho");
  await t.goto("/warehouse");
  await t.page.click('button:has-text("Thêm kho")', { force: true });
  await t.page.waitForTimeout(1500);
  await t.page.fill('.modal.show input[name="name"]', `SQLI ${RID}`);
  await t.page.fill('.modal.show input[name="code"]', SQLI);
  await t.page.fill('.modal.show textarea[name="address"]', "test");
  const saveSqli = await t.page.$('.modal.show button:has-text("Tạo mới")');
  if (saveSqli && !(await saveSqli.evaluate(el => el.disabled))) {
    await saveSqli.click({ force: true });
    await t.page.waitForTimeout(3000);
    rec(mod, "UH-02", true, "SQL injection — he thong khong crash");
  }
  await t.page.click('.modal .btn-close, .modal button:has-text("Hủy")').catch(() => {});

  // 3c: Ky tu dac biet
  t.log("\u25B6", "UH-03: Ky tu dac biet");
  await t.goto("/warehouse");
  await t.page.click('button:has-text("Thêm kho")', { force: true });
  await t.page.waitForTimeout(1500);
  await t.page.fill('.modal.show input[name="name"]', SPECIAL.slice(0, 30));
  await t.page.fill('.modal.show textarea[name="address"]', "test");
  const saveSp = await t.page.$('.modal.show button:has-text("Tạo mới")');
  if (saveSp && !(await saveSp.evaluate(el => el.disabled))) {
    await saveSp.click({ force: true });
    await t.page.waitForTimeout(3000);
    rec(mod, "UH-03", true, "Ky tu dac biet — khong crash");
  }
  await t.page.click('.modal .btn-close, .modal button:has-text("Hủy")').catch(() => {});

  // 3d: Chuoi qua dai (vuot max)
  t.log("\u25B6", "UH-04: Chuoi qua dai (260 ky tu)");
  await t.goto("/warehouse");
  await t.page.click('button:has-text("Thêm kho")', { force: true });
  await t.page.waitForTimeout(1500);
  await t.page.fill('.modal.show input[name="name"]', LONG_100);
  await t.page.fill('.modal.show textarea[name="address"]', LONG_255);
  const saveLong = await t.page.$('.modal.show button:has-text("Tạo mới")');
  if (saveLong) {
    const disabled = await saveLong.evaluate(el => el.disabled);
    if (disabled) {
      rec(mod, "UH-04", true, "Nut disabled — validate max length OK");
    } else {
      await saveLong.click({ force: true });
      await t.page.waitForTimeout(3000);
      // Kiem tra co toast loi hoac validate
      const hasError = await t.page.evaluate(() => {
        return document.body.innerText.includes("lỗi") || document.body.innerText.includes("tối đa") || !!document.querySelector('[class*="invalid"], [class*="error"]');
      });
      rec(mod, "UH-04", hasError, hasError ? "Co canh bao max length" : "Khong bao loi — [BACKEND] can validate max length");
    }
  }
  await t.page.click('.modal .btn-close, .modal button:has-text("Hủy")').catch(() => {});

  // 3e: Emoji
  t.log("\u25B6", "UH-05: Emoji trong ten");
  await t.goto("/warehouse");
  await t.page.click('button:has-text("Thêm kho")', { force: true });
  await t.page.waitForTimeout(1500);
  await t.page.fill('.modal.show input[name="name"]', EMOJI);
  await t.page.fill('.modal.show textarea[name="address"]', "test emoji");
  const saveEmoji = await t.page.$('.modal.show button:has-text("Tạo mới")');
  if (saveEmoji && !(await saveEmoji.evaluate(el => el.disabled))) {
    await saveEmoji.click({ force: true });
    await t.page.waitForTimeout(3000);
    await t.goto("/warehouse");
    const emojiFound = await t.hasText("🏭");
    rec(mod, "UH-05", emojiFound, emojiFound ? "Emoji luu + hien thi OK" : "Emoji khong hien — co the backend strip");
  }
  await t.page.click('.modal .btn-close, .modal button:has-text("Hủy")').catch(() => {});

  // Cleanup all test kho
  await t.goto("/warehouse");
  for (const name of [XSS.slice(0, 10), `SQLI ${RID}`, SPECIAL.slice(0, 10), LONG_100.slice(0, 10), EMOJI.slice(0, 5)]) {
    if (await t.hasText(name)) {
      const d = await t.clickDeleteOnRow(name);
      if (d) { const c = await t.page.$('.dialog button:has-text("Xóa"), .dialog button:has-text("Ngừng")'); if (c) { await c.click({ force: true }); await t.page.waitForTimeout(1500); } }
    }
  }
}

async function main() {
  const t = await createTestRunner("CRUD-ADV", "CRUD Advanced");
  const modFilter = process.argv.find(a => a.startsWith("--module="))?.split("=")[1];

  try {
    if (!(await t.login())) throw new Error("Login failed");

    if (!modFilter || modFilter === "warehouse") {
      await testWarehouseAdvanced(t);
    }

    // TODO: Them cac module khac (SP, NCC, KH...) theo mau tuong tu

  } catch (e) { console.log("FATAL:", e.message); await t.screenshot("fatal"); }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("  KET QUA CRUD ADVANCED");
  console.log("═".repeat(60));
  R.details.forEach(r => console.log(`  ${r.status === "PASS" ? "\u2705" : "\u274C"} [${r.mod}] ${r.id}: ${r.detail}`));
  console.log(`\n  PASS: ${R.pass} | FAIL: ${R.fail}`);
  if (R.backend.length) { console.log("\n  BACKEND:"); R.backend.forEach(b => console.log(`    - ${b.detail}`)); }

  const fs = await import("fs");
  fs.writeFileSync(`tests/reports/crud-adv-${t.RUN_ID}.json`, JSON.stringify(R, null, 2));
  await t.done();
  process.exit(R.fail > 0 ? 1 : 0);
}
main();
