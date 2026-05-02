export type CommissionStatus = "PENDING" | "APPROVED" | "PAID" | "REVERSED" | "CALCULATED";

export interface ICommission {
  id: number;
  bsnId: number;
  orderId: number;
  employeeId: number;
  orderType: string;
  workflowCode: string | null;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  status: CommissionStatus;
  calculatedAt: string | null;
  paidAt: string | null;
  payoutId: number | null;
  externalEventId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface IRevenueSeriesPoint {
  time: string;
  revenue: number;
}

export interface IRevenueByCourse {
  courseId: string | number;
  objectType: string;
  revenue: number;
  orderCount: number;
}

export type RevenueGroupBy = "day" | "month" | "course";

export interface IRevenueSummary {
  totalRevenue: number;
  previousRevenue: number;
  trend: number;
  groupBy: RevenueGroupBy;
  from: string;
  to: string;
  series: IRevenueSeriesPoint[];
  byCourse: IRevenueByCourse[];
}
