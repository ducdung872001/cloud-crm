import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const thisMonth   = totalFromApi ?? data.length;
  const pending     = data.filter((r) => r.status === "pending").length;
  const totalRefund = data.filter((r) => r.type === "return").reduce((s, r) => s + r.refundAmount, 0);
  const exchCount   = data.filter((r) => r.type === "exchange").length;

  const fmt = (n: number) => n.toLocaleString("vi") + " ₫";

  // "+N so với tháng trước" — chỉ hiển thị khi có số liệu thực
  const deltaStr = (() => {
    if (lastMonthTotal === undefined || lastMonthTotal === null) return null;
    const delta = thisMonth - lastMonthTotal;
    if (delta > 0) return `+${delta} ${t("pageReturnProduct.vsLastMonth")}`;
    if (delta < 0) return `${delta} ${t("pageReturnProduct.vsLastMonth")}`;
    return t("pageReturnProduct.vsLastMonth");
  })();

  const CARDS = [
    {
      label:   t("pageReturnProduct.totalThisMonth"),
      value:   String(thisMonth),
      sub:     deltaStr ?? t("pageReturnProduct.title"),
      variant: "default",
    },
    {
      label:   t("pageReturnProduct.pendingCount"),
      value:   String(pending),
      sub:     pending > 0 ? t("pageReturnProduct.pendingDesc") : t("common.noData"),
      variant: "warn",
    },
    {
      label:   t("pageReturnProduct.refundThisMonth"),
      value:   fmt(totalRefund),
      sub:     `${data.filter((r) => r.type === "return").length} ${t("pageReturnProduct.refundDesc")}`,
      variant: "success",
    },
    {
      label:   t("pageReturnProduct.exchangeCount"),
      value:   String(exchCount),
      sub:     exchCount > 0 ? `${exchCount} ${t("pageReturnProduct.exchangeDesc")}` : t("common.noData"),
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