import React, { useState, useEffect, useCallback, useRef } from "react";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import Button from "components/button/button";
import Modal, { ModalHeader, ModalBody } from "components/modal/modal";
import { showToast } from "utils/common";
import { numberToWords } from "utils/numberToWords";
import InventoryService from "services/InventoryService";
import VatInvoiceService, {
  VatItemInfo,
  VatTaxBreakdown,
  VatAdjustmentRequest,
} from "services/VatInvoiceService";
import type { SinvoiceLogItem } from "../InvoiceDetailModal";
import "./style.scss";

// ─── Types ──────────────────────────────────────────────────────────────────

interface VariantSuggestion {
  variantId: number;
  productName: string;
  variantLabel?: string;
  sku?: string;
  sellingPrice?: number;
  sellingUnitName?: string;
  baseUnitName?: string;
  productAvatar?: string;
  quantity?: number;
}

interface AdjustLine {
  id: number;
  itemName: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  /** true = điều chỉnh tăng, false = điều chỉnh giảm */
  isIncrease: boolean;
}

interface ParsedRequest {
  buyerInfo?: {
    buyerName?: string;
    buyerTaxCode?: string;
    buyerAddressLine?: string;
    buyerEmail?: string;
  };
  payments?: { paymentMethodName?: string }[];
  itemInfo?: {
    lineNumber: number;
    itemName: string;
    unitName: string;
    quantity: number;
    unitPrice: number;
    taxPercentage: number;
    itemTotalAmountWithoutTax: number;
  }[];
  generalInvoiceInfo?: {
    templateCode?: string;
    invoiceSeries?: string;
  };
}

