import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { showToast } from "utils/common";
import TaskItem from "./partials/TaskItem/TaskItem";
import "./Kanban.scss";
import { IContractResponse } from "model/contract/ContractResponseModel";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import { ICustomPlaceholderResponse } from "model/customPlaceholder/CustomPlaceholderResponseModel";
import SaleflowInvoiceService from "services/SaleflowInvoiceService";
import { AnyKindOfDictionary } from "lodash";
import CampaignMarketingService from "services/CampaignMarketingService";

export default function Kanban(props: any) {
  const {
    data,
    dataOfStatus_1,
    setDataOfStatus_1,
    dataOfStatus_2,
    setDataOfStatus_2,
    dataOfStatus_3,
    setDataOfStatus_3,
    dataOfStatus_4,
    setDataOfStatus_4,
    dataOfStatus_5,
    setDataOfStatus_5,
    dataOfStatus_6,
    setDataOfStatus_6,
    onReload,
    params,
    setParams,
    contractFilterList,
    listApproach,
    setIsModalAllocateBudget,
    setIsModalGiveGoal,
    setDataCampaignMA,
    setChannelItemData,
    showDialogConfirmDeleteChannel,
    showDialogConfirmDelete,
    setIsChangeStatusCampaign,
    setIsModalReport,
    setIsMarketingChannelInternal,

    customerIdlist,
    setCustomerIdList,
    columnList,
    setColumnList,
    checkColumn,
    setCheckColumn,
    dataCustomerList,
    setShowModalAdd,
  } = props;

  const marginRight = 12;
  const [columns, setColumns] = useState<any[]>([]);
  console.log("columns", columns);

  const [idEndPoint, setIdEndPoint] = useState<number>(null);
  const [dataWork, setDataWork] = useState<IContractResponse>(null);
  useEffect(() => {
    setDataCampaignMA(dataWork);
  }, [dataWork]);

  const [submitTask, setSubmitTask] = useState<boolean>(false);
  const [showModalSupport, setShowModalSupport] = useState<boolean>(false);

  useEffect(() => {
    setShowModalExchange(false);
  }, [params]);

  useEffect(() => {
    const resultData = listApproach.map((item) => {
      if (item.label) {
        return {
          id: item.value,
          title: item.label,
          color: item.color,
          // items: data.filter((element) => {
          //   // return element.approachId === item.value;
          //   return element.status === item.value;
          // }),
          items:
            item.value === 1
              ? dataOfStatus_1?.items
              : item.value === 2
              ? dataOfStatus_2?.items
              : item.value === 3
              ? dataOfStatus_3?.items
              : item.value === 4
              ? dataOfStatus_4?.items
              : item.value === 5
              ? dataOfStatus_5?.items
              : item.value === 6
              ? dataOfStatus_6?.items
              : [],

          hasMore:
            item.value === 1
              ? dataOfStatus_1?.loadMoreAble
              : item.value === 2
              ? dataOfStatus_2?.loadMoreAble
              : item.value === 3
              ? dataOfStatus_3?.loadMoreAble
              : item.value === 4
              ? dataOfStatus_5?.loadMoreAble
              : item.value === 5
              ? dataOfStatus_5?.loadMoreAble
              : item.value === 6
              ? dataOfStatus_6?.loadMoreAble
              : false,
          page:
            item.value === 1
              ? dataOfStatus_1?.page
              : item.value === 2
              ? dataOfStatus_2?.page
              : item.value === 3
              ? dataOfStatus_3?.page
              : item.value === 4
              ? dataOfStatus_4?.page
              : item.value === 5
              ? dataOfStatus_5?.page
              : item.value === 6
              ? dataOfStatus_6?.page
              : 1,
        };
      }
    });

    setColumns(resultData);
  }, [data, listApproach, dataOfStatus_1, dataOfStatus_2, dataOfStatus_3, dataOfStatus_4, dataOfStatus_5, dataOfStatus_6]);

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
      // handleUpdateStatus(startPoint, endPoint, dragItem);

      if (startPoint === 1) {
        if (endPoint === 3 || endPoint === 4 || endPoint === 5 || endPoint === 6) {
          showToast("Chiến dịch chưa được phân bổ ngân sách", "warning");
          return;
        } else if (endPoint === 2) {
          setIsModalAllocateBudget(true);
        }
      } else {
        if (startPoint === 2 && (endPoint === 4 || endPoint === 5 || endPoint === 6)) {
          showToast("Vui lòng thực hiện bước Giao chỉ tiêu", "warning");
          return;
        }

        if (startPoint === 3 && (endPoint === 5 || endPoint === 6)) {
          showToast("Vui lòng thực hiện bước Theo dõi thực hiện", "warning");
          return;
        }

        if (startPoint === 4 && endPoint === 6) {
          showToast("Vui lòng thực hiện bước Báo cáo", "warning");
          return;
        }

        if (startPoint === 2 && endPoint === 3) {
          setIsModalGiveGoal(true);
          setChannelItemData(dragItem);
        }

        if ((startPoint === 3 && endPoint === 4) || (startPoint === 4 && endPoint === 5) || (startPoint === 5 && endPoint === 6)) {
          handleUpdateStatus(startPoint, endPoint, dragItem);
        }

        // if(startPoint === 4 && endPoint === 3){
        //   handleUpdateStatus(startPoint, endPoint, dragItem);
        // }
      }
    }

    //TODO: đoạn này xử lý logic check đk kéo thả task ở đây

    // if (startPoint === 1 && endPoint === 0) {
    // showToast("Công việc đang thực hiện không được kéo sang chưa thực hiện", "warning");
    // setSubmitTask(true);
    // setShowModalSupport(true);
    // return;
    // }

    // if (startPoint === 4 && endPoint === 0) {
    // showToast("Công việc tạm dừng không được kéo sang chưa thực hiện", "warning");
    // setSubmitTask(true);
    // setShowModalSupport(true);
    // return;
    // }

    // if (startPoint === 4 && endPoint === 2) {
    // showToast("Công việc tạm dừng không được kéo sang hoàn thành", "warning");
    // setSubmitTask(true);
    // setShowModalSupport(true);
    // return;
    // }

    if ((startPoint === 3 && endPoint === 4) || (startPoint === 4 && endPoint === 5) || (startPoint === 5 && endPoint === 6)) {
      newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);

      newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);

      setSubmitTask(false);
      setColumns(newColumns);
    }

    if (startPoint !== 1) {
      // newColumns[parseInt(source.droppableId)].items.splice(source.index, 1);
      // newColumns[parseInt(destination.droppableId)].items.splice(destination.index, 0, dragItem);
      // setSubmitTask(false);
      // setColumns(newColumns);
    }
  };

  const handleUpdateStatus = async (idStartPoint, idEndPoint, dragItem) => {
    const body: any = {
      id: dragItem?.id,
      status: idEndPoint,
    };

    if (submitTask) {
      return;
    }

    const response = await CampaignMarketingService.updateMABudgetStatus(body);

    if (response.code === 0) {
      showToast("Chuyển trạng thái thành công", "success");
      onReload(true, idStartPoint, idEndPoint);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //Đoạn này lấy giá trị rồi cập nhật API, đk cập nhập API là dataWork !== null
  // useEffect(() => {
  //     if (dataWork !== null) {
  //         handleUpdateStatusContract();
  //     }
  // }, [dataWork, idEndPoint, submitTask]);

  ///activities

  //email
  const [dataCustomer, setDataCustomer] = useState(null);

  const [showModalSendEmail, setShowModalSendEmail] = useState<boolean>(false);
  const [showModalPlaceholderEmail, setShowModalPlaceholderEmail] = useState<boolean>(false);
  const [codesEmail, setCodesEmail] = useState<ICustomPlaceholderResponse>(null);

  //modal exchange
  const [showModalExchange, setShowModalExchange] = useState<boolean>(false);

  //kiểm tra khách hàng nào có email
  const checkEmail = dataCustomerList.filter((el) => el.emailMasked);
  const [listCustomerHasEmail, setListCustomerHasEmail] = useState([]);

  useEffect(() => {
    const checkEmail = dataCustomerList.filter((el) => el.emailMasked);
    // const listCustomerHasEmail = checkEmail.map(item => {
    //     return item.id
    // })
    setListCustomerHasEmail(checkEmail);
  }, [dataCustomerList]);

  const handleScroll = async (e, itemApproach, status) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemApproach.hasMore) {
      // console.log('itemApproach', itemApproach);
      const param = {
        limit: 10,
        page: itemApproach.page + 1,
        status: status,
      };

      let response = null;
      if (status === 1) {
        response = await CampaignMarketingService.list(param);
      } else {
        response = await CampaignMarketingService.listMABudget(param);
      }

      if (response?.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...itemApproach.items, ...result.items],
        };

        if (status === 1) {
          setDataOfStatus_1(newData);
        } else if (status === 2) {
          setDataOfStatus_2(newData);
        } else if (status === 3) {
          setDataOfStatus_3(newData);
        } else if (status === 4) {
          setDataOfStatus_4(newData);
        } else if (status === 5) {
          setDataOfStatus_5(newData);
        } else {
          setDataOfStatus_6(newData);
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  return (
    <div className="wrapper-kanban-campaign-ma">
      {/* <div className="search__kanban">
        <SearchBox
          name="Tên"
          params={params}
          isFilter={true}
          listFilterItem={contractFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
      </div> */}
      <div className="__special-kanban--campaign-ma">
        <div className="box__task--kanban" style={{ width: `1500px`, marginBottom: "1.5rem" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {columns.map((column, idx) => {
              const lstSActivity = column.lstSaleflowActivity || [];
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
                          {/* <span className="total-task">{column.items.length}</span> */}
                        </div>

                        {column.id === 1 && (
                          <Tippy content="Tạo chiến dịch Marketing">
                            <div className="button-add-customer" onClick={() => setShowModalAdd(true)}>
                              <div className="icon__add--customer">
                                <Icon name="PlusCircleFill" />
                              </div>
                            </div>
                          </Tippy>
                        )}

                        <div
                          className="lst__item"
                          style={{ backgroundColor: snapshot.isDraggingOver ? "#D1FAE5" : "#f4f5f7" }}
                          onScroll={(e) => {
                            handleScroll(e, column, column.id);
                          }}
                        >
                          {column.items?.map((item, idx) => {
                            return (
                              <TaskItem
                                key={idx}
                                item={item}
                                index={idx}
                                column={column}
                                setDataCustomer={setDataCustomer}
                                customerIdlist={customerIdlist}
                                setCustomerIdList={setCustomerIdList}
                                checkColumn={checkColumn}
                                setCheckColumn={setCheckColumn}
                                setColumnList={setColumnList}
                                setShowModalExchange={setShowModalExchange}
                                showDialogConfirmDeleteChannel={showDialogConfirmDeleteChannel}
                                showDialogConfirmDelete={showDialogConfirmDelete}
                                setIsChangeStatusCampaign={setIsChangeStatusCampaign}
                                setDataCampaignMA={setDataCampaignMA}
                                setIsModalAllocateBudget={setIsModalAllocateBudget}
                                setIsModalGiveGoal={setIsModalGiveGoal}
                                setChannelItemData={setChannelItemData}
                                setIsModalReport={setIsModalReport}
                                setIsMarketingChannelInternal={setIsMarketingChannelInternal}
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

      {/* <SupportTaskModal onShow={showModalSupport} onHide={() => setShowModalSupport(false)} /> */}

      {/* {dataCustomer && showModalExchange && (
        // <ExchangeFast
        //   dataCustomer={dataCustomer}
        //   onHide={() => {
        //     setDataCustomer(null);
        //     setShowModalExchange(false);
        //   }}
        // />
      )} */}
    </div>
  );
}
