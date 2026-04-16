// Tạo file PPTX đề xuất giải pháp Loyalty — chạy: node docs/proposal/generate-pptx.mjs
import PptxGenJS from "pptxgenjs";
import { writeFileSync } from "fs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches
pptx.author = "Reborn JSC";
pptx.company = "Reborn JSC";
pptx.title = "Đề xuất giải pháp Loyalty — Chuỗi siêu thị bán lẻ";

// ═══ THEME ═══════════════════════════════════════════════════════════
const C = {
  primary: "00C9A7",
  primaryDark: "0B2E2A",
  accent: "FF8A3C",
  white: "FFFFFF",
  light: "F5F9F8",
  gray: "6B8A85",
  dark: "1A2B28",
  danger: "E85D4B",
  gold: "D69E2E",
  blue: "3B82F6",
  success: "22C55E",
};

function addSlide(opts = {}) {
  const slide = pptx.addSlide();
  if (opts.bg) slide.background = { fill: opts.bg };
  else slide.background = { fill: C.white };
  // Bottom bar
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.05, w: 13.33, h: 0.45, fill: { color: C.primaryDark } });
  slide.addText("Reborn JSC  |  ceo@reborn.vn  |  Confidential", {
    x: 0.5, y: 7.1, w: 12, h: 0.3, fontSize: 8, color: C.gray, fontFace: "Arial",
  });
  return slide;
}

function titleText(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.8, y: opts.y ?? 0.4, w: opts.w ?? 11.5, h: 0.6,
    fontSize: opts.fontSize ?? 28, bold: true, color: opts.color ?? C.primaryDark, fontFace: "Arial",
  });
}

function subtitleText(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.8, y: opts.y ?? 1.1, w: opts.w ?? 11.5, h: 0.4,
    fontSize: 14, color: C.gray, fontFace: "Arial",
  });
}

function bodyText(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.8, y: opts.y ?? 1.8, w: opts.w ?? 11.5, h: opts.h ?? 4.5,
    fontSize: opts.fontSize ?? 13, color: opts.color ?? C.dark, fontFace: "Arial",
    lineSpacingMultiple: 1.4, valign: "top", paraSpaceAfter: 6,
  });
}

function kpiBox(slide, x, y, icon, value, label, color) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.6, h: 1.3, fill: { color: C.light }, rectRadius: 0.1, line: { color, width: 2, dashType: "solid" } });
  slide.addText(icon, { x, y: y + 0.1, w: 2.6, h: 0.5, fontSize: 22, align: "center", fontFace: "Arial" });
  slide.addText(value, { x, y: y + 0.5, w: 2.6, h: 0.4, fontSize: 20, bold: true, color: C.primaryDark, align: "center", fontFace: "Arial" });
  slide.addText(label, { x, y: y + 0.85, w: 2.6, h: 0.3, fontSize: 10, color: C.gray, align: "center", fontFace: "Arial" });
}

