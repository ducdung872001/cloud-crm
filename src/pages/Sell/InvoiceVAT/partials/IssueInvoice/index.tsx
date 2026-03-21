import React, { useState, useCallback, useEffect } from "react";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { numberToWords } from "utils/numberToWords";
import VatInvoiceService, { VatInvoiceRequest, VatItemInfo, VatTaxBreakdown } from "services/VatInvoiceService";
import "./style.scss";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InvoiceItem {
  id:        number;
  name:      string;
  unit:      string;
  qty:       number;
  unitPrice: number;
  taxRate:   number;
  total:     number;
}

interface InvoiceFormData {
  templateCode:  string;
  symbol:        string;
  invoiceNo:     string;
  invoiceDate:   string;
  buyerName:     string;
  taxCode:       string;
  address:       string;
  bankAccount:   string;
  paymentMethod: string;
  emailReceive:  string;
  items:         InvoiceItem[];
  note:          string;
}

const SUPPLIER_TAX_CODE = (window as any).__VAT_SUPPLIER_TAX_CODE__ || "0100109106-501";
const TEMPLATE_CODE     = (window as any).__VAT_TEMPLATE_CODE__     || "1/6553";

const DEFAULT_FORM: InvoiceFormData = {
  templateCode:  "01GTKT0/001 – HĐ GTGT điện tử",
  symbol:        "C26TNA",
  invoiceNo:     "",
  invoiceDate:   new Date().toLocaleDateString("vi-VN"),
  buyerName:     "",
  taxCode:       "",
  address:       "",
  bankAccount:   "",
  paymentMethod: "Chuyển khoản",
  emailReceive:  "",
  items:         [],
  note:          "",
};

const STEPS = [
  { no: 1, label: "Thông tin người mua"  },
  { no: 2, label: "Hàng hóa / dịch vụ"  },
  { no: 3, label: "Xem trước & ký số"    },
  { no: 4, label: "Phát hành & gửi mail" },
];

const fmt = (v: number) => v.toLocaleString("vi-VN");

interface IssueInvoiceProps {
  onRegisterPreview?: (fn: () => void) => void;
  onRegisterPublish?: (fn: () => void) => void;
}

