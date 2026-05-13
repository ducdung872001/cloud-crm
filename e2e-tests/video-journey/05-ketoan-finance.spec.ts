import { test } from "@playwright/test";
import { loginAsBanGiamDoc, gotoStep, actionStep, injectOverlay, RoleInfo } from "./_helper";

const role: RoleInfo = {
  index: 5, total: 7,
  shortName: "Kế toán",
  longName: "Kế toán / Tài chính",
  description: "3-way match vendor invoice · Phát hành invoice cư dân · Quản lý công nợ · P&L",
  color: "52c41a",
};

test("Role 5/7 — Kế toán / Tài chính: hành trình E2E", async ({ page }) => {
  test.setTimeout(900_000);
  const T = 24;

  await injectOverlay(page, role, 1, T, "Mở đầu — Kế toán/Tài chính nhận invoice từ vendor, đối chiếu 3-way match, approve, phát hành invoice cư dân, quản công nợ, làm P&L.");
  await page.waitForTimeout(11_000);

  await loginAsBanGiamDoc(page);
  await injectOverlay(page, role, 2, T, "Đăng nhập — Vào hệ thống với role Kế toán. Họ thấy module Billing & Tài chính, Vendor Invoice, Công nợ, Báo cáo.");
  await page.waitForTimeout(7_000);

  await gotoStep(page, role, 3, T, "Dashboard — Kế toán quan tâm: doanh thu kỳ, công nợ quá hạn, vendor invoice chờ duyệt, dòng tiền vào/ra.", "/dashboard");

  await gotoStep(page, role, 4, T, "Hóa đơn NCC — Vendor gửi invoice qua portal → vào màn này. Kế toán xem từng cái, kiểm tra 3-way match.", "/vendor-invoices");
  await actionStep(page, role, 5, T, "Click 1 invoice — Xem chi tiết: số tiền, kỳ, vendor, contract liên quan.", async (p) => {
    const row = p.locator('text=/NVAT-2024|HD-NCC/').first();
    if (await row.isVisible().catch(() => false)) await row.click({ force: true });
  });
  await injectOverlay(page, role, 6, T, "3-way match — Đối chiếu: Invoice ↔ Purchase Order (HĐ NCC) ↔ Biên bản nghiệm thu (do KST ký). Khớp cả 3 mới được approve.");
  await page.waitForTimeout(13_000);
  await page.keyboard.press("Escape").catch(() => {});

  await gotoStep(page, role, 7, T, "Workflow approval 4-step — Pending → Level 1 (kế toán) → Level 2 (BQL) → Level 3 (Leadership). Mỗi level kiểm tra rồi forward.", "/vendor-invoices", 12_000);

  await gotoStep(page, role, 8, T, "Hóa đơn cư dân — Kế toán phát hành invoice định kỳ cho tenant: phí thuê + phí quản lý + điện + nước + parking.", "/billing");
  await actionStep(page, role, 9, T, "Click 1 invoice cư dân — Line items: phí thuê 15tr + quản lý 680k + điện 8.5tr + nước 520k + xe 1.2tr + khác 300k = 26.2tr.", async (p) => {
    const row = p.locator('text=/HD-2024|Phí thuê/').first();
    if (await row.isVisible().catch(() => false)) await row.click({ force: true });
  });
  await page.keyboard.press("Escape").catch(() => {});

  await gotoStep(page, role, 10, T, "Turnover Rent — Riêng tenant retail (AEON), kế toán nhận báo cáo doanh thu hàng tháng, tính phí thuê % (8% turnover).", "/turnover-rent", 13_000);

  await gotoStep(page, role, 11, T, "Nhập chỉ số tháng — Sau khi KST đọc chỉ số, kế toán verify & sinh tự động line item điện/nước trong invoice.", "/meter-readings", 12_000);

  await gotoStep(page, role, 12, T, "Công nợ phải thu/phải trả — Trang trung tâm của kế toán. Phải thu (cư dân nợ), Phải trả (vendor nợ).", "/debt-management");
  await gotoStep(page, role, 13, T, "Filter quá hạn — 2 hóa đơn quá hạn tổng 270tr. ABC Technology nợ 165tr Q1, Thời Trang Việt nợ 105tr T3. Cần action.", "/debt-management", 13_000);

  await gotoStep(page, role, 14, T, "Giao dịch công nợ — Mỗi lần ghi nhận thanh toán, đối trừ hoặc miễn giảm tạo 1 transaction. Audit trail rõ ràng.", "/debt-transaction", 12_000);

  await gotoStep(page, role, 15, T, "Lịch sử thanh toán — Tất cả payment: bank_transfer MSB/Vietcombank, cash, VietQR callback. Reconcile với sao kê ngân hàng.", "/payment_history", 12_000);

  await gotoStep(page, role, 16, T, "Thông báo phí & Nhắc nợ — Kế toán phối hợp Marketing setup chiến dịch gửi email/Zalo nhắc thanh toán T-7/T-3/T-1.", "/fee-notification", 12_000);

  await gotoStep(page, role, 17, T, "B2G Compliance — Dự án hành chính HC Ba Đình: ngân sách 1.14 tỷ, mỗi đề nghị thanh toán qua nhiều cấp duyệt rồi kho bạc chi.", "/b2g-compliance", 12_000);

  await gotoStep(page, role, 18, T, "Báo cáo P&L per project — Bảng tổng doanh thu - chi phí - lợi nhuận theo từng dự án. Báo cáo cho CĐT định kỳ.", "/reports", 13_000);

  await gotoStep(page, role, 19, T, "KPI Nhà cung cấp — Kế toán quan tâm: chi phí vendor / dự án, vendor chậm gửi invoice, vendor cần thanh toán gấp.", "/vendor-kpi", 11_000);

  await gotoStep(page, role, 20, T, "Cài đặt Phương thức thanh toán — Cấu hình MSB Pay, Vietcombank, BIDV. Tài khoản nào nhận phí dự án nào.", "/setting", 12_000);

  await gotoStep(page, role, 21, T, "Audit Log — Mọi thao tác financial-critical (approve invoice > 100tr, ghi nhận payment, miễn nợ) đều log. Kế toán review định kỳ.", "/audit-log", 11_000);

  await gotoStep(page, role, 22, T, "BPM — Workflow approval đa cấp do kế toán initiate. Xem trạng thái task đang ở cấp nào, ai chưa duyệt.", "/bpm", 11_000);

  await gotoStep(page, role, 23, T, "Trở về Hóa đơn NCC — Cuối ngày kế toán review pending invoice, đảm bảo không bị overdue cho vendor.", "/vendor-invoices", 11_000);

  await injectOverlay(page, role, 24, T, "Tổng kết Role Kế toán — Quyền: full Billing & Tài chính + Vendor Invoice approval. KPI: thanh toán đúng hạn ≥85%, chênh lệch đối soát <0.01%.");
  await page.waitForTimeout(13_000);
});
