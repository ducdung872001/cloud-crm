// [MH] Feedback & NPS dashboard — aggregated rating + sentiment + reviews
import React, { useState } from "react";
import { MOCK_REVIEWS, MOCK_NPS_TREND, MOCK_COURSES, MOCK_KPI } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

export default function MHFeedback() {
  document.title = "Feedback & NPS · MentorHub";
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const courses = [{ id: "all", title: "Tất cả khoá" }, ...MOCK_COURSES.filter((c) => c.status !== "draft")];
  const filtered = courseFilter === "all" ? MOCK_REVIEWS : MOCK_REVIEWS.filter((r) => r.course.toLowerCase().includes(MOCK_COURSES.find((c) => c.id === courseFilter)?.title.split(" ")[0].toLowerCase() || ""));
  const sentiment = { positive: 78, neutral: 18, negative: 4 };
  const npsDistribution = [0, 0, 1, 8, 15, 103];
  const maxTrend = Math.max(...MOCK_NPS_TREND);

  return (
    <div className="mh">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mh__kicker">ĐÁNH GIÁ · NPS</div>
          <h1>Feedback <em>& NPS</em></h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>{MOCK_KPI.npsTotal} đánh giá tổng · xu hướng 6 tháng gần nhất</p>
        </div>
        <select className="mh__select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} style={{ maxWidth: 280 }}>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div className="mh__grid mh__grid--4" style={{ marginBottom: 32 }}>
        <div className="mh__kpi"><div className="mh__kpi-label">NPS TB</div><div className="mh__kpi-value">{MOCK_KPI.npsScore}<span style={{ fontSize: 18, color: "var(--mh-ink-soft)" }}>/5</span></div><div className="mh__kpi-delta">↑ 0.04 vs tháng trước</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">TỔNG ĐÁNH GIÁ</div><div className="mh__kpi-value">{MOCK_KPI.npsTotal}</div><div className="mh__kpi-delta">↑ 12 tuần này</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">TÍCH CỰC</div><div className="mh__kpi-value" style={{ color: "var(--mh-green)" }}>{sentiment.positive}%</div><div className="mh__kpi-delta">↑ 5%</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">TIÊU CỰC</div><div className="mh__kpi-value" style={{ color: "var(--mh-red)" }}>{sentiment.negative}%</div><div className="mh__kpi-delta mh__kpi-delta--down">2 cần follow-up</div></div>
      </div>

      <div className="mh__grid mh__grid--2" style={{ marginBottom: 32 }}>
        <div className="mh__card">
          <h3 style={{ marginBottom: 16 }}>Xu hướng NPS (6 tháng)</h3>
          <svg viewBox="0 0 300 100" style={{ width: "100%", height: 160 }} preserveAspectRatio="none">
            {(() => {
              const points = MOCK_NPS_TREND.map((v, i) => `${(i / (MOCK_NPS_TREND.length - 1)) * 300},${100 - ((v - 4.5) / (maxTrend - 4.5)) * 80 - 10}`).join(" ");
              return (<><polyline fill="rgba(15, 118, 110, 0.1)" stroke="none" points={`0,100 ${points} 300,100`} /><polyline fill="none" stroke="#0F766E" strokeWidth="2" points={points} /></>);
            })()}
          </svg>
        </div>
        <div className="mh__card">
          <h3 style={{ marginBottom: 16 }}>Phân bố sao</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = npsDistribution[star];
              const total = npsDistribution.reduce((a, b) => a + b, 0);
              const pct = total ? (count / total) * 100 : 0;
              return (
                <div key={star} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="mh__mono" style={{ width: 32, fontSize: 12 }}>{star}★</div>
                  <div style={{ flex: 1, height: 10, background: "var(--mh-ivory-2)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: star >= 4 ? "var(--mh-green)" : star === 3 ? "#F59E0B" : "var(--mh-red)" }} />
                  </div>
                  <div className="mh__mono" style={{ width: 60, fontSize: 12, textAlign: "right" }}>{count} ({pct.toFixed(0)}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mh__card mh__ai-card" style={{ marginBottom: 32 }}>
        <h4 style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: ".08em" }}>✦ AI SENTIMENT ANALYSIS</h4>
        <h3 style={{ margin: "8px 0 16px" }}>Keyword được nhắc nhiều nhất</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[{ k: "sâu/chi tiết", n: 34, pos: true }, { k: "case thực tế", n: 28, pos: true }, { k: "AI meeting note", n: 22, pos: true }, { k: "recording", n: 19, pos: true }, { k: "hands-on", n: 15, pos: true }, { k: "pacing nhanh", n: 7, pos: false }, { k: "Q&A thời gian", n: 5, pos: false }].map((t) => (
            <span key={t.k} style={{ padding: "6px 12px", background: t.pos ? "#DCFCE7" : "#FEE2E2", color: t.pos ? "#166534" : "#991B1B", borderRadius: 999, fontSize: 13, fontFamily: "'Geist Mono', monospace" }}>{t.k} · {t.n}</span>
          ))}
        </div>
      </div>

      <FeedbackReviews reviews={filtered} />
    </div>
  );
}

// ── Reviews list with Reply + Share handlers ────────────────────────────────
type ReviewItem = (typeof MOCK_REVIEWS)[number];

function FeedbackReviews({ reviews }: { reviews: ReviewItem[] }) {
  // Mentor's reply per review (keyed by index in array for simplicity)
  const [replies, setReplies] = React.useState<Record<number, string>>({});
  const [replyingIdx, setReplyingIdx] = React.useState<number | null>(null);
  const [sharingReview, setSharingReview] = React.useState<ReviewItem | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const notify = (text: string) => { setToast(text); setTimeout(() => setToast(null), 3000); };

  const saveReply = (idx: number, text: string) => {
    setReplies((prev) => ({ ...prev, [idx]: text }));
    setReplyingIdx(null);
    notify("✓ Đã phản hồi đánh giá. Phản hồi hiển thị công khai trên Portal khoá học.");
  };

  return (
    <div className="mh__card">
      <h3 style={{ marginBottom: 16 }}>Đánh giá gần đây</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {reviews.map((r, i) => {
          const reply = replies[i];
          return (
            <div key={i} style={{ paddingBottom: 20, borderBottom: "1px solid var(--mh-line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="mh__avatar mh__avatar--sm" style={{ background: r.anonymous ? "#9CA3AF" : "#0F766E" }}>{r.short}</div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.student}</span>
                  <span className="mh__pill mh__pill--draft" style={{ fontSize: 10 }}>{r.course}</span>
                  {r.anonymous && <span className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)" }}>ẩn danh</span>}
                </div>
                <div className="mh__mono" style={{ fontSize: 12, color: "var(--mh-ink-soft)" }}>{"★".repeat(r.nps)}{"☆".repeat(5 - r.nps)} · {r.time}</div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55 }}>"{r.comment}"</p>

              {/* Existing mentor reply */}
              {reply && !replyingIdx && (
                <div style={{ marginTop: 12, padding: 12, background: "var(--mh-ivory-2)", borderLeft: "3px solid var(--mh-teal)", borderRadius: 4 }}>
                  <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-teal)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>MENTOR PHẢN HỒI</div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>{reply}</p>
                  <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                    <button className="mh__btn" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => setReplyingIdx(i)}>Sửa</button>
                    <button className="mh__btn mh__btn--danger" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => { setReplies((p) => { const n = { ...p }; delete n[i]; return n; }); notify("Đã xoá phản hồi"); }}>Xoá</button>
                  </div>
                </div>
              )}

              {/* Reply composer inline */}
              {replyingIdx === i && <ReplyComposer initial={reply || ""} onCancel={() => setReplyingIdx(null)} onSave={(t) => saveReply(i, t)} />}

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {!reply && replyingIdx !== i && (
                  <button className="mh__btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setReplyingIdx(i)}>💬 Phản hồi</button>
                )}
                <button className="mh__btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setSharingReview(r)}>↗ Chia sẻ</button>
              </div>
            </div>
          );
        })}
        {reviews.length === 0 && <p style={{ color: "var(--mh-ink-soft)" }}>Chưa có đánh giá cho khoá này.</p>}
      </div>

      {sharingReview && <ShareReviewModal review={sharingReview} onClose={() => setSharingReview(null)} onToast={notify} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "14px 20px", background: "#166534", color: "#fff", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,.2)", zIndex: 300, fontSize: 14, maxWidth: 400 }}>{toast}</div>
      )}
    </div>
  );
}

