import React, { useState, useEffect, Fragment, useCallback, memo } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { showToast } from "utils/common";
import TaskItem from "./partials/TaskItem/TaskItem";
import "./index.scss";
import { IContractResponse } from "model/contract/ContractResponseModel";
import SaleflowInvoiceService from "services/SaleflowInvoiceService";
import BusinessProcessService from "services/BusinessProcessService";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { fetchDataDetail } from "./getListObject";
import TaskItemClaim from "./partials/TaskItemClaim/TaskItemClaim";
import Loading from "components/loading";
import KanbanBpm from "components/kanbanBpm";
import { divide } from "lodash";
import Icon from "components/icon";
import moment from "moment";
import Badge from "components/badge/badge";
import Tippy from "@tippyjs/react";
import { Draggable } from "react-beautiful-dnd";

const processType = "orderRequest";

const KanbanOrderRequestProcess = (props: any) => {
  const {
    // dataOfStep,
    // setDataOfStep,
    // dataStart,
    // setDataStart,
    // dataSuccess,
    // setDataSuccess,
    // onReload,
    // params,
    processId,
    // setParams,
    // listStepProcess,
    // callbackHistory,
    // listColumn,
  } = props;

  // const [columns, setColumns] = useState<any[]>([
  //   {
  //     id: 0,
  //     title: "Bắt đầu",
  //     color: "#177AD5",
  //     processId: processId || listStepProcess[0]?.processId,
  //     items: [],
  //     hasMore: false,
  //     page: 1,
  //   },
  //   ...listStepProcess.map((item) => ({
  //     id: item.value,
  //     title: item.label,
  //     color: item.color,
  //     processId: item.processId,
  //     step: item.stepNumber,
  //     items: dataOfStep?.find((element) => element.stepId === item.value)?.value || [],
  //     hasMore: dataOfStep?.find((element) => element.stepId === item.value)?.hasMore || false,
  //     page: dataOfStep?.find((element) => element.stepId === item.value)?.page || 1,
  //   })),
  //   {
  //     id: "done",
  //     title: "Hoàn thànhhhhhhh",
  //     color: "#1bc10d",
  //     processId: processId || listStepProcess[0]?.processId,
  //     items: [],
  //     hasMore: false,
  //     page: 1,
  //   },
  // ]);

  const [idEndPoint, setIdEndPoint] = useState<number>(null);
  const [dataWork, setDataWork] = useState<IContractResponse>(null);

  const [submitTask, setSubmitTask] = useState<boolean>(false);

  const [isLoadingColumns, setIsLoadingColumns] = useState<boolean>(false);

  // useEffect(() => {
  //   const processData = async () => {
  //     setIsLoadingColumns(true);
  //     const resultData = await Promise.all(
  //       listStepProcess.map(async (item) => {
  //         const newDataItemsStep = dataOfStep?.length > 0 && dataOfStep?.find((element) => element.stepId === item.value);
  //         const newDataItems = newDataItemsStep?.value || [];
  //         const newHasMore = newDataItemsStep?.hasMore;
  //         const newPage = newDataItemsStep?.page;

  //         const listPotId = newDataItems.map((el) => el.potId);

  //         let detailData = [];
  //         if (listPotId.length > 0) {
  //           detailData = await fetchDataDetail(listPotId.join(","), processType);
  //           // Bạn có thể xử lý hoặc gắn `detailData` vào `newDataItems` nếu cần
  //         }

  //         if (item.label) {
  //           return {
  //             id: item.value,
  //             title: item.label,
  //             color: item.color,
  //             processId: item.processId,
  //             step: item.stepNumber,
  //             items:
  //               newDataItems.map((el) => {
  //                 return {
  //                   ...el,
  //                   dataDetail: detailData?.find((detail) => detail.potId === el.potId) || null, // Gắn dữ liệu chi tiết vào từng mục
  //                 };
  //               }) || [],
  //             hasMore: newHasMore,
  //             page: newPage,
  //           };
  //         }
  //         return null;
  //       })
  //     );
  //     const result = resultData.filter((el) => el !== null);

  //     // Lấy dữ liệu của cột hoàn thành

  //     let newDataSuccess: any = {};
  //     if (dataSuccess && dataSuccess?.items && dataSuccess?.items.length > 0) {
  //       const detailDataSuccess = await fetchDataDetail(dataSuccess?.items.map((el) => el.potId).join(","), processType);

  //       if (detailDataSuccess && detailDataSuccess.length > 0) {
  //         newDataSuccess = {
  //           ...dataSuccess,
  //           items: dataSuccess?.items.map((el) => ({
  //             ...el,
  //             dataDetail: detailDataSuccess?.find((detail) => detail.potId == el.potId) || null,
  //           })),
  //         };
  //         result.push({
  //           id: "done",
  //           title: "Hoàn thành",
  //           color: "#1bc10d",
  //           processId: listStepProcess[0]?.processId,
  //           items: newDataSuccess?.items || [],
  //           hasMore: newDataSuccess?.loadMoreAble,
  //           page: newDataSuccess?.page,
  //         });
  //       } else {
  //         result.push({
  //           id: "done",
  //           title: "Hoàn thành",
  //           color: "#1bc10d",
  //           processId: listStepProcess[0]?.processId,
  //           items: dataSuccess?.items || [],
  //           hasMore: dataSuccess?.loadMoreAble,
  //           page: dataSuccess?.page,
  //         });
  //       }
  //     }

  //     setColumns(result);
  //     setIsLoadingColumns(false);
  //   };

  //   processData();
  // }, [listStepProcess, dataOfStep, dataSuccess]);

  // const onDragEnd = async (result) => {
  //   if (!result.destination) return;

  //   const { source, destination } = result;

  //   const newColumns = [...columns];

  //   const dragItem = newColumns[parseInt(source.droppableId)].items[source.index];
  //   setDataWork(dragItem);

  //   //! biến này tạo ra với mục đích lấy cột hiện tại
  //   const sourceColumn = columns[source.droppableId];

  //   //! biến này tạo ra với mục đích lấy cột cuối muốn kéo thả đến
  //   const destColumn = newColumns[destination.droppableId];

  //   const startPoint = sourceColumn.id;
  //   const endPoint = destColumn.id;

  //   const startLabel = sourceColumn.title;
  //   const endLabel = destColumn.title;

  //   //? đoạn này check đk nếu như id của điểm đầu khác với id của điểm cuối
  //   //* thì lúc đó mới lấy giá trị điểm bắt đầu và điểm kết thúc
  //   if (startPoint !== endPoint) {
  //     setIdEndPoint(endPoint);

  //     //   handleUpdateStatusInvoice(endPoint, dragItem, startPoint, startLabel, endLabel);
  //   }

  //   newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);

  //   newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);

  //   setSubmitTask(false);
  //   setColumns(newColumns);
  // };

  // const handleScroll = async (e, itemStep) => {
  //   const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
  //   if (result && itemStep.hasMore) {
  //     const param = {
  //       processId: itemStep.processId,
  //       workflowId: itemStep.id,
  //       limit: 10,
  //       page: itemStep.page + 1,
  //     };
  //     const response = await BusinessProcessService.listWorkFlow(param);
  //     console.log("response123111", response);
  //     if (response.code === 0) {
  //       const result = response.result;

  //       const newDataOfStep = [...dataOfStep];
  //       const indexStep = newDataOfStep?.findIndex((el) => el.stepId === itemStep.id);
  //       const stepFind = newDataOfStep?.find((el) => el.stepId === itemStep.id);
  //       if (indexStep !== -1) {
  //         const newData = {
  //           stepId: itemStep.id,
  //           stepName: itemStep.title,
  //           value: [...stepFind.value, ...result?.items],
  //           hasMore: result?.loadMoreAble,
  //           page: result?.page,
  //         };
  //         newDataOfStep[indexStep] = newData;
  //         setDataOfStep(newDataOfStep);
  //       }
  //     } else {
  //       showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //     }
  //   }
  // };

  // const handleScrollSpecial = async (e, itemStep, status) => {
  //   const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
  //   if (result && itemStep.hasMore) {
  //     const param = {
  //       processId: itemStep.processId,
  //       workflowId: itemStep.id,
  //       limit: 10,
  //       page: itemStep.page + 1,
  //       status: status,
  //     };
  //     const response = await BusinessProcessService.listWorkFlow(param);
  //     console.log("response123111", response);
  //     if (response.code === 0) {
  //       const result = response.result;

  //       const newData = {
  //         ...result,
  //         items: [...itemStep.items, ...result.items],
  //       };

  //       if (status === 0) {
  //         setDataStart(newData);
  //       } else if (status === 2) {
  //         setDataSuccess(newData);
  //       }
  //     } else {
  //       showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //     }
  //   }
  // };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  // const showDialogConfirmDelete = (item?: any) => {
  //   const contentDialog: IContentDialog = {
  //     color: "error",
  //     className: "dialog-delete",
  //     isCentered: true,
  //     isLoading: true,
  //     title: <Fragment>Xóa...</Fragment>,
  //     message: (
  //       <Fragment>
  //         Bạn có chắc chắn muốn xóa đối tượng đã chọn {item ? <strong>{item.processedObject?.name}</strong> : ""}? Thao tác này không thể khôi phục.
  //       </Fragment>
  //     ),
  //     cancelText: "Hủy",
  //     cancelAction: () => {
  //       setShowDialog(false);
  //       setContentDialog(null);
  //     },
  //     defaultText: "Xóa",
  //     defaultAction: () => {
  //       onDeleteWorkFlow(item.id, item);
  //     },
  //   };
  //   setContentDialog(contentDialog);
  //   setShowDialog(true);
  // };

  // const onDeleteWorkFlow = async (id: number, item) => {
  //   const response = await BusinessProcessService.deleteWorkFlow(id);
  //   if (response.code === 0) {
  //     showToast("Xóa đối tượng thành công", "success");
  //     onReload(true, item);
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  //   setShowDialog(false);
  //   setContentDialog(null);
  // };

  // Cài đặt hiển thị item
  const itemSetup = useCallback(
    (item, index) => {
      console.log("itemSetup item", item);

      return (
        <Draggable
          key={item.id}
          draggableId={item.id.toString()}
          // isDragDisabled={true} // Bật/tắt khả năng kéo thả
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
                      {item?.dataDetail ? "Hồ sơ - " + item?.dataDetail?.code || "" : "Không tìm thấy hồ sơ"}
                    </span>
                  </div>
                </div>
                {/* </Tippy> */}

                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Khách hàng: {item?.dataDetail?.customerName || ""}</span>
                </div>

                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>
                    Thời gian tạo: {item?.dataDetail?.createdTime ? moment(item?.dataDetail?.createdTime).format("DD/MM/YYYY  HH:mm") : ""}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>Người hỗ trợ: {item?.dataDetail?.employeeName || ""}</span>
                </div>

                <div>
                  <span style={{ fontSize: 12, fontWeight: "400" }}>
                    Trạng thái : &nbsp;
                    <Badge
                      key={item.id}
                      text={
                        item?.dataDetail?.status === 0
                          ? "Khởi tạo"
                          : item?.dataDetail?.status === 1
                          ? "Đã tiếp nhận"
                          : item?.dataDetail?.status === 2
                          ? "Chờ hóa đơn sửa chữa"
                          : item?.dataDetail?.status === 3
                          ? "Thẩm định hiện trường"
                          : item?.dataDetail?.status === 4
                          ? "Chờ phê duyệt"
                          : item?.dataDetail?.status === 5
                          ? "Từ chối"
                          : item?.dataDetail?.status === 6
                          ? "Chờ thanh toán"
                          : item?.dataDetail?.status === 7
                          ? "Đã thanh toán"
                          : "Không xác định"
                      }
                      variant={
                        item?.dataDetail?.status === 0
                          ? "secondary"
                          : item?.dataDetail?.status === 1
                          ? "primary"
                          : item?.dataDetail?.status === 2
                          ? "warning"
                          : item?.dataDetail?.status === 3
                          ? "primary"
                          : item?.dataDetail?.status === 4
                          ? "warning"
                          : item?.dataDetail?.status === 5
                          ? "error"
                          : item?.dataDetail?.status === 6
                          ? "wait-collect"
                          : item?.dataDetail?.status === 7
                          ? "done"
                          : "transparent"
                      }
                    />
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                  <Tippy content="Xoá">
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        // callBackAction(item, "delete");
                      }}
                    >
                      <Icon name="Trash" style={{ width: 15, top: 0, fill: "var(--error-color)" }} />
                    </div>
                  </Tippy>
                </div>
              </div>

              {/* </Tippy> */}
            </div>
          )}
        </Draggable>
      );
    },
    [processId]
  );

  return (
    <KanbanBpm processType={processType} processId={processId} itemShow={itemSetup} />
    // <div className="wrapper-kanban-claim-process">
    //   <div className="search__kanban">
    //   </div>
    //   <div className="__special-kanban--business-process">
    //     <div
    //       className="box__task--kanban"
    //       style={{
    //         width: ` "100%"`,
    //         marginBottom: "1.5rem",
    //       }}
    //     >
    //       <DragDropContext onDragEnd={onDragEnd}>
    //         {listColumn.map((column, id) => {
    //           return (
    //             <Droppable key={column.id} droppableId={id.toString()}>
    //               {(provided, snapshot) => {
    //                 return (
    //                   <div
    //                     ref={provided.innerRef}
    //                     {...provided.droppableProps}
    //                     className="task-list"
    //                   >
    //                     <div
    //                       className="wrapper__title"
    //                       style={{
    //                         backgroundColor: column.color,
    //                       }}
    //                     >
    //                       <span
    //                         className="title-task"
    //                         style={{
    //                           color: "white",
    //                         }}
    //                       >
    //                         {column.title}
    //                       </span>
    //                     </div>
    //                     <div
    //                       className="lst__item"
    //                       style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }}
    //                       onScroll={(e) => {
    //                         if (column.id === 0) {
    //                           handleScrollSpecial(e, column, 0);
    //                         } else if (column.id === "done") {
    //                           handleScrollSpecial(e, column, 1);
    //                         } else {
    //                           handleScroll(e, column);
    //                         }
    //                       }}
    //                     >
    //                       {columns[id]?.items && !isLoadingColumns ? (
    //                         <>
    //                           {columns[id].items?.map((item, idx) => {
    //                             return (
    //                               <TaskItemClaim
    //                                 key={item.id}
    //                                 item={item}
    //                                 index={idx}
    //                                 column={column}
    //                                 callbackHistory={callbackHistory}
    //                                 callBackAction={(item, type) => {
    //                                   if (type === "delete") {
    //                                     showDialogConfirmDelete(item);
    //                                   }
    //                                 }}
    //                               />
    //                             );
    //                           })}
    //                         </>
    //                       ) : (
    //                         <Loading />
    //                       )}
    //                     </div>
    //                     {provided.placeholder}
    //                   </div>
    //                 );
    //               }}
    //             </Droppable>
    //           );
    //         })}
    //       </DragDropContext>
    //     </div>
    //   </div>

    //   <Dialog content={contentDialog} isOpen={showDialog} />
    // </div>
  );
};

export default memo(KanbanOrderRequestProcess);
