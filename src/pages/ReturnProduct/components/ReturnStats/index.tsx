import React from "react";
import { ReturnProduct } from "../../../../types/returnProduct";
import "./index.scss";

interface ReturnStatsProps {
  data: ReturnProduct[];
  /** Tổng phiếu tháng này từ API */
  totalFromApi?: number;
  /**
   * Tổng phiếu tháng TRƯỚC từ API — dùng để tính delta "+N so với tháng trước".
   * Nếu không truyền → ẩn dòng so sánh.
   */
  lastMonthTotal?: number;
}

const ReturnStats: React.FC<ReturnStatsProps> = ({ data, totalFromApi, lastMonthTotal }) => {
  const thisMonth   = totalFromApi ?? data.length;
  const pending     = data.filter((r) => r.status === "pending").length;
  const totalRefund = data.filter((r) => r.type === "return").reduce((s, r) => s + r.refundAmount, 0);
  const exchCount   = data.filter((r) => r.type === "exchange").length;

  const fmt = (n: number) => n.toLocaleString("vi") + " ₫";

  // "+N so với tháng trước" — chỉ hiển thị khi có số liệu thực
  const deltaStr = (() => {
    if (lastMonthTotal === undefined || lastMonthTotal === null) return null;
    const delta = thisMonth - lastMonthTotal;
    if (delta > 0) return `+${delta} so với tháng trước`;
    if (delta < 0) return `${delta} so với tháng trước`;
    return "Bằng tháng trước";
  })();

  const CARDS = [
    {
      label:   "Tổng phiếu tháng này",
      value:   String(thisMonth),
      // Chỉ hiện delta nếu có — không hardcode "+4"
      sub:     deltaStr ?? "Phiếu trả & đổi hàng",
      variant: "default",
    },
    {
      label:   "Chờ xử lý",
      value:   String(pending),
      sub:     pending > 0 ? "Cần xử lý sớm" : "Không có phiếu chờ",
      variant: "warn",
    },
    {
      label:   "Tiền hoàn tháng này",
      value:   fmt(totalRefund),
      sub:     `${data.filter((r) => r.type === "return").length} phiếu trả hàng`,
      variant: "success",
    },
    {
      label:   "Phiếu đổi hàng",
      value:   String(exchCount),
      sub:     exchCount > 0 ? `${exchCount} phiếu không hoàn tiền` : "Không có phiếu đổi",
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