// Tạo phiếu khảo sát Loyalty (.xlsx) — chạy: node docs/survey/generate-survey-loyalty.mjs
// Template dựa trên BPM survey, điền sẵn đáp án từ docs/Q&A/QA_FN.xlsx
// Cập nhật khi có thông tin khảo sát mới → chỉnh PREFILLED rồi chạy lại.
import XLSX from "xlsx";

// ═══ ĐÁP ÁN ĐÃ CÓ TỪ Q&A ═════════════════════════════════════════════
const PRE = {
  company: "",
  industry: "Bán lẻ — Chuỗi siêu thị",
  brandCount: "2 thương hiệu",
  storeCount: "~300 cửa hàng (2025)",
  storePlan: "1.000–1.500 điểm bán trong 1–3 năm tới (kèm mở rộng online, đối tác, hệ sinh thái)",
  mainContactName: "",
  mainContactTitle: "",
  mainContactEmail: "",
  mainContactPhone: "",
  itContactDept: "Phòng CNTT&CĐS",
  itContactName: "",
  itContactEmail: "",
  memberCount: "~3.000.000 KHTV",
  activeRate: "70–80% KHTV có phát sinh mua hàng",
  txnPerDay: "~150.000 giao dịch/ngày (trung bình 2025)",
  txnPeak: "~300.000 giao dịch/ngày (peak lễ/sale, gấp đôi TB)",
  loyaltyCurrent: "Đã có loyalty tại tất cả điểm bán lẻ + website + mobile app",
  posCurrent: "Có (chi tiết real-time/batch: Phòng CNTT&CĐS nắm)",
  ecommerce: "Có website e-commerce + mobile app riêng cho KHTV",
  goldmem: "Có — quản lý thông tin KHTV (đăng ký, sửa, sinh nhật, lịch sử mua)",
  msAccess: "Có — tổng hợp danh mục KHTV, lịch sử quyền lợi tích luỹ",
  msExcel: "Có — tổng hợp, xử lý dữ liệu, dashboard KHTV thủ công",
  supporter: "Có — ghi nhận khiếu nại (tên, SĐT, nội dung, mức độ, kết quả)",
  marketingAuto: "Có, chủ yếu thuê agency ngoài để thực hiện",
  apiAvailable: "Có API và real-time tuỳ theo chức năng, phần mềm",
  infraModel: "Phòng CNTT&CĐS nắm (chưa xác nhận on-prem / cloud / hybrid)",
  dataWarehouse: "Phòng CNTT&CĐS nắm",
  painPoints:
    "1) Dữ liệu KHTV rải rác Goldmem/Access/Excel/Supporter, liên kết thủ công; " +
    "2) Thao tác chủ yếu thủ công, phụ thuộc kỹ năng nhân sự; " +
    "3) Ứng dụng CNTT chưa cao, dịch vụ thủ công thiếu hấp dẫn",
};

// ═══ BRAND PALETTE ═════════════════════════════════════════════════════
const C = {
  brandDark: "0B2E2A",
  brandDark2: "0D3D38",
  brandPrimary: "00C9A7",
  brandPrimaryLight: "B9F4E4",
  brandAccent: "FF8A3C",
  sectionBg: "E8F5F2",
  sectionBgSoft: "F5F9F8",
  answerEmpty: "FFF5D6",     // vàng nhạt — cần điền
  answerEmptyDk: "F5A623",   // vàng đậm viền
  answerFilled: "D1FAE5",    // xanh lá nhạt — đã điền
  answerFilledDk: "15803D",  // xanh lá đậm viền
  questionBg: "FFFFFF",
  questionBgAlt: "FAFCFB",
  hintGray: "6B8A85",
  text: "1A2B28",
  border: "D9E0DE",
  white: "FFFFFF",
  legend1: "FFF5D6",
  legend2: "D1FAE5",
  separator: "B9F4E4",
};

const borderThin = {
  top: { style: "thin", color: { rgb: C.border } },
  bottom: { style: "thin", color: { rgb: C.border } },
  left: { style: "thin", color: { rgb: C.border } },
  right: { style: "thin", color: { rgb: C.border } },
};

const borderMedium = {
  top: { style: "medium", color: { rgb: C.brandPrimary } },
  bottom: { style: "medium", color: { rgb: C.brandPrimary } },
  left: { style: "medium", color: { rgb: C.brandPrimary } },
  right: { style: "medium", color: { rgb: C.brandPrimary } },
};

const borderNone = {
  top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" },
};

