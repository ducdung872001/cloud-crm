import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div className="auth-logo">R</div>
        <div className="auth-hero">AI-SDLC pipeline cho agency hiện đại.</div>
        <div className="auth-hero-sub">
          Reborn Forge đóng gói workflow 7 giai đoạn — từ khảo sát, URD, prototype, code, QA đến bàn giao — với AI agent làm việc song song cùng team.
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
