import React from "react";
import { formatCurrency } from "reborn-util";
import { IInventoryWarehousePerf } from "services/InventoryReportService";

interface Props {
  warehousePerf: IInventoryWarehousePerf[];
}

export default function InventoryWarehouseSummary({ warehousePerf }: Props) {
  const maxQty = Math.max(...warehousePerf.map((w) => w.closingQty), 1);

  return (
    <div className="report-panel">
      <div className="report-panel__header">
        <div className="report-panel__title">Hiệu suất theo kho</div>
        <div className="report-panel__sub">Tồn và giá trị từng kho</div>
      </div>
      <div className="warehouse-summary-list">
        {warehousePerf.map((item) => (
          <div key={item.warehouseId} className="warehouse-summary-item">
            <div className="warehouse-summary-item__name">{item.name}</div>
            <div className="warehouse-summary-item__meta">
              <span>Tồn: {item.closingQty.toLocaleString("vi-VN")}</span>
              <span>Giá trị: {formatCurrency(item.stockValue)} đ</span>
            </div>
            <div className="warehouse-summary-item__bar">
              <div
                className="warehouse-summary-item__fill"
                style={{ width: `${Math.min(100, Math.round((item.closingQty / maxQty) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}