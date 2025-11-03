import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAddEmailModelProps } from "model/email/PropsModel";
import { IEmailRequest } from "model/email/EmailRequestModel";
import EmailService from "services/EmailService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import { serialize } from "utils/editor";

import "./AddEmailModal.scss";
import ViewTemplateEmailModal from "../SendEmailModal/partials/ViewTemplateEmailModal";
import { ITemplateEmailResponseModel } from "model/templateEmail/TemplateEmailResponseModel";
import RebornEditor from "components/editor/reborn";

export default function AddEmailEventModal(props: IAddEmailModelProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);
  const [showModalViewTemplateEmail, setShowModalViewTemplateEmail] = useState<boolean>(false);
  const [convertContent, setConvertContent] = useState<string>("");

  const values = useMemo(
    () =>
      ({
        name: data?.name || "",
        // emailFrom: "",
        emailTo: data?.emailFrom || "",
        title: data?.title || "",
        type: data?.type || "1", //Mặc định là 1
        content: data?.content || "",
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
  const [isContent, setIsContent] = useState("1");

  const listField = useMemo(
    () =>
      [
        {
          label: "Gửi tới",
          name: "emailTo",
          type: "text",
          fill: true,
          value: formData?.values["emailTo"],
          required: true,
          disabled: true,
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
          onClick: (e) => handleChangeContentType(e),
        },
        // {
        //   label: "Nội dung Email",
        //   name: "content",
        //   type: "editor",
        //   fill: true,
        //   required: true,
        //   onChange: (value) => handleChangeContent(value),
        // },
      ] as IFieldCustomize[],
    [data, formData]
  );

  const handleChangeContentType = (e) => {
    const value = e.target.value;
    setIsContent(value);
  };

  useEffect(() => {
    if (isContent === "2") {
      setShowModalViewTemplateEmail(true);
    } else if (isContent === "1") {
      setFormData({ ...formData, values: { ...formData?.values, title: "", content: "" } });
    }
  }, [isContent]);

  // đoạn này sẽ xử lý thay đổi nội dung trong trình soạn thảo
  const handleChangeContent = (dataContent) => {
    setConvertContent(serialize({ children: dataContent }));
  };

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  /**
   * Xử lý khi lựa chọn mẫu email
   * @param item
   */
  const loadTemplateEmail = async (item: ITemplateEmailResponseModel) => {
    if (item) {
      console.log("item.content =>", item.content);
      setConvertContent(item.content);
      setFormData({ ...formData, values: { ...formData.values, title: item.title, content: item.content } });
    }
  };

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
      content: convertContent ?? "",
      customerId: dataCustomer?.id || 0,
    };

    const response = await EmailService.sendEmail(body);
    if (response.code === 0) {
      showToast(`Gửi email thành công`, "success");
      onHide(true);
      setConvertContent("");
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
            title: "Gửi Email",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
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
        setConvertContent("");
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
        toggle={() => {
          if (!isSubmit) {
            onHide(false);
            setConvertContent("");
          }
        }}
        className="modal-send-email"
        size="lg"
      >
        <form className="form-email" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`Gửi email`}
            toggle={() => {
              if (!isSubmit) {
                onHide(false);
                setConvertContent("");
              }
            }}
          />
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

              <div className="form-group">
                {/* TODO: lỗi phần này do trình soạn thảo */}
                <RebornEditor
                  name="content"
                  fill={true}
                  initialValue={formData?.values["content"] ? formData?.values["content"] : ""}
                  // dataText={dataCodeEmail}
                  onChangeContent={(e) => handleChangeContent(e)}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>

      <ViewTemplateEmailModal
        onShow={showModalViewTemplateEmail}
        onHide={(clear) => {
          setShowModalViewTemplateEmail(false);
          if (clear) {
            if (formData?.values.type == "2" && !formData?.values.content) {
              setFormData({ ...formData, values: { ...formData?.values, content: "", type: "1" } });
            }
          }
        }}
        callback={loadTemplateEmail}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
