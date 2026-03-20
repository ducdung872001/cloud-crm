import React, { useState } from "react";
import Highcharts, { Options, TooltipFormatterContextObject } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IAction } from "model/OtherModel";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
import "./index.scss";

/* ── Mock data ── */
type TierType = "Diamond" | "Gold" | "Silver" | "Bronze";

const clvList: {
  id: number;
  name: string;
  phone: string;
  tier: TierType;
  clv: number;       // raw number, đơn vị VNĐ
  orders: number;
  avgOrder: number;  // triệu đồng
  lastBuy: string;
}[] = [
    { id: 1, name: "Nguyễn Thị Lan", phone: "0901234567", tier: "Diamond", clv: 45200000, orders: 13, avgOrder: 2.3, lastBuy: "14/03/2026" },
    { id: 2, name: "Trần Văn Minh", phone: "0912345678", tier: "Gold", clv: 28600000, orders: 7, avgOrder: 2.7, lastBuy: "12/03/2026" },
    { id: 3, name: "Phạm Quốc Bảo", phone: "0934567890", tier: "Gold", clv: 24100000, orders: 8, avgOrder: 1.5, lastBuy: "15/03/2026" },
    { id: 4, name: "Lê Thị Hoa", phone: "0923456789", tier: "Silver", clv: 12400000, orders: 5, avgOrder: 2.4, lastBuy: "10/03/2026" },
    { id: 5, name: "Đặng Văn Tùng", phone: "0956789012", tier: "Silver", clv: 11700000, orders: 4, avgOrder: 1.9, lastBuy: "13/03/2026" },
    { id: 6, name: "Hoàng Thị Mai", phone: "0945678901", tier: "Bronze", clv: 4800000, orders: 3, avgOrder: 1.2, lastBuy: "08/03/2026" },
    { id: 7, name: "Vũ Thị Linh", phone: "0900112233", tier: "Bronze", clv: 3200000, orders: 2, avgOrder: 0.9, lastBuy: "05/03/2026" },
  ];

const clvMonthData = [
  { m: "T10", v: 3.8 },
  { m: "T11", v: 3.9 },
  { m: "T12", v: 4.5 },
  { m: "T1", v: 4.1 },
  { m: "T2", v: 4.0 },
  { m: "T3", v: 4.2 },
];

const tierIconMap: Record<TierType, string> = {
  Diamond: "GoldMember",
  Gold:    "Star",
  Silver:  "UserCircle",
  Bronze:  "Person",
};

const tierConfig: Record<TierType, { label: string; color: string; className: string }> = {
  Diamond: { label: "Diamond", color: "#06b6d4", className: "clv-tier-badge clv-tier-badge--diamond" },
  Gold:    { label: "Gold",    color: "#f59e0b", className: "clv-tier-badge clv-tier-badge--gold"    },
  Silver:  { label: "Silver",  color: "#94a3b8", className: "clv-tier-badge clv-tier-badge--silver"  },
  Bronze:  { label: "Bronze",  color: "#f97316", className: "clv-tier-badge clv-tier-badge--bronze"  },
};

const tierDistribution: { tier: TierType; avg: string; maxM: number; pct: number }[] = [
  { tier: "Diamond", avg: "28.5M", maxM: 28.5, pct: 95 },
  { tier: "Gold", avg: "12.3M", maxM: 12.3, pct: 65 },
  { tier: "Silver", avg: "5.8M", maxM: 5.8, pct: 38 },
  { tier: "Bronze", avg: "1.9M", maxM: 1.9, pct: 13 },
];

function formatMoney(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}

/* ── Stat Card ── */
interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red";
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, trend }) => (
  <div className={`clv-stat-card clv-stat-card--${color}`}>
    <div className="clv-stat-card__body">
      <div className="clv-stat-card__content">
        <p className="clv-stat-card__label">{title}</p>
        <p className="clv-stat-card__value">{value}</p>
        {sub && <p className="clv-stat-card__sub">{sub}</p>}
      </div>
      <div className="clv-stat-card__icon">{icon}</div>
    </div>
    {trend !== undefined && (
      <p className={`clv-stat-card__trend ${trend >= 0 ? "clv-stat-card__trend--up" : "clv-stat-card__trend--down"}`}>
        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tháng trước
      </p>
    )}
  </div>
);

/* ── Highcharts – CLV line chart ── */
const buildClvChartOptions = (): Options => ({
  chart: {
    type: "area",
    backgroundColor: "transparent",
    style: { fontFamily: "'Segoe UI', Arial, sans-serif" },
    height: 160,
    margin: [10, 10, 25, 10],
  },
  title: { text: undefined },
  xAxis: {
    categories: clvMonthData.map((d) => d.m),
    labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
    gridLineWidth: 0,
    lineColor: "transparent",
    tickColor: "transparent",
  },
  yAxis: { visible: false, min: 0 },
  legend: { enabled: false },
  tooltip: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderWidth: 0,
    padding: 10,
    style: { color: "#ffffff", fontSize: "12px" },
    formatter(this: TooltipFormatterContextObject): string {
      return `<b>${this.x}</b><br/>CLV TB: <b>${this.y}M đ</b>`;
    },
  },
  plotOptions: {
    area: {
      lineWidth: 2.5,
      marker: { enabled: true, radius: 4, symbol: "circle" },
    },
  },
  series: [
    {
      type: "area",
      name: "CLV trung bình",
      data: clvMonthData.map((d) => d.v),
      color: "#f97316",
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 } as any,
        stops: [
          [0, "rgba(249, 115, 22, 0.28)"],
          [1, "rgba(249, 115, 22, 0)"],
        ],
      },
      marker: { fillColor: "#ffffff", lineWidth: 2, lineColor: "#f97316" },
    },
  ],
  credits: { enabled: false },
});

