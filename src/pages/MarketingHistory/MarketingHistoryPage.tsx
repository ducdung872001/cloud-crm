import React, { useState } from "react";
import { Chart } from "components/chart/Chart";
import Badge from "components/badge/badge";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

// --- data giữ nguyên ---
const MOCK_CAMPAIGNS = [
  { id: 1, name: "Chúc mừng sinh nhật tháng 3",   channel: "SMS",      sent: 245,  opened: 198,  clicked: 87,  revenue: 4500000,   date: "01/03/2026", status: "completed" },
  { id: 2, name: "Flash Sale cuối tuần",            channel: "Zalo",     sent: 1250, opened: 890,  clicked: 423, revenue: 32000000,  date: "14/03/2026", status: "active"    },
  { id: 3, name: "Thông báo sản phẩm mới",          channel: "Email",    sent: 3400, opened: 1560, clicked: 678, revenue: 18700000,  date: "10/03/2026", status: "completed" },
  { id: 4, name: "Nhắc nhở điểm sắp hết hạn",      channel: "Push App", sent: 456,  opened: 312,  clicked: 189, revenue: 6300000,   date: "12/03/2026", status: "completed" },
  { id: 5, name: "Khuyến mãi hội viên VIP",         channel: "SMS",      sent: 89,   opened: 76,   clicked: 45,  revenue: 9800000,   date: "15/03/2026", status: "active"    },
  { id: 6, name: "Email chào mừng thành viên mới",  channel: "Email",    sent: 620,  opened: 285,  clicked: 98,  revenue: 2100000,   date: "08/03/2026", status: "completed" },
  { id: 7, name: "Zalo OA nhắc đổi điểm",           channel: "Zalo",     sent: 540,  opened: 384,  clicked: 201, revenue: 7400000,   date: "05/03/2026", status: "completed" },
];

const CHANNEL_OPEN_RATES = [
  { channel: "SMS",      rate: 81, color: "#22c55e" },
  { channel: "Zalo/OTT", rate: 71, color: "#3b82f6" },
  { channel: "Email",    rate: 46, color: "#f97316" },
  { channel: "Push App", rate: 68, color: "#a855f7" },
];

const MONTHLY_DATA = [
  { month: "T10", count: 4 },
  { month: "T11", count: 6 },
  { month: "T12", count: 8 },
  { month: "T1",  count: 3 },
  { month: "T2",  count: 4 },
  { month: "T3",  count: 5 },
];

const STATUS_BADGE_VARIANT: Record<string, any> = {
  active:    "success",
  completed: "done",
  pending:   "warning",
};
const STATUS_LABEL: Record<string, string> = {
  active:    "Đang chạy",
  completed: "Hoàn thành",
  pending:   "Chờ duyệt",
};
const CHANNEL_COLORS: Record<string, { bg: string; color: string }> = {
  SMS:        { bg: "#f0fdf4", color: "#15803d" },
  Zalo:       { bg: "#eff6ff", color: "#1d4ed8" },
  Email:      { bg: "#fff7ed", color: "#c2410c" },
  "Push App": { bg: "#faf5ff", color: "#7e22ce" },
};

interface MarketingHistoryPageProps {
  onBackProps?: (isBack: boolean) => void;
}