// ═══ CELL STYLE PRESETS ══════════════════════════════════════════════════
const S = {
  // Cover
  coverBrand: {
    font: { name: "Calibri", sz: 36, bold: true, color: { rgb: C.brandPrimary } },
    fill: { fgColor: { rgb: C.brandDark } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderNone,
  },
  coverSub: {
    font: { name: "Calibri", sz: 14, italic: true, color: { rgb: C.brandPrimaryLight } },
    fill: { fgColor: { rgb: C.brandDark } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderNone,
  },
  coverTitle: {
    font: { name: "Calibri", sz: 26, bold: true, color: { rgb: C.brandDark } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: borderNone,
  },
  coverSubtitle: {
    font: { name: "Calibri", sz: 14, color: { rgb: C.brandDark } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: borderNone,
  },
  coverMeta: {
    font: { name: "Calibri", sz: 11, italic: true, color: { rgb: C.hintGray } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderNone,
  },
  coverAccent: {
    font: { name: "Calibri", sz: 11, bold: true, color: { rgb: C.brandDark } },
    fill: { fgColor: { rgb: C.brandAccent } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderNone,
  },
  coverSection: {
    font: { name: "Calibri", sz: 13, bold: true, color: { rgb: C.brandDark } },
    fill: { fgColor: { rgb: C.sectionBg } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true, indent: 1 },
    border: borderThin,
  },
  coverBody: {
    font: { name: "Calibri", sz: 11, color: { rgb: C.text } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true, indent: 2 },
    border: borderThin,
  },
  // Legend cells
  legendEmpty: {
    font: { name: "Calibri", sz: 11, bold: true, color: { rgb: C.brandDark } },
    fill: { fgColor: { rgb: C.answerEmpty } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderThin,
  },
  legendFilled: {
    font: { name: "Calibri", sz: 11, bold: true, color: { rgb: C.brandDark } },
    fill: { fgColor: { rgb: C.answerFilled } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderThin,
  },
  legendLabel: {
    font: { name: "Calibri", sz: 11, color: { rgb: C.text } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true, indent: 1 },
    border: borderThin,
  },

  // Question sheet
  sheetTitle: {
    font: { name: "Calibri", sz: 18, bold: true, color: { rgb: C.white } },
    fill: { fgColor: { rgb: C.brandDark } },
    alignment: { horizontal: "left", vertical: "center", indent: 2 },
    border: borderNone,
  },
  sheetSubtitle: {
    font: { name: "Calibri", sz: 11, italic: true, color: { rgb: C.brandPrimaryLight } },
    fill: { fgColor: { rgb: C.brandDark } },
    alignment: { horizontal: "left", vertical: "center", indent: 2 },
    border: borderNone,
  },
  tableHeader: {
    font: { name: "Calibri", sz: 11, bold: true, color: { rgb: C.white } },
    fill: { fgColor: { rgb: C.brandDark2 } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top: { style: "medium", color: { rgb: C.brandPrimary } },
      bottom: { style: "medium", color: { rgb: C.brandPrimary } },
      left: { style: "thin", color: { rgb: C.brandDark } },
      right: { style: "thin", color: { rgb: C.brandDark } },
    },
  },
  groupHeader: {
    font: { name: "Calibri", sz: 12, bold: true, color: { rgb: C.brandDark } },
    fill: { fgColor: { rgb: C.brandPrimaryLight } },
    alignment: { horizontal: "left", vertical: "center", indent: 1, wrapText: true },
    border: {
      top: { style: "medium", color: { rgb: C.brandPrimary } },
      bottom: { style: "thin", color: { rgb: C.brandPrimary } },
      left: { style: "medium", color: { rgb: C.brandPrimary } },
      right: { style: "medium", color: { rgb: C.brandPrimary } },
    },
  },
  qNumber: {
    font: { name: "Calibri", sz: 10, bold: true, color: { rgb: C.brandPrimary } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderThin,
  },
  question: {
    font: { name: "Calibri", sz: 10, color: { rgb: C.text } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true, indent: 1 },
    border: borderThin,
  },
  questionRequired: {
    font: { name: "Calibri", sz: 10, bold: true, color: { rgb: C.text } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true, indent: 1 },
    border: borderThin,
  },
  hint: {
    font: { name: "Calibri", sz: 9, italic: true, color: { rgb: C.hintGray } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true, indent: 1 },
    border: borderThin,
  },
  answerEmpty: {
    font: { name: "Calibri", sz: 10, color: { rgb: C.text } },
    fill: { fgColor: { rgb: C.answerEmpty } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true, indent: 1 },
    border: {
      top: { style: "thin", color: { rgb: C.answerEmptyDk } },
      bottom: { style: "thin", color: { rgb: C.answerEmptyDk } },
      left: { style: "thin", color: { rgb: C.answerEmptyDk } },
      right: { style: "thin", color: { rgb: C.answerEmptyDk } },
    },
  },
  answerFilled: {
    font: { name: "Calibri", sz: 10, color: { rgb: C.text } },
    fill: { fgColor: { rgb: C.answerFilled } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true, indent: 1 },
    border: {
      top: { style: "thin", color: { rgb: C.answerFilledDk } },
      bottom: { style: "thin", color: { rgb: C.answerFilledDk } },
      left: { style: "thin", color: { rgb: C.answerFilledDk } },
      right: { style: "thin", color: { rgb: C.answerFilledDk } },
    },
  },
  footer: {
    font: { name: "Calibri", sz: 10, italic: true, color: { rgb: C.white } },
    fill: { fgColor: { rgb: C.brandDark } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderNone,
  },
};

function cell(value, style) {
  return { v: value ?? "", s: style, t: typeof value === "number" ? "n" : "s" };
}

// ═══ BUILD WORKBOOK ═══════════════════════════════════════════════════
const wb = XLSX.utils.book_new();

// ───────────────────────────────────────────────────────────────────────
// SHEET 1: Bìa & Hướng Dẫn
// ───────────────────────────────────────────────────────────────────────
function buildCoverSheet() {
  const rows = [];
  for (let i = 0; i < 40; i++) rows.push([null, null, null, null]);

  // Row 0-4: Brand banner (4 merged rows)
  rows[1] = [cell("R E B O R N", S.coverBrand), null, null, null];
  rows[2] = [cell("JSC", S.coverSub), null, null, null];

  // Row 6-7: "PHIẾU KHẢO SÁT" heading
  rows[6] = [cell("PHIẾU KHẢO SÁT NHU CẦU TRIỂN KHAI", { ...S.coverTitle, font: { ...S.coverTitle.font, sz: 20, color: { rgb: C.brandPrimary } } }), null, null, null];
  rows[7] = [cell("Nền tảng Loyalty cho Chuỗi Siêu thị Bán lẻ", S.coverTitle), null, null, null];
  rows[9] = [cell("Phiên bản 1.0  ·  04/2026  ·  Bảo mật — Chỉ dùng nội bộ khách hàng", S.coverMeta), null, null, null];

  // Row 11: Accent bar
  rows[11] = [cell(" ", { fill: { fgColor: { rgb: C.brandAccent } }, border: borderNone }), null, null, null];

  // Section: MỤC ĐÍCH
  rows[13] = [cell("📌  MỤC ĐÍCH", S.coverSection), null, null, null];
  rows[14] = [cell("Phiếu này giúp Reborn JSC nắm đủ quy mô, nhu cầu và bối cảnh kỹ thuật của chuỗi bán lẻ để đề xuất mô hình triển khai, báo giá và lộ trình sát thực tế nhất cho bài toán Loyalty của quý khách.", S.coverBody), null, null, null];

  // Section: HƯỚNG DẪN ĐIỀN
  rows[16] = [cell("📋  HƯỚNG DẪN ĐIỀN", S.coverSection), null, null, null];
  rows[17] = [cell("①  Điền vào cột ĐÁP ÁN ở mỗi sheet.  Các ô đã tô màu rất rõ ý nghĩa — xem chú giải bên dưới.", S.coverBody), null, null, null];
  rows[18] = [cell("②  Các trường đánh dấu  *  là bắt buộc — cần điền trước khi gửi lại.", S.coverBody), null, null, null];
  rows[19] = [cell("③  Nếu chưa có số liệu chính xác, điền ước tính gần đúng.  Có thể thêm ghi chú tự do.", S.coverBody), null, null, null];
  rows[20] = [cell("④  Sau khi hoàn tất, vui lòng gửi file về:  ceo@reborn.vn  —  Reborn phản hồi báo giá cá nhân hoá trong 5 ngày làm việc.", S.coverBody), null, null, null];

  // Section: Chú giải màu
  rows[22] = [cell("🎨  CHÚ GIẢI MÀU Ô ĐÁP ÁN", S.coverSection), null, null, null];
  // Legend row 1
  rows[23] = [cell("Ô VÀNG", S.legendEmpty), cell("Chưa có dữ liệu — quý khách vui lòng điền", S.legendLabel), null, null];
  // Legend row 2
  rows[24] = [cell("Ô XANH", S.legendFilled), cell("Reborn đã trích sẵn từ Q&A trước đây — quý khách xem lại và điều chỉnh (nếu cần)", S.legendLabel), null, null];

  // Section: CẤU TRÚC FILE
  rows[26] = [cell("🗂️  CẤU TRÚC FILE — 7 SHEET", S.coverSection), null, null, null];
  rows[27] = [cell("Sheet 1  ·  Thông tin Doanh nghiệp & Liên hệ", S.coverBody), null, null, null];
  rows[28] = [cell("Sheet 2  ·  Quy mô chuỗi bán lẻ & Kế hoạch mở rộng", S.coverBody), null, null, null];
  rows[29] = [cell("Sheet 3  ·  Hệ thống hiện có & Tích hợp (Goldmem, POS, CRM, Marketing...)", S.coverBody), null, null, null];
  rows[30] = [cell("Sheet 4  ·  Yêu cầu nghiệp vụ Loyalty (điểm, hạng, đổi thưởng, referral)", S.coverBody), null, null, null];
  rows[31] = [cell("Sheet 5  ·  Hạ tầng, An toàn & Tuân thủ", S.coverBody), null, null, null];
  rows[32] = [cell("Sheet 6  ·  Triển khai, Đào tạo & Thương mại", S.coverBody), null, null, null];
  rows[33] = [cell("Sheet 7  ·  Tóm tắt & Ghi chú bổ sung", S.coverBody), null, null, null];

  // Footer strip
  rows[36] = [cell("📞  Reborn JSC  |  ceo@reborn.vn  |  reborn.vn  |  Zalo/Hotline: liên hệ sale đầu mối", S.footer), null, null, null];

  const ws = XLSX.utils.aoa_to_sheet(rows.map(r => r.map(c => c === null ? "" : c)));
  rows.forEach((row, rIdx) => {
    row.forEach((c, cIdx) => {
      if (c && typeof c === "object" && c.s) {
        const addr = XLSX.utils.encode_cell({ r: rIdx, c: cIdx });
        if (ws[addr]) ws[addr].s = c.s;
      }
    });
  });

  // Column widths: wider for content
  ws["!cols"] = [{ wch: 26 }, { wch: 90 }, { wch: 1 }, { wch: 1 }];

  // Row heights
  ws["!rows"] = [];
  [1, 2].forEach((r) => { ws["!rows"][r] = { hpt: 42 }; });
  ws["!rows"][6] = { hpt: 32 };
  ws["!rows"][7] = { hpt: 40 };
  ws["!rows"][9] = { hpt: 20 };
  ws["!rows"][11] = { hpt: 8 };
  for (let i = 13; i <= 36; i++) ws["!rows"][i] = { hpt: 26 };
  [14, 17, 20].forEach((r) => { ws["!rows"][r] = { hpt: 38 }; });
  [23, 24].forEach((r) => { ws["!rows"][r] = { hpt: 32 }; });
  ws["!rows"][36] = { hpt: 28 };

  // Merges
  ws["!merges"] = [];
  // Banner (brand block): merge rows 0-3 columns A-D
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 3, c: 3 } });
  // Brand text in row 1 spans 4 cols (will be re-applied via merge)
  // Title rows span A:D
  [6, 7, 9, 11].forEach((r) => ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: 3 } }));
  // Sections span A:D
  [13, 14, 16, 17, 18, 19, 20, 22, 26, 27, 28, 29, 30, 31, 32, 33, 36].forEach((r) => {
    ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: 3 } });
  });
  // Legend: A (color badge) + B-D (label)
  [23, 24].forEach((r) => {
    ws["!merges"].push({ s: { r, c: 1 }, e: { r, c: 3 } });
  });

  // Background for banner (rows 0-3 entire)
  for (let r = 0; r <= 3; r++) {
    for (let cI = 0; cI <= 3; cI++) {
      const addr = XLSX.utils.encode_cell({ r, c: cI });
      if (!ws[addr]) ws[addr] = { v: "", t: "s" };
      ws[addr].s = { fill: { fgColor: { rgb: C.brandDark } }, border: borderNone };
    }
  }
  // Then overlay the brand/sub text
  ws["A2"] = { v: "R E B O R N", t: "s", s: S.coverBrand };
  ws["A3"] = { v: "J S C", t: "s", s: S.coverSub };

  return ws;
}

// ───────────────────────────────────────────────────────────────────────
// HELPER: build a question sheet with numbering
// ───────────────────────────────────────────────────────────────────────
function buildQuestionSheet(sheetNum, title, subtitle, groups) {
  const rows = [];
  // Title banner row
  rows.push([
    cell(`  SHEET ${sheetNum}   ·   ${title}`, S.sheetTitle),
    cell("", S.sheetTitle),
    cell("", S.sheetTitle),
    cell("", S.sheetTitle),
  ]);
  // Subtitle
  rows.push([
    cell(`  ${subtitle}`, S.sheetSubtitle),
    cell("", S.sheetSubtitle),
    cell("", S.sheetSubtitle),
    cell("", S.sheetSubtitle),
  ]);
  // Spacer row
  rows.push([cell("", { border: borderNone }), cell("", { border: borderNone }), cell("", { border: borderNone }), cell("", { border: borderNone })]);
  // Header
  rows.push([
    cell("#", S.tableHeader),
    cell("THÔNG TIN / CÂU HỎI", S.tableHeader),
    cell("GỢI Ý / HƯỚNG DẪN", S.tableHeader),
    cell("ĐÁP ÁN  ✏️", S.tableHeader),
  ]);

  let qCount = 0;
  groups.forEach((group) => {
    rows.push([
      cell(group.label, S.groupHeader),
      cell("", S.groupHeader),
      cell("", S.groupHeader),
      cell("", S.groupHeader),
    ]);
    group.questions.forEach((q) => {
      qCount++;
      const qStyle = q.required ? S.questionRequired : S.question;
      const qText = (q.required ? "  " + q.text + "  *" : "  " + q.text);
      const answerStyle = q.answer && q.answer.trim() ? S.answerFilled : S.answerEmpty;
      rows.push([
        cell(`Q${qCount}`, S.qNumber),
        cell(qText, qStyle),
        cell(q.hint || "", S.hint),
        cell(q.answer || "", answerStyle),
      ]);
    });
  });

  // Footer row
  rows.push([cell("", { border: borderNone }), cell("", { border: borderNone }), cell("", { border: borderNone }), cell("", { border: borderNone })]);
  rows.push([cell("", { border: borderNone }), cell("", { border: borderNone }), cell("", { border: borderNone }), cell(`Trang Sheet ${sheetNum}/7  ·  Reborn Loyalty Survey v1.0`, { ...S.footer, fill: { fgColor: { rgb: C.brandDark2 } } })]);

  const ws = XLSX.utils.aoa_to_sheet(rows.map(r => r.map(c => c === null ? "" : c)));
  rows.forEach((row, rIdx) => {
    row.forEach((c, cIdx) => {
      if (c && typeof c === "object" && c.s) {
        const addr = XLSX.utils.encode_cell({ r: rIdx, c: cIdx });
        if (ws[addr]) ws[addr].s = c.s;
      }
    });
  });

  // Column widths: #, Question, Hint, Answer
  ws["!cols"] = [{ wch: 6 }, { wch: 46 }, { wch: 48 }, { wch: 50 }];

  // Row heights
  ws["!rows"] = [];
  ws["!rows"][0] = { hpt: 34 };   // title
  ws["!rows"][1] = { hpt: 22 };   // subtitle
  ws["!rows"][2] = { hpt: 8 };    // spacer
  ws["!rows"][3] = { hpt: 28 };   // table header

  // Merges
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },  // title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },  // subtitle
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },  // spacer
    { s: { r: rows.length - 1, c: 0 }, e: { r: rows.length - 1, c: 3 } }, // footer
  ];

  let rIdx = 4;
  groups.forEach((group) => {
    // Group header spans all 4 cols
    ws["!merges"].push({ s: { r: rIdx, c: 0 }, e: { r: rIdx, c: 3 } });
    ws["!rows"][rIdx] = { hpt: 30 };
    rIdx++;
    group.questions.forEach(() => {
      ws["!rows"][rIdx] = { hpt: 44 };
      rIdx++;
    });
  });
  ws["!rows"][rIdx] = { hpt: 10 }; // pre-footer spacer

  // Freeze top 4 rows (title + subtitle + spacer + header)
  ws["!freeze"] = { xSplit: 0, ySplit: 4 };

  return ws;
}

