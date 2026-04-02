import React, { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "contexts/AppContext";
import { CampaignService } from "services/index";

function normalizeCampaign(item: any) {
  const s = item.status || "upcoming";
  const pct = item.targetRevenue > 0
    ? Math.min(Math.round((item.actualRevenue / item.targetRevenue) * 100), 100)
    : 0;
  return {
    id:              item.id,
    emoji:           item.emoji || "📊",
    name:            item.name || "—",
    status:          s,
    statusLabel:     s === "active" ? "Đang chạy" : s === "upcoming" ? "Sắp bắt đầu" : "Kết thúc",
    period:          [item.startDate, item.endDate].filter(Boolean).map((d: string) => new Date(d).toLocaleDateString("vi-VN")).join(" – ") || "—",
    product:         item.productType || item.productName || "—",
    scope:           item.scope || "Toàn hệ thống",
    targetRevenue:   item.targetRevenue ? `${(item.targetRevenue / 1e9).toFixed(0)} tỷ` : "—",
    actualRevenue:   item.actualRevenue ? `${(item.actualRevenue / 1e9).toFixed(1)} tỷ` : "—",
    targetCustomers: item.targetCustomers || 0,
    actualCustomers: item.actualCustomers || 0,
    contractsSigned: item.contractsSigned || 0,
    pct,
    pctColor:        pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--gold)" : "var(--warning)",
    borderColor:     s === "active" ? "rgba(33,150,243,0.2)" : "",
    docs:            item.docs || item.artifacts || [],
  };
}

const statusBadge = (s: string) => {
  if (s === "active")
    return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", fontWeight: 600 }}>● Đang chạy</span>;
  if (s === "upcoming")
    return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--warning-soft)", color: "var(--warning)", fontWeight: 600 }}>○ Sắp bắt đầu</span>;
  return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", color: "var(--text-muted)", fontWeight: 600 }}>✓ Kết thúc</span>;
};

