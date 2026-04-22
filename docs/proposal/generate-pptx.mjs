// Tạo file PPTX đề xuất giải pháp Loyalty v1.1 — chạy: node docs/proposal/generate-pptx.mjs
// Cập nhật 23/04/2026 theo Q&A khảo sát khách hàng (docs/Q&A/QA_FN.xlsx)
import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches
pptx.author = "Reborn JSC";
pptx.company = "Reborn JSC";
pptx.title = "Đề xuất giải pháp Loyalty — Chuỗi siêu thị bán lẻ (v1.1)";

// ═══ THEME ═══════════════════════════════════════════════════════════
const C = {
  primary: "00C9A7",
  primaryDark: "0B2E2A",
  primarySoft: "0D3D38",
  accent: "FF8A3C",
  white: "FFFFFF",
  light: "F5F9F8",
  lighter: "FAFCFB",
  gray: "6B8A85",
  grayLight: "9AB0AC",
  dark: "1A2B28",
  danger: "E85D4B",
  gold: "D69E2E",
  blue: "3B82F6",
  purple: "8B5CF6",
  success: "22C55E",
  border: "D9E0DE",
};

const FONT = "Arial";

function addSlide(pageNum) {
  const s = pptx.addSlide();
  s.background = { fill: C.white };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.primary } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.05, w: 13.33, h: 0.45, fill: { color: C.primaryDark } });
  s.addText("Reborn JSC  |  Đề xuất Loyalty Platform v1.1  |  Confidential", {
    x: 0.5, y: 7.1, w: 10, h: 0.3, fontSize: 8, color: C.grayLight, fontFace: FONT,
  });
  if (pageNum) {
    s.addText(String(pageNum), {
      x: 12.5, y: 7.1, w: 0.6, h: 0.3, fontSize: 8, color: C.primary, align: "right", fontFace: FONT,
    });
  }
  return s;
}

function titleText(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.6, y: opts.y ?? 0.35, w: opts.w ?? 12, h: 0.55,
    fontSize: opts.fontSize ?? 26, bold: true, color: C.primaryDark, fontFace: FONT,
  });
}

function subtitleText(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.6, y: opts.y ?? 0.95, w: opts.w ?? 12, h: 0.35,
    fontSize: 13, color: C.gray, italic: true, fontFace: FONT,
  });
}

