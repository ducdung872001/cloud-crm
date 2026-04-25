// Portal About — company story, mission, team, trust signals
import React from "react";
import { Link } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import ShareBlock from "../_shared/ShareBlock";

export default function PortalAbout() {
  document.title = "Về MentorHub · Học trực tiếp với chuyên gia";

  return (
    <PortalLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-hero" style={{ padding: "80px 0 40px" }}>
        <div className="pt-hero__eyebrow">✦ VỀ CHÚNG TÔI</div>
        <h1 style={{ fontSize: 60, maxWidth: 960 }}>
          Đưa kinh nghiệm thật từ chuyên gia đến <em>những người đang cần</em>.
        </h1>
        <p className="pt-hero__tag" style={{ fontSize: 20, maxWidth: 720, marginTop: 24 }}>
          Chúng tôi tin rằng kỹ năng tốt nhất không nằm trong sách giáo khoa —
          mà ở trong đầu những người đã làm thật, đã sai thật, và đã học thật.
        </p>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────────── */}
      <section className="pt-section" style={{ padding: "40px 0 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "start" }} className="pt-about-grid">
          <div>
            <div className="pt-section__eyebrow">SỨ MỆNH</div>
            <h2 style={{ fontSize: 44, marginTop: 12 }}>
              Biến mentor thành <em>sản phẩm</em>.
            </h2>
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.75, color: "var(--pt-ink)" }}>
            <p style={{ marginBottom: 18 }}>
              Mỗi ngày có hàng ngàn engineer Việt Nam dạy người khác qua Zoom cá nhân, Zalo group, cà phê 1:1.
              Họ có kiến thức, có đam mê chia sẻ, nhưng thiếu công cụ để biến hoạt động đó thành một <em>sản phẩm</em>
              — có thể tìm thấy, có thể mở rộng, có thể sống được bằng nghề mentor.
            </p>
            <p style={{ marginBottom: 18 }}>
              <strong>MentorHub được sinh ra để lấp khoảng trống đó.</strong> Chúng tôi không tạo khoá học —
              chúng tôi tạo hệ sinh thái để mentor tự làm: tự tạo khoá, tự quản lý học viên,
              tự đánh giá chất lượng, tự nhận feedback, tự grow.
            </p>
            <p>
              Học viên, đổi lại, được tiếp cận những người dạy thực sự đang <em>làm</em> — không phải những giảng viên
              chưa bước chân ra khỏi trường đại học trong 10 năm.
            </p>
          </div>
        </div>
      </section>

      {/* ── Numbers ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px", background: "var(--pt-ivory-2)", margin: "40px -32px", borderRadius: 24 }}>
        <div className="pt-container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="pt-section__eyebrow" style={{ justifyContent: "center" }}>CON SỐ TỪ CỘNG ĐỒNG</div>
            <h2 style={{ marginTop: 12 }}>Xây dựng bởi hàng ngàn <em>chuyên gia</em>.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }} className="pt-about-stats">
            {[
              { n: "10,000+", l: "Mentor đang hoạt động" },
              { n: "50,000+", l: "Học viên đã theo học" },
              { n: "280,000+", l: "Giờ đào tạo 1:1" },
              { n: "4.92/5", l: "Đánh giá trung bình" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 56, color: "var(--pt-teal)", lineHeight: 1 }}>{s.n}</div>
                <div className="pt-mono" style={{ fontSize: 12, letterSpacing: ".1em", color: "var(--pt-ink-soft)", marginTop: 10, textTransform: "uppercase" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pillars — what makes MH different ─────────────────────────────── */}
      <section className="pt-section">
        <div className="pt-section__head">
          <div>
            <div className="pt-section__eyebrow">TẠI SAO MENTORHUB</div>
            <h2>4 giá trị cốt lõi <em>không thoả hiệp</em>.</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }} className="pt-about-pillars">
          {[
            {
              icon: "◉",
              title: "Chỉ mentor đang làm thật",
              desc: "Mỗi mentor đều được verify đang làm việc tại công ty công nghệ. Không có ai 'dạy cho vui' — họ đang sống với chính những kiến thức họ truyền đạt.",
            },
            {
              icon: "✦",
              title: "AI trợ lý, không AI thay thế",
              desc: "Meeting notes, summary, sentiment analysis — AI xử lý phần việc nhàm chán để mentor tập trung vào điều quan trọng: tương tác thật với học viên.",
            },
            {
              icon: "♥",
              title: "Feedback minh bạch 2 chiều",
              desc: "Học viên đánh giá (có thể ẩn danh). Mentor trả lời. Không có ratings giả, không có review ẩn. Chất lượng được kiểm chứng bởi cộng đồng.",
            },
            {
              icon: "⚡",
              title: "Chia sẻ đẻ ra giá trị",
              desc: "Học viên chia sẻ khoá học → nhận điểm thưởng. Mentor chia sẻ profile → tăng học viên. Chúng tôi thiết kế để sự lan toả tự nhiên và đôi bên cùng lợi.",
            },
          ].map((p, i) => (
            <div key={i} className="pt-ccard" style={{ padding: 36 }}>
              <div style={{ fontSize: 40, color: "var(--pt-teal)", marginBottom: 20, fontFamily: "'Fraunces', serif" }}>{p.icon}</div>
              <h3 style={{ fontSize: 22, marginBottom: 12 }}>{p.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--pt-ink-soft)" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team / Founders ──────────────────────────────────────────────── */}
      <section className="pt-section">
        <div className="pt-section__head">
          <div>
            <div className="pt-section__eyebrow">ĐỘI NGŨ SÁNG LẬP</div>
            <h2>Những <em>mentor thứ thiệt</em> đứng sau MentorHub.</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="pt-about-team">
          {[
            { name: "Phan Đức Dũng", role: "Founder & CEO · Reborn JSC", bio: "15 năm xây BPM & CRM cho enterprise. Từng lead platform team 60+ người.", av: "#0F766E", init: "PD" },
            { name: "Nguyễn Trọng Khoa", role: "CTO · Cofounder", bio: "Principal Engineer, Ex-Grab. Chuyên microservices & distributed systems.", av: "#134E4A", init: "NK" },
            { name: "Lê Thanh Hương", role: "Head of Product", bio: "Head of Data · VNG. 10 năm product cho fintech & platform ở quy mô lớn.", av: "#B45309", init: "LH" },
          ].map((t, i) => (
            <div key={i} className="pt-ccard" style={{ padding: 28, textAlign: "center" }}>
              <div style={{ width: 96, height: 96, margin: "0 auto 16px", borderRadius: "50%", background: t.av, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 32 }}>{t.init}</div>
              <h3 style={{ fontSize: 22, marginBottom: 6 }}>{t.name}</h3>
              <div className="pt-mono" style={{ fontSize: 11, color: "var(--pt-teal)", marginBottom: 14 }}>{t.role}</div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--pt-ink-soft)" }}>{t.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section className="pt-section" style={{ padding: "60px 0" }}>
        <div className="pt-ccard" style={{ padding: 48, background: "linear-gradient(135deg, var(--pt-ivory-2), var(--pt-amber-soft))", border: "1px solid rgba(180, 88, 9, 0.15)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 48, alignItems: "center" }} className="pt-about-contact">
            <div>
              <div className="pt-section__eyebrow">LIÊN HỆ TRỰC TIẾP</div>
              <h2 style={{ marginTop: 12, marginBottom: 16 }}>Có câu hỏi? <em>Gặp chúng tôi.</em></h2>
              <p style={{ color: "var(--pt-ink-soft)", fontSize: 15 }}>
                Muốn đối tác, báo chí, hay chỉ muốn cà phê trao đổi — chúng tôi luôn sẵn sàng.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <a href="mailto:hello@mentorhub.vn" className="pt-ccard" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center", borderRadius: 12, textDecoration: "none" }}>
                <div style={{ fontSize: 24 }}>📧</div>
                <div>
                  <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", letterSpacing: ".08em" }}>EMAIL</div>
                  <div style={{ fontWeight: 500, fontSize: 15, color: "var(--pt-teal)" }}>hello@mentorhub.vn</div>
                </div>
              </a>
              <a href="tel:+842838123456" className="pt-ccard" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center", borderRadius: 12, textDecoration: "none" }}>
                <div style={{ fontSize: 24 }}>📱</div>
                <div>
                  <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", letterSpacing: ".08em" }}>HOTLINE</div>
                  <div style={{ fontWeight: 500, fontSize: 15, color: "var(--pt-teal)" }}>(028) 3812 3456</div>
                </div>
              </a>
              <div className="pt-ccard" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center", borderRadius: 12 }}>
                <div style={{ fontSize: 24 }}>📍</div>
                <div>
                  <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", letterSpacing: ".08em" }}>VĂN PHÒNG</div>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>Toà Metro Star, Thủ Đức · TP. HCM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="pt-section" style={{ textAlign: "center", padding: "60px 0 80px" }}>
        <div className="pt-section__eyebrow" style={{ justifyContent: "center" }}>SẴN SÀNG BẮT ĐẦU?</div>
        <h2 style={{ marginTop: 12, marginBottom: 16 }}>Học — hoặc dạy. <em>Cả hai đều ở đây.</em></h2>
        <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          <Link to="/portal" className="pt-btn pt-btn--primary pt-btn--xl">Xem khoá học →</Link>
          <Link to="/login" className="pt-btn pt-btn--xl">Trở thành mentor</Link>
        </div>
        <ShareBlock
          url={`${location.origin}/crm/portal/about`}
          title="MentorHub — Học trực tiếp với chuyên gia"
          text="Nền tảng đào tạo 1:1 từ mentor đang làm việc thực tế tại Grab, Shopee, VNG, Momo, TPBank…"
          eyebrow="⚡ CHIA SẺ VỀ MENTORHUB"
          referralReward="Giới thiệu bạn bè tham gia cộng đồng — bạn nhận 500 điểm thưởng cho mỗi đăng ký khoá đầu tiên."
          utmSource="portal-about"
        />
      </section>

      <style>{`
        @media (max-width: 900px) {
          .pt-about-grid, .pt-about-contact { grid-template-columns: 1fr !important; gap: 24px !important; }
          .pt-about-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .pt-about-pillars, .pt-about-team { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PortalLayout>
  );
}
