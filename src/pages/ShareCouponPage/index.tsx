import React, { useEffect, useState } from "react";
import { getSearchParameters } from "reborn-util";
import { urlsApi } from "configs/urls";
import "./index.scss";

interface CouponInfo {
  id?: number;
  code?: string;
  discountType?: number;
  discountValue?: number;
  minOrder?: number;
  maxUses?: number;
  usedCount?: number;
  expiryDate?: string;
  status?: number;
  description?: string;
}

const DISCOUNT_TYPE: Record<number, string> = {
  1: "Phần trăm",
  2: "Số tiền cố định",
  3: "Miễn phí ship",
};

const STATUS_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: "Chờ duyệt",   color: "#b45309", bg: "#fef3c7" },
  1: { label: "Đang phát hành", color: "#15803d", bg: "#dcfce7" },
  2: { label: "Đã hết hạn",  color: "#dc2626", bg: "#fee2e2" },
  3: { label: "Tạm dừng",    color: "#6b7280", bg: "#f3f4f6" },
};

function formatMoney(n?: number) {
  if (!n && n !== 0) return "0";
  return new Intl.NumberFormat("vi-VN").format(n);
}

function formatDate(d?: string) {
  if (!d) return "--";
  try {
    // "2026-12-31" → "31/12/2026"
    return d.substring(0, 10).split("-").reverse().join("/");
  } catch { return d; }
}

export default function ShareCouponPage() {
  const params: any = getSearchParameters();
  const code = params?.code ?? "";

  const [coupon, setCoupon]     = useState<CouponInfo | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!code) { setNotFound(true); setLoading(false); return; }

    fetch(`${urlsApi.couponProgram.share}?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(res => {
        if (res?.code === 0 && res?.result?.id) {
          setCoupon(res.result);
          document.title = `Mã giảm giá ${res.result.code} – Reborn Retail`;
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  const copyCode = () => {
    if (!coupon?.code) return;
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sc-shell">
        <div className="sc-loading">
          <div className="sc-spinner" />
          <p>Đang tải mã giảm giá...</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────
  if (notFound || !coupon) {
    return (
      <div className="sc-shell">
        <div className="sc-notfound">
          <div className="sc-notfound__icon">🏷️</div>
          <h2>Mã giảm giá không tồn tại</h2>
          <p>Mã có thể đã hết hạn, bị thu hồi, hoặc đường dẫn không hợp lệ.</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[coupon.status ?? 0] ?? STATUS_CONFIG[0];
  const usedPct = (coupon.maxUses ?? 0) > 0
    ? Math.min(100, Math.round(((coupon.usedCount ?? 0) / coupon.maxUses!) * 100))
    : 0;
  const isFreeShip = coupon.discountType === 3;

  return (
    <div className="sc-shell">
      <div className={`sc-card${isFreeShip ? " sc-card--ship" : ""}`}>

        {/* ── Header dải màu ── */}
        <div className="sc-card__header">
          <div className="sc-card__header-icon">{isFreeShip ? "🚚" : "🏷️"}</div>
          <div className="sc-card__header-label">
            {isFreeShip ? "Miễn phí ship" : DISCOUNT_TYPE[coupon.discountType ?? 1]}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="sc-card__body">
          {/* Code box — click để copy */}
          <div className="sc-code-box" onClick={copyCode} title="Nhấn để copy mã">
            <span className="sc-code-box__label">Mã giảm giá</span>
            <span className="sc-code-box__code">{coupon.code}</span>
            <span className="sc-code-box__hint">
              {codeCopied ? "✓ Đã copy!" : "Nhấn để copy"}
            </span>
          </div>

          {/* Discount value */}
          <div className="sc-discount">
            <span className="sc-discount__prefix">Giảm</span>
            <span className="sc-discount__value">
              {coupon.discountType === 1
                ? `${coupon.discountValue}%`
                : coupon.discountType === 3
                ? "Miễn ship"
                : `${formatMoney(coupon.discountValue)}đ`}
            </span>
          </div>

          {/* Status */}
          <div className="sc-status-row">
            <span className="sc-status"
              style={{ color: statusInfo.color, background: statusInfo.bg }}>
              {statusInfo.label}
            </span>
          </div>

          {/* Info */}
          <div className="sc-info">
            {(coupon.minOrder ?? 0) > 0 && (
              <div className="sc-info__row">
                <span>Đơn tối thiểu</span>
                <span>{formatMoney(coupon.minOrder)}đ</span>
              </div>
            )}
            <div className="sc-info__row">
              <span>Hạn sử dụng</span>
              <span>{formatDate(coupon.expiryDate)}</span>
            </div>
            {(coupon.maxUses ?? 0) > 0 && (
              <div className="sc-info__row">
                <span>Đã dùng</span>
                <span>{coupon.usedCount}/{coupon.maxUses} lượt</span>
              </div>
            )}
          </div>

          {/* Progress bar sử dụng */}
          {(coupon.maxUses ?? 0) > 0 && (
            <div className="sc-progress">
              <div className="sc-progress__bar">
                <div className="sc-progress__fill" style={{ width: `${usedPct}%` }} />
              </div>
              <span className="sc-progress__label">Đã dùng {usedPct}%</span>
            </div>
          )}

          {/* Description */}
          {coupon.description && (
            <p className="sc-desc">{coupon.description}</p>
          )}

          {/* CTA buttons */}
          <div className="sc-cta">
            <button className="sc-cta__primary" onClick={copyCode}>
              {codeCopied ? "✓ Đã copy mã!" : "📋 Copy mã giảm giá"}
            </button>
            <button className="sc-cta__secondary" onClick={copyLink}>
              {linkCopied ? "✓ Đã copy link!" : "🔗 Chia sẻ link này"}
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="sc-footer">
          <span>Powered by</span>
          <strong>Reborn Retail CRM</strong>
        </div>
      </div>
    </div>
  );
}
