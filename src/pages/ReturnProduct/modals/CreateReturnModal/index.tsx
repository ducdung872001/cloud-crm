import React, { Fragment, useState, useMemo, useCallback, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { ReturnProduct, ReturnType } from "../../../../types/returnProduct";
import "./index.scss";

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

const REASONS = ["Sản phẩm bị lỗi / hư hỏng", "Không đúng mô tả / sai sản phẩm", "Sản phẩm hết hạn sử dụng", "Khách hàng đổi ý", "Khác"];

const CUSTOMERS = ["Nguyễn Văn A – 0901234567", "Trần Thị B – 0912345678", "Lê Minh C – 0923456789"];
const STAFFS = ["Hòa Phạm", "Minh Tuấn", "Thu Hương"];
const PAY_METHODS = ["Tiền mặt", "Chuyển khoản ngân hàng", "Hoàn vào ví khách hàng", "Không hoàn tiền (đổi ngang giá)"];

const mkRow = (): ProductRow => ({ id: Math.random().toString(36).slice(2), name: "", qty: 1, price: 0 });
const fmt = (n: number) => (n > 0 ? n.toLocaleString("vi") + " ₫" : "0 ₫");

export default function CreateReturnModal({ open, onClose, onCreate, totalExisting }: CreateReturnModalProps) {
  const [seg, setSeg] = useState<ReturnType>("return");
  const [maGoc, setMaGoc] = useState("");
  const [customer, setCustomer] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [staff, setStaff] = useState(STAFFS[0]);
  const [note, setNote] = useState("");
  const [payMethod, setPayMethod] = useState(PAY_METHODS[0]);
  const [retItems, setRetItems] = useState<ProductRow[]>([mkRow()]);
  const [exchItems, setExchItems] = useState<ProductRow[]>([mkRow()]);

  const retTotal = retItems.reduce((s, r) => s + r.qty * r.price, 0);
  const exchTotal = exchItems.reduce((s, r) => s + r.qty * r.price, 0);
  const grandTotal = seg === "exchange" ? Math.abs(retTotal - exchTotal) : retTotal;

  const updateRow = (
    list: ProductRow[],
    setList: React.Dispatch<React.SetStateAction<ProductRow[]>>,
    id: string,
    field: keyof ProductRow,
    value: string | number
  ) => {
    setList(list.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRow = (list: ProductRow[], setList: React.Dispatch<React.SetStateAction<ProductRow[]>>, id: string) => {
    if (list.length <= 1) {
      setList([mkRow()]);
      return;
    }
    setList(list.filter((r) => r.id !== id));
  };

  const handleCreate = useCallback(() => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newItem: ReturnProduct = {
      id: Date.now().toString(),
      code: `PTH-2026-${String(totalExisting + 1).padStart(3, "0")}`,
      time: dateStr,
      customerName: customer || "Khách vãng lai",
      originalOrderCode: maGoc || "HD-????",
      type: seg,
      productSummary: retItems.find((r) => r.name)?.name
        ? `${retItems.find((r) => r.name)!.name} (x${retItems.find((r) => r.name)!.qty})`
        : "Sản phẩm (x1)",
      refundAmount: grandTotal,
      status: "pending",
      reason,
      staffName: staff,
      paymentMethod: payMethod,
      note,
    };
    onCreate(newItem);
  }, [seg, maGoc, customer, reason, staff, note, payMethod, retItems, exchItems, grandTotal, totalExisting, onCreate]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: onClose,
          },
          {
            title: "✅ Xác nhận tạo phiếu",
            color: "primary",
            callback: handleCreate,
          },
        ],
      },
    }),
    [onClose, handleCreate]
  );

  return (
    <Modal isFade isOpen={open} isCentered staticBackdrop toggle={onClose} className="create-return-modal">
      <ModalHeader title="Tạo phiếu trả / đổi hàng" toggle={onClose} />

      <ModalBody>
        {/* Segment */}
        <div className="crm-seg">
          <button className={`crm-seg__btn${seg === "return" ? " crm-seg__btn--active" : ""}`} onClick={() => setSeg("return")}>
            🔴 Trả hàng
          </button>
          <button className={`crm-seg__btn${seg === "exchange" ? " crm-seg__btn--active" : ""}`} onClick={() => setSeg("exchange")}>
            🔵 Đổi hàng
          </button>
        </div>

        {/* General info */}
        <div className="crm-section">
          <div className="crm-section__title">Thông tin chung</div>
          <div className="crm-form-grid">
            <div className="crm-field">
              <label>
                Mã đơn hàng gốc <span>*</span>
              </label>
              <input value={maGoc} onChange={(e) => setMaGoc(e.target.value)} placeholder="VD: HD-2241" />
            </div>
            <div className="crm-field">
              <label>Khách hàng</label>
              <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
                <option value="">-- Chọn khách hàng --</option>
                {CUSTOMERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="crm-field">
              <label>
                Lý do <span>*</span>
              </label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="crm-field">
              <label>Nhân viên xử lý</label>
              <select value={staff} onChange={(e) => setStaff(e.target.value)}>
                {STAFFS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="crm-field crm-field--full">
              <label>Ghi chú</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập ghi chú thêm (nếu có)..." />
            </div>
          </div>
        </div>

        {/* Return items */}
        <div className="crm-section">
          <div className="crm-section__title">{seg === "exchange" ? "Sản phẩm cần đổi" : "Sản phẩm trả lại"}</div>
          <ProductRowsTable
            rows={retItems}
            onChange={(id, f, v) => updateRow(retItems, setRetItems, id, f, v)}
            onRemove={(id) => removeRow(retItems, setRetItems, id)}
          />
          <button className="crm-add-row" onClick={() => setRetItems((p) => [...p, mkRow()])}>
            + Thêm sản phẩm
          </button>
        </div>

        {/* Exchange items */}
        {seg === "exchange" && (
          <div className="crm-section">
            <div className="crm-section__title">Sản phẩm đổi mới</div>
            <ProductRowsTable
              rows={exchItems}
              onChange={(id, f, v) => updateRow(exchItems, setExchItems, id, f, v)}
              onRemove={(id) => removeRow(exchItems, setExchItems, id)}
              isExchange
            />
            <button className="crm-add-row" onClick={() => setExchItems((p) => [...p, mkRow()])}>
              + Thêm sản phẩm đổi
            </button>
          </div>
        )}

        {/* Summary */}
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

        {/* Payment */}
        <div className="crm-section" style={{ marginTop: 14, marginBottom: 0 }}>
          <div className="crm-section__title">{seg === "exchange" ? "Thanh toán chênh lệch" : "Hình thức hoàn tiền"}</div>
          <div className="crm-form-grid" style={{ marginTop: 10 }}>
            <div className="crm-field">
              <label>Phương thức</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                {PAY_METHODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}

// ── Sub-component: ProductRowsTable ───────────────
interface ProductRowsTableProps {
  rows: ProductRow[];
  onChange: (id: string, field: keyof ProductRow, value: string | number) => void;
  onRemove: (id: string) => void;
  isExchange?: boolean;
}

function ProductRowsTable({ rows, onChange, onRemove, isExchange }: ProductRowsTableProps) {
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
          />
          <input type="number" min={1} value={row.qty} onChange={(e) => onChange(row.id, "qty", +e.target.value || 1)} />
          <input type="number" placeholder="0" value={row.price || ""} onChange={(e) => onChange(row.id, "price", +e.target.value || 0)} />
          <input type="text" readOnly value={row.qty * row.price > 0 ? (row.qty * row.price).toLocaleString("vi") : ""} />
          <button className="crm-prod-table__rm" onClick={() => onRemove(row.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
