// Portal mentor detail — public mentor profile with their courses + share
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import ShareBlock from "../_shared/ShareBlock";
import SalesServiceClient, { SalesService } from "services/SalesServiceClient";
import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { MENTORS } from "../Mentors";
import { MOCK_REVIEWS } from "@/mocks/mentorhub";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(0|\+?84)(\s*\d){9,10}$/;

type MentorMock = (typeof MENTORS)[number];

type EmployeeFromBE = {
  id: number;
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  title?: string;
  branchName?: string;
  departmentName?: string;
};

type MentorView = {
  id: string;
  name: string;
  short: string;
  title: string;
  bio: string;
  avatar?: string;
  avatarBg: string;
  tags: string[];
  verified: boolean;
  courses: number;
  students: number;
  nps: number;
};

type CourseCard = {
  id: number;
  title: string;
  status: "live" | "upcoming" | "draft" | "ended";
  sessions: number;
  sessionsDone: number;
  price: number;
  originalPrice: number;
  registered: number;
  capacity: number;
  icon: string;
  iconBg: string;
};

function adaptCourseCard(svc: SalesService): CourseCard {
  const meta = (svc.metadata as Record<string, unknown>) || {};
  const status = (svc.status || "").toUpperCase();
  const done = Number(meta.sessionsDone ?? 0);
  const total = Number(meta.sessions ?? svc.total_time ?? 0);
  let ui: CourseCard["status"] = "draft";
  if (status === "ARCHIVED") ui = "ended";
  else if (status === "DRAFT" || svc.active === 0) ui = "draft";
  else if (total > 0 && done >= total) ui = "ended";
  else if (done === 0) ui = "upcoming";
  else ui = "live";
  return {
    id: Number(svc.id),
    title: svc.name || "(chưa đặt tên)",
    status: ui,
    sessions: total,
    sessionsDone: done,
    price: Number(svc.price ?? 0),
    originalPrice: Number(svc.retailPrice ?? svc.price ?? 0),
    registered: Number(meta.registered ?? 0),
    capacity: Number(meta.capacity ?? 0),
    icon: typeof meta.icon === "string" ? (meta.icon as string) : "⎈",
    iconBg:
      typeof meta.iconBg === "string"
        ? (meta.iconBg as string)
        : "linear-gradient(135deg, #134E4A, #0F766E)",
  };
}

