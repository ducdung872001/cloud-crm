// Tạo file DOCX phân tích tài chính (nội bộ) — chạy: node docs/proposal/bao-gia/generate-phan-tich-docx.mjs
// Nguồn: phan-tich-chi-phi-margin.md
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  Header, Footer, PageNumber, convertInchesToTwip, PageBreak,
  TableLayoutType, HeightRule,
} from "docx";
import { writeFileSync } from "fs";

// ═══ THEME (darker internal look) ═════════════════════════════════════
const C = {
  brandDark: "0B2E2A",
  brandDark2: "0D3D38",
  brandPrimary: "00C9A7",
  brandPrimaryLight: "B9F4E4",
  brandAccent: "FF8A3C",
  sectionBg: "E8F5F2",
  sectionBgSoft: "F5F9F8",
  calloutBg: "FFF7ED",
  calloutBorder: "FF8A3C",
  warningBg: "FEE2E2",
  warningBorder: "B91C1C",
  recommendBg: "ECFDF5",
  recommendBorder: "22C55E",
  tableHeaderBg: "0B2E2A",
  tableHeaderFg: "FFFFFF",
  tableStripe: "F5F9F8",
  tableBorder: "D9E0DE",
  text: "1A2B28",
  textMuted: "6B8A85",
  danger: "B91C1C",
  dangerSoft: "FEE2E2",
  success: "15803D",
  successSoft: "DCFCE7",
  gold: "B45309",
  white: "FFFFFF",
  internal: "6B21A8", // purple — internal indicator
  internalSoft: "EDE9FE",
};

const FONT = "Calibri";

// ═══ LOW-LEVEL HELPERS ═════════════════════════════════════════════════
function run(text, opts = {}) {
  return new TextRun({
    text: String(text ?? ""),
    bold: opts.bold,
    italic: opts.italic,
    color: opts.color || C.text,
    size: opts.size || 22,
    font: opts.font || FONT,
    underline: opts.underline ? {} : undefined,
    allCaps: opts.caps,
    characterSpacing: opts.spacing,
  });
}

function para(runs, opts = {}) {
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [runs],
    alignment: opts.align,
    spacing: { before: opts.before ?? 80, after: opts.after ?? 80, line: opts.line || 300 },
    heading: opts.heading,
    indent: opts.indent,
    pageBreakBefore: opts.pageBreakBefore,
    border: opts.border,
    shading: opts.shading,
    keepNext: opts.keepNext,
  });
}

function h1(text, opts = {}) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 40, color: C.brandDark })],
    spacing: { before: 480, after: 200 },
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: opts.pageBreak,
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: C.brandPrimary, space: 4 } },
  });
}

function h2(text) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 30, color: C.brandDark })],
    spacing: { before: 360, after: 140 },
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
  });
}

function h3(text) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 26, color: C.brandDark2 })],
    spacing: { before: 280, after: 100 },
    heading: HeadingLevel.HEADING_3,
    keepNext: true,
  });
}

function calloutBox(runs, kind = "note") {
  const colors = {
    note: { bg: C.calloutBg, border: C.calloutBorder, label: "💡 LƯU Ý" },
    recommend: { bg: C.recommendBg, border: C.recommendBorder, label: "✅ KHUYẾN NGHỊ" },
    warning: { bg: C.warningBg, border: C.warningBorder, label: "⚠️ CẢNH BÁO" },
    internal: { bg: C.internalSoft, border: C.internal, label: "🔒 NỘI BỘ" },
    highlight: { bg: "FEF3C7", border: C.gold, label: "⭐ ĐIỂM NHẤN" },
  };
  const cfg = colors[kind] || colors.note;
  return new Table({
    rows: [new TableRow({
      children: [new TableCell({
        children: [
          new Paragraph({
            children: [run(cfg.label, { bold: true, size: 18, color: cfg.border, caps: true })],
            spacing: { before: 60, after: 60 },
          }),
          new Paragraph({
            children: Array.isArray(runs) ? runs : [runs],
            spacing: { before: 0, after: 60, line: 280 },
          }),
        ],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: cfg.bg },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: cfg.border },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: cfg.border },
          left: { style: BorderStyle.SINGLE, size: 24, color: cfg.border },
          right: { style: BorderStyle.SINGLE, size: 4, color: cfg.border },
        },
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        width: { size: 9200, type: WidthType.DXA },
      })],
    })],
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });
}

function bullet(text, level = 0, opts = {}) {
  const runs = Array.isArray(text) ? text : [run(text, { size: 22, color: C.text, bold: opts.bold })];
  return new Paragraph({
    children: runs,
    bullet: { level },
    spacing: { before: 40, after: 40, line: 280 },
    indent: { left: convertInchesToTwip(0.35 + level * 0.3) },
  });
}

function spacer(size = 160) {
  return new Paragraph({ children: [run("")], spacing: { before: size, after: size } });
}

