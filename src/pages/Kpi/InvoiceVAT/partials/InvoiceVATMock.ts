// ============================================================
//  Mock data & mock service for InvoiceVATList
//  Replace imports in InvoiceVATList.tsx with this file
// ============================================================

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export type InvoiceStatus = "issued" | "pending_sign" | "error";

export interface IInvoiceVATFilterRequest {
  name?: string;
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
}

export interface IInvoiceVATResponse {
  id: number;
  invoiceNo: string;      // Số HĐ
  invoiceDate: string;    // Ngày phát hành (dd/MM/yyyy)
  customerName: string;   // Khách hàng
  taxCode?: string;       // MST – undefined nếu là cá nhân
  totalAmount: number;    // Giá trị (VND)
  vatAmount: number;      // Tiền thuế VAT (VND)
  status: InvoiceStatus;
}

export interface IInvoiceVATStats {
  totalInvoices: number;
  totalVATFormatted: string;   // e.g. "128.4M"
  vatGTGTFormatted: string;    // e.g. "12.8M"
  pendingSign: number;
  issued: number;
  error: number;
  usedQuota: number;
  maxQuota: number;
  quotaExpiry: string;         // e.g. "31/03/2026"
  monthLabel: string;          // e.g. "Tháng 2/2026"
  deltaVsLastMonth: number;    // +14 so với tháng trước
}

// ----------------------------------------------------------------
// Raw invoice items (20 records – enough for 2 pages at limit=10)
// ----------------------------------------------------------------
const RAW_INVOICES: IInvoiceVATResponse[] = [
  { id: 1,  invoiceNo: "0000128", invoiceDate: "28/02/2026", customerName: "Cty TNHH ABC",            taxCode: "0311234567", totalAmount: 11_000_000, vatAmount: 1_000_000, status: "issued" },
  { id: 2,  invoiceNo: "0000127", invoiceDate: "27/02/2026", customerName: "Công ty CP XYZ",          taxCode: "0305678901", totalAmount:  5_500_000, vatAmount:   500_000, status: "pending_sign" },
  { id: 3,  invoiceNo: "0000126", invoiceDate: "26/02/2026", customerName: "Nguyễn Văn Thắng",        taxCode: undefined,    totalAmount:  2_200_000, vatAmount:   200_000, status: "issued" },
  { id: 4,  invoiceNo: "0000125", invoiceDate: "25/02/2026", customerName: "Cty TNHH DEF",            taxCode: "0312345678", totalAmount: 33_000_000, vatAmount: 3_000_000, status: "error" },
  { id: 5,  invoiceNo: "0000124", invoiceDate: "24/02/2026", customerName: "Tập đoàn GHI",            taxCode: "0398765432", totalAmount: 88_000_000, vatAmount: 8_000_000, status: "issued" },
  { id: 6,  invoiceNo: "0000123", invoiceDate: "23/02/2026", customerName: "Trần Thị Bình",           taxCode: undefined,    totalAmount:  1_100_000, vatAmount:   100_000, status: "issued" },
  { id: 7,  invoiceNo: "0000122", invoiceDate: "22/02/2026", customerName: "Công ty TNHH JKL",        taxCode: "0387654321", totalAmount: 15_400_000, vatAmount: 1_400_000, status: "pending_sign" },
  { id: 8,  invoiceNo: "0000121", invoiceDate: "21/02/2026", customerName: "Lê Văn Dũng",             taxCode: undefined,    totalAmount:  3_300_000, vatAmount:   300_000, status: "issued" },
  { id: 9,  invoiceNo: "0000120", invoiceDate: "20/02/2026", customerName: "Cty CP MNO",              taxCode: "0376543210", totalAmount: 22_000_000, vatAmount: 2_000_000, status: "issued" },
  { id: 10, invoiceNo: "0000119", invoiceDate: "19/02/2026", customerName: "Phạm Thị Lan",            taxCode: undefined,    totalAmount:    990_000, vatAmount:    90_000, status: "error" },
  { id: 11, invoiceNo: "0000118", invoiceDate: "18/02/2026", customerName: "Công ty TNHH PQR",        taxCode: "0365432109", totalAmount: 44_000_000, vatAmount: 4_000_000, status: "issued" },
  { id: 12, invoiceNo: "0000117", invoiceDate: "17/02/2026", customerName: "Nguyễn Minh Tuấn",        taxCode: undefined,    totalAmount:  6_600_000, vatAmount:   600_000, status: "issued" },
  { id: 13, invoiceNo: "0000116", invoiceDate: "16/02/2026", customerName: "Tổng Cty STU",            taxCode: "0354321098", totalAmount: 77_000_000, vatAmount: 7_000_000, status: "pending_sign" },
  { id: 14, invoiceNo: "0000115", invoiceDate: "15/02/2026", customerName: "Bùi Thị Hoa",             taxCode: undefined,    totalAmount:  2_750_000, vatAmount:   250_000, status: "issued" },
  { id: 15, invoiceNo: "0000114", invoiceDate: "14/02/2026", customerName: "Cty TNHH VWX",            taxCode: "0343210987", totalAmount: 19_800_000, vatAmount: 1_800_000, status: "issued" },
  { id: 16, invoiceNo: "0000113", invoiceDate: "13/02/2026", customerName: "Hoàng Văn Nam",            taxCode: undefined,    totalAmount:  4_400_000, vatAmount:   400_000, status: "issued" },
  { id: 17, invoiceNo: "0000112", invoiceDate: "12/02/2026", customerName: "Công ty Cổ phần YZA",     taxCode: "0332109876", totalAmount: 55_000_000, vatAmount: 5_000_000, status: "error" },
  { id: 18, invoiceNo: "0000111", invoiceDate: "11/02/2026", customerName: "Trương Thị Mai",           taxCode: undefined,    totalAmount:  1_650_000, vatAmount:   150_000, status: "issued" },
  { id: 19, invoiceNo: "0000110", invoiceDate: "10/02/2026", customerName: "Tập đoàn BCD",            taxCode: "0321098765", totalAmount: 66_000_000, vatAmount: 6_000_000, status: "issued" },
  { id: 20, invoiceNo: "0000109", invoiceDate: "09/02/2026", customerName: "Đinh Văn Khoa",            taxCode: undefined,    totalAmount:  3_850_000, vatAmount:   350_000, status: "issued" },
];

