import React, { useState, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import {
  ReturnProduct,
  ReturnType,
  ICreateReturnRequest,
  ICreateExchangeRequest,
  IReturnProductLine,
} from "../../../../types/returnProduct";
import ReturnInvoiceService from "services/ReturnInvoiceService";
import "./index.scss";

// ─── Constants ────────────────────────────────────────────────────────────────

const REASONS = [
  "Sản phẩm bị lỗi / hư hỏng",
  "Không đúng mô tả / sai sản phẩm",
  "Sản phẩm hết hạn sử dụng",
  "Khách hàng đổi ý",
  "Khác",
];

// paymentType cho invoice (1=Tiền mặt, 2=CK, 3=Thẻ dịch vụ)
// refundMethod riêng (1=TM, 2=CK, 3=Ví, 4=Không hoàn)
const PAY_METHODS: { label: string; refundMethod: number; paymentType: number }[] = [
  { label: "Tiền mặt",                       refundMethod: 1, paymentType: 1 },
  { label: "Chuyển khoản ngân hàng",          refundMethod: 2, paymentType: 2 },
  { label: "Hoàn vào ví khách hàng",          refundMethod: 3, paymentType: 2 },
  { label: "Không hoàn tiền (đổi ngang giá)", refundMethod: 4, paymentType: 1 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductRow {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface CreateReturnModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (item: ReturnProduct) => void;
  totalExisting: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mkRow = (): ProductRow => ({ id: Math.random().toString(36).slice(2), name: "", qty: 1, price: 0 });
const fmt = (n: number) => (n > 0 ? n.toLocaleString("vi") + " ₫" : "0 ₫");
const pad2 = (n: number) => String(n).padStart(2, "0");

function nowStr(): string {
  const d = new Date();
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Map UI ProductRow → API IReturnProductLine
 * productId / variantId chưa có (người dùng nhập tên tự do) — để undefined.
 * Khi có product lookup thực, truyền thêm productId/variantId vào đây.
 */
function rowsToApiLines(rows: ProductRow[]): IReturnProductLine[] {
  return rows
    .filter((r) => r.name.trim() && r.qty > 0 && r.price >= 0)
    .map((r) => ({
      qty: r.qty,
      price: r.price,
      fee: r.qty * r.price,
      discount: 0,
      discountUnit: 2,
    }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateReturnModal({ open, onClose, onCreate, totalExisting }: CreateReturnModalProps) {
  // Form fields
  const [seg, setSeg]               = useState<ReturnType>("return");
  const [maGoc, setMaGoc]           = useState("");
  const [customer, setCustomer]     = useState("");
  const [reason, setReason]         = useState(REASONS[0]);
  const [note, setNote]             = useState("");
  const [payMethodIdx, setPayMethodIdx] = useState(0);

  // Product rows
  const [retItems, setRetItems]     = useState<ProductRow[]>([mkRow()]);
  const [exchItems, setExchItems]   = useState<ProductRow[]>([mkRow()]);

  // UI state
  const [submitting, setSubmitting] = useState(false);

  // Totals
  const retTotal   = retItems.reduce((s, r) => s + r.qty * r.price, 0);
  const exchTotal  = exchItems.reduce((s, r) => s + r.qty * r.price, 0);
  const grandTotal = seg === "exchange" ? Math.abs(retTotal - exchTotal) : retTotal;

  // ── Row helpers ──────────────────────────────────────────────────────────────

  const updateRow = useCallback(
    (list: ProductRow[], setList: React.Dispatch<React.SetStateAction<ProductRow[]>>, id: string, field: keyof ProductRow, value: string | number) => {
      setList(list.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    },
    []
  );

  const removeRow = useCallback(
    (list: ProductRow[], setList: React.Dispatch<React.SetStateAction<ProductRow[]>>, id: string) => {
      if (list.length <= 1) { setList([mkRow()]); return; }
      setList(list.filter((r) => r.id !== id));
    },
    []
  );

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = useCallback((): string | null => {
    if (!maGoc.trim()) return "Vui lòng nhập mã đơn hàng gốc.";
    const validRet = retItems.filter((r) => r.name.trim());
    if (validRet.length === 0) return "Vui lòng nhập ít nhất 1 sản phẩm trả lại.";
    if (seg === "exchange") {
      const validExch = exchItems.filter((r) => r.name.trim());
      if (validExch.length === 0) return "Vui lòng nhập ít nhất 1 sản phẩm đổi mới.";
    }
    return null;
  }, [maGoc, retItems, exchItems, seg]);

  // ── Reset form ───────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setSeg("return");
    setMaGoc("");
    setCustomer("");
    setReason(REASONS[0]);
    setNote("");
    setPayMethodIdx(0);
    setRetItems([mkRow()]);
    setExchItems([mkRow()]);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    const err = validate();
    if (err) { showToast(err, "error"); return; }

    setSubmitting(true);
    const pm = PAY_METHODS[payMethodIdx];

    try {
      const retLines  = rowsToApiLines(retItems);
      const exchLines = rowsToApiLines(exchItems);

      // Build optimistic UI item (dùng để cập nhật list ngay lập tức)
      const firstRetItem = retItems.find((r) => r.name.trim());
      const optimisticItem: ReturnProduct = {
        id: Date.now().toString(),
        code: `PTH-${String(totalExisting + 1).padStart(4, "0")}`,
        time: nowStr(),
        customerName: customer || "Khách vãng lai",
        originalOrderCode: maGoc,
        type: seg,
        productSummary: firstRetItem ? `${firstRetItem.name} (x${firstRetItem.qty})` : "Sản phẩm (x1)",
        refundAmount: grandTotal,
        status: "pending",
        reason,
        staffName: "–",
        paymentMethod: pm.label,
        note,
      };

      if (seg === "return") {
        // ── POST /sales/invoice/create/return ─────────────────────────────────
        const body: ICreateReturnRequest = {
          invoice: {
            referId: 0,            // Backend sẽ lookup qua invoiceCode (maGoc)
            // Nếu backend nhận invoiceCode thay vì referId, truyền thêm:
            // referCode: maGoc,
            amount:       retTotal,
            fee:          retTotal,
            paid:         retTotal,
            debt:         0,
            discount:     0,
            vatAmount:    0,
            paymentType:  pm.paymentType,
            reason,
            refundMethod: pm.refundMethod,
            note:         note || undefined,
          },
          lstProduct:     retLines,
          lstService:     [],
          lstCardService: [],
        };

        const res = await ReturnInvoiceService.createReturn(body);

        if (res?.code !== 0) {
          showToast(res?.message ?? "Tạo phiếu trả hàng thất bại. Vui lòng thử lại.", "error");
          return;
        }

        // Cập nhật code từ API nếu có
        if (res?.result?.invoiceCode) {
          optimisticItem.code = res.result.invoiceCode;
        }
        if (res?.result?.id) {
          optimisticItem.id = String(res.result.id);
        }

        showToast("Tạo phiếu trả hàng thành công!", "success");

      } else {
        // ── POST /sales/invoice/create/exchange ───────────────────────────────
        const body: ICreateExchangeRequest = {
          invoice: {
            referId:      0,
            amount:       retTotal,
            fee:          retTotal,
            paid:         0,
            debt:         0,
            discount:     0,
            vatAmount:    0,
            paymentType:  pm.paymentType,
            reason,
            refundMethod: pm.refundMethod,
            note:         note || undefined,
          },
          lstProduct:     retLines,
          lstService:     [],
          lstCardService: [],
          ...(exchLines.length > 0 && {
            exchangeInvoice: {
              amount:      exchTotal,
              fee:         exchTotal,
              paid:        grandTotal,  // Chênh lệch khách bù thêm (hoặc hoàn lại)
              debt:        0,
              discount:    0,
              vatAmount:   0,
              paymentType: pm.paymentType,
            },
            lstExchangeProduct: exchLines,
          }),
        };

        const res = await ReturnInvoiceService.createExchange(body);

        if (res?.code !== 0) {
          showToast(res?.message ?? "Tạo phiếu đổi hàng thất bại. Vui lòng thử lại.", "error");
          return;
        }

        if (res?.result?.invoiceCode) optimisticItem.code = res.result.invoiceCode;
        if (res?.result?.id)          optimisticItem.id   = String(res.result.id);

        showToast("Tạo phiếu đổi hàng thành công!", "success");
      }

      onCreate(optimisticItem);
      resetForm();

    } catch (e) {
      console.error("[CreateReturnModal] submit error:", e);
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setSubmitting(false);
    }
  }, [validate, seg, maGoc, customer, reason, note, payMethodIdx, retItems, exchItems, retTotal, exchTotal, grandTotal, totalExisting, onCreate, resetForm]);

  // ── Modal actions ────────────────────────────────────────────────────────────

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: handleClose,
            disabled: submitting,
          },
          {
            title: submitting ? "Đang tạo..." : "✅ Xác nhận tạo phiếu",
            color: "primary",
            callback: handleCreate,
            disabled: submitting,
          },
        ],
      },
    }),
    [handleClose, handleCreate, submitting]
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal isFade isOpen={open} isCentered staticBackdrop toggle={handleClose} className="create-return-modal">
      <ModalHeader title="Tạo phiếu trả / đổi hàng" toggle={handleClose} />

      <ModalBody>
        {/* ── Segment control ── */}
        <div className="crm-seg">
          <button
            className={`crm-seg__btn${seg === "return" ? " crm-seg__btn--active" : ""}`}
            onClick={() => setSeg("return")}
            disabled={submitting}
          >
            🔴 Trả hàng
          </button>
          <button
            className={`crm-seg__btn${seg === "exchange" ? " crm-seg__btn--active" : ""}`}
            onClick={() => setSeg("exchange")}
            disabled={submitting}
          >
            🔵 Đổi hàng
          </button>
        </div>

        {/* ── General info ── */}
        <div className="crm-section">
          <div className="crm-section__title">Thông tin chung</div>
          <div className="crm-form-grid">
            <div className="crm-field">
              <label>
                Mã đơn hàng gốc <span>*</span>
              </label>
              <input
                value={maGoc}
                onChange={(e) => setMaGoc(e.target.value)}
                placeholder="VD: HD-2241"
                disabled={submitting}
              />
            </div>

            <div className="crm-field">
              <label>Khách hàng</label>
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Tìm tên hoặc SĐT khách..."
                disabled={submitting}
              />
            </div>

            <div className="crm-field">
              <label>
                Lý do <span>*</span>
              </label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} disabled={submitting}>
                {REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="crm-field">
              <label>Hình thức hoàn tiền</label>
              <select
                value={payMethodIdx}
                onChange={(e) => setPayMethodIdx(+e.target.value)}
                disabled={submitting}
              >
                {PAY_METHODS.map((p, i) => (
                  <option key={p.label} value={i}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-field crm-field--full">
              <label>Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú thêm (nếu có)..."
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* ── Return items ── */}
        <div className="crm-section">
          <div className="crm-section__title">{seg === "exchange" ? "Sản phẩm cần đổi" : "Sản phẩm trả lại"}</div>
          <ProductRowsTable
            rows={retItems}
            disabled={submitting}
            onChange={(id, f, v) => updateRow(retItems, setRetItems, id, f, v)}
            onRemove={(id) => removeRow(retItems, setRetItems, id)}
          />
          <button className="crm-add-row" onClick={() => setRetItems((p) => [...p, mkRow()])} disabled={submitting}>
            + Thêm sản phẩm
          </button>
        </div>

        {/* ── Exchange items (đổi hàng only) ── */}
        {seg === "exchange" && (
          <div className="crm-section">
            <div className="crm-section__title">Sản phẩm đổi mới</div>
            <ProductRowsTable
              rows={exchItems}
              disabled={submitting}
              isExchange
              onChange={(id, f, v) => updateRow(exchItems, setExchItems, id, f, v)}
              onRemove={(id) => removeRow(exchItems, setExchItems, id)}
            />
            <button className="crm-add-row" onClick={() => setExchItems((p) => [...p, mkRow()])} disabled={submitting}>
              + Thêm sản phẩm đổi
            </button>
          </div>
        )}

        {/* ── Summary ── */}
        <div className="crm-summary">
          <div className="crm-summary__row">
            <span>Tổng tiền hàng trả</span>
            <span>{fmt(retTotal)}</span>
          </div>
          {seg === "exchange" && (
            <div className="crm-summary__row">
              <span>Tổng tiền hàng đổi</span>
              <span>{fmt(exchTotal)}</span>
            </div>
          )}
          <div className="crm-summary__divider" />
          <div className="crm-summary__row crm-summary__row--total">
            <span>{seg === "exchange" ? "Chênh lệch thanh toán" : "Tiền hoàn khách"}</span>
            <span>{fmt(grandTotal)}</span>
          </div>
        </div>
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}

// ─── Sub-component: ProductRowsTable ──────────────────────────────────────────

interface ProductRowsTableProps {
  rows: ProductRow[];
  onChange: (id: string, field: keyof ProductRow, value: string | number) => void;
  onRemove: (id: string) => void;
  isExchange?: boolean;
  disabled?: boolean;
}

function ProductRowsTable({ rows, onChange, onRemove, isExchange, disabled }: ProductRowsTableProps) {
  return (
    <div className="crm-prod-table">
      <div className="crm-prod-table__head">
        <span>Sản phẩm</span>
        <span>SL</span>
        <span>Đơn giá</span>
        <span>Thành tiền</span>
        <span />
      </div>
      {rows.map((row) => (
        <div key={row.id} className="crm-prod-table__row">
          <input
            placeholder={isExchange ? "Tên sản phẩm mới..." : "Tên hoặc mã sản phẩm..."}
            value={row.name}
            onChange={(e) => onChange(row.id, "name", e.target.value)}
            disabled={disabled}
          />
          <input
            type="number"
            min={1}
            value={row.qty}
            onChange={(e) => onChange(row.id, "qty", +e.target.value || 1)}
            disabled={disabled}
          />
          <input
            type="number"
            placeholder="0"
            value={row.price || ""}
            onChange={(e) => onChange(row.id, "price", +e.target.value || 0)}
            disabled={disabled}
          />
          <input
            type="text"
            readOnly
            value={row.qty * row.price > 0 ? (row.qty * row.price).toLocaleString("vi") : ""}
          />
          <button className="crm-prod-table__rm" onClick={() => onRemove(row.id)} disabled={disabled}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
