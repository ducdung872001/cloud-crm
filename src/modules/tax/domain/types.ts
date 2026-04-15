// Tax module — pure domain types. No framework imports allowed in this file.
// Reference: TT 40/2021/TT-BTC (mẫu 01/CNKD, 01-2/BK-HDKD), NĐ 70/2025/NĐ-CP.

export type TaxMethod =
  | "presumptive" // Khoán
  | "declaration" // Kê khai
  | "per_occurrence" // Từng lần phát sinh
  | "on_behalf"; // Khai thay / nộp thay

export type TaxPeriodKind = "month" | "quarter" | "year" | "occurrence";

// 5 nhóm ngành nghề theo TT 40/2021 — quyết định tỷ lệ thuế GTGT+TNCN
export type IndustryGroup =
  | "distribution" // Phân phối, cung cấp hàng hoá — 1% + 0.5%
  | "service_no_material" // Dịch vụ, XD không bao thầu NVL — 5% + 2%
  | "production_transport" // Sản xuất, vận tải, dịch vụ gắn với HH, XD có bao thầu NVL — 3% + 1.5%
  | "other_business" // Hoạt động kinh doanh khác — 2% + 1%
  | "asset_lease"; // Cho thuê tài sản, đại lý XS/BH/ĐC — 0% + 5%

export interface TaxRate {
  vat: number; // tỷ lệ % GTGT, dạng thập phân (0.01 = 1%)
  pit: number; // tỷ lệ % TNCN
}

export interface TaxpayerProfile {
  id: string;
  // Thông tin định danh
  taxCode: string; // MST 10 hoặc 13 số
  fullName: string; // tên chủ hộ / cá nhân kinh doanh
  nationalId: string; // CCCD/CMND
  businessName?: string; // tên cơ sở kinh doanh
  businessRegistrationNo?: string; // số đăng ký kinh doanh
  address: string;
  ward?: string;
  district?: string;
  province: string;
  phone?: string;
  email?: string;
  // Phương pháp tính thuế hiện hành
  method: TaxMethod;
  periodKind: TaxPeriodKind;
  // Ngành nghề & tỷ lệ thuế
  primaryIndustryGroup: IndustryGroup;
  vsicCode?: string; // mã ngành VSIC chi tiết
  // Liên kết NH (dùng để nộp thuế)
  bankName?: string;
  bankAccountNo?: string;
  // Cấu hình nâng cao
  usesCashRegister?: boolean; // NĐ 70/2025 — HKD>1 tỷ ngành F&B/bán lẻ
  invoiceType?: "none" | "electronic" | "cash_register_connected";
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Giao dịch doanh thu — shape chuẩn hoá từ mọi nguồn (FitPro, Retail, CommunityHub…)
export interface RevenueRecord {
  id: string;
  occurredAt: string; // ISO date
  amount: number; // VND, đã trừ giảm giá
  industryGroup: IndustryGroup; // nhóm ngành của doanh thu này
  vsicCode?: string;
  description?: string;
  sourceModule: string; // "fitpro.booking" | "retail.pos" | "manual" | "community.event"
  sourceRefId: string; // id gốc của giao dịch trong hệ thống nguồn
  isTaxable: boolean; // có thể exclude giao dịch nội bộ/hoàn huỷ
  invoiceNo?: string; // số hoá đơn điện tử nếu có
}

// Bản ghi chi phí — dùng cho phương pháp kê khai (01-2/BK-HDKD phần II)
export type ExpenseCategory =
  | "labor" // [24] nhân công
  | "electricity" // [25] điện
  | "water" // [26] nước
  | "telecom" // [27] viễn thông
  | "rent" // [28] thuê kho/bãi/mặt bằng
  | "admin" // [29] chi phí quản lý
  | "other"; // [30] khác

export interface ExpenseRecord {
  id: string;
  occurredAt: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  sourceModule: string;
  sourceRefId: string;
  hasInvoice?: boolean;
}

// Tồn kho đầu/cuối kỳ (phụ lục 01-2/BK-HDKD Phần I)
export interface InventorySnapshot {
  periodId: string;
  openingMaterials: number; // [08] NVL đầu kỳ
  openingGoods: number; // [09] thành phẩm/hàng hoá đầu kỳ
  inflowMaterials: number; // [10]
  inflowGoods: number; // [11]
  outflowMaterials: number; // [12]
  outflowGoods: number; // [13]
  closingMaterials: number; // [14]
  closingGoods: number; // [15]
}

// Một kỳ thuế
export interface TaxPeriod {
  id: string;
  kind: TaxPeriodKind;
  label: string; // ví dụ "Tháng 03/2026", "Quý 1/2026", "Năm 2025"
  startDate: string;
  endDate: string;
  dueDate: string; // hạn nộp tờ khai
  status: "draft" | "aggregated" | "locked" | "submitted" | "accepted";
}

// Kết quả tính thuế
export interface TaxBreakdown {
  industryGroup: IndustryGroup;
  taxableRevenue: number;
  vatRate: number;
  pitRate: number;
  vatAmount: number;
  pitAmount: number;
  totalAmount: number;
}

export interface TaxCalculationResult {
  periodId: string;
  totalRevenue: number;
  totalDeductibleExpense: number;
  breakdowns: TaxBreakdown[]; // có thể nhiều nhóm ngành trong cùng 1 kỳ
  totalVat: number;
  totalPit: number;
  specialConsumptionTax: number; // TTĐB [33]
  resourceTax: number; // tài nguyên [34]
  environmentFee: number; // BVMT [35]
  licenseFee: number; // môn bài (tính riêng, gắn với năm)
  totalTaxPayable: number;
  estimatedProfit: number;
}

// Tờ khai đã lập — chuẩn bị XML schema TCT
export interface TaxDeclaration {
  id: string;
  formCode: string; // "01/CNKD" | "01-2/BK-HDKD" | "03/CNKD" | "01/LPMB"
  taxpayerId: string;
  period: TaxPeriod;
  method: TaxMethod;
  calculation: TaxCalculationResult;
  submittedAt?: string;
  receiptCode?: string; // mã tra cứu của TCT
  status: "draft" | "ready" | "signed" | "submitted" | "accepted" | "rejected";
  submissionChannel?: "etax_mobile" | "tax_agent" | "manual";
  attachments?: { name: string; url: string }[];
  notes?: string;
  xmlPayload?: string; // XML chuẩn TCT sau khi build
  createdAt: string;
  updatedAt: string;
}

// Cảnh báo ngưỡng
export interface ThresholdWarning {
  code:
    | "near_exemption" // gần ngưỡng 100tr
    | "crossed_exemption" // vượt 100tr
    | "must_use_cash_register" // >1 tỷ ngành F&B/bán lẻ
    | "must_switch_to_declaration" // >3 tỷ
    | "license_fee_due";
  severity: "info" | "warning" | "critical";
  message: string;
  actionLabel?: string;
}
