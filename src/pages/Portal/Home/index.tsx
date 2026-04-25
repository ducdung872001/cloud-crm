// Portal home — catalog landing. Hero + course grid + social proof + CTA.
import React, { useState } from "react";
import { Link } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import ShareBlock from "../_shared/ShareBlock";
import { MOCK_COURSES, MOCK_MENTOR } from "@/mocks/mentorhub";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "engineering", label: "Kỹ thuật" },
  { id: "leadership", label: "Leadership" },
  { id: "product", label: "Product" },
  { id: "data", label: "Data & AI" },
];

export default function PortalHome() {
  document.title = "MentorHub · Khoá học chất lượng từ mentor hàng đầu";
  const [category, setCategory] = useState("all");
  const visible = MOCK_COURSES.filter((c) => c.status !== "draft");

  return (
    <PortalLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-hero">
        <div className="pt-hero__eyebrow">✦ 10,000+ mentor · 50,000+ học viên</div>
        <h1>
          Học trực tiếp với những <em>chuyên gia</em><br />
          đã tạo ra kết quả thật.
        </h1>
        <p className="pt-hero__tag">
          Khoá học 1:1 và nhóm nhỏ từ các mentor đang làm việc tại Grab, Shopee, TPBank, VNG, Momo.
          Không phải lý thuyết — kinh nghiệm thực chiến.
        </p>
        <div className="pt-hero__cta">
          <a href="#courses" className="pt-btn pt-btn--primary pt-btn--xl">Xem khoá học →</a>
          <Link to="/login" className="pt-btn pt-btn--xl">Trở thành Mentor</Link>
        </div>
        <div className="pt-hero__metrics">
          <div className="pt-hero__metric"><div className="pt-hero__metric-num">10k+</div><div className="pt-hero__metric-label">Mentor chuyên gia</div></div>
          <div className="pt-hero__metric"><div className="pt-hero__metric-num">50k+</div><div className="pt-hero__metric-label">Học viên theo học</div></div>
          <div className="pt-hero__metric"><div className="pt-hero__metric-num">4.92</div><div className="pt-hero__metric-label">Đánh giá trung bình</div></div>
          <div className="pt-hero__metric"><div className="pt-hero__metric-num">98%</div><div className="pt-hero__metric-label">Học viên hoàn thành</div></div>
        </div>
      </section>

      {/* ── Catalog ──────────────────────────────────────────────────────── */}
      <section id="courses" className="pt-section">
        <div className="pt-section__head">
          <div>
            <div className="pt-section__eyebrow">KHOÁ HỌC ĐANG MỞ ĐĂNG KÝ</div>
            <h2>Chọn khoá phù hợp <em>với bạn</em></h2>
          </div>
          <div className="pt-mono" style={{ fontSize: 12, color: "var(--pt-ink-soft)" }}>{visible.length} khoá đang mở</div>
        </div>

        <div className="pt-filters">
          {CATEGORIES.map((c) => (
            <button key={c.id} className={"pt-filter" + (category === c.id ? " is-active" : "")} onClick={() => setCategory(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="pt-grid">
          {visible.map((c) => (
            <Link key={c.id} to={`/portal/courses/${c.id}`} className="pt-ccard">
              <div className="pt-ccard__cover" style={{ background: c.iconBg }}>
                <span className="pt-ccard__pill">
                  {c.status === "live" ? "● Đang diễn ra" : c.status === "upcoming" ? "Sắp bắt đầu" : "Đã kết thúc"}
                </span>
                <button
                  className="pt-ccard__share"
                  onClick={(e) => {
                    e.preventDefault();
                    const url = `${location.origin}/crm/portal/courses/${c.id}`;
                    navigator.share ? navigator.share({ title: c.title, url }) : navigator.clipboard.writeText(url);
                  }}
                  title="Chia sẻ"
                >
                  ↗
                </button>
                {c.icon}
              </div>
              <div className="pt-ccard__body">
                <div className="pt-ccard__mentor">
                  <span className="pt-ccard__mentor-av" style={{ background: MOCK_MENTOR.avatarBg }}>{MOCK_MENTOR.shortName}</span>
                  <span>{MOCK_MENTOR.name}</span>
                </div>
                <div className="pt-ccard__title">{c.title}</div>
                <div className="pt-ccard__meta">
                  <span>{c.sessions} buổi</span>
                  {c.nps > 0 && <span>★ {c.nps}</span>}
                  <span>{c.registered}/{c.capacity} HV</span>
                </div>
                <div className="pt-ccard__foot">
                  <div>
                    {c.originalPrice > c.price && <span className="pt-ccard__price-original">{formatVND(c.originalPrice)}</span>}
                    <span className="pt-ccard__price">{c.price === 0 ? "Miễn phí" : formatVND(c.price)}</span>
                  </div>
                  <span className="pt-ccard__cta">Xem chi tiết →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials / social proof ───────────────────────────────────── */}
      <section className="pt-section" style={{ background: "var(--pt-ivory-2)", margin: "40px -32px", padding: "60px 32px", borderRadius: 24 }}>
        <div className="pt-section__head">
          <div>
            <div className="pt-section__eyebrow">HỌC VIÊN NÓI GÌ</div>
            <h2>Không phải khoá học — là <em>chuyển đổi</em>.</h2>
          </div>
        </div>
        <div className="pt-grid">
          {[
            { name: "Trần Văn Đức", role: "Senior Engineer · FPT", quote: "Mentor Khoa giảng rất sâu, đi thẳng vào các case thực tế ở Grab. Sau khoá tôi được promote lên Tech Lead.", av: "#0F766E", init: "TĐ" },
            { name: "Phạm Thu Hà", role: "PM · TPBank", quote: "Đã theo 3 khoá của anh Khoa. Best quality tôi từng học. Không có khoá nào trên thị trường sánh được.", av: "#B45309", init: "PH" },
            { name: "Vũ Hoàng Nam", role: "Staff Engineer · Shopee", quote: "AI meeting notes là game changer — ôn lại session siêu nhanh. Đáng tiền từng đồng.", av: "#166534", init: "VN" },
          ].map((t, i) => (
            <div key={i} className="pt-ccard" style={{ padding: 28, borderRadius: 18 }}>
              <div style={{ fontSize: 32, color: "var(--pt-teal)", fontFamily: "'Fraunces', serif", lineHeight: 1, marginBottom: 12 }}>"</div>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--pt-ink)", marginBottom: 20 }}>{t.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.av, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 13 }}>{t.init}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div className="pt-mono" style={{ fontSize: 11, color: "var(--pt-ink-soft)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mentor CTA ───────────────────────────────────────────────────── */}
      <section className="pt-section" style={{ textAlign: "center" }}>
        <div className="pt-section__eyebrow" style={{ justifyContent: "center" }}>CHO MENTOR</div>
        <h2 style={{ marginBottom: 16 }}>Bạn là chuyên gia. <em>Hãy dạy.</em></h2>
        <p style={{ color: "var(--pt-ink-soft)", fontSize: 17, maxWidth: 540, margin: "0 auto 32px" }}>
          MentorHub cung cấp công cụ trọn gói: tạo khoá, portal giới thiệu, auto-reminder, AI meeting notes, thu tiền, quản lý học viên — tất cả ở một nơi.
        </p>
        <Link to="/login" className="pt-btn pt-btn--primary pt-btn--xl">Đăng ký làm Mentor →</Link>
      </section>

      <section className="pt-section">
        <ShareBlock
          url={`${location.origin}/crm/portal`}
          title="MentorHub — Học trực tiếp với chuyên gia"
          text="Khoá học 1:1 từ mentor đang làm tại Grab, Shopee, TPBank, VNG. Không phải lý thuyết, kinh nghiệm thực chiến."
          referralReward="Mỗi người bạn giới thiệu đăng ký khoá đầu, bạn nhận 500 điểm thưởng đổi quà + họ được giảm 10%."
          utmSource="portal-home"
        />
      </section>
    </PortalLayout>
  );
}
