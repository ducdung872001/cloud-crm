import React, { Fragment, useState } from "react";
import Highcharts, { Options, TooltipFormatterContextObject } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import { showToast, getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import AddCustomerChurnModal from "./partials/AddCustomerChurnModal";
import AddCustomerChurnCampaignModal from "./partials/AddCustomerChurnCampaignModal";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
import "./index.scss";

const churnList: {
  id: number;
  name: string;
  phone: string;
  lastBuy: string;
  days: number;
  spent: string;
  risk: "high" | "medium" | "low";
}[] = [
    { id: 1, name: "Trần Thị Bình", phone: "0966778899", lastBuy: "01/12/2025", days: 105, spent: "3.200.000", risk: "high" },
    { id: 2, name: "Lê Văn Đức", phone: "0977889900", lastBuy: "15/12/2025", days: 91, spent: "1.800.000", risk: "high" },
    { id: 3, name: "Nguyễn Thị Giang", phone: "0988990011", lastBuy: "20/12/2025", days: 86, spent: "5.600.000", risk: "medium" },
    { id: 4, name: "Phạm Văn Hải", phone: "0999001122", lastBuy: "28/12/2025", days: 78, spent: "2.100.000", risk: "medium" },
    { id: 5, name: "Vũ Thị Linh", phone: "0900112233", lastBuy: "05/01/2026", days: 70, spent: "4.300.000", risk: "medium" },
    { id: 6, name: "Đỗ Văn Nam", phone: "0911223344", lastBuy: "10/01/2026", days: 65, spent: "2.900.000", risk: "low" },
    { id: 7, name: "Bùi Thị Oanh", phone: "0922334455", lastBuy: "15/01/2026", days: 60, spent: "1.500.000", risk: "low" },
  ];

const churnMonthData = [
  { m: "T10", v: 3.2 },
  { m: "T11", v: 3.8 },
  { m: "T12", v: 2.9 },
  { m: "T1", v: 4.1 },
  { m: "T2", v: 3.6 },
  { m: "T3", v: 3.1 },
];

type RiskLevel = "high" | "medium" | "low";

const riskMap: Record<RiskLevel, { label: string; className: string }> = {
  high: { label: "Nguy cơ cao", className: "churn-risk-badge churn-risk-badge--high" },
  medium: { label: "Nguy cơ TB", className: "churn-risk-badge churn-risk-badge--medium" },
  low: { label: "Nguy cơ thấp", className: "churn-risk-badge churn-risk-badge--low" },
};

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red";
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, trend }) => (
  <div className={`churn-stat-card churn-stat-card--${color}`}>
    <div className="churn-stat-card__body">
      <div className="churn-stat-card__content">
        <p className="churn-stat-card__label">{title}</p>
        <p className="churn-stat-card__value">{value}</p>
        {sub && <p className="churn-stat-card__sub">{sub}</p>}
      </div>
      <div className="churn-stat-card__icon">{icon}</div>
    </div>
    {trend !== undefined && (
      <p className={`churn-stat-card__trend ${trend >= 0 ? "churn-stat-card__trend--up" : "churn-stat-card__trend--down"}`}>
        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tháng trước
      </p>
    )}
  </div>
);

const buildChurnChartOptions = (): Options => ({
  chart: {
    type: "area",
    backgroundColor: "transparent",
    style: {
      fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    height: 160,
    margin: [10, 10, 25, 10],
  },
  title: {
    text: undefined,
  },
  xAxis: {
    categories: churnMonthData.map((d) => d.m),
    labels: {
      style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" },
    },
    gridLineWidth: 0,
    lineColor: "transparent",
    tickColor: "transparent",
  },
  yAxis: {
    visible: false,
    min: 0,
  },
  legend: {
    enabled: false,
  },
  tooltip: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderWidth: 0,
    padding: 10,
    style: { color: "#ffffff", fontSize: "12px" },
    formatter(this: TooltipFormatterContextObject): string {
      return `<b>${this.x}</b><br/>Tỷ lệ rời bỏ: <b>${this.y}%</b>`;
    },
  },
  plotOptions: {
    area: {
      lineWidth: 2.5,
      marker: {
        enabled: true,
        radius: 4,
        symbol: "circle",
      },
    },
  },
  series: [
    {
      type: "area",
      name: "Tỷ lệ rời bỏ",
      data: churnMonthData.map((d) => d.v),
      color: "#ef4444",
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 } as any,
        stops: [
          [0, "rgba(239, 68, 68, 0.3)"],
          [1, "rgba(239, 68, 68, 0)"],
        ],
      },
      marker: {
        fillColor: "#ffffff",
        lineWidth: 2,
        lineColor: "#ef4444",
      },
    },
  ],
  credits: {
    enabled: false,
  },
});

