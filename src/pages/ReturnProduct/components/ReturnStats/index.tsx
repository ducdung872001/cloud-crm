import React from "react";
import { ReturnProduct } from "../../../../types/returnProduct";
import "./index.scss";

interface ReturnStatsProps {
  data: ReturnProduct[];
  /**
   * Tổng số phiếu từ API (page.total).
   * Nếu không truyền → tính từ data hiện tại (fallback cho giai đoạn mock).
   */
  totalFromApi?: number;
}

const ReturnStats: React.FC<ReturnStatsProps> = ({ data, totalFromApi }) => {
  const thisMonth   = totalFromApi ?? data.length;
  const pending     = data.filter((r) => r.status === "pending").length;
  const totalRefund = data.filter((r) => r.type === "return").reduce((s, r) => s + r.refundAmount, 0);
  const exchCount   = data.filter((r) => r.type === "exchange").length;

  const fmt = (n: number) => n.toLocaleString("vi") + " ₫";

  const CARDS = [
    {
      label: "Tổng phiếu tháng này",
      value: String(thisMonth),
      sub: "+4 so với tháng trước",
      variant: "default",
    },
    {
      label: "Chờ xử lý",
      value: String(pending),
      sub: "Cần xử lý sớm",
      variant: "warn",
    },
    {
      label: "Tiền hoàn tháng này",
      value: fmt(totalRefund),
      sub: `${data.filter((r) => r.type === "return").length} phiếu trả hàng`,
      variant: "success",
    },
    {
      label: "Phiếu đổi hàng",
      value: String(exchCount),
      sub: "Không hoàn tiền",
      variant: "default",
    },
  ];

  return (
    <div className="return-stats">
      {CARDS.map((c) => (
        <div key={c.label} className={`rstat-card rstat-card--${c.variant}`}>
          <div className="rstat-card__label">{c.label}</div>
          <div className="rstat-card__value">{c.value}</div>
          <div className="rstat-card__sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};

export default ReturnStats;