export default function MarketingHistoryPage({ onBackProps }: MarketingHistoryPageProps) {
  document.title = "Lịch sử chiến dịch";

  const [search, setSearch]           = useState("");
  const [filterChannel, setFilterChannel] = useState("Tất cả");
  const [filterStatus, setFilterStatus]   = useState("Tất cả");

  const totalCampaigns = MOCK_CAMPAIGNS.length;
  const totalSent      = MOCK_CAMPAIGNS.reduce((s, c) => s + c.sent, 0);
  const avgOpenRate    = Math.round(
    MOCK_CAMPAIGNS.reduce((s, c) => s + (c.opened / c.sent) * 100, 0) / MOCK_CAMPAIGNS.length
  );
  const totalRevenue   = MOCK_CAMPAIGNS.reduce((s, c) => s + c.revenue, 0);
  const revenueLabel   = totalRevenue >= 1_000_000_000
    ? `${(totalRevenue / 1_000_000_000).toFixed(1)}B`
    : `${Math.round(totalRevenue / 1_000_000)}M`;

  const filtered = MOCK_CAMPAIGNS.filter((c) => {
    const matchSearch  = c.name.toLowerCase().includes(search.toLowerCase());
    const matchChannel = filterChannel === "Tất cả" || c.channel === filterChannel;
    const matchStatus  = filterStatus  === "Tất cả" || filterStatus === c.status;
    return matchSearch && matchChannel && matchStatus;
  });

  // Highcharts column config
  const chartOptions = {
    chart: { type: "column", height: 200, spacing: [8,8,8,8], animation: false },
    title: { text: "" },
    xAxis: {
      categories: MONTHLY_DATA.map(d => d.month),
      lineColor: "transparent", tickLength: 0,
      labels: { style: { fontSize: "12px", color: "#94a3b8" } },
    },
    yAxis: { title: { text: "" }, gridLineColor: "#f1f5f9", labels: { style: { fontSize: "11px", color: "#94a3b8" } } },
    tooltip: {
      backgroundColor: "#475467", borderRadius: 8,
      style: { color: "#fff", fontSize: "13px" },
      formatter: function() { return `<b>${(this as any).x}</b>: ${(this as any).y} chiến dịch`; },
    },
    plotOptions: { column: { borderRadius: 6, color: "#93c5fd", pointPadding: 0.15, groupPadding: 0.1 } },
    legend: { enabled: false },
    series: [{ name: "Chiến dịch", data: MONTHLY_DATA.map(d => d.count) }],
    credits: { enabled: false },
  };

  // ── Styles ──
  const s = {
    page:       { background: "#f8fafc", padding: "24px", minHeight: "100%" } as React.CSSProperties,
    heading:    { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 } as React.CSSProperties,
    subText:    { fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 0 } as React.CSSProperties,

    grid4:      { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 20 } as React.CSSProperties,
    grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 } as React.CSSProperties,

    card:       { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20 } as React.CSSProperties,
    statLabel:  { fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 6 } as React.CSSProperties,
    statValue:  { fontSize: 26, fontWeight: 700, lineHeight: 1.2, margin: 0 } as React.CSSProperties,
    statTrend:  { fontSize: 12, color: "#22c55e", fontWeight: 500, marginTop: 4 } as React.CSSProperties,

    cardTitle:  { fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 16 } as React.CSSProperties,

    // channel bar
    barRow:     { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 } as React.CSSProperties,
    barLabel:   { width: 72, fontSize: 13, fontWeight: 600, color: "#334155", flexShrink: 0 } as React.CSSProperties,
    barTrack:   { flex: 1, background: "#f1f5f9", borderRadius: 99, height: 10 } as React.CSSProperties,
    barPct:     { width: 40, textAlign: "right", fontSize: 13, fontWeight: 700, flexShrink: 0 } as React.CSSProperties,

    // table section
    tableCard:  { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", marginTop: 16 } as React.CSSProperties,
    tableHead:  { padding: "16px 20px 12px", display: "flex", alignItems: "center", flexWrap: "wrap" as const, gap: 8, borderBottom: "1px solid #f1f5f9" } as React.CSSProperties,

    input:      { paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", minWidth: 200, flex: 1 } as React.CSSProperties,
    select:     { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" } as React.CSSProperties,
    exportBtn:  { marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#f97316", background: "none", border: "none", cursor: "pointer" } as React.CSSProperties,

    table:      { width: "100%", borderCollapse: "collapse" as const } as React.CSSProperties,
    th:         { padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, background: "#f8fafc", borderBottom: "1px solid #f1f5f9", textAlign: "left" as const } as React.CSSProperties,
    thRight:    { padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, background: "#f8fafc", borderBottom: "1px solid #f1f5f9", textAlign: "right" as const } as React.CSSProperties,
    td:         { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #f8fafc", color: "#334155" } as React.CSSProperties,
    tdRight:    { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #f8fafc", color: "#334155", textAlign: "right" as const } as React.CSSProperties,
  };

  return (
    <div style={s.page}>
      {/* HeaderTabMenu — breadcrumb back to "Chiến dịch Marketing" */}
      <HeaderTabMenu
        title="Lịch sử chiến dịch"
        titleBack="Chiến dịch Marketing"
        onBackProps={onBackProps}
      />

      {/* Stat cards */}
      <div style={s.grid4}>
        {[
          { label: "Tổng chiến dịch", value: String(totalCampaigns),              color: "#2563eb", bg: "#eff6ff", icon: "📣" },
          { label: "Tin đã gửi",      value: totalSent.toLocaleString("vi-VN"),   color: "#22c55e", bg: "#f0fdf4", icon: "📨", trend: "↑ 18% so với tháng trước" },
          { label: "Tỷ lệ mở TB",     value: `${avgOpenRate}%`,                   color: "#f97316", bg: "#fff7ed", icon: "👁",  trend: "↑ 3% so với tháng trước"  },
          { label: "Doanh thu từ CĐ", value: revenueLabel,                        color: "#a855f7", bg: "#faf5ff", icon: "💰", trend: "↑ 12% so với tháng trước" },
        ].map((item) => (
          <div key={item.label} style={{ ...s.card, background: item.bg, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={s.statLabel}>{item.label}</p>
              <span style={{
                fontSize: 20,
                background: "#fff",
                borderRadius: "50%",
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                flexShrink: 0,
              }}>{item.icon}</span>
            </div>
            <p style={{ ...s.statValue, color: item.color }}>{item.value}</p>
            {item.trend && <p style={s.statTrend}>{item.trend}</p>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={s.grid2}>
        {/* Channel open rate */}
        <div style={s.card}>
          <p style={s.cardTitle}>Hiệu quả mở theo kênh</p>
          {CHANNEL_OPEN_RATES.map(({ channel, rate, color }) => (
            <div key={channel} style={s.barRow}>
              <span style={s.barLabel}>{channel}</span>
              <div style={s.barTrack}>
                <div style={{ width: `${rate}%`, height: 10, borderRadius: 99, background: color, transition: "width .7s" }} />
              </div>
              <span style={{ ...s.barPct, color }}>{rate}%</span>
            </div>
          ))}
        </div>

        {/* Monthly campaign chart */}
        <div style={s.card}>
          <p style={s.cardTitle}>Số chiến dịch theo tháng</p>
          <Chart chartType="column" allowTypeChange={false} chartOptions={chartOptions} />
        </div>
      </div>

      {/* Campaign table */}
      <div style={s.tableCard}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ ...s.cardTitle, marginBottom: 0 }}>Tất cả chiến dịch</p>
          <button style={s.exportBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Xuất Excel
          </button>
        </div>

        <table style={s.table}>
          <thead>
          <tr>
            <th style={s.th}>Chiến dịch</th>
            <th style={s.th}>Kênh</th>
            <th style={s.thRight}>Đã gửi</th>
            <th style={s.thRight}>Tỷ lệ mở</th>
            <th style={s.thRight}>Nhấp</th>
            <th style={s.th}>Ngày</th>
            <th style={s.th}>TT</th>
          </tr>
          </thead>
          <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ ...s.td, textAlign: "center", color: "#94a3b8", padding: "32px" }}>
                Không có chiến dịch nào phù hợp.
              </td>
            </tr>
          ) : filtered.map((c) => {
            const chColor = CHANNEL_COLORS[c.channel] || { bg: "#f1f5f9", color: "#475569" };
            return (
              <tr key={c.id} style={{ cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={s.td}><span style={{ fontWeight: 600 }}>{c.name}</span></td>
                <td style={s.td}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: chColor.bg, color: chColor.color }}>
                      {c.channel}
                    </span>
                </td>
                <td style={s.tdRight}>{c.sent.toLocaleString("vi-VN")}</td>
                <td style={{ ...s.tdRight, color: "#22c55e", fontWeight: 700 }}>
                  {Math.round((c.opened / c.sent) * 100)}%
                </td>
                <td style={{ ...s.tdRight, color: "#f97316", fontWeight: 700 }}>
                  {Math.round((c.clicked / c.sent) * 100)}%
                </td>
                <td style={{ ...s.td, color: "#64748b" }}>{c.date}</td>
                <td style={s.td}>
                  <Badge
                    text={STATUS_LABEL[c.status] || c.status}
                    variant={STATUS_BADGE_VARIANT[c.status] || "transparent"}
                  />
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}