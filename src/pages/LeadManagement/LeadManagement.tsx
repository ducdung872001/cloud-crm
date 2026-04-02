import React, { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "contexts/AppContext";
import LeadService, { ILeadFilter } from "services/LeadService";

function SkeletonRow() {
  return (
    <tr>
      {[...Array(8)].map((_, i) => (
        <td key={i}><div style={{ height: 14, borderRadius: 4, background: "var(--surface-hover)", width: i === 0 ? "80%" : "60%" }} /></td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    hot:  { cls: "status-badge--hot",  label: "Nóng" },
    warm: { cls: "status-badge--warm", label: "Ấm" },
    cold: { cls: "status-badge--cold", label: "Lạnh" },
    won:  { cls: "status-badge--won",  label: "Đã chốt" },
    lost: { cls: "status-badge--lost", label: "Mất" },
  };
  const s = map[status] || { cls: "status-badge--cold", label: status };
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
}

function ProductTag({ product }: { product: string }) {
  const map: Record<string, string> = { vay: "deal-product--vay", the: "deal-product--the", tk: "deal-product--tk", banca: "deal-product--banca", sme: "deal-product--sme" };
  const labels: Record<string, string> = { vay: "Vay TS", the: "Thẻ TD", tk: "Tiết kiệm", banca: "Banca", sme: "Vay DN" };
  return <span className={`deal-product ${map[product] || "deal-product--tk"}`}>{labels[product] || product}</span>;
}

function normalizeLeads(items: any[]): any[] {
  return (items || []).map((item) => ({
    id:      item.id,
    name:    item.name || item.fullName || "—",
    sub:     [item.phone, item.address].filter(Boolean).join(" · ") || "—",
    product: item.productType || item.customerGroup?.code || "tk",
    value:   item.estimatedValue
      ? (item.estimatedValue >= 1_000_000_000
          ? `${(item.estimatedValue / 1_000_000_000).toFixed(1)} tỷ`
          : `${Math.round(item.estimatedValue / 1_000_000)} tr`)
      : "—",
    source:  item.customerSource?.name || item.sourceName || "—",
    rm:      item.employee?.name || item.employeeName || "—",
    status:  item.status || "cold",
    date:    item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      : "—",
  }));
}

export default function LeadManagement() {
  const { setActivePage, openModal } = useApp();

  const [leads,      setLeads]      = useState<any[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [page,       setPage]       = useState(1);
  const [filter,     setFilter]     = useState("all");
  const [prodFilter, setProdFilter] = useState("all");
  const [keyword,    setKeyword]    = useState("");
  const [debKeyword, setDebKeyword] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Debounce keyword 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebKeyword(keyword), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchLeads = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    const params: ILeadFilter = { page, limit: 20, keyword: debKeyword || undefined };
    if (filter !== "all") params.status = ({ hot: 1, warm: 2, cold: 3 } as any)[filter];
    if (prodFilter !== "all") params.productType = prodFilter;

    try {
      const res = await LeadService.list(params, abortRef.current.signal);
      if (res?.code === 0 || res?.success || Array.isArray(res?.result?.items)) {
        const items = res.result?.items || res.result || [];
        setLeads(normalizeLeads(items));
        setTotal(res.result?.total || items.length);
      } else {
        setError(res?.message || "Không tải được danh sách lead");
        setLeads([]);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError("Lỗi kết nối server – " + err.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, debKeyword, filter, prodFilter]);

  useEffect(() => { fetchLeads(); return () => abortRef.current?.abort(); }, [fetchLeads]);
  useEffect(() => { setPage(1); }, [filter, prodFilter, debKeyword]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Lead Management</div>
          <div className="page-subtitle">Quản lý khách hàng tiềm năng – Banking</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => openModal("modal-import-lead")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import Lead
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-lead")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo Lead mới
          </button>
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { color: "blue",  value: loading ? "…" : total,                        label: "Tổng Leads tháng",        trend: "" },
          { color: "gold",  value: loading ? "…" : leads.filter(l=>l.status==="hot").length,  label: "Lead Nóng",    trend: "" },
          { color: "green", value: "2.4 ngày",                                    label: "Phản hồi trung bình",     trend: "" },
          { color: "red",   value: loading ? "…" : leads.filter(l=>l.status==="cold").length, label: "Lead Lạnh",   trend: "" },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top">
              <div className={`metric-card__icon metric-card__icon--${m.color}`}>
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
            </div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-row">
        {[{ key: "all", label: `Tất cả (${total})` }, { key: "hot", label: "🔥 Nóng" }, { key: "warm", label: "🌤 Ấm" }, { key: "cold", label: "❄ Lạnh" }].map((f) => (
          <div key={f.key} className={`filter-chip${filter === f.key ? " filter-chip--active" : ""}`} onClick={() => setFilter(f.key)}>{f.label}</div>
        ))}
        <select className="filter-select" value={prodFilter} onChange={(e) => setProdFilter(e.target.value)}>
          <option value="all">Tất cả sản phẩm</option>
          <option value="vay">Vay tài sản</option>
          <option value="sme">Vay doanh nghiệp</option>
          <option value="the">Thẻ tín dụng</option>
          <option value="tk">Tiết kiệm</option>
          <option value="banca">Bancassurance</option>
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 12px", minWidth: 180, marginLeft: "auto" }}>
          <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: "var(--text-muted)", fill: "none", strokeWidth: 2, strokeLinecap: "round", flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font)", fontSize: 12, flex: 1 }} placeholder="Tìm tên, số điện thoại..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <button className="btn-icon-sm" onClick={fetchLeads} title="Làm mới">↻</button>
      </div>

      {error && (
        <div className="info-banner info-banner--danger" style={{ marginBottom: 12 }}>
          ⚠ {error} <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: 8 }} onClick={fetchLeads}>Thử lại</span>
        </div>
      )}

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th><th>Sản phẩm</th><th>Giá trị ước tính</th>
                <th>Nguồn</th><th>RM phụ trách</th><th>Trạng thái</th><th>Ngày tạo</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                : leads.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>{error ? "Không thể tải dữ liệu" : "Không có lead nào phù hợp"}</td></tr>
                  : leads.map((lead) => (
                    <tr key={lead.id} onClick={() => setActivePage("customers")}>
                      <td><div className="td-name">{lead.name}</div><div className="td-sub">{lead.sub}</div></td>
                      <td><ProductTag product={lead.product} /></td>
                      <td style={{ fontWeight: 700, color: "var(--accent-bright)" }}>{lead.value}</td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lead.source}</td>
                      <td style={{ fontSize: 12 }}>{lead.rm}</td>
                      <td><StatusBadge status={lead.status} /></td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lead.date}</td>
                      <td><button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openModal("modal-new-opportunity"); }}>Tạo deal</button></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {!loading && total > 20 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {Math.min((page-1)*20+1, total)}–{Math.min(page*20, total)} / {total} leads
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-icon-sm" disabled={page <= 1} onClick={() => setPage(p => p-1)}>‹ Trước</button>
              <span style={{ padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>Trang {page}/{Math.ceil(total/20)}</span>
              <button className="btn-icon-sm" disabled={page >= Math.ceil(total/20)} onClick={() => setPage(p => p+1)}>Sau ›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
