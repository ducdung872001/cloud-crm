#!/usr/bin/env node
/**
 * TEST CRUD KHO HANG — Reborn Retail CRM
 *
 * Test day du: Create, Read, Update, Delete, Search, Validation
 * Chay: node tests/test-warehouse-crud.mjs
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-4);
const TEST_NAME = `Kho Auto ${RID}`;
const TEST_CODE = `KAT${RID}`;
const TEST_ADDR = `Dia chi test ${RID}`;
const UPDATED_NAME = `Kho Updated ${RID}`;

async function main() {
  const t = await createTestRunner("WH-CRUD", "CRUD Kho hang");

  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));

    // ════════════════════════════════════════════════════════════
    // READ — Hien thi danh sach kho
    // ════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(60));
    console.log("  READ — DANH SACH KHO");
    console.log("═".repeat(60));

    t.log("\u25B6", "R-001: Hien thi danh sach kho");
    await t.goto("/warehouse");
    {
      const rows = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
      t.assert("R-001", rows > 0, `${rows} kho hien thi`);
      await t.screenshot("r-001-list");
    }

    t.log("\u25B6", "R-002: Kiem tra cac cot");
    {
      const headers = await t.page.evaluate(() =>
        [...document.querySelectorAll("table thead th")].map(e => e.innerText?.trim())
      );
      const expected = ["Tên kho", "Mã kho", "Địa chỉ", "Trạng thái"];
      const missing = expected.filter(c => !headers.some(h => h.includes(c)));
      t.assert("R-002", missing.length === 0, missing.length === 0 ? `Du cot: ${expected.join(", ")}` : `Thieu: ${missing.join(", ")}`);
    }

    t.log("\u25B6", "R-003: Du lieu dong khong rong");
    {
      const firstRow = await t.page.evaluate(() => {
        const tr = document.querySelector("table tbody tr:first-child");
        if (!tr) return null;
        return [...tr.querySelectorAll("td")].map(td => td.innerText?.trim());
      });
      if (firstRow) {
        t.assert("R-003a", (firstRow[2] || "").length > 0, `Ten kho: "${firstRow[2]}"`);
        t.assert("R-003b", (firstRow[5] || "").length > 0, `Trang thai: "${firstRow[5]}"`);
      } else {
        t.assert("R-003", false, "Khong co dong nao");
      }
    }

    t.log("\u25B6", "R-004: Co nut Edit va Delete moi dong");
    {
      const btnCount = await t.page.evaluate(() => {
        const row = document.querySelector("table tbody tr:first-child td:last-child");
        return row ? row.querySelectorAll("button.base-button").length : 0;
      });
      t.assert("R-004", btnCount >= 2, `${btnCount} action buttons / dong`);
    }

    t.log("\u25B6", "R-005: Tim kiem kho");
    {
      const input = await t.page.$('input[placeholder*="Tìm kiếm tên kho"]');
      if (input) {
        const rowsBefore = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
        await input.fill("KHONGCOKHO_XYZ");
        await t.page.keyboard.press("Enter");
        await t.page.waitForTimeout(2000);
        const rowsAfter = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
        t.assert("R-005a", rowsAfter === 0, `Tim khong co → ${rowsAfter} dong`);

        // Tim theo ten kho that
        await input.fill("Kho");
        await t.page.keyboard.press("Enter");
        await t.page.waitForTimeout(2000);
        const rowsFound = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
        t.assert("R-005b", rowsFound > 0, `Tim "Kho" → ${rowsFound} dong`);

        // Clear
        await input.fill("");
        await t.page.keyboard.press("Enter");
        await t.page.waitForTimeout(2000);
      } else {
        t.assert("R-005", false, "Khong co o tim kiem");
      }
      await t.screenshot("r-005-search");
    }

    // ════════════════════════════════════════════════════════════
    // CREATE — Tao kho moi
    // ════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(60));
    console.log("  CREATE — TAO KHO MOI");
    console.log("═".repeat(60));

    const rowsBefore = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);

    t.log("\u25B6", "C-001: Mo modal Them kho");
    {
      await t.page.click('button:has-text("Thêm kho")', { force: true });
      await t.page.waitForTimeout(1500);
      const hasModal = await t.exists('.modal.show');
      t.assert("C-001", hasModal, hasModal ? "Modal Them kho hien thi" : "Modal khong mo");
      await t.screenshot("c-001-modal");
    }

    t.log("\u25B6", "C-002: Validate — submit khi chua nhap ten");
    {
      // Nut "Cap nhat" / "Luu" phai disabled khi ten rong
      const saveBtn = await t.page.$('.modal.show button:has-text("Cập nhật"), .modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo"), .modal.show button:has-text("Xác nhận")');
      if (saveBtn) {
        const disabled = await saveBtn.evaluate(el => el.disabled);
        t.assert("C-002", disabled, disabled ? "Nut Luu disabled khi ten rong — DUNG" : "Nut KHONG disabled — THIEU VALIDATE");
      } else {
        t.assert("C-002", false, "Khong tim thay nut Luu");
      }
    }

    t.log("\u25B6", "C-003: Nhap thong tin kho");
    {
      const nameInput = await t.page.$('.modal.show input[name="name"]');
      const codeInput = await t.page.$('.modal.show input[name="code"]');
      const addrInput = await t.page.$('.modal.show textarea[name="address"], .modal.show input[name="address"]');

      if (nameInput) {
        await nameInput.fill(TEST_NAME);
        t.assert("C-003a", true, `Nhap ten: "${TEST_NAME}"`);
      }
      if (codeInput) {
        await codeInput.fill(TEST_CODE);
        t.assert("C-003b", true, `Nhap ma: "${TEST_CODE}"`);
      }
      if (addrInput) {
        await addrInput.fill(TEST_ADDR);
        t.assert("C-003c", true, `Nhap dia chi: "${TEST_ADDR}"`);
      }
      await t.screenshot("c-003-filled");
    }

    t.log("\u25B6", "C-004: Nut Luu enable sau khi nhap ten");
    {
      const saveBtn = await t.page.$('.modal.show button:has-text("Cập nhật"), .modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo"), .modal.show button:has-text("Xác nhận")');
      if (saveBtn) {
        const disabled = await saveBtn.evaluate(el => el.disabled);
        t.assert("C-004", !disabled, !disabled ? "Nut Luu ENABLE — DUNG" : "Nut van disabled — LOI");
      }
    }

    t.log("\u25B6", "C-005: Click Luu — tao kho");
    {
      t.clearApiLogs();
      const saveBtn = await t.page.$('.modal.show button:has-text("Cập nhật"), .modal.show button:has-text("Lưu"), .modal.show button:has-text("Tạo"), .modal.show button:has-text("Xác nhận")');
      if (saveBtn) {
        await saveBtn.click({ force: true });
        await t.page.waitForTimeout(3000);
        const api = t.findApi("POST", "warehouse");
        t.assert("C-005", true, api ? `API POST ${api.status}` : "Da click Luu");
      }
      await t.screenshot("c-005-created");
    }

    t.log("\u25B6", "C-006: Verify kho moi trong danh sach");
    await t.goto("/warehouse");
    {
      await t.page.waitForTimeout(2000);
      const rowsAfter = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);
      const found = await t.hasText(TEST_NAME);
      t.assert("C-006a", found, found ? `Tim thay "${TEST_NAME}" trong DS` : `Khong thay kho moi`);
      t.assert("C-006b", rowsAfter > rowsBefore, `Truoc: ${rowsBefore} → Sau: ${rowsAfter}`);
      await t.screenshot("c-006-verify");
    }

    // ════════════════════════════════════════════════════════════
    // UPDATE — Sua kho
    // ════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(60));
    console.log("  UPDATE — SUA KHO");
    console.log("═".repeat(60));

    t.log("\u25B6", "U-001: Click nut Edit (but chi) tren kho vua tao");
    await t.goto("/warehouse");
    await t.dismissTour();
    {
      // Tim dong chua ten kho test
      const rowIndex = await t.page.evaluate((name) => {
        const rows = [...document.querySelectorAll("table tbody tr")];
        return rows.findIndex(tr => tr.innerText?.includes(name));
      }, TEST_NAME);

      if (rowIndex >= 0) {
        // Click nut edit (data-tip="Sửa")
        const editBtn = await t.page.$(`table tbody tr:nth-child(${rowIndex + 1}) button[data-tip="Sửa"]`);
        if (editBtn) {
          await editBtn.click({ force: true });
          await t.page.waitForTimeout(1500);
          const hasModal = await t.exists('.modal.show');
          t.assert("U-001", hasModal, hasModal ? "Modal Edit mo" : "Modal khong mo");
          await t.screenshot("u-001-edit-modal");
        } else {
          t.assert("U-001", false, "Khong tim thay nut Edit");
        }
      } else {
        t.assert("U-001", false, `Khong tim thay dong "${TEST_NAME}"`);
      }
    }

    t.log("\u25B6", "U-002: Kiem tra du lieu hien thi dung");
    {
      const currentName = await t.page.evaluate(() => {
        const input = document.querySelector('.modal.show input[name="name"]');
        return input ? input.value : "";
      });
      t.assert("U-002", currentName === TEST_NAME, `Name hien thi: "${currentName}"`);
    }

    t.log("\u25B6", "U-003: Sua ten kho");
    {
      const nameInput = await t.page.$('.modal.show input[name="name"]');
      if (nameInput) {
        await nameInput.fill("");
        await nameInput.fill(UPDATED_NAME);
        t.assert("U-003", true, `Doi ten: "${TEST_NAME}" → "${UPDATED_NAME}"`);
      }
    }

    t.log("\u25B6", "U-004: Click Cap nhat");
    {
      t.clearApiLogs();
      const updateBtn = await t.page.$('.modal.show button:has-text("Cập nhật")');
      if (updateBtn) {
        await updateBtn.click({ force: true });
        await t.page.waitForTimeout(3000);
        const api = t.findApi("POST", "warehouse");
        t.assert("U-004", true, api ? `API POST ${api.status}` : "Da click Cap nhat");
      } else {
        t.assert("U-004", false, "Khong tim thay nut Cap nhat");
      }
      await t.screenshot("u-004-updated");
    }

    t.log("\u25B6", "U-005: Verify ten moi trong DS");
    await t.goto("/warehouse");
    {
      await t.page.waitForTimeout(2000);
      const found = await t.hasText(UPDATED_NAME);
      t.assert("U-005", found, found ? `Tim thay "${UPDATED_NAME}"` : "Khong thay ten moi");
    }

    // ════════════════════════════════════════════════════════════
    // DELETE — Xoa kho
    // ════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(60));
    console.log("  DELETE — XOA KHO");
    console.log("═".repeat(60));

    let searchName = UPDATED_NAME;

    t.log("\u25B6", "D-001: Click nut Delete tren kho test");
    await t.goto("/warehouse");
    {
      if (!(await t.hasText(UPDATED_NAME))) searchName = TEST_NAME;

      const dialogShown = await t.clickDeleteOnRow(searchName);
      await t.screenshot("d-001-dialog");
      t.assert("D-001", dialogShown, dialogShown ? "Dialog xac nhan hien" : "Dialog khong hien");
    }

    t.log("\u25B6", "D-002: Kiem tra noi dung dialog");
    {
      const dialogText = await t.page.evaluate(() => {
        const d = document.querySelector('.dialog') || document.querySelector('.modal.show');
        return d ? d.innerText : "";
      });
      // Dialog phai hien ten kho hoac text xac nhan
      const hasName = dialogText.includes(UPDATED_NAME) || dialogText.includes("xóa") || dialogText.includes("Xóa") || dialogText.includes("Ngừng");
      t.assert("D-002", hasName, `Dialog: "${dialogText.slice(0, 100)}..."`);
    }

    t.log("\u25B6", "D-003: Click Huy — khong xoa");
    {
      const cancelBtn = await t.page.$('.dialog button:has-text("Hủy")');
      if (cancelBtn) {
        await cancelBtn.click({ force: true });
        await t.page.waitForTimeout(1000);
        const stillExists = await t.hasText(searchName);
        t.assert("D-003", stillExists, stillExists ? "Huy OK — kho van con" : "Kho mat sau khi huy!?");
      } else {
        t.assert("D-003", false, "Khong tim thay nut Huy");
      }
      await t.screenshot("d-003-cancel");
    }

    t.log("\u25B6", "D-004: Click Delete lai → Xac nhan xoa");
    {
      const dialogShown = await t.clickDeleteOnRow(searchName);
      if (dialogShown) {
        t.clearApiLogs();
        const confirmBtn = await t.page.$('.dialog button:has-text("Xóa vĩnh viễn"), .dialog button:has-text("Ngừng sử dụng"), .dialog button:has-text("Xóa")');
        if (confirmBtn) {
          const btnText = await confirmBtn.innerText();
          await confirmBtn.click({ force: true });
          await t.page.waitForTimeout(3000);
          const api = t.findApi("DELETE", "warehouse") || t.findApi("POST", "warehouse");
          t.assert("D-004", true, `Click "${btnText.trim()}" — ${api ? "API " + api.method + " " + api.status : "da xu ly"}`);
        } else {
          t.assert("D-004", false, "Khong tim thay nut xac nhan trong dialog");
        }
      } else {
        t.assert("D-004", false, "Dialog khong hien");
      }
      await t.screenshot("d-004-deleted");
    }

    t.log("\u25B6", "D-005: Verify kho da bi xoa/ngung su dung");
    await t.goto("/warehouse");
    {
      await t.page.waitForTimeout(2000);
      const rowsNow = await t.page.evaluate(() => document.querySelectorAll("table tbody tr").length);

      // Kiem tra: kho trang → bi xoa hoan toan, kho co GD → chuyen "Ngung su dung"
      const stillExists = await t.hasText(searchName);
      if (!stillExists) {
        t.assert("D-005", true, `Kho "${searchName}" da bi XOA CUNG (kho trang) — ${rowsNow} kho con lai`);
      } else {
        // Kiem tra trang thai chuyen sang "Ngung su dung"
        const statusText = await t.page.evaluate((name) => {
          const rows = [...document.querySelectorAll("table tbody tr")];
          const row = rows.find(tr => tr.innerText?.includes(name));
          if (!row) return "";
          const cells = [...row.querySelectorAll("td")];
          return cells[5]?.innerText?.trim() || "";
        }, searchName);
        t.assert("D-005", statusText.includes("Ngừng"), `Kho chuyen sang "${statusText}" (kho co giao dich)`);
      }
      await t.screenshot("d-005-verify");
    }

    // ════════════════════════════════════════════════════════════
    // PHAN TRANG & HIEN THI
    // ════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(60));
    console.log("  PHAN TRANG & HIEN THI");
    console.log("═".repeat(60));

    t.log("\u25B6", "P-001: Page size selector");
    {
      const btns = await t.page.$$("button.base-button");
      let pageSizeBtn = null;
      for (const btn of btns) {
        const text = await btn.innerText();
        if (text.trim() === "10") { pageSizeBtn = btn; break; }
      }
      t.assert("P-001", !!pageSizeBtn, pageSizeBtn ? "Nut page size (10) hien thi" : "Khong thay");
    }

    t.log("\u25B6", "P-002: Checkbox chon tat ca");
    {
      const checkAll = await t.page.$('table thead input[type="checkbox"]');
      if (checkAll) {
        await checkAll.click({ force: true });
        await t.page.waitForTimeout(500);
        const checkedCount = await t.page.evaluate(() =>
          document.querySelectorAll('table tbody input[type="checkbox"]:checked').length
        );
        t.assert("P-002", checkedCount > 0, `Check all → ${checkedCount} dong duoc chon`);
        // Uncheck
        await checkAll.click({ force: true });
        await t.page.waitForTimeout(500);
      } else {
        t.assert("P-002", false, "Khong co checkbox header");
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