function sectionLabel(slide, num, label, y = 0.35) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.6, y, w: 0.7, h: 0.55, fill: { color: C.primary }, rectRadius: 0.08,
  });
  slide.addText(num, {
    x: 0.6, y, w: 0.7, h: 0.55, fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT,
  });
  slide.addText(label, {
    x: 1.45, y, w: 11.5, h: 0.55, fontSize: 26, bold: true, color: C.primaryDark, valign: "middle", fontFace: FONT,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 1: TITLE
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { fill: C.primaryDark };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.primary } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.42, w: 13.33, h: 0.08, fill: { color: C.accent } });

  s.addText("REBORN", {
    x: 0.7, y: 0.5, w: 5, h: 0.5, fontSize: 16, color: C.primary, bold: true, fontFace: FONT, charSpacing: 6,
  });
  s.addText("v1.1  •  23/04/2026", {
    x: 8.5, y: 0.5, w: 4, h: 0.5, fontSize: 11, color: C.grayLight, align: "right", fontFace: FONT,
  });

  s.addText("ĐỀ XUẤT GIẢI PHÁP", {
    x: 0.7, y: 1.8, w: 12, h: 0.5, fontSize: 16, color: C.primary, fontFace: FONT, charSpacing: 4,
  });
  s.addText("Nền tảng Loyalty thống nhất\ncho chuỗi siêu thị bán lẻ", {
    x: 0.7, y: 2.4, w: 12, h: 1.8, fontSize: 40, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.15,
  });

  s.addText("Hợp nhất Goldmem · MS Access · MS Excel · Supporter thành 1 nền tảng", {
    x: 0.7, y: 4.3, w: 12, h: 0.4, fontSize: 14, color: C.accent, fontFace: FONT,
  });
  s.addText("Sẵn sàng mở rộng từ 300 đến 1.500 điểm bán — xử lý 300.000 giao dịch/ngày peak", {
    x: 0.7, y: 4.7, w: 12, h: 0.4, fontSize: 13, color: C.grayLight, fontFace: FONT,
  });

  // 5 KPI boxes
  const kpiY = 5.6;
  const kpis = [
    ["~300", "cửa hàng", C.primary, "→ 1.500 trong 3 năm"],
    ["3 triệu", "hội viên", C.accent, "70-80% có mua"],
    ["150K", "txn/ngày", C.blue, "peak 300K"],
    ["4 → 1", "công cụ", C.gold, "hợp nhất data"],
    ["2", "thương hiệu", C.success, "điểm dùng chéo"],
  ];
  const boxW = 2.3;
  const boxGap = 0.2;
  const totalW = kpis.length * boxW + (kpis.length - 1) * boxGap;
  const startX = (13.33 - totalW) / 2;
  kpis.forEach(([value, label, color, sub], i) => {
    const x = startX + i * (boxW + boxGap);
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: kpiY, w: boxW, h: 1.2, fill: { color: C.primarySoft }, rectRadius: 0.1, line: { color, width: 1.5 },
    });
    s.addText(value, { x, y: kpiY + 0.08, w: boxW, h: 0.45, fontSize: 22, bold: true, color, align: "center", fontFace: FONT });
    s.addText(label, { x, y: kpiY + 0.55, w: boxW, h: 0.3, fontSize: 11, color: C.white, align: "center", fontFace: FONT });
    s.addText(sub, { x, y: kpiY + 0.85, w: boxW, h: 0.3, fontSize: 9, color: C.grayLight, align: "center", fontFace: FONT, italic: true });
  });

  s.addText("Reborn JSC  •  ceo@reborn.vn  •  Confidential", {
    x: 0.7, y: 7.1, w: 12, h: 0.3, fontSize: 10, color: C.grayLight, fontFace: FONT,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 2: AGENDA
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(2);
  titleText(s, "Nội dung trình bày");
  subtitleText(s, "8 phần — tập trung vào bài toán, giải pháp và lộ trình mở rộng 3 năm");

  const items = [
    ["01", "Hiện trạng & Bài toán", "4 công cụ rời rạc, 2 brand độc lập"],
    ["02", "Số liệu khảo sát Q&A", "3M KH, 150K txn/ngày, kế hoạch 1.500 store"],
    ["03", "Giải pháp Reborn Loyalty Platform", "Hợp nhất dữ liệu + tự động hoá"],
    ["04", "Kiến trúc & Công nghệ", "Multi-tenant, scale 300K txn peak"],
    ["05", "Chi tiết 20 tính năng", "Sẵn sàng, cấu hình không code"],
    ["06", "Migration 4 hệ thống + Tích hợp POS", "Goldmem/Access/Excel/Supporter → Reborn"],
    ["07", "Lộ trình 6 tháng + Mở rộng 3 năm", "300 → 800 → 1.500 điểm bán"],
    ["08", "Cam kết SLA + Tại sao chọn Reborn", "500 txn/giây sustained, 99.5% uptime"],
  ];
  items.forEach(([num, title, desc], i) => {
    const y = 1.6 + i * 0.65;
    s.addShape(pptx.ShapeType.roundRect, { x: 1.0, y, w: 0.6, h: 0.5, fill: { color: C.primary }, rectRadius: 0.08 });
    s.addText(num, { x: 1.0, y, w: 0.6, h: 0.5, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT });
    s.addText(title, { x: 1.9, y, w: 5.5, h: 0.5, fontSize: 15, bold: true, color: C.primaryDark, valign: "middle", fontFace: FONT });
    s.addText(desc, { x: 7.5, y, w: 5.5, h: 0.5, fontSize: 12, color: C.gray, italic: true, valign: "middle", fontFace: FONT });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 3: HIỆN TRẠNG — 4 CÔNG CỤ RỜI RẠC
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(3);
  sectionLabel(s, "01", "Hiện trạng — Dữ liệu KHTV rải rác 4 công cụ");

  s.addText("Quý khách đang vận hành song song 4 phần mềm riêng biệt, liên kết thủ công — thiếu công cụ hợp nhất.", {
    x: 0.6, y: 1.0, w: 12, h: 0.4, fontSize: 13, color: C.gray, italic: true, fontFace: FONT,
  });

  // 4 tool boxes
  const tools = [
    { name: "GOLDMEM", role: "Quản lý KHTV", items: ["Đăng ký / sửa thông tin", "Quyền lợi sinh nhật", "Lịch sử mua hàng", "Lịch sử thay đổi"], color: C.blue },
    { name: "MS ACCESS", role: "Tổng hợp quyền lợi", items: ["Danh mục KHTV", "Lịch sử tích luỹ", "Phát sinh quyền lợi", "Thống kê cơ bản"], color: C.purple },
    { name: "MS EXCEL", role: "Dashboard & xử lý", items: ["Bảng tổng hợp KHTV", "Xử lý dữ liệu thủ công", "Dashboard báo cáo", "Biểu đồ phân tích"], color: C.gold },
    { name: "SUPPORTER", role: "Khiếu nại CSKH", items: ["Tên, SĐT khách", "Nội dung khiếu nại", "Mức độ, đơn vị", "Kết quả xử lý"], color: C.danger },
  ];
  const toolW = 2.9;
  const gap = 0.2;
  tools.forEach((t, i) => {
    const x = 0.6 + i * (toolW + gap);
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.6, w: toolW, h: 3.2, fill: { color: C.lighter }, rectRadius: 0.1, line: { color: t.color, width: 2 } });
    s.addShape(pptx.ShapeType.rect, { x, y: 1.6, w: toolW, h: 0.45, fill: { color: t.color } });
    s.addText(t.name, { x, y: 1.6, w: toolW, h: 0.45, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT });
    s.addText(t.role, { x, y: 2.15, w: toolW, h: 0.35, fontSize: 12, italic: true, color: t.color, align: "center", fontFace: FONT });
    t.items.forEach((item, j) => {
      s.addText(`•  ${item}`, { x: x + 0.2, y: 2.55 + j * 0.4, w: toolW - 0.4, h: 0.35, fontSize: 10, color: C.dark, fontFace: FONT });
    });
  });

  // Bottom problem banner
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 5.1, w: 12.13, h: 1.6, fill: { color: "FEF2F2" }, rectRadius: 0.1, line: { color: C.danger, width: 1.5 } });
  s.addText("HỆ QUẢ", { x: 0.9, y: 5.2, w: 2, h: 0.35, fontSize: 12, bold: true, color: C.danger, fontFace: FONT });
  const issues = [
    "Mỗi lần truy vấn 1 KH → tra 3-4 nơi, mất thời gian, dễ sai lệch",
    "Thao tác KHTV chủ yếu thủ công → phụ thuộc kỹ năng nhân sự, không scale được",
    "Khiếu nại ở Supporter tách khỏi profile KH → CSKH không biết khách hạng gì khi tiếp nhận",
    "2 brand loyalty độc lập → cùng 1 người nhận diện riêng, không upsell chéo",
  ];
  issues.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    s.addText(`✗  ${t}`, {
      x: 0.9 + col * 6.0, y: 5.55 + row * 0.5, w: 5.8, h: 0.45,
      fontSize: 11, color: C.dark, fontFace: FONT,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 4: SỐ LIỆU KHẢO SÁT Q&A
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(4);
  sectionLabel(s, "02", "Số liệu khảo sát — Quy mô & Kế hoạch");

  subtitleText(s, "Trích xuất từ Q&A khảo sát khách hàng (docs/Q&A/QA_FN.xlsx)");

  // Left column: Quy mô hiện tại
  s.addText("QUY MÔ HIỆN TẠI (2025)", { x: 0.6, y: 1.4, w: 6, h: 0.4, fontSize: 14, bold: true, color: C.primary, fontFace: FONT });

  const current = [
    ["2", "thương hiệu bán lẻ"],
    ["~300", "cửa hàng / điểm bán"],
    ["3 triệu", "KHTV"],
    ["70–80%", "tỷ lệ KHTV có phát sinh mua"],
    ["~150.000", "giao dịch / ngày trung bình"],
    ["~300.000", "giao dịch / ngày peak (lễ/sale)"],
  ];
  current.forEach(([val, label], i) => {
    const y = 1.9 + i * 0.6;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y, w: 6, h: 0.5, fill: { color: C.light }, rectRadius: 0.06 });
    s.addText(val, { x: 0.8, y, w: 2.2, h: 0.5, fontSize: 16, bold: true, color: C.primary, valign: "middle", fontFace: FONT });
    s.addText(label, { x: 3.0, y, w: 3.5, h: 0.5, fontSize: 12, color: C.dark, valign: "middle", fontFace: FONT });
  });

  // Right column: Kế hoạch mở rộng
  s.addText("KẾ HOẠCH MỞ RỘNG (1–3 NĂM)", { x: 6.9, y: 1.4, w: 6, h: 0.4, fontSize: 14, bold: true, color: C.accent, fontFace: FONT });

  const plan = [
    ["1.000–1.500", "điểm bán / điểm chạm"],
    ["+", "kênh trực tuyến mở rộng"],
    ["+", "liên kết đối tác / hệ sinh thái"],
    ["Thách thức:", "scale hệ thống x5"],
    ["Thách thức:", "thay thế agency marketing ngoài"],
    ["Thách thức:", "ứng dụng CNTT cao hơn trong dịch vụ"],
  ];
  plan.forEach(([val, label], i) => {
    const y = 1.9 + i * 0.6;
    s.addShape(pptx.ShapeType.roundRect, { x: 6.9, y, w: 6, h: 0.5, fill: { color: "FFF7ED" }, rectRadius: 0.06 });
    s.addText(val, { x: 7.1, y, w: 2.2, h: 0.5, fontSize: 14, bold: true, color: C.accent, valign: "middle", fontFace: FONT });
    s.addText(label, { x: 9.3, y, w: 3.5, h: 0.5, fontSize: 12, color: C.dark, valign: "middle", fontFace: FONT });
  });

  // Bottom insight
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 5.8, w: 12.13, h: 0.9, fill: { color: C.primarySoft }, rectRadius: 0.1 });
  s.addText("INSIGHT", { x: 0.9, y: 5.9, w: 1.5, h: 0.3, fontSize: 11, bold: true, color: C.primary, fontFace: FONT });
  s.addText("70-80% KHTV active là rất cao. Bài toán là NÂNG GIÁ TRỊ VÒNG ĐỜI (CLV) + UPSELL CROSS-BRAND — không phải giữ chân. Nền tảng phải sẵn sàng scale x5 trong 3 năm, giải phóng khỏi agency marketing ngoài, tự động hoá để không phụ thuộc kỹ năng nhân sự.", {
    x: 0.9, y: 6.2, w: 11.6, h: 0.5, fontSize: 11, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.3,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 5: GIẢI PHÁP — 7 NGUYÊN TẮC
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(5);
  sectionLabel(s, "03", "Giải pháp: Reborn Loyalty Platform");
  subtitleText(s, "7 nguyên tắc thiết kế — mỗi nguyên tắc giải 1 pain point cụ thể của khách", { y: 1.0 });

  const principles = [
    ["🔗", "Tích hợp, không thay POS", "POS giữ nguyên, chỉ thêm API call sau thanh toán", "Không gián đoạn 150K txn/ngày", C.primary],
    ["⚙️", "Tự động hoá tối đa", "Mọi thao tác KHTV chạy bằng cron + rule engine", "Giải vấn đề thủ công, thiếu kỹ năng NS", C.blue],
    ["🗂️", "Hợp nhất 1 nguồn data", "Goldmem + Access + Excel + Supporter → hồ sơ 360°", "Giải data rải rác, liên kết thủ công", C.purple],
    ["🎛️", "Cấu hình, không code", "Team nghiệp vụ tự đổi rule, campaign, hạng, hạn điểm", "Độc lập với IT/agency", C.gold],
    ["🏢", "Multi-brand + Multi-branch", "Sẵn 2 brand, mở rộng 300 → 1.500 cửa hàng", "Sẵn sàng kế hoạch 3 năm", C.accent],
    ["📡", "API-first", "Mọi tính năng có API — Phòng CNTT&CĐS tự tích hợp", "Tận dụng năng lực IT nội bộ", C.success],
    ["⚡", "Scale 3M KH, 300K peak", "Batch jobs, Redis cache, async queue", "Không nghẽn POS giờ vàng", C.danger],
  ];

  // Layout: 2 rows of 4,3 but we have 7 → 4 + 3 centered
  const cardW = 2.95;
  const cardH = 2.45;
  const gap = 0.15;
  const row1 = principles.slice(0, 4);
  const row2 = principles.slice(4, 7);
  const row1StartX = (13.33 - (4 * cardW + 3 * gap)) / 2;
  const row2StartX = (13.33 - (3 * cardW + 2 * gap)) / 2;

  const drawCard = (p, x, y) => {
    const [icon, title, desc, benefit, color] = p;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: cardW, h: cardH, fill: { color: C.lighter }, rectRadius: 0.1, line: { color: C.border, width: 1 } });
    s.addShape(pptx.ShapeType.rect, { x, y, w: cardW, h: 0.08, fill: { color } });
    s.addText(icon, { x, y: y + 0.15, w: cardW, h: 0.55, fontSize: 26, align: "center", fontFace: FONT });
    s.addText(title, { x: x + 0.1, y: y + 0.75, w: cardW - 0.2, h: 0.4, fontSize: 12, bold: true, color: C.primaryDark, align: "center", fontFace: FONT });
    s.addText(desc, { x: x + 0.15, y: y + 1.2, w: cardW - 0.3, h: 0.7, fontSize: 10, color: C.gray, align: "center", fontFace: FONT, lineSpacingMultiple: 1.3 });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.3, y: y + 1.95, w: cardW - 0.6, h: 0.02, fill: { color: C.border } });
    s.addText(`▶ ${benefit}`, { x: x + 0.15, y: y + 2.0, w: cardW - 0.3, h: 0.4, fontSize: 9, italic: true, color, align: "center", fontFace: FONT });
  };

  row1.forEach((p, i) => drawCard(p, row1StartX + i * (cardW + gap), 1.5));
  row2.forEach((p, i) => drawCard(p, row2StartX + i * (cardW + gap), 4.15));
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 6: KIẾN TRÚC HỆ THỐNG
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(6);
  sectionLabel(s, "04", "Kiến trúc hệ thống");
  subtitleText(s, "Microservice · Multi-tenant · API Gateway · Scale 300K txn/ngày peak", { y: 1.0 });

  // Left: input sources
  const leftBoxes = [
    { label: "POS Brand A\n~150 store", y: 1.6, color: C.gold },
    { label: "POS Brand B\n~150 store", y: 2.7, color: C.gold },
    { label: "Website\ne-commerce", y: 3.8, color: C.blue },
    { label: "Mobile App", y: 4.9, color: C.blue },
  ];
  leftBoxes.forEach(({ label, y, color }) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y, w: 2.3, h: 1.0, fill: { color: C.lighter }, rectRadius: 0.08, line: { color, width: 1.5 } });
    s.addText(label, { x: 0.5, y, w: 2.3, h: 1.0, fontSize: 11, bold: true, color: C.dark, align: "center", valign: "middle", fontFace: FONT });
  });

  // Center platform
  s.addShape(pptx.ShapeType.roundRect, { x: 3.5, y: 1.6, w: 6.3, h: 4.3, fill: { color: C.primarySoft }, rectRadius: 0.12, line: { color: C.primary, width: 2 } });
  s.addText("REBORN LOYALTY PLATFORM", { x: 3.5, y: 1.7, w: 6.3, h: 0.4, fontSize: 13, bold: true, color: C.primary, align: "center", fontFace: FONT });
  s.addText("(Java Spring Boot microservices · MySQL 8 · Redis · RabbitMQ)", { x: 3.5, y: 2.05, w: 6.3, h: 0.3, fontSize: 9, italic: true, color: C.grayLight, align: "center", fontFace: FONT });

  const services = [
    ["Loyalty Engine", "Tích điểm auto"],
    ["Wallet & Points", "Sổ cái, FIFO"],
    ["Tier Management", "Thăng/hạ hạng"],
    ["Rewards", "Đổi thưởng"],
    ["CSKH", "Khiếu nại"],
    ["Marketing Auto", "Email/SMS/Zalo"],
    ["Webhook", "Real-time"],
    ["Admin Dashboard", "Báo cáo"],
  ];
  const svcW = 1.4;
  const svcH = 0.8;
  services.forEach((svc, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 3.7 + col * (svcW + 0.08);
    const y = 2.5 + row * (svcH + 0.2);
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: svcW, h: svcH, fill: { color: C.white }, rectRadius: 0.06, line: { color: C.primary, width: 1 } });
    s.addText(svc[0], { x, y: y + 0.08, w: svcW, h: 0.3, fontSize: 10, bold: true, color: C.primaryDark, align: "center", fontFace: FONT });
    s.addText(svc[1], { x, y: y + 0.4, w: svcW, h: 0.3, fontSize: 8, italic: true, color: C.gray, align: "center", fontFace: FONT });
  });

  // Data Hub
  s.addShape(pptx.ShapeType.roundRect, { x: 3.7, y: 4.7, w: 5.9, h: 1.1, fill: { color: C.primary }, rectRadius: 0.08 });
  s.addText("DATA HUB — 3M+ hội viên, merge cross-brand, 360° profile", { x: 3.7, y: 4.7, w: 5.9, h: 0.4, fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT });
  s.addText("Tích hợp từ Goldmem · MS Access · MS Excel · Supporter qua ETL", { x: 3.7, y: 5.1, w: 5.9, h: 0.6, fontSize: 9, italic: true, color: C.lighter, align: "center", fontFace: FONT });

  // Right: outputs
  const rightBoxes = [
    { label: "Admin\nDashboard", y: 1.6, color: C.purple },
    { label: "Báo cáo\n& Phân tích", y: 2.7, color: C.purple },
    { label: "API cho\nđối tác", y: 3.8, color: C.success },
    { label: "Webhook\nrealtime", y: 4.9, color: C.success },
  ];
  rightBoxes.forEach(({ label, y, color }) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 10.5, y, w: 2.3, h: 1.0, fill: { color: C.lighter }, rectRadius: 0.08, line: { color, width: 1.5 } });
    s.addText(label, { x: 10.5, y, w: 2.3, h: 1.0, fontSize: 11, bold: true, color: C.dark, align: "center", valign: "middle", fontFace: FONT });
  });

  // Arrows
  ["API"].forEach(() => {
    [2.1, 3.2, 4.3, 5.4].forEach((y) => {
      s.addText("→", { x: 2.8, y, w: 0.7, h: 0.4, fontSize: 18, bold: true, color: C.primary, align: "center", fontFace: FONT });
      s.addText("→", { x: 9.8, y, w: 0.7, h: 0.4, fontSize: 18, bold: true, color: C.primary, align: "center", fontFace: FONT });
    });
  });

  // Footer stack
  s.addText("SLA: API P95 < 500ms · 500 txn/giây sustained · 99.5% uptime", {
    x: 0.5, y: 6.2, w: 12.3, h: 0.3, fontSize: 11, bold: true, color: C.primary, align: "center", fontFace: FONT,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 7 + 8: 20 TÍNH NĂNG
// ═══════════════════════════════════════════════════════════════════════
function featureCard(slide, x, y, w, h, num, title, desc, color) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: C.lighter }, rectRadius: 0.08, line: { color: C.border, width: 1 } });
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h, fill: { color } });
  slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.2, y: y + 0.1, w: 0.45, h: 0.45, fill: { color } });
  slide.addText(num, { x: x + 0.2, y: y + 0.1, w: 0.45, h: 0.45, fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT });
  slide.addText(title, { x: x + 0.75, y: y + 0.12, w: w - 0.85, h: 0.35, fontSize: 11, bold: true, color: C.primaryDark, fontFace: FONT });
  slide.addText(desc, { x: x + 0.75, y: y + 0.45, w: w - 0.85, h: 0.55, fontSize: 9, color: C.gray, fontFace: FONT, lineSpacingMultiple: 1.3 });
}

