/**
 * test-seed-warehouse.mjs
 * Seed "Kho hàng mẫu" (isSelling=1) nếu chưa có.
 * Dọn các warehouse artifact nguy hiểm (XSS/SQLi/special chars) còn sót từ test-crud-advanced.
 *
 * Chạy: node tests/test-seed-warehouse.mjs
 */
import { createTestRunner } from "./helpers.mjs";

const TARGET_NAME = "Kho hàng mẫu";
const TARGET_CODE = "KHM01";
const TARGET_ADDRESS = "123 Nguyễn Huệ, Q.1, TP.HCM";

const t = await createTestRunner("SEED-WH", "Seed Kho hàng mẫu + dọn artifacts");
await t.login();

await t.goto("/warehouse");
await t.page.waitForTimeout(2500);

// ── 1. Dọn các warehouse nguy hiểm (XSS/SQLi/special chars) ──
const DANGEROUS_PATTERNS = [
  "<script",
  "DROP TABLE",
  "!@#$",
  "'; ",
];
const rowsInfo = await t.page.evaluate(() => {
  return [...document.querySelectorAll("table tbody tr")].map((tr) => ({
    name: tr.querySelector("td:nth-child(3)")?.innerText?.trim() || "",
  }));
});
const dangerousNames = rowsInfo
  .map((r) => r.name)
  .filter((n) => DANGEROUS_PATTERNS.some((p) => n.includes(p)));
console.log(`\n  Found ${dangerousNames.length} dangerous warehouses:`);
dangerousNames.forEach((n, i) => console.log(`    ${i + 1}. "${n.slice(0, 50)}"`));

for (const name of dangerousNames) {
  const clicked = await t.clickDeleteOnRow(name);
  if (clicked) {
    const confirm = await t.page.$('.dialog button:has-text("Xóa"), .dialog button:has-text("Ngừng"), .modal.show button:has-text("Xóa"), .modal.show button:has-text("Ngừng")');
    if (confirm) {
      await confirm.click({ force: true });
      await t.page.waitForTimeout(1800);
      t.log("🗑", `Deleted/ngừng: "${name.slice(0, 40)}"`);
    }
  } else {
    t.log("⚠", `Không click được nút xoá cho "${name.slice(0, 40)}"`);
  }
  await t.goto("/warehouse");
  await t.page.waitForTimeout(1500);
}

// ── 2. Kiểm tra đã tồn tại "Kho hàng mẫu" chưa ──
await t.goto("/warehouse");
await t.page.waitForTimeout(2500);
const alreadyExists = await t.hasText(TARGET_NAME);
t.assert("SEED-CHECK", true, alreadyExists ? `"${TARGET_NAME}" đã tồn tại, sẽ verify isSelling` : `"${TARGET_NAME}" chưa có, tạo mới`);

/** Tick checkbox "Kho hàng chính" — dùng Playwright locator để trigger React onChange đúng. */
async function tickIsSelling() {
  // Strategy 1: Playwright label click (tương thích React synthetic events)
  const byLabel = t.page.locator('.modal.show label:has-text("Kho hàng chính")').first();
  if (await byLabel.count()) {
    try {
      // Click trên label — làm trigger input type=checkbox bên trong
      await byLabel.click({ force: true });
      await t.page.waitForTimeout(300);
      const checked = await t.page.evaluate(() => {
        const modal = document.querySelector(".modal.show");
        const lbl = [...modal.querySelectorAll("label")].find((l) => l.innerText?.trim() === "Kho hàng chính");
        return !!lbl?.querySelector('input[type="checkbox"]:checked') || !!lbl?.closest(".on-checked") || !!modal.querySelector(".base-checkbox.on-checked");
      });
      if (checked) return true;
    } catch {}
  }
  // Strategy 2: click trực tiếp vào span .checkmark bên trong label
  const byMark = t.page.locator('.modal.show .base-checkbox:has-text("Kho hàng chính") .checkmark, .modal.show .input-is-selling .checkmark').first();
  if (await byMark.count()) {
    try {
      await byMark.click({ force: true });
      await t.page.waitForTimeout(300);
      return true;
    } catch {}
  }
  // Strategy 3: page.check trên input gần nhất của label
  try {
    const input = t.page.locator('.modal.show label:has-text("Kho hàng chính") input[type="checkbox"]').first();
    if (await input.count()) {
      await input.check({ force: true });
      return true;
    }
  } catch {}
  return false;
}

