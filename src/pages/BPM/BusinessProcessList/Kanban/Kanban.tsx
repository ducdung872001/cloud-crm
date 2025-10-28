import React, { useState, useEffect, Fragment } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { showToast } from "utils/common";
import TaskItem from "./partials/TaskItem/TaskItem";
import "./Kanban.scss";
import { IContractResponse } from "model/contract/ContractResponseModel";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import SaleflowInvoiceService from "services/SaleflowInvoiceService";
import BusinessProcessService from "services/BusinessProcessService";
import Dialog, { IContentDialog } from "components/dialog/dialog";

export default function Kanban(props: any) {
  const {
    data,
    dataOfStep,
    setDataOfStep,
    dataStart,
    setDataStart,
    dataSuccess,
    setDataSuccess,

    onReload,
    params,
    setParams,
    listStepProcess,
    callbackHistory,

  } = props;
  console.log("dataOfStep", dataOfStep);
  console.log('listStepProcess', listStepProcess);
  

  const marginRight = 12;
  const [columns, setColumns] = useState<any[]>([]);
  console.log("columns", columns);

  const [idEndPoint, setIdEndPoint] = useState<number>(null);
  const [dataWork, setDataWork] = useState<IContractResponse>(null);

  const [submitTask, setSubmitTask] = useState<boolean>(false);

  useEffect(() => {
    const resultData = listStepProcess.map((item) => {
      //lấy ra danh sách các cơ hội thuộc quy trình này
      const newDataItemsStep = (dataOfStep?.length > 0 && dataOfStep.find((element) => element.stepId === item.value)) || null;
      const newDataItems = newDataItemsStep?.value || [];
      const newHasMore = newDataItemsStep?.hasMore;
      const newPage = newDataItemsStep?.page;

      //Lọc ra các cơ hội đang hoạt động
    //   const resultDataItems =
    //     newDataItems.length > 0 &&
    //     newDataItems.filter((element) => {
    //       return element.status !== 1 && element.status !== 3;
    //     });

      if (item.label) {
        return {
          id: item.value,
          title: item.label,
          color: item.color,
          processId: item.processId,
          step: item.stepNumber,
          // items: data.filter((element) => {
          //   // return element.approachId === item.value;
          //   return element.approachId === item.value && element.invoiceResponse?.status !== 1 && element.invoiceResponse?.status !== 3;
          // }),
          items: newDataItems || [],
          hasMore: newHasMore,
          page: newPage,
        };
      }
    });

    const result = resultData.filter((el) => el);

    if (result) {
      result.unshift({
        id: 0,
        title: "Bắt đầu",
        color: "#177AD5",
        processId: listStepProcess[0]?.processId,
        // items: data.filter((el) => {
        //   return !el.approachId;
        // }),
        items: dataStart?.items || [],
        hasMore: dataStart?.loadMoreAble,
        page: dataStart?.page,
      });

      result.push(
        {
          id: "done",
          title: "Hoàn thành",
          color: "#1bc10d",
          processId: listStepProcess[0]?.processId,
          // items: data.filter((el) => {
          //   return el.invoiceResponse?.status === 1;
          // }),
          items: dataSuccess?.items || [],
          hasMore: dataSuccess?.loadMoreAble,
          page: dataSuccess?.page,
        },
        // {
        //   id: "fail",
        //   title: "Thất bại",
        //   color: "#ed0f0f",
        //   saleflowId: listApproach[0]?.saleflowId,
        //   // items: data.filter((el) => {
        //   //   return el.invoiceResponse?.status === 3;
        //   // }),
        //   items: dataFail?.items || [],
        //   hasMore: dataStart?.loadMoreAble,
        //   page: dataStart?.page,
        // }
      );
    }
    setColumns(result);
  }, [data, listStepProcess, dataOfStep, dataStart, dataSuccess]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const newColumns = [...columns];

    const dragItem = newColumns[parseInt(source.droppableId)].items[source.index];
    setDataWork(dragItem);
    console.log("dragItem", dragItem);

    //! biến này tạo ra với mục đích lấy cột hiện tại
    const sourceColumn = columns[source.droppableId];
    console.log("sourceColumn", sourceColumn);

    //! biến này tạo ra với mục đích lấy cột cuối muốn kéo thả đến
    const destColumn = newColumns[destination.droppableId];
    console.log("destColumn", destColumn);

    const startPoint = sourceColumn.id;
    const endPoint = destColumn.id;

    const startLabel = sourceColumn.title;
    const endLabel = destColumn.title;

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

  const handleUpdateStatusInvoice = async (endPoint, dragItem, startPoint, startLabel, endLabel) => {
    const listApproachId = [
      { value: startPoint, label: startLabel },
      { value: endPoint, label: endLabel },
    ];

    const body = {
      id: dragItem?.id,
      approachId: endPoint,
      // invoiceId: dragItem?.invoiceId,
      // saleflowId: params?.saleflowId,
    };

    const bodySecond = {
      id: dragItem?.id,
      invoiceId: dragItem?.invoiceId,
      // invoiceId: dragItem?.invoiceId,
      // saleflowId: params?.saleflowId,
    };

    console.log("body", body);

    if (submitTask) {
      return;
    }

    let response = null;

    if (endPoint === "done") {
      response = await SaleflowInvoiceService.updateApproachSuccess(bodySecond);
    } else if (endPoint === "fail") {
      response = await SaleflowInvoiceService.updateApproachCancel(bodySecond);
    } else {
      response = await SaleflowInvoiceService.updateApproach(body);
    }

    if (response.code === 0) {
      showToast("Chuyển giai đoạn thành công", "success");
      onReload(true, listApproachId);
      setIdEndPoint(null);
      setDataWork(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleScroll = async (e, itemStep) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemStep.hasMore) {
      console.log("itemStep", itemStep);
      const param = {
        processId: itemStep.processId,
        workflowId: itemStep.id,
        limit: 10,
        page: itemStep.page + 1,
      };
      const response = await BusinessProcessService.listWorkFlow(param);
      if (response.code === 0) {
        const result = response.result;

        let newDataOfStep = [...dataOfStep];
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
          // console.log('newDataOfApproach', newDataOfApproach);
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
      console.log("itemStep", itemStep);
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
    <div className="wrapper-kanban-business-process">
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
        <div className="box__task--kanban" style={{ width: `${columns.length >= 5 ? `${columns.length * 210}px` : "100%"}`, marginBottom: "1.5rem" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {columns.map((column, idx) => {           
              return (
                <Droppable key={idx} droppableId={idx.toString()}>
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

                        {/* {!column.id && (
                          <Tippy content="Tạo hoá đơn">
                            <div className="button-add-customer" onClick={() => setShowModalAdd(true)}>
                              <div className="icon__add--customer">
                                <Icon name="PlusCircleFill" />
                              </div>
                            </div>
                          </Tippy>
                        )} */}

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
                          {column.items?.map((item, idx) => {
                            return (
                              <TaskItem
                                key={idx}
                                item={item}
                                index={idx}
                                column={column}
                                callbackHistory={callbackHistory}
                                callBackAction={(item, type) => {                                  
                                  if(type === 'delete'){
                                    showDialogConfirmDelete(item);
                                  }
                                  
                                } }
                                // setDataCustomer={setDataCustomer}
                                // customerIdlist={customerIdlist}
                                // setCustomerIdList={setCustomerIdList}
                                // invoiceIdList={invoiceIdList}
                                // setInvoiceIdList={setInvoiceIdList}
                                // checkColumn={checkColumn}
                                // setCheckColumn={setCheckColumn}
                                // setColumnList={setColumnList}
                                // setShowModalExchange={setShowModalExchange}
                                // setIsCollectInfoEform={setIsCollectInfoEform}
                                // setIsUploadAttachment={setIsUploadAttachment}
                                // setModalAddTicket={setModalAddTicket}
                                // setModalAddWarranty={setModalAddWarranty}
                                // setShowModalViewInvoice={setShowModalViewInvoice}
                              />
                            );
                          })}
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
