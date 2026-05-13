import { test } from "@playwright/test";
import { loginAsBanGiamDoc, gotoStep, actionStep, injectOverlay, RoleInfo } from "./_helper";

const role: RoleInfo = {
  index: 4, total: 7,
  shortName: "KST",
  longName: "Kỹ sư trưởng / Kỹ thuật",
  description: "Phân công SR cho NCC · Theo dõi tiến độ · Nghiệm thu hiện trường",
  color: "13c2c2",
};

test("Role 4/7 — Kỹ sư trưởng / Kỹ thuật: hành trình E2E", async ({ page }) => {
  test.setTimeout(900_000);
  const T = 24;

  await injectOverlay(page, role, 1, T, "Mở đầu — KST/Kỹ thuật vận hành cơ sở tại site. Họ là người nhận SR, phân công vendor, nghiệm thu hiện trường, nhập chỉ số điện nước.");
  await page.waitForTimeout(11_000);

  await loginAsBanGiamDoc(page);
  await injectOverlay(page, role, 2, T, "Đăng nhập — Vào hệ thống với role KST. Họ thấy module Vận hành & Kỹ thuật, Phiếu hỗ trợ, Lịch làm việc.");
  await page.waitForTimeout(7_000);

  await gotoStep(page, role, 3, T, "Dashboard — KST quan tâm: SR đang mở, SR khẩn cấp, maintenance plan sắp đến, vendor chưa response.", "/dashboard");

  await gotoStep(page, role, 4, T, "Yêu cầu Dịch vụ (SR) — Trung tâm công việc của KST. Mỗi SR là yêu cầu sửa chữa / bảo trì từ cư dân, BQL hoặc hệ thống.", "/service-requests");
  await gotoStep(page, role, 5, T, "Filter SR khẩn cấp — Priority urgent (mất điện server, rò rỉ nước nghiêm trọng) cần xử lý trong giờ.", "/service-requests", 12_000);

  await actionStep(page, role, 6, T, "Click SR rò rỉ nước toilet — KST xem chi tiết: ai báo, đơn vị nào, vendor nào đang xử lý, hạn xử lý.", async (p) => {
    const row = p.locator('text=/Rò rỉ nước|SR-2024-001/').first();
    if (await row.isVisible().catch(() => false)) await row.click({ force: true });
  });
  await injectOverlay(page, role, 7, T, "Chi tiết SR — Tiêu đề, mô tả, vendor đang assign (KT Việt), kỹ thuật viên (Hoàng Kỹ Thuật), priority high, hạn 24h.");
  await page.waitForTimeout(12_000);
  await page.keyboard.press("Escape").catch(() => {});

  await actionStep(page, role, 8, T, "Tạo SR mới — Cư dân vừa gọi báo thang máy block B kêu cọ cọ. KST tạo SR ngay.", async (p) => {
    const btn = p.locator('button:has-text("Tạo"), button:has-text("Thêm"), button:has-text("+ Thêm")').first();
    if (await btn.isVisible().catch(() => false)) await btn.click({ force: true });
  });
  await injectOverlay(page, role, 9, T, "Form tạo SR — Chọn project, unit, category (elevator), priority, mô tả sự cố. Sau submit, hệ thống chọn vendor phù hợp (Otis VN).");
  await page.waitForTimeout(11_000);
  await page.keyboard.press("Escape").catch(() => {});

  await gotoStep(page, role, 10, T, "Kế hoạch Bảo trì — Lịch bảo trì định kỳ Q2/2024: thang máy (Otis quarterly), PCCC (PCCC HN semi-annual), MEP (KT Việt quarterly).", "/maintenance-plans", 12_000);

  await actionStep(page, role, 11, T, "Click 1 plan — Xem chi tiết: vendor được assign, ngày dự kiến, chi phí ước tính, chu kỳ. KST có thể edit hoặc đổi vendor.", async (p) => {
    const row = p.locator('text=/MP-2024|Bảo trì/').first();
    if (await row.isVisible().catch(() => false)) await row.click({ force: true });
  });
  await page.keyboard.press("Escape").catch(() => {});

  await gotoStep(page, role, 12, T, "Khiếu nại cư dân — Khác SR (cần action kỹ thuật), khiếu nại là VOC: thái độ bảo vệ, sạch không đạt, ồn ào... KST phối hợp BQL xử lý.", "/complaint-tickets", 12_000);

  await gotoStep(page, role, 13, T, "Lịch làm việc Nhân viên — Schedule kỹ thuật viên, bảo vệ, vệ sinh theo ca. KST quản lực lượng tại site.", "/staff-schedule", 12_000);

  await gotoStep(page, role, 14, T, "Nhập chỉ số tháng — Mỗi tháng KST cùng tổ kỹ thuật đi đọc chỉ số điện/nước từng unit để tính phí.", "/meter-readings");
  await gotoStep(page, role, 15, T, "Form nhập chỉ số — Unit A-1201, kỳ 2024-03: nước cũ 145m³, mới 162m³ (dùng 17m³), điện cũ 2340kWh, mới 2512kWh (dùng 172kWh). Tự tính tiền.", "/meter-readings", 13_000);

  await gotoStep(page, role, 16, T, "Phiếu hỗ trợ — Ticket nội bộ: KST yêu cầu mua vật tư, đề xuất sửa chữa lớn, báo cáo sự cố.", "/ticket", 11_000);

  await gotoStep(page, role, 17, T, "Công việc nội bộ — Task list của KST: kiểm tra hệ thống điện, đi tour kiểm tra block A, họp với vendor.", "/middle_work", 11_000);

  await gotoStep(page, role, 18, T, "NCC danh sách — KST chọn vendor phù hợp khi tạo SR/maintenance plan. Xem trước rating + năng lực.", "/vendors", 11_000);

  await gotoStep(page, role, 19, T, "HĐ NCC — KST đọc HĐ master để biết SLA, đơn giá per-task, scope. Quan trọng khi nghiệm thu.", "/vendor-contracts", 11_000);

  await gotoStep(page, role, 20, T, "Hóa đơn NCC — Sau khi nghiệm thu hiện trường, vendor gửi invoice. KST xác nhận biên bản nghiệm thu (1 trong 3 nhánh 3-way match).", "/vendor-invoices", 12_000);

  await gotoStep(page, role, 21, T, "Báo cáo SR — Tỷ lệ SR resolved < 24h, SR còn pending, vendor SLA met. KPI vận hành kỹ thuật.", "/reports", 12_000);

  await gotoStep(page, role, 22, T, "Cài đặt — KST cấu hình rule auto-assign vendor theo category, escalation timeline cho SR ưu tiên cao.", "/setting", 10_000);

  await gotoStep(page, role, 23, T, "Trở về SR list — Kết thúc ca làm, KST review: SR đã xử lý, SR còn lại bàn giao ca sau.", "/service-requests", 11_000);

  await injectOverlay(page, role, 24, T, "Tổng kết Role KST — Quyền: full module Vận hành & Kỹ thuật. Mục tiêu: SR resolved < 24h, vendor SLA ≥ 95%, không để cư dân chờ lâu.");
  await page.waitForTimeout(13_000);
});
