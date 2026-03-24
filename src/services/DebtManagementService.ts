import { urlsApi } from "configs/urls";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DebtKind   = "receivable" | "payable";
export type DebtStatus = "active" | "upcoming" | "overdue" | "paid";

export interface IDebtItem {
  id:            number;
  code:          string;
  name:          string;           // Tên KH / NCC
  kind:          DebtKind;         // receivable | payable
  amount:        number;           // Số tiền còn nợ
  dueDate:       string;           // "dd/MM/yyyy"
  daysRemaining: number;           // < 0 = quá hạn, >= 0 = còn hạn
  status:        DebtStatus;
  fundId?:       number;
  branchName?:   string;
  ownerName?:    string;           // Nhân viên phụ trách
  note?:         string;
  customerId?:   number;           // FK → KH (nếu là phải thu)
  supplierId?:   number;           // FK → NCC (nếu là phải trả)
  sourceType?:   string;           // "invoice" | "import" | "manual"
  sourceId?:     number;
}

export interface IDebtSummary {
  totalReceivable:   number;
  totalPayable:      number;
  totalCounterparty: number;
}

export interface IDebtListResponse {
  items:   IDebtItem[];
  total:   number;
  summary: IDebtSummary;
}

export interface IDebtListFilter {
  kind?:     "receivable" | "payable" | "overdue";
  keyword?:  string;
  fromDate?: string;
  toDate?:   string;
  page?:     number;
  size?:     number;
}

export interface IDebtSaveRequest {
  id?:          number;
  name:         string;
  kind:         DebtKind;
  amount:       number;
  dueDate:      string;            // "dd/MM/yyyy"
  fundId?:      number;
  note?:        string;
  customerId?:  number;
  supplierId?:  number;
}

export interface IDebtPayRequest {
  debtId:    number;
  amount:    number;
  fundId:    number;
  note?:     string;
  paidDate?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message ?? "Lỗi API không xác định");
  }
  return (json.result ?? json.data) as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [k, String(v)]);
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
}

// ─── Service ──────────────────────────────────────────────────────────────────

const DebtManagementService = {
  /**
   * GET /billing/debt/list
   * Danh sách công nợ + summary KPI
   */
  list(filter: IDebtListFilter = {}, signal?: AbortSignal): Promise<IDebtListResponse> {
    const query = buildQuery({
      kind:     filter.kind,
      keyword:  filter.keyword,
      fromDate: filter.fromDate,
      toDate:   filter.toDate,
      page:     filter.page ?? 0,
      size:     filter.size ?? 50,
    });
    return fetch(`${urlsApi.debt.list}${query}`, { method: "GET", signal })
      .then((res) => parseResponse<IDebtListResponse>(res));
  },

  /**
   * GET /billing/debt/detail?id=X
   */
  getDetail(id: number, signal?: AbortSignal): Promise<IDebtItem> {
    return fetch(`${urlsApi.debt.detail}?id=${id}`, { method: "GET", signal })
      .then((res) => parseResponse<IDebtItem>(res));
  },

  /**
   * POST /billing/debt/save
   * Tạo mới (id=undefined) hoặc chỉnh sửa công nợ thủ công
   */
  save(request: IDebtSaveRequest, signal?: AbortSignal): Promise<IDebtItem> {
    return fetch(urlsApi.debt.save, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    }).then((res) => parseResponse<IDebtItem>(res));
  },

  /**
   * POST /billing/debt/pay
   * Thanh toán (một phần hoặc toàn bộ) công nợ
   * → Backend tự tạo cashbook + cập nhật lại remaining_amount + status
   */
  pay(request: IDebtPayRequest, signal?: AbortSignal): Promise<unknown> {
    return fetch(urlsApi.debt.pay, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    }).then((res) => parseResponse(res));
  },

  /**
   * POST /billing/debt/mark-paid?id=X
   * Đánh dấu đã thanh toán toàn bộ (dùng cho mock QR confirm)
   */
  markPaid(id: number, signal?: AbortSignal): Promise<unknown> {
    return fetch(`${urlsApi.debt.markPaid}?id=${id}`, { method: "POST", signal })
      .then((res) => parseResponse(res));
  },

  /**
   * GET /billing/debt/qr?id=X
   * Lấy thông tin VietQR để render mã QR thu nợ
   */
  getQr(id: number, signal?: AbortSignal): Promise<{ qrDataUrl: string; amount: number }> {
    return fetch(`${urlsApi.debt.qr}?id=${id}`, { method: "GET", signal })
      .then((res) => parseResponse(res));
  },
};

export default DebtManagementService;
