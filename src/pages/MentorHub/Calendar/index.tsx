// [MH] Calendar — month grid + create session modal (click empty day hoặc button)
import React, { useState } from "react";
import { MOCK_COURSES, MOCK_NEXT_SESSION } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

type Session = { id: string; date: string; time: string; durationMin: number; courseId: string; course: string; color: string; capacity: number; registered: number; zoomId: string };

const COLORS_BY_COURSE: Record<string, string> = {
  "CRS-01": "#0F766E", "CRS-02": "#1E40AF", "CRS-03": "#374151", "CRS-04": "#B45309", "CRS-05": "#991B1B",
};

// Initial mock sessions
const genInitialSessions = (month: Date): Session[] => {
  const y = month.getFullYear(); const m = month.getMonth();
  const items: Session[] = [];
  MOCK_COURSES.filter((c) => c.status !== "draft").forEach((c, idx) => {
    for (let i = 0; i < 4; i++) {
      const day = 3 + idx * 3 + i * 6; if (day > 28) continue;
      items.push({
        id: `SE-${c.id}-${i}`,
        date: new Date(y, m, day).toISOString().split("T")[0],
        time: ["20:00", "19:00", "14:00"][i % 3],
        durationMin: 120,
        courseId: c.id,
        course: c.title,
        color: COLORS_BY_COURSE[c.id] || "#0F766E",
        capacity: c.capacity,
        registered: c.registered,
        zoomId: MOCK_NEXT_SESSION.zoomId,
      });
    }
  });
  return items;
};

