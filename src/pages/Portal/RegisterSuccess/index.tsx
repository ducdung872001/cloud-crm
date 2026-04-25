// Portal register success — confirmation + killer share CTA.
import React from "react";
import { Link, useLocation } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import ShareBlock from "../_shared/ShareBlock";
import { MOCK_COURSES } from "@/mocks/mentorhub";

export default function PortalRegisterSuccess() {
  document.title = "Đăng ký thành công · MentorHub";
  const params = new URLSearchParams(useLocation().search);
  const courseId = params.get("course") || "CRS-01";
  const name = params.get("name") || "bạn";
  const course = MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];
  const shareUrl = `${location.origin}/crm/portal/courses/${course.id}`;

  return (
    <PortalLayout>
      <div style={{ maxWidth: 720, margin: "60px auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 88, height: 88, borderRadius: "50%", background: "#DCFCE7", color: "#166534", fontSize: 44, marginBottom: 24 }}>✓</div>
          <h1 style={{ fontSize: 44, marginBottom: 16 }}>Cám ơn, <em>{name}</em>!</h1>
          <p style={{ fontSize: 18, color: "var(--pt-ink-soft)", marginBottom: 8 }}>
            Đã nhận đăng ký khoá <strong>{course.title}</strong>.
          </p>
          <p style={{ fontSize: 15, color: "var(--pt-ink-soft)", marginBottom: 32 }}>
            Mentor sẽ liên hệ bạn trong vòng 2h làm việc để xác nhận và gửi thông tin thanh toán.
          </p>
        </div>

        {/* ── What's next steps ─────────────────────────────────────── */}
        <div className="pt-ccard" style={{ padding: 32, marginBottom: 40, borderRadius: 18 }}>
          <div className="pt-section__eyebrow" style={{ marginBottom: 16 }}>CÁC BƯỚC TIẾP THEO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { n: 1, title: "Kiểm tra email & Zalo", desc: "Bạn sẽ nhận email xác nhận trong 10 phút. Nếu không thấy, kiểm tra mục spam." },
              { n: 2, title: "Mentor xác nhận (trong 2h)", desc: "Mentor sẽ nhắn trực tiếp qua Zalo để xác nhận và gửi link thanh toán." },
              { n: 3, title: "Nhận link Zoom & lịch học", desc: "Sau khi thanh toán, bạn nhận link Zoom, lịch học chi tiết và tài liệu chuẩn bị." },
              { n: 4, title: "Bắt đầu học", desc: "Hệ thống nhắc lịch 24h và 30 phút trước buổi qua Zalo + Email." },
            ].map((s) => (
              <div key={s.n} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--pt-teal)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 600 }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: "var(--pt-ink-soft)" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Share (EARN REFERRAL POINTS) ─────────────────────────── */}
        <ShareBlock
          url={shareUrl}
          title={`Tôi vừa đăng ký ${course.title} · MentorHub`}
          text={`Chất lượng thật sự, không phải lý thuyết suông. Cùng học với tôi nhé!`}
          eyebrow="🎁 NHẬN 500 ĐIỂM · CHIA SẺ CHO BẠN BÈ"
          referralReward="Mỗi người bạn giới thiệu đăng ký khoá này: bạn nhận 500 điểm thưởng (đổi 200k giảm giá khoá tiếp theo), họ được giảm 10%."
          utmSource={`post-register-${course.id}`}
        />

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link to="/portal" className="pt-btn pt-btn--lg">Xem các khoá học khác</Link>
        </div>
      </div>
    </PortalLayout>
  );
}