// Nếu đã tồn tại: mở edit, tick, save
if (alreadyExists) {
  const openedEdit = await t.clickEditOnRow(TARGET_NAME);
  if (openedEdit) {
    await t.page.waitForTimeout(1200);
    // DEBUG: trạng thái modal trước khi tick
    const beforeTick = await t.page.evaluate(() => {
      const m = document.querySelector(".modal.show");
      if (!m) return null;
      return {
        labels: [...m.querySelectorAll("label")].slice(0, 12).map((l) => l.innerText?.trim().slice(0, 40)),
        checkboxes: [...m.querySelectorAll('input[type="checkbox"]')].map((i) => ({ name: i.name, checked: i.checked, value: i.value })),
        baseCheckboxes: [...m.querySelectorAll(".base-checkbox")].map((d) => ({ cls: d.className, text: d.innerText?.trim().slice(0, 40) })),
      };
    });
    console.log("  [DBG] modal before tick:", JSON.stringify(beforeTick, null, 2));

    const tickedNow = await tickIsSelling();
    await t.page.waitForTimeout(500);

    // DEBUG: trạng thái sau tick
    const afterTick = await t.page.evaluate(() => {
      const m = document.querySelector(".modal.show");
      if (!m) return null;
      return {
        checkboxes: [...m.querySelectorAll('input[type="checkbox"]')].map((i) => ({ name: i.name, checked: i.checked })),
        onCheckedBoxes: [...m.querySelectorAll(".base-checkbox.on-checked")].map((d) => d.innerText?.trim().slice(0, 40)),
      };
    });
    console.log("  [DBG] modal after tick:", JSON.stringify(afterTick, null, 2));

    t.assert("SEED-EDIT-TICK", tickedNow, tickedNow ? "Đã tick isSelling trong edit modal" : "Tick thất bại (edit mode)");

    // Capture POST response body khi save
    const saveResponses = [];
    const saveListener = async (res) => {
      if (res.request().method() === "POST" && /warehouse|inventory/i.test(res.url())) {
        try {
          const body = await res.json();
          saveResponses.push({ url: res.url().split("?")[0], status: res.status(), body });
        } catch {}
      }
    };
    t.page.on("response", saveListener);

    const upd = await t.page.click('.modal.show button:has-text("Cập nhật"), .modal.show button:has-text("Lưu")', { force: true }).then(() => true).catch(() => false);
    await t.page.waitForTimeout(2500);
    t.page.off("response", saveListener);

    console.log("  [DBG] save responses:", JSON.stringify(saveResponses, null, 2).slice(0, 800));

    // Capture request body for the update
    const requestBodies = [];
    t.page.on("request", (req) => {
      if (req.method() === "POST" && /warehouse|inventory/i.test(req.url())) {
        try { requestBodies.push(JSON.parse(req.postData() || "{}")); } catch {}
      }
    });
    await t.goto("/warehouse");
    await t.page.waitForTimeout(2000);
    const hasMark = await t.page.evaluate((name) => {
      const rows = [...document.querySelectorAll("table tbody tr")];
      const row = rows.find((r) => r.innerText?.includes(name));
      return row ? row.innerText?.includes("(Kho chính)") : false;
    }, TARGET_NAME);
    t.assert("SEED-EDIT-VERIFY", hasMark, hasMark ? "Dòng có '(Kho chính)' sau edit" : "Không thấy '(Kho chính)' sau edit");
  } else {
    t.assert("SEED-EDIT-OPEN", false, "Không mở được edit modal cho 'Kho hàng mẫu'");
  }
}

if (!alreadyExists) {
  // ── 3. Click "Thêm kho" + fill form + tick isSelling ──
  const addClicked = await t.page.click('button:has-text("Thêm kho")', { force: true }).then(() => true).catch(() => false);
  if (!addClicked) {
    t.assert("SEED-ADD", false, "Không tìm thấy nút 'Thêm kho'");
    await t.done();
    process.exit(1);
  }
  await t.page.waitForTimeout(1500);

  await t.page.fill('.modal.show input[name="name"]', TARGET_NAME);
  await t.page.fill('.modal.show input[name="code"]', TARGET_CODE);
  await t.page.fill('.modal.show textarea[name="address"]', TARGET_ADDRESS);

  const tickedSelling = await tickIsSelling();
  t.assert("SEED-01", tickedSelling, tickedSelling ? "Đã tick 'Kho hàng chính' (isSelling)" : "KHÔNG tick được checkbox isSelling");

  // Click Tạo mới
  t.clearApiLogs();
  const saveClicked = await t.page.click('.modal.show button:has-text("Tạo mới"), .modal.show button:has-text("Lưu")', { force: true }).then(() => true).catch(() => false);
  await t.page.waitForTimeout(3500);

  // Verify
  await t.goto("/warehouse");
  await t.page.waitForTimeout(2500);
  const created = await t.hasText(TARGET_NAME);
  t.assert("SEED-02", created, created ? `Đã tạo "${TARGET_NAME}"` : "Tạo thất bại");

  // Verify dòng có "(Kho chính)" suffix
  const mainMarker = await t.page.evaluate((name) => {
    const rows = [...document.querySelectorAll("table tbody tr")];
    const row = rows.find((r) => r.innerText?.includes(name));
    return row ? row.innerText?.includes("(Kho chính)") : false;
  }, TARGET_NAME);
  t.assert("SEED-03", mainMarker, mainMarker ? "Dòng có đánh dấu '(Kho chính)' → isSelling=1" : "Không thấy '(Kho chính)' — isSelling chưa set");
}

// ── 4. Hiển thị lại danh sách sau seed ──
const finalRows = await t.page.evaluate(() => {
  return [...document.querySelectorAll("table tbody tr")]
    .slice(0, 15)
    .map((tr) => [...tr.querySelectorAll("td")].map((td) => td.innerText?.replace(/\s+/g, " ").trim()).slice(0, 6));
});
console.log(`\n  Warehouse list sau seed (${finalRows.length} dòng đầu):`);
finalRows.forEach((r, i) => console.log(`    ${i + 1}. ${r.slice(0, 5).join(" | ")}`));

await t.done();
