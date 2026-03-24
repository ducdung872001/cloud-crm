import React, { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import moment from "moment";
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

/**
 * Convert bất kỳ giá trị date (moment object / ISO string / Date) → "YYYY-MM-DDTHH:mm:ss"
 * Trả về "" nếu không hợp lệ.
 */
function toISOStr(val: any): string {
  if (!val) return "";
  const m = moment.isMoment(val) ? val : moment(val);
  return m.isValid() ? m.format("YYYY-MM-DDTHH:mm:ss") : "";
}

export default function AddPromotionalModal({ onShow, data, onHide }: Props) {
  const [isSubmit, setIsSubmit]           = useState(false);
  const [hasSubmitOnce, setHasSubmitOnce] = useState(false);
  const focusedElement                    = useActiveElement();
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // ─── Initial values ────────────────────────────────────────────────
  const values = useMemo(
    () => ({
      name:          data?.name                             ?? "",
      // Với date field: truyền string ISO, DatePickerCustom sẽ parse được
      startTime:     data?.startTime ? moment(data.startTime) : "",
      endTime:       data?.endTime   ? moment(data.endTime)   : "",
      promotionType: String(data?.promotionType ?? 1),
      discount:      String(data?.discount      ?? ""),
      discountType:  String(data?.discountType  ?? 1),
      applyType:     String(data?.applyType     ?? 1),
      minAmount:     String(data?.minAmount      ?? ""),
      budget:        String(data?.budget         ?? ""),
      mode:          String(data?.mode           ?? 1),
    }),
    [data, onShow]
  );

  // ─── Validation rules ──────────────────────────────────────────────
  // Không dùng "required" cho date field vì fieldCustomize type="date"
  // trả về moment object – validate thủ công trong onSubmit
  const validations: IValidation[] = [
    { name: "name",          rules: "required" },
    { name: "discount",      rules: "required|number" },
  ];

  // ─── Form fields ───────────────────────────────────────────────────
  const typeOptions = Object.entries(PROMOTION_TYPE_LABELS).map(([k, v]) => ({
    label: v,
    value: k,
  }));

  const listField: IFieldCustomize[] = [
    {
      label:    "Tên chương trình khuyến mãi",
      name:     "name",
      type:     "text",
      fill:     true,
      required: true,
    },
    {
      label:    "Loại chương trình",
      name:     "promotionType",
      type:     "select",
      fill:     true,
      required: true,
      options:  typeOptions,
    },
    {
      label:         "Thời gian bắt đầu",
      name:          "startTime",
      type:          "date",          // ← dùng "date" (fieldCustomize hỗ trợ)
      hasSelectTime: true,            // ← hiện thêm giờ:phút
      fill:          true,
      required:      true,
    },
    {
      label:         "Thời gian kết thúc",
      name:          "endTime",
      type:          "date",
      hasSelectTime: true,
      fill:          true,
      required:      true,
    },
    {
      label:    "Giá trị giảm",
      name:     "discount",
      type:     "number",
      fill:     true,
      required: true,
    },
    {
      label:   "Đơn vị giảm",
      name:    "discountType",
      type:    "select",
      fill:    true,
      options: [
        { label: "Phần trăm (%)", value: "1" },
        { label: "VND cố định",   value: "2" },
      ],
    },
    {
      label: "Ngân sách tối đa (VND)",
      name:  "budget",
      type:  "number",
      fill:  true,
    },
    {
      label: "Đơn hàng tối thiểu (VND)",
      name:  "minAmount",
      type:  "number",
      fill:  true,
    },
    {
      label:   "Phương thức xử lý",
      name:    "mode",
      type:    "select",
      fill:    true,
      options: [
        { label: "Trực tiếp", value: "1" },
        { label: "DMN Rule",  value: "2" },
      ],
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ values, errors: {} });
    setIsSubmit(false);
    setHasSubmitOnce(false);
    return () => setIsSubmit(false);
  }, [values]);

  // ─── Submit ────────────────────────────────────────────────────────
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitOnce(true);

    // 1. Validate các trường text/number bằng Validate()
    const errors: Record<string, string> = Validate(validations, formData, listField);

    // 2. Validate date fields thủ công (vì value là moment object)
    const v = formData.values as any;
    const startISO = toISOStr(v.startTime);
    const endISO   = toISOStr(v.endTime);

    if (!startISO) {
      errors["startTime"] = "Vui lòng chọn thời gian bắt đầu";
    }
    if (!endISO) {
      errors["endTime"] = "Vui lòng chọn thời gian kết thúc";
    }
    if (startISO && endISO && startISO >= endISO) {
      errors["endTime"] = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }

    setIsSubmit(true);

    const body: IPromotionRequest = {
      ...(data?.id ? { id: data.id } : {}),
      name:          v.name,
      startTime:     startISO,
      endTime:       endISO,
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

  // ─── Confirm cancel ────────────────────────────────────────────────
  const showDialogConfirmCancel = () => {
    setContentDialog({
      color:     "warning",
      isCentered: true,
      isLoading: false,
      title:   <Fragment>{`Hủy bỏ ${data ? "chỉnh sửa" : "thêm mới"} chương trình`}</Fragment>,
      message: <Fragment>Bạn có chắc muốn hủy bỏ? Dữ liệu đang nhập sẽ không được lưu.</Fragment>,
      cancelText:    "Quay lại",
      cancelAction:  () => { setShowDialog(false); setContentDialog(null); },
      defaultText:   "Xác nhận hủy",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    });
    setShowDialog(true);
  };

  // ─── Footer actions ────────────────────────────────────────────────
  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title:    "Hủy",
            color:    "primary",
            variant:  "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values)
                ? onHide(false)
                : showDialogConfirmCancel();
            },
          },
          {
            title:  data ? "Cập nhật" : "Tạo mới",
            type:   "submit",
            color:  "primary",
            // Disabled khi:
            // - Đang gửi request (isSubmit)
            // - Đang EDIT và chưa có thay đổi gì so với dữ liệu gốc
            // - Đã submit ít nhất 1 lần VÀ vẫn còn lỗi
            disabled:
              isSubmit ||
              (!!data && !isDifferenceObj(formData.values, values)) ||
              (hasSubmitOnce && !!formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, hasSubmitOnce, data]
  );

  // ─── ESC key handler ──────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────
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
