import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Icon from "components/icon";
import { IAddDeclareEmailModelProps } from "model/declareEmail/PropsModel";
import { IDeclareEmailRequestModel } from "model/declareEmail/DeclareEmailRequestModel";
import EmailConfigService from "services/EmailConfigService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import { EMAIL_REGEX } from "utils/constant";
import "./AddDeclareEmailModal.scss";

export default function AddDeclareEmailModal(props: IAddDeclareEmailModelProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listPartner, setListPartner] = useState<IOption[]>(null);
  const [isLoadingPartner, setIsLoadingPartner] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(true);

  const onSelectOpenPartner = async () => {
    if (!listPartner || listPartner.length === 0) {
      setIsLoadingPartner(true);
      const dataOption = await SelectOptionData("partnerEmailId");
      if (dataOption) {
        setListPartner([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingPartner(false);
    }
  };

  useEffect(() => {
    if (data?.partnerId) {
      onSelectOpenPartner();
    }

    if (data?.partnerId == null) {
      setListPartner([]);
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        email: data?.email ?? "",
        password: data?.password ?? "",
        partnerId: data?.partnerId ?? null,
      } as IDeclareEmailRequestModel),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "email",
      rules: "nullable|regex",
    },
    {
      name: "password",
      rules: "required|min:8",
    },
    {
      name: "partnerId",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Email",
          name: "email",
          type: "text",
          fill: true,
          required: true,
          regex: new RegExp(EMAIL_REGEX),
          messageErrorRegex: "Email không đúng định dạng",
        },
        {
          label: "Tên người gửi",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mật khẩu",
          name: "password",
          type: isShowPassword ? "password" : "text",
          fill: true,
          required: true,
          iconPosition: "right",
          icon: isShowPassword ? <Icon name="EyeSlash" /> : <Icon name="Eye" />,
          iconClickEvent: () => setIsShowPassword(!isShowPassword),
        },
        {
          label: "Đối tác",
          name: "partnerId",
          type: "select",
          options: listPartner,
          onMenuOpen: onSelectOpenPartner,
          isLoading: isLoadingPartner,
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [listPartner, isLoadingPartner, isShowPassword]
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

    const body: IDeclareEmailRequestModel = {
      ...(formData.values as IDeclareEmailRequestModel),
      ...(data ? { id: data.id } : {}),
    };

    const response = await EmailConfigService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} nguồn gửi email thành công`, "success");
      onHide(true);
      setIsShowPassword(false);
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
        className="modal-add-email--config"
      >
        <form className="form-email-config--group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} nguồn gửi email`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  field={field}
                  key={index}
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
