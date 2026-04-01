import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import { AddLoyaltySegmentProps } from "@/model/loyalty/PropsModal";
import { ILoyaltySegmentRequest } from "@/model/loyalty/RoyaltyRequest";
import LoyaltyService from "@/services/LoyaltyService";
import Icon from "components/icon";

// ── Parse / serialize benefits JSON string ─────────────────────────────────
function parseBenefits(jsonStr?: string): string[] {
  if (!jsonStr) return [""];
  try {
    const arr = JSON.parse(jsonStr);
    if (Array.isArray(arr) && arr.length > 0) return arr.map(String);
  } catch {}
  return [""];
}

function serializeBenefits(list: string[]): string {
  const clean = list.map((s) => s.trim()).filter(Boolean);
  return JSON.stringify(clean);
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AddLoyaltySegmentModal(props: AddLoyaltySegmentProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit]   = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const focusedElement = useActiveElement();

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName]       = useState("");
  const [point, setPoint]     = useState<number | "">(0);
  const [rate, setRate]       = useState("");
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  // Khởi tạo khi mở / đổi data
  useEffect(() => {
    if (!onShow) return;
    setName(data?.name ?? "");
    setPoint(data?.point ?? 0);
    setRate(data?.rate ?? "");
    setBenefits(parseBenefits(data?.benefits));
    setErrors({});
    setIsSubmit(false);
  }, [onShow, data]);

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!String(name).trim()) errs.name = "Tên hạng không được để trống";
    if (point === "" || point === null || point === undefined) errs.point = "Điểm tối thiểu không được để trống";
    if (!String(rate).trim()) errs.rate = "Tỷ lệ tích điểm không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmit(true);
    const body: ILoyaltySegmentRequest = {
      ...(data?.id ? { id: data.id } : {}),
      name: name.trim(),
      point: Number(point),
      rate: rate.trim(),
      benefits: serializeBenefits(benefits),
    };
    const response = await LoyaltyService.updateLoyaltySegment(body);
    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} hạng hội viên thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  // ── Benefits list helpers ─────────────────────────────────────────────────
  const addBenefit    = () => setBenefits([...benefits, ""]);
  const removeBenefit = (i: number) => {
    if (benefits.length === 1) { setBenefits([""]); return; }
    setBenefits(benefits.filter((_, idx) => idx !== i));
  };
  const updateBenefit = (i: number, val: string) => {
    const next = [...benefits];
    next[i] = val;
    setBenefits(next);
  };

  // ── Detect change (to enable/disable Cập nhật) ───────────────────────────
  const hasChanged = useMemo(() => {
    if (!data) return true;
    return (
      name    !== (data.name  ?? "") ||
      point   !== (data.point ?? 0)  ||
      rate    !== (data.rate  ?? "") ||
      serializeBenefits(benefits) !== serializeBenefits(parseBenefits(data.benefits))
    );
  }, [name, point, rate, benefits, data]);

  // ── Cancel dialog ─────────────────────────────────────────────────────────
  const showDialogConfirmCancel = () => {
    setContentDialog({
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    if (hasChanged) showDialogConfirmCancel();
    else onHide(false);
  };

  // ESC key
  const checkKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === 27 && !showDialog) {
      if (hasChanged) {
        showDialogConfirmCancel();
        if (focusedElement instanceof HTMLElement) focusedElement.blur();
      } else {
        onHide(false);
      }
    }
  }, [hasChanged, showDialog]);

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
  }, [checkKeyDown]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const actions = useMemo<IActionModal>(() => ({
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
          title: data ? "Cập nhật" : "Tạo mới",
          type: "submit",
          color: "primary",
          disabled: isSubmit || !hasChanged || Object.values(errors).filter(Boolean).length > 0,
          is_loading: isSubmit,
        },
      ],
    },
  }), [isSubmit, hasChanged, errors, data]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Fragment>
      <Modal isFade isOpen={onShow} isCentered staticBackdrop
        toggle={() => !isSubmit && handleClose()}
        className="modal-add-loyalty-segment"
        size="md"
      >
        <form onSubmit={onSubmit}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} hạng hội viên`}
            toggle={() => !isSubmit && handleClose()}
          />

          <ModalBody>
            <div className="loyalty-segment-form">

              {/* Tên hạng */}
              <div className={`lsf-group${errors.name ? " lsf-group--error" : ""}`}>
                <label className="lsf-label">
                  Tên hạng hội viên <span className="lsf-required">*</span>
                </label>
                <input
                  className="lsf-input"
                  type="text"
                  placeholder="vd: Hạng Vàng, Hạng Kim Cương"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                />
                {errors.name && <p className="lsf-error-msg">{errors.name}</p>}
              </div>

              {/* Điểm tối thiểu + Tỷ lệ tích điểm — 2 cột */}
              <div className="lsf-row">
                <div className={`lsf-group${errors.point ? " lsf-group--error" : ""}`}>
                  <label className="lsf-label">
                    Điểm tối thiểu <span className="lsf-required">*</span>
                  </label>
                  <input
                    className="lsf-input"
                    type="number"
                    min={0}
                    placeholder="vd: 500"
                    value={point}
                    onChange={(e) => {
                      setPoint(e.target.value === "" ? "" : Number(e.target.value));
                      setErrors((p) => ({ ...p, point: "" }));
                    }}
                  />
                  {errors.point && <p className="lsf-error-msg">{errors.point}</p>}
                </div>

                <div className={`lsf-group${errors.rate ? " lsf-group--error" : ""}`}>
                  <label className="lsf-label">
                    Tỷ lệ tích điểm <span className="lsf-required">*</span>
                  </label>
                  <input
                    className="lsf-input"
                    type="text"
                    placeholder="vd: 1%, 1.5%, 3%"
                    value={rate}
                    onChange={(e) => { setRate(e.target.value); setErrors((p) => ({ ...p, rate: "" })); }}
                  />
                  {errors.rate && <p className="lsf-error-msg">{errors.rate}</p>}
                </div>
              </div>

              {/* Quyền lợi */}
              <div className="lsf-group">
                <label className="lsf-label">Quyền lợi hạng</label>
                <div className="lsf-benefits">
                  {benefits.map((b, i) => (
                    <div key={i} className="lsf-benefit-row">
                      <input
                        className="lsf-input lsf-input--benefit"
                        type="text"
                        placeholder={`vd: Tích ${rate || "X%"} điểm thưởng`}
                        value={b}
                        onChange={(e) => updateBenefit(i, e.target.value)}
                      />
                      <button
                        type="button"
                        className="lsf-benefit-remove"
                        title="Xóa dòng này"
                        onClick={() => removeBenefit(i)}
                      >
                        <Icon name="Times" style={{ width: 14 }} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="lsf-benefit-add" onClick={addBenefit}>
                    <Icon name="Plus" style={{ width: 14 }} />
                    Thêm quyền lợi
                  </button>
                </div>
              </div>

              {/* Preview mini card */}
              {(name || rate) && (
                <div className="lsf-preview">
                  <p className="lsf-preview__label">Xem trước</p>
                  <div className="lsf-preview__card">
                    <div className="lsf-preview__header">
                      <span className="lsf-preview__name">{name || "Tên hạng"}</span>
                      {rate && <span className="lsf-preview__rate">{rate}</span>}
                    </div>
                    <div className="lsf-preview__body">
                      <div className="lsf-preview__meta">
                        <span className="lsf-preview__meta-label">Điểm tối thiểu</span>
                        <span className="lsf-preview__meta-value">{point !== "" ? Number(point).toLocaleString("vi-VN") : 0}</span>
                      </div>
                      {benefits.filter(Boolean).length > 0 && (
                        <ul className="lsf-preview__benefits">
                          {benefits.filter(Boolean).map((b, i) => (
                            <li key={i}><span className="lsf-check">✓</span> {b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
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