// [CH] Community Hub - Đối tác KOL/KOC/PO module
import React, { useState } from "react";
import { MOCK_PARTNERS } from "@/mocks/community-hub/partners";
import { formatCurrency } from "reborn-util";
import "./index.scss";

export default function PartnersPage() {
  document.title = "Đối tác (KOL/PO)";
  const [activeTab, setActiveTab] = useState<"all" | "KOL" | "KOC" | "PO">("all");

  const filteredPartners = activeTab === "all"
    ? MOCK_PARTNERS
    : MOCK_PARTNERS.filter((p) => p.role === activeTab);

  return (
    <div className="ch-partners-page">
      <div className="ch-partners-page__header">
        <h2>Đối tác</h2>
        <div className="tab-switch">
          {(["all", "KOL", "KOC", "PO"] as const).map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "Tất cả" : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="ch-partners-page__grid">
        {filteredPartners.map((partner) => (
          <div key={partner.id} className="partner-card">
            <div className="partner-card__header">
              <div className="partner-avatar">
                {partner.avatar ? (
                  <img src={partner.avatar} alt={partner.name} />
                ) : (
                  <div className="avatar-placeholder">{partner.name.charAt(0)}</div>
                )}
              </div>
              <div className="partner-info">
                <h3>{partner.name}</h3>
                <span className={`role-badge role-${partner.role.toLowerCase()}`}>
                  {partner.role}
                </span>
                <span className="area-label">{partner.area}</span>
              </div>
            </div>

            <div className="partner-card__stats">
              {partner.courses_created > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Khóa học tạo:</span>
                  <span className="stat-value">{partner.courses_created}</span>
                </div>
              )}
              {partner.total_students > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Học viên:</span>
                  <span className="stat-value">{partner.total_students}</span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">Giới thiệu:</span>
                <span className="stat-value">{partner.referrals} TV</span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-label">Hoa hồng tháng:</span>
                <span className="stat-value">
                  {formatCurrency(partner.commission_this_month_vnd, ".", "")}đ
                </span>
              </div>
            </div>

            <div className="partner-card__footer">
              <button className="btn-detail">Xem chi tiết</button>
              <button className="btn-pay">Thanh toán HH</button>
            </div>
          </div>
        ))}

        {/* Add partner */}
        <div className="partner-card partner-card--add">
          <div className="add-content">
            <span className="add-icon">+</span>
            <span>Thêm đối tác</span>
          </div>
        </div>
      </div>
    </div>
  );
}
