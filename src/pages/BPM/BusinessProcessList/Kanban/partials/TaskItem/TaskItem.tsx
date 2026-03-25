import React, { Fragment, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import OtherGenders from "assets/images/third-gender.png";
import "./TaskItem.scss";
import Tippy from "@tippyjs/react";
import moment from "moment";

export default function TaskItem(props: any) {
  const { item, index, column, callbackHistory, callBackAction } = props;

  return (
    <Fragment>
      <Draggable
        key={item.id}
        draggableId={item.id.toString()}
        isDragDisabled={true}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              userSelect: "none",
              backgroundColor: "white",
              ...provided.draggableProps.style,
            }}
            className="task__item--bpm"
            onDoubleClick={() => {
              callbackHistory(item);
            }}
          >
            <div className="task-infomation">

              {/* Title */}
              <div className="task-title-row">
                <Icon name="CollectInfo" className="task-icon" />
                <span className="task-name">
                  {item.processedObject?.name || "—"}
                </span>
              </div>

              {/* Meta */}
              <div className="task-meta">
                <div className="task-meta__row">
                  <span className="task-meta__label">Người trình</span>
                  <span className="task-meta__value">{item.employeeName || "—"}</span>
                </div>
                <div className="task-meta__row">
                  <span className="task-meta__label">Thời gian</span>
                  <span className="task-meta__value">
                    {item.startTime ? moment(item.startTime).format("DD/MM/YYYY") : "—"}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <div className="task-footer-actions">
                <Tippy content="Xoá đối tượng">
                  <button
                    className="task-btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      callBackAction(item, "delete");
                    }}
                  >
                    <Icon name="Trash" />
                  </button>
                </Tippy>
              </div>

            </div>
          </div>
        )}
      </Draggable>
    </Fragment>
  );
}