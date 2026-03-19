import React from "react";
import { formatCurrency } from "reborn-util";
import { PRODUCT_ROWS } from "../mockData";

export default function InventoryProductTable() {
  return (
    <div className="report-table-card">
      <div className="report-table-card__header">
        <div>
          <div className="report-panel__title">Chi tiết sản phẩm tồn kho</div>
          <div className="report-panel__sub">Danh sách SKU cần theo dõi trong kỳ báo cáo</div>
        </div>
      </div>
      <div className="report-table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Sản phẩm</th>
              <th>Kho</th>
              <th className="text-right">Tồn cuối</th>
              <th className="text-right">Khả dụng</th>
              <th className="text-right">Giá trị tồn</th>
              <th className="text-right">Số ngày luân chuyển</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCT_ROWS.map((item) => (
              <tr key={item.sku}>
                <td className="font-semibold">{item.sku}</td>
                <td>{item.productName}</td>
                <td>{item.warehouseName}</td>
                <td className="text-right">{item.closingQty.toLocaleString("vi-VN")}</td>
                <td className="text-right">{item.availableQty.toLocaleString("vi-VN")}</td>
                <td className="text-right">{formatCurrency(item.stockValue)} đ</td>
                <td className="text-right">{item.turnoverDays}</td>
                <td><span className="report-status" style={{ "--status-color": item.color } as React.CSSProperties}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
