// Zalo Mini App · Tickets — list + inline reply
import React, { useState } from "react";
import ZaloMiniLayout from "../_shared/ZaloMiniLayout";
import { MOCK_TICKETS } from "@/mocks/mentorhub";

const priorityColor: Record<string, string> = { high: "zmp-pill--red", medium: "zmp-pill--amber", low: "zmp-pill--green" };

export default function ZaloTickets() {
  document.title = "MentorHub · Ticket";
  const [selected, setSelected] = useState<typeof MOCK_TICKETS[number] | null>(null);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  const open = MOCK_TICKETS.filter((t) => t.status !== "resolved" && !sent.includes(t.id));

  if (selected) {
    const handleSend = () => {
      if (!reply.trim()) return;
      setSent([...sent, selected.id]);
      setSelected(null);
      setReply("");
    };

    return (
      <ZaloMiniLayout title="Trả lời ticket">
        <div style={{ marginBottom: 8 }}>
          <button className="zmp-btn" onClick={() => setSelected(null)} style={{ fontSize: 12, padding: "6px 12px" }}>← Danh sách</button>
        </div>

        <div className="zmp-card">
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <div className="zmp-avatar" style={{ background: selected.avatarBg }}>{selected.short}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{selected.student}</div>
              <div className="zmp-mono" style={{ fontSize: 10, color: "var(--zmp-ink-soft)" }}>{selected.id} · {selected.channel} · {selected.createdAt}</div>
            </div>
            <span className={"zmp-pill " + priorityColor[selected.priority]}>{selected.priority}</span>
          </div>
          <h3 style={{ fontSize: 15, margin: "8px 0 6px", lineHeight: 1.4 }}>{selected.subject}</h3>
        </div>

        <div className="zmp-card" style={{ background: "#FFF9ED", borderColor: "#FDE68A" }}>
          <div className="zmp-kicker" style={{ color: "var(--zmp-amber)", marginBottom: 4 }}>✦ AI CONTEXT</div>
          <p style={{ fontSize: 12, lineHeight: 1.55, margin: 0 }}>{selected.aiContext}</p>
        </div>

        <div className="zmp-kicker" style={{ margin: "8px 0" }}>SOẠN TRẢ LỜI</div>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Nhập tin nhắn cho học viên…"
          style={{ width: "100%", minHeight: 120, padding: 12, borderRadius: 12, border: "1px solid var(--zmp-line)", fontFamily: "inherit", fontSize: 13, resize: "none" }}
          maxLength={600}
        />
        <div className="zmp-mono" style={{ fontSize: 10, color: "var(--zmp-ink-soft)", margin: "4px 0 12px" }}>{reply.length}/600</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button className="zmp-btn" style={{ fontSize: 12 }} onClick={() => setReply("Cảm ơn em đã liên hệ. Thầy sẽ xử lý ngay và phản hồi em trong hôm nay.")}>✦ Mẫu lịch sự</button>
          <button className="zmp-btn" style={{ fontSize: 12 }} onClick={() => setReply("Em thử check lại mục Khoá học > Recording nhé. Nếu vẫn không thấy, thầy sẽ check lại backend.")}>✦ Mẫu hướng dẫn</button>
        </div>

        <button className="zmp-btn zmp-btn--primary zmp-btn--full" disabled={!reply.trim()} onClick={handleSend}>
          Gửi trả lời qua {selected.channel}
        </button>
      </ZaloMiniLayout>
    );
  }

  return (
    <ZaloMiniLayout title="Ticket hỗ trợ">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div className="zmp-kpi" style={{ flex: 1, padding: 10 }}>
          <div className="zmp-kpi__label">ĐANG MỞ</div>
          <div className="zmp-kpi__value" style={{ color: "var(--zmp-red)" }}>{open.length}</div>
        </div>
        <div className="zmp-kpi" style={{ flex: 1, padding: 10 }}>
          <div className="zmp-kpi__label">QUÁ SLA</div>
          <div className="zmp-kpi__value" style={{ color: "var(--zmp-amber)" }}>2</div>
        </div>
        <div className="zmp-kpi" style={{ flex: 1, padding: 10 }}>
          <div className="zmp-kpi__label">ĐÃ XỬ LÝ HÔM NAY</div>
          <div className="zmp-kpi__value">{sent.length + MOCK_TICKETS.filter((t) => t.status === "resolved").length}</div>
        </div>
      </div>

      {open.length === 0 ? (
        <div className="zmp-card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h3 className="zmp-h3">Tất cả ticket đã xử lý!</h3>
          <p style={{ fontSize: 12, color: "var(--zmp-ink-soft)", margin: "8px 0 0" }}>Inbox zero. Nghỉ ngơi nhé thầy!</p>
        </div>
      ) : (
        open.map((t) => (
          <div key={t.id} className="zmp-card" onClick={() => setSelected(t)} style={{ cursor: "pointer", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="zmp-mono" style={{ fontSize: 10, color: "var(--zmp-ink-soft)" }}>{t.id} · {t.createdAt}</span>
              <span className={"zmp-pill " + priorityColor[t.priority]}>{t.priority}</span>
            </div>
            <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.4, marginBottom: 8 }}>{t.subject}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="zmp-avatar" style={{ width: 24, height: 24, fontSize: 10, background: t.avatarBg }}>{t.short}</div>
              <span style={{ fontSize: 12, color: "var(--zmp-ink-soft)" }}>{t.student}</span>
              <span className="zmp-mono" style={{ fontSize: 10, color: "var(--zmp-ink-soft)" }}>· {t.channel}</span>
              <div style={{ marginLeft: "auto", fontSize: 11, color: t.slaHours <= 2 ? "var(--zmp-red)" : "var(--zmp-ink-soft)" }} className="zmp-mono">
                {t.slaHours > 0 ? `Còn ${t.slaHours}h` : "—"}
              </div>
            </div>
          </div>
        ))
      )}
    </ZaloMiniLayout>
  );
}
