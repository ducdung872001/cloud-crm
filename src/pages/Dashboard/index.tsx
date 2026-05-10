import React from "react";
import { Link } from "react-router-dom";
import "./index.scss";

// Reborn Super Admin Dashboard — placeholder mock data.
// Khi BE Platform Service deploy + endpoint /metrics ready, wire vào API thật.
// Spec: docs/platform-service/05-API-Spec.md (Phase 4 — Platform Reporting)

const STATS = [
  { code: "tenant_active",   label: "Tenant đang hoạt động",  value: 252, delta: "+8 trong 30 ngày", color: "#0F766E", bg: "#CCFBF1", icon: "🏢" },
  { code: "tenant_pending",  label: "Tenant chờ phê duyệt",   value: 7,   delta: "+3 hôm nay",        color: "#92400E", bg: "#FEF3C7", icon: "⏳" },
  { code: "tenant_expired",  label: "Tenant sắp hết hạn ≤30d", value: 14,  delta: "Cần hành động",     color: "#9A3412", bg: "#FFEDD5", icon: "📅" },
  { code: "user_total",      label: "Tổng người dùng",         value: 3842, delta: "+124 trong 30 ngày", color: "#1E40AF", bg: "#DBEAFE", icon: "👥" },
  { code: "package_active",  label: "Gói dịch vụ đang bán",   value: 18,  delta: "5 gói trial+free",  color: "#6B21A8", bg: "#F3E8FF", icon: "🎁" },
  { code: "app_published",   label: "App đã phát hành",        value: 5,   delta: "13 editions",       color: "#0E7490", bg: "#CFFAFE", icon: "📦" },
];

const TENANT_BY_INDUSTRY = [
  { industry: "Spa & Thẩm mỹ",    count: 124, percent: 49.2 },
  { industry: "Bất động sản",      count: 47,  percent: 18.7 },
  { industry: "Giáo dục",          count: 38,  percent: 15.1 },
  { industry: "Y tế",              count: 21,  percent: 8.3 },
  { industry: "Bán lẻ",            count: 12,  percent: 4.8 },
  { industry: "Khác",              count: 10,  percent: 3.9 },
];

const RECENT_TENANTS = [
  { id: 999, name: "Công ty BĐS TNPM",     subdomain: "tnpm",     industry: "Bất động sản", joined: "2 giờ trước",  package: "Trial 14d" },
  { id: 998, name: "Spa Dr.Lena",          subdomain: "drlena",   industry: "Spa & Thẩm mỹ", joined: "5 giờ trước",  package: "Premium" },
  { id: 997, name: "Trường mầm non ABC",   subdomain: "abc-edu",  industry: "Giáo dục",     joined: "Hôm qua",      package: "Free" },
  { id: 996, name: "Phòng khám Đa khoa X", subdomain: "phongkhx", industry: "Y tế",         joined: "2 ngày trước", package: "Trial 14d" },
  { id: 995, name: "Cửa hàng Y",           subdomain: "shopy",    industry: "Bán lẻ",       joined: "3 ngày trước", package: "Basic" },
];

const EXPIRING_SOON = [
  { id: 12, name: "Spa Aurora",        subdomain: "aurora",    daysLeft: 3,  package: "Premium" },
  { id: 35, name: "TNTech Beauty",     subdomain: "tntech",    daysLeft: 7,  package: "Gold" },
  { id: 48, name: "MentorHub",         subdomain: "mentor",    daysLeft: 12, package: "Premium" },
  { id: 67, name: "Spa Bella",         subdomain: "bella",     daysLeft: 18, package: "Basic" },
  { id: 89, name: "Học viện EduHub",   subdomain: "eduhub",    daysLeft: 25, package: "Premium" },
];

