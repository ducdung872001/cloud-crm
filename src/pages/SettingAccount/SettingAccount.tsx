import React, { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import { getDomain, getSearchParameters } from "reborn-util";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { validateIsEmpty, validatePassword } from "reborn-validation";
import { UserContext, ContextType } from "contexts/userContext";
import Icon from "components/icon";
import Loading from "components/loading";
import Input from "components/input/input";
import Button from "components/button/button";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import TitleAction from "components/titleAction/titleAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ThirdGender from "assets/images/third-gender.png";
import { getRootDomain, logout, showToast } from "utils/common";
import { FILE_IMAGE_MAX } from "utils/constant";
import FileService from "services/FileService";
import UserService from "services/UserService";
import { IChangePasswordRequest } from "model/user/UserRequestModel";
import ConnectGmail from "./partials/ConnectGmail";
import ConnectOutlook from "./partials/ConnectOutlook";
import ServiceInfomation from "./partials/ServiceInfomation";
import InformationServicePackage from "./partials/InformationServicePackage";

import "./SettingAccount.scss";

export default function SettingAccount() {
  const { t } = useTranslation();

  const takeUrlParams = getSearchParameters(); 

  const checkUserRoot = localStorage.getItem("user.root");

  document.title = t(`pageSettingPersonal.title`);

  const [cookies, setCookie, removeCookie] = useCookies();

  const { id, avatar, dataExpired } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [dataAccount, setDataAccount] = useState(null);

  const [valuePassword, setValuePassword] = useState({
    valuePassword: "",
    valueNewPassword: "",
    valueRetypeNewPassword: "",
  });

  const [statusPassword, setStatusPassword] = useState({
    password: false,
    newPassword: false,
    retypeNewPassword: false,
  });

  const [validatePasswords, setValidatePasswords] = useState({
    validatePassword: false,
    validateNewPassword: false,
    validateRetypeNewPassword: false,
  });

  const converBirtDay = (day, month, year) => {
    const dateString = `${day > 10 ? day : `0${day}`}/${month > 10 ? month : `0${month}`}/${year}`;
    return dateString;
  };

  const valuesUser = useMemo(
    () =>
      ({
        name: dataAccount?.name ?? "",
        phone: dataAccount?.phone ?? "",
        email: dataAccount?.email ?? "",
        avatar: dataAccount?.avatar ?? "",
        fmtBirthDay: dataAccount ? converBirtDay(dataAccount.birthDay, dataAccount.birthMonth, dataAccount.birthYear) : "",
      } as any),
    [dataAccount]
  );

  const [valueInfo, setValueInfo] = useState({
    name: "",
    phone: "",
    email: "",
    avatar: "",
    fmtBirthDay: "",
  });

  useEffect(() => {
    setValueInfo(valuesUser);
  }, [valuesUser]);

  //Đoạn này tạo ra dữ liệu fake trước
  const [changeAvatar, setChangeAvatar] = useState<string>("");

  const getDetailAccount = async (id: number) => {
    if (!id) return;

    const response = await UserService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataAccount(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (id) {
      getDetailAccount(id);
    }
  }, [id]);

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setValueInfo({ ...valueInfo, avatar: result });
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (e.target.files[0].size > FILE_IMAGE_MAX) {
      showToast(`Ảnh tải lên giới hạn dung lượng không quá ${FILE_IMAGE_MAX / 1024 / 1024}MB`, "warning");
      e.target.value = "";
    } else {
      setChangeAvatar(URL.createObjectURL(e.target.files[0]));
      handUploadFile(e.target.files[0]);
      e.target.value = null;
    }
  };

  // --------------------- 🦾🦾🦾 Logic thay đổi mật khẩu 🦾🦾🦾 ---------------------- //
  const handChangeValuePassword = (e) => {
    const value = e.target.value;
    oninput = () => {
      setValidatePasswords({ ...validatePasswords, validatePassword: false });
    };

    if (!value.startsWith(" ") && !value.endsWith(" ")) {
      setValuePassword({ ...valuePassword, valuePassword: value });
    }
  };

  const handChangeValueNewPassword = (e) => {
    const value = e.target.value;
    oninput = () => {
      setValidatePasswords({ ...validatePasswords, validateNewPassword: false });
    };

    if (!value.startsWith(" ") && !value.endsWith(" ")) {
      setValuePassword({ ...valuePassword, valueNewPassword: value });
    }
  };

  const handChangeBlurNewPassword = (e) => {
    const value = e.target.value;
    if (value) {
      if (!validatePassword(value)) {
        setValidatePasswords({ ...validatePasswords, validateNewPassword: true });
      } else {
        setValidatePasswords({ ...validatePasswords, validateNewPassword: false });
      }
    }
  };

  const handChangeValueRetypeNewPassword = (e) => {
    const value = e.target.value;
    oninput = () => {
      setValidatePasswords({ ...validatePasswords, validateRetypeNewPassword: true });
    };

    if (!value.startsWith(" ") && !value.endsWith(" ")) {
      setValuePassword({ ...valuePassword, valueRetypeNewPassword: value });
    }
  };

  const handChangeBlurRetypeNewPassword = (e) => {
    const value = e.target.value;
    if (value) {
      if (!validatePassword(value)) {
        setValidatePasswords({ ...validatePasswords, validateRetypeNewPassword: true });
      } else {
        setValidatePasswords({ ...validatePasswords, validateRetypeNewPassword: false });
      }
    }
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const showDialogConfirm = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Đăng nhập lại...</Fragment>,
      message: (
        <Fragment>
          Thông tin cá nhân của bạn đã được cập nhật <strong>thành công</strong>. Bạn cần đăng nhập lại !
        </Fragment>
      ),
      defaultText: "Xác nhận",
      defaultAction: () => {
        const sourceDomain = getDomain(decodeURIComponent(document.location.href));
        const rootDomain = getRootDomain(sourceDomain);
        removeCookie("user", { path: "/", domain: rootDomain });
        removeCookie("token", { path: "/", domain: rootDomain });
        localStorage.removeItem("permissions");
        localStorage.removeItem("user.root");
        localStorage.removeItem("checkIsKanban");
        localStorage.removeItem("kanbanTabOpportunity");
        localStorage.removeItem("campaignId");
        localStorage.removeItem("campaignName");
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const submitBasic = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const changeValueInfo = {
      ...valueInfo,
      fmtBirthDay: moment(valueInfo.fmtBirthDay).format("DD/MM/YYYY"),
    };

    const body = {
      ...changeValueInfo,
      ...(dataAccount ? { id: dataAccount.id } : {}),
    };

    const response = await UserService.basicInfo(body);

    if (response.code === 0) {
      showToast("Cập nhật thông tin cá nhân thành công", "success");
      showDialogConfirm();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsSubmit(false);
  };

  const submitChangePassword = async (e) => {
    e.preventDefault();

    const body: IChangePasswordRequest = {
      plainPassword: valuePassword?.valuePassword,
      newPassword: valuePassword?.valueNewPassword,
      retypeNewPassword: valuePassword?.valueRetypeNewPassword,
    };

    //Đổi mật khẩu ở đây
    const response = await UserService.changePass(body);

    if (response.code === 0) {
      showToast(`Đổi mật khẩu thành công`, "success");

      //Đăng xuất
      logout();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const paramsUrl: any = getSearchParameters();

  const elementRef = useRef(null);

  useEffect(() => {
    if (paramsUrl && paramsUrl?.isPackage == "true") {
      const element = document.getElementById("scrollToElementId");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [paramsUrl]);

  return (
    <div className="page-content page__view--info-account">
      <div className="layout__info--acount">
        <div className="card-box __left">
          {!dataAccount ? (
            <Loading />
          ) : (
            <Fragment>
              <TitleAction title="Thông tin cá nhân" />
              <form className="form__update--acount" onSubmit={(e) => submitBasic(e)}>
                <div className="header__info">
                  <div className="avatar--acount">
                    <div className="__avatar">
                      <img src={changeAvatar || avatar || dataAccount.avatar || ThirdGender} alt={dataAccount.name} />
                    </div>

                    <label htmlFor="uploadAvatar">
                      <div className="icon_camera">
                        <Icon name="Camera" />
                      </div>
                    </label>
                    <input
                      type="file"
                      accept="image/gif,image/jpeg,image/png,image/jpg"
                      className="d-none"
                      id="uploadAvatar"
                      onChange={(e) => handleImageUpload(e)}
                    />
                  </div>
                </div>
                <div className="body__info">
                  <div className="lst-form-group">
                    <div className="merge__form">
                      <div className="form-group">
                        <Input
                          name="name"
                          label="Họ và tên"
                          value={valueInfo.name}
                          fill={true}
                          onChange={(e) => setValueInfo({ ...valueInfo, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <DatePickerCustom
                          label="Ngày sinh"
                          name="fmtBirthday"
                          fill={true}
                          value={valueInfo.fmtBirthDay}
                          isFmtText={true}
                          iconPosition="left"
                          icon={<Icon name="Calendar" />}
                          onChange={(e) => setValueInfo({ ...valueInfo, fmtBirthDay: e })}
                          placeholder="Chọn ngày sinh"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <Input
                        name="phone"
                        label="Số điện thoại"
                        value={valueInfo.phone}
                        fill={true}
                        onChange={(e) => setValueInfo({ ...valueInfo, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        name="email"
                        label="Email"
                        value={valueInfo.email}
                        fill={true}
                        onChange={(e) => setValueInfo({ ...valueInfo, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="footer__info">
                  <Button type="submit" disabled={_.isEqual(valueInfo, valuesUser) || isSubmit || (dataExpired && dataExpired.numDay <= 0)}>
                    Lưu {isSubmit ? <Icon name="Loading" /> : ""}
                  </Button>
                </div>
              </form>
            </Fragment>
          )}
        </div>

        <div className="__right">
          <div className="card-box __right--top">
            <TitleAction title="Thay đổi mật khẩu" />

            <form onSubmit={(e) => submitChangePassword(e)}>
              <div className="lst__form__change--password">
                <div className="form-group">
                  <Input
                    label="Mật khẩu hiện tại"
                    type={!statusPassword.password ? "password" : "text"}
                    placeholder="Nhập mật khẩu"
                    value={valuePassword.valuePassword}
                    fill={true}
                    onChange={(e) => handChangeValuePassword(e)}
                    icon={!statusPassword.password ? <Icon name="EyeSlash" /> : <Icon name="Eye" />}
                    iconPosition="right"
                    iconClickEvent={() => setStatusPassword({ ...statusPassword, password: !statusPassword.password })}
                    error={validatePasswords.validatePassword}
                    message={
                      validateIsEmpty(valuePassword.valuePassword)
                        ? "Vui lòng không được bỏ trống!"
                        : "Mật khẩu cần tối thiểu 6 kí tự, có chứa chữ thường, hoa và số!"
                    }
                  />
                </div>
                <div className="form-group">
                  <Input
                    label="Mật khẩu mới"
                    type={!statusPassword.newPassword ? "password" : "text"}
                    placeholder="Nhập mật khẩu mới"
                    value={valuePassword.valueNewPassword}
                    fill={true}
                    onChange={(e) => handChangeValueNewPassword(e)}
                    onBlur={(e) => handChangeBlurNewPassword(e)}
                    icon={!statusPassword.newPassword ? <Icon name="EyeSlash" /> : <Icon name="Eye" />}
                    iconPosition="right"
                    iconClickEvent={() => setStatusPassword({ ...statusPassword, newPassword: !statusPassword.newPassword })}
                    error={validatePasswords.validateNewPassword}
                    message={
                      validateIsEmpty(valuePassword.valueNewPassword)
                        ? "Vui lòng không được bỏ trống!"
                        : "Mật khẩu cần tối thiểu 6 kí tự, có chứa chữ thường, hoa và số!"
                    }
                  />
                </div>
                <div className="form-group">
                  <Input
                    label="Nhập lại mật khẩu mới"
                    type={!statusPassword.retypeNewPassword ? "password" : "text"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={valuePassword.valueRetypeNewPassword}
                    fill={true}
                    onChange={(e) => handChangeValueRetypeNewPassword(e)}
                    onBlur={(e) => handChangeBlurRetypeNewPassword(e)}
                    icon={!statusPassword.retypeNewPassword ? <Icon name="EyeSlash" /> : <Icon name="Eye" />}
                    iconPosition="right"
                    iconClickEvent={() => setStatusPassword({ ...statusPassword, retypeNewPassword: !statusPassword.retypeNewPassword })}
                    error={
                      validatePasswords.validateRetypeNewPassword ||
                      (valuePassword.valueNewPassword && valuePassword.valueNewPassword !== valuePassword.valueRetypeNewPassword)
                    }
                    message={
                      validateIsEmpty(valuePassword.valueRetypeNewPassword)
                        ? "Vui lòng không được bỏ trống!"
                        : "Mật khẩu nhập lại không khới với mật khẩu mới!"
                    }
                  />
                </div>
              </div>
              <div className="footer__info">
                <Button
                  type="submit"
                  disabled={
                    valuePassword.valuePassword === "" ||
                    valuePassword.valueNewPassword === "" ||
                    valuePassword.valueRetypeNewPassword === "" ||
                    validatePasswords.validateNewPassword ||
                    validatePasswords.validateRetypeNewPassword ||
                    (valuePassword.valueNewPassword && valuePassword.valueNewPassword !== valuePassword.valueRetypeNewPassword) ||
                    (dataExpired && dataExpired.numDay <= 0)
                  }
                >
                  Lưu
                </Button>
              </div>
            </form>
          </div>
          <div className="card-box  __right--bottom">
            <TitleAction title="Kết nối" />

            <div className="lst__connect">
              <ConnectGmail />
              <ConnectOutlook /> 
            </div>
          </div>
        </div>
      </div>
      <div className="card-box info__package--use" id="scrollToElementId" ref={elementRef}>
        <TitleAction title="Thông tin gói dịch vụ đang dùng" />

        <ServiceInfomation checkUser={checkUserRoot} />
      </div>
      {+checkUserRoot == 1 && (
        <div className="card-box info__package--service">
          <TitleAction title="Thông tin các gói dịch vụ liên quan" />

          <InformationServicePackage isShowDialog={takeUrlParams && takeUrlParams?.isPackage} />
        </div>
      )}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
