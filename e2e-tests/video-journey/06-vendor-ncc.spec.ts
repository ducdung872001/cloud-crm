import { test } from "@playwright/test";
import { loginAsBanGiamDoc, gotoStep, actionStep, injectOverlay, RoleInfo } from "./_helper";

const role: RoleInfo = {
  index: 6, total: 7,
  shortName: "Vendor",
  longName: "Vendor / Nhà cung cấp",
  description: "Vendor Portal · Nhận task · Update tiến độ · Gửi invoice · Track payment",
  color: "faad14",
};

test("Role 6/7 — Vendor / Nhà cung cấp: hành trình E2E", async ({ page }) => {
  test.setTimeout(900_000);
  const T = 24;

  await injectOverlay(page, role, 1, T, "Mở đầu — Vendor/NCC dùng Vendor Portal riêng (KHÔNG vào CRM admin). Họ nhận task, cập nhật tiến độ, gửi invoice, theo dõi thanh toán.");
  await page.waitForTimeout(11_000);

  await loginAsBanGiamDoc(page);
  await injectOverlay(page, role, 2, T, "Đăng nhập — Trong demo này em dùng tài khoản admin để vào trang Preview Vendor Portal. Trong production, vendor có tài khoản riêng + URL portal riêng.");
  await page.waitForTimeout(8_000);

  await gotoStep(page, role, 3, T, "Vendor Portal Preview — Đây là UI mà NCC sẽ thấy. Khác CRM admin: tối giản, chỉ focus vào task của vendor, không cần biết tổng quan hệ thống.", "/vendor-portal-preview");
  await gotoStep(page, role, 4, T, "Dashboard vendor — KPI cá nhân vendor: SR đang xử lý, SR đã hoàn thành, invoice pending, doanh thu kỳ.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 5, T, "Task list — Tất cả SR + maintenance plan đã assigned cho vendor này. Filter: open / in_progress / closed.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 6, T, "Click 1 task SR — Chi tiết: project, unit, mô tả sự cố, deadline, ảnh đính kèm, kỹ thuật viên phía CĐT.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 7, T, "Update tiến độ — Vendor click ‘Đang xử lý’, upload ảnh hiện trường, ghi chú công việc đã làm. Real-time sync về CRM admin.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 8, T, "Maintenance schedule — Kế hoạch bảo trì quarterly/annual đã commit với chủ đầu tư. Vendor lên lịch nhân sự + vật tư.", "/vendor-portal-preview", 11_000);

  await gotoStep(page, role, 9, T, "Submit biên bản nghiệm thu — Sau khi hoàn thành SR, vendor up biên bản (có chữ ký KST phía CĐT). 1 trong 3 nhánh 3-way match.", "/vendor-portal-preview", 13_000);

  await gotoStep(page, role, 10, T, "Vendor contract — Vendor xem HĐ master ký với TNPM: SLA cam kết, đơn giá per-task, kỳ thanh toán, scope dịch vụ.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 11, T, "Tạo invoice — Vendor cuối kỳ tổng hợp các SR đã nghiệm thu, sinh invoice gửi TNPM kế toán.", "/vendor-portal-preview", 11_000);

  await gotoStep(page, role, 12, T, "Đính kèm PO + biên bản — Mỗi line item invoice phải đính HĐ ref + biên bản nghiệm thu. Đầy đủ thì 3-way match auto-pass.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 13, T, "Track invoice status — Sau submit: pending → kế toán approve → BQL approve → Leadership approve (>100tr) → paid. Vendor xem realtime.", "/vendor-portal-preview", 13_000);

  await gotoStep(page, role, 14, T, "Lịch sử thanh toán — Mỗi invoice đã paid hiện rõ: ngày trả, kênh (MSB/Vietcombank), số tham chiếu giao dịch. Vendor đối soát với ngân hàng mình.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 15, T, "KPI Vendor — Rating của mình (Otis 4.8★, KT Việt 4.5★). Vendor biết mình ở vị trí nào trong vendor pool TNPM.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 16, T, "SLA tracking — Tỷ lệ SR resolved trong SLA, thời gian response trung bình. Vendor cần duy trì để giữ HĐ master.", "/vendor-portal-preview", 11_000);

  await gotoStep(page, role, 17, T, "Compliance docs — Vendor upload: GPKD, ATTT, bảo hiểm trách nhiệm, chứng chỉ ngành (PCCC, thang máy...). TNPM verify trước khi ký HĐ.", "/vendor-portal-preview", 12_000);

  await gotoStep(page, role, 18, T, "Notification center — Vendor nhận alert: SR mới assign, invoice approved, deadline sắp đến. Push + email + SMS.", "/vendor-portal-preview", 11_000);

  await gotoStep(page, role, 19, T, "Vendor profile — Update thông tin DN: contact, tax code, account ngân hàng nhận thanh toán, dịch vụ cung cấp.", "/vendor-portal-preview", 12_000);

  // From admin side — show what BQL sees
  await gotoStep(page, role, 20, T, "Phía BQL nhìn vendor — Quay sang góc admin, mở Danh sách NCC để hiểu BQL đánh giá vendor thế nào (rating, blacklist).", "/vendors", 11_000);

  await actionStep(page, role, 21, T, "Click 1 vendor — BQL xem 5-tab vendor master. Vendor portal CHỈ thấy phần dữ liệu của riêng họ, KHÔNG thấy vendor khác.", async (p) => {
    const card = p.locator('text=/Otis|NCC-004/').first();
    if (await card.isVisible().catch(() => false)) await card.click({ force: true });
  });
  await injectOverlay(page, role, 22, T, "5-tab vendor master (admin view) — Thông tin / Hợp đồng / Hóa đơn / Công nợ / Công việc đang làm. Vendor portal là subset của tab này.");
  await page.waitForTimeout(13_000);
  await page.keyboard.press("Escape").catch(() => {});

  await gotoStep(page, role, 23, T, "Quay về Vendor Portal — Vendor logout sau ca làm. Hành trình kết thúc.", "/vendor-portal-preview", 11_000);

  await injectOverlay(page, role, 24, T, "Tổng kết Role Vendor — Quyền: chỉ thấy task + invoice + contract của mình (RLS). KPI: SLA met ≥95%, rating ≥4★, submit invoice đúng kỳ.");
  await page.waitForTimeout(13_000);
});