{
  const s = addSlide(7);
  sectionLabel(s, "05", "20 tính năng — Phần 1: Hội viên & Tích điểm");
  subtitleText(s, "Tất cả sẵn sàng, deploy là dùng được, cấu hình theo chính sách khách hàng", { y: 1.0 });

  const feats = [
    ["1", "Quản lý hội viên", "Tra cứu 3M+ KH, lọc đa tiêu chí, phân trang tốc độ cao", C.primary],
    ["2", "Thẻ barcode / QR", "Thẻ ảo + in vật lý, scan tại POS nhận diện ngay", C.primary],
    ["3", "Import CSV 3M record", "Upload từ Goldmem, dedupe theo SĐT, merge cross-brand", C.primary],
    ["4", "Hồ sơ KH 360°", "Gộp lịch sử mua + quyền lợi + khiếu nại (từ Supporter)", C.primary],
    ["5", "Tích điểm tự động", "POS gọi API sau thanh toán, tính điểm < 200ms", C.blue],
    ["6", "Rule linh hoạt", "Theo hoá đơn / danh mục / fix cố định, priority phối hợp", C.blue],
    ["7", "Nhân hệ số", "x2 cuối tuần, x3 sinh nhật, x5 campaign — cấu hình UI", C.blue],
    ["8", "Min spend + exclude", "Dưới X đ không tích, SP khuyến mãi loại trừ", C.blue],
    ["9", "4+ hạng thành viên", "Đồng → Bạc → Vàng → Kim Cương, tên & ngưỡng tuỳ chỉnh", C.gold],
    ["10", "Thăng/hạ hạng auto", "Chu kỳ tháng/quý/năm, ân hạn 30 ngày cảnh báo", C.gold],
  ];

  const cols = 2;
  const cardW = 6.0;
  const cardH = 1.05;
  const gapX = 0.15;
  const gapY = 0.1;
  feats.forEach(([num, title, desc, color], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.6 + col * (cardW + gapX);
    const y = 1.5 + row * (cardH + gapY);
    featureCard(s, x, y, cardW, cardH, num, title, desc, color);
  });
}