function featureRow(slide, y, num, title, desc, status) {
  const statusColor = status === "Sẵn sàng" ? C.success : C.gold;
  slide.addText(num, { x: 0.8, y, w: 0.5, h: 0.35, fontSize: 11, bold: true, color: C.white, fill: { color: C.primary }, align: "center", fontFace: "Arial", rectRadius: 0.05 });
  slide.addText(title, { x: 1.4, y, w: 4, h: 0.35, fontSize: 12, bold: true, color: C.primaryDark, fontFace: "Arial" });
  slide.addText(desc, { x: 5.5, y, w: 5.5, h: 0.35, fontSize: 11, color: C.gray, fontFace: "Arial" });
  slide.addText(status, { x: 11.3, y, w: 1.2, h: 0.35, fontSize: 10, bold: true, color: statusColor, align: "center", fontFace: "Arial" });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 1: Title
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { fill: C.primaryDark };
  // Top accent line
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.primary } });

  s.addText("REBORN", { x: 0.8, y: 0.5, w: 5, h: 0.5, fontSize: 16, color: C.primary, bold: true, fontFace: "Arial", letterSpacing: 5 });

  s.addText("Đề xuất giải pháp", { x: 0.8, y: 2.0, w: 11, h: 0.8, fontSize: 18, color: C.gray, fontFace: "Arial" });
  s.addText("Nền tảng Loyalty\ncho chuỗi siêu thị bán lẻ", {
    x: 0.8, y: 2.6, w: 11, h: 1.8, fontSize: 40, bold: true, color: C.white, fontFace: "Arial", lineSpacingMultiple: 1.2,
  });

  s.addText("Tích hợp — Đa thương hiệu — 3 triệu khách hàng", {
    x: 0.8, y: 4.6, w: 11, h: 0.5, fontSize: 16, color: C.primary, fontFace: "Arial",
  });

  // KPI highlights
  const kpiY = 5.5;
  s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: kpiY, w: 2.5, h: 0.8, fill: { color: "0D3D38" }, rectRadius: 0.08 });
  s.addText("100+ cửa hàng", { x: 0.8, y: kpiY + 0.05, w: 2.5, h: 0.35, fontSize: 16, bold: true, color: C.primary, align: "center", fontFace: "Arial" });
  s.addText("Offline + Online", { x: 0.8, y: kpiY + 0.4, w: 2.5, h: 0.3, fontSize: 10, color: C.gray, align: "center", fontFace: "Arial" });

  s.addShape(pptx.ShapeType.roundRect, { x: 3.6, y: kpiY, w: 2.5, h: 0.8, fill: { color: "0D3D38" }, rectRadius: 0.08 });
  s.addText("3 triệu KH", { x: 3.6, y: kpiY + 0.05, w: 2.5, h: 0.35, fontSize: 16, bold: true, color: C.accent, align: "center", fontFace: "Arial" });
  s.addText("Dữ liệu tập trung", { x: 3.6, y: kpiY + 0.4, w: 2.5, h: 0.3, fontSize: 10, color: C.gray, align: "center", fontFace: "Arial" });

  s.addShape(pptx.ShapeType.roundRect, { x: 6.4, y: kpiY, w: 2.5, h: 0.8, fill: { color: "0D3D38" }, rectRadius: 0.08 });
  s.addText("2 thương hiệu", { x: 6.4, y: kpiY + 0.05, w: 2.5, h: 0.35, fontSize: 16, bold: true, color: C.gold, align: "center", fontFace: "Arial" });
  s.addText("Loyalty thống nhất", { x: 6.4, y: kpiY + 0.4, w: 2.5, h: 0.3, fontSize: 10, color: C.gray, align: "center", fontFace: "Arial" });

  s.addShape(pptx.ShapeType.roundRect, { x: 9.2, y: kpiY, w: 2.5, h: 0.8, fill: { color: "0D3D38" }, rectRadius: 0.08 });
  s.addText("80% retention", { x: 9.2, y: kpiY + 0.05, w: 2.5, h: 0.35, fontSize: 16, bold: true, color: C.success, align: "center", fontFace: "Arial" });
  s.addText("Nâng giá trị KH", { x: 9.2, y: kpiY + 0.4, w: 2.5, h: 0.3, fontSize: 10, color: C.gray, align: "center", fontFace: "Arial" });

  s.addText("Reborn JSC  |  04/2026  |  Confidential", {
    x: 0.8, y: 6.8, w: 11, h: 0.3, fontSize: 10, color: C.gray, fontFace: "Arial",
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 2: Agenda
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "Nội dung trình bày");
  const items = [
    ["01", "Bài toán & Hiện trạng"],
    ["02", "Giải pháp Reborn Loyalty Platform"],
    ["03", "Kiến trúc & Công nghệ"],
    ["04", "Chi tiết tính năng"],
    ["05", "Tích hợp POS hiện có"],
    ["06", "Lộ trình triển khai 6 tháng"],
    ["07", "Tại sao chọn Reborn?"],
  ];
  items.forEach(([num, text], i) => {
    const y = 1.5 + i * 0.7;
    s.addShape(pptx.ShapeType.roundRect, { x: 1.5, y, w: 0.6, h: 0.5, fill: { color: C.primary }, rectRadius: 0.08 });
    s.addText(num, { x: 1.5, y, w: 0.6, h: 0.5, fontSize: 16, bold: true, color: C.white, align: "center", fontFace: "Arial" });
    s.addText(text, { x: 2.4, y, w: 8, h: 0.5, fontSize: 18, color: C.primaryDark, fontFace: "Arial", valign: "middle" });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 3: Bài toán
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "01  Bài toán & Hiện trạng");
  subtitleText(s, "2 brand hoạt động độc lập → dữ liệu rời rạc, trải nghiệm khách hàng không nhất quán");

  // Left: problems
  s.addText("VẤN ĐỀ HIỆN TẠI", { x: 0.8, y: 1.8, w: 5.5, h: 0.4, fontSize: 14, bold: true, color: C.danger, fontFace: "Arial" });
  const problems = [
    "Cùng 1 khách hàng → 2 profile riêng biệt ở 2 brand",
    "Tích điểm ở Brand A, sang Brand B → mất hết",
    "Không có cái nhìn toàn chuỗi về hành vi mua sắm",
    "Muốn chạy campaign cross-brand → không thể",
    "Ban lãnh đạo thiếu data tổng hợp để ra quyết định",
  ];
  problems.forEach((p, i) => {
    s.addText(`✗  ${p}`, { x: 1.0, y: 2.3 + i * 0.55, w: 5.5, h: 0.45, fontSize: 12, color: C.dark, fontFace: "Arial" });
  });

  // Right: desired
  s.addText("MONG MUỐN", { x: 7, y: 1.8, w: 5.5, h: 0.4, fontSize: 14, bold: true, color: C.success, fontFace: "Arial" });
  const desires = [
    "Nền tảng loyalty tích hợp cả 2 brand",
    "Tích điểm tại bất kỳ store nào trong chuỗi",
    "Dashboard tổng hợp 3 triệu hội viên",
    "Giữ POS hiện tại, chỉ thêm lớp loyalty",
    "Team IT tự vận hành sau triển khai",
  ];
  desires.forEach((d, i) => {
    s.addText(`✓  ${d}`, { x: 7.2, y: 2.3 + i * 0.55, w: 5.5, h: 0.45, fontSize: 12, color: C.dark, fontFace: "Arial" });
  });

  // Bottom KPIs
  kpiBox(s, 0.8, 5.3, "🏪", "100+", "Cửa hàng", C.primary);
  kpiBox(s, 3.7, 5.3, "👥", "3M", "Khách hàng", C.accent);
  kpiBox(s, 6.6, 5.3, "🏷️", "2", "Thương hiệu", C.gold);
  kpiBox(s, 9.5, 5.3, "🔄", "80%", "Retention", C.success);
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 4: Giải pháp tổng quan
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "02  Giải pháp: Reborn Loyalty Platform");
  subtitleText(s, "Tích hợp, không thay thế — POS giữ nguyên, loyalty bổ sung qua API");

  // 6 principles
  const principles = [
    ["🔗", "Tích hợp POS", "Kết nối POS hiện có qua REST API\nKhông thay đổi quy trình bán hàng"],
    ["🏷️", "Đa thương hiệu", "1 platform quản lý nhiều brand\nĐiểm dùng chéo hoặc riêng"],
    ["⚡", "Scale 3M+", "Batch processing, async jobs\nImport hàng triệu records"],
    ["🔧", "Cấu hình, không code", "Mọi rule setup trên UI\nTeam IT tự vận hành"],
    ["📡", "API-first", "API docs + SDK sẵn\nWebhook realtime events"],
    ["🔒", "Bảo mật", "JWT + API key, HTTPS\nData isolation per tenant"],
  ];
  principles.forEach(([icon, title, desc], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.8 + col * 4.1;
    const y = 1.8 + row * 2.5;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.8, h: 2.1, fill: { color: C.light }, rectRadius: 0.1, line: { color: "D9E0DE", width: 1 } });
    s.addText(icon, { x, y: y + 0.15, w: 3.8, h: 0.4, fontSize: 24, align: "center", fontFace: "Arial" });
    s.addText(title, { x, y: y + 0.55, w: 3.8, h: 0.35, fontSize: 14, bold: true, color: C.primaryDark, align: "center", fontFace: "Arial" });
    s.addText(desc, { x: x + 0.2, y: y + 1.0, w: 3.4, h: 0.9, fontSize: 11, color: C.gray, align: "center", fontFace: "Arial", lineSpacingMultiple: 1.3 });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 5: Kiến trúc
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "03  Kiến trúc hệ thống");
  subtitleText(s, "Microservice, multi-tenant, API gateway — scale theo nhu cầu");

  // Architecture boxes
  const boxes = [
    { x: 0.5, y: 2, w: 2.5, h: 1.5, label: "Brand A POS\n(giữ nguyên)", color: "FEF3C7", border: C.gold },
    { x: 0.5, y: 4, w: 2.5, h: 1.5, label: "Brand B POS\n(giữ nguyên)", color: "FEF3C7", border: C.gold },
    { x: 4, y: 2, w: 5.3, h: 3.5, label: "", color: C.light, border: C.primary },
    { x: 10, y: 2, w: 2.8, h: 1.5, label: "Admin\nDashboard", color: "DBEAFE", border: C.blue },
    { x: 10, y: 4, w: 2.8, h: 1.5, label: "Website /\nMobile App", color: "DBEAFE", border: C.blue },
  ];
  boxes.forEach(({ x, y, w, h, label, color, border }) => {
    s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color }, rectRadius: 0.1, line: { color: border, width: 2 } });
    if (label) s.addText(label, { x, y, w, h, fontSize: 12, bold: true, color: C.dark, align: "center", valign: "middle", fontFace: "Arial" });
  });

  // Center platform label
  s.addText("REBORN LOYALTY PLATFORM", { x: 4.2, y: 2.1, w: 5, h: 0.4, fontSize: 13, bold: true, color: C.primary, fontFace: "Arial" });
  const services = ["Loyalty Engine", "Wallet & Points", "Tier Management", "Rewards", "Webhook", "Config"];
  services.forEach((svc, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    s.addShape(pptx.ShapeType.roundRect, {
      x: 4.3 + col * 1.65, y: 2.7 + row * 1.3, w: 1.5, h: 1.0,
      fill: { color: C.white }, rectRadius: 0.06, line: { color: C.primary, width: 1 },
    });
    s.addText(svc, { x: 4.3 + col * 1.65, y: 2.7 + row * 1.3, w: 1.5, h: 1.0, fontSize: 10, bold: true, color: C.primaryDark, align: "center", valign: "middle", fontFace: "Arial" });
  });

  // Arrows (text-based)
  s.addText("API ◀──▶", { x: 3, y: 2.5, w: 1, h: 0.3, fontSize: 10, color: C.primary, fontFace: "Arial" });
  s.addText("API ◀──▶", { x: 3, y: 4.5, w: 1, h: 0.3, fontSize: 10, color: C.primary, fontFace: "Arial" });
  s.addText("◀──▶", { x: 9.3, y: 2.5, w: 0.8, h: 0.3, fontSize: 10, color: C.blue, fontFace: "Arial" });
  s.addText("◀──▶", { x: 9.3, y: 4.5, w: 0.8, h: 0.3, fontSize: 10, color: C.blue, fontFace: "Arial" });

  // Tech stack
  s.addText("Tech: React 18 · Java Spring Boot · MySQL 8 · Redis · RabbitMQ", {
    x: 0.8, y: 6.2, w: 11, h: 0.4, fontSize: 11, color: C.gray, fontFace: "Arial",
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 6: Tính năng chính
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "04  Chi tiết tính năng");
  subtitleText(s, "20 tính năng sẵn sàng — cấu hình theo nhu cầu");

  const features = [
    ["1", "Quản lý hội viên", "3M+ hội viên, tra cứu, export Excel"],
    ["2", "Thẻ barcode", "Thẻ ảo + in vật lý, scan tại POS"],
    ["3", "Import CSV", "Import hàng loạt, dedupe by SĐT"],
    ["4", "Tích điểm tự động", "Theo hoá đơn / danh mục / cố định"],
    ["5", "Nhân hệ số", "x2 cuối tuần, x3 sinh nhật"],
    ["6", "4+ hạng thành viên", "Đồng → Bạc → Vàng → Kim Cương"],
    ["7", "Thăng/hạ hạng auto", "Theo chu kỳ tháng/quý/năm"],
    ["8", "Hạn sử dụng điểm", "Cuối năm / sau X tháng / không hạn"],
    ["9", "Multi-brand scope", "Toàn chuỗi / per brand / per region"],
    ["10", "API + Webhook", "REST API + realtime events"],
  ];
  features.forEach(([num, title, desc], i) => {
    featureRow(s, 1.65 + i * 0.5, num, title, desc, "Sẵn sàng");
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 7: Tính năng (tiếp)
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "04  Chi tiết tính năng (tiếp)");

  const features = [
    ["11", "Đổi thưởng", "Voucher, quà tặng, giảm trực tiếp"],
    ["12", "Tỷ giá quy đổi", "1 điểm = Xđ khi thanh toán"],
    ["13", "Khuyến mãi", "Discount, combo, flash sale, giá cố định"],
    ["14", "Dashboard", "KPI, donut chart, CLV, retention"],
    ["15", "Báo cáo", "Revenue, customer, xu hướng điểm"],
    ["16", "Chế độ Loyalty thuần", "Tắt bán hàng/kho → chỉ dùng loyalty"],
    ["17", "API Docs tích hợp", "7 tab: auth, member, points, webhook, SDK"],
    ["18", "POS auto-earn", "Webhook tích điểm từ POS bên ngoài"],
    ["19", "Cross-brand points", "Tích ở A, đổi ở B (bật/tắt)"],
    ["20", "Multi-tenant", "Mỗi brand 1 hostname, data tách biệt"],
  ];
  features.forEach(([num, title, desc], i) => {
    featureRow(s, 1.4 + i * 0.5, num, title, desc, "Sẵn sàng");
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 8: Tích hợp POS
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "05  Tích hợp POS hiện có");
  subtitleText(s, "Không thay đổi POS — chỉ thêm 1 API call sau thanh toán");

  // Flow steps
  const steps = [
    ["1", "Khách mua hàng", "POS bán hàng bình thường", C.gold],
    ["2", "Thanh toán xong", "POS gọi API: autoEarn", C.primary],
    ["3", "Hệ thống tính điểm", "Áp dụng rule + nhân hệ số", C.blue],
    ["4", "Trả kết quả", "+52 điểm, số dư 1,302", C.success],
    ["5", "POS hiển thị", "In receipt có điểm tích", C.accent],
  ];
  steps.forEach(([num, title, desc, color], i) => {
    const x = 0.5 + i * 2.5;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2, w: 2.2, h: 2.5, fill: { color: C.light }, rectRadius: 0.1, line: { color, width: 2 } });
    s.addShape(pptx.ShapeType.ellipse, { x: x + 0.8, y: 2.15, w: 0.6, h: 0.6, fill: { color } });
    s.addText(num, { x: x + 0.8, y: 2.15, w: 0.6, h: 0.6, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Arial" });
    s.addText(title, { x, y: 2.9, w: 2.2, h: 0.4, fontSize: 12, bold: true, color: C.primaryDark, align: "center", fontFace: "Arial" });
    s.addText(desc, { x, y: 3.3, w: 2.2, h: 0.8, fontSize: 10, color: C.gray, align: "center", fontFace: "Arial", lineSpacingMultiple: 1.3 });
    if (i < 4) s.addText("→", { x: x + 2.2, y: 2.8, w: 0.3, h: 0.5, fontSize: 20, color: C.gray, fontFace: "Arial" });
  });

  // API example
  s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 5, w: 11.5, h: 1.6, fill: { color: "1E293B" }, rectRadius: 0.1 });
  s.addText('POST /market/loyaltyPointLedger/autoEarn\n{ "phone": "0901234567", "orderAmount": 520000, "orderId": "INV-001" }\n\n→ { "pointsEarned": 52, "newBalance": 1302, "tier": "Bạc" }', {
    x: 1.0, y: 5.1, w: 11, h: 1.4, fontSize: 11, color: "A7F3D0", fontFace: "Consolas", lineSpacingMultiple: 1.4,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 9: Lộ trình
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "06  Lộ trình triển khai — 6 tháng");

  // Timeline bars
  const phases = [
    { label: "Phase 1: Nền tảng", desc: "Setup, import 3M KH, cấu hình rules\nPilot 5-10 store Brand A", months: "Tháng 1-2", color: C.primary, x: 0.8, w: 4 },
    { label: "Phase 2: Mở rộng", desc: "Tích hợp Brand B, rollout 100+ store\nCross-brand points, campaign đầu tiên", months: "Tháng 3-4", color: C.blue, x: 5, w: 4 },
    { label: "Phase 3: Tối ưu", desc: "Phân tích data, RFM segmentation\nBàn giao, training nâng cao", months: "Tháng 5-6", color: C.success, x: 9.2, w: 3.5 },
  ];
  phases.forEach(({ label, desc, months, color, x, w }) => {
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.8, w, h: 0.6, fill: { color }, rectRadius: 0.08 });
    s.addText(label, { x, y: 1.8, w, h: 0.6, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Arial" });
    s.addText(months, { x, y: 2.5, w, h: 0.3, fontSize: 11, bold: true, color, align: "center", fontFace: "Arial" });
    s.addText(desc, { x, y: 2.9, w, h: 1.0, fontSize: 11, color: C.dark, align: "center", fontFace: "Arial", lineSpacingMultiple: 1.4 });
  });

  // Milestones
  s.addText("MILESTONES", { x: 0.8, y: 4.3, w: 11, h: 0.4, fontSize: 14, bold: true, color: C.primaryDark, fontFace: "Arial" });

  const milestones = [
    ["Tháng 2", "POS Brand A tích điểm thành công, admin dashboard live"],
    ["Tháng 4", "100+ store chạy loyalty thống nhất, cross-brand hoạt động"],
    ["Tháng 6", "Bàn giao hoàn tất, team IT khách tự vận hành 100%"],
  ];
  milestones.forEach(([month, desc], i) => {
    s.addShape(pptx.ShapeType.ellipse, { x: 1.0, y: 4.9 + i * 0.65, w: 0.35, h: 0.35, fill: { color: C.primary } });
    s.addText(month, { x: 1.5, y: 4.85 + i * 0.65, w: 1.5, h: 0.4, fontSize: 12, bold: true, color: C.primaryDark, fontFace: "Arial" });
    s.addText(desc, { x: 3.0, y: 4.85 + i * 0.65, w: 9, h: 0.4, fontSize: 12, color: C.dark, fontFace: "Arial" });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 10: Tại sao chọn Reborn
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide();
  titleText(s, "07  Tại sao chọn Reborn?");

  const reasons = [
    ["🚀", "Có sẵn, deploy nhanh", "Platform đã xây dựng xong — không code từ đầu.\n20 tính năng loyalty sẵn sàng, cấu hình theo nhu cầu."],
    ["🔗", "Tích hợp, không phá vỡ", "Giữ nguyên POS hiện tại — chỉ thêm 1 API call.\nKhông thay đổi quy trình bán hàng."],
    ["🏗️", "Kiến trúc multi-brand native", "Không phải hack thêm — multi-tenant, multi-brand từ thiết kế.\nMỗi brand set rules riêng, điểm dùng chéo linh hoạt."],
    ["📡", "API-first + Docs đầy đủ", "Team IT tự tích hợp với API docs + SDK (cURL, JS, Python).\nWebhook realtime cho mọi sự kiện."],
    ["📊", "Tài liệu chuyên nghiệp", "SA, URD, User Guide, Test Cases, Backend Spec đầy đủ.\n51 bộ test, 895+ test steps."],
    ["💰", "Phù hợp ngân sách", "Dưới 1 tỷ, 6 tháng — scope rõ ràng, không phát sinh.\nTeam IT khách tự vận hành sau bàn giao."],
  ];
  reasons.forEach(([icon, title, desc], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.2;
    const y = 1.5 + row * 1.8;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.8, h: 1.5, fill: { color: C.light }, rectRadius: 0.1 });
    s.addText(icon, { x: x + 0.15, y: y + 0.15, w: 0.7, h: 0.7, fontSize: 28, align: "center", fontFace: "Arial" });
    s.addText(title, { x: x + 0.9, y: y + 0.1, w: 4.7, h: 0.35, fontSize: 14, bold: true, color: C.primaryDark, fontFace: "Arial" });
    s.addText(desc, { x: x + 0.9, y: y + 0.5, w: 4.7, h: 0.9, fontSize: 11, color: C.gray, fontFace: "Arial", lineSpacingMultiple: 1.3 });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 11: Thank you
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { fill: C.primaryDark };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.primary } });

  s.addText("Cảm ơn quý khách!", { x: 0.8, y: 2.2, w: 11.5, h: 1, fontSize: 42, bold: true, color: C.white, align: "center", fontFace: "Arial" });
  s.addText("Reborn Loyalty Platform — sẵn sàng demo", { x: 0.8, y: 3.3, w: 11.5, h: 0.5, fontSize: 18, color: C.primary, align: "center", fontFace: "Arial" });

  s.addText("📧  ceo@reborn.vn\n📱  Liên hệ qua Zalo\n🌐  reborn.vn", {
    x: 4, y: 4.5, w: 5, h: 1.5, fontSize: 16, color: C.white, align: "center", fontFace: "Arial", lineSpacingMultiple: 1.6,
  });

  s.addText("REBORN", { x: 5, y: 6.2, w: 3, h: 0.5, fontSize: 20, color: C.primary, bold: true, align: "center", fontFace: "Arial", letterSpacing: 5 });
}

// ═══ GENERATE ═══════════════════════════════════════════════════════════
const outPath = "docs/proposal/Reborn-Loyalty-Proposal.pptx";
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log(`✓ PPTX generated: ${outPath}`);
}).catch((err) => {
  console.error("Failed:", err);
});
