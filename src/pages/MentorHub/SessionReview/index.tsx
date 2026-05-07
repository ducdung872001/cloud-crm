// [MH] MentorHub - Session Review với AI Meeting Notes + action handlers
import React, { useState } from "react";
import { MOCK_SESSION_REVIEW, MOCK_STUDENTS, type PerStudentBreakdown } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

// Helpers cho per-student breakdown
const engagementColor = (score: number) => {
  if (score >= 85) return "var(--mh-teal)";
  if (score >= 65) return "var(--mh-amber)";
  if (score >= 45) return "#B45309";
  return "var(--mh-red)";
};
const attendancePill = (s: PerStudentBreakdown["attendanceStatus"]) => {
  if (s === "present") return { label: "Có mặt", cls: "mh__pill--green" };
  if (s === "late") return { label: "Vào trễ", cls: "mh__pill--draft" };
  return { label: "Vắng", cls: "mh__pill--draft" };
};
const sentimentEmoji = (s: PerStudentBreakdown["sentiment"]) =>
  s === "positive" ? "😊" : s === "neutral" ? "😐" : "😟";

type Toast = { text: string; kind?: "ok" | "info" } | null;

// Build markdown string from session for copy/email
const buildMarkdown = (s: typeof MOCK_SESSION_REVIEW) => {
  return [
    `# ${s.courseName} — Buổi ${s.sessionNumber}: ${s.sessionTitle}`,
    `Ngày: ${s.date} · Thời lượng: ${s.duration} · Có mặt: ${s.attendance.present}/${s.attendance.total}`,
    ``,
    `## Tóm tắt (AI)`,
    `Buổi học tập trung vào service discovery patterns và load balancing strategies trong hệ thống microservices. Demo hands-on với Eureka, case study thực tế từ Grab về migration sang Istio. Học viên tương tác tích cực, 3 câu hỏi chất lượng về xử lý failure trong distributed system.`,
    ``,
    `## Điểm chính`,
    ...s.keyPoints.map((kp) => `- **[${kp.time}]** ${kp.text}`),
    ``,
    `## Q&A trích xuất`,
    ...s.questions.flatMap((q) => [
      `### [${q.time}] ${q.student}: ${q.q}`,
      `→ ${q.a}`,
      ``,
    ]),
    `## Action items cho học viên`,
    ...s.actionItems.map((a, i) => `${i + 1}. ${a}`),
  ].join("\n");
};

