import React, { Fragment, useEffect, useMemo, useState } from "react";
import Icon from "components/icon";
import UserService from "services/UserService";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Validate, { handleChangeValidate } from "utils/validate";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { isDifferenceObj } from "reborn-util";

export default function ChangePasswordUser(props: Record<string, unknown>) {
  const { onShow, onHide, id } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [isShowPassword, setIsShowPassword] = useState({
    password: false,
    newPassword: false,
  });

  const values = useMemo(
    () =>
      ({
        newPassword: "",
        retypePassword: "",
      } as Record<string, unknown>),
    []
  );

  const validations: IValidation[] = [
    {
      name: "newPassword",
      rules: "required",
    },
    {
      name: "retypePassword",
      rules: "required|compare:newPassword",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const handleBluePassword = (e) => {
    const value = e.target.value;
    if (value != "formData?.values?.retypePassword") {
      setFormData({ ...formData, errors: { ...formData.errors, retypePassword: "Nhập lại mật khẩu mới không trùng khớp với Mật khẩu mới" } });
    }
  };

  const listField = useMemo(
    () =>
      [
        {
          label: "Mật khẩu mới",
          name: "newPassword",
          type: isShowPassword.password ? "text" : "password",
          fill: true,
          required: true,
          icon: isShowPassword.password ? <Icon name="Eye" /> : <Icon name="EyeSlash" />,
          iconPosition: "right",
          iconClickEvent: () => setIsShowPassword({ ...isShowPassword, password: !isShowPassword.password }),
          onBlur: (e) => handleBluePassword(e),
        },
        {
          label: "Nhập lại mật khẩu mới",
          name: "retypePassword",
          type: isShowPassword.newPassword ? "text" : "password",
          fill: true,
          required: true,
          icon: isShowPassword.newPassword ? <Icon name="Eye" /> : <Icon name="EyeSlash" />,
          iconPosition: "right",
          iconClickEvent: () => setIsShowPassword({ ...isShowPassword, newPassword: !isShowPassword.newPassword }),
        },
      ] as IFieldCustomize[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isShowPassword, formData]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);
    return () => {
      setIsSubmit(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: Record<string, unknown> = {
      id: id,
      ...(formData.values as Record<string, unknown>),
    };

    const response = await UserService.resetPass(body);

    if (response.code === 0) {
      showToast("Thay đổi mật khẩu thành công", "success");
      onHide(true);
      setFormData({ values: values, errors: {} });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
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
              onHide(false);
              setFormData({ values: values, errors: {} });
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSubmit, formData, values]
  );

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        className="modal-change--password"
        isFade={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        isCentered={true}
      >
        <form className="form-change--password" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={"Thay đổi mật khẩu"} toggle={() => !isSubmit && onHide(false)} />
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
    </Fragment>
  );
}