// ── Reply composer ───────────────────────────────────────────────────────────
function ReplyComposer({ initial, onCancel, onSave }: { initial: string; onCancel: () => void; onSave: (t: string) => void }) {
  const [text, setText] = React.useState(initial);
  const [error, setError] = React.useState("");

  const submit = () => {
    if (!text.trim()) { setError("Nhập nội dung phản hồi"); return; }
    if (text.trim().length < 15) { setError("Phản hồi tối thiểu 15 ký tự để có ý nghĩa"); return; }
    onSave(text.trim());
  };

  const aiDrafts = [
    "Cảm ơn bạn đã dành thời gian đánh giá chi tiết. Mình rất vui khi thấy bạn áp dụng được kiến thức vào công việc. Có gì cần hỗ trợ thêm, cứ nhắn mình nhé!",
    "Cảm ơn phản hồi của bạn. Mình sẽ cải thiện điểm bạn góp ý trong những buổi sau. Cùng giữ liên lạc nhé!",
  ];

  return (
    <div style={{ marginTop: 12, padding: 14, background: "#fff", border: "1px solid var(--mh-teal)", borderRadius: 10 }}>
      <div className="mh__kicker" style={{ marginBottom: 8 }}>SOẠN PHẢN HỒI</div>
      <textarea
        className={"mh__textarea" + (error ? " mh__input--error" : "")}
        value={text}
        onChange={(e) => { setText(e.target.value); if (error) setError(""); }}
        placeholder="Cảm ơn học viên, làm rõ điểm họ góp ý, gợi ý hành động… Hiển thị công khai cạnh đánh giá trên Portal."
        maxLength={600}
        rows={4}
      />
      <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", marginTop: 4 }}>{text.length}/600</div>
      {error && <div className="mh__error">⚠ {error}</div>}

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        <span className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)", alignSelf: "center", marginRight: 4 }}>✦ AI GỢI Ý:</span>
        {aiDrafts.map((d, i) => (
          <button key={i} className="mh__btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setText(d)}>Mẫu {i + 1}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
        <button className="mh__btn" onClick={onCancel}>Huỷ</button>
        <button className="mh__btn mh__btn--primary" onClick={submit}>Gửi phản hồi</button>
      </div>
    </div>
  );
}

// ── Share review modal (testimonial sharing) ─────────────────────────────────
function ShareReviewModal({ review, onClose, onToast }: { review: ReviewItem; onClose: () => void; onToast: (t: string) => void }) {
  const [copied, setCopied] = React.useState(false);

  const cardUrl = `${location.origin}/crm/portal/testimonial/${encodeURIComponent(review.student)}`;
  const testimonialText = `"${review.comment}" — ${review.anonymous ? "Học viên ẩn danh" : review.student}${review.course ? ` · ${review.course}` : ""} (${"★".repeat(review.nps)})`;
  const shareText = testimonialText + "\n\nHọc cùng mình tại MentorHub: " + location.origin + "/crm/portal";

  const enc = encodeURIComponent;
  const shareZalo = `https://zalo.me/share?u=${enc(location.origin + "/crm/portal")}&t=${enc(testimonialText)}`;
  const shareFb = `https://www.facebook.com/sharer/sharer.php?u=${enc(location.origin + "/crm/portal")}&quote=${enc(testimonialText)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(location.origin + "/crm/portal")}&summary=${enc(testimonialText)}`;

  const copyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">CHIA SẺ ĐÁNH GIÁ</div>
            <h3 style={{ marginTop: 4 }}>Chia sẻ đánh giá này</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        {/* Preview testimonial card */}
        <div style={{ padding: 24, background: "linear-gradient(135deg, var(--mh-ivory-2), var(--mh-amber-soft))", borderRadius: 14, marginBottom: 20, border: "1px solid var(--mh-line)" }}>
          <div style={{ fontSize: 32, color: "var(--mh-teal)", fontFamily: "'Fraunces', serif", lineHeight: 1, marginBottom: 10 }}>"</div>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontStyle: "italic", lineHeight: 1.55, margin: "0 0 14px" }}>{review.comment}</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--mh-line)" }}>
            <div className="mh__avatar mh__avatar--sm" style={{ background: review.anonymous ? "#9CA3AF" : "#0F766E" }}>{review.short}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{review.student}</div>
              <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{review.course}</div>
            </div>
            <div className="mh__mono" style={{ fontSize: 12, color: "var(--mh-amber)" }}>{"★".repeat(review.nps)}</div>
          </div>
        </div>

        {/* Social share buttons */}
        <div className="mh__kicker" style={{ marginBottom: 10 }}>GỬI QUA KÊNH</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
          <a href={shareZalo} target="_blank" rel="noopener noreferrer" className="mh__btn" style={{ background: "#0068FF", color: "#fff", borderColor: "#0068FF", justifyContent: "center" }}>💬 Zalo</a>
          <a href={shareFb} target="_blank" rel="noopener noreferrer" className="mh__btn" style={{ background: "#1877F2", color: "#fff", borderColor: "#1877F2", justifyContent: "center" }}>ⓕ Facebook</a>
          <a href={shareLinkedIn} target="_blank" rel="noopener noreferrer" className="mh__btn" style={{ background: "#0A66C2", color: "#fff", borderColor: "#0A66C2", justifyContent: "center" }}>in LinkedIn</a>
          <button className="mh__btn" style={{ justifyContent: "center" }} onClick={() => { onClose(); onToast("🖼 Đang tải ảnh testimonial PNG (demo)"); setTimeout(() => onToast("✓ Đã tải xuống testimonial.png — dùng đăng story/feed"), 1500); }}>🖼 Tải PNG</button>
        </div>

        {/* Copy text */}
        <div className="mh__kicker" style={{ marginBottom: 10 }}>HOẶC COPY TEXT</div>
        <textarea readOnly className="mh__textarea" value={shareText} style={{ fontSize: 12, minHeight: 80 }} onFocus={(e) => e.currentTarget.select()} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
          <button className="mh__btn" onClick={copyText}>{copied ? "✓ Đã copy" : "📋 Copy nội dung"}</button>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "var(--mh-amber-soft)", borderRadius: 10, fontSize: 12, color: "var(--mh-ink)", border: "1px solid rgba(180, 88, 9, 0.2)" }}>
          💡 <strong>Lưu ý đạo đức:</strong> Đánh giá ẩn danh không nên share kèm tên học viên. Đánh giá công khai cần có sự đồng ý trước khi dùng cho quảng bá.
        </div>
      </div>
    </div>
  );
}
