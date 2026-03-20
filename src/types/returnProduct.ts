// ─── UI local types ───────────────────────────────────────────────────────────

export type ReturnType   = "return" | "exchange";
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

// ─── API list params / response ───────────────────────────────────────────────

export interface IReturnInvoiceListParams {
  returnType?: number;
  customerId?: number;
  invoiceCode?: string;
  status?: number;
  fromDate?: string;
  toDate?: string;
  branchId?: number;
  page?: number;
  size?: number;
}

export interface IReturnInvoiceResponse {
  id: number;
  invoiceCode: string;
  invoiceType: string;
  returnType: number;
  fee: number;
  paid: number;
  debt: number;
  amount: number;
  discount: number;
  status: number;
  reason: string;
  refundMethod: number;
  receiptDate: string;
  referId: number;
  customerId: number;
  customerName?: string;
  employeeName?: string;
  employeeId: number;
  branchId: number;
  bsnId: number;
  referInvoiceCode?: string;
  productSummary?: string;
}

// ─── Auto-fill: response from GET /invoice/get/return?id=X ───────────────────

/**
 * Sản phẩm có thể trả lại (BoughtProductResponse từ backend)
 * Chỉ lấy các field cần thiết cho auto-fill form.
 */
export interface IReturnableProduct {
  id: number;          // bought_product.id
  productId: number;
  variantId?: number;
  /** Tên sản phẩm (join từ product table) */
  name?: string;
  /** Số lượng còn được phép trả (đã trừ các lần trả trước) */
  qty: number;
  price: number;
  priceDiscount?: number;
  fee: number;
  discount?: number;
  discountUnit?: number;
  unitId?: number;
  unitName?: string;
  inventoryId?: number;
  invoiceId?: number;
  batchNo?: string;
}

/**
 * Dịch vụ có thể trả lại (BoughtServiceResponse)
 */
export interface IReturnableService {
  id: number;          // bought_service.id
  serviceId: number;
  /** Tên dịch vụ */
  name?: string;
  /** Số buổi còn được trả */
  serviceNumber?: number;
  price: number;
  fee: number;
  discount?: number;
  discountUnit?: number;
  invoiceId?: number;
}

/**
 * Response đầy đủ của GET /invoice/get/return?id=X
 * Ánh xạ từ InvoiceReturnItem Java
 */
export interface IInvoiceReturnItemResponse {
  invoice: {
    id: number;
    invoiceCode: string;
    customerId: number;
    /** Tên khách hàng (nếu backend join) */
    customerName?: string;
    /** SĐT khách hàng (nếu backend join) */
    customerPhone?: string;
    branchId: number;
    employeeId: number;
    amount: number;
    fee: number;
    paid: number;
    debt: number;
    discount: number;
    receiptDate: string;
    status: number;
  };
  lstBoughtProduct: IReturnableProduct[];
  lstBoughtService: IReturnableService[];
  lstBoughtCardService: any[];
}

/**
 * State auto-fill trong form — kết quả sau khi lookup thành công
 */
export interface IAutofillState {
  /** ID hóa đơn gốc (dùng để truyền vào createReturn/createExchange) */
  originalInvoiceId: number;
  /** Tên khách hàng hiển thị */
  customerName: string;
  customerId?: number;
  customerPhone?: string;
  /** Sản phẩm có thể trả */
  products: IReturnableProduct[];
  /** Dịch vụ có thể trả */
  services: IReturnableService[];
  /** Tổng tiền hóa đơn gốc */
  originalFee: number;
}

// ─── Create requests ──────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<number, ReturnStatus> = { 1: "done", 2: "pending", 3: "cancel" };
const REFUND_LABEL: Record<number, string> = {
  1: "Tiền mặt", 2: "Chuyển khoản", 3: "Hoàn vào ví", 4: "Không hoàn tiền",
};

export function mapApiToUi(item: IReturnInvoiceResponse): ReturnProduct {
  const dateStr = item.receiptDate
    ? (() => {
        const d = new Date(item.receiptDate);
        const p = (n: number) => String(n).padStart(2, "0");
        return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
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
    paymentMethod: REFUND_LABEL[item.refundMethod] ?? "–",
  };
}
