// [MH] LiveSession — phòng live: Zoom embed + attendees + chat + AI assistant
import React, { useState } from "react";
import { MOCK_NEXT_SESSION, MOCK_STUDENTS } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

type ChatMsg = { from: string; text: string; time: string; isMe?: boolean };

export default function MHLiveSession() {
  document.title = "Phòng live · MentorHub";
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: "Trần Văn Đức", text: "Xin chào thầy!", time: "20:01" },
    { from: "Phạm Thu Hà", text: "Audio nghe rõ ạ", time: "20:01" },
    { from: "System", text: "🔴 Recording đã bắt đầu.", time: "20:02" },
    { from: "Nguyễn Hoàng Anh", text: "Thầy có thể share link slide được không ạ?", time: "20:05" },
  ]);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { from: "Me", text: input, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), isMe: true }]);
    setInput("");
  };
  const attendees = MOCK_STUDENTS.slice(0, 6);

  return (
    <div className="mh">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mh__kicker" style={{ color: "var(--mh-red)" }}>🔴 ĐANG LIVE</div>
          <h1>{MOCK_NEXT_SESSION.courseName}</h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>Buổi {MOCK_NEXT_SESSION.sessionNumber} · {MOCK_NEXT_SESSION.sessionTitle} · {attendees.length + 17}/{MOCK_NEXT_SESSION.capacity} HV</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="mh__btn">⏸ Tạm dừng</button>
          <button className="mh__btn mh__btn--danger">⏹ Kết thúc buổi</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }} className="mh-live-grid">
        <div>
          <div className="mh__card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ aspectRatio: "16 / 9", background: "linear-gradient(135deg, #0E1713, #134E4A)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 64 }}>🎥</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }}>Zoom Meeting</div>
              <div className="mh__mono" style={{ fontSize: 12, opacity: .7 }}>Meeting ID: {MOCK_NEXT_SESSION.zoomId}</div>
              <a href={`https://zoom.us/j/${MOCK_NEXT_SESSION.zoomId.replace(/-/g, "")}`} target="_blank" rel="noopener noreferrer" className="mh__btn mh__btn--amber" style={{ marginTop: 12 }}>Mở Zoom App ↗</a>
            </div>
          </div>
          <div className="mh__card mh__ai-card">
            <h4 style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: ".08em" }}>✦ AI LIVE ASSISTANT</h4>
            <h3 style={{ margin: "8px 0 12px" }}>Gợi ý realtime</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li style={{ fontSize: 14 }}>⚠️ <strong>3 học viên</strong> đang im lặng 15 phút — có thể gọi tên để giữ tương tác.</li>
              <li style={{ fontSize: 14 }}>📊 Pacing: nhanh hơn 12% so với buổi TB. Có thể slow down.</li>
              <li style={{ fontSize: 14 }}>❓ Câu hỏi của <strong>Nguyễn Hoàng Anh</strong> về slide chưa trả lời (5p).</li>
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="mh__card">
            <h4 className="mh__kicker" style={{ marginBottom: 10 }}>CÓ MẶT · {attendees.length + 17}/{MOCK_NEXT_SESSION.capacity}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
              {attendees.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <div className="mh__avatar mh__avatar--sm" style={{ background: s.avatarBg }}>{s.short}</div>
                  <span style={{ flex: 1 }}>{s.name}</span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                </div>
              ))}
            </div>
          </div>
          <div className="mh__card" style={{ display: "flex", flexDirection: "column", height: 420 }}>
            <h4 className="mh__kicker" style={{ marginBottom: 10 }}>CHAT BUỔI HỌC</h4>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.isMe ? "flex-end" : "flex-start" }}>
                  {!m.isMe && <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)", marginBottom: 2 }}>{m.from} · {m.time}</div>}
                  <div className={"mh__chat-bubble " + (m.isMe ? "mh__chat-bubble--me" : "mh__chat-bubble--them")}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="mh__input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Nhập tin nhắn…" />
              <button className="mh__btn mh__btn--primary" onClick={send}>Gửi</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .mh-live-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
