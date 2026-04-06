import React from "react";
import { formatDate } from "utils/dateUtils";

import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import { ITaskItemProps } from "model/warranty/PropsModel";
import OtherGenders from "assets/images/third-gender.png";
import "./TaskItem.scss";

export default function TaskItem(props: ITaskItemProps) {
  const { item, index } = props;

  return (
    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: "none",
            backgroundColor: snapshot.isDragging ? "white" : "white",
            ...provided.draggableProps.style,
          }}
          className="task-item"
        >
          <div className="task-infomation">
            <div className="task-header">{item.reasonName}</div>
            <div className="task-body">
              <div className="service-warranty">
                <h4 className="title">Dịch vụ</h4>
                <h4 className="name">{item.serviceName}</h4>
              </div>
              <div className="employee-receive">
                <h4 className="title">Nhân viên tiếp nhận</h4>
                <h4 className="name">{item.employeeName}</h4>
              </div>
            </div>
            <div className="task-footer">
              <div className="time-task">
                <Icon name="Clock" />
                {item.createdTime ? formatDate(item.createdTime) : ""}
              </div>
              <div className="avatar" title={item.customerName}>
                <img loading="lazy" src={item.customerAvatar ? item.customerAvatar : OtherGenders} alt={item.customerName} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
