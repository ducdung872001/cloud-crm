import React, { Fragment, useEffect, useState } from "react";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import { showToast } from "utils/common";
import ShippingService from "services/ShippingService";
import { IShippingOrderResponse, ITrackingTimelineItem, ITrackingResult } from "model/shipping/ShippingResponseModel";

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
  const [trackingResult, setTrackingResult] = useState<ITrackingResult | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "tracking">("tracking");

  useEffect(() => {
    if (onShow && data) {
      loadTracking(data.shipmentOrder);
      setActiveTab("tracking");
    }
  }, [onShow, data]);

  const loadTracking = async (shipmentOrder: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await ShippingService.tracking(shipmentOrder);
      if (res.code === 0) {
        setTrackingResult(res.result as ITrackingResult);
      } else {
        showToast(res.message ?? "Không thể tải lịch sử vận chuyển", "warning");
      }
    } catch {
      showToast("Lỗi kết nối khi tải lịch sử vận chuyển", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCallShipper = () => {
    showToast("Chưa có thông tin shipper", "warning");
  };

  if (!data) return null;

  // Ưu tiên dùng currentStatus từ API tracking, fallback về statusCode từ danh sách
  const currentStatus = trackingResult?.currentStatus
    ? trackingResult.currentStatus.toLowerCase()
    : data.statusCode?.toLowerCase() ?? "";

  const isReturned = currentStatus === "returned" || currentStatus === "failed";
  const steps = isReturned ? RETURNED_STEPS : ALL_STEPS;
  const currentStepIdx = getStepIndex(currentStatus);

  // ---- Render tracking timeline ----
  const renderTimeline = () => {
    // Map timeline API theo status để tra cứu nhanh
    const timelineMap: Record<string, ITrackingTimelineItem> = {};
    (trackingResult?.timeline ?? []).forEach((item) => {
      timelineMap[item.status.toLowerCase()] = item;
    });

    return (
      <div className="tracking-timeline">

        {/* Header: tên hãng + mã vận đơn hãng từ API */}
        {trackingResult && (
          <div className="tracking-header">
            <div className="carrier-logo-wrap">
              <Icon name="Truck" />
            </div>
            <div className="carrier-info">
              <span className="carrier-name">{trackingResult.carrierName}</span>
              <span className="carrier-tracking-code">{trackingResult.carrierTrackingCode}</span>
            </div>
            <span className="current-status-badge">
              {trackingResult.currentStatusLabel}
            </span>
          </div>
        )}

        {steps.map((step, idx) => {
          const isPast = idx < currentStepIdx;
          const isActive = step.status === currentStatus || idx === currentStepIdx;
          const isFuture = idx > currentStepIdx;
          const timelineItem = timelineMap[step.status];

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
                  {timelineItem?.statusName || step.label}
                </div>
                {timelineItem?.timestamp && (
                  <div className="timestamp">
                    {moment(timelineItem.timestamp).format("HH:mm - DD/MM/YYYY")}
                    {timelineItem.location ? `, ${timelineItem.location}` : ""}
                  </div>
                )}
                {isFuture && <div className="timestamp">—</div>}
              </div>
            </div>
          );
        })}

        {/* Shipper info (chỉ hiện khi đang giao) */}
        {currentStatus === "in_transit" && (
          <div className="shipper-info">
            <div className="shipper-avatar">
              <Icon name="User" />
            </div>
            <div className="shipper-name">
              Tài xế: Đang phân công
            </div>
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
        <span className="info-value">
          {trackingResult?.carrierTrackingCode || data.carrierTrackingCode || data.shipmentOrder}
        </span>
      </div>
      <div className="info-row">
        <span className="info-label">Hãng vận chuyển</span>
        <span className="info-value">{trackingResult?.carrierName || data.carrierName}</span>
      </div>
      {data.orderCode && (
        <div className="info-row">
          <span className="info-label">Đơn hàng bán</span>
          <span className="info-value">{data.orderCode}</span>
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
        <span className="info-value">{data.weightGram} gram</span>
      </div>
      {(data.widthCm || data.heightCm || data.lengthCm) && (
        <div className="info-row">
          <span className="info-label">Kích thước</span>
          <span className="info-value">{data.lengthCm} x {data.widthCm} x {data.heightCm} cm</span>
        </div>
      )}
      <div className="info-row">
        <span className="info-label">Tiền thu hộ (COD)</span>
        <span className="info-value cod-highlight">
          {(data.codAmount ?? 0) > 0 ? `${formatCurrency(+data.codAmount)} đ` : "Không thu hộ"}
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
          {data.createdAt ? moment(data.createdAt).format("HH:mm DD/MM/YYYY") : "—"}
        </span>
      </div>
      {data.noteForShipper && (
        <div className="info-row">
          <span className="info-label">Ghi chú</span>
          <span className="info-value">{data.noteForShipper}</span>
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
            <span className="detail-tracking-code"> #{data.carrierTrackingCode || data.shipmentOrder}</span>
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