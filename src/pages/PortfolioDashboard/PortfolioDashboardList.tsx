import React, { useState, useMemo } from "react";
import {
  MOCK_PROJECT_FINANCIALS, MOCK_PORTFOLIO_REVENUE_CHART,
  MOCK_PROJECTS, PROJECT_TYPE_OPTIONS,
} from "assets/mock/TNPMData";
import { PageHeader, KpiRow, ModalShell, StatusBadge, fmtMoney } from "components/tnpm";

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  healthy: { label: "Lành mạnh", color: "#52c41a", icon: "✅" },
  warning: { label: "Cần lưu ý", color: "#faad14", icon: "⚠️" },
  critical: { label: "Nguy cơ", color: "#ff4d4f", icon: "🔴" },
};

// ─── Project Report Modal (for "Gửi báo cáo CĐT") ────────────────────────
function ReportModal({ project, onClose }: any) {
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [recipients, setRecipients] = useState(project.ownerContact || "");
  const [note, setNote] = useState("");

  const handleSend = () => {
    alert(`📨 Đã gửi báo cáo ${format.toUpperCase()} (${period === "monthly" ? "tháng" : "quý"}) cho ${project.owner} qua email: ${recipients}`);
    onClose();
  };

  return (
    <ModalShell
      title="📨 Gửi báo cáo cho Chủ đầu tư"
      onClose={onClose}
      maxWidth={560}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={handleSend}>📨 Gửi báo cáo</button>
      </>}
    >
          <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{project.projectName}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>Chủ đầu tư: <strong>{project.owner}</strong></div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>Liên hệ: {project.ownerContact}</div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Kỳ báo cáo</label>
              <select className="form-control" value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="monthly">Tháng hiện tại</option>
                <option value="quarterly">Quý hiện tại</option>
                <option value="ytd">Lũy kế từ đầu năm</option>
              </select>
            </div>
            <div className="form-group">
              <label>Định dạng</label>
              <select className="form-control" value={format} onChange={(e) => setFormat(e.target.value as any)}>
                <option value="pdf">PDF (khuyến nghị)</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Email người nhận</label>
              <input className="form-control" value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="email1@x.com, email2@y.com" />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Nội dung email</label>
              <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Kính gửi quý chủ đầu tư, TNPM xin gửi báo cáo vận hành..." />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>
                <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} />
                {" "}Bao gồm biểu đồ doanh thu 6 tháng gần nhất
              </label>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 12, background: "#e6f7ff", borderRadius: 6, fontSize: 12 }}>
            📎 Báo cáo sẽ bao gồm: P&L tháng, doanh thu chi tiết, công nợ, tỷ lệ lấp đầy, danh sách SR & maintenance đã thực hiện.
          </div>
    </ModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function PortfolioDashboardList() {
  document.title = "Dashboard Portfolio – TNPM";

  const [filterType, setFilterType] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [reportTarget, setReportTarget] = useState<any>(null);

  const filtered = useMemo(() => {
    return MOCK_PROJECT_FINANCIALS.filter((p: any) => {
      if (filterType && p.projectType !== filterType) return false;
      if (filterOwner && !p.owner.toLowerCase().includes(filterOwner.toLowerCase())) return false;
      return true;
    });
  }, [filterType, filterOwner]);

  // Portfolio-level KPIs
  const totalRevenue = filtered.reduce((a: number, p: any) => a + p.monthlyRevenue, 0);
  const totalCost = filtered.reduce((a: number, p: any) => a + p.monthlyOperatingCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalReceivable = filtered.reduce((a: number, p: any) => a + p.outstandingReceivable, 0);
  const totalUnits = filtered.reduce((a: number, p: any) => a + p.totalUnits, 0);
  const occupiedUnits = filtered.reduce((a: number, p: any) => a + p.occupiedUnits, 0);
  const avgOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits * 100) : 0;

  // Chart max for scaling
  const chartMax = useMemo(() => {
    let max = 0;
    MOCK_PORTFOLIO_REVENUE_CHART.forEach((m: any) => {
      Object.values(m.projects).forEach((v: any) => { if (v > max) max = v; });
    });
    return max;
  }, []);

  // Unique owners for filter
  const owners = useMemo(() => {
    const set = new Set<string>();
    MOCK_PROJECT_FINANCIALS.forEach((p: any) => set.add(p.owner));
    return Array.from(set);
  }, []);

  const projectColors: Record<number, string> = {
    1: "#1890ff", 2: "#722ed1", 3: "#faad14", 4: "#ff4d4f", 5: "#52c41a", 6: "#13c2c2",
  };

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="🌐 Dashboard Portfolio"
        subtitle="Tổng quan tài chính & vận hành tất cả dự án — dành cho TNPM leadership và báo cáo Chủ đầu tư"
        actions={<>
          <button className="btn btn-outline">📊 Xuất báo cáo tổng</button>
          <button className="btn btn-primary" onClick={() => alert("Gửi email hàng loạt cho tất cả CĐT (coming soon)")}>📨 Gửi báo cáo hàng loạt</button>
        </>}
      />

      <KpiRow columns={6} items={[
        { label: "Dự án đang vận hành", value: `${filtered.length}`, sub: `${owners.length} chủ đầu tư`, color: "#1890ff", icon: "🏢" },
        { label: "DT tháng 04/2024", value: fmtMoney(totalRevenue), sub: "Tổng portfolio", color: "#52c41a", icon: "💰" },
        { label: "Chi phí tháng", value: fmtMoney(totalCost), sub: "Vendor + NV + utilities", color: "#faad14", icon: "💸" },
        { label: "Lợi nhuận tháng", value: fmtMoney(totalProfit), sub: `Margin ${(totalProfit / totalRevenue * 100).toFixed(1)}%`, color: totalProfit > 0 ? "#722ed1" : "#ff4d4f", icon: "📈" },
        { label: "Công nợ phải thu", value: fmtMoney(totalReceivable), sub: "Toàn portfolio", color: "#ff4d4f", icon: "⚠️" },
        { label: "Tỷ lệ lấp đầy TB", value: `${avgOccupancy.toFixed(1)}%`, sub: `${occupiedUnits}/${totalUnits} unit`, color: "#13c2c2", icon: "🏠" },
      ]} />

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tất cả loại BĐS</option>
          <option value="residential">Chung cư/Dân cư</option>
          <option value="office">Văn phòng</option>
          <option value="industrial">KCN</option>
          <option value="retail">TTTM</option>
          <option value="villa">Nhà thấp tầng</option>
          <option value="government">Hành chính công</option>
        </select>
        <select className="filter-select" value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
          <option value="">Tất cả chủ đầu tư</option>
          {owners.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Revenue trend chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
        <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 15 }}>📈 Doanh thu 6 tháng gần nhất (theo dự án)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 220, paddingTop: 20, borderBottom: "2px solid #f0f0f0" }}>
          {MOCK_PORTFOLIO_REVENUE_CHART.map((m: any) => (
            <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 180 }}>
                {filtered.map((p: any) => {
                  const val = m.projects[p.projectId] || 0;
                  const h = (val / chartMax) * 180;
                  return (
                    <div
                      key={p.projectId}
                      title={`${p.projectName}: ${fmtMoney(val)}`}
                      style={{
                        width: 14, height: h,
                        background: projectColors[p.projectId] || "#1890ff",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.3s",
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 6 }}>{m.month}</div>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 16, justifyContent: "center" }}>
          {filtered.map((p: any) => (
            <div key={p.projectId} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <div style={{ width: 12, height: 12, background: projectColors[p.projectId] || "#1890ff", borderRadius: 2 }} />
              <span>{p.projectName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* P&L table */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", fontWeight: 600, fontSize: 15, borderBottom: "1px solid #f0f0f0" }}>
          📋 P&L theo dự án — Tháng 04/2024
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Dự án</th>
              <th>Loại</th>
              <th>Chủ đầu tư</th>
              <th>DT tháng</th>
              <th>Chi phí</th>
              <th>Lợi nhuận</th>
              <th>Margin</th>
              <th>Công nợ</th>
              <th>Lấp đầy</th>
              <th>Tình trạng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có dự án nào phù hợp filter.</td></tr>
            )}
            {filtered.map((p: any) => {
              const margin = p.monthlyRevenue > 0 ? (p.monthlyProfit / p.monthlyRevenue * 100) : 0;
              const statusMeta = STATUS_META[p.status] || STATUS_META.healthy;
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 4, height: 32, background: projectColors[p.projectId] || "#1890ff", borderRadius: 2 }} />
                      <div>
                        <div>{p.projectName}</div>
                        <div style={{ fontSize: 11, color: "#8c8c8c", fontWeight: 400 }}>YTD: {fmtMoney(p.ytdRevenue)} / {fmtMoney(p.ytdProfit)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {PROJECT_TYPE_OPTIONS.find((t: any) => t.value === p.projectType)?.label || p.projectType}
                  </td>
                  <td style={{ fontSize: 12 }}>{p.owner}</td>
                  <td className="amount-text">{fmtMoney(p.monthlyRevenue)}</td>
                  <td className="amount-text" style={{ color: "#faad14" }}>{fmtMoney(p.monthlyOperatingCost)}</td>
                  <td className="amount-text" style={{ color: p.monthlyProfit > 0 ? "#52c41a" : "#ff4d4f", fontWeight: 600 }}>
                    {fmtMoney(p.monthlyProfit)}
                  </td>
                  <td style={{ textAlign: "right", fontSize: 12, fontWeight: 600, color: margin > 30 ? "#52c41a" : margin > 10 ? "#faad14" : "#ff4d4f" }}>
                    {margin.toFixed(1)}%
                  </td>
                  <td className="amount-text" style={{ color: p.outstandingReceivable > 0 ? "#ff4d4f" : "#8c8c8c" }}>
                    {p.outstandingReceivable > 0 ? fmtMoney(p.outstandingReceivable) : "—"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: p.occupancyRate >= 90 ? "#52c41a" : p.occupancyRate >= 80 ? "#faad14" : "#ff4d4f" }}>
                      {p.occupancyRate}%
                    </div>
                    <div style={{ fontSize: 10, color: "#8c8c8c" }}>{p.occupiedUnits}/{p.totalUnits}</div>
                  </td>
                  <td>
                    <StatusBadge label={statusMeta.label} color={statusMeta.color} icon={statusMeta.icon} />
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setReportTarget(p)}>
                      📨 Gửi báo cáo
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary row */}
        <div style={{ padding: "14px 20px", background: "#f0f7ff", borderTop: "2px solid #bfdbfe", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>Tổng DT</div>
            <div style={{ fontWeight: 700, color: "#1890ff" }}>{fmtMoney(totalRevenue)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>Tổng chi phí</div>
            <div style={{ fontWeight: 700, color: "#faad14" }}>{fmtMoney(totalCost)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>Tổng LN</div>
            <div style={{ fontWeight: 700, color: totalProfit > 0 ? "#52c41a" : "#ff4d4f" }}>{fmtMoney(totalProfit)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>Margin TB</div>
            <div style={{ fontWeight: 700, color: "#722ed1" }}>{totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0}%</div>
          </div>
        </div>
      </div>

      {reportTarget && <ReportModal project={reportTarget} onClose={() => setReportTarget(null)} />}
    </div>
  );
}
