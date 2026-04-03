import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

const STATUS_KEYS: Record<ReturnStatus, { key: string; cls: string }> = {
  done:       { key: "pageReturnProduct.done",       cls: "rdm-badge--done" },
  pending:    { key: "pageReturnProduct.pending",    cls: "rdm-badge--pending" },
  processing: { key: "pageReturnProduct.processing", cls: "rdm-badge--processing" },
  cancel:     { key: "pageReturnProduct.cancel",     cls: "rdm-badge--cancel" },
};

const fmt = (n: number) => (n > 0 ? n.toLocaleString("vi") + " ₫" : "–");

export default function ReturnDetailModal({
  open,
  item,
  onClose,
  onConfirmed,
}: ReturnDetailModalProps) {
  const { t } = useTranslation();
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
        showToast(res?.message ?? t("pageReturnProduct.confirmFailed"), "error");
        return;
      }

      // Optimistic UI — đổi badge ngay lập tức
      setLocalStatus("done");

      showToast(t("pageReturnProduct.confirmSuccess"), "success");

      // Báo lên parent để cập nhật item trong list
      if (onConfirmed) {
        onConfirmed({ ...item, status: "done" });
      }
    } catch {
      showToast(t("common.error"), "error");
    } finally {
      setConfirming(false);
    }
  }, [item, isPending, confirming, onConfirmed, t]);

  // ── Reset local state khi đóng / mở modal mới ─────────────────────────────

  const handleClose = useCallback(() => {
    setLocalStatus(null);
    onClose();
  }, [onClose]);

  // ── Actions footer ────────────────────────────────────────────────────────

  const actions = useMemo<IActionModal>(() => {
    const buttons: IActionModal["actions_right"]["buttons"] = [
      {
        title: t("common.close"),
        color: "primary",
        variant: "outline",
        callback: handleClose,
        disabled: confirming,
      },
      {
        title: `🖨️ ${t("common.print")}`,
        color: "primary",
        variant: "outline",
        callback: () => window.print(),
        disabled: confirming,
      },
    ];

    // Nút xác nhận chỉ hiện khi phiếu đang "Chờ xử lý"
    if (isPending) {
      const typeLabel = item?.type === "exchange" ? t("pageReturnProduct.confirmExchange") : t("pageReturnProduct.confirmReturn");
      buttons.push({
        title: confirming ? t("pageReturnProduct.confirming") : `✅ ${typeLabel}`,
        color: "primary",
        callback: handleConfirm,
        disabled: confirming,
      });
    }

    return { actions_right: { buttons } };
  }, [handleClose, handleConfirm, isPending, confirming, item?.type, t]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!item) return null;

  const st = STATUS_KEYS[effectiveStatus];

  const INFO_ROWS = [
    { label: t("pageReturnProduct.detailType"),          value: item.type === "return" ? `🔴 ${t("pageReturnProduct.returnType")}` : `🔵 ${t("pageReturnProduct.exchangeType")}` },
    { label: t("pageReturnProduct.detailStatus"),        value: <span className={`rdm-badge ${st.cls}`}>{t(st.key)}</span> },
    { label: t("pageReturnProduct.detailCustomer"),      value: item.customerName },
    { label: t("pageReturnProduct.detailOriginalOrder"), value: item.originalOrderCode },
    { label: t("pageReturnProduct.detailReason"),        value: item.reason },
    { label: t("pageReturnProduct.detailStaff"),         value: item.staffName },
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
          {item.type === "exchange" ? t("pageReturnProduct.detailExchangeProducts") : t("pageReturnProduct.detailReturnProducts")}
        </div>
        <table className="rdm-tbl">
          <thead>
            <tr>
              <th>{t("common.product")}</th>
              <th style={{ textAlign: "center" }}>{t("common.quantity")}</th>
              <th style={{ textAlign: "right" }}>{t("common.total")}</th>
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
            <span>{t("pageReturnProduct.detailRefundMethod")}</span>
            <span>{item.paymentMethod}</span>
          </div>
          {item.note && (
            <div className="rdm-summary__row">
              <span>{t("common.note")}</span>
              <span>{item.note}</span>
            </div>
          )}
          <div className="rdm-summary__divider" />
          <div className="rdm-summary__row rdm-summary__row--total">
            <span>{t("pageReturnProduct.detailTotalRefund")}</span>
            <span>{fmt(item.refundAmount)}</span>
          </div>
        </div>

        {/* Confirm hint khi pending */}
        {isPending && (
          <div className="rdm-confirm-hint">
            ⚠️ {t("pageReturnProduct.confirmHint")}{" "}
            <strong>
              {item.type === "exchange" ? t("pageReturnProduct.confirmExchange") : t("pageReturnProduct.confirmReturn")}
            </strong>{" "}
            {t("pageReturnProduct.confirmHintEnd")}
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}