export default function SuperadminDashboard() {
  document.title = "Trang chủ — Reborn Super Admin";

  return (
    <div className="superadmin-dashboard">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Tổng quan nền tảng</h1>
          <p className="dash-subtitle">Trạng thái hệ sinh thái Reborn — cập nhật mọi 5 phút</p>
        </div>
        <div className="dash-meta">
          <span className="dash-meta-item">⏱ Cập nhật lần cuối: vừa xong</span>
        </div>
      </div>

      <div className="dash-banner-mock">
        ⚠️ Đang dùng <strong>mock data</strong> — Platform Service chưa deploy. Khi BE ready sẽ wire vào endpoint <code>GET /api/v1/internal/platform/metrics</code> (Phase 4).
      </div>

      {/* Stat cards */}
      <div className="dash-stats">
        {STATS.map((s) => (
          <div key={s.code} className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="dash-stat-body">
              <div className="dash-stat-label">{s.label}</div>
              <div className="dash-stat-value">{s.value.toLocaleString("vi-VN")}</div>
              <div className="dash-stat-delta">{s.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Tenant by industry */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2>Tenant theo lĩnh vực</h2>
            <Link to="/organization" className="dash-link">Xem tất cả →</Link>
          </div>
          <div className="dash-bars">
            {TENANT_BY_INDUSTRY.map((row) => (
              <div key={row.industry} className="dash-bar-row">
                <div className="dash-bar-label">{row.industry}</div>
                <div className="dash-bar-track">
                  <div className="dash-bar-fill" style={{ width: `${row.percent}%` }} />
                </div>
                <div className="dash-bar-value">
                  <strong>{row.count}</strong> <span className="dash-muted">({row.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tenants */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2>Tenant mới onboard</h2>
            <Link to="/organization?sortedBy=newest" className="dash-link">Xem tất cả →</Link>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Tổ chức</th>
                <th>Lĩnh vực</th>
                <th>Gói</th>
                <th className="dash-text-right">Tham gia</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TENANTS.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="dash-tenant-name">{t.name}</div>
                    <div className="dash-tenant-sub">{t.subdomain}.reborn.vn</div>
                  </td>
                  <td>{t.industry}</td>
                  <td><span className="dash-tag">{t.package}</span></td>
                  <td className="dash-text-right dash-muted">{t.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expiring soon */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2>Sắp hết hạn (≤30 ngày)</h2>
            <Link to="/extension_list" className="dash-link">Quản lý gia hạn →</Link>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Tổ chức</th>
                <th>Gói hiện tại</th>
                <th className="dash-text-right">Còn lại</th>
              </tr>
            </thead>
            <tbody>
              {EXPIRING_SOON.map((t) => {
                const urgent = t.daysLeft <= 7;
                return (
                  <tr key={t.id}>
                    <td>
                      <div className="dash-tenant-name">{t.name}</div>
                      <div className="dash-tenant-sub">{t.subdomain}.reborn.vn</div>
                    </td>
                    <td>{t.package}</td>
                    <td className="dash-text-right">
                      <span className={`dash-pill ${urgent ? "dash-pill-danger" : "dash-pill-warning"}`}>
                        {t.daysLeft} ngày
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div className="dash-panel dash-panel-quick">
          <div className="dash-panel-header">
            <h2>Thao tác nhanh</h2>
          </div>
          <div className="dash-quick-grid">
            <Link to="/organization" className="dash-quick-item">
              <div className="dash-quick-icon" style={{ background: "#CCFBF1", color: "#0F766E" }}>🏢</div>
              <div>
                <div className="dash-quick-title">Tổ chức</div>
                <div className="dash-quick-desc">Xem + thêm tenant</div>
              </div>
            </Link>
            <Link to="/user" className="dash-quick-item">
              <div className="dash-quick-icon" style={{ background: "#DBEAFE", color: "#1E40AF" }}>👥</div>
              <div>
                <div className="dash-quick-title">Người dùng</div>
                <div className="dash-quick-desc">Audit cross-tenant</div>
              </div>
            </Link>
            <Link to="/app_management" className="dash-quick-item">
              <div className="dash-quick-icon" style={{ background: "#CFFAFE", color: "#0E7490" }}>📦</div>
              <div>
                <div className="dash-quick-title">Ứng dụng</div>
                <div className="dash-quick-desc">App + edition</div>
              </div>
            </Link>
            <Link to="/package_manage" className="dash-quick-item">
              <div className="dash-quick-icon" style={{ background: "#F3E8FF", color: "#6B21A8" }}>🎁</div>
              <div>
                <div className="dash-quick-title">Gói dịch vụ</div>
                <div className="dash-quick-desc">Pricing + permission</div>
              </div>
            </Link>
            <Link to="/field_management" className="dash-quick-item">
              <div className="dash-quick-icon" style={{ background: "#FEF3C7", color: "#92400E" }}>🏷️</div>
              <div>
                <div className="dash-quick-title">Lĩnh vực</div>
                <div className="dash-quick-desc">Industry catalog</div>
              </div>
            </Link>
            <Link to="/resource_management" className="dash-quick-item">
              <div className="dash-quick-icon" style={{ background: "#FEE2E2", color: "#991B1B" }}>🔐</div>
              <div>
                <div className="dash-quick-title">Tài nguyên</div>
                <div className="dash-quick-desc">Resource + permission</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
