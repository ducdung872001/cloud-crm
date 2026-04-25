// [MH] Students — roster với filter, search, bulk actions, add modal, detail drawer
import React, { useState } from "react";
import { MOCK_STUDENTS, MOCK_COURSES } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(0|\+?84)(\s*\d){9,10}$/;
const segmentColor: Record<string, string> = {
  VIP: "mh__pill--amber",
  Active: "mh__pill--green",
  "Churn risk": "mh__pill--red",
  New: "mh__pill--upcoming",
};

type Student = typeof MOCK_STUDENTS[number];

export default function MHStudents() {
  document.title = "Học viên · MentorHub";
  const [segment, setSegment] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState(MOCK_STUDENTS);

  const segments = ["all", "VIP", "Active", "Churn risk", "New"];
  const filtered = students.filter((s) => {
    if (segment !== "all" && s.segment !== segment) return false;
    if (query && !(s.name + s.email + s.company).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const toggle = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };
  const totalLtv = filtered.reduce((s, x) => s + x.ltv, 0);
  const withNps = filtered.filter((s) => s.nps > 0);
  const avgNps = withNps.length ? withNps.reduce((a, b) => a + b.nps, 0) / withNps.length : 0;

  return (
    <div className="mh">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mh__kicker">HỌC VIÊN</div>
          <h1>Danh sách <em>học viên</em></h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>{students.length} học viên đã đăng ký · LTV TB {formatVND(Math.round(totalLtv / Math.max(1, filtered.length)))}</p>
        </div>
        <button className="mh__btn mh__btn--primary" onClick={() => setShowAdd(true)}>+ Thêm học viên</button>
      </div>

      <div className="mh__grid mh__grid--4" style={{ marginBottom: 24 }}>
        <div className="mh__kpi"><div className="mh__kpi-label">HIỂN THỊ</div><div className="mh__kpi-value">{filtered.length}</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">TỔNG LTV</div><div className="mh__kpi-value">{formatVND(totalLtv)}</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">NPS TB</div><div className="mh__kpi-value">{avgNps ? avgNps.toFixed(2) : "—"}</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">CHURN RISK</div><div className="mh__kpi-value" style={{ color: "var(--mh-red)" }}>{students.filter((s) => s.segment === "Churn risk").length}</div></div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="mh__input" placeholder="🔍 Tìm tên, email, công ty…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {segments.map((s) => (
            <button key={s} className="mh__btn" style={segment === s ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)" } : {}} onClick={() => setSegment(s)}>
              {s === "all" ? "Tất cả" : s}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 16px", background: "var(--mh-teal-d)", borderRadius: 10, marginBottom: 16, color: "#fff", flexWrap: "wrap" }}>
          <span className="mh__mono" style={{ fontSize: 13 }}>Đã chọn {selected.size}</span>
          <button className="mh__btn" style={{ padding: "6px 12px", fontSize: 13 }}>📧 Gửi email</button>
          <button className="mh__btn" style={{ padding: "6px 12px", fontSize: 13 }}>💬 Gửi Zalo</button>
          <button className="mh__btn" style={{ padding: "6px 12px", fontSize: 13 }}>📊 Export CSV</button>
          <button className="mh__btn" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => setSelected(new Set())}>✕ Bỏ chọn</button>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="mh__table">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((s) => s.id)))} /></th>
              <th>Học viên</th>
              <th>Công ty</th>
              <th style={{ textAlign: "right" }}>LTV</th>
              <th style={{ textAlign: "right" }}>NPS</th>
              <th>Phân nhóm</th>
              <th style={{ textAlign: "right" }}>Khoá</th>
              <th>Hoạt động</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td><input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} /></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="mh__avatar" style={{ background: s.avatarBg }}>{s.short}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>{s.company}</div>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{s.role}</div>
                </td>
                <td className="mh__mono" style={{ textAlign: "right", color: "var(--mh-teal)", fontWeight: 600 }}>{formatVND(s.ltv)}</td>
                <td className="mh__mono" style={{ textAlign: "right" }}>{s.nps > 0 ? s.nps.toFixed(1) : "—"}</td>
                <td><span className={"mh__pill " + (segmentColor[s.segment] || "mh__pill--draft")}>{s.segment}</span></td>
                <td className="mh__mono" style={{ textAlign: "right" }}>{s.courses}</td>
                <td className="mh__mono" style={{ fontSize: 12, color: "var(--mh-ink-soft)" }}>{s.lastActive}</td>
                <td style={{ textAlign: "right" }}><button className="mh__btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setDetailStudent(s)}>Xem</button></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "var(--mh-ink-soft)" }}>Không tìm thấy học viên phù hợp</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} onAdd={(st) => { setStudents((prev) => [st, ...prev]); setShowAdd(false); }} />}
      {detailStudent && <StudentDetailDrawer student={detailStudent} onClose={() => setDetailStudent(null)} />}
    </div>
  );
}

