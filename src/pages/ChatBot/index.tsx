// Stub Chatbot từ cloud-crm fork → MH Support sheet.
// Hiển thị khi `isShowChatBot=true` (trigger từ Sidebar "Hỗ trợ & chatbot").
import React, { useContext, useEffect } from "react";
import { UserContext, ContextType } from "contexts/userContext";
import "./support.scss";

const SUPPORT = {
  email: "support@reborn.vn",
  hotline: "1900 2068",
  zaloOA: "https://zalo.me/reborn",
  docs: "https://reborn.vn/help/mentorhub",
};

export default function Chatbot() {
  const { isShowChatBot, setIsShowChatBot } = useContext(UserContext) as ContextType;

  useEffect(() => {
    if (!isShowChatBot) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsShowChatBot(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isShowChatBot, setIsShowChatBot]);

  if (!isShowChatBot) return null;

  return (
    <div className="mh-support" role="dialog" aria-modal="true" aria-label="Hỗ trợ & chatbot">
      <div className="mh-support__backdrop" onClick={() => setIsShowChatBot(false)} />
      <div className="mh-support__sheet">
        <div className="mh-support__head">
          <div>
            <div className="mh-support__kicker">HỖ TRỢ</div>
            <h2>Chúng tôi <em>luôn ở đây</em></h2>
          </div>
          <button
            type="button"
            className="mh-support__close"
            onClick={() => setIsShowChatBot(false)}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <p className="mh-support__lead">
          Có câu hỏi về khoá học, học viên, hoặc tài khoản MentorHub? Chọn kênh phù hợp bên dưới.
        </p>

        <div className="mh-support__list">
          <a className="mh-support__row" href={`mailto:${SUPPORT.email}`}>
            <span className="mh-support__icon">@</span>
            <span className="mh-support__body">
              <span className="mh-support__title">Email</span>
              <span className="mh-support__sub">{SUPPORT.email}</span>
            </span>
            <span className="mh-support__cta">Soạn thư →</span>
          </a>

          <a className="mh-support__row" href={`tel:${SUPPORT.hotline.replace(/\s/g, "")}`}>
            <span className="mh-support__icon">☎</span>
            <span className="mh-support__body">
              <span className="mh-support__title">Hotline</span>
              <span className="mh-support__sub">{SUPPORT.hotline} · 8:00 – 22:00</span>
            </span>
            <span className="mh-support__cta">Gọi ngay →</span>
          </a>

          <a className="mh-support__row" href={SUPPORT.zaloOA} target="_blank" rel="noreferrer">
            <span className="mh-support__icon">Z</span>
            <span className="mh-support__body">
              <span className="mh-support__title">Zalo OA</span>
              <span className="mh-support__sub">Phản hồi nhanh trong giờ hành chính</span>
            </span>
            <span className="mh-support__cta">Mở Zalo →</span>
          </a>

          <a className="mh-support__row" href={SUPPORT.docs} target="_blank" rel="noreferrer">
            <span className="mh-support__icon">?</span>
            <span className="mh-support__body">
              <span className="mh-support__title">Tài liệu hướng dẫn</span>
              <span className="mh-support__sub">FAQ, video, mẹo vận hành</span>
            </span>
            <span className="mh-support__cta">Xem →</span>
          </a>
        </div>

        <div className="mh-support__foot">
          Phản hồi sự cố khẩn cấp qua hotline. Email phản hồi trong vòng 1 ngày làm việc.
        </div>
      </div>
    </div>
  );
}
