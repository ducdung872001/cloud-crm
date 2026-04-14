import React, { useState, useMemo } from "react";
import {
  MOCK_PROJECT_FINANCIALS, MOCK_PORTFOLIO_REVENUE_CHART,
  MOCK_VENDOR_CONTRACTS, MOCK_SERVICE_REQUESTS, MOCK_INVOICES,
  MOCK_DEBTS, MOCK_PROJECTS,
} from "assets/mock/TNPMData";
import { StatusBadge, fmtMoney } from "components/tnpm";

// Map each owner to the projects they own
const OWNER_LIST = [
  { id: "phatloc", name: "BĐS Phát Lộc", contactName: "Trần Thị Thanh Hương", contactTitle: "Phó TGĐ", email: "huong.tran@phatloc.vn" },
  { id: "roxkey", name: "ROX Key Holdings", contactName: "Ngô Quang Anh", contactTitle: "Giám đốc Khối Vận hành", email: "quanganh.ngo@roxkey.vn" },
  { id: "vinhomes", name: "Vinhomes JSC", contactName: "Mr. Hoàng", contactTitle: "Director", email: "mr.hoang@vinhomes.vn" },
  { id: "aeon", name: "AEON Vietnam", contactName: "Director", contactTitle: "CEO", email: "director@aeon.vn" },
  { id: "ubnd", name: "UBND TP Hà Nội", contactName: "Admin HC", contactTitle: "Trưởng phòng", email: "hcbadinh@hanoi.gov.vn" },
];

