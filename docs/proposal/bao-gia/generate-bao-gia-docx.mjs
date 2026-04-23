// Tạo file DOCX báo giá Loyalty — chạy: node docs/proposal/bao-gia/generate-bao-gia-docx.mjs
// Nguồn: bao-gia-loyalty.md — chỉnh .md xong chạy lại script để update .docx
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  Header, Footer, PageNumber, convertInchesToTwip, PageBreak,
  TableLayoutType, HeightRule,
} from "docx";
import { writeFileSync } from "fs";

// ═══ THEME ═════════════════════════════════════════════════════════════
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
  recommendBg: "ECFDF5",
  recommendBorder: "22C55E",
  tableHeaderBg: "0B2E2A",
  tableHeaderFg: "FFFFFF",
  tableStripe: "F5F9F8",
  tableBorder: "D9E0DE",
  text: "1A2B28",
  textMuted: "6B8A85",
  danger: "B91C1C",
  success: "15803D",
  gold: "B45309",
  white: "FFFFFF",
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
    keepLines: opts.keepLines,
  });
}

// Headings
function h1(text, opts = {}) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 40, color: C.brandDark, caps: false })],
    spacing: { before: 480, after: 200 },
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: opts.pageBreak,
    keepNext: true,
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 18, color: C.brandPrimary, space: 4 },
    },
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

