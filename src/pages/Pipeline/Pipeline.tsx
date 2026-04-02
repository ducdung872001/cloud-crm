import React, { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "contexts/AppContext";
import PipelineService from "services/PipelineService";

const STAGES = [
  { key: "approach",  label: "Tiếp cận",             color: "var(--accent-bright)", saleStatusId: 1 },
  { key: "consult",   label: "Tư vấn",               color: "var(--gold)",          saleStatusId: 2 },
  { key: "proposal",  label: "Lập hồ sơ / Đề xuất", color: "var(--purple)",        saleStatusId: 3 },
  { key: "appraisal", label: "Thẩm định & Duyệt",   color: "var(--warning)",       saleStatusId: 4 },
  { key: "closing",   label: "Chốt / Ký HĐ",         color: "var(--success)",       saleStatusId: 5 },
];

function normalizeDeal(item: any) {
  const stageMap: Record<number, string> = { 1: "approach", 2: "consult", 3: "proposal", 4: "appraisal", 5: "closing" };
  return {
    id:          item.id,
    name:        item.customer?.name || item.customerName || "—",
    meta:        `RM: ${item.employee?.name || item.employeeName || "—"}`,
    amount:      item.estimatedValue
      ? (item.estimatedValue >= 1_000_000_000
          ? `${(item.estimatedValue / 1_000_000_000).toFixed(1)} tỷ`
          : `${Math.round(item.estimatedValue / 1_000_000)} tr`)
      : "—",
    product:     item.productType || "tk",
    productLabel:item.productTypeName || "—",
    rmInitials:  (item.employee?.name || "?").split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase(),
    rmColor:     "#1565C0",
    date:        item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : "—",
    stage:       stageMap[item.saleStatusId] || "approach",
    highlight:   item.saleStatusId === 5 ? "won" : item.saleStatusId === 4 ? "pending" : undefined,
  };
}

function DealCard({ deal, onClick }: { deal: any; onClick: () => void }) {
  return (
    <div
      className={`deal-card${deal.highlight === "won" ? " deal-card--won-border" : deal.highlight === "pending" ? " deal-card--pending-border" : ""}`}
      onClick={onClick}
    >
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

export default function Pipeline() {
  const { openModal, showToast } = useApp();
  const [deals,   setDeals]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDeals = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      // Fetch all stages in parallel for kanban view
      const res = await PipelineService.listViewSale({ page: 1, limit: 100 }, abortRef.current.signal);
      if (res?.code === 0 || res?.success || res?.result) {
        const items = res.result?.items || res.result || [];
        setDeals(items.map(normalizeDeal));
      } else {
        setError(res?.message || "Không tải được pipeline");
        setDeals([]);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError("Lỗi kết nối server");
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeals(); return () => abortRef.current?.abort(); }, [fetchDeals]);

  const totalValue = deals.reduce((sum, d) => {
    const raw = d.amount.replace(" tỷ", "").replace(" tr", "");
    const mult = d.amount.includes("tỷ") ? 1 : 0.001;
    return sum + (parseFloat(raw) || 0) * mult;
  }, 0);

  const dealsByStage = (stageKey: string) => deals.filter(d => d.stage === stageKey);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pipeline & Cơ hội</div>
          <div className="page-subtitle">Quản lý cơ hội bán hàng theo giai đoạn</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => openModal("modal-pipeline-filter")}>
            <svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Lọc
          </button>
          <button className="btn btn--ghost" onClick={fetchDeals} title="Làm mới">
            <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-opportunity")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo cơ hội
          </button>
        </div>
      </div>

      <div className="metric-grid">
        {[
          { color: "blue",   value: loading ? "…" : deals.length,        label: "Cơ hội đang mở" },
          { color: "gold",   value: loading ? "…" : `${totalValue.toFixed(1)} tỷ`, label: "Tổng giá trị pipeline" },
          { color: "green",  value: loading ? "…" : dealsByStage("closing").length, label: "Sắp chốt (Closing)" },
          { color: "purple", value: loading ? "…" : dealsByStage("appraisal").length, label: "Đang thẩm định" },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top">
              <div className={`metric-card__icon metric-card__icon--${m.color}`}>
                <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
            </div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="info-banner info-banner--danger" style={{ marginBottom: 12 }}>
          ⚠ {error} <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: 8 }} onClick={fetchDeals}>Thử lại</span>
        </div>
      )}

      <div className="card" style={{ overflow: "visible" }}>
        <div className="card__header">
          <span className="card__title">Kanban Pipeline</span>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="filter-select">
              <option>Tất cả sản phẩm</option>
              <option>Vay</option><option>Thẻ</option><option>Tiết kiệm</option><option>Banca</option>
            </select>
            <select className="filter-select">
              <option>Tất cả RM</option>
            </select>
          </div>
        </div>
        <div style={{ padding: "14px 18px" }}>
          {loading ? (
            <div style={{ display: "flex", gap: 10 }}>
              {STAGES.map((s) => (
                <div key={s.key} className="pipeline-col">
                  <div className="pipeline-stage">{s.label} <span className="stage-count">…</span></div>
                  {[1,2].map((i) => (
                    <div key={i} style={{ background: "var(--surface)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
                      {[80,60,40].map((w,j) => <div key={j} style={{ height: 12, borderRadius: 4, background: "var(--surface-hover)", width: `${w}%`, marginBottom: 6 }} />)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="pipeline-wrap">
              {STAGES.map((stage) => {
                const stageDeals = dealsByStage(stage.key);
                return (
                  <div key={stage.key} className="pipeline-col">
                    <div className="pipeline-stage" style={{ color: stage.color }}>
                      {stage.label} <span className="stage-count">{stageDeals.length}</span>
                    </div>
                    {stageDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} onClick={() => openModal("modal-deal-detail")} />
                    ))}
                    {stageDeals.length === 0 && (
                      <div style={{ color: "var(--text-muted)", fontSize: 11, textAlign: "center", padding: "16px 8px", borderRadius: 8, border: "1px dashed var(--border)" }}>
                        Không có cơ hội
                      </div>
                    )}
                    <div className="pipeline-add-btn" onClick={() => openModal("modal-new-opportunity")}>
                      + Thêm cơ hội
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