export default function OwnerDashboard() {
  document.title = "Dashboard Chủ đầu tư – TNPM";

  // Simulate "logged in as" an owner
  const [currentOwner, setCurrentOwner] = useState(OWNER_LIST[0]);

  // Projects owned by current owner (match by owner name)
  const myProjects = useMemo(() => {
    return MOCK_PROJECT_FINANCIALS.filter((p: any) => p.owner === currentOwner.name);
  }, [currentOwner]);

  const myProjectIds = myProjects.map((p: any) => p.projectId);

  // Filter ALL data by owner's project scope
  const myVendorContracts = MOCK_VENDOR_CONTRACTS.filter((c: any) => myProjectIds.includes(c.projectId));
  const myActiveVendorContracts = myVendorContracts.filter((c: any) => c.status === "active");
  const mySRs = MOCK_SERVICE_REQUESTS.filter((sr: any) => myProjectIds.includes(sr.projectId));
  const mySROpen = mySRs.filter((sr: any) => sr.status !== "resolved" && sr.status !== "closed").length;
  const myInvoices = MOCK_INVOICES.filter((inv: any) => myProjectIds.includes(inv.projectId));
  const myDebts = MOCK_DEBTS.filter((d: any) => myProjectIds.includes(d.projectId));
  const myTotalDebt = myDebts.filter((d: any) => d.kind === "receivable" && d.status !== "paid").reduce((a: number, d: any) => a + d.amount, 0);

  // Aggregated KPI
  const totalRevenue = myProjects.reduce((a: number, p: any) => a + p.monthlyRevenue, 0);
  const totalCost = myProjects.reduce((a: number, p: any) => a + p.monthlyOperatingCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const ytdRevenue = myProjects.reduce((a: number, p: any) => a + p.ytdRevenue, 0);
  const ytdProfit = myProjects.reduce((a: number, p: any) => a + p.ytdProfit, 0);
  const totalUnits = myProjects.reduce((a: number, p: any) => a + p.totalUnits, 0);
  const occupiedUnits = myProjects.reduce((a: number, p: any) => a + p.occupiedUnits, 0);
  const avgOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits * 100) : 0;

  // Chart for only owner's projects
  const myChart = MOCK_PORTFOLIO_REVENUE_CHART.map((m: any) => ({
    month: m.month,
    value: myProjectIds.reduce((sum: number, pid: number) => sum + (m.projects[pid] || 0), 0),
  }));
  const chartMax = Math.max(...myChart.map((c: any) => c.value), 1);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Preview banner */}
      <div style={{ padding: "10px 20px", background: "#fff1f0", borderBottom: "1px solid #ffccc7", fontSize: 12, textAlign: "center" }}>
        🔶 <strong>PREVIEW MODE — Owner Dashboard</strong>: Góc nhìn Chủ đầu tư, chỉ thấy các dự án của mình (row-level security). Thực tế chạy trên domain riêng <code>owner.tnpm.vn</code> với SSO riêng cho CĐT.
        <select style={{ marginLeft: 14, padding: "3px 8px", fontSize: 12 }} value={currentOwner.id} onChange={(e) => {
          const o = OWNER_LIST.find((x) => x.id === e.target.value);
          if (o) setCurrentOwner(o);
        }}>
          {OWNER_LIST.map((o) => <option key={o.id} value={o.id}>👤 Đăng nhập với: {o.name}</option>)}
        </select>
      </div>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #52c41a 0%, #1890ff 100%)", color: "#fff", padding: "20px 30px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>TNPM Owner Portal</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>🏢 {currentOwner.name}</div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
              {currentOwner.contactName} · {currentOwner.contactTitle} · Sở hữu {myProjects.length} dự án
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline" style={{ background: "#fff", border: "none" }}>📊 Tải báo cáo tháng</button>
            <button className="btn btn-outline" style={{ background: "#fff", border: "none" }}>💬 Liên hệ TNPM</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        {myProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, background: "#fff", borderRadius: 12, color: "#8c8c8c" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Bạn chưa có dự án nào do TNPM quản lý</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Vui lòng liên hệ TNPM để được tư vấn.</div>
          </div>
        ) : (
          <>
            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Dự án", value: `${myProjects.length}`, sub: `${totalUnits} unit`, color: "#1890ff", icon: "🏢" },
                { label: "DT tháng 04", value: fmtMoney(totalRevenue), sub: `YTD: ${fmtMoney(ytdRevenue)}`, color: "#52c41a", icon: "💰" },
                { label: "Lợi nhuận", value: fmtMoney(totalProfit), sub: `Margin ${(totalProfit / totalRevenue * 100).toFixed(1)}%`, color: totalProfit > 0 ? "#722ed1" : "#ff4d4f", icon: "📈" },
                { label: "Tỷ lệ lấp đầy", value: `${avgOccupancy.toFixed(1)}%`, sub: `${occupiedUnits}/${totalUnits}`, color: "#13c2c2", icon: "🏠" },
                { label: "SR đang mở", value: `${mySROpen}`, sub: `${mySRs.length} tổng`, color: "#faad14", icon: "🔧" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 15 }}>📈 Doanh thu 6 tháng gần nhất (tổng tất cả dự án của bạn)</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 200, paddingTop: 20, borderBottom: "2px solid #f0f0f0" }}>
                {myChart.map((m: any) => {
                  const h = (m.value / chartMax) * 160;
                  return (
                    <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: "#8c8c8c", marginBottom: 4 }}>{fmtMoney(m.value)}</div>
                      <div style={{
                        width: "70%", height: h,
                        background: "linear-gradient(180deg, #52c41a 0%, #1890ff 100%)",
                        borderRadius: "4px 4px 0 0",
                      }} />
                      <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 6 }}>{m.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Projects detail */}
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "14px 20px", fontWeight: 600, fontSize: 15, borderBottom: "1px solid #f0f0f0" }}>
                📋 P&L từng dự án của bạn
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dự án</th>
                    <th>Loại</th>
                    <th>DT tháng</th>
                    <th>Chi phí</th>
                    <th>Lợi nhuận</th>
                    <th>YTD Lợi nhuận</th>
                    <th>Lấp đầy</th>
                    <th>Công nợ</th>
                    <th>Tình trạng</th>
                  </tr>
                </thead>
                <tbody>
                  {myProjects.map((p: any) => {
                    const projMeta = MOCK_PROJECTS.find((x: any) => x.id === p.projectId);
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.projectName}</td>
                        <td style={{ fontSize: 12 }}>{projMeta?.typeName || p.projectType}</td>
                        <td className="amount-text">{fmtMoney(p.monthlyRevenue)}</td>
                        <td className="amount-text" style={{ color: "#faad14" }}>{fmtMoney(p.monthlyOperatingCost)}</td>
                        <td className="amount-text" style={{ color: p.monthlyProfit > 0 ? "#52c41a" : "#ff4d4f", fontWeight: 600 }}>
                          {fmtMoney(p.monthlyProfit)}
                        </td>
                        <td className="amount-text" style={{ color: p.ytdProfit > 0 ? "#52c41a" : "#ff4d4f" }}>
                          {fmtMoney(p.ytdProfit)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ fontWeight: 600 }}>{p.occupancyRate}%</div>
                          <div style={{ fontSize: 10, color: "#8c8c8c" }}>{p.occupiedUnits}/{p.totalUnits}</div>
                        </td>
                        <td className="amount-text" style={{ color: p.outstandingReceivable > 0 ? "#ff4d4f" : "#8c8c8c" }}>
                          {p.outstandingReceivable > 0 ? fmtMoney(p.outstandingReceivable) : "—"}
                        </td>
                        <td>
                          <StatusBadge
                            label={p.status === "healthy" ? "✅ Tốt" : p.status === "warning" ? "⚠️ Cần lưu ý" : "🔴 Nguy cơ"}
                            color={p.status === "healthy" ? "#52c41a" : p.status === "warning" ? "#faad14" : "#ff4d4f"}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Two-column: operations summary + debt summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>🔧 Vận hành dự án của bạn</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ padding: 10, background: "#f5f7fa", borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>Service Requests</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{mySRs.length}</div>
                    <div style={{ fontSize: 11, color: "#faad14" }}>{mySROpen} đang mở</div>
                  </div>
                  <div style={{ padding: 10, background: "#f5f7fa", borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>HĐ NCC active</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{myActiveVendorContracts.length}</div>
                    <div style={{ fontSize: 11, color: "#595959" }}>{fmtMoney(myActiveVendorContracts.reduce((a: number, c: any) => a + (c.value || 0), 0))}</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: 10, background: "#fffbe6", borderRadius: 6, fontSize: 12 }}>
                  💡 Dashboard này chỉ hiển thị dữ liệu thuộc dự án của <strong>{currentOwner.name}</strong>.
                  Row-level security đảm bảo bạn không thể truy cập dữ liệu dự án không thuộc sở hữu.
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>⚠️ Công nợ phải thu</div>
                {myTotalDebt === 0 ? (
                  <div style={{ textAlign: "center", padding: 20, color: "#52c41a" }}>
                    ✅ Không có công nợ quá hạn
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#ff4d4f", marginBottom: 4 }}>{fmtMoney(myTotalDebt)}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>
                      {myDebts.filter((d: any) => d.kind === "receivable" && d.status !== "paid").length} khoản đang đòi
                    </div>
                    <div style={{ marginTop: 14 }}>
                      {myDebts.filter((d: any) => d.kind === "receivable" && d.status !== "paid").slice(0, 3).map((d: any) => (
                        <div key={d.id} style={{ padding: 10, background: d.status === "overdue" ? "#fff1f0" : "#fff7e6", borderRadius: 6, marginBottom: 6, fontSize: 12 }}>
                          <div style={{ fontWeight: 600 }}>{d.counterpartyName}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                            <span style={{ color: "#8c8c8c" }}>{d.refCode}</span>
                            <span style={{ color: "#ff4d4f", fontWeight: 600 }}>{fmtMoney(d.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 16, background: "#fff", borderRadius: 12, textAlign: "center", fontSize: 12, color: "#8c8c8c" }}>
              📌 Báo cáo được cập nhật tự động. Liên hệ TNPM (1900-xxxx) nếu cần thông tin chi tiết hoặc điều chỉnh.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
