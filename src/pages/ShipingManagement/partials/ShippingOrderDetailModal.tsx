import React, { Fragment, useEffect, useState } from "react";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import { showToast } from "utils/common";
import { IShippingOrderResponse, IShippingTrackingHistoryResponse } from "model/shipping/ShippingResponseModel";
import { mockGetTrackingHistory } from "../ShippingMockData"; // TODO: thay bằng ShippingService

interface Props {
  onShow: boolean;
  data?: IShippingOrderResponse;
  onHide: () => void;
  onReload: () => void;
}

// ---- Tất cả bước có thể có trong hành trình ----
const ALL_STEPS = [
  { status: "pending",    label: "Đơn hàng được tạo" },
  { status: "picked_up",  label: "Đã lấy hàng" },
  { status: "in_transit", label: "Đơn hàng đang được giao" },
  { status: "delivered",  label: "Giao hàng thành công" },
];

const RETURNED_STEPS = [
  { status: "pending",    label: "Đơn hàng được tạo" },
  { status: "picked_up",  label: "Đã lấy hàng" },
  { status: "in_transit", label: "Đang giao" },
  { status: "failed",     label: "Giao hàng thất bại" },
  { status: "returned",   label: "Hoàn hàng" },
];

// ---- Thứ tự status để xác định step hiện tại ----
const STATUS_ORDER = ["pending", "picked_up", "in_transit", "delivered", "failed", "returned"];

function getStepIndex(status: string): number {
  return STATUS_ORDER.indexOf(status);
}

