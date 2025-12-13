import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddWorkInprogressModalProps } from "model/workOrder/PropsModel";
import { IUpdateWorkInprogressModel } from "model/workOrder/WorkOrderRequestModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import NummericInput from "components/input/numericInput";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import WorkOrderService from "services/WorkOrderService";
import { useActiveElement } from "utils/hookCustom";
import "./AddWorkInprogressModal.scss";

export default function AddWorkInprogressModal(props: IAddWorkInprogressModalProps) {
  const { onShow, onHide, idWork } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        percent: "",
        note: "",
        worId: idWork,
      } as IUpdateWorkInprogressModel),
    [onShow, idWork]
  );

  const validations: IValidation[] = [];

  const listField = useMemo(
    () =>
      [
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    []
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: IUpdateWorkInprogressModel = {
      ...(formData.values as IUpdateWorkInprogressModel),
    };

    const response = await WorkOrderService.updateWorkInprogress(body);

    if (response.code === 0) {
      showToast("Cập nhật tiến độ công việc thành công", "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
            callback: () => {
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              formData?.values?.percent == 0 ||
              formData?.values?.percent == "" ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cập nhật tiến độ`}</Fragment>,
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
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-inprogress"
      >
        <form className="form-inprogress-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Cập nhật tiến độ công việc" toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <NummericInput
                  id="percent"
                  name="percent"
                  fill={true}
                  required={true}
                  label="(%) Hoàn thành công việc"
                  value={formData?.values?.percent}
                  placeholder="Nhập (%) hoàn thành công việc"
                  onValueChange={(e) => {
                    setFormData({ ...formData, values: { ...formData?.values, percent: e.floatValue <= 100 ? e.floatValue : 10 } });
                  }}
                  error={formData?.values?.percent === 0}
                  message="(%) Hoàn thành công việc phải lớn hơn 0"
                />
              </div>

              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
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
