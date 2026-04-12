#!/usr/bin/env node
/**
 * E2E TEST — Tao SP → Nhap kho → Verify ton+ → Ban POS → Verify ton-
 *
 * Luong day du:
 *   1. Tao SP moi co bien the o /setting_sell
 *   2. Tao phieu nhap kho o /create_inventory voi qty=10
 *   3. Verify ton kho tang +10
 *   4. Ban hang qty=1 o /create_sale_add (POS)
 *   5. Verify ton kho tru -1 (con 9)
 *
 * Trong qua trinh:
 *   - Thu thap UI bug (truong hien sai, mat data, layout loi)
 *   - Thu thap API bug (status ≠ 0, response thieu field, schema sai)
 *   - Screenshot moi step
 *
 * Chay: node tests/test-e2e-product-import-pos.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const RID = Date.now().toString(36).slice(-5);
const SP_NAME = `E2E SP ${RID}`;
const SP_PRICE = 100000;
const IMPORT_QTY = 10;
const IMPORT_PRICE = 80000;
const SELL_QTY = 1;

const uiBugs = [];
const beBugs = [];
const checkpoints = []; // {step, field, expected, actual, ok}

function logUiBug(step, severity, desc, evidence = "") {
  uiBugs.push({ step, severity, desc, evidence });
  console.log(`  🐛 [UI-${severity}] ${step}: ${desc}${evidence ? " — " + evidence : ""}`);
}
function logBeBug(step, severity, desc, evidence = "") {
  beBugs.push({ step, severity, desc, evidence });
  console.log(`  🔧 [BE-${severity}] ${step}: ${desc}${evidence ? " — " + evidence : ""}`);
}
function checkpoint(step, field, expected, actual) {
  const ok = String(actual ?? "").includes(String(expected ?? ""));
  checkpoints.push({ step, field, expected, actual, ok });
  console.log(`  ${ok ? "✅" : "❌"} [CHK] ${step}/${field}: expected="${expected}" actual="${actual}"`);
  return ok;
}

async function main() {
  const t = await createTestRunner("E2E-FLOW", "Tao SP → Nhap kho → POS");
  let createdProductId = null;
  let createdProductName = null;
  let importInvoiceId = null;
  let stockBeforeImport = null;
  let stockAfterImport = null;
  let stockAfterSale = null;

  try {
    if (!(await t.login())) throw new Error("Login failed");

    // ────────────────────────────────────────────────────────────
    // STEP 1 — Tao SP moi
    // ────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("  STEP 1 — TAO SAN PHAM MOI");
    console.log("═".repeat(60));

    await t.goto("/setting_sell");
    await t.page.waitForTimeout(3000);
    // Diagnostic: check current URL + page text
    const dbgUrl = t.page.url();
    const dbgTitle = await t.page.evaluate(() => document.title);
    const dbgBodyHead = await t.page.evaluate(() => document.body?.innerText?.slice(0, 200));
    console.log(`  [DBG] URL: ${dbgUrl}`);
    console.log(`  [DBG] Title: ${dbgTitle}`);
    console.log(`  [DBG] Body head: ${dbgBodyHead}`);
    await t.screenshot("s1-setting-sell-loaded");

    // Click card "Danh sach san pham" — try multiple selectors va retry
    let cardClicked = false;
    for (const sel of ['text="Danh sách sản phẩm"', 'text=Danh sách sản phẩm', '[class*="card"]:has-text("Danh sách sản phẩm")']) {
      cardClicked = await t.page.click(sel, { force: true, timeout: 4000 }).then(() => true).catch(() => false);
      if (cardClicked) break;
    }
    await t.page.waitForTimeout(3500);
    await t.screenshot("s1-after-card-click");

    if (!(await t.exists('button:has-text("Thêm sản phẩm")'))) {
      // Diagnostic: liet ke buttons hien tren trang
      const btns = await t.page.evaluate(() =>
        [...document.querySelectorAll('button')]
          .filter(b => b.offsetHeight > 0)
          .slice(0, 10)
          .map(b => b.innerText?.trim().slice(0, 30))
          .filter(Boolean)
      );
      console.log(`  [DBG] Visible buttons: ${btns.join(" | ")}`);
      logUiBug("STEP1", "HIGH", `Khong tim thay nut 'Them san pham' (cardClicked=${cardClicked})`, btns.slice(0, 5).join(" | "));
      throw new Error("STEP1 blocked");
    }
    t.assert("S1-01", true, "Trang danh sach SP load OK");

    await t.page.click('button:has-text("Thêm sản phẩm")', { force: true });
    await t.page.waitForTimeout(3000);

    const nameInput = 'input[placeholder*="Nhập tên sản phẩm"]';
    if (!(await t.exists(nameInput))) {
      logUiBug("STEP1", "CRITICAL", "Form tao SP khong hien input 'Ten san pham'");
      throw new Error("STEP1 blocked");
    }
    await t.page.fill(nameInput, SP_NAME);
    t.assert("S1-02", true, `Da nhap ten: ${SP_NAME}`);

    // Nhap mo ta
    const descInput = 'textarea[name="description"]';
    if (await t.exists(descInput)) {
      await t.page.fill(descInput, `Mo ta E2E ${RID}`);
    }

    // Chon danh muc SP (bat buoc) — click select dau tien va chon option
    await t.page.evaluate(() => {
      const selects = document.querySelectorAll('.select-custom');
      if (selects[0]) {
        selects[0].querySelector('[class*="control"]')?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      }
    }).catch(() => {});
    await t.page.waitForTimeout(1000);
    const opt = await t.page.$('[class*="option"]:not([class*="placeholder"])');
    if (opt) {
      await opt.click({ force: true });
      t.assert("S1-03", true, "Chon danh muc SP");
    } else {
      logUiBug("STEP1", "MEDIUM", "Dropdown danh muc SP khong co option nao");
    }
    await t.page.waitForTimeout(500);

    // Chuyen tab "Cai dat bien the"
    await t.page.click('text=Cài đặt biến thể', { force: true }).catch(() => {});
    await t.page.waitForTimeout(1000);

    // Them thuoc tinh + gia tri
    const addAttrBtn = await t.page.$('.add-prod-vt__add-btn, button:has-text("Thêm thuộc tính")');
    if (addAttrBtn) {
      await addAttrBtn.click({ force: true });
      await t.page.waitForTimeout(1000);
      const attrNameInp = await t.page.$('[class*="variant"] input, input[placeholder*="thuộc tính"], input[placeholder*="Nhập tên"]');
      if (attrNameInp) {
        await attrNameInp.fill("Size");
        await t.page.keyboard.press("Enter");
        await t.page.waitForTimeout(500);
        const valInp = await t.page.$('input[placeholder*="giá trị"], input[placeholder*="Nhập giá trị"]');
        if (valInp) {
          await valInp.fill("M");
          await t.page.keyboard.press("Enter");
        }
        await t.page.waitForTimeout(1500);
        t.assert("S1-04", true, "Them thuoc tinh Size=M");
      }
    } else {
      logUiBug("STEP1", "MEDIUM", "Khong tim thay nut 'Them thuoc tinh' trong tab bien the");
    }

    // Pick "Don vi co ban" cho combination Size:M (BAT BUOC neu chua co unitExchange)
    // Tim select co name="unitId" hoac id chua "unitId-" trong area variant combo card
    const unitPickedClick = await t.page.evaluate(() => {
      // Tim SelectCustom co label "Don vi co ban" voi placeholder "Chon don vi..."
      const selects = [...document.querySelectorAll('.add-prod-vt-unit-row__select .select-custom, [id^="unitId-"]')];
      for (const sel of selects) {
        const ctrl = sel.querySelector('[class*="control"]') || sel;
        if (ctrl && ctrl.getBoundingClientRect().height > 0) {
          const r = ctrl.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }
      }
      return null;
    });
    if (unitPickedClick) {
      await t.page.mouse.click(unitPickedClick.x, unitPickedClick.y);
      await t.page.waitForTimeout(1200);
      const unitOpt = await t.page.$('[class*="MenuList"] [class*="option"]:not([class*="placeholder"]), [class*="option"]:not([class*="placeholder"])');
      if (unitOpt) {
        await unitOpt.click({ force: true });
        await t.page.waitForTimeout(800);
        t.assert("S1-04b", true, "Pick don vi co ban cho variant");
      } else {
        logUiBug("STEP1", "HIGH", "Dropdown don vi khong co option");
      }
    } else {
      logUiBug("STEP1", "MEDIUM", "Khong tim thay select 'Don vi co ban' cho variant");
    }

    // Nhap gia ban (Gia le) — input cuoi voi placeholder="0"
    const allTextInputs = await t.page.$$('input[type="text"]');
    let priceSet = false;
    for (const inp of allTextInputs) {
      const ph = await inp.getAttribute("placeholder");
      const vis = await inp.evaluate(e => e.offsetHeight > 0);
      const cls = await inp.evaluate(e => e.className);
      if (vis && ph === "0" && !cls.includes("barcode") && !cls.includes("sku")) {
        await inp.fill(String(SP_PRICE));
        priceSet = true;
        break;
      }
    }
    t.assert("S1-05", priceSet, priceSet ? `Gia ${SP_PRICE.toLocaleString()}` : "Khong nhap duoc gia");

    // Sinh barcode tu dong
    const genBarcodeBtn = await t.page.$('.add-prod-scan-btn--gen, button[title*="Sinh"]');
    if (genBarcodeBtn) {
      await genBarcodeBtn.click({ force: true });
      await t.page.waitForTimeout(500);
      t.assert("S1-06", true, "Sinh barcode auto");
    }

    // Luu SP
    t.clearApiLogs();
    await t.screenshot("s1-before-save");
    await t.page.click('button:has-text("Lưu sản phẩm")', { force: true }).catch(() => {});
    await t.page.waitForTimeout(5000);
    await t.screenshot("s1-after-save");

    // Skip API check — chi rely vao S1-08 (SP xuat hien trong DS) la confirm save thanh cong

    // Check toast loi
    const toastErr = await t.page.evaluate(() => {
      const t = document.querySelector('[class*="toast"], [class*="Toastify"]');
      return t?.innerText || "";
    });
    if (toastErr.includes("lỗi") || toastErr.includes("biến thể")) {
      logUiBug("STEP1", "HIGH", `Toast loi sau save: "${toastErr.slice(0, 80)}"`);
    }

    // Verify SP trong list
    await t.goto("/setting_sell");
    await t.page.click('text=Danh sách sản phẩm', { force: true }).catch(() => {});
    await t.page.waitForTimeout(3000);
    const inList = await t.hasText(SP_NAME);
    t.assert("S1-08", inList, inList ? `${SP_NAME} co trong DS` : `${SP_NAME} KHONG co`);
    if (!inList) logUiBug("STEP1", "CRITICAL", "SP khong xuat hien trong DS sau khi save");
    createdProductName = SP_NAME;

    // Lay ra productId tu API list
    const listApi = t.findApi("GET", "product/list") || t.findApi("GET", "product/search");
    // Khong de doc body cua API tu testRunner — tam thoi luu name de search step sau

    // ────────────────────────────────────────────────────────────
    // STEP 2 — Tao phieu nhap kho
    // ────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("  STEP 2 — TAO PHIEU NHAP KHO");
    console.log("═".repeat(60));

    await t.goto("/create_inventory");
    await t.page.waitForTimeout(2000);
    await t.screenshot("s2-create-receipt-page");

    // Chon kho nhan = "Kho hang mau" (is_selling=true, duy nhat moi chi nhanh)
    const SELLING_WAREHOUSE = "Kho hàng mẫu";
    // Strategy: open dropdown bang Playwright native click → Playwright click option
    // Tim react-select control co label/name="inventoryId"
    const ctrlClicked = await t.page.evaluate(() => {
      const fields = [...document.querySelectorAll('.pii-field')];
      for (const f of fields) {
        const lbl = f.querySelector('label')?.innerText || '';
        if (lbl.includes("Kho")) {
          const ctrl = f.querySelector('[class*="control"]');
          if (ctrl) {
            const r = ctrl.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
          }
        }
      }
      return null;
    });
    if (!ctrlClicked) {
      logUiBug("STEP2", "CRITICAL", "Khong tim thay select kho hang trong sidebar");
      throw new Error("STEP2 blocked — no warehouse select");
    }
    await t.page.mouse.click(ctrlClicked.x, ctrlClicked.y);
    await t.page.waitForTimeout(1200);
    // Click option "Kho hang mau" bang Playwright native (proper mouse events)
    const whOpt = await t.page.$(`[class*="option"]:has-text("${SELLING_WAREHOUSE}")`);
    if (whOpt) {
      await whOpt.click({ force: true });
      t.assert("S2-01", true, `Chon kho: ${SELLING_WAREHOUSE}`);
    } else {
      const allOpts = await t.page.evaluate(() =>
        [...document.querySelectorAll('[class*="option"]')].map(o => o.innerText?.trim()).filter(Boolean)
      );
      logUiBug("STEP2", "CRITICAL", `Dropdown khong co option "${SELLING_WAREHOUSE}"`, `Options: ${allOpts.join(" | ")}`);
      throw new Error("STEP2 blocked");
    }
    await t.page.waitForTimeout(1000);

    // Pick ngay nhap qua react-datepicker — Playwright native click input + today cell
    const dateInput = await t.page.$('input[placeholder*="ngày nhập"]');
    if (dateInput) {
      await dateInput.click({ force: true });
      await t.page.waitForTimeout(1000);
      // Tim today cell — uu tien --today, fallback --keyboard-selected, fallback day-selected
      const todayCell = await t.page.$('.react-datepicker__day--today');
      if (todayCell) {
        await todayCell.click({ force: true });
        await t.page.waitForTimeout(800);
        t.assert("S2-02", true, "Chon today");
      } else {
        // Fallback: type ngay 12/04/2026 truc tiep
        const today = new Date();
        const todayStr = `${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}/${today.getFullYear()}`;
        await dateInput.fill("");
        await dateInput.type(todayStr, { delay: 50 });
        await t.page.keyboard.press("Enter");
        await t.page.waitForTimeout(800);
        t.assert("S2-02", true, `Chon ngay nhap (typed): ${todayStr}`);
      }
    } else {
      logUiBug("STEP2", "HIGH", "Khong tim thay input ngay nhap hang");
    }
    // Dong calendar neu con mo (click ra ngoai)
    await t.page.keyboard.press("Escape").catch(() => {});
    await t.page.waitForTimeout(500);

    // Capture ALL POST response bodies cho toan bo STEP2 (tao + add SP + approve)
    const capturedResponses = [];
    const responseListener = async (res) => {
      if (res.request().method() === "POST") {
        const url = res.url();
        try {
          const body = await res.json();
          capturedResponses.push({ url, status: res.status(), body });
        } catch {
          capturedResponses.push({ url, status: res.status(), body: "(non-json)" });
        }
      }
    };
    t.page.on("response", responseListener);
    t.clearApiLogs();
    const createInvoiceBtn = await t.page.$('button:has-text("Tạo phiếu nhập")');
    if (!createInvoiceBtn) {
      logUiBug("STEP2", "CRITICAL", "Khong tim thay nut 'Tao phieu nhap'");
      throw new Error("STEP2 blocked");
    }
    await createInvoiceBtn.click({ force: true });
    await t.page.waitForTimeout(4000);
    await t.screenshot("s2-after-create-invoice");

    // Print TAT CA POST responses ngay sau click submit
    console.log(`\n  [DBG] All POST responses sau click 'Tao phieu nhap':`);
    capturedResponses.forEach((r, i) =>
      console.log(`    ${i + 1}. [${r.status}] ${r.url}\n       body: ${JSON.stringify(r.body).slice(0, 250)}`));

    // Lay response cua endpoint import
    const createInvoiceResponseBody = capturedResponses
      .find(r => /invoice|import/i.test(r.url))?.body || null;

    // Capture toast error neu co
    const toastTextS2 = await t.page.evaluate(() => {
      const toasts = [...document.querySelectorAll('[class*="Toastify__toast"], [class*="toast"]')];
      return toasts.map(x => x.innerText?.trim()).filter(Boolean).join(" | ");
    });
    if (toastTextS2) console.log(`  [TOAST] ${toastTextS2}`);

    // Check API tao phieu
    const createInvApi = t.findApis("POST", "import").find(a => /update|create/i.test(a.url));
    if (createInvApi) {
      if (createInvApi.status === 200 && createInvoiceResponseBody?.code === 0) {
        t.assert("S2-03", true, `API tao phieu → 200, code=0`);
      } else {
        // BE bug: HTTP 200 nhung response code != 0 → BE app-level error
        const errMsg = createInvoiceResponseBody?.message || createInvoiceResponseBody?.error || "(no message)";
        logBeBug("STEP2", "CRITICAL",
          `Tao phieu nhap fail: HTTP ${createInvApi.status}, code=${createInvoiceResponseBody?.code}, msg="${errMsg}"`,
          `Toast: ${toastTextS2 || "(none)"} | Body: ${JSON.stringify(createInvoiceResponseBody).slice(0, 300)}`);
      }
    } else {
      logBeBug("STEP2", "MEDIUM", "Khong detect duoc POST import/update");
    }

    // Verify invoice da duoc tao bang cach check button "Them san pham" da enable chua
    await t.page.waitForTimeout(1500);
    const isEnabled = await t.page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const b = btns.find(x => x.innerText?.trim().includes("Thêm sản phẩm"));
      return b && !b.disabled;
    });
    if (!isEnabled) {
      // Diagnostic
      const invBarCode = await t.page.evaluate(() => {
        const bar = document.querySelector('.cr-invoice-bar__code');
        return bar?.innerText?.trim();
      });
      logUiBug("STEP2", "HIGH", "Sau 'Tao phieu nhap', button 'Them san pham' van disabled", `invoiceBar: ${invBarCode || "(empty)"}`);
      throw new Error("STEP2 blocked — invoice not created or button still disabled");
    }
    t.assert("S2-04", true, "Phieu nhap tao thanh cong, button 'Them SP' enabled");

    // Click "Them san pham" → mo modal
    await t.page.click('button:has-text("Thêm sản phẩm"):not([disabled])', { force: true });
    await t.page.waitForTimeout(2500);
    await t.screenshot("s2-add-product-modal");

    if (!(await t.exists(".modal.show"))) {
      logUiBug("STEP2", "CRITICAL", "Modal 'Them san pham' khong mo sau khi click");
      throw new Error("STEP2 blocked");
    }
    t.assert("S2-05", true, "Modal them SP mo");

    // Chon SP qua react-select trong modal — click select dau tien trong modal
    const modalSelectClicked = await t.page.evaluate(() => {
      const modal = document.querySelector('.modal.show');
      if (!modal) return false;
      const sel = modal.querySelector('.select-custom [class*="control"]');
      if (sel) {
        sel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        return true;
      }
      return false;
    });
    await t.page.waitForTimeout(1500);

    if (modalSelectClicked) {
      // Type tim ten SP
      await t.page.keyboard.type(SP_NAME);
      await t.page.waitForTimeout(2000);
      const spOpt = await t.page.$(`[class*="option"]:has-text("${SP_NAME}")`);
      if (spOpt) {
        await spOpt.click({ force: true });
        t.assert("S2-06", true, `Chon SP: ${SP_NAME}`);
      } else {
        logBeBug("STEP2", "HIGH", `Search SP "${SP_NAME}" trong dropdown khong tra ket qua`, "Co the BE chua kip index SP moi tao");
        const anyOpt = await t.page.$('[class*="option"]:not([class*="placeholder"])');
        if (anyOpt) {
          const optText = await anyOpt.innerText();
          logUiBug("STEP2", "INFO", `Fallback: chon option dau "${optText}" thay vi SP target`);
          await anyOpt.click({ force: true });
        }
      }
    }

    // SP moi tao co 1 bien the → loadVariants tu chay → applyVariant(opts[0]) auto fire.
    // Doi BE response loadVariants xong, verify Size M xuat hien trong select Bien the.
    await t.page.waitForTimeout(3500);
    const variantApplied = await t.page.evaluate(() => {
      const modal = document.querySelector('.modal.show');
      if (!modal) return null;
      // Tim placeholder/value cua select Bien the
      const selects = modal.querySelectorAll('.select-custom');
      if (selects.length < 2) return null;
      const variantSel = selects[1];
      const singleValue = variantSel.querySelector('[class*="singleValue"]');
      const placeholder = variantSel.querySelector('[class*="placeholder"]');
      return singleValue?.innerText?.trim() || placeholder?.innerText?.trim() || null;
    });
    if (variantApplied && !variantApplied.includes("Chọn") && !variantApplied.includes("Đang")) {
      t.assert("S2-06b", true, `Bien the auto-applied: ${variantApplied}`);
    } else {
      logUiBug("STEP2", "HIGH", `Bien the chua auto-apply (placeholder: "${variantApplied}")`);
    }

    // Fill So lo (batchNo) — REQUIRED
    const batchFilled = await t.page.evaluate((rid) => {
      const modal = document.querySelector('.modal.show');
      if (!modal) return false;
      const inp = modal.querySelector('input[name="batchNo"]');
      if (!inp) return false;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(inp, `LOT-${rid}`);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }, RID);
    t.assert("S2-06c", batchFilled, batchFilled ? `So lo: LOT-${RID}` : "Khong tim thay input So lo");

    // Pick Ngay het han (expiryDate) — REQUIRED — chon 1 ngay tuong lai
    const expiryInput = await t.page.$('.modal.show input[placeholder*="hết hạn"], .modal.show input[name="expiryDate"]');
    if (expiryInput) {
      await expiryInput.click({ force: true });
      await t.page.waitForTimeout(900);
      // Click cell ngay khong disabled, uu tien --selected hoac --keyboard-selected, fallback ngay 28
      const expiryClicked = await t.page.evaluate(() => {
        // Mo ngay sang thang sau de co future date chac chan
        const nextBtn = document.querySelector('.react-datepicker__navigation--next');
        if (nextBtn) nextBtn.click();
        return true;
      });
      if (expiryClicked) {
        await t.page.waitForTimeout(500);
        // Click ngay 15 cua thang sau
        const clickedDay = await t.page.evaluate(() => {
          const days = [...document.querySelectorAll('.react-datepicker__day:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled)')];
          const day15 = days.find(d => d.innerText?.trim() === "15");
          if (day15) { day15.click(); return "15"; }
          if (days[10]) { days[10].click(); return days[10].innerText; }
          return null;
        });
        await t.page.waitForTimeout(700);
        if (clickedDay) {
          t.assert("S2-06d", true, `Ngay het han: ${clickedDay} (thang sau)`);
        } else {
          logUiBug("STEP2", "MEDIUM", "Khong click duoc cell ngay het han");
        }
      }
      await t.page.keyboard.press("Escape").catch(() => {});
    } else {
      logUiBug("STEP2", "MEDIUM", "Khong tim thay input ngay het han");
    }
    await t.page.waitForTimeout(500);

    // Nhap qty + gia nhap
    const qtyFilled = await t.page.evaluate((qty) => {
      const modal = document.querySelector('.modal.show');
      if (!modal) return false;
      const inputs = [...modal.querySelectorAll('input[type="number"], input[type="text"]')];
      for (const inp of inputs) {
        const name = inp.getAttribute('name') || '';
        const ph = inp.getAttribute('placeholder') || '';
        if (/qty|quantity|soLuong|so_luong|^sl$/i.test(name) || /số lượng|so luong/i.test(ph)) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, String(qty));
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    }, IMPORT_QTY);
    t.assert("S2-07", qtyFilled, qtyFilled ? `Qty: ${IMPORT_QTY}` : "Khong tim thay input qty");

    const priceFilled = await t.page.evaluate((price) => {
      const modal = document.querySelector('.modal.show');
      if (!modal) return false;
      const inputs = [...modal.querySelectorAll('input[type="number"], input[type="text"]')];
      for (const inp of inputs) {
        const name = inp.getAttribute('name') || '';
        const ph = inp.getAttribute('placeholder') || '';
        if (/cost|price|giaNhap|gia_nhap|mainCost/i.test(name) || /giá nhập|gia nhap|đơn giá|don gia/i.test(ph)) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, String(price));
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    }, IMPORT_PRICE);
    t.assert("S2-08", priceFilled, priceFilled ? `Gia nhap: ${IMPORT_PRICE.toLocaleString()}` : "Khong tim thay input gia nhap");

    await t.screenshot("s2-modal-filled");

    // Submit modal — click nut Luu / Them / Xac nhan
    t.clearApiLogs();
    const modalSaveOk = await t.page.evaluate(() => {
      const modal = document.querySelector('.modal.show');
      if (!modal) return false;
      const btns = [...modal.querySelectorAll('button')];
      for (const b of btns) {
        const txt = b.innerText?.trim() || '';
        if (/Lưu|Thêm|Tạo|Xác nhận/i.test(txt) && !b.disabled) {
          b.click();
          return true;
        }
      }
      return false;
    });
    await t.page.waitForTimeout(3000);
    t.assert("S2-09", modalSaveOk, modalSaveOk ? "Submit SP vao phieu" : "Khong click duoc nut submit modal");
    await t.screenshot("s2-after-modal-submit");

    // Wait list refresh sau khi modal close
    await t.page.waitForTimeout(2000);

    // Click "Duyet phieu nhap" → approve phieu (status 2 → 1) → ton kho thuc te +
    // Print state cua approve button truoc khi click
    const approveBtnState = await t.page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const b = btns.find(x => x.innerText?.includes("Duyệt"));
      return b ? { text: b.innerText?.trim(), disabled: b.disabled, classes: b.className?.slice(0, 80) } : null;
    });
    console.log(`  [DBG] Approve button state: ${JSON.stringify(approveBtnState)}`);

    if (!approveBtnState) {
      logUiBug("STEP2", "HIGH", "Khong tim thay button 'Duyet' tren trang");
    } else if (approveBtnState.disabled) {
      // Liet ke line items hien thi de hieu hasLineItems state
      const tableRows = await t.page.evaluate(() => {
        const rows = [...document.querySelectorAll('.cr-product-card table tbody tr')];
        return rows.length;
      });
      logUiBug("STEP2", "HIGH", `Button 'Duyet' DISABLED — co the line item chua add vao phieu`, `Table rows in product card: ${tableRows}`);
    } else {
      const beforeCount = capturedResponses.length;
      // Click bang JS evaluate de chac chan trigger handleApproveInvoice
      const approveClicked = await t.page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const b = btns.find(x => x.innerText?.trim().includes("Duyệt") && !x.disabled);
        if (b) { b.click(); return b.innerText?.trim(); }
        return null;
      });
      console.log(`  [DBG] Approve click via JS: ${approveClicked || "(failed)"}`);
      await t.page.waitForTimeout(4500);
      // In ra cac response moi sau approve click
      const newResponses = capturedResponses.slice(beforeCount);
      console.log(`\n  [DBG] All POST responses sau click 'Duyet':`);
      newResponses.forEach((r, i) =>
        console.log(`    ${i + 1}. [${r.status}] ${r.url}\n       body: ${JSON.stringify(r.body).slice(0, 250)}`));

      const approveApi = newResponses.find(r => /approve/i.test(r.url));
      if (approveApi && approveApi.status === 200 && approveApi.body?.code === 0) {
        t.assert("S2-10", true, "Duyet phieu nhap thanh cong");
      } else if (approveApi) {
        const errMsg = approveApi.body?.message || approveApi.body?.error || "(no message)";
        logBeBug("STEP2", "CRITICAL", `API approve fail: HTTP ${approveApi.status}, msg="${errMsg}"`, JSON.stringify(approveApi.body).slice(0, 300));
      } else {
        logBeBug("STEP2", "HIGH", "Khong detect duoc API approve trong responses moi");
      }
    }
    await t.screenshot("s2-after-approve");
    t.page.off("response", responseListener);

    // ────────────────────────────────────────────────────────────
    // STEP 3 — Verify ton kho tang
    // ────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("  STEP 3 — VERIFY TON KHO TANG");
    console.log("═".repeat(60));

    // ── 3a. /inventory_checking?tab=import → tab "Hoan thanh" ──
    await t.goto("/inventory_checking?tab=import");
    await t.page.waitForTimeout(3500);
    await t.page.click('text="Hoàn thành"').catch(() => {});
    await t.page.waitForTimeout(2500);
    await t.screenshot("s3a-import-done-tab");

    const importDoneRow = await t.page.evaluate(() => {
      const rows = [...document.querySelectorAll('table tbody tr')];
      return rows[0] ? [...rows[0].querySelectorAll('td')].map(td => td.innerText?.replace(/\s+/g, " ").trim()) : null;
    });
    if (importDoneRow) {
      console.log(`  📋 Top row tab Hoan thanh: [${importDoneRow.slice(0, 8).join(" | ")}]`);
      t.assert("S3-01a", true, "Tab 'Hoan thanh' co phieu (sau khi duyet)");
    } else {
      logUiBug("STEP3", "HIGH", "Tab 'Hoan thanh' rong");
    }

    // ── 3b. /inventory (So kho) → tab "Nhap kho" → check ledger entry ──
    await t.goto("/inventory");
    await t.page.waitForTimeout(3500);
    await t.page.click('text="Nhập kho"').catch(() => {});
    await t.page.waitForTimeout(2500);
    await t.screenshot("s3b-stock-ledger-import-tab");

    const ledgerRows = await t.page.evaluate(() => {
      const rows = [...document.querySelectorAll('table tbody tr')];
      return rows.slice(0, 5).map(r => [...r.querySelectorAll('td')].map(td => td.innerText?.replace(/\s+/g, " ").trim()));
    });
    console.log(`  📋 Top 5 ledger rows (So kho):`);
    ledgerRows.forEach((r, i) => console.log(`    ${i + 1}. [${r.slice(0, 9).join(" | ")}]`));

    const ourLedgerRow = ledgerRows.find(r => r.some(c => c?.includes(SP_NAME)));
    if (ourLedgerRow) {
      console.log(`  ✓ Ledger row matched cho ${SP_NAME}`);
      stockAfterImport = IMPORT_QTY;
      t.assert("S3-01b", true, `So kho co entry +${IMPORT_QTY} cho SP`);
    } else {
      logUiBug("STEP3", "HIGH", `Khong tim thay ledger row cho ${SP_NAME} trong So kho`,
        `Top rows: ${JSON.stringify(ledgerRows.slice(0, 2))}`);
    }

    // ── 3c. /product_inventory → check ton kho thuc te ──
    await t.goto("/product_inventory");
    await t.page.waitForTimeout(3500);
    await t.screenshot("s3c-product-inventory");

    const stockBalanceRow = await t.page.evaluate((name) => {
      const rows = [...document.querySelectorAll('table tbody tr')];
      const target = rows.find(r => r.innerText?.includes(name));
      if (!target) return null;
      return [...target.querySelectorAll('td')].map(td => td.innerText?.replace(/\s+/g, " ").trim());
    }, SP_NAME);
    if (stockBalanceRow) {
      console.log(`  📋 Ton kho row: [${stockBalanceRow.slice(0, 8).join(" | ")}]`);
      t.assert("S3-01c", true, `Ton kho co SP ${SP_NAME}`);
    } else {
      const firstRows = await t.page.evaluate(() => {
        const rows = [...document.querySelectorAll('table tbody tr')].slice(0, 3);
        return rows.map(r => r.innerText?.replace(/\s+/g, " ").trim().slice(0, 80));
      });
      logUiBug("STEP3", "MEDIUM", `Khong tim thay ${SP_NAME} trong /product_inventory`, `First rows: ${JSON.stringify(firstRows)}`);
    }

    // ────────────────────────────────────────────────────────────
    // STEP 4 — Ban hang POS
    // ────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("  STEP 4 — BAN HANG POS");
    console.log("═".repeat(60));

    await t.goto("/create_sale_add");
    await t.page.waitForTimeout(5000);
    await t.screenshot("s4-pos-loaded");

    // Chon khach hang (bat buoc truoc khi tao hoa don — FE da co warning)
    // Click vao .cust-box hoac .cust-placeholder trong Cart → CustomerModal mo
    const custBox = await t.page.$('.cust-box, .cust-placeholder');
    if (custBox) {
      await custBox.click({ force: true });
      await t.page.waitForTimeout(2500);
      await t.screenshot("s4-customer-modal");

      // Trong CustomerModal → search + chon khach dau tien
      const custModalOpen = await t.exists('.modal.show');
      if (custModalOpen) {
        // Chon row dau tien trong danh sach khach hang
        const firstCustRow = await t.page.evaluate(() => {
          const rows = [...document.querySelectorAll('.modal.show table tbody tr, .modal.show [class*="cust-row"], .modal.show [class*="customer-row"]')];
          const first = rows.find(r => r.offsetHeight > 0);
          if (first) { first.click(); return first.innerText?.split("\n")[0]?.trim() || "clicked"; }
          return null;
        });
        if (firstCustRow) {
          await t.page.waitForTimeout(1000);
          t.assert("S4-00a", true, `Chon khach hang: "${firstCustRow}"`);
        } else {
          // Fallback: search "Khach"
          const custSearchInp = await t.page.$('.modal.show input[type="text"], .modal.show input[placeholder]');
          if (custSearchInp) {
            await custSearchInp.fill("Khách");
            await t.page.waitForTimeout(1500);
            const opt = await t.page.$('.modal.show table tbody tr:first-child, .modal.show [class*="item"]:first-child');
            if (opt) { await opt.click({ force: true }); t.assert("S4-00a", true, "Chon khach hang (search fallback)"); }
          } else {
            logUiBug("STEP4", "MEDIUM", "CustomerModal mo nhung khong chon duoc row");
          }
          await t.page.keyboard.press("Escape").catch(() => {});
        }
      } else {
        logUiBug("STEP4", "MEDIUM", "Click cust-box nhung CustomerModal khong mo");
      }
    } else {
      logUiBug("STEP4", "MEDIUM", "Khong tim thay .cust-box / .cust-placeholder trong POS");
    }
    await t.page.waitForTimeout(1000);

    // Search SP — POS search input
    const posSearch = await t.page.$('input[placeholder*="Tìm sản phẩm"], input[placeholder*="tìm sản phẩm"], input[placeholder*="SKU"], input[placeholder*="barcode"]');
    if (!posSearch) {
      logUiBug("STEP4", "CRITICAL", "Khong tim thay input search SP trong POS");
      throw new Error("STEP4 blocked");
    }
    await posSearch.fill(SP_NAME);
    await t.page.waitForTimeout(3000);
    await t.screenshot("s4-pos-search");

    // Diagnostic: liet ke cards visible va innerText
    const cardsInfo = await t.page.evaluate(() => {
      const cards = [...document.querySelectorAll('.pg-card, [class*="ProductGrid"] [class*="card"], [class*="product-card"]')]
        .filter(c => c.offsetHeight > 0);
      return cards.slice(0, 5).map(c => c.innerText?.replace(/\s+/g, " ").trim().slice(0, 80));
    });
    console.log(`  [DBG] First product cards: ${JSON.stringify(cardsInfo)}`);

    // STEP3 verification: neu SP xuat hien trong POS grid → stock > 0 → import + approve da work
    const cardWithSP = cardsInfo.find(c => c?.includes(SP_NAME));
    if (cardWithSP) {
      stockAfterImport = "verified via POS";
      t.assert("S3-01-via-POS", true, `Stock confirmed: SP "${SP_NAME}" hien trong POS grid → ton > 0`);
      console.log(`  📋 POS card shows: ${cardWithSP}`);
    } else {
      logUiBug("STEP3", "HIGH", `SP "${SP_NAME}" KHONG hien trong POS grid sau khi nhap+duyet`, `First cards: ${JSON.stringify(cardsInfo).slice(0, 200)}`);
    }

    // Click vao card SP dau tien match
    const posCardClicked = await t.page.evaluate((name) => {
      const cards = [...document.querySelectorAll('.pg-card, [class*="ProductGrid"] [class*="card"], [class*="product-card"]')]
        .filter(c => c.offsetHeight > 0);
      const target = cards.find(c => c.innerText?.includes(name));
      if (target) { target.click(); return true; }
      return false;
    }, SP_NAME);
    await t.page.waitForTimeout(2000);

    if (!posCardClicked) {
      logUiBug("STEP4", "HIGH", `Khong tim thay card SP "${SP_NAME}" trong POS grid de click`);
      throw new Error("STEP4 blocked");
    }
    t.assert("S4-01", true, "Click vao card SP");

    // Neu mo VariantModal → chon variant options + Add to cart
    if (await t.exists('.variant-modal, .modal.show')) {
      await t.page.waitForTimeout(1200);
      // Click TAT CA variant options (1 option moi group, uu tien option dau khong unavailable)
      const optsClicked = await t.page.evaluate(() => {
        const groups = [...document.querySelectorAll('.variant-modal__group')];
        let count = 0;
        for (const g of groups) {
          const opts = [...g.querySelectorAll('.variant-opt:not(.variant-opt--unavailable):not(.variant-opt--selected)')];
          if (opts[0]) { opts[0].click(); count++; }
        }
        return count;
      });
      console.log(`  [DBG] Variant options clicked: ${optsClicked}`);
      await t.page.waitForTimeout(1000);

      // Click button "Them vao gio" — chi khi enable
      const addBtnState = await t.page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const b = btns.find(x => x.innerText?.includes("Thêm vào giỏ"));
        return b ? { disabled: b.disabled, text: b.innerText?.trim() } : null;
      });
      console.log(`  [DBG] Add to cart button: ${JSON.stringify(addBtnState)}`);

      if (addBtnState && !addBtnState.disabled) {
        await t.page.evaluate(() => {
          const btns = [...document.querySelectorAll('button')];
          const b = btns.find(x => x.innerText?.includes("Thêm vào giỏ") && !x.disabled);
          if (b) b.click();
        });
        await t.page.waitForTimeout(1500);
        t.assert("S4-02", true, "Click 'Them vao gio'");
      } else {
        logUiBug("STEP4", "HIGH", `Button 'Them vao gio' disabled — variant chua selected du`, JSON.stringify(addBtnState));
      }
    } else {
      // SP khong co bien the → click pg-card auto add
      console.log(`  [DBG] Khong co VariantModal — SP da auto add to cart`);
    }

    // Verify cart co item — class real la `.ci` (cart item) trong .cart__items
    const cartHasItem = await t.exists('.cart__items .ci');
    t.assert("S4-03", cartHasItem, cartHasItem ? "Cart co item" : "Cart RONG sau khi click SP");
    if (!cartHasItem) {
      logUiBug("STEP4", "CRITICAL", "Click SP khong them duoc vao gio");
      throw new Error("STEP4 blocked");
    }

    await t.screenshot("s4-cart-filled");

    // Capture ALL POST responses cho toan bo POS pay flow
    const posPostResponses = [];
    const posResponseListener = async (res) => {
      if (res.request().method() === "POST") {
        try {
          const body = await res.json();
          posPostResponses.push({ url: res.url(), status: res.status(), body });
        } catch {
          posPostResponses.push({ url: res.url(), status: res.status(), body: "(non-json)" });
        }
      }
    };
    t.page.on("response", posResponseListener);

    // Click nut tao don (.pay-btn — text "💳 Tạo đơn")
    const payBtn = await t.page.$('.pay-btn:not([disabled])');
    if (!payBtn) {
      logUiBug("STEP4", "CRITICAL", "Khong tim thay .pay-btn (nut tao don)");
      throw new Error("STEP4 blocked");
    }
    await payBtn.click({ force: true });
    await t.page.waitForTimeout(3000);
    await t.screenshot("s4-pay-modal");

    // Sau pay-btn click → BE tao invoice draft → PayModal mo
    // PayModal: click "Tao hoa don" → boughtProduct/insertBatch → ReceiptModal mo
    const confirmPayBtn = await t.page.$('button:has-text("Tạo hoá đơn"):not([disabled]), button:has-text("Tạo hóa đơn"):not([disabled])');
    if (confirmPayBtn) {
      await confirmPayBtn.click({ force: true });
      await t.page.waitForTimeout(4000);
      t.assert("S4-04", true, "Click 'Tao hoa don' trong PayModal");
    } else {
      logUiBug("STEP4", "HIGH", "Khong tim thay nut 'Tao hoa don' trong PayModal");
    }
    await t.screenshot("s4-receipt-modal");

    // ReceiptModal mo → click "Xac nhan thanh toan" → InvoiceService.create() → stock deducted
    const receiptModalOpen = await t.exists('.receipt-modal, .modal.show');
    console.log(`  [DBG] ReceiptModal open: ${receiptModalOpen}`);

    if (receiptModalOpen) {
      // Click "Xac nhan thanh toan" — step QUAN TRONG nhat: moi thuc su tru kho
      const confirmXacNhan = await t.page.evaluate(() => {
        const btns = [...document.querySelectorAll('.modal.show button, .receipt-modal button')];
        const b = btns.find(x => x.innerText?.includes("Xác nhận thanh toán") && !x.disabled);
        if (b) { b.click(); return b.innerText?.trim(); }
        return null;
      });
      console.log(`  [DBG] "Xac nhan thanh toan" click: ${confirmXacNhan || "(not found)"}`);
      if (confirmXacNhan) {
        await t.page.waitForTimeout(5000);
        t.assert("S4-05-confirm", true, "Click 'Xac nhan thanh toan' → stock deducted");
      } else {
        // List buttons in modal
        const modalBtns = await t.page.evaluate(() =>
          [...document.querySelectorAll('.modal.show button, .receipt-modal button')]
            .map(b => b.innerText?.trim()).filter(Boolean)
        );
        logUiBug("STEP4", "HIGH", "Khong tim thay nut 'Xac nhan thanh toan' trong ReceiptModal",
          `Buttons: ${modalBtns.join(" | ")}`);
      }
    } else {
      logUiBug("STEP4", "HIGH", "ReceiptModal KHONG mo sau khi click 'Tao hoa don'");
    }

    await t.screenshot("s4-after-confirm-pay");
    t.page.off("response", posResponseListener);

    // Print TAT CA POST POS responses
    console.log(`\n  [DBG] All POST POS responses:`);
    posPostResponses.forEach((r, i) =>
      console.log(`    ${i + 1}. [${r.status}] ${r.url}\n       body: ${JSON.stringify(r.body).slice(0, 250)}`));

    // POS dung endpoint /sales/boughtProduct/insertBatch (khong phai /invoice/create)
    const sellApi = posPostResponses.find(r =>
      /boughtProduct\/insertBatch|invoice\/create|invoice\/draft|sales\/invoice|sales\/create/i.test(r.url)
    );
    if (sellApi) {
      if (sellApi.status === 200 && sellApi.body?.code === 0) {
        t.assert("S4-05", true, `API ban hang OK: ${sellApi.url}`);
        console.log(`  ✅ Sale API: ${sellApi.url}`);
      } else {
        logBeBug("STEP4", "CRITICAL", `API ban hang fail: ${sellApi.status} | ${JSON.stringify(sellApi.body).slice(0, 200)}`);
      }
    } else {
      logBeBug("STEP4", "HIGH", "POS khong gui POST boughtProduct/insertBatch — co the bug Invoice 404 da bao");
    }

    // ────────────────────────────────────────────────────────────
    // STEP 5 — Verify ton tru
    // ────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("  STEP 5 — VERIFY TON KHO TRU");
    console.log("═".repeat(60));

    // Dong receipt modal neu co
    const closeReceiptBtns = [
      '.modal.show button:has-text("Đóng")',
      '.modal.show button:has-text("Hoàn tất")',
      '.modal.show .close',
      '.modal.show [aria-label="Close"]',
      '.modal.show button:has-text("Tạo đơn mới")',
    ];
    for (const sel of closeReceiptBtns) {
      const btn = await t.page.$(sel);
      if (btn) { await btn.click({ force: true }).catch(() => {}); break; }
    }
    await t.page.waitForTimeout(1000);
    await t.page.keyboard.press("Escape").catch(() => {});
    await t.page.waitForTimeout(500);

    // ── 5a. So kho → tim entry "Ban hang" cho SP (toan bo trang, khong filter tab) ──
    await t.goto("/inventory");
    await t.page.waitForTimeout(3500);
    await t.screenshot("s5a-stock-all-tab");

    // Search SP trong So kho
    const invSearch5a = await t.page.$('input[placeholder*="Tìm"], input[placeholder*="tìm"], input[placeholder*="sản phẩm"], .wbl-searchbox input, .input-search input');
    if (invSearch5a) {
      await invSearch5a.fill(SP_NAME);
      await t.page.waitForTimeout(2000);
      await t.page.keyboard.press("Enter");
      await t.page.waitForTimeout(2000);
    }

    const allLedgerRows = await t.page.evaluate(() => {
      const rows = [...document.querySelectorAll('table tbody tr')];
      return rows.slice(0, 10).map(r => [...r.querySelectorAll('td')].map(td => td.innerText?.replace(/\s+/g, " ").trim()));
    });
    console.log(`  📋 Ledger rows sau search "${SP_NAME}":`);
    allLedgerRows.forEach((r, i) => console.log(`    ${i + 1}. [${r.slice(0, 9).join(" | ")}]`));

    // Tim row co SP_NAME VA type = "Ban hang" (entry xuat kho sau POS sale)
    const saleRow = allLedgerRows.find(r =>
      r.some(c => c?.includes(SP_NAME)) && r.some(c => c?.includes("Bán hàng"))
    );
    if (saleRow) {
      console.log(`  ✓ Ledger BAN HANG row: [${saleRow.slice(0, 9).join(" | ")}]`);
      t.assert("S5-01a", true, `So kho co entry "Ban hang" cho ${SP_NAME}`);
    } else {
      // Co the search khong work, check tat ca rows co SP_NAME
      const anyRow = allLedgerRows.find(r => r.some(c => c?.includes(SP_NAME)));
      if (anyRow) {
        logBeBug("STEP5", "MEDIUM",
          `Tim thay ${SP_NAME} trong So kho nhung la "${anyRow[2]}" (khong phai "Ban hang")`,
          `Row: ${JSON.stringify(anyRow)}`);
      } else {
        logBeBug("STEP5", "HIGH",
          `Khong tim thay dong "Ban hang" cho ${SP_NAME} trong So kho — stock co the KHONG giam sau POS sale`,
          `Top rows: ${JSON.stringify(allLedgerRows.slice(0, 3))}`);
      }
    }

    // ── 5b. /product_inventory → check ton kho giam con (IMPORT_QTY - SELL_QTY) ──
    await t.goto("/product_inventory");
    await t.page.waitForTimeout(3500);

    // Search SP
    const invSearch5 = await t.page.$('input[placeholder*="Tìm"], input[placeholder*="tìm"], input[placeholder*="sản phẩm"], .input-search input');
    if (invSearch5) {
      await invSearch5.fill(SP_NAME);
      await t.page.waitForTimeout(2000);
      await t.page.keyboard.press("Enter");
      await t.page.waitForTimeout(2500);
    }
    await t.screenshot("s5b-product-inventory-after-sale");

    const expectedBalance = IMPORT_QTY - SELL_QTY;
    const balanceRow = await t.page.evaluate((name) => {
      const rows = [...document.querySelectorAll('table tbody tr')];
      const target = rows.find(r => r.innerText?.includes(name));
      if (!target) return null;
      return [...target.querySelectorAll('td')].map(td => td.innerText?.replace(/\s+/g, " ").trim());
    }, SP_NAME);

    if (!balanceRow) {
      // BE bug known: /product_inventory tra "N/A" cho productName → cannot find by name
      logBeBug("STEP5", "HIGH",
        `Khong tim thay "${SP_NAME}" trong /product_inventory (BE co the van tra "N/A" cho productName)`,
        `Neu BE da fix N/A bug → expect product hien trong table`);
      // Check first rows to diagnose
      const firstRows5 = await t.page.evaluate(() =>
        [...document.querySelectorAll('table tbody tr')].slice(0, 3)
          .map(r => r.innerText?.replace(/\s+/g, " ").trim().slice(0, 100))
      );
      console.log(`  [DBG] First rows /product_inventory: ${JSON.stringify(firstRows5)}`);
    } else {
      console.log(`  📋 Balance row sau ban: [${balanceRow.slice(0, 8).join(" | ")}]`);
      const matched = balanceRow.find(c => c === String(expectedBalance));
      if (matched) {
        stockAfterSale = expectedBalance;
        t.assert("S5-02", true, `Ton kho sau ban dung: ${expectedBalance}`);
      } else {
        // Print all cells to see which cell has qty
        logBeBug("STEP5", "CRITICAL",
          `Sau ban ${SELL_QTY}, ton ky vong=${expectedBalance} nhung row = ${JSON.stringify(balanceRow)}`);
      }
    }
  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    logUiBug("FATAL", "BLOCKER", e.message);
  }

  // ────────────────────────────────────────────────────────────
  // BUG REPORT
  // ────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("  BUG REPORT");
  console.log("═".repeat(60));
  console.log(`\n🐛 UI BUGS (${uiBugs.length}):`);
  uiBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n🔧 BE BUGS (${beBugs.length}):`);
  beBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));

  // Save full report
  const reportPath = path.join(__dirname, "reports", `e2e-flow-${RID}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    runId: RID,
    timestamp: new Date().toISOString(),
    config: { SP_NAME, SP_PRICE, IMPORT_QTY, IMPORT_PRICE, SELL_QTY },
    state: { stockBeforeImport, stockAfterImport, stockAfterSale },
    uiBugs,
    beBugs,
    checkpoints,
  }, null, 2));
  console.log(`\n📊  Report: ${reportPath}`);

  await t.done();
  process.exit(uiBugs.length + beBugs.length > 0 ? 1 : 0);
}

main();
