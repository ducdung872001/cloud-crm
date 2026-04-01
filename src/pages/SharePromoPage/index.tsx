import React, { useEffect, useState } from "react";
import { getSearchParameters } from "reborn-util";
import { urlsApi } from "configs/urls";
import "./index.scss";

interface PromoInfo {
  id?: number;
  name?: string;
  promotionType?: number;
  discount?: number;
  discountType?: number;
  minAmount?: number;
  startTime?: string;
  endTime?: string;
  status?: number;
  slug?: string;
}

const PROMO_TYPE_LABEL: Record<number, string> = {
  1: "Giảm giá", 2: "Flash Sale", 3: "Sự kiện",
  4: "Sinh nhật", 5: "Theo mùa", 6: "Combo",
};

const STATUS_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: "Chờ duyệt", color: "#b45309", bg: "#fef3c7" },
  1: { label: "Đang diễn ra", color: "#15803d", bg: "#dcfce7" },
  2: { label: "Đã kết thúc", color: "#dc2626", bg: "#fee2e2" },
  3: { label: "Tạm dừng", color: "#6b7280", bg: "#f3f4f6" },
};

function formatMoney(n?: number) {
  if (!n) return "0";
  return new Intl.NumberFormat("vi-VN").format(n);
}

function formatDate(d?: string) {
  if (!d) return "--";
  try {
    return new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return d; }
}

function countdownTo(end?: string): string {
  if (!end) return "";
  const diff = new Date(end).getTime() - Date.now();
  if (diff <= 0) return "Đã kết thúc";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `Còn ${d} ngày ${h} giờ`;
  if (h > 0) return `Còn ${h} giờ ${m} phút`;
  return `Còn ${m} phút`;
}

export default function SharePromoPage() {
  const params: any = getSearchParameters();
  const slug = params?.slug ?? "";

  const [promo, setPromo]       = useState<PromoInfo | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }

    fetch(`${urlsApi.promotionalProgram.share}?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(res => {
        if (res?.code === 0 && res?.result?.id) {
          setPromo(res.result);
          document.title = `${res.result.name} – Khuyến mãi Reborn`;
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Cập nhật countdown mỗi giây
  useEffect(() => {
    if (!promo?.endTime) return;
    setCountdown(countdownTo(promo.endTime));
    const t = setInterval(() => setCountdown(countdownTo(promo.endTime)), 60000);
    return () => clearInterval(t);
  }, [promo?.endTime]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sp-shell">
        <div className="sp-loading">
          <div className="sp-spinner" />
          <p>Đang tải chương trình khuyến mãi...</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────
  if (notFound || !promo) {
    return (
      <div className="sp-shell">
        <div className="sp-notfound">
          <div className="sp-notfound__icon">🎁</div>
          <h2>Không tìm thấy chương trình khuyến mãi</h2>
          <p>Chương trình có thể đã kết thúc hoặc đường dẫn không hợp lệ.</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[promo.status ?? 0] ?? STATUS_CONFIG[0];
  const isFlashSale = promo.promotionType === 2;

  return (
    <div className="sp-shell">
      <div className={`sp-card${isFlashSale ? " sp-card--flash" : ""}`}>

        {/* ── Badge loại KM ── */}
        <div className="sp-card__type-badge">
          {PROMO_TYPE_LABEL[promo.promotionType ?? 1] ?? "Khuyến mãi"}
        </div>

        {/* ── Header ── */}
        <div className="sp-card__header">
          <div className="sp-card__icon">{isFlashSale ? "⚡" : "🎉"}</div>
          <h1 className="sp-card__name">{promo.name}</h1>
          <span className="sp-card__status" style={{ color: statusInfo.color, background: statusInfo.bg }}>
            {statusInfo.label}
          </span>
        </div>

        {/* ── Discount highlight ── */}
        <div className="sp-discount">
          <span className="sp-discount__label">Giảm</span>
          <span className="sp-discount__value">
            {promo.discountType === 1
              ? `${promo.discount}%`
              : `${formatMoney(promo.discount)}đ`}
          </span>
        </div>

        {/* ── Info rows ── */}
        <div className="sp-info">
          {(promo.minAmount ?? 0) > 0 && (
            <div className="sp-info__row">
              <span className="sp-info__label">Đơn tối thiểu</span>
              <span className="sp-info__val">{formatMoney(promo.minAmount)}đ</span>
            </div>
          )}
          <div className="sp-info__row">
            <span className="sp-info__label">Thời gian</span>
            <span className="sp-info__val">
              {formatDate(promo.startTime)} – {formatDate(promo.endTime)}
            </span>
          </div>
          {countdown && promo.status === 1 && (
            <div className="sp-info__row sp-info__row--countdown">
              <span className="sp-info__label">⏳</span>
              <span className="sp-info__val sp-info__val--countdown">{countdown}</span>
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="sp-cta">
          <button className="sp-cta__copy" onClick={handleCopy}>
            {copied ? "✓ Đã copy link!" : "📋 Copy link chia sẻ"}
          </button>
          <p className="sp-cta__hint">Chia sẻ ưu đãi này cho bạn bè!</p>
        </div>

        {/* ── Footer ── */}
        <div className="sp-footer">
          <span>Powered by</span>
          <strong>Reborn Retail CRM</strong>
        </div>
      </div>
    </div>
  );
}
