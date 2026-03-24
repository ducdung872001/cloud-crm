import { urlsApi } from "configs/urls";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IFundListItem {
  id: number;
  name: string;
  balance: number;
  updatedTime: string; // "1/3/2026 08:15"
  type: "bank" | "cash" | "shift_cash";
  typeLabel: string;
  isActive: number;
}

export interface IFundOverviewResponse {
  totalBalance: number;
  activeFundCount: number;
  funds: IFundListItem[];
}

export interface IFundDetailResponse {
  id: number;
  name: string;
  balance: number;
  updatedTime: string;
  type: string;
  typeLabel: string;
  description?: string;
  isActive: number;
  transactionCount: number;
  lastTransactionNote?: string;
  lastTransactionAmount?: number;
  lastTransactionType?: number;
  allowReceipt: number;
  allowDebtLink: number;
  supportShift: number;
  shiftId?: number;
  shiftCode?: string;
}

export interface IFundSaveRequest {
  id?: number;
  name: string;
  type: string;
  description?: string;
  initialBalance?: number;
  allowReceipt?: number;
  allowDebtLink?: number;
  supportShift?: number;
}

export interface IFundHistoryItem {
  id: number;
  code?: string;
  note?: string;
  amount: number;
  type: number; // 1=thu, 2=chi
  transDate: string;
  categoryName?: string;
  empName?: string;
  approvalStatus?: string;
}

export interface IFundHistoryResponse {
  items: IFundHistoryItem[];
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message ?? "Lỗi API không xác định");
  }
  // Backend Reborn trả "result", không phải "data"
  return (json.result ?? json.data) as T;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const FundManagementService = {
  /**
   * GET /billing/fund/overview
   * Tổng quan + danh sách quỹ
   */
  getOverview(branchId = 0, signal?: AbortSignal): Promise<IFundOverviewResponse> {
    return fetch(`${urlsApi.fund.overview}?branchId=${branchId}`, {
      method: "GET",
      signal,
    }).then((res) => parseResponse<IFundOverviewResponse>(res));
  },

  /**
   * GET /billing/fund/detail?id=X
   * Chi tiết 1 quỹ
   */
  getDetail(id: number, signal?: AbortSignal): Promise<IFundDetailResponse> {
    return fetch(`${urlsApi.fund.detail}?id=${id}`, {
      method: "GET",
      signal,
    }).then((res) => parseResponse<IFundDetailResponse>(res));
  },

  /**
   * POST /billing/fund/save
   * Tạo mới (id=null) hoặc chỉnh sửa (id>0)
   */
  save(request: IFundSaveRequest, signal?: AbortSignal): Promise<unknown> {
    return fetch(urlsApi.fund.save, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    }).then((res) => parseResponse(res));
  },

  /**
   * POST /billing/fund/close?id=X
   * Đóng quỹ (soft delete)
   */
  close(id: number, signal?: AbortSignal): Promise<number> {
    return fetch(`${urlsApi.fund.close}?id=${id}`, {
      method: "POST",
      signal,
    }).then((res) => parseResponse<number>(res));
  },

  /**
   * GET /billing/fund/history?id=X&page=0&size=20
   * Lịch sử giao dịch của quỹ
   */
  getHistory(
    id: number,
    page = 0,
    size = 20,
    signal?: AbortSignal
  ): Promise<IFundHistoryResponse> {
    return fetch(`${urlsApi.fund.history}?id=${id}&page=${page}&size=${size}`, {
      method: "GET",
      signal,
    }).then((res) => parseResponse<IFundHistoryResponse>(res));
  },
};

export default FundManagementService;