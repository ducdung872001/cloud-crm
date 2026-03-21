import React from "react";
import { formatCurrency } from "reborn-util";
import { IInventoryWarehousePerf } from "services/InventoryReportService";
import { WAREHOUSE_DATA } from "../mockData";

interface Props {
  warehousePerf?: IInventoryWarehousePerf[];
}

const DEFAULT_WAREHOUSE: IInventoryWarehousePerf[] = WAREHOUSE_DATA.map((d, i) => ({
  warehouseId:   i + 1,
  name:          d.name,
  closingQty:    d.closingQty,
  stockValue:    d.stockValue,
  maxStockValue: WAREHOUSE_DATA[0].stockValue, // max = kho đầu tiên (lớn nhất trong mock)
}));

export default function InventoryWarehouseSummary({ warehousePerf = DEFAULT_WAREHOUSE }: Props) {
  return (
    <div className="report-panel">
      <div className="report-panel__header">
        <div className="report-panel__title">Hiệu suất theo kho</div>
        <div className="report-panel__sub">Tồn và giá trị từng kho</div>
      </div>
      <div className="warehouse-summary-list">
        {(warehousePerf ?? []).map((item) => {
          // Dùng maxStockValue từ API (backend đã tính sẵn) thay vì tính lại
          const pct = item.maxStockValue > 0
            ? Math.min(100, Math.round((item.closingQty / item.maxStockValue) * 100))
            : 0;

          return (
            <div key={item.warehouseId} className="warehouse-summary-item">
              <div className="warehouse-summary-item__name">{item.name}</div>
              <div className="warehouse-summary-item__meta">
                <span>Tồn: {(item.closingQty ?? 0).toLocaleString("vi-VN")}</span>
                <span>Giá trị: {formatCurrency(item.stockValue ?? 0)} đ</span>
              </div>
              <div className="warehouse-summary-item__bar">
                <div className="warehouse-summary-item__fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}