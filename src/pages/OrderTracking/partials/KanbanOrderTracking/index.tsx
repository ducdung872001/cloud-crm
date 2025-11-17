import React, { useState, useCallback, memo, useEffect } from "react";
import "./index.scss";
import Icon from "components/icon";
import moment from "moment";
import Badge from "components/badge/badge";
import Tippy from "@tippyjs/react";
import { Draggable } from "react-beautiful-dnd";
import KanbanCommon from "components/kanbanCommon";
import OrderRequestService from "services/OrderRequestService";

const listStep = [
  {
    id: "PENDING",
    value: "PENDING",
    label: "Chờ xác nhận",
    color: "#E98E4C",
  },
  {
    id: "PROCESSING",
    value: "PROCESSING",
    label: "Đang xử lý",
    color: "#1C8CFF",
  },
  {
    id: "STORE_RECOMMENDED",
    value: "STORE_RECOMMENDED",
    label: "Cửa hàng đề xuất",
    color: "#9966CC",
  },
  {
    id: "RECOMMENDED",
    value: "RECOMMENDED",
    label: "Đã đề xuất lại",
    color: "#9966CC",
  },

  {
    id: "CUSTOMER_CANCELED",
    value: "CUSTOMER_CANCELED",
    label: "Đã huỷ",
    color: "#FF3B30",
  },
  {
    id: "STORE_CANCELED",
    value: "STORE_CANCELED",
    label: "Cửa hàng hủy",
    color: "#FF3B30",
  },
  {
    id: "COMPLETED",
    value: "COMPLETED",
    label: "Hoàn thành",
    color: "#1BC10D",
  },
];

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

export default function KanbanOrderTracking(props: any) {
  const { beautySalonId, setShowModalRequestDetail, setDataRequestDetail, setCustomerInfo } = props;

  //Xử lý các hành động trên item
  const callBackAction = (item, action) => {
    if (action === "delete") {
      console.log("Xoá yêu cầu đặt hàng", item);
      // showDialogConfirmDelete(item);
    }
  };
  //Xử lý hành động click đúp trên item
  const handleDoubleClick = (item) => {
    console.log("Kích đúp", item);
    setShowModalRequestDetail(true);
    setDataRequestDetail(JSON.parse(item.orderInfo)?.items || []);
    setCustomerInfo(item?.customerInfo ? JSON.parse(item.customerInfo) : null);
  };

  console.log("KanbanOrderTracking valueBeautySalon", beautySalonId);

  // Cài đặt hiển thị item
  const itemSetup = useCallback(
    (item, index) => {
      const customerInfo = JSON.parse(item?.customerInfo || "{}");
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
                    <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>
                      {item?.note ? item?.note : "Không tìm thấy yêu cầu đặt hàng"}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Đại lý: {item?.beautySalonName || ""}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Khách hàng: {customerInfo?.name || ""}</span>
                </div>

                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>
                    Thời gian tạo: {item?.createdAt ? moment(item?.createdAt).format("DD/MM/YYYY  HH:mm") : ""}
                  </span>
                </div>

                {/* <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Người hỗ trợ: {item?.dataDetail?.employeeName || ""}</span>
                </div> */}

                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>
                    Trạng thái : &nbsp;
                    <Badge key={item.id} text={statusText[item?.status] || "Không xác định"} variant={statusColor[item?.status] || "secondary"} />
                  </span>
                </div>

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
    [callBackAction, beautySalonId]
  );

  // const OrderRequestServiceList = async (params: any, signal?: AbortSignal) => {
  //   let mergedParams = {
  //     ...params,
  //     ...(beautySalonId ? { bsnId: beautySalonId } : {}),
  //   };
  //   let response = await OrderRequestService.list(mergedParams, signal);
  //   return response;
  // };

  const OrderRequestServiceList = useCallback(
    async (params: any, signal?: AbortSignal) => {
      let mergedParams = {
        ...params,
        ...(beautySalonId ? { bsnId: beautySalonId } : {}),
      };
      let response = await OrderRequestService.list(mergedParams, signal);
      return response;
    },
    [beautySalonId]
  );

  console.log("KanbanOrderTracking render beautySalonId", beautySalonId);

  return (
    <KanbanCommon
      key={beautySalonId}
      itemShow={itemSetup}
      listStep={listStep}
      functionGetDataItem={OrderRequestServiceList}
      handleDoubleClick={handleDoubleClick}
    />
  );
}
