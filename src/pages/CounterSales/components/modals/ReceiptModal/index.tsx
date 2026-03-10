import React from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { CartItem } from "../../../types";
import { IActionModal } from "model/OtherModel";
import "./index.scss";

interface ReceiptModalProps {
  open: boolean;
  cartItems: CartItem[];
  onClose: () => void;
}

export default function ReceiptModal({ open, cartItems, onClose }: ReceiptModalProps) {
  const total = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
  const paid = 150000;
  const change = Math.max(0, paid - total);
  const fmt = (n: number) => n.toLocaleString("vi") + " ₫";
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Đóng",
          color: "primary",
          variant: "outline",
          callback: onClose,
        },
        {
          title: "📩 Gửi SMS/Zalo",
          color: "primary",
          variant: "outline",
          callback: () => {},
        },
        {
          title: "🖨️ In biên lai",
          color: "primary",
          callback: () => window.print(),
        },
      ],
    },
  };

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={onClose} className="receipt-modal">
      <ModalHeader title="🧾 Biên lai thanh toán" toggle={onClose} />

      <ModalBody>
        <div className="receipt">
          {/* Store header */}
          <div className="receipt__header">
            <div className="receipt__store">🛍️ Cửa hàng Minh Hoa</div>
            <div className="receipt__address">123 Nguyễn Trãi, Quận 1, TP.HCM</div>
            <div className="receipt__contact">📞 0901 234 567 · Giờ mở: 7:00–19:00</div>
            <div className="receipt__meta">
              Biên lai: <b>#DH-20231021-0042</b>
              <br />
              Ngày: {dateStr} · {timeStr} | NV: Minh Hoa
            </div>
          </div>

          {/* Items */}
          <div className="receipt__table">
            <div className="receipt__row receipt__row--header">
              <span className="receipt__col-name">Sản phẩm</span>
              <span className="receipt__col-qty">SL</span>
              <span className="receipt__col-total">Thành tiền</span>
            </div>
            {cartItems.map((item) => (
              <div key={item.id} className="receipt__row">
                <span className="receipt__col-name">{item.name}</span>
                <span className="receipt__col-qty">{item.qty}</span>
                <span className="receipt__col-total">{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="receipt__totals">
            <div className="receipt__totals-row">
              <span>Tạm tính</span>
              <span>{fmt(total)}</span>
            </div>
            <div className="receipt__totals-row">
              <span>Giảm giá</span>
              <span className="receipt__discount">−0 ₫</span>
            </div>
            <div className="receipt__totals-row receipt__totals-row--grand">
              <span>TỔNG CỘNG</span>
              <span className="receipt__grand-val">{fmt(total)}</span>
            </div>
            <div className="receipt__totals-row">
              <span>Tiền khách đưa</span>
              <span>{fmt(paid)}</span>
            </div>
            <div className="receipt__totals-row">
              <span>Tiền thối</span>
              <span className="receipt__change">{fmt(change)}</span>
            </div>
            <div className="receipt__totals-row">
              <span>Thanh toán</span>
              <span className="receipt__pay-badge">💵 Tiền mặt</span>
            </div>
          </div>

          {/* QR */}
          <div className="receipt__qr">
            <div className="receipt__qr-box">📷</div>
            <div className="receipt__qr-note">Quét để thanh toán QR Pro</div>
          </div>

          <div className="receipt__footer">
            Cảm ơn quý khách! 🙏
            <br />
            Hẹn gặp lại & chúc một ngày tốt lành
          </div>
        </div>
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
