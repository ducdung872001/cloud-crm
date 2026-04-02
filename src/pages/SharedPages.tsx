import React, { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "contexts/AppContext";
import { MOCK_DOCS, MOCK_CUSTOMERS } from "configs/mockData";
import { ApprovalService, TaskService, KpiService, NpsService, CampaignService } from "services/index";

// ─── Shared skeleton ──────────────────────────────────────────────────
function Skeleton({ h = 14, w = "80%", mb = 6 }: { h?: number; w?: string; mb?: number }) {
  return <div style={{ height: h, borderRadius: 4, background: "var(--surface-hover)", width: w, marginBottom: mb }} />;
}

function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="info-banner info-banner--danger" style={{ marginBottom: 12 }}>
      ⚠ {msg}&nbsp;
      <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={onRetry}>Thử lại</span>
    </div>
  );
}

// ─── Normalize helpers ────────────────────────────────────────────────
function normalizeApproval(item: any) {
  return {
    id:       item.id,
    code:     item.code || `PD-${item.id}`,
    customer: item.customer?.name || item.customerName || "—",
    type:     item.type || item.approvalType || "—",
    value:    item.value || "—",
    rm:       item.employee?.name || item.employeeName || "—",
    status:   item.status || "pending",
    deadline: item.deadline
      ? new Date(item.deadline).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit" })
      : "—",
  };
}

function normalizeTask(item: any) {
  const priMap: Record<string, string> = { high: "high", 1: "high", medium: "med", 2: "med", low: "low", 3: "low" };
  return {
    id:       item.id,
    name:     item.title || item.name || "—",
    meta:     [
      item.scheduledTime || item.dueTime,
      item.type || item.activityType,
      item.employee?.name || item.assigneeName,
    ].filter(Boolean).join(" · ") || "—",
    priority: priMap[String(item.priority)] || "med",
    done:     item.status === "done" || item.isDone || false,
    day:      item.dueDate
      ? (new Date(item.dueDate).toDateString() === new Date().toDateString() ? "today" : "tomorrow")
      : "today",
  };
}

// ═══════════════════════════════════════════════════════════════════════
// SALES DOCS  (no API yet in retail for artifact — keep static until
// backend endpoint is confirmed; using MOCK with TODO marker)
// ═══════════════════════════════════════════════════════════════════════
export function SalesDocs() {
  const { openModal, showToast } = useApp();
  const [docFilter, setDocFilter] = useState("all");
  // TODO: replace with DocsService.list() once /adminapi/artifact/list is confirmed
  const filtered = MOCK_DOCS.filter((d) => docFilter === "all" || d.type === docFilter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tài liệu bán hàng</div>
          <div className="page-subtitle">Script, brochure & biểu mẫu cho RM</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => showToast("Tải xuống toàn bộ thư viện", "info")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Tải tất cả
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-doc")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Upload tài liệu
          </button>
        </div>
      </div>
      <div className="filter-row">
        {[{ key: "all", label: "Tất cả" }, { key: "script", label: "📄 Script" }, { key: "rate", label: "📊 Biểu phí" }, { key: "brochure", label: "🖼 Brochure" }, { key: "form", label: "📋 Mẫu biểu" }].map((f) => (
          <div key={f.key} className={`filter-chip${docFilter === f.key ? " filter-chip--active" : ""}`} onClick={() => setDocFilter(f.key)}>{f.label}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map((doc) => (
          <div key={doc.id} className="doc-card" onClick={() => openModal("modal-view-doc")}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div className="doc-card__icon" style={{ background: doc.tagColor }}>{doc.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="doc-card__name">{doc.name}</div>
                <div className="doc-card__meta">{doc.size} · Cập nhật {doc.updated}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <span className="doc-tag-chip" style={{ background: doc.tagColor, color: doc.tagTextColor }}>
                    {doc.type === "script" ? "Script" : doc.type === "rate" ? "Biểu phí" : doc.type === "brochure" ? "Brochure" : "Mẫu biểu"}
                  </span>
                  <span className="doc-tag-chip" style={{ background: doc.productColor, color: doc.productTextColor }}>{doc.product}</span>
                </div>
              </div>
            </div>
            <div className="doc-card__actions">
              <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); openModal("modal-view-doc"); }}>Xem</button>
              <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); showToast("Đã tải xuống", "success"); }}>Tải</button>
              <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); showToast("Đã chia sẻ link", "success"); }}>Chia sẻ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CUSTOMER 360  (mock — real data would come from LeadService.detail)
