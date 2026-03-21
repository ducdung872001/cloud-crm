import { urlsApi } from "configs/urls";

// ─── Response types ───────────────────────────────────────────────────────────

export interface IFinanceDashboardSummary {
  totalFund: number;
  totalIncome: number;
  totalExpense: number;
  receivable: number;
  payable: number;
}

export interface IFinanceRecentTransaction {
  id: string;
  title: string;
  kind: "income" | "expense";
  amount: number;
  createdAt: string; // ISO hoặc "DD/MM/YYYY HH:mm"
}

export interface IFinanceDebtAlert {
  id: string;
  name: string;
  kind: "receivable" | "payable";
  amount: number;
  status: "overdue" | "upcoming";
}

export interface IFinanceDashboardFull {
  summary: IFinanceDashboardSummary;
  recentTransactions: IFinanceRecentTransaction[];
  debtAlerts: IFinanceDebtAlert[];
}

// Wrapper chuẩn backend
interface IApiWrapper<T> {
  code: number;
  message: string;
  result: T;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { method: "GET", signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: IApiWrapper<T> = await res.json();
  if (json.code !== 0) throw new Error(json.message ?? "Lỗi không xác định");
  return json.result;
}

function buildQuery(params: Record<string, string | number>) {
  return new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();
}

// ─── Service ──────────────────────────────────────────────────────────────────

const FinanceDashboardService = {
  /**
   * Full dashboard — 1 lần gọi, lấy tất cả (khuyến nghị dùng)
   * GET /billing/finance/dashboard?branchId=0&fromTime=&toTime=
   */
  full: (
    params: { fromTime: string; toTime: string; branchId?: number },
    signal?: AbortSignal
  ) => {
    const q = buildQuery({ branchId: params.branchId ?? 0, fromTime: params.fromTime, toTime: params.toTime });
    return apiFetch<IFinanceDashboardFull>(`${urlsApi.financeDashboard.full}?${q}`, signal);
  },

  /** Chỉ 4 KPI card — dùng khi chỉ cần refresh summary */
  summary: (
    params: { fromTime: string; toTime: string; branchId?: number },
    signal?: AbortSignal
  ) => {
    const q = buildQuery({ branchId: params.branchId ?? 0, fromTime: params.fromTime, toTime: params.toTime });
    return apiFetch<IFinanceDashboardSummary>(`${urlsApi.financeDashboard.summary}?${q}`, signal);
  },

  /** Giao dịch gần nhất */
  recentTransactions: (params: { branchId?: number; limit?: number }, signal?: AbortSignal) => {
    const q = buildQuery({ branchId: params.branchId ?? 0, limit: params.limit ?? 10 });
    return apiFetch<IFinanceRecentTransaction[]>(`${urlsApi.financeDashboard.recentTransactions}?${q}`, signal);
  },

  /** Cảnh báo công nợ */
  debtAlerts: (params: { branchId?: number; limit?: number }, signal?: AbortSignal) => {
    const q = buildQuery({ branchId: params.branchId ?? 0, limit: params.limit ?? 10 });
    return apiFetch<IFinanceDebtAlert[]>(`${urlsApi.financeDashboard.debtAlerts}?${q}`, signal);
  },
};

export default FinanceDashboardService;