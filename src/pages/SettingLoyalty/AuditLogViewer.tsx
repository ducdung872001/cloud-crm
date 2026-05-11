// Trình xem Audit Log loyalty
// Phục vụ UR-CFG-05 (URD part-11)
import React, { useEffect, useMemo, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

type ActionType =
  | "setting.scope.change"
  | "setting.expiry.change"
  | "setting.earn_rule.create"
  | "setting.earn_rule.update"
  | "setting.tier.update"
  | "setting.redemption_rate.change"
  | "setting.permission.change"
  | "points.manual_adjust"
  | "tier.manual_adjust"
  | "member.merge"
  | "member.delete_request"
  | "reward.create"
  | "campaign.launch"
  | "campaign.budget.increase"
  | "api_key.generate"
  | "api_key.revoke"
  | "bpm.workflow.deploy"
  | "bpm.instance.terminate";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: { id: string; name: string; role: string };
  action: ActionType;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  note?: string;
  ip: string;
  userAgent: string;
}

const SAMPLE: AuditEntry[] = [
  {
    id: "a-2026051101",
    timestamp: "2026-05-11T15:30:42+07:00",
    actor: { id: "u-201", name: "Phan Dung", role: "Tenant Admin" },
    action: "setting.scope.change",
    resourceType: "loyalty_config",
    resourceId: "config-001",
    resourceName: "Scope toàn chuỗi",
    before: { scope: "chain_wide", cross_brand_enabled: false },
    after: { scope: "per_brand", cross_brand_enabled: true, ratio_a_to_b: 0.8, ratio_b_to_a: 0.8 },
    note: "Đổi sang per-brand sau approval BOD (meeting 10/05)",
    ip: "203.162.34.12",
    userAgent: "Chrome 124 / Windows 11",
  },
  {
    id: "a-2026051102",
    timestamp: "2026-05-11T14:22:15+07:00",
    actor: { id: "u-150", name: "Nguyễn Thị Lan", role: "CSKH Supervisor" },
    action: "points.manual_adjust",
    resourceType: "member",
    resourceId: "m-77392",
    resourceName: "Trần Văn Hùng (+84905xx1234)",
    before: { balance: 1500 },
    after: { balance: 1800, delta: 300, reason: "compensation_complaint" },
    note: "Bồi thường do POS bug không tích đơn 03/05",
    ip: "10.20.15.42",
    userAgent: "Chrome 124 / Windows 11",
  },
  {
    id: "a-2026051103",
    timestamp: "2026-05-11T11:05:00+07:00",
    actor: { id: "u-301", name: "marketing.dung", role: "Marketing Manager" },
    action: "bpm.workflow.deploy",
    resourceType: "bpm_workflow",
    resourceId: "wf-001",
    resourceName: "Loyalty Quest May 2026 v1",
    after: { version: 1, status: "production", start: "2026-05-01", end: "2026-05-31" },
    note: "Deploy production sau sandbox test 14 ngày",
    ip: "203.162.34.50",
    userAgent: "Chrome 124 / Windows 11",
  },
  {
    id: "a-2026051104",
    timestamp: "2026-05-11T09:48:33+07:00",
    actor: { id: "u-201", name: "Phan Dung", role: "Tenant Admin" },
    action: "setting.expiry.change",
    resourceType: "loyalty_config",
    resourceId: "config-001",
    before: { expiry_mode: "never" },
    after: { expiry_mode: "after_months", months: 12 },
    note: "Áp dụng chính sách expire 12 tháng — preview ảnh hưởng 320K KH × 5.2B điểm",
    ip: "203.162.34.12",
    userAgent: "Chrome 124 / Windows 11",
  },
  {
    id: "a-2026051105",
    timestamp: "2026-05-10T16:20:00+07:00",
    actor: { id: "u-401", name: "ba.minh", role: "Brand Manager (Brand A)" },
    action: "campaign.launch",
    resourceType: "campaign",
    resourceId: "camp-2026-05-weekend",
    resourceName: "Cuối tuần × 2 điểm — Brand A",
    after: { budget_vnd: 50000000, target_segment: "active_60d_brand_a", estimated_reach: 380000 },
    note: "Approved bởi Marketing Director",
    ip: "203.162.34.55",
    userAgent: "Chrome 124 / Windows 11",
  },
  {
    id: "a-2026051106",
    timestamp: "2026-05-10T14:12:00+07:00",
    actor: { id: "u-150", name: "Nguyễn Thị Lan", role: "CSKH Supervisor" },
    action: "member.merge",
    resourceType: "member",
    resourceId: "m-77392",
    resourceName: "Merge m-44210 → m-77392",
    after: { primary: "m-77392", merged: "m-44210", phone: "+84905xx1234" },
    note: "KH có 2 thẻ Brand A + Brand B trùng phone, dedupe sau buổi gọi",
    ip: "10.20.15.42",
    userAgent: "Chrome 124 / Windows 11",
  },
  {
    id: "a-2026051107",
    timestamp: "2026-05-10T10:00:00+07:00",
    actor: { id: "u-201", name: "Phan Dung", role: "Tenant Admin" },
    action: "api_key.generate",
    resourceType: "api_key",
    resourceId: "k-001",
    resourceName: "POS Brand A — Production",
    after: { scopes: ["lookup", "auto_earn", "consume", "refund"], rate_limit: 1000, ip_whitelist: ["203.162.10.0/24"] },
    ip: "203.162.34.12",
    userAgent: "Chrome 124 / Windows 11",
  },
  {
    id: "a-2026050905",
    timestamp: "2026-05-09T17:30:00+07:00",
    actor: { id: "u-302", name: "marketing.lan", role: "Marketing Manager" },
    action: "campaign.budget.increase",
    resourceType: "campaign",
    resourceId: "camp-april-spring",
    resourceName: "Khuyến mãi Xuân — Brand B",
    before: { budget_vnd: 30000000, current_spend: 27500000 },
    after: { budget_vnd: 50000000 },
    note: "Tăng budget mid-flight do performance tốt — ROI 4.2x",
    ip: "203.162.34.55",
    userAgent: "Chrome 124 / Windows 11",
  },
];

