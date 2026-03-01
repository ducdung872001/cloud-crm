import React, { useState } from "react";
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

interface InvoiceFormData {
  templateCode: string;
  symbol: string;
  invoiceNo: string;
  invoiceDate: string;
  buyerName: string;
  taxCode: string;
  address: string;
  bankAccount: string;
  paymentMethod: string;
  emailReceive: string;
  items: InvoiceItem[];
  note: string;
}

const DEFAULT_FORM: InvoiceFormData = {
  templateCode: "01GTKT0/001 – HĐ GTGT điện tử",
  symbol: "C26TNA",
  invoiceNo: "0000129",
  invoiceDate: "28/02/2026",
  buyerName: "Công ty TNHH Thương mại ABC",
  taxCode: "VD.: 0311234567",
  address: "15 Nguyễn Huệ, Phường Bến Nghé, Q.1, TP.HCM",
  bankAccount: "0012345678",
  paymentMethod: "Chuyển khoản",
  emailReceive: "ketoan@abc.vn",
  items: [
    { id: 1, name: "Áo thun oversize unisex", unit: "Cái", qty: 5, unitPrice: 2_000_000, taxRate: 10, total: 10_000_000 },
    { id: 2, name: "Quần jogger thể thao",    unit: "Cái", qty: 2, unitPrice: 1_500_000, taxRate: 10, total: 3_000_000 },
  ],
  note: "Hàng đã giao đủ theo hợp đồng số HD-2026-0128.",
};

const STEPS = [
  { no: 1, label: "Thông tin người mua" },
  { no: 2, label: "Hàng hóa / dịch vụ" },
  { no: 3, label: "Xem trước & ký số" },
  { no: 4, label: "Phát hành & gửi mail" },
];

const formatCurrency = (v: number) => v.toLocaleString("vi-VN");

interface IssueInvoiceProps {
  /** Parent đăng ký fn mở preview modal — dùng cho 2 nút header ở InvoiceVATOverview */
  registerOpenPreview?: (fn: () => void) => void;
}

