import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import { ILoyaltyWalletResponse } from "@/model/loyalty/RoyaltyResposne";
import LoyaltyService from "@/services/LoyaltyService";
import "./index.scss";

interface Props {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  wallet: ILoyaltyWalletResponse | null;
}

export default function AdjustPointModal({ onShow, onHide, wallet }: Props) {
  const [type, setType]                   = useState<"increase" | "decrease">("increase");
  const [point, setPoint]                 = useState<number | "">("");
  const [reason, setReason]               = useState("");
  const [isSubmit, setIsSubmit]           = useState(false);
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [errors, setErrors]               = useState<Record<string, string>>({});

  // Reset form mỗi lần mở modal
  useEffect(() => {
    if (!onShow) return;
    setType("increase");
    setPoint("");
    setReason("");
    setErrors({});
    setIsSubmit(false);
  }, [onShow]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (point === "" || Number(point) <= 0) errs.point = "Số điểm phải lớn hơn 0";
    if (!reason.trim()) errs.reason = "Vui lòng nhập lý do điều chỉnh";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmit(true);

    // Điểm âm nếu giảm
    const delta = type === "increase" ? Number(point) : -Number(point);
    // Description ghi vào ledger
    const description = `Điều chỉnh điểm hội viên: ${reason.trim()}`;

    const response = await LoyaltyService.adjustPoint({
      customerId: wallet?.customerId,
      point: delta,
      description,
    });

    if (response.code === 0) {
      showToast(
        `${type === "increase" ? "Tăng" : "Giảm"} ${Number(point).toLocaleString("vi-VN")} điểm cho ${wallet?.customerName ?? "hội viên"} thành công`,
        "success"
      );
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const hasChanged = point !== "" || reason.trim() !== "";

  const showCancelDialog = () => {
    setContentDialog({
      color: "warning",
      isCentered: true,
      isLoading: false,
      title: "Hủy bỏ điều chỉnh điểm",
      message: "Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ không được lưu.",
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận hủy",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    if (hasChanged) showCancelDialog();
    else onHide(false);
  };

  const checkKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === 27 && !showDialog) handleClose();
  }, [hasChanged, showDialog]);

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
  }, [checkKeyDown]);

  const actions = useMemo(() => ({
    actions_right: {
      buttons: [
        {
          title: "Hủy",
          color: "primary",
          variant: "outline",
          disabled: isSubmit,
          callback: handleClose,
        },
        {
          title: "Xác nhận điều chỉnh",
          type: "submit",
          color: type === "increase" ? "primary" : "danger",
          disabled: isSubmit || !hasChanged,
          is_loading: isSubmit,
        },
      ],
    },
  }), [isSubmit, hasChanged, type, handleClose]);

  const currentBalance = wallet?.currentBalance ?? 0;
  const previewBalance = point !== ""
    ? (type === "increase" ? currentBalance + Number(point) : currentBalance - Number(point))
    : null;
  const isNegativePreview = previewBalance !== null && previewBalance < 0;

  return (
    <Fragment>
      <Modal
        isFade
        isOpen={onShow}
        isCentered
        staticBackdrop
        toggle={() => !isSubmit && handleClose()}
        className="modal-adjust-point"
        size="md"
      >
        <form onSubmit={onSubmit}>
          <ModalHeader
            title={`Điều chỉnh điểm — ${wallet?.customerName ?? ""}`}
            toggle={() => !isSubmit && handleClose()}
          />

          <ModalBody>
            <div className="ap-form">

              {/* Thông tin ví hiện tại */}
              <div className="ap-wallet-info">
                <div className="ap-wallet-info__item">
                  <span className="ap-wallet-info__label">Khách hàng</span>
                  <span className="ap-wallet-info__value">{wallet?.customerName ?? "—"}</span>
                </div>
                <div className="ap-wallet-info__item">
                  <span className="ap-wallet-info__label">Hạng hội viên</span>
                  <span className="ap-wallet-info__value">{wallet?.segmentName ?? "—"}</span>
                </div>
                <div className="ap-wallet-info__item">
                  <span className="ap-wallet-info__label">Điểm hiện tại</span>
                  <span className="ap-wallet-info__value ap-wallet-info__value--points">
                    {currentBalance.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Toggle Tăng / Giảm */}
              <div className="ap-group">
                <label className="ap-label">
                  Loại điều chỉnh <span className="ap-required">*</span>
                </label>
                <div className="ap-type-toggle">
                  <button
                    type="button"
                    className={`ap-type-btn ap-type-btn--increase${type === "increase" ? " active" : ""}`}
                    onClick={() => setType("increase")}
                  >
                    <span className="ap-type-btn__icon">＋</span> Tăng điểm
                  </button>
                  <button
                    type="button"
                    className={`ap-type-btn ap-type-btn--decrease${type === "decrease" ? " active" : ""}`}
                    onClick={() => setType("decrease")}
                  >
                    <span className="ap-type-btn__icon">－</span> Giảm điểm
                  </button>
                </div>
              </div>

              {/* Số điểm */}
              <div className={`ap-group${errors.point ? " ap-group--error" : ""}`}>
                <label className="ap-label">
                  Số điểm điều chỉnh <span className="ap-required">*</span>
                </label>
                <input
                  className="ap-input"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Nhập số điểm cần điều chỉnh (> 0)"
                  value={point}
                  onChange={(e) => {
                    setPoint(e.target.value === "" ? "" : Number(e.target.value));
                    setErrors((p) => ({ ...p, point: "" }));
                  }}
                />
                {errors.point && <p className="ap-error-msg">{errors.point}</p>}
              </div>

              {/* Lý do */}
              <div className={`ap-group${errors.reason ? " ap-group--error" : ""}`}>
                <label className="ap-label">
                  Lý do điều chỉnh <span className="ap-required">*</span>
                </label>
                <textarea
                  className="ap-input ap-input--textarea"
                  rows={3}
                  placeholder="vd: Lỗi tính điểm đơn hàng #INV-0012 / Điều chỉnh theo chính sách mới từ 01/04/2026..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setErrors((p) => ({ ...p, reason: "" }));
                  }}
                />
                {errors.reason && <p className="ap-error-msg">{errors.reason}</p>}
              </div>

              {/* Preview kết quả */}
              {previewBalance !== null && (
                <div className={`ap-preview${isNegativePreview ? " ap-preview--danger" : type === "increase" ? " ap-preview--success" : " ap-preview--decrease"}`}>
                  <div className="ap-preview__row">
                    <span className="ap-preview__label">Điểm sau điều chỉnh:</span>
                    <span className={`ap-preview__value${type === "increase" ? " ap-preview__value--up" : " ap-preview__value--down"}`}>
                      {type === "increase" ? "+" : "−"}{Number(point).toLocaleString("vi-VN")} → <strong>{previewBalance.toLocaleString("vi-VN")} điểm</strong>
                    </span>
                  </div>
                  {isNegativePreview && (
                    <p className="ap-preview__warn">
                      ⚠ Điểm sau điều chỉnh sẽ âm ({previewBalance.toLocaleString("vi-VN")}). Vui lòng kiểm tra lại số điểm.
                    </p>
                  )}
                  <p className="ap-preview__note">
                    Nội dung ghi nhận lịch sử: <em>"Điều chỉnh điểm hội viên: {reason || "..."}"</em>
                  </p>
                </div>
              )}

            </div>
          </ModalBody>

          <ModalFooter actions={actions} />
        </form>
      </Modal>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
