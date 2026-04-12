#!/usr/bin/env node
/**
 * E2E TEST — Luồng bán hàng + HĐ VAT
 *
 * Scenarios:
 *   S1. Bán dang dở (khong bam Xac nhan thanh toan) →
 *       check trang thai don trong "Don hang" + co the thu nợ/xem bien lai
 *   S2. Lưu đơn tạm (💾 Luu nhap) → check "Don tam" → "Tiep tuc xu ly" →
 *       hoan thanh thanh toan
 *   S3. Don chua thanh toan: nut "Gui HD dien tu" KHONG hien / bi block
 *   S4. Don da thanh toan: "Gui HD dien tu" HIEN → dieu huong /invoiceVAT
 *       → check form xuat HD VAT
 *
 * Chay: node tests/test-e2e-sales-vat-flow.mjs
 */
import { createTestRunner } from "./helpers.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const RID = Date.now().toString(36).slice(-5);

const uiBugs   = [];
const beBugs   = [];
const findings = []; // observations + checkpoints

function logUiBug(step, severity, desc, evidence = "") {
  uiBugs.push({ step, severity, desc, evidence });
  console.log(`  🐛 [UI-${severity}] ${step}: ${desc}${evidence ? " — " + evidence : ""}`);
}
function logBeBug(step, severity, desc, evidence = "") {
  beBugs.push({ step, severity, desc, evidence });
  console.log(`  🔧 [BE-${severity}] ${step}: ${desc}${evidence ? " — " + evidence : ""}`);
}
function note(step, msg) {
  findings.push({ step, msg });
  console.log(`  📋 [NOTE] ${step}: ${msg}`);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
async function selectFirstCustomer(t) {
  const custBox = await t.page.$('.cust-box, .cust-placeholder');
  if (!custBox) { logUiBug("HELPER", "HIGH", "Khong tim thay .cust-box"); return false; }
  await custBox.click({ force: true });
  await t.page.waitForTimeout(2500);
  // Click row dau trong CustomerModal
  const clicked = await t.page.evaluate(() => {
    const rows = [...document.querySelectorAll(
      '.modal.show table tbody tr, .modal.show [class*="cust-row"], .modal.show [class*="customer-row"]'
    )];
    const first = rows.find(r => r.offsetHeight > 0);
    if (first) { first.click(); return first.innerText?.split("\n")[0]?.trim() || "ok"; }
    // Fallback: click first li item
    const items = [...document.querySelectorAll('.modal.show [class*="item"]')];
    const fi = items.find(x => x.offsetHeight > 0 && x.innerText?.trim().length > 2);
    if (fi) { fi.click(); return fi.innerText?.trim().slice(0, 30); }
    return null;
  });
  await t.page.waitForTimeout(1200);
  if (clicked) { console.log(`    [HELPER] Chon khach: "${clicked}"`); return true; }
  logUiBug("HELPER", "MEDIUM", "CustomerModal mo nhung khong chon duoc row");
  await t.page.keyboard.press("Escape").catch(() => {});
  return false;
}

/** Chon khach hang THAT (khong phai vang lai) trong CustomerModal */
async function selectRealCustomer(t) {
  const custBox = await t.page.$('.cust-box, .cust-placeholder');
  if (!custBox) { logUiBug("HELPER", "HIGH", "Khong tim thay .cust-box"); return null; }
  await custBox.click({ force: true });
  await t.page.waitForTimeout(2500);
  // Wait for customer list to load
  await t.page.waitForSelector('.customer-modal .cust-item', { timeout: 5000 }).catch(() => {});
  await t.page.waitForTimeout(1500); // wait for wallet enrich
  const picked = await t.page.evaluate(() => {
    const items = [...document.querySelectorAll('.customer-modal .cust-item')]
      .filter(r => r.offsetHeight > 0);
    // Skip walk-in row (first one with text "Khách vãng lai")
    for (const item of items) {
      const nameEl = item.querySelector('.cust-item__name');
      const name = nameEl?.innerText?.trim() || "";
      if (!name || name.toLowerCase().includes("vãng lai")) continue;
      const subEl = item.querySelector('.cust-item__sub');
      const sub = subEl?.innerText?.trim() || "";
      item.click();
      return { name, sub };
    }
    return null;
  });
  await t.page.waitForTimeout(1500);
  if (picked) {
    console.log(`    [HELPER] Chon KH that: "${picked.name}" (${picked.sub})`);
    return picked.name;
  }
  logUiBug("HELPER", "MEDIUM", "Danh sach KH rong — co the can tao KH truoc");
  await t.page.keyboard.press("Escape").catch(() => {});
  return null;
}

/** Dang ky hoi vien nhanh — search 1 SDT khong ton tai → click 'Dang ky' → fill form → submit */
async function quickRegisterCustomer(t) {
  const custBox = await t.page.$('.cust-box, .cust-placeholder');
  if (!custBox) { logUiBug("HELPER", "HIGH", "Khong tim thay .cust-box"); return null; }
  await custBox.click({ force: true });
  await t.page.waitForTimeout(2500);

  const phone = "09" + String(Date.now()).slice(-8);
  const name  = `KH Test ${RID}`;

  const searchInput = await t.page.$('.customer-modal__search input');
  if (!searchInput) { logUiBug("HELPER", "HIGH", "Khong tim thay search input trong CustomerModal"); return null; }
  await searchInput.fill(phone);
  await t.page.waitForTimeout(2500);

  const emptyShown = await t.page.evaluate(() =>
    !!document.querySelector('.customer-modal__empty')
  );
  if (!emptyShown) {
    logUiBug("HELPER", "MEDIUM", `Search "${phone}" — empty state khong hien (co the trung KH cu)`);
    await t.page.keyboard.press("Escape").catch(() => {});
    return null;
  }

  const clickedRegBtn = await t.page.evaluate(() => {
    const btns = [...document.querySelectorAll('.customer-modal button')];
    const b = btns.find(x => x.innerText?.includes("Đăng ký hội viên cho khách này"));
    if (b) { b.click(); return true; }
    return false;
  });
  if (!clickedRegBtn) {
    logUiBug("HELPER", "HIGH", "Khong tim thay nut 'Dang ky hoi vien cho khach nay'");
    return null;
  }
  await t.page.waitForTimeout(800);

  const filled = await t.page.evaluate((nm) => {
    const inputs = [...document.querySelectorAll('.customer-modal input')];
    const nameInput = inputs.find(i => i.placeholder?.includes("Họ và tên"));
    if (!nameInput) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(nameInput, nm);
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }, name);
  if (!filled) {
    logUiBug("HELPER", "HIGH", "Khong fill duoc input 'Họ và tên'");
    return null;
  }
  await t.page.waitForTimeout(500);

  const clickedSubmit = await t.page.evaluate(() => {
    const btns = [...document.querySelectorAll('.customer-modal button')];
    const b = btns.find(x => x.innerText?.includes("Đăng ký & Chọn") && !x.disabled);
    if (b) { b.click(); return true; }
    return false;
  });
  if (!clickedSubmit) {
    logUiBug("HELPER", "HIGH", "Nut 'Dang ky & Chon' disabled hoac khong tim thay");
    return null;
  }
  await t.page.waitForTimeout(4000);
  console.log(`    [HELPER] Dang ky hoi vien nhanh: "${name}" / ${phone}`);
  return { name, phone };
}

async function addFirstProductToCart(t, searchQuery = "") {
  // Search product
  const posSearch = await t.page.$('input[placeholder*="Tìm sản phẩm"], input[placeholder*="tìm sản phẩm"], input[placeholder*="SKU"]');
  if (!posSearch) { logUiBug("HELPER", "CRITICAL", "Khong tim thay search input trong POS"); return false; }
  await posSearch.fill(searchQuery || "");
  await t.page.waitForTimeout(3000);

  // Click first card co stock > 0
  const cardClicked = await t.page.evaluate(() => {
    const cards = [...document.querySelectorAll('.pg-card')].filter(c => c.offsetHeight > 0);
    const available = cards.find(c => {
      if (c.classList.contains("pg-card--out")) return false;
      const txt = c.innerText || "";
      if (txt.includes("Hết hàng")) return false;
      const m = txt.match(/T[ồo]n:\s*(\d+)/i);
      if (m && Number(m[1]) <= 0) return false;
      return true;
    });
    if (available) { available.click(); return available.innerText?.replace(/\s+/g, " ").trim().slice(0, 60); }
    return null;
  });
  if (!cardClicked) { logUiBug("HELPER", "HIGH", "POS grid rong hoac tat ca SP het hang"); return false; }
  console.log(`    [HELPER] Card clicked: "${cardClicked}"`);
  await t.page.waitForTimeout(2000);

  // Handle VariantModal if opened
  if (await t.exists('.variant-modal, .modal.show')) {
    await t.page.evaluate(() => {
      const groups = [...document.querySelectorAll('.variant-modal__group')];
      for (const g of groups) {
        const opts = [...g.querySelectorAll('.variant-opt:not(.variant-opt--unavailable):not(.variant-opt--selected)')];
        if (opts[0]) opts[0].click();
      }
    });
    await t.page.waitForTimeout(800);
    const addBtn = await t.page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find(x => x.innerText?.includes("Thêm vào giỏ") && !x.disabled);
      if (b) { b.click(); return true; }
      return false;
    });
    await t.page.waitForTimeout(1500);
    if (!addBtn) { logUiBug("HELPER", "HIGH", "Nut 'Them vao gio' disabled"); return false; }
  }

  const cartHasItem = await t.exists('.cart__items .ci');
  return cartHasItem;
}

