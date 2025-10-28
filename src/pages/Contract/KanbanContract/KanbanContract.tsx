import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import { IKanbanWorkProps } from "model/workOrder/PropsModel";
import { IUpdateStatusRequest } from "model/workOrder/WorkOrderRequestModel";
import SearchBox from "components/searchBox/searchBox";
import TaskItem from "./partials/TaskItem/TaskItem";
import SupportTaskModal from "./partials/SupportTaskModal/SupportTaskModal";
import "./KanbanContract.scss";
import { IKanbanConstractProps } from "model/contract/PropsModel";
import { IContractResponse } from "model/contract/ContractResponseModel";
import { IContractRequest, IUpdateStageRequest } from "model/contract/ContractRequestModel";
import ContractService from "services/ContractService";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import { ICustomPlaceholderResponse } from "model/customPlaceholder/CustomPlaceholderResponseModel";
import CollectInfoModal from "../CollectInfoModal/CollectInfoModal";
import SendEmailModal from "../SendEmailModal/SendEmailModal";
import UploadAttachmentModal from "../UploadAttachmentModal/UploadAttachmentModal";
import AddCashBookModal from "pages/CashBook/partials/AddCashBookModal";
import QuoteModal from "../QuoteModal/QuoteModal";
import PaymentProgress from "../PaymentProgress/PaymentProgress";
import ContractPipelineService from "services/ContractPipelineService";
import { useNavigate } from "react-router-dom";
import ExchangeFast from "./partials/ExchangeFast";
import ModalAppendix from "../ModalAppendix/ModalAppendix";
import ModalWarranty from "../ModalWarranty/ModalWarranty";
import AddSignerFSAndQuote from "pages/Common/AddSignerFSAndQuote";
import ModalHistorySignature from "../ModalHistorySignature/ModalHistorySignature";

