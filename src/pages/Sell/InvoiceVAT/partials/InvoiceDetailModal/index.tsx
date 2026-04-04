import React, { useState, useEffect } from "react";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import Button from "components/button/button";
import { showToast } from "utils/common";
import InvoiceAdjustmentModal from "../InvoiceAdjustmentModal";
import "./style.scss";

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "warning" | "error" | "transparent" | "primary" | "secondary" | "done" | "wait-collect";

/** Khớp với SinvoiceLog từ InvoiceVATList */
export interface SinvoiceLogItem {
  id:                number;
  transactionUuid:   string;
  reservationCode?:  string;
  invoiceNo?:        string;
  invoiceSeries?:    string;
  invoiceIssuedDate?: number;
  templateCode?:     string;
  buyerName?:        string;
  buyerTaxCode?:     string;
  totalAmount?:      number;
  status:            string;
  rawRequestJson?:   string;
  rawResponseJson?:  string;
  errorCode?:        string | null;
  errorDescription?: string | null;
}

interface ParsedItem {
  lineNumber:  number;
  itemName:    string;
  unitName:    string;
  quantity:    number;
  unitPrice:   number;
  taxPercentage: number;
  itemTotalAmountWithoutTax: number;
  taxAmount:   number;
}

interface ParsedRequest {
  buyerInfo?:    { buyerName?: string; buyerTaxCode?: string; buyerAddressLine?: string; buyerEmail?: string };
  payments?:     { paymentMethodName?: string; paymentMethod?: string }[];
  sellerInfo?:   { sellerLegalName?: string; sellerTaxCode?: string; sellerAddressLine?: string };
  itemInfo?:     ParsedItem[];
  summarizeInfo?: { totalAmountWithoutTax?: number; totalTaxAmount?: number; totalAmountWithTax?: number };
  generalInvoiceInfo?: { templateCode?: string; invoiceSeries?: string };
}

interface ParsedResponse {
  result?: { codeOfTax?: string; reservationCode?: string; invoiceNo?: string };
}

