import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Icon from "components/icon";
import Validate, { handleChangeValidate } from "utils/validate";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IActionModal } from "model/OtherModel";
import { isDifferenceObj } from "reborn-util";
import { useActiveElement } from "utils/hookCustom";
import "./ModalShiftConfig.scss";

export type ShiftConfigModel = {
  id?: number;
  shiftName: string;
  startTime: any;
  endTime: any;
  posDevice: string;
  defaultCash: string | number;
  minStaff: string | number;
};

type Props = {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
  data: ShiftConfigModel | null;
  onSubmit: (body: ShiftConfigModel) => Promise<boolean> | boolean;
};

export default function ShiftConfigModal(props: Props) {
  const { onShow, onHide, data, onSubmit } = props;

  const focusedElement = useActiveElement();
  const [isSubmit, setIsSubmit] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        id: data?.id,
        shiftName: data?.shiftName ?? "",
        startTime: data?.startTime ?? "",
        endTime: data?.endTime ?? "",
        posDevice: data?.posDevice ?? "",
        defaultCash: data?.defaultCash?.toString?.() ?? "",
        minStaff: data?.minStaff?.toString?.() ?? "",
      } as ShiftConfigModel),
    [data, onShow]
  );

  const validations: IValidation[] = [
    { name: "shiftName", rules: "required" },
    { name: "startTime", rules: "required" },
    { name: "endTime", rules: "required" },
    { name: "posDevice", rules: "required" },
  ];

  const posOptions = useMemo(
    () => [
      { label: "POS Main Counter", value: "pos1" },
      { label: "POS Quầy 2", value: "pos2" },
    ],
    []
  );

  const listField: IFieldCustomize[] = useMemo(
    () => [
      { label: "Tên ca", name: "shiftName", type: "text", placeholder: "Ví dụ: Ca 1 - Sáng", fill: true, required: true },
      { label: "Tiền lẻ đầu ca mặc định (VNĐ)", name: "defaultCash", type: "number", placeholder: "0", fill: true },
      { label: "Nhân viên tối thiểu", name: "minStaff", type: "number", placeholder: "0", fill: true },
    ],
    []
  );

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ values, errors: {} });
    setIsSubmit(false);

    return () => setIsSubmit(false);
  }, [values]);

  const showDialogConfirmCancel = () => {
    const dialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(dialog);
    setShowDialog(true);
  };

  const handleRequestClose = () => {
    if (isSubmit) return;
    !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData.values as ShiftConfigModel),
      ...(data?.id ? { id: data.id } : {}),
    };

    try {
      const ok = await onSubmit(body);
      if (ok) onHide(true);
      else setIsSubmit(false);
    } catch (err) {
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: handleRequestClose,
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, data]
  );

  const checkKeyDown = useCallback(
    (e) => {
      if (e.keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) focusedElement.blur();
        } else {
          onHide(false);
        }
      }
    },
    [formData, values, showDialog]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={handleRequestClose} className="modal-shift-config">
        <form className="form-shift-config" onSubmit={onSubmitForm}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} cấu hình ca`} toggle={handleRequestClose} />
          <ModalBody>
            <div className="list-form-group">
              <FieldCustomize
                field={listField[0]}
                formData={formData}
                handleUpdate={(value) => handleChangeValidate(value, listField[0], formData, validations, listField, setFormData)}
              />

              <div className="time-grid">
                <DatePickerCustom
                  label="Chọn giờ bắt đầu"
                  value={(formData.values as any).startTime}
                  hasSelectTime
                  fill
                  isFmtText
                  icon={<Icon name="Clock" />}
                  onChange={(date) => setFormData({ ...formData, values: { ...formData.values, startTime: date } })}
                />
                <DatePickerCustom
                  label="Chọn giờ kết thúc"
                  value={(formData.values as any).endTime}
                  hasSelectTime
                  fill
                  isFmtText
                  icon={<Icon name="Clock" />}
                  onChange={(date) => setFormData({ ...formData, values: { ...formData.values, endTime: date } })}
                  className="mt-0"
                />
              </div>

              <SelectCustom
                label="Chọn thiết bị POS"
                options={posOptions}
                value={(formData.values as any).posDevice}
                onChange={(e: any) => setFormData({ ...formData, values: { ...formData.values, posDevice: e?.value } })}
                placeholder="Chọn thiết bị..."
                fill
                required
              />

              <div className="time-grid">
                <FieldCustomize
                  field={listField[1]}
                  formData={formData}
                  handleUpdate={(value) => handleChangeValidate(value, listField[1], formData, validations, listField, setFormData)}
                />

                <FieldCustomize
                  field={listField[2]}
                  formData={formData}
                  handleUpdate={(value) => handleChangeValidate(value, listField[2], formData, validations, listField, setFormData)}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