interface Props {
  isOpen: boolean;
  originalInvoice: SinvoiceLogItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SUPPLIER_TAX_CODE =
  (window as any).__VAT_SUPPLIER_TAX_CODE__ || "0100109106-501";
const TEMPLATE_CODE =
  (window as any).__VAT_TEMPLATE_CODE__ || "1/6553";

const fmt = (v: number) => (v ?? 0).toLocaleString("vi-VN") + "đ";

const fmtDateDisplay = (ts?: number | null): string => {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const parseRaw = (raw?: string): ParsedRequest => {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function InvoiceAdjustmentModal({
  isOpen,
  originalInvoice,
  onClose,
  onSuccess,
}: Props) {
  // Form state
  const [reason, setReason] = useState("");
  const [agreementDate, setAgreementDate] = useState(
    (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()
  );
  const [lines, setLines] = useState<AdjustLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "confirm">("form");

  // Product search state
  const [searchLineId, setSearchLineId] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<VariantSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  // Reset on open
  useEffect(() => {
    if (!isOpen || !originalInvoice) return;
    setReason("");
    setAgreementDate((() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })());
    setLines([]);
    setStep("form");
    setLoading(false);
    setSearchLineId(null);
    setSuggestions([]);
  }, [isOpen, originalInvoice]);

  if (!originalInvoice) return null;

  const req = parseRaw(originalInvoice.rawRequestJson);
  const buyer = req.buyerInfo ?? {};
  const genInfo = req.generalInvoiceInfo ?? {};
  const invoiceSeries =
    genInfo.invoiceSeries || originalInvoice.invoiceSeries || "";

  // ── Line helpers ──────────────────────────────────────────────────────────

  const addLine = () => {
    const newId = Math.max(0, ...lines.map((l) => l.id)) + 1;
    setLines((prev) => [
      ...prev,
      {
        id: newId,
        itemName: "",
        unitName: "Cái",
        quantity: 1,
        unitPrice: 0,
        taxPercentage: 10,
        isIncrease: true,
      },
    ]);
  };

  const updateLine = (id: number, key: keyof AdjustLine, value: any) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: value } : l))
    );
  };

  const removeLine = (id: number) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  // ── Product search ────────────────────────────────────────────────────────

  const handleItemNameChange = (lineId: number, value: string) => {
    updateLine(lineId, "itemName", value);
    setSearchLineId(lineId);

    // Debounce 350ms
    clearTimeout(searchTimer.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setSearchLoading(true);
      InventoryService.variantStockList(
        { keyword: value.trim(), size: 10, page: 1 },
        ctrl.signal
      )
        .then((res: any) => {
          if (res?.code === 0 && res.result?.items) {
            setSuggestions(res.result.items);
          } else {
            setSuggestions([]);
          }
        })
        .catch(() => {})
        .finally(() => setSearchLoading(false));
    }, 350);
  };

  const handleSelectVariant = (lineId: number, v: VariantSuggestion) => {
    const label = v.variantLabel
      ? `${v.productName} - ${v.variantLabel}`
      : v.productName;
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? {
              ...l,
              itemName: label,
              unitName: v.sellingUnitName || v.baseUnitName || l.unitName,
              unitPrice: v.sellingPrice ?? l.unitPrice,
            }
          : l
      )
    );
    setSearchLineId(null);
    setSuggestions([]);
  };

  // ── Calculations ──────────────────────────────────────────────────────────

  const calcLineTotal = (l: AdjustLine) => l.quantity * l.unitPrice;
  const calcLineTax = (l: AdjustLine) =>
    l.taxPercentage > 0
      ? Math.round(calcLineTotal(l) * (l.taxPercentage / 100))
      : 0;

  const subtotal = lines.reduce((s, l) => s + calcLineTotal(l), 0);
  const totalTax = lines.reduce((s, l) => s + calcLineTax(l), 0);
  const grandTotal = subtotal + totalTax;

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showToast("Vui lòng nhập lý do điều chỉnh.", "error");
      return;
    }
    if (lines.length === 0) {
      showToast("Vui lòng thêm ít nhất một dòng điều chỉnh.", "error");
      return;
    }
    for (const l of lines) {
      if (!l.itemName.trim()) {
        showToast("Tên hàng hóa không được để trống.", "error");
        return;
      }
    }

    if (step === "form") {
      setStep("confirm");
      return;
    }

    // Step = confirm → call API
    setLoading(true);
    try {
      const itemInfo: VatItemInfo[] = lines.map((l, idx) => {
        const total = calcLineTotal(l);
        const tax = calcLineTax(l);
        // Nếu điều chỉnh giảm thì truyền giá trị âm
        const sign = l.isIncrease ? 1 : -1;
        return {
          lineNumber: idx + 1,
          itemName: l.itemName,
          unitName: l.unitName,
          unitPrice: l.unitPrice * sign,
          quantity: l.quantity,
          itemTotalAmountWithoutTax: total * sign,
          taxPercentage: l.taxPercentage,
          taxAmount: tax * sign,
          itemTotalAmountWithTax: (total + tax) * sign,
          itemTotalAmountAfterDiscount: total * sign,
          discount: 0,
          discount2: 0,
          itemDiscount: 0,
        };
      });

      const taxMap: Record<number, VatTaxBreakdown> = {};
      itemInfo.forEach((i) => {
        if (!taxMap[i.taxPercentage])
          taxMap[i.taxPercentage] = {
            taxPercentage: i.taxPercentage,
            taxableAmount: 0,
            taxAmount: 0,
          };
        taxMap[i.taxPercentage].taxableAmount += i.itemTotalAmountWithoutTax;
        taxMap[i.taxPercentage].taxAmount += i.taxAmount;
      });

      const netSubtotal = itemInfo.reduce(
        (s, i) => s + i.itemTotalAmountWithoutTax,
        0
      );
      const netTax = itemInfo.reduce((s, i) => s + i.taxAmount, 0);
      const netGrand = netSubtotal + netTax;

      // Parse agreementDate → Unix ms
      const [y, m, d] = agreementDate.split("-").map(Number);
      const agreementTs = new Date(y, m - 1, d).getTime();

      const body: VatAdjustmentRequest = {
        supplierTaxCode: SUPPLIER_TAX_CODE,
        generalInvoiceInfo: {
          invoiceType: "1",
          templateCode: TEMPLATE_CODE,
          invoiceSeries,
          currencyCode: "VND",
          exchangeRate: 1,
          adjustmentType: "5",
          paymentStatus: true,
          cusGetInvoiceRight: true,
          invoiceIssuedDate: Date.now(),
          originalInvoiceId: originalInvoice.invoiceNo || "",
          originalInvoiceIssueDate: fmtDateDisplay(
            originalInvoice.invoiceIssuedDate
          ),
          additionalReferenceDesc: reason,
          additionalReferenceDate: agreementTs,
        },
        buyerInfo: {
          buyerName: buyer.buyerName || originalInvoice.buyerName || "",
          buyerLegalName: buyer.buyerName || originalInvoice.buyerName || "",
          buyerTaxCode: buyer.buyerTaxCode || originalInvoice.buyerTaxCode,
          buyerAddressLine: buyer.buyerAddressLine || "Việt Nam",
          buyerEmail: buyer.buyerEmail,
        },
        payments: req.payments?.length
          ? req.payments.map((p) => ({
              paymentMethodName: p.paymentMethodName || "Chuyển khoản",
            }))
          : [{ paymentMethodName: "Chuyển khoản" }],
        itemInfo,
        taxBreakdowns: Object.values(taxMap),
        summarizeInfo: {
          totalAmountWithoutTax: netSubtotal,
          totalTaxAmount: netTax,
          totalAmountWithTax: netGrand,
          totalAmountAfterDiscount: netGrand,
          totalAmountInWords: numberToWords(Math.abs(netGrand)),
        },
        customFields: { invoiceNote: `Điều chỉnh cho HĐ số ${originalInvoice.invoiceNo}. ${reason}` },
      };

      const res = await VatInvoiceService.adjustInvoice(body);
      if (res?.code === 0) {
        showToast(
          `Phát hành hóa đơn điều chỉnh thành công!${res.result?.invoiceNo ? " Số HĐ: " + res.result.invoiceNo : ""}`,
          "success"
        );
        onSuccess();
        onClose();
      } else {
        showToast(
          res?.message || "Phát hành hóa đơn điều chỉnh thất bại.",
          "error"
        );
      }
    } catch {
      showToast("Lỗi kết nối. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal isOpen={isOpen} toggle={onClose} isCentered isFade className="adj-modal-wrap">
      <ModalHeader custom>
        <div className="adj__header">
          <div className="adj__header-left">
            <h4>Điều chỉnh hóa đơn</h4>
            <span className="adj__meta">
              HĐ gốc: {originalInvoice.invoiceNo || "—"} · Ký hiệu{" "}
              {invoiceSeries} · Ngày{" "}
              {fmtDateDisplay(originalInvoice.invoiceIssuedDate)}
            </span>
          </div>
          <Button onClick={onClose} color="transparent" onlyIcon className="btn-close">
            <Icon name="Times" />
          </Button>
        </div>
      </ModalHeader>

      <ModalBody className="adj__body">
        <>
          {/* Thông tin HĐ gốc */}
          <div className="adj__section">
            <div className="adj__section-title">Thông tin hóa đơn gốc</div>
            <div className="adj__orig-grid">
              <div className="adj__orig-cell">
                <span className="adj__label">SỐ HÓA ĐƠN</span>
                <span className="adj__value adj__value--bold">
                  {originalInvoice.invoiceNo || "—"}
                </span>
              </div>
              <div className="adj__orig-cell">
                <span className="adj__label">NGÀY PHÁT HÀNH</span>
                <span className="adj__value">
                  {fmtDateDisplay(originalInvoice.invoiceIssuedDate)}
                </span>
              </div>
              <div className="adj__orig-cell">
                <span className="adj__label">NGƯỜI MUA</span>
                <span className="adj__value">
                  {buyer.buyerName || originalInvoice.buyerName || "—"}
                </span>
              </div>
              <div className="adj__orig-cell">
                <span className="adj__label">MST</span>
                <span className="adj__value">
                  {buyer.buyerTaxCode ||
                    originalInvoice.buyerTaxCode ||
                    "Cá nhân"}
                </span>
              </div>
              <div className="adj__orig-cell">
                <span className="adj__label">TỔNG TIỀN GỐC</span>
                <span className="adj__value adj__value--bold">
                  {fmt(originalInvoice.totalAmount ?? 0)}
                </span>
              </div>
              <div className="adj__orig-cell">
                <span className="adj__label">KÝ HIỆU</span>
                <span className="adj__value">{invoiceSeries}</span>
              </div>
            </div>
          </div>

          {/* Lý do điều chỉnh */}
          <div className="adj__section">
            <div className="adj__reason-row">
              <div className="adj__form-group adj__form-group--wide">
                <label>LÝ DO ĐIỀU CHỈNH *</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="VD: Điều chỉnh tăng đơn giá theo phụ lục hợp đồng số 02..."
                  disabled={step === "confirm"}
                />
              </div>
              <div className="adj__form-group">
                <label>NGÀY BIÊN BẢN THỎA THUẬN</label>
                <input
                  type="date"
                  value={agreementDate}
                  onChange={(e) => setAgreementDate(e.target.value)}
                  disabled={step === "confirm"}
                />
              </div>
            </div>
          </div>

          {/* Bảng hàng hóa điều chỉnh */}
          <div className="adj__section">
            <div className="adj__section-title">
              Hàng hóa / dịch vụ điều chỉnh
            </div>
            <table className="adj__table">
              <thead>
                <tr>
                  <th className="col-stt">#</th>
                  <th>TÊN HÀNG HÓA</th>
                  <th className="col-unit">ĐVT</th>
                  <th className="col-qty">SL</th>
                  <th className="col-price">ĐƠN GIÁ</th>
                  <th className="col-tax">THUẾ</th>
                  <th className="col-dir">LOẠI</th>
                  <th className="col-total">THÀNH TIỀN</th>
                  {step === "form" && <th className="col-del"></th>}
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 && (
                  <tr>
                    <td colSpan={step === "form" ? 9 : 8}>
                      <div className="adj__empty">
                        <Icon name="FileText" />
                        <span>
                          Chưa có dòng điều chỉnh. Nhấn "Thêm dòng" bên dưới.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {lines.map((line, idx) => {
                  const lineTotal = calcLineTotal(line);
                  return (
                    <tr key={line.id}>
                      <td className="text-center">{idx + 1}</td>
                      <td>
                        {step === "form" ? (
                          <div className="adj__product-search">
                            <input
                              className="adj__inline-input"
                              value={line.itemName}
                              onChange={(e) =>
                                handleItemNameChange(line.id, e.target.value)
                              }
                              onFocus={() => {
                                setSearchLineId(line.id);
                                if (line.itemName.trim()) handleItemNameChange(line.id, line.itemName);
                              }}
                              onBlur={() => setTimeout(() => { if (searchLineId === line.id) { setSearchLineId(null); setSuggestions([]); } }, 200)}
                              placeholder="Tìm sản phẩm..."
                              autoComplete="off"
                            />
                            {searchLineId === line.id && (suggestions.length > 0 || searchLoading) && (
                              <div className="adj__suggestions">
                                {searchLoading && <div className="adj__sug-loading">Đang tìm...</div>}
                                {suggestions.map((v) => (
                                  <div
                                    key={`${v.variantId}-${v.sku}`}
                                    className="adj__sug-item"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelectVariant(line.id, v)}
                                  >
                                    {v.productAvatar && <img className="adj__sug-avatar" src={v.productAvatar} alt="" />}
                                    <div className="adj__sug-info">
                                      <span className="adj__sug-name">
                                        {v.productName}
                                        {v.variantLabel ? ` - ${v.variantLabel}` : ""}
                                      </span>
                                      <span className="adj__sug-sub">
                                        {v.sku && <span>SKU: {v.sku}</span>}
                                        {v.sellingPrice != null && <span> · {fmt(v.sellingPrice)}</span>}
                                        {v.sellingUnitName && <span> / {v.sellingUnitName}</span>}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          line.itemName
                        )}
                      </td>
                      <td className="text-center">
                        {step === "form" ? (
                          <input
                            className="adj__inline-input adj__inline-input--sm"
                            value={line.unitName}
                            onChange={(e) =>
                              updateLine(line.id, "unitName", e.target.value)
                            }
                          />
                        ) : (
                          line.unitName
                        )}
                      </td>
                      <td className="text-center">
                        {step === "form" ? (
                          <input
                            className="adj__inline-input adj__inline-input--sm"
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(line.id, "quantity", +e.target.value)
                            }
                          />
                        ) : (
                          line.quantity
                        )}
                      </td>
                      <td className="text-right">
                        {step === "form" ? (
                          <input
                            className="adj__inline-input adj__inline-input--right"
                            value={line.unitPrice ? line.unitPrice.toLocaleString("vi-VN") : ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              updateLine(line.id, "unitPrice", raw ? parseInt(raw, 10) : 0);
                            }}
                            placeholder="0"
                          />
                        ) : (
                          fmt(line.unitPrice)
                        )}
                      </td>
                      <td className="text-center">
                        {step === "form" ? (
                          <select
                            className="adj__inline-select"
                            value={line.taxPercentage}
                            onChange={(e) =>
                              updateLine(
                                line.id,
                                "taxPercentage",
                                +e.target.value
                              )
                            }
                          >
                            <option value={-2}>KCT</option>
                            <option value={-1}>KKKNT</option>
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={8}>8%</option>
                            <option value={10}>10%</option>
                          </select>
                        ) : (
                          <span className="adj__tax-pill">
                            {line.taxPercentage > 0
                              ? `${line.taxPercentage}%`
                              : line.taxPercentage === -2
                                ? "KCT"
                                : "KKKNT"}
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {step === "form" ? (
                          <select
                            className={`adj__dir-select ${line.isIncrease ? "adj__dir--increase" : "adj__dir--decrease"}`}
                            value={line.isIncrease ? "increase" : "decrease"}
                            onChange={(e) =>
                              updateLine(
                                line.id,
                                "isIncrease",
                                e.target.value === "increase"
                              )
                            }
                          >
                            <option value="increase">Tăng</option>
                            <option value="decrease">Giảm</option>
                          </select>
                        ) : (
                          <Badge
                            text={line.isIncrease ? "Tăng" : "Giảm"}
                            variant={line.isIncrease ? "success" : "error"}
                          />
                        )}
                      </td>
                      <td className="text-right fw-600">
                        {line.isIncrease ? "" : "-"}
                        {fmt(lineTotal)}
                      </td>
                      {step === "form" && (
                        <td className="col-del">
                          <button
                            className="adj__btn-del"
                            onClick={() => removeLine(line.id)}
                          >
                            ×
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {step === "form" && (
              <button className="adj__btn-add" onClick={addLine}>
                + Thêm dòng điều chỉnh
              </button>
            )}
          </div>

          {/* Totals */}
          {lines.length > 0 && (
            <div className="adj__totals">
              <div className="adj__tot-row">
                <span>Tiền hàng điều chỉnh (chưa thuế)</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="adj__tot-row adj__tot-row--vat">
                <span>Thuế GTGT điều chỉnh</span>
                <span>{fmt(totalTax)}</span>
              </div>
              <div className="adj__tot-grand">
                <span>TỔNG TIỀN ĐIỀU CHỈNH</span>
                <span>{fmt(grandTotal)}</span>
              </div>
            </div>
          )}

          {/* Confirm step notice */}
          {step === "confirm" && (
            <div className="adj__confirm-notice">
              <Icon name="AlertCircle" />
              <div>
                <strong>Xác nhận phát hành hóa đơn điều chỉnh</strong>
                <p>
                  Hóa đơn điều chỉnh sẽ được ký số và phát hành chính thức.
                  Thao tác này không thể hoàn tác. Vui lòng kiểm tra kỹ trước
                  khi xác nhận.
                </p>
              </div>
            </div>
          )}
        </>
      </ModalBody>

      {/* Footer */}
      <div className="adj__footer">
          {step === "confirm" && (
            <Button
              color="secondary"
              variant="outline"
              onClick={() => setStep("form")}
              disabled={loading}
              hasIcon
            >
              <Icon name="ArrowLeft" /> Quay lại chỉnh sửa
            </Button>
          )}
          <Button
            color="secondary"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            hasIcon
          >
            {loading ? (
              "Đang xử lý..."
            ) : step === "form" ? (
              <>
                Xem lại & Xác nhận <Icon name="ArrowRight" />
              </>
            ) : (
              <>
                <Icon name="Check" /> Phát hành hóa đơn điều chỉnh
              </>
            )}
          </Button>
      </div>
    </Modal>
  );
}