export default function CustomerChurn(props: any) {
  document.title = "Khách hàng rời bỏ";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalCampaign, setShowModalCampaign] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof churnList[0] | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Khách hàng rời bỏ",
    isChooseSizeLimit: true,
    setPage: (page) => setPagination((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setPagination((prev) => ({ ...prev, sizeLimit: limit })),
  });

  const filtered = churnList.filter((c) => {
    const matchSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchRisk = riskFilter === "all" || c.risk === riskFilter;
    return matchSearch && matchRisk;
  });

  const titles = ["STT", "Khách hàng", "Lần cuối mua", "Ngày không mua", "Chi tiêu", "Nguy cơ"];
  const dataFormat = ["text-center", "", "text-center", "text-center", "text-right", "text-center"];

  const dataMappingArray = (item: typeof churnList[0], index: number) => [
    getPageOffset({ limit: pagination.sizeLimit, page: pagination.page }) + index + 1,
    <div className="churn-customer-cell">
      <div className="churn-avatar">{item.name.charAt(0)}</div>
      <div>
        <p className="churn-customer-cell__name">{item.name}</p>
        <p className="churn-customer-cell__phone">{item.phone}</p>
      </div>
    </div>,
    item.lastBuy,
    <span className={`churn-days-badge ${item.days > 90 ? "churn-days-badge--high"
      : item.days > 60 ? "churn-days-badge--medium"
        : "churn-days-badge--low"
      }`}>{item.days} ngày</span>,
    `${item.spent}đ`,
    <span className={riskMap[item.risk as RiskLevel].className}>
      {riskMap[item.risk as RiskLevel].label}
    </span>,
  ];

  const titleActions: ITitleActions = {
    actions: [
      permissions["CUSTOMER_UPDATE"] == 1 && {
        title: "Chiến dịch tái kích hoạt",
        callback: () => {
          setShowModalCampaign(true);
        },
      },
    ],
  };

  const actionsTable = (item: typeof churnList[0]): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["CUSTOMER_UPDATE"] == 1 && {
        title: "Xem / Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => { if (!isCheckedItem) { setSelectedItem(item); setShowModalAdd(true); } },
      },
      permissions["CUSTOMER_UPDATE"] == 1 && {
        title: "Gửi tin tái kích hoạt",
        icon: <Icon name="Send" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => { if (!isCheckedItem) showToast(`Đã gửi tin đến ${item.name}`, "success"); },
      },
      permissions["CUSTOMER_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => { if (!isCheckedItem) showDialogConfirmDelete(item); },
      },
    ];
  };

  const showDialogConfirmDelete = (item?: typeof churnList[0]) => {
    const dialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa khách hàng rời bỏ</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? <><strong>{item.name}</strong></> : `${listIdChecked.length} khách hàng đã chọn`}?{" "}
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => {
        showToast(item ? `Đã xóa ${item.name}` : `Đã xóa ${listIdChecked.length} khách hàng`, "success");
        setListIdChecked([]);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(dialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["CUSTOMER_DELETE"] == 1 && { title: "Xóa khách hàng", callback: () => showDialogConfirmDelete() },
  ];

  return (
    <div className="churn-page page-content">
      <HeaderTabMenu
        title="Khách hàng rời bỏ"
        titleBack="Phân tích khách hàng"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      <div className="churn-stats-grid">
        <StatCard title="Nguy cơ cao" value="48" icon={<Icon name="WarningCircle" />} color="red" trend={-5} />
        <StatCard title="Nguy cơ TB" value="127" icon={<Icon name="WarningCircle" />} color="orange" />
        <StatCard title="Đã tái kích hoạt" value="34" icon={<Icon name="Refresh" />} color="green" sub="tháng này" trend={12} />
        <StatCard title="Tỷ lệ giữ chân" value="87%" icon={<Icon name="UserCircle" />} color="blue" trend={2} />
      </div>

      <div className="churn-content-grid">
        <div className="churn-table-card">
          <div className="churn-table-card__toolbar">
            <div className="churn-search-wrap">
              <svg className="churn-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="churn-search-input"
              />
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="churn-select"
            >
              <option value="all">Tất cả nguy cơ</option>
              <option value="high">Nguy cơ cao (&gt;90 ngày)</option>
              <option value="medium">Nguy cơ TB (60–90 ngày)</option>
              <option value="low">Nguy cơ thấp (&lt;60 ngày)</option>
            </select>
          </div>

          <BoxTable
            name="khách hàng rời bỏ"
            titles={titles}
            items={filtered}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        </div>

        <div className="churn-side-panel">
          <div className="churn-chart-card">
            <h3 className="churn-chart-card__title">Tỷ lệ rời bỏ theo tháng (%)</h3>
            <div style={{ margin: "0 -8px" }}>
              <HighchartsReact highcharts={Highcharts} options={buildChurnChartOptions()} />
            </div>
          </div>

          <div className="churn-suggestion-card">
            <p className="churn-suggestion-card__title">💡 Gợi ý hành động</p>
            <p className="churn-suggestion-card__body">
              Gửi ưu đãi độc quyền 30% cho 48 khách hàng nguy cơ cao để tái kích hoạt.
            </p>
            <button className="churn-suggestion-card__btn" onClick={() => setShowModalCampaign(true)}>Gửi chiến dịch ngay</button>
          </div>

          <div className="churn-risk-summary-card">
            <h3 className="churn-risk-summary-card__title">Phân bố nguy cơ</h3>
            <div className="churn-risk-summary-card__list">
              {[
                { label: "Nguy cơ cao (>90 ngày)", count: 48, pct: 23, color: "#ef4444" },
                { label: "Nguy cơ TB (60–90 ngày)", count: 127, pct: 60, color: "#f59e0b" },
                { label: "Nguy cơ thấp (<60 ngày)", count: 35, pct: 17, color: "#22c55e" },
              ].map((item) => (
                <div key={item.label} className="churn-risk-row">
                  <div className="churn-risk-row__header">
                    <span className="churn-risk-row__label">{item.label}</span>
                    <span className="churn-risk-row__count" style={{ color: item.color }}>
                      {item.count} KH
                    </span>
                  </div>
                  <div className="churn-risk-bar-bg">
                    <div
                      className="churn-risk-bar-fill"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddCustomerChurnModal
        onShow={showModalAdd}
        data={selectedItem}
        onHide={(reload) => { setShowModalAdd(false); }}
      />
      <AddCustomerChurnCampaignModal
        onShow={showModalCampaign}
        selectedIds={listIdChecked}
        onHide={(reload) => { setShowModalCampaign(false); }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
