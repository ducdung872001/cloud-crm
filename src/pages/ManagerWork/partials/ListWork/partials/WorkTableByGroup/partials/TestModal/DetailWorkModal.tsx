import React, { Fragment, memo, useEffect, useMemo, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import { showToast } from "utils/common";
import AddWorkRatingModal from "../AddWorkRatingModal/AddWorkRatingModal";
import AddWorkInprogressModal from "../AddWorkInprogressModal/AddWorkInprogressModal";
import EmployeeService from "services/EmployeeService";
import WorkOrderService from "services/WorkOrderService";
import "./DetailWorkModal.scss";
import UpdatePeopleInvolved from "../DetailWork/partials/UpdatePeopleInvolved/UpdatePeopleInvolved";
import UpdateRelatedWork from "../DetailWork/partials/UpdateRelatedWork/UpdateRelatedWork";
import ContentExchangeWork from "../DetailWork/partials/ContentExchangeWork/ContentExchangeWork";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import ResizableLayout from "components/resizableLayout/ResizableLayout";
import Button from "components/button/button";
import Tippy from "@tippyjs/react";
import { IActionModal } from "model/OtherModel";

interface IDetailWorkModalProps {
  onShow: boolean;
  onHide: () => void;
  idData: number | null;
}

const DetailWorkModal = (props: IDetailWorkModalProps) => {
  const { idData, onShow, onHide } = props;
  const [dataEmployee, setDataEmployee] = useState(null);
  const [data, setData] = useState<IWorkOrderResponseModel>(null);
  console.log("data", data);

  const [isInvolveWorks, setIsInvolveWorks] = useState<boolean>(true);
  const [isInvolveCustomer, setIsInvolveCustomer] = useState<boolean>(true);
  const [showModalEvaluateWork, setShowModalEvaluateWork] = useState<boolean>(false);
  const [showModalWorkInprogress, setShowModalWorkInprogress] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [disabledRating, setDisabledRating] = useState<boolean>(false);
  const checkShowFullScreen = localStorage.getItem("showFullScreenModalPartnerEform");
  const [showFullScreen, setShowFullScreen] = useState<boolean>(checkShowFullScreen ? JSON.parse(checkShowFullScreen) : false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => onHide(),
          },
        ],
      },
    }),
    [onHide]
  );

  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();
    if (response.code === 0) setDataEmployee(response.result);
  };

  const handGetDetailWork = async (id: number) => {
    if (!id) return;
    const response = await WorkOrderService.detail(id);
    if (response.code === 0) {
      setData(response.result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    if (onShow && idData) {
      takeDataEmployee();
      handGetDetailWork(idData);
    } else {
      setData(null);
    }
  }, [idData, onShow]);

  useEffect(() => {
    if (data && JSON.parse(data.reviews || "[]").length > 0) {
      const result = JSON.parse(data.reviews || "[]");
      setRating(result[0]["mark"]);
      setHover(result[0]["mark"]);
    } else {
      setRating(0);
      setHover(0);
    }
  }, [data]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onHide();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onHide]);

  const listInfoBasicItem = [
    {
      className: `${data?.content.length > 0 ? "content-work" : ""}`,
      title: "Nội dung công việc",
      name: data?.content ? data?.content : ".....................",
    },
    {
      className: "in-project",
      title: data?.opportunityId ? "Cơ hội" : "Dự án",
      name: data?.projectName,
    },
    {
      className: "type-work",
      title: "Loại công việc",
      name: data?.workTypeName ? data?.workTypeName : ".....................",
    },
    {
      className: "time-start",
      title: "Thời gian bắt đầu",
      name: moment(data?.startTime).format("DD/MM/YYYY HH:mm"),
    },
    {
      className: "time-end",
      title: "Thời gian kết thúc",
      name: moment(data?.endTime).format("DD/MM/YYYY HH:mm"),
    },
    {
      className: "amount-work",
      title: "Khối lượng công việc",
      name: `${data?.workLoad?.toString()} ${data?.workLoadUnit == "D" ? "ngày" : data?.workLoadUnit == "H" ? "giờ" : "phút"}`,
    },
    {
      className: JSON.parse(data?.docLink || "[]").length > 0 ? "related-document" : "",
      title: "Tài liệu liên quan",
      name: JSON.parse(data?.docLink || "[]").length > 0 ? data?.docLink : ".....................",
    },
  ];

  //! đoạn này xử lý vấn đề hiển thị thông tin xem bao giờ thực hiện
  const handleUnfulfilled = (time) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(time).getTime();

    if (currentTime < startTime) {
      if ((startTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((startTime - currentTime) / (60 * 60 * 1000) >= 1) {
        return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="__unfulfilled">{`Bắt đầu sau ${Math.round((startTime - currentTime) / (60 * 1000))} phút`}</span>;
      }
    } else {
      if ((currentTime - startTime) / (24 * 60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 ngày thì trả về ngày, không thì trả về giờ
        return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - startTime) / (60 * 60 * 1000) >= 1) {
        //thời gian hiện tại - nếu thời gian kết thúc >= 1 giờ thì trả về giờ, không thì trả về phút
        return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return <span className="__cancelled">{`Trễ thực hiện ${Math.round((currentTime - startTime) / (60 * 1000))} phút`}</span>;
      }
    }
  };

  //! đoạn này xử lý trong quá trình thực hiện
  const handleProcessing = (start, end) => {
    const currentTime = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const calculatorTime = (endTime - startTime) / 3;

    if (startTime > currentTime) {
      return <span className="__processing">Đang thực hiện</span>;
    } else if (currentTime >= startTime && currentTime <= endTime) {
      if (endTime - currentTime >= calculatorTime) {
        return <span className="__processing">Đang thực hiện</span>;
      } else {
        if ((endTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
        } else if ((endTime - currentTime) / (60 * 60 * 1000) >= 1) {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 60 * 1000))} giờ`}</span>;
        } else {
          return <span className="__processing--waring">{`Còn ${Math.round((endTime - currentTime) / (60 * 1000))} phút`}</span>;
        }
      }
    } else {
      if ((currentTime - endTime) / (24 * 60 * 60 * 1000) >= 1) {
        return <span className="__cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (24 * 60 * 60 * 1000))} ngày`}</span>;
      } else if ((currentTime - endTime) / (60 * 60 * 1000) >= 1) {
        return <span className="__cancelled">{`Quá hạn ${Math.round((currentTime - endTime) / (60 * 60 * 1000))} giờ`}</span>;
      } else {
        return (
          <span className="__cancelled">{`Quá hạn ${
            Math.round((currentTime - endTime) / (60 * 1000)) === 0 ? 1 : Math.round((currentTime - endTime) / (60 * 1000))
          } phút`}</span>
        );
      }
    }
  };

  if (!onShow && !data) return null;

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size={showFullScreen ? "xxl" : "xl"}
        className={showFullScreen ? "modal-work-xml-full" : "modal-work-xml"}
      >
        <form className="form-handle-task">
          <div className="container-header">
            <div className="box-title">
              <h4>Chi tiết công việc</h4>
            </div>
            <div className="container-button">
              {!showFullScreen ? (
                <Tippy content="Mở rộng">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(true);
                    }}
                  >
                    <Icon name="ZoomInFullScreen" />
                  </div>
                </Tippy>
              ) : (
                <Tippy content="Thu nhỏ">
                  <div
                    style={{ marginBottom: 4, marginRight: 5, cursor: "pointer" }}
                    onClick={() => {
                      setShowFullScreen(false);
                    }}
                  >
                    <Icon name="ZoomOutScreen" />
                  </div>
                </Tippy>
              )}
              <Button type="button" className="btn-close" color="transparent" onlyIcon={true} onClick={onHide}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            {data ? (
              <ResizableLayout
                leftComponent={
                  <CustomScrollbar width="100%" height="100%">
                    <div className="info__work--left" style={{ padding: "15px" }}>
                      <div className="info__basic">
                        <h3 className="title-basic">Thông tin chi tiết</h3>
                        <div className="info__basic--item">
                          {listInfoBasicItem.map((item, idx) => (
                            <div key={idx} className={`item ${item.className}`}>
                              <h4 className="title">{item.title}</h4>
                              {item.className === "content-work" ? (
                                <p className="content">{item.name}</p>
                              ) : (
                                <h4 className="name">{typeof item.name === "string" && item.name.includes("[") ? "Có tài liệu" : item.name}</h4>
                              )}
                            </div>
                          ))}

                          <div className="item inprogress-work">
                            <h4 className="title">Tiến độ</h4>
                            <div className="show-inprogress" onClick={() => setShowModalWorkInprogress(true)}>
                              <CircularProgressbar value={data?.percent || 0} text={`${data?.percent || 0}%`} className="value-percent" />
                            </div>
                          </div>

                          <div className="item status-work">
                            <h4 className="title">Trạng thái</h4>
                            <div className="show-status">
                              {data?.status === 0 ? (
                                handleUnfulfilled(data?.startTime)
                              ) : data?.status === 1 ? (
                                handleProcessing(data?.startTime, data?.endTime)
                              ) : data?.status === 2 ? (
                                <span className="__success">Đã hoàn thành</span>
                              ) : data?.status === 3 ? (
                                <span className="__cancelled">Đã hủy</span>
                              ) : (
                                <span className="__pause">Tạm dừng</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="involve-customers mt-3">
                        <div
                          className="title-item title-customers"
                          onClick={() => setIsInvolveCustomer(!isInvolveCustomer)}
                          style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                        >
                          <span>Người liên quan</span>
                          <span>{isInvolveCustomer ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
                        </div>
                        {isInvolveCustomer && <UpdatePeopleInvolved data={data} />}
                      </div>

                      <div className="involve-works mt-3">
                        <div
                          className="title-item title-works"
                          onClick={() => setIsInvolveWorks(!isInvolveWorks)}
                          style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                        >
                          <span>Công việc liên quan</span>
                          <span>{isInvolveWorks ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
                        </div>
                        {isInvolveWorks && <UpdateRelatedWork data={data} />}
                      </div>
                    </div>
                  </CustomScrollbar>
                }
                rightComponent={<ContentExchangeWork dataEmployee={dataEmployee} worId={data?.id} />}
                initialLeftWidth={60}
              />
            ) : (
              <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Loading />
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>

      <AddWorkInprogressModal
        onShow={showModalWorkInprogress}
        idWork={data?.id}
        onHide={(reload) => {
          if (reload) handGetDetailWork(idData);
          setShowModalWorkInprogress(false);
        }}
      />
      <AddWorkRatingModal
        data={data}
        disabledRating={disabledRating}
        onShow={showModalEvaluateWork}
        idWork={data?.id}
        numberRating={rating}
        onHide={(reload) => {
          if (reload) {
            handGetDetailWork(idData);
            setRating(0);
          }
          setShowModalEvaluateWork(false);
        }}
      />
    </Fragment>
  );
};

export default memo(DetailWorkModal);
