import React, { useState, useEffect } from "react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import VatInvoiceService, { VatConfig } from "services/VatInvoiceService";
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

// ---- Toggle component ----
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}
function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      className={`toggle-switch${checked ? " on" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      aria-checked={checked}
      role="switch"
      disabled={disabled}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

// ---- Helpers ----
const TAX_RATE_MAP: Record<string, number> = { "0%": 0, "5%": 5, "8%": 8, "10%": 10 };
const TAX_RATE_REVERSE: Record<number, string> = { 0: "0%", 5: "5%", 8: "8%", 10: "10%" };
const CURRENCY_MAP: Record<string, string> = {
  "VNĐ – Việt Nam Đồng": "VND",
  "USD – US Dollar": "USD",
  "EUR – Euro": "EUR",
};
const CURRENCY_REVERSE: Record<string, string> = {
  VND: "VNĐ – Việt Nam Đồng",
  USD: "USD – US Dollar",
  EUR: "EUR – Euro",
};

/** Đẩy config lên window globals để các component khác đọc được */
function applyConfigToGlobals(cfg: VatConfig) {
  (window as any).__VAT_SUPPLIER_TAX_CODE__ = cfg.taxCode;
  (window as any).__VAT_TEMPLATE_CODE__ = cfg.defaultTemplateCode;
  (window as any).__VAT_CONFIG__ = cfg;
}

export default function Configuration() {
  const [business, setBusiness] = useState<BusinessInfo>({
    companyName: "", taxCode: "", phone: "", address: "",
    email: "", website: "", bankAccount: "", bankName: "Vietcombank – CN TP.HCM",
  });
  const [invoice, setInvoice] = useState<InvoiceConfig>({
    templateCode: "01GTKT0/001 – HĐ GTGT", symbol: "C26TNA",
    defaultTaxRate: "10%", currency: "VNĐ – Việt Nam Đồng",
  });
  const [auto, setAuto] = useState<AutomationConfig>({
    autoExportOnComplete: true, autoSendEmail: true,
    remindPendingSign: true, allowPostPay: false,
  });

  const [loadingGet, setLoadingGet] = useState(true);
  const [saving, setSaving] = useState(false);

  const setB = (k: keyof BusinessInfo, v: string) => setBusiness((p) => ({ ...p, [k]: v }));
  const setI = (k: keyof InvoiceConfig, v: string) => setInvoice((p) => ({ ...p, [k]: v }));
  const setA = (k: keyof AutomationConfig, v: boolean) => setAuto((p) => ({ ...p, [k]: v }));

  // ── Load config on mount ────────────────────────────────────────────────
  useEffect(() => {
    setLoadingGet(true);
    VatInvoiceService.getConfig()
      .then((res: any) => {
        if (res?.code === 0 && res.result) {
          const c: VatConfig = res.result;
          setBusiness({
            companyName: c.companyName || "",
            taxCode: c.taxCode || "",
            phone: c.phone || "",
            address: c.address || "",
            email: c.email || "",
            website: c.website || "",
            bankAccount: c.bankAccount || "",
            bankName: c.bankName || "Vietcombank – CN TP.HCM",
          });
          setInvoice({
            templateCode: c.defaultTemplateCode?.includes("02")
              ? "02GTKT0/001 – HĐ GTGT dịch vụ"
              : "01GTKT0/001 – HĐ GTGT",
            symbol: c.defaultInvoiceSeries || "C26TNA",
            defaultTaxRate: TAX_RATE_REVERSE[c.defaultTaxRate] || "10%",
            currency: CURRENCY_REVERSE[c.currencyCode] || "VNĐ – Việt Nam Đồng",
          });
          setAuto({
            autoExportOnComplete: c.autoIssueOnComplete ?? true,
            autoSendEmail: c.autoSendEmail ?? true,
            remindPendingSign: c.remindPendingSign ?? true,
            allowPostPay: c.allowDeferredIssue ?? false,
          });
          applyConfigToGlobals(c);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingGet(false));
  }, []);

  // ── Save config ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const templateCode = invoice.templateCode.includes("02") ? "2/6553" : "1/6553";
      const body: VatConfig = {
        companyName: business.companyName,
        taxCode: business.taxCode,
        phone: business.phone,
        address: business.address,
        email: business.email,
        website: business.website,
        bankAccount: business.bankAccount,
        bankName: business.bankName,
        defaultTemplateCode: templateCode,
        defaultInvoiceSeries: invoice.symbol,
        defaultTaxRate: TAX_RATE_MAP[invoice.defaultTaxRate] ?? 10,
        currencyCode: CURRENCY_MAP[invoice.currency] || "VND",
        autoIssueOnComplete: auto.autoExportOnComplete,
        autoSendEmail: auto.autoSendEmail,
        remindPendingSign: auto.remindPendingSign,
        allowDeferredIssue: auto.allowPostPay,
      };

      const res = await VatInvoiceService.saveConfig(body);
      if (res?.code === 0) {
        applyConfigToGlobals(body);
        showToast("Lưu cấu hình thành công!", "success");
      } else {
        showToast(res?.message || "Lưu cấu hình thất bại.", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi lưu cấu hình.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-cau-hinh">
      {loadingGet && (
        <div className="cah__loading-overlay">
          <div className="cah__spinner" />
          <span>Đang tải cấu hình...</span>
        </div>
      )}

      {/* Two-column grid */}
      <div className="cah__grid" style={{ opacity: loadingGet ? 0.4 : 1, pointerEvents: loadingGet ? "none" : "auto", transition: "opacity 0.2s" }}>

        {/* LEFT: Thông tin doanh nghiệp */}
        <div className="cah__card">
          <h3>Thông tin doanh nghiệp bán hàng</h3>
          <div className="form-grid-cah">
            <div className="field col-full">
              <label>TÊN DOANH NGHIỆP</label>
              <input value={business.companyName} onChange={(e) => setB("companyName", e.target.value)} disabled={loadingGet} />
            </div>
            <div className="field">
              <label>MÃ SỐ THUẾ</label>
              <input value={business.taxCode} onChange={(e) => setB("taxCode", e.target.value)} disabled={loadingGet} />
            </div>
            <div className="field">
              <label>SỐ ĐIỆN THOẠI</label>
              <input value={business.phone} onChange={(e) => setB("phone", e.target.value)} disabled={loadingGet} />
            </div>
            <div className="field col-full">
              <label>ĐỊA CHỈ</label>
              <input value={business.address} onChange={(e) => setB("address", e.target.value)} disabled={loadingGet} />
            </div>
            <div className="field">
              <label>EMAIL DOANH NGHIỆP</label>
              <input type="email" value={business.email} onChange={(e) => setB("email", e.target.value)} disabled={loadingGet} />
            </div>
            <div className="field">
              <label>WEBSITE</label>
              <input value={business.website} onChange={(e) => setB("website", e.target.value)} disabled={loadingGet} />
            </div>
            <div className="field">
              <label>SỐ TÀI KHOẢN NGÂN HÀNG</label>
              <input value={business.bankAccount} onChange={(e) => setB("bankAccount", e.target.value)} disabled={loadingGet} />
            </div>
            <div className="field">
              <label>NGÂN HÀNG</label>
              <select value={business.bankName} onChange={(e) => setB("bankName", e.target.value)} disabled={loadingGet}>
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
                <select value={invoice.templateCode} onChange={(e) => setI("templateCode", e.target.value)} disabled={loadingGet}>
                  <option>01GTKT0/001 – HĐ GTGT</option>
                  <option>02GTKT0/001 – HĐ GTGT dịch vụ</option>
                </select>
              </div>
              <div className="field">
                <label>KÝ HIỆU MẶC ĐỊNH</label>
                <input value={invoice.symbol} onChange={(e) => setI("symbol", e.target.value)} disabled={loadingGet} />
              </div>
              <div className="field">
                <label>THUẾ SUẤT MẶC ĐỊNH</label>
                <select value={invoice.defaultTaxRate} onChange={(e) => setI("defaultTaxRate", e.target.value)} disabled={loadingGet}>
                  <option>0%</option>
                  <option>5%</option>
                  <option>8%</option>
                  <option>10%</option>
                </select>
              </div>
              <div className="field">
                <label>ĐƠN VỊ TIỀN TỆ</label>
                <select value={invoice.currency} onChange={(e) => setI("currency", e.target.value)} disabled={loadingGet}>
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
                disabled={loadingGet}
              />
              <AutoRow
                label="Tự động gửi email cho khách"
                sub="Gửi PDF hóa đơn ngay sau khi ký số thành công"
                checked={auto.autoSendEmail}
                onChange={(v) => setA("autoSendEmail", v)}
                disabled={loadingGet}
              />
              <AutoRow
                label="Nhắc nhở ký số hóa đơn tồn đọng"
                sub="Thông báo khi có HĐ chờ ký > 24 giờ"
                checked={auto.remindPendingSign}
                onChange={(v) => setA("remindPendingSign", v)}
                disabled={loadingGet}
              />
              <AutoRow
                label="Cho phép xuất HĐ trả sau"
                sub="Cho phép xuất HĐ trước khi thanh toán"
                checked={auto.allowPostPay}
                onChange={(v) => setA("allowPostPay", v)}
                disabled={loadingGet}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button (fixed at bottom or part of header - rendered by parent) */}
      <div className="cah__save-bar">
        <button className="cah__save-btn" onClick={handleSave} disabled={saving || loadingGet}>
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
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
  disabled?: boolean;
}
function AutoRow({ label, sub, checked, onChange, disabled }: AutoRowProps) {
  return (
    <div className="auto-row">
      <div className="auto-row__text">
        <span className="auto-row__label">{label}</span>
        <span className="auto-row__sub">{sub}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}
