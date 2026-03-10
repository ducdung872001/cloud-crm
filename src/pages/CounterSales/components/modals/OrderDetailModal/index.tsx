import React, { Fragment, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import "./index.scss";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  onConfirm: () => void;
}

const TIMELINE = [
  { icon: "✅", label: "Tạo đơn", done: true, active: false },
  { icon: "⏳", label: "Chờ XL", done: false, active: true },
  { icon: "🚚", label: "Đang giao", done: false, active: false },
  { icon: "✅", label: "Hoàn thành", done: false, active: false },
];

const ORDER_ITEMS = [
  { icon: "🥛", name: "Sữa TH True Milk 1L", detail: "2 hộp × 32,000 ₫", total: "64,000 ₫" },
  { icon: "🍜", name: "Mì Hảo Hảo Tôm Chua", detail: "5 gói × 4,500 ₫", total: "22,500 ₫" },
  { icon: "🥤", name: "Pepsi 330ml", detail: "3 lon × 12,000 ₫", total: "36,000 ₫" },
];

export default function OrderDetailModal({ open, onClose, onPrint, onConfirm }: OrderDetailModalProps) {
  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: onClose,
          },
          {
            title: "🧾 In biên lai",
            color: "primary",
            variant: "outline",
            callback: onPrint,
          },
          {
            title: "✅ Xác nhận đơn hàng",
            color: "primary",
            callback: onConfirm,
          },
        ],
      },
    }),
    [onClose, onPrint, onConfirm]
  );

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={onClose} className="order-detail-modal">
      <ModalHeader
        title={
          <Fragment>
            <div>📋 Chi tiết đơn hàng</div>
            <div className="order-detail-modal__code">#DH-20231021-0042</div>
          </Fragment>
        }
        toggle={onClose}
        rightElement={<span className="badge bd-orange">⏳ Chờ xử lý</span>}
      />

      <ModalBody>
        {/* Timeline */}
        <div className="od-timeline">
          {TIMELINE.map((step, i) => (
            <Fragment key={i}>
              <div className="od-timeline__step">
                <div
                  className={["od-timeline__dot", step.done ? "od-timeline__dot--done" : "", step.active ? "od-timeline__dot--active" : ""]
                    .join(" ")
                    .trim()}
                >
                  {step.icon}
                </div>
                <div
                  className={["od-timeline__label", step.done ? "od-timeline__label--done" : "", step.active ? "od-timeline__label--active" : ""]
                    .join(" ")
                    .trim()}
                >
                  {step.label}
                </div>
              </div>
              {i < TIMELINE.length - 1 && <div className={`od-timeline__line${step.done ? " od-timeline__line--done" : ""}`} />}
            </Fragment>
          ))}
        </div>

        {/* Info panels */}
        <div className="od-panels">
          <div className="od-panel">
            <div className="od-panel__title">Khách hàng</div>
            <div className="od-panel__name">Nguyễn Thị Hoa</div>
            <div className="od-panel__sub">0901 234 567</div>
            <div className="od-panel__sub">⭐ 2,450 điểm · Hạng Bạc</div>
          </div>
          <div className="od-panel">
            <div className="od-panel__title">Thông tin đơn</div>
            <div className="od-panel__sub">
              Nguồn: <b>🏪 Tại quầy</b>
            </div>
            <div className="od-panel__sub">
              TT: <b>💵 Tiền mặt</b>
            </div>
            <div className="od-panel__sub">
              Tạo lúc: <b>09:45 · 21/10</b>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="od-items">
          <div className="od-items__header">
            <span>Sản phẩm</span>
            <span>Thành tiền</span>
          </div>
          {ORDER_ITEMS.map((item, i) => (
            <div key={i} className="od-items__row">
              <span className="od-items__icon">{item.icon}</span>
              <div className="od-items__info">
                <div className="od-items__name">{item.name}</div>
                <div className="od-items__detail">{item.detail}</div>
              </div>
              <div className="od-items__total">{item.total}</div>
            </div>
          ))}
          <div className="od-items__grand">
            <span>TỔNG CỘNG</span>
            <span className="od-items__grand-val">122,500 ₫</span>
          </div>
        </div>
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
