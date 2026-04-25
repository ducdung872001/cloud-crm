// [CH] Community Hub - Lưu trú module
// TODO: wire up real API. Mock chỉ seed khi bật "Xem trước".
import React, { useState } from "react";
import { MOCK_ROOMS } from "@/mocks/community-hub/accommodation";
import { ComingSoonBlock, PreviewBanner } from "../_shared/ComingSoon";
import { showToast } from "@/utils/common";
import "./index.scss";

type Room = (typeof MOCK_ROOMS)[number];
type Bed = Room["beds"][number];

export default function AccommodationPage() {
  document.title = "Lưu trú";
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const enterPreview = () => {
    setIsPreview(true);
    showToast("Đang ở chế độ xem trước với dữ liệu demo", "info");
  };
  const exitPreview = () => { setIsPreview(false); setSelectedRoom(null); setSelectedBed(null); };

  const rooms = isPreview ? MOCK_ROOMS : [];
  const getOccupiedCount = (room: Room) => room.beds.filter((b) => b.status === "occupied").length;

  if (!isPreview) {
    return (
      <div className="ch-accommodation-page">
        <div className="ch-accommodation-page__header">
          <h2>Quản lý lưu trú</h2>
        </div>
        <ComingSoonBlock
          title="Chưa có phòng lưu trú nào"
          description="Khai báo phòng và giường để bắt đầu quản lý ở lại qua đêm cho thành viên."
          onPreview={enterPreview}
        />
      </div>
    );
  }

  return (
    <div className="ch-accommodation-page">
      <PreviewBanner onExit={exitPreview} />
      <div className="ch-accommodation-page__header">
        <h2>Quản lý lưu trú</h2>
      </div>

      {/* Room overview grid */}
      <div className="ch-accommodation-page__rooms">
        {rooms.map((room) => {
          const occupied = getOccupiedCount(room);
          const occupancyRate = Math.round((occupied / room.capacity) * 100);
          return (
            <div
              key={room.id}
              className={`room-card ${selectedRoom?.id === room.id ? "active" : ""}`}
              onClick={() => { setSelectedRoom(room); setSelectedBed(null); }}
            >
              <div className="room-card__header">
                <h3>{room.name}</h3>
                <span className={`gender-badge ${room.gender}`}>
                  {room.gender === "male" ? "♂ Nam" : "♀ Nữ"}
                </span>
              </div>
              <div className="room-card__stats">
                <div className="occupancy-bar">
                  <div className="occupancy-bar__fill" style={{ width: `${occupancyRate}%` }} />
                </div>
                <span className="occupancy-text">
                  {occupied}/{room.capacity} đang ở
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room detail - bed grid */}
      {selectedRoom && (
        <div className="ch-accommodation-page__detail">
          <h3>{selectedRoom.name} - Chi tiết giường</h3>
          <div className="bed-grid">
            {selectedRoom.beds.map((bed) => (
              <div
                key={bed.bed_no}
                className={`bed-card ${bed.status} ${selectedBed?.bed_no === bed.bed_no ? "selected" : ""}`}
                onClick={() => setSelectedBed(bed)}
              >
                <div className="bed-number">#{bed.bed_no}</div>
                <div className="bed-status-icon">
                  {bed.status === "occupied" ? "🛏️" : "✅"}
                </div>
                {bed.member && (
                  <div className="bed-member-name">{bed.member.name}</div>
                )}
                {!bed.member && (
                  <div className="bed-available">Trống</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bed detail sidebar */}
      {selectedBed && selectedBed.member && (
        <div className="ch-accommodation-page__bed-detail">
          <h4>Thông tin giường #{selectedBed.bed_no}</h4>
          <div className="bed-detail-info">
            <div className="info-row">
              <span className="label">Thành viên:</span>
              <span className="value">{selectedBed.member.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Mã TV:</span>
              <span className="value">{selectedBed.member.id}</span>
            </div>
            <div className="info-row">
              <span className="label">Ngày nhận:</span>
              <span className="value">{selectedBed.member.checkin}</span>
            </div>
            <div className="info-row">
              <span className="label">Ngày trả:</span>
              <span className="value">{selectedBed.member.checkout}</span>
            </div>
          </div>
          <div className="bed-detail-actions">
            <button className="btn-extend">Gia hạn</button>
            <button className="btn-checkout">Trả phòng</button>
          </div>
        </div>
      )}

      {selectedBed && !selectedBed.member && (
        <div className="ch-accommodation-page__bed-detail">
          <h4>Giường #{selectedBed.bed_no} - Trống</h4>
          <div className="bed-detail-actions">
            <button className="btn-assign">Nhận phòng mới</button>
          </div>
        </div>
      )}
    </div>
  );
}
