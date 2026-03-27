// Đặt tại: src/model/paymentMethod/PaymentMethodModel.ts

export type PaymentPartner =
  | "CASH" | "BANK_TRANSFER" | "QR_PRO"
  | "MOMO" | "ZALOPAY" | "VNPAY" | "CREDIT_CARD" | "OTHER";

export type PaymentProcessType = "MANUAL" | "AUTO";

// ── Tầng 1: System Admin ──────────────────────────────────────────────────
export interface IPaymentMethodTemplate {
  id: number;
  partner: PaymentPartner;
  processType: PaymentProcessType;
  systemName: string;
  description?: string;
  logoUrl?: string;
  requiresKey: boolean;
  position: number;
  isActive: boolean;
}

export interface IPaymentTemplateRequest {
  id?: number;
  partner: PaymentPartner;
  processType: PaymentProcessType;
  systemName: string;
  description?: string;
  logoUrl?: string;
  requiresKey?: boolean;
  position?: number;
  isActive?: boolean;
}

// ── Tầng 2: Store Admin ───────────────────────────────────────────────────
export interface IStorePaymentConfigResponse {
  id: number;
  templateId: number;
  template: IPaymentMethodTemplate;      // JOIN từ backend
  branchId: number;
  displayName: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  partnerCode?: string;
  apiKey?: string;                       // masked: "••••••••xxxx"
  clientSecret?: string;                 // masked
  paymentTimeout?: number;
  isDefault: boolean;
  isActive: boolean;
  position: number;
}

export interface IStorePaymentConfigRequest {
  id?: number;
  templateId: number;
  displayName: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  partnerCode?: string;
  apiKey?: string;           // plain text, backend tự encrypt
  clientSecret?: string;
  paymentTimeout?: number;
  isDefault?: boolean;
  isActive?: boolean;
  position?: number;
}

// ── Constants dùng ở cả 2 tầng ────────────────────────────────────────────
export const PARTNER_META: Record<PaymentPartner, {
  label: string; icon: string; color: string; processType: PaymentProcessType;
}> = {
  CASH:          { label: "Tiền mặt",               icon: "💵", color: "#16a34a", processType: "MANUAL" },
  BANK_TRANSFER: { label: "Chuyển khoản ngân hàng", icon: "🏦", color: "#2563eb", processType: "MANUAL" },
  QR_PRO:        { label: "QR Pro (VietQR)",         icon: "📷", color: "#0891b2", processType: "AUTO"   },
  MOMO:          { label: "Ví MoMo",                 icon: "🟣", color: "#ae2d8b", processType: "AUTO"   },
  ZALOPAY:       { label: "ZaloPay",                 icon: "🔵", color: "#0068ff", processType: "AUTO"   },
  VNPAY:         { label: "VNPay",                   icon: "🔴", color: "#e11d48", processType: "AUTO"   },
  CREDIT_CARD:   { label: "Thẻ tín dụng / Quẹt thẻ",icon: "💳", color: "#d97706", processType: "AUTO"   },
  OTHER:         { label: "Khác",                    icon: "⚙️",  color: "#64748b", processType: "MANUAL" },
};

export const STORE_FIELDS_BY_PARTNER: Record<PaymentPartner, string[]> = {
  CASH:          [],
  BANK_TRANSFER: ["bankName", "accountNumber", "accountHolderName"],
  QR_PRO:        ["bankName", "accountNumber", "accountHolderName"],
  MOMO:          ["accountNumber", "partnerCode", "apiKey", "clientSecret", "paymentTimeout"],
  ZALOPAY:       ["accountNumber", "partnerCode", "apiKey", "clientSecret", "paymentTimeout"],
  VNPAY:         ["partnerCode", "apiKey", "clientSecret", "paymentTimeout"],
  CREDIT_CARD:   [],
  OTHER:         ["accountNumber", "accountHolderName"],
};

export const VIETNAM_BANKS = [
  { value: "VCB",   label: "Vietcombank (VCB)" },
  { value: "VTB",   label: "Vietinbank (VTB)"  },
  { value: "BIDV",  label: "BIDV"               },
  { value: "AGR",   label: "Agribank (AGR)"     },
  { value: "TCB",   label: "Techcombank (TCB)"  },
  { value: "MB",    label: "MB Bank"             },
  { value: "VPB",   label: "VPBank"              },
  { value: "ACB",   label: "ACB"                 },
  { value: "SHB",   label: "SHB"                 },
  { value: "TPB",   label: "TPBank"              },
  { value: "MSB",   label: "MSB"                 },
  { value: "HDB",   label: "HDBank"              },
  { value: "OCB",   label: "OCB"                 },
  { value: "OTHER", label: "Ngân hàng khác"      },
];
