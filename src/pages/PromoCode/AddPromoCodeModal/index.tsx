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
import CouponService from "services/CouponService";
import { ICoupon, ICouponRequest } from "model/coupon/CouponModel";
import "./index.scss";

interface Props {
  onShow: boolean;
  data:   ICoupon | null;
  onHide: (refresh?: boolean) => void;
}

function toISODate(val: any): string {
  if (!val) return "";
  const m = moment.isMoment(val) ? val : moment(val);
  return m.isValid() ? m.format("YYYY-MM-DD") : "";
}

export default function AddPromoCodeModal({ onShow, data, onHide }: Props) {
  const [isSubmit, setIsSubmit]           = useState(false);
  const [hasSubmitOnce, setHasSubmitOnce] = useState(false);
  const focusedElement                    = useActiveElement();
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(() => ({
    code:          data?.code                        ?? "",
    discountType:  String(data?.discountType         ?? 1),
    discountValue: String(data?.discountValue        ?? ""),
    minOrder:      String(data?.minOrder             ?? 0),
    maxUses:       String(data?.maxUses              ?? ""),
    expiryDate:    data?.expiryDate ? moment(data.expiryDate) : "",
    description:   data?.description                ?? "",
  }), [data, onShow]);

  const validations: IValidation[] = [
    { name: "code",          rules: "required" },
    { name: "discountValue", rules: "required|number" },
    { name: "maxUses",       rules: "required|number" },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Mã giảm giá", name: "code", type: "text", fill: true, required: true,
      placeholder: "VD: REBORN20, FREESHIP...",
    },
    {
      label: "Loại giảm giá", name: "discountType", type: "select", fill: true, required: true,
      options: [
        { label: "Phần trăm (%)",   value: "1" },
        { label: "Số tiền (VND)",   value: "2" },
        { label: "Miễn phí ship",   value: "3" },
      ],
    },
    {
      label: "Mức giảm", name: "discountValue", type: "number", fill: true, required: true,
      placeholder: "VD: 20 (cho %), 50000 (cho VND)",
    },
    {
      label: "Đơn tối thiểu (VND)", name: "minOrder", type: "number", fill: true,
      placeholder: "Nhập 0 nếu không giới hạn",
    },
    {
      label: "Tổng số lượt dùng", name: "maxUses", type: "number", fill: true, required: true,
      placeholder: "Nhập 0 nếu không giới hạn",
    },
    {
      label: "Hạn sử dụng", name: "expiryDate", type: "date", fill: true, required: true,
    },
    {
      label: "Mô tả", name: "description", type: "textarea", fill: true,
      placeholder: "Mô tả ngắn về mã giảm giá (không bắt buộc)",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ values, errors: {} });
    setIsSubmit(false);
    setHasSubmitOnce(false);
    return () => setIsSubmit(false);
  }, [values]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitOnce(true);

    const errors: Record<string, string> = Validate(validations, formData, listField);

    const v = formData.values as any;
    const expiryISO = toISODate(v.expiryDate);
    if (!expiryISO) errors["expiryDate"] = "Vui lòng chọn hạn sử dụng";

    if (Object.keys(errors).length > 0) {
      setFormData(prev => ({ ...prev, errors }));
      return;
    }
    setIsSubmit(true);

    const body: ICouponRequest = {
      ...(data?.id ? { id: data.id } : {}),
      code:          v.code.trim().toUpperCase(),
      discountType:  Number(v.discountType),
      discountValue: Number(v.discountValue),
      minOrder:      v.minOrder ? Number(v.minOrder) : 0,
      maxUses:       v.maxUses  ? Number(v.maxUses)  : 0,
      expiryDate:    expiryISO,
      description:   v.description || undefined,
    };

    const res = await CouponService.update(body);
    if (res?.code === 0) {
      showToast(`${data ? "Cập nhật" : "Tạo"} mã giảm giá thành công`, "success");
      onHide(true);
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra", "error");
      setIsSubmit(false);
    }
  };

  const showDialogConfirmCancel = () => {
    setContentDialog({
      color: "warning", isCentered: true, isLoading: false,
      title: <Fragment>{`Hủy bỏ ${data ? "chỉnh sửa" : "thêm mới"} mã giảm giá`}</Fragment>,
      message: <Fragment>Dữ liệu đang nhập sẽ không được lưu.</Fragment>,
      cancelText: "Quay lại", cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận hủy",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    });
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(() => ({
    actions_right: {
      buttons: [
        {
          title: "Hủy", color: "primary", variant: "outline", disabled: isSubmit,
          callback: () => !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel(),
        },
        {
          title: data ? "Cập nhật" : "Tạo mới", type: "submit", color: "primary",
          disabled: isSubmit
            || (!!data && !isDifferenceObj(formData.values, values))
            || (hasSubmitOnce && !!formData.errors && Object.keys(formData.errors).length > 0),
          is_loading: isSubmit,
        },
      ],
    },
  }), [formData, values, isSubmit, hasSubmitOnce, data]);

  const checkKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === 27 && !showDialog) {
      isDifferenceObj(formData.values, values) ? showDialogConfirmCancel() : onHide(false);
    }
  }, [formData, showDialog]);

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal isFade isOpen={onShow} isCentered staticBackdrop
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-promo-code">
        <form onSubmit={onSubmit}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} mã giảm giá`}
            toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, i) => (
                <FieldCustomize key={i} field={field}
                  handleUpdate={val => handleChangeValidate(val, field, formData, validations, listField, setFormData)}
                  formData={formData} />
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
