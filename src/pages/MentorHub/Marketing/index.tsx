// [MH] Marketing — share khoá, referral, cross-sell với modals có interaction
import React, { useState } from "react";
import { MOCK_COURSES, MOCK_STUDENTS, MOCK_MENTOR } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
type Student = typeof MOCK_STUDENTS[number];
type Course = typeof MOCK_COURSES[number];
type Toast = { text: string; kind: "ok" | "info" } | null;

export default function MHMarketing() {
  document.title = "Marketing · MentorHub";
  const [selectedCourse, setSelectedCourse] = useState(MOCK_COURSES[0].id);
  const [copied, setCopied] = useState("");
  const [sendTo, setSendTo] = useState<{ student: Student; course: Course } | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [showCampaign, setShowCampaign] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const course = MOCK_COURSES.find((c) => c.id === selectedCourse)!;
  const shareUrl = `${location.origin}/crm/portal/courses/${course.id}?utm_source=mentor`;

  const copy = (t: string, tag: string) => { navigator.clipboard.writeText(t); setCopied(tag); setTimeout(() => setCopied(""), 2500); };
  const showToast = (text: string, kind: Toast["kind"] = "ok") => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const referralStats = [
    { name: "Phạm Thu Hà", shortN: "PH", shares: 8, converted: 3, earned: 1500, avatarBg: "#B45309" },
    { name: "Trần Văn Đức", shortN: "TĐ", shares: 5, converted: 2, earned: 1000, avatarBg: "#0F766E" },
    { name: "Vũ Hoàng Nam", shortN: "VN", shares: 12, converted: 5, earned: 2500, avatarBg: "#166534" },
    { name: "Nguyễn Hoàng Anh", shortN: "NH", shares: 3, converted: 1, earned: 500, avatarBg: "#134E4A" },
  ];

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">MARKETING · CHIA SẺ</div>
        <h1>Lan toả <em>khoá học</em></h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>Share, referral, cross-sell cho khách hàng hiện có</p>
      </div>

      <div className="mh__grid mh__grid--4" style={{ marginBottom: 32 }}>
        <div className="mh__kpi"><div className="mh__kpi-label">LƯỢT SHARE</div><div className="mh__kpi-value">284</div><div className="mh__kpi-delta">↑ 12% tuần này</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">ĐĂNG KÝ QUA SHARE</div><div className="mh__kpi-value">41</div><div className="mh__kpi-delta">14.4% CR</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">ĐIỂM THƯỞNG</div><div className="mh__kpi-value">20,500</div><div className="mh__kpi-delta">= {formatVND(8200000)}</div></div>
        <div className="mh__kpi"><div className="mh__kpi-label">TOP REFERRER</div><div className="mh__kpi-value">VN</div><div className="mh__kpi-delta">5 conv · 12 share</div></div>
      </div>

      <div className="mh__grid mh__grid--2" style={{ gap: 24, marginBottom: 32, alignItems: "flex-start" }}>
        <div className="mh__card">
          <h3 style={{ marginBottom: 16 }}>Chia sẻ khoá học</h3>
          <div className="mh__field">
            <label className="mh__label">Chọn khoá học</label>
            <select className="mh__select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              {MOCK_COURSES.filter((c) => c.status !== "draft").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div style={{ margin: "20px 0", padding: 16, background: "var(--mh-ivory-2)", borderRadius: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div className="mh__avatar mh__avatar--lg" style={{ background: course.iconBg, fontSize: 22 }}>{course.icon}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{course.title}</div>
                <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{course.sessions} buổi · {formatVND(course.price)}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", background: "#fff", padding: "6px 10px", borderRadius: 8, border: "1px solid var(--mh-line)" }}>
              <input type="text" readOnly value={shareUrl} className="mh__mono" style={{ flex: 1, border: 0, background: "transparent", fontSize: 12, color: "var(--mh-ink-soft)", outline: "none" }} onFocus={(e) => e.currentTarget.select()} />
              <button className="mh__btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => copy(shareUrl, "url")}>{copied === "url" ? "✓ Copy" : "Copy"}</button>
            </div>
          </div>
          <h4 className="mh__kicker" style={{ marginBottom: 10 }}>GỬI QUA KÊNH</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            <a href={`https://zalo.me/share?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="mh__btn" style={{ background: "#0068FF", color: "#fff", borderColor: "#0068FF", justifyContent: "center" }}>💬 Zalo</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="mh__btn" style={{ background: "#1877F2", color: "#fff", borderColor: "#1877F2", justifyContent: "center" }}>ⓕ Facebook</a>
            <a href={`mailto:?subject=${encodeURIComponent(course.title)}&body=${encodeURIComponent(shareUrl)}`} className="mh__btn" style={{ justifyContent: "center" }}>✉ Email</a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="mh__btn" style={{ background: "#26A5E4", color: "#fff", borderColor: "#26A5E4", justifyContent: "center" }}>✈ Telegram</a>
          </div>
          <div style={{ marginTop: 16 }}>
            <h4 className="mh__kicker" style={{ marginBottom: 8 }}>CAPTION (AI)</h4>
            <textarea className="mh__textarea" readOnly value={`🚀 Khoá "${course.title}" đang mở đăng ký!\n\n${course.sessions} buổi live 1:1 với mentor đang làm tại Grab/Shopee. Không lý thuyết suông.\n\nCòn ${course.capacity - course.registered} chỗ. Đăng ký: ${shareUrl}`} />
            <button className="mh__btn" style={{ marginTop: 8 }} onClick={() => copy(`🚀 Khoá "${course.title}"...`, "caption")}>{copied === "caption" ? "✓ Đã copy" : "Copy caption"}</button>
          </div>
        </div>

        <div>
          <div className="mh__card mh__ai-card" style={{ marginBottom: 16 }}>
            <h4 style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: ".08em" }}>✦ AI CROSS-SELL</h4>
            <h3 style={{ margin: "8px 0 16px" }}>Gửi khoá mới cho khách hàng hiện có</h3>
            {MOCK_STUDENTS.slice(0, 4).map((s, i) => {
              const suggested = MOCK_COURSES[(i + 1) % MOCK_COURSES.length];
              const match = 92 - i * 7;
              const sent = sentIds.has(`${s.id}-${suggested.id}`);
              return (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, padding: "14px 0", borderBottom: i < 3 ? "1px solid rgba(180, 88, 9, 0.15)" : "none", alignItems: "center" }}>
                  <div className="mh__avatar" style={{ background: s.avatarBg }}>{s.short}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div>
                    <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>→ <em style={{ color: "var(--mh-amber)", fontStyle: "normal" }}>{suggested.title}</em> · match {match}%</div>
                  </div>
                  {sent ? (
                    <span className="mh__pill mh__pill--green" style={{ padding: "4px 10px" }}>✓ Đã gửi</span>
                  ) : (
                    <button className="mh__btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setSendTo({ student: s, course: suggested })}>Gửi</button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mh__card">
            <h3 style={{ marginBottom: 16 }}>Chiến dịch blast</h3>
            <p style={{ fontSize: 13, color: "var(--mh-ink-soft)", marginBottom: 16 }}>Gửi thông báo khoá mới tới tất cả học viên đã hoàn thành khoá khác.</p>
            <button className="mh__btn mh__btn--primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowCampaign(true)}>+ Tạo chiến dịch</button>
          </div>
        </div>
      </div>

      <div className="mh__card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Bảng xếp hạng Referral</h3>
          <span className="mh__mono" style={{ fontSize: 12, color: "var(--mh-ink-soft)" }}>500 điểm / đăng ký qua link</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="mh__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Người giới thiệu</th>
                <th style={{ textAlign: "right" }}>Share</th>
                <th style={{ textAlign: "right" }}>Đăng ký</th>
                <th style={{ textAlign: "right" }}>CR</th>
                <th style={{ textAlign: "right" }}>Điểm</th>
              </tr>
            </thead>
            <tbody>
              {referralStats.sort((a, b) => b.earned - a.earned).map((r, i) => (
                <tr key={r.name}>
                  <td className="mh__mono" style={{ color: i === 0 ? "var(--mh-amber)" : "inherit", fontWeight: i === 0 ? 600 : 400 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="mh__avatar mh__avatar--sm" style={{ background: r.avatarBg }}>{r.shortN}</div>
                      {r.name}
                    </div>
                  </td>
                  <td className="mh__mono" style={{ textAlign: "right" }}>{r.shares}</td>
                  <td className="mh__mono" style={{ textAlign: "right", color: "var(--mh-teal)", fontWeight: 600 }}>{r.converted}</td>
                  <td className="mh__mono" style={{ textAlign: "right" }}>{((r.converted / r.shares) * 100).toFixed(0)}%</td>
                  <td className="mh__mono" style={{ textAlign: "right", fontWeight: 600 }}>{r.earned} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sendTo && (
        <SendCrossSellModal
          student={sendTo.student}
          course={sendTo.course}
          onClose={() => setSendTo(null)}
          onSent={(channel) => {
            setSentIds((prev) => new Set(prev).add(`${sendTo.student.id}-${sendTo.course.id}`));
            setSendTo(null);
            showToast(`✓ Đã gửi gợi ý khoá "${sendTo.course.title}" tới ${sendTo.student.name} qua ${channel}`, "ok");
          }}
        />
      )}
      {showCampaign && (
        <NewCampaignModal
          onClose={() => setShowCampaign(false)}
          onCreate={(name, targetCount) => {
            setShowCampaign(false);
            showToast(`✓ Đã tạo chiến dịch "${name}" — sẽ gửi tới ${targetCount} học viên`, "ok");
          }}
        />
      )}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "14px 20px", background: toast.kind === "ok" ? "#166534" : "var(--mh-ink)", color: "#fff", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,.2)", zIndex: 300, fontSize: 14, maxWidth: 420 }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

// ── Cross-sell send modal ────────────────────────────────────────────────────
function SendCrossSellModal({ student, course, onClose, onSent }: { student: Student; course: Course; onClose: () => void; onSent: (channel: string) => void }) {
  const [channel, setChannel] = useState<"Zalo" | "Email" | "In-app">("Zalo");
  const [message, setMessage] = useState(
    `Chào ${student.name.split(" ").slice(-1)[0]},\n\nMình là ${MOCK_MENTOR.name}. Thấy bạn vừa hoàn thành khoá gần đây, mình nghĩ khoá "${course.title}" sẽ là bước tiếp theo rất phù hợp cho bạn.\n\nKhoá ${course.sessions} buổi, live 1:1, chỉ còn vài chỗ. Link: ${location.origin}/crm/portal/courses/${course.id}?utm_source=cross-sell&ref=${student.id}\n\nMong sớm gặp bạn!\n${MOCK_MENTOR.name}`
  );

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div className="mh__kicker">GỢI Ý KHOÁ MỚI</div>
            <h3 style={{ marginTop: 4 }}>Gửi đến {student.name}</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: "var(--mh-ivory-2)", borderRadius: 10, marginBottom: 16 }}>
          <div className="mh__avatar mh__avatar--lg" style={{ background: course.iconBg, fontSize: 18 }}>{course.icon}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{course.title}</div>
            <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{course.sessions} buổi · {formatVND(course.price)}</div>
          </div>
        </div>

        <div className="mh__field">
          <label className="mh__label">Kênh gửi</label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["Zalo", "Email", "In-app"] as const).map((ch) => (
              <button key={ch} type="button" className="mh__btn" style={channel === ch ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)" } : {}} onClick={() => setChannel(ch)}>
                {ch === "Zalo" ? "💬" : ch === "Email" ? "✉" : "🔔"} {ch}
              </button>
            ))}
          </div>
        </div>

        <div className="mh__field">
          <label className="mh__label">Nội dung tin nhắn (AI tạo sẵn, có thể sửa)</label>
          <textarea className="mh__textarea" value={message} onChange={(e) => setMessage(e.target.value)} style={{ minHeight: 200, fontSize: 13, lineHeight: 1.55 }} />
          <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", marginTop: 6 }}>{message.length} ký tự · Link có gắn UTM tracking</div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="mh__btn" onClick={onClose}>Huỷ</button>
          <button className="mh__btn mh__btn--primary" disabled={!message.trim()} onClick={() => onSent(channel)}>
            Gửi qua {channel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New campaign modal ──────────────────────────────────────────────────────
function NewCampaignModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, count: number) => void }) {
  const [name, setName] = useState("");
  const [course, setCourse] = useState(MOCK_COURSES[0].id);
  const [segment, setSegment] = useState<"all" | "completed" | "active" | "churn">("completed");
  const [channels, setChannels] = useState({ zalo: true, email: true, app: false });
  const [schedule, setSchedule] = useState<"now" | "later">("now");
  const [scheduleAt, setScheduleAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const segmentCounts: Record<string, number> = { all: MOCK_STUDENTS.length, completed: 68, active: 142, churn: 23 };
  const targetCount = segmentCounts[segment];
  const selectedCourse = MOCK_COURSES.find((c) => c.id === course)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Nhập tên chiến dịch";
    else if (name.trim().length < 4) errs.name = "Tên tối thiểu 4 ký tự";
    if (!channels.zalo && !channels.email && !channels.app) errs.channels = "Chọn ít nhất 1 kênh gửi";
    if (schedule === "later" && !scheduleAt) errs.scheduleAt = "Chọn thời gian gửi";
    else if (schedule === "later" && new Date(scheduleAt) < new Date()) errs.scheduleAt = "Thời gian gửi phải trong tương lai";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onCreate(name, targetCount);
  };

  const segmentLabel: Record<string, string> = {
    all: "Tất cả học viên",
    completed: "Đã hoàn thành khoá",
    active: "Đang theo học",
    churn: "Ít tương tác gần đây",
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">CHIẾN DỊCH MỚI</div>
            <h3 style={{ marginTop: 4 }}>Tạo chiến dịch blast</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="mh__field">
            <label className="mh__label mh__label--req">Tên chiến dịch</label>
            <input className={"mh__input" + (errors.name ? " mh__input--error" : "")} value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: "" }); }} placeholder="VD: Giới thiệu khoá System Design T5/2026" maxLength={100} />
            {errors.name && <div className="mh__error">⚠ {errors.name}</div>}
          </div>

          <div className="mh__field">
            <label className="mh__label mh__label--req">Quảng bá khoá</label>
            <select className="mh__select" value={course} onChange={(e) => setCourse(e.target.value)}>
              {MOCK_COURSES.filter((c) => c.status !== "ended").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", marginTop: 6 }}>Giá: {formatVND(selectedCourse.price)} · Còn {selectedCourse.capacity - selectedCourse.registered} chỗ</div>
          </div>

          <div className="mh__field">
            <label className="mh__label mh__label--req">Nhóm học viên mục tiêu</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(Object.keys(segmentCounts) as (keyof typeof segmentCounts)[]).map((s) => (
                <button key={s} type="button" className="mh__btn" style={segment === s ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)", justifyContent: "space-between" } : { justifyContent: "space-between" }} onClick={() => setSegment(s as typeof segment)}>
                  <span>{segmentLabel[s]}</span>
                  <span className="mh__mono" style={{ fontSize: 11 }}>{segmentCounts[s]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mh__field">
            <label className="mh__label mh__label--req">Kênh gửi (chọn nhiều)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { k: "zalo", l: "💬 Zalo" },
                { k: "email", l: "✉ Email" },
                { k: "app", l: "🔔 In-app" },
              ].map((c) => (
                <button key={c.k} type="button" className="mh__btn" style={(channels as Record<string, boolean>)[c.k] ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)" } : {}} onClick={() => { setChannels({ ...channels, [c.k]: !(channels as Record<string, boolean>)[c.k] }); if (errors.channels) setErrors({ ...errors, channels: "" }); }}>
                  {(channels as Record<string, boolean>)[c.k] ? "✓ " : ""}{c.l}
                </button>
              ))}
            </div>
            {errors.channels && <div className="mh__error" style={{ marginTop: 6 }}>⚠ {errors.channels}</div>}
          </div>

          <div className="mh__field">
            <label className="mh__label">Thời gian gửi</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button type="button" className="mh__btn" style={schedule === "now" ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)" } : {}} onClick={() => setSchedule("now")}>⚡ Gửi ngay</button>
              <button type="button" className="mh__btn" style={schedule === "later" ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", color: "var(--mh-teal)" } : {}} onClick={() => setSchedule("later")}>📅 Hẹn giờ</button>
            </div>
            {schedule === "later" && (
              <>
                <input type="datetime-local" className={"mh__input" + (errors.scheduleAt ? " mh__input--error" : "")} value={scheduleAt} onChange={(e) => { setScheduleAt(e.target.value); if (errors.scheduleAt) setErrors({ ...errors, scheduleAt: "" }); }} min={new Date().toISOString().slice(0, 16)} />
                {errors.scheduleAt && <div className="mh__error">⚠ {errors.scheduleAt}</div>}
              </>
            )}
          </div>

          <div style={{ padding: 14, background: "var(--mh-ivory-2)", borderRadius: 10, marginTop: 20, fontSize: 13 }}>
            <div className="mh__mono" style={{ fontSize: 10, letterSpacing: ".08em", color: "var(--mh-ink-soft)", textTransform: "uppercase", marginBottom: 6 }}>TÓM TẮT</div>
            <div>Gửi <strong>{targetCount}</strong> học viên nhóm <em>"{segmentLabel[segment]}"</em> qua {Object.entries(channels).filter(([, v]) => v).map(([k]) => ({ zalo: "Zalo", email: "Email", app: "In-app" }[k])).join(" + ") || "—"}</div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" className="mh__btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="mh__btn mh__btn--primary">{schedule === "now" ? "Gửi chiến dịch" : "Hẹn giờ gửi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
