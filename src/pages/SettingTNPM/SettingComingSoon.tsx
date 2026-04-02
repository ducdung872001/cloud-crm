import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PAGE_NAMES: Record<string, { title: string; desc: string; icon: string }> = {
  "/setting/payment-methods": { title: "Phương thức thanh toán", desc: "Cấu hình MSB Pay, chuyển khoản, QR Code, App Timi", icon: "💳" },
  "/setting/billing-config":  { title: "Cấu hình Billing", desc: "Chu kỳ hóa đơn, ngày hạn TT, nhắc nợ tự động", icon: "⚙️" },
  "/setting/vendor-services": { title: "Loại dịch vụ NCC", desc: "Bảo trì, vệ sinh, an ninh, PCCC, thang máy...", icon: "🏭" },
  "/setting/sr-categories":   { title: "Danh mục yêu cầu DV", desc: "Phân loại SR: bảo trì, điện, nước, thang máy...", icon: "🔧" },
  "/setting/sla":             { title: "SLA & Quy trình xử lý", desc: "Thời gian xử lý theo mức ưu tiên và loại SR", icon: "⏱️" },
};

export default function SettingComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = PAGE_NAMES[location.pathname] || { title: "Trang cài đặt", desc: "Đang phát triển", icon: "⚙️" };
  document.title = `${page.title} – TNPM`;

  return (
    <div className="tnpm-list-page">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13, color: "#8c8c8c" }}>
        <button onClick={() => navigate("/setting")}
          style={{ border: "none", background: "none", cursor: "pointer", color: "#1890ff", padding: 0, fontSize: 13 }}>
          ⚙️ Cài đặt
        </button>
        <span>›</span>
        <span style={{ color: "#1a1a2e" }}>{page.title}</span>
      </div>

      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>{page.icon}</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>{page.title}</h2>
          <p style={{ fontSize: 14, color: "#8c8c8c", lineHeight: 1.7, marginBottom: 24 }}>{page.desc}</p>
          <div style={{ padding: "14px 20px", background: "#fff7e6", borderRadius: 10, border: "1px solid #ffd591", marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: "#d46b08", marginBottom: 6 }}>🚧 Đang phát triển</div>
            <div style={{ fontSize: 13, color: "#ad6800" }}>
              Tính năng này đang được phát triển và sẽ ra mắt trong <b>Phase 2</b>. Hiện tại bạn có thể cấu hình tạm thời qua các màn hình nghiệp vụ.
            </div>
          </div>
          <button onClick={() => navigate("/setting")}
            className="btn btn-primary">← Quay lại Cài đặt</button>
        </div>
      </div>
    </div>
  );
}
