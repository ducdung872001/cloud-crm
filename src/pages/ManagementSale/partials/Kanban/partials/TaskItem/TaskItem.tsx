import React, { Fragment, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import { ITaskItemProps } from "model/workOrder/PropsModel";
import OtherGenders from "assets/images/third-gender.png";
import "./TaskItem.scss";
import Checkbox from "components/checkbox/checkbox";
import Tippy from "@tippyjs/react";
import TippyInvoiceInfo from "./partials/TippyInvoiceInfo";
import { formatCurrency } from "reborn-util";
import moment from "moment";

export default function TaskItem(props: any) {
  const { item, 
          index, 
          column,
          setDataCustomer, 

          customerIdlist,
          setCustomerIdList,
          invoiceIdList,
          setInvoiceIdList,
          checkColumn,
          setCheckColumn,
          setColumnList,

          setShowModalExchange,
          setIsCollectInfoEform,
          setIsUploadAttachment,
          setModalAddTicket,
          setModalAddWarranty,
          setShowModalViewInvoice

        } = props;

  const lstSaleflowActivity = column.lstSaleflowActivity || [];
  const activities = lstSaleflowActivity.map(item => {
      return item.code
  })

  const eform = column.lstSaleflowActivity?.find(el => el.code === "delivery_info") || null
  
  return (
    <Fragment>
      <Draggable
        key={item.id}
        draggableId={item.id.toString()}
        isDragDisabled={item?.status === 1 ? true : false}
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
              <div className={`task-infomation ${item?.status === 1  ? "disabled__task--item" : ""}`}>
              {/* <div className={`task-infomation`}> */}
                <h4 className="title--job">{item.invoiceResponse?.invoiceCode || ''}</h4>
                <Tippy 
                  content={<TippyInvoiceInfo detailCustomer={item}/>} 
                  delay={[120, 100]} 
                  animation="scale" 
                //   interactive={true}
                >
                  <div style={{display:'flex', cursor:'pointer'}}>
                    <div style={{}}>
                      <Icon 
                        name="Person" 
                        style={{ width: 13, top: 0,fill: '#1c8cff', cursor: 'pointer' }} 
                      />
                    </div>
                    <div>
                      <span style={{fontSize: 12, fontWeight:'500', marginLeft: 5}}>{item.customerName}</span>
                    </div>
                  </div>
                </Tippy>

                <div>
                    <span style={{fontSize: 12, fontWeight:'400'}}>Tổng tiền: {formatCurrency(item.invoiceResponse?.fee || 0)}</span>
                </div>

                <div>
                    <span style={{fontSize: 12, fontWeight:'400'}}>Ngày bán: {item.invoiceResponse?.receiptDate ? moment(item.invoiceResponse?.receiptDate).format('DD/MM/YYYY') : ''}</span>
                </div>

                <div style={{display:'flex', alignItems:'center', width:'100%', justifyContent:'space-between'}}>
                  <div style={{display:'flex',  width:'80%'}}>

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

                    {activities.includes("create_export") && column.id !== null && column.id !== 'done' && column.id !== 'fail' &&
                        <Tippy content="Tạo phiếu xuất kho">
                            <div className="container-action"
                              onClick = {() => {
                                setDataCustomer({
                                  name: item.customerName,
                                  id: item.customerId,
                                  phoneMasked: item.customerPhone,
                                  address: item.customerAddress,
                                  employeeName: item.employeeName,
                                  invoiceId: item.invoiceId,
                                  sieId: item.id,
                                  approachId: item.approachId,
                                  saleflowId: item.saleflowId,
                                  eformId: eform?.eformId

                                })
                                setShowModalViewInvoice(true);
                              }}
                            >
                                <Icon 
                                  name="Download" 
                                  style={{ width: 16, height: 16,  fill: '#1c8cff', cursor: 'pointer' }} 
                                />
                            </div>
                        </Tippy>
                    } 

                    {activities.includes("delivery_info") && column.id !== null && column.id !== 'done' && column.id !== 'fail' &&
                      <Tippy content="Nhập thông tin giao vận">
                          <div className="container-action"
                            onClick = {() => {
                              setDataCustomer({
                                name: item.customerName,
                                id: item.customerId,
                                phoneMasked: item.customerPhone,
                                address: item.customerAddress,
                                employeeName: item.employeeName,
                                invoiceId: item.invoiceId,
                                sieId: item.id,
                                approachId: item.approachId,
                                saleflowId: item.saleflowId,
                                eformId: eform?.eformId
                              })
                              setIsCollectInfoEform(true)
                            }}
                          >
                              <Icon 
                                name="CollectInfo" 
                                style={{ width: 15, height: 15,  fill: '#1c8cff', cursor: 'pointer' }} 
                              />
                          </div>
                      </Tippy>
                    }

                    {
                        ((activities.includes("create_ticket") && column.id !== null && column.id !== 'done' && column.id !== 'fail') || column.id === 'done') &&
                        <Tippy content="Tạo phiếu hỗ trợ">
                            <div className="container-action"
                                onClick = {() => {
                                setDataCustomer({
                                    name: item.customerName,
                                    id: item.customerId,
                                    phoneMasked: item.customerPhone,
                                    address: item.customerAddress,
                                    employeeName: item.employeeName,
                                    invoiceId: item.invoiceId,
                                    sieId: item.id,
                                    approachId: item.approachId,
                                    saleflowId: item.saleflowId,
                                    eformId: eform?.eformId
                                })
                                setModalAddTicket(true)
                                }}
                            >
                                <Icon 
                                    name="ReceiveTicket" 
                                    style={{ width: 15, height: 15,  fill: '#1c8cff', cursor: 'pointer' }} 
                                />
                            </div>
                        </Tippy>
                    }

                    {
                        ((activities.includes("create_warranty") && column.id !== null && column.id !== 'done' && column.id !== 'fail') ||  column.id === 'done') &&
                        <Tippy content="Tạo phiếu bảo hành">
                            <div className="container-action"
                                onClick = {() => {
                                setDataCustomer({
                                    name: item.customerName,
                                    id: item.customerId,
                                    phoneMasked: item.customerPhone,
                                    address: item.customerAddress,
                                    employeeName: item.employeeName,
                                    invoiceId: item.invoiceId,
                                    sieId: item.id,
                                    approachId: item.approachId,
                                    saleflowId: item.saleflowId,
                                    eformId: eform?.eformId
                                })
                                setModalAddWarranty(true)
                                }}
                            >
                                <Icon 
                                    name="ReceiveWarranty" 
                                    style={{ width: 15, height: 15,  fill: '#1c8cff', cursor: 'pointer' }} 
                                />
                            </div>
                        </Tippy>
                    }
                      
                  </div>

                  {/* <Checkbox
                    checked={invoiceIdList.filter(el => el.id === item.id).length > 0}
                    label=''
                    onChange={(e) => {
                      if(!checkColumn){
                    
                          setInvoiceIdList((oldArray) => [
                                                              // ...oldArray, 
                                                              {
                                                                id: item.id, 
                                                                customerId: item.customerId,
                                                                customerName: item.customerName,
                                                                customerPhone: item.customerPhone,
                                                                customerEmail: item.customerEmail,
                                                                customerAddress: item.customerAddress,
                                                                employeeName: item.employeeName,
                                                              }
                                                            ]);
                          setCheckColumn({columnId: column.id})

                      } else {
                        if(checkColumn?.columnId === column.id){
                          if(invoiceIdList.filter(el => el.id === item.id).length > 0){
                            const newArrayOpp = invoiceIdList.filter(el => el.id !== item.id);
                            setInvoiceIdList(newArrayOpp);

                            if(newArrayOpp.length === 0){
                              setCheckColumn(null)
                              setDataCustomer(null);
                            }
                          } else {
                            if(customerIdlist.length === 0){
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

                            setInvoiceIdList((oldArray) => [
                              ...oldArray, 
                              {
                                id: item.id, 
                                customerId: item.customerId,
                                customerName: item.customerName,
                                customerPhone: item.customerPhone,
                                customerEmail: item.customerEmail,
                                customerAddress: item.customerAddress,
                                employeeName: item.employeeName
                              }
                            ]);
                            
                            // setOpportunityIdList((oldArray) => [...oldArray, {id: item.id, customerId: item.customerId}]);   
                          }

                        } else if(checkColumn !== column.id){

                          // setOpportunityIdList([{id: item.id, customerId: item.customerId}]); 
                          setInvoiceIdList((oldArray) => [
                            {
                              id: item.id, 
                              customerId: item.customerId,
                              customerName: item.customerName,
                              customerPhone: item.customerPhone,
                              customerEmail: item.customerEmail,
                              customerAddress: item.customerAddress,
                              employeeName: item.employeeName
                            }
                          ]);
                          // setDataCustomer({
                          //   name: item.customerName,
                          //   id: item.customerId,
                          //   phoneMasked: item.customerPhone,
                          //   address: item.customerAddress,
                          //   employeeName: item.employeeName,
                          // })
                          setCheckColumn({columnId: column.id}) 

                        }
                      }
                      setColumnList(undefined)
                      
                    }} 
                  /> */}
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
