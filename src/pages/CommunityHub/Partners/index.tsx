// [CH] Community Hub - Đối tác KOL/KOC/PO module
import React, { useState } from "react";
import { MOCK_PARTNERS } from "@/mocks/community-hub/partners";
import { formatCurrency } from "reborn-util";
import { showToast } from "@/utils/common";
import "./index.scss";

type Partner = (typeof MOCK_PARTNERS)[number];

export default function PartnersPage() {
  document.title = "Đối tác (KOL/PO)";
  const [activeTab, setActiveTab] = useState<"all" | "KOL" | "KOC" | "PO">("all");
  const [detailPartner, setDetailPartner] = useState<Partner | null>(null);
  const [payPartner, setPayPartner] = useState<Partner | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

  const filteredPartners = activeTab === "all"
    ? MOCK_PARTNERS
    : MOCK_PARTNERS.filter((p) => p.role === activeTab);

  const handlePay = () => {
    if (payPartner) {
      showToast(`Đã thanh toán ${payAmount || formatCurrency(payPartner.commission_this_month_vnd, ".", "")}đ hoa hồng cho ${payPartner.name}`, "info");
      setPayPartner(null);
      setPayAmount("");
      setPayNote("");
    }
  };

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
                <div className="avatar-placeholder">{partner.name.charAt(0)}</div>
              </div>
              <div className="partner-info">
                <h3>{partner.name}</h3>
                <span className={`role-badge role-${partner.role.toLowerCase()}`}>{partner.role}</span>
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
                <span className="stat-value">{formatCurrency(partner.commission_this_month_vnd, ".", "")}đ</span>
              </div>
            </div>

            <div className="partner-card__footer">
              <button className="btn-detail" onClick={() => setDetailPartner(partner)}>Xem chi tiết</button>
              <button className="btn-pay" onClick={() => { setPayPartner(partner); setPayAmount(String(partner.commission_this_month_vnd)); }}>Thanh toán HH</button>
            </div>
          </div>
        ))}

        <div className="partner-card partner-card--add">
          <div className="add-content">
            <span className="add-icon">+</span>
            <span>Thêm đối tác</span>
          </div>
        </div>
      </div>

      {/* ── Modal Chi tiết đối tác ── */}
      {detailPartner && (
        <div className="ch-modal-overlay" onClick={() => setDetailPartner(null)}>
          <div className="ch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ch-modal__header">
              <h3>Chi tiết đối tác</h3>
              <button className="btn-close" onClick={() => setDetailPartner(null)}>✕</button>
            </div>
            <div className="ch-modal__body">
              <div className="detail-profile">
                <div className="detail-avatar">{detailPartner.name.charAt(0)}</div>
                <div>
                  <h3>{detailPartner.name}</h3>
                  <span className={`role-badge role-${detailPartner.role.toLowerCase()}`}>{detailPartner.role}</span>
                  <span className="area-label">{detailPartner.area}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông tin hợp tác</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Tỷ lệ hoa hồng</span>
                    <span className="value">{(detailPartner.commission_rate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Hoa hồng tháng này</span>
                    <span className="value accent">{formatCurrency(detailPartner.commission_this_month_vnd, ".", "")}đ</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Thành viên giới thiệu</span>
                    <span className="value">{detailPartner.referrals} TV</span>
                  </div>
                  {detailPartner.courses_created > 0 && (
                    <div className="detail-item">
                      <span className="label">Khóa học đã tạo</span>
                      <span className="value">{detailPartner.courses_created}</span>
                    </div>
                  )}
                  {detailPartner.total_students > 0 && (
                    <div className="detail-item">
                      <span className="label">Tổng học viên</span>
                      <span className="value">{detailPartner.total_students}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Lịch sử thanh toán hoa hồng</h4>
                <table className="detail-table">
                  <thead>
                    <tr><th>Tháng</th><th>Số tiền</th><th>Trạng thái</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>04/2026</td><td>{formatCurrency(detailPartner.commission_this_month_vnd, ".", "")}đ</td><td><span className="status pending">Chờ thanh toán</span></td></tr>
                    <tr><td>03/2026</td><td>{formatCurrency(Math.round(detailPartner.commission_this_month_vnd * 0.9), ".", "")}đ</td><td><span className="status paid">Đã thanh toán</span></td></tr>
                    <tr><td>02/2026</td><td>{formatCurrency(Math.round(detailPartner.commission_this_month_vnd * 0.7), ".", "")}đ</td><td><span className="status paid">Đã thanh toán</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Thanh toán hoa hồng ── */}
      {payPartner && (
        <div className="ch-modal-overlay" onClick={() => setPayPartner(null)}>
          <div className="ch-modal ch-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="ch-modal__header">
              <h3>Thanh toán hoa hồng</h3>
              <button className="btn-close" onClick={() => setPayPartner(null)}>✕</button>
            </div>
            <div className="ch-modal__body">
              <div className="pay-partner-info">
                <div className="detail-avatar sm">{payPartner.name.charAt(0)}</div>
                <div>
                  <strong>{payPartner.name}</strong>
                  <span className={`role-badge role-${payPartner.role.toLowerCase()}`}>{payPartner.role}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Số tiền thanh toán (VNĐ)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                />
                <p className="form-hint">Hoa hồng tháng này: <strong>{formatCurrency(payPartner.commission_this_month_vnd, ".", "")}đ</strong></p>
              </div>

              <div className="form-group">
                <label>Phương thức</label>
                <div className="pay-methods">
                  <label className="pay-method active"><input type="radio" name="method" defaultChecked /> Chuyển khoản</label>
                  <label className="pay-method"><input type="radio" name="method" /> Tiền mặt</label>
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  rows={2}
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Ghi chú thanh toán (nếu có)..."
                />
              </div>
            </div>
            <div className="ch-modal__footer">
              <button className="btn-cancel" onClick={() => setPayPartner(null)}>Hủy</button>
              <button className="btn-confirm" onClick={handlePay} disabled={!payAmount || Number(payAmount) <= 0}>
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
