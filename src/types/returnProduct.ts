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
  /** Tên sản phẩm tóm tắt — được enrich từ Inventory microservice */
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
  createdTime?: string;
  updatedTime?: string;
  referId: number;
  customerId: number;
  customerName?: string;
  employeeName?: string;
  employeeId: number;
  branchId: number;
  bsnId: number;
  referInvoiceCode?: string;
  productSummary?: string;
  /** Danh sách sản phẩm trong phiếu — dùng để enrich tên */
  products?: Array<{
    productId: number;
    variantId?: number;
    name?: string;
    qty?: number;
  }>;
}

// ─── Inventory enrich types ───────────────────────────────────────────────────

/** Response từ GET /inventory/productVariant/list-detail?lstId=1,2,3 */
export interface IVariantDetail {
  id: number;          // variantId
  productId: number;
  /** Tên biến thể: "Đen / 16GB / 512GB" */
  name?: string;
  variantName?: string;
  /** Tên sản phẩm gốc */
  productName?: string;
}

/** Map variantId → IVariantDetail, dùng để enrich nhanh */
export type VariantMap = Record<number, IVariantDetail>;

// ─── Auto-fill types ──────────────────────────────────────────────────────────

export interface IReturnableProduct {
  id: number;
  productId: number;
  variantId?: number;
  name?: string;
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

export interface IReturnableService {
  id: number;
  serviceId: number;
  name?: string;
  serviceNumber?: number;
  price: number;
  fee: number;
  discount?: number;
  discountUnit?: number;
  invoiceId?: number;
}

export interface IInvoiceReturnItemResponse {
  invoice: {
    id: number;
    invoiceCode: string;
    customerId: number;
    customerName?: string;
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

export interface IAutofillState {
  originalInvoiceId: number;
  customerName: string;
  customerId?: number;
  customerPhone?: string;
  products: IReturnableProduct[];
  services: IReturnableService[];
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
  lstBoughtProduct: IReturnProductLine[];
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

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function mapApiToUi(item: IReturnInvoiceResponse): ReturnProduct {
  // Fix: fallback receiptDate → createdTime → updatedTime nếu null
  const time = formatDate(item.receiptDate)
    || formatDate(item.createdTime)
    || formatDate(item.updatedTime)
    || "";

  return {
    id: String(item.id),
    code: item.invoiceCode ?? `PTH-${item.id}`,
    time,
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

/**
 * Enrich productSummary từ VariantMap đã fetch từ Inventory.
 * Gọi SAU mapApiToUi khi đã có variantMap.
 *
 * Format: "Tên SP / Biến thể (xN)" hoặc "Tên SP (xN)" nếu không có biến thể
 */
export function enrichProductSummary(
  item: ReturnProduct,
  apiItem: IReturnInvoiceResponse,
  variantMap: VariantMap
): ReturnProduct {
  if (!apiItem.products || apiItem.products.length === 0) return item;

  const parts = apiItem.products.map((p) => {
    let label = "";
    if (p.variantId && variantMap[p.variantId]) {
      const v = variantMap[p.variantId];
      const productName = v.productName ?? p.name ?? `SP #${p.productId}`;
      const variantName = v.variantName ?? v.name;
      label = variantName ? `${productName} / ${variantName}` : productName;
    } else {
      label = p.name ?? `SP #${p.productId}`;
    }
    return p.qty && p.qty > 1 ? `${label} (x${p.qty})` : label;
  });

  return { ...item, productSummary: parts.join(", ") };
}