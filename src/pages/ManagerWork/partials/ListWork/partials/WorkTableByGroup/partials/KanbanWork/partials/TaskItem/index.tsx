import React, { Fragment, useEffect, useRef, useState } from "react";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { trimContent } from "reborn-util";
import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import OtherGenders from "assets/images/third-gender.png";
import AddWorkInprogressModal from "../../../AddWorkInprogressModal/AddWorkInprogressModal";
import UpdateLevelWorkModal from "../UpdateLevelWork";
import "./index.scss";

interface ITaskItemProps {
  type: "status" | "employee" | "mine";
  takeDescWork: (id: number) => void;
  onReload: any;
  item: any;
  index: number;
  totalTask: number;
}

export default function TaskItem(props: ITaskItemProps) {
  const { type, takeDescWork, item, index, totalTask, onReload } = props;

  const isComponentUnmounted = useRef(false);

  useEffect(() => {
    return () => {
      isComponentUnmounted.current = true;
    };
  }, []);

  const [showModalUpdateInprogress, setShowModalUpdateInprogress] = useState<boolean>(false);
  const [showModalUpdateLevel, setShowModalUpdateLevel] = useState<boolean>(false);

  function calculateRemainingDays(startTime, endTime) {
    const currentDate: any = new Date(); // Ngày hiện tại

    // Chuyển đổi thời gian bắt đầu và kết thúc thành đối tượng Date
    const startDate: any = new Date(startTime);
    const endDate: any = new Date(endTime);

    let remainingDays;

    // So sánh thời gian bắt đầu với ngày hiện tại
    if (startDate > currentDate) {
      // Nếu thời gian bắt đầu lớn hơn ngày hiện tại, tính ngày còn lại là endDate - startDate
      remainingDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    } else {
      // Ngược lại, tính ngày còn lại là endDate - currentDate
      remainingDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
    }

    return remainingDays;
  }

  return (
    <Fragment>
      <Draggable
        key={item.id}
        draggableId={item.id.toString()}
        isDragDisabled={type === "employee" ? false : item.status === 2 || item.status === 3 ? true : false}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              userSelect: "none",
              backgroundColor: snapshot.isDragging
                ? "white"
                : (item.status === 2 || item.status === 3) && type !== "employee"
                ? "var(--extra-color-10)"
                : "white",
              ...provided.draggableProps.style,
            }}
            className={`task__item--work ${totalTask >= 3 ? "task__item--work--lot" : ""}`}
          >
            <div className="info__task">
              <div className="title__work">
                <h4 className="name__work">
                  {trimContent(item.name, 42, true, true)}{" "}
                  <Tippy content="Trao đổi" placement="bottom">
                    <span className="action__exchange" onClick={() => takeDescWork(item)}>
                      <Icon name="Feedback" />
                    </span>
                  </Tippy>
                </h4>
              </div>

              <div className="time__work">
                <div className="time__work--left">
                  <div className="start-work">
                    <span className="key">Bắt đầu</span>
                    <span className="value">{moment(item.startTime).format("DD/MM/YYYY")}</span>
                  </div>

                  <div className="end-work">
                    <span className="key">Kết thúc</span>
                    <span className="value">{moment(item.endTime).format("DD/MM/YYYY")}</span>
                  </div>
                </div>
                <div
                  className={`time__work--right ${calculateRemainingDays(item.startTime, item.endTime) <= 2 ? "one-day" : ""} ${
                    item.status == 3 || item.status == 2 ? "d-none" : ""
                  }`}
                >
                  <Tippy content="Thời gian còn lại">
                    <span className="time-remaining">
                      {calculateRemainingDays(item.startTime, item.endTime) >= 1
                        ? `${calculateRemainingDays(item.startTime, item.endTime)} ngày`
                        : `Quá hạn`}
                    </span>
                  </Tippy>
                </div>
              </div>

              <div className="condition__work">
                <div className="progress-work" style={item.percent === 100 || item.status !== 1 ? { paddingBottom: "0.5rem" } : {}}>
                  <div className="des-progress">
                    <span className="name">Tiến độ</span>
                    <span className="des">{`${item.percent}%`}</span>
                  </div>

                  {item.percent < 100 && item.status === 1 && (
                    <Tippy content="Cập nhật tiến độ" placement="right">
                      <span className="action__edit action__edit--progress" onClick={() => setShowModalUpdateInprogress(true)}>
                        <Icon name="Pencil" />
                      </span>
                    </Tippy>
                  )}
                </div>
                <div className="level-work" style={item.percent === 100 || item.status == 3 || item.status == 2 ? { paddingBottom: "0.3rem" } : {}}>
                  <div className="des-level">
                    <span className="name-level">Ưu tiên</span>
                    <span
                      className={`status-level ${
                        item.priorityLevel === 1
                          ? "status-level--short"
                          : item.priorityLevel === 2
                          ? "status-level--medium"
                          : item.priorityLevel === 3
                          ? "status-level--high"
                          : "status-level--veryhigh"
                      }`}
                    >
                      {item.priorityLevel === 1 ? "Thấp" : item.priorityLevel === 2 ? "Trung bình" : item.priorityLevel === 3 ? "Cao" : "Rất cao"}
                    </span>
                  </div>

                  {item.percent < 100 && item.status !== 3 && item.status !== 2 && (
                    <Tippy content="Cập nhật độ ưu tiên" placement="right">
                      <span className="action__edit action__edit--level" onClick={() => setShowModalUpdateLevel(true)}>
                        <Icon name="Pencil" />
                      </span>
                    </Tippy>
                  )}
                </div>
              </div>

              {type === "status" ? (
                <div className="implementer">
                  <span className="avatar-implementer">
                    <img src={item.employeeAvatar || OtherGenders} alt={item.employeeName} />
                  </span>
                  <h4 className="name-implementer">{item.employeeName}</h4>
                </div>
              ) : type === "employee" ? (
                <div className="status__work">
                  <span
                    className={`status__item ${
                      item.status === 0
                        ? "status__item--unfulfilled"
                        : item.status === 1
                        ? "status__item--processing"
                        : item.status === 2
                        ? "status__item--success"
                        : item.status === 3
                        ? "status__item--cancelled"
                        : "status__item--pause"
                    }`}
                  >
                    {item.status === 0
                      ? "Chưa thực hiện"
                      : item.status === 1
                      ? "Đang thực hiện"
                      : item.status === 2
                      ? "Đã hoàn thành"
                      : item.status === 3
                      ? "Đã hủy"
                      : "Tạm dừng"}
                  </span>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        )}
      </Draggable>
      <AddWorkInprogressModal
        onShow={showModalUpdateInprogress}
        idWork={item.id}
        onHide={(reload) => {
          if (!isComponentUnmounted.current) {
            if (reload) {
              onReload(true);
            }
            setShowModalUpdateInprogress(false);
          }
        }}
      />
      <UpdateLevelWorkModal
        onShow={showModalUpdateLevel}
        data={item}
        onHide={(reload) => {
          if (!isComponentUnmounted.current) {
            if (reload) {
              onReload(true);
            }
            setShowModalUpdateLevel(false);
          }
        }}
      />
    </Fragment>
  );
}
