import { test } from "@playwright/test";
import { loginAsBanGiamDoc, gotoStep, actionStep, injectOverlay, RoleInfo } from "./_helper";

const role: RoleInfo = {
  index: 2, total: 7,
  shortName: "Leadership",
  longName: "TNPM Leadership (Ban điều hành)",
  description: "Quản trị toàn hệ thống · Portfolio view tổng · Cross-project P&L",
  color: "fa541c",
};

test("Role 2/7 — TNPM Leadership: hành trình E2E", async ({ page }) => {
  test.setTimeout(900_000);
  const T = 24;

  await injectOverlay(page, role, 1, T, "Mở đầu — TNPM Leadership là ban điều hành công ty TNPM, quản trị toàn hệ thống. Khác CĐT (chỉ thấy của mình), Leadership thấy TẤT CẢ portfolio + dự án.");
  await page.waitForTimeout(11_000);

  await loginAsBanGiamDoc(page);
  await injectOverlay(page, role, 2, T, "Đăng nhập — Vào hệ thống với role Ban giám đốc / Leadership.");
  await page.waitForTimeout(7_000);

  await gotoStep(page, role, 3, T, "Dashboard tổng — Màn hình chính: 5 dự án, 87% lấp đầy, 680tr doanh thu tháng, 270tr công nợ quá hạn. Bức tranh toàn hệ thống.", "/dashboard");
  await gotoStep(page, role, 4, T, "Stats overview — 6 cards KPI: dự án, lấp đầy, doanh thu, công nợ, SR đang xử lý, HĐ NCC chờ duyệt.", "/dashboard", 12_000);

  await gotoStep(page, role, 5, T, "Doanh thu 6 tháng — Trend toàn hệ thống. Leadership thấy tổng portfolio đang tăng trưởng 5.4% MoM.", "/dashboard", 12_000);
  await gotoStep(page, role, 6, T, "Tỷ lệ lấp đầy theo dự án — Top performer (AEON 90%) và underperformer (cần action). Cross-project comparison.", "/dashboard", 11_000);

  await gotoStep(page, role, 7, T, "Portfolio aggregate — 3 portfolio: HN (5 dự án 125k m²), HCM (3 dự án 85k m²), Đà Nẵng (2 dự án 42k m²). Tổng 10 dự án.", "/portfolio");
  await gotoStep(page, role, 8, T, "Revenue chart per portfolio — So sánh doanh thu giữa 3 vùng. Leadership ra quyết định mở rộng vùng nào.", "/portfolio", 12_000);

  await gotoStep(page, role, 9, T, "Dự án list — Tổng 5 dự án active: VCITY-001, GOLD-001, VINH-IPC (KCN), AEON-001, ECOPARK-001, HC-BADINH (B2G).", "/projects");
  await gotoStep(page, role, 10, T, "Multi-type portfolio — Apartment / Office / Industrial / Retail / Villa / Government. Leadership cần biết tỷ trọng từng loại để cân bằng rủi ro.", "/projects", 11_000);

  await gotoStep(page, role, 11, T, "Quản lý Unit — Tổng 1161 units, 1010 đã thuê. Leadership tracking inventory cấp hệ thống.", "/units", 11_000);

  await gotoStep(page, role, 12, T, "Khách hàng/Tenant tổng — Toàn bộ B2B + B2C + B2G. Leadership thấy mix tenant của cả hệ thống.", "/customer_person", 11_000);

  await gotoStep(page, role, 13, T, "Báo cáo P&L tổng — Doanh thu - Chi phí vendor - Chi phí vận hành = Profit per project. Aggregate cấp portfolio và toàn hệ thống.", "/reports", 13_000);

  await gotoStep(page, role, 14, T, "KPI Nhà cung cấp toàn hệ thống — Tổng số NCC active, rating trung bình, top NCC theo dịch vụ. Cross-portfolio insight.", "/vendor-kpi", 12_000);

  await gotoStep(page, role, 15, T, "Vendor by service — Drill-down dịch vụ thang máy: Otis 4.8★ phục vụ Goldmark, KT Việt 4.5★ phục vụ Vinhomes. Đánh giá khả năng cấp tập đoàn.", "/vendor-kpi", 11_000);

  await gotoStep(page, role, 16, T, "HĐ thuê tổng — Filter các HĐ sắp hết hạn / sắp escalate. Leadership cần biết để forecast doanh thu năm tới.", "/lease-contracts", 12_000);

  await gotoStep(page, role, 17, T, "Công nợ toàn hệ thống — Tổng phải thu 270tr quá hạn, top 5 tenant nợ nặng nhất. Leadership chỉ đạo BQL đòi nợ.", "/debt-management", 11_000);

  await gotoStep(page, role, 18, T, "Fee Notification — Quản lý chiến dịch phát thông báo phí định kỳ. Template, segment, schedule.", "/fee-notification", 11_000);

  await gotoStep(page, role, 19, T, "B2G Compliance — Dự án hành chính HC Ba Đình: ngân sách 1.14 tỷ năm 2024, đã chi 285tr. Compliance workflow kho bạc.", "/b2g-compliance", 12_000);

  await gotoStep(page, role, 20, T, "Audit Log — Giám sát mọi thao tác trên hệ thống. Leadership review hành động critical: approve invoice lớn, sửa HĐ, xóa data.", "/audit-log", 12_000);

  await gotoStep(page, role, 21, T, "Cài đặt hệ thống — Cấu hình master cho cả TNPM: roles, permissions, payment gateways (MSB/Timi/VNPay/MoMo), notification templates.", "/setting", 12_000);

  await gotoStep(page, role, 22, T, "BPM Workflow — Cấu hình quy trình duyệt (vendor invoice 3-way match, B2G submit-review-approve-file). Leadership phê duyệt cấp cao nhất.", "/bpm", 11_000);

  await gotoStep(page, role, 23, T, "Trở về Dashboard — Bức tranh cuối ngày cho Leadership: hệ thống đang vận hành thế nào, có alert gì cần xử lý.", "/dashboard", 11_000);

  await injectOverlay(page, role, 24, T, "Tổng kết Role Leadership — Quyền: full access toàn hệ thống. Mục tiêu: tối đa lợi nhuận tập đoàn, kiểm soát rủi ro, ra quyết định chiến lược.");
  await page.waitForTimeout(13_000);
});