// ═══════════════════════════════════════════════════════════════════════
export function Customer360() {
  const { openModal, showToast } = useApp();
  const [activeIdx, setActiveIdx] = useState(0);
  const kh = MOCK_CUSTOMERS[activeIdx];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Customer 360°</div><div className="page-subtitle">Hồ sơ KH toàn diện</div></div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => openModal("modal-new-lead")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm KH mới
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <div className="card">
          <div className="card__header"><span className="card__title">Danh sách KH</span></div>
          <div style={{ padding: "6px 0" }}>
            {MOCK_CUSTOMERS.map((c, i) => (
              <div key={c.id} className={`kh-item${i === activeIdx ? " kh-active" : ""}`} onClick={() => setActiveIdx(i)}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>{c.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{c.typeLabel} · {c.rmCode}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", flexShrink: 0 }}>{kh.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{kh.name}</div>
                  <span className={`c360-type c360-type--${kh.type}`}>{kh.type === "vip" ? "★ " : ""}{kh.typeLabel}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{kh.phone} · {kh.email} · {kh.address}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn btn--primary btn--sm" onClick={() => showToast("Đang kết nối tổng đài...", "info")}>📞 Gọi</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => openModal("modal-new-task")}>📅 Lịch hẹn</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => openModal("modal-new-opportunity")}>+ Cơ hội</button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card">
              <div className="card__header"><span className="card__title">Sản phẩm đang dùng</span></div>
              <div className="card__body" style={{ paddingTop: 10 }}>
                <div className="c360-products" style={{ padding: 0 }}>
                  {kh.products.map((p) => (
                    <div key={p.label} className="c360-product">
                      <div className="c360-pname">{p.label}</div>
                      <div className="c360-pval" style={{ color: p.color || "var(--text-primary)" }}>{p.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card__header"><span className="card__title">Cảnh báo & Cơ hội</span></div>
              <div className="card__body" style={{ paddingTop: 10, paddingBottom: 10 }}>
                {kh.signals.map((s) => (
                  <div key={s.title} className={`signal-item signal-item--${s.type}`} onClick={() => openModal("modal-new-task")}>
                    {s.type === "upsell" && <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
                    {s.type === "renew"  && <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>}
                    {s.type === "alert"  && <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>}
                    <div className="signal-text"><strong>{s.title}:</strong> {s.desc}</div>
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

// ═══════════════════════════════════════════════════════════════════════
// TASKS  — real API via TaskService
// ═══════════════════════════════════════════════════════════════════════
export function Tasks() {
  const { openModal } = useApp();
  const [tasks,   setTasks]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchTasks = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);
    try {
      const res = await TaskService.list({ page: 1, limit: 50 }, abortRef.current.signal);
      if (res?.code === 0 || res?.result) {
        setTasks((res.result?.items || res.result || []).map(normalizeTask));
      } else {
        setError(res?.message || "Không tải được tasks");
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError("Lỗi kết nối: " + e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); return () => abortRef.current?.abort(); }, [fetchTasks]);

  const toggle = (id: number) =>
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));

  const today    = tasks.filter((t) => t.day === "today");
  const tomorrow = tasks.filter((t) => t.day === "tomorrow");

  const taskItem = (task: any) => (
    <div key={task.id} className="task-item" onClick={() => toggle(task.id)}>
      <div className={`task-item__cb${task.done ? " task-item__cb--done" : ""}`} />
      <div className="task-item__content">
        <div className={`task-item__name${task.done ? " task-item__name--done" : ""}`}>{task.name}</div>
        <div className="task-item__meta">{task.meta}</div>
      </div>
      <div className={`task-item__pri task-item__pri--${task.priority}`}>
        {task.priority === "high" ? "Cao" : task.priority === "med" ? "TB" : "Thấp"}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks & Lịch hẹn</div>
          <div className="page-subtitle">
            {loading ? "Đang tải…" : `${today.filter(t => !t.done).length} tasks hôm nay chưa xong`}
          </div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={fetchTasks}>↻</button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-task")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo Task
          </button>
        </div>
      </div>
      {error && <ErrorBanner msg={error} onRetry={fetchTasks} />}
      <div className="two-col">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card__header">
              <span className="card__title">Hôm nay</span>
              {!loading && today.filter(t => t.priority === "high" && !t.done).length > 0 && (
                <span style={{ fontSize: 11, background: "var(--danger-soft)", color: "var(--danger)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                  {today.filter(t => t.priority === "high" && !t.done).length} khẩn cấp
                </span>
              )}
            </div>
            <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {loading
                ? [...Array(4)].map((_, i) => <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}><Skeleton /><Skeleton w="60%" /></div>)
                : today.length === 0
                  ? <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "16px 0", textAlign: "center" }}>Không có task hôm nay</div>
                  : today.map(taskItem)
              }
            </div>
          </div>
          {!loading && tomorrow.length > 0 && (
            <div className="card">
              <div className="card__header"><span className="card__title">Ngày mai</span></div>
              <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>{tomorrow.map(taskItem)}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mini calendar (static UI) */}
          <div className="card">
            <div className="card__header"><span className="card__title">Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</span></div>
            <div className="card__body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center", marginBottom: 8 }}>
                {["T2","T3","T4","T5","T6","T7","CN"].map((d) => <div key={d} style={{ fontSize: 10, color: "var(--text-muted)", padding: 4 }}>{d}</div>)}
              </div>
              {(() => {
                const now = new Date();
                const d1 = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
                const offset = d1 === 0 ? 6 : d1 - 1;
                const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
                    {cells.map((d, i) => (
                      <div key={i} style={{
                        fontSize: 12, padding: 5, borderRadius: 6, cursor: d ? "pointer" : "default",
                        background: d === now.getDate() ? "var(--accent)" : "transparent",
                        color: d === null ? "transparent" : d === now.getDate() ? "white" : "var(--text-secondary)",
                        fontWeight: d === now.getDate() ? 600 : 400,
                      }}>{d}</div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="card">
            <div className="card__header"><span className="card__title">Nhắc nhở hệ thống</span></div>
            <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {loading
                ? [...Array(3)].map((_, i) => <div key={i} className="activity-item"><div className="dot dot--alert" /><div style={{ flex: 1 }}><Skeleton /><Skeleton w="60%" /></div></div>)
                : tasks.filter(t => t.priority === "high" && !t.done).slice(0, 3).map((t, i) => (
                  <div key={i} className="activity-item">
                    <div className="dot dot--alert" />
                    <div className="text">{t.name}</div>
                    <div className="time">{t.meta.split("·")[0]?.trim() || "—"}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APPROVAL  — real API via ApprovalService
// ═══════════════════════════════════════════════════════════════════════
export function Approval() {
  const { openModal, showToast } = useApp();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filter,    setFilter]    = useState("all");
  const [page,      setPage]      = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  const fetchApprovals = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);
    try {
      const params: any = { page, limit: 20 };
      if (filter !== "all") params.status = filter;
      const res = await ApprovalService.list(params, abortRef.current.signal);
      if (res?.code === 0 || res?.result) {
        const items = res.result?.items || res.result || [];
        setApprovals(items.map(normalizeApproval));
        setTotal(res.result?.total || items.length);
      } else {
        setError(res?.message || "Không tải được danh sách phê duyệt");
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError("Lỗi kết nối: " + e.message);
    } finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetchApprovals(); return () => abortRef.current?.abort(); }, [fetchApprovals]);
  useEffect(() => { setPage(1); }, [filter]);

  const handleAction = async (id: number, status: "approved" | "rejected") => {
    try {
      await ApprovalService.updateStatus({ id, status });
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      showToast(`Đã ${status === "approved" ? "phê duyệt" : "từ chối"} #${id}`, status === "approved" ? "success" : "error");
    } catch {
      showToast("Lỗi cập nhật trạng thái", "error");
    }
  };

  const counts = {
    pending:   approvals.filter(a => a.status === "pending").length,
    reviewing: approvals.filter(a => a.status === "reviewing").length,
    approved:  approvals.filter(a => a.status === "approved").length,
    rejected:  approvals.filter(a => a.status === "rejected").length,
  };

  const iconForStatus = (s: string) => {
    if (s === "pending")  return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    if (s === "reviewing") return <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    if (s === "approved") return <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
    return <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Phê duyệt Hồ sơ</div>
          <div className="page-subtitle">Luồng duyệt: RM → Credit → Ban lãnh đạo</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={fetchApprovals}>↻</button>
          <button className="btn btn--ghost" onClick={() => openModal("modal-approval-filter")}>
            <svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Lọc
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-new-approval")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo đề xuất
          </button>
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { color: "gold",   label: "Chờ phê duyệt",  value: loading ? "…" : counts.pending },
          { color: "blue",   label: "Đang xem xét",   value: loading ? "…" : counts.reviewing },
          { color: "green",  label: "Đã phê duyệt",   value: loading ? "…" : counts.approved },
          { color: "red",    label: "Bị từ chối",      value: loading ? "…" : counts.rejected },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top"><div className={`metric-card__icon metric-card__icon--${m.color}`}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></div></div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-row">
        {[
          { key: "all",       label: `Tất cả (${total})` },
          { key: "pending",   label: `Chờ duyệt (${counts.pending})` },
          { key: "reviewing", label: `Đang xét (${counts.reviewing})` },
          { key: "approved",  label: `Đã duyệt (${counts.approved})` },
          { key: "rejected",  label: `Từ chối (${counts.rejected})` },
        ].map((f) => (
          <div key={f.key} className={`filter-chip${filter === f.key ? " filter-chip--active" : ""}`} onClick={() => setFilter(f.key)}>{f.label}</div>
        ))}
      </div>

      {error && <ErrorBanner msg={error} onRetry={fetchApprovals} />}

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          {loading
            ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-hover)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}><Skeleton /><Skeleton w="60%" /></div>
              </div>
            ))
            : approvals.length === 0
              ? <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Không có đề xuất nào</div>
              : approvals.map((apv) => (
                <div key={apv.id} className="approval-item" style={{ padding: "10px 18px" }} onClick={() => openModal("modal-approval-detail")}>
                  <div className={`approval-item__icon approval-item__icon--${apv.status}`}>
                    {iconForStatus(apv.status)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="approval-item__title">#{apv.code} · {apv.customer} – {apv.type}</div>
                    <div className="approval-item__meta">{apv.value} · RM: {apv.rm} · Hạn: {apv.deadline}</div>
                  </div>
                  {(apv.status === "pending" || apv.status === "reviewing") && (
                    <div className="approval-item__actions" onClick={(e) => e.stopPropagation()}>
                      <button className="apv-btn apv-btn--ok"     onClick={() => handleAction(apv.id, "approved")}>Duyệt</button>
                      <button className="apv-btn apv-btn--reject" onClick={() => handleAction(apv.id, "rejected")}>Từ chối</button>
                    </div>
                  )}
                  {apv.status === "approved" && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", fontWeight: 600, flexShrink: 0 }}>✓ Đã duyệt</span>}
                  {apv.status === "rejected" && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--danger-soft)",  color: "var(--danger)",  fontWeight: 600, flexShrink: 0 }}>✗ Từ chối</span>}
                </div>
              ))
          }
        </div>
        {!loading && total > 20 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{total} đề xuất</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-icon-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Trước</button>
              <span style={{ padding: "3px 10px", fontSize: 12 }}>Trang {page}/{Math.ceil(total / 20)}</span>
              <button className="btn-icon-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Sau ›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// KPI REPORT  — real API via KpiService
// ═══════════════════════════════════════════════════════════════════════
export function KpiReport() {
  const { showToast } = useApp();
  const [kpiData,    setKpiData]    = useState<any>(null);
  const [leaderboard,setLeaderboard]= useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const now = new Date();
  const abortRef = useRef<AbortController | null>(null);

  const fetchKpi = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);
    try {
      const [kpiRes, lbRes] = await Promise.all([
        KpiService.list({ month: now.getMonth() + 1, year: now.getFullYear() }),
        KpiService.objectList({ page: 1, limit: 10 }),
      ]);
      if (kpiRes?.code === 0 || kpiRes?.result) {
        setKpiData(kpiRes.result || kpiRes);
      }
      if (lbRes?.code === 0 || lbRes?.result) {
        const items = lbRes.result?.items || lbRes.result || [];
        setLeaderboard(items.map((item: any, i: number) => ({
          rank: i + 1,
          initials: (item.employee?.name || item.name || "?").split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase(),
          name: item.employee?.name || item.name || "—",
          branch: item.employee?.branch || item.branchName || "—",
          value: item.totalRevenue
            ? `${(item.totalRevenue / 1_000_000_000).toFixed(1)} tỷ`
            : "—",
          pct: item.achievementRate || 80,
          color: ["linear-gradient(135deg,#F5A623,#F57C00)", "linear-gradient(135deg,#1565C0,#2196F3)", "linear-gradient(135deg,#7B1FA2,#9C27B0)"][i] || "linear-gradient(135deg,#388E3C,#4CAF50)",
        })));
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError("Lỗi kết nối: " + e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKpi(); return () => abortRef.current?.abort(); }, [fetchKpi]);

  // Build KPI progress items from API data or show loading skeletons
  const kpiItems = kpiData?.goals || [
    { label: "Doanh số tín dụng (Vay)", actual: "—", target: "—", pct: 0, color: "var(--success)" },
    { label: "Số thẻ tín dụng mở mới", actual: "—", target: "—", pct: 0, color: "var(--accent)" },
    { label: "Huy động tiết kiệm",       actual: "—", target: "—", pct: 0, color: "var(--gold)" },
    { label: "Bancassurance (phí)",       actual: "—", target: "—", pct: 0, color: "var(--purple)" },
    { label: "Leads mới",                actual: "—", target: "—", pct: 0, color: "var(--accent-bright)" },
    { label: "NPS trung bình",            actual: "—", target: "—", pct: 0, color: "var(--success)" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Báo cáo KPI</div>
          <div className="page-subtitle">Tháng {now.getMonth() + 1}/{now.getFullYear()} · Chi nhánh Hà Nội</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={fetchKpi}>↻</button>
          <button className="btn btn--ghost" onClick={() => showToast("Đang xuất báo cáo PDF…", "info")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {error && <ErrorBanner msg={error} onRetry={fetchKpi} />}

      <div className="metric-grid">
        {[
          { color: "gold",  label: "Tổng doanh số", value: loading ? "…" : (kpiData?.totalRevenue ? `${(kpiData.totalRevenue / 1e9).toFixed(1)} tỷ` : "—") },
          { color: "green", label: "Deals đã chốt",  value: loading ? "…" : (kpiData?.closedDeals ?? "—") },
          { color: "blue",  label: "NPS trung bình", value: loading ? "…" : (kpiData?.avgNps ?? "—") },
          { color: "red",   label: "Hồ sơ từ chối",  value: loading ? "…" : (kpiData?.rejectedCount ?? "—") },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top"><div className={`metric-card__icon metric-card__icon--${m.color}`}><svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg></div></div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card__header"><span className="card__title">KPI Chi tiết – Tháng {now.getMonth() + 1}</span></div>
          <div className="card__body">
            {loading
              ? [...Array(6)].map((_, i) => <div key={i} className="progress-item"><Skeleton /><div className="progress-bar" /></div>)
              : kpiItems.map((k: any) => (
                <div key={k.label} className="progress-item">
                  <div className="progress-label-row">
                    <span className="progress-label">{k.label}</span>
                    <span className="pct" style={{ color: k.color }}>{k.actual} / {k.target}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${Math.min(k.pct, 100)}%`, background: k.color }} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div className="card">
          <div className="card__header"><span className="card__title">Leaderboard RM</span><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Tháng {now.getMonth() + 1}</span></div>
          <div className="card__body" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {loading
              ? [...Array(5)].map((_, i) => (
                <div key={i} className="lb-item">
                  <div style={{ width: 20 }} /><div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-hover)" }} />
                  <div style={{ flex: 1 }}><Skeleton /><Skeleton w="60%" /></div>
                </div>
              ))
              : leaderboard.length === 0
                ? <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "20px 0", textAlign: "center" }}>Không có dữ liệu</div>
                : leaderboard.map((lb) => (
                  <div key={lb.rank} className="lb-item">
                    <div className={`rank${lb.rank <= 3 ? " rank--top" : ""}`}>{lb.rank}</div>
                    <div className="avatar" style={{ background: lb.color }}>{lb.initials}</div>
                    <div className="info"><div className="name">{lb.name}</div><div className="branch">{lb.branch}</div></div>
                    <div style={{ textAlign: "right" }}>
                      <div className="val">{lb.value}</div>
                      <div className="bar-wrap"><div className="bar" style={{ width: `${lb.pct}%` }} /></div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Revenue chart (static visual, data from kpiData in future) */}
      <div className="three-col">
        <div className="card">
          <div className="card__header"><span className="card__title">Doanh số 6 tháng</span></div>
          <div className="card__body">
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              {[["var(--accent)", "Thực tế"], ["rgba(33,150,243,0.25)", "Mục tiêu"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-secondary)" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}</div>
              ))}
            </div>
            <div className="chart-area">
              {[[70,80],[55,75],[80,78],[65,82],[90,85],[75,90]].map(([a,b],i) => (
                <div key={i} className="bar-group"><div className="cb cb--a" style={{ height: `${a}%` }} /><div className="cb cb--b" style={{ height: `${b}%` }} /></div>
              ))}
            </div>
            <div className="chart-x">{["T10","T11","T12","T1","T2","T3"].map(m => <span key={m}>{m}</span>)}</div>
          </div>
        </div>
        <div className="card">
          <div className="card__header"><span className="card__title">Cơ cấu sản phẩm</span></div>
          <div className="card__body">
            <div className="donut-wrap">
              <svg width="100" height="100" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--accent)"   strokeWidth="3.8" strokeDasharray="44 56" strokeDashoffset="25"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--gold)"    strokeWidth="3.8" strokeDasharray="22 78" strokeDashoffset="-19"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--success)" strokeWidth="3.8" strokeDasharray="20 80" strokeDashoffset="-41"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--purple)"  strokeWidth="3.8" strokeDasharray="14 86" strokeDashoffset="-61"/>
              </svg>
              <div className="donut-legend">
                {[
                  { c: "var(--accent)",  l: "Vay tài sản/DN", p: "44%", pc: "var(--accent-bright)" },
                  { c: "var(--gold)",    l: "Thẻ tín dụng",   p: "22%", pc: "var(--gold)" },
                  { c: "var(--success)", l: "Tiết kiệm/TG",   p: "20%", pc: "var(--success)" },
                  { c: "var(--purple)",  l: "Bancassurance",  p: "14%", pc: "var(--purple)" },
                ].map((d) => (
                  <div key={d.l} className="dl-item">
                    <div className="dl-dot" style={{ background: d.c }} />
                    <span className="dl-label">{d.l}</span>
                    <span className="dl-pct" style={{ color: d.pc }}>{d.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__header"><span className="card__title">Hoạt động theo ngày</span></div>
          <div className="card__body">
            <div className="chart-area">
              {[[60,40,30],[80,50,20],[55,45,40],[75,60,50],[90,70,60],[65,55,45]].map((bars, i) => (
                <div key={i} className="bar-group">
                  {bars.map((h, j) => (
                    <div key={j} className="cb" style={{ height: `${h}%`, background: ["var(--accent)","var(--gold)","var(--success)"][j] }} />
                  ))}
                </div>
              ))}
            </div>
            <div className="chart-x">{["T2","T3","T4","T5","T6","T7"].map(m => <span key={m}>{m}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NPS  — real API via NpsService
// ═══════════════════════════════════════════════════════════════════════
export function NPS() {
  const { openModal } = useApp();
  const [responses, setResponses] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const normalizeNps = (item: any) => ({
    id:        item.id,
    initials:  (item.customer?.name || item.customerName || "?").split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase(),
    name:      item.customer?.name || item.customerName || "—",
    type:      item.customer?.type || "Cá nhân",
    rm:        item.employee?.name || item.employeeName || "—",
    score:     item.score ?? 0,
    scoreType: item.score >= 9 ? "promoter" : item.score >= 7 ? "passive" : "detractor",
    comment:   item.comment || item.feedback || "—",
  });

  const fetchNps = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);
    try {
      const res = await NpsService.list({ page: 1, limit: 20 });
      if (res?.code === 0 || res?.result) {
        setResponses((res.result?.items || res.result || []).map(normalizeNps));
      } else { setError(res?.message || "Không tải được NPS"); }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError("Lỗi kết nối: " + e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNps(); return () => abortRef.current?.abort(); }, [fetchNps]);

  const promoters  = responses.filter(r => r.scoreType === "promoter").length;
  const detractors = responses.filter(r => r.scoreType === "detractor").length;
  const npsScore   = responses.length > 0 ? Math.round(((promoters - detractors) / responses.length) * 100) : 0;
  const avgScore   = responses.length > 0 ? (responses.reduce((s, r) => s + r.score, 0) / responses.length).toFixed(1) : "—";

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">NPS & Chăm sóc KH</div><div className="page-subtitle">Net Promoter Score</div></div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={fetchNps}>↻</button>
          <button className="btn btn--ghost" onClick={() => openModal("modal-send-survey")}>
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Gửi khảo sát
          </button>
        </div>
      </div>

      {error && <ErrorBanner msg={error} onRetry={fetchNps} />}

      <div className="metric-grid">
        {[
          { color: "green",  label: "NPS Score",         value: loading ? "…" : npsScore },
          { color: "blue",   label: "Tổng phản hồi",     value: loading ? "…" : responses.length },
          { color: "gold",   label: "Promoters",          value: loading ? "…" : promoters },
          { color: "red",    label: "Detractors",         value: loading ? "…" : detractors },
        ].map((m) => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top"><div className={`metric-card__icon metric-card__icon--${m.color}`}><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div></div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card__header"><span className="card__title">Phản hồi gần đây</span></div>
          <div className="card__body" style={{ padding: 0 }}>
            {loading
              ? [...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-hover)" }} />
                  <div style={{ flex: 1 }}><Skeleton /><Skeleton w="70%" /></div>
                  <div style={{ width: 36, height: 36, background: "var(--surface-hover)", borderRadius: 6 }} />
                </div>
              ))
              : responses.length === 0
                ? <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Chưa có dữ liệu NPS</div>
                : responses.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                    onClick={() => openModal("modal-nps-detail")}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>{r.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.comment}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: r.scoreType === "promoter" ? "var(--success)" : r.scoreType === "passive" ? "var(--warning)" : "var(--danger)" }}>{r.score}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{r.scoreType === "promoter" ? "Promoter" : r.scoreType === "passive" ? "Passive" : "Detractor"}</div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card__header"><span className="card__title">Điểm trung bình</span></div>
            <div className="card__body" style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: "var(--success)", lineHeight: 1 }}>{loading ? "…" : avgScore}</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 8 }}>/ 10 điểm</div>
              <div style={{ marginTop: 16 }}>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-bar__fill" style={{ width: `${loading ? 0 : (parseFloat(avgScore as string) || 0) * 10}%`, background: "var(--success)" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                <span>0 – Detractor</span><span>7-8 – Passive</span><span>9-10 – Promoter</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card__header"><span className="card__title">Phân phối điểm</span></div>
            <div className="card__body">
              {[
                { label: "Promoters (9-10)", count: loading ? "…" : promoters,  pct: loading ? 0 : Math.round(promoters/Math.max(responses.length,1)*100),  color: "var(--success)" },
                { label: "Passives (7-8)",   count: loading ? "…" : responses.filter(r=>r.scoreType==="passive").length,  pct: loading ? 0 : Math.round(responses.filter(r=>r.scoreType==="passive").length/Math.max(responses.length,1)*100),  color: "var(--warning)" },
                { label: "Detractors (0-6)", count: loading ? "…" : detractors, pct: loading ? 0 : Math.round(detractors/Math.max(responses.length,1)*100),  color: "var(--danger)" },
              ].map((item) => (
                <div key={item.label} className="progress-item">
                  <div className="progress-label-row">
                    <span className="progress-label">{item.label}</span>
                    <span className="pct" style={{ color: item.color }}>{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${item.pct}%`, background: item.color }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
