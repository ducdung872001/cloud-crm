import React from "react";
import { formatCurrency } from "reborn-util";
import ReportPanel from "components/reportShared/ReportPanel";
import { CUSTOMER_ROWS } from "../mockData";

export default function CustomerTopTable() {
  return (
    <ReportPanel className="table-card" headerClassName="table-header" bodyClassName="table-scroll" title={<h3>Danh sách khách hàng tiêu biểu</h3>} subtitle={<span>Xếp theo doanh thu tích lũy</span>}>
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Điện thoại</th>
              <th>Tổng mua</th>
              <th>Điểm tích lũy</th>
              <th>Nhóm</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMER_ROWS.map((item) => (
              <tr key={item.phone}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>{formatCurrency(item.totalSpent)} đ</td>
                <td>{item.loyaltyPoint.toLocaleString("vi-VN")}</td>
                <td>
                  <span className="customer-badge" style={{ "--badge-color": item.color } as React.CSSProperties}>
                    {item.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </ReportPanel>
  );
}
