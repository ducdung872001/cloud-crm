import React, { useEffect, useState } from "react";
import ShiftService from "services/ShiftService";
import "./SummaryCards.scss";

type CardData = {
  title: string;
  value: string;
  sub: string;
  color: string;
};

// Mock data — giữ khi API chưa hoạt động
const MOCK_CARDS: CardData[] = [
  { title: "DOANH THU HÔM NAY", value: "8.5M", sub: "↑ +12% so với hôm qua", color: "#10b981" },
  { title: "TỔNG ĐƠN HÀNG", value: "127", sub: "45 đơn ca Sáng · 82 đơn ca Chiều", color: "#3b82f6" },
  { title: "NHÂN VIÊN ĐANG CA", value: "3", sub: "Ca Chiều · 15:00 - 22:00", color: "#f59e0b" },
  { title: "CHÊNH LỆCH TIỀN MẶT", value: "-50K", sub: "Ca Sáng · Đã giải trình", color: "#ef4444" },
];

type Props = { branchId: number };

export default function SummaryCards({ branchId }: Props) {
  const [cards, setCards] = useState<CardData[]>([]);

  useEffect(() => {
    if (!branchId) return;
    ShiftService.getGeneralReport(branchId)
      .then((res) => {
        console.log("[SummaryCards] API response:", res);
        const d = res?.result;
        if (!d) {
          console.warn("[SummaryCards] No result:", res);
          return;
        }

        const growthSign = (d.revenueGrowthPct ?? 0) >= 0 ? "↑" : "↓";
        const growthAbs = Math.abs(d.revenueGrowthPct ?? 0).toFixed(1);

        // Tổng đơn sub — ghép tên ca
        const orderSub = (d.shiftStatuses ?? [])
          .map((s: any) => `${s.orderCount ?? 0} đơn ${s.shiftName ?? ""}`)
          .join(" · ") || "";

        // Card 3: nhân viên đang ca
        const activeShift = (d.shiftStatuses ?? []).find((s: any) => s.status === "OPEN");
        const staffSub = activeShift
          ? `${activeShift.shiftName ?? ""} · ${activeShift.timeRange ?? ""}`
          : "";

        // Card 4: chênh lệch
        const diffShift = (d.shiftStatuses ?? []).find((s: any) => (s.cashDifference ?? 0) !== 0);
        const diffSub = d.diffShiftInfo ?? "";

        setCards([
          {
            title: "DOANH THU HÔM NAY",
            value: formatCompact(d.todayRevenue ?? 0),
            sub: `${growthSign} +${growthAbs}% so với hôm qua`,
            color: "#10b981",
          },
          {
            title: "TỔNG ĐƠN HÀNG",
            value: String(d.totalOrders ?? 0),
            sub: orderSub,
            color: "#3b82f6",
          },
          {
            title: "NHÂN VIÊN ĐANG CA",
            value: String(d.activeStaffCount ?? 0),
            sub: staffSub,
            color: "#f59e0b",
          },
          {
            title: "CHÊNH LỆCH TIỀN MẶT",
            value: formatCompact(d.cashDifference ?? 0),
            sub: diffSub,
            color: "#ef4444",
          },
        ]);
      })
      .catch(() => {
        // Lỗi mạng → giữ mock
      });
  }, [branchId]);

  return (
    <div className="summary-grid">
      {cards.map((item, idx) => (
        <div key={idx} className="summary-item" style={{ borderTop: `4px solid ${item.color}` }}>
          <span className="item-title">{item.title}</span>
          <h2 className="item-value" style={{ color: item.color }}>
            {item.value}
          </h2>
          <span className="item-sub">{item.sub}</span>
        </div>
      ))}
    </div>
  );
}

function formatCompact(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return sign + String(abs);
}