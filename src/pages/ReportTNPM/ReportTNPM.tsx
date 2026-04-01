import React, { useState } from "react";
import {
  MOCK_PROJECTS, MOCK_INVOICES, MOCK_PAYMENTS, MOCK_SERVICE_REQUESTS,
  MOCK_REVENUE_CHART, MOCK_SR_CHART, MOCK_DASHBOARD_STATS, STATUS_COLORS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

const REPORT_TABS = [
  { key: "financial", label: "💰 Tài chính" },
  { key: "occupancy", label: "📊 Lấp đầy" },
  { key: "operations", label: "🔧 Vận hành" },
  { key: "vendor", label: "🏭 Nhà cung cấp" },
];

export default function ReportTNPM() {
  document.title = "Báo cáo – TNPM";
  const [activeTab, setActiveTab] = useState("financial");
  const [dateRange, setDateRange] = useState({ from: "2024-01-01", to: "2024-04-30" });

  const totalRevenue = MOCK_INVOICES.filter(i => i.status === "paid").reduce((a, i) => a + i.paidAmount, 0);
  const totalOutstanding = MOCK_INVOICES.filter(i => i.status !== "paid").reduce((a, i) => a + (i.totalAmount - i.paidAmount), 0);

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Báo cáo Tổng hợp</h1>
          <p className="page-sub">TNPM Portfolio Report – Tài chính | Lấp đầy | Vận hành | NCC</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="date" className="form-control" style={{ width: 150 }} value={dateRange.from} onChange={(e) => setDateRange(d => ({ ...d, from: e.target.value }))} />
          <span style={{ color: "#8c8c8c" }}>→</span>
          <input type="date" className="form-control" style={{ width: 150 }} value={dateRange.to} onChange={(e) => setDateRange(d => ({ ...d, to: e.target.value }))} />
          <button className="btn btn-outline">📤 Xuất Excel</button>
          <button className="btn btn-outline">📄 Xuất PDF</button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { icon: "🏢", label: "Dự án", value: MOCK_PROJECTS.length, color: "#1890ff" },
          { icon: "📊", label: "Lấp đầy TB", value: `${MOCK_DASHBOARD_STATS.occupancyRate}%`, color: "#52c41a" },
          { icon: "💰", label: "Thu tháng", value: fmtMoney(MOCK_DASHBOARD_STATS.totalRevenue_thisMonth), color: "#722ed1" },
          { icon: "📈", label: "Tăng trưởng", value: `+${MOCK_DASHBOARD_STATS.revenueGrowth}%`, color: "#13c2c2" },
          { icon: "⚠️", label: "Công nợ", value: fmtMoney(MOCK_DASHBOARD_STATS.overdueAmount), color: "#ff4d4f" },
          { icon: "🔧", label: "SR hoàn thành", value: "95%", color: "#fa8c16" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderTop: `4px solid ${s.color}`, textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 16px" }}>
        {REPORT_TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14,
              fontWeight: activeTab === t.key ? 600 : 400, color: activeTab === t.key ? "#1890ff" : "#8c8c8c",
              borderBottom: activeTab === t.key ? "2px solid #1890ff" : "2px solid transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>

        {/* FINANCIAL */}
        {activeTab === "financial" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              {/* Revenue Chart */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#1a1a2e" }}>📈 Doanh thu 6 tháng</h3>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 140, paddingBottom: 8 }}>
                  {MOCK_REVENUE_CHART.map((d, i) => {
                    const max = Math.max(...MOCK_REVENUE_CHART.map(x => x.revenue));
                    const h = (d.revenue / max) * 100;
                    const ht = (d.target / max) * 100;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 100, width: "100%", justifyContent: "center" }}>
                          <div style={{ width: 14, borderRadius: "3px 3px 0 0", height: `${ht}%`, background: "#d9d9d9" }} />
                          <div style={{ width: 14, borderRadius: "3px 3px 0 0", height: `${h}%`, background: "#1890ff" }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#8c8c8c" }}>{d.month}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 11, marginTop: 8 }}>
                  <span style={{ color: "#1890ff" }}>■ Thực tế</span>
                  <span style={{ color: "#8c8c8c" }}>■ Mục tiêu</span>
                </div>
              </div>

              {/* Revenue by project */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#1a1a2e" }}>🏢 Doanh thu theo dự án</h3>
                {MOCK_PROJECTS.map((p) => {
                  const rev = MOCK_INVOICES.filter(i => i.projectId === p.id && i.status === "paid").reduce((a, i) => a + i.paidAmount, 0);
                  const maxRev = 230000000;
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 120, fontSize: 12, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((rev / maxRev) * 100, 100)}%`, background: "#1890ff", borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, minWidth: 70, textAlign: "right" }}>{fmtMoney(rev)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoice breakdown */}
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#1a1a2e" }}>💳 Chi tiết hóa đơn</h3>
            <table className="data-table">
              <thead>
                <tr><th>Mã HĐ</th><th>Khách hàng</th><th>Kỳ</th><th>Tổng tiền</th><th>Đã TT</th><th>Còn lại</th><th>Trạng thái</th></tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id}>
                    <td><span className="code-text">{inv.code}</span></td>
                    <td>{inv.customerName}</td>
                    <td>{inv.period}</td>
                    <td className="amount-text">{fmtMoney(inv.totalAmount)}</td>
                    <td className="amount-text" style={{ color: "#52c41a" }}>{fmtMoney(inv.paidAmount)}</td>
                    <td className="amount-text" style={{ color: inv.totalAmount - inv.paidAmount > 0 ? "#ff4d4f" : "#52c41a" }}>{fmtMoney(inv.totalAmount - inv.paidAmount)}</td>
                    <td><span className="status-badge" style={{ background: `${STATUS_COLORS[inv.status]}22`, color: STATUS_COLORS[inv.status] }}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f0f7ff", fontWeight: 700 }}>
                  <td colSpan={3} style={{ padding: "12px 14px" }}>TỔNG CỘNG</td>
                  <td style={{ padding: "12px 14px" }} className="amount-text">{fmtMoney(MOCK_INVOICES.reduce((a, i) => a + i.totalAmount, 0))}</td>
                  <td style={{ padding: "12px 14px" }} className="amount-text">{fmtMoney(totalRevenue)}</td>
                  <td style={{ padding: "12px 14px" }} className="amount-text" style={{ color: "#ff4d4f" }}>{fmtMoney(totalOutstanding)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* OCCUPANCY */}
        {activeTab === "occupancy" && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>📊 Tỷ lệ lấp đầy theo dự án</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {MOCK_PROJECTS.map((p) => (
                <div key={p.id} style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#8c8c8c" }}>{p.typeName} | {p.location}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: p.occupancyRate >= 85 ? "#52c41a" : "#faad14" }}>{p.occupancyRate}%</div>
                      <div style={{ fontSize: 11, color: "#8c8c8c" }}>Lấp đầy</div>
                    </div>
                  </div>
                  <div style={{ height: 10, background: "#f0f0f0", borderRadius: 5, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ height: "100%", width: `${p.occupancyRate}%`, background: p.occupancyRate >= 85 ? "#52c41a" : "#faad14", borderRadius: 5 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#595959" }}>
                    <span>Đang thuê: <b>{p.occupiedUnits}</b></span>
                    <span>Trống: <b>{p.totalUnits - p.occupiedUnits}</b></span>
                    <span>Tổng: <b>{p.totalUnits} units</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPERATIONS */}
        {activeTab === "operations" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🔧 Yêu cầu dịch vụ theo tuần</h3>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 140 }}>
                  {MOCK_SR_CHART.map((d, i) => {
                    const max = Math.max(...MOCK_SR_CHART.map(x => x.total));
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 100, width: "100%", justifyContent: "center" }}>
                          <div style={{ width: 14, borderRadius: "3px 3px 0 0", height: `${(d.resolved / max) * 100}%`, background: "#52c41a" }} title={`Đã xử lý: ${d.resolved}`} />
                          <div style={{ width: 14, borderRadius: "3px 3px 0 0", height: `${(d.pending / max) * 100}%`, background: "#faad14" }} title={`Đang chờ: ${d.pending}`} />
                        </div>
                        <div style={{ fontSize: 9, color: "#8c8c8c" }}>{d.week}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 11, marginTop: 8 }}>
                  <span style={{ color: "#52c41a" }}>■ Đã xử lý</span>
                  <span style={{ color: "#faad14" }}>■ Chờ xử lý</span>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📋 SR theo danh mục</h3>
                {[
                  { name: "Bảo trì kỹ thuật", count: 2, color: "#1890ff" },
                  { name: "Thang máy", count: 1, color: "#722ed1" },
                  { name: "An ninh", count: 1, color: "#ff4d4f" },
                  { name: "Điện", count: 1, color: "#faad14" },
                  { name: "Nước / Ống nước", count: 1, color: "#13c2c2" },
                ].map((cat, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13 }}>{cat.name}</div>
                    <div style={{ width: 80, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(cat.count / 6) * 100}%`, background: cat.color, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, minWidth: 24, textAlign: "right" }}>{cat.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPI */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🎯 KPI Vận hành</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { label: "Xử lý SR trong 24h", target: "95%", actual: "91%", ok: false },
                  { label: "SLA NCC met", target: "95%", actual: "96%", ok: true },
                  { label: "Hoàn thành SR", target: "90%", actual: "93%", ok: true },
                  { label: "Uptime platform", target: "99.5%", actual: "99.8%", ok: true },
                  { label: "Tỷ lệ TT đúng hạn", target: "85%", actual: "78%", ok: false },
                  { label: "Giảm công thủ công", target: "60%", actual: "55%", ok: false },
                ].map((kpi, i) => (
                  <div key={i} style={{ background: kpi.ok ? "#f6ffed" : "#fff2f0", borderRadius: 10, padding: 16, border: `1px solid ${kpi.ok ? "#d9f7be" : "#ffccc7"}` }}>
                    <div style={{ fontSize: 13, color: "#595959", marginBottom: 8 }}>{kpi.label}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: kpi.ok ? "#52c41a" : "#ff4d4f" }}>{kpi.actual}</div>
                        <div style={{ fontSize: 11, color: "#8c8c8c" }}>Mục tiêu: {kpi.target}</div>
                      </div>
                      <div style={{ fontSize: 24 }}>{kpi.ok ? "✅" : "⚠️"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VENDOR */}
        {activeTab === "vendor" && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🏭 Hiệu suất Nhà cung cấp</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>NCC</th>
                  <th>Loại DV</th>
                  <th>Rating</th>
                  <th>SLA Met (%)</th>
                  <th>Số HĐ</th>
                  <th>Tổng giá trị HĐ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "KT Việt", type: "Bảo trì tổng hợp", rating: 4.5, sla: 96, contracts: 8, value: 360000000, status: "active" },
                  { name: "Sạch Đẹp", type: "Vệ sinh", rating: 4.2, sla: 94, contracts: 12, value: 220000000, status: "active" },
                  { name: "BV 24/7", type: "An ninh", rating: 4.0, sla: 98, contracts: 6, value: 420000000, status: "active" },
                  { name: "Otis VN", type: "Thang máy", rating: 4.8, sla: 99, contracts: 15, value: 180000000, status: "active" },
                  { name: "PCCC HN", type: "PCCC", rating: 3.2, sla: 78, contracts: 3, value: 45000000, status: "suspended" },
                ].map((v, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{v.name}</td>
                    <td style={{ fontSize: 12 }}>{v.type}</td>
                    <td>
                      <span style={{ color: v.rating >= 4.5 ? "#52c41a" : v.rating >= 4 ? "#faad14" : "#ff4d4f", fontWeight: 700 }}>
                        ★ {v.rating}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: v.sla >= 95 ? "#52c41a" : v.sla >= 85 ? "#faad14" : "#ff4d4f", fontWeight: 600 }}>
                        {v.sla}%
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>{v.contracts}</td>
                    <td className="amount-text">{fmtMoney(v.value)}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${STATUS_COLORS[v.status]}22`, color: STATUS_COLORS[v.status] }}>
                        {v.status === "active" ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
