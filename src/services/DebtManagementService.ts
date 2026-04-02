import { urlsApi } from "configs/urls";

// ─── Types (giữ nguyên) ────────────────────────────────────────────────────────

export type DebtKind   = "receivable" | "payable";
export type DebtStatus = "active" | "upcoming" | "overdue" | "paid";

export interface IDebtItem {
  id:            number;
  code:          string;
  name:          string;
  kind:          DebtKind;
  amount:        number;        // remaining
  originalAmount?: number;
  paidAmount?:   number;
  dueDate:       string;        // "dd/MM/yyyy"
  daysRemaining: number;
  status:        DebtStatus;
  fundId?:       number;
  branchName?:   string;
  ownerName?:    string;
  note?:         string;
  customerId?:   number;
  supplierId?:   number;
  sourceType?:   string;
  sourceId?:     number;
  employeeId?:   number;
  notificationFirebaseId?: number;
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
  dueDate:      string;        // "dd/MM/yyyy"
  reminderDate?: string;
  fundId?:      number;
  note?:        string;
  customerId?:  number;
  supplierId?:  number;
  branchId?:    number;
}

export interface IDebtPayRequest {
  debtId?:    number;
  invoiceId?: number;
  amount:     number;
  fundId:     number;
  note?:      string;
}

export interface IFundListItem {
  id:      number;
  name:    string;
  balance: number;
}

// ─── Helper nội bộ ────────────────────────────────────────────────────────────

function parseResponse<T>(res: Response): Promise<T> {
  return res.json().then((json) => {
    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || `HTTP ${res.status}`);
    }
    return json.result as T;
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

const DebtManagementService = {
  list(filter: IDebtListFilter = {}, signal?: AbortSignal): Promise<IDebtListResponse> {
    const params = new URLSearchParams();
    if (filter.kind)     params.set("kind",    filter.kind);
    if (filter.keyword)  params.set("keyword", filter.keyword);
    if (filter.page  != null) params.set("page", String(filter.page));
    if (filter.size  != null) params.set("size", String(filter.size));
    const qs = params.toString() ? "?" + params.toString() : "";
    return fetch(`${urlsApi.debt.list}${qs}`, { method: "GET", signal })
      .then((r) => r.json())
      .then((json) => {
        if (json.code !== 0) throw new Error(json.message);
        return json.result as IDebtListResponse;
      });
  },

  save(request: IDebtSaveRequest, signal?: AbortSignal): Promise<number> {
    return fetch(urlsApi.debt.save, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(request),
      signal,
    }).then((res) => parseResponse<number>(res));
  },

  pay(request: IDebtPayRequest, signal?: AbortSignal): Promise<number> {
    return fetch(urlsApi.debt.pay, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(request),
      signal,
    }).then((res) => parseResponse<number>(res));
  },

  markPaid(id: number, signal?: AbortSignal): Promise<unknown> {
    return fetch(`${urlsApi.debt.markPaid}?id=${id}`, { method: "POST", signal })
      .then((res) => parseResponse(res));
  },

  getQr(id: number, signal?: AbortSignal): Promise<{ qrDataUrl: string; amount: number }> {
    return fetch(`${urlsApi.debt.qr}?id=${id}`, { method: "GET", signal })
      .then((res) => parseResponse(res));
  },

  getCustomerTotalDebt(customerId: number, signal?: AbortSignal): Promise<number> {
    return fetch(`${urlsApi.debt.customerTotal}?customerId=${customerId}`, {
      method: "GET",
      signal,
    })
      .then(async (res) => {
        const json = await res.json();
        if (json.code !== 0) return 0;
        return typeof json.result === "number" ? json.result : 0;
      })
      .catch(() => 0);
  },

  updateSchedule(
    request: { id: number; dueDate: string; reminderDate: string },
    signal?: AbortSignal
  ): Promise<number> {
    return fetch(urlsApi.debt.updateSchedule, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(request),
      signal,
    }).then((res) => parseResponse<number>(res));
  },

  /**
   * Xuất danh sách công nợ ra file Excel (.xlsx) — server-side.
   * Backend GET /billing/debt/export trả Base64 → decode → download.
   *
   * @param kind     "receivable" | "payable" | "overdue" | undefined (tất cả)
   * @param keyword  tìm theo tên đối tượng
   */
  async exportExcel(
    kind?: string,
    keyword?: string,
    signal?: AbortSignal
  ): Promise<void> {
    const params = new URLSearchParams();
    if (kind)    params.set("kind",    kind);
    if (keyword) params.set("keyword", keyword);
    const qs = params.toString() ? "?" + params.toString() : "";

    const res  = await fetch(`${urlsApi.debt.export}${qs}`, { method: "GET", signal });
    const json = await res.json();

    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || `Export thất bại (HTTP ${res.status})`);
    }

    const base64: string = json.result;
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    a.download = `BaoCaoCongNo_${dd}${mm}${yyyy}.xlsx`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export default DebtManagementService;