// ----------------------------------------------------------------
// Stats mock
// ----------------------------------------------------------------
export const MOCK_INVOICE_STATS: IInvoiceVATStats = {
  totalInvoices: 128,
  totalVATFormatted: "128.4M",
  vatGTGTFormatted: "12.8M",
  pendingSign: 3,
  issued: 124,
  error: 1,
  usedQuota: 128,
  maxQuota: 500,
  quotaExpiry: "31/03/2026",
  monthLabel: "Tháng 2/2026",
  deltaVsLastMonth: 14,
};

// ----------------------------------------------------------------
// Helper: simulate network delay
// ----------------------------------------------------------------
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ----------------------------------------------------------------
// Mock InvoiceVATService
// ----------------------------------------------------------------
const InvoiceVATMockService = {
  /**
   * Danh sách hóa đơn – hỗ trợ filter theo name, status, phân trang
   */
  list: async (
    params: IInvoiceVATFilterRequest,
    _signal?: AbortSignal
  ): Promise<{ code: number; message?: string; result?: { items: IInvoiceVATResponse[]; page: number; total: number } }> => {
    await delay();

    let filtered = [...RAW_INVOICES];

    // Filter by name / invoiceNo
    if (params.name && params.name.trim() !== "") {
      const keyword = params.name.trim().toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.customerName.toLowerCase().includes(keyword) ||
          inv.invoiceNo.toLowerCase().includes(keyword)
      );
    }

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((inv) => inv.status === params.status);
    }

    const total = filtered.length;
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      code: 0,
      result: { items, page, total },
    };
  },

  /**
   * Xóa hóa đơn theo id
   */
  delete: async (id: number): Promise<{ code: number; message?: string }> => {
    await delay(200);
    const idx = RAW_INVOICES.findIndex((inv) => inv.id === id);
    if (idx === -1) return { code: 404, message: "Không tìm thấy hóa đơn" };
    RAW_INVOICES.splice(idx, 1);
    return { code: 0, message: "Xóa thành công" };
  },

  /**
   * Lấy thống kê tổng quan
   */
  stats: async (): Promise<{ code: number; result?: IInvoiceVATStats }> => {
    await delay(150);
    return { code: 0, result: { ...MOCK_INVOICE_STATS } };
  },
};

export default InvoiceVATMockService;