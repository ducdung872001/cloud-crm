/**
 * Role 4 — Admin HQ FitPro (Reborn JSC)
 * Cấu hình chuẩn quốc gia cho cả mạng — pricing, SOP, onboarding, audit toàn mạng.
 */
import { createRoleRecorder } from "./_lib/recorder.mjs";

const r = await createRoleRecorder({ role: "admin", title: "Admin HQ FitPro (Reborn JSC)" });

await r.step({
  url: "/dashboard",
  name: "hq-overview",
  caption: "Admin HQ mở dashboard — banner Dual Cash-Flow nhắc nguyên tắc thép: KHÔNG bao giờ wire HBL commission vào App. Chuẩn chiến lược 2027.",
});

await r.step({
  url: "/ch_tenant_config",
  name: "tenant-config",
  caption: "Cấu hình tenant FitPro: bật/tắt module theo vertical. Tenant FitPro: bật Network 7×7×7, Journey 90 ngày, Cross-card; tắt Accommodation 24h, Warehouse.",
});

await r.step({
  url: "/ch_membership_plans",
  name: "5tier-config",
  caption: "Cấu hình 5 tier chuẩn quốc gia (80k/140k/260k/315k/500k) — chung cho mọi center. Badge ⚡ Mở Elite (PRO+) và 🩺 Medlatec (VIP+) thể hiện quyền lợi rõ.",
});

await r.step({
  url: "/ch_service_catalog",
  name: "service-catalog",
  caption: "Catalog dịch vụ FitPro — buổi tập + combo dinh dưỡng HBL (Trà NRG, F1 Sport, Hydrate, Rebuild, Xtra-Cal...). Quản lý SKU chuẩn dùng chung mọi trạm.",
});

await r.step({
  url: "/fp_mf7",
  name: "mf7-onboarding",
  caption: "Lộ trình MF7 — đào tạo BO mới 7 ngày về triết lý 7×7×7 (Mastery / Force / Leverage). Ngày 1-3 đã hoàn thành; còn 4 ngày: setup trạm, marketing, lễ tốt nghiệp.",
});

await r.step({
  url: "/fp_mf7",
  name: "mf7-lesson-modal",
  caption: "Bấm 'Bắt đầu' ngày 4 → modal mở: bài học 'Cấu hình trạm Home vs Co-Working'. Video giảng giải 18 phút + workbook in-app + quiz 3 câu.",
  action: async (page) => {
    const btn = await page.$('button:has-text("Bắt đầu")');
    if (btn) await btn.click();
  },
  waitMs: 1500,
});

await r.step({
  url: "/ch_report_revenue",
  name: "national-report",
  caption: "Báo cáo toàn mạng — GMV, member count, retention, NPS, doanh thu/Center, % Elite chuyển từ PRO. Tổng các nhánh N007 trên toàn quốc.",
});

await r.step({
  url: "/fp_commission",
  name: "audit-all-bo",
  caption: "Admin HQ rà toàn bộ ledger HBL các BO upload — 6 entry kỳ 02-04/2026. Cảnh báo những BO có chênh lệch >5% liên tiếp 2 kỳ → review SOP đối soát.",
});

const m = await r.done();
console.log(`\n✅ Admin: ${m.steps.length} steps · video=${m.video || "(none)"}`);
