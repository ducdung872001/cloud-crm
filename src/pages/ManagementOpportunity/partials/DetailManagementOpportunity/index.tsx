import React, { Fragment, memo, useEffect, useState } from "react";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { formatCurrency } from "reborn-util";
import { CircularProgressbar } from "react-circular-progressbar";
import Icon from "components/icon";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import { IDetailManagementOpportunityProps } from "model/campaignOpportunity/PropsModel";
import { ICampaignOpportunityResponseModel } from "model/campaignOpportunity/CampaignOpportunityResponseModel";
import CampaignService from "services/CampaignService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import AddManagementOpportunityModal from "../AddManagementOpportunityModal";
import "tippy.js/animations/scale-extreme.css";
import "./index.scss";
import EmployeeService from "services/EmployeeService";
import ExchangeOpportunity from "./partials/ExchangeOpportunity/ExchangeOpportunity";
import AddCoyViewerModal from "./partials/AddCustomerViewerModal/AddCoyViewerModal";

function DetailManagementOpportunity(props: IDetailManagementOpportunityProps) {
  const { idData, idCampaign, onShow, onHide } = props;

  const [dataEmployee, setDataEmployee] = useState(null);

  // lấy thông tin nhân viên
  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee(result);
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState<ICampaignOpportunityResponseModel>(null);

  const [showModalEdit, setShowModalEdit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [dataCampaign, setDataCampaign] = useState<ICampaignResponseModel>(null);
  const [dataStep, setDataStep] = useState(null);
  const [showModalChanceProbability, setShowModalChanceProbability] = useState<boolean>(false);
  const [listApproachStep, setListApproachStep] = useState([]);

  const getDetailManagementOpportunity = async () => {
    setIsLoading(true);

    const response = await CampaignOpportunityService.detail(idData);

    if (response.code === 0) {
      const result = response.result;
      setDataDetail(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (idData && onShow) {
      takeDataEmployee();
      getDetailManagementOpportunity();
    }
  }, [onShow, idData]);

  const getDetailCampaign = async (id: number) => {
    const response = await CampaignService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataCampaign(result);
    }
  };

  useEffect(() => {
    if (idCampaign && onShow) {
      getDetailCampaign(idCampaign);
    }
  }, [idCampaign, onShow]);

  // useEffect(() => {
  //   if (dataCampaign && dataDetail) {
  //     const lstOpportunityProcess = dataDetail.lstOpportunityProcess;
  //     const takeLstApproachInDetailCampaign = JSON.parse(dataCampaign.approach || "[]");

  //     if (takeLstApproachInDetailCampaign?.length > 0) {
  //       const takeDetailStep = takeLstApproachInDetailCampaign.find((el) => el.step === dataDetail?.step);
  //       setDataStep(takeDetailStep);
  //     }

  //     if (takeLstApproachInDetailCampaign?.length > 0 && lstOpportunityProcess) {
  //       // đoạn này bh xử lý theo hướng hiển thị phương pháp thực hiện
  //     }
  //   }
  // }, [dataCampaign, dataDetail]);

  const notData = "...............................";

  const checkCls =
    dataDetail?.status == 1
      ? "status status-processing"
      : dataDetail?.status == 2
      ? "status status-success"
      : dataDetail?.status == 3
      ? "status status-cancelled"
      : dataDetail?.status == 4
      ? "status status-failure"
      : "status status-not-started-yet";

  const checkNameStatus =
    dataDetail?.status == 1
      ? "Đang xử lý"
      : dataDetail?.status == 2
      ? "Thành công"
      : dataDetail?.status == 3
      ? "Đã hủy"
      : dataDetail?.status == 4
      ? "Thất bại"
      : "Chưa bắt đầu";

  const listDetailInfo = [
    {
      title: "Tên chiến dịch",
      name: dataDetail?.campaignName || notData,
    },
    {
      title: "Quy trình",
      name: dataDetail?.approachName || notData,
    },
    {
      title: "Khách hàng",
      name: dataDetail?.customerName || notData,
    },
    {
      title: "Nhân viên bán",
      name: dataDetail?.saleName || notData,
    },
    {
      title: "Nguồn khách hàng",
      name: dataDetail?.sourceName || notData,
    },
    {
      title: "Doanh thu dự kiến",
      name: formatCurrency(dataDetail?.expectedRevenue || "0"),
    },
    {
      title: "Kết thúc",
      name: dataDetail?.endDate ? moment(dataDetail.endDate).format("DD/MM/YYYY") : notData,
    },
    {
      title: "Trạng thái",
      name: checkNameStatus,
      className: checkCls,
    },
    {
      title: "Xác suất",
      name: `${dataDetail?.percent || 0}%`,
      className: "cls-percent",
    },
  ];

  const onDelete = async (id: number) => {
    const response = await CampaignOpportunityService.delete(id);

    if (response.code === 0) {
      showToast("Xóa cơ hội thành công", "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICampaignOpportunityResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa cơ hội của chiến dịch
          {item ? <strong> {item.campaignName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleDeletePercent = async (id: number) => {
    const response = await CampaignOpportunityService.opportunityProcessDelete(id);

    if (response.code == 0) {
      showToast("Xóa lịch sử xác suất thành công", "success");
      getDetailManagementOpportunity();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "success");
    }
  };

  const [dataOpportunity, setDataOpportunity] = useState(null);
  const [showModalAddViewer, setShowModalAddViewer] = useState<boolean>(false);
  return (
    <div className="detail__item">
      {!isLoading && dataDetail ? (
        <div className="card-box d-flex align-items-start box__item">
          <div className="box__item--left">
            <div className="info__basic">
              <div className="info__basic--header">
                <h3 className="title-basic">Thông tin chi tiết</h3>

                <div className="actions">
                  <div
                    className="btn-add-viewer"
                    onClick={() => {
                      setDataOpportunity(dataDetail);
                      setShowModalAddViewer(true);
                    }}
                  >
                    <Tippy content="Thêm người xem">
                      <span className="icon__item icon__user--add">
                        <Icon name="UserAdd" />
                      </span>
                    </Tippy>
                  </div>
                  <div className="btn-update" onClick={() => setShowModalEdit(true)}>
                    <Tippy content="Sửa" delay={[100, 0]} animation="scale-extreme">
                      <span>
                        <Icon name="Pencil" />
                      </span>
                    </Tippy>
                  </div>
                  <div className="btn-delete" onClick={() => showDialogConfirmDelete(dataDetail)}>
                    <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                      <span>
                        <Icon name="Trash" />
                      </span>
                    </Tippy>
                  </div>
                </div>
              </div>

              <div className="info__basic--body">
                <div className="list__info">
                  {listDetailInfo.map((item, idx) => (
                    <div key={idx} className="item__detail">
                      <h4 className="title-item">{item.title}</h4>
                      <h4 className={`name-item ${item.className}`}>{item.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="info__history--probability">
              <h3 className="title-basic">Trao đổi</h3>
              <ExchangeOpportunity coyId={dataDetail?.id} />
            </div>
          </div>
          <div className="box__item--right">
            <div className="history__header">
              <h3 className="title-history">Lịch sử bán hàng</h3>
            </div>

            <div className="history__body">
              <div className="list__history">
                {dataDetail?.lstOpportunityProcess &&
                  dataDetail?.lstOpportunityProcess.map((item, idx) => {
                    return (
                      <div key={idx} className="item-history">
                        <div className="content__history">
                          <div className="content-item">
                            <h4 className="title">Quy trình</h4>
                            <h4>{item.approachName}</h4>
                          </div>

                          <div className="content-item">
                            <h4 className="title">Trạng thái</h4>
                            <h4
                              className={
                                item?.status == 1
                                  ? "status status-processing"
                                  : item?.status == 2
                                  ? "status status-success"
                                  : item?.status == 3
                                  ? "status status-cancelled"
                                  : item?.status == 4
                                  ? "status status-failure"
                                  : "status status-not-started-yet"
                              }
                            >
                              {item.status === 2
                                ? "Thành công"
                                : item.status === 4
                                ? "Thất bại"
                                : item.status === 1
                                ? "Đang xử lý"
                                : item.status === 3
                                ? "Đã huỷ"
                                : "Chưa bắt đầu"}
                            </h4>
                          </div>

                          <div className="content-item">
                            <div className="percent-finish">
                              <h4 className="title">Xác suất</h4>
                              <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
                            </div>
                          </div>

                          <div className="percent-finish">
                            <h4 className="title">Thời gian</h4>
                            <div>{moment(item.createdTime).format("DD/MM/YYYY HH:mm")}</div>
                          </div>
                        </div>

                        <div className="content-note">
                          <h4 className="title">Ghi chú</h4>
                          <h4>{item?.note || ""}</h4>
                        </div>

                        {item.activities && item?.activities.length > 0 ? (
                          <div>
                            {item.activities.map((el, idx) => (
                              <div key={idx} className="box-action">
                                {el.code === "collectInfo" ? (
                                  <Tippy content="Thu thập thông tin">
                                    <div className="container-action" onClick={() => {}}>
                                      <Icon name="CollectInfo" style={{ width: 16, height: 16, fill: "var(--primary-color)", cursor: "pointer" }} />
                                    </div>
                                  </Tippy>
                                ) : null}

                                {el.code === "email" ? (
                                  <Tippy content="Gửi email">
                                    <div className="container-action">
                                      <Icon name="EmailFill" style={{ width: 17, fill: "#1c8cff", cursor: "pointer" }} onClick={() => {}} />
                                    </div>
                                  </Tippy>
                                ) : null}

                                {el.code === "sms" ? (
                                  <Tippy content="Gửi SMS">
                                    <div className="container-action">
                                      <Icon name="SMS" style={{ width: 17, fill: "#1c8cff", cursor: "pointer" }} onClick={() => {}} />
                                    </div>
                                  </Tippy>
                                ) : null}

                                {el.code === "voc" ? (
                                  <Tippy content="Thu thập VOC">
                                    <div className="container-action" onClick={() => {}}>
                                      <Icon name="VOC" style={{ width: 16, height: 16, fill: "var(--primary-color)", cursor: "pointer" }} />
                                    </div>
                                  </Tippy>
                                ) : null}

                                {el.code === "call" ? (
                                  <Tippy content="Gọi điện">
                                    <div className="container-action" onClick={() => {}}>
                                      <Icon name="PhoneFill" style={{ width: 16, height: 16, fill: "var(--primary-color)", cursor: "pointer" }} />
                                    </div>
                                  </Tippy>
                                ) : null}

                                {el.code === "face" ? (
                                  <Tippy content="Hẹn gặp">
                                    <div className="container-action" onClick={() => {}}>
                                      <Icon name="Meeting" style={{ width: 20, height: 20, fill: "var(--primary-color)", cursor: "pointer" }} />
                                    </div>
                                  </Tippy>
                                ) : null}

                                {el.code === "schedule" ? (
                                  <Tippy content="Đặt lịch">
                                    <div className="container-action" onClick={() => {}}>
                                      <Icon name="Calendar" style={{ width: 16, height: 16, fill: "var(--primary-color)", cursor: "pointer" }} />
                                    </div>
                                  </Tippy>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {/* <div
                          className="remove__history"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeletePercent(item.id);
                          }}
                        >
                          <Icon name="Trash" />
                        </div> */}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Loading />
      )}
      <AddManagementOpportunityModal
        onShow={showModalEdit}
        idData={idData}
        onHide={(reload) => {
          if (reload) {
            getDetailManagementOpportunity();
          }
          setShowModalEdit(false);
        }}
      />
      {/* <AddChangeProbabilityModal
        onShow={showModalChanceProbability}
        idCampaign={idCampaign}
        idData={idData}
        onHide={(reload) => {
          if (reload) {
            getDetailManagementOpportunity();
          }
          setShowModalChanceProbability(false);
        }}
      /> */}
      <AddCoyViewerModal onShow={showModalAddViewer} dataOpportunity={dataOpportunity} onHide={() => setShowModalAddViewer(false)} />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}

export default memo(DetailManagementOpportunity);