export default function ShippingOrderDetailModal({ onShow, data, onHide, onReload }: Props) {
  const [trackingHistory, setTrackingHistory] = useState<IShippingTrackingHistoryResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "tracking">("tracking");

  useEffect(() => {
    if (onShow && data) {
      loadTracking(data.id);
      setActiveTab("tracking");
    }
  }, [onShow, data]);

  const loadTracking = async (id: number) => {
    setIsLoadingHistory(true);
    await new Promise((r) => setTimeout(r, 250));
    // TODO: const res = await ShippingService.getTrackingHistory(id);
    const res = mockGetTrackingHistory(id);
    if (res.code === 0) {
      setTrackingHistory(res.result.items as IShippingTrackingHistoryResponse[]);
    }
    setIsLoadingHistory(false);
  };

  const handleCallShipper = () => {
    if (data?.shipperPhone) {
      window.location.href = `tel:${data.shipperPhone}`;
    } else {
      showToast("Chưa có thông tin shipper", "warning");
    }
  };

  if (!data) return null;

  const isReturned = data.status === "returned" || data.status === "failed";
  const steps = isReturned ? RETURNED_STEPS : ALL_STEPS;
  const currentStepIdx = getStepIndex(data.status);

  // ---- Render tracking timeline ----
  const renderTimeline = () => {
    // Ghép history vào steps: nếu có history thực thì dùng, ngược lại dùng step placeholder
    const historyMap: Record<string, IShippingTrackingHistoryResponse> = {};
    trackingHistory.forEach((h) => { historyMap[h.status] = h; });

    return (
      <div className="tracking-timeline">
        {steps.map((step, idx) => {
          const isPast = idx < currentStepIdx;
          const isActive = step.status === data.status || idx === currentStepIdx;
          const isFuture = idx > currentStepIdx;
          const historyItem = historyMap[step.status];

          return (
            <div
              key={step.status}
              className={`timeline-item ${isFuture ? "future" : ""}`}
            >
              <div className={`timeline-dot ${isActive ? "active" : isFuture ? "future" : "past"}`}>
                {(isPast || isActive) && !isFuture && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="5" fill="white" />
                  </svg>
                )}
              </div>

              <div className="timeline-content">
                <div className={`status-label ${isActive ? "active" : ""}`}>
                  {historyItem?.statusName || step.label}
                </div>
                {historyItem?.timestamp && (
                  <div className="timestamp">
                    {moment(historyItem.timestamp).format("HH:mm - DD/MM/YYYY")}
                    {historyItem.location ? `, ${historyItem.location}` : ""}
                  </div>
                )}
                {isFuture && <div className="timestamp">—</div>}
              </div>
            </div>
          );
        })}

        {/* Shipper info (chỉ hiện khi đang giao) */}
        {data.status === "in_transit" && (
          <div className="shipper-info">
            <div className="shipper-avatar">
              <Icon name="User" />
            </div>
            <div className="shipper-name">
              Tài xế: {data.shipperName || "Đang phân công"}
            </div>
            <button className="btn-call" onClick={handleCallShipper} title="Gọi điện">
              <Icon name="Phone" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ---- Render thông tin đơn hàng ----
  const renderInfo = () => (
    <div className="order-info-grid">
      <div className="info-row">
        <span className="info-label">Mã vận đơn</span>
        <span className="info-value tracking-bold">{data.trackingCode}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Hãng vận chuyển</span>
        <span className="info-value">{data.partnerName}</span>
      </div>
      {data.salesOrderCode && (
        <div className="info-row">
          <span className="info-label">Đơn hàng bán</span>
          <span className="info-value">{data.salesOrderCode}</span>
        </div>
      )}
      <div className="info-row">
        <span className="info-label">Người nhận</span>
        <span className="info-value">{data.receiverName}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Số điện thoại</span>
        <span className="info-value">{data.receiverPhone}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Địa chỉ</span>
        <span className="info-value">{data.receiverAddress}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Trọng lượng</span>
        <span className="info-value">{data.weight} gram</span>
      </div>
      {(data.width || data.height || data.length) && (
        <div className="info-row">
          <span className="info-label">Kích thước</span>
          <span className="info-value">{data.length} x {data.width} x {data.height} cm</span>
        </div>
      )}
      <div className="info-row">
        <span className="info-label">Tiền thu hộ (COD)</span>
        <span className="info-value cod-highlight">
          {data.codAmount > 0 ? `${formatCurrency(+data.codAmount)} đ` : "Không thu hộ"}
        </span>
      </div>
      {data.shippingFee > 0 && (
        <div className="info-row">
          <span className="info-label">Phí vận chuyển</span>
          <span className="info-value">{formatCurrency(+data.shippingFee)} đ</span>
        </div>
      )}
      <div className="info-row">
        <span className="info-label">Ngày tạo</span>
        <span className="info-value">
          {data.createdTime ? moment(data.createdTime).format("HH:mm DD/MM/YYYY") : "—"}
        </span>
      </div>
      {data.note && (
        <div className="info-row">
          <span className="info-label">Ghi chú</span>
          <span className="info-value">{data.note}</span>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={onShow}
      className="modal-shipping-detail"
      isFade
      staticBackdrop
      toggle={onHide}
      isCentered
    >
      <ModalHeader
        title={
          <Fragment>
            Chi tiết đơn vận chuyển
            <span className="detail-tracking-code"> #{data.trackingCode}</span>
          </Fragment>
        }
        toggle={onHide}
      />
      <ModalBody>

        {/* Tab switcher: Lộ trình | Thông tin */}
        <div className="detail-tabs">
          <button
            className={`detail-tab-btn ${activeTab === "tracking" ? "active" : ""}`}
            onClick={() => setActiveTab("tracking")}
          >
            <Icon name="MapPin" /> Lộ trình
          </button>
          <button
            className={`detail-tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <Icon name="Info" /> Thông tin đơn
          </button>
        </div>

        {activeTab === "tracking" ? (
          isLoadingHistory ? (
            <div className="tracking-loading">Đang tải lịch sử...</div>
          ) : (
            renderTimeline()
          )
        ) : (
          renderInfo()
        )}

      </ModalBody>
    </Modal>
  );
}