// ───────────────────────────────────────────────────────────────────────
// SHEET 2: Doanh nghiệp & Liên hệ
// ───────────────────────────────────────────────────────────────────────
const s2 = buildQuestionSheet(1, "Thông tin Doanh nghiệp & Liên hệ",
  "Ai là người ra quyết định, ai là đầu mối kỹ thuật, quy mô doanh nghiệp thế nào?",
  [
    {
      label: "🏢  A. THÔNG TIN DOANH NGHIỆP",
      questions: [
        { text: "Tên công ty / tập đoàn", hint: "Tên đầy đủ theo đăng ký kinh doanh", answer: PRE.company, required: true },
        { text: "Ngành nghề kinh doanh", hint: "Bán lẻ, siêu thị, tiện lợi, chuỗi F&B...", answer: PRE.industry, required: true },
        { text: "Số thương hiệu (brand) trong chuỗi", hint: "VD: 1 brand / 2 brand / nhiều brand độc lập", answer: PRE.brandCount, required: true },
        { text: "Địa bàn hoạt động", hint: "Miền Bắc / Trung / Nam / Toàn quốc / Quốc tế", answer: "" },
        { text: "Website chính thức", hint: "Một hoặc nhiều website của các brand", answer: "" },
        { text: "Năm thành lập chuỗi loyalty hiện tại", hint: "Để đánh giá lịch sử dữ liệu cần migrate", answer: "" },
      ],
    },
    {
      label: "👤  B. NGƯỜI LIÊN HỆ CHÍNH (ra quyết định dự án)",
      questions: [
        { text: "Họ và tên", hint: "Người ra quyết định / đánh giá dự án", answer: PRE.mainContactName, required: true },
        { text: "Chức danh / Phòng ban", hint: "VD: Giám đốc Marketing, Trưởng phòng KHTV, CTO...", answer: PRE.mainContactTitle, required: true },
        { text: "Email liên hệ", hint: "", answer: PRE.mainContactEmail, required: true },
        { text: "Số điện thoại / Zalo", hint: "", answer: PRE.mainContactPhone, required: true },
        { text: "Vai trò trong dự án Loyalty", hint: "Người ra quyết định / đánh giá kỹ thuật / người dùng cuối", answer: "" },
      ],
    },
    {
      label: "👨‍💻  C. NGƯỜI LIÊN HỆ KỸ THUẬT (IT)",
      questions: [
        { text: "Tên phòng ban phụ trách kỹ thuật", hint: "Phòng nắm thông tin POS API, hạ tầng, data warehouse", answer: PRE.itContactDept, required: true },
        { text: "Họ và tên đầu mối kỹ thuật", hint: "Để phối hợp tích hợp POS + migration data", answer: PRE.itContactName },
        { text: "Email IT contact", hint: "", answer: PRE.itContactEmail },
        { text: "Số điện thoại IT contact", hint: "", answer: "" },
      ],
    },
    {
      label: "📋  D. ĐẦU MỐI NGHIỆP VỤ LOYALTY",
      questions: [
        { text: "Đầu mối Marketing / KHTV", hint: "Người vận hành chính sách điểm, hạng, chiến dịch", answer: "" },
        { text: "Đầu mối CSKH (xử lý khiếu nại)", hint: "Thay thế vai trò hiện tại của Supporter", answer: "" },
        { text: "Đầu mối vận hành cửa hàng (ops)", hint: "Đào tạo quầy POS, onboarding cửa hàng mới", answer: "" },
      ],
    },
  ]
);

