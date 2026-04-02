import React from "react";
import { useApp } from "contexts/AppContext";
import { LEADERBOARD, MOCK_DEALS } from "configs/mockData";

function MetricCard({ color, icon, trend, trendDir, value, label }: any) {
  return (
    <div className={`metric-card metric-card--${color}`}>
      <div className="metric-card__top">
        <div className={`metric-card__icon metric-card__icon--${color}`}>{icon}</div>
        <span className={`metric-card__trend metric-card__trend--${trendDir}`}>{trend}</span>
      </div>
      <div className="metric-card__value">{value}</div>
      <div className="metric-card__label">{label}</div>
    </div>
  );
}

function DealCard({ deal, onClick }: any) {
  return (
    <div className={`deal-card${deal.highlight === "won" ? " deal-card--won-border" : ""}`} onClick={onClick}>
      <div className="deal-card__name">{deal.name}</div>
      <div className="deal-card__meta">{deal.meta}</div>
      <div className="deal-card__amount">{deal.amount}</div>
      <div className="deal-card__footer">
        <span className={`deal-product deal-product--${deal.product}`}>{deal.productLabel}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div className="deal-card__avatar" style={{ background: deal.rmColor }}>{deal.rmInitials}</div>
          <span className="deal-card__date">{deal.date}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { setActivePage, openModal, showToast } = useApp();

  const approachDeals = MOCK_DEALS.filter((d) => d.stage === "approach").slice(0, 2);
  const consultDeals  = MOCK_DEALS.filter((d) => d.stage === "consult").slice(0, 2);
  const closingDeals  = MOCK_DEALS.filter((d) => d.stage === "closing").slice(0, 1);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">Sales Dashboard</div>
          <div className="page-subtitle">Tháng 3/2025 · Chi nhánh Hà Nội · Banking CRM</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => showToast("Đã làm mới dữ liệu", "info")}>
            <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Làm mới
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-lead")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo Lead mới
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <MetricCard color="blue" trend="↑ 18%" trendDir="up" value="247" label="Leads mới tháng này"
          icon={<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
        />
        <MetricCard color="gold" trend="↑ 23%" trendDir="up" value="18.4 tỷ" label="Doanh số tháng"
          icon={<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
        <MetricCard color="green" trend="↑ 5%" trendDir="up" value="34.2%" label="Tỷ lệ chuyển đổi"
          icon={<svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
        />
        <MetricCard color="red" trend="↓ 2%" trendDir="down" value="8.3 ngày" label="Chu kỳ bán trung bình"
          icon={<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
      </div>

      {/* Row 2: Pipeline + Customer 360 + Approvals */}
      <div className="two-col">
        {/* Mini Pipeline */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Pipeline Cơ hội</span>
            <span className="card__action" onClick={() => setActivePage("pipeline")}>Xem tất cả →</span>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <div className="pipeline-wrap">
              <div className="pipeline-col">
                <div className="pipeline-stage">Tiếp cận <span className="stage-count">8</span></div>
                {approachDeals.map((d) => <DealCard key={d.id} deal={d} onClick={() => openModal("modal-deal-detail")} />)}
              </div>
              <div className="pipeline-col">
                <div className="pipeline-stage" style={{ color: "var(--gold)" }}>Tư vấn <span className="stage-count">5</span></div>
                {consultDeals.map((d) => <DealCard key={d.id} deal={d} onClick={() => openModal("modal-deal-detail")} />)}
              </div>
              <div className="pipeline-col">
                <div className="pipeline-stage" style={{ color: "var(--success)" }}>Chốt deal <span className="stage-count">3</span></div>
                {closingDeals.map((d) => <DealCard key={d.id} deal={d} onClick={() => openModal("modal-deal-detail")} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Customer 360 Quick */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Customer 360° – Nhanh</span>
              <span className="card__action" onClick={() => setActivePage("customers")}>Chi tiết →</span>
            </div>
            <div className="c360-header">
              <div className="c360-avatar">TC</div>
              <div>
                <div className="c360-name">Trương Bảo Châu</div>
                <div className="c360-type c360-type--vip">★ VIP Platinum</div>
              </div>
            </div>
            <div className="c360-products">
              <div className="c360-product"><div className="c360-pname">Tiền gửi CKH</div><div className="c360-pval text-success">2.1 tỷ</div></div>
              <div className="c360-product"><div className="c360-pname">Dư nợ vay</div><div className="c360-pval text-accent">850 tr</div></div>
              <div className="c360-product"><div className="c360-pname">Thẻ tín dụng</div><div className="c360-pval">2 thẻ</div></div>
              <div className="c360-product"><div className="c360-pname">Bảo hiểm</div><div className="c360-pval">3 hợp đồng</div></div>
            </div>
            <div className="c360-signals">
              <div className="signal-item signal-item--upsell" onClick={() => openModal("modal-new-opportunity")}>
                <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                <div className="signal-text"><strong>Upsell:</strong> Đủ điều kiện thẻ Infinity</div>
              </div>
              <div className="signal-item signal-item--renew" onClick={() => openModal("modal-new-task")}>
                <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                <div className="signal-text"><strong>Tái tục:</strong> Bảo hiểm đáo hạn 25/04</div>
              </div>
              <div className="signal-item signal-item--alert" onClick={() => openModal("modal-new-task")}>
                <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div className="signal-text"><strong>Cảnh báo:</strong> KH chưa TT thẻ 15 ngày</div>
              </div>
            </div>
          </div>

          {/* Quick approvals */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Chờ phê duyệt</span>
              <span className="card__action" onClick={() => setActivePage("approval")}>Xem tất cả →</span>
            </div>
            <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              <div className="approval-item" onClick={() => openModal("modal-approval-detail")}>
                <div className="approval-item__icon approval-item__icon--pending">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="approval-item__title">TNHH Đức Thành – Vay 12.5 tỷ</div>
                  <div className="approval-item__meta">Lãi suất ưu đãi 7.5% · Minh Quân</div>
                </div>
                <div className="approval-item__actions">
                  <button className="apv-btn apv-btn--ok" onClick={(e) => { e.stopPropagation(); showToast("Đã phê duyệt PD-2851", "success"); }}>Duyệt</button>
                  <button className="apv-btn apv-btn--reject" onClick={(e) => { e.stopPropagation(); showToast("Đã từ chối PD-2851", "error"); }}>Từ chối</button>
                </div>
              </div>
              <div className="approval-item" onClick={() => openModal("modal-approval-detail")}>
                <div className="approval-item__icon approval-item__icon--review">
                  <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="approval-item__title">ABC Corp – Hạn mức TD đặc biệt</div>
                  <div className="approval-item__meta">Hạn mức 5 tỷ · Ngọc Anh</div>
                </div>
                <div className="approval-item__actions">
                  <button className="apv-btn apv-btn--ok" onClick={(e) => { e.stopPropagation(); showToast("Đã phê duyệt PD-2852", "success"); }}>Duyệt</button>
                  <button className="apv-btn apv-btn--reject" onClick={(e) => { e.stopPropagation(); showToast("Đã từ chối PD-2852", "error"); }}>Từ chối</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Charts + Leaderboard + Activity */}
      <div className="three-col">
        {/* Bar chart */}
        <div className="card">
          <div className="card__header"><span className="card__title">Doanh số 6 tháng</span></div>
          <div className="card__body">
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-secondary)" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent)" }} />Thực tế</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-secondary)" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(33,150,243,0.25)" }} />Mục tiêu</div>
            </div>
            <div className="chart-area">
              {[["70%","80%"],["55%","75%"],["80%","78%"],["65%","82%"],["90%","85%"],["75%","90%"]].map(([a,b],i) => (
                <div key={i} className="bar-group">
                  <div className="cb cb--a" style={{ height: a }} />
                  <div className="cb cb--b" style={{ height: b }} />
                </div>
              ))}
            </div>
            <div className="chart-x">
              {["T10","T11","T12","T1","T2","T3"].map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Leaderboard RM</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Tháng 3</span>
          </div>
          <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {LEADERBOARD.map((lb) => (
              <div key={lb.rank} className="lb-item">
                <div className={`rank${lb.rank <= 3 ? " rank--top" : ""}`}>{lb.rank}</div>
                <div className="avatar" style={{ background: `linear-gradient(135deg,${lb.gradFrom},${lb.gradTo})` }}>{lb.initials}</div>
                <div className="info">
                  <div className="name">{lb.name}</div>
                  <div className="branch">{lb.branch}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="val">{lb.value}</div>
                  <div className="bar-wrap"><div className="bar" style={{ width: `${lb.pct}%`, background: lb.barColor }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Hoạt động gần đây</span>
            <span className="card__action" onClick={() => showToast("Xem log đầy đủ", "info")}>Tất cả →</span>
          </div>
          <div className="card__body" style={{ paddingTop: 8, paddingBottom: 4 }}>
            <div className="activity-list">
              {[
                { type: "deal", text: <><strong>Trương Bảo Châu</strong> – Chốt thẻ Infinity 3.6 tỷ</>, time: "2p" },
                { type: "call", text: <><strong>Hà Thu</strong> gọi KH <strong>Nguyễn Tuấn</strong>, lên lịch tư vấn</>, time: "15p" },
                { type: "alert", text: <>Cảnh báo: KH <strong>Lê Hải Nam</strong> sắp đáo hạn TD 2 ngày</>, time: "32p" },
                { type: "meet", text: <><strong>Ngọc Anh</strong> họp KH <strong>Phạm Xuân Đức</strong> – Banca</>, time: "1g" },
                { type: "syst", text: <>Lead mới từ <strong>Web</strong>: TNHH Thái Bình Dương – Vay 8 tỷ</>, time: "2g" },
                { type: "deal", text: <><strong>Hồ sơ</strong> #PD-2847 đã duyệt cấp 2 – ABC Corp</>, time: "3g" },
              ].map((a, i) => (
                <div key={i} className="activity-item">
                  <div className={`dot dot--${a.type}`} />
                  <div className="text">{a.text}</div>
                  <div className="time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: KPI + Product Mix */}
      <div className="two-col">
        <div className="card">
          <div className="card__header">
            <span className="card__title">KPI Tháng 3 – Chi nhánh HN</span>
            <span className="card__action" onClick={() => setActivePage("kpi")}>Xem báo cáo →</span>
          </div>
          <div className="card__body">
            {[
              { label: "Doanh số tín dụng (Vay)", pct: 78, pctLabel: "78% · 18.4/23.5 tỷ", color: "var(--success)" },
              { label: "Số thẻ tín dụng mở mới", pct: 62, pctLabel: "62% · 62/100 thẻ", color: "var(--accent)" },
              { label: "Huy động tiết kiệm", pct: 91, pctLabel: "91% · 27.3/30 tỷ", color: "var(--gold)" },
              { label: "Bancassurance (phí)", pct: 45, pctLabel: "45% · 4.5/10 tỷ", color: "var(--purple)" },
              { label: "NPS trung bình", pct: 87, pctLabel: "8.7/10", color: "var(--success)" },
            ].map((k) => (
              <div key={k.label} className="progress-item">
                <div className="progress-label-row">
                  <span>{k.label}</span>
                  <span className="pct" style={{ color: k.color }}>{k.pctLabel}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${k.pct}%`, background: k.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title">Cơ cấu sản phẩm</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Tháng 3/2025</span>
          </div>
          <div className="card__body">
            <div className="donut-wrap">
              <svg width="100" height="100" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--accent)" strokeWidth="3.8" strokeDasharray="44 56" strokeDashoffset="25"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--gold)" strokeWidth="3.8" strokeDasharray="22 78" strokeDashoffset="-19"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--success)" strokeWidth="3.8" strokeDasharray="20 80" strokeDashoffset="-41"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--purple)" strokeWidth="3.8" strokeDasharray="14 86" strokeDashoffset="-61"/>
                <text x="18" y="20" textAnchor="middle" fill="var(--text-primary)" fontSize="4.5" fontWeight="700" fontFamily="Be Vietnam Pro">Mix</text>
              </svg>
              <div className="donut-legend">
                {[
                  { color: "var(--accent)", label: "Vay tài sản/DN", pct: "44%", pctColor: "var(--accent-bright)" },
                  { color: "var(--gold)", label: "Thẻ tín dụng", pct: "22%", pctColor: "var(--gold)" },
                  { color: "var(--success)", label: "Tiết kiệm/TG", pct: "20%", pctColor: "var(--success)" },
                  { color: "var(--purple)", label: "Bancassurance", pct: "14%", pctColor: "var(--purple)" },
                ].map((d) => (
                  <div key={d.label} className="dl-item">
                    <div className="dl-dot" style={{ background: d.color }} />
                    <span className="dl-label">{d.label}</span>
                    <span className="dl-pct" style={{ color: d.pctColor }}>{d.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
