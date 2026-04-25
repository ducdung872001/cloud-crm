// Public portal layout — không có CRM sidebar, no login requirement.
// Header tối giản, footer với brand + share CTA.
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./portal.scss";

interface Props { children: React.ReactNode; }

export default function PortalLayout({ children }: Props) {
  const location = useLocation();
  return (
    <div className="pt">
      <header className="pt-header">
        <div className="pt-header__inner">
          <Link to="/portal" className="pt-header__brand">
            <span className="pt-header__mark">◐</span>
            <span className="pt-header__word">MentorHub</span>
          </Link>
          <nav className="pt-header__nav">
            <Link to="/portal" className={location.pathname === "/portal" ? "is-active" : ""}>Khoá học</Link>
            <Link to="/portal/mentors" className={location.pathname.startsWith("/portal/mentors") ? "is-active" : ""}>Mentor</Link>
            <Link to="/portal/about" className={location.pathname === "/portal/about" ? "is-active" : ""}>Về chúng tôi</Link>
          </nav>
          <div className="pt-header__cta">
            <Link to="/login" className="pt-btn pt-btn--ghost">Mentor đăng nhập</Link>
          </div>
        </div>
      </header>

      <main className="pt-main">{children}</main>

      <footer className="pt-footer">
        <div className="pt-footer__inner">
          <div>
            <div className="pt-footer__brand">◐ MentorHub · Reborn</div>
            <div className="pt-footer__tag">Nền tảng đào tạo 1:1 cho mentor chuyên môn cao.</div>
          </div>
          <div className="pt-footer__cols">
            <div>
              <div className="pt-footer__h">Cho học viên</div>
              <Link to="/portal">Tìm khoá học</Link>
              <Link to="/portal/mentors">Tìm mentor</Link>
              <a href="#">Câu hỏi thường gặp</a>
            </div>
            <div>
              <div className="pt-footer__h">Cho mentor</div>
              <Link to="/login">Trở thành mentor</Link>
              <Link to="/login">Đăng nhập</Link>
              <a href="#">Tại sao MentorHub</a>
            </div>
            <div>
              <div className="pt-footer__h">Liên hệ</div>
              <a href="mailto:hello@mentorhub.vn">hello@mentorhub.vn</a>
              <a href="tel:+842838123456">(028) 3812 3456</a>
            </div>
          </div>
        </div>
        <div className="pt-footer__copy">© 2026 Reborn JSC · Mentorhub.vn</div>
      </footer>
    </div>
  );
}
