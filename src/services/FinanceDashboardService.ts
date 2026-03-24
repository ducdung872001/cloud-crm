import { urlsApi } from "configs/urls";
import { ICashBookResponse } from "model/cashbook/CashbookResponseModel";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IFinanceDashboardResponse {
  totalFundBalance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: ICashBookResponse[];
}

/** Một điểm dữ liệu trong biểu đồ theo ngày */
export interface IChartPoint {
  date: string; // "dd/MM" — từ TimeAmountLineChart.date của backend
  amount: number; // Long từ backend
  time?: number; // timestamp (không bắt buộc dùng)
}

export interface IFinanceChartResponse {
  incomeChart: IChartPoint[];
  expenseChart: IChartPoint[];
}

export interface IFinanceDashboardParams {
  branchId?: number;
  fromTime?: string; // "dd/MM/yyyy" — backend parse theo format này
  toTime?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [k, String(v)]);
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
}

/**
 * Parse response từ backend — xử lý cả code=0 lẫn code=200
 * (một số version backend dùng 0, số khác dùng 200 cho success)
 */
async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  // Chấp nhận code=0 hoặc code=200 là success
  if (json.code !== 0 && json.code !== 200) {
    throw new Error(json.message ?? "Lỗi API không xác định");
  }
  return json.data as T;
}

/** Format Date → "dd/MM/yyyy" */
export function formatDateParam(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

export function getTodayParam(): string {
  return formatDateParam(new Date());
}

export function getDaysAgoParam(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDateParam(d);
}

// ─── Service ──────────────────────────────────────────────────────────────────

const FinanceDashboardService = {
  /**
   * KPI cards + giao dịch gần nhất
   * GET /billing/finance/dashboard
   */
  full(params: IFinanceDashboardParams, signal?: AbortSignal): Promise<IFinanceDashboardResponse> {
    const query = buildQuery({
      branchId: params.branchId ?? 0,
      fromTime: params.fromTime,
      toTime: params.toTime,
    });
    return fetch(`${urlsApi.financeDashboard.full}${query}`, { method: "GET", signal }).then((res) => parseResponse<IFinanceDashboardResponse>(res));
  },

  /**
   * Biểu đồ thu/chi theo ngày — endpoint MỚI
   * GET /billing/finance/chart
   */
  chart(params: IFinanceDashboardParams, signal?: AbortSignal): Promise<IFinanceChartResponse> {
    const query = buildQuery({
      branchId: params.branchId ?? 0,
      fromTime: params.fromTime,
      toTime: params.toTime,
    });
    return fetch(`${urlsApi.financeDashboard.chart}${query}`, { method: "GET", signal }).then((res) => parseResponse<IFinanceChartResponse>(res));
  },
};

export default FinanceDashboardService;
