import React, { useState, useEffect, Fragment } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { showToast } from "utils/common";
import TaskItem from "./partials/TaskItem/TaskItem";
import "./index.scss";
import { IContractResponse } from "model/contract/ContractResponseModel";
import SaleflowInvoiceService from "services/SaleflowInvoiceService";
import BusinessProcessService from "services/BusinessProcessService";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { fetchDataDetail } from "./getListObject";
import TaskItemTicket from "./partials/TaskItemTicket/TaskItemTicket";
import Loading from "components/loading";

export default function KanbanTicketProcess(props: any) {
  const {
    dataOfStep,
    setDataOfStep,
    dataStart,
    setDataStart,
    dataSuccess,
    setDataSuccess,
    onReload,
    params,
    processId,
    setParams,
    listStepProcess,
    callbackHistory,
    processType,
    listColumn,
  } = props;

  const [columns, setColumns] = useState<any[]>([
    {
      id: 0,
      title: "Bắt đầu",
      color: "#177AD5",
      processId: processId || listStepProcess[0]?.processId,
      items: [],
      hasMore: false,
      page: 1,
    },
    ...listStepProcess.map((item) => ({
      id: item.value,
      title: item.label,
      color: item.color,
      processId: item.processId,
      step: item.stepNumber,
      items: dataOfStep?.find((element) => element.stepId === item.value)?.value || [],
      hasMore: dataOfStep?.find((element) => element.stepId === item.value)?.hasMore || false,
      page: dataOfStep?.find((element) => element.stepId === item.value)?.page || 1,
    })),
    {
      id: "done",
      title: "Hoàn thành",
      color: "#1bc10d",
      processId: processId || listStepProcess[0]?.processId,
      items: [],
      hasMore: false,
      page: 1,
    },
  ]);

  const [idEndPoint, setIdEndPoint] = useState<number>(null);
  const [dataWork, setDataWork] = useState<IContractResponse>(null);

  const [submitTask, setSubmitTask] = useState<boolean>(false);

  const [isLoadingColumns, setIsLoadingColumns] = useState<boolean>(false);

  useEffect(() => {
    const processData = async () => {
      setIsLoadingColumns(true);
      console.log("Kanban: listStepProcess:", listStepProcess);
      console.log("Kanban: dataOfStep:", dataOfStep);
      if (!listStepProcess || listStepProcess.length === 0) {
        // nothing to build yet
        setColumns([]);
        setIsLoadingColumns(false);
        return;
      }
      const resultData = await Promise.all(
        listStepProcess.map(async (item) => {
          const newDataItemsStep = dataOfStep?.length > 0 && dataOfStep.find((element) => element.stepId === item.value);
          console.log("newDataItemsStep:", newDataItemsStep);
          const newDataItems = newDataItemsStep?.value || [];
          console.log("newDataItems:", newDataItems);
          const newHasMore = newDataItemsStep?.hasMore;
          const newPage = newDataItemsStep?.page;

          const listPotId = newDataItems.map((el) => el.potId);

          let detailData = [];
          if (listPotId.length > 0) {
            detailData = await fetchDataDetail(listPotId.join(","), processType);
            // Bạn có thể xử lý hoặc gắn `detailData` vào `newDataItems` nếu cần
          }
          console.log("detailData:", detailData);

          if (item.label) {
            return {
              id: item.value,
              title: item.label,
              color: item.color,
              processId: item.processId,
              step: item.stepNumber,
              items:
                newDataItems.map((el) => {
                  return {
                    ...el,
                    dataDetail: detailData.find((detail) => detail.potId === el.potId) || null, // Gắn dữ liệu chi tiết vào từng mục
                  };
                }) || [],
              hasMore: newHasMore,
              page: newPage,
            };
          }
          return null;
        })
      );
      console.log("resultData:", resultData);
      const result = resultData.filter((el) => el !== null);

      // Lấy dữ liệu của cột hoàn thành

      let newDataSuccess: any = {};
      if (dataSuccess && dataSuccess?.items && dataSuccess?.items.length > 0) {
        const detailDataSuccess = await fetchDataDetail(dataSuccess?.items.map((el) => el.potId).join(","), processType);

        if (detailDataSuccess && detailDataSuccess.length > 0) {
          newDataSuccess = {
            ...dataSuccess,
            items: dataSuccess?.items.map((el) => ({
              ...el,
              dataDetail: detailDataSuccess.find((detail) => detail.potId == el.potId) || null,
            })),
          };
          result.push({
            id: "done",
            title: "Hoàn thành",
            color: "#1bc10d",
            processId: listStepProcess[0]?.processId,
            items: newDataSuccess?.items || [],
            hasMore: newDataSuccess?.loadMoreAble,
            page: newDataSuccess?.page,
          });
        } else {
          result.push({
            id: "done",
            title: "Hoàn thành",
            color: "#1bc10d",
            processId: listStepProcess[0]?.processId,
            items: dataSuccess?.items || [],
            hasMore: dataSuccess?.loadMoreAble,
            page: dataSuccess?.page,
          });
        }
      }

      setColumns(result);
      console.log("Columns after processing:", result);
      setIsLoadingColumns(false);
    };

    processData();
  }, [listStepProcess, dataOfStep, dataSuccess]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const newColumns = [...columns];

    const dragItem = newColumns[parseInt(source.droppableId)].items[source.index];
    setDataWork(dragItem);

    //! biến này tạo ra với mục đích lấy cột hiện tại
    const sourceColumn = columns[source.droppableId];

    //! biến này tạo ra với mục đích lấy cột cuối muốn kéo thả đến
    const destColumn = newColumns[destination.droppableId];

    const startPoint = sourceColumn.id;
    const endPoint = destColumn.id;

  // labels available if needed for logging or status update
  // const startLabel = sourceColumn.title;
  // const endLabel = destColumn.title;

    //? đoạn này check đk nếu như id của điểm đầu khác với id của điểm cuối
    //* thì lúc đó mới lấy giá trị điểm bắt đầu và điểm kết thúc
    if (startPoint !== endPoint) {
      setIdEndPoint(endPoint);

      //   handleUpdateStatusInvoice(endPoint, dragItem, startPoint, startLabel, endLabel);
    }

    newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);

    newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);

    setSubmitTask(false);
    setColumns(newColumns);
  };

  const handleScroll = async (e, itemStep) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemStep.hasMore) {
      const param = {
        processId: itemStep.processId,
        workflowId: itemStep.id,
        limit: 10,
        page: itemStep.page + 1,
      };
      const response = await BusinessProcessService.listWorkFlow(param);
      if (response.code === 0) {
        const result = response.result;

        const newDataOfStep = [...dataOfStep];
        const indexStep = newDataOfStep.findIndex((el) => el.stepId === itemStep.id);
        const stepFind = newDataOfStep.find((el) => el.stepId === itemStep.id);
        if (indexStep !== -1) {
          const newData = {
            stepId: itemStep.id,
            stepName: itemStep.title,
            value: [...stepFind.value, ...result?.items],
            hasMore: result?.loadMoreAble,
            page: result?.page,
          };
          newDataOfStep[indexStep] = newData;
          setDataOfStep(newDataOfStep);
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const handleScrollSpecial = async (e, itemStep, status) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemStep.hasMore) {
      const param = {
        processId: itemStep.processId,
        workflowId: itemStep.id,
        limit: 10,
        page: itemStep.page + 1,
        status: status,
      };
      const response = await BusinessProcessService.listWorkFlow(param);
      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...itemStep.items, ...result.items],
        };

        if (status === 0) {
          setDataStart(newData);
        } else if (status === 2) {
          setDataSuccess(newData);
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa đối tượng đã chọn {item ? <strong>{item.processedObject?.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        onDeleteWorkFlow(item.id, item);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const onDeleteWorkFlow = async (id: number, item) => {
    const response = await BusinessProcessService.deleteWorkFlow(id);
    if (response.code === 0) {
      showToast("Xóa đối tượng thành công", "success");
      onReload(true, item);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  return (
    <div className="wrapper-kanban-ticket-process">
      <div className="search__kanban">
        {/* <SearchBox
          name="Tên"
          params={params}
          isFilter={true}
          listFilterItem={contractFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        /> */}
      </div>
      <div className="__special-kanban--business-process">
        <div
          className="box__task--kanban"
          style={{
            // width: `${columns.length >= 5 ? `${columns.length * 210}px` : "100%"}`,
            width: ` "100%"`,
            marginBottom: "1.5rem",
          }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            {listColumn.map((column, id) => {
              return (
                <Droppable key={column.id} droppableId={id.toString()}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        // style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }}
                        className="task-list"
                      >
                        <div
                          className="wrapper__title"
                          style={{
                            // backgroundColor: column.id === 'done' || column.id === 'fail' ? column.color : '',
                            backgroundColor: column.color,
                          }}
                        >
                          <span
                            className="title-task"
                            style={{
                              color: "white",
                            }}
                          >
                            {column.title}
                          </span>
                        </div>
                        <div
                          className="lst__item"
                          style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }}
                          onScroll={(e) => {
                            if (column.id === 0) {
                              handleScrollSpecial(e, column, 0);
                            } else if (column.id === "done") {
                              handleScrollSpecial(e, column, 1);
                            } else {
                              handleScroll(e, column);
                            }
                          }}
                        >
                          {columns[id]?.items && !isLoadingColumns ? (
                            <>
                              {columns[id].items?.map((item, idx) => {
                                return (
                                  <TaskItemTicket
                                    key={item.id}
                                    item={item}
                                    index={idx}
                                    column={column}
                                    callbackHistory={callbackHistory}
                                    callBackAction={(item, type) => {
                                      if (type === "delete") {
                                        showDialogConfirmDelete(item);
                                      }
                                    }}
                                  />
                                );
                              })}
                            </>
                          ) : (
                            <Loading />
                          )}
                        </div>
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              );
            })}
          </DragDropContext>
        </div>
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
