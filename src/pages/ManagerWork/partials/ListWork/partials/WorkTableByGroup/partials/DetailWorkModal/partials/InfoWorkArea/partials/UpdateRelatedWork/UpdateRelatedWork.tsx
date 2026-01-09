import React, { Fragment, useState, useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import Icon from "components/icon";
import Loading from "components/loading";
import { showToast } from "utils/common";
import { IUpdateRelatedWorkProps } from "model/workOrder/PropsModel";
import { IUpdateRelatedWorkRequestModel } from "model/workOrder/WorkOrderRequestModel";
import { IWorkOrderResponseModel } from "model/workOrder/WorkOrderResponseModel";
import WorkOrderService from "services/WorkOrderService";
import AddRelatedWorkModal from "./partials/AddRelatedWorkModal";
import "react-circular-progressbar/dist/styles.css";
import "./UpdateRelatedWork.scss";

export default function UpdateRelatedWork(props: IUpdateRelatedWorkProps) {
  const { data } = props;

  const [listWork, setListWork] = useState<IWorkOrderResponseModel[]>([]);
  const [listIdWork, setListIdWork] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const getListWork = async () => {
    setIsLoading(true);

    const response = await WorkOrderService.getOtherWorkOrder(data?.id);

    if (response.code === 0) {
      const result = response.result;
      setListWork(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    getListWork();
  }, [data]);

  // khi mà danh sách thay đổi thì mình lấy
  useEffect(() => {
    setListIdWork(() => listWork.map((item) => item.id));
  }, [listWork]);

  //! đoạn này xử lý vấn đề xóa đi 1 công việc liên quan
  const handleRemoveOneRelatedWork = (id) => {
    //? đoạn này dùng toán tử (...) trong ES6 để tránh modify trực tiếp mảng ban đầu
    const newRelatedWork = [...listWork];
    const result = newRelatedWork.filter((item) => item?.id !== id);
    handleRemoveRelatedWork(result);
    setListWork(result);
  };

  //! đoạn này call API xóa công việc liên quan
  const handleRemoveRelatedWork = async (data) => {
    const takeIdRelatedWork = data.map((item) => item.id);

    const body: IUpdateRelatedWorkRequestModel = {
      id: data.id,
      otherWorkOrders: JSON.stringify(takeIdRelatedWork),
    };

    const response = await WorkOrderService.updateOtherWorkOrder(body);

    if (response.code === 0) {
      showToast("Xóa công việc liên quan thành công", "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

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
      return (
        <span className="__processing">
          <Icon name="ClockTime" /> Đang thực hiện
        </span>
      );
    } else if (currentTime >= startTime && currentTime <= endTime) {
      if (endTime - currentTime >= calculatorTime) {
        return (
          <span className="__processing">
            <Icon name="ClockTime" />
            Đang thực hiện
          </span>
        );
      } else {
        if ((endTime - currentTime) / (24 * 60 * 60 * 1000) >= 1) {
          return (
            <span className="__processing--waring">
              <Icon name="ClockTime" />
              {`Còn ${Math.round((endTime - currentTime) / (24 * 60 * 60 * 1000))} ngày`}
            </span>
          );
        } else if ((endTime - currentTime) / (60 * 60 * 1000) >= 1) {
          return (
            <span className="__processing--waring">
              <Icon name="ClockTime" />
              {`Còn ${Math.round((endTime - currentTime) / (60 * 60 * 1000))} giờ`}
            </span>
          );
        } else {
          return (
            <span className="__processing--waring">
              <Icon name="ClockTime" />
              {`Còn ${Math.round((endTime - currentTime) / (60 * 1000))} phút`}
            </span>
          );
        }
      }
    } else {
      if ((currentTime - endTime) / (24 * 60 * 60 * 1000) >= 1) {
        return (
          <span className="__cancelled">
            <Icon name="ClockTime" /> {`Quá hạn ${Math.round((currentTime - endTime) / (24 * 60 * 60 * 1000))} ngày`}
          </span>
        );
      } else if ((currentTime - endTime) / (60 * 60 * 1000) >= 1) {
        return (
          <span className="__cancelled">
            <Icon name="ClockTime" /> {`Quá hạn ${Math.round((currentTime - endTime) / (60 * 60 * 1000))} giờ`}
          </span>
        );
      } else {
        return (
          <span className="__cancelled">
            <Icon name="ClockTime" />{" "}
            {`Quá hạn ${Math.round((currentTime - endTime) / (60 * 1000)) === 0 ? 1 : Math.round((currentTime - endTime) / (60 * 1000))} phút`}
          </span>
        );
      }
    }
  };

  return (
    <Fragment>
      <div className="wrapper__related--work">
        <div className="add-related--work" onClick={() => setShowModalAdd(true)}>
          <Icon name="PlusCircleFill" />
          Thêm công việc liên quan
        </div>
        {!isLoading && listWork && listWork.length > 0 ? (
          <div className="list__related--work">
            {listWork.map((item, idx) => (
              <div key={idx} className="related__work-item">
                <div className="info-work">
                  <h3>{item.name}</h3>
                  <div className="d-flex align-items-center">
                    <div className="status-work">
                      {item.status == 0 ? (
                        handleUnfulfilled(item.startTime)
                      ) : item.status == 1 ? (
                        handleProcessing(item.startTime, item.endTime)
                      ) : item.status == 2 ? (
                        <span className="status-success">
                          <Icon name="ClockTime" /> Đã hoàn thành
                        </span>
                      ) : item.status == 3 ? (
                        <span className="status-cancelled">
                          <Icon name="ClockTime" /> Đã hủy
                        </span>
                      ) : (
                        <span className="status-pause">
                          <Icon name="ClockTime" /> Tạm dừng
                        </span>
                      )}
                    </div>
                    <div className="percent-finish">
                      <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
                    </div>
                  </div>
                </div>
                <div
                  className="remove__related--work"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveOneRelatedWork(item?.id);
                  }}
                >
                  <Icon name="Trash" />
                </div>
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <Loading />
        ) : (
          <span className="notification-related--work">Bạn chưa có công việc liên quan nào!</span>
        )}
      </div>
      <AddRelatedWorkModal
        onShow={showModalAdd}
        idWork={data.id}
        listIdRelatedWork={listIdWork}
        onHide={(reload) => {
          if (reload) {
            getListWork();
          }
          setShowModalAdd(false);
        }}
      />
    </Fragment>
  );
}
