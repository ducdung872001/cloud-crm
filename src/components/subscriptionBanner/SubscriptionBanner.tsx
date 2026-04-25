// Global banner nhắc trial/quota cho mentor — hiển thị phía trên tất cả MH pages
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MOCK_SUBSCRIPTION, getFeaturesFor, daysRemaining, formatVND } from "@/mocks/subscription";
import "./SubscriptionBanner.scss";

type BannerKind = "trial_urgent" | "trial_warn" | "trial_expired" | "canceled" | "quota_critical" | "quota_warn" | "past_due";
type Banner = { kind: BannerKind; severity: "critical" | "warning" | "info"; message: React.ReactNode; cta: string } | null;

// localStorage key để user dismiss banner trong session
const DISMISS_KEY = "mh-banner-dismissed-v1";

function computeBanner(): Banner {
  const sub = MOCK_SUBSCRIPTION; // TODO: replace với useSubscription() hook khi có API
  const features = getFeaturesFor(sub.plan);

  // 1. Trial đã hết (status = expired hoặc trialEndsAt đã qua)
  if (sub.plan === "trial" && sub.trialEndsAt && new Date(sub.trialEndsAt) < new Date()) {
    return {
      kind: "trial_expired",
      severity: "critical",
      message: <>Bản dùng thử đã hết hạn. Chọn gói để tiếp tục tạo AI note, gửi Zalo và các tính năng Pro.</>,
      cta: "Chọn gói ngay →",
    };
  }

  // 2. Trial sắp hết ≤7 ngày
  if (sub.plan === "trial" && sub.trialEndsAt) {
    const days = daysRemaining(sub.trialEndsAt);
    if (days <= 3 && days > 0) {
      return {
        kind: "trial_urgent",
        severity: "critical",
        message: <>Bản dùng thử còn <strong>{days} ngày</strong>. Nâng cấp trước {new Date(sub.trialEndsAt).toLocaleDateString("vi-VN")} để không mất quyền dùng các tính năng Pro.</>,
        cta: "Nâng cấp ngay →",
      };
    }
    if (days <= 7 && days > 3) {
      return {
        kind: "trial_warn",
        severity: "warning",
        message: <>Bản dùng thử còn <strong>{days} ngày</strong>. Tiết kiệm tới 20% nếu chọn chu kỳ 12 tháng.</>,
        cta: "Xem các gói →",
      };
    }
  }

  // 3. Past due — thanh toán thất bại
  if (sub.status === "past_due") {
    return {
      kind: "past_due",
      severity: "critical",
      message: <>Thanh toán chu kỳ mới <strong>thất bại</strong>. Cập nhật phương thức thanh toán để không bị gián đoạn dịch vụ.</>,
      cta: "Cập nhật thanh toán →",
    };
  }

  // 4. Đã huỷ gia hạn — sắp hết kỳ
  if (sub.status === "canceled_at_period_end") {
    const days = daysRemaining(sub.currentPeriodEnd);
    if (days <= 14) {
      return {
        kind: "canceled",
        severity: "warning",
        message: <>Gói sẽ hết hạn sau <strong>{days} ngày</strong> ({new Date(sub.currentPeriodEnd).toLocaleDateString("vi-VN")}). Bật lại gia hạn để giữ toàn bộ tính năng và dữ liệu.</>,
        cta: "Bật lại gia hạn →",
      };
    }
  }

  // 5. Quota đã vượt — critical
  const aiPct = features.aiSessions > 0 ? (sub.usage.aiSessionsUsed / features.aiSessions) * 100 : 0;
  const zaloPct = features.zaloMessages > 0 ? (sub.usage.zaloSent / features.zaloMessages) * 100 : 0;
  const maxPct = Math.max(aiPct, zaloPct);

  if (aiPct >= 100) {
    return {
      kind: "quota_critical",
      severity: "critical",
      message: <>Đã dùng hết <strong>{sub.usage.aiSessionsUsed}/{features.aiSessions}</strong> buổi AI note tháng này. Nâng cấp để tạo thêm ghi chú buổi học mới.</>,
      cta: "Nâng cấp ngay →",
    };
  }
  if (zaloPct >= 100) {
    return {
      kind: "quota_critical",
      severity: "critical",
      message: <>Đã dùng hết <strong>{sub.usage.zaloSent}/{features.zaloMessages}</strong> tin Zalo tháng này. Học viên có thể bỏ lỡ nhắc lịch.</>,
      cta: "Nâng cấp ngay →",
    };
  }

  // 6. Quota sắp hết ≥80%
  if (maxPct >= 80) {
    return {
      kind: "quota_warn",
      severity: "warning",
      message: <>Đã dùng <strong>{Math.round(maxPct)}%</strong> quota tháng này. Cân nhắc nâng cấp để tránh gián đoạn.</>,
      cta: "Xem gói cao hơn →",
    };
  }

  return null;
}

export default function SubscriptionBanner() {
  const location = useLocation();
  const [banner, setBanner] = useState<Banner>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Load dismissed list from sessionStorage (per tab session, không persist)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DISMISS_KEY);
      if (raw) setDismissed(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Re-compute mỗi khi route đổi hoặc mount
  useEffect(() => {
    setBanner(computeBanner());
  }, [location.pathname]);

  // Chỉ hiện banner trên MH admin routes, không hiện trên /portal, /login
  const onMHRoute = location.pathname.startsWith("/mh");
  if (!onMHRoute || !banner) return null;

  // Critical không cho dismiss
  const canDismiss = banner.severity !== "critical";
  if (canDismiss && dismissed.includes(banner.kind)) return null;

  const dismiss = () => {
    const next = [...dismissed, banner.kind];
    setDismissed(next);
    try { sessionStorage.setItem(DISMISS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  return (
    <div className={"mh-sub-banner mh-sub-banner--" + banner.severity}>
      <div className="mh-sub-banner__inner">
        <span className="mh-sub-banner__icon">
          {banner.severity === "critical" ? "⚠" : banner.severity === "warning" ? "⚡" : "ℹ"}
        </span>
        <span className="mh-sub-banner__text">{banner.message}</span>
        <Link to="/mh/settings?section=subscription" className="mh-sub-banner__cta">
          {banner.cta}
        </Link>
        {canDismiss && (
          <button className="mh-sub-banner__close" onClick={dismiss} aria-label="Ẩn thông báo">✕</button>
        )}
      </div>
    </div>
  );
}
