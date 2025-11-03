import React, { Fragment, useEffect, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import { IViewNewPasswordProps } from "model/employee/PropsModel";
import Input from "components/input/input";
import RadioList from "components/radio/radioList";
import { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IUserRequest } from "model/user/UserRequestModel";
import EmployeeService from "services/EmployeeService"; //Dùng lấy mật khẩu ngẫu nhiên
import UserService from "services/UserService";
import { showToast } from "utils/common";
import Icon from "components/icon";
import "./ViewNewPassword.scss";

export default function ViewNewPassword(props: IViewNewPasswordProps) {
  const { onShow, onHide, password, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [optionChangePassword, setOptionChangePassword] = useState<string>("0");
  const [valuePassword, setValuePassword] = useState<string>(""); // đoạn mã tự sinh hay nhập vào thì set lại state vào biến này

  useEffect(() => {
    // if (optionChangePassword == '0') {
    //   setValuePassword(data?.phone)
    // } else {
    //   setValuePassword("Reborn@32123")
    // }
    if (optionChangePassword == "0") {
      if (data?.phone) {
        setValuePassword(data?.phone);
      } else {
        setValuePassword("Reborn@32123");
      }
    }
  }, [data, optionChangePassword, onShow]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true);

    const body = {
      id: data?.userId || 0,
      phone: data?.phone,
      newPassword: valuePassword,
    } as IUserRequest;

    const response = await UserService.resetPass(body);

    if (response.code === 0) {
      showToast(`Thay đổi mật khẩu thành công`, "success");

      onHide(true);
      setIsSubmit(false);
      setValuePassword("");
    } else if (response.code === 400) {
      setIsSubmit(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  /**
   * Thay đổi phương thức mật khẩu
   */
  const changeMethodPassword = async (methodPass: string) => {
    setOptionChangePassword(methodPass);

    //Nếu là phương thức tự sinh mật khẩu => Sinh ngẫu nhiên
    if ("1" == methodPass) {
      changePassword();
    }
  };

  const changePassword = async () => {
    const response = await EmployeeService.generateRandomPass();
    if (response.code === 0) {
      const randomPass = response.result;
      setValuePassword(randomPass);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              onHide();
              setValuePassword("");
              setOptionChangePassword("0");
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !valuePassword,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, valuePassword]
  );

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
            setValuePassword("");
            setOptionChangePassword("0");
          }
        }}
        className="modal__view--password"
      >
        <div className="wrapper__view--password">
          <form className="form-employee-group" onSubmit={(e) => onSubmit(e)}>
            <ModalHeader
              title={`Thay đổi mật khẩu người dùng`}
              toggle={() => {
                if (!isSubmit) {
                  onHide(false);
                  setValuePassword("");
                  setOptionChangePassword("0");
                }
              }}
            />
            <ModalBody>
              <div className="lst__form-group">
                <div className="form-group">
                  <RadioList
                    name="option_password"
                    value={optionChangePassword}
                    options={[
                      {
                        value: "0",
                        label: "Tự nhập",
                      },
                      {
                        value: "1",
                        label: "Sinh ngẫu nhiên",
                      },
                    ]}
                    onChange={(e) => changeMethodPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Input
                    name="password"
                    label={`${optionChangePassword == "0" ? "Mật khẩu" : "Mật khẩu tự sinh"}`}
                    value={valuePassword}
                    fill={true}
                    onChange={(e) => setValuePassword(e.target.value)}
                    disabled={optionChangePassword !== "0"}
                    placeholder={optionChangePassword == "0" ? "Mật khẩu nên để trùng với số điện thoại" : ""}
                    icon={optionChangePassword !== "0" ? <Icon name="ResetPassword" className="icon-warning" /> : null}
                    iconPosition="right"
                    iconClickEvent={() => {
                      changePassword();
                    }}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter actions={actions} />
          </form>
        </div>
      </Modal>
    </Fragment>
  );
}
