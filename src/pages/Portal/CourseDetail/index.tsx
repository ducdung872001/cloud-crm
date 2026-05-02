// Portal course detail — public, CONVERSION PAGE. Sticky CTA + share block.
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import ShareBlock from "../_shared/ShareBlock";
import SalesServiceClient, { SalesService } from "services/SalesServiceClient";
import SalesOrderService from "services/SalesOrderService";
import { MOCK_MENTOR, MOCK_REVIEWS } from "@/mocks/mentorhub";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

type AgendaItem = { title?: string; description?: string; durationMin?: number };
type UiCourse = {
  id: number;
  title: string;
  sessions: number;
  capacity: number;
  registered: number;
  price: number;
  originalPrice: number;
  intro: string;
  icon: string;
  iconBg: string;
  agenda: AgendaItem[];
};

function adaptCourse(svc: SalesService): UiCourse {
  const meta = (svc.metadata as Record<string, unknown>) || {};
  return {
    id: Number(svc.id),
    title: svc.name || "(chưa đặt tên)",
    sessions: Number(meta.sessions ?? svc.total_time ?? 0),
    capacity: Number(meta.capacity ?? 0),
    registered: 0, // sẽ compute on-read sau
    price: Number(svc.price ?? 0),
    originalPrice: Number(svc.retailPrice ?? svc.price ?? 0),
    intro: svc.intro || "",
    icon: typeof meta.icon === "string" ? (meta.icon as string) : "⎈",
    iconBg:
      typeof meta.iconBg === "string"
        ? (meta.iconBg as string)
        : "linear-gradient(135deg, #134E4A, #0F766E)",
    agenda: Array.isArray(meta.agenda) ? (meta.agenda as AgendaItem[]) : [],
  };
}

