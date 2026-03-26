/**
 * InvoiceReceiptModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal xem biên lai từ danh sách đơn hàng (SaleInvoiceList).
 * Khác với ReceiptModal (dùng cho POS - nhận cartItems[]):
 *   → Nhận invoiceId, tự fetch dữ liệu từ API
 *   → Hỗ trợ In biên lai (window.print với @media print)
 *   → Hỗ trợ Gửi biên lai qua email cho khách
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import InvoiceService from "services/InvoiceService";
import CustomerService from "services/CustomerService";
import { formatCurrency } from "reborn-util";
import "./InvoiceReceiptModal.scss";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReceiptData {
  invoiceCode: string;
  createdTime: string;
  employeeName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  products: { name: string; qty: number; price: number }[];
  services: { name: string; qty: number; price: number }[];
  amount: number;   // tạm tính
  discount: number;
  fee: number;      // tổng sau giảm
  paymentType: number;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

interface Props {
  open: boolean;
  invoiceId: number | null;
  onClose: () => void;
}

const PAY_LABEL: Record<number, string> = {
  1: "Tiền mặt",
  2: "Chuyển khoản",
  3: "Quẹt thẻ",
  4: "QR Code",
};

// ── Component ─────────────────────────────────────────────────────────────────

type PaperSize = "58mm" | "80mm" | "A4";

// CSS @page cho từng khổ giấy
// - 58mm / 80mm: size = WIDTHmm auto (auto height = cuộn giấy liên tục, không cắt trang)
//   margin nhỏ nhất có thể để tận dụng diện tích in
// - A4: size = A4, margin bình thường cho văn phòng
const PAPER_CONFIGS: Record<PaperSize, {
  pageCSS: string;   // @page rule
  bodyCSS: string;   // body rule
  fontSize: string;  // base font size
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

export default function InvoiceReceiptModal({ open, invoiceId, onClose }: Props) {
  const [receipt, setReceipt]       = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showEmail, setShowEmail]   = useState(false);
  const [isSending, setIsSending]   = useState(false);
  const [paperSize, setPaperSize]   = useState<PaperSize>("80mm");
  const printRef                    = useRef<HTMLDivElement>(null);
  const abortRef                    = useRef<AbortController | null>(null);

  // ── Fetch receipt data ──────────────────────────────────────────────────────

  const fetchReceipt = useCallback(async (id: number) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    setReceipt(null);
    setShowEmail(false);
    setEmailInput("");

    try {
      const res = await InvoiceService.invoiceDetail({ id }, abortRef.current.signal);
      if (res.code !== 0) {
        showToast(res.message ?? "Không tải được biên lai", "error");
        return;
      }

      const raw = res.result;
      const inv = raw.invoice ?? raw;

      // Fetch thêm thông tin email khách hàng nếu có customerId
      let customerEmail = inv.customerEmail ?? "";
      const customerId  = inv.customerId ?? 0;

      if (customerId > 0 && !customerEmail) {
        try {
          const custRes = await CustomerService.detail(customerId);
          if (custRes.code === 0) {
            customerEmail = custRes.result?.email ?? custRes.result?.emailMasked ?? "";
          }
        } catch {
          // không bắt buộc
        }
      }

      const products = (raw.products ?? []).map((p: any) => ({
        name: p.productName || p.name || "",
        qty: p.qty ?? 1,
        price: p.price ?? p.mainCost ?? 0,
      }));
      const services = (raw.services ?? []).map((s: any) => ({
        name: s.serviceName || s.name || "",
        qty: s.qty ?? 1,
        price: s.price ?? s.mainCost ?? 0,
      }));

      setReceipt({
        invoiceCode:  inv.invoiceCode ?? "",
        createdTime:  inv.createdTime ?? inv.receiptDate ?? "",
        employeeName: inv.employeeName ?? "",
        customerName: inv.customerName ?? "Khách vãng lai",
        customerPhone: inv.customerPhone ?? "",
        customerEmail,
        products,
        services,
        amount:      inv.amount   ?? 0,
        discount:    inv.discount ?? 0,
        fee:         inv.fee      ?? 0,
        paymentType: inv.paymentType ?? 1,
      });

      // Pre-fill email if available
      if (customerEmail) setEmailInput(customerEmail);
    } catch (e: any) {
      if (e?.name !== "AbortError") showToast("Lỗi tải biên lai", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && invoiceId && invoiceId > 0) {
      fetchReceipt(invoiceId);
    }
    return () => { abortRef.current?.abort(); };
  }, [open, invoiceId]);

  // ── Print ───────────────────────────────────────────────────────────────────

  const handlePrint = () => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const cfg  = PAPER_CONFIGS[paperSize];

    // Mở popup nhỏ – Chrome sẽ render đúng khổ giấy theo @page size
    // Với máy in nhiệt (thermal): chọn đúng máy trong hộp thoại Print,
    // driver tự cuộn giấy theo chiều cao nội dung (auto height)
    const win = window.open("", "_blank", "width=500,height=650");
    if (!win) { window.print(); return; }

    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>Biên lai ${receipt?.invoiceCode ?? ""}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: ${cfg.fontSize};
  color: #000;
  background: #fff;
  ${cfg.bodyCSS}
}
.rcpt-header { text-align: center; padding-bottom: 10px; border-bottom: 1px dashed #999; margin-bottom: 10px; }
.rcpt-store  { font-size: 1.4em; font-weight: 900; margin-bottom: 3px; }
.rcpt-sub    { font-size: .9em; color: #555; line-height: 1.5; }
.rcpt-meta   { font-size: .9em; color: #444; margin-top: 6px; line-height: 1.5; }
.rcpt-customer { border: 1px dashed #bbb; padding: 5px 7px; font-size: .95em;
                  line-height: 1.6; margin-bottom: 8px; }
.rcpt-customer__name  { font-weight: 700; }
.rcpt-customer__phone { color: #555; }
.rcpt-section-title { font-size: .8em; font-weight: 700; text-transform: uppercase;
                       letter-spacing: .4px; color: #777; margin: 8px 0 4px; }
.rcpt-table { width: 100%; border-collapse: collapse; margin-bottom: 2px; }
.rcpt-table th { font-size: .8em; font-weight: 700; text-transform: uppercase;
                  padding: 3px 0; border-bottom: 1px solid #bbb; }
.rcpt-table td { padding: 4px 0; vertical-align: top; }
.rcpt-table .name  { text-align: left; }
.rcpt-table .qty   { text-align: center; width: 24px; }
.rcpt-table .price { text-align: right; width: ${cfg.priceWidth}; white-space: nowrap; }
.rcpt-sep  { border: none; border-top: 1px dashed #bbb; margin: 8px 0; }
.rcpt-totals { font-size: .95em; }
.rcpt-row  { display: flex; justify-content: space-between; padding: 2px 0; color: #444; }
.rcpt-row--grand {
  border-top: 1.5px solid #000; margin-top: 5px; padding-top: 5px;
  font-size: 1.25em; font-weight: 900; color: #000;
}
.rcpt-row--pay { color: #555; font-size: .9em; }
.rcpt-footer { text-align: center; margin-top: 14px; padding-top: 10px;
               border-top: 1px dashed #999; font-size: .85em; color: #666; line-height: 1.7; }
/* ── @page: khổ giấy và margin cho máy in ── */
${cfg.pageCSS}
/* Ẩn header/footer mặc định của trình duyệt khi in */
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style></head><body>
${html}
<script>window.onload = () => { window.print(); window.close(); }<\/script>
</body></html>`);
    win.document.close();
  };

  // ── Send email ──────────────────────────────────────────────────────────────

  const handleSendEmail = async () => {
    const email = emailInput.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Email không hợp lệ", "error");
      return;
    }
    if (!receipt || !invoiceId) return;

    setIsSending(true);
    try {
      // Gửi biên lai qua email – gọi endpoint gửi biên lai
      const res = await fetch("/bizapi/sales/invoice/send-receipt-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          email,
          invoiceCode: receipt.invoiceCode,
        }),
      });

      // Fallback nếu endpoint chưa có: dùng outlookMail
      if (!res.ok || (await res.clone().json().catch(() => null))?.code !== 0) {
        const fallback = await fetch("/adminapi/outlookMail/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toEmail: email,
            subject: `Biên lai đơn hàng ${receipt.invoiceCode}`,
            body: buildEmailHtml(receipt),
          }),
        });
        const fj = await fallback.json().catch(() => ({}));
        if (fj.code !== 0) throw new Error(fj.message ?? "Gửi thất bại");
      }

      showToast(`Đã gửi biên lai tới ${email}`, "success");
      setShowEmail(false);
    } catch (err: any) {
      showToast(err?.message ?? "Gửi email thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsSending(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const fmtDate = (iso: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const dd = d.getDate().toString().padStart(2, "0");
      const mm = (d.getMonth() + 1).toString().padStart(2, "0");
      const yy = d.getFullYear();
      const hh = d.getHours().toString().padStart(2, "0");
      const min = d.getMinutes().toString().padStart(2, "0");
      return `${hh}:${min} · ${dd}/${mm}/${yy}`;
    } catch { return iso; }
  };

  const allItems = receipt
    ? [...receipt.products, ...receipt.services]
    : [];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Modal
      isFade={true}
      isOpen={open}
      isCentered={true}
      staticBackdrop={true}
      toggle={onClose}
      className="invoice-receipt-modal"
    >
      <ModalHeader title="Biên lai" toggle={onClose} />

      <ModalBody>
        {isLoading ? (
          <div className="ircpt-loading">Đang tải biên lai...</div>
        ) : !receipt ? (
          <div className="ircpt-loading">Không có dữ liệu.</div>
        ) : (
          <>
            {/* ── Paper size selector ─────────────────────────────────────── */}
            <div className="ircpt-paper-selector">
              <span className="ircpt-paper-selector__label">Khổ giấy in:</span>
              {(["58mm", "80mm", "A4"] as PaperSize[]).map(s => (
                <button
                  key={s}
                  className={`ircpt-paper-btn${paperSize === s ? " ircpt-paper-btn--active" : ""}`}
                  onClick={() => setPaperSize(s)}
                >
                  {s}
                  {s === "80mm" && <span className="ircpt-paper-btn__hint"> phổ biến</span>}
                </button>
              ))}
            </div>

            {/* ── Printable area ──────────────────────────────────────────── */}
            <div ref={printRef} className="ircpt">

              {/* Store header */}
              <div className="rcpt-header">
                <div className="rcpt-store">🛍️ Cửa hàng</div>
                <div className="rcpt-sub">Hotline: 1800 1234 · 7:00 – 19:00</div>
                <div className="rcpt-meta">
                  Mã biên lai: <strong>{receipt.invoiceCode}</strong><br />
                  {fmtDate(receipt.createdTime)}
                  {receipt.employeeName && ` · NV: ${receipt.employeeName}`}
                </div>
              </div>

              {/* Customer */}
              {(receipt.customerName !== "Khách vãng lai" || receipt.customerPhone) && (
                <div className="rcpt-customer">
                  <div className="rcpt-customer__name">{receipt.customerName}</div>
                  {receipt.customerPhone && (
                    <div className="rcpt-customer__phone">{receipt.customerPhone}</div>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="rcpt-section-title">Sản phẩm / Dịch vụ</div>
              <table className="rcpt-table">
                <thead>
                  <tr>
                    <th className="name">Tên</th>
                    <th className="qty">SL</th>
                    <th className="price">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {allItems.map((item, i) => (
                    <tr key={i}>
                      <td className="name">{item.name}</td>
                      <td className="qty">{item.qty}</td>
                      <td className="price">{formatCurrency(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <hr className="rcpt-sep" />

              {/* Totals */}
              <div className="rcpt-totals">
                <div className="rcpt-row">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(receipt.amount)}</span>
                </div>
                {receipt.discount > 0 && (
                  <div className="rcpt-row rcpt-row--discount">
                    <span>Giảm giá</span>
                    <span>−{formatCurrency(receipt.discount)}</span>
                  </div>
                )}
                <div className="rcpt-row rcpt-row--grand">
                  <span>TỔNG CỘNG</span>
                  <span>{formatCurrency(receipt.fee)}</span>
                </div>
                <div className="rcpt-row rcpt-row--pay">
                  <span>Thanh toán</span>
                  <span>{PAY_LABEL[receipt.paymentType] ?? "Tiền mặt"}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="rcpt-footer">
                Cảm ơn quý khách! 🙏<br />
                Hẹn gặp lại & chúc một ngày tốt lành
              </div>
            </div>

            {/* ── Send email form (below receipt, not printable) ────────── */}
            {showEmail && (
              <div className="ircpt-email-form">
                <div className="ircpt-email-form__label">
                  Địa chỉ email nhận biên lai
                </div>
                <div className="ircpt-email-form__row">
                  <input
                    type="email"
                    className="ircpt-email-form__input"
                    placeholder="example@email.com"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                    autoFocus
                  />
                  <button
                    className="btn btn--primary btn--sm ircpt-email-form__btn"
                    onClick={handleSendEmail}
                    disabled={isSending}
                  >
                    {isSending ? "Đang gửi..." : "Gửi"}
                  </button>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => setShowEmail(false)}
                  >
                    Huỷ
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </ModalBody>

      <ModalFooter
        actions={({
          actions_right: {
            buttons: [
              {
                title: "Đóng",
                color: "primary",
                variant: "outline",
                callback: onClose,
              },
              ...(receipt && !showEmail
                ? [
                    {
                      title: "Gửi email",
                      color: "primary",
                      variant: "outline",
                      callback: () => setShowEmail(true),
                    },
                    {
                      title: "In biên lai",
                      color: "primary",
                      callback: handlePrint,
                    },
                  ]
                : []),
            ],
          },
        } as IActionModal)}
      />
    </Modal>
  );
}

// ── Build HTML email body ─────────────────────────────────────────────────────

function buildEmailHtml(r: ReceiptData): string {
  const allItems = [...r.products, ...r.services];
  const rows = allItems.map(i =>
    `<tr>
      <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #f0f0f0">${i.qty}</td>
      <td style="padding:6px 4px;text-align:right;border-bottom:1px solid #f0f0f0;white-space:nowrap">${i.price * i.qty > 0 ? (i.price * i.qty).toLocaleString("vi") + " ₫" : "—"}</td>
    </tr>`
  ).join("");

  const fmtVND = (n: number) => n.toLocaleString("vi") + " ₫";

  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px 0">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <div style="background:#22c55e;padding:24px 28px;text-align:center">
    <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px">🧾 Biên lai thanh toán</div>
    <div style="font-size:14px;color:rgba(255,255,255,.85)">${r.invoiceCode}</div>
  </div>
  <div style="padding:24px 28px">
    ${r.customerName !== "Khách vãng lai" ? `
    <div style="background:#f8fffe;border-radius:8px;padding:12px 16px;margin-bottom:20px;border-left:3px solid #22c55e">
      <div style="font-size:14px;font-weight:700;color:#1a1a1a">${r.customerName}</div>
      ${r.customerPhone ? `<div style="font-size:12px;color:#666;margin-top:2px">${r.customerPhone}</div>` : ""}
    </div>` : ""}
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:8px 4px;text-align:left;font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Sản phẩm</th>
          <th style="padding:8px 4px;text-align:center;font-size:11px;color:#888;font-weight:700">SL</th>
          <th style="padding:8px 4px;text-align:right;font-size:11px;color:#888;font-weight:700">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="border-top:2px dashed #e5e7eb;padding-top:12px">
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#666">
        <span>Tạm tính</span><span>${fmtVND(r.amount)}</span>
      </div>
      ${r.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#ef4444">
        <span>Giảm giá</span><span>−${fmtVND(r.discount)}</span>
      </div>` : ""}
      <div style="display:flex;justify-content:space-between;padding:10px 0 4px;font-size:18px;font-weight:900;color:#1a1a1a;border-top:1.5px solid #1a1a1a;margin-top:6px">
        <span>TỔNG CỘNG</span><span style="color:#22c55e">${fmtVND(r.fee)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#666">
        <span>Thanh toán</span><span>${({ 1: "Tiền mặt", 2: "Chuyển khoản", 3: "Quẹt thẻ", 4: "QR Code" } as any)[r.paymentType] ?? "Tiền mặt"}</span>
      </div>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px 28px;text-align:center;font-size:12px;color:#888">
    Cảm ơn quý khách đã mua hàng! 🙏<br>
    Mọi thắc mắc xin liên hệ hotline <strong>1800 1234</strong>
  </div>
</div>
</body></html>`;
}