// ── Add Student Modal ─────────────────────────────────────────────────────────
function AddStudentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Student) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", role: "", course: MOCK_COURSES[0].id });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nhập họ tên";
    else if (form.name.trim().length < 2) errs.name = "Tên quá ngắn";
    if (!form.email.trim()) errs.email = "Nhập email";
    else if (!emailRegex.test(form.email)) errs.email = "Email không hợp lệ";
    if (form.phone && !phoneRegex.test(form.phone.replace(/\s/g, ""))) errs.phone = "SĐT không hợp lệ";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const parts = form.name.trim().split(/\s+/);
    const short = (parts[0]?.[0] || "?") + (parts[parts.length - 1]?.[0] || "");
    const newStudent: Student = {
      id: "S-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      name: form.name.trim(),
      short: short.toUpperCase(),
      company: form.company || "—",
      role: form.role || "—",
      email: form.email,
      phone: form.phone || "—",
      avatarBg: ["#0F766E", "#B45309", "#134E4A", "#7C2D12", "#166534", "#1E40AF"][Math.floor(Math.random() * 6)],
      ltv: 0,
      nps: 0,
      segment: "New",
      courses: 1,
      lastActive: "now",
    };
    onAdd(newStudent);
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">HỌC VIÊN MỚI</div>
            <h3 style={{ marginTop: 4 }}>Thêm học viên</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="mh__field">
            <label className="mh__label mh__label--req">Họ tên</label>
            <input className={"mh__input" + (errors.name ? " mh__input--error" : "")} value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }} placeholder="VD: Nguyễn Văn A" />
            {errors.name && <div className="mh__error">⚠ {errors.name}</div>}
          </div>
          <div className="mh__row mh__row--2">
            <div className="mh__field">
              <label className="mh__label mh__label--req">Email</label>
              <input type="email" className={"mh__input" + (errors.email ? " mh__input--error" : "")} value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: "" }); }} placeholder="ban@email.com" />
              {errors.email && <div className="mh__error">⚠ {errors.email}</div>}
            </div>
            <div className="mh__field">
              <label className="mh__label">Số điện thoại</label>
              <input type="tel" className={"mh__input" + (errors.phone ? " mh__input--error" : "")} value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); if (errors.phone) setErrors({ ...errors, phone: "" }); }} placeholder="0912345678" />
              {errors.phone && <div className="mh__error">⚠ {errors.phone}</div>}
            </div>
          </div>
          <div className="mh__row mh__row--2">
            <div className="mh__field">
              <label className="mh__label">Công ty</label>
              <input className="mh__input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="VD: FPT Software" />
            </div>
            <div className="mh__field">
              <label className="mh__label">Vị trí</label>
              <input className="mh__input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="VD: Backend Engineer" />
            </div>
          </div>
          <div className="mh__field">
            <label className="mh__label">Đăng ký vào khoá</label>
            <select className="mh__select" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              {MOCK_COURSES.filter((c) => c.status !== "draft").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" className="mh__btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="mh__btn mh__btn--primary">Thêm học viên</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Student Detail Drawer ─────────────────────────────────────────────────────
function StudentDetailDrawer({ student, onClose }: { student: Student; onClose: () => void }) {
  const enrolledCourses = MOCK_COURSES.slice(0, student.courses);
  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div className="mh__avatar mh__avatar--lg" style={{ background: student.avatarBg }}>{student.short}</div>
            <div>
              <h3 style={{ marginBottom: 4 }}>{student.name}</h3>
              <div className="mh__mono" style={{ fontSize: 12, color: "var(--mh-ink-soft)" }}>{student.role} · {student.company}</div>
              <span className={"mh__pill " + (segmentColor[student.segment] || "mh__pill--draft")} style={{ marginTop: 6 }}>{student.segment}</span>
            </div>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <div className="mh__grid mh__grid--2" style={{ marginBottom: 20 }}>
          <div className="mh__kpi"><div className="mh__kpi-label">LTV</div><div className="mh__kpi-value" style={{ fontSize: 24 }}>{formatVND(student.ltv)}</div></div>
          <div className="mh__kpi"><div className="mh__kpi-label">NPS</div><div className="mh__kpi-value" style={{ fontSize: 24 }}>{student.nps > 0 ? student.nps.toFixed(1) : "—"}</div></div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="mh__kicker" style={{ marginBottom: 8 }}>LIÊN HỆ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <div>📧 <a href={`mailto:${student.email}`} style={{ color: "var(--mh-teal)" }}>{student.email}</a></div>
            <div>📱 <a href={`tel:${student.phone}`} style={{ color: "var(--mh-teal)" }}>{student.phone}</a></div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="mh__kicker" style={{ marginBottom: 8 }}>KHOÁ ĐÃ ĐĂNG KÝ ({student.courses})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {enrolledCourses.map((c) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center", padding: 10, background: "var(--mh-ivory-2)", borderRadius: 10 }}>
                <div className="mh__avatar" style={{ background: c.iconBg }}>{c.icon}</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{c.title}</div>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{c.sessionsDone}/{c.sessions} buổi hoàn thành</div>
                </div>
                <span className={"mh__pill mh__pill--" + c.status}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1px solid var(--mh-line)", flexWrap: "wrap" }}>
          <button className="mh__btn">💬 Chat</button>
          <button className="mh__btn">📧 Email</button>
          <button className="mh__btn">💬 Zalo</button>
          <div style={{ flex: 1 }} />
          <button className="mh__btn mh__btn--primary">✦ Gợi ý khoá mới</button>
        </div>
      </div>
    </div>
  );
}
