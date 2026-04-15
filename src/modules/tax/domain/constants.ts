// Bảng tỷ lệ thuế, ngưỡng doanh thu, mã mẫu tờ khai theo TT 40/2021/TT-BTC và NĐ 70/2025.
// Tách riêng ra file này để khi pháp luật đổi thì chỉ sửa 1 chỗ.

import type { IndustryGroup, TaxRate, TaxMethod, TaxPeriodKind } from "./types";

// ═══ TỶ LỆ THUẾ THEO NGÀNH (TT 40/2021) ═══════════════════════════════════
export const TAX_RATES: Record<IndustryGroup, TaxRate> = {
  distribution: { vat: 0.01, pit: 0.005 }, // 1% + 0.5% = 1.5%
  service_no_material: { vat: 0.05, pit: 0.02 }, // 5% + 2% = 7%
  production_transport: { vat: 0.03, pit: 0.015 }, // 3% + 1.5% = 4.5%
  other_business: { vat: 0.02, pit: 0.01 }, // 2% + 1% = 3%
  asset_lease: { vat: 0, pit: 0.05 }, // 0 + 5% = 5%
};

export const INDUSTRY_GROUP_LABELS: Record<IndustryGroup, string> = {
  distribution: "Phân phối, cung cấp hàng hoá",
  service_no_material: "Dịch vụ, xây dựng không bao thầu nguyên vật liệu",
  production_transport: "Sản xuất, vận tải, dịch vụ có gắn với hàng hoá, xây dựng có bao thầu NVL",
  other_business: "Hoạt động kinh doanh khác",
  asset_lease: "Cho thuê tài sản, đại lý xổ số / bảo hiểm / đa cấp",
};

export const INDUSTRY_GROUP_EXAMPLES: Record<IndustryGroup, string[]> = {
  distribution: ["Tạp hoá", "Cửa hàng thời trang", "Hiệu thuốc", "Bán lẻ mỹ phẩm"],
  service_no_material: [
    "Quán cafe",
    "Nhà hàng (không bán mang về)",
    "Spa làm đẹp",
    "Phòng tập gym/yoga",
    "Dạy học, dạy nghề",
    "Khách sạn, homestay",
  ],
  production_transport: [
    "Xưởng sản xuất nhỏ",
    "Grab/Xe công nghệ",
    "Vận tải hàng hoá",
    "Gia công may mặc",
    "Xây dựng trọn gói (có vật liệu)",
  ],
  other_business: ["Quảng cáo trực tuyến", "Tư vấn", "Dịch vụ hỗn hợp"],
  asset_lease: ["Cho thuê mặt bằng", "Cho thuê xe tự lái", "Đại lý bảo hiểm"],
};

// ═══ NGƯỠNG DOANH THU ═════════════════════════════════════════════════════
export const REVENUE_THRESHOLDS = {
  vatExemption: 100_000_000, // ≤100tr/năm: miễn GTGT+TNCN+môn bài
  licenseFeeBands: [
    { max: 300_000_000, fee: 300_000 },
    { max: 500_000_000, fee: 500_000 },
    { max: Infinity, fee: 1_000_000 },
  ],
  cashRegisterRequired: 1_000_000_000, // >1 tỷ ngành F&B/bán lẻ phải dùng máy tính tiền kết nối TCT
  mustSwitchToDeclaration: 3_000_000_000, // >3 tỷ buộc chuyển kê khai
};

// Các ngành bắt buộc dùng máy tính tiền kết nối TCT khi >1 tỷ/năm (NĐ 70/2025)
export const CASH_REGISTER_REQUIRED_INDUSTRIES: IndustryGroup[] = [
  "distribution",
  "service_no_material",
];

// ═══ MÃ MẪU TỜ KHAI ═══════════════════════════════════════════════════════
export const FORM_CODES = {
  MAIN_01_CNKD: "01/CNKD", // Tờ khai chính cho HKD/CNKD
  APPENDIX_01_2: "01-2/BK-HDKD", // Phụ lục bảng kê (phương pháp kê khai)
  ACTUAL_03_CNKD: "03/CNKD", // Tờ khai kết quả kinh doanh thực tế
  LICENSE_01_LPMB: "01/LPMB", // Lệ phí môn bài
  LEASE_01_TTS: "01/TTS", // Cho thuê tài sản
} as const;

export const FORM_LABELS: Record<string, string> = {
  [FORM_CODES.MAIN_01_CNKD]: "Tờ khai thuế đối với hộ kinh doanh, cá nhân kinh doanh",
  [FORM_CODES.APPENDIX_01_2]: "Bảng kê hoạt động kinh doanh trong kỳ",
  [FORM_CODES.ACTUAL_03_CNKD]: "Tờ khai quyết toán kết quả kinh doanh",
  [FORM_CODES.LICENSE_01_LPMB]: "Tờ khai lệ phí môn bài",
  [FORM_CODES.LEASE_01_TTS]: "Tờ khai thuế cho thuê tài sản",
};

// ═══ PHƯƠNG PHÁP TÍNH THUẾ ════════════════════════════════════════════════
export const TAX_METHOD_LABELS: Record<TaxMethod, string> = {
  presumptive: "Khoán",
  declaration: "Kê khai",
  per_occurrence: "Từng lần phát sinh",
  on_behalf: "Khai thay / nộp thay",
};

export const TAX_METHOD_DESCRIPTIONS: Record<TaxMethod, string> = {
  presumptive:
    "Thuế được ấn định trên doanh thu khoán hàng năm. Đơn giản, khai 1 lần/năm. Phù hợp HKD có doanh thu ổn định, không biến động nhiều.",
  declaration:
    "Khai thuế thực tế theo tháng/quý dựa trên doanh thu phát sinh. Có thể kê khấu trừ chi phí. Phù hợp HKD doanh thu biến động, hoặc bị buộc chuyển theo NĐ 70/2025.",
  per_occurrence:
    "Khai thuế cho từng lần phát sinh giao dịch riêng lẻ. Phù hợp cá nhân kinh doanh không thường xuyên.",
  on_behalf:
    "Tổ chức/đại lý thuế khai và nộp thay cho HKD/CNKD. Phù hợp cá nhân không có thời gian tự khai.",
};

export const PERIOD_KIND_LABELS: Record<TaxPeriodKind, string> = {
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
  occurrence: "Từng lần",
};

// ═══ DEADLINE TỜ KHAI ═════════════════════════════════════════════════════
// Theo Luật Quản lý thuế 38/2019:
// - Khai tháng: ngày 20 tháng liền kề
// - Khai quý: ngày cuối tháng đầu tiên của quý kế tiếp
// - Khai năm (khoán): ngày 15/12 năm trước (kê khai doanh thu dự kiến)
// - Quyết toán năm: ngày cuối tháng 3 năm kế tiếp
export const DEADLINE_RULES = {
  monthlyDueDayOfNextMonth: 20,
  quarterlyDueDayOfFirstMonthNextQuarter: 31,
  yearlyPresumptiveSubmitBefore: "12-15", // MM-DD
  yearlyFinalizationBefore: "03-31",
};

// ═══ CẤU HÌNH KÊNH NỘP eTax ═══════════════════════════════════════════════
export const ETAX_ENDPOINTS = {
  mobileGateway: "https://thuedientu.gdt.gov.vn/etaxnnt/Request", // production (stub)
  testGateway: "https://thuedientutest.gdt.gov.vn/etaxnnt/Request",
};
