import React, { Fragment, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import { ITaskItemProps } from "model/workOrder/PropsModel";
import OtherGenders from "assets/images/third-gender.png";
import "./TaskItem.scss";
import Checkbox from "components/checkbox/checkbox";
import Tippy from "@tippyjs/react";
import TippyContractInfo from "./partials/TippyContractInfo";

export default function TaskItem(props: any) {
  const {
    item,
    index,
    column,
    setDataCustomer,
    setDataContract,

    customerIdlist,
    setCustomerIdList,
    contractIdList,
    setContractIdList,
    checkColumn,
    setCheckColumn,
    setColumnList,

    setShowModalExchange,
    setIsCollectInfoEform,
    setIsUploadAttachment,
    setIsModalCashBook,
    setIsModalQuote,
    setIsModalPaymentProgress,
    setIsModalAppendix,
    setModalAddWarranty,
    setHasSignature,
    setHasHistorySignature,
  } = props;

  const lstContractActivity = column.lstContractActivity || [];
  const activities = lstContractActivity.map((item) => {
    return item.code;
  });

  const eform = column.lstContractActivity?.find((el) => el.code === "collectInfo") || null;

  return (
    <Fragment>
      <Draggable
        key={item.id}
        draggableId={item.id.toString()}
        // isDragDisabled={item?.status === 2 || item?.status === 3 ? true : false}
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
            className="task__item--contract"
            onClick={(e) => {
              // window.open(`/crm/detail_contract/contractId/${item.id}`, '_blank').focus();
              // setIdWork(item.id);
              // setShowModalView(true);
            }}
          >
            {/* <Tippy 
              content={<TippyContractInfo detailCustomer={item}/>} 
              delay={[120, 100]} 
              animation="scale" 
              // interactive={true}
            > */}
            <div className={`task-infomation ${item?.status === 2 || item?.status === 3 ? "disabled__task--item" : ""}`}>
              <h4
                className="title--job"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  window.open(`/crm/detail_contract/contractId/${item.id}`, "_blank").focus();
                }}
              >
                {item.name}
              </h4>
              <Tippy
                content={<TippyContractInfo detailCustomer={item} />}
                delay={[120, 100]}
                animation="scale"
                // interactive={true}
              >
                <div style={{ display: "flex", cursor: "pointer" }}>
                  <div style={{}}>
                    <Icon name="Person" style={{ width: 13, top: 0, fill: "#1c8cff" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>{item.customerName || item.businessPartnerName}</span>
                  </div>
                </div>
              </Tippy>

              <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                <div style={{ display: "flex", width: "80%" }}>
                  <Tippy content="Thông tin trao đổi">
                    <div
                      className="container-action"
                      onClick={() => {
                        setShowModalExchange(true);
                        setDataCustomer({
                          name: item.customerName,
                          id: item.customerId,
                          phoneMasked: item.customerPhone,
                          emailMasked: item.customerEmail,
                          address: item.customerAddress,
                          employeeName: item.employeeName,
                          contractId: item.id,
                          approachId: item.approachId,
                          pipelineId: item.pipelineId,
                          eformId: eform?.eformId,
                        });
                      }}
                    >
                      <Icon name="Note" style={{ width: 15.5, height: 15.5, fill: "#1c8cff", cursor: "pointer" }} />
                    </div>
                  </Tippy>

                  {activities.includes("sign") &&
                    column.id !== null &&
                    column.id !== "done" &&
                    column.id !== "fail" &&
                    (item.status === 1 ? (
                      <Tippy content="Lịch sử ký">
                        <div
                          className="container-action"
                          onClick={() => {
                            setDataContract(item);
                            setHasHistorySignature(true);
                          }}
                        >
                          <Icon name="ImpactHistory" style={{ width: 18, height: 18, fill: "#1c8cff", cursor: "pointer" }} />
                        </div>
                      </Tippy>
                    ) : (
                      <Tippy content="Trình ký">
                        <div
                          className="container-action"
                          onClick={() => {
                            setDataCustomer({
                              name: item.customerName,
                              id: item.customerId,
                              phoneMasked: item.customerPhone,
                              emailMasked: item.customerEmail,
                              address: item.customerAddress,
                              employeeName: item.employeeName,
                              contractId: item.id,
                              approachId: item.approachId,
                              pipelineId: item.pipelineId,
                              eformId: eform?.eformId,
                            });
                            setHasSignature(true);
                          }}
                        >
                          <Icon name="FingerTouch" style={{ width: 18, height: 18, fill: "#1c8cff", cursor: "pointer" }} />
                        </div>
                      </Tippy>
                    ))}

                  {activities.includes("appendix") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Thêm phụ lục">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            emailMasked: item.customerEmail,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            contractId: item.id,
                            approachId: item.approachId,
                            pipelineId: item.pipelineId,
                            eformId: eform?.eformId,
                          });
                          setIsModalAppendix(true);
                        }}
                      >
                        <Icon name="Appendix" style={{ width: 15, height: 15, fill: "#1c8cff", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("collectInfo") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Thu thập thông tin">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            emailMasked: item.customerEmail,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            contractId: item.id,
                            approachId: column.id,
                            pipelineId: item.pipelineId,
                            eformId: eform?.eformId,
                          });
                          setIsCollectInfoEform(true);
                        }}
                      >
                        <Icon name="CollectInfo" style={{ width: 15, height: 15, fill: "#1c8cff", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {/* {activities.includes('fs') && column.id !== null && column.id !== 'done' && column.id !== 'fail' &&
                        <Tippy content="Tạo FS">
                            <div className="container-action"
                              onClick = {() => {
                                setDataCustomer({
                                  name: item.customerName,
                                  id: item.customerId,
                                  phoneMasked: item.customerPhone,
                                  address: item.customerAddress,
                                  employeeName: item.employeeName,
                                  contractId: item.id,
                                  approachId: item.approachId,
                                  pipelineId: item.pipelineId,
                                  eformId: eform?.eformId

                                })
                                // setIsModalQuote(true);
                              }}
                            >
                                <Icon 
                                  name="Invoice" 
                                  style={{ width: 15, height: 15,  fill: '#1c8cff', cursor: 'pointer' }} 
                                />
                            </div>
                        </Tippy>
                    }  */}

                  {activities.includes("quote") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Tạo báo giá">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            emailMasked: item.customerEmail,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            contractId: item.id,
                            approachId: item.approachId,
                            pipelineId: item.pipelineId,
                            eformId: eform?.eformId,
                          });
                          setIsModalQuote(true);
                        }}
                      >
                        <Icon name="Invoice" style={{ width: 15, height: 15, fill: "#1c8cff", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("attachment") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Tải tài liệu">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            emailMasked: item.customerEmail,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            contractId: item.id,
                            approachId: item.approachId,
                            pipelineId: item.pipelineId,
                            eformId: eform?.eformId,
                          });
                          setIsUploadAttachment(true);
                        }}
                      >
                        <Icon name="Attachment" style={{ width: 15, height: 15, fill: "#1c8cff", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("payment") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Thanh toán">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            emailMasked: item.customerEmail,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            contractId: item.id,
                            approachId: item.approachId,
                            pipelineId: item.pipelineId,
                            eformId: eform?.eformId,
                          });
                          // setIsModalCashBook(true);
                          setIsModalPaymentProgress(true);
                        }}
                      >
                        <Icon name="CashPayment" style={{ width: 19, height: 19, fill: "#1c8cff", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("warranty") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Tạo bảo hành">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            emailMasked: item.customerEmail,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            contractId: item.id,
                            approachId: item.approachId,
                            pipelineId: item.pipelineId,
                            eformId: eform?.eformId,
                          });
                          setModalAddWarranty(true);
                        }}
                      >
                        <Icon name="ReceiveWarranty" style={{ width: 15, height: 15, fill: "#1c8cff", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}
                </div>

                <Checkbox
                  checked={contractIdList.filter((el) => el.id === item.id).length > 0}
                  label=""
                  onChange={(e) => {
                    if (!checkColumn) {
                      // setDataCustomer({
                      //   name: item.customerName,
                      //   id: item.customerId,
                      //   phoneMasked: item.customerPhone,
                      //   address: item.customerAddress,
                      //   employeeName: item.employeeName,
                      // })

                      // setOpportunityIdList((oldArray) => [...oldArray, {id: item.id, customerId: item.customerId}]);
                      setContractIdList((oldArray) => [
                        // ...oldArray,
                        {
                          id: item.id,
                          customerId: item.customerId,
                          customerName: item.customerName,
                          customerPhone: item.customerPhone,
                          customerEmail: item.customerEmail,
                          customerAddress: item.customerAddress,
                          employeeName: item.employeeName,
                        },
                      ]);
                      setCheckColumn({ columnId: column.id });
                    } else {
                      if (checkColumn?.columnId === column.id) {
                        if (contractIdList.filter((el) => el.id === item.id).length > 0) {
                          const newArrayOpp = contractIdList.filter((el) => el.id !== item.id);
                          setContractIdList(newArrayOpp);

                          if (newArrayOpp.length === 0) {
                            setCheckColumn(null);
                            setDataCustomer(null);
                          }
                        } else {
                          if (customerIdlist.length === 0) {
                            // setDataCustomer({
                            //   name: item.customerName,
                            //   id: item.customerId,
                            //   phoneMasked: item.customerPhone,
                            //   address: item.customerAddress,
                            //   employeeName: item.employeeName,
                            // })
                          } else {
                            setDataCustomer(null);
                          }

                          setContractIdList((oldArray) => [
                            ...oldArray,
                            {
                              id: item.id,
                              customerId: item.customerId,
                              customerName: item.customerName,
                              customerPhone: item.customerPhone,
                              customerEmail: item.customerEmail,
                              customerAddress: item.customerAddress,
                              employeeName: item.employeeName,
                            },
                          ]);

                          // setOpportunityIdList((oldArray) => [...oldArray, {id: item.id, customerId: item.customerId}]);
                        }
                      } else if (checkColumn !== column.id) {
                        // setOpportunityIdList([{id: item.id, customerId: item.customerId}]);
                        setContractIdList((oldArray) => [
                          {
                            id: item.id,
                            customerId: item.customerId,
                            customerName: item.customerName,
                            customerPhone: item.customerPhone,
                            customerEmail: item.customerEmail,
                            customerAddress: item.customerAddress,
                            employeeName: item.employeeName,
                          },
                        ]);
                        // setDataCustomer({
                        //   name: item.customerName,
                        //   id: item.customerId,
                        //   phoneMasked: item.customerPhone,
                        //   address: item.customerAddress,
                        //   employeeName: item.employeeName,
                        // })
                        setCheckColumn({ columnId: column.id });
                      }
                    }
                    setColumnList(undefined);
                  }}
                />
              </div>
            </div>
            {/* </Tippy> */}
          </div>
        )}
      </Draggable>
      {/* <ViewWorkModal
        idWork={idWork}
        onShow={showModalView}
        onHide={(reload) => {
          setShowModalView(false);
        }}
      /> */}
    </Fragment>
  );
}
