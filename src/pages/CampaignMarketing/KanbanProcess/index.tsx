import React, { useState, useCallback, memo, useEffect } from "react";
import "./index.scss";
import Icon from "components/icon";
import moment from "moment";
import Badge from "components/badge/badge";
import Tippy from "@tippyjs/react";
import { Draggable } from "react-beautiful-dnd";
import KanbanCommon from "components/kanbanCommon";
import CampaignMarketingService from "services/OrderRequestService";
import { formatCurrency } from "reborn-util";

export default function KanbanOrderTracking(props: any) {
  const {
    processCode,
    setShowModalRequestDetail, 
    setDataRequestDetail, 
    setCustomerInfo,

    listApproach,
    showDialogConfirmDeleteChannel,
    showDialogConfirmDelete,
    setIsChangeStatusCampaign,
    setDataCampaignMA,
    setIsModalAllocateBudget,
    setIsModalGiveGoal,
    setChannelItemData,
    setIsModalReport,
    setIsMarketingChannelInternal,
  } = props;

  //Xử lý các hành động trên item
  const callBackAction = (item, action) => {
    if (action === "delete") {
      console.log("Xoá yêu cầu đặt hàng", item);
      // showDialogConfirmDelete(item);
    }
  };
  //Xử lý hành động click đúp trên item
  const handleDoubleClick = (item) => {
    setShowModalRequestDetail(true);
    setDataRequestDetail(JSON.parse(item.orderInfo)?.items || []);
    setCustomerInfo(item?.customerInfo ? JSON.parse(item.customerInfo) : null);
  };

  // Cài đặt hiển thị item
  const itemSetup = useCallback(
    (item, index) => {
      const customerInfo = JSON.parse(item?.customerInfo || "{}");
      return (
        <Draggable
          key={`${item.status}-${item.id}`}
          // draggableId={item.id.toString()}
          draggableId={`${item.status}-${item.id}`}
          isDragDisabled={item?.status === 1 && (item?.statusOther === 2 || item?.statusOther === 3) ? true : false}
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
              className="task__item--campaignMA"
              onClick={(e) => {
                // setIdWork(item.id);
                // setShowModalView(true);
              }}
            >
              {/* <Tippy 
                content={<TippyInvoiceInfo detailCustomer={item}/>} 
                delay={[120, 100]} 
                animation="scale" 
              //   interactive={true}
              > */}
  
              {/* //chỗ này tạm thời ẩn để cho kéo khi kết thúc */}
              <div
                className={`task-infomation ${
                  item?.status === 1 && (item?.statusOther === 2 || item?.statusOther === 3) ? "disabled__task--item" : ""
                }`}
              >
                <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                  <h4 className="title--job">{(item.status === 1 ? item.name : item.channelName) || ""}</h4>
                </div>
                {/* <Tippy 
                    content={<TippyInvoiceInfo detailCustomer={item}/>} 
                    delay={[120, 100]} 
                    animation="scale" 
                  //   interactive={true}
                  > */}
                {item.status !== 1 ? (
                  <div style={{ display: "flex" }}>
                    <Icon name="Campaign" style={{ width: 13, top: 0, fill: "#1c8cff" }} />
                    <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>{item.marketingName}</span>
                  </div>
                ) : null}
  
                {item.employeeName ? (
                  <div style={{ display: "flex" }}>
                    <div style={{}}>
                      <Icon name="Staff" style={{ width: 13, top: 0, fill: "#1c8cff" }} />
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>{item.employeeName}</span>
                    </div>
                  </div>
                ) : null}
                {/* </Tippy> */}
  
                <div style={{ display: "flex" }}>
                  <Icon name="Dollar" style={{ width: 17, top: 0, fill: "#1c8cff", marginLeft: -1.5 }} />
                  <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 2 }}>
                    {formatCurrency((item.status === 1 ? item.totalBudget : item.budget) || 0)}
                  </span>
                </div>
  
                {item.startDate && item.endDate ? (
                  <div style={{ display: "flex" }}>
                    <Icon name="Calendar" style={{ width: 14, top: 0, fill: "#1c8cff" }} />
                    <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>
                      {item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : ""} -{" "}
                      {item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : ""}
                    </span>
                  </div>
                ) : null}
  
                {item.status === 1 ? (
                  <div style={{ display: "flex" }}>
                    <Icon name="Status" style={{ width: 18, top: 0, fill: "#1c8cff", marginLeft: -1.5 }} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        marginLeft: 3,
                        color:
                          item.statusOther === 1 || item.statusOther === 0
                            ? "var(--primary-color)"
                            : item.statusOther === 2
                            ? "var(--success-color)"
                            : "var(--warning-color)",
                      }}
                    >
                      {item.statusOther === 1 || item.statusOther === 0 ? "Đang thực hiện" : item.statusOther === 2 ? "Hoàn thành" : "Tạm dừng"}
                    </span>
                  </div>
                ) : null}
  
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "flex-end" }}>
                  {/* <div style={{display:'flex',  width:'80%'}}>
                      <Tippy content="Thông tin trao đổi">
                          <div className="container-action"
                            onClick = {() => {
                              setShowModalExchange(true);
                              setDataCustomer({
                                name: item.customerName,
                                id: item.customerId,
                                phoneMasked: item.customerPhone,
                                address: item.customerAddress,
                                employeeName: item.employeeName,
                                invoiceId: item.invoiceId,
                                invoiceCode: item.invoiceResponse?.invoiceCode,
                                sieId: item.id,
                                approachId: item.approachId,
                                saleflowId: item.saleflowId,
                                eformId: eform?.eformId
  
                              })
                            }}
                          >
                              <Icon 
                                name="Note" 
                                style={{ width: 15.5, height: 15.5,  fill: '#1c8cff', cursor: 'pointer' }} 
                              />
                          </div>
                      </Tippy>
                
                    </div> */}
  
                  {item.status === 1 ? (
                    <div style={{ marginLeft: 9 }}>
                      <Tippy content={"Đổi trạng thái"} delay={[120, 100]} animation="scale" interactive={true}>
                        <div
                          style={{ cursor: "pointer", alignItems: "flex-start", display: "flex" }}
                          onClick={() => {
                            setIsChangeStatusCampaign(true);
                            setDataCampaignMA(item);
                          }}
                        >
                          <Icon name="ResetPassword" style={{ width: 16, fill: "var(--warning-color)", cursor: "pointer" }} />
                        </div>
                      </Tippy>
                    </div>
                  ) : null}
  
                  {item.status === 4 ? (
                    <div style={{ marginLeft: 9 }}>
                      <Tippy content="Báo cáo Marketing">
                        <div
                          className="container-action"
                          onClick={() => {
                            setIsModalReport(true);
                            setChannelItemData(item);
                          }}
                        >
                          <Icon name="Note" style={{ width: 13, fill: "#1c8cff", cursor: "pointer" }} />
                        </div>
                      </Tippy>
                    </div>
                  ) : null}
  
                  {item.status === 4 ? (
                    <div style={{ marginLeft: 9 }}>
                      <Tippy content="Chương trình Marketing">
                        <div
                          className="container-action"
                          onClick={() => {
                            setIsMarketingChannelInternal(true);
                            setChannelItemData(item);
                          }}
                        >
                          <Icon name="Marketing" style={{ width: 14, fill: "#1c8cff", cursor: "pointer" }} />
                        </div>
                      </Tippy>
                    </div>
                  ) : null}
  
                  {item.status === 2 || item.status === 3 ? (
                    <div style={{ marginLeft: 9 }}>
                      <Tippy content={"Sửa"} delay={[120, 100]} animation="scale" interactive={true}>
                        <div
                          style={{ cursor: "pointer", alignItems: "flex-start", display: "flex" }}
                          onClick={() => {
                            if (item.status === 2) {
                              setIsModalAllocateBudget(true);
                            } else {
                              setIsModalGiveGoal(true);
                            }
                            setChannelItemData(item);
                          }}
                        >
                          <Icon name="Pencil" style={{ width: 15, fill: "#1c8cff", cursor: "pointer" }} />
                        </div>
                      </Tippy>
                    </div>
                  ) : null}
  
                  <div style={{ marginLeft: 9 }}>
                    <Tippy content={item.status === 1 ? "Huỷ" : "Xoá"} delay={[120, 100]} animation="scale" interactive={true}>
                      <div
                        style={{ cursor: "pointer", alignItems: "flex-start", display: "flex" }}
                        onClick={() => {
                          if (item.status === 1) {
                            console.log("da vao 1");
  
                            showDialogConfirmDelete(item);
                          } else {
                            console.log("da vao 2");
                            showDialogConfirmDeleteChannel(item);
                          }
                        }}
                      >
                        <Icon name="Trash" style={{ width: 16, fill: "var(--error-color)", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  </div>
                </div>
              </div>
              {/* </Tippy> */}
            </div>
          )}
        </Draggable>
      );
    },
    [callBackAction, processCode]
  );

  const OrderRequestServiceList = useCallback(
    async (params: any, signal?: AbortSignal) => {
      let mergedParams = {
        ...params,
        ...(processCode ? { bsnId: processCode } : {}),
      };
      let response = await CampaignMarketingService.list(mergedParams, signal);
      return response;
    },
    [processCode]
  );

  return (
    <KanbanCommon
      key={processCode} // Key để reset lại trạng thái khi processCode thay đổi, trong các trường hợp khác thì key khác
      itemShow={itemSetup}
      listStep={listApproach}
      functionGetDataItem={OrderRequestServiceList}
      handleDoubleClick={handleDoubleClick}
    />
  );
}