const ACTION_LABELS: Record<ActionType, { label: string; group: string; severity: "info" | "warning" | "critical" }> = {
  "setting.scope.change": { label: "Đổi scope loyalty", group: "Cấu hình", severity: "critical" },
  "setting.expiry.change": { label: "Đổi chế độ expire điểm", group: "Cấu hình", severity: "warning" },
  "setting.earn_rule.create": { label: "Tạo earn rule", group: "Cấu hình", severity: "info" },
  "setting.earn_rule.update": { label: "Sửa earn rule", group: "Cấu hình", severity: "warning" },
  "setting.tier.update": { label: "Sửa tier", group: "Cấu hình", severity: "warning" },
  "setting.redemption_rate.change": { label: "Đổi tỷ giá quy đổi", group: "Cấu hình", severity: "critical" },
  "setting.permission.change": { label: "Đổi phân quyền", group: "Cấu hình", severity: "critical" },
  "points.manual_adjust": { label: "Adjust điểm thủ công", group: "Điểm", severity: "warning" },
  "tier.manual_adjust": { label: "Adjust tier thủ công", group: "Tier", severity: "warning" },
  "member.merge": { label: "Merge hội viên", group: "Hội viên", severity: "warning" },
  "member.delete_request": { label: "Yêu cầu xoá hội viên", group: "Hội viên", severity: "critical" },
  "reward.create": { label: "Tạo reward", group: "Reward", severity: "info" },
  "campaign.launch": { label: "Launch campaign", group: "Campaign", severity: "info" },
  "campaign.budget.increase": { label: "Tăng budget campaign", group: "Campaign", severity: "warning" },
  "api_key.generate": { label: "Tạo API key", group: "Integration", severity: "warning" },
  "api_key.revoke": { label: "Revoke API key", group: "Integration", severity: "critical" },
  "bpm.workflow.deploy": { label: "Deploy BPM workflow", group: "BPM", severity: "info" },
  "bpm.instance.terminate": { label: "Terminate BPM instance", group: "BPM", severity: "critical" },
};

