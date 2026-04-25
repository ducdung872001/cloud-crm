// [MH] Tickets — 2-pane list + detail
import React, { useState } from "react";
import { MOCK_TICKETS } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

const priorityColor: Record<string, string> = { high: "mh__pill--red", medium: "mh__pill--amber", low: "mh__pill--draft" };
const statusColor: Record<string, string> = { open: "mh__pill--red", pending: "mh__pill--amber", resolved: "mh__pill--green" };

export default function MHTickets() {
  document.title = "Hỗ trợ · MentorHub";
  const [selected, setSelected] = useState(MOCK_TICKETS[0]);
  const [filter, setFilter] = useState<string>("all");
  const [reply, setReply] = useState("");
  const filtered = MOCK_TICKETS.filter((t) => filter === "all" || t.status === filter);
  const counts = { open: MOCK_TICKETS.filter((t) => t.status === "open").length, pending: MOCK_TICKETS.filter((t) => t.status === "pending").length, resolved: MOCK_TICKETS.filter((t) => t.status === "resolved").length };

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">HỖ TRỢ · TICKET</div>
        <h1>Ticket <em>hỗ trợ</em></h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>{counts.open} mở · {counts.pending} chờ · 2 quá SLA</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ v: "all", l: `Tất cả (${MOCK_TICKETS.length})` }, { v: "open", l: `Mở (${counts.open})` }, { v: "pending", l: `Chờ (${counts.pending})` }, { v: "resolved", l: `Đã xử lý (${counts.resolved})` }].map((o) => (
          <button key={o.v} className="mh__btn" style={filter === o.v ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)" } : {}} onClick={() => setFilter(o.v)}>{o.l}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, alignItems: "flex-start" }} className="mh-tickets-grid">
        <div className="mh__card" style={{ padding: 0, maxHeight: 600, overflowY: "auto" }}>
          {filtered.map((t) => (
            <div key={t.id} onClick={() => setSelected(t)} style={{ padding: 16, borderBottom: "1px solid var(--mh-line)", cursor: "pointer", background: selected.id === t.id ? "var(--mh-ivory-2)" : "#fff", borderLeft: selected.id === t.id ? "3px solid var(--mh-teal)" : "3px solid transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{t.id}</span>
                <span className={"mh__pill " + priorityColor[t.priority]}>{t.priority}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{t.subject}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--mh-ink-soft)" }}>
                <div className="mh__avatar mh__avatar--sm" style={{ background: t.avatarBg }}>{t.short}</div>
                <span>{t.student}</span>
                <span className="mh__mono">· {t.channel}</span>
              </div>
              <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", marginTop: 4 }}>{t.createdAt}</div>
            </div>
          ))}
        </div>

        <div className="mh__card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{selected.id} · {selected.channel} · {selected.createdAt}</div>
              <h2 style={{ fontSize: 22, margin: "4px 0 10px" }}>{selected.subject}</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div className="mh__avatar" style={{ background: selected.avatarBg }}>{selected.short}</div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{selected.student}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className={"mh__pill " + priorityColor[selected.priority]}>{selected.priority}</span>
              <span className={"mh__pill " + statusColor[selected.status]}>{selected.status}</span>
            </div>
          </div>

          <div className="mh__ai-card" style={{ marginBottom: 20 }}>
            <h4 className="mh__mono" style={{ fontSize: 11, letterSpacing: ".08em" }}>✦ AI CONTEXT</h4>
            <p style={{ margin: "8px 0 0", fontSize: 14 }}>{selected.aiContext}</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="mh__kicker">SLA</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              {selected.slaHours > 0 ? <span style={{ color: selected.slaHours <= 2 ? "var(--mh-red)" : "inherit" }}>Còn {selected.slaHours}h đến hạn</span> : <span style={{ color: "var(--mh-green)" }}>✓ Đã đóng</span>}
            </div>
          </div>

          {selected.status !== "resolved" && (
            <div>
              <div className="mh__kicker" style={{ marginBottom: 8 }}>TRẢ LỜI</div>
              <textarea className="mh__textarea" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Soạn tin nhắn… (AI có thể gợi ý)" style={{ marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="mh__btn mh__btn--primary">Gửi trả lời</button>
                <button className="mh__btn">✦ Gợi ý AI</button>
                <button className="mh__btn">📎 Đính kèm</button>
                <div style={{ flex: 1 }} />
                <button className="mh__btn">✓ Đánh dấu đã giải quyết</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .mh-tickets-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
