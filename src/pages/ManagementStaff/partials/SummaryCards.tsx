import React from "react";
import "./SummaryCards.scss";

export default function SummaryCards() {
  const data = [
    {
      title: "DOANH THU HÔM NAY",
      value: "8.5M",
      sub: "↑ +12% so với hôm qua",
      color: "#10b981",
    },
    {
      title: "TỔNG ĐƠN HÀNG",
      value: "127",
      sub: "45 đơn ca Sáng · 82 đơn ca Chiều",
      color: "#3b82f6",
    },
    {
      title: "NHÂN VIÊN ĐANG CA",
      value: "3",
      sub: "Ca Chiều · 15:00 - 22:00",
      color: "#f59e0b",
    },
    {
      title: "CHÊNH LỆCH TIỀN MẶT",
      value: "-50K",
      sub: "Ca Sáng · Đã giải trình",
      color: "#ef4444",
    },
  ];

  return (
    <div className="summary-grid">
      {data.map((item, idx) => (
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
