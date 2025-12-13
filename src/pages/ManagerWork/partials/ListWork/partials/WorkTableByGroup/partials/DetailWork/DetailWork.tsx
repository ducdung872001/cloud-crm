import React, { Fragment, memo, useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import { IDetailWorkProps } from "model/workOrder/PropsModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import { showToast } from "utils/common";
import AddWorkRatingModal from "../AddWorkRatingModal/AddWorkRatingModal";
import UpdateRelatedWork from "./partials/UpdateRelatedWork/UpdateRelatedWork";
import ContentExchangeWork from "./partials/ContentExchangeWork/ContentExchangeWork";
import AddWorkInprogressModal from "../AddWorkInprogressModal/AddWorkInprogressModal";
import UpdatePeopleInvolved from "./partials/UpdatePeopleInvolved/UpdatePeopleInvolved";
import EmployeeService from "services/EmployeeService";
import WorkOrderService from "services/WorkOrderService";
import "./DetailWork.scss";

const DetailWork = (props: IDetailWorkProps) => {
  const { idData } = props;

  const [dataEmployee, setDataEmployee] = useState(null);
  const [data, setData] = useState<IWorkOrderResponseModel>(null);

  // lấy thông tin nhân viên
  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee(result);
    }
  };

  const handGetDetailWork = async (id: number) => {
    if (!id) return;

    const response = await WorkOrderService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setData(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    if (idData) {
      takeDataEmployee();
      handGetDetailWork(idData);
    }
  }, [idData]);

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

  const [isInvolveWorks, setIsInvolveWorks] = useState<boolean>(true);
  const [isInvolveCustomer, setIsInvolveCustomer] = useState<boolean>(true);
  const [showModalEvaluateWork, setShowModalEvaluateWork] = useState<boolean>(false);
  const [showModalWorkInprogress, setShowModalWorkInprogress] = useState<boolean>(false);

  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [disabledRating, setDisabledRating] = useState<boolean>(false);

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

  return (
    <div className="detail__work--item">
      <div className="card-box d-flex flex-column">
        {data ? (
          <Fragment>
            <div className="header__info--work">
              <div className="info-work">
                <Icon name="BookMark" />
                <h2 className="name-work">{data.name}</h2>
              </div>
            </div>
            <div className="body__info--work">
              <div className="info__work--left">
                <CustomScrollbar width="100%" height="65rem">
                  <div className="wrapper__work--left">
                    <div className="info__basic">
                      <h3 className="title-basic">Thông tin chi tiết</h3>
                      <div className="info__basic--item">
                        {listInfoBasicItem.map((item, idx) => (
                          <div key={idx} className={`item ${item.className}`}>
                            <h4 className="title">{item.title}</h4>
                            {item.className == "content-work" ? (
                              <p className="content">{item.name}</p>
                            ) : item.className == "related-document" ? (
                              JSON.parse(item.name || "[]").length > 0 && (
                                <div className="list-document">
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
                              <h4 className="name">{item.name}</h4>
                            )}
                          </div>
                        ))}

                        <div className="item inprogress-work">
                          <h4 className="title">Tiến độ</h4>
                          <div
                            className="show-inprogress"
                            onClick={() => {
                              if (data.percent !== 100 && data.status !== 0 && data.status !== 2 && data.status !== 3 && data.status !== 4) {
                                setShowModalWorkInprogress(true);
                              } else {
                                showToast("Công việc đang trong trạng thái chưa được thực hiện", "warning");
                              }
                            }}
                          >
                            <CircularProgressbar value={data.percent || 0} text={`${data.percent || 0}%`} className="value-percent" />
                          </div>
                        </div>

                        <div className="item status-work">
                          <h4 className="title">Trạng thái</h4>
                          <div className="show-status">
                            {data.status === 0 ? (
                              handleUnfulfilled(data.startTime)
                            ) : data.status === 1 ? (
                              handleProcessing(data.startTime, data.endTime)
                            ) : data.status === 2 ? (
                              <span className="__success">Đã hoàn thành</span>
                            ) : data.status === 3 ? (
                              <span className="__cancelled">Đã hủy</span>
                            ) : (
                              <span className="__pause">Tạm dừng</span>
                            )}
                          </div>
                        </div>

                        {data.status == 2 && (
                          <div
                            className="item evaluate-work"
                            onClick={() => {
                              if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                if (!data.reviews) {
                                  setShowModalEvaluateWork(true);
                                } else {
                                  if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                    if (dataEmployee?.id === data.managerId) {
                                      setShowModalEvaluateWork(true);
                                    } else {
                                      setDisabledRating(true);
                                      setShowModalEvaluateWork(true);
                                    }
                                  }
                                }
                              }
                            }}
                          >
                            <h4 className="title">Đánh giá</h4>
                            <div className="star-rating">
                              {[...Array(5)].map((item, idx) => {
                                return (
                                  <div
                                    key={idx + 1}
                                    className={idx + 1 <= ((rating && hover) || hover) ? "on" : "off"}
                                    onClick={() => {
                                      if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                        if (!data.reviews) {
                                          setRating(idx + 1);
                                        } else {
                                          if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                            if (dataEmployee?.id === data.managerId) {
                                              setRating(idx + 1);
                                            } else {
                                              setRating(JSON.parse(data.reviews || "[]")[0]["mark"]);
                                            }
                                          }
                                        }
                                      }
                                    }}
                                    onMouseEnter={() => {
                                      if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                        if (!data.reviews) {
                                          setHover(idx + 1);
                                        } else {
                                          if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                            if (dataEmployee?.id === data.managerId) {
                                              setHover(idx + 1);
                                            } else {
                                              setRating(JSON.parse(data.reviews || "[]")[0]["mark"]);
                                            }
                                          }
                                        }
                                      }
                                    }}
                                    onMouseLeave={() => {
                                      if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                        if (!data.reviews) {
                                          setHover(rating);
                                        } else {
                                          if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                            if (dataEmployee?.id === data.managerId) {
                                              setHover(rating);
                                            } else {
                                              setRating(JSON.parse(data.reviews || "[]")[0]["mark"]);
                                            }
                                          }
                                        }
                                      }
                                    }}
                                    onDoubleClick={() => {
                                      if (dataEmployee && (dataEmployee.id === data.employeeId || dataEmployee.id === data.managerId)) {
                                        if (!data.reviews) {
                                          setHover(0);
                                          setRating(0);
                                        } else {
                                          if (JSON.parse(data.reviews || "[]")[0]["employeeId"] === data.managerId) {
                                            if (dataEmployee?.id === data.managerId) {
                                              setHover(0);
                                              setRating(0);
                                            } else {
                                              setRating(JSON.parse(data.reviews || "[]")[0]["mark"]);
                                            }
                                          }
                                        }
                                      }
                                    }}
                                  >
                                    <span className="star">
                                      <Icon name="Star" />
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="involve-customers">
                      <div
                        className="title-item title-customers"
                        onClick={() => {
                          setIsInvolveCustomer(!isInvolveCustomer);
                        }}
                      >
                        <span>Người liên quan</span>
                        <span className="icon-up-down">{isInvolveCustomer ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
                      </div>

                      {isInvolveCustomer && <UpdatePeopleInvolved data={data} />}
                    </div>
                    <div className="involve-works">
                      <div
                        className="title-item title-works"
                        onClick={() => {
                          setIsInvolveWorks(!isInvolveWorks);
                        }}
                      >
                        <span>Công việc liên quan</span>
                        <span className="icon-up-down">{isInvolveCustomer ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}</span>
                      </div>

                      {isInvolveWorks && <UpdateRelatedWork data={data} />}
                    </div>
                  </div>
                </CustomScrollbar>
              </div>
              <div className="info__work--right">
                <ContentExchangeWork dataEmployee={dataEmployee} worId={data?.id} />
              </div>
            </div>
          </Fragment>
        ) : (
          <Loading />
        )}
      </div>
      <AddWorkInprogressModal
        onShow={showModalWorkInprogress}
        idWork={data?.id}
        onHide={(reload) => {
          if (reload) {
            handGetDetailWork(idData);
          }
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
    </div>
  );
};

export default memo(DetailWork);
