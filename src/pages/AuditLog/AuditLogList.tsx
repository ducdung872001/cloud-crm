import React, { useState, useMemo } from "react";
import { MOCK_AUDIT_LOGS } from "assets/mock/TNPMData";

const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  auth: { label: "Xác thực", color: "#1890ff", icon: "🔐" },
  contract: { label: "Hợp đồng", color: "#722ed1", icon: "📄" },
  billing: { label: "Hóa đơn", color: "#13c2c2", icon: "💳" },
  payment: { label: "Thanh toán", color: "#52c41a", icon: "💰" },
  vendor: { label: "Nhà cung cấp", color: "#faad14", icon: "🏭" },
  config: { label: "Cấu hình", color: "#fa8c16", icon: "⚙️" },
  data: { label: "Dữ liệu nghiệp vụ", color: "#eb2f96", icon: "📊" },
  security: { label: "An ninh", color: "#ff4d4f", icon: "🛡️" },
};

const SEVERITY_META: Record<string, { label: string; color: string }> = {
  info: { label: "Thông tin", color: "#1890ff" },
  warning: { label: "Cảnh báo", color: "#faad14" },
  critical: { label: "Nghiêm trọng", color: "#ff4d4f" },
};

// ─── Detail Modal ─────────────────────────────────────────────────────────
function LogDetailModal({ log, onClose }: any) {
  const catMeta = CATEGORY_META[log.category];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📋 Chi tiết log #{log.id}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>Thời điểm</div>
              <div style={{ fontWeight: 700 }}>{log.timestamp}</div>
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 10 }}>Người thực hiện</div>
              <div style={{ fontWeight: 600 }}>{log.userName}</div>
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>{log.userRole}</div>
            </div>
            <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>Danh mục</div>
              <div>
                <span className="status-badge" style={{ background: `${catMeta?.color}22`, color: catMeta?.color }}>
                  {catMeta?.icon} {catMeta?.label}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 10 }}>Mức độ</div>
              <div>
                <span className="status-badge" style={{ background: `${SEVERITY_META[log.severity]?.color}22`, color: SEVERITY_META[log.severity]?.color }}>
                  {SEVERITY_META[log.severity]?.label}
                </span>
              </div>
            </div>
          </div>

          <div style={{ background: "#fffbe6", padding: 14, borderRadius: 6, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>Hành động</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{log.actionLabel}</div>
            <div style={{ fontSize: 12, color: "#595959", marginTop: 8 }}>{log.details}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ background: "#fff1f0", padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#8c8c8c", fontWeight: 600 }}>BEFORE</div>
              <pre style={{ fontSize: 11, margin: 0, marginTop: 6, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                {log.beforeState ? JSON.stringify(log.beforeState, null, 2) : "—"}
              </pre>
            </div>
            <div style={{ background: "#f6ffed", padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#8c8c8c", fontWeight: 600 }}>AFTER</div>
              <pre style={{ fontSize: 11, margin: 0, marginTop: 6, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                {log.afterState ? JSON.stringify(log.afterState, null, 2) : "—"}
              </pre>
            </div>
          </div>

          <div style={{ background: "#fafafa", padding: 12, borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: "#8c8c8c", marginBottom: 6 }}>Metadata</div>
            {[
              { l: "Entity", v: `${log.entityType} #${log.entityId || "—"} (${log.entityRef})` },
              { l: "Project", v: log.projectName || "—" },
              { l: "IP", v: log.ipAddress },
              { l: "User Agent", v: log.userAgent },
            ].map((i, idx) => (
              <div key={idx} style={{ display: "flex", padding: "4px 0", fontSize: 12 }}>
                <span style={{ width: 120, color: "#8c8c8c" }}>{i.l}</span>
                <span style={{ fontFamily: "monospace" }}>{i.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function AuditLogList() {
  document.title = "Audit Log – TNPM";

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterSev, setFilterSev] = useState("all");
  const [filterUser, setFilterUser] = useState("");
  const [detailTarget, setDetailTarget] = useState<any>(null);

  const filtered = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter((l: any) => {
      const q = search.toLowerCase();
      if (search && !l.userName.toLowerCase().includes(q) && !l.details.toLowerCase().includes(q) && !l.entityRef?.toLowerCase().includes(q)) return false;
      if (filterCat !== "all" && l.category !== filterCat) return false;
      if (filterSev !== "all" && l.severity !== filterSev) return false;
      if (filterUser && !l.userName.toLowerCase().includes(filterUser.toLowerCase())) return false;
      return true;
    });
  }, [search, filterCat, filterSev, filterUser]);

  const byCategory = useMemo(() => {
    const result: Record<string, number> = {};
    MOCK_AUDIT_LOGS.forEach((l: any) => { result[l.category] = (result[l.category] || 0) + 1; });
    return result;
  }, []);

  const criticalCount = MOCK_AUDIT_LOGS.filter((l: any) => l.severity === "critical").length;
  const warningCount = MOCK_AUDIT_LOGS.filter((l: any) => l.severity === "warning").length;
  const todayCount = MOCK_AUDIT_LOGS.filter((l: any) => l.timestamp.startsWith("2024-04-14")).length;

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🛡️ Audit Log</h1>
          <p className="page-sub">Lịch sử thao tác hệ thống — truy vết toàn bộ hoạt động cho compliance & security</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline">📊 Xuất CSV</button>
          <button className="btn btn-outline">🔍 Tìm kiếm nâng cao</button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Tổng log", value: `${MOCK_AUDIT_LOGS.length}`, sub: "7 ngày gần nhất", color: "#1890ff", icon: "📋" },
          { label: "Log hôm nay", value: `${todayCount}`, sub: "2024-04-14", color: "#722ed1", icon: "📅" },
          { label: "Cảnh báo", value: `${warningCount}`, sub: "severity: warning", color: "#faad14", icon: "⚠️" },
          { label: "Nghiêm trọng", value: `${criticalCount}`, sub: "Cần review", color: "#ff4d4f", icon: "🚨" },
          { label: "Cô lập tenant", value: "✓ OK", sub: "0 violations", color: "#52c41a", icon: "🛡️" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 14px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilterCat("all")}
          style={{
            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            background: filterCat === "all" ? "#1890ff" : "#fff",
            color: filterCat === "all" ? "#fff" : "#595959",
            fontSize: 12, fontWeight: 600,
            boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          }}
        >
          Tất cả ({MOCK_AUDIT_LOGS.length})
        </button>
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setFilterCat(key)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              background: filterCat === key ? meta.color : "#fff",
              color: filterCat === key ? "#fff" : meta.color,
              fontSize: 12, fontWeight: 600,
              boxShadow: "0 1px 4px rgba(0,0,0,.06)",
            }}
          >
            {meta.icon} {meta.label} ({byCategory[key] || 0})
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input className="search-input" style={{ flex: 1 }} placeholder="🔍 Tìm theo user, entity, chi tiết..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterSev} onChange={(e) => setFilterSev(e.target.value)}>
          <option value="all">Mọi mức độ</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <input className="search-input" style={{ width: 180 }} placeholder="Lọc user..." value={filterUser} onChange={(e) => setFilterUser(e.target.value)} />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Thời điểm</th>
              <th>Người dùng</th>
              <th>Hành động</th>
              <th>Entity</th>
              <th>Danh mục</th>
              <th>Mức độ</th>
              <th>Dự án</th>
              <th>IP</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có log nào phù hợp.</td></tr>
            )}
            {filtered.map((l: any) => {
              const catMeta = CATEGORY_META[l.category];
              const sevMeta = SEVERITY_META[l.severity];
              return (
                <tr key={l.id} style={{ cursor: "pointer" }} onClick={() => setDetailTarget(l)}>
                  <td style={{ fontSize: 11, fontFamily: "monospace" }}>{l.timestamp}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{l.userName}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{l.userRole}</div>
                  </td>
                  <td style={{ fontSize: 12, maxWidth: 280 }}>
                    <div style={{ fontWeight: 500 }}>{l.actionLabel}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.details}</div>
                  </td>
                  <td style={{ fontSize: 11, fontFamily: "monospace" }}>
                    {l.entityType}
                    {l.entityRef && <div style={{ color: "#8c8c8c" }}>{l.entityRef}</div>}
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: `${catMeta?.color}22`, color: catMeta?.color }}>
                      {catMeta?.icon} {catMeta?.label}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: `${sevMeta?.color}22`, color: sevMeta?.color }}>
                      {sevMeta?.label}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: "#595959" }}>{l.projectName || "—"}</td>
                  <td style={{ fontSize: 10, fontFamily: "monospace", color: "#8c8c8c" }}>{l.ipAddress}</td>
                  <td>
                    <button className="action-btn" title="Xem chi tiết">👁</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailTarget && <LogDetailModal log={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  );
}
