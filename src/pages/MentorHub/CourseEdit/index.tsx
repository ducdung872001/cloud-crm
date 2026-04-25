// [MH] CourseEdit — form tạo/sửa khoá học với validation + RebornEditor + Agenda
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Descendant } from "slate";
import RebornEditor from "components/editor/reborn";
import "../_shared/styles.scss";
import "./form.scss";

type AgendaItem = { id: string; title: string; description: string; durationMin: number };

type FormData = {
  title: string;
  icon: string;
  description: string;
  category: string;
  content: Descendant[]; // RebornEditor rich content
  agenda: AgendaItem[];
  sessions: number | "";
  capacity: number | "";
  startDate: string;
  price: number | "";
  originalPrice: number | "";
  zoomId: string;
  reminderZalo: boolean;
  reminderEmail: boolean;
  autoFeedback: boolean;
  autoRecording: boolean;
};

type Errors = Partial<Record<keyof FormData, string>>;

const CATEGORIES = ["Kỹ thuật phần mềm", "Quản lý sản phẩm", "Leadership", "Data & AI", "DevOps", "Khác"];
const ICONS = ["⎈", "∞", "◈", "⚡", "★", "✦", "◐", "▦", "❑", "☉"];
const EMPTY_RICH: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }] as Descendant[];

const newAgendaItem = (idx: number): AgendaItem => ({
  id: "AG-" + Math.random().toString(36).slice(2, 8),
  title: `Buổi ${idx + 1}`,
  description: "",
  durationMin: 120,
});

