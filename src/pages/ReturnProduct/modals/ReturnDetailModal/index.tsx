import React, { useState, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import { ReturnProduct, ReturnStatus } from "../../../../types/returnProduct";
import ReturnInvoiceService from "services/ReturnInvoiceService";
import "./index.scss";

interface ReturnDetailModalProps {
  open: boolean;
  item: ReturnProduct | null;
  onClose: () => void;
  /** Callback khi xác nhận thành công — để parent cập nhật status trong list */
  onConfirmed?: (updatedItem: ReturnProduct) => void;
}

const STATUS_MAP: Record<ReturnStatus, { label: string; cls: string }> = {
  done:       { label: "Hoàn thành", cls: "rdm-badge--done" },
  pending:    { label: "Chờ xử lý",  cls: "rdm-badge--pending" },
  processing: { label: "Đang xử lý", cls: "rdm-badge--processing" },
  cancel:     { label: "Đã hủy",     cls: "rdm-badge--cancel" },
};

const fmt = (n: number) => (n > 0 ? n.toLocaleString("vi") + " ₫" : "–");

export default function ReturnDetailModal({
  open,
  item,
  onClose,
  onConfirmed,
}: ReturnDetailModalProps) {
  const [confirming, setConfirming] = useState(false);
  // Local status để update ngay lập tức trên UI sau khi confirm
  const [localStatus, setLocalStatus] = useState<ReturnStatus | null>(null);

  const effectiveStatus: ReturnStatus = localStatus ?? item?.status ?? "pending";
  const isPending = effectiveStatus === "pending";

  // ── Confirm handler ───────────────────────────────────────────────────────

  const handleConfirm = useCallback(async () => {
    if (!item || !isPending || confirming) return;

    setConfirming(true);
    try {
      const res = await ReturnInvoiceService.confirmReturn(Number(item.id));

      if (res?.code !== 0) {
        showToast(res?.message ?? "Xác nhận thất bại. Vui lòng thử lại.", "error");
        return;
      }

      // Optimistic UI — đổi badge ngay lập tức
      setLocalStatus("done");

      const actionLabel = item.type === "exchange" ? "đổi hàng" : "trả hàng";
      showToast(`Xác nhận ${actionLabel} thành công!`, "success");

      // Báo lên parent để cập nhật item trong list
      if (onConfirmed) {
        onConfirmed({ ...item, status: "done" });
      }
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setConfirming(false);
    }
  }, [item, isPending, confirming, onConfirmed]);

  // ── Reset local state khi đóng / mở modal mới ─────────────────────────────

  const handleClose = useCallback(() => {
    setLocalStatus(null);
    onClose();
  }, [onClose]);

  // ── Actions footer ────────────────────────────────────────────────────────

  const actions = useMemo<IActionModal>(() => {
    const buttons: IActionModal["actions_right"]["buttons"] = [
      {
        title: "Đóng",
        color: "primary",
        variant: "outline",
        callback: handleClose,
        disabled: confirming,
      },
      {
        title: "🖨️ In phiếu",
        color: "primary",
        variant: "outline",
        callback: () => window.print(),
        disabled: confirming,
      },
    ];

    // Nút xác nhận chỉ hiện khi phiếu đang "Chờ xử lý"
    if (isPending) {
      const typeLabel = item?.type === "exchange" ? "Xác nhận đổi hàng" : "Xác nhận trả hàng";
      buttons.push({
        title: confirming ? "Đang xử lý..." : `✅ ${typeLabel}`,
        color: "primary",
        callback: handleConfirm,
        disabled: confirming,
      });
    }

    return { actions_right: { buttons } };
  }, [handleClose, handleConfirm, isPending, confirming, item?.type]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!item) return null;

  const st = STATUS_MAP[effectiveStatus];

  const INFO_ROWS = [
    { label: "Loại phiếu",   value: item.type === "return" ? "🔴 Trả hàng" : "🔵 Đổi hàng" },
    { label: "Trạng thái",   value: <span className={`rdm-badge ${st.cls}`}>{st.label}</span> },
    { label: "Khách hàng",   value: item.customerName },
    { label: "Đơn hàng gốc", value: item.originalOrderCode },
    { label: "Lý do",        value: item.reason },
    { label: "Nhân viên",    value: item.staffName },
  ];

  const qtyMatch = item.productSummary.match(/x(\d+)\)/);
  const qty = qtyMatch ? +qtyMatch[1] : 1;

  return (
    <Modal
      isFade
      isOpen={open}
      isCentered
      staticBackdrop
      toggle={handleClose}
      className="return-detail-modal"
    >
      <ModalHeader title={item.code} toggle={handleClose} />

      <ModalBody>
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
        <div className="rdm-section-title">
          {item.type === "exchange" ? "Sản phẩm đổi lại" : "Sản phẩm trả lại"}
        </div>
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

        {/* Confirm hint khi pending */}
        {isPending && (
          <div className="rdm-confirm-hint">
            ⚠️ Phiếu đang chờ xác nhận. Bấm{" "}
            <strong>
              {item.type === "exchange" ? "Xác nhận đổi hàng" : "Xác nhận trả hàng"}
            </strong>{" "}
            để hoàn tất và ghi nhận.
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}