// ───────────────────────────────────────────────────────────────────────
// SHEET 3: Quy mô & Mở rộng
// ───────────────────────────────────────────────────────────────────────
const s3 = buildQuestionSheet(2, "Quy mô chuỗi bán lẻ & Kế hoạch mở rộng",
  "Quy mô hiện tại, volume giao dịch, và kế hoạch mở rộng trong 1–3 năm tới.",
  [
    {
      label: "🏪  A. SỐ LƯỢNG CỬA HÀNG / ĐIỂM BÁN",
      questions: [
        { text: "Tổng số cửa hàng hiện tại (offline)", hint: "Tính tất cả cửa hàng cả 2 brand. VD: 300 store", answer: PRE.storeCount, required: true },
        { text: "Phân bổ cửa hàng theo 2 brand", hint: "VD: Brand A ~150 store, Brand B ~150 store", answer: "" },
        { text: "Số kho / DC (distribution center)", hint: "Nếu loyalty cần tracking luồng tồn kho", answer: "" },
        { text: "Có website e-commerce riêng cho KHTV không?", hint: "Có/Không. Nếu có, bao nhiêu website (cho mỗi brand)?", answer: PRE.ecommerce },
        { text: "Có mobile app riêng không?", hint: "Có/Không. Thiết bị iOS/Android. Số downloads.", answer: "" },
        { text: "Có mini-app trên Zalo / Shopee / TikTok không?", hint: "Có/Không. Nếu có, nền tảng nào?", answer: "" },
      ],
    },
    {
      label: "👥  B. QUY MÔ HỘI VIÊN",
      questions: [
        { text: "Tổng số KHTV hiện tại", hint: "Số record trong hệ thống loyalty cũ", answer: PRE.memberCount, required: true },
        { text: "Tỷ lệ KHTV có phát sinh mua hàng", hint: "% KHTV có ít nhất 1 đơn trong 12 tháng", answer: PRE.activeRate, required: true },
        { text: "Tốc độ tăng trưởng KHTV hàng năm", hint: "VD: +10%/năm, +500K mới/năm", answer: "" },
        { text: "Phân khúc KHTV chính", hint: "VD: hộ gia đình, nội trợ, văn phòng, sinh viên...", answer: "" },
        { text: "Tỷ lệ KHTV sử dụng online so với offline", hint: "VD: 30% online, 70% offline", answer: "" },
      ],
    },
    {
      label: "💳  C. KHỐI LƯỢNG GIAO DỊCH",
      questions: [
        { text: "Số giao dịch TB / ngày", hint: "Tổng giao dịch POS toàn chuỗi năm gần nhất", answer: PRE.txnPerDay, required: true },
        { text: "Số giao dịch peak / ngày (lễ, sale)", hint: "Cao điểm Tết, Black Friday, 11/11...", answer: PRE.txnPeak, required: true },
        { text: "Giờ cao điểm trong ngày", hint: "VD: 17:00–19:00, cuối tuần tăng 30%", answer: "" },
        { text: "Giá trị đơn hàng TB (AOV)", hint: "VD: 150.000đ/đơn", answer: "" },
        { text: "Số SKU đang bán trong POS", hint: "VD: 20.000 SKU, cập nhật thường xuyên?", answer: "" },
      ],
    },
    {
      label: "📈  D. KẾ HOẠCH MỞ RỘNG 1–3 NĂM",
      questions: [
        { text: "Kế hoạch số điểm bán trong 3 năm tới", hint: "VD: từ 300 → 1.500 điểm bán", answer: PRE.storePlan, required: true },
        { text: "Kế hoạch mở thương hiệu / phân khúc mới", hint: "VD: thêm brand hi-end, tiện lợi, nhà thuốc...", answer: "" },
        { text: "Kế hoạch mở rộng online", hint: "Thêm e-com, social commerce, đối tác", answer: "" },
        { text: "Kế hoạch liên kết hệ sinh thái", hint: "Ví điện tử, ngân hàng, đối tác bán lẻ khác", answer: "" },
      ],
    },
    {
      label: "🧑‍💼  E. SỐ NGƯỜI DÙNG HỆ THỐNG LOYALTY",
      questions: [
        { text: "Số admin cấu hình hệ thống", hint: "Team vận hành loyalty trung tâm", answer: "" },
        { text: "Số nhân viên dùng app/màn hình quầy", hint: "VD: 2 nhân viên/cửa hàng × 300 = 600 user", answer: "" },
        { text: "Số nhân viên marketing + CSKH", hint: "Người chạy campaign, tra cứu KHTV, xử lý khiếu nại", answer: "" },
        { text: "Số người xem báo cáo (BOD, trưởng miền, vùng)", hint: "Read-only dashboard access", answer: "" },
      ],
    },
  ]
);

