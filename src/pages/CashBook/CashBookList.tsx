/* eslint-disable prefer-const */
import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { Options } from "highcharts";
import TitleAction from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IFilterItem } from "model/OtherModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ICashbookFilterRequest } from "model/cashbook/CashbookRequestModel";
import { ICashBookResponse } from "model/cashbook/CashbookResponseModel";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import CashbookService from "services/CashbookService";
import "./CashBookList.scss";
import { ContextType, UserContext } from "contexts/userContext";
import Filters from "./partials/FinanceReport/Filters";
import Kpis from "./partials/FinanceReport/Kpis";
import CashFlowCard from "./partials/FinanceReport/CashFlowCard";
import ExpenseCard from "./partials/FinanceReport/ExpenseCard";
import InsightCard from "./partials/FinanceReport/InsightCard";
import { CashbookChartPoint, ExpenseCategoryPoint, PanelKey, PanelRefreshState, PanelRefreshingState, SalesChannelRow } from "./partials/FinanceReport/types";

type CashbookTabCache = {
  type: 1 | 2;
  listCashBook?: ICustomerResponse[];
  listCashBookTotal?: any;
  listReportCashBook?: ICustomerResponse[];
  prevBalance?: number;
  posBalance?: number;
  prevTotalByPage?: number;
  pagination?: Partial<PaginationProps>;
  isNoItem?: boolean;
};

const MOCK_CASHFLOW_SERIES: CashbookChartPoint[] = [
  { label: "10/03", income: 28000000, expense: 12000000 },
  { label: "11/03", income: 32000000, expense: 14500000 },
  { label: "12/03", income: 26500000, expense: 9800000 },
  { label: "13/03", income: 34800000, expense: 16700000 },
  { label: "14/03", income: 30100000, expense: 13200000 },
  { label: "15/03", income: 38600000, expense: 18800000 },
  { label: "16/03", income: 41200000, expense: 17400000 },
];

const MOCK_EXPENSE_SERIES: ExpenseCategoryPoint[] = [
  { label: "Nhập hàng", amount: 52000000, percent: 52 },
  { label: "Vận hành", amount: 18000000, percent: 18 },
  { label: "Nhân sự", amount: 15000000, percent: 15 },
  { label: "Marketing", amount: 10000000, percent: 10 },
  { label: "Khác", amount: 5000000, percent: 5 },
];

const MOCK_RECENT_TRANSACTIONS: ICashBookResponse[] = [
  { id: 9001, note: "Thu tiền bán hàng tại quầy", amount: 12400000, employeeId: 1, branchId: 23, empName: "Nguyễn Minh", transDate: "2026-03-16T10:15:00", categoryName: "Thu bán hàng", type: 1 },
  { id: 9002, note: "Nhập hàng NCC Minh Phát", amount: 8200000, employeeId: 2, branchId: 23, empName: "Trần Hương", transDate: "2026-03-16T09:40:00", categoryName: "Chi nhập hàng", type: 2 },
  { id: 9003, note: "Chi phí vận hành cửa hàng", amount: 2100000, employeeId: 3, branchId: 23, empName: "Lê Nam", transDate: "2026-03-15T18:20:00", categoryName: "Chi vận hành", type: 2 },
  { id: 9004, note: "Thu tiền chuyển khoản online", amount: 9800000, employeeId: 1, branchId: 23, empName: "Nguyễn Minh", transDate: "2026-03-15T14:10:00", categoryName: "Thu bán hàng", type: 1 },
  { id: 9005, note: "Chi phí marketing chiến dịch", amount: 3400000, employeeId: 4, branchId: 23, empName: "Phạm Lan", transDate: "2026-03-15T11:25:00", categoryName: "Chi marketing", type: 2 },
  { id: 9006, note: "Thu công nợ khách hàng", amount: 6300000, employeeId: 2, branchId: 23, empName: "Trần Hương", transDate: "2026-03-14T16:45:00", categoryName: "Thu công nợ", type: 1 },
  { id: 9007, note: "Thanh toán nhà cung cấp", amount: 5600000, employeeId: 3, branchId: 23, empName: "Lê Nam", transDate: "2026-03-14T09:15:00", categoryName: "Chi nhà cung cấp", type: 2 },
  { id: 9008, note: "Thu tiền đơn website", amount: 7400000, employeeId: 1, branchId: 23, empName: "Nguyễn Minh", transDate: "2026-03-13T15:32:00", categoryName: "Thu online", type: 1 },
  { id: 9009, note: "Chi thưởng nhân viên", amount: 2800000, employeeId: 4, branchId: 23, empName: "Phạm Lan", transDate: "2026-03-13T10:05:00", categoryName: "Chi nhân sự", type: 2 },
  { id: 9010, note: "Thu tiền trả trước khách VIP", amount: 11200000, employeeId: 2, branchId: 23, empName: "Trần Hương", transDate: "2026-03-12T17:18:00", categoryName: "Thu khách VIP", type: 1 },
  { id: 9011, note: "Chi sửa chữa thiết bị", amount: 1900000, employeeId: 3, branchId: 23, empName: "Lê Nam", transDate: "2026-03-12T13:12:00", categoryName: "Chi bảo trì", type: 2 },
  { id: 9012, note: "Thu tiền đơn sàn TMĐT", amount: 5400000, employeeId: 1, branchId: 23, empName: "Nguyễn Minh", transDate: "2026-03-11T11:40:00", categoryName: "Thu sàn TMĐT", type: 1 },
];

