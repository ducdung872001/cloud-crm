import { useState } from "react";
import { Field, FieldRow, Input, Select } from "../../components/ui";
import { useApp } from "../../context/AppContext";

interface LogEntry {
  id: string;
  ts: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  status: "ok" | "fail";
}

const LOGS: LogEntry[] = [
  { id: "1", ts: "18/04 15:42:11", user: "ceo@reborn.vn", action: "urd.approve", resource: "MEGAMART/URD v1.3", ip: "117.6.x.x", status: "ok" },
  {
    id: "2",
    ts: "18/04 15:38:02",
    user: "huong.c@reborn.vn",
    action: "prototype.regenerate",
    resource: "MEGAMART/proto-v2",
    ip: "14.166.x.x",
    status: "ok",
  },
  { id: "3", ts: "18/04 14:22:56", user: "ai.agent", action: "deploy.staging", resource: "MEGAMART/fe", ip: "internal", status: "ok" },
  { id: "4", ts: "18/04 13:15:08", user: "duc.a@reborn.vn", action: "api.keys.rotate", resource: "Anthropic key", ip: "117.6.x.x", status: "ok" },
  { id: "5", ts: "18/04 11:02:33", user: "lan.c@reborn.vn", action: "login.fail", resource: "auth", ip: "14.166.x.x", status: "fail" },
  { id: "6", ts: "18/04 09:48:21", user: "ai.agent", action: "ai.quota.exceed", resource: "TPBANK", ip: "internal", status: "fail" },
];

export default function AuditLogSettings() {
  const { showToast } = useApp();
  const [q, setQ] = useState("");
  const [user, setUser] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = LOGS.filter((l) => {
    if (q && !`${l.action} ${l.resource} ${l.user}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (user !== "all" && l.user !== user) return false;
    if (status !== "all" && l.status !== status) return false;
    return true;
  });

  return (
    <div>
      <div className="settings-section-title">Audit log</div>
      <div className="settings-section-sub">Ghi nhận mọi hành động trên platform. Giữ 365 ngày (cấu hình ở tab Data retention).</div>

      <FieldRow>
        <Field label="Tìm kiếm">
          <Input placeholder="action / resource / user..." value={q} onChange={(e) => setQ(e.target.value)} />
        </Field>
        <Field label="User">
          <Select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "ceo@reborn.vn", label: "ceo@reborn.vn" },
              { value: "ai.agent", label: "AI Agent" },
            ]}
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Status">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "ok", label: "OK" },
              { value: "fail", label: "Fail" },
            ]}
          />
        </Field>
        <Field label="Khoảng thời gian">
          <Select
            defaultValue="7d"
            options={[
              { value: "24h", label: "24h qua" },
              { value: "7d", label: "7 ngày qua" },
              { value: "30d", label: "30 ngày qua" },
              { value: "custom", label: "Tùy chọn..." },
            ]}
          />
        </Field>
      </FieldRow>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>IP</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{l.ts}</td>
                <td>{l.user}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{l.action}</td>
                <td>{l.resource}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--slate-500)" }}>{l.ip}</td>
                <td>
                  <span className={`tag ${l.status === "ok" ? "tag-ok" : "tag-warn"}`}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <button type="button" className="btn" onClick={() => showToast("info", "Export audit log", "CSV đã tải xuống")}>
          ↓ Export CSV
        </button>
      </div>
    </div>
  );
}
