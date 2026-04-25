// Subscription hard-gate — khi gói expired/past_due, khoá toàn bộ MH admin pages
// Chỉ cho phép vào /mh/settings (để thanh toán) hoặc /portal/* (public)
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MOCK_SUBSCRIPTION, daysRemaining, formatVND } from "@/mocks/subscription";
import "./SubscriptionGate.scss";

export default function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const sub = MOCK_SUBSCRIPTION; // TODO: useSubscription() hook khi có API

  // Chỉ áp dụng gate cho MH admin routes
  const onMHAdmin = location.pathname.startsWith("/mh");
  const onSettings = location.pathname.startsWith("/mh/settings");

  // Expired trigger: status=expired hoặc (trial && trialEndsAt < now)
  const trialExpired = sub.plan === "trial" && sub.trialEndsAt && new Date(sub.trialEndsAt) < new Date();
  const paidExpired = sub.status === "expired";
  const pastDue = sub.status === "past_due";

  const blocked = onMHAdmin && !onSettings && (trialExpired || paidExpired || pastDue);

  if (!blocked) return <>{children}</>;

  // Lock screen — mentor phải chuyển tới /mh/settings để thanh toán
  const reason = trialExpired ? "trial" : paidExpired ? "expired" : "past_due";
  const title = reason === "trial" ? "Bản dùng thử đã hết hạn" : reason === "expired" ? "Gói đăng ký đã hết hạn" : "Thanh toán gần đây thất bại";
  const subtitle =
    reason === "trial"
      ? "Cảm ơn bạn đã trải nghiệm MentorHub 30 ngày qua. Chọn gói để tiếp tục tạo AI note, gửi Zalo và các tính năng Pro."
      : reason === "expired"
      ? "Gói của bạn đã hết hạn. Gia hạn để tiếp tục quản lý khoá học, học viên và gửi AI note."
      : "Thanh toán tự động gia hạn chu kỳ mới chưa thành công. Cập nhật thanh toán để không bị gián đoạn.";

  return (
    <>
      {/* Vẫn render page phía dưới (blurred) để giữ context — KHÔNG clickable */}
      <div className="mh-gate__dimmed" aria-hidden="true">{children}</div>

      {/* Overlay lock */}
      <div className="mh-gate__overlay" role="dialog" aria-modal="true">
        <div className="mh-gate__card">
          <div className="mh-gate__icon-wrap">
            <div className="mh-gate__icon">{reason === "past_due" ? "💳" : "🔒"}</div>
          </div>

          <div className="mh-gate__eyebrow">
            {reason === "trial" ? "🎁 HẾT TRIAL" : reason === "expired" ? "⚠ GÓI HẾT HẠN" : "⚠ THANH TOÁN THẤT BẠI"}
          </div>
          <h1 className="mh-gate__title">{title}</h1>
          <p className="mh-gate__desc">{subtitle}</p>

          {/* Summary: gì đang bị khoá */}
          <div className="mh-gate__locked-list">
            <div className="mh-gate__locked-item">🎥 Không tạo được AI Meeting Note mới</div>
            <div className="mh-gate__locked-item">💬 Không gửi được tin Zalo cho học viên</div>
            <div className="mh-gate__locked-item">🎓 Không mở được khoá học mới</div>
            <div className="mh-gate__locked-item">📊 Không xem được dashboard & báo cáo</div>
          </div>

          <div className="mh-gate__keep">
            <strong>Dữ liệu của bạn vẫn an toàn:</strong> Khoá học, học viên, recording cũ đều được giữ nguyên.
            Gia hạn là tiếp tục dùng ngay, không cần setup lại.
          </div>

          <div className="mh-gate__actions">
            <Link to="/mh/settings?section=subscription" className="mh-gate__cta">
              {reason === "past_due" ? "→ Cập nhật thanh toán" : "→ Gia hạn ngay"}
            </Link>
            <Link to="/portal" className="mh-gate__secondary">
              Về trang portal công khai
            </Link>
          </div>

          <div className="mh-gate__help">
            Cần hỗ trợ? Liên hệ <a href="mailto:hello@mentorhub.vn">hello@mentorhub.vn</a> hoặc hotline <a href="tel:+842838123456">(028) 3812 3456</a>.
          </div>
        </div>
      </div>
    </>
  );
}
