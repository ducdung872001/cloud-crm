// [CH] Community Hub - Dịch vụ & Booking module
import React, { useState } from "react";
import { MOCK_SERVICES, MOCK_BOOKING_SLOTS } from "@/mocks/community-hub/services";
import { MOCK_SCAN_RESULT } from "@/mocks/community-hub/checkin";
import "./index.scss";

export default function ServiceBookingPage() {
  document.title = "Dịch vụ & Booking";
  const [activeTab, setActiveTab] = useState<"deduct" | "booking">("deduct");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("");

  const handleDeductQuota = () => {
    if (selectedService && selectedMember) {
      alert(`Đã trừ quota dịch vụ ${selectedService} cho thành viên!`);
      setSelectedService(null);
      setSelectedMember("");
    }
  };

  return (
    <div className="ch-service-page">
      <div className="ch-service-page__header">
        <h2>Dịch vụ & Booking</h2>
        <div className="tab-switch">
          <button className={activeTab === "deduct" ? "active" : ""} onClick={() => setActiveTab("deduct")}>
            Trừ quota
          </button>
          <button className={activeTab === "booking" ? "active" : ""} onClick={() => setActiveTab("booking")}>
            Đặt lịch
          </button>
        </div>
      </div>

      {activeTab === "deduct" && (
        <div className="ch-service-page__deduct">
          {/* Member search */}
          <div className="deduct-step">
            <h3>1. Chọn thành viên</h3>
            <input
              type="text"
              placeholder="Tìm thành viên (tên, SĐT, mã TV)..."
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="member-search"
            />
            {selectedMember && (
              <div className="member-preview">
                <div className="member-preview__avatar">{MOCK_SCAN_RESULT.name.charAt(0)}</div>
                <div className="member-preview__info">
                  <strong>{MOCK_SCAN_RESULT.name}</strong>
                  <span>Gói {MOCK_SCAN_RESULT.plan} | Hết hạn: {MOCK_SCAN_RESULT.valid_until}</span>
                </div>
              </div>
            )}
          </div>

          {/* Service selection */}
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

          {/* Confirm */}
          <div className="deduct-step">
            <button
              className="btn-confirm"
              disabled={!selectedService || !selectedMember}
              onClick={handleDeductQuota}
            >
              Xác nhận trừ lượt
            </button>
          </div>
        </div>
      )}

      {activeTab === "booking" && (
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
