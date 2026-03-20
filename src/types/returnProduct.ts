// ─── UI local types (giữ nguyên, dùng trong các component) ──────────────────

export type ReturnType = "return" | "exchange";
export type ReturnStatus = "pending" | "processing" | "done" | "cancel";

export interface ReturnProduct {
  id: string;
  code: string;
  time: string;
  customerName: string;
  originalOrderCode: string;
  type: ReturnType;
  productSummary: string;
  refundAmount: number;
  status: ReturnStatus;
  reason: string;
  staffName: string;
  paymentMethod: string;
  note?: string;
}

export interface ReturnProductItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface ReturnStatCard {
  label: string;
  value: string;
  sub: string;
  variant?: "warn" | "success" | "default";
}

// ─── API request / response types ────────────────────────────────────────────

/** Params cho GET /sales/invoice/return-exchange/list */
export interface IReturnInvoiceListParams {
  /** 1=Trả hàng | 2=Đổi hàng | undefined=Tất cả */
  returnType?: number;
  customerId?: number;
  invoiceCode?: string;
  /** 1=Hoàn thành | 2=Nháp | 3=Đã hủy */
  status?: number;
  fromDate?: string;
  toDate?: string;
  branchId?: number;
  page?: number;
  size?: number;
}

/** Invoice object trả về từ API (ánh xạ từ bảng invoice) */
export interface IReturnInvoiceResponse {
  id: number;
  invoiceCode: string;
  /** IV2=Trả hàng | IV11=Đổi hàng */
  invoiceType: string;
  /** 1=Trả hàng | 2=Đổi hàng */
  returnType: number;
  /** Tiền hoàn / chênh lệch */
  fee: number;
  paid: number;
  debt: number;
  amount: number;
  discount: number;
  /** 1=Hoàn thành | 2=Nháp | 3=Đã hủy */
  status: number;
  reason: string;
  /** 1=Tiền mặt | 2=Chuyển khoản | 3=Ví | 4=Không hoàn */
  refundMethod: number;
  receiptDate: string;
  /** ID đơn hàng gốc */
  referId: number;
  customerId: number;
  /** Tên khách (backend join, có thể null nếu chưa join) */
  customerName?: string;
  /** Tên nhân viên (backend join, có thể null) */
  employeeName?: string;
  employeeId: number;
  branchId: number;
  bsnId: number;
  /** Mã đơn hàng gốc (backend join) */
  referInvoiceCode?: string;
  /** Tổng hợp tên sản phẩm trả (backend join) */
  productSummary?: string;
}

/** Response wrapper từ DfResponse<Page<Invoice>> */
export interface IReturnInvoiceListResponse {
  result: {
    data: IReturnInvoiceResponse[];
    total: number;
    page: number;
    limit: number;
  };
  success: boolean;
  errorCode?: string;
  message?: string;
}

// ─── Create request types ─────────────────────────────────────────────────────

export interface IReturnProductLine {
  productId?: number;
  variantId?: number;
  qty: number;
  price: number;
  fee: number;
  discount?: number;
  discountUnit?: number;
  inventoryId?: number;
  note?: string;
}

export interface ICreateReturnRequest {
  invoice: {
    referId: number;
    customerId?: number;
    branchId?: number;
    amount: number;
    fee: number;
    paid: number;
    debt: number;
    discount: number;
    vatAmount: number;
    paymentType: number;
    reason: string;
    refundMethod: number;
    note?: string;
  };
  lstProduct: IReturnProductLine[];
  lstService?: any[];
  lstCardService?: any[];
}

export interface ICreateExchangeRequest extends ICreateReturnRequest {
  exchangeInvoice?: {
    customerId?: number;
    branchId?: number;
    amount: number;
    fee: number;
    paid: number;
    debt: number;
    discount: number;
    vatAmount: number;
    paymentType: number;
  };
  lstExchangeProduct?: IReturnProductLine[];
}

// ─── Helper: map API response → UI type ──────────────────────────────────────

const STATUS_MAP: Record<number, ReturnStatus> = {
  1: "done",
  2: "pending",
  3: "cancel",
};

const REFUND_METHOD_LABEL: Record<number, string> = {
  1: "Tiền mặt",
  2: "Chuyển khoản",
  3: "Hoàn vào ví",
  4: "Không hoàn tiền",
};

export function mapApiToUi(item: IReturnInvoiceResponse): ReturnProduct {
  const dateStr = item.receiptDate
    ? (() => {
        const d = new Date(item.receiptDate);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      })()
    : "";

  return {
    id: String(item.id),
    code: item.invoiceCode ?? `PTH-${item.id}`,
    time: dateStr,
    customerName: item.customerName ?? `KH #${item.customerId}`,
    originalOrderCode: item.referInvoiceCode ?? (item.referId ? `HD-${item.referId}` : "–"),
    type: item.invoiceType === "IV11" || item.returnType === 2 ? "exchange" : "return",
    productSummary: item.productSummary ?? "–",
    refundAmount: item.fee ?? 0,
    status: STATUS_MAP[item.status] ?? "pending",
    reason: item.reason ?? "",
    staffName: item.employeeName ?? `NV #${item.employeeId}`,
    paymentMethod: REFUND_METHOD_LABEL[item.refundMethod] ?? "–",
  };
}