export default function MentorHubSessionReviewPage() {
  document.title = "MentorHub · AI Meeting Notes";
  const s = MOCK_SESSION_REVIEW;

  const [showSend, setShowSend] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const notify = (text: string, kind: Toast["kind"] = "ok") => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopy = async () => {
    const md = buildMarkdown(s);
    try {
      await navigator.clipboard.writeText(md);
      notify("✓ Đã copy toàn bộ ghi chú (Markdown). Paste vào Notion / Slack / doc là xong.");
    } catch {
      notify("✕ Không copy được. Vui lòng thử Ctrl+C sau khi chọn nội dung.", "info");
    }
  };

  const handlePrint = () => {
    const aiSummary = "Buổi học tập trung vào service discovery patterns và load balancing strategies trong hệ thống microservices. Demo hands-on với Eureka, case study thực tế từ Grab về migration sang Istio. Học viên tương tác tích cực, 3 câu hỏi chất lượng về xử lý failure trong distributed system.";
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>AI Meeting Notes — ${s.courseName} Buổi ${s.sessionNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Geist', -apple-system, sans-serif; color: #0E1713; margin: 0; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.55; }
  h1, h2, h3, h4 { font-family: 'Fraunces', serif; font-weight: 400; letter-spacing: -.01em; margin: 0; }
  h1 { font-size: 28px; line-height: 1.1; margin-bottom: 6px; }
  h2 { font-size: 18px; color: #6B7A72; font-style: italic; margin-bottom: 20px; }
  h3 { font-size: 18px; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #E0D8C8; }
  em { color: #0F766E; font-style: italic; }
  .brand { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 2px solid #0E1713; margin-bottom: 24px; }
  .brand__logo { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 500; }
  .brand__mark { color: #0F766E; font-size: 20px; margin-right: 8px; }
  .meta { font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: .08em; color: #6B7A72; text-transform: uppercase; }
  .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 20px 0 28px; padding: 16px; background: #F4EFE6; border-radius: 10px; }
  .kpi { text-align: center; }
  .kpi__label { font-family: 'Geist Mono', monospace; font-size: 9px; letter-spacing: .1em; color: #6B7A72; text-transform: uppercase; }
  .kpi__value { font-family: 'Fraunces', serif; font-size: 22px; margin-top: 4px; }
  .summary { background: #FFF9ED; padding: 18px 22px; border-left: 3px solid #B45309; border-radius: 4px; font-family: 'Fraunces', serif; font-style: italic; font-size: 16px; line-height: 1.65; margin-bottom: 20px; }
  .summary__kicker { font-family: 'Geist Mono', monospace; font-size: 10px; color: #B45309; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 8px; font-style: normal; }
  .key-point { display: grid; grid-template-columns: 64px 1fr; gap: 14px; margin-bottom: 10px; font-size: 14px; page-break-inside: avoid; }
  .key-point__time { font-family: 'Geist Mono', monospace; color: #0F766E; font-size: 12px; }
  .qa { padding-left: 14px; border-left: 2px solid #0F766E; margin-bottom: 18px; page-break-inside: avoid; }
  .qa__meta { font-family: 'Geist Mono', monospace; font-size: 10px; color: #6B7A72; margin-bottom: 4px; }
  .qa__q { font-weight: 600; margin-bottom: 6px; font-size: 14px; }
  .qa__a { color: #6B7A72; font-size: 13px; }
  ol.actions { padding-left: 24px; }
  ol.actions li { margin-bottom: 6px; font-size: 14px; page-break-inside: avoid; }
  .footer { margin-top: 40px; padding-top: 14px; border-top: 1px solid #E0D8C8; font-family: 'Geist Mono', monospace; font-size: 10px; color: #6B7A72; display: flex; justify-content: space-between; }
  @media print {
    body { padding: 20px; max-width: none; }
    h3 { page-break-after: avoid; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
  <div class="brand">
    <div><span class="brand__mark">◐</span><span class="brand__logo">MentorHub · Reborn</span></div>
    <div class="meta">AI MEETING NOTES</div>
  </div>

  <div class="meta">BUỔI ${s.sessionNumber} · ${s.date}</div>
  <h1>${s.courseName}</h1>
  <h2>${s.sessionTitle}</h2>

  <div class="kpi-row">
    <div class="kpi"><div class="kpi__label">Thời lượng</div><div class="kpi__value">${s.duration}</div></div>
    <div class="kpi"><div class="kpi__label">Có mặt</div><div class="kpi__value">${s.attendance.present}/${s.attendance.total}</div></div>
    <div class="kpi"><div class="kpi__label">Tích cực</div><div class="kpi__value">${s.sentiment.positive}%</div></div>
    <div class="kpi"><div class="kpi__label">Q&amp;A</div><div class="kpi__value">${s.questions.length}</div></div>
  </div>

  <div class="summary">
    <div class="summary__kicker">✦ AI TÓM TẮT</div>
    ${aiSummary}
  </div>

  <h3>Điểm chính</h3>
  ${s.keyPoints.map((kp) => `<div class="key-point"><span class="key-point__time">${kp.time}</span><span>${kp.text}</span></div>`).join("")}

  <h3>Q&amp;A được trích xuất</h3>
  ${s.questions.map((q) => `<div class="qa"><div class="qa__meta">${q.time} · ${q.student}</div><div class="qa__q">${q.q}</div><div class="qa__a">→ ${q.a}</div></div>`).join("")}

  <h3>Action items cho học viên</h3>
  <ol class="actions">
    ${s.actionItems.map((a) => `<li>${a}</li>`).join("")}
  </ol>

  <div class="footer">
    <span>Tạo bởi MentorHub AI · ${new Date().toLocaleDateString("vi-VN")}</span>
    <span>mentorhub.vn</span>
  </div>

  <script>
    // Auto-trigger print dialog khi fonts loaded
    window.addEventListener("load", () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setTimeout(() => window.print(), 300));
      } else {
        setTimeout(() => window.print(), 500);
      }
    });
  </script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      notify("✕ Popup bị chặn. Cho phép popup cho localhost rồi thử lại.", "info");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    notify("📄 Cửa sổ in mở — chọn 'Save as PDF' để xuất file. Nội dung: AI tóm tắt + điểm chính + Q&A + action items.", "info");
  };

  return (
    <div className="mh mh-session-review">
      <div className="mh__hero">
        <div className="mh__kicker">AI MEETING NOTES · {s.date}</div>
        <h1>{s.courseName} — Buổi {s.sessionNumber}</h1>
        <h2 style={{ marginTop: 6, color: "var(--mh-ink-soft)", fontSize: 22 }}><em>{s.sessionTitle}</em></h2>
      </div>

      <div className="mh__grid mh__grid--4" style={{ marginBottom: 32 }}>
        <div className="mh__kpi"><div className="mh__kpi-label">THỜI LƯỢNG</div><div className="mh__kpi-value" style={{ fontSize: 24 }}>{s.duration}</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">CÓ MẶT</div><div className="mh__kpi-value" style={{ fontSize: 24 }}>{s.attendance.present}/{s.attendance.total}</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">TÍCH CỰC</div><div className="mh__kpi-value" style={{ fontSize: 24, color: "var(--mh-teal)" }}>{s.sentiment.positive}%</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">Q&A</div><div className="mh__kpi-value" style={{ fontSize: 24 }}>{s.questions.length}</div></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }} className="mh-actions-bar">
        <button className="mh__btn" onClick={handlePrint}>📄 Xuất PDF</button>
        <button className="mh__btn" onClick={() => setShowSend(true)}>📧 Gửi học viên</button>
        <button className="mh__btn" onClick={handleCopy}>📋 Copy</button>
        <button className="mh__btn" onClick={() => setShowShare(true)}>🔗 Chia sẻ</button>
      </div>

      <div className="mh__grid mh__grid--2" style={{ gap: 24, alignItems: "start" }}>
        <div>
          <div className="mh__card mh__ai-card" style={{ marginBottom: 20 }}>
            <div className="mh__kicker" style={{ color: "var(--mh-amber)" }}>AI TÓM TẮT</div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontStyle: "italic", lineHeight: 1.6, margin: "12px 0 0" }}>
              Buổi học tập trung vào service discovery patterns và load balancing strategies trong hệ thống microservices. Demo hands-on với Eureka, case study thực tế từ Grab về migration sang Istio. Học viên tương tác tích cực, 3 câu hỏi chất lượng về xử lý failure trong distributed system.
            </p>
          </div>

          <div className="mh__card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Điểm chính</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {s.keyPoints.map((kp, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 12 }}>
                  <span className="mh__mono" style={{ fontSize: 12, color: "var(--mh-teal)" }}>{kp.time}</span>
                  <span style={{ fontSize: 14 }}>{kp.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mh__card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Q&A được trích xuất</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {s.questions.map((q, i) => (
                <div key={i} style={{ paddingLeft: 12, borderLeft: "2px solid var(--mh-teal)" }}>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", marginBottom: 4 }}>{q.time} · {q.student}</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{q.q}</div>
                  <div style={{ fontSize: 13, color: "var(--mh-ink-soft)" }}>{q.a}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mh__card mh__ai-card">
            <h3 style={{ color: "var(--mh-amber)", marginBottom: 14 }}>Action items cho học viên</h3>
            <ol style={{ paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {s.actionItems.map((a, i) => <li key={i} style={{ fontSize: 14 }}>{a}</li>)}
            </ol>
          </div>
        </div>
      </div>

      {/* Per-student breakdown — nhận xét cá nhân hoá AI tự sinh */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="mh__kicker" style={{ color: "var(--mh-amber)" }}>✦ AI · NHẬN XÉT CÁ NHÂN HOÁ TỪNG HỌC VIÊN</div>
            <h2 style={{ marginTop: 6, fontFamily: "'Fraunces', serif", fontWeight: 400, letterSpacing: "-.01em" }}>
              <em>Phần thịt sau</em> — mỗi học viên một thông điệp riêng
            </h2>
            <p style={{ color: "var(--mh-ink-soft)", fontSize: 13, marginTop: 4 }}>
              {s.zaloDispatchSummary.autoSendCount} sẽ tự gửi · {s.zaloDispatchSummary.needsReviewCount} cần review · gửi qua {s.zaloDispatchSummary.channelBreakdown.zaloOA} Zalo OA, {s.zaloDispatchSummary.channelBreakdown.email} email · dự kiến {s.zaloDispatchSummary.estimatedReachAt}
            </p>
          </div>
          <button className="mh__btn mh__btn--primary" onClick={() => setShowPersonalize(true)}>
            💬 Mở cockpit gửi cá nhân hoá ({s.perStudentBreakdown.length})
          </button>
        </div>

        <div className="mh__grid mh__grid--2" style={{ gap: 16 }}>
          {s.perStudentBreakdown.map((p) => {
            const att = attendancePill(p.attendanceStatus);
            return (
              <div key={p.studentId} className="mh__card" style={{ padding: 18, position: "relative", borderTop: `3px solid ${engagementColor(p.engagementScore)}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div className="mh__avatar" style={{ background: p.avatarBg, width: 44, height: 44, fontSize: 14 }}>{p.short}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                      <span className={"mh__pill " + att.cls} style={{ fontSize: 9 }}>{att.label}</span>
                      <span className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)" }}>
                        {sentimentEmoji(p.sentiment)} talk {p.talkTimeMin}m · chat {p.chatMessages} · Q {p.questionsAsked}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mh__mono" style={{ fontSize: 9, letterSpacing: ".08em", color: "var(--mh-ink-soft)" }}>ENGAGEMENT</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, color: engagementColor(p.engagementScore), lineHeight: 1 }}>{p.engagementScore}</div>
                  </div>
                </div>

                {p.highlights.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {p.highlights.map((h, i) => (
                      <li key={i} style={{ fontSize: 12, color: "var(--mh-ink-soft)", paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: "var(--mh-teal)" }}>·</span>{h}
                      </li>
                    ))}
                  </ul>
                )}

                <div style={{ background: "var(--mh-amber-soft)", borderRadius: 8, padding: "12px 14px", borderLeft: "3px solid var(--mh-amber)" }}>
                  <div className="mh__mono" style={{ fontSize: 9, letterSpacing: ".08em", color: "var(--mh-amber)", marginBottom: 4 }}>
                    {p.zaloChannel.toUpperCase()} · {p.zaloStatus === "scheduled" ? "📤 SẼ TỰ GỬI" : p.zaloStatus === "needs_review" ? "👁 CẦN REVIEW" : p.zaloStatus.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 13, lineHeight: 1.55 }}>{p.aiRemark}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showSend && <SendToStudentsModal session={s} onClose={() => setShowSend(false)} onSent={(ch, count) => { setShowSend(false); notify(`✓ Đã gửi ghi chú buổi học tới ${count} học viên qua ${ch}.`); }} />}
      {showShare && <ShareNoteModal session={s} onClose={() => setShowShare(false)} />}
      {showPersonalize && <PersonalizeCockpitModal session={s} onClose={() => setShowPersonalize(false)} onSent={(count) => { setShowPersonalize(false); notify(`✓ Đã lên lịch gửi ${count} tin cá nhân hoá lúc ${s.zaloDispatchSummary.estimatedReachAt}.`); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "14px 20px", background: toast.kind === "info" ? "var(--mh-ink)" : "#166534", color: "#fff", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,.2)", zIndex: 300, fontSize: 14, maxWidth: 440 }}>{toast.text}</div>
      )}

      {/* Print styles — ẩn sidebar + header khi in */}
      <style>{`
        @media print {
          .sidebar, .header, .mh-actions-bar, .overlay-sidebar__mobile { display: none !important; }
          .page-wrapper, .main-content { margin-left: 0 !important; padding: 0 !important; width: 100% !important; }
          .mh { padding: 0 !important; background: #fff !important; }
          .mh__card { break-inside: avoid; page-break-inside: avoid; border: 1px solid #ccc !important; }
          .mh__grid--4 { grid-template-columns: repeat(4, 1fr) !important; }
          .mh__grid--2 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// ── Send to students modal ───────────────────────────────────────────────────
function SendToStudentsModal({ session, onClose, onSent }: { session: typeof MOCK_SESSION_REVIEW; onClose: () => void; onSent: (channel: string, count: number) => void }) {
  const enrolledStudents = MOCK_STUDENTS.slice(0, session.attendance.total);
  const presentStudents = enrolledStudents.slice(0, session.attendance.present);
  const [selected, setSelected] = useState<Set<string>>(new Set(presentStudents.map((s) => s.id)));
  const [channel, setChannel] = useState<"Email" | "Zalo" | "Cả hai">("Email");
  const [subject, setSubject] = useState(`Ghi chú buổi ${session.sessionNumber}: ${session.sessionTitle}`);
  const [includeRecording, setIncludeRecording] = useState(true);
  const [includeHomework, setIncludeHomework] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (selected.size === 0) errs.selected = "Chọn ít nhất 1 học viên";
    if (!subject.trim()) errs.subject = "Nhập tiêu đề";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSent(channel, selected.size);
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">GỬI GHI CHÚ BUỔI HỌC</div>
            <h3 style={{ marginTop: 4 }}>Buổi {session.sessionNumber}: {session.sessionTitle}</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="mh__field">
            <label className="mh__label mh__label--req">Tiêu đề email</label>
            <input className={"mh__input" + (errors.subject ? " mh__input--error" : "")} value={subject} onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors({ ...errors, subject: "" }); }} />
            {errors.subject && <div className="mh__error">⚠ {errors.subject}</div>}
          </div>

          <div className="mh__field">
            <label className="mh__label">Kênh gửi</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["Email", "Zalo", "Cả hai"] as const).map((ch) => (
                <button key={ch} type="button" className="mh__btn" style={channel === ch ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)" } : {}} onClick={() => setChannel(ch)}>
                  {ch === "Email" ? "✉" : ch === "Zalo" ? "💬" : "✉💬"} {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="mh__field">
            <label className="mh__label">Bao gồm trong email</label>
            <label className="mh__field" style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: 10, background: "var(--mh-ivory-2)", borderRadius: 8, marginBottom: 6 }}>
              <input type="checkbox" checked={includeRecording} onChange={(e) => setIncludeRecording(e.target.checked)} style={{ marginTop: 3 }} />
              <span style={{ fontSize: 13 }}>Link recording buổi học (Zoom + AI transcript)</span>
            </label>
            <label className="mh__field" style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: 10, background: "var(--mh-ivory-2)", borderRadius: 8, marginBottom: 0 }}>
              <input type="checkbox" checked={includeHomework} onChange={(e) => setIncludeHomework(e.target.checked)} style={{ marginTop: 3 }} />
              <span style={{ fontSize: 13 }}>Action items / Homework</span>
            </label>
          </div>

          <div className="mh__field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label className="mh__label" style={{ marginBottom: 0 }}>Chọn học viên nhận ({selected.size}/{enrolledStudents.length})</label>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="mh__btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setSelected(new Set(enrolledStudents.map((s) => s.id)))}>Tất cả</button>
                <button type="button" className="mh__btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setSelected(new Set(presentStudents.map((s) => s.id)))}>Chỉ có mặt</button>
                <button type="button" className="mh__btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setSelected(new Set())}>Bỏ chọn</button>
              </div>
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid var(--mh-line)", borderRadius: 10, padding: 4 }}>
              {enrolledStudents.map((stu, i) => {
                const isPresent = i < session.attendance.present;
                return (
                  <label key={stu.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, cursor: "pointer", borderRadius: 6, background: selected.has(stu.id) ? "var(--mh-ivory-2)" : "transparent" }}>
                    <input type="checkbox" checked={selected.has(stu.id)} onChange={() => toggle(stu.id)} />
                    <div className="mh__avatar mh__avatar--sm" style={{ background: stu.avatarBg }}>{stu.short}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{stu.name}</div>
                      <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)" }}>{stu.email}</div>
                    </div>
                    <span className={"mh__pill " + (isPresent ? "mh__pill--green" : "mh__pill--draft")} style={{ fontSize: 9 }}>
                      {isPresent ? "Có mặt" : "Vắng"}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.selected && <div className="mh__error">⚠ {errors.selected}</div>}
          </div>

          <div style={{ padding: 12, background: "var(--mh-amber-soft)", borderRadius: 10, fontSize: 12, color: "var(--mh-ink)", marginBottom: 16, border: "1px solid rgba(180, 88, 9, 0.2)" }}>
            ✦ AI tóm tắt + {session.keyPoints.length} điểm chính + {session.questions.length} Q&A + {session.actionItems.length} action items sẽ được đóng gói vào email/Zalo.
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="mh__btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="mh__btn mh__btn--primary">Gửi cho {selected.size} học viên</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Share note modal ─────────────────────────────────────────────────────────
function ShareNoteModal({ session, onClose }: { session: typeof MOCK_SESSION_REVIEW; onClose: () => void }) {
  const shareUrl = `${location.origin}/crm/mh/session-review?session=${encodeURIComponent(session.sessionTitle)}`;
  const [copied, setCopied] = useState(false);
  const [expires, setExpires] = useState<"7d" | "30d" | "forever">("7d");

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const enc = encodeURIComponent;
  const title = `Ghi chú buổi ${session.sessionNumber}: ${session.sessionTitle}`;
  const shareZalo = `https://zalo.me/share?u=${enc(shareUrl)}&t=${enc(title)}`;
  const shareEmail = `mailto:?subject=${enc(title)}&body=${enc(title + "\n\n" + shareUrl)}`;

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">CHIA SẺ GHI CHÚ</div>
            <h3 style={{ marginTop: 4 }}>Tạo link xem công khai</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <div className="mh__field">
          <label className="mh__label">Thời gian link có hiệu lực</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { v: "7d", l: "7 ngày" },
              { v: "30d", l: "30 ngày" },
              { v: "forever", l: "Vĩnh viễn" },
            ].map((o) => (
              <button key={o.v} type="button" className="mh__btn" style={expires === o.v ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)" } : {}} onClick={() => setExpires(o.v as typeof expires)}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mh__field">
          <label className="mh__label">Link chia sẻ</label>
          <div style={{ display: "flex", gap: 6, alignItems: "center", background: "var(--mh-ivory-2)", padding: "6px 10px", borderRadius: 10, border: "1px solid var(--mh-line)" }}>
            <input type="text" readOnly value={shareUrl} className="mh__mono" style={{ flex: 1, border: 0, background: "transparent", fontSize: 12, color: "var(--mh-ink-soft)", outline: "none" }} onFocus={(e) => e.currentTarget.select()} />
            <button className="mh__btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={copyLink}>{copied ? "✓ Đã copy" : "Copy"}</button>
          </div>
        </div>

        <div className="mh__field">
          <label className="mh__label">Gửi nhanh qua</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <a href={shareZalo} target="_blank" rel="noopener noreferrer" className="mh__btn" style={{ background: "#0068FF", color: "#fff", borderColor: "#0068FF", justifyContent: "center" }}>💬 Zalo</a>
            <a href={shareEmail} className="mh__btn" style={{ justifyContent: "center" }}>✉ Email</a>
            <button className="mh__btn" style={{ justifyContent: "center" }} onClick={copyLink}>🔗 Copy link</button>
          </div>
        </div>

        <div style={{ padding: 12, background: "var(--mh-amber-soft)", borderRadius: 10, fontSize: 12, color: "var(--mh-ink)", border: "1px solid rgba(180, 88, 9, 0.2)" }}>
          🔒 Link chỉ cho phép xem — không cho phép sửa. Người nhận không cần đăng nhập. {expires !== "forever" && `Link tự động hết hạn sau ${expires === "7d" ? "7 ngày" : "30 ngày"}.`}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" className="mh__btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ── Personalize cockpit modal — review từng tin Zalo cá nhân hoá trước khi gửi ─
function PersonalizeCockpitModal({ session, onClose, onSent }: { session: typeof MOCK_SESSION_REVIEW; onClose: () => void; onSent: (count: number) => void }) {
  const breakdown = session.perStudentBreakdown;
  const [activeId, setActiveId] = useState(breakdown[0]?.studentId ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(breakdown.map((p) => [p.studentId, p.aiRemark]))
  );
  const [approved, setApproved] = useState<Set<string>>(
    new Set(breakdown.filter((p) => p.zaloStatus === "scheduled").map((p) => p.studentId))
  );
  const [autoSend, setAutoSend] = useState(false);

  const active = breakdown.find((p) => p.studentId === activeId) ?? breakdown[0];
  const toggleApprove = (id: string) => {
    const n = new Set(approved);
    n.has(id) ? n.delete(id) : n.add(id);
    setApproved(n);
  };
  const approveAll = () => setApproved(new Set(breakdown.map((p) => p.studentId)));

  const submit = () => {
    onSent(approved.size);
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 980, width: "92vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div className="mh__kicker" style={{ color: "var(--mh-amber)" }}>✦ COCKPIT GỬI CÁ NHÂN HOÁ</div>
            <h3 style={{ marginTop: 4 }}>Buổi {session.sessionNumber}: {session.sessionTitle}</h3>
            <p style={{ fontSize: 12, color: "var(--mh-ink-soft)", marginTop: 4 }}>
              Approve {approved.size}/{breakdown.length} tin · gửi qua Zalo OA + Email · dự kiến {session.zaloDispatchSummary.estimatedReachAt}
            </p>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, flex: 1, minHeight: 0 }}>
          {/* Left: list học viên */}
          <div style={{ borderRight: "1px solid var(--mh-line)", paddingRight: 12, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
              <span className="mh__mono" style={{ fontSize: 10, letterSpacing: ".08em", color: "var(--mh-ink-soft)" }}>HỌC VIÊN ({breakdown.length})</span>
              <button className="mh__btn" style={{ padding: "2px 8px", fontSize: 10 }} onClick={approveAll}>Approve all</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {breakdown.map((p) => {
                const isActive = p.studentId === activeId;
                const isApproved = approved.has(p.studentId);
                return (
                  <button key={p.studentId} type="button" onClick={() => setActiveId(p.studentId)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                      background: isActive ? "var(--mh-ivory-2)" : "transparent",
                      border: isActive ? "1px solid var(--mh-teal)" : "1px solid transparent",
                      borderRadius: 8, cursor: "pointer", textAlign: "left", width: "100%",
                    }}
                  >
                    <div className="mh__avatar mh__avatar--sm" style={{ background: p.avatarBg }}>{p.short}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div className="mh__mono" style={{ fontSize: 9, color: engagementColor(p.engagementScore) }}>● {p.engagementScore} engagement</div>
                    </div>
                    <span style={{ fontSize: 14, color: isApproved ? "var(--mh-teal)" : "var(--mh-line)" }}>{isApproved ? "✓" : "○"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: editor */}
          <div style={{ overflowY: "auto", paddingRight: 8 }}>
            {active && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div className="mh__avatar" style={{ background: active.avatarBg, width: 56, height: 56, fontSize: 18 }}>{active.short}</div>
                  <div>
                    <h4 style={{ margin: 0 }}>{active.name}</h4>
                    <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)", marginTop: 2 }}>
                      {active.zaloChannel} · scheduled {active.scheduledAt}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14, padding: 10, background: "var(--mh-ivory-2)", borderRadius: 8 }}>
                  <div><div className="mh__mono" style={{ fontSize: 9, color: "var(--mh-ink-soft)" }}>ENGAGEMENT</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: engagementColor(active.engagementScore) }}>{active.engagementScore}</div></div>
                  <div><div className="mh__mono" style={{ fontSize: 9, color: "var(--mh-ink-soft)" }}>TALK</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }}>{active.talkTimeMin}m</div></div>
                  <div><div className="mh__mono" style={{ fontSize: 9, color: "var(--mh-ink-soft)" }}>CHAT</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }}>{active.chatMessages}</div></div>
                  <div><div className="mh__mono" style={{ fontSize: 9, color: "var(--mh-ink-soft)" }}>Q&A</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }}>{active.questionsAsked}</div></div>
                </div>

                {active.highlights.length > 0 && (
                  <div className="mh__field">
                    <label className="mh__label">AI HIGHLIGHTS từ transcript</label>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      {active.highlights.map((h, i) => (
                        <li key={i} style={{ fontSize: 13, padding: "8px 12px", background: "var(--mh-ivory-2)", borderRadius: 6, borderLeft: "2px solid var(--mh-teal)" }}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mh__field">
                  <label className="mh__label mh__label--req">Tin nhắn cá nhân hoá (sẽ gửi qua {active.zaloChannel})</label>
                  <textarea
                    className="mh__input"
                    style={{ minHeight: 140, fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 14, lineHeight: 1.55, resize: "vertical" }}
                    value={drafts[active.studentId] ?? ""}
                    onChange={(e) => setDrafts({ ...drafts, [active.studentId]: e.target.value })}
                  />
                  <div style={{ fontSize: 11, color: "var(--mh-ink-soft)", marginTop: 4 }}>
                    AI sinh từ transcript + profile học viên · {(drafts[active.studentId] ?? "").length} ký tự
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, background: "var(--mh-ivory-2)", borderRadius: 8 }}>
                  <input type="checkbox" id={`approve-${active.studentId}`} checked={approved.has(active.studentId)} onChange={() => toggleApprove(active.studentId)} />
                  <label htmlFor={`approve-${active.studentId}`} style={{ fontSize: 13, cursor: "pointer", flex: 1 }}>
                    Approve gửi cho {active.name.split(" ").pop()}
                  </label>
                  <button type="button" className="mh__btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setDrafts({ ...drafts, [active.studentId]: active.aiRemark })}>↺ Reset AI</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--mh-line)", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <input type="checkbox" checked={autoSend} onChange={(e) => setAutoSend(e.target.checked)} />
            Auto-send từ buổi sau (không cần review nữa, chỉ với gói Pro+)
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="mh__btn" onClick={onClose}>Huỷ</button>
            <button type="button" className="mh__btn mh__btn--primary" onClick={submit} disabled={approved.size === 0}>
              📤 Lên lịch gửi {approved.size} tin lúc {session.zaloDispatchSummary.estimatedReachAt.split(" ")[1]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