const formatDuration = (min: number): string => {
  if (!min || min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
};

export default function PortalCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [id]);

  const [course, setCourse] = useState<UiCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!numId) {
      setLoading(false);
      setError("ID khoá học không hợp lệ");
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    SalesServiceClient.get(numId, ctrl.signal)
      .then(async (res: { result?: SalesService }) => {
        const svc = res?.result;
        if (!svc || !svc.id) {
          setError("Khoá học không tồn tại hoặc đã bị xoá");
          return;
        }
        const adapted = adaptCourse(svc);
        // Compute registered từ /sales/order/list (best-effort, không block)
        try {
          const orderRes = (await SalesOrderService.list(
            { productId: numId, status: "PAID", orderType: "COURSE_ENROLLMENT", page: 1, limit: 200 },
            ctrl.signal,
          )) as { result?: { items?: unknown[] } | unknown[] };
          const r = orderRes?.result ?? [];
          const items = Array.isArray(r) ? r : (r as { items?: unknown[] }).items ?? [];
          adapted.registered = items.length;
        } catch {
          /* compute fail OK, keep 0 */
        }
        setCourse(adapted);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message || "Không tải được khoá học");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [numId]);

  useEffect(() => {
    if (course) document.title = `${course.title} · MentorHub`;
  }, [course]);

  if (loading) {
    return (
      <PortalLayout>
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--pt-ink-soft)" }}>
          Đang tải khoá học…
        </div>
      </PortalLayout>
    );
  }

  if (!course) {
    return (
      <PortalLayout>
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2>Không tìm thấy khoá học</h2>
          {error && <p style={{ color: "var(--pt-ink-soft)", marginTop: 8 }}>{error}</p>}
          <Link to="/portal" className="pt-btn pt-btn--primary" style={{ marginTop: 20 }}>← Về trang khoá học</Link>
        </div>
      </PortalLayout>
    );
  }

  const discount =
    course.originalPrice > course.price && course.originalPrice > 0
      ? Math.round((1 - course.price / course.originalPrice) * 100)
      : 0;
  const reviewsForCourse = MOCK_REVIEWS.slice(0, 3);
  const avgRating = reviewsForCourse.reduce((s, r) => s + r.nps, 0) / reviewsForCourse.length;
  const shareUrl = `${location.origin}/crm/portal/courses/${course.id}`;

  return (
    <PortalLayout>
      <section className="pt-detail">
        <div style={{ padding: "32px 0 0" }}>
          <Link to="/portal" className="pt-detail__back">← Tất cả khoá học</Link>
        </div>

        <div className="pt-detail__hero">
          <div>
            <div className="pt-kicker" style={{ marginBottom: 12 }}>
              {course.registered > 0 ? `${course.registered}/${course.capacity} đã đăng ký` : `Mở đăng ký · ${course.capacity} chỗ`}
            </div>
            <h1 className="pt-detail__title">{course.title}</h1>
            <p className="pt-detail__lead">
              {course.intro || `Khoá học ${course.sessions} buổi với mentor.`}
            </p>
            <div className="pt-detail__chips">
              <span className="pt-detail__chip">⏱ {course.sessions} buổi · mỗi buổi 2h</span>
              <span className="pt-detail__chip">🎓 Senior-level</span>
              <span className="pt-detail__chip">💬 Hỏi đáp trực tiếp</span>
              <span className="pt-detail__chip">📹 Recording + AI note</span>
            </div>
          </div>
          <div className="pt-detail__cover" style={{ background: course.iconBg }}>
            {course.icon}
          </div>
        </div>

        <div className="pt-detail__grid">
          <div>
            <div className="pt-detail__section">
              <div className="pt-detail__section-h">VỀ KHOÁ HỌC</div>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--pt-ink)" }}>
                Đây là khoá học thực chiến, không lý thuyết suông. Mỗi buổi có demo code live, case study từ hệ thống thật
                đã chạy production ở Grab, Shopee. Sau khoá, bạn sẽ tự design được hệ thống microservices end-to-end,
                biết khi nào nên và không nên microservices, tránh các pitfall phổ biến.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--pt-ink)", marginTop: 14 }}>
                <strong>Phù hợp cho:</strong> Backend engineer 3+ năm kinh nghiệm, Tech Lead mới, Solution Architect,
                Engineering Manager đang cần hiểu sâu về hệ thống.
              </p>
            </div>

            <div className="pt-detail__section">
              <div className="pt-detail__section-h">GIÁO TRÌNH · {course.sessions} BUỔI</div>
              {course.agenda.length === 0 ? (
                <p style={{ color: "var(--pt-ink-soft)", fontSize: 14 }}>
                  Mentor chưa cập nhật giáo trình chi tiết. Liên hệ trực tiếp để biết thêm.
                </p>
              ) : (
                course.agenda.map((s, i) => (
                  <div key={i} className="pt-detail__syllabus-item">
                    <div className="pt-detail__syllabus-num">{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.title || `Buổi ${i + 1}`}</div>
                      {s.description && (
                        <div style={{ fontSize: 13, color: "var(--pt-ink-soft)" }}>{s.description}</div>
                      )}
                    </div>
                    <div className="pt-mono" style={{ fontSize: 12, color: "var(--pt-ink-soft)" }}>
                      {formatDuration(s.durationMin || 0)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-detail__section">
              <div className="pt-detail__section-h">MENTOR</div>
              <div className="pt-detail__mentor-card">
                <div className="pt-detail__mentor-av" style={{ background: MOCK_MENTOR.avatarBg }}>{MOCK_MENTOR.shortName}</div>
                <div>
                  <h3 style={{ fontSize: 22, marginBottom: 4 }}>{MOCK_MENTOR.name}</h3>
                  <div className="pt-mono" style={{ fontSize: 12, color: "var(--pt-ink-soft)", marginBottom: 12 }}>{MOCK_MENTOR.title}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>{MOCK_MENTOR.bio}</p>
                  <div style={{ marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12 }} className="pt-mono">
                    <span>★ 4.92 NPS · 423 đánh giá</span>
                    <span>3 khoá đang mở · 187 học viên hiện tại</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-detail__section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
                <div className="pt-detail__section-h" style={{ marginBottom: 0 }}>ĐÁNH GIÁ TỪ HỌC VIÊN</div>
                <button
                  className="pt-btn pt-btn--teal"
                  style={{ fontSize: 13 }}
                  onClick={() => (window.location.href = `/crm/portal/feedback/${course.id}`)}
                >
                  ⭐ Đã học khoá này? Đánh giá ngay
                </button>
              </div>
              <p style={{ fontSize: 13, color: "var(--pt-ink-soft)", marginBottom: 20 }}>
                Đánh giá của bạn giúp mentor cải thiện khoá và giúp học viên khác chọn khoá phù hợp. Có thể gửi ẩn danh.
              </p>
              {reviewsForCourse.map((r, i) => (
                <div key={i} style={{ padding: "20px 0", borderBottom: "1px solid var(--pt-line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.student}</div>
                    <div className="pt-mono" style={{ fontSize: 12, color: "var(--pt-ink-soft)" }}>
                      {"★".repeat(r.nps)}{"☆".repeat(5 - r.nps)} · {r.time}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--pt-ink)" }}>"{r.comment}"</p>
                </div>
              ))}
            </div>

            {/* ── Killer share block ─────────────────────────────────────── */}
            <ShareBlock
              url={shareUrl}
              title={`${course.title} · MentorHub`}
              text={`Khoá học ${course.sessions} buổi với ${MOCK_MENTOR.name}. Đăng ký: `}
              referralReward="Bạn bè đăng ký qua link của bạn: họ được giảm 10%, bạn được 500 điểm thưởng (đổi được 200k giảm giá khoá tiếp theo)."
              utmSource={`course-${course.id}`}
              eyebrow="⚡ CHIA SẺ · KIẾM ĐIỂM THƯỞNG"
            />
          </div>

          {/* ── Sticky sidebar CTA ────────────────────────────────────────── */}
          <div>
            <div className="pt-detail__sticky">
              <div style={{ marginBottom: 20 }}>
                <div className="pt-detail__price-big">{course.price === 0 ? "Miễn phí" : formatVND(course.price)}</div>
                {discount > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <span className="pt-detail__price-strike">{formatVND(course.originalPrice)}</span>
                    <span className="pt-detail__discount">-{discount}%</span>
                  </div>
                )}
              </div>

              <button
                className="pt-btn pt-btn--primary pt-btn--lg"
                style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
                onClick={() => navigate(`/portal/register/${course.id}`)}
              >
                Đăng ký ngay →
              </button>
              <button
                className="pt-btn pt-btn--lg"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  if (navigator.share) navigator.share({ title: course.title, url: shareUrl });
                  else navigator.clipboard.writeText(shareUrl);
                }}
              >
                ↗ Chia sẻ khoá học
              </button>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--pt-line)", display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--pt-teal)" }}>✓</span>
                  <span><strong>{course.sessions} buổi</strong> · mỗi buổi 2h · online qua Zoom</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--pt-teal)" }}>✓</span>
                  <span><strong>Recording + AI note</strong> sau mỗi buổi</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--pt-teal)" }}>✓</span>
                  <span><strong>Q&A trực tiếp</strong> với mentor trong session</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--pt-teal)" }}>✓</span>
                  <span><strong>Bảo lưu 1 lần</strong> nếu bận lịch</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--pt-teal)" }}>✓</span>
                  <span><strong>Hoàn tiền 7 ngày</strong> nếu không hài lòng</span>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 14, background: "var(--pt-amber-soft)", borderRadius: 10, fontSize: 12, color: "var(--pt-ink)" }}>
                ⚡ <strong>Còn {course.capacity - course.registered} chỗ</strong> · Đóng đăng ký khi đủ sĩ số
              </div>
            </div>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
}
