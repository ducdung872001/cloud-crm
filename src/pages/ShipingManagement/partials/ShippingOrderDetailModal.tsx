import React, { Fragment, useEffect, useState } from "react";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import { showToast } from "utils/common";
import ShippingService from "services/ShippingService";
import { IShippingOrderResponse } from "model/shipping/ShippingResponseModel";

// ─── Interface mới theo cấu trúc API ────────────────────────────────────────

interface ITrackingTimelineItem {
  statusCode: string;       // "DRAFT", "SUBMITTED", "IN_TRANSIT", ...
  statusLabel: string;      // "Đơn vừa được tạo trên hệ thống"
  description?: string;     // "Đơn vừa được tạo trên hệ thống"
  location?: string;        // "Bưu cục Q.Tân Bình, TP.HCM"
  eventTime?: string;       // "2026-02-26T04:01:07" — đổi từ timestamp
  rawCarrierStatus?: string;
}

interface ITrackingResult {
  shipmentOrder: string;
  carrierName: string;
  carrierTrackingCode: string;
  currentStatus: string;          // "DELIVERED"
  currentStatusLabel: string;     // "Giao thành công"
  colorHex?: string;              // "#4CAF50"
  timeline: ITrackingTimelineItem[];
}

interface Props {
  onShow: boolean;
  data?: IShippingOrderResponse;
  onHide: () => void;
  onReload: () => void;
}

// ─── Thứ tự hiển thị timeline chuẩn ─────────────────────────────────────────
// Các status này khớp với statusCode trả về từ API (uppercase)
const NORMAL_STEPS = [
  { code: "DRAFT",            label: "Đơn hàng được tạo" },
  { code: "SUBMITTED",        label: "Đã gửi lên hãng vận chuyển" },
  { code: "WAITING_PICKUP",   label: "Chờ lấy hàng" },
  { code: "PICKED_UP",        label: "Đã lấy hàng" },
  { code: "IN_TRANSIT",       label: "Đang vận chuyển" },
  { code: "OUT_FOR_DELIVERY", label: "Đang giao hàng" },
  { code: "DELIVERED",        label: "Giao hàng thành công" },
];

const RETURN_STEPS = [
  { code: "DRAFT",            label: "Đơn hàng được tạo" },
  { code: "SUBMITTED",        label: "Đã gửi lên hãng vận chuyển" },
  { code: "WAITING_PICKUP",   label: "Chờ lấy hàng" },
  { code: "PICKED_UP",        label: "Đã lấy hàng" },
  { code: "IN_TRANSIT",       label: "Đang vận chuyển" },
  { code: "OUT_FOR_DELIVERY", label: "Đang giao hàng" },
  { code: "FAILED_DELIVERY",  label: "Giao hàng thất bại" },
  { code: "WAITING_RETURN",   label: "Chờ hoàn hàng" },
  { code: "RETURNING",        label: "Đang hoàn hàng" },
  { code: "RETURNED",         label: "Hoàn hàng thành công" },
];

