/**
 * Role 1 — Khách hàng / Member (90 ngày trải nghiệm)
 * Góc nhìn hội viên: BO chốt gói → check-in trạm → xem chỉ số → đặt Medlatec → gia hạn.
 */
import { createRoleRecorder } from "./_lib/recorder.mjs";

const r = await createRoleRecorder({ role: "customer", title: "Khách hàng / Member (90 ngày)" });

await r.step({
  url: "/dashboard",
  name: "dashboard-dual-cashflow",
  caption: "Khách hàng đăng ký gói qua BO giới thiệu — App ghi nhận dưới Mã A của BO. Banner Dual Cash-Flow xác nhận App chỉ chạm Luồng 1 (SaaS/Direct), Luồng 2 (HBL 37%) là zero-touch.",
});

await r.step({
  url: "/ch_membership_plans",
  name: "5tier-pricing",
  caption: "5 tier chuẩn quốc gia: BASIC 80k → SUPER VIP 500k/buổi. Tier ≥ PRO mở quyền Elite Member; VIP+ đi kèm xét nghiệm Medlatec trước & sau 90 ngày. Badge ⚡ Mở Elite và 🩺 Medlatec hiển thị quyền lợi.",
});

await r.step({
  url: "/ch_checkin",
  name: "checkin-qr",
  caption: "Mỗi sáng 6–9h, hội viên check-in tại bất kỳ trạm FitPro nào (đặc quyền liên thông). Coach quét QR → trừ quota tự động và ghi nhận buổi tập.",
});

await r.step({
  url: "/fp_body_metrics",
  name: "body-metrics-d73",
  caption: "Sau 73/90 ngày: bảng so sánh Baseline (D0) ↔ Hiện tại (D73) ↔ Target (D90). Tiến độ đạt 71% — hệ thống auto-trigger AI Nutrition Engine gợi ý khẩu phần sau check-out.",
});

await r.step({
  url: "/fp_body_metrics",
  name: "medlatec-modal",
  caption: "Bấm 'Đặt lịch Medlatec' → modal đặt lịch xét nghiệm D85 mở ra. Chi phí 0đ (đã trong gói VIP). Notification gửi qua Zalo OA.",
  action: async (page) => {
    const btn = await page.$('button:has-text("Đặt lịch Medlatec")');
    if (btn) await btn.click();
  },
  waitMs: 1200,
});

await r.step({
  url: "/fp_journey",
  name: "90-day-journey",
  caption: "Hành trình 90 ngày — 5 phase: intake → baseline → execution → re-test → outcome. Auto-trigger nhắc gia hạn D-15 (tức D75) và sinh báo cáo outcome D85.",
});

await r.step({
  url: "/fp_cross_card",
  name: "cross-card",
  caption: "Thẻ liên thông cho phép hội viên check-in ở 3 trạm khác nhau trong 30 ngày qua — tiêu chuẩn đồng nhất, trừ quota tự động (bao gồm cả khi đi công tác Đà Nẵng).",
});

const m = await r.done();
console.log(`\n✅ Customer: ${m.steps.length} steps · video=${m.video || "(none)"}`);
