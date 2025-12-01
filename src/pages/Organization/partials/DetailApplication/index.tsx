import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";

import LogoCrm from "assets/images/logo-crm.png";
import LogoCms from "assets/images/logo-cms.png";
import LogoApp from "assets/images/logo-app.png";
import LogoMarket from "assets/images/logo-market.png";
import LogoWeb from "assets/images/logo-web.png";

import ApplicationService from "services/ApplicationService";
import { showToast } from "utils/common";
import { IActionModal } from "model/OtherModel";

import { mockDataApp } from "../faceData";

import ShowModalPackage from "../ShowModalPackage";
import UpgradePackageService from "../UpgradePackage";

import { ModalFooter } from "components/modal/modal";
import PackageService from "services/PackageService";

import Dialog, { IContentDialog } from "components/dialog/dialog";

import "./index.scss";

interface IDetailApplicationProps {
  onShow: boolean;
  data: any;
  onHide: () => void;
}

export default function DetailApplication(props: IDetailApplicationProps) {
  const { onShow, onHide, data } = props;

  const [lstApplication, setLstApplication] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataApplication, setDataApplication] = useState(null);
  const [lstAppOther, setLstAppOther] = useState([]);
  const [dataOther, setDataOther] = useState(null);
  const [showModalPackage, setShowModalPackage] = useState<boolean>(false);

  const handGetApplication = async (data) => {
    setIsLoading(true);

    const param = {
      bsnId: data.id,
    };

    const response = await ApplicationService.list(param);
    if (response.code === 0) {
      const result = [...response.result].map((item) => {
        return {
          ...item,
          isMore: false,
        };
      });

      const changeResult = _.cloneDeep(result);

      // Tạo một đối tượng để theo dõi các mục đã thấy
      const seen = {};

      // Lọc và chỉ lấy ra mục mới nhất từ mỗi nhóm mã code
      const filteredData = changeResult.filter((item) => {
        // Nếu mã code đã được thấy trước đó
        if (seen[item.code]) {
          // Kiểm tra xem ngày tạo mới nhất của mục hiện tại lớn hơn ngày tạo mới nhất của mục đã lưu
          if (new Date(item.createdTime) > new Date(seen[item.code].createdTime)) {
            // Cập nhật mục mới nhất cho mã code này
            seen[item.code] = item;
            return true; // Trả về true để giữ mục này trong kết quả
          } else {
            return false; // Nếu không phải là mục mới nhất, loại bỏ nó khỏi kết quả
          }
        } else {
          // Nếu mã code chưa được thấy trước đó, lưu mục này vào seen và giữ nó trong kết quả
          seen[item.code] = item;
          return true;
        }
      });

      const takeInfoAppOther = mockDataApp.filter((item) => {
        return !filteredData.some((el) => {
          return el?.code === item.code;
        });
      });

      setLstApplication(filteredData ? filteredData : []);
      setLstAppOther(takeInfoAppOther);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && data) {
      handGetApplication(data);
    }
  }, [onShow, data]);

  const [lstDataApply, setLstDataApply] = useState([]);

  const titles = ["STT", "Tên gói gia hạn", "Ngày bắt đầu", "Ngày kết thúc", "Hạn dùng còn", "Hành động"];
  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-center"];

  const handleCalculatorDate = (date) => {
    if (!date) return null;

    // Chuyển đổi startDate và endDate thành đối tượng Date
    const endDate: any = new Date(date);

    // Lấy thời gian hiện tại
    const currentDate: any = new Date();

    // Tính số mili giây còn lại giữa ngày hiện tại và ngày kết thúc
    const remainingTimeInMilliseconds = endDate - currentDate;

    // Chuyển đổi từ mili giây sang ngày
    const remainingDays = Math.ceil((remainingTimeInMilliseconds || 0) / (1000 * 60 * 60 * 24));

    return remainingDays;
  };

  const [isAction, setIsAction] = useState<boolean>(false);
  const [dataAction, setDataAction] = useState(null);

  const handleUpdatePackage = async (item) => {
    const body = {
      id: item.id,
      packageId: item.packageId,
    };

    const response = await PackageService.extend(body);

    if (response.code === 0) {
      handGetApplication(data);
      handleListPackage(item);

      showToast("Gia hạn gói thành công", "success");
      setShowDialog(false);
      setContentDialog(null);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const showDialogConfirmExtend = (item) => {
    const extend = `${item.period < 10 ? `0${item.period} tháng` : item.period > 100 ? "Vĩnh viễn" : `${item.period} tháng`}`;
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Gia hạn gói</Fragment>,
      message: (
        <Fragment>
          Xác nhận thanh toán <strong>{formatCurrency(item.price || "0")}</strong> khi gia hạn <strong>{item?.packageName?.toLowerCase()}</strong> cho{" "}
          <strong>{extend}</strong>
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => handleUpdatePackage(item),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const dataMappingArray = (item, index: number, arrayData: any[]) => [
    index + 1,
    item.packageId <= 0 ? (
      <span>
        Gói miễn phí <strong>(Đã hết hiệu lực)</strong>
      </span>
    ) : (
      item.packageName
    ),
    moment(item.startDate).format("DD/MM/YYYY"),
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    <strong key={item.id}>{item.numDay <= 0 ? "Đã hết" : `${item.numDay} ngày`}</strong>,
    arrayData[0].id === item.id && (
      <div key={item.id} className="action-apply">
        {item.packageId > 0 && (
          <Button
            color="warning"
            onClick={() => {
              showDialogConfirmExtend(item);
            }}
          >
            Gia hạn
          </Button>
        )}
        <Button
          color="primary"
          onClick={() => {
            setIsAction(true);
            setDataAction(item);
          }}
        >
          Nâng cấp
        </Button>
      </div>
    ),
  ];

  const handleListPackage = async (item) => {
    if (!item) return;

    const param = {
      bsnId: item.bsnId,
      code: item.code,
    };

    const response = await ApplicationService.list(param);

    if (response.code === 0) {
      const result = response.result.map((item) => {
        return {
          ...item,
          numDay: handleCalculatorDate(item.endDate),
        };
      });
      setLstDataApply(result);
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau !", "error");
    }
  };

  const handChangeItemApplication = async (item) => {
    const updatedItems = lstApplication.map((i) => ({
      ...i,
      isMore: i.id === item.id ? !item.isMore : false,
    }));

    setLstApplication(updatedItems);

    setDataApplication(item.id === dataApplication?.id ? null : item);

    await handleListPackage(item);
  };

  const handleAddMyApp = async (item) => {
    if (!item) return;

    const body = {
      bsnId: data?.id,
      code: dataOther.code,
      packageId: item.id,
    };

    const response = await PackageService.addOrgApp(body);

    if (response.code === 0) {
      handGetApplication(data);
      showToast("Kích hoạt ứng dụng thành công", "success");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const handleClearForm = () => {
    onHide();
    setDataApplication(null);
    setLstApplication([]);
    setLstDataApply([]);
    setIsAction(false);
    setDataAction(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              handleClearForm();
            },
          },
        ],
      },
    }),
    [isAction]
  );

  return (
    <div className="detail__application">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onHide();
            }}
            className="title-first"
            title="Quay lại"
          >
            Tổ chức
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onHide();
            }}
          />
          <h1
            className="title-last"
            style={data.name.length > 50 ? { width: "70%" } : { width: "auto" }}
          >{`Ứng dụng đã dùng ${data.name.toLowerCase()}`}</h1>
        </div>
      </div>

      <div className="card-box info__application">
        <h3 className="title">Ứng dụng đã dùng</h3>
        {!isLoading && lstApplication && lstApplication.length > 0 ? (
          <div className="lst__application">
            {lstApplication.map((item, idx) => {
              return (
                <div key={idx} className="item__application">
                  <div className="avatar-app">
                    <img
                      src={
                        item.code == "CRM"
                          ? LogoCrm
                          : item.code == "CMS"
                          ? LogoCms
                          : item.code == "APP"
                          ? LogoApp
                          : item.code == "WEB"
                          ? LogoWeb
                          : LogoMarket
                      }
                    />
                  </div>
                  <div className="info__app">
                    <div className="item-info">
                      <span className="key">Gói đang dùng</span>
                      <span className="value">{item.packageName}</span>
                    </div>
                    <div className="item-info">
                      <span className="key">Ngày bắt đầu</span>
                      <span className="value">{item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : ""}</span>
                    </div>
                    <div className="item-info">
                      <span className="key">Ngày kết thúc</span>
                      <span className="value">{item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : ""}</span>
                    </div>
                  </div>

                  <div
                    className="more_view"
                    onClick={() => {
                      handChangeItemApplication(item);
                    }}
                  >
                    {item.isMore ? (
                      <span>
                        Thu gọn <Icon name="ChevronUp" />
                      </span>
                    ) : (
                      <span>
                        Xem chi tiết <Icon name="ChevronDown" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : isLoading ? (
          <Loading />
        ) : (
          <SystemNotification
            description={
              <span>
                Hiện tại chưa có ứng dụng đang dùng nào. <br /> Hãy kích hoạt ứng dụng ở bên dưới nhé !
              </span>
            }
            type="no-item"
          />
        )}

        {dataApplication && (
          <div className="table__detail--apply">
            <span className="name-apply">Lịch sử gia hạn Ứng dụng {dataApplication.code}</span>

            {lstDataApply && lstDataApply.length > 0 ? (
              <BoxTable
                name={dataApplication.code}
                titles={titles}
                items={lstDataApply}
                dataMappingArray={(item, index) => dataMappingArray(item, index, lstDataApply)}
                dataFormat={dataFormat}
                striped={true}
              />
            ) : (
              ""
            )}
          </div>
        )}

        <div style={{ marginTop: dataApplication ? "3rem" : "4rem" }} className="app__other">
          <h3 className="title">Ứng dụng chưa kích hoạt</h3>

          <div className="lst__app--other">
            {lstAppOther &&
              lstAppOther.length > 0 &&
              lstAppOther.map((item, idx) => {
                return (
                  <div key={idx} className="item-other">
                    <div className="basic__info--other">
                      <div className="avatar-app">
                        <img
                          src={
                            item.code == "CRM"
                              ? LogoCrm
                              : item.code == "CMS"
                              ? LogoCms
                              : item.code == "APP"
                              ? LogoApp
                              : item.code == "WEB"
                              ? LogoWeb
                              : LogoMarket
                          }
                        />
                      </div>
                      <div className="info__app">
                        <p className="desc">{item.content}</p>
                      </div>
                    </div>
                    <div
                      className="action__app"
                      onClick={() => {
                        setDataOther(item);
                        setShowModalPackage(true);
                      }}
                    >
                      Kích hoạt
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="__footer">
          <ModalFooter actions={actions} />
        </div>
      </div>
      <ShowModalPackage
        onShow={showModalPackage}
        onHide={() => setShowModalPackage(false)}
        data={dataOther}
        callback={(data) => {
          if (data) {
            handleAddMyApp(data);
          }
        }}
      />
      <UpgradePackageService
        onShow={isAction}
        onHide={(reload) => {
          if (reload) {
            handGetApplication(data);
            handleListPackage(dataAction);
          }

          setIsAction(false);
        }}
        data={dataAction}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
