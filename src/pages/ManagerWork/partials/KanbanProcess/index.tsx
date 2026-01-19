import React, { useState, useCallback, memo } from "react";
import "./index.scss";
import KanbanBpm from "components/kanbanBpm";
import Icon from "components/icon";
import moment from "moment";
import Badge from "components/badge/badge";
import Tippy from "@tippyjs/react";
import { Draggable } from "react-beautiful-dnd";

const statusText = {
  PENDING: "Chờ xác nhận",
  COMPLETED: "Hoàn thành",
  PROCESSING: "Đang xử lý",
  RECOMMENDED: "Đã đề xuất lại",
  STORE_RECOMMENDED: "Cửa hàng đề xuất",
  CUSTOMER_CANCELED: "Đã huỷ",
  STORE_CANCELED: "Cửa hàng hủy",
};

const statusColor = {
  PENDING: "warning",
  COMPLETED: "done",
  PROCESSING: "primary",
  RECOMMENDED: "default",
  STORE_RECOMMENDED: "default",
  CUSTOMER_CANCELED: "error",
  STORE_CANCELED: "error",
};

const KanbanProcess = (props: any) => {
  const { processId, processCode } = props;

  //Xử lý các hành động trên item
  const callBackAction = (item, action) => {
    if (action === "delete") {
      console.log("Xoá công việc", item);
      // showDialogConfirmDelete(item);
    }
  };

  // Cài đặt hiển thị item
  const itemSetup = useCallback(
    (item, index) => {
      console.log("itemSetup item", item);
      const work = item?.workOrderResponse || {};
      return (
        <Draggable
          key={item.id}
          draggableId={item.id.toString()}
          isDragDisabled={true} // Bật/tắt khả năng kéo thả
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
              className="task__item_order_request--bpm "
            >
              <div className={`task-infomation`}>
                <div style={{ display: "flex", cursor: "pointer" }}>
                  <div style={{}}>
                    <Icon name="CollectInfo" style={{ width: 13, top: 0, fill: "#1c8cff", cursor: "pointer" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>{work?.name ? work?.name : "Không tìm thấy công việc"}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Dự án: {work?.projectName || ""}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Người tạo: {work?.creatorName || ""}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Người giao việc: {work?.managerName || ""}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Người nhận việc: {work?.employeeName || ""}</span>
                </div>

                {/* <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>
                    Thời gian tạo: {work?.createdAt ? moment(work?.createdAt).format("DD/MM/YYYY  HH:mm") : ""}
                  </span>
                </div> */}

                {/* <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Người hỗ trợ: {item?.dataDetail?.employeeName || ""}</span>
                </div> */}

                {/* <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>
                    Trạng thái : &nbsp;
                    <Badge key={item.id} text={statusText[work?.status] || "Không xác định"} variant={statusColor[work?.status] || "secondary"} />
                  </span>
                </div> */}

                {true ? null : (
                  <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                    <Tippy content="Xoá">
                      <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          callBackAction(item, "delete");
                        }}
                      >
                        <Icon name="Trash" style={{ width: 15, top: 0, fill: "var(--error-color)" }} />
                      </div>
                    </Tippy>
                  </div>
                )}
              </div>
            </div>
          )}
        </Draggable>
      );
    },
    [processId, callBackAction, processCode]
  );

  return <KanbanBpm processId={processId} processCode={processCode} itemShow={itemSetup} />;
};

export default memo(KanbanProcess);
