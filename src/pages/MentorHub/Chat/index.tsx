// [MH] Chat — 3-pane: conv list + thread + compose (Zalo/Email/App multi-channel)
import React, { useState } from "react";
import { MOCK_STUDENTS } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

type Msg = { from: "me" | "them"; text: string; time: string; channel?: string };
const INITIAL: Record<string, Msg[]> = {
  "S-001": [
    { from: "them", text: "Thầy ơi buổi 3 em có ghi chú AI chưa ạ?", time: "09:12", channel: "Zalo" },
    { from: "me", text: "Có rồi em, thầy vừa share trong Portal nhé.", time: "09:30" },
    { from: "them", text: "Em thấy rồi, tuyệt quá. Cám ơn thầy 🙏", time: "09:35", channel: "Zalo" },
  ],
  "S-002": [
    { from: "them", text: "Em muốn book thêm 1 buổi tư vấn 1:1 về career path", time: "hôm qua", channel: "Email" },
  ],
  "S-006": [
    { from: "them", text: "Em chưa nhận được link buổi 3 ạ!", time: "2h trước", channel: "Zalo" },
  ],
};

export default function MHChat() {
  document.title = "Chat · MentorHub";
  const [selectedId, setSelectedId] = useState(MOCK_STUDENTS[0].id);
  const [threads, setThreads] = useState<Record<string, Msg[]>>(INITIAL);
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState<"App" | "Zalo" | "Email">("App");
  const [search, setSearch] = useState("");
  const selected = MOCK_STUDENTS.find((s) => s.id === selectedId)!;
  const msgs = threads[selectedId] || [];
  const send = () => {
    if (!input.trim()) return;
    setThreads((p) => ({ ...p, [selectedId]: [...(p[selectedId] || []), { from: "me", text: input, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), channel }] }));
    setInput("");
  };
  const filteredStudents = MOCK_STUDENTS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">CHAT</div>
        <h1>Kênh trao đổi <em>học viên</em></h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>{MOCK_STUDENTS.length} hội thoại · Gộp Zalo OA + Email + In-app</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, height: 640 }} className="mh-chat-grid">
        <div className="mh__card" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 12, borderBottom: "1px solid var(--mh-line)" }}>
            <input className="mh__input" placeholder="🔍 Tìm học viên…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredStudents.map((s) => {
              const last = threads[s.id]?.[threads[s.id].length - 1];
              return (
                <div key={s.id} onClick={() => setSelectedId(s.id)} style={{ padding: 12, cursor: "pointer", borderBottom: "1px solid var(--mh-line)", background: selectedId === s.id ? "var(--mh-ivory-2)" : "#fff", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div className="mh__avatar" style={{ background: s.avatarBg }}>{s.short}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                      {last && <span className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)" }}>{last.time}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--mh-ink-soft)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{last ? last.text : "Chưa có tin nhắn"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mh__card" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--mh-line)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div className="mh__avatar" style={{ background: selected.avatarBg }}>{selected.short}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{selected.name}</div>
              <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{selected.company} · {selected.role}</div>
            </div>
            <span className={"mh__pill " + (selected.segment === "VIP" ? "mh__pill--amber" : "mh__pill--green")}>{selected.segment}</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--mh-ink-soft)" }}>Chưa có tin nhắn.</div>}
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "me" ? "flex-end" : "flex-start" }}>
                {m.channel && m.from === "them" && <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)", marginBottom: 2 }}>qua {m.channel}</div>}
                <div className={"mh__chat-bubble " + (m.from === "me" ? "mh__chat-bubble--me" : "mh__chat-bubble--them")}>{m.text}</div>
                <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)", marginTop: 2 }}>{m.time}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: 12, borderTop: "1px solid var(--mh-line)" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {(["App", "Zalo", "Email"] as const).map((ch) => (
                <button key={ch} className="mh__btn" style={channel === ch ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", padding: "4px 10px", fontSize: 12 } : { padding: "4px 10px", fontSize: 12 }} onClick={() => setChannel(ch)}>{ch}</button>
              ))}
              <button className="mh__btn" style={{ padding: "4px 10px", fontSize: 12 }}>✦ AI gợi ý</button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="mh__input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={`Gửi qua ${channel}…`} />
              <button className="mh__btn mh__btn--primary" onClick={send}>Gửi</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .mh-chat-grid { grid-template-columns: 1fr !important; height: auto !important; } }`}</style>
    </div>
  );
}
