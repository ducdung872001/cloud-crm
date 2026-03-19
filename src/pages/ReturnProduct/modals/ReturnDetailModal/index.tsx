import React, { useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { ReturnProduct, ReturnStatus } from "../../../../types/returnProduct";
import "./index.scss";

interface ReturnDetailModalProps {
  open: boolean;
  item: ReturnProduct | null;
  onClose: () => void;
}

const STATUS_MAP: Record<ReturnStatus, { label: string; cls: string }> = {
  done: { label: "Hoàn thành", cls: "rdm-badge--done" },
  pending: { label: "Chờ xử lý", cls: "rdm-badge--pending" },
  processing: { label: "Đang xử lý", cls: "rdm-badge--processing" },
  cancel: { label: "Đã hủy", cls: "rdm-badge--cancel" },
};

const fmt = (n: number) => (n > 0 ? n.toLocaleString("vi") + " ₫" : "–");

export default function ReturnDetailModal({ open, item, onClose }: ReturnDetailModalProps) {
  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          { title: "Đóng", color: "primary", variant: "outline", callback: onClose },
          { title: "🖨️ In phiếu", color: "primary", variant: "outline", callback: () => window.print() },
          { title: "✏️ Cập nhật trạng thái", color: "primary", callback: onClose },
        ],
      },
    }),
    [onClose]
  );

  if (!item) return null;

  const st = STATUS_MAP[item.status];

  const INFO_ROWS = [
    { label: "Loại phiếu", value: item.type === "return" ? "🔴 Trả hàng" : "🔵 Đổi hàng" },
    { label: "Trạng thái", value: <span className={`rdm-badge ${st.cls}`}>{st.label}</span> },
    { label: "Khách hàng", value: item.customerName },
    { label: "Đơn hàng gốc", value: item.originalOrderCode },
    { label: "Lý do", value: item.reason },
    { label: "Nhân viên", value: item.staffName },
  ];

  // Parse qty from productSummary "xxx (xN)"
  const qtyMatch = item.productSummary.match(/x(\d+)\)/);
  const qty = qtyMatch ? +qtyMatch[1] : 1;

  return (
    <Modal isFade isOpen={open} isCentered staticBackdrop toggle={onClose} className="return-detail-modal">
      <ModalHeader title={item.code} toggle={onClose} />

      <ModalBody>
        {/* Meta */}
        <div className="rdm-meta">
          {item.time} · {item.staffName}
        </div>

        {/* Info grid */}
        <div className="rdm-info-grid">
          {INFO_ROWS.map((r, i) => (
            <div key={i} className="rdm-info-row">
              <span className="rdm-info-row__label">{r.label}</span>
              <span className="rdm-info-row__value">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Products table */}
        <div className="rdm-section-title">Sản phẩm trả lại</div>
        <table className="rdm-tbl">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th style={{ textAlign: "center" }}>SL</th>
              <th style={{ textAlign: "right" }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{item.productSummary.replace(/\s*\(x\d+\)/, "")}</td>
              <td style={{ textAlign: "center" }}>{qty}</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(item.refundAmount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Summary */}
        <div className="rdm-summary">
          <div className="rdm-summary__row">
            <span>Hình thức hoàn</span>
            <span>{item.paymentMethod}</span>
          </div>
          {item.note && (
            <div className="rdm-summary__row">
              <span>Ghi chú</span>
              <span>{item.note}</span>
            </div>
          )}
          <div className="rdm-summary__divider" />
          <div className="rdm-summary__row rdm-summary__row--total">
            <span>Tổng tiền hoàn</span>
            <span>{fmt(item.refundAmount)}</span>
          </div>
        </div>
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