interface Props {
  isOpen:   boolean;
  data:     SinvoiceLogItem | null;
  onClose:  () => void;
  onRefresh?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SUPPLIER_TAX_CODE = (window as any).__VAT_SUPPLIER_TAX_CODE__ || "0100109106-501";

const STATUS_MAP: Record<string, { text: string; variant: BadgeVariant }> = {
  ISSUED:    { text: "ISSUED",    variant: "success" },
  PENDING:   { text: "Chờ ký số", variant: "warning" },
  FAILED:    { text: "Lỗi / Hủy", variant: "error"   },
  CANCELLED: { text: "Đã hủy",    variant: "error"   },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) => (v ?? 0).toLocaleString("vi-VN") + "đ";

const fmtDate = (ts?: number | null): string => {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

const parseRawRequest = (raw?: string): ParsedRequest => {
  try { return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
};

const parseRawResponse = (raw?: string): ParsedResponse => {
  try { return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
};

const taxLabel = (pct: number): string => {
  if (pct === -2) return "KCT";
  if (pct === -1) return "KKKNT";
  return `${pct}%`;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function InvoiceDetailModal({ isOpen, data, onClose, onRefresh }: Props) {
  const [copied,        setCopied]        = useState(false);
  const [loadingPdf,    setLoadingPdf]    = useState(false);
  const [loadingEmail,  setLoadingEmail]  = useState(false);
  const [showAdjust,    setShowAdjust]    = useState(false);

  // Đóng bằng ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  // ── Parse raw JSON ─────────────────────────────────────────────────────────
  const req  = parseRawRequest(data.rawRequestJson);
  const resp = parseRawResponse(data.rawResponseJson);

  const buyer    = req.buyerInfo    ?? {};
  const payments = req.payments     ?? [];
  const items    = req.itemInfo     ?? [];
  const summary  = req.summarizeInfo ?? {};
  const genInfo  = req.generalInvoiceInfo ?? {};

  // Merge fields: rawRequest có thể bổ sung buyerName/taxCode từ SinvoiceLog
  const buyerName    = buyer.buyerName    || data.buyerName    || "—";
  const buyerTaxCode = buyer.buyerTaxCode || data.buyerTaxCode || "";
  const buyerAddress = buyer.buyerAddressLine || "—";
  const buyerEmail   = buyer.buyerEmail   || "";
  const paymentMethod = payments[0]?.paymentMethodName || payments[0]?.paymentMethod || "—";

  const templateCode  = genInfo.templateCode  || data.templateCode  || "—";
  const invoiceSeries = genInfo.invoiceSeries || data.invoiceSeries  || "—";

  // Số tiền
  const subtotal   = summary.totalAmountWithoutTax ?? 0;
  const taxTotal   = summary.totalTaxAmount        ?? 0;
  const grandTotal = summary.totalAmountWithTax    ?? data.totalAmount ?? 0;

  // Mã tra cứu CQT (từ rawResponseJson hoặc reservationCode)
  const cqtCode = resp.result?.codeOfTax
    || resp.result?.reservationCode
    || data.reservationCode
    || "";

  const statusInfo = STATUS_MAP[data.status] ?? { text: data.status, variant: "wait-collect" as BadgeVariant };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleCopy = () => {
    navigator.clipboard.writeText(cqtCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!data.invoiceNo) { showToast("Hóa đơn chưa có số, không thể tải PDF.", "error"); return; }
    setLoadingPdf(true);
    try {
      const res = await fetch("/bizapi/integration/sinvoice/query/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierTaxCode: SUPPLIER_TAX_CODE,
          invoiceNo:       data.invoiceNo,
          templateCode,
          fileType:        "PDF",
        }),
      });
      const json = await res.json();
      // API trả về: { code: 0, result: { invoiceNo, content: "base64...", fileType: "PDF" } }
      const base64 = json?.result?.content ?? json?.result;
      if (json?.code === 0 && base64) {
        try {
          const binary = atob(base64);
          const bytes  = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url  = URL.createObjectURL(blob);
          // Kích hoạt download tự động
          const a = document.createElement("a");
          a.href     = url;
          a.download = `HoaDon_${data.invoiceNo}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          showToast(`Đã tải ${data.invoiceNo}.pdf`, "success");
        } catch {
          showToast("Không đọc được file PDF từ server.", "error");
        }
      } else {
        showToast(json?.message || "Không thể tải PDF. Vui lòng thử lại.", "error");
      }
    } catch { showToast("Lỗi kết nối khi tải PDF.", "error"); }
    finally  { setLoadingPdf(false); }
  };

  const handleResendEmail = async () => {
    if (!data.transactionUuid) { showToast("Không có transactionUuid để gửi email.", "error"); return; }
    if (!buyerEmail) { showToast("Hóa đơn này không có email người mua.", "error"); return; }
    setLoadingEmail(true);
    try {
      const res = await fetch("/bizapi/integration/sinvoice/ext/send-email-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierTaxCode: SUPPLIER_TAX_CODE,
          transactionUuid: data.transactionUuid,
          buyerEmail,
        }),
      });
      const json = await res.json();
      if (json?.code === 0) {
        showToast(`Đã gửi lại hóa đơn tới ${buyerEmail}`, "success");
      } else {
        showToast(json?.message || "Gửi email thất bại.", "error");
      }
    } catch { showToast("Lỗi kết nối khi gửi email.", "error"); }
    finally  { setLoadingEmail(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="inv-detail-overlay" onClick={onClose}>
      <div className="inv-detail-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="idm__header">
          <div className="idm__header-left">
            <h2>Hóa đơn GTGT số {data.invoiceNo || <em style={{ color: "#9ca3af", fontStyle: "normal" }}>Đang xử lý</em>}</h2>
            <span className="idm__meta">
              Ký hiệu {invoiceSeries} · Ngày {fmtDate(data.invoiceIssuedDate)}
            </span>
          </div>
          <div className="idm__header-right">
            <Badge text={statusInfo.text} variant={statusInfo.variant} />
            <button className="idm__close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="idm__body">

          {/* Info grid */}
          <div className="idm__info-grid">
            <div className="info-cell">
              <span className="ic-label">SỐ HÓA ĐƠN</span>
              <span className="ic-value">{data.invoiceNo || "—"}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">MẪU SỐ / KÝ HIỆU</span>
              <span className="ic-value">{templateCode} – {invoiceSeries}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">NGÀY XUẤT</span>
              <span className="ic-value">{fmtDate(data.invoiceIssuedDate)}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">HÌNH THỨC TT</span>
              <span className="ic-value">{paymentMethod}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">NGƯỜI MUA</span>
              <span className="ic-value ic-bold">{buyerName}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">MÃ SỐ THUẾ</span>
              <span className="ic-value">{buyerTaxCode || "Cá nhân"}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">ĐỊA CHỈ</span>
              <span className="ic-value">{buyerAddress}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">EMAIL NHẬN HĐ</span>
              <span className="ic-value">{buyerEmail || "—"}</span>
            </div>
          </div>

          {/* Items table */}
          <div className="idm__items-wrap">
            <div className="idm__section-label">HÀNG HÓA / DỊCH VỤ</div>
            {items.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af", padding: "8px 0" }}>
                Không có dữ liệu hàng hóa.
              </p>
            ) : (
              <table className="idm__items-table">
                <thead>
                  <tr>
                    <th className="th-stt">#</th>
                    <th>TÊN HÀNG HÓA</th>
                    <th className="th-dvt">ĐVT</th>
                    <th className="th-sl">SL</th>
                    <th className="th-dg">ĐƠN GIÁ</th>
                    <th className="th-thue">THUẾ</th>
                    <th className="th-tt">THÀNH TIỀN</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{idx + 1}</td>
                      <td>{item.itemName}</td>
                      <td className="text-center">{item.unitName}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{fmt(item.unitPrice)}</td>
                      <td className="text-center">
                        <span className="tax-pill">{taxLabel(item.taxPercentage)}</span>
                      </td>
                      <td className="text-right fw-600">
                        {fmt(item.itemTotalAmountWithoutTax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Totals */}
          <div className="idm__totals">
            <div className="tot-row">
              <span>Tiền hàng chưa thuế</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="tot-row tot-vat">
              <span>Thuế GTGT</span>
              <span>{fmt(taxTotal)}</span>
            </div>
            <div className="tot-grand">
              <span>Tổng thanh toán</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>

          {/* Error info (nếu FAILED) */}
          {data.errorCode && (
            <div className="idm__error-row">
              <Icon name="AlertCircle" />
              <div>
                <span className="err-code">Mã lỗi: {data.errorCode}</span>
                {data.errorDescription && (
                  <span className="err-desc">{data.errorDescription}</span>
                )}
              </div>
            </div>
          )}

          {/* CQT Code */}
          {cqtCode && (
            <div className="idm__cqt">
              <div className="cqt-icon-wrap"><Icon name="Lock" /></div>
              <div className="cqt-info">
                <span className="cqt-label">MÃ TRA CỨU CQT (TCT)</span>
                <span className="cqt-code">{cqtCode}</span>
              </div>
              <button className="cqt-copy-btn" onClick={handleCopy}>
                {copied ? "Đã sao chép!" : "Sao chép"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="idm__footer">
          <Button
            color="secondary"
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={loadingPdf}
            hasIcon
          >
            <Icon name="Download" />
            {loadingPdf ? "Đang tải..." : "Tải PDF"}
          </Button>
          <Button
            color="secondary"
            variant="outline"
            onClick={handleResendEmail}
            disabled={loadingEmail || !buyerEmail}
            hasIcon
          >
            <Icon name="Send" />
            {loadingEmail ? "Đang gửi..." : "Gửi lại email"}
          </Button>
          <Button
            color="secondary"
            variant="outline"
            onClick={() => setShowAdjust(true)}
            disabled={data.status !== "ISSUED"}
            hasIcon
          >
            <Icon name="Edit" /> Điều chỉnh HĐ
          </Button>
          <Button color="primary" onClick={onClose} className="idm__footer-close">Đóng</Button>
        </div>

      </div>

      {/* Modal điều chỉnh hóa đơn */}
      <InvoiceAdjustmentModal
        isOpen={showAdjust}
        originalInvoice={data}
        onClose={() => setShowAdjust(false)}
        onSuccess={() => { onRefresh?.(); }}
      />
    </div>
  );
}