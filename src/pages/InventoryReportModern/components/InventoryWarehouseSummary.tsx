import React from "react";
import { formatCurrency } from "reborn-util";
import { WAREHOUSE_DATA } from "../mockData";

export default function InventoryWarehouseSummary() {
  return (
    <div className="report-panel">
      <div className="report-panel__header">
        <div className="report-panel__title">Hiệu suất theo kho</div>
        <div className="report-panel__sub">Tồn và giá trị từng kho</div>
      </div>
      <div className="warehouse-summary-list">
        {WAREHOUSE_DATA.map((item) => (
          <div key={item.name} className="warehouse-summary-item">
            <div className="warehouse-summary-item__name">{item.name}</div>
            <div className="warehouse-summary-item__meta">
              <span>Tồn: {item.closingQty.toLocaleString("vi-VN")}</span>
              <span>Giá trị: {formatCurrency(item.stockValue)} đ</span>
            </div>
            <div className="warehouse-summary-item__bar">
              <div className="warehouse-summary-item__fill" style={{ width: `${Math.min(100, Math.round((item.closingQty / 2640) * 100))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
