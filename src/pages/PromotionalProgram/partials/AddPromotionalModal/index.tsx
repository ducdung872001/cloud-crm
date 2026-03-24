import React, { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import PromotionService from "services/PromotionService";
import {
  IPromotion,
  IPromotionRequest,
  PROMOTION_TYPE_LABELS,
} from "model/promotion/PromotionModel";

import "./index.scss";

interface Props {
  onShow: boolean;
  data:   IPromotion | null;
  onHide: (refresh?: boolean) => void;
}

export default function AddPromotionalModal({ onShow, data, onHide }: Props) {
  const [isSubmit, setIsSubmit] = useState(false);
  const focusedElement          = useActiveElement();
  const [showDialog, setShowDialog]     = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // ─── Initial values (tái tạo mỗi khi data hoặc onShow thay đổi) ──
  const values = useMemo(
    () => ({
      name:          data?.name              ?? "",
      startTime:     data?.startTime         ?? "",
      endTime:       data?.endTime           ?? "",
      promotionType: String(data?.promotionType  ?? 1),
      discount:      String(data?.discount       ?? ""),
      discountType:  String(data?.discountType   ?? 1),
      applyType:     String(data?.applyType      ?? 1),
      minAmount:     String(data?.minAmount      ?? ""),
      budget:        String(data?.budget         ?? ""),
      mode:          String(data?.mode           ?? 1),
    }),
    [data, onShow]
  );

  // ─── Validation rules ────────────────────────────────────────────
  const validations: IValidation[] = [
    { name: "name",          rules: "required" },
    { name: "startTime",     rules: "required" },
    { name: "endTime",       rules: "required" },
    { name: "promotionType", rules: "required" },
    { name: "discount",      rules: "required|number" },
  ];

  // ─── Form fields ─────────────────────────────────────────────────
  const typeOptions = Object.entries(PROMOTION_TYPE_LABELS).map(([k, v]) => ({
    label: v,
    value: k,
  }));

  const listField: IFieldCustomize[] = [
    {
      label: "Tên chương trình khuyến mãi",
      name: "name",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Loại chương trình",
      name: "promotionType",
      type: "select",
      fill: true,
      required: true,
      options: typeOptions,
    },
    {
      label: "Thời gian bắt đầu",
      name: "startTime",
      type: "datetime",
      fill: true,
      required: true,
    },
    {
      label: "Thời gian kết thúc",
      name: "endTime",
      type: "datetime",
      fill: true,
      required: true,
    },
    {
      label: "Giá trị giảm",
      name: "discount",
      type: "number",
      fill: true,
      required: true,
    },
    {
      label: "Đơn vị giảm",
      name: "discountType",
      type: "select",
      fill: true,
      options: [
        { label: "Phần trăm (%)",   value: "1" },
        { label: "VND cố định",     value: "2" },
      ],
    },
    {
      label: "Ngân sách tối đa (VND)",
      name: "budget",
      type: "number",
      fill: true,
    },
    {
      label: "Đơn hàng tối thiểu (VND)",
      name: "minAmount",
      type: "number",
      fill: true,
    },
    {
      label: "Phương thức xử lý",
      name: "mode",
      type: "select",
      fill: true,
      options: [
        { label: "Trực tiếp",  value: "1" },
        { label: "DMN Rule",   value: "2" },
      ],
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ values, errors: {} });
    setIsSubmit(false);
    return () => setIsSubmit(false);
  }, [values]);

  // ─── Submit ──────────────────────────────────────────────────────
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }

    setIsSubmit(true);
    const v = formData.values as any;

    const body: IPromotionRequest = {
      ...(data?.id ? { id: data.id } : {}),
      name:          v.name,
      startTime:     v.startTime,
      endTime:       v.endTime,
      promotionType: Number(v.promotionType),
      discount:      Number(v.discount),
      discountType:  Number(v.discountType) || 1,
      applyType:     Number(v.applyType)    || 1,
      minAmount:     v.minAmount ? Number(v.minAmount) : undefined,
      budget:        v.budget    ? Number(v.budget)    : undefined,
      mode:          Number(v.mode) || 1,
    };

    const res = await PromotionService.update(body);

    if (res?.code === 0) {
      showToast(
        `${data ? "Cập nhật" : "Thêm mới"} chương trình khuyến mãi thành công`,
        "success"
      );
      onHide(true);
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra. Vui lòng thử lại", "error");
      setIsSubmit(false);
    }
  };

  // ─── Confirm cancel dialog ───────────────────────────────────────
  const showDialogConfirmCancel = () => {
    setContentDialog({
      color: "warning",
      isCentered: true,
      isLoading: false,
      title: (
        <Fragment>
          {`Hủy bỏ ${data ? "chỉnh sửa" : "thêm mới"} chương trình`}
        </Fragment>
      ),
      message: (
        <Fragment>Bạn có chắc muốn hủy bỏ? Dữ liệu đang nhập sẽ không được lưu.</Fragment>
      ),
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận hủy",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  // ─── Footer actions ──────────────────────────────────────────────
  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values)
                ? onHide(false)
                : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  // ─── ESC key handler ─────────────────────────────────────────────
  const checkKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) focusedElement.blur();
        } else {
          onHide(false);
        }
      }
    },
    [formData, showDialog]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
  }, [checkKeyDown]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-promotional"
      >
        <form onSubmit={onSubmit}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} chương trình khuyến mãi`}
            toggle={() => !isSubmit && onHide(false)}
          />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) =>
                    handleChangeValidate(
                      value,
                      field,
                      formData,
                      validations,
                      listField,
                      setFormData
                    )
                  }
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
