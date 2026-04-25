// Portal course detail — public, CONVERSION PAGE. Sticky CTA + share block.
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import ShareBlock from "../_shared/ShareBlock";
import { MOCK_COURSES, MOCK_MENTOR, MOCK_REVIEWS } from "@/mocks/mentorhub";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

// Mock syllabus/curriculum for demo
const SYLLABUS = [
  { title: "Kiến trúc Microservices căn bản", dur: "2h 30m", desc: "Service boundaries, bounded contexts, principles" },
  { title: "Service Discovery & Load Balancing", dur: "2h", desc: "Eureka, Consul, client vs server-side discovery" },
  { title: "API Gateway & Circuit Breakers", dur: "2h 15m", desc: "Spring Cloud Gateway, Resilience4j patterns" },
  { title: "Event-Driven Communication", dur: "2h 30m", desc: "Kafka, async messaging, saga pattern" },
  { title: "Service Mesh với Istio", dur: "2h", desc: "Traffic management, security, observability" },
  { title: "Monitoring & Observability", dur: "1h 45m", desc: "Prometheus, Grafana, distributed tracing" },
  { title: "Kubernetes deployment", dur: "2h", desc: "Helm, rolling updates, blue-green, canary" },
  { title: "Case Study + Capstone", dur: "2h 30m", desc: "Full production system review + Q&A" },
];

export default function PortalCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = MOCK_COURSES.find((c) => c.id === id);

  useEffect(() => {
    if (course) document.title = `${course.title} · MentorHub`;
  }, [course]);

  if (!course) {
    return (
      <PortalLayout>
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2>Không tìm thấy khoá học</h2>
          <Link to="/portal" className="pt-btn pt-btn--primary" style={{ marginTop: 20 }}>← Về trang khoá học</Link>
        </div>
      </PortalLayout>
    );
  }

  const discount = course.originalPrice > course.price ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
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
              ★ {avgRating.toFixed(2)} · {reviewsForCourse.length * 42}+ đánh giá · {course.registered}/{course.capacity} đã đăng ký
            </div>
            <h1 className="pt-detail__title">{course.title}</h1>
            <p className="pt-detail__lead">
              Khoá học {course.sessions} buổi dành cho engineer muốn thăng tiến lên Senior/Staff.
              Học trực tiếp với {MOCK_MENTOR.name}, {MOCK_MENTOR.title}.
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
              {SYLLABUS.slice(0, course.sessions).map((s, i) => (
                <div key={i} className="pt-detail__syllabus-item">
                  <div className="pt-detail__syllabus-num">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "var(--pt-ink-soft)" }}>{s.desc}</div>
                  </div>
                  <div className="pt-mono" style={{ fontSize: 12, color: "var(--pt-ink-soft)" }}>{s.dur}</div>
                </div>
              ))}
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