// ───────────────────────────────────────────────────────────────────────
// SHEET 4: Hệ thống & Tích hợp
// ───────────────────────────────────────────────────────────────────────
const s4 = buildQuestionSheet(3, "Hệ thống hiện có & Tích hợp",
  "Những phần mềm/hệ thống nào đang dùng và cần kết nối với Loyalty Platform?",
  [
    {
      label: "🖥️  A. HỆ THỐNG POS (ĐIỂM BÁN)",
      questions: [
        { text: "Tên phần mềm POS đang dùng", hint: "VD: KiotViet, Sapo, MayHouse, POS tự phát triển...", answer: "", required: true },
        { text: "POS có API / webhook chưa?", hint: "Có — real-time / Có — batch / Không / Chưa biết", answer: PRE.apiAvailable },
        { text: "POS gửi hoá đơn ra ngoài sau thanh toán?", hint: "Có/Không. Nếu có, định dạng JSON/XML?", answer: "" },
        { text: "Có ý định thay POS trong 12 tháng tới?", hint: "Có/Không/Đang cân nhắc. Nếu có, tích hợp POS mới hay cũ?", answer: "" },
      ],
    },
    {
      label: "🗄️  B. HỆ THỐNG QUẢN LÝ KHTV HIỆN TẠI",
      questions: [
        { text: "Goldmem", hint: "Hiện dùng làm gì? Data điển hình?", answer: PRE.goldmem },
        { text: "Microsoft Access", hint: "Chứa những gì?", answer: PRE.msAccess },
        { text: "Microsoft Excel", hint: "File dashboard nào đang dùng?", answer: PRE.msExcel },
        { text: "Supporter (khiếu nại CSKH)", hint: "Chứa những gì?", answer: PRE.supporter },
        { text: "Có hệ thống CRM riêng khác?", hint: "VD: Salesforce, HubSpot, vCRM, Zoho...", answer: "" },
        { text: "Có CDP / Data Warehouse / Data Lake?", hint: "Tên hệ thống, dữ liệu gì đang được lưu", answer: PRE.dataWarehouse },
      ],
    },
    {
      label: "📣  C. MARKETING & THÔNG BÁO",
      questions: [
        { text: "Kênh marketing hiện tại", hint: "SMS/Email/Push/Zalo OA/Viber... nền tảng nào?", answer: PRE.marketingAuto },
        { text: "Đang thuê agency marketing ngoài?", hint: "Có/Không. Phạm vi công việc của agency?", answer: PRE.marketingAuto },
        { text: "Có cổng SMS riêng / brandname?", hint: "NCC: Viettel, VinaPhone, Speedsms, Esms...", answer: "" },
        { text: "Có Zalo OA / Fanpage FB cho KHTV?", hint: "Có/Không. Tên OA/Page, số followers", answer: "" },
      ],
    },
    {
      label: "🔗  D. HỆ THỐNG KHÁC CẦN TÍCH HỢP",
      questions: [
        { text: "ERP / Kế toán", hint: "SAP, Oracle, MISA, Fast, Bravo... (có cần đồng bộ hoá đơn, công nợ?)", answer: "" },
        { text: "HRM", hint: "Tên hệ thống nhân sự. Có cần sync user để cấp quyền?", answer: "" },
        { text: "Ví điện tử / Cổng thanh toán", hint: "VNPay, MoMo, ZaloPay, Shopee Pay... Có cần liên kết điểm - ví?", answer: "" },
        { text: "Đối tác liên kết loyalty (co-branded)", hint: "VD: đổi điểm sang Grab, CGV, Highlands...", answer: "" },
        { text: "Hệ thống khác cần tích hợp", hint: "Mô tả tên + chức năng + ưu tiên", answer: "" },
      ],
    },
    {
      label: "🔐  E. XÁC THỰC & SSO",
      questions: [
        { text: "Có LDAP / Active Directory không?", hint: "Có/Không. Tên hệ thống.", answer: "" },
        { text: "Có yêu cầu Single Sign-On (SSO)?", hint: "Có/Không. Đang dùng IdP nào? (Azure AD, Okta, Keycloak...)", answer: "" },
        { text: "Có yêu cầu 2FA / MFA cho admin?", hint: "Có/Không. OTP SMS / Authenticator / Email OTP?", answer: "" },
      ],
    },
  ]
);

