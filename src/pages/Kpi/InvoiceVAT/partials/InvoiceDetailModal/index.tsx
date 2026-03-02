import React, { useState } from "react";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import { showToast } from "utils/common";
import "./style.scss";

// ---- Types ----
type BadgeVariant = "success" | "warning" | "error" | "transparent" | "primary" | "secondary" | "done" | "wait-collect";

export interface InvoiceDetailItem {
  id: number;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface InvoiceDetailData {
  invoiceNo: string;
  symbol: string;
  invoiceDate: string;
  providerName: string;
  templateCode: string;
  status: "issued" | "pending_sign" | "error";
  buyerName: string;
  buyerTaxCode?: string;
  buyerAddress: string;
  paymentMethod: string;
  emailReceive: string;
  items: InvoiceDetailItem[];
  cqtCode?: string;
}

interface Props {
  isOpen: boolean;
  data: InvoiceDetailData | null;
  onClose: () => void;
}

const fmt = (v: number) => v.toLocaleString("vi-VN") + "đ";

const STATUS_MAP: Record<string, { text: string; variant: BadgeVariant }> = {
  issued:       { text: "• Đã phát hành", variant: "success" },
  pending_sign: { text: "• Chờ ký số",    variant: "warning" },
  error:        { text: "• Bị lỗi / hủy", variant: "error"   },
};

export default function InvoiceDetailModal({ isOpen, data, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const subtotal   = data.items.reduce((s, i) => s + i.total, 0);
  const totalVAT   = data.items.reduce((s, i) => s + i.total * i.taxRate / 100, 0);
  const grandTotal = subtotal + totalVAT;

  const statusInfo = STATUS_MAP[data.status] ?? { text: data.status, variant: "wait-collect" as BadgeVariant };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.cqtCode ?? "").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inv-detail-overlay" onClick={onClose}>
      <div className="inv-detail-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="idm__header">
          <div className="idm__header-left">
            <h2>Hóa đơn GTGT số {data.invoiceNo}</h2>
            <span className="idm__meta">
              Ký hiệu {data.symbol} · Ngày {data.invoiceDate} · {data.providerName}
            </span>
          </div>
          <div className="idm__header-right">
            <Badge text={statusInfo.text} variant={statusInfo.variant} />
            <button className="idm__close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="idm__body">

          {/* Info 2×4 grid */}
          <div className="idm__info-grid">
            <div className="info-cell">
              <span className="ic-label">SỐ HÓA ĐƠN</span>
              <span className="ic-value">{data.invoiceNo}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">MẪU SỐ / KÝ HIỆU</span>
              <span className="ic-value">{data.templateCode} – {data.symbol}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">NGÀY XUẤT</span>
              <span className="ic-value">{data.invoiceDate}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">HÌNH THỨC TT</span>
              <span className="ic-value">{data.paymentMethod}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">NGƯỜI MUA</span>
              <span className="ic-value ic-bold">{data.buyerName}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">MÃ SỐ THUẾ</span>
              <span className="ic-value">{data.buyerTaxCode ?? "Cá nhân"}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">ĐỊA CHỈ</span>
              <span className="ic-value">{data.buyerAddress}</span>
            </div>
            <div className="info-cell">
              <span className="ic-label">EMAIL NHẬN HĐ</span>
              <span className="ic-value">{data.emailReceive}</span>
            </div>
          </div>

          {/* Items table */}
          <div className="idm__items-wrap">
            <div className="idm__section-label">HÀNG HÓA / DỊCH VỤ</div>
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
              {data.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="text-center">{idx + 1}</td>
                  <td>{item.name}</td>
                  <td className="text-center">{item.unit}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right">{fmt(item.unitPrice)}</td>
                  <td className="text-center">
                    <span className="tax-pill">{item.taxRate}%</span>
                  </td>
                  <td className="text-right fw-600">{fmt(item.total)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="idm__totals">
            <div className="tot-row">
              <span>Tiền hàng chưa thuế</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="tot-row tot-vat">
              <span>Thuế GTGT (10%)</span>
              <span>{fmt(totalVAT)}</span>
            </div>
            <div className="tot-grand">
              <span>Tổng thanh toán</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>

          {/* CQT Code */}
          {data.cqtCode && (
            <div className="idm__cqt">
              <div className="cqt-icon-wrap">
                <Icon name="Lock" />
              </div>
              <div className="cqt-info">
                <span className="cqt-label">MÃ TRA CỨU CQT (TCT)</span>
                <span className="cqt-code">{data.cqtCode}</span>
              </div>
              <button className="cqt-copy-btn" onClick={handleCopy}>
                {copied ? "Đã sao chép!" : "Sao chép"}
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="idm__footer">
          <button className="idm-btn idm-btn--outline" onClick={() => showToast("Đang tải PDF...", "warning")}>
            <Icon name="Download" /> Tải PDF
          </button>
          <button className="idm-btn idm-btn--outline" onClick={() => showToast("Đã gửi lại email!", "success")}>
            <Icon name="Send" /> Gửi lại email
          </button>
          <button className="idm-btn idm-btn--outline" onClick={() => showToast("Chức năng đang phát triển", "warning")}>
            <Icon name="Edit" /> Điều chỉnh HĐ
          </button>
          <button className="idm-btn idm-btn--primary" onClick={onClose}>Đóng</button>
        </div>

      </div>
    </div>
  );
}