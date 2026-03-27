import React, { useMemo, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { CartItem } from "../../../types";
import "./index.scss";
import InvoiceService from "@/services/InvoiceService";
import { showToast } from "@/utils/common";
import { PAY_METHODS } from "../PayModal";
import { QRCodeCanvas } from "qrcode.react";
import { getActiveShiftId } from "utils/ShiftStorage";

// ── Paper size config (dùng chung với InvoiceReceiptModal) ───────────────────

type PaperSize = "58mm" | "80mm" | "A4";

const PAPER_CONFIGS: Record<PaperSize, {
  pageCSS: string;
  bodyCSS: string;
  fontSize: string;
  priceWidth: string;
}> = {
  "58mm": {
    pageCSS:    "@page { size: 58mm auto; margin: 1mm 2mm; }",
    bodyCSS:    "width:100%; padding: 2mm 3mm; margin: 0;",
    fontSize:   "10px",
    priceWidth: "62px",
  },
  "80mm": {
    pageCSS:    "@page { size: 80mm auto; margin: 2mm 3mm; }",
    bodyCSS:    "width:100%; padding: 3mm 4mm; margin: 0;",
    fontSize:   "12px",
    priceWidth: "82px",
  },
  "A4": {
    pageCSS:    "@page { size: A4; margin: 18mm 20mm; }",
    bodyCSS:    "max-width: 160mm; padding: 0; margin: 0 auto;",
    fontSize:   "13px",
    priceWidth: "90px",
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

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
  note?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReceiptModal({
  open, cartItems, onClose, customerId, invoiceId,
  invoiceDraft, method, qrCodePro,
  couponDiscount = 0, promoDiscount = 0, onPaymentSuccess,
  note = "",
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const qrRef    = useRef<HTMLDivElement>(null);

  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paperSize, setPaperSize]                     = useState<PaperSize>("80mm");
  const [showEmail, setShowEmail]                     = useState(false);
  const [emailInput, setEmailInput]                   = useState("");
  const [isSending, setIsSending]                     = useState(false);

  // ── Tính tiền ───────────────────────────────────────────────────────────────
  const subtotal      = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
  const totalDiscount = couponDiscount + promoDiscount;
  const total         = subtotal - totalDiscount;
  const fmt           = (n: number) => n.toLocaleString("vi") + " đ";

  const now     = new Date();
  const dateStr = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getFullYear()}`;
  const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;

  // ── Xác nhận thanh toán ─────────────────────────────────────────────────────
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
        ...(getActiveShiftId() ? { shiftId: getActiveShiftId() } : {}),
      };
      const res = await InvoiceService.create(body);
      if (res.code === 0) {
        showToast("Thanh toán thành công.", "success");
        setIsPaymentProcessing(true);
        onPaymentSuccess?.();
      } else {
        showToast(res.message || "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.", "error");
      }
    } catch {}
  };

  const handleClose = () => {
    if (isPaymentProcessing) onPaymentSuccess?.();
    onClose();
    setIsPaymentProcessing(false);
    setShowEmail(false);
    setEmailInput("");
  };

  // ── In biên lai (popup đúng khổ giấy) ──────────────────────────────────────
  const handlePrint = () => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const cfg  = PAPER_CONFIGS[paperSize];
    const win  = window.open("", "_blank", "width=500,height=650");
    if (!win) return;

    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>Biên lai</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: ${cfg.fontSize};
       color: #000; background: #fff; ${cfg.bodyCSS} }
.print-guide { background:#fffbe6; border:1px solid #ffe58f; border-radius:6px;
               padding:8px 12px; margin-bottom:12px; font-size:11px; color:#614700; line-height:1.6; }
.print-guide b { color:#ad4e00; }
@media print { .print-guide { display:none !important; } }
.receipt__header { text-align:center; padding-bottom:10px; border-bottom:1px dashed #999; margin-bottom:10px; }
.receipt__store   { font-size:1.4em; font-weight:900; margin-bottom:3px; }
.receipt__address,.receipt__contact { font-size:.9em; color:#555; line-height:1.5; }
.receipt__meta    { font-size:.9em; color:#444; margin-top:6px; line-height:1.5; }
.receipt__table   { width:100%; margin-bottom:8px; }
.receipt__row     { display:flex; justify-content:space-between; align-items:center; font-size:.95em; padding:4px 0; }
.receipt__row--header { font-weight:700; border-bottom:1px solid #bbb; padding-bottom:5px; margin-bottom:2px; }
.receipt__col-name  { flex:1; }
.receipt__col-qty   { width:24px; text-align:center; }
.receipt__col-total { width:${cfg.priceWidth}; text-align:right; white-space:nowrap; font-weight:600; }
.receipt__totals    { border-top:1px solid #bbb; padding-top:6px; }
.receipt__totals-row { display:flex; justify-content:space-between; font-size:.9em; padding:2px 0; color:#555; }
.receipt__totals-row--grand { font-size:1.2em; font-weight:900; color:#000;
                               border-top:1.5px solid #000; border-bottom:1.5px solid #000;
                               padding:5px 0; margin:4px 0; }
.receipt__totals-row--grand span { font-weight:900; color:#000; }
.receipt__discount { color:#cc0000; }
.receipt__pay-badge { font-size:.85em; color:#555; }
.receipt__note { margin-top:8px; padding:6px 8px; background:#f8f9fa; border-left:3px solid #84cc16;
                 border-radius:0 4px 4px 0; font-size:.85em; }
.receipt__note-label { font-weight:700; color:#3d6b0b; margin-right:4px; }
.receipt__note-text { color:#444; }
.receipt__footer { text-align:center; margin-top:12px; padding-top:10px;
                   border-top:1px dashed #999; font-size:.85em; color:#666; line-height:1.7; }
${cfg.pageCSS}
@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
<div class="print-guide">
  ⚠️ <b>Lưu ý:</b> Tại mục <b>Destination</b>, chọn đúng <b>máy in nhiệt</b> của bạn thay vì "Microsoft Print to PDF".<br>
  Khổ giấy <b>${paperSize}</b> sẽ được áp dụng tự động.
</div>
${html}
<script>window.onload = () => { window.print(); }<\/script>
</body></html>`);
    win.document.close();
  };

  // ── Gửi email biên lai ──────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    const email = emailInput.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Email không hợp lệ", "error");
      return;
    }
    setIsSending(true);
    try {
      const emailBody = buildEmailHtml({
        items: cartItems.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
        subtotal, totalDiscount, total, method,
        dateStr, timeStr,
      });

      const res = await fetch("/adminapi/outlookMail/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: email,
          subject: `Biên lai thanh toán`,
          body: emailBody,
        }),
      });
      const rj = await res.json().catch(() => ({}));
      if (rj.code !== 0) throw new Error(rj.message ?? "Gửi thất bại");

      showToast(`Đã gửi biên lai tới ${email}`, "success");
      setShowEmail(false);
    } catch (err: any) {
      showToast(err?.message ?? "Gửi email thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsSending(false);
    }
  };

  // ── Actions footer ──────────────────────────────────────────────────────────
  const actions = useMemo<IActionModal>(() => ({
    actions_right: {
      buttons: [
        {
          title: "Đóng",
          color: "primary",
          variant: "outline",
          callback: handleClose,
        },
        ...(isPaymentProcessing ? [
          {
            title: "Đã thanh toán",
            color: "primary" as const,
            variant: "outline" as const,
            disabled: true,
            callback: () => {},
          },
        ] : [
          {
            title: "Xác nhận thanh toán",
            color: "primary" as const,
            variant: "outline" as const,
            callback: handleConfirmPay,
          },
        ]),
        ...(isPaymentProcessing && !showEmail ? [
          {
            title: "Gửi email",
            color: "primary" as const,
            variant: "outline" as const,
            callback: () => setShowEmail(true),
          },
          {
            title: "In biên lai",
            color: "primary" as const,
            callback: handlePrint,
          },
        ] : []),
      ],
    },
  }), [isPaymentProcessing, showEmail, paperSize, cartItems]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={handleClose} className="receipt-modal">
      <ModalHeader title="Biên lai thanh toán" toggle={handleClose} />

      <ModalBody>
        {/* Paper size selector — chỉ hiện khi đã thanh toán */}
        {isPaymentProcessing && (
          <div className="receipt-paper-selector">
            <span className="receipt-paper-selector__label">Khổ giấy in:</span>
            {(["58mm", "80mm", "A4"] as PaperSize[]).map(s => (
              <button
                key={s}
                className={`receipt-paper-btn${paperSize === s ? " receipt-paper-btn--active" : ""}`}
                onClick={() => setPaperSize(s)}
              >
                {s}{s === "80mm" && <span className="receipt-paper-btn__hint"> phổ biến</span>}
              </button>
            ))}
          </div>
        )}

        {/* Printable receipt */}
        <div ref={printRef} className="receipt">
          {/* Store header */}
          <div className="receipt__header">
            <div className="receipt__store">🛍️ Cửa hàng</div>
            <div className="receipt__address">Hotline: 1800 1234</div>
            <div className="receipt__contact">Giờ mở: 7:00–19:00</div>
            <div className="receipt__meta">
              Ngày: {dateStr} · {timeStr}
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
              <span className="receipt__discount">{totalDiscount > 0 ? `−${fmt(totalDiscount)}` : "−0 đ"}</span>
            </div>
            <div className="receipt__totals-row receipt__totals-row--grand">
              <span>TỔNG CỘNG</span>
              <span className="receipt__grand-val">{fmt(total)}</span>
            </div>
            {method === "cash" && (
              <>
                <div className="receipt__totals-row">
                  <span>Tiền khách đưa</span>
                  <span>{fmt(total)}</span>
                </div>
                <div className="receipt__totals-row">
                  <span>Tiền thối</span>
                  <span className="receipt__change">{fmt(0)}</span>
                </div>
              </>
            )}
            <div className="receipt__totals-row">
              <span>Thanh toán</span>
              <span className="receipt__pay-badge">
                {PAY_METHODS.find((m) => m.id === method)?.icon}{" "}
                {PAY_METHODS.find((m) => m.id === method)?.label}
              </span>
            </div>
          </div>

          {/* QR thanh toán */}
          {method === "qr" && qrCodePro && (
            <div className="receipt__qr">
              <div ref={qrRef} style={{ display: "inline-block", padding: "16px", border: "1px solid #eee", borderRadius: "12px" }}>
                <QRCodeCanvas value={qrCodePro} size={200} level="M" includeMargin={true} bgColor="#ffffff" fgColor="#000000" />
              </div>
            </div>
          )}

          {/* Ghi chú đơn hàng */}
          {note?.trim() && (
            <div className="receipt__note">
              <span className="receipt__note-label">📝 Ghi chú:</span>
              <span className="receipt__note-text">{note.trim()}</span>
            </div>
          )}

          <div className="receipt__footer">
            Cảm ơn quý khách! 🙏<br />
            Hẹn gặp lại & chúc một ngày tốt lành
          </div>
        </div>

        {/* Email form */}
        {showEmail && (
          <div className="receipt-email-form">
            <div className="receipt-email-form__label">Địa chỉ email nhận biên lai</div>
            <div className="receipt-email-form__row">
              <input
                type="email"
                className="receipt-email-form__input"
                placeholder="example@email.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                autoFocus
              />
              <button className="btn btn--primary btn--sm" onClick={handleSendEmail} disabled={isSending}>
                {isSending ? "Đang gửi..." : "Gửi"}
              </button>
              <button className="btn btn--outline btn--sm" onClick={() => setShowEmail(false)}>Huỷ</button>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}

// ── Build email HTML ──────────────────────────────────────────────────────────

function buildEmailHtml({ items, subtotal, totalDiscount, total, method, dateStr, timeStr }: {
  items: { name: string; qty: number; price: number }[];
  subtotal: number; totalDiscount: number; total: number;
  method: string; dateStr: string; timeStr: string;
}) {
  const fmtVND = (n: number) => n.toLocaleString("vi") + " đ";
  const rows = items.map(i =>
    `<tr>
      <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #f0f0f0">${i.qty}</td>
      <td style="padding:6px 4px;text-align:right;border-bottom:1px solid #f0f0f0;white-space:nowrap">${fmtVND(i.price * i.qty)}</td>
    </tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px 0">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <div style="background:#22c55e;padding:20px 24px;text-align:center">
    <div style="font-size:20px;font-weight:900;color:#fff">Biên lai thanh toán</div>
    <div style="font-size:13px;color:rgba(255,255,255,.85);margin-top:4px">${dateStr} · ${timeStr}</div>
  </div>
  <div style="padding:20px 24px">
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:7px 4px;text-align:left;font-size:11px;color:#888;font-weight:700;text-transform:uppercase">Sản phẩm</th>
          <th style="padding:7px 4px;text-align:center;font-size:11px;color:#888;font-weight:700">SL</th>
          <th style="padding:7px 4px;text-align:right;font-size:11px;color:#888;font-weight:700">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="border-top:2px dashed #e5e7eb;padding-top:10px">
      <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#666">
        <span>Tạm tính</span><span>${fmtVND(subtotal)}</span>
      </div>
      ${totalDiscount > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#ef4444">
        <span>Giảm giá</span><span>−${fmtVND(totalDiscount)}</span>
      </div>` : ""}
      <div style="display:flex;justify-content:space-between;padding:9px 0 3px;font-size:17px;font-weight:900;border-top:1.5px solid #222;margin-top:5px">
        <span>TỔNG CỘNG</span><span style="color:#22c55e">${fmtVND(total)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;color:#666">
        <span>Thanh toán</span><span>${({cash:"Tiền mặt",transfer:"Chuyển khoản",qr:"QR Code",credit_card:"Quẹt thẻ"} as any)[method] ?? method}</span>
      </div>
    </div>
  </div>
  <div style="background:#f9fafb;padding:14px 24px;text-align:center;font-size:12px;color:#888">
    Cảm ơn quý khách đã mua hàng! 🙏<br>Mọi thắc mắc xin liên hệ hotline <strong>1800 1234</strong>
  </div>
</div>
</body></html>`;
}