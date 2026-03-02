import React from "react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import "./style.scss";

// ---- Types ----
interface InvoiceItem {
  id: number;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface InvoicePreviewData {
  // Người bán
  sellerName: string;
  sellerTaxCode: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerBankAccount: string;
  sellerBankName: string;
  // Hóa đơn
  templateCode: string;
  symbol: string;
  invoiceNo: string;
  invoiceDate: string;
  // Người mua
  buyerName: string;
  buyerTaxCode: string;
  buyerAddress: string;
  paymentMethod: string;
  emailReceive: string;
  // Hàng hóa
  items: InvoiceItem[];
  note: string;
}

interface Props {
  isOpen: boolean;
  data: InvoicePreviewData;
  onClose: () => void;
  onPublish: () => void;
}

const formatCurrency = (v: number) => v.toLocaleString("vi-VN");

export default function InvoicePreviewModal({ isOpen, data, onClose, onPublish }: Props) {
  if (!isOpen) return null;

  const subtotal   = data.items.reduce((s, i) => s + i.total, 0);
  const totalVAT   = data.items.reduce((s, i) => s + i.total * i.taxRate / 100, 0);
  const grandTotal = subtotal + totalVAT;

  const handlePrint = () => {
    window.print();
  };

  const handlePublish = () => {
    onClose();
    showToast("Phát hành hóa đơn thành công!", "success");
  };

  return (
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>

        {/* Modal header */}
        <div className="invoice-modal__header">
          <h2>Xem trước hóa đơn GTGT</h2>
          <div className="invoice-modal__header-actions">
            <button className="btn-print" onClick={handlePrint}>
              <Icon name="Printer" /> In
            </button>
            <button className="btn-pdf">
              <Icon name="Download" /> PDF
            </button>
            <button className="btn-close-modal" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Invoice paper */}
        <div className="invoice-paper">

          {/* Paper header — dark navy */}
          <div className="paper__top">
            <div className="paper__seller">
              <div className="paper__seller-name">{data.sellerName}</div>
              <div className="paper__seller-meta">MST: {data.sellerTaxCode}</div>
              <div className="paper__seller-meta">{data.sellerAddress}</div>
              <div className="paper__seller-meta">ĐT: {data.sellerPhone} · {data.sellerEmail}</div>
            </div>
            <div className="paper__invoice-info">
              <div className="paper__title">HÓA ĐƠN GTGT</div>
              <div className="paper__meta">Mẫu số: {data.templateCode.split("–")[0].trim()}</div>
              <div className="paper__meta">
                Ký hiệu: <strong>{data.symbol}</strong>
                &nbsp;|&nbsp; Số: <strong>{data.invoiceNo}</strong>
              </div>
              <div className="paper__meta">Ngày {data.invoiceDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "ngày $1 tháng $2 năm $3")}</div>
            </div>
          </div>

          {/* Parties */}
          <div className="paper__parties">
            <div className="paper__party">
              <div className="paper__party-label">ĐƠN VỊ BÁN HÀNG</div>
              <div className="paper__party-name">{data.sellerName}</div>
              <div className="paper__party-line">Địa chỉ: {data.sellerAddress}</div>
              <div className="paper__party-line">Điện thoại: {data.sellerPhone}</div>
              <div className="paper__party-line">Số TK: {data.sellerBankAccount} – {data.sellerBankName}</div>
              <div className="paper__party-taxbadge">MST: {data.sellerTaxCode}</div>
            </div>
            <div className="paper__party">
              <div className="paper__party-label">NGƯỜI MUA HÀNG</div>
              <div className="paper__party-name">{data.buyerName}</div>
              <div className="paper__party-line">Địa chỉ: {data.buyerAddress}</div>
              <div className="paper__party-line">Hình thức TT: {data.paymentMethod}</div>
              <div className="paper__party-line">Email: {data.emailReceive}</div>
              {data.buyerTaxCode && (
                <div className="paper__party-taxbadge">MST: {data.buyerTaxCode}</div>
              )}
            </div>
          </div>

          {/* Items table */}
          <table className="paper__table">
            <thead>
            <tr>
              <th className="col-tt">TT</th>
              <th>TÊN HÀNG HOÁ, DỊCH VỤ</th>
              <th className="col-dvt">ĐVT</th>
              <th className="col-sl">SL</th>
              <th className="col-dg">ĐƠN GIÁ</th>
              <th className="col-thue">THUẾ</th>
              <th className="col-tt2">THÀNH TIỀN</th>
            </tr>
            </thead>
            <tbody>
            {data.items.map((item, idx) => (
              <tr key={item.id}>
                <td className="text-center">{idx + 1}</td>
                <td>
                  <div className="item-name">{item.name}</div>
                </td>
                <td className="text-center">{item.unit}</td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="text-center">{item.taxRate}%</td>
                <td className="text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
            </tbody>
          </table>

          {/* Totals + note */}
          <div className="paper__bottom">
            <div className="paper__note">
              <div className="paper__note-label">Ghi chú:</div>
              <div className="paper__note-text">{data.note}</div>
              <div className="paper__note-words">Bằng chữ: Mười bốn triệu ba trăm nghìn đồng chẵn.</div>
            </div>
            <div className="paper__totals">
              <div className="paper__total-row">
                <span>Cộng tiền hàng:</span>
                <span>{formatCurrency(subtotal)}&nbsp;đ</span>
              </div>
              <div className="paper__total-row vat">
                <span>Thuế GTGT (10%):</span>
                <span>{formatCurrency(totalVAT)}&nbsp;đ</span>
              </div>
              <div className="paper__total-grand">
                <span>Tổng tiền TT:</span>
                <span>{formatCurrency(grandTotal)}&nbsp;đ</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="paper__signatures">
            <div className="paper__sig">
              <div className="paper__sig-title">Người mua hàng</div>
              <div className="paper__sig-sub">(Ký, ghi rõ họ tên)</div>
              <div className="paper__sig-line" />
              <div className="paper__sig-name">Đại diện Cty TNHH ABC</div>
            </div>
            <div className="paper__sig paper__sig--right">
              <div className="paper__sig-title">Người bán hàng</div>
              <div className="paper__sig-sub">(Ký, đóng dấu)</div>
              <div className="paper__stamp">
                <div className="stamp-circle">
                  <span>ĐÃ KÝ SỐ</span>
                  <span>{data.sellerName.split(" ").slice(-1)[0]}</span>
                  <span>{data.invoiceDate.split("/").slice(0, 2).join("/")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="invoice-modal__footer">
          <button className="btn-back" onClick={onClose}>
            Quay lại chỉnh sửa
          </button>
          <button className="btn-sign-publish" onClick={handlePublish}>
            <Icon name="Send" /> Ký số &amp; Phát hành ngay
          </button>
        </div>
      </div>
    </div>
  );
}