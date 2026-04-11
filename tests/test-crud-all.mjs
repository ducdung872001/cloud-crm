#!/usr/bin/env node
/**
 * CRUD TEST TOAN BO HE THONG — Reborn Retail CRM
 *
 * Moi module: Create → Verify List → Open Edit → Verify Fields → Update → Verify → Delete → Verify
 * Neu field mat data → bao loi backend
 *
 * Chay: node tests/test-crud-all.mjs
 * Chay 1 module: node tests/test-crud-all.mjs --module warehouse
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-4);
const results = { pass: 0, fail: 0, backendBugs: [], details: [] };

function record(module, testId, pass, detail) {
  if (pass) results.pass++; else results.fail++;
  results.details.push({ module, testId, status: pass ? "PASS" : "FAIL", detail });
  if (!pass && detail.includes("[BACKEND]")) results.backendBugs.push({ module, testId, detail });
}

// ── Module definitions ──
const MODULES = {
  warehouse: {
    name: "Kho hang",
    route: "/warehouse",
    createBtn: 'button:has-text("Thêm kho")',
    fields: {
      name:    { selector: '.modal.show input[name="name"]', value: `Kho Test ${RID}`, required: true, label: "Ten kho" },
      code:    { selector: '.modal.show input[name="code"]', value: `KT${RID}`, required: false, label: "Ma kho" },
      address: { selector: '.modal.show textarea[name="address"]', value: `Dia chi ${RID}`, required: true, label: "Dia chi" },
    },
    saveBtn: '.modal.show button:has-text("Tạo mới"), .modal.show button:has-text("Xác nhận")',
    updateBtn: '.modal.show button:has-text("Cập nhật")',
    listColumns: { name: 2, code: 3, address: 4, status: 5 }, // td index (0-based)
    searchInput: 'input[placeholder*="Tìm kiếm tên kho"]',
  },
  supplier: {
    name: "Nha cung cap",
    route: "/supplier",
    createBtn: 'button:has-text("Thêm mới")',
    fields: {
      name: { selector: '.modal.show input[name="name"]', value: `NCC Test ${RID}`, required: true, label: "Ten NCC" },
      code: { selector: '.modal.show input[name="code"]', value: `NCC${RID}`, required: false, label: "Ma NCC" },
    },
    saveBtn: '.modal.show button:has-text("Thêm mới"), .modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo")',
    updateBtn: '.modal.show button:has-text("Cập nhật"), .modal.show button:has-text("Lưu")',
    listColumns: { name: 1 },
    searchInput: 'input[placeholder*="Tìm"]',
  },
  customerGroup: {
    name: "Nhom KH",
    route: "/setting_customer",
    tabClick: 'text=Danh sách nhóm khách hàng',
    createBtn: 'button:has-text("Thêm")',
    fields: {
      name: { selector: '.modal.show input[name="name"]', value: `Nhom ${RID}`, required: true, label: "Ten nhom" },
    },
    saveBtn: '.modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo")',
    updateBtn: '.modal.show button:has-text("Cập nhật")',
    listColumns: { name: 1 },
  },
  // productCategory: SKIP — dung inline add trong tree, khong co modal CRUD
  productUnit: {
    name: "Don vi tinh",
    route: "/setting_sell",
    tabClick: 'text=Danh mục đơn vị sản phẩm, text=Danh mục đơn vị',
    createBtn: 'button:has-text("Thêm")',
    fields: {
      name: { selector: '.modal.show input[name="name"]', value: `DVT ${RID}`, required: true, label: "Ten don vi" },
    },
    saveBtn: '.modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo")',
    updateBtn: '.modal.show button:has-text("Cập nhật")',
    // DVT table: col 0=STT, col 1=Ten — dung search row match thay vi index
    listColumns: {},
  },
  department: {
    name: "Phong ban",
    route: "/setting_org",
    tabClick: 'text=Danh sách phòng ban',
    createBtn: 'button:has-text("Thêm phòng ban"), button:has-text("Thêm"), [class*="titleAction"] button',
    fields: {
      name: { selector: '.modal.show input[name="name"]', value: `PB ${RID}`, required: true, label: "Ten phong ban" },
    },
    saveBtn: '.modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo"), .modal.show button:has-text("Xác nhận")',
    updateBtn: '.modal.show button:has-text("Cập nhật")',
    listColumns: { name: 1 },
  },
};

// ── Special: San pham can them bien the ──
async function testProduct(t) {
  const mod = "San pham";
  console.log("\n" + "═".repeat(60));
  console.log("  SAN PHAM (special flow)");
  console.log("═".repeat(60));

  await t.goto("/setting_sell");
  await t.page.click('text=Danh sách sản phẩm', { force: true }).catch(() => {});
  await t.page.waitForTimeout(3000);

  // Click Them SP
  t.log("\u25B6", "SP-C01: Mo form");
  await t.page.click('button:has-text("Thêm sản phẩm")', { force: true }).catch(() => {});
  await t.page.waitForTimeout(3000);

  const hasForm = await t.exists('input[placeholder*="Nhập tên sản phẩm"]');
  record(mod, "C01", hasForm, hasForm ? "Form them SP hien" : "Form KHONG hien");
  if (!hasForm) return;

  // Nhap ten
  const nameInput = await t.page.$('input[placeholder*="Nhập tên sản phẩm"]');
  await nameInput.fill(`SP Test ${RID}`);
  record(mod, "C02-name", true, `Ten: SP Test ${RID}`);

  // Tab "Cai dat bien the" → Them thuoc tinh
  t.log("\u25B6", "SP-C03: Them bien the");
  await t.page.click('text=Cài đặt biến thể', { force: true }).catch(() => {});
  await t.page.waitForTimeout(1000);

  const addAttrBtn = await t.page.$('.add-prod-vt__add-btn, button:has-text("Thêm thuộc tính")');
  if (addAttrBtn) {
    await addAttrBtn.click({ force: true });
    await t.page.waitForTimeout(1000);
    // Nhap ten thuoc tinh (VD: Size) va gia tri (VD: S, M, L)
    const attrNameInput = await t.page.$('input[placeholder*="thuộc tính"], input[placeholder*="Nhập tên"], [class*="variant"] input:first-of-type');
    if (attrNameInput) {
      await attrNameInput.fill("Size");
      await t.page.keyboard.press("Enter");
      await t.page.waitForTimeout(500);
      // Nhap gia tri
      const valInput = await t.page.$('input[placeholder*="giá trị"], input[placeholder*="Nhập giá trị"], [class*="variant-value"] input');
      if (valInput) {
        await valInput.fill("M");
        await t.page.keyboard.press("Enter");
        await t.page.waitForTimeout(500);
      }
      record(mod, "C03-variant", true, "Them thuoc tinh Size = M");
    } else {
      record(mod, "C03-variant", false, "Khong tim thay input thuoc tinh");
    }
  } else {
    record(mod, "C03-variant", false, "Khong co nut Them thuoc tinh");
  }

  await t.screenshot("sp-variant");

  // Luu SP
  t.log("\u25B6", "SP-C04: Luu san pham");
  t.clearApiLogs();
  const saveBtn = await t.page.$('button:has-text("Lưu sản phẩm")');
  if (saveBtn) {
    await saveBtn.click({ force: true });
    await t.page.waitForTimeout(4000);
    const api = t.findApi("POST", "product");
    record(mod, "C04-save", true, api ? `API POST ${api.status}` : "Da click Luu");
  } else {
    record(mod, "C04-save", false, "Khong co nut Luu san pham");
  }
  await t.screenshot("sp-after-save");

  // Verify in list
  t.log("\u25B6", "SP-V01: Verify trong DS");
  await t.goto("/setting_sell");
  await t.page.click('text=Danh sách sản phẩm', { force: true }).catch(() => {});
  await t.page.waitForTimeout(3000);
  const found = await t.hasText(`SP Test ${RID}`);
  record(mod, "V01", found, found ? `SP Test ${RID} co trong DS` : "Khong thay SP trong DS");
}

async function testModule(t, moduleKey, config) {
  const mod = config.name;
  console.log("\n" + "═".repeat(60));
  console.log(`  ${mod.toUpperCase()}`);
  console.log("═".repeat(60));

  // ── Navigate + click tab ──
  async function navigateToModule() {
    await t.goto(config.route);
    if (config.tabClick) {
      // tabClick co the co nhieu selector cach boi ", "
      const selectors = config.tabClick.split(", ");
      for (const sel of selectors) {
        const ok = await t.page.click(sel, { force: true, timeout: 3000 }).then(() => true).catch(() => false);
        if (ok) break;
      }
      await t.page.waitForTimeout(2000);
    }
  }
  await navigateToModule();

  // ── CREATE ──
  t.log("\u25B6", `${moduleKey}-C01: Mo form tao moi`);
  await t.page.click(config.createBtn, { force: true, timeout: 5000 }).catch(() => {});
  await t.page.waitForTimeout(1500);
  const hasModal = await t.exists(".modal.show");
  record(mod, "C01", hasModal, hasModal ? "Modal mo" : "Modal KHONG mo");
  if (!hasModal) return;

  // ── Fill fields ──
  t.log("\u25B6", `${moduleKey}-C02: Nhap du lieu`);
  const inputValues = {};
  for (const [key, field] of Object.entries(config.fields)) {
    const el = await t.page.$(field.selector);
    if (el) {
      await el.fill(field.value);
      inputValues[key] = field.value;
      record(mod, `C02-${key}`, true, `${field.label}: "${field.value}"`);
    } else {
      record(mod, `C02-${key}`, !field.required, `${field.label}: ${field.required ? "KHONG TIM THAY — LOI" : "khong tim thay (optional)"}`);
    }
  }
  await t.screenshot(`${moduleKey}-c02`);

  // ── Save ──
  t.log("\u25B6", `${moduleKey}-C03: Luu`);
  t.clearApiLogs();
  const saveBtn = await t.page.$(config.saveBtn);
  if (saveBtn) {
    const disabled = await saveBtn.evaluate(el => el.disabled);
    if (!disabled) {
      await saveBtn.click({ force: true });
      await t.page.waitForTimeout(3000);
      record(mod, "C03", true, "Da click Luu");
    } else {
      record(mod, "C03", false, "Nut Luu disabled — thieu validate?");
    }
  } else {
    record(mod, "C03", false, "Khong tim thay nut Luu");
  }

  // ── Verify in List ──
  t.log("\u25B6", `${moduleKey}-V01: Verify trong danh sach`);
  await navigateToModule();

  const nameValue = inputValues.name || Object.values(inputValues)[0] || "";
  const foundInList = await t.hasText(nameValue);
  record(mod, "V01-name", foundInList, foundInList ? `"${nameValue}" co trong DS` : `"${nameValue}" KHONG co trong DS`);

  // Verify tung cot trong list
  if (config.listColumns && foundInList) {
    const rowData = await t.page.evaluate((name) => {
      const rows = [...document.querySelectorAll("table tbody tr")];
      const row = rows.find(tr => tr.innerText?.includes(name));
      if (!row) return null;
      return [...row.querySelectorAll("td")].map(td => td.innerText?.trim());
    }, nameValue);

    if (rowData) {
      for (const [key, colIdx] of Object.entries(config.listColumns)) {
        const cellValue = rowData[colIdx] || "";
        const expected = inputValues[key] || "";
        if (expected && key !== "status") {
          const match = cellValue.includes(expected) || cellValue === expected;
          record(mod, `V01-${key}`, match,
            match ? `Cot ${key}: "${cellValue}" — dung`
            : `Cot ${key}: "${cellValue}" (mong doi "${expected}") [BACKEND] — API list khong tra truong ${key}`);
        }
      }
    }
  }

  // ── Open Edit → Verify fields ──
  t.log("\u25B6", `${moduleKey}-V02: Mo Edit → verify du lieu`);
  const editOk = await t.clickEditOnRow(nameValue);
  if (editOk) {
    record(mod, "V02-open", true, "Modal Edit mo");
    await t.page.waitForTimeout(1000);

    for (const [key, field] of Object.entries(config.fields)) {
      const el = await t.page.$(field.selector);
      if (el) {
        const currentVal = await el.evaluate(e => e.value);
        const expected = inputValues[key] || "";
        if (expected) {
          const match = currentVal === expected || currentVal.includes(expected);
          record(mod, `V02-${key}`, match,
            match ? `Edit ${field.label}: "${currentVal}" — dung`
            : `Edit ${field.label}: "${currentVal}" (mong doi "${expected}") [BACKEND] — API khong tra truong ${key}`);
        }
      }
    }

    // ── Update ──
    t.log("\u25B6", `${moduleKey}-U01: Sua ten`);
    const nameField = await t.page.$(config.fields.name?.selector);
    const newName = nameValue.replace("Test", "Updated").replace("Auto", "Upd");
    if (nameField) {
      await nameField.fill(newName);
      const updateBtn = await t.page.$(config.updateBtn);
      if (updateBtn) {
        await updateBtn.click({ force: true });
        await t.page.waitForTimeout(3000);
        record(mod, "U01", true, `Doi ten → "${newName}"`);
      }
    }

    // Verify update in list
    await t.goto(config.route);
    if (config.tabClick) {
      await t.page.click(config.tabClick, { force: true, timeout: 5000 }).catch(() => {});
      await t.page.waitForTimeout(2000);
    }
    const updatedInList = await t.hasText(newName);
    record(mod, "U02", updatedInList, updatedInList ? `"${newName}" co trong DS` : `"${newName}" KHONG co — update that bai`);

    // ── Delete ──
    t.log("\u25B6", `${moduleKey}-D01: Xoa`);
    const deleteOk = await t.clickDeleteOnRow(newName);
    if (deleteOk) {
      record(mod, "D01-dialog", true, "Dialog xoa hien");
      // Click confirm
      const confirmBtn = await t.page.$('.dialog button:has-text("Xóa"), .dialog button:has-text("Xác nhận"), .dialog button:has-text("Ngừng"), .modal.show button:has-text("Xóa"), .modal.show button:has-text("Xác nhận")');
      if (confirmBtn) {
        await confirmBtn.click({ force: true });
        await t.page.waitForTimeout(3000);
        record(mod, "D01-confirm", true, "Da xac nhan xoa");
      }

      await t.goto(config.route);
      if (config.tabClick) {
        await t.page.click(config.tabClick, { force: true, timeout: 5000 }).catch(() => {});
        await t.page.waitForTimeout(2000);
      }
      const gone = !(await t.hasText(newName));
      record(mod, "D02", gone, gone ? "Da xoa/ngung su dung khoi DS" : "Van con trong DS (co the chuyen trang thai)");
    } else {
      record(mod, "D01", false, "Dialog xoa khong hien");
    }
  } else {
    record(mod, "V02-open", false, "Khong mo duoc Edit");
  }
}

async function main() {
  const t = await createTestRunner("CRUD-ALL", "CRUD toan bo he thong");
  const args = process.argv.slice(2);
  const moduleFilter = args.find(a => a.startsWith("--module="))?.split("=")[1];

  try {
    if (!(await t.login())) throw new Error("Login failed");

    const modulesToTest = moduleFilter
      ? { [moduleFilter]: MODULES[moduleFilter] }
      : MODULES;

    // Test San pham rieng (flow dac biet: can them bien the)
    if (!moduleFilter || moduleFilter === "product") {
      try { await testProduct(t); } catch (err) {
        record("San pham", "ERROR", false, `Crash: ${err.message}`);
        await t.screenshot("product-error");
      }
    }

    for (const [key, config] of Object.entries(modulesToTest)) {
      if (!config) continue;
      try {
        await testModule(t, key, config);
      } catch (err) {
        record(config.name, "ERROR", false, `Crash: ${err.message}`);
        await t.screenshot(`${key}-error`);
      }
    }

  } catch (err) {
    t.log("\u{1F4A5}", `Error: ${err.message}`);
  }

  // ── Print results ──
  console.log("\n" + "═".repeat(60));
  console.log("  KET QUA CRUD TOAN BO");
  console.log("═".repeat(60));
  results.details.forEach(r => {
    console.log(`  ${r.status === "PASS" ? "\u2705" : "\u274C"} [${r.module}] ${r.testId}: ${r.detail}`);
  });
  console.log("\n" + "-".repeat(60));
  console.log(`  PASS: ${results.pass} | FAIL: ${results.fail} | Total: ${results.pass + results.fail}`);

  if (results.backendBugs.length > 0) {
    console.log("\n  \u{1F41B} BACKEND BUGS:");
    results.backendBugs.forEach(b => {
      console.log(`    - [${b.module}] ${b.testId}: ${b.detail}`);
    });
  }
  console.log("═".repeat(60));

  // Save report
  const fs = await import("fs");
  fs.writeFileSync(`tests/reports/crud-all-${t.RUN_ID}.json`, JSON.stringify(results, null, 2));

  const report = await t.done();
  process.exit(results.fail > 0 ? 1 : 0);
}

main();
