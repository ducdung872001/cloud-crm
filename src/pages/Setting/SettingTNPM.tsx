import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ISettingGroup {
  title: string;
  icon: string;
  color: string;
  items: { label: string; desc: string; path: string; badge?: string }[];
}

const SETTING_GROUPS: ISettingGroup[] = [
  {
    title: "Hệ thống & Tổ chức",
    icon: "🏢",
    color: "#1890ff",
    items: [
      { label: "Thông tin tổ chức", desc: "Tên, logo, múi giờ, đơn vị tiền tệ", path: "/setting_basis" },
      { label: "Phân quyền & Nhân sự", desc: "Phòng ban, vai trò, nhân viên", path: "/setting_basis" },
      { label: "Dự án & Danh mục BĐS", desc: "Loại hình BĐS, cấu hình portfolio", path: "/projects" },
    ],
  },
  {
    title: "Hợp đồng & Billing",
    icon: "💳",
    color: "#722ed1",
    items: [
      { label: "Loại phí dịch vụ", desc: "Phí quản lý, điện, nước, gửi xe...", path: "/setting/fee-types" },
      { label: "Phương thức thanh toán", desc: "MSB Pay, chuyển khoản, Timi App", path: "/setting/payment-methods" },
      { label: "Cấu hình billing", desc: "Chu kỳ hóa đơn, ngày hạn TT, nhắc nợ", path: "/setting/billing-config" },
      { label: "Biểu giá & Công thức tính phí", desc: "Đơn giá điện, nước, phí QL theo từng dự án", path: "/setting/billing-rates" },
      { label: "Mẫu hóa đơn", desc: "Template xuất PDF hóa đơn cho KH", path: "/setting_basis", badge: "Soon" },
    ],
  },
  {
    title: "Nhà cung cấp",
    icon: "🏭",
    color: "#13c2c2",
    items: [
      { label: "Loại dịch vụ NCC", desc: "Bảo trì, vệ sinh, an ninh, PCCC...", path: "/setting/vendor-services" },
      { label: "Tiêu chí đánh giá KPI", desc: "Thang điểm, tiêu chí rating NCC", path: "/setting_basis" },
      { label: "Cấu hình 3-Way Match", desc: "Luồng phê duyệt hóa đơn NCC", path: "/setting_basis" },
    ],
  },
  {
    title: "Vận hành & Kỹ thuật",
    icon: "🔧",
    color: "#fa8c16",
    items: [
      { label: "Danh mục yêu cầu DV", desc: "Loại SR: bảo trì, điện, nước, thang máy...", path: "/setting/sr-categories" },
      { label: "SLA & Quy trình xử lý", desc: "Thời gian xử lý theo mức ưu tiên", path: "/setting/sla" },
      { label: "Kế hoạch bảo trì mẫu", desc: "Lịch bảo trì định kỳ theo loại thiết bị", path: "/maintenance-plans" },
    ],
  },
  {
    title: "Thông báo & Tích hợp",
    icon: "🔔",
    color: "#52c41a",
    items: [
      { label: "Cấu hình SMS / Email", desc: "Template nhắc nợ, thông báo SR", path: "/setting_sms" },
      { label: "Tích hợp MSB Pay", desc: "QR code, Virtual Account, Auto-debit", path: "/setting_basis", badge: "API" },
      { label: "App Timi (Tenant App)", desc: "Webhook, push notification", path: "/setting_basis", badge: "API" },
      { label: "Zalo OA", desc: "Kết nối Zalo Official Account", path: "/setting_basis" },
    ],
  },
  {
    title: "Báo cáo & BI",
    icon: "📊",
    color: "#eb2f96",
    items: [
      { label: "Dashboard tùy chỉnh", desc: "Cấu hình widget, KPI hiển thị", path: "/setting_dashboard" },
      { label: "Báo cáo theo dự án", desc: "P&L, công nợ, lấp đầy theo CĐT", path: "/reports" },
      { label: "Xuất dữ liệu", desc: "Excel, PDF theo dự án & kỳ", path: "/reports" },
    ],
  },
];

export default function SettingTNPM() {
  document.title = "Cài đặt – TNPM";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = SETTING_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter(
      (item) =>
        !search ||
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Cài đặt hệ thống</h1>
          <p className="page-sub">TNPM Platform – Cấu hình toàn bộ tham số vận hành</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          className="search-input"
          style={{ width: 380, fontSize: 15, padding: "11px 16px" }}
          placeholder="🔍 Tìm cài đặt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Settings Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 20 }}>
        {filtered.map((group) => (
          <div key={group.title}
            style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
            {/* Group header */}
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #f0f0f0",
              display: "flex", alignItems: "center", gap: 12,
              borderLeft: `4px solid ${group.color}`,
            }}>
              <span style={{ fontSize: 22 }}>{group.icon}</span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{group.title}</h3>
            </div>

            {/* Items */}
            <div style={{ padding: "8px 0" }}>
              {group.items.map((item) => (
                <div key={item.label}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 20px", cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a2e", marginBottom: 2 }}>
                      {item.label}
                      {item.badge && (
                        <span style={{
                          marginLeft: 8, padding: "1px 8px", borderRadius: 10,
                          background: item.badge === "API" ? "#e6f7ff" : "#fff7e6",
                          color: item.badge === "API" ? "#1890ff" : "#fa8c16",
                          fontSize: 10, fontWeight: 600,
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>{item.desc}</div>
                  </div>
                  <span style={{ color: "#d9d9d9", fontSize: 18 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Version info */}
      <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "#bfbfbf" }}>
        TNPM CRM Platform v1.0.0-alpha &nbsp;|&nbsp; Built on Reborn CRM &nbsp;|&nbsp; © 2026 TNPM – ROX Key
      </div>
    </div>
  );
}