export default function MHCourseEdit() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  document.title = (isEdit ? "Sửa" : "Tạo") + " khoá học · MentorHub";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    title: "",
    icon: "⎈",
    description: "",
    category: CATEGORIES[0],
    content: EMPTY_RICH,
    agenda: [newAgendaItem(0), newAgendaItem(1), newAgendaItem(2)],
    sessions: "",
    capacity: 30,
    startDate: "",
    price: "",
    originalPrice: "",
    zoomId: "",
    reminderZalo: true,
    reminderEmail: true,
    autoFeedback: true,
    autoRecording: true,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // Agenda helpers
  const updateAgenda = (idx: number, patch: Partial<AgendaItem>) => {
    setForm((p) => ({ ...p, agenda: p.agenda.map((a, i) => (i === idx ? { ...a, ...patch } : a)) }));
  };
  const addAgendaItem = () => {
    setForm((p) => ({ ...p, agenda: [...p.agenda, newAgendaItem(p.agenda.length)] }));
  };
  const removeAgendaItem = (idx: number) => {
    setForm((p) => ({ ...p, agenda: p.agenda.filter((_, i) => i !== idx) }));
  };
  const moveAgendaItem = (idx: number, dir: -1 | 1) => {
    setForm((p) => {
      const next = [...p.agenda];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return p;
      [next[idx], next[to]] = [next[to], next[idx]];
      return { ...p, agenda: next };
    });
  };

  const validateStep = (s: number): Errors => {
    const e: Errors = {};
    if (s === 1) {
      if (!form.title.trim()) e.title = "Nhập tên khoá học";
      else if (form.title.trim().length < 10) e.title = "Tên khoá quá ngắn (tối thiểu 10 ký tự)";
      if (!form.description.trim()) e.description = "Mô tả ngắn để học viên hiểu nội dung";
      else if (form.description.trim().length < 50) e.description = "Mô tả tối thiểu 50 ký tự (hiện " + form.description.trim().length + ")";
    }
    if (s === 2) {
      if (!form.agenda.length) e.agenda = "Cần ít nhất 1 buổi trong giáo trình";
      else if (form.agenda.some((a) => !a.title.trim())) e.agenda = "Mỗi buổi phải có tiêu đề";
    }
    if (s === 3) {
      if (!form.capacity || +form.capacity < 1) e.capacity = "Sĩ số ≥ 1";
      if (!form.startDate) e.startDate = "Chọn ngày bắt đầu";
      else if (new Date(form.startDate) < new Date(new Date().toDateString())) e.startDate = "Ngày bắt đầu phải trong tương lai";
    }
    if (s === 4) {
      if (form.price === "" || +form.price < 0) e.price = "Giá ≥ 0 (miễn phí nhập 0)";
      if (form.originalPrice !== "" && +form.originalPrice < +form.price) e.originalPrice = "Giá gốc phải ≥ giá bán";
    }
    if (s === 5) {
      if (!form.zoomId.trim()) e.zoomId = "Nhập Zoom Meeting ID (kết nối Zoom ở Cài đặt)";
      else if (!/^\d{3}-?\d{4}-?\d{4}$|^\d{10,11}$/.test(form.zoomId.replace(/\s/g, ""))) e.zoomId = "Zoom ID không hợp lệ (ví dụ: 892-4731-0028)";
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(step + 1);
  };

  const submit = (publish: boolean) => {
    const allErrors: Errors = { ...validateStep(1), ...validateStep(2), ...validateStep(3), ...validateStep(4), ...validateStep(5) };
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      const keys = Object.keys(allErrors);
      const firstStep = keys.some((k) => ["title", "description"].includes(k)) ? 1
        : keys.includes("agenda") ? 2
        : keys.some((k) => ["capacity", "startDate"].includes(k)) ? 3
        : keys.some((k) => ["price", "originalPrice"].includes(k)) ? 4
        : 5;
      setStep(firstStep);
      return;
    }
    setSubmitted(true);
    console.log("[MOCK SUBMIT]", publish ? "PUBLISHED" : "DRAFT", form);
    setTimeout(() => navigate("/mh/courses"), 1500);
  };

  if (submitted) {
    return (
      <div className="mh">
        <div className="mh__card" style={{ textAlign: "center", padding: 60, maxWidth: 560, margin: "80px auto" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✓</div>
          <h2 style={{ marginBottom: 12 }}>Khoá học đã lưu</h2>
          <p style={{ color: "var(--mh-ink-soft)" }}>Đang chuyển về danh sách…</p>
        </div>
      </div>
    );
  }

  const steps = ["Thông tin", "Giáo trình", "Lịch & Sĩ số", "Định giá", "Tự động hoá", "Duyệt & Publish"];

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">{isEdit ? "SỬA KHOÁ" : "TẠO KHOÁ MỚI"}</div>
        <h1>{isEdit ? "Cập nhật khoá" : "Tạo khoá học"} <em>mới</em></h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>Điền thông tin qua 6 bước. Có thể lưu nháp và publish sau.</p>
      </div>

      <div className="mh-wizard">
        {steps.map((label, i) => (
          <button key={label} onClick={() => setStep(i + 1)} className={"mh-wizard__step" + (step === i + 1 ? " is-active" : "") + (step > i + 1 ? " is-done" : "")}>
            <span className="mh-wizard__num">{step > i + 1 ? "✓" : i + 1}</span>
            <span className="mh-wizard__label">{label}</span>
          </button>
        ))}
      </div>

      <div className="mh__card mh-form">
        {step === 1 && (
          <>
            <h3>1. Thông tin cơ bản</h3>
            <div className="mh-form__row">
              <label className="mh-form__label">Tên khoá học <span className="mh-form__req">*</span></label>
              <input className={"mh-form__input" + (errors.title ? " is-invalid" : "")} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="VD: Kiến trúc Microservices với Spring Boot" maxLength={120} />
              <div className="mh-form__hint">
                {errors.title ? <span className="mh-form__error">⚠ {errors.title}</span> : <span>{form.title.length}/120 ký tự</span>}
              </div>
            </div>

            <div className="mh-form__grid-2">
              <div className="mh-form__row">
                <label className="mh-form__label">Icon hiển thị</label>
                <div className="mh-icon-picker">
                  {ICONS.map((ic) => (
                    <button key={ic} type="button" onClick={() => set("icon", ic)} className={"mh-icon-picker__item" + (form.icon === ic ? " is-active" : "")}>{ic}</button>
                  ))}
                </div>
              </div>
              <div className="mh-form__row">
                <label className="mh-form__label">Chuyên mục</label>
                <select className="mh-form__input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mh-form__row">
              <label className="mh-form__label">Mô tả ngắn (tagline) <span className="mh-form__req">*</span></label>
              <textarea className={"mh-form__input mh-form__textarea" + (errors.description ? " is-invalid" : "")} value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Học viên học được gì? Phù hợp cho ai? (hiển thị trên card, tối thiểu 50 ký tự)" maxLength={500} />
              <div className="mh-form__hint">
                {errors.description ? <span className="mh-form__error">⚠ {errors.description}</span> : <span>{form.description.length}/500 ký tự · AI có thể viết dựa trên tên khoá.</span>}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3>2. Giáo trình chi tiết</h3>

            {/* Long-form rich content */}
            <div className="mh-form__row">
              <label className="mh-form__label">Nội dung chi tiết khoá học</label>
              <div className="mh-form__hint" style={{ marginTop: 0, marginBottom: 8 }}>
                Mô tả đầy đủ, mục tiêu học tập, yêu cầu đầu vào, lợi ích sau khoá. Hỗ trợ định dạng văn bản đậm/nghiêng/danh sách/link.
              </div>
              <div className="mh-form__editor-wrap">
                <RebornEditor
                  name="courseContent"
                  fill
                  initialValue={form.content as unknown as string}
                  onChangeContent={(value) => set("content", value)}
                />
              </div>
            </div>

            {/* Agenda list */}
            <div className="mh-form__row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                <label className="mh-form__label" style={{ marginBottom: 0 }}>Agenda buổi học <span className="mh-form__req">*</span></label>
                <span className="mh-form__hint" style={{ marginTop: 0 }}>{form.agenda.length} buổi</span>
              </div>
              {errors.agenda && <div className="mh-form__error" style={{ marginBottom: 10 }}>⚠ {errors.agenda}</div>}

              <div className="mh-agenda">
                {form.agenda.map((item, idx) => (
                  <div key={item.id} className="mh-agenda__item">
                    <div className="mh-agenda__num">{String(idx + 1).padStart(2, "0")}</div>
                    <div className="mh-agenda__body">
                      <input
                        className="mh-form__input"
                        value={item.title}
                        onChange={(e) => updateAgenda(idx, { title: e.target.value })}
                        placeholder="Tiêu đề buổi học"
                        style={{ marginBottom: 8, fontWeight: 500 }}
                      />
                      <textarea
                        className="mh-form__input mh-form__textarea"
                        value={item.description}
                        onChange={(e) => updateAgenda(idx, { description: e.target.value })}
                        placeholder="Nội dung buổi học, demo, homework… (tuỳ chọn)"
                        rows={2}
                        style={{ minHeight: 60 }}
                      />
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                        <label className="mh-form__hint" style={{ marginTop: 0 }}>Thời lượng:</label>
                        <input
                          type="number"
                          min={15}
                          max={480}
                          value={item.durationMin}
                          onChange={(e) => updateAgenda(idx, { durationMin: +e.target.value })}
                          className="mh-form__input"
                          style={{ width: 90, padding: "6px 10px" }}
                        />
                        <span className="mh-form__hint" style={{ marginTop: 0 }}>phút</span>
                      </div>
                    </div>
                    <div className="mh-agenda__actions">
                      <button type="button" className="mh-agenda__btn" onClick={() => moveAgendaItem(idx, -1)} disabled={idx === 0} title="Di chuyển lên">↑</button>
                      <button type="button" className="mh-agenda__btn" onClick={() => moveAgendaItem(idx, 1)} disabled={idx === form.agenda.length - 1} title="Di chuyển xuống">↓</button>
                      <button type="button" className="mh-agenda__btn mh-agenda__btn--danger" onClick={() => removeAgendaItem(idx)} disabled={form.agenda.length === 1} title="Xoá buổi">✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" className="mh__btn" style={{ marginTop: 10 }} onClick={addAgendaItem}>+ Thêm buổi học</button>
              <span className="mh-form__hint" style={{ marginLeft: 10 }}>Số buổi tự động cập nhật theo agenda (hiện: {form.agenda.length})</span>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3>3. Lịch học & Sĩ số</h3>
            <div className="mh-form__grid-2">
              <div className="mh-form__row">
                <label className="mh-form__label">Số buổi</label>
                <input type="number" className="mh-form__input" value={form.agenda.length} readOnly style={{ background: "var(--mh-ivory-2)" }} />
                <div className="mh-form__hint">Tự động từ Agenda (<Link to="#" onClick={(e) => { e.preventDefault(); setStep(2); }} className="mh-link">sửa</Link>)</div>
              </div>
              <div className="mh-form__row">
                <label className="mh-form__label">Sĩ số tối đa <span className="mh-form__req">*</span></label>
                <input type="number" min={1} max={1000} className={"mh-form__input" + (errors.capacity ? " is-invalid" : "")} value={form.capacity} onChange={(e) => set("capacity", e.target.value === "" ? "" : +e.target.value)} placeholder="30" />
                {errors.capacity && <div className="mh-form__error">⚠ {errors.capacity}</div>}
              </div>
            </div>
            <div className="mh-form__row">
              <label className="mh-form__label">Ngày bắt đầu <span className="mh-form__req">*</span></label>
              <input type="date" className={"mh-form__input" + (errors.startDate ? " is-invalid" : "")} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} min={new Date().toISOString().split("T")[0]} />
              {errors.startDate && <div className="mh-form__error">⚠ {errors.startDate}</div>}
            </div>

            {/* Quick overview of agenda */}
            <div className="mh-form__row">
              <label className="mh-form__label">Xem nhanh agenda</label>
              <div style={{ background: "var(--mh-ivory-2)", borderRadius: 10, padding: 14, maxHeight: 180, overflowY: "auto" }}>
                {form.agenda.map((a, i) => (
                  <div key={a.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, padding: "6px 0", fontSize: 13, alignItems: "center", borderBottom: i < form.agenda.length - 1 ? "1px solid var(--mh-line)" : "none" }}>
                    <span className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{a.title}</span>
                    <span className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{a.durationMin}p</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3>4. Định giá</h3>
            <div className="mh-form__grid-2">
              <div className="mh-form__row">
                <label className="mh-form__label">Giá bán (₫) <span className="mh-form__req">*</span></label>
                <input type="number" min={0} className={"mh-form__input" + (errors.price ? " is-invalid" : "")} value={form.price} onChange={(e) => set("price", e.target.value === "" ? "" : +e.target.value)} placeholder="2400000" />
                {errors.price && <div className="mh-form__error">⚠ {errors.price}</div>}
              </div>
              <div className="mh-form__row">
                <label className="mh-form__label">Giá gốc (gạch chéo, tuỳ chọn)</label>
                <input type="number" min={0} className={"mh-form__input" + (errors.originalPrice ? " is-invalid" : "")} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value === "" ? "" : +e.target.value)} placeholder="3200000" />
                {errors.originalPrice && <div className="mh-form__error">⚠ {errors.originalPrice}</div>}
              </div>
            </div>
            <div className="mh__card mh__card--amber" style={{ marginTop: 16 }}>
              <div className="mh__kicker" style={{ color: "var(--mh-amber)" }}>GỢI Ý AI</div>
              <p style={{ margin: "8px 0 0", fontSize: 14 }}>
                Khoá {form.agenda.length} buổi cùng chuyên mục có giá trung bình <strong>2.1–2.8M₫</strong>. 15 mentor khác đang bán khoảng giá này với NPS 4.7+.
              </p>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h3>5. Tự động hoá & Tích hợp</h3>
            <div className="mh-form__row">
              <label className="mh-form__label">Zoom Meeting ID <span className="mh-form__req">*</span></label>
              <input className={"mh-form__input" + (errors.zoomId ? " is-invalid" : "")} value={form.zoomId} onChange={(e) => set("zoomId", e.target.value)} placeholder="892-4731-0028" />
              {errors.zoomId && <div className="mh-form__error">⚠ {errors.zoomId}</div>}
              <div className="mh-form__hint">Kết nối Zoom ở <Link to="/mh/settings" className="mh-link">Cài đặt → Tích hợp</Link> để lấy ID tự động.</div>
            </div>

            <div className="mh-form__row">
              <label className="mh-form__label">Nhắc học viên tự động</label>
              <label className="mh-form__toggle">
                <input type="checkbox" checked={form.reminderZalo} onChange={(e) => set("reminderZalo", e.target.checked)} />
                <span>Gửi Zalo 24h và 30 phút trước buổi học</span>
              </label>
              <label className="mh-form__toggle">
                <input type="checkbox" checked={form.reminderEmail} onChange={(e) => set("reminderEmail", e.target.checked)} />
                <span>Gửi email 24h trước buổi học</span>
              </label>
              <label className="mh-form__toggle">
                <input type="checkbox" checked={form.autoFeedback} onChange={(e) => set("autoFeedback", e.target.checked)} />
                <span>Gửi form đánh giá sau mỗi buổi</span>
              </label>
              <label className="mh-form__toggle">
                <input type="checkbox" checked={form.autoRecording} onChange={(e) => set("autoRecording", e.target.checked)} />
                <span>Tự động chuyển recording → AI meeting note</span>
              </label>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h3>6. Kiểm tra & Publish</h3>
            <div className="mh-form__review">
              <ReviewRow label="Tên khoá" value={form.title} />
              <ReviewRow label="Chuyên mục" value={form.category} />
              <ReviewRow label="Số buổi" value={`${form.agenda.length} buổi`} />
              <ReviewRow label="Sĩ số" value={`${form.capacity} học viên`} />
              <ReviewRow label="Bắt đầu" value={form.startDate || "—"} />
              <ReviewRow label="Giá" value={form.price !== "" ? new Intl.NumberFormat("vi-VN").format(+form.price) + "₫" : "—"} />
              <ReviewRow label="Zoom ID" value={form.zoomId} />
              <ReviewRow label="Tự động hoá" value={[form.reminderZalo && "Zalo", form.reminderEmail && "Email", form.autoFeedback && "Feedback", form.autoRecording && "AI Note"].filter(Boolean).join(" · ") || "Tắt hết"} />
            </div>
          </>
        )}

        <div className="mh-form__actions">
          <button className="mh__btn" onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1}>← Quay lại</button>
          <div style={{ flex: 1 }} />
          {step < 6 ? (
            <button className="mh__btn mh__btn--primary" onClick={next}>Tiếp theo →</button>
          ) : (
            <>
              <button className="mh__btn" onClick={() => submit(false)}>Lưu nháp</button>
              <button className="mh__btn mh__btn--primary" onClick={() => submit(true)}>Publish khoá học</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mh-form__review-row">
      <span className="mh-form__review-label">{label}</span>
      <span className="mh-form__review-value">{value || <em style={{ color: "var(--mh-red)" }}>Chưa nhập</em>}</span>
    </div>
  );
}
