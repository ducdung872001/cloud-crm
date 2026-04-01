import { urlsApi } from "configs/urls";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IDebtStatusSlice {
  key: "ontime" | "upcoming" | "overdue";
  label: string;
  pct: number;
}

export interface IDebtSummaryKpi {
  totalReceivable: number;
  overdueAmount: number;
  collectionRate: number;
  activeCount: number;
  overdueCount: number;
  statusBreakdown: IDebtStatusSlice[];
}

export interface IAgingBucket {
  key: string;
  label: string;
  amount: number;
  count: number;
  pct: number;
}

export interface IMonthlyPoint {
  key: string;    // "2025-11"
  label: string;  // "11/2025"
  debt: number;
  paid: number;
}

export interface ITopDebtor {
  customerId: number;
  customerName: string;
  totalDebt: number;
  invoiceCount: number;
  latestDate: string;
}

export interface IDebtReportResponse {
  summary: IDebtSummaryKpi;
  aging: IAgingBucket[];
  monthlyTrend: IMonthlyPoint[];
  topDebtors: ITopDebtor[];
}

export interface IDebtReportParams {
  fromTime?: string;  // "dd/MM/yyyy"
  toTime?: string;    // "dd/MM/yyyy"
  branchId?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const DebtReportService = {
  /**
   * GET /sales/report/debt-summary
   * Toàn bộ dữ liệu báo cáo công nợ trong 1 call.
   */
  getDebtReport(
    params: IDebtReportParams = {},
    signal?: AbortSignal
  ): Promise<IDebtReportResponse> {
    const qp = new URLSearchParams();
    if (params.fromTime) qp.set("fromTime", params.fromTime);
    if (params.toTime)   qp.set("toTime",   params.toTime);
    if (params.branchId) qp.set("branchId", String(params.branchId));

    const qs = qp.toString() ? `?${qp.toString()}` : "";
    return fetch(`${urlsApi.report.debtSummary}${qs}`, { method: "GET", signal })
      .then((res) => res.json())
      .then((json) => {
        if (json.code !== 0 && json.code !== 200) {
          throw new Error(json.message ?? "Lỗi tải báo cáo công nợ");
        }
        return json.result as IDebtReportResponse;
      });
  },
};

export default DebtReportService;
