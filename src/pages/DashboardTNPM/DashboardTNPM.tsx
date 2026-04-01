import React, { useState, useEffect } from "react";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_REVENUE_CHART,
  MOCK_SR_CHART,
  MOCK_PROJECTS,
  MOCK_INVOICES,
  MOCK_SERVICE_REQUESTS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "assets/mock/TNPMData";
import "./DashboardTNPM.scss";

const fmtMoney = (n: number) =>
  n >= 1e9
    ? `${(n / 1e9).toFixed(1)} tỷ`
    : n >= 1e6
    ? `${(n / 1e6).toFixed(1)} tr`
    : `${n.toLocaleString("vi-VN")} đ`;

export default function DashboardTNPM() {
  document.title = "Dashboard – TNPM Property Management";
  const s = MOCK_DASHBOARD_STATS;

  const statCards = [
    { label: "Tổng dự án", value: s.totalProjects, icon: "🏢", color: "#1890ff" },
    { label: "Tỷ lệ lấp đầy", value: `${s.occupancyRate}%`, icon: "📊", color: "#52c41a" },
    { label: "Doanh thu tháng", value: fmtMoney(s.totalRevenue_thisMonth), icon: "💰", color: "#722ed1" },
    { label: "Phiếu quá hạn TT", value: s.overdueInvoices, icon: "⚠️", color: "#ff4d4f" },
    { label: "Yêu cầu dịch vụ", value: s.pendingSR, icon: "🔧", color: "#fa8c16" },
    { label: "Bảo trì đã lên lịch", value: s.maintenancePlanned, icon: "📅", color: "#13c2c2" },
  ];

  const recentSR = MOCK_SERVICE_REQUESTS.slice(0, 4);
  const overdueInvoices = MOCK_INVOICES.filter((i) => i.status === "overdue" || i.status === "pending");

  return (
    <div className="tnpm-dashboard">
      {/* Header */}
      <div className="tnpm-dashboard__header">
        <div>
          <h1 className="tnpm-dashboard__title">🏙️ TNPM Dashboard</h1>
          <p className="tnpm-dashboard__subtitle">Tổng quan vận hành Bất động sản – Tháng 04/2024</p>
        </div>
        <div className="tnpm-dashboard__header-actions">
          <button className="btn btn-outline">
            <i className="icon-download" /> Xuất báo cáo
          </button>
          <button className="btn btn-primary">
            <i className="icon-refresh" /> Cập nhật
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="tnpm-dashboard__stat-grid">
        {statCards.map((c, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: c.color }}>
            <div className="stat-card__icon">{c.icon}</div>
            <div className="stat-card__value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-card__label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Charts + Tables Row */}
      <div className="tnpm-dashboard__content">
        {/* Revenue Chart (Mock Bar) */}
        <div className="tnpm-dashboard__card tnpm-dashboard__card--wide">
          <div className="card-header">
            <span className="card-title">📈 Doanh thu 6 tháng gần nhất</span>
          </div>
          <div className="revenue-chart">
            {MOCK_REVENUE_CHART.map((d, i) => {
              const maxRev = Math.max(...MOCK_REVENUE_CHART.map((x) => x.revenue));
              const heightPct = (d.revenue / maxRev) * 100;
              const tgtPct = (d.target / maxRev) * 100;
              return (
                <div key={i} className="revenue-chart__col">
                  <div className="revenue-chart__bars">
                    <div className="bar bar--target" style={{ height: `${tgtPct}%` }} title={`Mục tiêu: ${fmtMoney(d.target)}`} />
                    <div className="bar bar--actual" style={{ height: `${heightPct}%` }} title={`Thực: ${fmtMoney(d.revenue)}`} />
                  </div>
                  <div className="revenue-chart__label">{d.month}</div>
                  <div className="revenue-chart__val">{fmtMoney(d.revenue)}</div>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span className="legend-item legend-item--actual">■ Thực tế</span>
            <span className="legend-item legend-item--target">■ Mục tiêu</span>
          </div>
        </div>

        {/* Project Occupancy */}
        <div className="tnpm-dashboard__card">
          <div className="card-header">
            <span className="card-title">🏢 Tỷ lệ lấp đầy dự án</span>
          </div>
          <div className="occupancy-list">
            {MOCK_PROJECTS.map((p) => (
              <div key={p.id} className="occupancy-item">
                <div className="occupancy-item__info">
                  <span className="occupancy-item__name">{p.name}</span>
                  <span className="occupancy-item__type">{p.typeName}</span>
                </div>
                <div className="occupancy-item__bar-wrap">
                  <div
                    className="occupancy-item__bar"
                    style={{
                      width: `${p.occupancyRate}%`,
                      background: p.occupancyRate >= 85 ? "#52c41a" : p.occupancyRate >= 70 ? "#faad14" : "#ff4d4f",
                    }}
                  />
                </div>
                <span className="occupancy-item__pct">{p.occupancyRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="tnpm-dashboard__content">
        {/* Recent Service Requests */}
        <div className="tnpm-dashboard__card">
          <div className="card-header">
            <span className="card-title">🔧 Yêu cầu dịch vụ mới nhất</span>
            <a href="/service-requests" className="card-link">Xem tất cả</a>
          </div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Mã SR</th>
                <th>Dự án</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentSR.map((sr) => (
                <tr key={sr.id}>
                  <td className="code">{sr.code}</td>
                  <td>{sr.projectName}</td>
                  <td className="ellipsis">{sr.title}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ background: `${STATUS_COLORS[sr.status]}22`, color: STATUS_COLORS[sr.status] }}
                    >
                      {STATUS_LABELS[sr.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Overdue Invoices */}
        <div className="tnpm-dashboard__card">
          <div className="card-header">
            <span className="card-title">💳 Công nợ cần xử lý</span>
            <a href="/billing" className="card-link">Xem tất cả</a>
          </div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {overdueInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="code">{inv.code}</td>
                  <td className="ellipsis">{inv.customerName}</td>
                  <td className="amount">{fmtMoney(inv.totalAmount - inv.paidAmount)}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ background: `${STATUS_COLORS[inv.status]}22`, color: STATUS_COLORS[inv.status] }}
                    >
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="overdue-summary">
            <span>Tổng công nợ: </span>
            <strong style={{ color: "#ff4d4f" }}>
              {fmtMoney(overdueInvoices.reduce((a, i) => a + (i.totalAmount - i.paidAmount), 0))}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
