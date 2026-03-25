import React, { useMemo, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { CartItem } from "../../../types";
import "./index.scss";
import InvoiceService from "@/services/InvoiceService";
import { showToast } from "@/utils/common";
import { PAY_METHODS } from "../PayModal";
import { QRCodeCanvas } from "qrcode.react";

interface ReceiptModalProps {
  open: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  customerId: number | string;
  invoiceId: number | string;
  invoiceDraft: any;
  method: string;
  qrCodePro: string | null;
  couponDiscount?: number;
  promoDiscount?: number;
  onPaymentSuccess?: () => void;
}

export default function ReceiptModal({ open, cartItems, onClose, customerId, invoiceId, invoiceDraft, method, qrCodePro, couponDiscount = 0, promoDiscount = 0, onPaymentSuccess }: ReceiptModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = React.useState(false);
  const subtotal = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
  const totalDiscount = couponDiscount + promoDiscount;
  const total = subtotal - totalDiscount;
  const paid = total;
  const change = Math.max(0, paid - total);
  const fmt = (n: number) => n.toLocaleString("vi") + " ₫";
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const handleConfirmPay = async () => {
    try {
      const body: any = {
        id: invoiceId,
        amount: total,
        discount: totalDiscount,
        fee: total,
        paid: total,
        debt: 0,
        paymentType: 1,
        vatAmount: 0,
        receiptDate: new Date().toISOString(),
        account: "[]",
        amountCard: 0,
        branchId: invoiceDraft?.branchId || -1,
        bsnId: invoiceDraft?.bsnId || -1,
        invoiceType: "IV1",
        customerId: customerId,
        campaignId: 0,
      };
      const res = await InvoiceService.create(body);
      if (res.code === 0) {
        showToast("Thanh toán thành công.", "success");
        setIsPaymentProcessing(true);
        onPaymentSuccess?.();
      } else {
        showToast(res.message || "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.", "error");
      }
    } catch (error) {}
  };
  const handleClose = async () => {
    if (isPaymentProcessing) {
      onPaymentSuccess?.();
    }
    onClose();
    setIsPaymentProcessing(false);
  };

  const actions: any = useMemo(() => {
    return {
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              handleClose();
            },
          },
          ...(isPaymentProcessing
            ? [
                {
                  title: "✅ Đã thanh toán",
                  color: "primary",
                  variant: "outline",
                  disabled: true,
                  callback: () => {
                    // handleConfirmPay();
                  },
                },
              ]
            : [
                {
                  title: "💳 Xác nhận thanh toán",
                  color: "primary",
                  variant: "outline",
                  callback: () => {
                    handleConfirmPay();
                  },
                },
              ]),
          ...(isPaymentProcessing
            ? [
                {
                  title: "🖨️ In biên lai",
                  color: "primary",
                  callback: () => window.print(),
                },
              ]
            : []),
        ],
      },
    };
  }, [isPaymentProcessing, onClose, setIsPaymentProcessing]);

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={handleClose} className="receipt-modal">
      <ModalHeader title="🧾 Biên lai thanh toán" toggle={handleClose} />

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
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="receipt__totals-row">
              <span>Giảm giá</span>
              <span className="receipt__discount">{totalDiscount > 0 ? `−${fmt(totalDiscount)}` : "−0 ₫"}</span>
            </div>
            <div className="receipt__totals-row receipt__totals-row--grand">
              <span>TỔNG CỘNG</span>
              <span className="receipt__grand-val">{fmt(total)}</span>
            </div>
            {method === "cash" && (
              <>
                <div className="receipt__totals-row">
                  <span>Tiền khách đưa</span>
                  <span>{fmt(paid)}</span>
                </div>
                <div className="receipt__totals-row">
                  <span>Tiền thối</span>
                  <span className="receipt__change">{fmt(change)}</span>
                </div>
              </>
            )}
            <div className="receipt__totals-row">
              <span>Thanh toán</span>
              <span className="receipt__pay-badge">
                {PAY_METHODS.find((m) => m.id === method)?.icon} {PAY_METHODS.find((m) => m.id === method)?.label}
              </span>
            </div>
          </div>

          {/* QR */}
          {method === "qr" && qrCodePro && (
            <div className="receipt__qr">
              {/* <div className="receipt__qr-box">📷</div>
              <div className="receipt__qr-note">Quét để thanh toán QR Pro</div> */}
              {/* ✅ QR Code */}
              <div ref={qrRef} style={{ display: "inline-block", padding: "16px", border: "1px solid #eee", borderRadius: "12px" }}>
                <QRCodeCanvas
                  value={qrCodePro} // 👈 Chuỗi QR của bạn
                  size={256} // Kích thước (px)
                  level="M" // Mức độ sửa lỗi: L | M | Q | H
                  includeMargin={true} // Thêm margin trắng xung quanh
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
          )}

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