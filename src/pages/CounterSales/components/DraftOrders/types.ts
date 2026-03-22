// ─── Kiểu gốc (dùng trong UI) ─────────────────────────────────────────────

export type DraftProduct = {
  ten: string;
  maSP: string;
  sl: number;
  donGia: number;
};

export type DraftOrder = {
  id: string;           // invoiceId dạng string (VD: "1042")
  invoiceId: number;    // invoiceId số nguyên gốc từ backend
  tenDon: string;       // "Đơn tạm {invoiceCode}"
  thoiGian: string;     // "HH:mm"
  ngay: string;         // "dd/MM/yyyy"
  nhanVien: string;
  khachHang: string;
  customerId: number;
  sanPhams: DraftProduct[];
  // CartItem shape để preload lại vào giỏ hàng khi "Tiếp tục xử lý"
  cartItems?: CartItemForDraft[];
};

/** Subset CartItem cần để nạp lại giỏ hàng */
export type CartItemForDraft = {
  id: string;
  variantId: string;
  name: string;
  icon: string;
  avatar: string;
  price: number;
  qty: number;
  unit: string;
  unitName: string;
};

export type DraftOrdersStats = {
  totalDrafts: number;
};

// ─── Kiểu raw từ API /invoice/draft/list-with-products ────────────────────
// Mỗi phần tử là InvoiceDetailPOM từ backend

export interface RawInvoiceDetail {
  invoiceId: number;
  invoice: {
    id: number;
    invoiceCode: string;
    status: number;
    statusTemp: number;
    customerName: string | null;
    customerPhone: string | null;
    employeeName: string | null;
    customerId: number;
    receiptDate: string | null;
    createdTime: string | null;
    fee: number;
  };
  products: Array<{
    productId: number;
    variantId: number;
    productName: string;
    name: string;
    productAvatar: string | null;
    unitName: string;
    unitId: number;
    qty: number;
    price: number;
    fee: number;
    batchNo: string | null;
  }>;
  services: Array<any>;
}

/**
 * Chuyển đổi InvoiceDetailPOM từ API → DraftOrder dùng trong UI.
 */
export function mapRawToDraftOrder(raw: RawInvoiceDetail): DraftOrder {
  const inv = raw.invoice;

  // Parse thời gian
  let thoiGian = "—";
  let ngay = "—";
  const dateStr = inv.receiptDate || inv.createdTime;
  if (dateStr) {
    // BE trả ISO "2026-03-17T09:15:00" hoặc "2026-03-17 09:15:00"
    const d = new Date(dateStr.replace(" ", "T"));
    if (!isNaN(d.getTime())) {
      thoiGian = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      ngay = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    }
  }

  const sanPhams: DraftProduct[] = (raw.products ?? []).map((p) => ({
    ten:    p.productName || p.name || "Sản phẩm",
    maSP:   p.batchNo || `#${p.productId}`,
    sl:     p.qty ?? 1,
    donGia: p.price ?? 0,
  }));

  const cartItems: CartItemForDraft[] = (raw.products ?? []).map((p) => ({
    id:       String(p.productId),
    variantId: String(p.variantId ?? p.productId),
    name:     p.productName || p.name || "Sản phẩm",
    icon:     "📦",
    avatar:   p.productAvatar ?? "",
    price:    p.price ?? 0,
    qty:      p.qty ?? 1,
    unit:     p.unitName ?? "Cái",
    unitName: p.unitName ?? "Cái",
  }));

  return {
    id:         String(raw.invoiceId),
    invoiceId:  raw.invoiceId,
    tenDon:     `Đơn tạm ${inv.invoiceCode ?? raw.invoiceId}`,
    thoiGian,
    ngay,
    nhanVien:   inv.employeeName ?? "—",
    khachHang:  inv.customerName ?? "Khách lẻ",
    customerId: inv.customerId ?? -1,
    sanPhams,
    cartItems,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function fmtVnd(n: number) {
  return `${(n ?? 0).toLocaleString("vi-VN")} đ`;
}

export function sumTotal(sp: DraftProduct[]) {
  return (sp ?? []).reduce((a, b) => a + b.sl * b.donGia, 0);
}

export function sumQty(sp: DraftProduct[]) {
  return (sp ?? []).reduce((a, b) => a + b.sl, 0);
}