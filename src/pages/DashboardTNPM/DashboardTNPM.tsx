import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_REVENUE_CHART,
  MOCK_PROJECTS,
  MOCK_INVOICES,
  MOCK_SERVICE_REQUESTS,
  MOCK_VENDOR_INVOICES,
  MOCK_MAINTENANCE_PLANS,
  MOCK_METER_READINGS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)} tỷ` :
  n >= 1e6 ? `${(n / 1e6).toFixed(0)} tr đ` :
  `${(n || 0).toLocaleString("vi-VN")} đ`;

function KpiCard({ icon, label, value, sub, color, onClick }: any) {
  return (
    <div onClick={onClick}
      style={{
        background: "#fff", borderRadius: 14, padding: "20px 22px",
        boxShadow: "0 2px 12px rgba(0,0,0,.07)", borderTop: `4px solid ${color}`,
        cursor: onClick ? "pointer" : "default", transition: "box-shadow .2s",
        display: "flex", flexDirection: "column", gap: 6,
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,.13)")}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.07)")}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#595959", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style }: any) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,.07)", ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, href, navigate }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{title}</h3>
      {href && (
        <button onClick={() => navigate(href)}
          style={{ border: "none", background: "none", color: "#1890ff", fontSize: 12, cursor: "pointer" }}>
          Xem tất cả →
        </button>
      )}
    </div>
  );
}

export default function DashboardTNPM() {
  const navigate = useNavigate();
  document.title = "Dashboard – TNPM Property Management";

  const s = MOCK_DASHBOARD_STATS;
  const now = new Date();
  const periodLabel = `Tháng ${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

  const overdueInvoices = MOCK_INVOICES.filter((i) => i.status === "overdue" || i.status === "pending");
  const pendingSR = MOCK_SERVICE_REQUESTS.filter((r) => r.status === "pending" || r.status === "in_progress");
  const urgentSR = MOCK_SERVICE_REQUESTS.filter((r) => r.priority === "urgent");
  const pendingVendorInvoices = MOCK_VENDOR_INVOICES.filter((i) => i.approvalStatus === "pending");
  const upcomingMaint = MOCK_MAINTENANCE_PLANS.filter((m) => m.status === "scheduled").slice(0, 3);
  const meterAll = (MOCK_METER_READINGS || []).filter((r: any) => r.period === "2024-04");
  const meterDone = meterAll.filter((r: any) => r.status !== "pending");
  const meterPct = meterAll.length ? Math.round((meterDone.length / meterAll.length) * 100) : 0;
  const totalOverdue = overdueInvoices.reduce((a, i) => a + (i.totalAmount - i.paidAmount), 0);
  const growthPct = ((s.totalRevenue_thisMonth - s.totalRevenue_lastMonth) / s.totalRevenue_lastMonth * 100);
  const maxRev = Math.max(...MOCK_REVENUE_CHART.map((d) => Math.max(d.revenue, d.target)));

  return (
    <div style={{ padding: 24, background: "#f5f6fa", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>🏙️ TNPM Dashboard</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8c8c8c" }}>Tổng quan vận hành Bất động sản — {periodLabel}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/meter-readings")}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #1890ff", background: "#e6f7ff", color: "#1890ff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            📋 Nhập chỉ số tháng{meterAll.length - meterDone.length > 0 && ` (${meterAll.length - meterDone.length} chờ)`}
          </button>
          <button onClick={() => navigate("/reports")}
            style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#1890ff", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            📊 Báo cáo
          </button>
        </div>
      </div>

      {/* ROW 1 - KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 20 }}>
        <KpiCard icon="🏢" label="Dự án vận hành" value={s.totalProjects} color="#1890ff" onClick={() => navigate("/projects")} />
        <KpiCard icon="📊" label="Tỷ lệ lấp đầy" value={`${s.occupancyRate}%`} sub={`${s.occupiedUnits}/${s.totalUnits} units`} color={s.occupancyRate >= 85 ? "#52c41a" : "#faad14"} onClick={() => navigate("/projects")} />
        <KpiCard icon="💰" label="Doanh thu tháng" value={fmtMoney(s.totalRevenue_thisMonth)} sub={`${growthPct >= 0 ? "▲" : "▼"} ${Math.abs(growthPct).toFixed(1)}% vs tháng trước`} color="#722ed1" onClick={() => navigate("/billing")} />
        <KpiCard icon="⚠️" label="Công nợ quá hạn" value={fmtMoney(totalOverdue)} sub={`${overdueInvoices.length} hóa đơn`} color="#ff4d4f" onClick={() => navigate("/billing")} />
        <KpiCard icon="🔧" label="SR đang xử lý" value={pendingSR.length} sub={urgentSR.length > 0 ? `⚡ ${urgentSR.length} khẩn cấp` : "Không khẩn cấp"} color={urgentSR.length > 0 ? "#ff4d4f" : "#fa8c16"} onClick={() => navigate("/service-requests")} />
        <KpiCard icon="🧾" label="HĐ NCC chờ duyệt" value={pendingVendorInvoices.length} sub="Cần 3-Way Match" color={pendingVendorInvoices.length > 0 ? "#faad14" : "#52c41a"} onClick={() => navigate("/vendor-invoices")} />
      </div>

      {/* ROW 2 - Chart + Occupancy */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <SectionHeader title="📈 Doanh thu 6 tháng gần nhất" href="/reports" navigate={navigate} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, paddingBottom: 4 }}>
            {MOCK_REVENUE_CHART.map((d, i) => {
              const rH = Math.round((d.revenue / maxRev) * 118);
              const tH = Math.round((d.target / maxRev) * 118);
              const over = d.revenue >= d.target;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, height: 120 }}>
                    <div style={{ width: "40%", height: tH, background: "#d6e4ff", borderRadius: "3px 3px 0 0" }} title={`Mục tiêu: ${fmtMoney(d.target)}`} />
                    <div style={{ width: "40%", height: rH, background: over ? "#52c41a" : "#1890ff", borderRadius: "3px 3px 0 0" }} title={`Thực tế: ${fmtMoney(d.revenue)}`} />
                  </div>
                  <div style={{ fontSize: 9, color: "#8c8c8c", textAlign: "center" }}>{d.month}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: over ? "#52c41a" : "#1890ff" }}>{(d.revenue / 1e6).toFixed(0)}tr</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 11 }}>
            <span style={{ color: "#8c8c8c" }}>■ Mục tiêu</span>
            <span style={{ color: "#1890ff" }}>■ Thực tế</span>
            <span style={{ color: "#52c41a" }}>■ Vượt KH</span>
          </div>
        </Card>

        <Card>
          <SectionHeader title="🏢 Tỷ lệ lấp đầy" href="/projects" navigate={navigate} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MOCK_PROJECTS.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.occupancyRate >= 85 ? "#52c41a" : "#faad14", flexShrink: 0 }} />
                <div style={{ minWidth: 120, maxWidth: 120 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: "#8c8c8c" }}>{p.typeName}</div>
                </div>
                <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${p.occupancyRate}%`, background: p.occupancyRate >= 85 ? "#52c41a" : "#faad14" }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, minWidth: 40, textAlign: "right", color: p.occupancyRate >= 85 ? "#52c41a" : "#faad14" }}>{p.occupancyRate}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ROW 3 - SR, Invoices, Maintenance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <SectionHeader title="🔧 Yêu cầu Dịch vụ" href="/service-requests" navigate={navigate} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingSR.slice(0, 4).map((sr) => {
              const priColor = sr.priority === "urgent" ? "#ff4d4f" : sr.priority === "high" ? "#fa8c16" : "#1890ff";
              return (
                <div key={sr.id} onClick={() => navigate("/service-requests")}
                  style={{ padding: "10px 12px", borderRadius: 10, background: "#fafafa", borderLeft: `3px solid ${priColor}`, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e", flex: 1, paddingRight: 6 }}>{sr.title}</div>
                    <span style={{ padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 600, background: `${STATUS_COLORS[sr.status]}22`, color: STATUS_COLORS[sr.status], whiteSpace: "nowrap" }}>
                      {STATUS_LABELS[sr.status]}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>
                    📍 {sr.projectName} &nbsp;|&nbsp;
                    <span style={{ color: priColor, fontWeight: 600 }}>
                      {sr.priority === "urgent" ? "🔴 Khẩn" : sr.priority === "high" ? "🟠 Cao" : "🔵 TB"}
                    </span>
                  </div>
                </div>
              );
            })}
            {pendingSR.length === 0 && <div style={{ textAlign: "center", color: "#52c41a", padding: 24, fontSize: 13 }}>✅ Không có SR đang chờ</div>}
          </div>
        </Card>

        <Card>
          <SectionHeader title="💳 Công nợ cần xử lý" href="/billing" navigate={navigate} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {overdueInvoices.slice(0, 3).map((inv) => (
              <div key={inv.id} onClick={() => navigate("/billing")}
                style={{ padding: "10px 12px", borderRadius: 10, background: "#fff2f0", borderLeft: "3px solid #ff4d4f", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{inv.customerName}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#ff4d4f" }}>{fmtMoney(inv.totalAmount - inv.paidAmount)}</span>
                </div>
                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 3 }}>{inv.code} | Kỳ: {inv.period} | Hạn: {inv.dueDate}</div>
              </div>
            ))}
            {overdueInvoices.length === 0 && <div style={{ textAlign: "center", color: "#52c41a", padding: 24 }}>✅ Không có công nợ quá hạn</div>}
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#fff2f0", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#595959" }}>Tổng cần thu:</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#ff4d4f" }}>{fmtMoney(totalOverdue)}</span>
          </div>
        </Card>

        <Card>
          <SectionHeader title="📅 Bảo trì sắp diễn ra" href="/maintenance-plans" navigate={navigate} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingMaint.map((m) => (
              <div key={m.id} onClick={() => navigate("/maintenance-plans")}
                style={{ padding: "10px 12px", borderRadius: 10, background: "#f0f7ff", borderLeft: "3px solid #1890ff", cursor: "pointer" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e" }}>{m.title}</div>
                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 3 }}>📍 {m.projectName} | 🏭 {m.vendorName}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#1890ff", fontWeight: 600 }}>📆 {m.plannedDate}</span>
                  <span style={{ fontSize: 11, color: "#722ed1", fontWeight: 600 }}>{fmtMoney(m.estimatedCost)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ROW 4 - Meter + Vendor + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <Card style={{ background: "linear-gradient(135deg,#e6f7ff,#f0f7ff)", border: "1px solid #91d5ff" }}>
          <SectionHeader title={`📋 Chỉ số tháng ${periodLabel}`} href="/meter-readings" navigate={navigate} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: "#595959" }}>Tiến độ nhập</span>
            <span style={{ fontWeight: 700, color: meterPct === 100 ? "#52c41a" : "#1890ff" }}>{meterDone.length}/{meterAll.length} units</span>
          </div>
          <div style={{ height: 12, background: "#c6e4ff", borderRadius: 6, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ height: "100%", borderRadius: 6, width: `${meterPct}%`, background: meterPct === 100 ? "#52c41a" : "linear-gradient(90deg,#1890ff,#69c0ff)", transition: "width .5s" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { l: "Chưa nhập", c: meterAll.filter((r: any) => r.status === "pending").length, col: "#8c8c8c" },
              { l: "Đã nhập", c: meterAll.filter((r: any) => r.status === "entered").length, col: "#1890ff" },
              { l: "Đã lập HĐ", c: meterAll.filter((r: any) => r.status === "invoiced").length, col: "#52c41a" },
            ].map((s) => (
              <div key={s.l} style={{ textAlign: "center", padding: "10px 6px", background: "#fff", borderRadius: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.col }}>{s.c}</div>
                <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/meter-readings")}
            style={{ width: "100%", padding: 9, borderRadius: 8, border: "none", background: "#1890ff", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {meterPct === 100 ? "✅ Xem chi tiết" : "📋 Tiếp tục nhập →"}
          </button>
        </Card>

        <Card>
          <SectionHeader title="🧾 Hóa đơn NCC chờ duyệt" href="/vendor-invoices" navigate={navigate} />
          {pendingVendorInvoices.length === 0
            ? <div style={{ textAlign: "center", color: "#52c41a", padding: 32, fontSize: 13 }}>✅ Không có HĐ chờ duyệt</div>
            : pendingVendorInvoices.map((inv) => {
              const ok = inv.matchPO && inv.matchAcceptance;
              return (
                <div key={inv.id} onClick={() => navigate("/vendor-invoices")}
                  style={{ padding: "10px 12px", borderRadius: 10, background: ok ? "#f6ffed" : "#fff7e6", borderLeft: `3px solid ${ok ? "#52c41a" : "#faad14"}`, cursor: "pointer", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{inv.vendorName}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#722ed1" }}>{fmtMoney(inv.amount)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#8c8c8c" }}>{inv.code} | {inv.period}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: ok ? "#52c41a" : "#faad14" }}>{ok ? "✅ Đủ ĐK" : "⚠️ Chưa đủ"}</span>
                  </div>
                </div>
              );
            })
          }
        </Card>

        <Card>
          <SectionHeader title="⚡ Thao tác nhanh" navigate={navigate} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "📋", label: "Nhập chỉ số", desc: "Điện, nước tháng", path: "/meter-readings", color: "#1890ff" },
              { icon: "🔧", label: "Tạo SR mới", desc: "Yêu cầu dịch vụ", path: "/service-requests", color: "#fa8c16" },
              { icon: "📄", label: "HĐ thuê mới", desc: "Lease contract", path: "/lease-contracts", color: "#52c41a" },
              { icon: "🏭", label: "Thêm NCC", desc: "Nhà cung cấp", path: "/vendors", color: "#722ed1" },
              { icon: "📅", label: "Kế hoạch BT", desc: "Bảo trì định kỳ", path: "/maintenance-plans", color: "#13c2c2" },
              { icon: "📊", label: "Xem báo cáo", desc: "P&L portfolio", path: "/reports", color: "#eb2f96" },
            ].map((a) => (
              <div key={a.path} onClick={() => navigate(a.path)}
                style={{ padding: "12px 14px", borderRadius: 10, background: "#fafafa", cursor: "pointer", border: "1px solid #f0f0f0", transition: "all .15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${a.color}11`; e.currentTarget.style.borderColor = a.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#f0f0f0"; }}
              >
                <div style={{ fontSize: 22, marginBottom: 5 }}>{a.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{a.label}</div>
                <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#c0c0c0" }}>
        TNPM Property Management Platform · v1.0.0-alpha · {new Date().toLocaleString("vi-VN")}
      </div>
    </div>
  );
}