// ───────────────────────────────────────────────────────────────────────
// SHEET 5: Nghiệp vụ Loyalty
// ───────────────────────────────────────────────────────────────────────
const s5 = buildQuestionSheet(4, "Yêu cầu nghiệp vụ Loyalty",
  "Chính sách điểm, hạng, đổi thưởng, referral, CSKH — sát thực tế khách đang muốn thế nào?",
  [
    {
      label: "⭐  A. CHÍNH SÁCH TÍCH ĐIỂM",
      questions: [
        { text: "Tỷ lệ tích điểm mong muốn", hint: "VD: 1 điểm / 10.000đ, hoặc theo %. Khác nhau theo brand?", answer: "", required: true },
        { text: "Có min-spend không tích?", hint: "VD: đơn dưới 50.000đ không tích điểm", answer: "" },
        { text: "Có SKU / danh mục loại trừ không tích?", hint: "VD: thuốc lá, sữa công thức cho trẻ, hàng khuyến mãi", answer: "" },
        { text: "Có tích điểm nhân đôi/nhân 3 theo dịp?", hint: "VD: x2 cuối tuần, x3 sinh nhật, x5 campaign", answer: "" },
        { text: "Cross-brand: tích brand A, dùng brand B?", hint: "Có/Không. Hay dùng riêng từng brand?", answer: "", required: true },
      ],
    },
    {
      label: "🏅  B. HẠNG THÀNH VIÊN (TIER)",
      questions: [
        { text: "Số hạng mong muốn", hint: "VD: 4 hạng (Đồng/Bạc/Vàng/Kim Cương). Tên cụ thể?", answer: "", required: true },
        { text: "Tiêu chí lên hạng", hint: "Theo tổng chi tiêu / Số điểm tích lũy / Số đơn hàng?", answer: "" },
        { text: "Chu kỳ đánh giá hạng", hint: "Tháng / Quý / Năm / Rolling 12 tháng", answer: "" },
        { text: "Chính sách hạ hạng", hint: "Tự hạ cuối kỳ / Ân hạn / Không hạ", answer: "" },
        { text: "Quyền lợi theo hạng", hint: "Liệt kê: tỷ lệ tích, giảm giá sinh nhật, ưu tiên CSKH...", answer: "" },
      ],
    },
    {
      label: "⏳  C. HẠN SỬ DỤNG ĐIỂM",
      questions: [
        { text: "Chính sách hạn điểm", hint: "Không hết hạn / Sau X tháng / Cuối năm / Tuỳ hạng", answer: "" },
        { text: "Thông báo trước khi điểm hết hạn", hint: "VD: nhắc 30/14/7 ngày qua SMS/Email/Zalo", answer: "" },
        { text: "Logic tiêu điểm", hint: "FIFO (điểm cũ trừ trước) / LIFO / Không ưu tiên", answer: "" },
      ],
    },
    {
      label: "🎁  D. ĐỔI THƯỞNG & KHUYẾN MÃI",
      questions: [
        { text: "Loại phần thưởng mong muốn", hint: "Voucher tiền, quà vật lý, dịch vụ, thăng hạng...", answer: "" },
        { text: "Tỷ giá quy đổi điểm → VND", hint: "VD: 1 điểm = 1.000đ khi thanh toán", answer: "" },
        { text: "Có đổi điểm lấy voucher đối tác?", hint: "VD: đổi 500 điểm lấy voucher Grab 50K", answer: "" },
        { text: "Khuyến mãi theo khách", hint: "Khuyến mãi riêng hội viên / hạng cao / sinh nhật?", answer: "" },
      ],
    },
    {
      label: "👥  E. REFERRAL & GAMIFICATION",
      questions: [
        { text: "Có chương trình giới thiệu bạn bè?", hint: "Có/Không. Thưởng 1 chiều hay 2 chiều? Thưởng gì?", answer: "" },
        { text: "Có bảng xếp hạng hội viên?", hint: "Có/Không. Theo tiêu chí gì? Chu kỳ nào?", answer: "" },
        { text: "Có mini-game / nhiệm vụ (check-in, quay số)?", hint: "Có/Không. Kiểu nào?", answer: "" },
      ],
    },
    {
      label: "📢  F. KÊNH THÔNG BÁO TỰ ĐỘNG",
      questions: [
        { text: "Kênh thông báo cho KHTV", hint: "SMS / Email / Push / Zalo OA / Viber — ưu tiên kênh nào?", answer: "", required: true },
        { text: "Loại event cần thông báo", hint: "Tích điểm / thăng hạng / điểm hết hạn / voucher / KM", answer: "" },
        { text: "Tần suất tối đa gửi KH", hint: "VD: tối đa 2 SMS/tháng, tránh spam", answer: "" },
      ],
    },
    {
      label: "🎧  G. CHĂM SÓC KHÁCH HÀNG",
      questions: [
        { text: "Khiếu nại hiện đang ghi ở đâu?", hint: "Supporter / Excel / khác. Có cần chuyển vào Loyalty?", answer: PRE.supporter },
        { text: "Có tổng đài / call center không?", hint: "Có/Không. Tên hệ thống (Viettel, FPT, Asterisk...)", answer: "" },
        { text: "SLA xử lý khiếu nại nội bộ", hint: "VD: trong 24h / 48h tùy mức độ", answer: "" },
      ],
    },
    {
      label: "📊  H. BÁO CÁO & PHÂN TÍCH",
      questions: [
        { text: "Báo cáo cần có cho BOD", hint: "Retention, CLV, churn, xu hướng điểm, phân bổ hạng...", answer: "" },
        { text: "Có cần phân khúc RFM / CDP?", hint: "Có/Không. Để target campaign thông minh hơn", answer: "" },
        { text: "Có cần export/sync sang Power BI/Tableau?", hint: "Có/Không. Tên BI tool đang dùng.", answer: "" },
        { text: "Tần suất báo cáo định kỳ", hint: "Daily / Weekly / Monthly — gửi cho ai?", answer: "" },
      ],
    },
  ]
);