// ─── TABLE PRIMITIVES ────────────────────────────────────────────────
function cell(content, opts = {}) {
  const paras = Array.isArray(content) && content[0] instanceof Paragraph
    ? content
    : [new Paragraph({
        children: Array.isArray(content) ? content : [run(content, {
          bold: opts.bold, italic: opts.italic,
          color: opts.color || C.text, size: opts.size || 20,
        })],
        alignment: opts.align || AlignmentType.LEFT,
        spacing: { before: 50, after: 50, line: 260 },
      })];
  return new TableCell({
    children: paras,
    shading: opts.fill ? { type: ShadingType.CLEAR, color: "auto", fill: opts.fill } : undefined,
    verticalAlign: opts.vAlign || "center",
    width: opts.width,
    columnSpan: opts.span,
    borders: opts.borders || {
      top: { style: BorderStyle.SINGLE, size: 4, color: C.tableBorder },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: C.tableBorder },
      left: { style: BorderStyle.SINGLE, size: 4, color: C.tableBorder },
      right: { style: BorderStyle.SINGLE, size: 4, color: C.tableBorder },
    },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}

function buildTable(headers, rows, widths, opts = {}) {
  const colWidths = widths || headers.map(() => Math.floor(9200 / headers.length));
  const rightAlignPredicate = (v) => {
    const s = String(v).replace(/\s/g, "");
    if (/^[\d.,+\-~<≥>%−]+$/.test(s)) return true;
    if (/(VND|triệu|tỷ|tr\/|%|\+\d+|−\d+|năm)/.test(String(v))) return true;
    return false;
  };

  return new Table({
    rows: [
      new TableRow({
        tableHeader: true,
        height: { value: 500, rule: HeightRule.ATLEAST },
        children: headers.map((h, i) => cell(h, {
          bold: true, color: C.tableHeaderFg, fill: C.tableHeaderBg,
          align: AlignmentType.CENTER, size: 20,
          width: { size: colWidths[i], type: WidthType.DXA },
        })),
      }),
      ...rows.map((row, rIdx) =>
        new TableRow({
          children: row.map((v, i) => {
            const cellOpts = { width: { size: colWidths[i], type: WidthType.DXA } };
            if (rIdx % 2 === 1) cellOpts.fill = C.tableStripe;
            // Negative margin → red highlight
            const sv = String(v);
            if (/^−/.test(sv.trim()) || /Margin.*−/.test(sv)) {
              cellOpts.fill = C.dangerSoft;
              cellOpts.color = C.danger;
              cellOpts.bold = true;
            }
            // Positive margin → green
            if (/^\+\d+%/.test(sv.trim()) && i === row.length - 1) {
              cellOpts.fill = C.successSoft;
              cellOpts.color = C.success;
              cellOpts.bold = true;
            }
            // Total/3-year row
            const isTotal = row.some(c => /(Tổng|3-year|3Y|TỔNG)/i.test(String(c)));
            if (isTotal) {
              cellOpts.fill = C.brandPrimaryLight;
              cellOpts.bold = true;
              cellOpts.color = C.brandDark;
            }
            if (i > 0 && rightAlignPredicate(v)) cellOpts.align = AlignmentType.RIGHT;
            if (i === 0 && opts.firstColBold) cellOpts.bold = true;
            return cell(v, cellOpts);
          }),
        })
      ),
    ],
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });
}

// ═══ COVER PAGE ═════════════════════════════════════════════════════════
function buildCoverPage() {
  const topBanner = new Table({
    rows: [new TableRow({
      height: { value: 1400, rule: HeightRule.EXACT },
      children: [new TableCell({
        children: [
          new Paragraph({
            children: [run("R E B O R N", { bold: true, size: 36, color: C.brandPrimary, spacing: 80 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 60 },
          }),
          new Paragraph({
            children: [run("INTERNAL ANALYSIS", { size: 18, color: C.brandAccent, bold: true, spacing: 60 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
          }),
        ],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: C.brandDark },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "auto" },
          bottom: { style: BorderStyle.SINGLE, size: 18, color: C.internal },
          left: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
        },
        width: { size: 9200, type: WidthType.DXA },
        verticalAlign: "center",
      })],
    })],
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });

  return [
    topBanner,
    spacer(400),

    para(run("PHÂN TÍCH TÀI CHÍNH", { bold: true, size: 22, color: C.internal, spacing: 60, caps: true }),
      { align: AlignmentType.CENTER, before: 0, after: 120 }),
    para(run("Loyalty Platform", { bold: true, size: 52, color: C.brandDark }),
      { align: AlignmentType.CENTER, before: 0, after: 40 }),
    para(run("So sánh chi phí tổng thể & Margin", { bold: true, size: 32, color: C.brandDark }),
      { align: AlignmentType.CENTER, before: 0, after: 240 }),

    // Scope box
    spacer(200),
    new Table({
      rows: [
        new TableRow({
          height: { value: 700, rule: HeightRule.ATLEAST },
          children: [
            cell([
              new Paragraph({ children: [run("KHÁCH HÀNG THAM CHIẾU", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("Chuỗi siêu thị 2 brand", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("~300 store · 3M KHTV · 150K txn/ngày", { size: 14, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
            cell([
              new Paragraph({ children: [run("PHIÊN BẢN BÁO GIÁ", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("v1.1 — giảm 20%", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("ưu đãi cạnh tranh thị trường", { size: 14, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
          ],
        }),
        new TableRow({
          height: { value: 700, rule: HeightRule.ATLEAST },
          children: [
            cell([
              new Paragraph({ children: [run("MỤC ĐÍCH", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("BOD ra quyết định pricing", { size: 16, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("So sánh Tự xây ↔ SaaS ↔ Margin", { size: 14, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
            cell([
              new Paragraph({ children: [run("NGÀY LẬP", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("23/04/2026", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("Cập nhật khi thay đổi pricing/tenant", { size: 14, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
          ],
        }),
      ],
      width: { size: 9200, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
    }),

    spacer(400),

    // Internal warning stamp
    new Table({
      rows: [new TableRow({
        height: { value: 900, rule: HeightRule.ATLEAST },
        children: [new TableCell({
          children: [
            new Paragraph({ children: [run("🔒   TÀI LIỆU NỘI BỘ — KHÔNG GỬI KHÁCH HÀNG", { bold: true, size: 22, color: C.white, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 160, after: 80 } }),
            new Paragraph({ children: [run("Chỉ dùng cho Ban lãnh đạo & Team Sales Reborn JSC", { size: 18, italic: true, color: C.internalSoft })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 160 } }),
          ],
          shading: { type: ShadingType.CLEAR, color: "auto", fill: C.internal },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 18, color: C.brandAccent },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: C.internal },
            left: { style: BorderStyle.SINGLE, size: 4, color: C.internal },
            right: { style: BorderStyle.SINGLE, size: 4, color: C.internal },
          },
          width: { size: 9200, type: WidthType.DXA },
        })],
      })],
      width: { size: 9200, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
    }),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ═══ TOC ═══════════════════════════════════════════════════════════════
function buildTOC() {
  const items = [
    ["1", "TÓM TẮT ĐIỀU HÀNH", "3"],
    ["2", "PHƯƠNG ÁN A — TỰ XÂY IN-HOUSE", "4"],
    ["3", "PHƯƠNG ÁN B — MUA REBORN (3 GÓI)", "6"],
    ["4", "CHI PHÍ VẬN HÀNH SAAS — GÓC NHÌN REBORN", "6"],
    ["5", "MARGIN TÍNH TOÁN — THEO GÓI", "8"],
    ["6", "PHÂN TÍCH ĐỘ NHẠY — SỐ TENANT", "10"],
    ["7", "SO SÁNH 3 MÔ HÌNH BÁN", "10"],
    ["8", "ĐỀ XUẤT PRICING CHIẾN LƯỢC", "11"],
    ["9", "KẾT LUẬN SO SÁNH TỔNG THỂ", "12"],
    ["10", "SO SÁNH GIÁ GỐC vs GIẢM 20% — ĐIỂM HÒA VỐN ⭐", "13"],
  ];
  return [
    h1("MỤC LỤC"),
    spacer(120),
    new Table({
      rows: items.map((item) => new TableRow({
        height: { value: 400, rule: HeightRule.ATLEAST },
        children: [
          cell(item[0], {
            bold: true, color: C.internal, align: AlignmentType.CENTER, size: 22,
            width: { size: 700, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.DOTTED, size: 4, color: C.tableBorder }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          }),
          cell(item[1], {
            color: C.brandDark, size: 22, bold: true,
            width: { size: 7500, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.DOTTED, size: 4, color: C.tableBorder }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          }),
          cell(item[2], {
            color: C.textMuted, align: AlignmentType.RIGHT, size: 20,
            width: { size: 1000, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.DOTTED, size: 4, color: C.tableBorder }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          }),
        ],
      })),
      width: { size: 9200, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
    }),
    spacer(480),
    calloutBox([
      run("Tài liệu này trình bày phân tích tổng thể gồm: ", { size: 22 }),
      run("(i) chi phí tự xây so với mua Reborn", { bold: true, size: 22 }),
      run(", ", { size: 22 }),
      run("(ii) cơ cấu chi phí vận hành SaaS của Reborn", { bold: true, size: 22 }),
      run(", ", { size: 22 }),
      run("(iii) margin thực tế sau khi đã giảm 20%", { bold: true, size: 22, color: C.danger }),
      run(", và ", { size: 22 }),
      run("(iv) đề xuất điều chỉnh pricing chiến lược", { bold: true, size: 22 }),
      run(".", { size: 22 }),
    ], "internal"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ═══ CONTENT ════════════════════════════════════════════════════════════
const content = [
  ...buildCoverPage(),
  ...buildTOC(),

  // ═══ 1. EXECUTIVE SUMMARY ═════
  h1("1.  TÓM TẮT ĐIỀU HÀNH"),
  para(run("Bảng dưới đây so sánh 4 phương án từ góc nhìn khách hàng. Margin Reborn được tính chi tiết ở §5.", { italic: true, size: 22, color: C.textMuted }), { after: 160 }),

  h3("1.1.  So sánh chi phí 3 năm cho khách"),
  buildTable(
    ["Phương án", "Chi phí 3 năm", "Thời gian go-live", "Rủi ro"],
    [
      ["Tự xây in-house", "10 – 12 tỷ", "18 – 24 tháng", "Rất cao — delay, scope creep, thiếu exp retail"],
      ["Reborn STARTER", "~1,5 tỷ", "3 – 4 tháng", "Thấp — nhưng chỉ 1 brand, migration thiếu"],
      ["Reborn STANDARD  ⭐", "~2,8 tỷ", "6 tháng", "Thấp — phù hợp nhất bài toán khách"],
      ["Reborn PREMIUM", "~4,3 tỷ", "6 – 8 tháng", "Thấp — full Marketing Auto + ML"],
    ],
    [2400, 1800, 2200, 2800],
    { firstColBold: true }
  ),

  spacer(160),
  h3("1.2.  Margin Reborn — Gói STANDARD (đã giảm 20%)"),
  buildTable(
    ["Chỉ số", "Năm 1", "Năm 2", "Năm 3", "TB 3 năm"],
    [
      ["Doanh thu (triệu VND)", "1.512", "656", "656", "2.824"],
      ["Chi phí Reborn", "1.375", "830", "830", "3.035"],
      ["Lợi nhuận", "+137", "−174", "−174", "−211"],
      ["Margin %", "+9%", "−27%", "−27%", "−7%"],
    ],
    [2400, 1700, 1700, 1700, 1700],
    { firstColBold: true }
  ),
  spacer(120),
  calloutBox([
    run("Kết luận nhanh: ", { bold: true, size: 22, color: C.danger }),
    run("Giá sau giảm 20% tạo margin 3 năm âm nhẹ (−7%) ở mức tenant thấp (5 khách). Khi đạt 10+ tenant margin sẽ dương ~25%. ", { size: 22 }),
    run("Phương án bù đắp:", { bold: true, size: 22 }),
    run(" upsell add-ons (margin 40–60%) + cam kết 3 năm để đạt margin thực tế 25–35%.", { size: 22 }),
  ], "warning"),

  // ═══ 2. TỰ XÂY ═════
  h1("2.  PHƯƠNG ÁN A — TỰ XÂY IN-HOUSE", { pageBreak: true }),

  h2("2.1.  Team cần thiết (tương đương gói STANDARD)"),
  buildTable(
    ["Vai trò", "Số FTE", "Thời gian", "Lương TB (triệu/tháng)"],
    [
      ["Tech Lead / Architect", "1", "18 tháng", "60"],
      ["Senior Backend (Java/Spring)", "3", "18 tháng", "40"],
      ["Senior Frontend (React)", "2", "15 tháng", "35"],
      ["DBA / Data Engineer", "1", "12 tháng", "35"],
      ["DevOps / SRE", "1", "12 tháng", "40"],
      ["QA / Test Engineer", "1", "15 tháng", "25"],
      ["Business Analyst", "1", "12 tháng", "30"],
      ["Project Manager", "1", "18 tháng", "45"],
      ["TỔNG FTE", "11", "TB ~15 tháng", "—"],
    ],
    [3200, 1200, 2600, 2200],
    { firstColBold: true }
  ),

  spacer(160),
  h2("2.2.  Chi phí chi tiết"),
  buildTable(
    ["Hạng mục", "Chi phí (triệu VND)", "Ghi chú"],
    [
      ["Tech Lead (18 × 60)", "1.080", ""],
      ["3 BE × 18 × 40", "2.160", ""],
      ["2 FE × 15 × 35", "1.050", ""],
      ["DBA × 12 × 35", "420", ""],
      ["DevOps × 12 × 40", "480", ""],
      ["QA × 15 × 25", "375", ""],
      ["BA × 12 × 30", "360", ""],
      ["PM × 18 × 45", "810", ""],
      ["Tổng lương (gross)", "6.735", "Trước overhead"],
      ["Overhead 40% (BHXH, thuế, office, benefits)", "2.694", ""],
      ["License dev tools (IDE, Jira, CI/CD, APM)", "150", ""],
      ["Cloud dev/staging (18 tháng)", "360", ""],
      ["Tư vấn ngoài (UX, security audit)", "250", ""],
      ["Chi phí kỹ thuật (cộng dồn)", "10.189", ""],
      ["Dự phòng rủi ro / scope creep 15%", "1.528", ""],
      ["TỔNG CHI PHÍ TỰ XÂY", "~11.700", "Chưa tính hạ tầng production năm 1"],
    ],
    [4000, 2600, 2600]
  ),

  spacer(160),
  h2("2.3.  Thời gian triển khai"),
  bullet("Tháng 1–3: Khảo sát, kiến trúc, UX design, POC"),
  bullet("Tháng 4–9: MVP core loyalty (hội viên, tích điểm, hạng, đổi thưởng)"),
  bullet("Tháng 10–14: Migration ETL + POS integration + CSKH + Marketing auto"),
  bullet("Tháng 15–18: Testing, UAT, pilot 5–10 store"),
  bullet("Tháng 19–24: Rollout toàn chuỗi, hardening, đào tạo"),
  spacer(80),
  calloutBox([
    run("Thực tế tại VN: ", { bold: true, size: 22, color: C.danger }),
    run("18 tháng là lý tưởng. Trung vị các dự án tương tự là ", { size: 22 }),
    run("22–28 tháng", { bold: true, size: 22, color: C.danger }),
    run(" do: tuyển dụng retail-loyalty 3–6 tháng, scope creep stakeholder, edge cases migration 3M KHTV.", { size: 22 }),
  ], "warning"),

  h2("2.4.  Rủi ro tự xây"),
  buildTable(
    ["Rủi ro", "Xác suất", "Tác động"],
    [
      ["Delay 6–12 tháng", "60% (Cao)", "+2–4 tỷ chi phí, lỡ cơ hội kinh doanh"],
      ["Nhân sự nghỉ giữa chừng", "40% (TB)", "Onboarding lại, chậm 2–3 tháng"],
      ["Hiệu năng không đạt ở peak 300K txn/ngày", "35% (TB)", "Refactor DB, cache, queue"],
      ["Thiếu exp retail-specific edge cases", "55% (Cao)", "Rework features sau go-live"],
      ["Chi phí đội > 30% ngân sách", "70% (Rất cao)", "≥ 15 tỷ tổng thay vì 11,7 tỷ"],
    ],
    [3600, 2200, 3400],
    { firstColBold: true }
  ),

  // ═══ 3. MUA REBORN ═════
  h1("3.  PHƯƠNG ÁN B — MUA REBORN (3 GÓI)", { pageBreak: true }),
  para(run("Chi tiết đã có trong báo giá chính thức. Bảng dưới tóm tắt Total Contract Value (TCV) 3 năm.", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),
  buildTable(
    ["Gói", "Năm 1", "Năm 2", "Năm 3", "3-year TCV"],
    [
      ["STARTER", "712", "392", "392", "1.496"],
      ["STANDARD  ⭐", "1.512", "656", "656", "2.824"],
      ["PREMIUM", "2.392", "960", "960", "4.312"],
    ],
    [2000, 1800, 1800, 1800, 1800],
    { firstColBold: true }
  ),
  spacer(120),
  para(run("Đơn vị: triệu VND, trước VAT, chưa tính scale pack khi mở rộng cửa hàng.", { italic: true, size: 20, color: C.textMuted })),
  spacer(160),
  calloutBox([
    run("So sánh với tự xây (STANDARD): ", { bold: true, size: 22, color: C.success }),
    run("2,8 tỷ vs 11,7 tỷ → khách ", { size: 22 }),
    run("tiết kiệm ~8,9 tỷ + 12–18 tháng thời gian.", { bold: true, size: 22, color: C.success }),
  ], "recommend"),

  // ═══ 4. CHI PHÍ VẬN HÀNH SAAS ═════
  h1("4.  CHI PHÍ VẬN HÀNH SAAS — GÓC NHÌN REBORN", { pageBreak: true }),
  para(run("Giả định Reborn vận hành SaaS multi-tenant cho khách gói STANDARD. Tính per-tenant với các mức kinh tế quy mô khác nhau.", { italic: true, size: 22, color: C.textMuted })),

  h2("4.1.  Chi phí hạ tầng (Infrastructure) — hàng năm"),
  buildTable(
    ["Hạng mục", "Spec / Nhà cung cấp", "triệu/năm"],
    [
      ["Application servers (3 VM × 8 vCPU 32GB)", "VNG/FPT Cloud VN", "120"],
      ["Database managed MySQL (16 vCPU, 64GB, 2TB SSD, HA)", "RDS-equivalent", "300"],
      ["Redis cache (2 nodes 8GB)", "Managed", "60"],
      ["RabbitMQ cluster (2 nodes)", "Self-hosted VM", "48"],
      ["Load balancer + NAT gateway", "Managed", "36"],
      ["Object storage (~2TB backups + files)", "S3-like", "36"],
      ["CDN + bandwidth (3M user traffic)", "Cloudflare/BunnyCDN", "60"],
      ["Monitoring (Datadog/New Relic APM 5 hosts)", "SaaS", "48"],
      ["DR / Backup site (warm standby)", "Secondary region", "96"],
      ["SMS gateway base + 50K SMS/tháng", "Viettel/VinaPhone", "60"],
      ["Email service (500K/tháng)", "SendGrid/SES", "24"],
      ["Tổng hạ tầng DEDICATED (1 tenant)", "Full stack riêng", "888"],
      ["Tổng hạ tầng MULTI-TENANT (10 tenant)", "Shared DB/Redis/monitoring", "~350 / tenant"],
    ],
    [3600, 3400, 2200]
  ),
  spacer(120),
  calloutBox([
    run("Lưu ý: ", { bold: true, size: 22, color: C.brandDark }),
    run("Nếu khách chọn Dedicated (gói PREMIUM có DR 72tr), chi phí thực ~888tr/năm. Reborn thu 288tr hosting → cần cộng thêm vào tổng gói. Multi-tenant chia sẻ hạ tầng là chìa khoá để margin dương.", { size: 22 }),
  ], "note"),

  h2("4.2.  Chi phí nhân sự (Personnel) — team vận hành SaaS chung"),
  buildTable(
    ["Vai trò", "Số FTE / 10 khách", "Lương (triệu/tháng)", "Chi phí / năm"],
    [
      ["DevOps / SRE", "2", "40", "960"],
      ["Support engineer L2", "2", "30", "720"],
      ["DBA (part-time)", "1", "35", "420"],
      ["Customer Success Manager", "2 (mỗi CSM 5 khách)", "30", "720"],
      ["Tech Lead (fix bug phức tạp, part-time)", "1", "60", "720"],
      ["Tổng team lõi (trước overhead)", "8", "—", "3.540"],
      ["Overhead 35% (BHXH, office, tools, training)", "—", "—", "1.239"],
      ["TỔNG nhân sự vận hành / năm cho 10 khách", "—", "—", "4.779"],
      ["Phân bổ 1 khách STANDARD (10-tenant)", "—", "—", "~480"],
      ["Phân bổ 1 khách STANDARD (5-tenant)", "—", "—", "~960"],
    ],
    [3400, 1800, 2000, 2000],
    { firstColBold: true }
  ),

  h2("4.3.  Chi phí Implementation — one-time năm 1"),
  buildTable(
    ["Hạng mục", "Man-days", "Chi phí (triệu @ 2–2,5tr/day)"],
    [
      ["Khảo sát + mapping 4 hệ thống (BA + TL)", "20", "50"],
      ["ETL pipeline + dedupe + import 3M record", "60", "120"],
      ["Tích hợp POS 2 brand (~300 store config)", "40", "80"],
      ["Tích hợp Website + Mobile App", "25", "50"],
      ["Module CSKH setup", "20", "40"],
      ["Config rule điểm/hạng/hạn + Dashboard custom", "15", "30"],
      ["QA + UAT + load test", "25", "50"],
      ["Project Management (PM @ 2,5tr/day)", "30", "75"],
      ["Tổng impl labor", "235", "495"],
      ["Contingency 10%", "—", "50"],
      ["Tổng Implementation / khách", "—", "~545"],
    ],
    [4800, 1800, 2600]
  ),

  h2("4.4.  Tổng chi phí Reborn theo gói (giả định 10-tenant)"),
  buildTable(
    ["Hạng mục", "STARTER", "STANDARD", "PREMIUM"],
    [
      ["Năm 1: Implementation", "280", "545", "820"],
      ["Năm 1: Infrastructure", "200", "350", "540 (dedicated)"],
      ["Năm 1: Personnel allocation", "320", "480", "700"],
      ["Tổng cost năm 1", "800", "1.375", "2.060"],
      ["Năm 2+: Infrastructure", "200", "350", "540"],
      ["Năm 2+: Personnel", "320", "480", "700"],
      ["Tổng cost năm 2+", "520", "830", "1.240"],
    ],
    [3400, 1900, 1900, 2000],
    { firstColBold: true }
  ),

  // ═══ 5. MARGIN TÍNH TOÁN ═════
  h1("5.  MARGIN TÍNH TOÁN — THEO GÓI", { pageBreak: true }),

  h2("5.1.  Gói STARTER — 712 triệu năm 1"),
  buildTable(
    ["Năm", "Doanh thu", "Cost", "Lợi nhuận", "Margin"],
    [
      ["Năm 1", "712", "800", "−88", "−12%"],
      ["Năm 2", "392", "520", "−128", "−33%"],
      ["Năm 3", "392", "520", "−128", "−33%"],
      ["3-year", "1.496", "1.840", "−344", "−23%"],
    ],
    [1800, 1850, 1850, 1850, 1850],
    { firstColBold: true }
  ),
  spacer(120),
  calloutBox([
    run("Cảnh báo: ", { bold: true, size: 22, color: C.danger, caps: true }),
    run("Gói STARTER sau giảm 20% ĐANG ÂM MARGIN ở giả định tenant thấp (3–5). Để hoà vốn cần: ", { size: 22 }),
    run("(a) Multi-tenant 15+ khách, hoặc ", { size: 22 }),
    run("(b) Đẩy giá STARTER về mức 850–900tr, hoặc ", { size: 22 }),
    run("(c) Xem STARTER là \"loss leader\" — bán để lấy cửa, upsell STANDARD/PREMIUM sau 6–12 tháng.", { size: 22 }),
  ], "warning"),

  h2("5.2.  Gói STANDARD — 1.512 triệu năm 1 (GÓI CHÍNH)"),
  buildTable(
    ["Năm", "Doanh thu", "Cost", "Lợi nhuận", "Margin"],
    [
      ["Năm 1", "1.512", "1.375", "+137", "+9%"],
      ["Năm 2", "656", "830", "−174", "−27%"],
      ["Năm 3", "656", "830", "−174", "−27%"],
      ["3-year", "2.824", "3.035", "−211", "−7%"],
    ],
    [1800, 1850, 1850, 1850, 1850],
    { firstColBold: true }
  ),
  spacer(120),
  para(run("Gói STANDARD sau giảm 20% lỗ nhẹ 3 năm. Phí năm 2+ (656tr) chưa đủ bù personnel + hosting (830tr).", { bold: true, size: 22, color: C.danger })),
  spacer(80),
  para(run("4 cách cân bằng:", { bold: true, size: 24, color: C.brandDark })),
  bullet([
    run("Multi-tenant 10+ khách:", { bold: true, size: 22, color: C.success }),
    run(" phân bổ personnel từ 480tr → ~300tr/khách → margin 3-year ~20%.", { size: 22 }),
  ]),
  bullet([
    run("Bán kèm add-ons:", { bold: true, size: 22, color: C.success }),
    run(" gamification, mini-app Zalo, ERP... — mỗi add-on margin ~50% vì dùng template sẵn.", { size: 22 }),
  ]),
  bullet([
    run("Nâng phí năm 2+ lên 800tr", { bold: true, size: 22, color: C.success }),
    run(" (thay vì 656tr) — cân bằng được margin về dương.", { size: 22 }),
  ]),
  bullet([
    run("Cam kết 3 năm giảm 15%", { bold: true, size: 22, color: C.success }),
    run(" (đã có trong báo giá) — khách trả 2.400tr trước, Reborn có tiền mặt + chứng minh cam kết của khách.", { size: 22 }),
  ]),

  h2("5.3.  Gói PREMIUM — 2.392 triệu năm 1"),
  buildTable(
    ["Năm", "Doanh thu", "Cost", "Lợi nhuận", "Margin"],
    [
      ["Năm 1", "2.392", "2.060", "+332", "+14%"],
      ["Năm 2", "960", "1.240", "−280", "−29%"],
      ["Năm 3", "960", "1.240", "−280", "−29%"],
      ["3-year", "4.312", "4.540", "−228", "−5%"],
    ],
    [1800, 1850, 1850, 1850, 1850],
    { firstColBold: true }
  ),
  spacer(120),
  para(run("Tương tự STANDARD. Premium cần: (i) 8+ khách cùng quy mô để phân bổ personnel, (ii) bán thêm add-ons (mini-app Zalo 176tr, SDK 144tr, ISO consulting 144tr...) — mỗi add-on margin 40–60%.", { size: 22, color: C.text })),

  // ═══ 6. SENSITIVITY ═════
  h1("6.  PHÂN TÍCH ĐỘ NHẠY — SỐ TENANT", { pageBreak: true }),
  para(run("Câu hỏi: Margin gói STANDARD thay đổi thế nào khi số tenant tăng/giảm?", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),
  buildTable(
    ["Số tenant chia sẻ", "Personnel / tenant", "Cost năm 2+", "Doanh thu năm 2+", "Margin năm 2+"],
    [
      ["2 (giai đoạn đầu)", "1.200", "1.550", "656", "−58%  🔴"],
      ["3", "800", "1.150", "656", "−43%  🔴"],
      ["5", "480", "830", "656", "−27%  🟡"],
      ["7", "340", "690", "656", "−5%  🟡"],
      ["10", "240", "590", "656", "+10%  🟢"],
      ["15", "160", "510", "656", "+22%  🟢"],
      ["20", "120", "470", "656", "+28%  🟢"],
    ],
    [2200, 2000, 1800, 1800, 1400],
    { firstColBold: true }
  ),
  spacer(160),
  calloutBox([
    run("Break-even point: ", { bold: true, size: 22, color: C.brandDark }),
    run("~8 tenant. Dưới mức này → lỗ năm 2+. ", { size: 22 }),
    run("Reborn cần đạt 8 khách STANDARD trong 12 tháng đầu để cash flow dương.", { bold: true, size: 22, color: C.danger }),
  ], "highlight"),

  // ═══ 7. COMPARE 3 MODELS ═════
  h1("7.  SO SÁNH DOANH THU / LỢI NHUẬN — 3 MÔ HÌNH BÁN"),
  para(run("Với gói STANDARD, 3 mô hình pricing khác nhau cho cùng 1 khách:", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),
  buildTable(
    ["Mô hình", "Năm 1", "Năm 2+", "3-year Revenue", "Ghi chú margin"],
    [
      ["Milestone (mặc định)", "1.512", "656/năm", "2.824", "Margin ~34% nếu 10+ tenant"],
      ["One-time + 18% maintenance", "1.512", "272 maint + 192 host = 464/năm", "2.440", "Maintenance lạc quan hơn nếu ít update"],
      ["Subscription SaaS (chia 5 năm)", "730/năm", "730/năm", "3.650 (5 năm)", "Margin cao dài hạn nhờ lock-in"],
      ["Cam kết 3 năm (−15% TCV)", "—", "—", "2.400", "Tiền trước, giảm rủi ro, margin thực 29%"],
    ],
    [2200, 1500, 2000, 1800, 1700],
    { firstColBold: true }
  ),

  // ═══ 8. PRICING STRATEGY ═════
  h1("8.  ĐỀ XUẤT PRICING CHIẾN LƯỢC", { pageBreak: true }),

  h2("8.1.  Vấn đề hiện tại"),
  para(run("Sau khi giảm 20% để cạnh tranh, các gói margin mỏng hoặc âm ở giai đoạn ít tenant (dưới 8 khách). Rủi ro:", { size: 22, color: C.text })),
  bullet("Nếu chỉ bán được 2–3 khách đầu → Reborn lỗ ròng đáng kể"),
  bullet("Khó tái đầu tư vào product + team"),
  bullet("Áp lực phải bán nhanh để đạt break-even tenant"),

  h2("8.2.  3 tuỳ chọn điều chỉnh"),

  h3("Tuỳ chọn 1 — Giữ nguyên giá đã giảm 20% (đầu tư thương hiệu)"),
  bullet("Coi đây là \"đầu tư thương hiệu\" — có khách đầu tiên trong ngành bán lẻ lớn"),
  bullet("Margin thấp nhưng có case study, chứng minh sẵn sàng"),
  bullet("Chỉ áp dụng cho 1–2 khách lớn nhất"),

  h3("Tuỳ chọn 2 — Giảm 10% thay vì 20% (cân bằng)"),
  bullet("STANDARD: 1.700tr (thay vì 1.512tr), margin năm 1 ~20%, 3-year ~18%"),
  bullet("Vẫn cạnh tranh so với vendor quốc tế (3,5–5 tỷ) và build in-house (11–12 tỷ)"),
  bullet("Khách cảm thấy đã được ưu đãi đáng kể"),

  h3("Tuỳ chọn 3 — Giữ giá giảm 20% nhưng tăng phí năm 2+"),
  bullet("Năm 1 vẫn 1.512tr (dễ ký hợp đồng vì giá cạnh tranh)"),
  bullet("Năm 2+ tăng từ 656tr → 880tr (thay cho 820tr gốc)"),
  bullet("Sau 3 năm TCV: 3.272tr, margin ~22%"),
  bullet("Khó chịu hơn với khách vì cam kết dài hạn"),

  h2("8.3.  Khuyến nghị"),
  calloutBox([
    run("Với khách chuỗi siêu thị này (chiến lược):", { bold: true, size: 24, color: C.success }),
  ], "recommend"),
  bullet("Giữ gói STANDARD ở 1.512tr (đã giảm 20%)"),
  bullet([
    run("Upsell mạnh 3–5 add-ons:", { bold: true, size: 22, color: C.brandDark }),
    run(" mini-app Zalo 176tr + SDK mobile 144tr + Marketing extensions + ISO consulting 144tr", { size: 22 }),
  ]),
  bullet("Add-on margin cao ~50% (template sẵn) → bù được phần giảm 20% gốc"),
  bullet([
    run("Ước doanh thu thực tế sau upsell: ", { size: 22 }),
    run("1.512tr + ~500tr add-ons = ~2.000tr năm 1", { bold: true, size: 22, color: C.success }),
    run(", margin quay lại 25–30%", { size: 22 }),
  ]),
  spacer(80),
  calloutBox([
    run("Với khách tiếp theo:", { bold: true, size: 24, color: C.brandDark }),
  ], "note"),
  bullet("Giảm chỉ 10–12% mặc định"),
  bullet("Chỉ giảm 20% khi khách chiến lược / deal lớn"),

  // ═══ 9. KẾT LUẬN ═════
  h1("9.  KẾT LUẬN SO SÁNH TỔNG THỂ", { pageBreak: true }),

  h2("9.1.  Cho khách hàng"),
  buildTable(
    ["Tiêu chí", "Tự xây", "Reborn STANDARD"],
    [
      ["Chi phí 3 năm", "11–15 tỷ", "2,8 tỷ"],
      ["Thời gian go-live", "18–24 tháng", "6 tháng"],
      ["Rủi ro", "Rất cao", "Thấp"],
      ["Tùy chỉnh", "Tối đa", "Cao (configurable)"],
      ["Kiến thức retail-specific", "Phải học", "Đã có sẵn (20 tính năng)"],
      ["Kết luận", "Chỉ phù hợp khi có nhu cầu độc đáo, ngân sách dư, sẵn 2 năm", "Phù hợp 95% khách bán lẻ"],
    ],
    [3000, 3100, 3100],
    { firstColBold: true }
  ),
  spacer(120),
  calloutBox([
    run("Mua Reborn tiết kiệm ~70–80% chi phí + 3× nhanh hơn so với tự xây.", { bold: true, size: 24, color: C.success }),
  ], "recommend"),

  h2("9.2.  Cho Reborn (nội bộ)"),
  buildTable(
    ["Chỉ số", "Giá trị"],
    [
      ["Chi phí build lại từ đầu (nếu phải)", "~11,7 tỷ + 18 tháng"],
      ["Chi phí impl per-khách STANDARD", "~545 triệu (one-time)"],
      ["Chi phí vận hành per-khách/năm (5-tenant)", "~830 triệu"],
      ["Chi phí vận hành per-khách/năm (10-tenant)", "~590 triệu"],
      ["Doanh thu STANDARD năm 1", "1.512 triệu"],
      ["Margin năm 1 (5-tenant)", "~9% (cần upsell để lên 25–30%)"],
      ["Margin 3-year (10-tenant)", "~25%"],
      ["Margin 3-year (sau upsell + cam kết 3 năm)", "~30–35%"],
    ],
    [5000, 4200],
    { firstColBold: true }
  ),

  h2("9.3.  Hành động đề xuất (Action Items)"),

  new Table({
    rows: [1, 2, 3, 4, 5].map((n) => {
      const items = {
        1: { title: "Với deal khách này", desc: "Giữ giá 1.512tr, đẩy mạnh upsell add-ons (mini-app Zalo, SDK, ISO consulting) để đạt margin thực tế 25–30%." },
        2: { title: "Với các deal sau", desc: "Mặc định giảm 10–12%, chỉ giảm sâu 20% khi deal chiến lược hoặc khách cam kết 3 năm." },
        3: { title: "Tuyển đủ tenant", desc: "Cần 3–5 khách STANDARD trong 12 tháng đầu để đạt break-even tenant (~8 khách)." },
        4: { title: "Gói STARTER", desc: "Xem như \"loss leader\" — bán để mở cửa vào, đẩy khách lên STANDARD sau 6–12 tháng." },
        5: { title: "Cam kết 3 năm", desc: "Lock-in 3 năm (giảm 15% TCV) ưu tiên hơn hợp đồng 1 năm — cash flow tốt, margin ổn định." },
      };
      const s = items[n];
      return new TableRow({
        height: { value: 700, rule: HeightRule.ATLEAST },
        children: [
          cell([new Paragraph({ children: [run(String(n), { bold: true, size: 36, color: C.white })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], {
            fill: C.internal,
            width: { size: 900, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: C.internal },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: C.internal },
              left: { style: BorderStyle.SINGLE, size: 4, color: C.internal },
              right: { style: BorderStyle.SINGLE, size: 4, color: C.internal },
            },
            vAlign: "center",
          }),
          cell([
            new Paragraph({ children: [run(s.title, { bold: true, size: 24, color: C.brandDark })], spacing: { before: 80, after: 40 } }),
            new Paragraph({ children: [run(s.desc, { size: 20, color: C.text })], spacing: { before: 0, after: 80 } }),
          ], {
            fill: n % 2 === 1 ? C.sectionBgSoft : C.white,
            width: { size: 8300, type: WidthType.DXA },
            vAlign: "center",
          }),
        ],
      });
    }),
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  }),

  // ═══ 10. BREAK-EVEN ANALYSIS ═════
  h1("10.  SO SÁNH GIÁ GỐC vs GIẢM 20% — ĐIỂM HÒA VỐN", { pageBreak: true }),
  calloutBox([
    run("Phân tích bổ sung: ", { bold: true, size: 22, color: C.internal }),
    run("Trả lời câu hỏi \"Nếu giữ giá gốc không giảm 20% thì margin thế nào?\" và \"Cần bán bao nhiêu khách / bao lâu để hòa vốn đầu tư platform 11,7 tỷ?\".", { size: 22 }),
  ], "internal"),

  h2("10.1.  Giữ giá gốc v1.0 (không giảm 20%)"),
  para(run("Giá gốc: STARTER 890tr  /  STANDARD 1.890tr  /  PREMIUM 2.990tr (năm 1).", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),
  buildTable(
    ["Gói", "Y1 Rev", "Y1 Cost", "Margin Y1", "Y2+ Rev", "Y2+ Cost", "Margin Y2+", "Margin 3Y"],
    [
      ["STARTER", "890", "800", "+11%", "490", "520", "−6%", "+2%"],
      ["STANDARD  ⭐", "1.890", "1.375", "+27%", "820", "830", "−1%", "+14%"],
      ["PREMIUM", "2.990", "2.060", "+31%", "1.200", "1.240", "−3%", "+16%"],
    ],
    [1400, 1100, 1100, 1200, 1100, 1100, 1100, 1100],
    { firstColBold: true }
  ),
  spacer(120),
  calloutBox([
    run("Giá gốc có margin dương đáng kể ở năm 1 ", { bold: true, size: 22, color: C.success }),
    run("nhờ impl fee + license + cấu hình. Năm 2+ margin gần 0 (cần 10+ tenant để dương rõ). ", { size: 22 }),
    run("3-year margin STANDARD +14% — ", { size: 22 }),
    run("ĐỦ để thu hồi đầu tư trong 5–6 năm.", { bold: true, size: 22, color: C.success }),
  ], "recommend"),

  h2("10.2.  Giá đã giảm 20% v1.1 (hiện tại chào khách)"),
  buildTable(
    ["Gói", "Margin Y1", "Margin Y2+", "Margin 3Y"],
    [
      ["STARTER", "−12%", "−33%", "−23%"],
      ["STANDARD  ⭐", "+9%", "−27%", "−7%"],
      ["PREMIUM", "+14%", "−29%", "−5%"],
    ],
    [2400, 2200, 2200, 2400],
    { firstColBold: true }
  ),

  h2("10.3.  So sánh chi tiết 2 pricing"),
  buildTable(
    ["Tiêu chí", "Giá GỐC v1.0", "Giảm 20% v1.1", "Chênh lệch"],
    [
      ["Margin STANDARD Y1", "+27%", "+9%", "−18pp"],
      ["Margin STANDARD Y2+", "−1%", "−27%", "−26pp"],
      ["Margin STANDARD 3-year", "+14%", "−7%", "−21pp"],
      ["Lợi nhuận/khách STANDARD 3Y", "+495 triệu", "−211 triệu", "−706 triệu/khách"],
      ["Break-even tenant (Y2+)", "6 khách", "8 khách", "+2 khách"],
      ["3-year TCV/khách", "3.530 triệu", "2.824 triệu", "−706 triệu"],
    ],
    [3200, 2000, 2000, 2000],
    { firstColBold: true }
  ),

  h2("10.4.  Mô hình tài chính để tính Break-even"),
  para(run("Giả định:", { bold: true, size: 24, color: C.brandDark })),
  bullet("Chi phí đầu tư platform đã bỏ ra (sunk cost): 11,7 tỷ"),
  bullet([
    run("Team chi phí cố định theo tenant bracket:", { size: 22 }),
  ]),
  bullet("1–5 khách: 2.400 triệu/năm (4 FTE)", 1),
  bullet("6–10 khách: 3.800 triệu/năm (6 FTE)", 1),
  bullet("11–15 khách: 5.000 triệu/năm (8 FTE)", 1),
  bullet("16–20 khách: 6.400 triệu/năm (10 FTE)", 1),
  bullet("21–25 khách: 7.500 triệu/năm (12 FTE)", 1),
  bullet("Infra: 350 triệu/năm/tenant (multi-tenant shared)"),
  bullet("Implementation: 545 triệu one-time/tenant mới"),
  bullet("Giả định 0% churn, tất cả khách đều gói STANDARD"),

  h2("10.5.  Kịch bản với GIÁ GỐC v1.0 — 3 khách STANDARD/năm"),
  buildTable(
    ["Năm", "Mới", "Tổng", "Team", "Infra", "Impl", "Doanh thu", "Chi phí", "Lãi năm", "Luỹ kế", "Số dư −11,7 tỷ"],
    [
      ["1", "3", "3", "2.400", "1.050", "1.635", "5.670", "5.085", "+585", "+585", "−11.115"],
      ["2", "3", "6", "3.800", "2.100", "1.635", "8.130", "7.535", "+595", "+1.180", "−10.520"],
      ["3", "3", "9", "3.800", "3.150", "1.635", "10.590", "8.585", "+2.005", "+3.185", "−8.515"],
      ["4", "3", "12", "5.000", "4.200", "1.635", "13.050", "10.835", "+2.215", "+5.400", "−6.300"],
      ["5", "3", "15", "5.000", "5.250", "1.635", "15.510", "11.885", "+3.625", "+9.025", "−2.675"],
      ["6 ⭐", "3", "18", "6.400", "6.300", "1.635", "17.970", "14.335", "+3.635", "+12.660", "+960 🟢"],
    ],
    [400, 400, 500, 700, 700, 700, 1000, 1000, 900, 900, 1400]
  ),
  spacer(120),
  calloutBox([
    run("Break-even ≈ Năm 5 + 9 tháng  ·  ~17 khách cumulative", { bold: true, size: 24, color: C.success }),
  ], "recommend"),

  h2("10.6.  Kịch bản với GIÁ GỐC v1.0 — 5 khách STANDARD/năm (aggressive)"),
  buildTable(
    ["Năm", "Mới", "Tổng", "Lãi năm", "Luỹ kế", "Số dư −11,7 tỷ"],
    [
      ["1", "5", "5", "+1.135", "+1.135", "−10.565"],
      ["2", "5", "10", "+2.215", "+3.350", "−8.350"],
      ["3", "5", "15", "+3.625", "+6.975", "−4.725"],
      ["4 ⭐", "5", "20", "+5.125", "+12.100", "+400 🟢"],
    ],
    [600, 600, 700, 1700, 1700, 1900]
  ),
  spacer(120),
  calloutBox([
    run("Break-even ≈ Năm 3 + 11 tháng  ·  ~20 khách cumulative", { bold: true, size: 24, color: C.success }),
  ], "recommend"),

  h2("10.7.  Kịch bản với GIÁ GIẢM 20% v1.1 — 3 khách STANDARD/năm"),
  buildTable(
    ["Năm", "Tổng", "Doanh thu", "Chi phí", "Lãi năm", "Luỹ kế", "Số dư −11,7 tỷ"],
    [
      ["1", "3", "4.536", "5.085", "−549", "−549", "−12.249"],
      ["2", "6", "6.504", "7.535", "−1.031", "−1.580", "−13.280"],
      ["3", "9", "8.472", "8.585", "−113", "−1.693", "−13.393"],
      ["4", "12", "10.440", "10.835", "−395", "−2.088", "−13.788"],
      ["5", "15", "12.408", "11.885", "+523", "−1.565", "−13.265"],
      ["6", "18", "14.376", "14.335", "+41", "−1.524", "−13.224"],
      ["7", "21", "16.344", "15.385", "+959", "−565", "−12.265"],
      ["8", "24", "18.312", "17.535", "+777", "+212", "−11.488"],
    ],
    [500, 600, 1300, 1300, 1100, 1400, 1700]
  ),
  spacer(120),
  calloutBox([
    run("KHÔNG hòa vốn trong 10 năm", { bold: true, size: 24, color: C.danger, caps: true }),
    run(" với sales rate 3 khách/năm. Doanh thu thiếu hụt kinh niên, margin 3 năm âm −7%. Nếu giữ pricing này phải tăng sales rate hoặc tăng add-ons.", { size: 22 }),
  ], "warning"),

  h2("10.8.  Kịch bản với GIÁ GIẢM 20% v1.1 — 5 khách STANDARD/năm"),
  buildTable(
    ["Năm", "Tổng", "Lãi năm", "Luỹ kế", "Số dư −11,7 tỷ"],
    [
      ["1", "5", "+685", "+685", "−11.015"],
      ["2", "10", "+815", "+1.500", "−10.200"],
      ["3", "15", "+1.145", "+2.645", "−9.055"],
      ["4", "20", "+1.275", "+3.920", "−7.780"],
      ["5", "25", "+1.705", "+5.625", "−6.075"],
      ["6", "30", "+1.735", "+7.360", "−4.340"],
      ["7", "35", "+1.765", "+9.125", "−2.575"],
      ["8", "40", "+1.795", "+10.920", "−780"],
      ["9 ⭐", "45", "+2.050", "+12.970", "+1.270 🟢"],
    ],
    [600, 700, 1700, 2000, 2200]
  ),
  spacer(120),
  calloutBox([
    run("Break-even ≈ Năm 8 + 5 tháng  ·  ~42 khách cumulative", { bold: true, size: 24, color: C.danger }),
  ], "warning"),

  h2("10.9.  BẢNG TỔNG HỢP BREAK-EVEN"),
  buildTable(
    ["Pricing", "Sales rate", "Thời gian break-even", "Số khách cần"],
    [
      ["Giá GỐC v1.0  🟢", "3 khách/năm", "5 năm 9 tháng", "~17 khách"],
      ["Giá GỐC v1.0  🟢", "5 khách/năm", "3 năm 11 tháng", "~20 khách"],
      ["Giá GỐC v1.0  🟢", "7 khách/năm", "2 năm 10 tháng", "~20 khách"],
      ["Giảm 20% v1.1  🔴", "3 khách/năm", "Không hòa vốn trong 10 năm", "—"],
      ["Giảm 20% v1.1  🟡", "5 khách/năm", "8 năm 5 tháng", "~42 khách"],
      ["Giảm 20% v1.1  🟡", "7 khách/năm", "~6 năm", "~42 khách"],
    ],
    [2400, 2000, 2800, 2000],
    { firstColBold: true }
  ),

  h2("10.10.  KẾT LUẬN CHIẾN LƯỢC PRICING"),

  h3("Option A — Trở lại giá gốc v1.0"),
  bullet([run("Break-even đầu tư ", { size: 22 }), run("nhanh hơn 2–3 lần", { bold: true, size: 22, color: C.success }), run(" (5–6 năm vs 8–10 năm)", { size: 22 })]),
  bullet([run("Margin STANDARD 3-year: ", { size: 22 }), run("+14%", { bold: true, size: 22, color: C.success }), run(" thay vì −7%", { size: 22 })]),
  bullet("Vẫn cạnh tranh vì rẻ hơn vendor quốc tế (3,5–5 tỷ) và tự xây (11,7 tỷ)"),
  bullet([run("Rủi ro: ", { size: 22, color: C.danger }), run("khách nhạy cảm với giá có thể chọn vendor khác", { size: 22 })]),

  h3("Option B — Giữ giảm 20% v1.1 (đã chào)"),
  bullet("Chỉ nên dành cho 1–2 khách chiến lược để mở thị trường bán lẻ"),
  bullet([run("Phải ", { size: 22 }), run("tăng sales rate lên 5+ khách/năm", { bold: true, size: 22, color: C.danger }), run(" mới có cơ hội hòa vốn", { size: 22 })]),
  bullet([run("BẮT BUỘC upsell add-ons ", { bold: true, size: 22, color: C.brandDark }), run("30–50% doanh thu để kéo margin về +20%", { size: 22 })]),
  bullet("Đẩy mạnh cam kết 3 năm (giảm 15% tổng nhưng thu tiền trước)"),

  h3("Option C — Giảm 10% (Sweet spot, khuyến nghị cho deal sau)"),
  bullet("STANDARD giá 1.701tr thay vì 1.512tr — khách vẫn cảm thấy được giảm"),
  bullet([run("Margin STANDARD 3-year ước tính ", { size: 22 }), run("+6 đến +8%", { bold: true, size: 22, color: C.success }), run(" (tích cực hơn nhiều)", { size: 22 })]),
  bullet("Break-even với 3 khách/năm: ~7 năm  ·  với 5 khách/năm: ~5 năm"),

  h2("10.11.  Lộ trình pricing đề xuất"),
  buildTable(
    ["Giai đoạn", "Chính sách giá", "Mục tiêu sales"],
    [
      ["Q2/2026 (deal hiện tại)", "Giảm 20% (v1.1) để thắng deal chiến lược đầu tiên", "1 khách + case study bán lẻ"],
      ["Q3–Q4/2026", "Giảm 10% (default)", "2–3 khách bán lẻ lớn"],
      ["2027+", "Giá gốc v1.0 (premium brand positioning)", "4–5 khách/năm, break-even 2028-2029"],
    ],
    [2400, 3800, 3000],
    { firstColBold: true }
  ),
  spacer(160),
  calloutBox([
    run("KHUYẾN NGHỊ CUỐI CÙNG:", { bold: true, size: 24, color: C.success, caps: true }),
  ], "recommend"),
  bullet([
    run("Với khách chuỗi siêu thị này (deal đầu tiên): ", { bold: true, size: 22, color: C.brandDark }),
    run("giữ giá 1.512tr (v1.1), ", { size: 22 }),
    run("upsell mạnh add-ons 500+ triệu", { bold: true, size: 22, color: C.success }),
    run(" để bù margin. Coi như đầu tư case study.", { size: 22 }),
  ]),
  bullet([
    run("Với khách tiếp theo: ", { bold: true, size: 22, color: C.brandDark }),
    run("chỉ giảm 10% (v1.2). Giá STANDARD ~1.700tr.", { size: 22 }),
  ]),
  bullet([
    run("Mục tiêu break-even: ", { bold: true, size: 22, color: C.brandDark }),
    run("20 khách trong 4 năm (trung bình 5 khách/năm) với mix pricing v1.0 + v1.1 + v1.2.", { size: 22 }),
  ]),

  spacer(480),

  // Footer internal block
  new Table({
    rows: [new TableRow({
      height: { value: 1200, rule: HeightRule.ATLEAST },
      children: [new TableCell({
        children: [
          new Paragraph({ children: [run("R E B O R N  J S C  —  INTERNAL", { bold: true, size: 26, color: C.brandPrimary, spacing: 80 })], alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 } }),
          new Paragraph({ children: [run("Tài liệu phân tích chỉ dùng cho BOD & Team Sales", { italic: true, size: 18, color: C.internalSoft })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
          new Paragraph({ children: [run("Cập nhật khi thay đổi pricing hoặc số liệu tenant thực tế", { size: 16, color: C.internalSoft })], alignment: AlignmentType.CENTER, spacing: { before: 40, after: 120 } }),
        ],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: C.brandDark },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 18, color: C.internal },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: C.brandDark },
          left: { style: BorderStyle.SINGLE, size: 4, color: C.brandDark },
          right: { style: BorderStyle.SINGLE, size: 4, color: C.brandDark },
        },
        width: { size: 9200, type: WidthType.DXA },
      })],
    })],
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  }),
];

// ═══ DOCUMENT ═══════════════════════════════════════════════════════════
const doc = new Document({
  creator: "Reborn JSC",
  title: "Phân tích Tài chính — Loyalty Platform (Internal)",
  description: "Phân tích chi phí, doanh thu, margin — nội bộ",
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { orientation: PageOrientation.PORTRAIT },
        margin: { top: 1200, right: 1000, bottom: 1200, left: 1000, header: 500, footer: 500 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            run("REBORN JSC", { size: 16, color: C.brandPrimary, bold: true, spacing: 40 }),
            run("    •    ", { size: 16, color: C.textMuted }),
            run("Phân tích Tài chính Loyalty", { size: 16, color: C.textMuted, italic: true }),
            run("    •    ", { size: 16, color: C.textMuted }),
            run("🔒 INTERNAL", { size: 16, color: C.internal, bold: true }),
          ],
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.internal, space: 4 } },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            run("Trang ", { size: 16, color: C.textMuted }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.textMuted }),
            run(" / ", { size: 16, color: C.textMuted }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: C.textMuted }),
            run("    •    TÀI LIỆU NỘI BỘ — KHÔNG GỬI KHÁCH    •    Reborn JSC 2026", { size: 16, color: C.internal, italic: true, bold: true }),
          ],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.internal, space: 4 } },
        })],
      }),
    },
    children: content,
  }],
});

const outPath = "docs/proposal/bao-gia/Phan-tich-Chi-phi-Margin-INTERNAL.docx";
Packer.toBuffer(doc).then((buf) => {
  try {
    writeFileSync(outPath, buf);
    console.log(`✓ DOCX generated: ${outPath}  (${buf.length} bytes)`);
  } catch (e) {
    if (e.code === "EBUSY") {
      const fallback = outPath.replace(".docx", `_v${Date.now()}.docx`);
      writeFileSync(fallback, buf);
      console.log(`⚠ File gốc đang mở — đã ghi ra: ${fallback}`);
    } else throw e;
  }
}).catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
