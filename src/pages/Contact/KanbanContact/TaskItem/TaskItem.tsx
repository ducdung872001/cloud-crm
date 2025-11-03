import React, { Fragment, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import { ITaskItemProps } from "model/workOrder/PropsModel";
import OtherGenders from "assets/images/third-gender.png";
import "./TaskItem.scss";

export default function TaskItem(props: ITaskItemProps) {
  const { item, index, column } = props;

  // const [idWork, setIdWork] = useState<number>(null);
  // const [showModalView, setShowModalView] = useState<boolean>(false);

  return (
    <Fragment>
      <Draggable
        key={item.id}
        draggableId={item.id.toString()}
        isDragDisabled={item?.status === 2 || item?.status === 3 ? true : false}
        index={index}
      >
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
            className="task__item--work"
            onClick={(e) => {
              // setIdWork(item.id);
              // setShowModalView(true);
            }}
          >
            <div className={`task-infomation ${item?.status === 2 || item?.status === 3 ? "disabled__task--item" : ""}`}>
              <h4 className="title--job">{item.name}</h4>
              <div className="task-footer">
                <div
                  className={`${
                    "task-item"
                  }`}
                  style={{ backgroundColor: column.color, color: column.colorText }}
                >
                  <Fragment>
                      {/* <Icon name="CheckedCircle" /> */}
                      {column.title}
                    </Fragment>
                </div>
                <div className="avatar">
                  <img src={OtherGenders} alt="" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
      {/* <ViewWorkModal
        idWork={idWork}
        onShow={showModalView}
        onHide={(reload) => {
          setShowModalView(false);
        }}
      /> */}
    </Fragment>
  );
}
