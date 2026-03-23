import { ICashBookResponse } from "model/cashbook/CashbookResponseModel";

export type CashbookChartPoint = {
  label: string;
  income: number;
  expense: number;
};

export type ExpenseCategoryPoint = {
  label: string;
  amount: number;
  percent: number;
};

export type SalesChannelRow = {
  label: string;
  orders: number;
  revenue: number;
  avgOrder: number;
  share: number;
  trend: string;
};

export type PanelRefreshState = {
  cashFlow: number;
  expense: number;
  transactions: number;
  channels: number;
};

export type PanelRefreshingState = {
  cashFlow: boolean;
  expense: boolean;
  transactions: boolean;
  channels: boolean;
};

export type PanelKey = keyof PanelRefreshState;

export type TransactionStatus = {
  label: string;
  className: string;
};

export type RecentTransactionsCardProps = {
  insightTab: "transactions" | "channels";
  isLoading: boolean;
  isTabSwitching: boolean;
  tableMeta: string;
  displayTabType: number;
  panelRefresh: PanelRefreshState;
  panelRefreshing: PanelRefreshingState;
  recentTransactions: ICashBookResponse[];
  recentPage: number;
  recentTotalPages: number;
  salesChannelAnalysis: SalesChannelRow[];
  onChangeInsightTab: (tab: "transactions" | "channels") => void;
  onTriggerPanelRefresh: (panel: PanelKey) => void;
  onRecentPageChange: (updater: (prev: number) => number) => void;
  getTransactionStatus: (item: ICashBookResponse) => TransactionStatus;
};
