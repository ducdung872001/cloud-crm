import React, { Fragment, useState, useEffect, useMemo } from "react";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IViewWorkModalProps } from "model/workOrder/PropsModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import Loading from "components/loading";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import CustomScrollbar from "components/customScrollbar";
import ImageThirdGender from "assets/images/third-gender.png";
import WorkOrderService from "services/WorkOrderService";
import "./ViewWorkModal.scss";

export default function ViewWorkModal(props: IViewWorkModalProps) {
  const { idWork, onShow, onHide } = props;

  const [detailWork, setDetailWork] = useState<IWorkOrderResponseModel>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getDetailWork = async () => {
    setIsLoading(true);

    const response = await WorkOrderService.detail(idWork);

    if (response.code === 0) {
      const result = response.result;
      setDetailWork(result);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (idWork && onShow) {
      getDetailWork();
    }
  }, [idWork, onShow]);

  const listInfoWorkLeft = [
    {
      title: "Ngày bắt đầu",
      name: moment(detailWork?.startTime).format("DD/MM/YYYY HH:mm"),
      className: "start--work",
    },
    {
      title: "Ngày kết thúc",
      name: moment(detailWork?.endTime).format("DD/MM/YYYY HH:mm"),
      className: "end--work",
    },
    {
      title: "Khối lượng công việc",
      name: `${detailWork?.workLoad} ${detailWork?.workLoadUnit == "D" ? "Ngày" : detailWork?.workLoadUnit == "H" ? "Giờ" : "Phút"}`,
      className: "time--success",
    },
    {
      title: "Trạng thái công việc",
      name: `${
        detailWork?.status?.toString() == "1"
          ? "Đang thực hiện"
          : detailWork?.status?.toString() == "2"
          ? "Đã hoàn thành"
          : detailWork?.status?.toString() == "3"
          ? "Đã hủy"
          : "Tạm dừng"
      }`,
      className: `status--work ${
        detailWork?.status?.toString() == "1"
          ? "status--work-pendding"
          : detailWork?.status?.toString() == "2"
          ? "status--work-success"
          : detailWork?.status?.toString() == "3"
          ? "status--work-faild"
          : "status--work-pause"
      }`,
    },
    {
      title: "Tiến độ",
      name: `${detailWork?.percent?.toString()} %`,
      className: "progress--work",
    },
    {
      title: "Thuộc dự án",
      name: detailWork?.projectName,
      className: "in-project",
    },
    {
      title: "Loại công việc",
      name: detailWork?.workTypeName,
      className: "work-type",
    },
    {
      title: "Mức độ ưu tiên",
      name:
        detailWork?.priorityLevel.toString() == "1"
          ? "Thấp"
          : detailWork?.priorityLevel.toString() == "2"
          ? "Trung bình"
          : detailWork?.priorityLevel.toString() == "3"
          ? "Cao"
          : "Rất cao",
      className: "priority-rate",
    },
    {
      title: "Nội dung",
      name: detailWork?.content?.length > 0 ? detailWork?.content : ".............",
      className: "content",
    },
    {
      title: "Tài liệu",
      name: JSON.parse(detailWork?.docLink || "[]").length > 0 ? detailWork?.docLink : ".............",
      className: JSON.parse(detailWork?.docLink || "[]").length > 0 ? "document" : "",
    },
  ];

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide(false);
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-show-work">
        {!isLoading && detailWork !== null ? (
          <Fragment>
            <ModalHeader title={`Xem chi tiết công việc - ${detailWork?.name.toLowerCase()}`} toggle={() => onHide(false)} />
            <CustomScrollbar width="100%" height={`${JSON.parse(detailWork?.docLink || "[]").length > 0 ? 48 : 42}rem`}>
              <ModalBody>
                <div className="wrapper__view--work">
                  <div className="view__work--left">
                    {listInfoWorkLeft.map((item, idx) => (
                      <div key={idx} className={`item__info--left ${item.className}`}>
                        <h4 className="title">{item.title}</h4>
                        {item.className == "content" ? (
                          <p className="content--item">{item.name}</p>
                        ) : item.className == "document" ? (
                          JSON.parse(item.name || "[]").length > 0 && (
                            <div className="document--item">
                              {JSON.parse(item.name || "[]").map((el, idxEl) => {
                                return el.type === "image" ? (
                                  <div key={idxEl} className="image-item">
                                    <img src={el.url} alt="" />
                                  </div>
                                ) : (
                                  ""
                                );
                              })}
                            </div>
                          )
                        ) : (
                          <h4 className="name">{item?.name}</h4>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="view__work--right">
                    <div className="info__manager">
                      <h4 className="title">Người quản lý dự án</h4>
                      <div className="name__manager">
                        <div className="avatar--manager">
                          <img src={detailWork?.managerAvatar || ImageThirdGender} alt={detailWork.managerName} />
                        </div>
                        {detailWork.managerName}
                      </div>
                    </div>

                    <div className="info__job--recipient">
                      <h4 className="title">Người nhân việc</h4>
                      <div className="name__recipient">
                        <div className="avatar--recipient">
                          <img src={detailWork?.employeeAvatar || ImageThirdGender} alt="" />
                        </div>
                        {detailWork.employeeName}
                      </div>
                    </div>

                    <div className={`info__participant ${detailWork.lstParticipant?.length === 0 ? "d-flex " : ""}`}>
                      <h4 className="title">Người tham gia</h4>
                      {detailWork.lstParticipant?.length > 0 ? (
                        <div className="list__participant">
                          <CustomScrollbar
                            width="32rem"
                            height={`${(detailWork.lstParticipant?.length * 36) / 10 >= 14 ? 14 : (detailWork.lstParticipant?.length * 36) / 10}rem`}
                          >
                            <Fragment>
                              {detailWork.lstParticipant.map((item, idx) => {
                                return (
                                  <div key={idx} className="item__participant">
                                    <div className="avatar--participant">
                                      <img src={item.avatar || ImageThirdGender} alt={item.name} />
                                    </div>
                                    {item.name}
                                  </div>
                                );
                              })}
                            </Fragment>
                          </CustomScrollbar>
                        </div>
                      ) : (
                        <span className="three--dots">...............</span>
                      )}
                    </div>

                    <div className={`info__customer ${detailWork.lstCustomer?.length === 0 ? "d-flex " : ""}`}>
                      <h4 className="title">Khách hàng liên quan</h4>
                      {detailWork.lstCustomer?.length > 0 ? (
                        <div className="list__customer">
                          <CustomScrollbar
                            width="32rem"
                            height={`${(detailWork.lstCustomer?.length * 36) / 10 >= 14 ? 14 : (detailWork.lstCustomer?.length * 36) / 10}rem`}
                          >
                            <Fragment>
                              {detailWork.lstCustomer.map((item, idx) => {
                                return (
                                  <div key={idx} className="item__customer">
                                    <div className="avatar--customer">
                                      <img src={item.avatar || ImageThirdGender} alt={item.name} />
                                    </div>
                                    {item.name}
                                  </div>
                                );
                              })}
                            </Fragment>
                          </CustomScrollbar>
                        </div>
                      ) : (
                        <span className="three--dots">...............</span>
                      )}
                    </div>
                  </div>
                </div>
              </ModalBody>
            </CustomScrollbar>
            <ModalFooter actions={actions} />
          </Fragment>
        ) : (
          <Loading />
        )}
      </Modal>
    </Fragment>
  );
}