// ───────────────────────────────────────────────────────────────────────
// SHEET 6: Hạ tầng & Bảo mật
// ───────────────────────────────────────────────────────────────────────
const s6 = buildQuestionSheet(5, "Hạ tầng, An toàn & Tuân thủ",
  "Mô hình triển khai (cloud / on-prem / hybrid), bảo mật, SLA kỳ vọng.",
  [
    {
      label: "🖥️  A. MÔ HÌNH TRIỂN KHAI",
      questions: [
        { text: "Mô hình triển khai mong muốn", hint: "Cloud (Reborn host) / On-premise / Hybrid / Chưa xác định", answer: PRE.infraModel, required: true },
        { text: "Nếu Cloud: chọn nhà cung cấp?", hint: "AWS, Azure, GCP, VNG Cloud, FPT Cloud, Viettel IDC...", answer: "" },
        { text: "Nếu On-prem: cấu hình server sẵn có?", hint: "CPU cores, RAM, storage, hệ điều hành", answer: "" },
        { text: "Yêu cầu tách UAT / Production?", hint: "Có/Không (khuyến nghị có 2 môi trường riêng)", answer: "" },
        { text: "Dự kiến giờ bảo trì planned", hint: "VD: 02:00–05:00 thứ 7 hàng tháng", answer: "" },
      ],
    },
    {
      label: "💾  B. LƯU TRỮ & BACKUP",
      questions: [
        { text: "Chính sách lưu trữ dữ liệu KHTV", hint: "Theo quy định nội bộ: 5 năm / 10 năm / vĩnh viễn", answer: "" },
        { text: "Yêu cầu dung lượng ban đầu", hint: "Ước tính: ~500GB cho 3M KHTV + giao dịch 1 năm", answer: "" },
        { text: "Yêu cầu backup định kỳ", hint: "Daily / Weekly — giữ bao lâu? Có offsite?", answer: "" },
        { text: "Yêu cầu DR (Disaster Recovery)", hint: "RTO / RPO mong muốn (VD: RTO 4h, RPO 1h)", answer: "" },
      ],
    },
    {
      label: "🔒  C. BẢO MẬT & TUÂN THỦ",
      questions: [
        { text: "Chứng chỉ bảo mật yêu cầu", hint: "ISO 27001, PCI-DSS, SOC 2, NĐ 13 dữ liệu cá nhân — Có/Không?", answer: "" },
        { text: "Yêu cầu mã hoá data at-rest?", hint: "Có/Không. Tiêu chuẩn AES-256?", answer: "" },
        { text: "Yêu cầu mã hoá data in-transit", hint: "HTTPS/TLS 1.2+ mặc định", answer: "" },
        { text: "Audit trail (lịch sử thay đổi)", hint: "Có/Không. Lưu bao lâu?", answer: "" },
        { text: "Phân quyền theo vai trò (RBAC)", hint: "Có/Không. Số vai trò dự kiến?", answer: "" },
        { text: "Yêu cầu về địa điểm lưu data", hint: "Trong lãnh thổ Việt Nam / Quốc tế đều được", answer: "" },
      ],
    },
    {
      label: "🌐  D. HIỆU NĂNG & SLA",
      questions: [
        { text: "Thời gian phản hồi API mong muốn (P95)", hint: "Mặc định Reborn cam kết < 500ms", answer: "" },
        { text: "Tải peak mong muốn", hint: "Dựa 300K txn/ngày ≈ 500 txn/giây sustained", answer: "" },
        { text: "Yêu cầu uptime", hint: "99.5% (mặc định) / 99.9% (enterprise) / khác", answer: "" },
        { text: "Băng thông internet tại HQ / DC", hint: "VD: 500Mbps, 1Gbps leased line", answer: "" },
      ],
    },
  ]
);

// ───────────────────────────────────────────────────────────────────────
// SHEET 7: Triển khai & Thương mại
// ───────────────────────────────────────────────────────────────────────
const s7 = buildQuestionSheet(6, "Triển khai, Đào tạo & Thương mại",
  "Timeline, đào tạo, ngân sách, lo ngại, tiêu chí chọn vendor.",
  [
    {
      label: "📅  A. TIMELINE & LỘ TRÌNH",
      questions: [
        { text: "Thời gian mong muốn go-live pilot", hint: "VD: trong 2 tháng, trước quý 3/2026", answer: "", required: true },
        { text: "Thời gian rollout toàn chuỗi", hint: "VD: 6 tháng kể từ khởi động", answer: "" },
        { text: "Phase 1 ưu tiên: store nào pilot?", hint: "Brand A hay Brand B? Bao nhiêu store pilot?", answer: "" },
        { text: "Có deadline nội bộ / sự kiện gắn với dự án?", hint: "VD: Tết, Black Friday, khai trương brand mới", answer: "" },
        { text: "Có yêu cầu chạy song song hệ cũ?", hint: "Có/Không. Bao lâu? (khuyến nghị 1 tháng để đối soát)", answer: "" },
      ],
    },
    {
      label: "🎓  B. ĐÀO TẠO & HỖ TRỢ",
      questions: [
        { text: "Số admin / super-user cần đào tạo", hint: "Team vận hành trung tâm, quản trị hệ thống", answer: "" },
        { text: "Số end-user (cashier, CSKH) cần đào tạo", hint: "Nhân viên quầy, nhân viên CSKH", answer: "" },
        { text: "Hình thức đào tạo", hint: "Trực tiếp tại HQ / Online / Tài liệu + video / Kết hợp", answer: "" },
        { text: "SLA hỗ trợ sau go-live mong muốn", hint: "8×5 response < 4h (Standard) / 24×7 < 1h (Premium)", answer: "" },
        { text: "Có cần đào tạo chuyên sâu cho admin?", hint: "Để team khách tự customize rule, campaign, dashboard", answer: "" },
      ],
    },
    {
      label: "💰  C. NGÂN SÁCH & THƯƠNG MẠI",
      questions: [
        { text: "Ngân sách dự kiến cho dự án", hint: "<1 tỷ / 1–3 tỷ / 3–5 tỷ / >5 tỷ / Chưa xác định", answer: "", required: true },
        { text: "Mô hình thanh toán ưa thích", hint: "SaaS / One-time + maintenance / Hybrid / Chưa quyết định", answer: "" },
        { text: "Có yêu cầu PoC trước?", hint: "Có (2–4 tuần trên sample data) / Không", answer: "" },
        { text: "Cấp phê duyệt ngân sách", hint: "TGĐ / HĐQT / CFO / Đã được phê duyệt", answer: "" },
        { text: "Thời gian ra quyết định dự kiến", hint: "Trong 2 tuần / 1 tháng / sau demo / sau PoC", answer: "" },
      ],
    },
    {
      label: "⚠️  D. KỲ VỌNG & LO NGẠI",
      questions: [
        { text: "Lo ngại lớn nhất khi triển khai Loyalty", hint: "VD: nhân viên không dùng / tích hợp POS phức tạp / mất data KHTV", answer: "" },
        { text: "Pain points hiện tại cần giải ngay", hint: "Từ Q&A: data rải rác, thủ công, phụ thuộc agency", answer: PRE.painPoints },
        { text: "Tiêu chí chọn nhà cung cấp (xếp hạng)", hint: "Giá / Tính năng / Hỗ trợ VN / Bảo mật / Tốc độ / Scale", answer: "" },
        { text: "Đang cân nhắc vendor nào khác?", hint: "VD: MotusX, Smartly, Salesforce Loyalty...", answer: "" },
        { text: "Điều quan trọng nhất đạt được sau 6 tháng", hint: "VD: thống nhất data 2 brand, nâng CLV x1.3, tự chạy campaign", answer: "" },
      ],
    },
  ]
);