export default function MHCalendar() {
  document.title = "Lịch dạy · MentorHub";
  const [month, setMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>(() => genInitialSessions(new Date()));
  const [createFor, setCreateFor] = useState<string | null>(null); // date YYYY-MM-DD or null
  const [detailSession, setDetailSession] = useState<Session | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const y = month.getFullYear(); const m = month.getMonth();
  const firstDay = new Date(y, m, 1); const lastDay = new Date(y, m + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; const daysInMonth = lastDay.getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const today = new Date();
  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const sessionsOn = (d: Date) => sessions.filter((s) => s.date === d.toISOString().split("T")[0]);
  const monthName = month.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  const upcoming = sessions.filter((s) => new Date(s.date + "T" + s.time) >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 6);

  const handleCellClick = (d: Date) => {
    const dateStr = d.toISOString().split("T")[0];
    setCreateFor(dateStr);
  };
  const addSession = (s: Session) => {
    setSessions((prev) => [...prev, s]);
    setCreateFor(null);
    setToast(`✓ Đã thêm buổi học ngày ${s.date} lúc ${s.time}`);
    setTimeout(() => setToast(null), 3500);
  };
  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setDetailSession(null);
    setToast("✓ Đã xoá buổi học");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="mh">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mh__kicker">LỊCH DẠY</div>
          <h1>Lịch <em>dạy</em></h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>{sessions.length} buổi · nhấn vào ô trống để thêm buổi mới</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="mh__btn" onClick={() => setMonth(new Date(y, m - 1))}>←</button>
          <button className="mh__btn" onClick={() => setMonth(new Date())}>Hôm nay</button>
          <button className="mh__btn" onClick={() => setMonth(new Date(y, m + 1))}>→</button>
          <button className="mh__btn mh__btn--primary" onClick={() => setCreateFor(new Date().toISOString().split("T")[0])}>+ Tạo buổi học</button>
        </div>
      </div>

      <h2 style={{ textTransform: "capitalize", marginBottom: 20 }}>{monthName}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 24, alignItems: "flex-start" }} className="mh-cal-layout">
        <div className="mh__card" style={{ padding: 20, minWidth: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4, marginBottom: 8 }}>
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div key={d} className="mh__mono" style={{ textAlign: "center", fontSize: 11, color: "var(--mh-ink-soft)", padding: 6 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
            {cells.map((d, i) => (
              <div
                key={i}
                onClick={() => d && handleCellClick(d)}
                style={{
                  minHeight: 96,
                  minWidth: 0,
                  padding: 6,
                  background: d && isToday(d) ? "var(--mh-ivory-2)" : d ? "#fff" : "transparent",
                  border: d ? "1px solid var(--mh-line)" : "none",
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: d ? "pointer" : "default",
                  position: "relative",
                  transition: "border-color .1s",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => d && (e.currentTarget.style.borderColor = "var(--mh-teal)")}
                onMouseLeave={(e) => d && (e.currentTarget.style.borderColor = "var(--mh-line)")}
              >
                {d && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: isToday(d) ? 600 : 400, color: isToday(d) ? "var(--mh-teal)" : "inherit" }}>{d.getDate()}</div>
                      <span style={{ fontSize: 10, color: "var(--mh-ink-soft)", opacity: 0.7 }}>＋</span>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {sessionsOn(d).slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          onClick={(e) => { e.stopPropagation(); setDetailSession(s); }}
                          style={{ fontSize: 10, padding: "2px 6px", background: s.color, color: "#fff", borderRadius: 4, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}
                          title={`${s.time} · ${s.course}`}
                        >
                          <span className="mh__mono" style={{ opacity: 0.85 }}>{s.time}</span> {s.course.split(" ").slice(0, 2).join(" ")}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mh__card">
          <h3 style={{ marginBottom: 16 }}>Sắp diễn ra</h3>
          {upcoming.length === 0 && <p style={{ color: "var(--mh-ink-soft)", fontSize: 13 }}>Chưa có buổi nào sắp tới.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {upcoming.map((s) => (
              <div key={s.id} onClick={() => setDetailSession(s)} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{s.date} · {s.time}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, margin: "3px 0" }}>{s.course}</div>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{s.registered}/{s.capacity} HV · {s.durationMin}ph</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {createFor && <CreateSessionModal date={createFor} onClose={() => setCreateFor(null)} onCreate={addSession} />}
      {detailSession && <SessionDetailModal session={detailSession} onClose={() => setDetailSession(null)} onDelete={deleteSession} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "14px 20px", background: "#166534", color: "#fff", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,.2)", zIndex: 300, fontSize: 14 }}>{toast}</div>
      )}

      <style>{`@media (max-width: 900px) { .mh-cal-layout { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ── Create session modal ─────────────────────────────────────────────────────
function CreateSessionModal({ date, onClose, onCreate }: { date: string; onClose: () => void; onCreate: (s: Session) => void }) {
  const activeCourses = MOCK_COURSES.filter((c) => c.status !== "ended");
  const [courseId, setCourseId] = useState(activeCourses[0]?.id || "");
  const [dateVal, setDateVal] = useState(date);
  const [time, setTime] = useState("20:00");
  const [durationMin, setDurationMin] = useState(120);
  const [zoomId, setZoomId] = useState(MOCK_NEXT_SESSION.zoomId);
  const [notify, setNotify] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const course = MOCK_COURSES.find((c) => c.id === courseId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!courseId) errs.courseId = "Chọn khoá học";
    if (!dateVal) errs.dateVal = "Chọn ngày";
    else if (new Date(dateVal + "T" + time) < new Date()) errs.dateVal = "Thời gian phải trong tương lai";
    if (!time) errs.time = "Chọn giờ bắt đầu";
    if (durationMin < 15 || durationMin > 480) errs.durationMin = "Thời lượng 15-480 phút";
    if (!zoomId.trim()) errs.zoomId = "Nhập Zoom ID";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!course) return;
    onCreate({
      id: "SE-NEW-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      date: dateVal,
      time,
      durationMin,
      courseId,
      course: course.title,
      color: COLORS_BY_COURSE[courseId] || "#0F766E",
      capacity: course.capacity,
      registered: course.registered,
      zoomId,
    });
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">BUỔI HỌC MỚI</div>
            <h3 style={{ marginTop: 4 }}>Tạo buổi học</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="mh__field">
            <label className="mh__label mh__label--req">Khoá học</label>
            <select className={"mh__select" + (errors.courseId ? " mh__input--error" : "")} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {activeCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            {errors.courseId && <div className="mh__error">⚠ {errors.courseId}</div>}
          </div>

          <div className="mh__row mh__row--2">
            <div className="mh__field">
              <label className="mh__label mh__label--req">Ngày</label>
              <input type="date" className={"mh__input" + (errors.dateVal ? " mh__input--error" : "")} value={dateVal} onChange={(e) => setDateVal(e.target.value)} min={new Date().toISOString().split("T")[0]} />
              {errors.dateVal && <div className="mh__error">⚠ {errors.dateVal}</div>}
            </div>
            <div className="mh__field">
              <label className="mh__label mh__label--req">Giờ bắt đầu</label>
              <input type="time" className={"mh__input" + (errors.time ? " mh__input--error" : "")} value={time} onChange={(e) => setTime(e.target.value)} />
              {errors.time && <div className="mh__error">⚠ {errors.time}</div>}
            </div>
          </div>

          <div className="mh__field">
            <label className="mh__label mh__label--req">Thời lượng (phút)</label>
            <input type="number" min={15} max={480} className={"mh__input" + (errors.durationMin ? " mh__input--error" : "")} value={durationMin} onChange={(e) => setDurationMin(+e.target.value)} />
            {errors.durationMin && <div className="mh__error">⚠ {errors.durationMin}</div>}
          </div>

          <div className="mh__field">
            <label className="mh__label mh__label--req">Zoom Meeting ID</label>
            <input className={"mh__input" + (errors.zoomId ? " mh__input--error" : "")} value={zoomId} onChange={(e) => setZoomId(e.target.value)} placeholder="892-4731-0028" />
            {errors.zoomId && <div className="mh__error">⚠ {errors.zoomId}</div>}
          </div>

          <label className="mh__field" style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", padding: 12, background: "var(--mh-ivory-2)", borderRadius: 10 }}>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: 13 }}>
              Gửi thông báo Zalo + Email cho {course?.registered || 0} học viên đã đăng ký khoá
              <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", marginTop: 2 }}>Nhắc tự động 24h và 30 phút trước buổi</div>
            </span>
          </label>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" className="mh__btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="mh__btn mh__btn--primary">Tạo buổi học</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Session detail modal ─────────────────────────────────────────────────────
function SessionDetailModal({ session, onClose, onDelete }: { session: Session; onClose: () => void; onDelete: (id: string) => void }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const isPast = new Date(session.date + "T" + session.time) < new Date();

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 5, minHeight: 44, background: session.color, borderRadius: 3, marginTop: 3 }} />
            <div>
              <div className="mh__kicker">{isPast ? "ĐÃ DIỄN RA" : "BUỔI HỌC"}</div>
              <h3 style={{ marginTop: 4 }}>{session.course}</h3>
              <div className="mh__mono" style={{ fontSize: 12, color: "var(--mh-ink-soft)", marginTop: 4 }}>{session.date} · {session.time} · {session.durationMin} phút</div>
            </div>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <div className="mh__grid mh__grid--2" style={{ marginBottom: 20 }}>
          <div className="mh__kpi"><div className="mh__kpi-label">HỌC VIÊN</div><div className="mh__kpi-value" style={{ fontSize: 24 }}>{session.registered}/{session.capacity}</div></div>
          <div className="mh__kpi"><div className="mh__kpi-label">ZOOM ID</div><div className="mh__mono" style={{ fontSize: 14, marginTop: 10 }}>{session.zoomId}</div></div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!isPast && (
            <a href={`https://zoom.us/j/${session.zoomId.replace(/-/g, "")}`} target="_blank" rel="noopener noreferrer" className="mh__btn mh__btn--amber">🔴 Mở Zoom</a>
          )}
          {isPast && (
            <a href="/crm/mh/session-review" className="mh__btn mh__btn--primary">✦ Xem AI ghi chú</a>
          )}
          <button className="mh__btn">📧 Gửi reminder</button>
          <button className="mh__btn">📝 Sửa</button>
          <div style={{ flex: 1 }} />
          {!confirmDel ? (
            <button className="mh__btn mh__btn--danger" onClick={() => setConfirmDel(true)}>🗑 Xoá</button>
          ) : (
            <>
              <button className="mh__btn" onClick={() => setConfirmDel(false)}>Giữ lại</button>
              <button className="mh__btn mh__btn--danger" onClick={() => onDelete(session.id)}>Xác nhận xoá</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
