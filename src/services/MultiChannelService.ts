import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IOverviewParams {
  fromTime?: string; // dd/MM/yyyy
  toTime?:   string; // dd/MM/yyyy
  branchId?: number;
}

/** 4 KPI card + delta — từ /report/pos-summary → statCards */
export interface IStatCards {
  revenue:          number;
  orderCount:       number;
  doneCount:        number;
  cancelCount:      number;
  avgOrderValue:    number;
  revenueDeltaPct:  number; // % tăng/giảm doanh thu so với kỳ trước
  orderDeltaCount:  number; // chênh lệch số đơn so với kỳ trước
}

/** 1 kênh bán hàng — từ /report/channel-breakdown */
export interface IChannelRow {
  saleflowId:    number;
  channelName:   string;
  channelDesc:   string;
  orderCount:    number;
  revenue:       number;
  avgOrderValue: number;
  ratio:         number;  // 0.0 – 1.0
  trend:         string;  // "UP" | "DOWN" | "STABLE"
  trendPct:      number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const MultiChannelService = {
  /**
   * Lấy KPI cards (doanh thu, đơn hàng, delta so kỳ trước).
   * Dùng endpoint pos-summary vì nó trả về statCards đầy đủ nhất.
   * GET /bizapi/sales/report/pos-summary
   */
  getStatCards: (params?: IOverviewParams, signal?: AbortSignal) => {
    return fetch(
      `${urlsApi.invoice.salesReport.posSummary}${convertParamsToString(params)}`,
      { method: "GET", signal }
    ).then((r) => r.json());
  },

  /**
   * Lấy danh sách kênh bán hàng + doanh thu từng kênh.
   * GET /bizapi/sales/report/channel-breakdown
   */
  getChannelBreakdown: (params?: IOverviewParams, signal?: AbortSignal) => {
    return fetch(
      `${urlsApi.salesReport.channelBreakdown}${convertParamsToString(params)}`,
      { method: "GET", signal }
    ).then((r) => r.json());
  },
};

export default MultiChannelService;
