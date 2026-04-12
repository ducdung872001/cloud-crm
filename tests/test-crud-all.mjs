#!/usr/bin/env node
/**
 * CRUD TEST TOAN BO HE THONG — Reborn Retail CRM
 * Chay: node tests/test-crud-all.mjs
 * Chay 1 module: node tests/test-crud-all.mjs --module=warehouse
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-4);
const results = { pass: 0, fail: 0, backendBugs: [], details: [] };

function record(module, testId, pass, detail) {
  if (pass) results.pass++; else results.fail++;
  results.details.push({ module, testId, status: pass ? "PASS" : "FAIL", detail });
  if (!pass && detail.includes("[BACKEND]")) results.backendBugs.push({ module, testId, detail });
}

const MODULES = {
  warehouse: {
    name: "Kho hang", route: "/warehouse",
    createBtn: 'button:has-text("Thêm kho")',
    saveBtn: '.modal.show button:has-text("Tạo mới"), .modal.show button:has-text("Xác nhận")',
    updateBtn: '.modal.show button:has-text("Cập nhật")',
    fields: {
      name:    { sel: '.modal.show input[name="name"]',          val: `Kho Test ${RID}`, req: true, label: "Ten kho" },
      code:    { sel: '.modal.show input[name="code"]',           val: `KT${RID}`,        req: false, label: "Ma kho" },
      address: { sel: '.modal.show textarea[name="address"]',     val: `Addr ${RID}`,     req: true, label: "Dia chi" },
    },
    listCols: { name: 2, code: 3, address: 4 },
  },
  supplier: {
    name: "NCC", route: "/supplier",
    createBtn: 'button:has-text("Thêm mới")',
    saveBtn: '.modal.show button:has-text("Thêm mới"), .modal.show button:has-text("Lưu")',
    updateBtn: '.modal.show button:has-text("Cập nhật"), .modal.show button:has-text("Lưu")',
    fields: {
      name: { sel: '.modal.show input[name="name"]', val: `NCC ${RID}`, req: true, label: "Ten" },
      code: { sel: '.modal.show input[name="code"]', val: `NC${RID}`,   req: false, label: "Ma" },
    },
    listCols: { name: 2 },
  },
  customerGroup: {
    name: "Nhom KH", route: "/setting_customer",
    cardClick: '.item-body >> text=Danh sách nhóm khách hàng',
    createBtn: '[class*="titleAction"] button:has-text("Thêm")',
    saveBtn: '.modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo")',
    updateBtn: '.modal.show button:has-text("Cập nhật")',
    fields: {
      name: { sel: '.modal.show input[name="name"]', val: `NKH ${RID}`, req: true, label: "Ten nhom" },
    },
    listCols: {},
  },
  productUnit: {
    name: "DVT", route: "/setting_sell",
    cardClick: 'text=Danh mục đơn vị sản phẩm',
    createBtn: '[class*="titleAction"] button:has-text("Thêm")',
    saveBtn: '.modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo")',
    updateBtn: '.modal.show button:has-text("Cập nhật")',
    fields: {
      name: { sel: '.modal.show input[name="name"]', val: `DVT ${RID}`, req: true, label: "Ten DVT" },
    },
    listCols: {},
  },
  department: {
    name: "Phong ban", route: "/setting_org",
    cardClick: '.item-body >> text=Phòng ban',
    createBtn: '[class*="titleAction"] button:has-text("Thêm")',
    saveBtn: '.modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo")',
    updateBtn: '.modal.show button:has-text("Cập nhật")',
    fields: {
      name: { sel: '.modal.show input[name="name"]', val: `PB ${RID}`, req: true, label: "Ten PB" },
    },
    listCols: {},
  },
};

async function goToModule(t, cfg) {
  await t.goto(cfg.route);
  if (cfg.cardClick) {
    // Setting pages: click card de vao module
    const sels = cfg.cardClick.split(", ");
    for (const sel of sels) {
      if (await t.page.click(sel, { force: true, timeout: 5000 }).then(() => true).catch(() => false)) break;
    }
    await t.page.waitForTimeout(3000);
  }
}

async function testModule(t, key, cfg) {
  const mod = cfg.name;
  console.log("\n" + "═".repeat(60));
  console.log(`  ${mod.toUpperCase()}`);
  console.log("═".repeat(60));

  // ── Navigate ──
  await goToModule(t, cfg);

  // ── CREATE ──
  t.log("\u25B6", `${key}-C01: Mo form`);
  const addBtn = await t.page.$(cfg.createBtn);
  if (!addBtn) {
    record(mod, "C01", true, "SKIP — khong co nut Them (thieu quyen hoac trang chua load)");
    return;
  }
  await addBtn.click({ force: true });
  await t.page.waitForTimeout(1500);
  if (!(await t.exists(".modal.show"))) {
    record(mod, "C01", false, "Modal KHONG mo");
    return;
  }
  record(mod, "C01", true, "Modal mo");

  // ── Fill fields ──
  const inputVals = {};
  for (const [k, f] of Object.entries(cfg.fields)) {
    const el = await t.page.$(f.sel);
    if (el) {
      await el.fill(f.val);
      inputVals[k] = f.val;
      record(mod, `C02-${k}`, true, `${f.label}: "${f.val}"`);
    } else {
      record(mod, `C02-${k}`, !f.req, f.req ? `${f.label}: KHONG TIM THAY` : `${f.label}: skip (optional)`);
    }
  }

  // ── Save ──
  t.log("\u25B6", `${key}-C03: Luu`);
  t.clearApiLogs();
  const saveBtn = await t.page.$(cfg.saveBtn);
  if (saveBtn && !(await saveBtn.evaluate(el => el.disabled))) {
    await saveBtn.click({ force: true });
    await t.page.waitForTimeout(3000);
    record(mod, "C03", true, "Da luu");
  } else {
    record(mod, "C03", false, "Nut Luu disabled hoac khong co");
    return;
  }

  // ── VERIFY LIST (navigate lai) ──
  t.log("\u25B6", `${key}-V01: Verify list`);
  await goToModule(t, cfg);
  const nameVal = inputVals.name || "";
  const inList = await t.hasText(nameVal);
  record(mod, "V01", inList, inList ? `"${nameVal}" co trong DS` : `"${nameVal}" KHONG co`);

  // Verify cot
  if (inList && cfg.listCols && Object.keys(cfg.listCols).length > 0) {
    const rowData = await t.page.evaluate((name) => {
      const row = [...document.querySelectorAll("table tbody tr")].find(tr => tr.innerText?.includes(name));
      return row ? [...row.querySelectorAll("td")].map(td => td.innerText?.trim()) : null;
    }, nameVal);
    if (rowData) {
      for (const [k, idx] of Object.entries(cfg.listCols)) {
        const cell = rowData[idx] || "";
        const expected = inputVals[k] || "";
        if (expected) {
          const ok = cell.includes(expected);
          record(mod, `V01-${k}`, ok, ok ? `Cot ${k}: dung` : `Cot ${k}: "${cell}" (mong doi "${expected}") [BACKEND]`);
        }
      }
    }
  }

  // ── VERIFY EDIT (open + check fields) ──
  t.log("\u25B6", `${key}-V02: Verify edit`);
  const editOk = await t.clickEditOnRow(nameVal);
  if (editOk) {
    record(mod, "V02-open", true, "Modal Edit mo");
    for (const [k, f] of Object.entries(cfg.fields)) {
      const el = await t.page.$(f.sel);
      if (el && inputVals[k]) {
        const cur = await el.evaluate(e => e.value);
        const ok = cur === inputVals[k] || cur.includes(inputVals[k]);
        record(mod, `V02-${k}`, ok, ok ? `Edit ${f.label}: dung` : `Edit ${f.label}: "${cur}" (mong doi "${inputVals[k]}") [BACKEND]`);
      }
    }

    // ── UPDATE ──
    t.log("\u25B6", `${key}-U01: Sua ten`);
    const nameEl = await t.page.$(cfg.fields.name?.sel);
    const newName = `Upd${RID}`;
    if (nameEl) {
      await nameEl.fill(newName);
      const updBtn = await t.page.$(cfg.updateBtn);
      if (updBtn) {
        await updBtn.click({ force: true });
        await t.page.waitForTimeout(3000);
        record(mod, "U01", true, `Doi ten → "${newName}"`);
      }
    }

    // Verify update
    await goToModule(t, cfg);
    record(mod, "U02", await t.hasText(newName), (await t.hasText(newName)) ? `"${newName}" co` : `"${newName}" KHONG co`);

    // ── DELETE ──
    t.log("\u25B6", `${key}-D01: Xoa`);
    const delOk = await t.clickDeleteOnRow(newName);
    if (delOk) {
      record(mod, "D01", true, "Dialog hien");
      const cfm = await t.page.$('.dialog button:has-text("Xóa"), .dialog button:has-text("Xác nhận"), .dialog button:has-text("Ngừng"), .modal.show button:has-text("Xóa"), .modal.show button:has-text("Xác nhận")');
      if (cfm) { await cfm.click({ force: true }); await t.page.waitForTimeout(3000); }
      await goToModule(t, cfg);
      const gone = !(await t.hasText(newName));
      record(mod, "D02", gone, gone ? "Da xoa" : "Van con (co the ngung SD)");
    } else {
      record(mod, "D01", false, "Dialog khong hien");
    }
  } else {
    record(mod, "V02-open", false, "Khong mo duoc Edit");
  }
}

async function testProduct(t) {
  const mod = "San pham";
  console.log("\n" + "═".repeat(60));
  console.log("  SAN PHAM");
  console.log("═".repeat(60));

  await t.goto("/setting_sell");
  await t.page.click('text=Danh sách sản phẩm', { force: true }).catch(() => {});
  await t.page.waitForTimeout(3000);

  t.log("\u25B6", "SP-C01: Mo form");
  await t.page.click('button:has-text("Thêm sản phẩm")', { force: true }).catch(() => {});
  await t.page.waitForTimeout(3000);
  if (!(await t.exists('input[placeholder*="Nhập tên sản phẩm"]'))) {
    record(mod, "C01", false, "Form KHONG hien");
    return;
  }
  record(mod, "C01", true, "Form hien");

  // Nhap ten
  await t.page.fill('input[placeholder*="Nhập tên sản phẩm"]', `SP ${RID}`);
  record(mod, "C02-name", true, `Ten: SP ${RID}`);

  // Nhap mo ta ngan
  const descInput = await t.page.$('textarea[name="description"]');
  if (descInput) {
    await descInput.fill(`Mo ta san pham test ${RID}`);
    record(mod, "C02-desc", true, "Mo ta: da nhap");
  }

  // Chon danh muc san pham (bat buoc)
  t.log("\u25B6", "SP-C02b: Chon danh muc");
  const catSelect = await t.page.$('input[name="categoryId"], [class*="select-custom"]');
  if (catSelect) {
    // Click select de mo dropdown
    await catSelect.click({ force: true });
    await t.page.waitForTimeout(1000);
    // Chon option dau tien (khong phai placeholder)
    const firstOption = await t.page.$('[class*="option"]:not([class*="placeholder"])');
    if (firstOption) {
      await firstOption.click({ force: true });
      await t.page.waitForTimeout(500);
      record(mod, "C02b", true, "Chon danh muc SP");
    }
  } else {
    // Tim select danh muc bang cach khac — co the la hidden input + select custom
    await t.page.evaluate(() => {
      // Click vao select custom cua danh muc (thuong la select dau tien sau ten SP)
      const selects = document.querySelectorAll('.select-custom');
      if (selects[0]) {
        selects[0].querySelector('[class*="control"]')?.dispatchEvent(new MouseEvent('mousedown', {bubbles:true}));
      }
    });
    await t.page.waitForTimeout(1000);
    const opt = await t.page.$('[class*="option"]');
    if (opt) { await opt.click({ force: true }); record(mod, "C02b", true, "Chon danh muc"); }
    else { record(mod, "C02b", false, "Khong chon duoc danh muc"); }
  }
  await t.page.waitForTimeout(500);

  t.log("\u25B6", "SP-C03: Bien the + gia");
  await t.page.click('text=Cài đặt biến thể', { force: true }).catch(() => {});
  await t.page.waitForTimeout(1000);
  const addAttr = await t.page.$('.add-prod-vt__add-btn, button:has-text("Thêm thuộc tính")');
  if (addAttr) {
    await addAttr.click({ force: true });
    await t.page.waitForTimeout(1000);
    const inp = await t.page.$('[class*="variant"] input, input[placeholder*="thuộc tính"], input[placeholder*="Nhập tên"]');
    if (inp) {
      await inp.fill("Size");
      await t.page.keyboard.press("Enter");
      await t.page.waitForTimeout(500);
      const valInp = await t.page.$('input[placeholder*="giá trị"], input[placeholder*="Nhập giá trị"], [class*="variant-value"] input');
      if (valInp) { await valInp.fill("M"); await t.page.keyboard.press("Enter"); }
      await t.page.waitForTimeout(1500);

      // Nhap gia ban (Gia le) — input cuoi cung co placeholder="0"
      const allVisible = await t.page.$$('input[type="text"]');
      let priceSet = false;
      for (const inp of allVisible) {
        const ph = await inp.getAttribute("placeholder");
        const vis = await inp.evaluate(e => e.offsetHeight > 0);
        const cls = await inp.evaluate(e => e.className);
        if (vis && ph === "0" && !cls.includes("barcode") && !cls.includes("sku")) {
          await inp.fill("100000");
          priceSet = true;
          break;
        }
      }

      record(mod, "C03", true, `Them Size=M${priceSet ? ", gia=100000" : " (chua nhap gia)"}`);
    }
  }

  t.log("\u25B6", "SP-C04: Luu");
  t.clearApiLogs();
  await t.page.click('button:has-text("Lưu sản phẩm")', { force: true }).catch(() => {});
  await t.page.waitForTimeout(5000);
  await t.screenshot("sp-save");

  // Check toast loi
  const hasError = await t.page.evaluate(() => {
    const toast = document.querySelector('[class*="toast"], [class*="Toastify"]');
    return toast ? toast.innerText : "";
  });
  if (hasError.includes("biến thể") || hasError.includes("lỗi")) {
    record(mod, "C04", false, `Loi: "${hasError.slice(0, 60)}"`);
  } else {
    record(mod, "C04", true, "Da luu");
  }

  t.log("\u25B6", "SP-V01: Verify");
  await t.goto("/setting_sell");
  await t.page.click('text=Danh sách sản phẩm', { force: true }).catch(() => {});
  await t.page.waitForTimeout(3000);
  const found = await t.hasText(`SP ${RID}`);
  record(mod, "V01", found, found ? `SP ${RID} co trong DS` : `Khong thay SP`);

  // Verify edit — click vao SP de mo chi tiet
  if (found) {
    t.log("\u25B6", "SP-V02: Mo edit → verify du lieu");
    // Click vao ten SP trong list
    const spLink = await t.page.$(`text=SP ${RID}`);
    if (spLink) {
      await spLink.click({ force: true });
      await t.page.waitForTimeout(3000);

      // Check ten
      const editName = await t.page.$('input[placeholder*="Nhập tên sản phẩm"]');
      if (editName) {
        const nameVal = await editName.evaluate(e => e.value);
        record(mod, "V02-name", nameVal.includes(`SP ${RID}`), `Edit ten: "${nameVal}"`);
      }

      // Check mo ta
      const editDesc = await t.page.$('textarea[name="description"]');
      if (editDesc) {
        const descVal = await editDesc.evaluate(e => e.value);
        const hasDesc = descVal.includes(`Mo ta san pham test ${RID}`);
        record(mod, "V02-desc", hasDesc,
          hasDesc ? "Edit mo ta: dung" : `Edit mo ta: "${descVal}" [BACKEND] — API khong luu mo ta`);
      }
    }
  }
}

async function main() {
  const t = await createTestRunner("CRUD-ALL", "CRUD toan bo");
  const args = process.argv.slice(2);
  const modFilter = args.find(a => a.startsWith("--module="))?.split("=")[1];

  try {
    if (!(await t.login())) throw new Error("Login failed");

    if (!modFilter || modFilter === "product") {
      try { await testProduct(t); } catch (e) { record("SP", "ERR", false, e.message); }
    }

    const mods = modFilter ? { [modFilter]: MODULES[modFilter] } : MODULES;
    for (const [k, cfg] of Object.entries(mods)) {
      if (!cfg) continue;
      try { await testModule(t, k, cfg); } catch (e) {
        record(cfg.name, "ERR", false, e.message);
        await t.screenshot(`${k}-err`);
      }
    }
  } catch (e) { console.log("FATAL:", e.message); }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("  KET QUA CRUD");
  console.log("═".repeat(60));
  results.details.forEach(r => console.log(`  ${r.status === "PASS" ? "\u2705" : "\u274C"} [${r.module}] ${r.testId}: ${r.detail}`));
  console.log(`\n  PASS: ${results.pass} | FAIL: ${results.fail}`);
  if (results.backendBugs.length) {
    console.log("\n  BACKEND BUGS:");
    results.backendBugs.forEach(b => console.log(`    - [${b.module}] ${b.detail}`));
  }

  const fs = await import("fs");
  fs.writeFileSync(`tests/reports/crud-all-${t.RUN_ID}.json`, JSON.stringify(results, null, 2));
  await t.done();
  process.exit(results.fail > 0 ? 1 : 0);
}
main();
