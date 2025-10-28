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
import ImageThirdGender from "assets/images/third-gender.png";
import { validateEmail } from "reborn-validation";
import "./SendEmailModal.scss";
import Input from "components/input/input";
import Icon from "components/icon";
import ViewTemplateEmailModal from "./partials/ViewTemplateEmailModal";
import { ITemplateEmailResponseModel } from "model/templateEmail/TemplateEmailResponseModel";
import RebornEditor from "components/editor/reborn";
import SelectCustom from "components/selectCustom/selectCustom";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";

export default function SendEmailModal(props: IAddEmailModelProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataCustomer, setDataCustomer] = useState<ICustomerResponse>(null);

  const [showModalViewTemplateEmail, setShowModalViewTemplateEmail] = useState<boolean>(false);
  const [convertContent, setConvertContent] = useState<string>("");
  console.log("convertContent", convertContent);

  const validateCheckEmail = (value) => {
    if (value && !value.includes("*")) {
      var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(value).toLowerCase());
    } else {
      return true;
    }
  };

  const values = useMemo(
    () =>
      ({
        name: data?.name || "",
        // emailTo: "nguyenngoctrung666@gmail.com",
        //   emailTo: data?.emailFrom || "",
        emailTos: [],
        title: data?.title || "",
        type: data?.type || "1", //Mặc định là 1
        content: data?.content || "",
      } as IEmailRequest),
    [data, onShow]
  );

  //! đoạn này xử lý call api lấy ra thông tin khách hàng
  const loadOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 1000,
    };
    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;
      const dataOptionEmail = (dataOption && dataOption.length > 0 && dataOption.filter((el) => el.emailMasked)) || [];
      if (dataOptionEmail && dataOptionEmail.length > 0) {
        return {
          options: [
            // ...(dataOption.length == 0 ? [{ value: "", label: "Thêm mới khách hàng", isShowModal: true, avatar: "custom" }] : []),
            ...(dataOptionEmail.length > 0
              ? dataOptionEmail.map((item: ICustomerResponse) => {
                  return {
                    value: item.id,
                    label: item.name,
                    avatar: item.avatar,
                    email: item.emailMasked,
                    // address: item.address,
                    // phoneMasked: item.phoneMasked,
                  };
                })
              : []),
          ],
          hasMore: response.result.loadMoreAble,
          additional: {
            page: page + 1,
          },
        };
      } else {
        // console.log('search',search);
        // console.log('check', validateCheckEmail(search));
        if (validateCheckEmail(search)) {
          const data = [
            {
              value: search,
              label: search,
              avatar: "",
              email: search,
            },
          ];

          return {
            options: data,
          };
        }
      }
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueCustomer = (e) => {
    setDataCustomer(e);
    const takeIdCustomer = e.map((item) => item.email);
    setFormData({ ...formData, values: { ...formData?.values, emailTos: takeIdCustomer } });
  };

  const formatOptionLabelCustomer = ({ label, avatar, email }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>{label}</span>
          <span style={{ fontSize: 12, marginTop: 3, color: "#aeb1b5" }}>{email} </span>
        </div>
      </div>
    );
  };

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
        // {
        //   label: "Gửi tới",
        //   name: "emailTos",
        //   type: "text",
        //   fill: true,
        //   value: formData?.values['emailTo'],
        //   required: true,
        //   disabled: true
        // },
        {
          name: "emailTos",
          type: "custom",
          snippet: (
            <SelectCustom
              id="emailTos"
              name="emailTos"
              label="Gửi tới"
              fill={true}
              options={[]}
              isMulti={true}
              value={dataCustomer}
              onChange={(e) => handleChangeValueCustomer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadOptionCustomer}
              placeholder="Gửi tới"
              additional={{
                page: 1,
              }}
              formatOptionLabel={formatOptionLabelCustomer}
            />
          ),
        },
        // {
        //     name: "emailTo",
        //     type: "custom",
        //     snippet: (
        //       <div className="wrapper__email">
        //         <Input
        //           id="emailTo"
        //           name="emailTo"
        //           label="Gửi tới"
        //           value={formData?.values?.emailTo}
        //           fill={true}
        //           placeholder="Nhập email"
        //           required={true}
        //           error={validateEmail}
        //           message={`${
        //             validateEmail
        //               ? "Vui lòng nhập khối lượng công việc"
        //               : ""
        //           }`}
        //           onChange={(e) => handleChangeValueEmail(e)}
        //         />

        //         <div className="select-customer">
        //             <div className="title-select-customer">
        //                 <span>Chọn khách hàng</span>
        //                 <Icon name="ChevronDown" />
        //             </div>
        //         </div>

        //       </div>
        //     ),
        //   },
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

  //? đoạn này xử lý nhập email
  const handleChangeValueEmail = (e) => {
    setFormData({ ...formData, values: { ...formData?.values, emailTo: e.target.value } });
  };

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
      setDataCustomer(null);
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
        setDataCustomer(null);
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
            setDataCustomer(null);
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
                setDataCustomer(null);
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