// Callouts
function calloutBox(runs, kind = "note") {
  const colors = {
    note: { bg: C.calloutBg, border: C.calloutBorder, label: "💡 LƯU Ý" },
    recommend: { bg: C.recommendBg, border: C.recommendBorder, label: "✅ KHUYẾN NGHỊ" },
    warning: { bg: "FEE2E2", border: C.danger, label: "⚠️ CẢNH BÁO" },
    highlight: { bg: "FEF3C7", border: C.gold, label: "⭐ ĐIỂM NHẤN" },
  };
  const cfg = colors[kind] || colors.note;
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
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
          }),
        ],
      }),
    ],
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
    rowSpan: opts.rowSpan,
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
    if (/^[\d.,+\-~<≥>%]+$/.test(s)) return true;
    if (/(VND|triệu|tỷ|tr\/|%|\+\d+)/.test(String(v))) return true;
    return false;
  };

  return new Table({
    rows: [
      new TableRow({
        tableHeader: true,
        height: { value: 500, rule: HeightRule.ATLEAST },
        children: headers.map((h, i) => cell(h, {
          bold: true,
          color: C.tableHeaderFg,
          fill: C.tableHeaderBg,
          align: AlignmentType.CENTER,
          size: 20,
          width: { size: colWidths[i], type: WidthType.DXA },
        })),
      }),
      ...rows.map((row, rIdx) =>
        new TableRow({
          children: row.map((v, i) => {
            const cellOpts = { width: { size: colWidths[i], type: WidthType.DXA } };
            if (rIdx % 2 === 1) cellOpts.fill = C.tableStripe;
            // Last row as total?
            const isTotalRow = row.some(c => /Tổng\s*(cộng|phí|$)/i.test(String(c)));
            if (isTotalRow) {
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
  // Top brand banner (full width table with dark bg)
  const topBanner = new Table({
    rows: [
      new TableRow({
        height: { value: 1400, rule: HeightRule.EXACT },
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [run("R E B O R N", { bold: true, size: 36, color: C.brandPrimary, spacing: 80 })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 60 },
              }),
              new Paragraph({
                children: [run("JSC", { size: 20, color: C.brandPrimaryLight, spacing: 40 })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
              }),
            ],
            shading: { type: ShadingType.CLEAR, color: "auto", fill: C.brandDark },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.SINGLE, size: 18, color: C.brandAccent },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
            },
            width: { size: 9200, type: WidthType.DXA },
            verticalAlign: "center",
          }),
        ],
      }),
    ],
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });

  return [
    topBanner,
    spacer(400),

    para(run("BÁO GIÁ GIẢI PHÁP", {
      bold: true, size: 24, color: C.brandPrimary, spacing: 60, caps: true,
    }), { align: AlignmentType.CENTER, before: 0, after: 120 }),

    para(run("Nền tảng Loyalty", {
      bold: true, size: 56, color: C.brandDark,
    }), { align: AlignmentType.CENTER, before: 0, after: 40 }),

    para(run("cho Chuỗi Siêu thị Bán lẻ", {
      bold: true, size: 40, color: C.brandDark,
    }), { align: AlignmentType.CENTER, before: 0, after: 240 }),

    // Decorative bar
    new Table({
      rows: [new TableRow({
        height: { value: 80, rule: HeightRule.EXACT },
        children: [
          new TableCell({
            children: [new Paragraph({ children: [run(" ")] })],
            shading: { type: ShadingType.CLEAR, color: "auto", fill: C.brandAccent },
            width: { size: 2800, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE, size: 0, color: "auto" }, bottom: { style: BorderStyle.NONE, size: 0, color: "auto" }, left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" } },
          }),
        ],
      })],
      alignment: AlignmentType.CENTER,
      width: { size: 2800, type: WidthType.DXA },
    }),

    spacer(400),

    // Meta info with 4 KPI-like boxes
    new Table({
      rows: [
        new TableRow({
          height: { value: 900, rule: HeightRule.ATLEAST },
          children: [
            cell([
              new Paragraph({ children: [run("KHÁCH HÀNG", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("Chuỗi siêu thị bán lẻ", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("2 brand · ~300 store · 3M KHTV", { size: 16, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
            cell([
              new Paragraph({ children: [run("ĐƠN VỊ BÁO GIÁ", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("Reborn JSC", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("ceo@reborn.vn  ·  reborn.vn", { size: 16, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
          ],
        }),
        new TableRow({
          height: { value: 700, rule: HeightRule.ATLEAST },
          children: [
            cell([
              new Paragraph({ children: [run("PHIÊN BẢN", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("1.1 — Pre-survey", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("(ưu đãi cạnh tranh −20%)", { size: 14, color: C.brandAccent, italic: true, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("Bao phủ mọi kịch bản", { size: 16, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
            cell([
              new Paragraph({ children: [run("HIỆU LỰC", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("30 ngày", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("kể từ 23/04/2026", { size: 16, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
          ],
        }),
      ],
      width: { size: 9200, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
    }),

    spacer(400),

    // Confidential stamp
    para([
      run("🔒  ", { size: 20 }),
      run("TÀI LIỆU MẬT — CHỈ DÙNG NỘI BỘ KHÁCH HÀNG", { size: 18, italic: true, color: C.textMuted, spacing: 60 }),
    ], { align: AlignmentType.CENTER, before: 200, after: 60 }),

    para(run("Phát hành bởi Reborn JSC, 23/04/2026", {
      size: 18, italic: true, color: C.textMuted,
    }), { align: AlignmentType.CENTER }),

    // Page break to next page
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ═══ TABLE OF CONTENTS ══════════════════════════════════════════════════
function buildTOC() {
  const items = [
    ["1", "TÓM TẮT 3 GÓI CHUẨN", "3"],
    ["2", "CHI TIẾT TỪNG GÓI", "4"],
    ["3", "MÔ-ĐUN TUỲ CHỌN (ADD-ONS)", "7"],
    ["4", "CHI PHÍ VẬN HÀNH HÀNG NĂM", "8"],
    ["5", "MÔ HÌNH HẠ TẦNG — 3 PHƯƠNG ÁN", "9"],
    ["6", "MÔ HÌNH THANH TOÁN — 4 TUỲ CHỌN", "10"],
    ["7", "KỊCH BẢN GIÁ THEO TRẢ LỜI KHẢO SÁT", "11"],
    ["8", "LỊCH THANH TOÁN ĐỀ XUẤT", "13"],
    ["9", "CAM KẾT & ĐIỀU KHOẢN", "13"],
    ["10", "SO SÁNH VỚI THỊ TRƯỜNG", "14"],
    ["11", "CÁC BƯỚC TIẾP THEO", "15"],
  ];

  return [
    h1("MỤC LỤC"),
    spacer(120),
    new Table({
      rows: items.map((item, i) => new TableRow({
        height: { value: 400, rule: HeightRule.ATLEAST },
        children: [
          cell(item[0], {
            bold: true, color: C.brandPrimary, align: AlignmentType.CENTER, size: 22,
            width: { size: 700, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE, size: 0, color: "auto" }, bottom: { style: BorderStyle.DOTTED, size: 4, color: C.tableBorder }, left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" } },
          }),
          cell(item[1], {
            color: C.brandDark, size: 22, bold: true,
            width: { size: 7500, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE, size: 0, color: "auto" }, bottom: { style: BorderStyle.DOTTED, size: 4, color: C.tableBorder }, left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" } },
          }),
          cell(item[2], {
            color: C.textMuted, align: AlignmentType.RIGHT, size: 20,
            width: { size: 1000, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE, size: 0, color: "auto" }, bottom: { style: BorderStyle.DOTTED, size: 4, color: C.tableBorder }, left: { style: BorderStyle.NONE, size: 0, color: "auto" }, right: { style: BorderStyle.NONE, size: 0, color: "auto" } },
          }),
        ],
      })),
      width: { size: 9200, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
    }),
    spacer(480),
    calloutBox([
      run("Báo giá này được lập ", { size: 22 }),
      run("trước khi quý khách gửi phiếu khảo sát chi tiết", { bold: true, size: 22, color: C.brandDark }),
      run(". Các con số dưới đây là ", { size: 22 }),
      run("khung tham chiếu cho 3 gói chuẩn", { bold: true, size: 22 }),
      run(" + mô-đun tuỳ chọn + các kịch bản theo trả lời khảo sát. Sau khi quý khách trả lời phiếu khảo sát (", { size: 22 }),
      run("Phieu-khao-sat-Loyalty.xlsx", { italic: true, bold: true, size: 22, color: C.brandPrimary }),
      run("), Reborn sẽ gửi ", { size: 22 }),
      run("BÁO GIÁ CÁ NHÂN HOÁ", { bold: true, size: 22, color: C.brandDark }),
      run(" trong 5 ngày làm việc.", { size: 22 }),
    ], "note"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ═══ CONTENT BUILDING ═══════════════════════════════════════════════════
const content = [
  ...buildCoverPage(),
  ...buildTOC(),

  // ═══ 1. TÓM TẮT 3 GÓI ═════
  h1("1.  TÓM TẮT 3 GÓI CHUẨN"),
  para(run("Reborn đề xuất 3 gói chuẩn tương ứng 3 phân khúc ngân sách và phạm vi. Mỗi gói có thể bổ sung mô-đun tuỳ chọn (§3) và điều chỉnh theo kịch bản khảo sát (§7).", { italic: true, size: 22, color: C.textMuted }), { after: 160 }),

  buildTable(
    ["Gói", "Phù hợp khi", "Phạm vi chính", "Giá tham chiếu (VND)"],
    [
      ["STARTER", "Ngân sách < 1 tỷ, triển khai nhanh 3–4 tháng, 1 brand pilot", "Hội viên + Tích điểm + Hạng + Đổi thưởng + API POS 1 brand (~150 store)", "712.000.000"],
      ["STANDARD  ⭐", "Ngân sách 1.2–2 tỷ, triển khai 6 tháng, cả 2 brand, migration đủ 4 hệ thống cũ", "STARTER + Migration 4 hệ thống + Cross-brand + Dashboard + Training + SLA 99.5%", "1.512.000.000"],
      ["PREMIUM", "Ngân sách 2.4–4 tỷ, muốn thay agency marketing, sẵn sàng scale 1.500 store", "STANDARD + Marketing Auto + RFM/CLV/Churn ML + CSKH + PoC 4 tuần", "2.392.000.000"],
    ],
    [1400, 2600, 3400, 1800],
    { firstColBold: true }
  ),

  spacer(160),

  calloutBox([
    run("Giá trên đã bao gồm: ", { bold: true, color: C.brandDark, size: 22 }),
    run("Phần mềm + Triển khai + Migration + Đào tạo + Bảo hành 6 tháng. ", { size: 22 }),
    run("Chưa bao gồm: ", { bold: true, color: C.danger, size: 22 }),
    run("VAT 10% và chi phí hạ tầng on-prem.", { size: 22 }),
  ], "highlight"),

  // ═══ 2. CHI TIẾT TỪNG GÓI ═════
  h1("2.  CHI TIẾT TỪNG GÓI", { pageBreak: true }),

  // 2.1 STARTER
  h2("2.1.  Gói STARTER  —  712 triệu VND"),
  para([run("Phù hợp khi:", { bold: true, size: 22, color: C.brandDark }), run(" khách muốn triển khai nhanh, pilot 1 brand trước để kiểm chứng giá trị trước khi mở rộng.", { size: 22, italic: true })], { after: 120 }),

  para(run("Phạm vi bao phủ", { bold: true, size: 24, color: C.brandDark2 })),
  bullet("Triển khai cho 1 brand pilot trước (~150 store, chọn brand có data sạch nhất)"),
  bullet("Nền tảng Loyalty core: Hội viên, Tích điểm, Hạng, Hạn điểm, Đổi thưởng"),
  bullet("Import data KHTV từ 1 hệ thống cũ (Goldmem HOẶC Access)"),
  bullet("API tích hợp POS qua autoEarn / consumePoint"),
  bullet("Admin dashboard cơ bản + API docs"),
  bullet("Cloud hosting Reborn-managed (năm đầu miễn phí, năm 2+ tính 144tr/năm)"),
  bullet("Đào tạo 1 buổi admin (10 người) + SLA 99.0% uptime, hỗ trợ 8×5"),

  spacer(120),
  para(run("Chi phí chi tiết", { bold: true, size: 24, color: C.brandDark2 })),

  buildTable(
    ["Hạng mục", "VND"],
    [
      ["License phần mềm (1 năm)", "224.000.000"],
      ["Triển khai & Cấu hình", "208.000.000"],
      ["Migration 1 hệ thống cũ (Goldmem HOẶC Access)", "112.000.000"],
      ["Tích hợp POS 1 brand (~150 store)", "104.000.000"],
      ["Đào tạo admin (1 buổi)", "24.000.000"],
      ["Bảo hành 6 tháng + hỗ trợ 8×5", "40.000.000"],
      ["Tổng cộng (trước VAT)", "712.000.000"],
    ],
    [6200, 3000]
  ),

  spacer(120),
  calloutBox([
    run("Không bao gồm trong gói STARTER: ", { bold: true, color: C.danger, size: 22 }),
    run("Migration brand thứ 2, cross-brand points, marketing automation, CSKH module, hạ tầng on-prem.", { size: 22 }),
  ], "warning"),

  // 2.2 STANDARD
  h2("2.2.  Gói STANDARD  —  1.512 triệu VND  ⭐ KHUYẾN NGHỊ"),
  calloutBox([
    run("Đây là gói phù hợp nhất cho bài toán của quý khách", { bold: true, size: 22, color: C.success }),
    run(" (2 brand, ~300 store, 3M KHTV, cần migration 4 hệ thống cũ). Tỷ lệ chi phí / phạm vi tốt nhất thị trường ở quy mô này.", { size: 22 }),
  ], "recommend"),

  para(run("Phạm vi bao phủ", { bold: true, size: 24, color: C.brandDark2 })),
  bullet("Triển khai cả 2 brand, ~300 cửa hàng"),
  bullet([
    run("Migration đầy đủ 4 hệ thống cũ: ", { bold: true, size: 22, color: C.brandDark }),
    run("Goldmem + MS Access + MS Excel + Supporter → 1 hồ sơ KH 360°", { size: 22 }),
  ]),
  bullet("Nền tảng Loyalty đầy đủ: Core + Cross-brand + Referral + Leaderboard + Hạng linh hoạt"),
  bullet("Tích hợp POS + Website + Mobile App của cả 2 brand"),
  bullet("Dashboard + Báo cáo nâng cao (retention, CLV, xu hướng điểm, phân bổ hạng)"),
  bullet("Module CSKH (thay Supporter) — khiếu nại gắn với hồ sơ KHTV"),
  bullet("Cloud hosting Reborn-managed (năm đầu miễn phí, năm 2+ tính 192tr/năm)"),
  bullet("Đào tạo 3 buổi: admin + super-user + end-user"),
  bullet("SLA: 99.5% uptime, hỗ trợ 8×5 response < 4h, sự cố P1 24/7 < 30 phút"),

  spacer(120),
  para(run("Chi phí chi tiết", { bold: true, size: 24, color: C.brandDark2 })),

  buildTable(
    ["Hạng mục", "VND"],
    [
      ["License phần mềm (1 năm, multi-brand)", "416.000.000"],
      ["Triển khai & Cấu hình", "344.000.000"],
      ["Migration đầy đủ 4 hệ thống + dedupe + merge", "256.000.000"],
      ["Tích hợp POS 2 brand (~300 store)", "184.000.000"],
      ["Tích hợp Website + Mobile App (2 brand)", "112.000.000"],
      ["Module CSKH (thay Supporter)", "72.000.000"],
      ["Dashboard + Báo cáo nâng cao", "56.000.000"],
      ["Đào tạo 3 buổi + tài liệu video", "40.000.000"],
      ["Bảo hành 6 tháng + hỗ trợ 8×5 + P1 24/7", "32.000.000"],
      ["Tổng cộng (trước VAT)", "1.512.000.000"],
    ],
    [6200, 3000]
  ),

  // 2.3 PREMIUM
  h2("2.3.  Gói PREMIUM  —  2.392 triệu VND"),
  para([run("Phù hợp khi:", { bold: true, size: 22, color: C.brandDark }), run(" khách muốn thay thế agency marketing ngoài, triển khai ML cá nhân hoá, và sẵn sàng mở rộng lên 1.500 điểm bán.", { size: 22, italic: true })], { after: 120 }),

  para(run("Phạm vi bao phủ", { bold: true, size: 24, color: C.brandDark2 })),
  bullet("Tất cả gói STANDARD"),
  bullet([
    run("Marketing Automation nội bộ: ", { bold: true, size: 22, color: C.brandDark }),
    run("Email, SMS, Push, Zalo OA — giảm phụ thuộc agency ngoài", { size: 22 }),
  ]),
  bullet("Phân khúc khách hàng RFM + CLV + Churn Prediction (ML)"),
  bullet("PoC 4 tuần trên sample data trước khi ký hợp đồng chính thức"),
  bullet("Cloud hosting dedicated + Disaster Recovery setup"),
  bullet("Đào tạo 5 buổi + 1 workshop chiến dịch marketing"),
  bullet("SLA: 99.9% uptime, hỗ trợ 24×7 response < 1h"),

  spacer(120),
  para(run("Chi phí chi tiết", { bold: true, size: 24, color: C.brandDark2 })),

  buildTable(
    ["Hạng mục", "VND"],
    [
      ["License phần mềm (1 năm, multi-brand + ML)", "624.000.000"],
      ["Triển khai & Cấu hình", "408.000.000"],
      ["Migration đầy đủ 4 hệ thống + dedupe + merge", "256.000.000"],
      ["Tích hợp POS + Website + App 2 brand", "304.000.000"],
      ["Module CSKH + Call-center integration", "120.000.000"],
      ["Marketing Automation Engine (4 kênh)", "336.000.000"],
      ["RFM + CLV + Churn ML module", "152.000.000"],
      ["PoC 4 tuần (sample data)", "48.000.000"],
      ["DR + Dedicated Cloud (1 năm)", "72.000.000"],
      ["Đào tạo 5 buổi + workshop campaign", "48.000.000"],
      ["Bảo hành 6 tháng + SLA 24×7", "24.000.000"],
      ["Tổng cộng (trước VAT)", "2.392.000.000"],
    ],
    [6200, 3000]
  ),

  // ═══ 3. ADD-ONS ═════
  h1("3.  MÔ-ĐUN TUỲ CHỌN (ADD-ONS)", { pageBreak: true }),
  para(run("Có thể chọn thêm cho bất kỳ gói nào — Reborn báo giá từng mô-đun độc lập để khách linh hoạt.", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),
  buildTable(
    ["#", "Mô-đun", "Mô tả ngắn", "Giá (VND)"],
    [
      ["1", "Gamification Pack", "Check-in, quay số may mắn, nhiệm vụ, thành tích", "120.000.000"],
      ["2", "Referral 2-chiều nâng cao", "Thưởng cả người mời + người được mời, leaderboard", "64.000.000"],
      ["3", "Mini-app Zalo", "Tra cứu điểm, đổi thưởng, đăng ký qua Zalo Mini App", "176.000.000"],
      ["4", "SDK tích hợp mobile app hiện có", "Hiển thị thẻ & điểm trong app iOS/Android", "144.000.000"],
      ["5", "Đổi điểm ra ví điện tử", "Tích hợp VNPay / MoMo / ZaloPay", "128.000.000"],
      ["6", "Voucher đối tác liên kết", "CGV / Grab / Highlands...", "112.000.000"],
      ["7", "SSO / LDAP integration", "Azure AD / Okta / Keycloak / OpenLDAP", "76.000.000"],
      ["8", "Tích hợp ERP (Bravo, MISA, SAP)", "Đồng bộ SP + công nợ KHTV", "104.000.000"],
      ["9", "BI integration (Power BI / Tableau)", "Data pipeline real-time", "60.000.000"],
      ["10", "ISO 27001 compliance consulting", "Tư vấn đạt chứng chỉ, hỗ trợ audit", "144.000.000"],
      ["11", "Tăng cường bảo mật (WAF+DDoS+SIEM)", "Khuyến nghị với gói Premium", "176.000.000"],
      ["12", "Migration hệ thống cũ bổ sung", "Ngoài 4 hệ thống cơ bản", "64–120 tr / hệ"],
      ["13", "Thêm ngôn ngữ giao diện", "Anh, Trung...", "40 tr / ngôn ngữ"],
      ["14", "Mở rộng cho cửa hàng mới", "Batch 100 store", "48 tr / batch"],
      ["15", "Dedicated Customer Success Manager", "1 người phụ trách riêng, vận hành sau go-live", "192 tr / năm"],
    ],
    [600, 2300, 4000, 2300]
  ),

  // ═══ 4. ANNUAL COST ═════
  h1("4.  CHI PHÍ VẬN HÀNH HÀNG NĂM (NĂM 2+)", { pageBreak: true }),
  para(run("Sau khi hết 6 tháng bảo hành, khách tiếp tục duy trì dịch vụ theo phí vận hành hàng năm.", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),

  buildTable(
    ["Hạng mục", "STARTER", "STANDARD", "PREMIUM"],
    [
      ["License & cập nhật (năm 2+)", "184.000.000", "352.000.000", "496.000.000"],
      ["Cloud hosting (Reborn-managed)", "144.000.000", "192.000.000", "288.000.000"],
      ["Support & Maintenance", "64.000.000", "112.000.000", "176.000.000"],
      ["Tổng phí năm 2 (trước VAT)", "392.000.000", "656.000.000", "960.000.000"],
    ],
    [3800, 1800, 1800, 1800],
    { firstColBold: true }
  ),

  spacer(200),
  h3("Phí scale theo cửa hàng (khi chuỗi vượt quy mô đã ký)"),
  buildTable(
    ["Quy mô mở rộng", "Phí thêm / năm"],
    [
      ["300 → 500 store", "+120.000.000"],
      ["500 → 800 store", "+224.000.000"],
      ["800 → 1.200 store", "+336.000.000"],
      ["1.200 → 1.500 store", "+416.000.000"],
    ],
    [6200, 3000]
  ),

  spacer(140),
  calloutBox([
    run("Ưu đãi cam kết dài hạn: ", { bold: true, size: 22, color: C.success }),
    run("Ký hợp đồng 3 năm → ", { size: 22 }),
    run("giảm 15% tổng trị giá", { bold: true, size: 22, color: C.success }),
    run(", khoá giá năm 1, bao phủ phí scale cho kế hoạch mở rộng 1.500 điểm bán.", { size: 22 }),
  ], "recommend"),

  // ═══ 5. HẠ TẦNG ═════
  h1("5.  MÔ HÌNH HẠ TẦNG — 3 PHƯƠNG ÁN", { pageBreak: true }),

  buildTable(
    ["Phương án", "Mô tả", "Chi phí triển khai thêm", "Chi phí hạ tầng hàng năm"],
    [
      ["Cloud Reborn-Managed ⭐", "Reborn vận hành trên cloud VN (VNG/FPT/Viettel IDC). Deploy 2–3 tuần. Scale đàn hồi.", "0 (mặc định)", "Đã có trong §4"],
      ["Hybrid (App Cloud, DB On-Prem)", "Application trên cloud, DB tại server khách. Cân bằng tuân thủ + tốc độ.", "+144.000.000", "DB: 150–250 tr  +  Cloud app: 96 tr / năm"],
      ["On-Premise toàn bộ", "Deploy trên server nội bộ. Phù hợp khi có yêu cầu nghiêm ngặt về data residency.", "+256.000.000", "Server đầu tư: 400–600 tr  +  Vận hành: 100 tr / năm"],
    ],
    [2200, 3000, 2000, 2000],
    { firstColBold: true }
  ),

  spacer(200),
  calloutBox([
    run("Khuyến nghị: ", { bold: true, size: 22, color: C.success }),
    run("Cloud Reborn-Managed. Deploy nhanh, không cần Phòng CNTT&CĐS vận hành hạ tầng, dễ scale khi mở thêm cửa hàng. Nếu có yêu cầu data residency VN, đã mặc định là cloud VN.", { size: 22 }),
  ], "recommend"),

  // ═══ 6. PAYMENT MODEL ═════
  h1("6.  MÔ HÌNH THANH TOÁN — 4 TUỲ CHỌN", { pageBreak: true }),
  buildTable(
    ["Mô hình", "Năm 1", "Năm 2+", "Phù hợp khi"],
    [
      ["One-time license", "100% trả trước", "Maintenance 18%/năm + hosting", "Khách có ngân sách CAPEX, muốn sở hữu license"],
      ["Subscription SaaS", "Chia 12 kỳ / tháng", "Chia 12 kỳ / tháng", "Khách muốn OPEX, linh hoạt"],
      ["Theo milestone ⭐", "30%-30%-30%-10% theo mốc", "Subscription hoặc tiếp tục milestone", "Cân bằng rủi ro — phổ biến nhất"],
      ["Theo cửa hàng", "Setup + phí theo store kích hoạt", "Tương tự", "Khi chuỗi mở rộng dần, trả theo thực tế"],
    ],
    [2200, 2400, 2200, 2400],
    { firstColBold: true }
  ),

  h2("6.1.  Chi tiết phí maintenance cho phương án One-time license"),
  para([
    run("Khi chọn ", { size: 22 }),
    run("One-time license", { bold: true, size: 22, color: C.brandDark }),
    run(", từ năm 2 trở đi khách duy trì dịch vụ với ", { size: 22 }),
    run("phí maintenance 18%/năm", { bold: true, size: 22, color: C.brandDark }),
    run(" trên giá trị hợp đồng năm 1. Phí này bao gồm: license cập nhật version mới, hỗ trợ kỹ thuật, hotfix bảo mật, backup định kỳ. ", { size: 22 }),
    run("Cloud hosting tính riêng", { bold: true, size: 22, color: C.brandDark }),
    run(" nếu khách chọn Cloud Reborn-managed (xem §5).", { size: 22 }),
  ], { after: 140 }),
  buildTable(
    ["Gói", "Giá trị HĐ năm 1", "Maintenance 18%/năm", "Cloud hosting (nếu dùng)", "Tổng năm 2+"],
    [
      ["STARTER", "712.000.000", "128.160.000", "144.000.000", "272.160.000"],
      ["STANDARD", "1.512.000.000", "272.160.000", "192.000.000", "464.160.000"],
      ["PREMIUM", "2.392.000.000", "430.560.000", "288.000.000", "718.560.000"],
    ],
    [1400, 2000, 2000, 2000, 1800],
    { firstColBold: true }
  ),
  spacer(140),
  calloutBox([
    run("Lưu ý: ", { bold: true, size: 22, color: C.brandDark }),
    run("Nếu khách chọn On-Premise (không dùng cloud Reborn), ", { size: 22 }),
    run("chỉ trả phí maintenance 18%", { bold: true, size: 22 }),
    run(" — cột cloud hosting bỏ qua. Maintenance đảm bảo phần mềm luôn được cập nhật, vá lỗi, và có support nhanh khi phát sinh sự cố.", { size: 22 }),
  ], "note"),

  // ═══ 7. KỊCH BẢN GIÁ ═════
  h1("7.  KỊCH BẢN GIÁ THEO TRẢ LỜI KHẢO SÁT", { pageBreak: true }),
  calloutBox([
    run("Mỗi bảng dưới đây là khung tham chiếu theo 1 tiêu chí độc lập trong phiếu khảo sát. Khi quý khách gửi khảo sát, Reborn sẽ ", { size: 22 }),
    run("kết hợp các tiêu chí", { bold: true, size: 22 }),
    run(" để đưa ra đề xuất cuối cùng phù hợp nhất.", { size: 22 }),
  ], "note"),

  h2("7.1.  Theo ngân sách"),
  buildTable(
    ["Ngân sách khách trả lời", "Gói đề xuất", "Ghi chú"],
    [
      ["< 800 triệu", "STARTER", "Pilot 1 brand trước, mở rộng năm 2"],
      ["0.8 – 1.2 tỷ", "STANDARD tối giản", "Giảm 1 số add-on, giữ core + migration + 2 brand"],
      ["1.2 – 2 tỷ", "STANDARD  ⭐", "Phù hợp nhất cho 300 store + 3M KHTV"],
      ["2 – 3 tỷ", "PREMIUM", "Thay thế agency marketing, PoC nghiêm túc"],
      ["> 3 tỷ", "PREMIUM + Add-ons", "Thêm gamification, mini-app, ML nâng cao"],
    ],
    [2600, 2800, 3800],
    { firstColBold: true }
  ),

  h2("7.2.  Theo timeline"),
  buildTable(
    ["Timeline khách mong muốn", "Gói phù hợp", "Điều chỉnh"],
    [
      ["2 – 3 tháng go-live pilot", "STARTER", "1 brand, 50 store pilot"],
      ["4 tháng go-live toàn chuỗi", "STANDARD", "Rút gọn bằng tăng nhân sự (+15% chi phí)"],
      ["6 tháng go-live toàn chuỗi  ⭐", "STANDARD chuẩn", "Lộ trình mặc định trong đề xuất"],
      ["9 – 12 tháng, không vội", "PREMIUM", "Bổ sung PoC, marketing auto hoàn chỉnh"],
    ],
    [3000, 2400, 3800],
    { firstColBold: true }
  ),

  h2("7.3.  Theo mô hình hạ tầng"),
  buildTable(
    ["Khách chọn", "Ảnh hưởng", "Chi phí biến động"],
    [
      ["Cloud Reborn-Managed", "Mặc định — giá như báo", "Không đổi"],
      ["Hybrid", "Thêm DB on-prem", "+144tr triển khai,  −24tr/năm cloud"],
      ["On-Prem toàn bộ", "Khách tự lo hạ tầng", "+256tr triển khai,  −144tr/năm,  khách +400–600tr server"],
    ],
    [2600, 3000, 3600],
    { firstColBold: true }
  ),

  h2("7.4.  Theo số hệ thống tích hợp thêm"),
  buildTable(
    ["Số hệ thống tích hợp thêm", "Chi phí thêm"],
    [
      ["0 (chỉ 4 hệ thống cơ bản)", "Đã có trong gói STANDARD"],
      ["1 hệ thống (VD: ERP Bravo)", "+104 triệu"],
      ["2 – 3 hệ thống (POS phụ, BI, SSO)", "+184 – 272 triệu"],
      ["Tích hợp hệ sinh thái (VNPay, Grab, CGV...)", "+112 triệu / đối tác"],
    ],
    [6000, 3200]
  ),

  h2("7.5.  Theo kế hoạch mở rộng"),
  buildTable(
    ["Số cửa hàng mục tiêu 3 năm", "Phương án", "Ghi chú"],
    [
      ["Giữ ~300 store", "STANDARD + phí năm 2+ cố định", ""],
      ["Mở rộng 500 – 800 store", "STANDARD + Scale pack", "+120tr/năm từ năm 2"],
      ["Mở rộng 1.000 – 1.500 store  ⭐", "STANDARD/PREMIUM + cam kết 3 năm", "Giảm 15% tổng, bao phủ phí scale"],
    ],
    [3000, 3400, 2800],
    { firstColBold: true }
  ),

  h2("7.6.  Theo yêu cầu marketing automation"),
  buildTable(
    ["Khách chọn", "Gói đề xuất"],
    [
      ["Vẫn dùng agency ngoài, không cần auto", "STARTER / STANDARD"],
      ["Muốn thay agency từng phần", "STANDARD + Add-on Marketing (336tr riêng)"],
      ["Muốn thay hoàn toàn agency", "PREMIUM (đã bao gồm)"],
    ],
    [4600, 4600]
  ),

  h2("7.7.  Theo yêu cầu bảo mật"),
  buildTable(
    ["Khách yêu cầu", "Phương án"],
    [
      ["Mặc định (TLS, audit log, RBAC)", "Có trong mọi gói"],
      ["ISO 27001 consulting", "+144 triệu (add-on)"],
      ["PCI-DSS (nếu lưu thẻ)", "Tư vấn riêng — ước tính 200–280 triệu"],
      ["WAF + DDoS + SIEM", "+176 triệu"],
      ["Data residency VN", "Bắt buộc Cloud VN / On-prem (đã mặc định)"],
    ],
    [4600, 4600]
  ),

  // ═══ 8. LỊCH THANH TOÁN ═════
  h1("8.  LỊCH THANH TOÁN ĐỀ XUẤT", { pageBreak: true }),
  para(run("Mẫu cho gói STANDARD (1.512 triệu VND). Các gói khác áp dụng tỷ lệ % tương tự.", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),

  buildTable(
    ["Milestone", "%", "Số tiền (VND)", "Thời điểm"],
    [
      ["Ký hợp đồng", "30%", "453.600.000", "T0"],
      ["Hoàn tất Phase 1 (pilot Brand A)", "30%", "453.600.000", "T2 (cuối tháng 2)"],
      ["Hoàn tất Phase 2 (rollout 300 store)", "30%", "453.600.000", "T4 (cuối tháng 4)"],
      ["Nghiệm thu cuối cùng", "10%", "151.200.000", "T6 (cuối tháng 6)"],
      ["Tổng cộng", "100%", "1.512.000.000", ""],
    ],
    [3400, 1200, 2600, 2000],
    { firstColBold: true }
  ),
  spacer(100),
  para(run("VAT 10% tính trên từng đợt thanh toán.", { italic: true, size: 20, color: C.textMuted })),

  // ═══ 9. CAM KẾT ═════
  h1("9.  CAM KẾT & ĐIỀU KHOẢN"),

  h2("9.1.  Cam kết chất lượng"),
  bullet("Bảo hành 6 tháng sau nghiệm thu — fix bug miễn phí"),
  bullet("Cam kết SLA theo gói đã chọn (99.0% / 99.5% / 99.9%)"),
  bullet("Hỗ trợ Zalo / Email / Hotline theo giờ cam kết"),
  bullet([
    run("Phạt vi phạm SLA: ", { bold: true, size: 22 }),
    run("giảm 5% phí năm đó cho mỗi 0.1% uptime thiếu hụt (cap 30%)", { size: 22 }),
  ]),

  h2("9.2.  Quyền sở hữu & Data"),
  bullet("Khách hàng sở hữu toàn bộ data (hội viên, giao dịch, config)"),
  bullet("Data export bất kỳ lúc nào (CSV, API, SQL dump)"),
  bullet("Source code theo thoả thuận: One-time license → khách có source; SaaS → khách có quyền export data đầy đủ"),

  h2("9.3.  Điều kiện chấm dứt & Điều khoản giá"),
  bullet("Khách có thể chấm dứt sau năm 1 với 60 ngày thông báo trước"),
  bullet("Reborn hỗ trợ transition đến nhà cung cấp khác (tối đa 3 tháng, phí riêng)"),
  bullet("Báo giá này hiệu lực 30 ngày"),
  bullet("Phí năm 2+ có thể điều chỉnh tối đa 5%/năm theo CPI"),
  bullet([
    run("Ký hợp đồng 3 năm ", { size: 22 }),
    run("→ khoá giá năm 1, giảm 15% tổng trị giá", { bold: true, size: 22, color: C.success }),
  ]),

  // ═══ 10. SO SÁNH THỊ TRƯỜNG ═════
  h1("10.  SO SÁNH VỚI THỊ TRƯỜNG", { pageBreak: true }),
  h2("10.1.  Đối chiếu gói STANDARD với các nhà cung cấp khác"),
  buildTable(
    ["Nhà cung cấp", "Phạm vi tương đương", "Giá tham chiếu (VND)", "Điểm khác"],
    [
      ["Reborn JSC (đề xuất)  ⭐", "Full 2 brand, migration 4 hệ thống, 300 store", "1.512.000.000", "Team Việt, có source, đã áp dụng ưu đãi cạnh tranh −20%"],
      ["Vendor Enterprise nước ngoài (A)", "Loyalty core multi-brand", "3.500.000.000 – 5.000.000.000", "Pricing USD, hỗ trợ chậm, cần consultant ngoài"],
      ["Vendor SaaS quốc tế (B)", "Subscription theo MAU (3M)", "~ 2.800.000.000 / năm", "Chi phí tăng theo quy mô, lock-in, data không tại VN"],
      ["Build in-house (team mới)", "Tương đương phạm vi", "2.500.000.000 – 4.000.000.000  + 18–24 tháng", "Rủi ro delay, thiếu kinh nghiệm retail"],
      ["Vendor VN khác (C, D, E)", "Loyalty cơ bản, 1 brand", "600.000.000 – 1.200.000.000", "Thường thiếu migration + multi-brand + CSKH"],
    ],
    [2200, 2400, 2400, 2200],
    { firstColBold: true }
  ),
  spacer(160),
  calloutBox([
    run("Kết luận: ", { bold: true, size: 22, color: C.success }),
    run("Gói STANDARD của Reborn có lợi thế cạnh tranh mạnh ở ", { size: 22 }),
    run("TỶ LỆ CHI PHÍ / PHẠM VI", { bold: true, size: 22 }),
    run(" — đặc biệt giá trị migration đầy đủ 4 hệ thống cũ mà ít vendor khác có.", { size: 22 }),
  ], "recommend"),

  h2("10.2.  Đối chiếu gói PREMIUM"),
  buildTable(
    ["Gói", "Phạm vi", "Giá"],
    [
      ["Reborn PREMIUM  ⭐", "Full + Marketing Auto + ML + PoC + SLA 24/7", "2.392.000.000"],
      ["Vendor quốc tế tương đương", "SFDC Marketing Cloud + Loyalty", "6.000.000.000+ (quy USD)"],
      ["Build in-house", "Team 12 người × 18 tháng", "~ 4.500.000.000"],
    ],
    [2800, 4200, 2200],
    { firstColBold: true }
  ),

  // ═══ 11. NEXT STEPS ═════
  h1("11.  CÁC BƯỚC TIẾP THEO", { pageBreak: true }),

  new Table({
    rows: [1, 2, 3, 4, 5].map((n) => {
      const steps = {
        1: { title: "Điền phiếu khảo sát", desc: "Quý khách mở file Phieu-khao-sat-Loyalty.xlsx (gửi kèm) và điền các mục chưa có sẵn." },
        2: { title: "Reborn phân tích", desc: "Reborn sẽ phản hồi báo giá cá nhân hoá trong 5 ngày làm việc." },
        3: { title: "Demo trực tiếp", desc: "Xem giải pháp trên môi trường test — đặt lịch qua ceo@reborn.vn." },
        4: { title: "PoC 4 tuần (tuỳ chọn)", desc: "Với khách cân nhắc gói PREMIUM — Reborn triển khai PoC trên sample data của khách." },
        5: { title: "Thương thảo & Ký kết", desc: "Ký hợp đồng → khởi động Phase 1 trong 2 tuần." },
      };
      const s = steps[n];
      return new TableRow({
        height: { value: 700, rule: HeightRule.ATLEAST },
        children: [
          cell([new Paragraph({ children: [run(String(n), { bold: true, size: 36, color: C.white })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], {
            fill: C.brandPrimary,
            width: { size: 900, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: C.brandPrimary },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: C.brandPrimary },
              left: { style: BorderStyle.SINGLE, size: 4, color: C.brandPrimary },
              right: { style: BorderStyle.SINGLE, size: 4, color: C.brandPrimary },
            },
            vAlign: "center",
          }),
          cell([
            new Paragraph({ children: [run(s.title, { bold: true, size: 26, color: C.brandDark })], spacing: { before: 80, after: 40 } }),
            new Paragraph({ children: [run(s.desc, { size: 22, color: C.text })], spacing: { before: 0, after: 80 } }),
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

  spacer(480),

  // Signature block
  new Table({
    rows: [
      new TableRow({
        height: { value: 1600, rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [run("R E B O R N  J S C", { bold: true, size: 32, color: C.brandPrimary, spacing: 80 })], alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 } }),
              new Paragraph({ children: [run("Đồng hành cùng chuỗi bán lẻ Việt Nam", { italic: true, size: 20, color: C.brandPrimaryLight })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 } }),
              new Paragraph({ children: [run("📧  ceo@reborn.vn", { size: 22, color: C.white })], alignment: AlignmentType.CENTER, spacing: { before: 40, after: 20 } }),
              new Paragraph({ children: [run("🌐  reborn.vn", { size: 22, color: C.white })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("📱  Zalo / Hotline: liên hệ sale đầu mối", { size: 22, color: C.white })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
            ],
            shading: { type: ShadingType.CLEAR, color: "auto", fill: C.brandDark },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 18, color: C.brandAccent },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: C.brandDark },
              left: { style: BorderStyle.SINGLE, size: 4, color: C.brandDark },
              right: { style: BorderStyle.SINGLE, size: 4, color: C.brandDark },
            },
            width: { size: 9200, type: WidthType.DXA },
          }),
        ],
      }),
    ],
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  }),

  spacer(200),
  para(run("Báo giá này lập dựa trên: Q&A khảo sát 04/2026 + Đề xuất giải pháp Loyalty v1.1 (23/04/2026). Mọi điều chỉnh sẽ ghi nhận qua phụ lục sau khi khách hoàn tất phiếu khảo sát.", {
    italic: true, size: 18, color: C.textMuted,
  }), { align: AlignmentType.CENTER }),
];

// ═══ DOCUMENT ═══════════════════════════════════════════════════════════
const doc = new Document({
  creator: "Reborn JSC",
  title: "Báo giá Loyalty Platform",
  description: "Báo giá nền tảng Loyalty cho chuỗi siêu thị bán lẻ",
  styles: {
    default: {
      document: { run: { font: FONT, size: 22 } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { orientation: PageOrientation.PORTRAIT },
          margin: { top: 1200, right: 1000, bottom: 1200, left: 1000, header: 500, footer: 500 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                run("REBORN JSC", { size: 16, color: C.brandPrimary, bold: true, spacing: 40 }),
                run("    •    ", { size: 16, color: C.textMuted }),
                run("Báo giá Loyalty Platform — v1.1 (ưu đãi cạnh tranh)", { size: 16, color: C.textMuted, italic: true }),
              ],
              alignment: AlignmentType.CENTER,
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.brandPrimary, space: 4 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                run("Trang ", { size: 16, color: C.textMuted }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.textMuted }),
                run(" / ", { size: 16, color: C.textMuted }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: C.textMuted }),
                run("    •    ceo@reborn.vn    •    Confidential", { size: 16, color: C.textMuted }),
              ],
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.brandPrimary, space: 4 } },
            }),
          ],
        }),
      },
      children: content,
    },
  ],
});

const outPath = "docs/proposal/bao-gia/Bao-gia-Loyalty-Platform.docx";
Packer.toBuffer(doc).then((buf) => {
  writeFileSync(outPath, buf);
  console.log(`✓ DOCX generated: ${outPath}  (${buf.length} bytes)`);
}).catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
