// Portal post-session feedback — rating + comment + anonymous optional.
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import { MOCK_COURSES, MOCK_MENTOR, MOCK_SESSION_REVIEW } from "@/mocks/mentorhub";

type FeedbackForm = {
  rating: number;
  paceOk: boolean | null;
  topics: string[];
  comment: string;
  wouldRecommend: boolean | null;
  anonymous: boolean;
};

type Errors = Partial<Record<keyof FeedbackForm, string>>;

const TOPICS = ["Nội dung chất lượng", "Mentor giảng dễ hiểu", "Q&A thoả đáng", "Tài liệu đầy đủ", "Thời lượng phù hợp", "Workflow thực hành"];

export default function PortalFeedback() {
  const { sessionId } = useParams();
  const course = MOCK_COURSES[0]; // Mock: any session maps to first course
  const session = MOCK_SESSION_REVIEW;
  document.title = `Đánh giá buổi ${session.sessionNumber} · ${course.title}`;

  const [form, setForm] = useState<FeedbackForm>({
    rating: 0,
    paceOk: null,
    topics: [],
    comment: "",
    wouldRecommend: null,
    anonymous: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const set = <K extends keyof FeedbackForm>(k: K, v: FeedbackForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const toggleTopic = (t: string) => {
    set("topics", form.topics.includes(t) ? form.topics.filter((x) => x !== t) : [...form.topics, t]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (form.rating === 0) errs.rating = "Chọn số sao đánh giá";
    if (form.wouldRecommend === null) errs.wouldRecommend = "Bạn có giới thiệu khoá này cho bạn bè?";
    if (form.rating <= 3 && !form.comment.trim()) errs.comment = "Chia sẻ điểm cần cải thiện để mentor rút kinh nghiệm";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitted(true);
    // TODO: POST /portal/feedback
  };

  if (submitted) {
    return (
      <PortalLayout>
        <div style={{ maxWidth: 640, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 88, height: 88, borderRadius: "50%", background: "#DCFCE7", color: "#166534", fontSize: 44, marginBottom: 24 }}>♥</div>
          <h1 style={{ fontSize: 44, marginBottom: 16 }}>Cám ơn bạn!</h1>
          <p style={{ fontSize: 17, color: "var(--pt-ink-soft)", marginBottom: 8 }}>
            Đánh giá của bạn {form.anonymous ? <em>(ẩn danh)</em> : ""} đã được ghi nhận.
          </p>
          <p style={{ fontSize: 15, color: "var(--pt-ink-soft)", marginBottom: 32 }}>
            Mentor sẽ dùng phản hồi này để chuẩn bị tốt hơn cho buổi tiếp theo.
          </p>
          {form.rating >= 4 && (
            <div className="pt-share" style={{ textAlign: "left", maxWidth: 500, margin: "0 auto" }}>
              <div className="pt-share__eyebrow">⚡ CHIA SẺ KHI BẠN HÀI LÒNG</div>
              <div className="pt-share__title">Giới thiệu khoá này cho bạn bè?</div>
              <p className="pt-share__desc">Đánh giá cao của bạn là động lực lớn nhất cho mentor. Hãy lan toả tới những người có thể cần.</p>
              <div className="pt-share__buttons">
                <a href={`https://zalo.me/share?u=${encodeURIComponent(location.origin + "/crm/portal/courses/" + course.id)}`} target="_blank" rel="noopener noreferrer" className="pt-share__btn pt-share__btn--zalo">💬 Chia sẻ Zalo</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.origin + "/crm/portal/courses/" + course.id)}`} target="_blank" rel="noopener noreferrer" className="pt-share__btn pt-share__btn--fb">ⓕ Facebook</a>
              </div>
            </div>
          )}
          <div style={{ marginTop: 32 }}>
            <Link to="/portal" className="pt-btn pt-btn--lg">Về trang chính</Link>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const ratingLabels = ["", "Rất tệ", "Không tốt", "Bình thường", "Tốt", "Tuyệt vời"];

  return (
    <PortalLayout>
      <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 20px 80px" }}>
        <div className="pt-kicker" style={{ marginBottom: 8 }}>ĐÁNH GIÁ BUỔI HỌC</div>
        <h1 style={{ fontSize: 40, marginBottom: 12 }}>Buổi {session.sessionNumber}: <em>{session.sessionTitle}</em></h1>
        <p style={{ color: "var(--pt-ink-soft)", marginBottom: 40 }}>
          Khoá: <strong>{course.title}</strong> · Giảng viên: {MOCK_MENTOR.name} · {session.date}
        </p>

        <form onSubmit={submit} noValidate className="pt-form" style={{ margin: 0, maxWidth: "none" }}>
          <div className="pt-field">
            <label className="pt-label pt-label--req">Buổi học thế nào?</label>
            <div className="pt-stars" onMouseLeave={() => setHoverStar(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={"pt-star" + ((hoverStar || form.rating) >= n ? " is-on" : "")}
                  onClick={() => set("rating", n)}
                  onMouseEnter={() => setHoverStar(n)}
                  role="button"
                  aria-label={`${n} sao`}
                >
                  ★
                </span>
              ))}
              <span style={{ marginLeft: 16, alignSelf: "center", fontSize: 14, color: "var(--pt-ink-soft)" }}>
                {(hoverStar || form.rating) > 0 ? ratingLabels[hoverStar || form.rating] : "Chọn sao"}
              </span>
            </div>
            {errors.rating && <div className="pt-error">⚠ {errors.rating}</div>}
          </div>

          <div className="pt-field">
            <label className="pt-label">Nhịp độ buổi học</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { v: true, l: "👍 Vừa vặn" },
                { v: false, l: "🐢 Quá chậm / quá nhanh" },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  type="button"
                  onClick={() => set("paceOk", o.v)}
                  className={"pt-btn" + (form.paceOk === o.v ? " pt-btn--teal" : "")}
                >{o.l}</button>
              ))}
            </div>
          </div>

          <div className="pt-field">
            <label className="pt-label">Điều bạn thấy tốt (chọn nhiều)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className={"pt-btn" + (form.topics.includes(t) ? " pt-btn--teal" : "")}
                  style={{ fontSize: 13 }}
                >
                  {form.topics.includes(t) ? "✓ " : ""}{t}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-field">
            <label className="pt-label">
              Chia sẻ thêm
              {form.rating > 0 && form.rating <= 3 && <span style={{ color: "var(--pt-red)" }}> *</span>}
            </label>
            <textarea
              className={"pt-textarea" + (errors.comment ? " is-invalid" : "")}
              value={form.comment}
              onChange={(e) => set("comment", e.target.value)}
              placeholder={form.rating <= 3 && form.rating > 0 ? "Mentor rất cần nghe điểm cần cải thiện — chia sẻ thẳng thắn nhé" : "Điểm bạn thích, gợi ý cải thiện, câu hỏi còn đọng lại…"}
              maxLength={1000}
            />
            <div style={{ fontSize: 12, color: "var(--pt-ink-soft)", marginTop: 4 }}>{form.comment.length}/1000</div>
            {errors.comment && <div className="pt-error">⚠ {errors.comment}</div>}
          </div>

          <div className="pt-field">
            <label className="pt-label pt-label--req">Bạn có giới thiệu khoá này cho bạn bè?</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { v: true, l: "👍 Có" },
                { v: false, l: "👎 Không" },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  type="button"
                  onClick={() => set("wouldRecommend", o.v)}
                  className={"pt-btn" + (form.wouldRecommend === o.v ? " pt-btn--teal" : "")}
                >{o.l}</button>
              ))}
            </div>
            {errors.wouldRecommend && <div className="pt-error">⚠ {errors.wouldRecommend}</div>}
          </div>

          <label className="pt-check" style={{ marginBottom: 24, padding: 14, background: "var(--pt-ivory-2)", borderRadius: 10 }}>
            <input type="checkbox" checked={form.anonymous} onChange={(e) => set("anonymous", e.target.checked)} />
            <span>
              Gửi ẩn danh (mentor thấy nội dung nhưng không biết là bạn)
              <div style={{ fontSize: 12, color: "var(--pt-ink-soft)", marginTop: 2 }}>Có ích khi bạn muốn phản hồi thẳng thắn mà không ngại.</div>
            </span>
          </label>

          <button type="submit" className="pt-btn pt-btn--primary pt-btn--xl" style={{ width: "100%", justifyContent: "center" }}>
            Gửi đánh giá →
          </button>
        </form>
      </div>
    </PortalLayout>
  );
}
