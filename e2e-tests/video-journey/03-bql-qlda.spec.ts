import { test } from "@playwright/test";
import { loginAsBanGiamDoc, gotoStep, actionStep, injectOverlay, RoleInfo } from "./_helper";

const role: RoleInfo = {
  index: 3, total: 7,
  shortName: "BQL/QLDA",
  longName: "BQL / Quản lý Dự án",
  description: "Quản lý 1 site cụ thể · Phê duyệt NCC · Ký HĐ · Nghiệm thu cuối",
  color: "1890ff",
};

test("Role 3/7 — BQL/QLDA: hành trình E2E", async ({ page }) => {
  test.setTimeout(1_200_000);
  const T = 24;

  await injectOverlay(page, role, 1, T, "Mở đầu — BQL/QLDA là người quản lý vận hành tại 1 site cụ thể (1 toà nhà / 1 dự án). Họ là cầu nối giữa CĐT, kế toán, kỹ thuật và NCC.");
  await page.waitForTimeout(11_000);

  await loginAsBanGiamDoc(page);
  await injectOverlay(page, role, 2, T, "Đăng nhập — Vào hệ thống với role BQL/QLDA. Họ chỉ thấy dự án được giao quản lý.");
  await page.waitForTimeout(7_000);

  await gotoStep(page, role, 3, T, "Dashboard — Tổng quan vận hành dự án mình phụ trách: doanh thu kỳ, occupancy, SR đang mở, NCC đang phục vụ.", "/dashboard");

  await gotoStep(page, role, 4, T, "Dự án — Danh sách dự án BQL quản lý. Click vào để xem chi tiết toà nhà / unit / lease contract.", "/projects");
  await actionStep(page, role, 5, T, "Click Vinhomes City Park — Vào chi tiết toà nhà BQL phụ trách.", async (p) => {
    const card = p.locator('text=/Vinhomes City Park|VCITY/').first();
    if (await card.isVisible().catch(() => false)) await card.click({ force: true });
  });

  await gotoStep(page, role, 6, T, "Quản lý Unit — Xem từng căn hộ / mặt bằng. Status: occupied / available. BQL theo dõi để chốt lease mới.", "/units", 12_000);

  await gotoStep(page, role, 7, T, "Khách hàng/Tenant — Danh sách cư dân / doanh nghiệp đang thuê dự án này. BQL chăm sóc trực tiếp.", "/customer_person", 11_000);

  await gotoStep(page, role, 8, T, "HĐ thuê — Quản lý lease contract: ký mới, sửa điều khoản, theo dõi escalation, auto-renew.", "/lease-contracts", 12_000);

  await actionStep(page, role, 9, T, "Mở form Tạo HĐ thuê mới — BQL nhập thông tin tenant, unit, giá thuê, deposit, kỳ thanh toán.", async (p) => {
    const btn = p.locator('button:has-text("Tạo"), button:has-text("Thêm"), button:has-text("+ Thêm")').first();
    if (await btn.isVisible().catch(() => false)) await btn.click({ force: true });
  });
  await injectOverlay(page, role, 10, T, "Form lease contract — Các trường: customer, unit, contractType, rentAmount, depositAmount, paymentTerms, escalationRate, autoRenew.");
  await page.waitForTimeout(11_000);
  await actionStep(page, role, 11, T, "Đóng modal (demo only) — Trong production BQL điền đủ rồi submit qua workflow approval.", async (p) => {
    await p.keyboard.press("Escape");
    await p.locator('button:has-text("Hủy"), button:has-text("Đóng"), .modal-close').first().click({ force: true }).catch(() => {});
  });

  await gotoStep(page, role, 12, T, "HĐ Dịch vụ — Service contract đi kèm lease: phí quản lý, điện, nước, parking, cleaning, security.", "/service-contracts", 12_000);

  await gotoStep(page, role, 13, T, "Danh sách NCC — Vendor pool BQL có thể chọn để phục vụ dự án. 5 NCC: KT Việt, Sạch Đẹp, BV 24/7, Otis VN, PCCC HN.", "/vendors", 12_000);

  await actionStep(page, role, 14, T, "Click NCC Otis VN — Xem chi tiết 5-tab: Thông tin / Hợp đồng / Hóa đơn / Công nợ / Công việc đang làm.", async (p) => {
    const card = p.locator('text=/Otis Elevator|NCC-004/').first();
    if (await card.isVisible().catch(() => false)) await card.click({ force: true });
  });
  await injectOverlay(page, role, 15, T, "Tab Hợp đồng vendor — BQL xem HĐ ký với Otis: SLA, đơn giá per-task, kỳ thanh toán. Rating 4.8★ — vendor chất lượng.");
  await page.waitForTimeout(11_000);
  await page.keyboard.press("Escape").catch(() => {});

  await gotoStep(page, role, 16, T, "HĐ NCC — Danh sách vendor contract đang quản. BQL ký HĐ master với vendor sau khi qua quy trình lựa chọn.", "/vendor-contracts", 11_000);

  await gotoStep(page, role, 17, T, "Đối tác — Partner contractor / operator vận hành. Khác vendor (cung cấp 1 dịch vụ), partner làm operator tổng.", "/partners", 11_000);

  await gotoStep(page, role, 18, T, "HĐ Đối tác — BQL ký HĐ với partner operator (vd thầu phụ quản lý toà nhà). Có commission/bonus.", "/partner-contracts", 11_000);

  await gotoStep(page, role, 19, T, "Yêu cầu Dịch vụ (SR) — BQL approve SR từ cư dân: chỉ định vendor, ưu tiên, deadline. Workflow chuyển sang KST thực thi.", "/service-requests", 12_000);

  await gotoStep(page, role, 20, T, "Phê duyệt vendor invoice — Sau khi KST nghiệm thu, kế toán 3-way match, BQL approve cấp 2/3 trước khi chi trả.", "/vendor-invoices", 12_000);

  await gotoStep(page, role, 21, T, "Khiếu nại cư dân — Theo dõi VOC, đảm bảo trải nghiệm cư dân tại dự án mình quản. Tỷ lệ giải quyết khiếu nại là KPI của BQL.", "/complaint-tickets", 11_000);

  await gotoStep(page, role, 22, T, "Báo cáo dự án — Doanh thu / chi phí / lợi nhuận của dự án mình. BQL báo cáo định kỳ cho CĐT.", "/reports", 12_000);

  await gotoStep(page, role, 23, T, "Trở về Dashboard — Tổng kết: SR đang mở, vendor cần chú ý, lease sắp hết hạn, cư dân chậm trả.", "/dashboard", 11_000);

  await injectOverlay(page, role, 24, T, "Tổng kết Role BQL/QLDA — Quyền: full operations cho dự án được giao. Mục tiêu: ổn định doanh thu, kiểm soát chi phí, giữ tenant, tối ưu vendor.");
  await page.waitForTimeout(13_000);
});
