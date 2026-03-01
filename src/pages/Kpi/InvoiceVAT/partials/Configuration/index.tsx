import React, { useState } from "react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import "./style.scss";

// ---- Types ----
interface BusinessInfo {
  companyName: string;
  taxCode: string;
  phone: string;
  address: string;
  email: string;
  website: string;
  bankAccount: string;
  bankName: string;
}

interface InvoiceConfig {
  templateCode: string;
  symbol: string;
  defaultTaxRate: string;
  currency: string;
}

interface AutomationConfig {
  autoExportOnComplete: boolean;
  autoSendEmail: boolean;
  remindPendingSign: boolean;
  allowPostPay: boolean;
}

// ---- Mock defaults ----
const DEFAULT_BUSINESS: BusinessInfo = {
  companyName: "POSME FASHION STORE",
  taxCode: "0311987654",
  phone: "028 1234 5678",
  address: "123 Nguyễn Huệ, P.Bến Nghé, Q.1, TP.HCM",
  email: "info@posme.vn",
  website: "www.posme.store",
  bankAccount: "0011234567890",
  bankName: "Vietcombank – CN TP.HCM",
};

const DEFAULT_INVOICE: InvoiceConfig = {
  templateCode: "01GTKT0/001 – HĐ GTGT",
  symbol: "C26TNA",
  defaultTaxRate: "10%",
  currency: "VNĐ – Việt Nam Đồng",
};

const DEFAULT_AUTO: AutomationConfig = {
  autoExportOnComplete: true,
  autoSendEmail: true,
  remindPendingSign: true,
  allowPostPay: false,
};

// ---- Toggle component ----
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      className={`toggle-switch${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
    >
      <span className="toggle-thumb" />
    </button>
  );
}

export default function Configuration() {
  const [business, setBusiness] = useState<BusinessInfo>(DEFAULT_BUSINESS);
  const [invoice,  setInvoice]  = useState<InvoiceConfig>(DEFAULT_INVOICE);
  const [auto,     setAuto]     = useState<AutomationConfig>(DEFAULT_AUTO);

  const setB = (k: keyof BusinessInfo, v: string) => setBusiness((p) => ({ ...p, [k]: v }));
  const setI = (k: keyof InvoiceConfig, v: string) => setInvoice((p) => ({ ...p, [k]: v }));
  const setA = (k: keyof AutomationConfig, v: boolean) => setAuto((p) => ({ ...p, [k]: v }));

  const handleSave = () => showToast("Lưu cấu hình thành công!", "success");

  return (
    <div className="tab-cau-hinh">
      {/* Two-column grid */}
      <div className="cah__grid">

        {/* LEFT: Thông tin doanh nghiệp */}
        <div className="cah__card">
          <h3>Thông tin doanh nghiệp bán hàng</h3>
          <div className="form-grid-cah">
            <div className="field col-full">
              <label>TÊN DOANH NGHIỆP</label>
              <input value={business.companyName} onChange={(e) => setB("companyName", e.target.value)} />
            </div>
            <div className="field">
              <label>MÃ SỐ THUẾ</label>
              <input value={business.taxCode} onChange={(e) => setB("taxCode", e.target.value)} />
            </div>
            <div className="field">
              <label>SỐ ĐIỆN THOẠI</label>
              <input value={business.phone} onChange={(e) => setB("phone", e.target.value)} />
            </div>
            <div className="field col-full">
              <label>ĐỊA CHỈ</label>
              <input value={business.address} onChange={(e) => setB("address", e.target.value)} />
            </div>
            <div className="field">
              <label>EMAIL DOANH NGHIỆP</label>
              <input type="email" value={business.email} onChange={(e) => setB("email", e.target.value)} />
            </div>
            <div className="field">
              <label>WEBSITE</label>
              <input value={business.website} onChange={(e) => setB("website", e.target.value)} />
            </div>
            <div className="field">
              <label>SỐ TÀI KHOẢN NGÂN HÀNG</label>
              <input value={business.bankAccount} onChange={(e) => setB("bankAccount", e.target.value)} />
            </div>
            <div className="field">
              <label>NGÂN HÀNG</label>
              <select value={business.bankName} onChange={(e) => setB("bankName", e.target.value)}>
                <option>Vietcombank – CN TP.HCM</option>
                <option>Techcombank – CN TP.HCM</option>
                <option>VietinBank – CN TP.HCM</option>
                <option>BIDV – CN TP.HCM</option>
                <option>MB Bank – CN TP.HCM</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT column stacks two cards */}
        <div className="cah__right">

          {/* Mẫu & Ký hiệu hóa đơn */}
          <div className="cah__card">
            <h3>Mẫu &amp; Ký hiệu hóa đơn</h3>
            <div className="form-grid-cah">
              <div className="field">
                <label>MẪU SỐ MẶC ĐỊNH</label>
                <select value={invoice.templateCode} onChange={(e) => setI("templateCode", e.target.value)}>
                  <option>01GTKT0/001 – HĐ GTGT</option>
                  <option>02GTKT0/001 – HĐ GTGT dịch vụ</option>
                </select>
              </div>
              <div className="field">
                <label>KÝ HIỆU MẶC ĐỊNH</label>
                <input value={invoice.symbol} onChange={(e) => setI("symbol", e.target.value)} />
              </div>
              <div className="field">
                <label>THUẾ SUẤT MẶC ĐỊNH</label>
                <select value={invoice.defaultTaxRate} onChange={(e) => setI("defaultTaxRate", e.target.value)}>
                  <option>0%</option>
                  <option>5%</option>
                  <option>8%</option>
                  <option>10%</option>
                </select>
              </div>
              <div className="field">
                <label>ĐƠN VỊ TIỀN TỆ</label>
                <select value={invoice.currency} onChange={(e) => setI("currency", e.target.value)}>
                  <option>VNĐ – Việt Nam Đồng</option>
                  <option>USD – US Dollar</option>
                  <option>EUR – Euro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tự động hóa */}
          <div className="cah__card">
            <h3>Tự động hóa</h3>
            <div className="auto-list">
              <AutoRow
                label="Tự động xuất HĐ khi hoàn thành đơn"
                sub='Tự động tạo HĐVAT khi đơn hàng chuyển sang "Hoàn thành"'
                checked={auto.autoExportOnComplete}
                onChange={(v) => setA("autoExportOnComplete", v)}
              />
              <AutoRow
                label="Tự động gửi email cho khách"
                sub="Gửi PDF hóa đơn ngay sau khi ký số thành công"
                checked={auto.autoSendEmail}
                onChange={(v) => setA("autoSendEmail", v)}
              />
              <AutoRow
                label="Nhắc nhở ký số hóa đơn tồn đọng"
                sub="Thông báo khi có HĐ chờ ký > 24 giờ"
                checked={auto.remindPendingSign}
                onChange={(v) => setA("remindPendingSign", v)}
              />
              <AutoRow
                label="Cho phép xuất HĐ trả sau"
                sub="Cho phép xuất HĐ trước khi thanh toán"
                checked={auto.allowPostPay}
                onChange={(v) => setA("allowPostPay", v)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----
interface AutoRowProps {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}
function AutoRow({ label, sub, checked, onChange }: AutoRowProps) {
  return (
    <div className="auto-row">
      <div className="auto-row__text">
        <span className="auto-row__label">{label}</span>
        <span className="auto-row__sub">{sub}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}