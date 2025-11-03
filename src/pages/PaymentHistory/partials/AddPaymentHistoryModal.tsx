import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { isDifferenceObj } from "reborn-util";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddPaymentHistoryModalProps } from "model/paymentHistory/PropsModel";
import { IPaymentHistoryRequest } from "model/paymentHistory/PaymentHistoryRequestModel";
import PaymentHistoryService from "services/PaymentHistoryService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import "./AddPaymentHistoryModal.scss";

export default function AddPaymentHistoryModal(props: AddPaymentHistoryModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        amount: data?.amount ?? "0",
        transDate: data?.transDate ?? "",
        content: data?.content ?? "",
        bill: data?.bill ?? "",
        recommenderPhone: data?.recommenderPhone ?? "",
      } as IPaymentHistoryRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "amount",
      rules: "required",
    },
    {
      name: "transDate",
      rules: "required",
    },
    {
      name: "recommenderPhone",
      rules: "required",
    },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Tiền đã thanh toán",
      name: "amount",
      type: "number",
      fill: true,
      required: true,
    },
    {
      label: "Ngày giao dịch",
      name: "transDate",
      type: "date",
      fill: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "right",
      required: true,
    },
    {
      label: "Nội dung",
      name: "content",
      type: "textarea",
      fill: true,
    },
    {
      label: "Người thụ hưởng",
      name: "recommenderPhone",
      type: "text",
      fill: true,
      required: true,
    },
  ];

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
    const body: IPaymentHistoryRequest = {
      ...(formData.values as IPaymentHistoryRequest),
      ...(data ? { id: data.id } : {}),
    };
    const response = await PaymentHistoryService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thanh toán hoa hồng thành công`, "success");
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
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || (formData.errors && Object.keys(formData.errors).length > 0) || !isDifferenceObj(formData.values, values),
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
        className="modal-add-paymenthistory"
      >
        <form className="form-paymenthistory-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} thanh toán hoa hồng`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
              <FileUpload type="bill" label="Chứng từ" formData={formData} setFormData={setFormData} />
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
