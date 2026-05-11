// Tạo DOCX phân tích CAPEX Allocation — chạy: node docs/proposal/bao-gia/generate-capex-docx.mjs
// Nguồn: phan-tich-capex-allocation.md
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  Header, Footer, PageNumber, convertInchesToTwip, PageBreak,
  TableLayoutType, HeightRule,
} from "docx";
import { writeFileSync } from "fs";

const C = {
  brandDark: "0B2E2A", brandDark2: "0D3D38",
  brandPrimary: "00C9A7", brandPrimaryLight: "B9F4E4",
  brandAccent: "FF8A3C",
  sectionBg: "E8F5F2", sectionBgSoft: "F5F9F8",
  calloutBg: "FFF7ED", calloutBorder: "FF8A3C",
  warningBg: "FEE2E2", warningBorder: "B91C1C",
  recommendBg: "ECFDF5", recommendBorder: "22C55E",
  tableHeaderBg: "0B2E2A", tableHeaderFg: "FFFFFF",
  tableStripe: "F5F9F8", tableBorder: "D9E0DE",
  text: "1A2B28", textMuted: "6B8A85",
  danger: "B91C1C", dangerSoft: "FEE2E2",
  success: "15803D", successSoft: "DCFCE7",
  gold: "B45309", white: "FFFFFF",
  internal: "6B21A8", internalSoft: "EDE9FE",
};
const FONT = "Calibri";

function run(text, opts = {}) {
  return new TextRun({
    text: String(text ?? ""),
    bold: opts.bold, italic: opts.italic,
    color: opts.color || C.text,
    size: opts.size || 22, font: opts.font || FONT,
    underline: opts.underline ? {} : undefined,
    allCaps: opts.caps, characterSpacing: opts.spacing,
  });
}

function para(runs, opts = {}) {
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [runs],
    alignment: opts.align,
    spacing: { before: opts.before ?? 80, after: opts.after ?? 80, line: opts.line || 300 },
    heading: opts.heading, indent: opts.indent,
    pageBreakBefore: opts.pageBreakBefore,
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
    heading: HeadingLevel.HEADING_2, keepNext: true,
  });
}

function h3(text) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 26, color: C.brandDark2 })],
    spacing: { before: 280, after: 100 },
    heading: HeadingLevel.HEADING_3, keepNext: true,
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
    rows: [new TableRow({ children: [new TableCell({
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
    })] })],
    width: { size: 9200, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });
}

function bullet(text, level = 0, opts = {}) {
  const runs = Array.isArray(text) ? text : [run(text, { size: 22, color: C.text, bold: opts.bold })];
  return new Paragraph({
    children: runs, bullet: { level },
    spacing: { before: 40, after: 40, line: 280 },
    indent: { left: convertInchesToTwip(0.35 + level * 0.3) },
  });
}