const SEVERITY_COLOR: Record<"info" | "warning" | "critical", { bg: string; fg: string; border: string }> = {
  info: { bg: "#EFF6FF", fg: "#1D4ED8", border: "#BFDBFE" },
  warning: { bg: "#FEF9E7", fg: "#92400E", border: "#FCD34D" },
  critical: { bg: "#FEE2E2", fg: "#991B1B", border: "#FCA5A5" },
};

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function AuditLogViewer({ onBackProps }: Props) {
  const [entries] = useState<AuditEntry[]>(SAMPLE);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  useEffect(() => {
    document.title = "Audit Log";
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (severityFilter !== "all" && ACTION_LABELS[e.action].severity !== severityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${e.actor.name} ${e.resourceId} ${e.resourceName || ""} ${e.note || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, search, actionFilter, severityFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: entries.length,
      today: entries.filter((e) => e.timestamp.startsWith(today)).length,
      critical: entries.filter((e) => ACTION_LABELS[e.action].severity === "critical").length,
      uniqueActors: new Set(entries.map((e) => e.actor.id)).size,
    };
  }, [entries]);

  const handleExport = () => {
    alert(
      `Export ${filtered.length} audit entry → CSV. \n\n` +
        "File sẽ gồm: timestamp, actor, role, action, resource, before, after, note, ip.\n\n" +
        "Retention: 7 năm (NĐ 13/2023). File này append-only — không có cách xóa entry.",
    );
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "#F5F9F8" }}>
      {onBackProps && (
        <HeaderTabMenu title="Audit Log" titleBack="Cấu hình Loyalty" onBackProps={onBackProps} />
      )}

      <div style={{ padding: "20px 24px" }}>
        {/* Banner */}
        <div
          style={{
            background: "#F0F9FF",
            border: "1px solid #BAE6FD",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
            color: "#0C4A6E",
          }}
        >
          🔒 <b>Audit log append-only:</b> không edit/delete entry. Retention 7 năm. Mọi config change + manual adjust ghi
          tại đây. Có thể export CSV cho compliance review.
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          <Stat label="Tổng entries hôm nay" value={stats.today} icon="📅" />
          <Stat label="Critical actions" value={stats.critical} icon="🔴" valueColor="#DC2626" />
          <Stat label="Unique actors" value={stats.uniqueActors} icon="👥" />
          <Stat label="Tổng entries (last 30d)" value={stats.total} icon="📊" />
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 12,
            padding: 12,
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #E2E8F0",
          }}
        >
          <input
            placeholder="Tìm actor, resource, note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              fontSize: 13,
            }}
          />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              fontSize: 13,
              minWidth: 140,
            }}
          >
            <option value="all">Mọi mức</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              fontSize: 13,
              minWidth: 220,
            }}
          >
            <option value="all">Mọi action</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.group} — {v.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            style={{
              padding: "8px 14px",
              background: "#0E7490",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            📥 Export CSV
          </button>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {/* Log list */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <Th style={{ width: 150 }}>Thời gian</Th>
                  <Th>Action</Th>
                  <Th>Actor</Th>
                  <Th>Resource</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const meta = ACTION_LABELS[e.action];
                  const sev = SEVERITY_COLOR[meta.severity];
                  const isSelected = selectedEntry?.id === e.id;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedEntry(isSelected ? null : e)}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        cursor: "pointer",
                        background: isSelected ? "#F0F9FF" : "transparent",
                      }}
                    >
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#475569" }}>
                        {formatTime(e.timestamp)}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              background: sev.bg,
                              color: sev.fg,
                              border: `1px solid ${sev.border}`,
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {meta.group}
                          </span>
                          <span style={{ fontWeight: 500, color: "#1E293B" }}>{meta.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: 500, color: "#1E293B", fontSize: 12 }}>{e.actor.name}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>{e.actor.role}</div>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12 }}>
                        <div style={{ color: "#1E293B", fontWeight: 500 }}>
                          {e.resourceName || e.resourceId}
                        </div>
                        <div style={{ color: "#94A3B8", fontFamily: "monospace", fontSize: 11 }}>
                          {e.resourceType} · {e.resourceId}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
                      Không có entry nào khớp bộ lọc
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedEntry && (
            <div
              style={{
                width: 420,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                padding: 20,
                height: "fit-content",
                position: "sticky",
                top: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{ACTION_LABELS[selectedEntry.action].group}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
                    {ACTION_LABELS[selectedEntry.action].label}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 20 }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: "grid", gap: 12, fontSize: 12 }}>
                <DetailRow label="Thời gian" value={formatTime(selectedEntry.timestamp, true)} />
                <DetailRow label="Actor" value={`${selectedEntry.actor.name} (${selectedEntry.actor.role})`} />
                <DetailRow label="Resource" value={selectedEntry.resourceName || selectedEntry.resourceId} />
                <DetailRow label="Resource ID" value={selectedEntry.resourceId} mono />
                <DetailRow label="IP" value={selectedEntry.ip} mono />
                <DetailRow label="User Agent" value={selectedEntry.userAgent} />
              </div>

              {selectedEntry.note && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    background: "#F8FAFC",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#475569",
                  }}
                >
                  <b>Note:</b> {selectedEntry.note}
                </div>
              )}

              {(selectedEntry.before || selectedEntry.after) && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Diff</div>
                  {selectedEntry.before && (
                    <div
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        borderRadius: 6,
                        padding: 10,
                        marginBottom: 6,
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "#991B1B",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      − before:
                      {"\n"}
                      {JSON.stringify(selectedEntry.before, null, 2)}
                    </div>
                  )}
                  {selectedEntry.after && (
                    <div
                      style={{
                        background: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        borderRadius: 6,
                        padding: 10,
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "#065F46",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      + after:
                      {"\n"}
                      {JSON.stringify(selectedEntry.after, null, 2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 14px",
        fontSize: 12,
        fontWeight: 600,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Stat({ label, value, icon, valueColor }: { label: string; value: number; icon: string; valueColor?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: valueColor || "#0F172A", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ color: "#0F172A", fontFamily: mono ? "monospace" : "inherit" }}>{value}</div>
    </div>
  );
}

function formatTime(iso: string, full = false): string {
  const d = new Date(iso);
  if (full) {
    return d.toLocaleString("vi-VN", { hour12: false, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  return d.toLocaleString("vi-VN", { hour12: false, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