export default function IssueInvoice({ registerOpenPreview }: IssueInvoiceProps) {
  const [step, setStep] = useState(2);
  const [form, setForm] = useState<InvoiceFormData>(DEFAULT_FORM);

  const subtotal   = form.items.reduce((s, i) => s + i.total, 0);
  const totalVAT   = form.items.reduce((s, i) => s + i.total * i.taxRate / 100, 0);
  const grandTotal = subtotal + totalVAT;

  const setField = (key: keyof InvoiceFormData, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateItem = (id: number, key: keyof InvoiceItem, value: any) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [key]: value };
        updated.total = updated.qty * updated.unitPrice;
        return updated;
      }),
    }));
  };

  const addItem = () => {
    const newId = Math.max(0, ...form.items.map((i) => i.id)) + 1;
    setForm((f) => ({
      ...f,
      items: [...f.items, { id: newId, name: "", unit: "Cái", qty: 1, unitPrice: 0, taxRate: 10, total: 0 }],
    }));
  };

  const removeItem = (id: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.id !== id) }));

  return (
    <div className="tab-xuat-hd">
      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.no}>
            <div
              className={`step${step === s.no ? " active" : ""}${step > s.no ? " done" : ""}`}
              onClick={() => setStep(s.no)}
            >
              <div className="step__circle">
                {step > s.no ? <span>✓</span> : s.no}
              </div>
              <span className="step__label">{s.label}</span>
              {step === s.no && <span className="step__dots">...</span>}
            </div>
            {idx < STEPS.length - 1 && <div className={`step__line${step > s.no ? " done" : ""}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Body */}
      <div className="xuat-hd__body">
        <div className="xuat-hd__main">

          {/* Thông tin hóa đơn — [Mẫu số | Ký hiệu] / [Số HĐ | Ngày xuất] */}
          <div className="form-section">
            <h3>Thông tin hóa đơn</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>MẪU SỐ HÓA ĐƠN</label>
                <select value={form.templateCode} onChange={(e) => setField("templateCode", e.target.value)}>
                  <option>01GTKT0/001 – HĐ GTGT điện tử</option>
                  <option>02GTKT0/001 – HĐ GTGT dịch vụ</option>
                </select>
              </div>
              <div className="form-group">
                <label>KÝ HIỆU</label>
                <input value={form.symbol} onChange={(e) => setField("symbol", e.target.value)} />
              </div>
              <div className="form-group">
                <label>SỐ HÓA ĐƠN</label>
                <input value={form.invoiceNo} readOnly className="readonly" />
              </div>
              <div className="form-group">
                <label>NGÀY XUẤT HÓA ĐƠN</label>
                <input
                  type="date"
                  value={form.invoiceDate.split("/").reverse().join("-")}
                  onChange={(e) => {
                    const [y, m, d] = e.target.value.split("-");
                    setField("invoiceDate", `${d}/${m}/${y}`);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Thông tin người mua */}
          <div className="form-section">
            <div className="section-title-row">
              <h3>Thông tin người mua</h3>
              <p className="section-sub">Doanh nghiệp hoặc cá nhân</p>
              <button className="btn-find-customer">
                <Icon name="Search" /> Tìm khách hàng
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group col-span-full">
                <label>TÊN ĐƠN VỊ / HỌ TÊN NGƯỜI MUA</label>
                <input value={form.buyerName} onChange={(e) => setField("buyerName", e.target.value)} />
              </div>
              <div className="form-group">
                <label>MÃ SỐ THUẾ</label>
                <input value={form.taxCode} onChange={(e) => setField("taxCode", e.target.value)} placeholder="VD.: 0311234567" />
              </div>
              <div className="form-group">
                <label>HÌNH THỨC THANH TOÁN</label>
                <select value={form.paymentMethod} onChange={(e) => setField("paymentMethod", e.target.value)}>
                  <option>Chuyển khoản</option>
                  <option>Tiền mặt</option>
                  <option>Thẻ</option>
                </select>
              </div>
              <div className="form-group col-span-full">
                <label>ĐỊA CHỈ</label>
                <input value={form.address} onChange={(e) => setField("address", e.target.value)} />
              </div>
              <div className="form-group">
                <label>SỐ TÀI KHOẢN</label>
                <input value={form.bankAccount} onChange={(e) => setField("bankAccount", e.target.value)} />
              </div>
              <div className="form-group">
                <label>EMAIL NHẬN HÓA ĐƠN</label>
                <input type="email" value={form.emailReceive} onChange={(e) => setField("emailReceive", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Hàng hóa / Dịch vụ */}
          <div className="form-section">
            <h3>Hàng hóa / Dịch vụ</h3>
            <table className="items-table">
              <thead>
              <tr>
                <th className="col-stt">#</th>
                <th>TÊN HÀNG HÓA / DỊCH VỤ</th>
                <th className="col-unit">ĐVT</th>
                <th className="col-qty">SL</th>
                <th className="col-price">ĐƠN GIÁ</th>
                <th className="col-tax">THUẾ SUẤT</th>
                <th className="col-total">THÀNH TIỀN</th>
                <th className="col-del"></th>
              </tr>
              </thead>
              <tbody>
              {form.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="col-stt text-center">{idx + 1}</td>
                  <td>
                    <input className="inline-input" value={item.name} placeholder="Nhập tên hàng hóa..." onChange={(e) => updateItem(item.id, "name", e.target.value)} />
                  </td>
                  <td>
                    <input className="inline-input text-center" value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} />
                  </td>
                  <td>
                    <input className="inline-input text-center" type="number" min={1} value={item.qty} onChange={(e) => updateItem(item.id, "qty", +e.target.value)} />
                  </td>
                  <td>
                    <input className="inline-input text-right" type="number" min={0} value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", +e.target.value)} />
                  </td>
                  <td className="text-center">
                    <select className="inline-select" value={item.taxRate} onChange={(e) => updateItem(item.id, "taxRate", +e.target.value)}>
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={8}>8%</option>
                      <option value={10}>10%</option>
                    </select>
                  </td>
                  <td className="text-right col-total-val">{formatCurrency(item.total)}</td>
                  <td className="col-del">
                    <button className="btn-del-item" onClick={() => removeItem(item.id)}>×</button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
            <button className="btn-add-item" onClick={addItem}>+ Thêm dòng hàng hóa</button>
          </div>

          {/* Ghi chú */}
          <div className="form-section">
            <h3>Ghi chú</h3>
            <textarea className="note-textarea" rows={3} value={form.note} onChange={(e) => setField("note", e.target.value)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="xuat-hd__sidebar">
          <div className="sidebar-summary">
            <h4>Tổng hợp hóa đơn</h4>
            <div className="summary-row">
              <span>Tiền hàng chưa thuế</span>
              <span>{formatCurrency(subtotal)}đ</span>
            </div>
            <div className="summary-row vat-row">
              <span>Thuế GTGT (10%)</span>
              <span>{formatCurrency(totalVAT)}đ</span>
            </div>
            <div className="summary-row discount-row">
              <span>Chiết khấu</span>
              <span>0đ</span>
            </div>
            <div className="summary-total">
              <span>TỔNG TIỀN THANH TOÁN</span>
              <span>{formatCurrency(grandTotal)}đ</span>
            </div>
            <p className="summary-note">Bằng chữ: Mười bốn triệu ba trăm nghìn đồng chẵn.</p>
          </div>

          <div className="sidebar-sign">
            <h4>Ký số điện tử</h4>
            <div className="sign-notice">
              <Icon name="Info" />
              <p>Hóa đơn sẽ được ký bằng chứng thư số của doanh nghiệp trước khi phát hành cho khách hàng.</p>
            </div>
            <div className="form-group">
              <label>CHỨNG THƯ SỐ (TOKEN)</label>
              <select><option>POSME FASHION STORE – Viettel-CA</option></select>
            </div>
            <div className="cert-status valid">
              <Icon name="CheckCircle" />
              <div>
                <span className="cert-label">Chứng thư còn hiệu lực</span>
                <span className="cert-sub">Hết hạn 31/08/2026 · Serial: 3A8C504</span>
              </div>
            </div>
          </div>

          <div className="sidebar-email">
            <h4>Gửi hóa đơn cho khách</h4>
            <div className="form-group">
              <label>EMAIL NHẬN HÓA ĐƠN</label>
              <input type="email" value={form.emailReceive} onChange={(e) => setField("emailReceive", e.target.value)} />
            </div>
            <div className="form-group">
              <label>NỘI DUNG EMAIL</label>
              <textarea rows={3} defaultValue="Kính gửi Quý khách hàng, Vui lòng xem hóa đơn VAT điện tử đính kèm." />
            </div>
            <div className="sidebar-email-actions">
              {/* Xem trước: chỉ showToast, không mở modal */}
              <button
                className="btn-preview-sm"
                onClick={() => showToast("Đang xem trước email...", "warning")}
              >
                <Icon name="Eye" /> Xem trước
              </button>
              {/* Phát hành & tới: chỉ showToast */}
              <button
                className="btn-publish-sm"
                onClick={() => showToast("Đã phát hành & gửi email!", "success")}
              >
                Phát hành &amp; Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}