function spacer(size = 160) {
  return new Paragraph({ children: [run("")], spacing: { before: size, after: size } });
}

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
    width: opts.width, columnSpan: opts.span,
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
    if (/(VND|triệu|tỷ|tr\/|%|\+\d+|−\d+|năm|khách)/.test(String(v))) return true;
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
            const sv = String(v);
            if (/^−/.test(sv.trim()) || /Margin.*−/.test(sv) || /KHÔNG.*hòa vốn/i.test(sv)) {
              cellOpts.fill = C.dangerSoft; cellOpts.color = C.danger; cellOpts.bold = true;
            }
            if (/^\+\d+%/.test(sv.trim()) && i === row.length - 1) {
              cellOpts.fill = C.successSoft; cellOpts.color = C.success; cellOpts.bold = true;
            }
            // ⭐ rows highlighted
            const hasStar = row.some(c => /⭐/.test(String(c)));
            if (hasStar) {
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
            children: [run("CAPEX ALLOCATION ANALYSIS", { size: 18, color: C.brandAccent, bold: true, spacing: 60 })],
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
    para(run("PHÂN TÍCH PHÂN BỔ CAPEX", { bold: true, size: 22, color: C.internal, spacing: 60, caps: true }),
      { align: AlignmentType.CENTER, before: 0, after: 120 }),
    para(run("Pricing Loyalty Platform", { bold: true, size: 52, color: C.brandDark }),
      { align: AlignmentType.CENTER, before: 0, after: 40 }),
    para(run("Thông lệ ngành · Số khách hoàn vốn · Giá chào điều chỉnh", { bold: true, size: 28, color: C.brandDark }),
      { align: AlignmentType.CENTER, before: 0, after: 240 }),

    spacer(200),
    new Table({
      rows: [
        new TableRow({
          height: { value: 700, rule: HeightRule.ATLEAST },
          children: [
            cell([
              new Paragraph({ children: [run("CÂU HỎI 1", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("Phân bổ khấu hao CAPEX", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("cho bao nhiêu khách thì hết?", { size: 14, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
            cell([
              new Paragraph({ children: [run("CÂU HỎI 2", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("Áp dụng phân bổ đó thì", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("giá chào điều chỉnh thế nào?", { size: 14, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
          ],
        }),
        new TableRow({
          height: { value: 700, rule: HeightRule.ATLEAST },
          children: [
            cell([
              new Paragraph({ children: [run("CAPEX ĐẦU TƯ", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("11,7 tỷ VND", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("Đã build Reborn Loyalty Platform", { size: 14, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
            cell([
              new Paragraph({ children: [run("ĐỀ XUẤT N", { bold: true, size: 16, color: C.brandPrimary, caps: true, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [run("15 khách  ·  5 năm", { size: 18, color: C.brandDark, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }),
              new Paragraph({ children: [run("= 780 triệu CAPEX / khách", { size: 14, color: C.textMuted, italic: true })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 } }),
            ], { fill: C.sectionBgSoft, width: { size: 4600, type: WidthType.DXA } }),
          ],
        }),
      ],
      width: { size: 9200, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
    }),

    spacer(400),

    new Table({
      rows: [new TableRow({
        height: { value: 900, rule: HeightRule.ATLEAST },
        children: [new TableCell({
          children: [
            new Paragraph({ children: [run("🔒   TÀI LIỆU NỘI BỘ — KHÔNG GỬI KHÁCH HÀNG", { bold: true, size: 22, color: C.white, spacing: 40 })], alignment: AlignmentType.CENTER, spacing: { before: 160, after: 80 } }),
            new Paragraph({ children: [run("Phân tích pricing strategy cho BOD & Team Sales Reborn JSC", { size: 18, italic: true, color: C.internalSoft })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 160 } }),
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
    ["1", "KHÁI NIỆM — CAPEX ALLOCATION LÀ GÌ?", "3"],
    ["2", "THÔNG LỆ PHÂN BỔ — BENCHMARK NGÀNH", "4"],
    ["3", "BỐI CẢNH REBORN — CHỌN N PHÙ HỢP", "5"],
    ["4", "CÔNG THỨC TÍNH GIÁ THEO CAPEX ALLOCATION", "7"],
    ["5", "PRICING MỚI — REBORN v1.2 (N=15)", "8"],
    ["6", "SO SÁNH 3 PHIÊN BẢN GIÁ", "9"],
    ["7", "PHÂN TÍCH ĐỘ NHẠY — THAY ĐỔI N", "10"],
    ["8", "CHIẾN LƯỢC ÁP DỤNG THỰC TẾ", "11"],
    ["9", "TÓM TẮT NGẮN — KEY NUMBERS", "13"],
  ];
  return [
    h1("MỤC LỤC"),
    spacer(120),
    new Table({
      rows: items.map((item) => new TableRow({
        height: { value: 400, rule: HeightRule.ATLEAST },
        children: [
          cell(item[0], { bold: true, color: C.internal, align: AlignmentType.CENTER, size: 22,
            width: { size: 700, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.DOTTED, size: 4, color: C.tableBorder }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          }),
          cell(item[1], { color: C.brandDark, size: 22, bold: true,
            width: { size: 7500, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.DOTTED, size: 4, color: C.tableBorder }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          }),
          cell(item[2], { color: C.textMuted, align: AlignmentType.RIGHT, size: 20,
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
      run("Tài liệu này trả lời 2 câu hỏi cốt lõi: ", { size: 22 }),
      run("(1) thông lệ ngành phân bổ CAPEX cho bao nhiêu khách B2B SaaS upper-mid, ", { bold: true, size: 22 }),
      run("và ", { size: 22 }),
      run("(2) nếu áp dụng thông lệ đó thì giá chào mới (v1.2) khác giá hiện tại thế nào.", { bold: true, size: 22 }),
    ], "internal"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ═══ CONTENT ════════════════════════════════════════════════════════════
const content = [
  ...buildCoverPage(),
  ...buildTOC(),

  // ═══ 1. KHÁI NIỆM ═════
  h1("1.  KHÁI NIỆM — CAPEX ALLOCATION LÀ GÌ?"),
  para(run("CAPEX (Capital Expenditure) trong SaaS = chi phí đã bỏ ra để xây dựng phần mềm (sunk cost). Theo chuẩn kế toán (VAS 04 / IFRS IAS 38), đây là tài sản vô hình — khấu hao theo thời gian sử dụng.", { size: 22, color: C.text })),
  para(run("Trong pricing B2B SaaS, CAPEX được thu hồi qua doanh thu nhiều khách hàng theo 2 cách song song:", { size: 22, color: C.text })),

  h2("1.1.  Phân bổ theo THỜI GIAN (Amortization — góc nhìn kế toán)"),
  bullet("Useful life thông thường: 5 năm (phần mềm B2B VN chuẩn VAS)"),
  bullet("Range phổ biến: 3 – 10 năm tuỳ loại phần mềm"),
  bullet([run("Công thức: ", { size: 22 }), run("Khấu hao/năm = CAPEX / useful_life", { bold: true, size: 22, color: C.brandDark })]),

  h2("1.2.  Phân bổ theo SỐ KHÁCH (Unit Economics — góc nhìn pricing)"),
  bullet("Số khách kỳ vọng để hoàn vốn CAPEX"),
  bullet([run("Công thức: ", { size: 22 }), run("CAPEX/customer = CAPEX / N_target_customers", { bold: true, size: 22, color: C.brandDark })]),
  bullet("Đây là con số quyết định price floor khi chào khách"),

  spacer(120),
  calloutBox([
    run("Hai cách này phải NHẤT QUÁN: ", { bold: true, size: 22, color: C.brandDark }),
    run("trong useful life (VD 5 năm), Reborn phải bán đủ N khách để thu hồi CAPEX. Nếu không → lỗ vốn hoặc phải kéo dài recovery → margin âm.", { size: 22 }),
  ], "note"),

  // ═══ 2. BENCHMARK NGÀNH ═════
  h1("2.  THÔNG LỆ PHÂN BỔ — BENCHMARK NGÀNH", { pageBreak: true }),

  h2("2.1.  Theo phân khúc thị trường (ACV — Annual Contract Value)"),
  buildTable(
    ["Phân khúc", "ACV trung bình", "Số khách hoàn vốn CAPEX", "Ví dụ"],
    [
      ["Mass SaaS cho SME nhỏ", "< $10K/năm", "500 – 3.000 khách", "Slack Free, KiotViet SME"],
      ["Mid-market SaaS", "$10K – $50K/năm", "50 – 200 khách", "MISA AMIS, Base HRM, Bravo"],
      ["Upper-mid / Vertical  ⭐", "$50K – $200K/năm", "15 – 30 khách", "Vertical retail/loyalty  ·  Reborn"],
      ["Enterprise SaaS", "> $200K/năm", "5 – 15 khách", "SAP, Oracle, SFDC Enterprise"],
      ["Niche vertical", "> $500K/năm", "3 – 10 khách", "Core banking, Bloomberg"],
    ],
    [2200, 2000, 2500, 2500],
    { firstColBold: true }
  ),

  h2("2.2.  Theo cách tiếp cận tài chính"),
  buildTable(
    ["Approach", "Số khách", "Phù hợp khi", "Rủi ro"],
    [
      ["Aggressive (3-year payback)", "10 – 15", "Có VC backing, thị trường nóng", "Giá chào cao, khó thắng deal"],
      ["Balanced (5-year payback)  ⭐", "15 – 25", "Bootstrap / scale-up giai đoạn mid", "Cân bằng — đề xuất cho Reborn"],
      ["Conservative (7-year payback)", "25 – 40", "Công ty lớn, bão hoà", "Margin mỏng, áp lực cash flow"],
      ["Mass adoption", "100+", "Mass market SaaS", "Chỉ phù hợp khi ACV thấp"],
    ],
    [2600, 1400, 2800, 2400],
    { firstColBold: true }
  ),

  h2("2.3.  Đặc thù thị trường Việt Nam"),
  buildTable(
    ["Phân khúc khách", "ACV USD", "ACV VND", "Số khách recovery"],
    [
      ["SME ≤ 10 NV / ≤ 10 store", "$500 – $5K", "12 – 120 triệu", "1.000 – 5.000 khách"],
      ["SMB / Mid-small (10–50 NV)", "$5K – $20K", "120 – 500 triệu", "200 – 800 khách"],
      ["Mid-market (50–500 NV/store)", "$20K – $80K", "500tr – 2 tỷ", "50 – 150 khách"],
      ["Upper-mid market  ⭐", "$80K – $200K", "2 – 5 tỷ", "15 – 30 khách"],
      ["Enterprise (500+ NV/store)", "$200K+", "5+ tỷ", "5 – 15 khách"],
    ],
    [2800, 1800, 2200, 2400],
    { firstColBold: true }
  ),

  // ═══ 3. BỐI CẢNH REBORN ═════
  h1("3.  BỐI CẢNH REBORN — CHỌN N PHÙ HỢP", { pageBreak: true }),

  h2("3.1.  Phân tích phân khúc Reborn"),
  buildTable(
    ["Tiêu chí", "Giá trị"],
    [
      ["ACV gói STANDARD (năm 1)", "1.890 triệu VND ≈ $75K USD"],
      ["ACV gói STANDARD (năm 2+)", "820 triệu ≈ $33K USD"],
      ["ACV trung bình 3 năm", "1.177 triệu ≈ $47K USD"],
      ["Phân khúc theo ACV", "Upper-mid market (vertical retail)"],
      ["Target khách", "Chuỗi bán lẻ 100–1.500 store, 1M+ KHTV"],
    ],
    [4200, 5000],
    { firstColBold: true }
  ),

  h2("3.2.  Quy mô thị trường Việt Nam (2026)"),
  buildTable(
    ["Nhóm khách target", "Số DN thị trường VN"],
    [
      ["Chuỗi siêu thị lớn (>100 store)", "15–20 (Winmart, BHX, Coopmart, LottE, AEON...)"],
      ["Chuỗi dược phẩm lớn (>50 điểm)", "10–15 (Pharmacity, Long Châu, An Khang...)"],
      ["Chuỗi F&B / cà phê (>100 điểm)", "20–30 (Highlands, Phuc Long, TCH, Trung Nguyên...)"],
      ["Chuỗi thời trang / bán lẻ khác", "30–50 (Canifa, Elise, Juno...)"],
      ["TỔNG market target upper-mid", "~75–115 doanh nghiệp"],
    ],
    [4000, 5200],
    { firstColBold: true }
  ),

  h2("3.3.  Số khách Reborn có thể thắng (realistic)"),
  bullet([run("Thị phần 3 năm đầu: ", { bold: true, size: 22 }), run("5–10% thị trường = ", { size: 22 }), run("5–10 khách", { bold: true, size: 22, color: C.brandDark })]),
  bullet([run("Thị phần 5 năm: ", { bold: true, size: 22 }), run("10–20% = ", { size: 22 }), run("10–25 khách", { bold: true, size: 22, color: C.brandDark })]),
  bullet([run("Thị phần 7 năm: ", { bold: true, size: 22 }), run("15–30% = ", { size: 22 }), run("15–35 khách", { bold: true, size: 22, color: C.brandDark })]),

  h2("3.4.  Đề xuất N = 15 khách / 5 năm  ⭐"),
  buildTable(
    ["Tiêu chí", "Đánh giá"],
    [
      ["ACV Reborn phù hợp với bracket", "Upper-mid ($50K–$200K) → 15–30 khách"],
      ["Quy mô thị trường VN", "75–115 khách target → 15 khách = 13–20% thị phần khả thi"],
      ["Bootstrap (không có VC áp lực 3-year)", "5 năm payback hợp lý"],
      ["Useful life phần mềm (VAS 5 năm)", "Khớp với 5-year recovery"],
      ["So với benchmark vertical SaaS", "15 khách là median cho upper-mid vertical"],
    ],
    [3800, 5400],
    { firstColBold: true }
  ),
  spacer(160),
  calloutBox([
    run("KẾT LUẬN: ", { bold: true, size: 22, color: C.success, caps: true }),
    run("Reborn nên target phân bổ CAPEX cho ", { size: 22 }),
    run("15 khách trong 5 năm", { bold: true, size: 24, color: C.success }),
    run(". Các tham chiếu khác: Aggressive N=10 (3-year, có VC), Conservative N=20 (7-year, thị trường khó).", { size: 22 }),
  ], "recommend"),

  // ═══ 4. CÔNG THỨC ═════
  h1("4.  CÔNG THỨC TÍNH GIÁ THEO CAPEX ALLOCATION"),

  h2("4.1.  Framework tính giá"),
  calloutBox([
    run("Giá chào 3 năm (TCV) = Cost operational 3Y + CAPEX allocation + Margin target", { bold: true, size: 24, color: C.brandDark }),
  ], "highlight"),
  spacer(100),
  para(run("Trong đó:", { bold: true, size: 22 })),
  bullet([run("Cost operational 3Y (STANDARD): ", { bold: true, size: 22 }), run("3.035 triệu (impl + infra + personnel)", { size: 22 })]),
  bullet([run("CAPEX allocation / khách: ", { bold: true, size: 22 }), run("11.700 / N", { bold: true, size: 22, color: C.internal })]),
  bullet([run("Margin target: ", { bold: true, size: 22 }), run("% trên tổng (khuyến nghị 20–25% cho vertical SaaS)", { size: 22 })]),

  h2("4.2.  Bảng CAPEX/khách theo các kịch bản N"),
  buildTable(
    ["N (số khách hoàn vốn)", "CAPEX/khách", "Payback period", "Rủi ro"],
    [
      ["N = 10 (aggressive)", "1.170 triệu", "3–4 năm", "Cao — giá cao, khó thắng"],
      ["N = 15 (balanced)  ⭐", "780 triệu", "5 năm", "Trung bình — khuyến nghị"],
      ["N = 20 (conservative)", "585 triệu", "5–7 năm", "Thấp — dễ thắng, chậm thu hồi"],
      ["N = 25", "468 triệu", "6–8 năm", "Thấp — chậm"],
      ["N = 30", "390 triệu", "7–10 năm", "Rất thấp — phù hợp mass market"],
    ],
    [2800, 1800, 1800, 2800],
    { firstColBold: true }
  ),

  h2("4.3.  Pricing tính lại — Gói STANDARD (margin target 20%)"),
  para(run("Giá 3Y = (Cost ops + CAPEX allocation) / (1 − margin%) = (3.035 + CAPEX/N) / 0.80", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),
  buildTable(
    ["N", "Cost ops 3Y", "CAPEX/khách", "Subtotal", "Giá 3Y (margin 20%)", "Giá/năm TB"],
    [
      ["10", "3.035", "1.170", "4.205", "5.256", "1.752"],
      ["15  ⭐", "3.035", "780", "3.815", "4.769", "1.590"],
      ["20", "3.035", "585", "3.620", "4.525", "1.508"],
      ["25", "3.035", "468", "3.503", "4.379", "1.460"],
      ["30", "3.035", "390", "3.425", "4.281", "1.427"],
    ],
    [1200, 1600, 1600, 1400, 1900, 1500]
  ),

  // ═══ 5. PRICING MỚI v1.2 ═════
  h1("5.  PRICING MỚI — REBORN v1.2 (CAPEX tường minh, N=15)", { pageBreak: true }),

  h2("5.1.  Breakdown đề xuất theo năm — STANDARD"),
  para(run("Áp dụng TCV 4.769 triệu cho 3 năm, phân bổ 2 phương án:", { size: 22, color: C.text })),

  h3("Option A — Cân đối theo năm (flat distribution)"),
  buildTable(
    ["Năm", "Doanh thu", "Ghi chú"],
    [
      ["Năm 1", "2.150", "45% tổng (cao hơn nhờ impl)"],
      ["Năm 2", "1.310", "27%"],
      ["Năm 3", "1.309", "27%"],
      ["TỔNG 3Y", "4.769", "100%"],
    ],
    [2200, 2400, 4600],
    { firstColBold: true }
  ),

  h3("Option B — Front-loaded (khuyến nghị — giống thông lệ B2B)  ⭐"),
  buildTable(
    ["Năm", "Doanh thu", "Ghi chú"],
    [
      ["Năm 1  ⭐", "2.550", "53% tổng — bao gồm impl + license + CAPEX chính"],
      ["Năm 2", "1.110", "23% — subscription + maintenance"],
      ["Năm 3", "1.109", "23% — subscription + maintenance"],
      ["TỔNG 3Y", "4.769", "100%"],
    ],
    [2200, 2400, 4600],
    { firstColBold: true }
  ),

  h2("5.2.  Pricing mới cho 3 gói — N = 15, margin 20%"),
  buildTable(
    ["Gói", "Cost ops 3Y", "CAPEX (N=15)", "Subtotal", "Giá 3Y mới", "Giá Y1", "Giá Y2+"],
    [
      ["STARTER", "1.840", "450", "2.290", "2.863", "1.425", "720/năm"],
      ["STANDARD  ⭐", "3.035", "780", "3.815", "4.769", "2.550", "1.110/năm"],
      ["PREMIUM", "4.540", "1.110", "5.650", "7.063", "3.820", "1.620/năm"],
    ],
    [1400, 1400, 1400, 1400, 1400, 1100, 1100],
    { firstColBold: true }
  ),
  spacer(120),
  para(run("Ghi chú phân bổ CAPEX theo tier: STARTER giảm 40% (khách SME giá thấp), PREMIUM tăng 40% (khách enterprise chịu được phân bổ cao hơn) so với STANDARD base 780tr. Weighted average vẫn ≈ 780 × 15 = 11.700tr.", { italic: true, size: 20, color: C.textMuted })),

  // ═══ 6. SO SÁNH 3 PHIÊN BẢN ═════
  h1("6.  SO SÁNH PRICING — 3 PHIÊN BẢN", { pageBreak: true }),

  h2("6.1.  Bảng tổng hợp 3 phiên bản giá"),
  buildTable(
    ["Gói", "v1.0 (gốc)", "v1.1 (giảm 20%)", "v1.2 (CAPEX N=15)  ⭐"],
    [
      ["STARTER Y1", "890", "712", "1.425 (+60%)"],
      ["STANDARD Y1", "1.890", "1.512", "2.550 (+35%)"],
      ["PREMIUM Y1", "2.990", "2.392", "3.820 (+28%)"],
      ["STANDARD 3Y TCV", "3.530", "2.824", "4.769"],
    ],
    [2200, 2000, 2400, 2600],
    { firstColBold: true }
  ),

  h2("6.2.  Implicit CAPEX allocation của từng phiên bản"),
  buildTable(
    ["Phiên bản", "Implicit CAPEX/khách", "N thực tế để hoàn vốn", "Payback"],
    [
      ["v1.0 (gốc)", "~688 triệu", "17 khách", "~5,75 năm (với 3 khách/năm)"],
      ["v1.1 (−20%)", "~0 – 280 triệu (âm nhẹ)", "42+ khách", "Không hòa vốn trong 10 năm"],
      ["v1.2 (N=15)  ⭐", "780 triệu (tường minh)", "15 khách", "5 năm đảm bảo"],
    ],
    [2200, 2400, 2400, 2200],
    { firstColBold: true }
  ),

  h2("6.3.  Margin so sánh (3 năm)"),
  buildTable(
    ["Phiên bản", "STARTER", "STANDARD", "PREMIUM"],
    [
      ["v1.0", "+2%", "+14%", "+16%"],
      ["v1.1", "−23%", "−7%", "−5%"],
      ["v1.2  ⭐", "+18%", "+20%", "+22%"],
    ],
    [2800, 2200, 2200, 2000],
    { firstColBold: true }
  ),
  spacer(160),
  calloutBox([
    run("v1.2 là phiên bản duy nhất đạt margin target 20% ở tất cả gói", { bold: true, size: 22, color: C.success }),
    run(" và đảm bảo hoàn vốn CAPEX đúng thời hạn 5 năm với 15 khách.", { size: 22 }),
  ], "recommend"),

  // ═══ 7. SENSITIVITY ═════
  h1("7.  PHÂN TÍCH ĐỘ NHẠY — THAY ĐỔI N", { pageBreak: true }),
  para(run("Giả sử Reborn muốn target margin 20% STANDARD, giá chào tương ứng với các N khác:", { italic: true, size: 22, color: C.textMuted })),
  spacer(80),
  buildTable(
    ["N", "Giá STANDARD Y1", "Giá 3Y TCV", "% tăng vs v1.0", "Khả thi thị trường?"],
    [
      ["10", "2.800", "5.256", "+48%", "Khó — chỉ deal chiến lược"],
      ["12", "2.670", "5.013", "+42%", "Khó trung bình"],
      ["15  ⭐", "2.550", "4.769", "+35%", "Hợp lý"],
      ["18", "2.440", "4.569", "+29%", "Dễ thắng"],
      ["20", "2.400", "4.525", "+28%", "Dễ thắng"],
      ["25", "2.310", "4.379", "+24%", "Rất dễ thắng"],
      ["30", "2.270", "4.281", "+21%", "Rất dễ thắng nhưng chậm"],
    ],
    [900, 1900, 1800, 1800, 2800],
    { firstColBold: true }
  ),
  spacer(120),
  h3("Trade-off chính"),
  bullet([run("N nhỏ (10–12):", { bold: true, size: 22, color: C.danger }), run(" Giá cao → khó thắng deal → chậm recovery → rủi ro cao", { size: 22 })]),
  bullet([run("N = 15 (balanced):", { bold: true, size: 22, color: C.success }), run(" Giá hợp lý → 13–20% thị phần → recovery 5 năm → khuyến nghị", { size: 22 })]),
  bullet([run("N lớn (25–30):", { bold: true, size: 22, color: C.textMuted }), run(" Giá thấp → dễ thắng → nhưng CAPEX recovery chậm 7–10 năm", { size: 22 })]),

  // ═══ 8. CHIẾN LƯỢC ═════
  h1("8.  CHIẾN LƯỢC ÁP DỤNG THỰC TẾ", { pageBreak: true }),

  h2("8.1.  Vấn đề: Giá v1.2 CAO HƠN v1.0 tới 35%"),
  calloutBox([
    run("Giá chuẩn CAPEX (2.550tr Y1) cao hơn giá gốc v1.0 (1.890tr Y1) tới ", { size: 22 }),
    run("35%", { bold: true, size: 22, color: C.danger }),
    run(", và cao hơn giá đang chào khách hiện tại v1.1 (1.512tr) tới ", { size: 22 }),
    run("69%.", { bold: true, size: 22, color: C.danger }),
    run(" Hậu quả: khó thắng deal nếu khách so sánh với vendor khác, khách cảm thấy giá \"vừa nâng vừa chào\" → mất lòng tin.", { size: 22 }),
  ], "warning"),

  h2("8.2.  3 phương án triển khai"),

  h3("Phương án 1 — Giữ pricing hiện tại, chấp nhận recovery dài"),
  bullet("Giữ v1.0 (3.530tr/khách 3Y) → recovery tại 17 khách, 5.75 năm"),
  bullet("v1.1 (2.824tr/khách 3Y) → recovery tại 42 khách, 8–9 năm"),
  bullet([run("Không thay đổi gì về mặt chào khách, không áp lực sale", { bold: true, size: 22, color: C.success })]),
  bullet("Kém hiệu quả tài chính nhưng thực tế khả thi"),

  h3("Phương án 2 — Chuyển dần sang v1.2 (N=15) theo lộ trình"),
  buildTable(
    ["Thời điểm", "Pricing", "Target khách"],
    [
      ["Q2/2026 (deal khách này)", "v1.1 (đã chào, không rút lại)", "Khách đầu tiên + case study"],
      ["Q3–Q4/2026", "v1.0 (giá gốc không giảm)", "2–3 khách bán lẻ"],
      ["2027+", "v1.2 (CAPEX đúng, N=15)", "3–4 khách/năm, giá premium"],
    ],
    [2800, 3200, 3200],
    { firstColBold: true }
  ),
  spacer(120),
  para(run("Dùng 1–2 khách đầu tiên để đánh brand (giá thấp), sau đó lên giá dần khi có case study.", { italic: true, size: 22, color: C.textMuted })),

  h3("Phương án 3 — v1.2 ngay, tách \"premium\" + gói \"value\""),
  bullet("Gói PREMIUM v1.2: 3.820tr Y1 — phân bổ CAPEX đúng, margin 22%"),
  bullet("Gói STANDARD v1.0: 1.890tr Y1 (giữ giá gốc, không giảm 20%)"),
  bullet("Gói STARTER v1.0: 890tr Y1 (làm loss leader)"),
  bullet("Khách chọn — ai cần ML/Marketing Auto thì trả PREMIUM (hoàn vốn CAPEX nhanh từ gói này)"),

  h2("8.3.  KHUYẾN NGHỊ CUỐI CÙNG  ⭐"),
  calloutBox([
    run("Với bài toán hiện tại của Reborn:", { bold: true, size: 24, color: C.success }),
  ], "recommend"),
  spacer(100),

  new Table({
    rows: [1, 2, 3, 4].map((n) => {
      const items = {
        1: { title: "Deal khách chuỗi siêu thị này", desc: "Giữ nguyên v1.1 (1.512tr) — đã chào, không rút. Upsell add-ons aggressively để kéo ARV thực tế lên ~2.000tr → giảm thiểu lỗ." },
        2: { title: "Deal 2–3 khách tiếp theo trong 2026", desc: "Quay về v1.0 (giá gốc), thêm \"ưu đãi early customer −10%\" → giá thực tế 1.700tr Y1. Margin 3Y ~8–10%, hòa vốn ở 22–25 khách." },
        3: { title: "Deal từ 2027 trở đi", desc: "Chuyển sang v1.2 (CAPEX-đúng, N=15) với ưu đãi linh hoạt: Niêm yết 2.550tr Y1, deal lớn giảm 10–15%, deal chiến lược giảm 20%. Giá thực 2.100–2.300tr → margin 15–18% ổn định." },
        4: { title: "Target recovery", desc: "15 khách STANDARD trong 5 năm (balanced). Mix: 3 STARTER + 10 STANDARD + 2 PREMIUM (realistic cho VN). CAPEX 11,7 tỷ / weighted ACV → recovery Q3–Q4/2030." },
      };
      const s = items[n];
      return new TableRow({
        height: { value: 800, rule: HeightRule.ATLEAST },
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
            new Paragraph({ children: [run(s.desc, { size: 20, color: C.text })], spacing: { before: 0, after: 80, line: 280 } }),
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

  // ═══ 9. TÓM TẮT ═════
  h1("9.  TÓM TẮT NGẮN — KEY NUMBERS", { pageBreak: true }),
  spacer(160),

  buildTable(
    ["Metric", "Giá trị"],
    [
      ["CAPEX Reborn đã đầu tư", "11,7 tỷ VND"],
      ["Phân bổ tiêu chuẩn ngành (vertical mid-market SaaS)", "15 khách / 5 năm"],
      ["CAPEX/khách nếu phân bổ N=15", "780 triệu"],
      ["Giá STANDARD mới v1.2 (CAPEX đúng, margin 20%)", "Y1: 2.550tr  ·  3Y TCV: 4.769tr"],
      ["So với v1.0 hiện tại", "+35%"],
      ["So với v1.1 đã chào khách", "+69%"],
      ["Margin v1.2 STANDARD 3 năm", "+20% (mục tiêu đạt)"],
      ["Break-even v1.2", "15 khách · 5 năm (đúng target)"],
    ],
    [5500, 3700],
    { firstColBold: true }
  ),

  spacer(240),
  calloutBox([
    run("CÂU TRẢ LỜI NGẮN CHO 2 CÂU HỎI CỦA USER:", { bold: true, size: 22, color: C.internal, caps: true }),
  ], "internal"),
  spacer(80),
  para([
    run("1. ", { bold: true, size: 22, color: C.internal }),
    run("Phân bổ CAPEX tiêu chuẩn cho B2B SaaS upper-mid vertical (như Reborn Loyalty): ", { size: 22 }),
    run("15 khách trong 5 năm", { bold: true, size: 22, color: C.brandDark }),
    run(". Range phổ biến 10–25 tuỳ chiến lược (aggressive → conservative).", { size: 22 }),
  ]),
  spacer(80),
  para([
    run("2. ", { bold: true, size: 22, color: C.internal }),
    run("Nếu áp N=15, giá chào đúng chuẩn sẽ là ", { size: 22 }),
    run("STANDARD 2.550tr Y1 (3Y TCV 4.769tr)", { bold: true, size: 22, color: C.brandDark }),
    run(" — cao hơn v1.0 35% và cao hơn v1.1 69%. Thực tế khó áp dụng ngay với khách hiện tại → cần lộ trình 2026–2027.", { size: 22 }),
  ]),

  spacer(480),

  // Footer internal block
  new Table({
    rows: [new TableRow({
      height: { value: 1200, rule: HeightRule.ATLEAST },
      children: [new TableCell({
        children: [
          new Paragraph({ children: [run("R E B O R N  J S C  —  INTERNAL", { bold: true, size: 26, color: C.brandPrimary, spacing: 80 })], alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 } }),
          new Paragraph({ children: [run("Phân tích CAPEX Allocation — Pricing Strategy", { italic: true, size: 18, color: C.internalSoft })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 } }),
          new Paragraph({ children: [run("Cập nhật khi thay đổi target phân khúc hoặc CAPEX thực tế", { size: 16, color: C.internalSoft })], alignment: AlignmentType.CENTER, spacing: { before: 40, after: 120 } }),
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
  title: "Phân tích CAPEX Allocation — Pricing Strategy (Internal)",
  description: "Phân bổ khấu hao CAPEX & pricing điều chỉnh — nội bộ",
  styles: { default: { document: { run: { font: FONT, size: 22 } } } },
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
            run("CAPEX Allocation Analysis", { size: 16, color: C.textMuted, italic: true }),
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

const outPath = "docs/proposal/bao-gia/Phan-tich-CAPEX-Allocation-INTERNAL.docx";
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
}).catch((err) => { console.error("Failed:", err); process.exit(1); });
