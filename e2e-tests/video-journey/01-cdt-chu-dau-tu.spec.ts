import { test } from "@playwright/test";
import { loginAsBanGiamDoc, gotoStep, actionStep, injectOverlay, RoleInfo } from "./_helper";

const role: RoleInfo = {
  index: 1, total: 7,
  shortName: "CĐT",
  longName: "Chủ đầu tư (Owner)",
  description: "Sở hữu dự án · Thuê TNPM vận hành · Xem P&L của riêng mình",
  color: "722ed1",
};

test("Role 1/7 — Chủ đầu tư: hành trình E2E", async ({ page }) => {
  test.setTimeout(900_000);
  const T = 24; // total steps

  await injectOverlay(page, role, 1, T, "Mở đầu — Chủ đầu tư (CĐT) là người sở hữu dự án, thuê TNPM vận hành. Họ chỉ thấy dự án CỦA MÌNH qua Owner Portal.");
  await page.waitForTimeout(11_000);

  await loginAsBanGiamDoc(page);
  await injectOverlay(page, role, 2, T, "Đăng nhập SSO — Cùng pattern login cho mọi role: phone + password → chọn role tại role chooser.");
  await page.waitForTimeout(8_000);

  await gotoStep(page, role, 3, T, "Owner Dashboard — Màn hình chính của CĐT. Hiển thị tổng quan tài sản BĐS, doanh thu kỳ, công nợ, NCC.", "/owner-dashboard");
  await gotoStep(page, role, 4, T, "KPI dự án — Số lượng dự án đang vận hành, tỷ lệ lấp đầy, doanh thu tháng này. CĐT thấy ngay tình trạng tài sản.", "/owner-dashboard");
  await gotoStep(page, role, 5, T, "Doanh thu 6 tháng — Biểu đồ trend so với mục tiêu (KPI). Vạch xanh là target, vạch đậm là actual. Giúp CĐT biết dự án đang vượt/dưới kế hoạch.", "/owner-dashboard", 13_000);
  await gotoStep(page, role, 6, T, "Tỷ lệ lấp đầy theo từng dự án — Vinhomes 85.8%, Goldmark 81.7%, AEON Long Biên 90%. CĐT spot ngay dự án đang underperform.", "/owner-dashboard", 12_000);

  await gotoStep(page, role, 7, T, "Portfolio view — CĐT xem tài sản theo nhóm portfolio (Hà Nội / HCM / Đà Nẵng). Aggregate doanh thu, công nợ, vendor KPI ở cấp portfolio.", "/portfolio");
  await gotoStep(page, role, 8, T, "Aggregate P&L — Doanh thu - chi phí vendor - chi phí vận hành = lợi nhuận net. CĐT cần biết dòng tiền thực tế của portfolio.", "/portfolio", 13_000);

  await gotoStep(page, role, 9, T, "Dự án list — CĐT có thể drill-down vào từng dự án cụ thể để xem chi tiết.", "/projects");
  await actionStep(page, role, 10, T, "Click vào dự án Vinhomes City Park — Xem chi tiết: 480 units, 412 đã thuê, 85.8% lấp đầy.", async (p) => {
    const card = p.locator('text=/Vinhomes City Park|VCITY/').first();
    if (await card.isVisible().catch(() => false)) await card.click({ force: true });
  });
  await injectOverlay(page, role, 11, T, "Chi tiết dự án — Thông tin tổng quan, danh sách unit, vendor đang phục vụ, lease contract active. CĐT có toàn quyền xem.");
  await page.waitForTimeout(11_000);

  await gotoStep(page, role, 12, T, "Báo cáo P&L — Báo cáo tài chính theo dự án, kỳ tháng/quý/năm. Doanh thu theo nguồn (lease + utilities + parking + other).", "/reports", 13_000);
  await gotoStep(page, role, 13, T, "Báo cáo Cost breakdown — Chi phí chia theo loại (vendor, utilities, maintenance, admin). CĐT đánh giá hiệu quả vận hành của TNPM.", "/reports", 12_000);

  await gotoStep(page, role, 14, T, "KPI Nhà cung cấp — Tổng quan rating NCC đang phục vụ dự án của CĐT. Otis 4.8★, KT Việt 4.5★, PCCC HN 3.2★ (cần lưu ý).", "/vendor-kpi", 13_000);
  await gotoStep(page, role, 15, T, "Top NCC theo dịch vụ — Filter theo loại (thang máy, bảo trì, vệ sinh...). CĐT đánh giá năng lực NCC trước khi gia hạn HĐ.", "/vendor-kpi", 11_000);

  await gotoStep(page, role, 16, T, "HĐ thuê — Danh sách lease contract của các tenant tại dự án CĐT. Status: active / pending escalation / pending renewal.", "/lease-contracts");
  await actionStep(page, role, 17, T, "Click 1 HĐ thuê Samsung VN — HĐ dài hạn 5 năm với escalation schedule CPI-linked.", async (p) => {
    const row = p.locator('text=/Samsung|HD-THUE-003/').first();
    if (await row.isVisible().catch(() => false)) await row.click({ force: true });
  });
  await injectOverlay(page, role, 18, T, "Escalation schedule — 5 kỳ tăng giá theo năm, mỗi năm +5%. CĐT thấy rõ revenue projection cho dự án industrial.");
  await page.waitForTimeout(11_000);

  await gotoStep(page, role, 19, T, "Turnover Rent — Riêng dự án retail (AEON), phí thuê tính % doanh thu tenant. CĐT xem báo cáo tháng để verify.", "/turnover-rent", 12_000);

  await gotoStep(page, role, 20, T, "Công nợ — Tenant nào đang nợ phí, bao nhiêu, quá hạn mấy ngày. CĐT theo dõi cashflow.", "/debt-management", 11_000);

  await gotoStep(page, role, 21, T, "Notification — CĐT nhận alert: lease sắp hết hạn, tenant chậm trả, vendor SLA miss, P&L lệch ngưỡng.", "/notification", 11_000);

  await gotoStep(page, role, 22, T, "Cài đặt — CĐT cấu hình rule alert, đối tác MSB/Vietcombank nhận thanh toán, template email gửi cư dân.", "/setting", 10_000);

  await gotoStep(page, role, 23, T, "Trở về Owner Dashboard — Bức tranh tổng kết cho CĐT trong ngày: doanh thu thực tế, công nợ, vendor performance.", "/owner-dashboard", 11_000);

  await injectOverlay(page, role, 24, T, "Tổng kết Role CĐT — Quyền: chỉ thấy dự án sở hữu (RLS), không thấy dự án CĐT khác. Mục tiêu: tối đa P&L, kiểm soát NCC, ổn định cashflow.");
  await page.waitForTimeout(13_000);
});