function shortName(full: string): string {
  return full
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function PortalMentorDetail() {
  const { id } = useParams();
  // route :id can be either mock format ("MT-001") OR numeric (real employeeId)
  const numId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [id]);

  const [mentor, setMentor] = useState<MentorView | null>(null);
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      // 1) Mock-format id → use mock data only (no real BE for fictional mentors)
      if (!numId) {
        const mock = MENTORS.find((m) => m.id === id);
        if (cancelled) return;
        if (!mock) {
          setMentor(null);
        } else {
          setMentor({
            id: mock.id,
            name: mock.name,
            short: mock.short,
            title: mock.title,
            bio: mock.bio,
            avatarBg: mock.avatarBg,
            tags: mock.tags,
            verified: mock.verified,
            courses: mock.courses,
            students: mock.students,
            nps: mock.nps,
          });
        }
        setCourses([]);
        setLoading(false);
        return;
      }
      // 2) Numeric id → fetch real employee + their courses
      const [empRes, svcRes] = await Promise.all([
        apiGet(urlsApi.employee.detail, { id: numId }, ctrl.signal).catch(() => null),
        SalesServiceClient.list(
          { type: "COURSE_LIVE", supplierId: numId, status: "ACTIVE", page: 1, limit: 50 },
          ctrl.signal,
        ).catch(() => null),
      ]);
      if (cancelled) return;

      const emp = (empRes as { result?: EmployeeFromBE })?.result;
      const svcResult = (svcRes as { result?: { items?: SalesService[] } | SalesService[] })?.result ?? [];
      const items: SalesService[] = Array.isArray(svcResult)
        ? (svcResult as SalesService[])
        : ((svcResult as { items?: SalesService[] }).items ?? []);
      const cards = items.map(adaptCourseCard);

      if (emp && emp.id) {
        setMentor({
          id: String(emp.id),
          name: emp.name || `Mentor #${emp.id}`,
          short: shortName(emp.name || "M"),
          title: emp.title || emp.departmentName || "Mentor",
          bio: emp.title
            ? `${emp.title}${emp.branchName ? " · " + emp.branchName : ""}`
            : "Mentor đang xây dựng hồ sơ giới thiệu.",
          avatar: emp.avatar,
          avatarBg: "#134E4A",
          tags: [],
          verified: false,
          courses: cards.length,
          students: cards.reduce((s, c) => s + c.registered, 0),
          nps: 0,
        });
        setCourses(cards);
      } else {
        // Employee không tồn tại — fallback mock if matches, else null
        setMentor(null);
        setCourses([]);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [id, numId]);

  if (loading) {
    return (
      <PortalLayout>
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--pt-ink-soft)" }}>
          Đang tải hồ sơ mentor…
        </div>
      </PortalLayout>
    );
  }

  if (!mentor) {
    return (
      <PortalLayout>
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2>Không tìm thấy mentor</h2>
          <Link to="/portal/mentors" className="pt-btn pt-btn--primary" style={{ marginTop: 20 }}>← Về danh sách mentor</Link>
        </div>
      </PortalLayout>
    );
  }

  document.title = `${mentor.name} · MentorHub`;
  const reviews = MOCK_REVIEWS.slice(0, 4);
  const shareUrl = `${location.origin}/crm/portal/mentors/${mentor.id}`;

  return (
    <PortalLayout>
      <div style={{ padding: "32px 0 0" }}>
        <Link to="/portal/mentors" className="pt-detail__back">← Tất cả mentor</Link>
      </div>

      {/* ── Hero profile ─────────────────────────────────────────────────── */}
      <section style={{ padding: "32px 0 48px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }} className="pt-mentor-hero">
        <div>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 28 }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: mentor.avatarBg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 36, flexShrink: 0 }}>{mentor.short}</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontSize: 44, margin: 0 }}>{mentor.name}</h1>
                {mentor.verified && <span title="Đã xác thực" style={{ color: "var(--pt-teal)", fontSize: 22 }}>✓</span>}
              </div>
              <div className="pt-mono" style={{ fontSize: 13, color: "var(--pt-ink-soft)", marginBottom: 12 }}>{mentor.title}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {mentor.tags.map((t) => (
                  <span key={t} style={{ padding: "4px 12px", background: "var(--pt-ivory-2)", borderRadius: 999, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--pt-ink-soft)" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--pt-ink)", marginBottom: 32 }}>{mentor.bio}</p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, padding: "20px 0", borderTop: "1px solid var(--pt-line)", borderBottom: "1px solid var(--pt-line)" }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "var(--pt-teal)", lineHeight: 1 }}>{mentor.courses}</div>
              <div className="pt-mono" style={{ fontSize: 11, color: "var(--pt-ink-soft)", marginTop: 6 }}>KHOÁ HỌC</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "var(--pt-teal)", lineHeight: 1 }}>{mentor.students.toLocaleString()}</div>
              <div className="pt-mono" style={{ fontSize: 11, color: "var(--pt-ink-soft)", marginTop: 6 }}>HỌC VIÊN</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "var(--pt-teal)", lineHeight: 1 }}>{mentor.nps} <span style={{ fontSize: 16 }}>/5</span></div>
              <div className="pt-mono" style={{ fontSize: 11, color: "var(--pt-ink-soft)", marginTop: 6 }}>ĐÁNH GIÁ TB</div>
            </div>
          </div>
        </div>

        {/* Sticky contact CTA */}
        <div style={{ position: "sticky", top: 100 }}>
          <div className="pt-ccard" style={{ padding: 24, borderRadius: 18 }}>
            <div className="pt-mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--pt-ink-soft)", textTransform: "uppercase", marginBottom: 12 }}>KẾT NỐI</div>
            <button className="pt-btn pt-btn--primary pt-btn--lg" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={() => setShowMessage(true)}>💬 Nhắn tin</button>
            <button className="pt-btn pt-btn--lg" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={() => setShowBooking(true)}>📅 Đặt lịch 1:1</button>
            <button
              className="pt-btn pt-btn--lg"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => {
                if (navigator.share) navigator.share({ title: mentor.name, url: shareUrl });
                else navigator.clipboard.writeText(shareUrl);
              }}
            >
              ↗ Chia sẻ profile
            </button>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--pt-line)" }}>
              <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", marginBottom: 6 }}>PHẢN HỒI NHANH</div>
              <div style={{ fontSize: 13 }}>⚡ Thường trả lời trong 2h</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Courses ──────────────────────────────────────────────────────── */}
      <section className="pt-section">
        <div className="pt-section__head">
          <div>
            <div className="pt-section__eyebrow">KHOÁ HỌC CỦA {mentor.name.toUpperCase().split(" ").pop()}</div>
            <h2>Khoá đang <em>mở đăng ký</em></h2>
          </div>
        </div>

        <div className="pt-grid">
          {courses.map((c) => (
            <Link key={c.id} to={`/portal/courses/${c.id}`} className="pt-ccard">
              <div className="pt-ccard__cover" style={{ background: c.iconBg }}>
                <span className="pt-ccard__pill">
                  {c.status === "live" ? "● Đang diễn ra" : c.status === "upcoming" ? "Sắp bắt đầu" : "Đã kết thúc"}
                </span>
                {c.icon}
              </div>
              <div className="pt-ccard__body">
                <div className="pt-ccard__title">{c.title}</div>
                <div className="pt-ccard__meta">
                  <span>{c.sessions} buổi</span>
                  <span>{c.registered}/{c.capacity} HV</span>
                </div>
                <div className="pt-ccard__foot">
                  <div>
                    <span className="pt-ccard__price">{c.price === 0 ? "Miễn phí" : formatVND(c.price)}</span>
                  </div>
                  <span className="pt-ccard__cta">Chi tiết →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="pt-section">
        <div className="pt-section__head">
          <div>
            <div className="pt-section__eyebrow">ĐÁNH GIÁ TỪ HỌC VIÊN</div>
            <h2>{mentor.students.toLocaleString()} học viên đã <em>chia sẻ</em></h2>
          </div>
        </div>

        <div className="pt-grid">
          {reviews.map((r, i) => (
            <div key={i} className="pt-ccard" style={{ padding: 28 }}>
              <div style={{ fontSize: 28, color: "var(--pt-teal)", fontFamily: "'Fraunces', serif", lineHeight: 1, marginBottom: 12 }}>"</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>{r.comment}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 14, borderTop: "1px solid var(--pt-line)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: r.anonymous ? "#9CA3AF" : "#0F766E", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 13 }}>{r.short}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.student}</div>
                  <div className="pt-mono" style={{ fontSize: 11, color: "var(--pt-ink-soft)" }}>{r.course} · {r.time}</div>
                </div>
                <div className="pt-mono" style={{ fontSize: 13, color: "var(--pt-ink-soft)" }}>{"★".repeat(r.nps)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Share ─────────────────────────────────────────────────────────── */}
      <section className="pt-section">
        <ShareBlock
          url={shareUrl}
          title={`${mentor.name} trên MentorHub`}
          text={`${mentor.title} · ${mentor.bio.slice(0, 120)}…`}
          eyebrow="⚡ GIỚI THIỆU MENTOR"
          referralReward="Mỗi người bạn giới thiệu đăng ký khoá của mentor: bạn nhận 500 điểm thưởng, họ giảm 10%."
          utmSource={`mentor-${mentor.id}`}
        />
      </section>

      {showMessage && (
        <MessageMentorModal
          mentor={mentor}
          onClose={() => setShowMessage(false)}
          onSent={() => { setShowMessage(false); notify(`✓ Đã gửi tin nhắn. ${mentor.name} sẽ phản hồi trong 2h làm việc.`); }}
        />
      )}
      {showBooking && (
        <BookingModal
          mentor={mentor}
          onClose={() => setShowBooking(false)}
          onBooked={(when) => { setShowBooking(false); notify(`✓ Đã gửi yêu cầu đặt lịch 1:1 lúc ${when}. Mentor sẽ xác nhận qua email.`); }}
        />
      )}
      {toast && (
        <div
          style={{
            position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
            background: "var(--pt-ink)", color: "#fff", padding: "14px 24px", borderRadius: 12,
            zIndex: 400, fontSize: 14, maxWidth: 520, boxShadow: "0 12px 30px rgba(0,0,0,.3)", textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .pt-mentor-hero { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </PortalLayout>
  );
}

// ── Quick message modal ──────────────────────────────────────────────────────
function MessageMentorModal({ mentor, onClose, onSent }: { mentor: Mentor; onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nhập họ tên";
    if (!form.email.trim()) errs.email = "Nhập email";
    else if (!emailRegex.test(form.email)) errs.email = "Email không hợp lệ";
    if (!form.message.trim()) errs.message = "Nhập nội dung";
    else if (form.message.trim().length < 20) errs.message = "Tin nhắn tối thiểu 20 ký tự";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSent();
  };

  return (
    <div className="pt-modal-backdrop" onClick={onClose}>
      <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: mentor.avatarBg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 18 }}>{mentor.short}</div>
            <div>
              <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", letterSpacing: ".1em" }}>NHẮN TIN</div>
              <h3 style={{ margin: "4px 0 0" }}>Gửi {mentor.name}</h3>
            </div>
          </div>
          <button className="pt-btn pt-btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="pt-field">
            <label className="pt-label pt-label--req">Họ tên</label>
            <input className={"pt-input" + (errors.name ? " is-invalid" : "")} value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }} placeholder="VD: Nguyễn Văn A" />
            {errors.name && <div className="pt-error">⚠ {errors.name}</div>}
          </div>
          <div className="pt-field">
            <label className="pt-label pt-label--req">Email</label>
            <input type="email" className={"pt-input" + (errors.email ? " is-invalid" : "")} value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: "" }); }} placeholder="ban@email.com" />
            {errors.email && <div className="pt-error">⚠ {errors.email}</div>}
          </div>
          <div className="pt-field">
            <label className="pt-label pt-label--req">Nội dung</label>
            <textarea
              className={"pt-textarea" + (errors.message ? " is-invalid" : "")}
              value={form.message}
              onChange={(e) => { setForm({ ...form, message: e.target.value }); if (errors.message) setErrors({ ...errors, message: "" }); }}
              placeholder="Chào anh/chị, em đang tìm hiểu về… Em có câu hỏi liên quan đến…"
              rows={5}
              maxLength={1000}
            />
            <div style={{ fontSize: 12, color: "var(--pt-ink-soft)", marginTop: 4 }}>{form.message.length}/1000 · Tối thiểu 20 ký tự</div>
            {errors.message && <div className="pt-error">⚠ {errors.message}</div>}
          </div>

          <div style={{ padding: 12, background: "var(--pt-ivory-2)", borderRadius: 10, fontSize: 12, color: "var(--pt-ink-soft)", marginBottom: 16 }}>
            💬 Tin nhắn sẽ gửi thẳng tới Zalo/Email của mentor. {mentor.name} thường phản hồi trong 2h làm việc.
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="pt-btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="pt-btn pt-btn--primary">Gửi tin nhắn</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Booking 1:1 modal ────────────────────────────────────────────────────────
function BookingModal({ mentor, onClose, onBooked }: { mentor: Mentor; onClose: () => void; onBooked: (when: string) => void }) {
  // Generate next 7 days with slots
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });

  const SLOTS = ["09:00", "10:00", "14:00", "15:00", "16:00", "20:00", "21:00"];
  const BUSY_MAP: Record<number, string[]> = { 0: ["09:00", "14:00"], 1: ["20:00"], 3: ["10:00", "15:00"], 5: ["09:00", "16:00", "21:00"] };

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!selectedSlot) errs.slot = "Chọn giờ muốn đặt";
    if (!form.name.trim()) errs.name = "Nhập họ tên";
    if (!form.email.trim()) errs.email = "Nhập email";
    else if (!emailRegex.test(form.email)) errs.email = "Email không hợp lệ";
    if (!form.phone.trim()) errs.phone = "Nhập SĐT";
    else if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) errs.phone = "SĐT không hợp lệ";
    if (!form.topic.trim()) errs.topic = "Mô tả chủ đề buổi tư vấn";
    else if (form.topic.trim().length < 20) errs.topic = "Tối thiểu 20 ký tự";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const when = days[selectedDay].toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }) + " · " + selectedSlot;
    onBooked(when);
  };

  const busy = BUSY_MAP[selectedDay] || [];

  return (
    <div className="pt-modal-backdrop" onClick={onClose}>
      <div className="pt-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: mentor.avatarBg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 18 }}>{mentor.short}</div>
            <div>
              <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", letterSpacing: ".1em" }}>TƯ VẤN 1:1</div>
              <h3 style={{ margin: "4px 0 0" }}>Đặt lịch với {mentor.name}</h3>
            </div>
          </div>
          <button className="pt-btn pt-btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="pt-field">
            <label className="pt-label pt-label--req">Chọn ngày (7 ngày tới)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {days.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedDay(i); setSelectedSlot(null); }}
                  style={{
                    padding: "10px 4px", borderRadius: 10,
                    border: "1px solid " + (selectedDay === i ? "var(--pt-teal)" : "var(--pt-line)"),
                    background: selectedDay === i ? "var(--pt-teal)" : "#fff",
                    color: selectedDay === i ? "#fff" : "var(--pt-ink)",
                    cursor: "pointer", fontFamily: "inherit",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}
                >
                  <span style={{ fontSize: 10, fontFamily: "'Geist Mono', monospace", opacity: 0.8 }}>{d.toLocaleDateString("vi-VN", { weekday: "short" })}</span>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>{d.getDate()}</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>Th {d.getMonth() + 1}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-field">
            <label className="pt-label pt-label--req">Chọn khung giờ</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {SLOTS.map((s) => {
                const isBusy = busy.includes(s);
                const isSelected = selectedSlot === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isBusy}
                    onClick={() => { setSelectedSlot(s); if (errors.slot) setErrors({ ...errors, slot: "" }); }}
                    style={{
                      padding: "10px", borderRadius: 10,
                      border: "1px solid " + (isSelected ? "var(--pt-teal)" : "var(--pt-line)"),
                      background: isSelected ? "var(--pt-teal)" : isBusy ? "var(--pt-ivory-2)" : "#fff",
                      color: isSelected ? "#fff" : isBusy ? "var(--pt-ink-soft)" : "var(--pt-ink)",
                      cursor: isBusy ? "not-allowed" : "pointer",
                      textDecoration: isBusy ? "line-through" : "none",
                      fontFamily: "'Geist Mono', monospace", fontSize: 13,
                      opacity: isBusy ? 0.5 : 1,
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {errors.slot && <div className="pt-error">⚠ {errors.slot}</div>}
          </div>

          <div className="pt-field">
            <label className="pt-label">Thời lượng</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[30, 45, 60].map((d) => (
                <button key={d} type="button" className={"pt-btn" + (duration === d ? " pt-btn--teal" : "")} onClick={() => setDuration(d)}>
                  {d} phút
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="pt-field">
              <label className="pt-label pt-label--req">Họ tên</label>
              <input className={"pt-input" + (errors.name ? " is-invalid" : "")} value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }} />
              {errors.name && <div className="pt-error">⚠ {errors.name}</div>}
            </div>
            <div className="pt-field">
              <label className="pt-label pt-label--req">Email</label>
              <input type="email" className={"pt-input" + (errors.email ? " is-invalid" : "")} value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: "" }); }} />
              {errors.email && <div className="pt-error">⚠ {errors.email}</div>}
            </div>
          </div>

          <div className="pt-field">
            <label className="pt-label pt-label--req">Số điện thoại</label>
            <input type="tel" className={"pt-input" + (errors.phone ? " is-invalid" : "")} value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); if (errors.phone) setErrors({ ...errors, phone: "" }); }} placeholder="0912345678" />
            {errors.phone && <div className="pt-error">⚠ {errors.phone}</div>}
          </div>

          <div className="pt-field">
            <label className="pt-label pt-label--req">Chủ đề buổi tư vấn</label>
            <textarea
              className={"pt-textarea" + (errors.topic ? " is-invalid" : "")}
              value={form.topic}
              onChange={(e) => { setForm({ ...form, topic: e.target.value }); if (errors.topic) setErrors({ ...errors, topic: "" }); }}
              placeholder="Mô tả điều bạn muốn trao đổi để mentor chuẩn bị sát nội dung"
              rows={3}
              maxLength={500}
            />
            <div style={{ fontSize: 12, color: "var(--pt-ink-soft)", marginTop: 4 }}>{form.topic.length}/500 · Tối thiểu 20 ký tự</div>
            {errors.topic && <div className="pt-error">⚠ {errors.topic}</div>}
          </div>

          <div style={{ padding: 14, background: "var(--pt-amber-soft)", borderRadius: 10, fontSize: 13, marginBottom: 16, border: "1px solid rgba(180, 88, 9, 0.18)" }}>
            💡 <strong>Buổi tư vấn 1:1</strong> qua Zoom. Mentor sẽ xác nhận và gửi link calendar + Zoom qua email trong 2h làm việc.
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="pt-btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="pt-btn pt-btn--primary">Đặt lịch</button>
          </div>
        </form>
      </div>
    </div>
  );
}
