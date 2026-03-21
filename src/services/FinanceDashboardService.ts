import { urlsApi } from "configs/urls";
import { ICashBookResponse } from "model/cashbook/CashbookResponseModel";

// ─── Response types — khớp với FinanceDashboardResponse.java ─────────────────

/**
 * Response từ GET /billing/finance/dashboard
 *
 * Mapping field:
 *   totalFundBalance   ← fund.balance tổng hợp (is_active=1)
 *   totalIncome        ← SUM cashbook.amount WHERE type=1 trong kỳ
 *   totalExpense       ← SUM cashbook.amount WHERE type=2 trong kỳ
 *   recentTransactions ← 10 cashbook gần nhất (ICashBookResponse có sẵn)
 */
export interface IFinanceDashboardResponse {
  totalFundBalance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: ICashBookResponse[];
}

/** Wrapper chuẩn backend DfResponse<T> */
interface IDfResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface IFinanceDashboardParams {
  branchId?: number;
  fromTime?: string; // "d/M/yyyy"
  toTime?: string;   // "d/M/yyyy"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>) {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [k, String(v)]);
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
}

/** Format Date → "dd/MM/yyyy" — pad tháng và ngày để backend parse đúng */
export function formatDateParam(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

/** Lấy ngày hôm nay */
export function getTodayParam(): string {
  return formatDateParam(new Date());
}

/** Lấy ngày X ngày trước hôm nay */
export function getDaysAgoParam(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDateParam(d);
}

// ─── Service ──────────────────────────────────────────────────────────────────

const FinanceDashboardService = {
  /**
   * Lấy toàn bộ dữ liệu dashboard tài chính.
   * GET /billing/finance/dashboard?branchId=0&fromTime=d/M/yyyy&toTime=d/M/yyyy
   *
   * Trả về: tổng quỹ, tổng thu/chi trong kỳ, 10 giao dịch gần nhất.
   *
   * Ghi chú: "Cảnh báo công nợ" không có trong billing service —
   * dữ liệu nằm ở cloud-sales. Giữ nguyên UI, truyền mảng rỗng cho đến
   * khi có API từ cloud-sales.
   */
  full: (params: IFinanceDashboardParams, signal?: AbortSignal) => {
    const query = buildQuery({
      branchId: params.branchId ?? 0,
      fromTime: params.fromTime,
      toTime: params.toTime,
    });
    return fetch(`${urlsApi.financeDashboard.full}${query}`, {
      method: "GET",
      signal,
    })
      .then((res) => res.json() as Promise<IDfResponse<IFinanceDashboardResponse>>)
      .then((json) => {
        if (json.code !== 0) throw new Error(json.message ?? "Lỗi không xác định");
        return json.data;
      });
  },
};

export default FinanceDashboardService;