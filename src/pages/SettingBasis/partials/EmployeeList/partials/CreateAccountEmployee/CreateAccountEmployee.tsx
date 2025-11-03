import React, { Fragment, useEffect, useMemo, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import SelectCustom from "components/selectCustom/selectCustom";
import Button from "components/button/button";
import Input from "components/input/input";
import { IActionModal } from "model/OtherModel";
import { ICreateAccountEmployeeProps } from "model/employee/PropsModel";
import { ISelectUsersFilterRequest } from "model/user/UserRequestModel";
import { ILinkEmployeeUserRequest } from "model/employee/EmployeeRequestModel";
import ImageThirdGender from "assets/images/third-gender.png";
import { showToast } from "utils/common";
import UserService from "services/UserService";
import EmployeeService from "services/EmployeeService";
import "./CreateAccountEmployee.scss";

interface IOptionDataUser {
  value: number;
  label: string;
  phone: string;
  avatar: string;
  email: string;
  name: string;
}

export default function CreateAccountEmployee(props: ICreateAccountEmployeeProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [isLink, setIsLink] = useState<boolean>(false);

  const [detailValueUserOption, setDetailValueUserOption] = useState<IOptionDataUser>(null);

  const [valuePassword, setValuePassword] = useState<string>("");
  const [isOptionOne, setIsOptionOne] = useState<boolean>(false);
  const [isOptionTwo, setIsOptionTwo] = useState<boolean>(false);
  const [passwordResponse, setPasswordResponse] = useState<string>("");

  useEffect(() => {
    if (data?.userId) {
      setIsOptionTwo(true);
    }
  }, [data?.userId]);

  const loadOptionUser = async (search, loadedOptions, { page }) => {
    const param: ISelectUsersFilterRequest = {
      query: search,
      page: page,
      limit: 10,
    };
    const response = await UserService.selectUsers(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: `${item.name} ${item.phone ? `- ${item.phone}` : ""}`,
                  avatar: item.avatar,
                  phone: item.phone,
                  email: item.email,
                  name: item.name,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const getDetailUser = async () => {
    const response = await UserService.detail(data?.userId);

    if (response.code === 0) {
      const result = response.result;

      const dataOption = {
        value: result.id,
        label: `${result.name} ${result.phone ? `- ${result.phone}` : ""}`,
        phone: result.phone,
        avatar: result.avatar,
        email: result.email,
        name: result.name,
      };
      setDetailValueUserOption(dataOption);
    }
  };

  //! đoạn này xử lý vấn đề sau khi mà đã có userId từ nhân viên rồi
  //  thì call api chi tiết khách hàng đó ra luôn
  useEffect(() => {
    if (data?.userId !== null && onShow && data) {
      getDetailUser();
    }
  }, [data, onShow]);

  //! đoạn này xử lý vấn đề thay đổi giá trị user
  const handleChangeValueUser = (e) => {
    setDetailValueUserOption(e);
  };

  //! đoạn này xử lý vấn đề lấy thông tin hình ảnh user
  const formatOptionLabel = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const onCreateAccount = async () => {
    setIsSubmit(true);

    const body = {
      name: data.name || "",
      avatar: data.avatar || "",
      phone: data.phone,
      phoneVerified: 1,
      email: data.email || "",
      plainPassword: valuePassword,
      isCollaborator: 0,
      seeder: 0,
    };

    const response = await UserService.create(body);

    if (response.code === 0) {
      autoLinkEmployeeUser(response?.result?.id);
      showToast(`${data?.userId !== null ? "Thay đổi" : "Tạo mới"} tài khoản thành công`, "success");

      onHide(true);
      setIsSubmit(false);
      setIsOptionOne(false);
      setIsOptionTwo(false);
      setValuePassword("");
      setDetailValueUserOption(null);
    } else if (response.code === 400) {
      // thực hiện liên kết
      showToast("Đã tìm thấy một tài khoản khác trùng với tài khoản của bạn", "warning");
      setPasswordResponse(body.plainPassword);
      setIsLink(true);
      setIsSubmit(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  //! đoạn này xử lý vấn đề xác định liên kết
  const handleLinkEmployeeUser = async () => {
    const body: ILinkEmployeeUserRequest = {
      id: data.id,
      userId: detailValueUserOption.value,
    };

    const response = await EmployeeService.linkEmployeeUser(body);

    if (response.code === 0) {
      onHide(true);
      showToast("Liên kết thành công", "success");
      setDetailValueUserOption(null);
      setValuePassword("");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const autoLinkEmployeeUser = async (userId) => {
    if (!userId) {
      return;
    }

    const body: ILinkEmployeeUserRequest = {
      id: data.id,
      userId,
    };

    const response = await EmployeeService.linkEmployeeUser(body);
    // đoạn này bh dõ nghiệp vụ quay lại fix
    return response.code === 0;
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
              setIsOptionOne(false);
              // setIsOptionTwo(false);
              setValuePassword("");
              setPasswordResponse("");
              setDetailValueUserOption(null);
            },
          },
          {
            title: "Xác nhận",
            color: "primary",
            disabled:
              isSubmit ||
              (isOptionOne ? valuePassword.length == 0 || valuePassword == passwordResponse : data?.userId === detailValueUserOption?.value),
            is_loading: isSubmit,
            callback: () => {
              isOptionOne ? onCreateAccount() : handleLinkEmployeeUser();
            },
          },
        ],
      },
    }),
    [isSubmit, detailValueUserOption, isOptionOne, valuePassword, data, passwordResponse]
  );

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => onHide(false)}
        className="modal-create-account-employee"
      >
        <ModalHeader
          title={`${data?.userId !== null ? "Thay đổi" : "Tạo mới"} tài khoản cho nhân viên`}
          toggle={() => {
            !isSubmit && onHide(false);
            setDetailValueUserOption(null);
            setIsOptionOne(false);
          }}
        />
        <ModalBody>
          <div className="list-form-group">
            {!isLink && (
              <div className="list-option">
                <div
                  className={`option__one ${isOptionOne ? "active" : ""}`}
                  onClick={() => {
                    setIsOptionOne(!isOptionOne);
                    setIsOptionTwo(false);
                  }}
                >
                  <label>Tạo mới tài khoản</label>
                </div>
                <span className="sub-option">Hoặc</span>
                <div
                  className={`option__two ${isOptionTwo ? "active" : ""}`}
                  onClick={() => {
                    setIsOptionTwo(!isOptionTwo);
                    setIsOptionOne(false);
                  }}
                >
                  <label htmlFor="selectUser">Chọn từ tài khoản đã có</label>
                </div>
              </div>
            )}

            {!isLink && isOptionTwo && (
              <div className="form-group">
                <label htmlFor="selectUser">Chọn tài khoản</label>

                <SelectCustom
                  id="selectUser"
                  name="selectUser"
                  fill={true}
                  options={[]}
                  value={detailValueUserOption}
                  onChange={(e) => handleChangeValueUser(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn từ tài khoản có sẵn"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadOptionUser}
                  formatOptionLabel={formatOptionLabel}
                />
              </div>
            )}
            {!isLink && isOptionOne && (
              <div className="form-group">
                <Input
                  label="Mật khẩu"
                  value={valuePassword}
                  fill={true}
                  placeholder="Nhập mật khẩu"
                  onChange={(e) => setValuePassword(e.target.value)}
                />
                {/* <span className="suggest">Gợi ý: Mật khẩu nên đặt trùng với số điện thoại cho dễ nhớ.</span> */}
              </div>
            )}

            {isLink && (
              <div className="link-request">
                <div className="notify">
                  <span>Đã tìm thấy một tài khoản khác trùng với tài khoản của bạn ?</span>
                  <span>Bạn có muốn chọn tài khoản có sẵn !</span>
                </div>

                <div className="your-choice">
                  <Button
                    type="button"
                    color="success"
                    onClick={() => {
                      setIsLink(false);
                      isOptionOne ? setIsOptionOne(true) : setIsOptionTwo(true);
                      // setIsOptionOne(false);
                      // setIsOptionTwo(true);
                    }}
                  >
                    Đồng ý
                  </Button>
                  <Button
                    type="button"
                    color="destroy"
                    onClick={() => {
                      setIsLink(false);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}
