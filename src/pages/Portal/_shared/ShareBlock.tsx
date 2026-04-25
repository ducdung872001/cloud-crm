// Viral share block — used on course detail, success page, mentor profile.
// Responsibilities: Zalo, Facebook, Telegram, Copy link, Email share, native share if available.
// UTM params baked in for referral tracking.
import React, { useState } from "react";

interface Props {
  url: string;
  title: string;
  text?: string;
  referralReward?: string; // VD: "Bạn và người được mời cùng được giảm 10% khoá tiếp theo"
  eyebrow?: string;
  variant?: "full" | "compact";
  utmSource?: string;
}

export default function ShareBlock({
  url,
  title,
  text,
  referralReward = "Bạn được +500 điểm thưởng khi có người đăng ký qua link của bạn. Người được mời giảm 10% khoá đầu.",
  eyebrow = "CHIA SẺ · LAN TOẢ",
  variant = "full",
  utmSource = "share",
}: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${url}${url.includes("?") ? "&" : "?"}utm_source=${utmSource}&utm_medium=share`;
  const enc = encodeURIComponent;

  const shareZalo = `https://zalo.me/share?u=${enc(fullUrl)}&t=${enc(title)}`;
  const shareFb = `https://www.facebook.com/sharer/sharer.php?u=${enc(fullUrl)}&quote=${enc(text || title)}`;
  const shareTg = `https://t.me/share/url?url=${enc(fullUrl)}&text=${enc(title)}`;
  const shareEmail = `mailto:?subject=${enc(title)}&body=${enc((text || title) + "\n\n" + fullUrl)}`;

  const copy = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl });
      } catch {
        // user cancelled
      }
    } else {
      copy();
    }
  };

  if (variant === "compact") {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a href={shareZalo} target="_blank" rel="noopener noreferrer" className="pt-share__btn pt-share__btn--zalo">💬 Zalo</a>
        <a href={shareFb} target="_blank" rel="noopener noreferrer" className="pt-share__btn pt-share__btn--fb">ⓕ Facebook</a>
        <button onClick={copy} className={"pt-share__btn" + (copied ? " pt-share__btn--ok" : " pt-share__btn--copy")}>
          {copied ? "✓ Đã copy" : "🔗 Copy link"}
        </button>
      </div>
    );
  }

  return (
    <div className="pt-share">
      <div className="pt-share__eyebrow">{eyebrow}</div>
      <div className="pt-share__title">Chia sẻ khoá học này</div>
      <p className="pt-share__desc">
        Gửi cho đồng nghiệp hoặc học trò của bạn. Mỗi lần chia sẻ tạo cơ hội mới cho người học — và phần thưởng cho bạn.
      </p>
      <div className="pt-share__buttons">
        <a href={shareZalo} target="_blank" rel="noopener noreferrer" className="pt-share__btn pt-share__btn--zalo">
          💬 Zalo
        </a>
        <a href={shareFb} target="_blank" rel="noopener noreferrer" className="pt-share__btn pt-share__btn--fb">
          ⓕ Facebook
        </a>
        <a href={shareTg} target="_blank" rel="noopener noreferrer" className="pt-share__btn pt-share__btn--tg">
          ✈ Telegram
        </a>
        <a href={shareEmail} className="pt-share__btn">
          ✉ Email
        </a>
        <button onClick={nativeShare} className="pt-share__btn">📤 Chia sẻ khác…</button>
      </div>
      <div className="pt-share__link-box">
        <input type="text" readOnly className="pt-share__link" value={fullUrl} onFocus={(e) => e.currentTarget.select()} />
        <button onClick={copy} className={"pt-share__btn" + (copied ? " pt-share__btn--ok" : " pt-share__btn--copy")}>
          {copied ? "✓ Đã copy" : "Copy"}
        </button>
      </div>
      <div className="pt-share__reward">
        🎁 <strong>Ưu đãi người giới thiệu:</strong> {referralReward}
      </div>
    </div>
  );
}
