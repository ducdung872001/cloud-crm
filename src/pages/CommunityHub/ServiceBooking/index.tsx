// [CH] Community Hub - Dịch vụ & Booking module (bao gồm Bán thẻ thành viên)
// TODO: wire up real API khi BE sẵn sàng.
// Mặc định hiển thị "Chưa có dữ liệu" + chế độ Xem trước (teaser) dùng MOCK_DATA để minh hoạ.
// State preview không persist — đóng/refresh sẽ quay về "Chưa có dữ liệu".
import React, { useState, useMemo } from "react";
import { MOCK_SERVICES, MOCK_BOOKING_SLOTS } from "@/mocks/community-hub/services";
import { MOCK_SCAN_RESULT } from "@/mocks/community-hub/checkin";
import { MOCK_MEMBERSHIP_PLANS, MOCK_PAYMENT_METHODS } from "@/mocks/community-hub/membership-plans";
import { formatCurrency } from "reborn-util";
import { showToast } from "@/utils/common";
import { ComingSoonBlock, PreviewBanner } from "../_shared/ComingSoon";
import "./index.scss";

type ActiveTab = "sell-card" | "deduct" | "booking";

export default function ServiceBookingPage() {
  document.title = "Dịch vụ & Booking";
  const [activeTab, setActiveTab] = useState<ActiveTab>("sell-card");

  // Chế độ Xem trước — teaser dùng MOCK_DATA. Không persist.
  const [isPreview, setIsPreview] = useState(false);

  // ── Bán thẻ state ──
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSelected, setMemberSelected] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Trừ quota state ──
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");

  const plan = useMemo(
    () => MOCK_MEMBERSHIP_PLANS.find((p) => p.id === selectedPlan),
    [selectedPlan],
  );

  const enterPreview = () => {
    setIsPreview(true);
    showToast("Đang ở chế độ xem trước với dữ liệu demo", "info");
  };

  const exitPreview = () => {
    setIsPreview(false);
    // Reset mọi state đã chọn trong preview
    setMemberSearch("");
    setMemberSelected(false);
    setSelectedPlan(null);
    setSelectedPayment(null);
    setShowConfirm(false);
    setSelectedService(null);
    setServiceSearch("");
  };

  const handleSelectMember = () => {
    if (memberSearch.trim()) setMemberSelected(true);
  };

  const handleConfirmSell = () => {
    showToast(
      `Đã bán thẻ "${plan?.name}" cho ${MOCK_SCAN_RESULT.name} — Giá: ${formatCurrency(plan?.price ?? 0, ".", "")}đ — Thời hạn: ${plan?.duration_months} tháng (dữ liệu demo)`,
      "info",
    );
    setSelectedPlan(null);
    setSelectedPayment(null);
    setMemberSearch("");
    setMemberSelected(false);
    setShowConfirm(false);
  };

  const handleDeductQuota = () => {
    if (selectedService && serviceSearch) {
      showToast("Đã trừ quota dịch vụ cho thành viên! (dữ liệu demo)", "info");
      setSelectedService(null);
      setServiceSearch("");
    }
  };

  const comingSoonByTab: Record<ActiveTab, { title: string; description: string }> = {
    "sell-card": {
      title: "Chưa có dữ liệu bán thẻ",
      description: "Module bán thẻ thành viên chưa sẵn sàng. Dữ liệu gói, thành viên, giao dịch sẽ xuất hiện khi hệ thống đi vào vận hành.",
    },
    deduct: {
      title: "Chưa có dữ liệu trừ quota",
      description: "Chưa có thành viên và dịch vụ nào được đăng ký. Khi có dữ liệu thật, bạn có thể trừ lượt/quota tại đây.",
    },
    booking: {
      title: "Chưa có lịch đặt",
      description: "Các khung giờ booking và trạng thái phòng/dịch vụ sẽ hiển thị tại đây khi module đặt lịch được kích hoạt.",
    },
  };

  return (
    <div className={`ch-service-page${isPreview ? " ch-page--preview" : ""}`}>
      {/* ── Header + Tabs ── */}
      <div className="ch-service-page__header">
        <h2>Dịch vụ & Booking</h2>
        <div className="tab-switch">
          <button className={activeTab === "sell-card" ? "active" : ""} onClick={() => setActiveTab("sell-card")}>
            Bán thẻ thành viên
          </button>
          <button className={activeTab === "deduct" ? "active" : ""} onClick={() => setActiveTab("deduct")}>
            Trừ quota
          </button>
          <button className={activeTab === "booking" ? "active" : ""} onClick={() => setActiveTab("booking")}>
            Đặt lịch
          </button>
        </div>
      </div>

      {/* Preview banner — chỉ xuất hiện khi ở chế độ Xem trước */}
      {isPreview && <PreviewBanner onExit={exitPreview} />}

      {/* ═══════════════ Khi chưa preview: show "Chưa có dữ liệu" ═══════════════ */}
      {!isPreview && (
        <ComingSoonBlock
          title={comingSoonByTab[activeTab].title}
          description={comingSoonByTab[activeTab].description}
          onPreview={enterPreview}
        />
      )}

      {/* ═══════════════ TAB: BÁN THẺ THÀNH VIÊN (POS-style) ═══════════════ */}
      {isPreview && activeTab === "sell-card" && (
        <div className="ch-service-page__sell-card">
          <div className="sell-card-layout">
            {/* ── Bên trái: Danh sách gói ── */}
            <div className="sell-card-plans">
              <h3>Chọn gói thành viên</h3>
              <div className="plans-grid">
                {MOCK_MEMBERSHIP_PLANS.map((p) => (
                  <div
                    key={p.id}
                    className={`plan-card ${selectedPlan === p.id ? "selected" : ""}`}
                    style={{ borderColor: selectedPlan === p.id ? p.color : undefined }}
                    onClick={() => setSelectedPlan(p.id)}
                  >
                    {"popular" in p && p.popular && <span className="plan-badge popular">Phổ biến</span>}
                    {"badge" in p && p.badge && <span className="plan-badge promo">{p.badge as string}</span>}
                    <div className="plan-card__name" style={{ color: p.color }}>{p.name}</div>
                    <div className="plan-card__price">
                      {formatCurrency(p.price, ".", "")}đ
                    </div>
                    <div className="plan-card__duration">
                      {p.duration_months} tháng
                    </div>
                    <p className="plan-card__desc">{p.description}</p>
                    <ul className="plan-card__includes">
                      {p.includes.map((inc, i) => (
                        <li key={i}>
                          <span className="check-icon">✓</span>
                          {inc.service}: <strong>{inc.quota ? `${inc.quota} ${inc.unit}` : inc.unit}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bên phải: Giỏ hàng / Thanh toán (POS style) ── */}
            <div className="sell-card-cart">
              <div className="cart-header">
                <h3>Thanh toán</h3>
              </div>

              {/* Chọn khách */}
              <div className="cart-section">
                <label>Thành viên</label>
                {!memberSelected ? (
                  <div className="cart-member-search">
                    <input
                      type="text"
                      placeholder="Tìm tên, SĐT, mã TV..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSelectMember()}
                    />
                    <button onClick={handleSelectMember} disabled={!memberSearch.trim()}>Tìm</button>
                  </div>
                ) : (
                  <div className="cart-member-info">
                    <div className="member-avatar">{MOCK_SCAN_RESULT.name.charAt(0)}</div>
                    <div className="member-detail">
                      <strong>{MOCK_SCAN_RESULT.name}</strong>
                      <span>Gói hiện tại: {MOCK_SCAN_RESULT.plan}</span>
                    </div>
                    <button className="btn-change" onClick={() => { setMemberSelected(false); setMemberSearch(""); }}>Đổi</button>
                  </div>
                )}
              </div>

              {/* Gói đã chọn */}
              <div className="cart-section">
                <label>Gói đã chọn</label>
                {plan ? (
                  <div className="cart-plan-selected">
                    <div className="cart-plan-name">{plan.name}</div>
                    <div className="cart-plan-meta">{plan.duration_months} tháng</div>
                    <div className="cart-plan-price">{formatCurrency(plan.price, ".", "")}đ</div>
                  </div>
                ) : (
                  <div className="cart-empty">Chưa chọn gói</div>
                )}
              </div>

              {/* Phương thức thanh toán */}
              <div className="cart-section">
                <label>Thanh toán bằng</label>
                <div className="payment-methods">
                  {MOCK_PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      className={`payment-btn ${selectedPayment === pm.id ? "active" : ""}`}
                      onClick={() => setSelectedPayment(pm.id)}
                    >
                      {pm.icon === "cash" && "💵"}
                      {pm.icon === "bank" && "🏦"}
                      {pm.icon === "card" && "💳"}
                      {pm.icon === "momo" && "📱"}
                      <span>{pm.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tổng & Nút xác nhận */}
              <div className="cart-footer">
                <div className="cart-total">
                  <span>TỔNG THANH TOÁN</span>
                  <span className="cart-total-amount">
                    {plan ? `${formatCurrency(plan.price, ".", "")}đ` : "0đ"}
                  </span>
                </div>
                <button
                  className="btn-sell"
                  disabled={!plan || !memberSelected || !selectedPayment}
                  onClick={() => setShowConfirm(true)}
                >
                  Xác nhận bán thẻ
                </button>
              </div>
            </div>
          </div>

          {/* Modal xác nhận */}
          {showConfirm && plan && (
            <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
              <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Xác nhận bán thẻ thành viên</h3>
                <div className="confirm-details">
                  <div className="confirm-row">
                    <span>Thành viên:</span>
                    <strong>{MOCK_SCAN_RESULT.name}</strong>
                  </div>
                  <div className="confirm-row">
                    <span>Gói:</span>
                    <strong>{plan.name}</strong>
                  </div>
                  <div className="confirm-row">
                    <span>Thời hạn:</span>
                    <strong>{plan.duration_months} tháng</strong>
                  </div>
                  <div className="confirm-row">
                    <span>Thanh toán:</span>
                    <strong>{MOCK_PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.name}</strong>
                  </div>
                  <div className="confirm-row total">
                    <span>Tổng tiền:</span>
                    <strong>{formatCurrency(plan.price, ".", "")}đ</strong>
                  </div>
                </div>
                <div className="confirm-actions">
                  <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Hủy</button>
                  <button className="btn-confirm-sell" onClick={handleConfirmSell}>Xác nhận & In hóa đơn</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB: TRỪ QUOTA ═══════════════ */}
      {isPreview && activeTab === "deduct" && (
        <div className="ch-service-page__deduct">
          <div className="deduct-step">
            <h3>1. Chọn thành viên</h3>
            <input
              type="text"
              placeholder="Tìm thành viên (tên, SĐT, mã TV)..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="member-search"
            />
            {serviceSearch && (
              <div className="member-preview">
                <div className="member-preview__avatar">{MOCK_SCAN_RESULT.name.charAt(0)}</div>
                <div className="member-preview__info">
                  <strong>{MOCK_SCAN_RESULT.name}</strong>
                  <span>Gói {MOCK_SCAN_RESULT.plan} | Hết hạn: {MOCK_SCAN_RESULT.valid_until}</span>
                </div>
              </div>
            )}
          </div>

          <div className="deduct-step">
            <h3>2. Chọn dịch vụ</h3>
            <div className="service-grid">
              {MOCK_SERVICES.map((svc) => (
                <div
                  key={svc.id}
                  className={`service-card ${selectedService === svc.id ? "selected" : ""}`}
                  onClick={() => setSelectedService(svc.id)}
                >
                  <div className="service-card__icon">
                    {svc.category === "fnb" && "☕"}
                    {svc.category === "spa" && "💆"}
                    {svc.category === "beauty" && "✂️"}
                    {svc.category === "space" && "🏢"}
                    {svc.category === "wellness" && "🧘"}
                    {svc.category === "utility" && "🧺"}
                  </div>
                  <div className="service-card__name">{svc.name}</div>
                  <div className="service-card__unit">{svc.unit}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="deduct-step">
            <button className="btn-confirm" disabled={!selectedService || !serviceSearch} onClick={handleDeductQuota}>
              Xác nhận trừ lượt
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: ĐẶT LỊCH ═══════════════ */}
      {isPreview && activeTab === "booking" && (
        <div className="ch-service-page__booking">
          <div className="booking-info">
            <h3>Đặt lịch: Massage 60 phút</h3>
            <p className="booking-date">Ngày: {MOCK_BOOKING_SLOTS.date}</p>
          </div>
          <div className="booking-slots">
            {MOCK_BOOKING_SLOTS.slots.map((slot, i) => (
              <div key={i} className={`slot-card ${slot.available ? "available" : "booked"}`}>
                <div className="slot-time">{slot.time}</div>
                <div className="slot-status">
                  {slot.available ? "Trống" : `${slot.booked_by}`}
                </div>
                {slot.available && <button className="slot-book-btn">Đặt</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