const MOCK_CHANNEL_ANALYSIS: SalesChannelRow[] = [
  { label: "Tại quầy (POS)", orders: 612, revenue: 168000000, avgOrder: 274000, share: 49.1, trend: "Tăng mạnh" },
  { label: "Website bán hàng", orders: 318, revenue: 92400000, avgOrder: 291000, share: 27, trend: "Ổn định" },
  { label: "Sàn TMĐT", orders: 214, revenue: 48100000, avgOrder: 225000, share: 14.1, trend: "Tăng nhẹ" },
  { label: "Fanpage / Zalo OA", orders: 140, revenue: 33500000, avgOrder: 239000, share: 9.8, trend: "Theo dõi" },
];

const EXPENSE_CHART_COLORS = ["#b45309", "#f59e0b", "#fcd34d", "#fde68a", "#d1d5db"];

const getContrastTextColor = (hexColor: string) => {
  const hex = hexColor.replace("#", "");
  const normalized = hex.length === 3 ? hex.split("").map((char) => `${char}${char}`).join("") : hex;
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.72 ? "#5a5852" : "#ffffff";
};

const buildCashFlowSeries = (items: ICashBookResponse[]): CashbookChartPoint[] => {
  const grouped = new Map<string, CashbookChartPoint>();

  (items || [])
    .slice()
    .sort((a, b) => moment(a.transDate).valueOf() - moment(b.transDate).valueOf())
    .forEach((item) => {
      const key = moment(item.transDate).format("DD/MM");
      const current = grouped.get(key) || { label: key, income: 0, expense: 0 };

      if (+item.type === 1) {
        current.income += +item.amount || 0;
      } else {
        current.expense += +item.amount || 0;
      }

      grouped.set(key, current);
    });

  return Array.from(grouped.values()).slice(-7);
};

