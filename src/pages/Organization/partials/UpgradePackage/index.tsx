import React, { Fragment, useEffect, useMemo, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import PackageService from "services/PackageService";

import "./index.scss";

interface IUpgradePackageServiceProps {
  data: any;
  onShow: boolean;
  onHide: (reload: boolean) => void;
}

export default function UpgradePackageService(props: IUpgradePackageServiceProps) {
  const { data, onShow, onHide } = props;

  const [remainingMoney, setRemainingMoney] = useState(0);

  const handCalcMoney = async (id: number) => {
    if (!id) return;

    const body = {
      id: id,
    };

    const response = await PackageService.calcPrice(body);

    if (response.code === 0) {
      const result = response.result;
      setRemainingMoney(result);
    }
  };

  useEffect(() => {
    if (data) {
      handCalcMoney(data.id);
    }
  }, [data]);

  const lstPackageService = [
    {
      value: 1,
      label: "Gói miễn phí",
    },
    {
      value: 2,
      label: "Gói cơ bản",
    },
    {
      value: 3,
      label: "Gói bạc",
    },
    {
      value: 4,
      label: "Gói vàng",
    },
    {
      value: 5,
      label: "Gói kim cương",
    },
  ];

  const nameCommon =
    data && data.packageId > 0 ? lstPackageService.find((item) => item.value === data?.packageType)?.label?.toLowerCase() : "gói miễn phí";

  let changeLstPackageService = [];

  // Tìm index của phần tử trùng khớp
  const startIndex = lstPackageService.findIndex((item) => item.value == data?.packageType);

  if (startIndex !== -1) {
    const resultPackages = lstPackageService.slice(startIndex + 1);
    changeLstPackageService = resultPackages;
  } else {
    changeLstPackageService = lstPackageService;
  }

  const [valuePackage, setValuePackage] = useState(null);
  const [valueDiamond, setValueDiamond] = useState({
    account: "",
    branch: "",
  });

  const [lstPackage, setLstPackage] = useState([]);

  const handleListPackage = async (data) => {
    const params: any = {
      status: 1,
      code: data.code,
      limit: 100,
    };

    const response = await PackageService.lst(params);

    if (response.code === 0) {
      const result = response.result.items.filter((item) => item.packageType > data.packageType);

      setLstPackage(result);
    }
  };

  const handleChangeValuePackage = (e) => {
    setValuePackage(e.value);
    setDataExtend(null);
    handleListPackage(data);
  };

  const [dataExtend, setDataExtend] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClearForm = (acc) => {
    onHide(acc);
    setDataExtend(null);
    setValuePackage(null);
    setValueDiamond({
      account: "",
      branch: "",
    });
  };

  const onsubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const body = {
      id: data?.id,
      newPackageId: dataExtend?.id,
      price: (dataExtend?.priceDiscount || 0) - (remainingMoney || 0) <= 0 ? 0 : (dataExtend?.priceDiscount || 0) - (remainingMoney || 0),
    };

    const response = await PackageService.upgrade(body);

    if (response.code === 0) {
      showToast("Hệ thống đang xử lý", "success");
      handleClearForm(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thủ lại sau!", "error");
    }

    setIsLoading(false);
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác nâng cấp`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isLoading,
            callback: () => {
              valuePackage ? showDialogConfirmCancel() : handleClearForm(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            is_loading: isLoading,
            disabled:
              isLoading || !valuePackage || (valuePackage && valuePackage === 5)
                ? !valueDiamond.account || !valueDiamond.branch
                : false || (valuePackage && valuePackage <= 5 ? !dataExtend : false),
          },
        ],
      },
    }),
    [valuePackage, valueDiamond, isLoading, dataExtend]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm(false)}
        className="modal-upgrade-package-service"
      >
        <form className="form-upgrade-package-service" onSubmit={(e) => onsubmit(e)}>
          <ModalHeader title={`Nâng cấp ${nameCommon}`} toggle={() => handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group" style={valuePackage ? { marginBottom: "0rem" } : {}}>
              <div className="form-group">
                <Input
                  name="endDate"
                  label={`Ngày hết hạn ${nameCommon}`}
                  fill={true}
                  value={moment(data?.endDate).format("DD/MM/YYYY")}
                  disabled={true}
                />
              </div>
              <div className="group__form">
                <div className="form-group">
                  <NummericInput
                    name="time"
                    label={`Số ngày ${data && data.numDay > 0 ? "còn lại" : "quá hạn"} `}
                    fill={true}
                    disabled={true}
                    value={data?.numDay}
                    thousandSeparator={true}
                    suffixes="ngày"
                  />
                </div>
                <div className="form-group">
                  <NummericInput
                    name="money"
                    label="Số tiền còn lại"
                    fill={true}
                    disabled={true}
                    value={remainingMoney}
                    thousandSeparator={true}
                    suffixes="VNĐ"
                  />
                </div>
              </div>
              <div className="form-group">
                <SelectCustom
                  name="package"
                  fill={true}
                  options={changeLstPackageService}
                  value={valuePackage}
                  label="Chọn gói nâng cấp"
                  placeholder="Chọn gói dịch vụ nâng cấp"
                  onChange={(e) => handleChangeValuePackage(e)}
                />
              </div>
              {valuePackage &&
                (valuePackage < 5 ? (
                  <Fragment>
                    <div className="choose-option">
                      {lstPackage &&
                        lstPackage
                          .filter((el) => el.packageType == valuePackage)
                          .map((item, ids) => {
                            const condition = dataExtend && dataExtend.id === item.id;
                            const extend = `${
                              item.period + (item.periodBonus || 0) < 10
                                ? `0${item.period + (item.periodBonus || 0)} tháng`
                                : item.period + (item.periodBonus || 0) > 100
                                ? "Vĩnh viễn"
                                : `${item.period + (item.periodBonus || 0)} tháng`
                            }`;

                            return (
                              <div key={ids} className={`item-option ${condition ? "item-option-active" : ""}`} onClick={() => setDataExtend(item)}>
                                {condition && (
                                  <span className="icon-check">
                                    <Icon name="Checked" />
                                  </span>
                                )}
                                <span className="name-option">{`${item.name}/${extend}`}</span>
                              </div>
                            );
                          })}
                    </div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div className="group__form">
                      <div className="form-group">
                        <NummericInput
                          name="account"
                          label="Số lượng tài khoản"
                          value={valueDiamond.account}
                          fill={true}
                          onValueChange={(e) => {
                            setValueDiamond({ ...valueDiamond, account: e.floatValue });
                          }}
                          placeholder="Nhập số lượng tài khoản"
                        />
                      </div>
                      <div className="form-group">
                        <NummericInput
                          name="branch"
                          label="Số lượng chi nhánh"
                          value={valueDiamond.branch}
                          fill={true}
                          onValueChange={(e) => {
                            setValueDiamond({ ...valueDiamond, branch: e.floatValue });
                          }}
                          placeholder="Nhập số lượng chi nhánh"
                        />
                      </div>
                    </div>
                  </Fragment>
                ))}

              {valuePackage && (
                <Fragment>
                  <div className="group__form">
                    <div className="form-group">
                      <NummericInput
                        name="pay"
                        label="Số tiền gói nâng cấp"
                        value={dataExtend?.priceDiscount || 0}
                        disabled={true}
                        fill={true}
                        suffixes="VNĐ"
                        thousandSeparator={true}
                      />
                    </div>
                    <div className="form-group">
                      <NummericInput
                        name="paid"
                        label="Số tiền phải thanh toán"
                        value={
                          (dataExtend?.priceDiscount || 0) - (remainingMoney || 0) <= 0 ? 0 : (dataExtend?.priceDiscount || 0) - (remainingMoney || 0)
                        }
                        disabled={true}
                        fill={true}
                        suffixes="VNĐ"
                        thousandSeparator={true}
                      />
                    </div>
                  </div>
                  <div className="form-info">
                    <p className="content">
                      <strong>Lưu ý:</strong> Số tiền phải thanh toán sẽ được tính <strong>(Số tiền gói nâng cấp - Số tiền còn lại)</strong>
                    </p>
                  </div>
                </Fragment>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
