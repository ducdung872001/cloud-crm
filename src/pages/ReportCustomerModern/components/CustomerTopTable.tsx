import React from "react";
import { formatCurrency } from "reborn-util";
import { CUSTOMER_ROWS } from "../mockData";

export default function CustomerTopTable() {
  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <h3>Danh sách khách hàng tiêu biểu</h3>
          <span>Xếp theo doanh thu tích lũy</span>
        </div>
      </div>
      <div className="table-scroll">
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
      </div>
    </div>
  );
}
