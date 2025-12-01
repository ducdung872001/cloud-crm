import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FileUpload from "components/fileUpload/fileUpload";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { isDifferenceObj, showToast } from "utils/common";
import { PHONE_REGEX, EMAIL_REGEX } from "utils/constant";
import UserService from "services/UserService";
import "./AddUserModal.scss";

export default function AddUserModal(props: any) {
  const { onShow, data, onHide } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const focusedElement = useActiveElement();

  const lstOptionRole = [
    {
      value: "mod",
      label: "Quản trị viên",
    },
    {
      value: "user",
      label: "Người dùng",
    },
  ];

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        note: data?.note ?? "",
        avatar: data?.avatar ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        role: data?.role ?? "mod",
        seeder: 0,
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "role",
      rules: "required",
    },
    {
      name: "phone",
      rules: "regex",
    },
    {
      name: "email",
      rules: "regex",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const listField = useMemo(
    () =>
      [
        {
          name: "avatar",
          type: "custom",
          snippet: (
            <div className="upload__image--customer">
              <FileUpload type="avatar" label="Ảnh đại diện" formData={formData} setFormData={setFormData} />
            </div>
          ),
        },
        {
          label: "Họ tên",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Số điện thoại",
          name: "phone",
          type: "text",
          fill: true,
          regex: new RegExp(PHONE_REGEX),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
        },
        {
          label: "Email",
          name: "email",
          type: "text",
          fill: true,
          regex: new RegExp(EMAIL_REGEX),
          messageErrorRegex: "Email không đúng định dạng",
        },
        {
          label: "Vai trò",
          name: "role",
          type: "select",
          options: lstOptionRole,
          fill: true,
          required: true,
        },
        {
          label: "Chuyên môn",
          name: "note",
          type: "text",
          fill: true,
        },
      ] as IFieldCustomize[],
    [formData]
  );

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
    const body: any = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as any),
    };

    let response = null;

    if (data) {
      response = await UserService.update(body);
    } else {
      response = await UserService.create(body);
    }

    if (response.code === 0) {
      showToast(data ? "Cập nhật người dùng thành công" : "Thêm mới người dùng thành công", "success");
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
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác thêm mới lịch điều trị</Fragment>,
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
        isOpen={onShow}
        className="modal-add-user"
        isFade={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        isCentered={true}
      >
        <form className="form-user-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={data ? "Cập nhật người dùng" : "Thêm mới người dùng"} toggle={() => !isSubmit && onHide(false)} />
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
