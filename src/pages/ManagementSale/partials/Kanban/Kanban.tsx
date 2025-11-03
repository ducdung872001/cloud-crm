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
import CollectInfoModal from "../CollectInfoModal/CollectInfoModal";
import AddTicketModal from "pages/Ticket/partials/AddEditTicketModal/AddTicketModal";
import ModalDetailSaleInvoice from "../ModalDetailSaleInvoice/ModalDetailSaleInvoice";
import WarrantyModal from "../WarrantyModal/WarrantyModal";
import TicketModal from "../TicketModal/TicketModal";
import ExchangeFast from "./partials/ExchangeFast";

export default function Kanban(props: any) {
  const {
    data,
    dataOfApproach,
    setDataOfApproach,
    dataStart,
    setDataStart,
    dataFail,
    setDataFail,
    dataSuccess,
    setDataSuccess,
    onReload,
    params,
    setParams,
    contractFilterList,
    listApproach,

    invoiceIdList,
    setInvoiceIdList,
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

  const [idEndPoint, setIdEndPoint] = useState<number>(null);
  const [dataWork, setDataWork] = useState<IContractResponse>(null);

  const [submitTask, setSubmitTask] = useState<boolean>(false);
  const [showModalSupport, setShowModalSupport] = useState<boolean>(false);

  useEffect(() => {
    setShowModalExchange(false);
  }, [params]);

  useEffect(() => {
    const resultData = listApproach.map((item) => {
      //lấy ra danh sách các cơ hội thuộc quy trình này
      const newDataItemsApproach = (dataOfApproach?.length > 0 && dataOfApproach.find((element) => element.approachId === item.value)) || null;
      const newDataItems = newDataItemsApproach?.value || [];
      const newHasMore = newDataItemsApproach?.hasMore;
      const newPage = newDataItemsApproach?.page;

      //Lọc ra các cơ hội đang hoạt động
      const resultDataItems =
        newDataItems.length > 0 &&
        newDataItems.filter((element) => {
          return element.status !== 1 && element.status !== 3;
        });

      if (item.label) {
        return {
          id: item.value,
          title: item.label,
          color: item.color,
          lstSaleflowActivity: item.lstSaleflowActivity,
          saleflowId: item.saleflowId,
          step: item.step,
          // items: data.filter((element) => {
          //   // return element.approachId === item.value;
          //   return element.approachId === item.value && element.invoiceResponse?.status !== 1 && element.invoiceResponse?.status !== 3;
          // }),
          items: resultDataItems || [],
          hasMore: newHasMore,
          page: newPage,
        };
      }
    });

    const result = resultData.filter((el) => el);

    if (result && result.length > 0) {
      result.unshift({
        id: 0,
        title: "Tạo hoá đơn",
        color: "#177AD5",
        saleflowId: listApproach[0]?.saleflowId,
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
          title: "Thành công",
          color: "#1bc10d",
          saleflowId: listApproach[0]?.saleflowId,
          // items: data.filter((el) => {
          //   return el.invoiceResponse?.status === 1;
          // }),
          items: dataSuccess?.items || [],
          hasMore: dataSuccess?.loadMoreAble,
          page: dataSuccess?.page,
        },
        {
          id: "fail",
          title: "Thất bại",
          color: "#ed0f0f",
          saleflowId: listApproach[0]?.saleflowId,
          // items: data.filter((el) => {
          //   return el.invoiceResponse?.status === 3;
          // }),
          items: dataFail?.items || [],
          hasMore: dataFail?.loadMoreAble,
          page: dataFail?.page,
        }
      );
    }
    setColumns(result);
  }, [data, listApproach, dataOfApproach, dataStart, dataFail, dataSuccess]);

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

    const startLabel = sourceColumn.title;
    const endLabel = destColumn.title;

    //? đoạn này check đk nếu như id của điểm đầu khác với id của điểm cuối
    //* thì lúc đó mới lấy giá trị điểm bắt đầu và điểm kết thúc
    if (startPoint !== endPoint) {
      setIdEndPoint(endPoint);

      handleUpdateStatusInvoice(endPoint, dragItem, startPoint, startLabel, endLabel);
    }

    //TODO: đoạn này xử lý logic check đk kéo thả task ở đây
    // if (startPoint === 0 && endPoint === 4) {
    // showToast("Công việc chưa thực hiện không được kéo sang tạm dừng", "warning");
    // setSubmitTask(true);
    // setShowModalSupport(true);
    // return;
    // }

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

  const [isCollectInfoEform, setIsCollectInfoEform] = useState(false);
  const [isUploadAttachment, setIsUploadAttachment] = useState(false);
  const [modalAddTicket, setModalAddTicket] = useState(false);
  const [modalAddWarranty, setModalAddWarranty] = useState(false);
  const [showModalViewInvoice, setShowModalViewInvoice] = useState(false);

  const handleScroll = async (e, itemApproach) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemApproach.hasMore) {
      const param = {
        saleflowId: itemApproach.saleflowId,
        approachId: itemApproach.id,
        limit: 10,
        page: itemApproach.page + 1,
      };
      const response = await SaleflowInvoiceService.list(param);
      if (response.code === 0) {
        const result = response.result;

        let newDataOfApproach = [...dataOfApproach];
        const indexApproach = newDataOfApproach.findIndex((el) => el.approachId === itemApproach.id);
        const approachFind = newDataOfApproach.find((el) => el.approachId === itemApproach.id);
        if (indexApproach !== -1) {
          const newData = {
            approachId: itemApproach.id,
            approachName: itemApproach.title,
            value: [...approachFind.value, ...result?.items],
            hasMore: result?.loadMoreAble,
            page: result?.page,
          };
          newDataOfApproach[indexApproach] = newData;
          setDataOfApproach(newDataOfApproach);
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  const handleScrollSpecial = async (e, itemApproach, status) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemApproach.hasMore) {
      const param = {
        saleflowId: itemApproach.saleflowId,
        approachId: -1,
        status: status,
        limit: 10,
        page: itemApproach.page + 1,
      };
      const response = await SaleflowInvoiceService.list(param);
      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...itemApproach.items, ...result.items],
        };

        if (status === 0) {
          setDataStart(newData);
        } else if (status === 1) {
          setDataSuccess(newData);
        } else {
          setDataFail(newData);
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  return (
    <div className="wrapper-kanban-saleflow-invoice">
      <div className="search__kanban">
        {/* <SearchBox
          name="Tên"
          params={params}
          isFilter={true}
          listFilterItem={contractFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        /> */}
      </div>
      <div className="__special-kanban--saleflow-invoice">
        <div className="box__task--kanban" style={{ width: `${columns.length >= 5 ? `${columns.length * 210}px` : "100%"}`, marginBottom: "1.5rem" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {columns.map((column, idx) => {
              const lstSActivity = column.lstSaleflowActivity || [];
              const activities = lstSActivity.map((item) => {
                return item.code;
              });
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

                          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <div style={{ display: "flex" }}>
                              {/* {activities.includes("email") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                                <Tippy content="Gửi email">
                                  <div>
                                    <Icon
                                      name="EmailFill"
                                      style={{
                                        width: 17,
                                        marginRight: marginRight,
                                        fill: checkColumn?.columnId === column.id && checkEmail.length > 0 ? "white" : "#AAAAAA",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => {
                                        if (checkColumn?.columnId === column.id) {
                                          if (customerIdlist.length > 0 && checkEmail.length > 0) {
                                            setShowModalSendEmailContract(true);
                                            // if (customerIdlist.length === 1) {
                                            //     setShowModalSendEmail(true);
                                            // } else {
                                            //     const listCustomerHasEmail = checkEmail.map(item => {
                                            //         return item.id
                                            //     })
                                            //     navigate(`/email_marketting?customerIdlist=${listCustomerHasEmail}`)
                                            // }
                                          } else {
                                            showToast("Vui lòng chọn khách hàng gửi email", "warning");
                                          }
                                        } else {
                                          showToast("Vui lòng chọn khách hàng gửi email", "warning");
                                        }
                                      }}
                                    />
                                  </div>
                                </Tippy>
                              )} */}
                            </div>
                          </div>
                        </div>

                        {!column.id && (
                          <Tippy content="Tạo hoá đơn">
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
                            if (column.id === 0) {
                              handleScrollSpecial(e, column, 0);
                            } else if (column.id === "done") {
                              handleScrollSpecial(e, column, 1);
                            } else if (column.id === "fail") {
                              handleScrollSpecial(e, column, 3);
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
                                setDataCustomer={setDataCustomer}
                                customerIdlist={customerIdlist}
                                setCustomerIdList={setCustomerIdList}
                                invoiceIdList={invoiceIdList}
                                setInvoiceIdList={setInvoiceIdList}
                                checkColumn={checkColumn}
                                setCheckColumn={setCheckColumn}
                                setColumnList={setColumnList}
                                setShowModalExchange={setShowModalExchange}
                                setIsCollectInfoEform={setIsCollectInfoEform}
                                setIsUploadAttachment={setIsUploadAttachment}
                                setModalAddTicket={setModalAddTicket}
                                setModalAddWarranty={setModalAddWarranty}
                                setShowModalViewInvoice={setShowModalViewInvoice}
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

      {dataCustomer && showModalExchange && (
        <ExchangeFast
          dataCustomer={dataCustomer}
          onHide={() => {
            setDataCustomer(null);
            setShowModalExchange(false);
          }}
        />
      )}
      <CollectInfoModal
        onShow={isCollectInfoEform}
        data={dataCustomer}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsCollectInfoEform(false);
          // setDataContractEform(null);
        }}
      />

      <TicketModal
        onShow={modalAddTicket}
        data={null}
        saleflowId={dataCustomer?.saleflowId || null}
        sieId={dataCustomer?.sieId || null}
        idCustomer={dataCustomer?.id || null}
        onHide={(reload) => {
          if (reload) {
            // onReload(true);
          }
          setModalAddTicket(false);
        }}
      />

      <WarrantyModal
        onShow={modalAddWarranty}
        data={null}
        saleflowId={dataCustomer?.saleflowId || null}
        sieId={dataCustomer?.sieId || null}
        idCustomer={dataCustomer?.id || null}
        onHide={(reload) => {
          if (reload) {
            // onReload(true);
          }
          setModalAddWarranty(false);
        }}
      />

      <ModalDetailSaleInvoice idInvoice={dataCustomer?.invoiceId} onShow={showModalViewInvoice} onHide={() => setShowModalViewInvoice(false)} />

      {/* <UploadAttachmentModal
        onShow={isUploadAttachment}
        data={dataCustomer}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsUploadAttachment(false);
          // setDataContractEform(null);
        }}
      /> */}
    </div>
  );
}