export default function Campaigns() {
  const { openModal, setActivePage, showToast } = useApp();
  const [campaigns,  setCampaigns]  = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState<Record<string, string>>({});
  const abortRef = useRef<AbortController | null>(null);

  const getTab = (id: number) => activeTab[id] || "docs";
  const setTab = (id: number, tab: string) => setActiveTab(prev => ({ ...prev, [id]: tab }));

  const fetchCampaigns = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);
    try {
      const res = await CampaignService.listViewSale({ page: 1, limit: 20 });
      if (res?.code === 0 || res?.result) {
        const items = res.result?.items || res.result || [];
        setCampaigns(items.map(normalizeCampaign));
      } else {
        setError(res?.message || "Không tải được danh sách chiến dịch");
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError("Lỗi kết nối: " + e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCampaigns(); return () => abortRef.current?.abort(); }, [fetchCampaigns]);

  const activeCnt = campaigns.filter(c => c.status === "active").length;
  const totalRev  = campaigns.reduce((s, c) => s + (parseFloat(c.actualRevenue) || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Chiến dịch</div><div className="page-subtitle">Quản lý chiến dịch bán hàng Banking</div></div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={fetchCampaigns}>↻</button>
          <button className="btn btn--ghost" onClick={() => showToast("Đang xuất báo cáo…", "info")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Xuất báo cáo
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-campaign")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo chiến dịch
          </button>
        </div>
      </div>

      <div className="metric-grid">
        {[
          { color: "green",  value: loading ? "…" : activeCnt,                                            label: "Đang chạy" },
          { color: "gold",   value: loading ? "…" : `${totalRev.toFixed(1)} tỷ`,                          label: "Tổng DS chiến dịch" },
          { color: "blue",   value: loading ? "…" : campaigns.reduce((s,c)=>s+c.actualCustomers,0),       label: "Leads phát sinh" },
          { color: "purple", value: loading ? "…" : campaigns.reduce((s,c)=>s+c.contractsSigned,0),       label: "Hợp đồng ký kết" },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top"><div className={`metric-card__icon metric-card__icon--${m.color}`}><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div></div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="info-banner info-banner--danger" style={{ marginBottom: 12 }}>
          ⚠ {error} <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: 8 }} onClick={fetchCampaigns}>Thử lại</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading
          ? [...Array(2)].map((_, i) => (
            <div key={i} className="card">
              <div style={{ padding: 20 }}>
                <div style={{ height: 18, borderRadius: 4, background: "var(--surface-hover)", width: "40%", marginBottom: 10 }} />
                <div style={{ height: 12, borderRadius: 4, background: "var(--surface-hover)", width: "60%", marginBottom: 16 }} />
                <div style={{ display: "flex", gap: 20 }}>
                  {[1,2,3].map(j => <div key={j} style={{ height: 40, width: 80, borderRadius: 8, background: "var(--surface-hover)" }} />)}
                </div>
              </div>
            </div>
          ))
          : campaigns.length === 0
            ? <div className="card"><div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Không có chiến dịch nào</div></div>
            : campaigns.map((c) => (
              <div key={c.id} className="card" style={{ borderColor: c.borderColor || undefined, opacity: c.status === "upcoming" ? 0.85 : 1 }}>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{c.emoji} {c.name}</span>
                        {statusBadge(c.status)}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>{c.period} · {c.product} · {c.scope}</div>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div><div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Mục tiêu DS</div><div style={{ fontSize: 14, fontWeight: 700, color: c.pctColor }}>{c.targetRevenue}</div></div>
                        {c.actualCustomers > 0 && <div><div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Đã đạt</div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--success)" }}>{c.actualRevenue}</div></div>}
                        {c.contractsSigned > 0 && <div><div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>HĐ ký</div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>{c.contractsSigned}</div></div>}
                      </div>
                      {c.pct > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                            <span style={{ color: "var(--text-secondary)" }}>Tiến độ</span>
                            <span style={{ fontWeight: 600, color: c.pctColor }}>{c.pct}%</span>
                          </div>
                          <div className="progress-bar" style={{ height: 6 }}><div className="progress-bar__fill" style={{ width: `${c.pct}%`, background: c.pctColor }} /></div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <button className="btn btn--primary btn--sm" onClick={() => openModal("modal-campaign-detail")}>Chi tiết & Tài liệu</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => openModal("modal-campaign-edit")}>Chỉnh sửa</button>
                      {c.status === "active"   && <button className="btn btn--ghost btn--sm" onClick={() => setActivePage("pipeline")}>Xem Pipeline</button>}
                      {c.status === "upcoming" && <button className="btn btn--ghost btn--sm" onClick={() => { CampaignService.updateStatus({ id: c.id, status: "active" }).then(() => { showToast("Đã kích hoạt chiến dịch!", "success"); fetchCampaigns(); }).catch(() => showToast("Lỗi kích hoạt","error")); }}>Kích hoạt</button>}
                    </div>
                  </div>
                  {c.status === "active" && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "var(--surface)", padding: 3, borderRadius: 9 }}>
                        {["docs","kpi","process"].map((tab) => (
                          <button key={tab} onClick={() => setTab(c.id, tab)} style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: "none", fontFamily: "var(--font)", fontSize: 12, fontWeight: 500, cursor: "pointer", background: getTab(c.id) === tab ? "var(--navy-mid)" : "none", color: getTab(c.id) === tab ? "var(--text-primary)" : "var(--text-secondary)", transition: "all .15s" }}>
                            {tab === "docs" ? `Tài liệu (${c.docs.length})` : tab === "kpi" ? "KPI" : "Quy trình"}
                          </button>
                        ))}
                      </div>
                      {getTab(c.id) === "docs" && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          {c.docs.length > 0
                            ? c.docs.map((doc: any, i: number) => (
                              <span key={i} className="doc-chip" onClick={() => openModal("modal-view-doc")}>📄 {typeof doc === "string" ? doc : doc.name}</span>
                            ))
                            : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Chưa có tài liệu đính kèm</span>
                          }
                          <span className="doc-chip" style={{ borderStyle: "dashed", color: "var(--text-muted)" }} onClick={() => openModal("modal-new-doc")}>+ Thêm</span>
                        </div>
                      )}
                      {getTab(c.id) === "kpi" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                          {[
                            { l: "DS thực tế", v: c.actualRevenue, color: "var(--success)" },
                            { l: "Leads",       v: c.actualCustomers, color: "var(--accent-bright)" },
                            { l: "HĐ ký",      v: c.contractsSigned, color: "var(--gold)" },
                            { l: "Tiến độ",    v: `${c.pct}%`, color: c.pctColor },
                          ].map(item => (
                            <div key={item.l} style={{ background: "var(--surface)", borderRadius: 8, padding: 10, textAlign: "center" }}>
                              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 3 }}>{item.l}</div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {getTab(c.id) === "process" && (
                        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                          {["Tiếp cận","Tư vấn","Đề xuất","Thẩm định","Chốt HĐ"].map((step, i) => (
                            <React.Fragment key={step}>
                              <div style={{ flexShrink: 0, background: "var(--surface)", borderRadius: 8, padding: "10px 14px", fontSize: 12, textAlign: "center", borderLeft: `3px solid ${["var(--accent)","var(--gold)","var(--purple)","var(--warning)","var(--success)"][i]}` }}>
                                <div style={{ fontWeight: 600, color: ["var(--accent-bright)","var(--gold)","var(--purple)","var(--warning)","var(--success)"][i] }}>{step}</div>
                              </div>
                              {i < 4 && <div style={{ alignSelf: "center", color: "var(--text-muted)", flexShrink: 0 }}>›</div>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
