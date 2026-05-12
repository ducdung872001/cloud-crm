/**
 * Role 2 — Master BO / Founder
 * Mã A007 + vừa đủ N007 (7 Elite F1-F7). Quản lý cả nhánh — wire HBL đối soát zero-touch.
 */
import { createRoleRecorder } from "./_lib/recorder.mjs";

const r = await createRoleRecorder({ role: "master", title: "Master BO / Founder (A007 · N007)" });

await r.step({
  url: "/dashboard",
  name: "dashboard-dual-cashflow",
  caption: "Master BO mở app — banner Dual Cash-Flow nhắc nguyên tắc thép: Luồng 1 (App) vs Luồng 2 (HBL zero-touch). Stat cards click-able đi sâu vào từng phân hệ.",
});

await r.step({
  url: "/fp_network_tree",
  name: "network-7x7x7",
  caption: "Cây mạng lưới 7×7×7. Master mang mã A007 + huy hiệu 🏠 N007 (vừa đủ 7 Elite F1-F7). 7 nhánh trực tiếp + 6 vệ tinh tầng 2 — mỗi BO có mã A### bất biến trọn đời.",
});

await r.step({
  url: "/fp_station_type",
  name: "3-station-models",
  caption: "3 loại trạm Phygital: Home FitPro (H###, 3-7 thảm, CapEx ~0), FitPro CENTER (C###, 10-20 thảm, hub cộng đồng), FitPro INSIDE (I###, plugin cấy vào gym có sẵn — 0đ OpEx).",
});

await r.step({
  url: "/fp_station_type",
  name: "create-home-modal",
  caption: "Wizard tạo Home FitPro: nhập tên, mã, thảm 3–7, ngày khai trương. Sau Save → tự dẫn tới sơ đồ thảm tập (/ch_accommodation) trong 72h.",
  action: async (page) => {
    const btn = await page.$('button:has-text("Tạo trạm loại này")');
    if (btn) await btn.click();
  },
  waitMs: 1500,
});

await r.step({
  url: "/ch_accommodation",
  name: "station-layout",
  caption: "Sơ đồ thảm tập trạm: chiếm/trống/bảo trì theo slot 6-7h / 7-8h / 8-9h. Mỗi mat hiển thị member đang tập và program đang chạy.",
});

await r.step({
  url: "/fp_sop",
  name: "sop-compliance",
  caption: "F6 — Master giám sát 5 trạm downline về vệ sinh, đúng giờ 6-9h, giáo trình chuẩn, feedback KH (1-5⭐). 2 trạm điểm <85 → cần audit đột xuất trong 7 ngày.",
});

await r.step({
  url: "/fp_commission",
  name: "hbl-banner",
  caption: "F8 — Đối soát HBL. Banner ⚖️ 'Nguyên tắc thép' + sơ đồ Dual Cash-Flow zero-touch: KH → HBL → TK cá nhân NPP. App KHÔNG xuất hiện trong chuỗi này.",
});

await r.step({
  url: "/fp_commission",
  name: "hbl-ledger-detail",
  caption: "Click 1 hàng ledger có cảnh báo lệch → modal đối soát chi tiết: HBL chuyển 42tr, NPP khai phân phối 41,2tr → lệch −800k, NPP tự xử lý. App không can thiệp, chỉ cảnh báo.",
  action: async (page) => {
    // Click hàng lệch đầu tiên (L-006: 42tr vs 41,2tr)
    const row = await page.$('table tbody tr:first-child');
    if (row) await row.click();
  },
  waitMs: 1500,
});

await r.step({
  url: "/ch_report_revenue",
  name: "revenue-report",
  caption: "Báo cáo doanh thu toàn nhánh — Master thấy đóng góp từng trạm + tổng thu nhập Luồng 1 SaaS recurring. Tổng N007 (cả nhà): GMV, retention, NPS.",
});

const m = await r.done();
console.log(`\n✅ Master: ${m.steps.length} steps · video=${m.video || "(none)"}`);
