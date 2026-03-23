import React from "react";
import { formatCurrency } from "reborn-util";
import ReportPanel from "components/reportShared/ReportPanel";
import { IInventoryProductDetail } from "services/InventoryReportService";
import { PRODUCT_ROWS } from "../mockData";

interface Props {
  productDetails?: IInventoryProductDetail[];
}

const DEFAULT_PRODUCTS: IInventoryProductDetail[] = PRODUCT_ROWS.map((d) => ({
  sku:           d.sku,
  productName:   d.productName,
  warehouseName: d.warehouseName,
  closingQty:    d.closingQty,
  availableQty:  d.availableQty,
  stockValue:    d.stockValue,
  turnoverDays:  d.turnoverDays,
  status:        d.status,
  color:         d.color,
}));

export default function InventoryProductTable({ productDetails = DEFAULT_PRODUCTS }: Props) {
  return (
    <ReportPanel
      className="report-table-card"
      headerClassName="report-table-card__header"
      bodyClassName="report-table-wrap"
      titleClassName="report-panel__title"
      subtitleClassName="report-panel__sub"
      title="Chi tiết sản phẩm tồn kho"
      subtitle="Danh sách SKU cần theo dõi trong kỳ báo cáo"
    >
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
            {(productDetails ?? []).map((item) => (
              <tr key={`${item.sku}-${item.warehouseName}`}>
                <td className="font-semibold">{item.sku}</td>
                <td>{item.productName}</td>
                <td>{item.warehouseName}</td>
                <td className="text-right">{(item.closingQty  ?? 0).toLocaleString("vi-VN")}</td>
                <td className="text-right">{(item.availableQty ?? 0).toLocaleString("vi-VN")}</td>
                <td className="text-right">{formatCurrency(item.stockValue ?? 0)} đ</td>
                <td className="text-right">{item.turnoverDays ?? 0}</td>
                <td>
                  <span
                    className="report-status"
                    style={{ "--status-color": item.color } as React.CSSProperties}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </ReportPanel>
  );
}
