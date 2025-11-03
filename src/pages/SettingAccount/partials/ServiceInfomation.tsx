import React, { Fragment, useContext, useState } from "react";
import moment from "moment";
import { ContextType, UserContext } from "contexts/userContext";
import Button from "components/button/button";
import UpgradePackageService from "./UpgradePackageService";
import ShowModalPayment from "./ShowModalPayment";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { formatCurrency } from "reborn-util";
import PackageService from "services/PackageService";
import { showToast } from "utils/common";

export default function ServiceInfomation({ checkUser }) {
  const { dataExpired, phone, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [isUpgradePackageService, setIsUpgradePackageService] = useState<boolean>(false);
  const [showModalPayment, setShowModalPayment] = useState<boolean>(false);

  const [data, setData] = useState(null);
  const [dataResponse, setDataResponse] = useState(null);

  const handlePaymentProcessing = async (item) => {
    if (!item) return;

    const body = {
      packageId: item.packageId,
      bsnId: dataInfoEmployee?.bsnId,
      code: "CRM",
    };

    const response = await PackageService.addOrgApp(body);

    if (response.code === 0) {
      setShowDialog(false);
      setContentDialog(null);
      setShowModalPayment(true);
      setDataResponse(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
      setShowDialog(false);
      setContentDialog(null);
    }
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirm = (item) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{`Xác nhận thanh toán`}</Fragment>,
      message: (
        <Fragment>
          Số tiền quý khách hàng cần thanh toán đối với <strong>{item.name.toLowerCase()}</strong> là{" "}
          <strong>{item.priceDiscount ? formatCurrency(item.priceDiscount) : "0đ"}</strong> cho{" "}
          {item.id === 5 ? (
            <span>
              <strong>{item.account}</strong> tài khoản và <strong>{item.branch}</strong> chi nhánh
            </span>
          ) : (
            <span>
              lựa chọn{" "}
              <strong>{`${item.name}/${
                item.period < 10 ? `0${item.period} tháng` : item.period > 100 ? "Vĩnh viễn" : `${item.period} tháng`
              }`}</strong>
            </span>
          )}
          .
        </Fragment>
      ),
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handlePaymentProcessing(item);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <div className="info__package--account">
      <div className="header__package">
        <div className="info__left">
          <h2 className="name-package">{dataExpired && dataExpired.name}</h2>
          <div className="view__date">
            Hạn dùng còn{" "}
            {dataExpired ? (
              <strong
                style={
                  dataExpired.numDay < 6
                    ? {
                        color: "var(--error-darker-color)",
                      }
                    : {}
                }
              >
                {dataExpired.numDay > 0 ? dataExpired.numDay : 0}
              </strong>
            ) : (
              "..."
            )}{" "}
            ngày
          </div>
        </div>
        <div className="info__right">
          <div className="time-package">
            <div className="desc--time">
              <span className="key">Ngày hết hạn</span>
              <span className="value">{moment(dataExpired.endDate).format("DD/MM/YYYY")}</span>
            </div>
          </div>
          {+checkUser == 1 && (
            <div className="action__package">
              {dataExpired && dataExpired.numDay < 10 && (
                <Button
                  variant="outline"
                  color="warning"
                  onClick={() => {
                    showDialogConfirm(dataExpired);
                    setDataResponse(null);
                  }}
                >
                  Gia hạn
                </Button>
              )}
              <Button
                variant="outline"
                color="primary"
                onClick={() => {
                  setIsUpgradePackageService(true);
                  setDataResponse(null);
                }}
              >
                Nâng cấp gói
              </Button>
            </div>
          )}
        </div>
      </div>

      <UpgradePackageService
        onShow={isUpgradePackageService}
        data={dataExpired}
        dataInfoEmployee={dataInfoEmployee}
        onHide={(reload) => {
          if (reload) {
            //
          }

          setIsUpgradePackageService(false);
        }}
        callback={(data, dataRes) => {
          if (data) {
            setShowModalPayment(true);
            setData(data);
            setDataResponse(dataRes);
          }
        }}
      />
      <ShowModalPayment onShow={showModalPayment} onHide={() => setShowModalPayment(false)} phone={phone} data={data} dataResponse={dataResponse} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