// ───────────────────────────────────────────────────────────────────────
// SHEET 8: Tóm tắt
// ───────────────────────────────────────────────────────────────────────
function buildSummarySheet() {
  const rows = [];
  rows.push([cell("  SHEET 7   ·   Tóm tắt & Ghi chú bổ sung", S.sheetTitle), null, null, null]);
  rows.push([cell("  Tổng hợp nhanh các chỉ số quan trọng — Reborn sẽ điền từ các sheet trên, quý khách xem lại.", S.sheetSubtitle), null, null, null]);
  rows.push([cell("", { border: borderNone }), null, null, null]);
  rows.push([
    cell("CHỈ SỐ QUAN TRỌNG", S.tableHeader),
    cell("", S.tableHeader),
    cell("GIÁ TRỊ", S.tableHeader),
    cell("ĐƠN VỊ", S.tableHeader),
  ]);

  const items = [
    ["Số thương hiệu", "2", "brand"],
    ["Số cửa hàng hiện tại", "~300", "store"],
    ["Số cửa hàng kế hoạch 3 năm", "1.000 – 1.500", "store"],
    ["Số KHTV", "~3.000.000", "người"],
    ["Tỷ lệ KHTV active", "70–80", "%"],
    ["Giao dịch TB / ngày", "~150.000", "txn"],
    ["Giao dịch peak / ngày", "~300.000", "txn"],
    ["Mô hình triển khai", "", "Cloud / On-prem / Hybrid"],
    ["Timeline go-live", "", "tháng"],
    ["Ngân sách dự kiến", "", "tỷ VND"],
    ["Số hệ thống cần tích hợp", "", "hệ thống"],
    ["Số kênh thông báo", "", "kênh"],
    ["Yêu cầu SSO / LDAP", "", "Có / Không"],
    ["Yêu cầu chứng chỉ bảo mật", "", "ISO 27001 / PCI-DSS / Không"],
  ];
  items.forEach(([k, v, u]) => {
    const vStyle = v ? S.answerFilled : S.answerEmpty;
    rows.push([
      cell("  " + k, S.question),
      cell("", S.question),
      cell(v, vStyle),
      cell(u, S.hint),
    ]);
  });

  rows.push([cell("", { border: borderNone }), null, null, null]);
  rows.push([cell("📝  GHI CHÚ BỔ SUNG / YÊU CẦU ĐẶC BIỆT", S.groupHeader), null, null, null]);
  for (let i = 0; i < 6; i++) {
    rows.push([cell("", S.answerEmpty), null, null, null]);
  }

  rows.push([cell("", { border: borderNone }), null, null, null]);
  rows.push([cell("✅  Hoàn tất phiếu khảo sát → Gửi về ceo@reborn.vn  |  Reborn phản hồi proposal + báo giá chi tiết trong 5 ngày làm việc", S.footer), null, null, null]);

  const ws = XLSX.utils.aoa_to_sheet(rows.map(r => r.map(c => c === null ? "" : c)));
  rows.forEach((row, rIdx) => {
    row.forEach((c, cIdx) => {
      if (c && typeof c === "object" && c.s) {
        const addr = XLSX.utils.encode_cell({ r: rIdx, c: cIdx });
        if (ws[addr]) ws[addr].s = c.s;
      }
    });
  });

  ws["!cols"] = [{ wch: 38 }, { wch: 1 }, { wch: 32 }, { wch: 28 }];
  ws["!rows"] = [];
  ws["!rows"][0] = { hpt: 34 };
  ws["!rows"][1] = { hpt: 22 };
  ws["!rows"][2] = { hpt: 8 };
  ws["!rows"][3] = { hpt: 28 };

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }, // merge header cells A+B
    { s: { r: rows.length - 1, c: 0 }, e: { r: rows.length - 1, c: 3 } },
  ];
  // Merge each item row A+B too
  for (let i = 4; i < 4 + items.length; i++) {
    ws["!merges"].push({ s: { r: i, c: 0 }, e: { r: i, c: 1 } });
    ws["!rows"][i] = { hpt: 24 };
  }
  // Note section
  const noteHeaderRow = 4 + items.length + 1;
  ws["!merges"].push({ s: { r: noteHeaderRow, c: 0 }, e: { r: noteHeaderRow, c: 3 } });
  ws["!rows"][noteHeaderRow] = { hpt: 28 };
  for (let i = 0; i < 6; i++) {
    const r = noteHeaderRow + 1 + i;
    ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: 3 } });
    ws["!rows"][r] = { hpt: 32 };
  }

  return ws;
}

// ═══ APPEND & SAVE ═══════════════════════════════════════════════════════
XLSX.utils.book_append_sheet(wb, buildCoverSheet(), "📋 Bìa & Hướng Dẫn");
XLSX.utils.book_append_sheet(wb, s2, "1️⃣ Doanh nghiệp");
XLSX.utils.book_append_sheet(wb, s3, "2️⃣ Quy mô & Mở rộng");
XLSX.utils.book_append_sheet(wb, s4, "3️⃣ Hệ thống & Tích hợp");
XLSX.utils.book_append_sheet(wb, s5, "4️⃣ Nghiệp vụ Loyalty");
XLSX.utils.book_append_sheet(wb, s6, "5️⃣ Hạ tầng & Bảo mật");
XLSX.utils.book_append_sheet(wb, s7, "6️⃣ Triển khai & Giá");
XLSX.utils.book_append_sheet(wb, buildSummarySheet(), "7️⃣ Tóm tắt");

import { existsSync } from "fs";
let outPath = "docs/survey/Phieu-khao-sat-Loyalty.xlsx";
try {
  XLSX.writeFile(wb, outPath, { cellStyles: true });
  console.log(`✓ Survey XLSX generated: ${outPath}`);
} catch (e) {
  if (e.code === "EBUSY") {
    const fallback = `docs/survey/Phieu-khao-sat-Loyalty_v${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fallback, { cellStyles: true });
    console.log(`⚠ File gốc đang mở trong Excel — đã ghi ra: ${fallback}`);
    console.log(`  → Đóng file gốc rồi xoá bản tạm, hoặc đổi tên bản tạm thay cho file gốc.`);
  } else throw e;
}
