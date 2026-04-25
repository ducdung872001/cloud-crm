// Zalo Mini App · More — subscription status, settings, deep links sang web
import React from "react";
import ZaloMiniLayout from "../_shared/ZaloMiniLayout";
import { zmp } from "../_shared/zmpSdk";
import { MOCK_MENTOR } from "@/mocks/mentorhub";
import { MOCK_SUBSCRIPTION, daysRemaining, formatVND } from "@/mocks/subscription";

export default function ZaloMore() {
  document.title = "MentorHub · Khác";
  const sub = MOCK_SUBSCRIPTION;
  const trialDays = sub.trialEndsAt ? daysRemaining(sub.trialEndsAt) : 0;
  const trialUrgent = sub.plan === "trial" && trialDays <= 7;

  const menu = [
    { icon: "🎓", label: "Tạo khoá học mới", url: "http://localhost:4000/crm/mh/courses/new" },
    { icon: "✦", label: "AI meeting notes", url: "http://localhost:4000/crm/mh/session-review" },
    { icon: "★", label: "Feedback & NPS", url: "http://localhost:4000/crm/mh/feedback" },
    { icon: "₫", label: "Doanh thu", url: "http://localhost:4000/crm/mh/revenue" },
    { icon: "◇", label: "Marketing & Chia sẻ", url: "http://localhost:4000/crm/mh/marketing" },
    { icon: "⚙", label: "Cài đặt & Tích hợp", url: "http://localhost:4000/crm/mh/settings" },
  ];

  return (
    <ZaloMiniLayout title="Khác">
      {/* Mentor profile card */}
      <div className="zmp-card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div className="zmp-avatar" style={{ width: 48, height: 48, fontSize: 16, background: MOCK_MENTOR.avatarBg }}>{MOCK_MENTOR.shortName}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{MOCK_MENTOR.name}</div>
          <div className="zmp-mono" style={{ fontSize: 11, color: "var(--zmp-ink-soft)", marginTop: 2 }}>{MOCK_MENTOR.title}</div>
        </div>
      </div>

      {/* Subscription status */}
      <div className={"zmp-card"} style={{ marginTop: 12, background: trialUrgent ? "#FEF2F2" : sub.plan === "trial" ? "#FFF9ED" : "#F0FDF4", borderColor: trialUrgent ? "#FCA5A5" : sub.plan === "trial" ? "#FDE68A" : "#86EFAC" }}>
        <div className="zmp-kicker" style={{ color: trialUrgent ? "var(--zmp-red)" : sub.plan === "trial" ? "var(--zmp-amber)" : "var(--zmp-green)", marginBottom: 4 }}>
          {sub.plan === "trial" ? "BẢN DÙNG THỬ" : `GÓI ${sub.plan.toUpperCase()}`}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          {sub.plan === "trial" ? `Còn ${trialDays} ngày` : "Đang hoạt động"}
        </div>
        <div className="zmp-mono" style={{ fontSize: 11, color: "var(--zmp-ink-soft)", marginBottom: 10 }}>
          Đã dùng {sub.usage.aiSessionsUsed} buổi AI · {sub.usage.zaloSent} tin Zalo tháng này
        </div>
        <button
          className={"zmp-btn zmp-btn--full " + (trialUrgent ? "zmp-btn--amber" : sub.plan === "trial" ? "zmp-btn--primary" : "")}
          onClick={() => zmp.openUrl("http://localhost:4000/crm/mh/settings?section=subscription")}
        >
          {sub.plan === "trial" ? "→ Nâng cấp ngay" : `Xem gói · ${formatVND(sub.nextBillingAmountVND ?? 0)}`}
        </button>
      </div>

      {/* Menu list → deep link sang web */}
      <div className="zmp-kicker" style={{ margin: "20px 0 8px" }}>MỞ TRÊN MÁY TÍNH</div>
      <div className="zmp-card" style={{ padding: 0 }}>
        {menu.map((m, i) => (
          <button
            key={m.url}
            className="zmp-btn"
            onClick={() => zmp.openUrl(m.url)}
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "32px 1fr auto",
              gap: 12,
              padding: "14px 16px",
              border: 0,
              borderBottom: i < menu.length - 1 ? "1px solid var(--zmp-line)" : 0,
              background: "transparent",
              borderRadius: 0,
              justifyContent: "flex-start",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <span style={{ fontSize: 14 }}>{m.label}</span>
            <span style={{ color: "var(--zmp-ink-soft)" }}>↗</span>
          </button>
        ))}
      </div>

      {/* Support */}
      <div className="zmp-kicker" style={{ margin: "20px 0 8px" }}>HỖ TRỢ</div>
      <div className="zmp-card" style={{ padding: 0 }}>
        <button
          className="zmp-btn"
          onClick={() => zmp.openUrl("https://zalo.me/mentorhub-support")}
          style={{ width: "100%", padding: 14, border: 0, borderBottom: "1px solid var(--zmp-line)", background: "transparent", borderRadius: 0, justifyContent: "flex-start", fontSize: 13 }}
        >
          💬 Chat với MentorHub OA
        </button>
        <button
          className="zmp-btn"
          onClick={() => zmp.openUrl("tel:+842838123456")}
          style={{ width: "100%", padding: 14, border: 0, background: "transparent", borderRadius: 0, justifyContent: "flex-start", fontSize: 13 }}
        >
          📞 Gọi hotline (028) 3812 3456
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--zmp-line)", fontSize: 10, color: "var(--zmp-ink-soft)" }}>
        <div className="zmp-mono">MentorHub v0.1 · Reborn JSC</div>
        <div style={{ marginTop: 4 }}>Mini App running {zmp.isZaloApp() ? "trong Zalo" : "ở chế độ preview"}</div>
      </div>
    </ZaloMiniLayout>
  );
}
