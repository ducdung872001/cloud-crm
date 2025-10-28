import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAddEmailModelProps } from "model/email/PropsModel";
import { IEmailRequest } from "model/email/EmailRequestModel";
// import EmailService from "services/EmailService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import { SelectOptionData } from "utils/selectCommon";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import { serialize } from "utils/editor";

import "./SendEmailModal.scss";

export default function SendEmailModal(props: IAddEmailModelProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);  

  const values = useMemo(
    () =>
    ({
      name: "",
      // emailFrom: "",
      emailTo: "",
      title: "",
      type: "1", //Mặc định là 1
      content: "",
    } as IEmailRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "emailFrom",
      rules: "required",
    },
    {
      name: "title",
      rules: "required",
    },
    {
      name: "content",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const listField = useMemo(
    () =>
      [
        {
          label: "Gửi tới",
          name: "emailTo",
          type: "text",
          fill: true,
          value: formData?.values['emailTo'],
          required: true,
        },
        {
          label: "Tiêu đề Email",
          name: "title",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Chọn mẫu Email",
          name: "type",
          type: "radio",
          fill: true,
          required: true,
          options: [
            {
              value: "1",
              label: "Nội dung tự soạn",
            },
            {
              value: "2",
              label: "Chọn mẫu có sẵn",
            },
          ],
        },
        {
          label: "Nội dung Email",
          name: "content",
          type: "editor",
          fill: true,
          required: true,
          onChange: (value) => handleChangeContent(value),
        },
      ] as IFieldCustomize[],
    [data, formData]
  );  

  // đoạn này sẽ xử lý thay đổi nội dung trong trình soạn thảo
  const handleChangeContent = (content) => {
    setFormData({ ...formData, values: { ...formData.values, content } });
  };

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // Lấy thông tin về khách hàng để lấy ra email và tên của khách hàng
  useEffect(() => {
    if (data?.customerId) {
      getCustomerInfo(data.customerId);
    }
  }, [data]);

  const getCustomerInfo = async (customerId: number) => {
    const response = await CustomerService.detail(customerId);    

    if (response.code === 0) {
      const result = response.result;
      setDataCustomer(result);

      console.log(result);
      setFormData({ ...formData, values: { ...formData.values, emailTo: result?.emailMasked } });
    }
  }

  // Thực hiện gửi email
  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IEmailRequest = {
      ...(formData.values as IEmailRequest),
      ...(data ? { id: data.id } : {}),
      content: formData.values["content"] ? serialize({ children: formData.values["content"] }) : "",
      customerId: dataCustomer?.id || 0
    };

    // const response = await EmailService.sendEmail(body);

    // console.log('response email =>', response);
    // if (response.code === 0) {
    //   showToast(`Gửi email thành công`, "success");
    //   onHide(true);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    //   setIsSubmit(false);
    // }
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
            title: "Gửi Email",
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
        className="modal-send-email"
        size="lg"
      >
        <form className="form-email" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Gửi email`} toggle={() => !isSubmit && onHide(false)} />
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
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
