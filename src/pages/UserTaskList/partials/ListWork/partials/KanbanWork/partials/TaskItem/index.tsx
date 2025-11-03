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

export default function TaskItem(props: any) {
  const { 
    type,
    takeDescWork, 
    item, 
    index, 
    totalTask, 
    onReload,
    setIsDetailWork,
    handleDetailWork
  } = props;

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
        isDragDisabled={true}
        // isDragDisabled={type === "employee" ? false : item.status === 2 || item.status === 3 ? true : false}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              userSelect: "none",
              backgroundColor: '#FFFFFF',
              // backgroundColor: snapshot.isDragging
              //   ? "white"
              //   : (item.status === 2 || item.status === 3) && type !== "employee"
              //   ? "var(--extra-color-10)"
              //   : "white",
              ...provided.draggableProps.style,
            }}
            className={`task__item--work ${totalTask >= 3 ? "task__item--work--lot" : ""}`}
          >
            <div className="info__task">
              <div className="title__work">
                <h4 
                  className="name__work"
                  onDoubleClick={() => {
                    setIsDetailWork(true);
                    handleDetailWork(item, totalTask);
                  }}
                >
                  {trimContent(`${item.nodeName || item.name}`, 65, true, true)}{" "}
                </h4>
                <div className="icon_star">
                  <Icon 
                    name='Star' 
                    style={{
                      width: 16, 
                      height: 16, 
                      fill: (item.priorityLevel === 1 || item.priorityLevel === 2) ? 'var(--extra-color-30)' : '#FDE047',
                      marginTop: -4,
                      marginRight: 5
                    }}
                  />
                </div>
              </div>

              <div className="employee_task">
                <div className="implementer">
                  <div className="avatar-implementer">
                    <img src={item.employeeAvatar || OtherGenders} alt={item.employeeName} />
                  </div>
                  <h4 className="name-implementer">{item.employeeName}</h4>
                </div>
              </div>

              <div className="container_time__work">
                <div className="time__work">
                  <Icon name='CalenderWork'/>
                  <span className="text_date">{moment(item.startTime).format("DD/MM/YYYY")} - {moment(item.endTime).format("DD/MM/YYYY")}</span>
                </div>
                {item.status === 1 ?
                  <div className="item_expire">
                    Quá hạn
                  </div>
                : null}
              </div>

              {/* {type === "status" ? (
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
              )} */}
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