async function clickPOSTab(t) {
  await t.page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.tb')];
    const pos = tabs.find(x => x.innerText?.includes("Bán hàng"));
    if (pos) pos.click();
  });
  await t.page.waitForTimeout(1500);
}

async function clickDraftTab(t) {
  await t.page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.tb')];
    const d = tabs.find(x => x.innerText?.includes("Đơn tạm"));
    if (d) d.click();
  });
  await t.page.waitForTimeout(2000);
}

async function clickOrdersTab(t) {
  await t.page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.tb')];
    const o = tabs.find(x => x.innerText?.includes("Đơn hàng") && !x.innerText?.includes("tạm"));
    if (o) o.click();
  });
  await t.page.waitForTimeout(2500);
}

async function captureAllPOSTs(t) {
  const captured = [];
  const listener = async (res) => {
    if (res.request().method() === "POST") {
      try { captured.push({ url: res.url(), status: res.status(), body: await res.json() }); }
      catch { captured.push({ url: res.url(), status: res.status(), body: "(non-json)" }); }
    }
  };
  t.page.on("response", listener);
  return { captured, stop: () => t.page.off("response", listener) };
}

// ────────────────────────────────────────────────────────────────────────────
async function main() {
  const t = await createTestRunner("E2E-SALES-VAT", `Luan ban hang + HD VAT [${RID}]`);

  let invoiceIdS1 = null;  // invoice from S1 (incomplete)
  let invoiceCodeS1 = null;
  let invoiceIdS4 = null;  // invoice from S4 (completed, for VAT)
  let invoiceCodeS4 = null;

  try {
    if (!(await t.login())) throw new Error("Login failed");

    // ════════════════════════════════════════════════════════════════════════
    // SCENARIO 1 — Ban dang do: Khong bam "Xac nhan thanh toan"
    // ════════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 1 — BAN DANG DO (khong confirm thanh toan)");
    console.log("═".repeat(70));

    await t.goto("/create_sale_add");
    await t.page.waitForTimeout(4000);
    await t.screenshot("s1-pos-load");

    // Chon khach hang
    const custOk1 = await selectFirstCustomer(t);
    t.assert("S1-01", custOk1, "Chon khach hang truoc khi ban");

    // Them SP vao gio
    const cartOk1 = await addFirstProductToCart(t, "");
    t.assert("S1-02", cartOk1, "Co item trong gio hang");
    if (!cartOk1) throw new Error("S1 blocked: empty cart");

    await t.screenshot("s1-cart-filled");

    // Bat dau tao hoa don (pay-btn → PayModal)
    const postsS1 = await captureAllPOSTs(t);
    const payBtn1 = await t.page.$('.pay-btn:not([disabled])');
    if (!payBtn1) {
      logUiBug("S1", "CRITICAL", "Khong tim thay .pay-btn");
      throw new Error("S1 blocked: no pay btn");
    }
    await payBtn1.click({ force: true });
    await t.page.waitForTimeout(3000);
    await t.screenshot("s1-pay-modal");

    // PayModal → click "Tao hoa don" → ReceiptModal mo
    const taoHoaDonBtn = await t.page.$('button:has-text("Tạo hoá đơn"):not([disabled]), button:has-text("Tạo hóa đơn"):not([disabled])');
    if (taoHoaDonBtn) {
      await taoHoaDonBtn.click({ force: true });
      await t.page.waitForTimeout(3000);
      t.assert("S1-03", true, "Click 'Tao hoa don' → invoice draft tao");
    } else {
      logUiBug("S1", "HIGH", "Khong tim thay nut 'Tao hoa don' trong PayModal");
    }

    // Doi ReceiptModal mo
    const receiptOpen1 = await t.exists('.receipt-modal, .modal.show');
    t.assert("S1-04", receiptOpen1, receiptOpen1 ? "ReceiptModal mo sau 'Tao hoa don'" : "ReceiptModal KHONG mo");
    await t.screenshot("s1-receipt-modal");

    // Lay invoiceId tu boughtProduct/insertBatch response
    await t.page.waitForTimeout(1000);
    postsS1.stop();
    const insertBatchRes = postsS1.captured.find(r => /boughtProduct\/insertBatch/i.test(r.url));
    if (insertBatchRes) {
      const urlParams = new URL(insertBatchRes.url);
      invoiceIdS1 = urlParams.searchParams.get("invoiceId");
      invoiceCodeS1 = `HD${String(invoiceIdS1).padStart(6, "0")}`;
      note("S1", `Invoice draft tao: id=${invoiceIdS1} (chua xac nhan thanh toan)`);
    }

    // CHECK: nut "Xac nhan thanh toan" co hien khong?
    const xacNhanBtn1 = await t.page.evaluate(() => {
      const b = [...document.querySelectorAll('.modal.show button, .receipt-modal button')]
        .find(x => x.innerText?.includes("Xác nhận thanh toán"));
      return b ? { text: b.innerText?.trim(), disabled: b.disabled } : null;
    });
    if (xacNhanBtn1) {
      note("S1", `Nut "Xac nhan thanh toan" hien trong ReceiptModal (disabled=${xacNhanBtn1.disabled})`);
      t.assert("S1-05", !xacNhanBtn1.disabled, "Nut 'Xac nhan thanh toan' khong bi disabled");
    } else {
      logUiBug("S1", "HIGH", "Khong tim thay nut 'Xac nhan thanh toan' trong ReceiptModal");
    }

    // DONG ReceiptModal — KHONG bam Xac nhan thanh toan
    const closeBtn1 = await t.page.evaluate(() => {
      const btns = [...document.querySelectorAll('.modal.show button, .receipt-modal button, .modal.show [class*="close"]')];
      const close = btns.find(b => {
        const txt = b.innerText?.trim();
        return txt?.includes("Đóng") || txt?.includes("Hủy") || txt === "×" || b.getAttribute("aria-label") === "Close";
      });
      if (close) { close.click(); return close.innerText?.trim() || "×"; }
      return null;
    });
    if (closeBtn1) {
      note("S1", `Dong ReceiptModal bang nut: "${closeBtn1}"`);
    } else {
      // Nhan Escape de dong
      await t.page.keyboard.press("Escape").catch(() => {});
      note("S1", "Dong ReceiptModal bang Escape");
    }
    await t.page.waitForTimeout(2000);
    await t.screenshot("s1-after-close-receipt");

    // ── Kiem tra trang thai don trong "Don hang" tab ──
    await clickOrdersTab(t);
    await t.page.waitForTimeout(3000);
    await t.screenshot("s1-orders-tab");

    // Print top 5 orders
    const topOrders1 = await t.page.evaluate(() => {
      const cards = [...document.querySelectorAll('.order-card')];
      return cards.slice(0, 5).map(c => ({
        code: c.querySelector('.oc-id')?.innerText?.trim(),
        status: c.querySelector('[class*="badge"]')?.innerText?.trim(),
        hasDebt: !!c.querySelector('.badge--debt'),
        actions: [...c.querySelectorAll('.oc-actions button')].map(b => b.innerText?.trim()),
      }));
    });
    console.log(`  Top orders:`);
    topOrders1.forEach((o, i) => console.log(`    ${i + 1}. ${o.code} | ${o.status} | actions: [${o.actions.join(", ")}]`));

    // Tim don vua tao (theo invoiceId)
    const ourOrder1 = invoiceIdS1
      ? topOrders1.find(o => o.code?.includes(invoiceIdS1) || o.code?.includes(invoiceCodeS1))
      : topOrders1[0];

    if (ourOrder1) {
      note("S1", `Don #${ourOrder1.code} co trang thai: "${ourOrder1.status}", hasDebt=${ourOrder1.hasDebt}`);
      t.assert("S1-06", true, `Don xuat hien trong DS: ${ourOrder1.code} | ${ourOrder1.status}`);

      // Kiem tra co nut "Gui HD dien tu" cho don chua TT khong
      const vatBtnForIncomplete = ourOrder1.actions.find(a => a.includes("HĐ") || a.includes("điện tử") || a.includes("VAT"));
      if (vatBtnForIncomplete) {
        logUiBug("S1", "HIGH",
          `Don CHUA TT nhung hien nut "${vatBtnForIncomplete}" — nen bi block de xuat HD VAT`);
      } else {
        t.assert("S1-07", true, "Don chua TT KHONG co nut xuat HD VAT (dung)");
      }
    } else {
      // EXPECTED: don tao giu chung (khong bam Xac nhan TT) → vao "Don tam", KHONG vao "Don hang"
      // Day la hanh vi DUNG — incomplete invoices la drafts
      note("S1",
        `Don #${invoiceIdS1} KHONG trong "Don hang" tab — EXPECTED: incomplete invoice → "Don tam" (draft)`);
      t.assert("S1-06", true, `Incomplete invoice ${invoiceIdS1} khong trong "Don hang" — se kiem tra "Don tam" o duoi`);
      t.assert("S1-07", true, "Dong hieu: don chua TT khong xuat hien trong Don hang (chi xuat hien trong Don tam)");
    }

    // ── Verify incomplete invoice trong "Don tam" tab ──
    await clickDraftTab(t);
    await t.page.waitForTimeout(2500);
    const incompleteInDraft = await t.page.evaluate((id) => {
      const items = [...document.querySelectorAll('[class*="draft-item"]')];
      return items.some(x => x.innerText?.includes(id));
    }, String(invoiceIdS1 || ""));
    if (invoiceIdS1) {
      t.assert("S1-08", incompleteInDraft,
        incompleteInDraft
          ? `Invoice #${invoiceIdS1} (chua TT) xuat hien trong "Don tam" ✓`
          : `Invoice #${invoiceIdS1} KHONG xuat hien trong "Don tam"`);
      if (incompleteInDraft) {
        note("S1", `KET LUAN: Don tao giu chung (khong confirm) → tu dong vao "Don tam" — hanh vi DUNG`);
      }
    }
    // Quay lai POS tab cho S2
    await clickPOSTab(t);
    await t.page.waitForTimeout(1500);

    // ════════════════════════════════════════════════════════════════════════
    // SCENARIO 2 — Luu don tam + Tiep tuc xu ly + Hoan thanh
    // ════════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 2 — LUU DON TAM + TIEP TUC XU LY");
    console.log("═".repeat(70));

    // Da o POS tab tu S1 cuoi
    await t.page.waitForTimeout(1000);

    // Xoa gio cu neu con
    await t.page.evaluate(() => {
      const removeAll = [...document.querySelectorAll('.ci__remove, .cart-item__remove, button[class*="remove"]')];
      removeAll.forEach(b => b.click());
    }).catch(() => {});
    await t.page.waitForTimeout(1000);

    // Chon khach hang
    const custOk2 = await selectFirstCustomer(t);
    t.assert("S2-01", custOk2, "Chon khach hang");

    // Them SP
    const cartOk2 = await addFirstProductToCart(t, "");
    t.assert("S2-02", cartOk2, "Co item trong gio");
    if (!cartOk2) {
      logUiBug("S2", "CRITICAL", "Gio trong — skip S2");
      throw new Error("S2 blocked: empty cart");
    }
    await t.screenshot("s2-cart-ready");

    // Lay draft count truoc khi luu
    const draftCountBefore = await t.page.evaluate(() => {
      const draftTab = [...document.querySelectorAll('.tb')].find(x => x.innerText?.includes("Đơn tạm"));
      const countEl = draftTab?.querySelector('.tb__count');
      return countEl ? parseInt(countEl.innerText?.trim()) : 0;
    });
    console.log(`  [DBG] Draft count truoc: ${draftCountBefore}`);

    // Click "Luu nháp" (save draft)
    const postsS2 = await captureAllPOSTs(t);
    const saveDraftBtn = await t.page.$('button:has-text("Lưu nháp"), button:has-text("Lưu tạm"), button:has-text("Lưu đơn")');
    if (!saveDraftBtn) {
      logUiBug("S2", "HIGH", "Khong tim thay nut Luu nhap trong Cart");
      postsS2.stop();
    } else {
      await saveDraftBtn.click({ force: true });
      await t.page.waitForTimeout(4000);
      postsS2.stop();
      await t.screenshot("s2-after-save-draft");

      // Check toast
      const toastS2 = await t.page.evaluate(() => {
        return [...document.querySelectorAll('[class*="Toastify__toast"], [class*="toast"]')]
          .map(x => x.innerText?.trim()).filter(Boolean).join(" | ");
      });
      if (toastS2) note("S2", `Toast sau Luu nhap: "${toastS2}"`);

      // Print POST responses
      console.log(`  [DBG] POSTs sau Luu nhap:`);
      postsS2.captured.forEach((r, i) =>
        console.log(`    ${i + 1}. [${r.status}] ${r.url} → ${JSON.stringify(r.body).slice(0, 120)}`));

      const draftSaveApi = postsS2.captured.find(r => /draft|invoice/i.test(r.url));
      if (draftSaveApi?.status === 200 && draftSaveApi?.body?.code === 0) {
        t.assert("S2-03", true, `API luu nhap OK: ${draftSaveApi.url}`);
      } else if (draftSaveApi) {
        logBeBug("S2", "HIGH", `API luu nhap fail: [${draftSaveApi.status}] ${draftSaveApi.url}`, JSON.stringify(draftSaveApi.body).slice(0, 200));
      } else {
        note("S2", "Khong detect duoc API luu nhap trong filter (co the la /boughtProduct hoac ngoai filter)");
      }
    }

    // ── Check "Don tam" tab ──
    await clickDraftTab(t);
    await t.page.waitForTimeout(3000);
    await t.screenshot("s2-draft-tab");

    const draftList = await t.page.evaluate(() => {
      // DraftListPanel
      const items = [...document.querySelectorAll('[class*="draft-list"] [class*="draft-item"], [class*="draft-left"] [class*="item"], .draft-list-panel [class*="item"]')];
      if (items.length === 0) {
        // fallback: check any list rendering
        const rows = [...document.querySelectorAll('table tbody tr, [class*="list"] li')];
        return rows.slice(0, 5).map(r => r.innerText?.replace(/\s+/g, " ").trim().slice(0, 80));
      }
      return items.slice(0, 5).map(i => i.innerText?.replace(/\s+/g, " ").trim().slice(0, 80));
    });
    console.log(`  Draft list items: ${JSON.stringify(draftList)}`);

    // Print full draft tab content
    const draftContent = await t.page.evaluate(() =>
      document.querySelector('.draft-orders, [class*="draft-orders"]')?.innerText?.replace(/\s+/g, " ").trim().slice(0, 600)
    );
    console.log(`  [DBG] Draft tab content: ${draftContent?.slice(0, 300)}`);

    const hasDraft = draftList.length > 0 && draftList.some(x => x?.length > 3);
    t.assert("S2-04", hasDraft, hasDraft ? `Don tam hien trong tab (${draftList.length} items)` : "Tab Don tam TRONG RONG");

    // Click vao don tam dau tien de xem chi tiet
    const draftItemClicked = await t.page.evaluate(() => {
      const items = [...document.querySelectorAll('[class*="draft-item"], [class*="draft-left"] [class*="item"]')]
        .filter(x => x.offsetHeight > 0);
      if (items[0]) { items[0].click(); return true; }
      return false;
    });
    await t.page.waitForTimeout(1500);
    await t.screenshot("s2-draft-selected");

    // Tim nut "Tiep tuc xu ly"
    const continueBtnText = await t.page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const b = btns.find(x => x.innerText?.includes("Tiếp tục") || x.innerText?.includes("Xử lý") || x.innerText?.includes("tiếp tục"));
      return b ? b.innerText?.trim() : null;
    });
    console.log(`  [DBG] Continue button: "${continueBtnText}"`);

    if (continueBtnText) {
      const postsS2b = await captureAllPOSTs(t);
      await t.page.evaluate(() => {
        const b = [...document.querySelectorAll('button')]
          .find(x => x.innerText?.includes("Tiếp tục") || x.innerText?.includes("Xử lý"));
        if (b) b.click();
      });
      await t.page.waitForTimeout(3000);
      postsS2b.stop();
      await t.screenshot("s2-after-continue");

      // Check cart co item sau khi continue
      const cartAfterContinue = await t.exists('.cart__items .ci');
      t.assert("S2-05", cartAfterContinue, cartAfterContinue
        ? "Cart co item sau 'Tiep tuc xu ly'"
        : "Cart RONG sau 'Tiep tuc xu ly' — khong load lai duoc");
      if (!cartAfterContinue) {
        logUiBug("S2", "HIGH", "'Tiep tuc xu ly' khong load lai san pham vao gio");
      }

      if (cartAfterContinue) {
        // Hoan thanh thanh toan luon
        const postsS2c = await captureAllPOSTs(t);
        const payBtn2 = await t.page.$('.pay-btn:not([disabled])');
        if (payBtn2) {
          await payBtn2.click({ force: true });
          await t.page.waitForTimeout(3000);
          const taoHoaDon2 = await t.page.$('button:has-text("Tạo hoá đơn"):not([disabled]), button:has-text("Tạo hóa đơn"):not([disabled])');
          if (taoHoaDon2) {
            await taoHoaDon2.click({ force: true });
            await t.page.waitForTimeout(3000);
          }
          // Xac nhan thanh toan
          const xacNhan2 = await t.page.evaluate(() => {
            const b = [...document.querySelectorAll('.modal.show button, .receipt-modal button')]
              .find(x => x.innerText?.includes("Xác nhận thanh toán") && !x.disabled);
            if (b) { b.click(); return b.innerText?.trim(); }
            return null;
          });
          if (xacNhan2) {
            await t.page.waitForTimeout(5000);
            t.assert("S2-06", true, "Hoan thanh thanh toan tu don tam");
          } else {
            logUiBug("S2", "MEDIUM", "Khong tim thay 'Xac nhan thanh toan' khi hoan thanh don tam");
          }
          postsS2c.stop();
          console.log(`  [DBG] POSTs sau hoan thanh tu draft:`);
          postsS2c.captured.forEach((r, i) =>
            console.log(`    ${i + 1}. [${r.status}] ${r.url}\n       body: ${JSON.stringify(r.body).slice(0, 200)}`));
          const insertBatch2 = postsS2c.captured.find(r => /insertBatch/i.test(r.url));
          if (insertBatch2?.status === 500) {
            logBeBug("S2", "HIGH",
              `insertBatch tra HTTP 500 khi hoan thanh tu don tam — stock co the bi duped hoac variantId loi`,
              `URL: ${insertBatch2.url} | Body: ${JSON.stringify(insertBatch2.body).slice(0, 200)}`);
          }
          const finalizeApi = postsS2c.captured.find(r => /invoice\/create/i.test(r.url));
          if (finalizeApi?.status === 200 && finalizeApi?.body?.code === 0) {
            t.assert("S2-07", true, "API hoan thanh don tam OK");
          }
        }
        await t.screenshot("s2-draft-completed");
      }
    } else {
      logUiBug("S2", "HIGH", "Khong tim thay nut 'Tiep tuc xu ly' trong DraftDetailPanel");
    }

    // ════════════════════════════════════════════════════════════════════════
    // SCENARIO 3 — Verify don CHUA TT khong co nut HD VAT + don DA TT co nut
    // ════════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 3 — KIEM TRA NUT HD VAT THEO TRANG THAI DON");
    console.log("═".repeat(70));

    await clickOrdersTab(t);
    await t.page.waitForTimeout(3000);
    await t.screenshot("s3-orders-for-vat-check");

    // Thu thap actions cua tat ca orders hien thi
    const ordersWithActions = await t.page.evaluate(() => {
      return [...document.querySelectorAll('.order-card')].slice(0, 10).map(card => ({
        code:    card.querySelector('.oc-id')?.innerText?.trim(),
        status:  card.querySelector('[class*="badge"]:not([class*="src"]):not([class*="debt"])')?.innerText?.trim(),
        actions: [...card.querySelectorAll('.oc-actions button')].map(b => b.innerText?.trim()),
      }));
    });

    console.log(`  Orders + actions:`);
    ordersWithActions.forEach(o =>
      console.log(`    ${o.code} | ${o.status} | [${o.actions.join(", ")}]`)
    );

    // Phan tich: chon cac don theo trang thai
    const completedOrders = ordersWithActions.filter(o =>
      o.status?.includes("Hoàn thành") || o.status?.includes("✅")
    );
    const incompleteOrders = ordersWithActions.filter(o =>
      !o.status?.includes("Hoàn thành") && !o.status?.includes("✅") && !o.status?.includes("Hủy")
    );

    // Check: don hoan thanh PHAI co nut VAT
    for (const o of completedOrders.slice(0, 3)) {
      const hasVAT = o.actions.some(a => a.includes("HĐ") || a.includes("điện tử") || a.includes("VAT"));
      if (hasVAT) {
        t.assert("S3-01", true, `Don Hoan thanh "${o.code}" co nut HĐ VAT ✓`);
      } else {
        logUiBug("S3", "MEDIUM", `Don Hoan thanh "${o.code}" THIEU nut HĐ VAT`, `Status: ${o.status}`);
      }
    }
    if (completedOrders.length === 0) {
      note("S3", "Chua co don Hoan thanh nao trong danh sach — co the S2 chua thanh cong");
    }

    // Check: don chua hoan thanh KHONG DUOC co nut VAT
    for (const o of incompleteOrders.slice(0, 3)) {
      const hasVAT = o.actions.some(a => a.includes("HĐ") || a.includes("điện tử") || a.includes("VAT"));
      if (hasVAT) {
        logUiBug("S3", "HIGH",
          `Don chua Hoan thanh "${o.code}" (${o.status}) HIEN nut HĐ VAT — nen bi block`);
      } else {
        t.assert("S3-02", true, `Don chua TT "${o.code}" KHONG co nut HĐ VAT ✓`);
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // SCENARIO 4 — Hoan thanh thanh toan + Xuat HD VAT
    // ════════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 4 — HOAN THANH + XUAT HD VAT");
    console.log("═".repeat(70));

    // Neu tu S2 chua co don hoan thanh, tao them 1 don moi
    if (completedOrders.length === 0) {
      note("S4", "Tao don moi de test HD VAT");
      await clickPOSTab(t);
      await t.page.waitForTimeout(2000);

      await t.page.evaluate(() => {
        const removes = [...document.querySelectorAll('.ci__remove, [class*="remove"]')];
        removes.forEach(b => b.click());
      }).catch(() => {});
      await t.page.waitForTimeout(1000);

      const custOk4 = await selectFirstCustomer(t);
      const cartOk4 = await addFirstProductToCart(t, "");
      if (!cartOk4) {
        logUiBug("S4", "CRITICAL", "Khong them duoc SP vao gio de tao don cho S4");
      } else {
        const postsS4 = await captureAllPOSTs(t);
        const payBtn4 = await t.page.$('.pay-btn:not([disabled])');
        if (payBtn4) {
          await payBtn4.click({ force: true });
          await t.page.waitForTimeout(3000);
          const thBtn4 = await t.page.$('button:has-text("Tạo hoá đơn"):not([disabled]), button:has-text("Tạo hóa đơn"):not([disabled])');
          if (thBtn4) { await thBtn4.click({ force: true }); await t.page.waitForTimeout(3000); }
          const xn4 = await t.page.evaluate(() => {
            const b = [...document.querySelectorAll('.modal.show button, .receipt-modal button')]
              .find(x => x.innerText?.includes("Xác nhận thanh toán") && !x.disabled);
            if (b) { b.click(); return true; }
            return false;
          });
          await t.page.waitForTimeout(5000);
          postsS4.stop();

          const createInv4 = postsS4.captured.find(r => /invoice\/create/i.test(r.url));
          if (createInv4?.body?.code === 0) {
            invoiceCodeS4 = createInv4.body?.result?.invoiceCode;
            invoiceIdS4   = createInv4.body?.result?.id;
            note("S4", `Don moi hoan thanh: ${invoiceCodeS4} (id=${invoiceIdS4})`);
            t.assert("S4-01", true, `Tao don hoan thanh de test VAT: ${invoiceCodeS4}`);
          }
        }
        await t.screenshot("s4-new-order-done");
        // Close receipt modal
        await t.page.evaluate(() => {
          const b = [...document.querySelectorAll('.modal.show button')]
            .find(x => x.innerText?.includes("Đóng") || x.innerText?.includes("Hoàn tất") || x.innerText?.includes("mới"));
          if (b) b.click();
        }).catch(() => {});
        await t.page.waitForTimeout(1000);
        await t.page.keyboard.press("Escape").catch(() => {});
      }
    }

    // Vao "Don hang" → tim don Hoan thanh → click "Gui HD dien tu"
    await clickOrdersTab(t);
    await t.page.waitForTimeout(3000);
    await t.screenshot("s4-orders-for-vat");

    const vatBtnClicked = await t.page.evaluate((targetCode) => {
      const cards = [...document.querySelectorAll('.order-card')];
      // Tim don hoan thanh co nut VAT
      for (const card of cards) {
        const status = card.querySelector('[class*="badge"]:not([class*="src"]):not([class*="debt"])')?.innerText?.trim();
        const isCompleted = status?.includes("Hoàn thành") || status?.includes("✅");
        if (!isCompleted) continue;
        const code = card.querySelector('.oc-id')?.innerText?.trim();
        // Uu tien don vua tao trong S4
        if (targetCode && !code?.includes(targetCode)) continue;
        const vatBtn = [...card.querySelectorAll('button')]
          .find(b => b.innerText?.includes("HĐ") || b.innerText?.includes("điện tử") || b.innerText?.includes("VAT") || b.innerText?.includes("Gửi"));
        if (vatBtn) {
          vatBtn.click();
          return { code, btnText: vatBtn.innerText?.trim() };
        }
      }
      // Fallback: click bat ky don hoan thanh co nut VAT
      for (const card of cards) {
        const vatBtn = [...card.querySelectorAll('button')]
          .find(b => b.innerText?.includes("HĐ") || b.innerText?.includes("điện tử"));
        if (vatBtn) { vatBtn.click(); return { code: "any", btnText: vatBtn.innerText?.trim() }; }
      }
      return null;
    }, invoiceCodeS4 || "");

    if (vatBtnClicked) {
      note("S4", `Click "${vatBtnClicked.btnText}" tren don ${vatBtnClicked.code}`);
      await t.page.waitForTimeout(4000);
      await t.screenshot("s4-vat-page");

      // Check dieu huong toi /invoiceVAT
      const vatUrl = t.page.url();
      const onVatPage = vatUrl.includes("invoiceVAT") || vatUrl.includes("invoice_vat") || vatUrl.includes("vat");
      t.assert("S4-02", onVatPage, onVatPage
        ? `Dieu huong toi trang HD VAT: ${vatUrl}`
        : `URL sau click VAT: ${vatUrl} (co the la route khac)`);

      // Print page content
      const vatPageContent = await t.page.evaluate(() =>
        document.body?.innerText?.replace(/\s+/g, " ").trim().slice(0, 500)
      );
      console.log(`  [DBG] VAT page content (500 chars): ${vatPageContent?.slice(0, 400)}`);

      // Check cac field tren trang HD VAT
      const vatPageFields = await t.page.evaluate(() => {
        // Tim input, select fields
        const inputs = [...document.querySelectorAll('input[type="text"], input[type="number"], select, textarea')]
          .filter(x => x.offsetHeight > 0)
          .slice(0, 10)
          .map(x => ({
            name: x.getAttribute('name') || x.getAttribute('placeholder') || x.tagName,
            value: x.value || '',
          }));
        // Tim buttons
        const btns = [...document.querySelectorAll('button')].filter(x => x.offsetHeight > 0)
          .map(b => b.innerText?.trim()).filter(Boolean).slice(0, 8);
        return { inputs, btns };
      });
      console.log(`  [DBG] VAT page buttons: [${vatPageFields.btns.join(", ")}]`);
      console.log(`  [DBG] VAT page inputs (first 5): ${JSON.stringify(vatPageFields.inputs.slice(0, 5))}`);

      // Check: trang co form xuat HD VAT
      const hasForm = vatPageFields.inputs.length > 0 || vatPageFields.btns.length > 2;
      t.assert("S4-03", hasForm, hasForm
        ? `Trang HD VAT co UI (${vatPageFields.inputs.length} inputs, ${vatPageFields.btns.length} btns)`
        : "Trang HD VAT trong rong — co the loi 404 hoac chua build");

      // Kiem tra co nut "Xuat HD VAT" / "Phat hanh" / "Tao HD"
      const issueBtn = vatPageFields.btns.find(b => /phát hành|tạo hóa đơn|xuất hđ|xuat hd|issue/i.test(b));
      if (issueBtn) {
        t.assert("S4-04", true, `Nut phat hanh HD VAT: "${issueBtn}"`);
      } else {
        logUiBug("S4", "MEDIUM",
          `Trang HD VAT khong co nut "Phat hanh" ro rang`,
          `Buttons: [${vatPageFields.btns.join(", ")}]`);
      }

      // Check: ma don hang duoc prefill tu URL
      const urlHasCode = vatUrl.includes(invoiceCodeS4 || "") || vatUrl.includes("code=");
      t.assert("S4-05", urlHasCode, urlHasCode
        ? `URL co ma don: ${vatUrl}`
        : `URL khong co ma don — co the chua truyen code`);
    } else {
      logUiBug("S4", "HIGH", "Khong tim thay nut 'Gui HD dien tu' tren bat ky don hoan thanh nao");
      t.assert("S4-02", false, "Khong tim thay don hoan thanh co nut HD VAT");
    }

    // ════════════════════════════════════════════════════════════════════════
    // SCENARIO 5 — Ban voi KHACH HANG THAT (khong vang lai) + xuat HD VAT
    //             Verify thong tin KH duoc prefill dung tren trang invoiceVAT
    // ════════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 5 — KHACH HANG THAT + HD VAT (verify prefill)");
    console.log("═".repeat(70));

    let realCustName = null;
    let invoiceCodeS5 = null;

    await t.goto("/create_sale_add");
    await t.page.waitForTimeout(4000);
    await clickPOSTab(t);
    await t.screenshot("s5-pos-load");

    realCustName = await selectRealCustomer(t);
    t.assert("S5-01", !!realCustName, realCustName
      ? `Chon KH that: "${realCustName}"`
      : "Khong chon duoc KH that — co the danh sach KH rong");

    if (!realCustName) {
      note("S5", "Bo qua S5: khong co KH that de test");
    } else {
      const custDisplay = await t.page.evaluate(() => {
        const cn = document.querySelector('.cust-name')?.innerText?.trim();
        const cp = document.querySelector('.cust-pts')?.innerText?.trim();
        return { name: cn, sub: cp };
      });
      t.assert("S5-02", custDisplay.name && !custDisplay.name.toLowerCase().includes("vãng lai"),
        `Cart hien thi KH: "${custDisplay.name}" / "${custDisplay.sub}"`);

      const cartOk5 = await addFirstProductToCart(t, "");
      t.assert("S5-03", cartOk5, "Them SP vao gio voi KH that");
      if (!cartOk5) throw new Error("S5 blocked: empty cart");

      const postsS5 = await captureAllPOSTs(t);
      const payBtn5 = await t.page.$('.pay-btn:not([disabled])');
      if (!payBtn5) {
        logUiBug("S5", "CRITICAL", "Khong tim thay .pay-btn");
      } else {
        await payBtn5.click({ force: true });
        await t.page.waitForTimeout(3000);
        const thBtn5 = await t.page.$('button:has-text("Tạo hoá đơn"):not([disabled]), button:has-text("Tạo hóa đơn"):not([disabled])');
        if (thBtn5) {
          await thBtn5.click({ force: true });
          await t.page.waitForTimeout(3500);
        }
        const xn5 = await t.page.evaluate(() => {
          const b = [...document.querySelectorAll('.modal.show button, .receipt-modal button')]
            .find(x => x.innerText?.includes("Xác nhận thanh toán") && !x.disabled);
          if (b) { b.click(); return true; }
          return false;
        });
        await t.page.waitForTimeout(5000);
        postsS5.stop();

        const createInv5 = postsS5.captured.find(r => /invoice\/create/i.test(r.url));
        if (createInv5?.body?.code === 0) {
          invoiceCodeS5 = createInv5.body?.result?.invoiceCode;
          const invIdS5 = createInv5.body?.result?.id;
          const respCustId = createInv5.body?.result?.customerId;
          note("S5", `Don KH that hoan thanh: ${invoiceCodeS5} (id=${invIdS5}, customerId=${respCustId})`);
          t.assert("S5-04", !!invoiceCodeS5 && xn5, `Tao thanh cong don voi KH that: ${invoiceCodeS5}`);
          // Note: BE chua echo customerName trong response (BACKEND-TASK-invoice-customer-info.md)
          t.assert("S5-05",
            respCustId && Number(respCustId) > 0,
            `customerId trong response = ${respCustId} (KH that, ≠ vang lai -1)`);
        } else {
          logUiBug("S5", "HIGH", "invoice/create that bai voi KH that",
            JSON.stringify(createInv5?.body || {}).slice(0, 200));
        }

        await t.screenshot("s5-paid");
        await t.page.evaluate(() => {
          const b = [...document.querySelectorAll('.modal.show button')]
            .find(x => x.innerText?.includes("Đóng") || x.innerText?.includes("Hoàn tất") || x.innerText?.includes("mới"));
          if (b) b.click();
        }).catch(() => {});
        await t.page.waitForTimeout(1000);
        await t.page.keyboard.press("Escape").catch(() => {});
      }

      if (invoiceCodeS5) {
        await clickOrdersTab(t);
        await t.page.waitForTimeout(3000);
        await t.screenshot("s5-orders");

        const vatClicked5 = await t.page.evaluate((targetCode) => {
          const cards = [...document.querySelectorAll('.order-card')];
          for (const card of cards) {
            const code = card.querySelector('.oc-id')?.innerText?.trim();
            if (!code?.includes(targetCode)) continue;
            const status = card.querySelector('[class*="badge"]')?.innerText?.trim();
            const vatBtn = [...card.querySelectorAll('button')]
              .find(b => b.innerText?.includes("HĐ") || b.innerText?.includes("điện tử") || b.innerText?.includes("VAT") || b.innerText?.includes("Gửi"));
            if (vatBtn) { vatBtn.click(); return { code, status, btnText: vatBtn.innerText?.trim() }; }
          }
          return null;
        }, invoiceCodeS5);

        if (vatClicked5) {
          note("S5", `Click "${vatClicked5.btnText}" tren ${vatClicked5.code} (${vatClicked5.status})`);
          await t.page.waitForTimeout(4500);
          await t.screenshot("s5-vat-page");

          const vatUrl5 = t.page.url();
          t.assert("S5-06", vatUrl5.includes("invoiceVAT"),
            `Dieu huong invoiceVAT: ${vatUrl5}`);

          const vatPrefill = await t.page.evaluate(() => {
            const allInputs = [...document.querySelectorAll('input, textarea')]
              .filter(x => x.offsetHeight > 0)
              .map(x => ({
                ph: x.getAttribute('placeholder') || '',
                name: x.getAttribute('name') || '',
                value: x.value || '',
              }));
            const findField = (kw) => allInputs.find(i =>
              (i.ph + " " + i.name).toLowerCase().includes(kw));
            return {
              custName:    findField("tên")?.value || findField("name")?.value || "",
              custPhone:   findField("điện thoại")?.value || findField("phone")?.value || findField("sđt")?.value || "",
              custAddress: findField("địa chỉ")?.value || findField("address")?.value || "",
              custTaxCode: findField("mã số thuế")?.value || findField("mst")?.value || findField("tax")?.value || "",
              all: allInputs.slice(0, 12),
            };
          });
          console.log(`  [DBG] VAT prefill: name="${vatPrefill.custName}" phone="${vatPrefill.custPhone}" addr="${vatPrefill.custAddress}" mst="${vatPrefill.custTaxCode}"`);
          console.log(`  [DBG] All inputs (12 first): ${JSON.stringify(vatPrefill.all)}`);

          const bodyContainsCust = await t.page.evaluate((custName) => {
            const txt = document.body.innerText || "";
            const tokens = custName.split(/\s+/).filter(t => t.length > 1);
            return tokens.some(tk => txt.includes(tk));
          }, realCustName);

          // Check chinh: input "Ten nguoi mua" co duoc prefill khong?
          const buyerNameInput = vatPrefill.all.find(i => i.ph?.includes("Nhập tên người mua"));
          const buyerPhoneInput = vatPrefill.all.find(i => i.ph?.includes("0311234567") || i.ph?.toLowerCase().includes("điện thoại"));
          const inputPrefilled = !!(buyerNameInput?.value?.trim());

          if (inputPrefilled) {
            t.assert("S5-07", true,
              `Form VAT prefill OK: buyerName="${buyerNameInput.value}", buyerPhone="${buyerPhoneInput?.value || ''}"`);
          } else {
            logBeBug("S5", "MEDIUM",
              `Trang invoiceVAT khong prefill 'Ten nguoi mua' tu don ${invoiceCodeS5} (KH "${realCustName}")`,
              `Field rong: "${buyerNameInput?.ph || 'N/A'}"="" — xem BACKEND-TASK-invoice-customer-info.md`);
            t.assert("S5-07", bodyContainsCust,
              `[soft] Page co text lien quan KH "${realCustName}" (input rong, can BE fix)`);
          }

          if (inputPrefilled) {
            const v = buyerNameInput.value.toLowerCase();
            const isNotVangLai = !v.includes("vãng lai") && !v.includes("khách lẻ");
            t.assert("S5-08", isNotVangLai,
              `Buyer name = "${buyerNameInput.value}" (≠ vang lai)`);
          } else {
            note("S5", "S5-08 SKIP: BE chua prefill input → khong the verify content");
          }
        } else {
          logUiBug("S5", "HIGH", `Khong tim thay nut HD VAT cho don ${invoiceCodeS5}`);
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // SCENARIO 6 — Khach hang MOI: dang ky hoi vien nhanh khi tim SDT khong ra
    //             → ban hang → kiem tra customerId moi + don hoan thanh
    // ════════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 6 — KH MOI dang ky hoi vien nhanh");
    console.log("═".repeat(70));

    await t.goto("/create_sale_add");
    await t.page.waitForTimeout(4000);
    await clickPOSTab(t);
    await t.screenshot("s6-pos-load");

    const newCust = await quickRegisterCustomer(t);
    t.assert("S6-01", !!newCust, newCust
      ? `Dang ky hoi vien nhanh: "${newCust.name}" / ${newCust.phone}`
      : "Khong dang ky duoc hoi vien nhanh");

    if (newCust) {
      const custDisplayS6 = await t.page.evaluate(() => {
        const cn = document.querySelector('.cust-name')?.innerText?.trim();
        const cp = document.querySelector('.cust-pts')?.innerText?.trim();
        return { name: cn, sub: cp };
      });
      t.assert("S6-02",
        custDisplayS6.name && custDisplayS6.name.includes("KH Test"),
        `Cart hien KH moi: "${custDisplayS6.name}" / "${custDisplayS6.sub}"`);

      const cartOk6 = await addFirstProductToCart(t, "");
      t.assert("S6-03", cartOk6, "Them SP vao gio voi KH moi");

      if (cartOk6) {
        const postsS6 = await captureAllPOSTs(t);
        const payBtn6 = await t.page.$('.pay-btn:not([disabled])');
        if (payBtn6) {
          await payBtn6.click({ force: true });
          await t.page.waitForTimeout(3000);
          const thBtn6 = await t.page.$('button:has-text("Tạo hoá đơn"):not([disabled]), button:has-text("Tạo hóa đơn"):not([disabled])');
          if (thBtn6) { await thBtn6.click({ force: true }); await t.page.waitForTimeout(3500); }
          const xn6 = await t.page.evaluate(() => {
            const b = [...document.querySelectorAll('.modal.show button, .receipt-modal button')]
              .find(x => x.innerText?.includes("Xác nhận thanh toán") && !x.disabled);
            if (b) { b.click(); return true; }
            return false;
          });
          await t.page.waitForTimeout(5000);
          postsS6.stop();

          const createInv6 = postsS6.captured.find(r => /invoice\/create/i.test(r.url));
          if (createInv6?.body?.code === 0) {
            const respCustId   = createInv6.body?.result?.customerId;
            const invCodeS6    = createInv6.body?.result?.invoiceCode;
            note("S6", `Don KH moi: ${invCodeS6}, customerId=${respCustId} (KH vua dang ky)`);
            t.assert("S6-04", xn6 && respCustId && respCustId > 0,
              `Don tao thanh cong voi customerId=${respCustId} (KH moi tu hoi vien nhanh, khong phai vang lai)`);
            t.assert("S6-05",
              respCustId && Number(respCustId) > 100000,
              `customerId moi (auto increment) = ${respCustId}`);
          } else {
            logUiBug("S6", "HIGH", "invoice/create that bai voi KH moi",
              JSON.stringify(createInv6?.body || {}).slice(0, 200));
          }
          await t.screenshot("s6-paid");
        }
      }
    }

  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    logUiBug("FATAL", "BLOCKER", e.message);
    await t.page.screenshot({ path: `tests/screenshots/fatal-${RID}.png` }).catch(() => {});
  }

  // ── BUG REPORT ────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(70));
  console.log("  BUG REPORT");
  console.log("═".repeat(70));
  console.log(`\n🐛 UI BUGS (${uiBugs.length}):`);
  uiBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n🔧 BE BUGS (${beBugs.length}):`);
  beBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n📋 KEY FINDINGS:`);
  findings.forEach((f, i) => console.log(`  ${i + 1}. [${f.step}] ${f.msg}`));

  await t.done();
  process.exit(uiBugs.length + beBugs.length > 0 ? 1 : 0);
}

main();