// Các status cuối luồng hoàn
const RETURN_STATUSES = new Set([
  "FAILED_DELIVERY", "WAITING_RETURN", "RETURNING", "RETURNED",
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Badge màu dựa trên colorHex từ API, fallback theo status */
function getStatusBadgeStyle(currentStatus: string, colorHex?: string): React.CSSProperties {
  if (colorHex) {
    return {
      background: `${colorHex}22`,
      color: colorHex,
      border: `1px solid ${colorHex}55`,
    };
  }
  // Fallback
  const map: Record<string, React.CSSProperties> = {
    DELIVERED:   { background: "#d1fae5", color: "#065f46" },
    RETURNED:    { background: "#fee2e2", color: "#b91c1c" },
    CANCELLED:   { background: "#f3f4f6", color: "#6b7280" },
    IN_TRANSIT:  { background: "#dbeafe", color: "#1d4ed8" },
    OUT_FOR_DELIVERY: { background: "#ede9fe", color: "#6d28d9" },
  };
  return map[currentStatus] ?? { background: "#f3f4f6", color: "#374151" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShippingOrderDetailModal({ onShow, data, onHide, onReload }: Props) {
  const [trackingResult, setTrackingResult] = useState<ITrackingResult | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "tracking">("tracking");

  useEffect(() => {
    if (onShow && data) {
      setTrackingResult(null);
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

  if (!data) return null;

  const currentStatus = (
    trackingResult?.currentStatus ?? data.statusCode ?? ""
  ).toUpperCase();

  const isReturnFlow = RETURN_STATUSES.has(currentStatus);
  const steps = isReturnFlow ? RETURN_STEPS : NORMAL_STEPS;

  // Build map: statusCode → timeline item (đã xảy ra)
  const timelineMap: Record<string, ITrackingTimelineItem> = {};
  (trackingResult?.timeline ?? []).forEach((item) => {
    timelineMap[item.statusCode.toUpperCase()] = item;
  });

  // Tìm index của step hiện tại trong danh sách steps
  const currentStepIdx = steps.findIndex((s) => s.code === currentStatus);

  // ── Render timeline ──────────────────────────────────────────────────────────
  const renderTimeline = () => (
    <div className="tracking-timeline">

      {/* Carrier header */}
      {trackingResult && (
        <div className="tracking-header">
          <div className="carrier-logo-wrap">
            <Icon name="Truck" />
          </div>
          <div className="carrier-info">
            <span className="carrier-name">{trackingResult.carrierName}</span>
            <span className="carrier-tracking-code">{trackingResult.carrierTrackingCode}</span>
          </div>
          <span
            className="current-status-badge"
            style={getStatusBadgeStyle(currentStatus, trackingResult.colorHex)}
          >
            {trackingResult.currentStatusLabel}
          </span>
        </div>
      )}

      {steps.map((step, idx) => {
        const timelineItem = timelineMap[step.code];
        const isCompleted = idx < currentStepIdx;
        const isActive    = idx === currentStepIdx;
        const isFuture    = idx > currentStepIdx;

        return (
          <div
            key={step.code}
            className={`timeline-item ${isFuture ? "future" : ""}`}
          >
            {/* Dot */}
            <div className={`timeline-dot ${isActive ? "active" : isFuture ? "future" : "past"}`}>
              {!isFuture && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="5" fill="white" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="timeline-content">
              <div className={`status-label ${isActive ? "active" : ""}`}>
                {/* Luôn dùng label tiếng Việt cố định — tránh hiện raw status code từ API */}
                {step.label}
              </div>

              {/* Mô tả chi tiết (mới từ API) */}
              {timelineItem?.description && (
                <div className="timeline-description">
                  {timelineItem.description.replace(
                    /DRAFT|SUBMITTED|WAITING_PICKUP|PICKED_UP|IN_TRANSIT|OUT_FOR_DELIVERY|DELIVERED|FAILED_DELIVERY|WAITING_RETURN|RETURNING|RETURNED|CANCELLED/g,
                    (code: string) => ({
                      DRAFT:            "Nháp",
                      SUBMITTED:        "Chờ duyệt",
                      WAITING_PICKUP:   "Chờ lấy hàng",
                      PICKED_UP:        "Đã lấy hàng",
                      IN_TRANSIT:       "Đang vận chuyển",
                      OUT_FOR_DELIVERY: "Đang giao hàng",
                      DELIVERED:        "Giao thành công",
                      FAILED_DELIVERY:  "Giao thất bại",
                      WAITING_RETURN:   "Chờ hoàn hàng",
                      RETURNING:        "Đang hoàn hàng",
                      RETURNED:         "Đã hoàn hàng",
                      CANCELLED:        "Đã hủy",
                    } as Record<string, string>)[code] ?? code
                  )}
                </div>
              )}

              {/* Thời gian + địa điểm — dùng eventTime thay vì timestamp */}
              {timelineItem?.eventTime ? (
                <div className="timestamp">
                  {moment(timelineItem.eventTime).format("HH:mm - DD/MM/YYYY")}
                  {timelineItem.location ? ` · ${timelineItem.location}` : ""}
                </div>
              ) : isFuture ? (
                <div className="timestamp">—</div>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Shipper card khi đang giao */}
      {(currentStatus === "IN_TRANSIT" || currentStatus === "OUT_FOR_DELIVERY") && (
        <div className="shipper-info">
          <div className="shipper-avatar">
            <Icon name="User" />
          </div>
          <div className="shipper-name">Tài xế: Đang phân công</div>
        </div>
      )}
    </div>
  );

  // ── Render thông tin đơn ─────────────────────────────────────────────────────
  const renderInfo = () => (
    <div className="order-info-grid">
      <div className="info-row">
        <span className="info-label">Mã vận đơn</span>
        <span className="info-value tracking-bold">
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
          <span className="info-value">
            {data.lengthCm} × {data.widthCm} × {data.heightCm} cm
          </span>
        </div>
      )}
      <div className="info-row">
        <span className="info-label">Tiền thu hộ (COD)</span>
        <span className="info-value cod-highlight">
          {(data.codAmount ?? 0) > 0
            ? `${formatCurrency(+data.codAmount)} đ`
            : "Không thu hộ"}
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

  // ── Render ───────────────────────────────────────────────────────────────────
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
            <span className="detail-tracking-code">
              #{data.carrierTrackingCode || data.shipmentOrder}
            </span>
          </Fragment>
        }
        toggle={onHide}
      />

      <ModalBody>
        {/* Tab switcher */}
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
            <div className="tracking-loading">Đang tải lộ trình...</div>
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