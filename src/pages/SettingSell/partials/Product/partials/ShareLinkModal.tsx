import React, { useEffect, useRef, useState } from "react";
import { showToast } from "utils/common";
import "./ShareLinkModal.scss";

interface ShareLinkModalProps {
  productId: number;
  productName: string;
  productAvatar?: string;
  onClose: () => void;
}

// Tạo slug thuần ASCII từ tên tiếng Việt
const toSlug = (str: string): string =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const buildShareLink = (productId: number, productName: string): string => {
  const slug = toSlug(productName);
  // Dùng public API endpoint — không cần đăng nhập, khách hàng mở được
  // Format: /shop/san-pham/<id>-<slug>
  const origin = window.location.origin;
  return `${origin}/shop/san-pham/${productId}${slug ? `-${slug}` : ""}`;
};

const copyToClipboard = (text: string): Promise<void> => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback cho HTTP (localhost dev)
  return new Promise((resolve) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    resolve();
  });
};

// Vẽ QR code thuần canvas — không cần thư viện ngoài
// Dùng thuật toán QR đơn giản qua Google Charts API (public, không cần key)
function QRCode({ value, size = 160 }: { value: string; size?: number }) {
  const imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=1a1a2e&bgcolor=ffffff&margin=2`;
  return (
    <img
      src={imgSrc}
      alt="QR Code"
      width={size}
      height={size}
      className="share-modal__qr-img"
      onError={(e) => {
        // Fallback nếu không có internet: hiện placeholder
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export default function ShareLinkModal({
  productId,
  productName,
  productAvatar,
  onClose,
}: ShareLinkModalProps) {
  const link = buildShareLink(productId, productName);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Đóng khi click overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Đóng khi nhấn Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await copyToClipboard(link);
      setCopied(true);
      showToast("Đã copy link sản phẩm!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Copy thất bại, vui lòng copy thủ công", "error");
    }
  };

  const shareTargets = [
    {
      name: "Zalo",
      color: "#0068ff",
      icon: (
        <svg viewBox="0 0 40 40" fill="currentColor" width="22" height="22">
          <text x="4" y="28" fontSize="22" fontWeight="bold" fill="currentColor">Z</text>
        </svg>
      ),
      url: `https://zalo.me/share?url=${encodeURIComponent(link)}`,
    },
    {
      name: "Facebook",
      color: "#1877f2",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    },
    {
      name: "Messenger",
      color: "#0084ff",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.18 2 11.33c0 2.87 1.38 5.44 3.56 7.18V22l3.24-1.78c.86.24 1.77.37 2.7.37 5.52 0 10-4.18 10-9.33S17.52 2 12 2zm1.08 12.57l-2.55-2.72-4.97 2.72 5.47-5.81 2.6 2.72 4.92-2.72-5.47 5.81z" />
        </svg>
      ),
      url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(link)}&app_id=0&redirect_uri=${encodeURIComponent(link)}`,
    },
  ];

  return (
    <div className="share-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="share-modal">
        {/* Header */}
        <div className="share-modal__header">
          <div className="share-modal__header-left">
            {productAvatar ? (
              <img src={productAvatar} alt={productName} className="share-modal__product-img" />
            ) : (
              <div className="share-modal__product-img-placeholder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4c9d4" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
            <div>
              <div className="share-modal__label">Chia sẻ sản phẩm</div>
              <div className="share-modal__product-name">{productName}</div>
            </div>
          </div>
          <button className="share-modal__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="share-modal__body">
          {/* QR code */}
          <div className="share-modal__qr-section">
            <QRCode value={link} size={160} />
            <p className="share-modal__qr-hint">Quét QR để mở sản phẩm</p>
          </div>

          {/* Link copy */}
          <div className="share-modal__link-section">
            <div className="share-modal__link-label">Link sản phẩm</div>
            <div className="share-modal__link-row">
              <input
                className="share-modal__link-input"
                readOnly
                value={link}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                className={`share-modal__copy-btn${copied ? " share-modal__copy-btn--copied" : ""}`}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Đã copy
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Chia sẻ mạng xã hội */}
          <div className="share-modal__social-section">
            <div className="share-modal__link-label">Chia sẻ nhanh</div>
            <div className="share-modal__social-row">
              {shareTargets.map((t) => (
                <a
                  key={t.name}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-modal__social-btn"
                  style={{ "--social-color": t.color } as React.CSSProperties}
                  title={`Chia sẻ qua ${t.name}`}
                >
                  <span className="share-modal__social-icon">{t.icon}</span>
                  <span className="share-modal__social-name">{t.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <p className="share-modal__note">
            Link này công khai — bất kỳ ai có link đều có thể xem thông tin sản phẩm.
          </p>
        </div>
      </div>
    </div>
  );
}