export default function IssueInvoice({ onRegisterPreview, onRegisterPublish }: IssueInvoiceProps) {
  const [step,           setStep]          = useState(2);
  const [form,           setForm]          = useState<InvoiceFormData>(DEFAULT_FORM);
  const [orderCode,      setOrderCode]     = useState("");
  const [loadingOrder,   setLoadingOrder]  = useState(false);
  const [loadingPreview, setLoadingPreview]= useState(false);
  const [loadingPublish, setLoadingPublish]= useState(false);
  const [emailContent,   setEmailContent]  = useState(
    "Kính gửi Quý khách hàng, Vui lòng xem hóa đơn VAT điện tử đính kèm."
  );

  const subtotal   = form.items.reduce((s, i) => s + i.total, 0);
  const totalVAT   = form.items.reduce((s, i) => s + Math.round(i.total * i.taxRate / 100), 0);
  const grandTotal = subtotal + totalVAT;

  const setField = (key: keyof InvoiceFormData, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  const updateItem = (id: number, key: keyof InvoiceItem, value: any) => {
    setForm(f => ({
      ...f,
      items: f.items.map(item => {
        if (item.id !== id) return item;
        const u = { ...item, [key]: value };
        u.total = u.qty * u.unitPrice;
        return u;
      }),
    }));
  };

  const addItem = () => {
    const newId = Math.max(0, ...form.items.map(i => i.id)) + 1;
    setForm(f => ({
      ...f,
      items: [...f.items, { id: newId, name: "", unit: "Cái", qty: 1, unitPrice: 0, taxRate: 10, total: 0 }],
    }));
  };

  const removeItem = (id: number) =>
    setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));

  // ── Tải từ đơn hàng ──────────────────────────────────────────────────────

  const handleLoadOrder = async () => {
    if (!orderCode.trim()) return;
    setLoadingOrder(true);
    try {
      const res = await VatInvoiceService.getInvoiceByCode(orderCode.trim());
      if (res?.code === 0 && res.result) {
        const inv = res.result;
        if (inv.customerName)    setField("buyerName",    inv.customerName);
        if (inv.taxCode)         setField("taxCode",      inv.taxCode);
        if (inv.customerAddress) setField("address",      inv.customerAddress);
        if (inv.customerEmail)   setField("emailReceive", inv.customerEmail);

        const rawProducts: any[] = inv.boughtProducts || inv.items || [];
        if (rawProducts.length > 0) {
          const mappedItems: InvoiceItem[] = rawProducts.map((p: any, idx: number) => {
            const qty      = p.qty || p.quantity || 1;
            const unitPrice= p.price || p.unitPrice || 0;
            return {
              id:        idx + 1,
              name:      p.productName || p.name || p.itemName || "",
              unit:      p.unitName    || p.unit || "Cái",
              qty, unitPrice,
              taxRate:   p.vat != null ? Math.round(p.vat * 100) : 10,
              total:     qty * unitPrice,
            };
          });
          setField("items", mappedItems);
        }
        if (!form.note) setField("note", `Hàng đã giao đủ theo hợp đồng số ${orderCode}.`);
        showToast("Đã tải dữ liệu từ đơn hàng!", "success");
      } else {
        showToast(res?.message || "Không tìm thấy đơn hàng.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối khi tải đơn hàng.", "error");
    } finally {
      setLoadingOrder(false);
    }
  };

  // ── Build request ─────────────────────────────────────────────────────────

  const buildVATRequest = useCallback((): VatInvoiceRequest => {
    const itemInfo: VatItemInfo[] = form.items.map((item, idx) => {
      const taxAmt = Math.round(item.total * item.taxRate / 100);
      return {
        lineNumber: idx + 1, itemName: item.name, unitName: item.unit,
        unitPrice: item.unitPrice, quantity: item.qty,
        itemTotalAmountWithoutTax: item.total, taxPercentage: item.taxRate,
        taxAmount: taxAmt, itemTotalAmountWithTax: item.total + taxAmt,
        itemTotalAmountAfterDiscount: item.total,
        discount: 0, discount2: 0, itemDiscount: 0,
      };
    });

    const taxMap: Record<number, VatTaxBreakdown> = {};
    itemInfo.forEach(i => {
      if (!taxMap[i.taxPercentage])
        taxMap[i.taxPercentage] = { taxPercentage: i.taxPercentage, taxableAmount: 0, taxAmount: 0 };
      taxMap[i.taxPercentage].taxableAmount += i.itemTotalAmountWithoutTax;
      taxMap[i.taxPercentage].taxAmount     += i.taxAmount;
    });

    return {
      supplierTaxCode: SUPPLIER_TAX_CODE,
      generalInvoiceInfo: {
        invoiceType: "1", templateCode: TEMPLATE_CODE, invoiceSeries: form.symbol,
        currencyCode: "VND", exchangeRate: 1, adjustmentType: "1",
        paymentStatus: true, cusGetInvoiceRight: true,
      },
      buyerInfo: {
        buyerName: form.buyerName, buyerLegalName: form.buyerName,
        buyerTaxCode: form.taxCode || undefined,
        buyerAddressLine: form.address || "Việt Nam",
        buyerEmail: form.emailReceive || undefined,
      },
      payments: [{ paymentMethodName: form.paymentMethod }],
      itemInfo, taxBreakdowns: Object.values(taxMap),
      summarizeInfo: {
        totalAmountWithoutTax: subtotal, totalTaxAmount: totalVAT,
        totalAmountWithTax: grandTotal, totalAmountAfterDiscount: grandTotal,
        totalAmountInWords: numberToWords(grandTotal),
      },
      customFields: form.note ? { invoiceNote: form.note } : undefined,
    };
  }, [form, subtotal, totalVAT, grandTotal]);

  // ── Action handlers ───────────────────────────────────────────────────────

  const handlePreview = useCallback(async () => {
    if (form.items.length === 0) {
      showToast("Vui lòng thêm ít nhất một hàng hóa/dịch vụ.", "error"); return;
    }
    setLoadingPreview(true);
    try {
      const req = buildVATRequest();
      req.generalInvoiceInfo.paymentStatus = false;
      const res = await VatInvoiceService.previewDraft(SUPPLIER_TAX_CODE, req);
      if (res?.code === 0) {
        const pdfBase64 = typeof res.result === "string" ? res.result : null;
        if (pdfBase64) {
          try {
            const binary = atob(pdfBase64);
            const bytes  = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: "application/pdf" });
            window.open(URL.createObjectURL(blob), "_blank");
          } catch { showToast("Xem trước thành công!", "success"); }
        } else {
          showToast("Xem trước thành công!", "success");
        }
        setStep(3);
      } else {
        showToast(res?.message || "Không thể xem trước. Kiểm tra lại dữ liệu.", "error");
      }
    } catch { showToast("Lỗi kết nối. Vui lòng thử lại.", "error"); }
    finally  { setLoadingPreview(false); }
  }, [buildVATRequest, form.items.length]);

  const handlePublish = useCallback(async () => {
    if (!form.buyerName.trim()) { showToast("Vui lòng nhập tên người mua.", "error"); return; }
    if (form.items.length === 0){ showToast("Vui lòng thêm hàng hóa.", "error"); return; }
    setLoadingPublish(true);
    try {
      const res = await VatInvoiceService.createInvoice(buildVATRequest());
      if (res?.code === 0) {
        showToast(`Phát hành hóa đơn thành công!${res.result?.invoiceNo ? " Số HĐ: " + res.result.invoiceNo : ""}`, "success");
        setStep(4); setForm({ ...DEFAULT_FORM }); setOrderCode("");
      } else {
        showToast(res?.message || "Phát hành thất bại. Kiểm tra lại.", "error");
      }
    } catch { showToast("Lỗi kết nối. Vui lòng thử lại.", "error"); }
    finally  { setLoadingPublish(false); }
  }, [buildVATRequest, form]);

  const handlePublishAndSend = useCallback(async () => {
    if (!form.buyerName.trim())   { showToast("Vui lòng nhập tên người mua.", "error"); return; }
    if (!form.emailReceive.trim()){ showToast("Vui lòng nhập email nhận hóa đơn.", "error"); return; }
    if (form.items.length === 0)  { showToast("Vui lòng thêm hàng hóa.", "error"); return; }
    setLoadingPublish(true);
    try {
      const res = await VatInvoiceService.createInvoice(buildVATRequest());
      if (res?.code === 0) {
        const uuid      = res.result?.transactionUuid || "";
        const invoiceNo = res.result?.invoiceNo       || "";
        if (uuid) {
          await VatInvoiceService.sendEmailToCustomer({
            supplierTaxCode: SUPPLIER_TAX_CODE,
            transactionUuid: uuid,
            buyerEmail:      form.emailReceive,
          });
          showToast(`Phát hành & gửi email thành công!${invoiceNo ? " Số HĐ: " + invoiceNo : ""}`, "success");
        } else {
          showToast(`Đã phát hành${invoiceNo ? " (" + invoiceNo + ")" : ""} – chưa lấy được UUID để gửi mail.`, "warning");
        }
        setStep(4); setForm({ ...DEFAULT_FORM }); setOrderCode("");
      } else {
        showToast(res?.message || "Phát hành thất bại.", "error");
      }
    } catch { showToast("Lỗi kết nối. Vui lòng thử lại.", "error"); }
    finally  { setLoadingPublish(false); }
  }, [buildVATRequest, form]);

  // Đăng ký callbacks lên parent để header button gọi được
  useEffect(() => { onRegisterPreview?.(handlePreview); }, [handlePreview,  onRegisterPreview]);
  useEffect(() => { onRegisterPublish?.(handlePublish); }, [handlePublish,  onRegisterPublish]);

  // ── Render ────────────────────────────────────────────────────────────────
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
              <div className="step__circle">{step > s.no ? <span>✓</span> : s.no}</div>
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

          {/* Thông tin hóa đơn */}
          <div className="form-section">
            <h3>Thông tin hóa đơn</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>MẪU SỐ HÓA ĐƠN</label>
                <select value={form.templateCode} onChange={e => setField("templateCode", e.target.value)}>
                  <option>01GTKT0/001 – HĐ GTGT điện tử</option>
                  <option>02GTKT0/001 – HĐ GTGT dịch vụ</option>
                </select>
              </div>
              <div className="form-group">
                <label>KÝ HIỆU</label>
                <input value={form.symbol} onChange={e => setField("symbol", e.target.value)} />
              </div>
              <div className="form-group">
                <label>SỐ HÓA ĐƠN</label>
                <input value={form.invoiceNo || "Tự động"} readOnly className="readonly" />
              </div>
              <div className="form-group">
                <label>NGÀY XUẤT HÓA ĐƠN</label>
                <input
                  type="date"
                  value={(() => {
                    const p = form.invoiceDate.split("/");
                    return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : form.invoiceDate;
                  })()}
                  onChange={e => {
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
              <button className="btn-find-customer" onClick={() => showToast("Tìm kiếm khách hàng...", "warning")}>
                <Icon name="Search" /> Tìm khách hàng
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group col-span-full">
                <label>TÊN ĐƠN VỊ / HỌ TÊN NGƯỜI MUA</label>
                <input value={form.buyerName} onChange={e => setField("buyerName", e.target.value)} placeholder="Nhập tên người mua..." />
              </div>
              <div className="form-group">
                <label>MÃ SỐ THUẾ</label>
                <input value={form.taxCode} onChange={e => setField("taxCode", e.target.value)} placeholder="VD.: 0311234567" />
              </div>
              <div className="form-group">
                <label>HÌNH THỨC THANH TOÁN</label>
                <select value={form.paymentMethod} onChange={e => setField("paymentMethod", e.target.value)}>
                  <option>Chuyển khoản</option>
                  <option>Tiền mặt</option>
                  <option>Thẻ</option>
                  <option>Ví điện tử</option>
                </select>
              </div>
              <div className="form-group col-span-full">
                <label>ĐỊA CHỈ</label>
                <input value={form.address} onChange={e => setField("address", e.target.value)} />
              </div>
              <div className="form-group">
                <label>SỐ TÀI KHOẢN</label>
                <input value={form.bankAccount} onChange={e => setField("bankAccount", e.target.value)} />
              </div>
              <div className="form-group">
                <label>EMAIL NHẬN HÓA ĐƠN</label>
                <input type="email" value={form.emailReceive} onChange={e => setField("emailReceive", e.target.value)} placeholder="ketoan@congty.vn" />
              </div>
            </div>
          </div>

          {/* Hàng hóa */}
          <div className="form-section">
            <div className="section-title-row">
              <h3>Hàng hóa / Dịch vụ</h3>
            </div>

            {/* Load từ đơn hàng */}
            <div className="load-from-order">
              <span className="load-from-order__label">Tải từ đơn hàng:</span>
              <input
                className="order-code-input"
                placeholder="Nhập mã đơn hàng (VD: HD-2026-0128)..."
                value={orderCode}
                onChange={e => setOrderCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLoadOrder()}
              />
              <button
                className="btn-load-order"
                onClick={handleLoadOrder}
                disabled={loadingOrder || !orderCode.trim()}
              >
                {loadingOrder ? "Đang tải..." : "Tải hàng hóa"}
              </button>
            </div>

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
                {form.items.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-items">
                        <Icon name="Package" />
                        <span>Chưa có hàng hóa. Nhập mã đơn hàng để tải tự động hoặc thêm thủ công bên dưới.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {form.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="col-stt text-center">{idx + 1}</td>
                    <td>
                      <input className="inline-input" value={item.name} placeholder="Nhập tên hàng hóa..." onChange={e => updateItem(item.id, "name", e.target.value)} />
                    </td>
                    <td>
                      <input className="inline-input text-center" value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} />
                    </td>
                    <td>
                      <input className="inline-input text-center" type="number" min={1} value={item.qty} onChange={e => updateItem(item.id, "qty", +e.target.value)} />
                    </td>
                    <td>
                      <input className="inline-input text-right" type="number" min={0} value={item.unitPrice} onChange={e => updateItem(item.id, "unitPrice", +e.target.value)} />
                    </td>
                    <td className="text-center">
                      <select className="inline-select" value={item.taxRate} onChange={e => updateItem(item.id, "taxRate", +e.target.value)}>
                        <option value={-2}>KCT</option>
                        <option value={-1}>KKKNT</option>
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={8}>8%</option>
                        <option value={10}>10%</option>
                      </select>
                    </td>
                    <td className="text-right col-total-val">{fmt(item.total)}</td>
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
            <textarea className="note-textarea" rows={3} value={form.note} placeholder="Ghi chú thêm (tùy chọn)..." onChange={e => setField("note", e.target.value)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="xuat-hd__sidebar">

          <div className="sidebar-summary">
            <h4>Tổng hợp hóa đơn</h4>
            <div className="summary-row">
              <span>Tiền hàng chưa thuế</span><span>{fmt(subtotal)}đ</span>
            </div>
            <div className="summary-row vat-row">
              <span>Thuế GTGT</span><span>{fmt(totalVAT)}đ</span>
            </div>
            <div className="summary-row discount-row">
              <span>Chiết khấu</span><span>0đ</span>
            </div>
            <div className="summary-total">
              <span>TỔNG TIỀN THANH TOÁN</span>
              <span>{fmt(grandTotal)}đ</span>
            </div>
            {grandTotal > 0 && <p className="summary-note">{numberToWords(grandTotal)}</p>}
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
              <input type="email" value={form.emailReceive} onChange={e => setField("emailReceive", e.target.value)} placeholder="ketoan@congty.vn" />
            </div>
            <div className="form-group">
              <label>NỘI DUNG EMAIL</label>
              <textarea rows={3} value={emailContent} onChange={e => setEmailContent(e.target.value)} />
            </div>
            <div className="sidebar-email-actions">
              <button className="btn-preview-sm" onClick={handlePreview} disabled={loadingPreview}>
                {loadingPreview ? "..." : <Icon name="Eye" />}
                {loadingPreview ? "Đang tải..." : "Xem trước"}
              </button>
              <button className="btn-publish-sm" onClick={handlePublishAndSend} disabled={loadingPublish}>
                {loadingPublish ? "Đang xử lý..." : "Phát hành & Gửi"}
              </button>
            </div>
            <button className="btn-publish-only" onClick={handlePublish} disabled={loadingPublish}>
              {loadingPublish ? "Đang phát hành..." : "Chỉ phát hành (không gửi mail)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}