export default function KanbanContract(props: any) {
  const {
    data,
    dataOfApproach,
    setDataOfApproach,
    dataStart,
    setDataStart,
    dataFail,
    setDataFail,
    onReload,
    params,
    setParams,
    contractFilterList,
    listApproachContract,

    contractIdList,
    setContractIdList,
    customerIdlist,
    setCustomerIdList,
    columnList,
    setColumnList,
    checkColumn,
    setCheckColumn,
    dataCustomerList,
    contractType,
  } = props;

  const navigate = useNavigate();
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
    const resultData = listApproachContract.map((item) => {
      //lấy ra danh sách các cơ hội thuộc quy trình này
      const newDataItemsApproach = (dataOfApproach?.length > 0 && dataOfApproach.find((element) => element.approachId === item.value)) || null;
      const newDataItems = newDataItemsApproach?.value || [];
      const newHasMore = newDataItemsApproach?.hasMore;
      const newPage = newDataItemsApproach?.page;

      //Lọc ra các cơ hội đang hoạt động
      const resultDataItems =
        newDataItems.length > 0 &&
        newDataItems.filter((element) => {
          return element.status !== 4 && element.status;
        });
      return {
        id: item.value,
        title: item.label,
        color: item.color,
        lstContractActivity: item.lstContractActivity,
        pipelineId: item.pipelineId,
        step: item.step,
        // items: data.filter((element) => {
        //   return element.approachId === item.value;
        // }),
        items: newDataItems || [],
        hasMore: newHasMore,
        page: newPage,
      };
    });

    const result = resultData.filter((el) => el);

    if (result && result.length > 0) {
      result.unshift({
        id: null,
        title: "Chưa bắt đầu",
        color: "#177AD5",
        // contractId: listApproachContract[0]?.contractId,
        pipelineId: listApproachContract[0]?.pipelineId,
        // items: data.filter((el) => {
        //   return !el.approachId;
        // }),
        items: dataStart?.items || [],
        hasMore: dataStart?.loadMoreAble,
        page: dataStart?.page,
      });

      result.push({
        id: "fail",
        title: "Thất bại",
        color: "#ed0f0f",
        pipelineId: listApproachContract[0]?.pipelineId,
        // items: data.filter((el) => {
        //   return el.status === -4;
        // }),
        items: dataFail?.items || [],
        hasMore: dataStart?.loadMoreAble,
        page: dataStart?.page,
      });

      result.push({
        id: "save",
        title: "Lưu trữ",
        color: "orange",
        pipelineId: listApproachContract[0]?.pipelineId,
        // items: data.filter((el) => {
        //   return el.status === -4;
        // }),
        items: [],
        hasMore: false,
        page: 1,
      });
    }
    setColumns(result);
  }, [data, listApproachContract, dataOfApproach, dataStart, dataFail]);

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

    const childProcess = destColumn?.lstContractActivity?.find((el) => el.code === "childProcess") || null;

    //? đoạn này check đk nếu như id của điểm đầu khác với id của điểm cuối
    //* thì lúc đó mới lấy giá trị điểm bắt đầu và điểm kết thúc
    if (startPoint !== endPoint) {
      if (childProcess) {
        const body = {
          id: 0,
          contractId: dragItem.id,
          pipelineId: childProcess.pipelineId,
          approachId: endPoint,
        };

        const response = await ContractPipelineService.contractSubPipelineUpdate(body);

        if (response.code === 0) {
          setIdEndPoint(endPoint);
          handleUpdateStatusContract(endPoint, dragItem);
          // if(endPoint === 'fail' || endPoint === null){
          //   handleUpdateStatusContract(startPoint, dragItem, endPoint === 'fail' ? 4 : 0);
          // } else {
          //   handleUpdateStatusContract(endPoint, dragItem, 1);
          // }
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
      } else {
        setIdEndPoint(endPoint);
        // handleUpdateStatusContract(endPoint, dragItem);
        if (endPoint === "fail" || endPoint === null) {
          handleUpdateStatusContract(endPoint === "fail" ? -4 : 0, dragItem);
        } else {
          handleUpdateStatusContract(endPoint, dragItem);
        }
      }
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

  const handleUpdateStatusContract = async (endPoint, dragItem) => {
    // const body: any = {
    //     id: dataWork?.id,
    //     stageId: idEndPoint,
    //     name: dataWork.name,
    //     pipelineId: dataWork.pipelineId,
    //     signDate: dataWork.signDate,
    //     taxCode: dataWork.taxCode,
    //     affectedDate: dataWork.affectedDate,
    //     branchId: dataWork.branchId,
    //     contractExtraInfos: dataWork.contractExtraInfos,
    //     contractNo: dataWork.contractNo,
    //     customerId: dataWork.customerId,
    //     dealValue: dataWork.dealValue,
    //     employeeId: dataWork.employeeId,
    //     endDate: dataWork.endDate
    // };
    const body = {
      // id: dragItem?.id,
      approachId: endPoint,
      contractId: dragItem?.id,
      pipelineId: params?.pipelineId,
      // ...(status ? {status: status} : {})
    };

    if (submitTask) {
      return;
    }
    const response = await ContractService.updateApproach(body);

    if (response.code === 0) {
      showToast("Chuyển giai đoạn thành công", "success");
      onReload(true);
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
  const [dataContract, setDataContract] = useState(null);

  const [showModalSendEmail, setShowModalSendEmail] = useState<boolean>(false);
  const [showModalPlaceholderEmail, setShowModalPlaceholderEmail] = useState<boolean>(false);
  const [codesEmail, setCodesEmail] = useState<ICustomPlaceholderResponse>(null);

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

  const [showModalSendEmailContract, setShowModalSendEmailContract] = useState(false);
  const [isCollectInfoEform, setIsCollectInfoEform] = useState(false);
  const [isUploadAttachment, setIsUploadAttachment] = useState(false);
  const [isModalCashBook, setIsModalCashBook] = useState(false);
  const [isModalQuote, setIsModalQuote] = useState(false);
  const [isModalPaymentProgress, setIsModalPaymentProgress] = useState(false);
  //modal exchange
  const [showModalExchange, setShowModalExchange] = useState<boolean>(false);
  //thêm phụ lục
  const [isModalAppendix, setIsModalAppendix] = useState(false);
  //bảo hành
  const [modalAddWarranty, setModalAddWarranty] = useState(false);
  //trình ký
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  //lịch sử ký
  const [hasHistorySignature, setHasHistorySignature] = useState<boolean>(false);

  const handleScroll = async (e, itemApproach) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemApproach.hasMore) {
      const param = {
        pipelineId: itemApproach.pipelineId,
        approachId: itemApproach.id,
        limit: 10,
        page: itemApproach.page + 1,
      };

      const response = await ContractService.list(param);

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
        pipelineId: itemApproach.pipelineId,
        limit: 10,
        approachId: status,
        page: itemApproach.page + 1,
      };

      const response = await ContractService.list(param);

      if (response.code === 0) {
        const result = response.result;

        const newData = {
          ...result,
          items: [...itemApproach.items, ...result.items],
        };
        if (status === -4) {
          setDataFail(newData);
        } else {
          setDataStart(newData);
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  return (
    <div className="wrapper-kanban-contract">
      <div className="search__kanban">
        <SearchBox
          name="Tên hợp đồng/Số HĐ/MST"
          params={params}
          isFilter={true}
          listFilterItem={contractFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
      </div>
      <div className="__special-kanban--contract">
        <div className="box__task--kanban" style={{ width: `${columns.length >= 4 ? `${columns.length * 210}px` : "100%"}` }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {columns.map((column, idx) => {
              const lstContractActivity = column.lstContractActivity || [];
              const activities = lstContractActivity.map((item) => {
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
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ width: "92%" }}>
                              <span
                                className="title-task"
                                style={{
                                  color: "white",
                                }}
                              >
                                {column.title}
                              </span>
                            </div>
                            <Tippy content="Lọc">
                              <div>
                                <Icon name="Filter" style={{ width: 15, height: 15, fill: "white", cursor: "pointer" }} />
                              </div>
                            </Tippy>
                          </div>
                          {/* <span className="total-task">{column.items.length}</span> */}

                          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <div style={{ display: "flex" }}>
                              {activities.includes("email") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
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
                              )}
                            </div>
                          </div>
                        </div>

                        {!column.id && (
                          <Tippy content="Tạo hợp đồng">
                            <div
                              className="button-add-customer"
                              onClick={() => {
                                navigate(`/create_contract?pipelineId=${contractType}`);
                              }}
                            >
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
                            if (column.id === null) {
                              handleScrollSpecial(e, column, 0);
                            } else if (column.id === "fail") {
                              handleScrollSpecial(e, column, -4);
                            } else {
                              handleScroll(e, column);
                            }
                          }}
                        >
                          {column.items.map((item, idx) => {
                            return (
                              <TaskItem
                                key={idx}
                                item={item}
                                index={idx}
                                column={column}
                                setDataCustomer={setDataCustomer}
                                setDataContract={setDataContract}
                                customerIdlist={customerIdlist}
                                setCustomerIdList={setCustomerIdList}
                                contractIdList={contractIdList}
                                setContractIdList={setContractIdList}
                                checkColumn={checkColumn}
                                setCheckColumn={setCheckColumn}
                                setColumnList={setColumnList}
                                setIsCollectInfoEform={setIsCollectInfoEform}
                                setIsUploadAttachment={setIsUploadAttachment}
                                setIsModalCashBook={setIsModalCashBook}
                                setIsModalQuote={setIsModalQuote}
                                setIsModalPaymentProgress={setIsModalPaymentProgress}
                                setShowModalExchange={setShowModalExchange}
                                setIsModalAppendix={setIsModalAppendix}
                                setModalAddWarranty={setModalAddWarranty}
                                setHasSignature={setHasSignature}
                                setHasHistorySignature={setHasHistorySignature}
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

      <SupportTaskModal onShow={showModalSupport} onHide={() => setShowModalSupport(false)} />

      {dataCustomer && showModalExchange && (
        <ExchangeFast
          dataCustomer={dataCustomer}
          onHide={() => {
            setDataCustomer(null);
            setShowModalExchange(false);
          }}
        />
      )}
      <SendEmailModal
        onShow={showModalSendEmailContract}
        idContract={null}
        customerIdlist={listCustomerHasEmail}
        onHide={(reload) => {
          onReload(true);
          // if (reload) {
          //     onReload(true)
          // } else {
          //     // handleUpdateStatusFail(dataWork);
          // }
          setShowModalSendEmailContract(false);
        }}
      />
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

      <UploadAttachmentModal
        onShow={isUploadAttachment}
        data={dataCustomer}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsUploadAttachment(false);
          // setDataContractEform(null);
        }}
      />

      {/* <AddCashBookModal
        onShow={isModalCashBook}
        dataCashBook={null}
        contractId={dataCustomer?.contractId}
        type={1}
        onHide={(reload) => {
          if (reload) {
            // getListCashBook(params);
          }
          setIsModalCashBook(false);
        }}
      /> */}

      <QuoteModal
        onShow={isModalQuote}
        data={dataCustomer}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsModalQuote(false);
          // setDataContractEform(null);
        }}
      />

      <ModalAppendix
        onShow={isModalAppendix}
        data={dataCustomer}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsModalAppendix(false);
        }}
      />

      <PaymentProgress
        onShow={isModalPaymentProgress}
        data={dataCustomer}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsModalPaymentProgress(false);
          // setDataContractEform(null);
        }}
      />

      <ModalWarranty
        onShow={modalAddWarranty}
        data={dataCustomer}
        idCustomer={dataCustomer?.id || null}
        onHide={(reload) => {
          if (reload) {
            onReload(true);
          }
          setModalAddWarranty(false);
        }}
      />

      <AddSignerFSAndQuote
        onShow={hasSignature}
        onHide={(reload) => {
          if (reload) {
            onReload(true);
          }

          setHasSignature(false);
        }}
        dataProps={{
          objectId: dataCustomer?.contractId,
          objectType: 3,
        }}
      />

      <ModalHistorySignature
        onShow={hasHistorySignature}
        dataContract={dataContract}
        onHide={(reload) => {
          // if (reload) {
          //   onReload();
          // }
          setHasHistorySignature(false);
        }}
      />
    </div>
  );
}
