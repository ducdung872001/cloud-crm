import React, { useState, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { CartItem, PayMethod } from "../../../types";
import { IActionModal } from "model/OtherModel";
import "./index.scss";

interface PayModalProps {
  open: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onConfirm: () => void;
}

const PAY_METHODS: { id: PayMethod; icon: string; label: string }[] = [
  { id: "cash", icon: "💵", label: "Tiền mặt" },
  { id: "transfer", icon: "📱", label: "Chuyển khoản" },
  { id: "qr", icon: "📷", label: "QR Pro" },
];

export default function PayModal({ open, cartItems, onClose, onConfirm }: PayModalProps) {
  const [method, setMethod] = useState<PayMethod>("cash");
  const [customerPaid, setCustomerPaid] = useState(150000);

  const subtotal = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = 0;
  const total = subtotal - discount;
  const change = Math.max(0, customerPaid - total);
  const fmt = (n: number) => n.toLocaleString("vi") + " ₫";

  useEffect(() => {
    if (open) {
      setMethod("cash");
      setCustomerPaid(Math.ceil(total / 1000) * 1000);
    }
  }, [open, total]);

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Hủy",
          color: "primary",
          variant: "outline",
          callback: onClose,
        },
        {
          title: "✅ Xác nhận thanh toán & In biên lai",
          color: "primary",
          callback: onConfirm,
        },
      ],
    },
  };

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={onClose} className="pay-modal">
      <ModalHeader title="💳 Chọn phương thức thanh toán" toggle={onClose} />

      <ModalBody>
        {/* Method selector */}
        <div className="pay-modal__methods">
          {PAY_METHODS.map((m) => (
            <div key={m.id} className={`pms${method === m.id ? " pms--selected" : ""}`} onClick={() => setMethod(m.id)}>
              <div className="pms__icon">{m.icon}</div>
              <div className="pms__label">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="pay-modal__summary">
          <div className="pay-modal__summary-row">
            <span>Tổng tiền hàng</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="pay-modal__summary-row">
            <span>Giảm giá</span>
            <span className="pay-modal__discount">−{fmt(discount)}</span>
          </div>
          <div className="pay-modal__summary-row pay-modal__summary-row--total">
            <span>TỔNG THANH TOÁN</span>
            <span className="pay-modal__total-val">{fmt(total)}</span>
          </div>
        </div>

        {/* Cash */}
        {method === "cash" && (
          <>
            <div className="pay-modal__field">
              <label>Khách đưa (₫)</label>
              <input type="number" value={customerPaid} onChange={(e) => setCustomerPaid(Number(e.target.value))} />
              <div className="pay-modal__quick-btns">
                {[50000, 100000, 150000, 200000, 500000].map((v) => (
                  <button key={v} type="button" className="pay-modal__quick-btn" onClick={() => setCustomerPaid(v)}>
                    {(v / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
            <div className="pay-modal__change">
              <span>Tiền thối lại</span>
              <span className="pay-modal__change-val">{fmt(change)}</span>
            </div>
          </>
        )}

        {/* Transfer */}
        {method === "transfer" && (
          <div className="pay-modal__transfer">
            <div className="pay-modal__transfer-row">
              <span>Ngân hàng</span>
              <b>Vietcombank</b>
            </div>
            <div className="pay-modal__transfer-row">
              <span>Số tài khoản</span>
              <b>1234 5678 9012</b>
            </div>
            <div className="pay-modal__transfer-row">
              <span>Chủ tài khoản</span>
              <b>NGUYEN THI HOA</b>
            </div>
            <div className="pay-modal__transfer-row">
              <span>Nội dung</span>
              <b>#DH-20231021-0042</b>
            </div>
          </div>
        )}

        {/* QR */}
        {method === "qr" && (
          <div className="pay-modal__qr-box">
            <div className="pay-modal__qr-inner">📷</div>
            <div className="pay-modal__qr-amount">{fmt(total)}</div>
            <div className="pay-modal__qr-note">Quét mã để thanh toán qua QR Pro</div>
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