/* ── Rank icon helper ── */
const RankIcon: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return <span className="clv-rank clv-rank--1">#1</span>;
  if (rank === 2) return <span className="clv-rank clv-rank--2">#2</span>;
  if (rank === 3) return <span className="clv-rank clv-rank--3">#3</span>;
  return <span className="clv-rank clv-rank--other">#{rank}</span>;
};

export default function CustomerValue(props: any) {
  document.title = "Giá trị khách hàng";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => setPagination((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setPagination((prev) => ({ ...prev, sizeLimit: limit })),
  });

  const filtered = clvList.filter((c) => {
    const matchSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchTier = tierFilter === "all" || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const sorted = [...filtered].sort((a, b) => b.clv - a.clv);

  const titles = ["#", "Khách hàng", "Hạng", "CLV", "Số đơn", "TB/đơn", "Lần cuối mua"];
  const dataFormat = ["text-center", "", "text-center", "text-right", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: typeof clvList[0], index: number) => {
    const rank = getPageOffset({ limit: pagination.sizeLimit, page: pagination.page }) + index + 1;
    const cfg = tierConfig[item.tier];
    return [
      <RankIcon rank={rank} />,
      <div className="clv-customer-cell">
        <div className="clv-avatar clv-avatar--tier" data-tier={item.tier}>
          <Icon name={tierIconMap[item.tier] as any} />
        </div>
        <div>
          <p className="clv-customer-cell__name">{item.name}</p>
          <p className="clv-customer-cell__phone">{item.phone}</p>
        </div>
      </div>,
      <span className={cfg.className}>
        <Icon name={tierIconMap[item.tier] as any} />
        {cfg.label}
      </span>,
      <span className="clv-clv-value">{formatMoney(item.clv)}</span>,
      `${item.orders} đơn`,
      `${item.avgOrder}M`,
      item.lastBuy,
    ];
  };

  const titleActions: ITitleActions = { actions: [] };

  const actionsTable = (item: typeof clvList[0]): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["CUSTOMER_UPDATE"] == 1 && {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => { },
      },
    ];
  };

  return (
    <div className="clv-page page-content">
      <HeaderTabMenu
        title="Giá trị khách hàng (CLV)"
        titleBack="Phân tích khách hàng"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      <div className="clv-stats-grid">
        <StatCard title="CLV trung bình" value="4.2M" icon={<Icon name="Score" />} color="purple" trend={7} />
        <StatCard title="CLV cao nhất" value="45.2M" sub="Nguyễn Thị Lan" icon={<Icon name="Winner" />} color="orange" />
        <StatCard title="Đơn hàng TB/KH" value="6.8 đơn" icon={<Icon name="Cart" />} color="blue" />
        <StatCard title="Tần suất mua TB" value="18 ngày" icon={<Icon name="Calendar" />} color="green" />
      </div>

      <div className="clv-charts-row">
        <div className="clv-card">
          <h3 className="clv-card__title">Phân bố CLV theo hạng thành viên</h3>
          <div className="clv-tier-list">
            {tierDistribution.map((t) => {
              const cfg = tierConfig[t.tier];
              return (
                <div key={t.tier} className="clv-tier-row">
                  <span className={`${cfg.className} clv-tier-row__badge`}>
                    <Icon name={tierIconMap[t.tier] as any} />
                    {t.tier}
                  </span>
                  <div className="clv-tier-row__bar-wrap">
                    <div className="clv-tier-row__bar-label">
                      <span className="clv-tier-row__bar-meta">CLV TB</span>
                      <span className="clv-tier-row__bar-value" style={{ color: cfg.color }}>{t.avg}</span>
                    </div>
                    <div className="clv-bar-bg">
                      <div
                        className="clv-bar-fill"
                        style={{ width: `${t.pct}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="clv-card">
          <h3 className="clv-card__title">CLV theo thời gian (triệu đ)</h3>
          <div style={{ margin: "0 -8px" }}>
            <HighchartsReact highcharts={Highcharts} options={buildClvChartOptions()} />
          </div>
        </div>
      </div>

      <div className="clv-table-card">
        <div className="clv-table-card__toolbar">
          <div className="clv-search-wrap">
            <svg className="clv-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="clv-search-input"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="clv-select"
          >
            <option value="all">Tất cả hạng</option>
            <option value="Diamond">Diamond</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
          </select>
        </div>

        <BoxTable
          name="khách hàng theo CLV"
          titles={titles}
          items={sorted}
          isPagination={true}
          dataPagination={pagination}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          isBulkAction={false}
          listIdChecked={listIdChecked}
          striped={true}
          setListIdChecked={(listId) => setListIdChecked(listId)}
          actions={actionsTable}
          actionType="inline"
        />
      </div>
    </div>
  );
}
