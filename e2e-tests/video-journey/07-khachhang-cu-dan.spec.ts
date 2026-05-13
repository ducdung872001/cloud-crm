import { test } from "@playwright/test";
import { loginAsBanGiamDoc, gotoStep, actionStep, injectOverlay, RoleInfo } from "./_helper";

const role: RoleInfo = {
  index: 7, total: 7,
  shortName: "Khách hàng",
  longName: "Khách hàng / Cư dân (placeholder admin POV)",
  description: "Cư dân dùng App Timi mobile · Đây là góc admin gửi thông báo + xem hồ sơ cư dân",
  color: "eb2f96",
};

test("Role 7/7 — Khách hàng / Cư dân: hành trình E2E (placeholder)", async ({ page }) => {
  test.setTimeout(900_000);
  const T = 24;

  await injectOverlay(page, role, 1, T, "Mở đầu — Cư dân (B2C) + Doanh nghiệp thuê (B2B) + Cơ quan NN (B2G) dùng App Timi MOBILE — KHÔNG đăng nhập CRM web. Video này quay từ góc ADMIN để minh hoạ flow gửi thông báo đến họ.");
  await page.waitForTimeout(13_000);

  await loginAsBanGiamDoc(page);
  await injectOverlay(page, role, 2, T, "Đăng nhập — Vai trò admin (Ban giám đốc) để minh hoạ flow phát hành invoice, thông báo phí, theo dõi cư dân.");
  await page.waitForTimeout(7_000);

  await gotoStep(page, role, 3, T, "Khách hàng / Tenant — Danh sách toàn bộ cư dân + doanh nghiệp thuê + cơ quan NN. Admin xem ai đang thuê unit nào.", "/customer_person");

  await actionStep(page, role, 4, T, "Click 1 cư dân B2C — Trần Văn Hùng, thuê căn A-1201 dự án Vinhomes. Xem profile cư dân.", async (p) => {
    const row = p.locator('text=/Trần Văn Hùng|KH-002/').first();
    if (await row.isVisible().catch(() => false)) await row.click({ force: true });
  });
  await injectOverlay(page, role, 5, T, "Profile cư dân — Thông tin liên hệ, unit thuê, contract, lịch sử thanh toán. Cư dân nhìn thấy thông tin này trên app Timi.");
  await page.waitForTimeout(12_000);

  await gotoStep(page, role, 6, T, "Hóa đơn cư dân — Tháng 03/2024 Trần Văn Hùng nhận hóa đơn 26.2tr (phí thuê + quản lý + điện + nước + parking). Cư dân thấy trên app.", "/billing", 13_000);

  await gotoStep(page, role, 7, T, "Cư dân thanh toán qua app Timi — Mock: cư dân quét VietQR / chọn MSB Pay / Vietcombank / VNPay / MoMo. Tiền vào CRM realtime qua webhook.", "/billing", 12_000);

  await gotoStep(page, role, 8, T, "Lịch sử thanh toán — Mỗi cư dân thấy lịch sử của mình trên app. Admin xem toàn bộ ở trang này để đối soát.", "/payment_history", 12_000);

  await gotoStep(page, role, 9, T, "Công nợ — Tenant nào còn nợ phí thuê + quản lý. Cư dân thấy ‘số nợ còn lại’ trên app + nút thanh toán ngay.", "/debt-management", 12_000);

  await gotoStep(page, role, 10, T, "Thông báo phí & Nhắc nợ — Trang quan trọng nhất cho UX cư dân. Admin tạo chiến dịch gửi: email + Zalo OA + push app Timi.", "/fee-notification");

  await actionStep(page, role, 11, T, "Click ‘Tạo chiến dịch’ — Wizard 4 bước phát hành thông báo phí cho cư dân.", async (p) => {
    const btn = p.locator('button:has-text("Tạo"), button:has-text("Phát hành"), button:has-text("Chiến dịch mới")').first();
    if (await btn.isVisible().catch(() => false)) await btn.click({ force: true });
  });

  await injectOverlay(page, role, 12, T, "Wizard Bước 1 — Chọn template: ‘Thông báo phí kỳ tháng 3/2024’ với placeholder ${tenant_name}, ${invoice_total}, ${due_date}.");
  await page.waitForTimeout(12_000);

  await injectOverlay(page, role, 13, T, "Wizard Bước 2 — Chọn segment: ‘Tất cả cư dân Vinhomes có HĐ active’ hoặc ‘Cư dân overdue T+3 ngày’.");
  await page.waitForTimeout(12_000);

  await injectOverlay(page, role, 14, T, "Wizard Bước 3 — Schedule: gửi T-7 trước hạn (reminder), T-3 (warn), T-1 (final), T+1 (overdue). Multi-channel: email + Zalo + push.");
  await page.waitForTimeout(13_000);

  await injectOverlay(page, role, 15, T, "Wizard Bước 4 — Preview trên: Email (responsive HTML), Zalo OA card, push notification app Timi. Confirm trước khi blast.");
  await page.waitForTimeout(12_000);
  await page.keyboard.press("Escape").catch(() => {});

  await gotoStep(page, role, 16, T, "Notification list — Lịch sử mọi thông báo đã phát hành cho cư dân. Mỗi notification track: sent / delivered / opened / clicked / paid.", "/notification", 12_000);

  await gotoStep(page, role, 17, T, "Yêu cầu Dịch vụ — Cư dân tạo SR qua app Timi (báo hỏng, sửa chữa). Admin xem ở đây để phân công vendor.", "/service-requests", 12_000);

  await gotoStep(page, role, 18, T, "Khiếu nại cư dân — Cư dân không hài lòng tạo complaint qua app. Admin xử lý, escalate nếu cần.", "/complaint-tickets", 12_000);

  await gotoStep(page, role, 19, T, "HĐ thuê — Cư dân xem HĐ của mình trên app Timi: ngày hết hạn, escalation kế tiếp, có thể đề xuất gia hạn.", "/lease-contracts", 12_000);

  await actionStep(page, role, 20, T, "Click HĐ Samsung VN — Doanh nghiệp B2B thuê 5 năm. Cư dân B2B thấy escalation schedule 5%/năm trên app.", async (p) => {
    const row = p.locator('text=/Samsung|HD-THUE-003/').first();
    if (await row.isVisible().catch(() => false)) await row.click({ force: true });
  });
  await page.keyboard.press("Escape").catch(() => {});

  await gotoStep(page, role, 21, T, "B2G Compliance — Cơ quan nhà nước (HC Ba Đình) là 1 dạng ‘khách hàng đặc biệt’. Workflow khác: phải qua kho bạc trước khi thanh toán.", "/b2g-compliance", 12_000);

  await gotoStep(page, role, 22, T, "Audit Log — Mọi tương tác cư dân qua app (login, view invoice, thanh toán, tạo SR) đều log. Bảo vệ quyền lợi cư dân + compliance.", "/audit-log", 12_000);

  await gotoStep(page, role, 23, T, "Quay lại Khách hàng list — Closing: hệ thống coi cư dân là central — mọi data + workflow đều xoay quanh trải nghiệm cư dân.", "/customer_person", 11_000);

  await injectOverlay(page, role, 24, T, "Tổng kết Role Khách hàng — Cư dân KHÔNG đăng nhập CRM web. Họ dùng app Timi mobile để: xem invoice / thanh toán / tạo SR / nhận thông báo / xem HĐ. CRM web là backend cho admin/operations.");
  await page.waitForTimeout(13_000);
});