const buildExpenseSeries = (items: ICashBookResponse[]): ExpenseCategoryPoint[] => {
  const expenseMap = new Map<string, number>();

  (items || []).forEach((item) => {
    if (+item.type !== 2 && +item.type !== -1) {
      return;
    }

    const key = item.categoryName || "Chi phí khác";
    expenseMap.set(key, (expenseMap.get(key) || 0) + (+item.amount || 0));
  });

  const sorted = Array.from(expenseMap.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const total = sorted.reduce((sum, item) => sum + item.amount, 0);

  return sorted.map((item) => ({
    ...item,
    percent: total > 0 ? Math.round((item.amount / total) * 100) : 0,
  }));
};

const buildSalesChannelAnalysis = (items: ICashBookResponse[]): SalesChannelRow[] => {
  const channelMap = new Map<string, { orders: number; revenue: number }>();

  (items || []).forEach((item) => {
    if (+item.type !== 1) {
      return;
    }

    const text = `${item.note || ""} ${item.categoryName || ""}`.toLowerCase();
    let channel = "Khác";

    if (text.includes("quầy") || text.includes("cửa hàng")) {
      channel = "Tại quầy (POS)";
    } else if (text.includes("website") || text.includes("online") || text.includes("web")) {
      channel = "Website bán hàng";
    } else if (text.includes("sàn")) {
      channel = "Sàn TMĐT";
    } else if (text.includes("zalo") || text.includes("fanpage")) {
      channel = "Fanpage / Zalo OA";
    }

    const current = channelMap.get(channel) || { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += +item.amount || 0;
    channelMap.set(channel, current);
  });

  const rows = Array.from(channelMap.entries())
    .map(([label, value]) => ({
      label,
      orders: value.orders,
      revenue: value.revenue,
      avgOrder: value.orders > 0 ? Math.round(value.revenue / value.orders) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = rows.reduce((sum, item) => sum + item.revenue, 0);

  return rows.map((item, index) => ({
    ...item,
    share: totalRevenue > 0 ? Number(((item.revenue / totalRevenue) * 100).toFixed(1)) : 0,
    trend: index === 0 ? "Tăng mạnh" : index === rows.length - 1 ? "Theo dõi" : "Ổn định",
  }));
};

const getTransactionStatus = (item: ICashBookResponse) => {
  if (+item.type === 1) {
    return { label: "Phiếu thu", className: "badge-green" };
  }

  if (+item.type === 2) {
    return { label: "Phiếu chi", className: "badge-amber" };
  }

  return { label: "Điều chỉnh", className: "badge-blue" };
};

const buildParamsSignature = (type: 1 | 2, params: ICashbookFilterRequest) => {
  const cleaned = _.cloneDeep(params || {});
  delete cleaned.type;

  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === "" || cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    }
  });

  return JSON.stringify({ type, ...cleaned });
};

export default function CashBookList() {
  document.title = "Báo cáo Tài chính";

  const isMounted = useRef(false);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshSpinTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const requestSeqRef = useRef(0);
  const cacheRef = useRef<Record<string, CashbookTabCache>>({});
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTabSwitching, setIsTabSwitching] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listCashBook, setListCashBook] = useState<ICustomerResponse[]>([]);
  const [listCashBookTotal, setListCashBookTotal] = useState<any>({});
  const [listReportCashBook, setListReportCashBook] = useState<ICustomerResponse[]>([]);
  const [prevBalance, setPrevBalance] = useState<number>(0);
  const [posBalance, setPosBalance] = useState<number>(0);
  const [prevTotalByPage, setPrevTotalByPage] = useState<number>(0);
  const [recentPage, setRecentPage] = useState<number>(1);
  const [insightTab, setInsightTab] = useState<"transactions" | "channels">("transactions");
  const [displayTabType, setDisplayTabType] = useState<number>(1);
  const [tab, setTab] = useState({ name: "tab_one", type: 1 });
  const [params, setParams] = useState<ICashbookFilterRequest>({ keyword: "", fromTime: "" });
  const [panelRefresh, setPanelRefresh] = useState<PanelRefreshState>({
    cashFlow: 0,
    expense: 0,
    transactions: 0,
    channels: 0,
  });
  const [panelRefreshing, setPanelRefreshing] = useState<PanelRefreshingState>({
    cashFlow: false,
    expense: false,
    transactions: false,
    channels: false,
  });

  const listTabs = [
    { title: "Lịch sử thu chi", is_active: "tab_one", type: 1 },
    { title: "Thu chi tồn", is_active: "tab_two", type: 2 },
  ];

  const handleChangeTab = (nextTab: { name: string; type: number }) => {
    if (nextTab.type === tab.type) {
      return;
    }

    setIsTabSwitching(true);
    setTab(nextTab);
  };

  const triggerPanelRefresh = (panel: PanelKey) => {
    if (refreshSpinTimersRef.current[panel]) {
      clearTimeout(refreshSpinTimersRef.current[panel] as ReturnType<typeof setTimeout>);
    }

    setPanelRefreshing((prev) => ({
      ...prev,
      [panel]: true,
    }));
    setPanelRefresh((prev) => ({
      ...prev,
      [panel]: prev[panel] + 1,
    }));

    refreshSpinTimersRef.current[panel] = setTimeout(() => {
      setPanelRefreshing((prev) => ({
        ...prev,
        [panel]: false,
      }));
    }, 800);
  };

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lịch sử thu chi",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prevParams) => ({ ...prevParams, page: page })),
    chooseSizeLimit: (limit) => setParams((prevParams) => ({ ...prevParams, limit: limit })),
  });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, name: `${displayTabType == 1 ? "Lịch sử thu chi" : "Báo cáo thu chi"}` }));
  }, [displayTabType]);

  const filterList = useMemo(
    () =>
      [
        {
          key: "time_cashbook",
          name: "Thời gian",
          type: "date-two",
          param_name: ["fromTime", "toTime"],
          is_featured: true,
          value: searchParams.get("fromTime") ?? "",
          value_extra: searchParams.get("toTime") ?? "",
          is_fmt_text: true,
        },
        {
          key: "categoryId",
          name: "Trạng thái",
          type: "select",
          is_featured: true,
          value: searchParams.get("categoryId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const getListCashBook = async (paramsSearch: ICashbookFilterRequest) => {
    const requestId = ++requestSeqRef.current;
    setIsLoading(true);
    const response = await CashbookService.list({ ...paramsSearch, type: 1 });

    if (requestId !== requestSeqRef.current) {
      return;
    }

    if (response.code === 0) {
      const totalCashBook = response.result;
      const result = response.result.cashbookResponse;
      const nextPagination = {
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      };
      setListCashBookTotal({ totalRevenue: totalCashBook.totalPos, totalExpenditure: totalCashBook.totalNav });
      setListCashBook(result.items);
      setPagination((prev) => ({
        ...prev,
        ...nextPagination,
      }));
      const nextIsNoItem = +result.total === 0 && !params.keyword && +result.page === 1;
      setIsNoItem(nextIsNoItem);
      cacheRef.current[buildParamsSignature(1, paramsSearch)] = {
        type: 1,
        listCashBook: result.items,
        listCashBookTotal: { totalRevenue: totalCashBook.totalPos, totalExpenditure: totalCashBook.totalNav },
        pagination: nextPagination,
        isNoItem: nextIsNoItem,
      };
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
    setDisplayTabType(1);
    setIsTabSwitching(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      const tabType = tab.type as 1 | 2;
      const cacheKey = buildParamsSignature(tabType, params);
      const cached = cacheRef.current[cacheKey];

      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }

      if (cached) {
        if (cached.type === 1) {
          setListCashBook(cached.listCashBook || []);
          setListCashBookTotal(cached.listCashBookTotal || {});
        } else {
          setListReportCashBook(cached.listReportCashBook || []);
          setPrevBalance(cached.prevBalance || 0);
          setPosBalance(cached.posBalance || 0);
          setPrevTotalByPage(cached.prevTotalByPage || 0);
        }

        setPagination((prev) => ({ ...prev, ...(cached.pagination || {}) }));
        setIsNoItem(!!cached.isNoItem);
        setDisplayTabType(cached.type);
        setIsLoading(false);
        setIsTabSwitching(false);
      } else {
        fetchTimerRef.current = setTimeout(() => {
          if (tabType === 1) {
            getListCashBook(params);
          } else {
            getListCashBookReport(params);
          }
        }, 350);
      }

    }

    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, [params, tab.type]);

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);

    if (paramsTemp.limit === 10) {
      delete paramsTemp["limit"];
    }

    Object.keys(paramsTemp).map((key) => {
      paramsTemp[key] === "" ? delete paramsTemp[key] : null;
    });

    if (paramsTemp.page === 1) {
      delete paramsTemp["page"];
    }

    const nextQueryString = new URLSearchParams(paramsTemp as Record<string, string>).toString();
    const currentQueryString = searchParams.toString();

    if (currentQueryString !== nextQueryString) {
      setSearchParams(paramsTemp as Record<string, string | string[]>);
    }
  }, [params]);

  useEffect(() => {
    return () => {
      Object.values(refreshSpinTimersRef.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    };
  }, []);


  const getListCashBookReport = async (paramsSearch: ICashbookFilterRequest) => {
    const requestId = ++requestSeqRef.current;
    setIsLoading(true);
    const response = await CashbookService.list({ ...paramsSearch, type: 2 });

    if (requestId !== requestSeqRef.current) {
      return;
    }

    if (response.code === 0) {
      const result = response.result.cashbookResponse;
      setPrevBalance(response.result.prevBalance);
      setPosBalance(response.result.posBalance);
      setPrevTotalByPage(response.result.prevTotalByPage);

      let total = +response.result.prevBalance + +response.result.prevTotalByPage;
      let arr = (result.items || []).map((item) => {
        if (item.type == 1) {
          total += +item.amount;
        } else {
          total += -+item.amount;
        }

        item.remaining = total;
        return item;
      });
      setListReportCashBook(arr);

      const nextPagination = {
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      };
      setPagination((prev) => ({
        ...prev,
        ...nextPagination,
      }));
      const nextIsNoItem = +result.total === 0 && params.keyword === "" && +result.page === 1;
      setIsNoItem(nextIsNoItem);
      cacheRef.current[buildParamsSignature(2, paramsSearch)] = {
        type: 2,
        listReportCashBook: arr,
        prevBalance: response.result.prevBalance,
        posBalance: response.result.posBalance,
        prevTotalByPage: response.result.prevTotalByPage,
        pagination: nextPagination,
        isNoItem: nextIsNoItem,
      };
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
    setDisplayTabType(2);
    setIsTabSwitching(false);
  };

  const reportSource = displayTabType === 1 ? (listCashBook as ICashBookResponse[]) : (listReportCashBook as ICashBookResponse[]);

  const cashFlowSeriesRaw = useMemo(() => buildCashFlowSeries(reportSource), [reportSource]);
  const expenseSeriesRaw = useMemo(() => buildExpenseSeries(reportSource), [reportSource]);
  const allRecentTransactionsRaw = useMemo(
    () =>
      (reportSource || [])
        .slice()
        .sort((a, b) => moment(b.transDate).valueOf() - moment(a.transDate).valueOf())
        .slice(0, 50),
    [reportSource]
  );

  const cashFlowSeries = cashFlowSeriesRaw.length > 0 ? cashFlowSeriesRaw : MOCK_CASHFLOW_SERIES;
  const expenseSeries = expenseSeriesRaw.length > 0 ? expenseSeriesRaw : MOCK_EXPENSE_SERIES;
  const allRecentTransactions = allRecentTransactionsRaw.length > 0 ? allRecentTransactionsRaw : MOCK_RECENT_TRANSACTIONS;
  const salesChannelAnalysisRaw = useMemo(() => buildSalesChannelAnalysis(reportSource), [reportSource]);
  const salesChannelAnalysis = salesChannelAnalysisRaw.length > 0 ? salesChannelAnalysisRaw : MOCK_CHANNEL_ANALYSIS;
  const recentPageSize = 6;
  const recentTotalPages = Math.max(1, Math.ceil(allRecentTransactions.length / recentPageSize));
  const recentTransactions = allRecentTransactions.slice((recentPage - 1) * recentPageSize, recentPage * recentPageSize);

  useEffect(() => {
    setRecentPage(1);
  }, [displayTabType, reportSource]);

  const cashFlowChartOptions = useMemo<Options>(
    () => ({
      chart: {
        type: "column",
        backgroundColor: "transparent",
        height: 240,
        spacing: [8, 8, 8, 8],
        animation: {
          duration: 420,
        },
      },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories: cashFlowSeries.map((item) => item.label),
        lineColor: "transparent",
        tickColor: "transparent",
        labels: { style: { color: "#9a9890", fontSize: "10px" } },
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: "rgba(0,0,0,0.06)",
        labels: {
          style: { color: "#9a9890", fontSize: "10px" },
          formatter: function () {
            return formatCurrency(Number(this.value || 0));
          },
        },
      },
      tooltip: {
        shared: true,
        backgroundColor: "#ffffff",
        borderColor: "#e2e0d8",
        borderRadius: 8,
        shadow: false,
      },
      plotOptions: {
        column: {
          borderRadius: 3,
          pointPadding: 0.1,
          groupPadding: 0.2,
          maxPointWidth: 22,
        },
        series: {
          animation: {
            duration: 650,
          },
        },
      },
      series: [
        {
          type: "column",
          name: "Thu",
          data: cashFlowSeries.map((item) => item.income),
          color: "#10b981",
        },
        {
          type: "column",
          name: "Chi",
          data: cashFlowSeries.map((item) => item.expense),
          color: "#ef4444",
        },
      ],
    }),
    [cashFlowSeries]
  );

  const expenseChartOptions = useMemo<Options>(
    () => ({
      chart: {
        type: "pie",
        backgroundColor: "transparent",
        height: 240,
        spacing: [4, 4, 4, 4],
        animation: {
          duration: 420,
        },
      },
      title: { text: undefined },
      credits: { enabled: false },
      exporting: { enabled: false },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: "#ffffff",
        borderColor: "#e2e0d8",
        borderRadius: 8,
        shadow: false,
        pointFormatter: function () {
          return `<span style="color:${this.color}">\u25CF</span> ${this.name}: <b>${formatCurrency(Number(this.y || 0))}</b>`;
        },
      },
      plotOptions: {
        pie: {
          innerSize: "64%",
          borderWidth: 0,
          size: "88%",
          slicedOffset: 0,
          dataLabels: {
            enabled: true,
            distance: -18,
            formatter: function () {
              return `${Math.round(Number(this.percentage || 0))}%`;
            },
            style: {
              textOutline: "none",
              fontSize: "10px",
              fontWeight: "500",
            },
          },
        },
        series: {
          animation: {
            duration: 650,
          },
        },
      },
      series: [
        {
          type: "pie",
          data: expenseSeries.map((item, index) => {
            const color = EXPENSE_CHART_COLORS[index] || EXPENSE_CHART_COLORS[EXPENSE_CHART_COLORS.length - 1];

            return {
              name: item.label,
              y: item.amount,
              color,
              dataLabels: {
                color: getContrastTextColor(color),
              },
            };
          }),
        },
      ],
    }),
    [expenseSeries]
  );

  const tableMeta =
    displayTabType === 1
      ? `${pagination.totalItem || 0} giao dịch thu chi`
      : `Tồn đầu kỳ ${formatCurrency(prevBalance)} · Tồn cuối kỳ ${formatCurrency(posBalance)}`;

  return (
    <div className={`page-content cashbook${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Báo cáo Tài chính" />

      <div className={`finance-report${isTabSwitching ? " is-updating" : ""}`}>
        <Filters listTabs={listTabs} activeTabName={tab.name} params={params} filterList={filterList} onChangeTab={handleChangeTab} onUpdateParams={setParams} />

        <Kpis
          displayTabType={displayTabType}
          totalRevenue={listCashBookTotal.totalRevenue || 0}
          totalExpenditure={listCashBookTotal.totalExpenditure || 0}
          totalItem={pagination.totalItem || 0}
          prevBalance={prevBalance || 0}
          posBalance={posBalance || 0}
          prevTotalByPage={prevTotalByPage || 0}
        />

        <div className="finance-report__charts">
          <CashFlowCard
            displayTabType={displayTabType}
            refreshKey={panelRefresh.cashFlow}
            isRefreshing={panelRefreshing.cashFlow}
            chartOptions={cashFlowChartOptions}
            hasData={cashFlowSeries.length > 0}
            onReset={() => triggerPanelRefresh("cashFlow")}
          />

          <ExpenseCard
            displayTabType={displayTabType}
            refreshKey={panelRefresh.expense}
            isRefreshing={panelRefreshing.expense}
            chartOptions={expenseChartOptions}
            hasData={expenseSeries.length > 0}
            expenseSeries={expenseSeries}
            expenseColors={EXPENSE_CHART_COLORS}
            onReset={() => triggerPanelRefresh("expense")}
          />
        </div>

        <InsightCard
          insightTab={insightTab}
          isLoading={isLoading}
          isTabSwitching={isTabSwitching}
          tableMeta={tableMeta}
          displayTabType={displayTabType}
          panelRefresh={panelRefresh}
          panelRefreshing={panelRefreshing}
          recentTransactions={recentTransactions}
          recentPage={recentPage}
          recentTotalPages={recentTotalPages}
          salesChannelAnalysis={salesChannelAnalysis}
          onChangeInsightTab={setInsightTab}
          onTriggerPanelRefresh={triggerPanelRefresh}
          onRecentPageChange={setRecentPage}
          getTransactionStatus={getTransactionStatus}
        />
      </div>

      {isTabSwitching && <div className="finance-report__loading-indicator">Đang cập nhật dữ liệu...</div>}
    </div>
  );
}