{
  const s = addSlide(8);
  sectionLabel(s, "05", "20 tính năng — Phần 2: Marketing & Vận hành");

  const feats = [
    ["11", "Hạn sử dụng điểm", "3 mode: không hạn / X tháng / cuối năm, FIFO", C.gold],
    ["12", "Thông báo điểm hết hạn", "Nhắc 30/14/7 ngày qua SMS/Email/Push/Zalo OA", C.gold],
    ["13", "Đổi thưởng đa dạng", "Voucher, quà vật lý, dịch vụ, thăng hạng", C.accent],
    ["14", "Tỷ giá điểm → VND", "1 điểm = Xđ, trừ trực tiếp tại POS", C.accent],
    ["15", "Khuyến mãi đa kiểu", "Discount, combo, flash sale, giá cố định", C.accent],
    ["16", "Giới thiệu bạn bè", "Mã referral, thưởng 2 chiều, bảng xếp hạng", C.accent],
    ["17", "Marketing Automation", "Email/SMS/Push/Zalo OA — tự vận hành, thay agency", C.purple],
    ["18", "Phân khúc RFM + CLV", "Segment tự động, target campaign theo nhóm", C.purple],
    ["19", "Dashboard & Báo cáo", "KPI, xu hướng điểm, retention, CLV, export Excel", C.purple],
    ["20", "API Docs + SDK", "7 tab docs tích hợp: auth, member, points, webhook, SDK", C.success],
  ];

  const cols = 2;
  const cardW = 6.0;
  const cardH = 1.05;
  const gapX = 0.15;
  const gapY = 0.1;
  feats.forEach(([num, title, desc, color], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.6 + col * (cardW + gapX);
    const y = 1.5 + row * (cardH + gapY);
    featureCard(s, x, y, cardW, cardH, num, title, desc, color);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 9: MIGRATION 4 HỆ THỐNG
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(9);
  sectionLabel(s, "06", "Migration 4 hệ thống cũ → Reborn Loyalty");
  subtitleText(s, "ETL tự động + dedupe theo SĐT + chạy song song 1 tháng để đối soát", { y: 1.0 });

  // Left: 4 source systems
  const sources = [
    { name: "Goldmem", desc: "KHTV + lịch sử", color: C.blue },
    { name: "MS Access", desc: "quyền lợi", color: C.purple },
    { name: "MS Excel", desc: "dashboard", color: C.gold },
    { name: "Supporter", desc: "khiếu nại", color: C.danger },
  ];
  sources.forEach((src, i) => {
    const y = 1.7 + i * 0.9;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y, w: 2.6, h: 0.75, fill: { color: C.lighter }, rectRadius: 0.08, line: { color: src.color, width: 1.5 } });
    s.addText(src.name, { x: 0.7, y: y + 0.05, w: 2.4, h: 0.35, fontSize: 13, bold: true, color: src.color, fontFace: FONT });
    s.addText(src.desc, { x: 0.7, y: y + 0.38, w: 2.4, h: 0.35, fontSize: 10, italic: true, color: C.gray, fontFace: FONT });
    // Arrow to ETL
    s.addText("→", { x: 3.3, y: y + 0.15, w: 0.5, h: 0.45, fontSize: 20, bold: true, color: C.primary, align: "center", fontFace: FONT });
  });

  // Center: ETL pipeline
  s.addShape(pptx.ShapeType.roundRect, { x: 4.0, y: 1.7, w: 3.3, h: 4.35, fill: { color: C.primarySoft }, rectRadius: 0.1, line: { color: C.primary, width: 2 } });
  s.addText("ETL + DEDUPE", { x: 4.0, y: 1.85, w: 3.3, h: 0.4, fontSize: 14, bold: true, color: C.primary, align: "center", fontFace: FONT });
  const etlSteps = [
    "1. Export full data 4 nguồn",
    "2. Chuẩn hoá SĐT (E.164)",
    "3. Match profile trùng",
    "4. Preview → Confirm",
    "5. Merge điểm + lịch sử",
    "6. Import vào Reborn",
  ];
  etlSteps.forEach((step, i) => {
    s.addText(step, { x: 4.2, y: 2.4 + i * 0.55, w: 3.0, h: 0.4, fontSize: 11, color: C.white, fontFace: FONT });
  });
  // Arrow to Reborn
  s.addText("→", { x: 7.4, y: 3.7, w: 0.5, h: 0.5, fontSize: 24, bold: true, color: C.primary, align: "center", fontFace: FONT });

  // Right: Reborn Loyalty
  s.addShape(pptx.ShapeType.roundRect, { x: 8.1, y: 1.7, w: 4.7, h: 4.35, fill: { color: "ECFDF5" }, rectRadius: 0.1, line: { color: C.success, width: 2 } });
  s.addText("REBORN LOYALTY", { x: 8.1, y: 1.85, w: 4.7, h: 0.4, fontSize: 14, bold: true, color: C.success, align: "center", fontFace: FONT });
  s.addText("(1 hồ sơ KH 360°)", { x: 8.1, y: 2.25, w: 4.7, h: 0.3, fontSize: 10, italic: true, color: C.gray, align: "center", fontFace: FONT });

  const results = [
    "✓  3M hội viên gộp chung",
    "✓  Lịch sử mua + quyền lợi",
    "✓  Khiếu nại gắn với hồ sơ",
    "✓  Điểm 2 brand merge",
    "✓  Báo cáo thống nhất",
    "✓  Vận hành tự động",
  ];
  results.forEach((r, i) => {
    s.addText(r, { x: 8.3, y: 2.7 + i * 0.5, w: 4.4, h: 0.4, fontSize: 12, color: C.dark, fontFace: FONT });
  });

  // Bottom timeline
  s.addText("Thời gian migration: 4 tuần + chạy song song 4 tuần để đối soát — tổng 2 tháng", {
    x: 0.6, y: 6.3, w: 12.13, h: 0.35, fontSize: 11, bold: true, color: C.accent, align: "center", fontFace: FONT,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 10: TÍCH HỢP POS
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(10);
  sectionLabel(s, "06", "Tích hợp POS — 1 API call sau thanh toán");
  subtitleText(s, "POS giữ nguyên hoàn toàn. Quầy chỉ cần thêm 1 REST call vào cuối quy trình.", { y: 1.0 });

  const steps = [
    ["1", "Khách mua hàng", "POS bán hàng\nbình thường", C.gold],
    ["2", "Thanh toán xong", "POS gọi API\nautoEarn", C.primary],
    ["3", "Reborn tính điểm", "Áp rule + hệ số\n< 200ms", C.blue],
    ["4", "Trả kết quả", "+52 điểm\nSố dư 1,302", C.success],
    ["5", "POS hiển thị", "In receipt\n có điểm tích", C.accent],
  ];
  steps.forEach(([num, title, desc, color], i) => {
    const x = 0.6 + i * 2.55;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.6, w: 2.25, h: 2.5, fill: { color: C.lighter }, rectRadius: 0.1, line: { color, width: 2 } });
    s.addShape(pptx.ShapeType.ellipse, { x: x + 0.8, y: 1.75, w: 0.6, h: 0.6, fill: { color } });
    s.addText(num, { x: x + 0.8, y: 1.75, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT });
    s.addText(title, { x, y: 2.5, w: 2.25, h: 0.4, fontSize: 12, bold: true, color: C.primaryDark, align: "center", fontFace: FONT });
    s.addText(desc, { x, y: 2.95, w: 2.25, h: 0.9, fontSize: 10, color: C.gray, align: "center", fontFace: FONT, lineSpacingMultiple: 1.3 });
    if (i < 4) s.addText("→", { x: x + 2.25, y: 2.5, w: 0.3, h: 0.5, fontSize: 22, bold: true, color: C.primary, align: "center", fontFace: FONT });
  });

  // API snippet
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 4.5, w: 12.13, h: 2.2, fill: { color: "1E293B" }, rectRadius: 0.08 });
  s.addText("VÍ DỤ TÍCH HỢP API", { x: 0.9, y: 4.6, w: 5, h: 0.3, fontSize: 11, bold: true, color: "A7F3D0", fontFace: FONT });
  s.addText(
    'POST /bizapi/market/loyaltyPointLedger/autoEarn\n' +
    'Content-Type: application/json\n' +
    'Authorization: Bearer <API_KEY>\n\n' +
    '{ "phone": "0901234567", "orderAmount": 520000, "orderId": "INV-001", "branchId": 15 }\n\n' +
    '→ { "code": 0, "result": { "pointsEarned": 52, "newBalance": 1302, "tier": "Bạc", "upgraded": false } }',
    { x: 0.9, y: 4.95, w: 11.5, h: 1.7, fontSize: 11, color: "A7F3D0", fontFace: "Consolas", lineSpacingMultiple: 1.3 }
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 11: LỘ TRÌNH 6 THÁNG
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(11);
  sectionLabel(s, "07", "Lộ trình triển khai — 6 tháng");

  const phases = [
    {
      label: "Phase 1 — Nền tảng & Migration",
      months: "Tháng 1-2",
      items: [
        "T1-2: Khảo sát Goldmem/Access/Excel/Supporter",
        "T3: ETL + dedupe 3M KHTV",
        "T4: Deploy Reborn, import hội viên",
        "T5-6: Cấu hình rule điểm/hạng/hạn",
        "T7-8: Pilot POS Brand A (5-10 store)",
      ],
      color: C.primary,
      x: 0.6,
    },
    {
      label: "Phase 2 — Rollout & Cutover",
      months: "Tháng 3-4",
      items: [
        "T9-10: Chạy song song, đối soát",
        "T11: Tích hợp POS Brand B, 50 store",
        "T12: Rollout 100 store tiếp",
        "T13: Rollout đủ ~300 store",
        "T14: Bật cross-brand points",
        "T15-16: Training + UAT + tắt hệ cũ",
      ],
      color: C.blue,
      x: 4.75,
    },
    {
      label: "Phase 3 — Marketing Auto & Tối ưu",
      months: "Tháng 5-6",
      items: [
        "T17-18: Bật Email/SMS/Zalo OA",
        "T19: Tích hợp web + mobile app",
        "T20: Chuyển Supporter → CSKH module",
        "T21-22: RFM, CLV, churn prediction",
        "T23: Training campaign automation",
        "T24: Bàn giao + SLA hậu mãi",
      ],
      color: C.success,
      x: 8.9,
    },
  ];
  const phaseW = 4.0;
  phases.forEach(({ label, months, items, color, x }) => {
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.5, w: phaseW, h: 0.65, fill: { color }, rectRadius: 0.08 });
    s.addText(label, { x, y: 1.5, w: phaseW, h: 0.4, fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle", fontFace: FONT });
    s.addText(months, { x, y: 1.85, w: phaseW, h: 0.3, fontSize: 10, color: C.lighter, align: "center", italic: true, fontFace: FONT });

    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.25, w: phaseW, h: 3.5, fill: { color: C.lighter }, rectRadius: 0.08, line: { color: C.border, width: 1 } });
    items.forEach((item, i) => {
      s.addText(`•  ${item}`, { x: x + 0.15, y: 2.4 + i * 0.54, w: phaseW - 0.3, h: 0.5, fontSize: 10, color: C.dark, fontFace: FONT, lineSpacingMultiple: 1.2 });
    });
  });

  // Milestones
  s.addText("MILESTONES", { x: 0.6, y: 5.95, w: 12, h: 0.35, fontSize: 13, bold: true, color: C.primaryDark, fontFace: FONT });

  const milestones = [
    ["Cuối T2", "Pilot Brand A live, admin dashboard hoạt động, migration 3M KH xong"],
    ["Cuối T4", "~300 store chạy loyalty thống nhất, Goldmem/Access/Excel/Supporter về chế độ archive"],
    ["Cuối T6", "Marketing automation nội bộ chạy, Phòng CNTT&CĐS vận hành 100%"],
  ];
  milestones.forEach(([m, d], i) => {
    const y = 6.3 + i * 0.3;
    s.addShape(pptx.ShapeType.ellipse, { x: 0.7, y: y + 0.05, w: 0.2, h: 0.2, fill: { color: C.primary } });
    s.addText(m, { x: 1.0, y, w: 1.3, h: 0.3, fontSize: 10, bold: true, color: C.primaryDark, fontFace: FONT });
    s.addText(d, { x: 2.3, y, w: 10.5, h: 0.3, fontSize: 10, color: C.dark, fontFace: FONT });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 12: MỞ RỘNG 3 NĂM
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(12);
  sectionLabel(s, "07", "Lộ trình mở rộng 3 năm — sẵn sàng đồng hành");
  subtitleText(s, "Kiến trúc multi-tenant + multi-branch từ đầu — thêm store không cần deploy lại", { y: 1.0 });

  const years = [
    { label: "NĂM 1", sub: "Vận hành ổn định", stores: "~300", icon: "🏪", color: C.primary, items: [
      "Baseline: chạy ổn định 300 cửa hàng, 3M KH",
      "Tối ưu rule điểm/hạng theo dữ liệu thực",
      "A/B test campaign marketing automation",
      "Đo CLV, RFM để phân khúc chính xác hơn",
    ]},
    { label: "NĂM 2", sub: "Mở rộng", stores: "500-800", icon: "📈", color: C.blue, items: [
      "Mở rộng đến 500-800 điểm bán",
      "Tự động hoá onboarding cửa hàng mới",
      "Mở API public cho đối tác đầu tiên",
      "Tích hợp ví điện tử / payment gateway",
    ]},
    { label: "NĂM 3", sub: "Hệ sinh thái", stores: "1.000-1.500", icon: "🌐", color: C.accent, items: [
      "Đạt quy mô 1.000-1.500 điểm bán mục tiêu",
      "Tích hợp sâu hệ sinh thái (đối tác, thương mại online)",
      "Cross-sell qua API với các nền tảng bên ngoài",
      "Mở rộng kênh: app, mini-app, social commerce",
    ]},
  ];

  const yearW = 4.0;
  years.forEach((y, i) => {
    const x = 0.6 + i * (yearW + 0.15);

    // Header
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.5, w: yearW, h: 1.3, fill: { color: y.color }, rectRadius: 0.12 });
    s.addText(y.icon, { x, y: 1.55, w: yearW, h: 0.45, fontSize: 24, align: "center", fontFace: FONT });
    s.addText(y.label, { x, y: 2.05, w: yearW, h: 0.35, fontSize: 16, bold: true, color: C.white, align: "center", fontFace: FONT });
    s.addText(`${y.stores} store — ${y.sub}`, { x, y: 2.45, w: yearW, h: 0.3, fontSize: 11, color: C.lighter, align: "center", italic: true, fontFace: FONT });

    // Body
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.9, w: yearW, h: 3.5, fill: { color: C.lighter }, rectRadius: 0.08, line: { color: y.color, width: 1 } });
    y.items.forEach((item, j) => {
      s.addText(`▶  ${item}`, {
        x: x + 0.15, y: 3.05 + j * 0.75, w: yearW - 0.3, h: 0.65,
        fontSize: 11, color: C.dark, fontFace: FONT, valign: "top", lineSpacingMultiple: 1.3,
      });
    });
  });

  // Growth chart-like bar
  s.addText("300", { x: 1.5, y: 6.55, w: 2, h: 0.3, fontSize: 14, bold: true, color: C.primary, align: "center", fontFace: FONT });
  s.addText("●————————●————————●", { x: 2.0, y: 6.55, w: 9, h: 0.3, fontSize: 14, color: C.gray, align: "center", fontFace: FONT });
  s.addText("1.500", { x: 10.8, y: 6.55, w: 1.5, h: 0.3, fontSize: 14, bold: true, color: C.accent, align: "center", fontFace: FONT });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 13: CAM KẾT SLA
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(13);
  sectionLabel(s, "08", "Cam kết SLA — căn cứ số liệu thực tế");
  subtitleText(s, "Mọi chỉ số dưới đây đã tính dự phòng 2-3 lần peak (300K giao dịch/ngày)", { y: 1.0 });

  const slas = [
    ["99.5%", "Uptime", "Không tính bảo trì planned", C.primary],
    ["< 500ms", "API P95", "Toàn bộ endpoint tra cứu + ghi", C.blue],
    ["< 200ms", "Tính điểm", "Per transaction autoEarn", C.success],
    ["≥ 500 txn/s", "Tải chịu đựng", "Sustained, đã test load", C.accent],
    ["< 2 giờ", "Import 3M", "Batch migration KHTV", C.purple],
    ["< 3 giờ", "Cron hết hạn", "Chạy hằng đêm, 3M wallet", C.gold],
    ["< 30 phút", "Sự cố P1", "Response 24/7", C.danger],
    ["< 2 giờ", "Support khác", "Giờ hành chính", C.gray],
  ];

  const cardW = 2.95;
  const cardH = 1.6;
  const cols = 4;
  slas.forEach(([value, label, desc, color], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.6 + col * (cardW + 0.15);
    const y = 1.55 + row * (cardH + 0.2);
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: cardW, h: cardH, fill: { color: C.lighter }, rectRadius: 0.1, line: { color, width: 1.5 } });
    s.addText(value, { x, y: y + 0.15, w: cardW, h: 0.5, fontSize: 22, bold: true, color, align: "center", fontFace: FONT });
    s.addText(label, { x, y: y + 0.7, w: cardW, h: 0.35, fontSize: 13, bold: true, color: C.primaryDark, align: "center", fontFace: FONT });
    s.addText(desc, { x, y: y + 1.1, w: cardW, h: 0.4, fontSize: 10, italic: true, color: C.gray, align: "center", fontFace: FONT });
  });

  // Bottom commitments
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 5.1, w: 12.13, h: 1.6, fill: { color: C.primarySoft }, rectRadius: 0.1 });
  s.addText("CAM KẾT HẬU TRIỂN KHAI", { x: 0.85, y: 5.2, w: 5, h: 0.35, fontSize: 12, bold: true, color: C.primary, fontFace: FONT });

  const commits = [
    "✓  6 tháng bảo hành miễn phí sau nghiệm thu",
    "✓  Hỗ trợ kỹ thuật Zalo/Email giờ hành chính",
    "✓  Training 2 buổi: admin + API integration",
    "✓  Khách sở hữu toàn bộ data — export bất kỳ lúc nào",
    "✓  Tài liệu đầy đủ: SA, URD, User Guide, API, Test Cases",
    "✓  Đồng hành 3 năm, sẵn sàng scale 1.500 store",
  ];
  commits.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    s.addText(c, {
      x: 0.9 + col * 6.0, y: 5.55 + row * 0.35, w: 5.8, h: 0.35,
      fontSize: 11, color: C.white, fontFace: FONT,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 14: TẠI SAO CHỌN REBORN
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(14);
  sectionLabel(s, "08", "Tại sao chọn Reborn?");

  const reasons = [
    ["🎯", "Giải chính xác bài toán của quý khách", "Không phải platform generic — thiết kế cho chuỗi siêu thị 2 brand, 3M KH, Goldmem/Access/Excel/Supporter. Đọc kỹ Q&A khảo sát để ra solution này.", C.primary],
    ["🚀", "Có sẵn — deploy nhanh 8 tuần", "20 tính năng loyalty đã xây dựng, không code lại từ đầu. Pilot Brand A chạy trong 2 tháng đầu.", C.blue],
    ["🔗", "Tích hợp, không phá vỡ", "POS hiện tại giữ nguyên — chỉ thêm 1 API call. Không gián đoạn 150K giao dịch/ngày.", C.accent],
    ["📈", "Sẵn sàng cho kế hoạch 3 năm", "Multi-tenant + multi-branch từ thiết kế. Scale 300 → 1.500 store không cần re-architect.", C.purple],
    ["🛠️", "Giải phóng khỏi agency marketing", "Marketing automation nội bộ (Email/SMS/Push/Zalo OA) — khách chủ động chiến dịch, phân khúc, kịch bản.", C.success],
    ["📊", "Tài liệu + SLA chuyên nghiệp", "SA, URD, User Guide, Test Cases 51 bộ 895+ steps. SLA rõ ràng, hậu mãi 6 tháng.", C.gold],
  ];

  const cardW = 6.0;
  const cardH = 1.7;
  reasons.forEach(([icon, title, desc, color], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * (cardW + 0.15);
    const y = 1.5 + row * (cardH + 0.15);
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: cardW, h: cardH, fill: { color: C.lighter }, rectRadius: 0.1 });
    s.addShape(pptx.ShapeType.rect, { x, y, w: 0.1, h: cardH, fill: { color } });
    s.addText(icon, { x: x + 0.25, y: y + 0.15, w: 0.8, h: 0.8, fontSize: 28, align: "center", fontFace: FONT });
    s.addText(title, { x: x + 1.1, y: y + 0.15, w: cardW - 1.2, h: 0.45, fontSize: 13, bold: true, color: C.primaryDark, fontFace: FONT });
    s.addText(desc, { x: x + 1.1, y: y + 0.6, w: cardW - 1.2, h: 1.0, fontSize: 10.5, color: C.gray, fontFace: FONT, lineSpacingMultiple: 1.35, valign: "top" });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 15: ĐỐI CHIẾU Q&A
// ═══════════════════════════════════════════════════════════════════════
{
  const s = addSlide(15);
  sectionLabel(s, "📋", "Đối chiếu 10 câu Q&A khảo sát của quý khách", 0.35);
  subtitleText(s, "Phụ lục — chứng minh đề xuất bám sát từng nội dung khảo sát", { y: 1.0 });

  // Compact table
  const rows = [
    ["1", "Hệ thống đang dùng?", "Goldmem, Access, Excel, Supporter", "§ Migration 4 hệ thống"],
    ["2", "Data tập trung hay phân tán?", "Rời rạc, liên kết thủ công", "§ Hợp nhất 1 nguồn + Tự động hoá"],
    ["3", "CRM/loyalty hiện tại?", "Có, nhưng data rải rác, CNTT chưa cao", "§ Cấu hình không code + Marketing Auto"],
    ["4", "API / real-time?", "Có, tuỳ chức năng", "§ API-first + Webhook realtime"],
    ["5", "Số KH và giao dịch?", "3M KH, 150K txn/ngày", "§ SLA 200ms/txn, import 3M < 2h"],
    ["6", "Peak sale/lễ?", "Gấp đôi (300K txn/ngày)", "§ SLA 500 txn/giây sustained"],
    ["7", "POS real-time / batch?", "Phòng CNTT&CĐS nắm", "§ Hỗ trợ cả 2 mode, chờ xác nhận"],
    ["8", "Marketing automation?", "Thuê agency ngoài", "§ Marketing Auto nội bộ Phase 3"],
    ["9", "Hạ tầng on-prem/cloud?", "Phòng CNTT&CĐS nắm", "§ 3 phương án Cloud/On-prem/Hybrid"],
    ["10", "Kế hoạch 1-3 năm?", "1.000-1.500 điểm bán", "§ Multi-tenant + Lộ trình 3 năm"],
  ];

  // Header
  const headerY = 1.5;
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: headerY, w: 12.13, h: 0.35, fill: { color: C.primaryDark } });
  s.addText("#", { x: 0.7, y: headerY, w: 0.4, h: 0.35, fontSize: 10, bold: true, color: C.white, valign: "middle", fontFace: FONT });
  s.addText("Câu hỏi khảo sát", { x: 1.2, y: headerY, w: 3.3, h: 0.35, fontSize: 10, bold: true, color: C.white, valign: "middle", fontFace: FONT });
  s.addText("Trả lời của quý khách", { x: 4.6, y: headerY, w: 4.0, h: 0.35, fontSize: 10, bold: true, color: C.white, valign: "middle", fontFace: FONT });
  s.addText("Đáp ứng trong đề xuất", { x: 8.7, y: headerY, w: 4.0, h: 0.35, fontSize: 10, bold: true, color: C.primary, valign: "middle", fontFace: FONT });

  rows.forEach((row, i) => {
    const y = headerY + 0.4 + i * 0.5;
    if (i % 2 === 0) {
      s.addShape(pptx.ShapeType.rect, { x: 0.6, y, w: 12.13, h: 0.5, fill: { color: C.light } });
    }
    s.addText(row[0], { x: 0.7, y, w: 0.4, h: 0.5, fontSize: 10, bold: true, color: C.primary, valign: "middle", fontFace: FONT });
    s.addText(row[1], { x: 1.2, y, w: 3.3, h: 0.5, fontSize: 9.5, color: C.dark, valign: "middle", fontFace: FONT });
    s.addText(row[2], { x: 4.6, y, w: 4.0, h: 0.5, fontSize: 9.5, color: C.gray, italic: true, valign: "middle", fontFace: FONT });
    s.addText(row[3], { x: 8.7, y, w: 4.0, h: 0.5, fontSize: 9.5, bold: true, color: C.primaryDark, valign: "middle", fontFace: FONT });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 16: THANK YOU
// ═══════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { fill: C.primaryDark };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.primary } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.42, w: 13.33, h: 0.08, fill: { color: C.accent } });

  s.addText("CẢM ƠN QUÝ KHÁCH!", {
    x: 0.7, y: 1.8, w: 12, h: 1, fontSize: 44, bold: true, color: C.white, align: "center", fontFace: FONT, charSpacing: 3,
  });
  s.addText("Reborn Loyalty Platform — sẵn sàng demo ngay hôm nay", {
    x: 0.7, y: 2.95, w: 12, h: 0.5, fontSize: 18, color: C.primary, align: "center", fontFace: FONT,
  });

  // Next steps box
  s.addShape(pptx.ShapeType.roundRect, { x: 2.5, y: 3.9, w: 8.3, h: 2.1, fill: { color: C.primarySoft }, rectRadius: 0.1, line: { color: C.primary, width: 1.5 } });
  s.addText("BƯỚC TIẾP THEO", { x: 2.5, y: 4.0, w: 8.3, h: 0.35, fontSize: 13, bold: true, color: C.primary, align: "center", fontFace: FONT });
  const nextSteps = [
    "1.  Demo trực tiếp trên môi trường test (sẵn sàng hôm nay)",
    "2.  Làm việc với Phòng CNTT&CĐS để xác nhận POS API + hạ tầng",
    "3.  Export sample data từ Goldmem/Access để POC migration",
    "4.  Ký hợp đồng — khởi động Phase 1 trong 2 tuần",
  ];
  nextSteps.forEach((step, i) => {
    s.addText(step, { x: 3.0, y: 4.4 + i * 0.4, w: 7.3, h: 0.35, fontSize: 12, color: C.white, fontFace: FONT });
  });

  s.addText("📧  ceo@reborn.vn      🌐  reborn.vn      📱  Liên hệ qua Zalo", {
    x: 0.7, y: 6.3, w: 12, h: 0.45, fontSize: 14, color: C.grayLight, align: "center", fontFace: FONT,
  });

  s.addText("REBORN", { x: 5, y: 6.8, w: 3.3, h: 0.4, fontSize: 18, color: C.primary, bold: true, align: "center", fontFace: FONT, charSpacing: 6 });
}

// ═══ GENERATE ═══════════════════════════════════════════════════════════
const outPath = "docs/proposal/Reborn-Loyalty-Proposal.pptx";
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log(`✓ PPTX generated: ${outPath}`);
}).catch((err) => {
  console.error("Failed:", err);
});
