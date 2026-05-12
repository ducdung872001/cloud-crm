/**
 * Role 3 — Coach / Trainer (lễ tân + dạy)
 * Mã A082, trực ca sáng 6-9h tại Trạm Cầu Giấy (C015).
 */
import { createRoleRecorder } from "./_lib/recorder.mjs";

const r = await createRoleRecorder({ role: "coach", title: "Coach / Trainer (lễ tân + dạy 6-9h)" });

await r.step({
  url: "/dashboard",
  name: "morning-dashboard",
  caption: "Coach mở dashboard trước 6h sáng — xem booking ngày: 34 buổi tập đặt trước, doanh thu dự kiến, danh sách KH cần gia hạn để chủ động.",
});

await r.step({
  url: "/create_sale_add",
  name: "pos-reception",
  caption: "Trạm bán (POS lễ tân): chốt gói cho khách mới tới — chọn 1 trong 5 tier (BASIC 80k → SUPER VIP 500k/buổi) hoặc bán lẻ buổi đơn theo nhu cầu.",
  waitMs: 2200,
});

await r.step({
  url: "/ch_checkin",
  name: "checkin-qr-scan",
  caption: "Khách quét QR vào trạm → app trừ quota tự động + ghi nhận buổi tập. Coach thấy ngay member đến đúng giờ hay muộn, slot nào còn trống.",
});

await r.step({
  url: "/ch_accommodation",
  name: "station-mat-layout",
  caption: "Sơ đồ thảm trạm — Coach phân slot 6-7h / 7-8h / 8-9h, kéo thả khách vào mat trống. Trạng thái mat: chiếm/trống/bảo trì update real-time.",
});

await r.step({
  url: "/fp_body_metrics",
  name: "record-session",
  caption: "Sau check-out, Coach ghi lại thời lượng, calo đốt, bài tập đã chạy. AI Nutrition Engine tự gửi gợi ý khẩu phần qua Zalo OA của hội viên trong 5 phút.",
});

await r.step({
  url: "/fp_finder",
  name: "station-finder",
  caption: "Khi khách đi công tác Đà Nẵng/TPHCM, Coach giúp tra trạm FitPro gần nhất → khách vẫn check-in được nhờ thẻ liên thông (tiêu chuẩn đồng nhất).",
});

await r.step({
  url: "/shift_management",
  name: "shift-end",
  caption: "Kết ca 9h: Coach xem doanh thu ca, số buổi đã dạy, ca tới — đối soát tiền mặt + chuyển ca. Coach nhận 80k+/buổi trực tiếp, không KPI ép.",
});

const m = await r.done();
console.log(`\n✅ Coach: ${m.steps.length} steps · video=${m.video || "(none)"}`);
