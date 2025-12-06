import React, { Fragment, useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import Icon from "components/icon";
import { ITaskItemProps } from "model/workOrder/PropsModel";
import OtherGenders from "assets/images/third-gender.png";
import "./TaskItem.scss";
import { formatCurrency, getDomain } from "reborn-util";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useNavigate } from "react-router-dom";
import Checkbox from "components/checkbox/checkbox";
import CustomerService from "services/CustomerService";
import TippyCustomerInfo from "./partials/TippyCustomerInfo";
import { showToast } from "utils/common";
import { CircularProgressbar } from "react-circular-progressbar";

export default function TaskItem(props: any) {
  const {
    item,
    index,
    column,
    setDataCustomer,
    setShowModalExchange,
    setShowModalPhone,
    setShowModalFace,
    setIsCollectInfoEform,
    setIsCollectVOC,
    setShowModalAddConsultationScheduleModal,
    customerIdlist,
    setCustomerIdList,
    opportunityIdList,
    setOpportunityIdList,
    checkColumn,
    setCheckColumn,
    setColumnList,
    setShowModalContactCampaign,
    setShowModalAddWork,
    viewDetailOpp,
    setIdManagementOpportunity,
    setShowModalAdd,
  } = props;

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

  const checkSubdomainTNTECO = sourceDomain.includes("tnteco");

  const navigate = useNavigate();
  const marginRight = 10;
  // const activities = column.activities ? JSON.parse(column.activities) : [];
  const lstCampaignActivity = column.lstCampaignActivity || [];
  const activities = lstCampaignActivity.map((item) => {
    return item.code;
  });
  const eform = column.lstCampaignActivity?.find((el) => el.code === "collectInfo") || null;

  const timeSLA = column.timeSLA;

  const updateTime = item.updatedTime;

  const distanceTime = new Date().getTime() - new Date(updateTime).getTime();

  // const checkTime = distanceTime - timeSLA;
  // console.log('checkTime',checkTime);

  const percentTime = timeSLA ? (distanceTime / timeSLA) * 100 : 0;
  console.log("percentTime", percentTime);

  // const [detailCustomer, setDetailCustomer] = useState(null);
  // const getDetailCustomer = async (customerId) => {

  //   const response = await CustomerService.detail(item.customerId);

  //   if (response.code === 0) {
  //     const result = response.result;
  //     console.log('result', result);

  //     // const detailData = {
  //     //   value: result.id,
  //     //   label: `${result.name} - ${result.phoneMasked}`,
  //     //   avatar: result.avatar,
  //     // };

  //     // setDetailCustomer(detailData);
  //   }

  // };

  // useEffect(() => {
  //   if(item?.customerId){
  //     getDetailCustomer(item.customerId)
  //   }

  // },[item])

  return (
    <Fragment>
      <Draggable
        key={item.id}
        draggableId={item.id.toString()}
        // isDragDisabled={item?.status === 2 || item?.status === 3 ? true : false}
        isDragDisabled={false}
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
            className="task__item--Pineline"
            onDoubleClick={() => {
              viewDetailOpp(item.campaignId, item.id);
              // setShowModalExchange(true);
              // setDataCustomer({
              //   name: item.customerName,
              //   id: item.customerId,
              //   phoneMasked: item.customerPhone,
              //   address: item.customerAddress,
              //   employeeName: item.employeeName,
              //   coyId: item.id
              // })
            }}
            onClick={(e) => {
              // console.log('Click');
              // setShowModalExchange(true)
              // setDataCustomer({
              //   name: item.customerName,
              //   id: item.customerId,
              //   phoneMasked: item.customerPhone,
              //   address: item.customerAddress,
              //   employeeName: item.employeeName,
              // })
            }}
          >
            {/* <Tippy 
              content={<TippyCustomerInfo detailCustomer={item}/>} 
              delay={[120, 100]} 
              animation="scale" 
              interactive={true}
            > */}

            <div className={`task-infomation `}>
              <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                <Tippy content={<TippyCustomerInfo detailCustomer={item} />} delay={[120, 100]} animation="scale" interactive={true}>
                  <div style={{ cursor: "pointer" }}>
                    <h4 className="title--job">{`${item.customerName}`}</h4>
                  </div>
                </Tippy>
                {column.id === "done" || column.id === "fail" ? (
                  <Tippy content={"Sửa cơ hội"} delay={[120, 100]} animation="scale" interactive={true}>
                    <div
                      style={{ cursor: "pointer", alignItems: "flex-start", display: "flex", marginTop: 3 }}
                      onClick={() => {
                        setIdManagementOpportunity(item.id);
                        setShowModalAdd(true);
                      }}
                    >
                      <Icon name="Pencil" style={{ width: 15, fill: "#1c8cff", cursor: "pointer" }} />
                    </div>
                  </Tippy>
                ) : null}
              </div>

              {item.saleName && (
                <div style={{ display: "flex" }}>
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <Icon name="Staff" style={{ width: 13, top: 0, fill: "#1c8cff", cursor: "pointer", marginTop: 6 }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: "500", marginLeft: 5 }}>{item.saleName}</span>
                  </div>
                </div>
              )}

              <div>
                <span style={{ fontSize: 12, fontWeight: "400" }}>
                  {item.expectedRevenue ? formatCurrency(item.expectedRevenue || 0) : "(Chưa đặt doanh số)"}
                </span>
              </div>

              <div style={{ marginBottom: 5, width: "100%", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: "400", width: "75%" }}>
                  {item.updatedTime ? moment(item.updatedTime).format("DD/MM/YYYY HH:mm") : ""}
                </span>
                <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
              </div>

              <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                <div style={{ display: "flex", width: "80%" }}>
                  {percentTime && percentTime > 80 && percentTime < 100 ? (
                    <Tippy content="Sắp hết thời gian SLA">
                      <div className="container-action">
                        <Icon name="Violation" style={{ width: 17, height: 17, fill: "orange", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  ) : null}

                  {percentTime && percentTime >= 100 ? (
                    <Tippy content="Đã hết thời gian SLA">
                      <div className="container-action">
                        <Icon name="Violation" style={{ width: 17, height: 17, fill: "red", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  ) : null}

                  <Tippy content="Thông tin trao đổi">
                    <div
                      className="container-action"
                      onClick={() => {
                        setShowModalExchange(true);
                        setDataCustomer({
                          name: item.customerName,
                          id: item.customerId,
                          phoneMasked: item.customerPhone,
                          address: item.customerAddress,
                          employeeName: item.employeeName,
                          coyId: item.id,
                        });
                      }}
                    >
                      <Icon name="Note" style={{ width: 15.5, height: 15.5, fill: "#1c8cff", cursor: "pointer" }} />
                    </div>
                  </Tippy>
                  <Tippy content="Tạo công việc">
                    <div
                      className="container-action"
                      onClick={() => {
                        setShowModalAddWork(true);
                        setDataCustomer({
                          name: item.customerName,
                          id: item.customerId,
                        });
                        setIdManagementOpportunity(item.id);
                      }}
                    >
                      <Icon name="CreateWork" style={{ width: 17, height: 17, fill: "#1c8cff", cursor: "pointer" }} />
                    </div>
                  </Tippy>

                  {activities.includes("collectInfo") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Thu thập thông tin">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            coyId: item.id,
                            approachId: item.approachId,
                            pipelineId: item.campaignId,
                            eformId: eform?.eformId,
                          });
                          setIsCollectInfoEform(true);
                        }}
                      >
                        <Icon name="CollectInfo" style={{ width: 15, height: 15, fill: "#1c8cff", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("voc") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Thu thập VOC">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            customerEmail: item.customerEmail,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            coyId: item.id,
                            approachId: item.approachId,
                          });
                          setIsCollectVOC(true);
                        }}
                      >
                        <Icon name="VOC" style={{ width: 16, height: 16, fill: "var(--primary-color)", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("call") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Gọi điện">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            coyId: item.id,
                            approachId: item.approachId,
                          });
                          setShowModalPhone(true);
                        }}
                      >
                        <Icon name="PhoneFill" style={{ width: 15, height: 15, fill: "#1c8cff", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("face") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Hẹn gặp">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            coyId: item.id,
                            approachId: item.approachId,
                          });
                          setShowModalFace(true);
                        }}
                      >
                        <Icon name="Meeting" style={{ width: 22, height: 22, fill: "var(--primary-color)", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("schedule") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Đặt lịch">
                      <div
                        className="container-action"
                        onClick={() => {
                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            coyId: item.id,
                            approachId: item.approachId,
                          });
                          setShowModalAddConsultationScheduleModal(true);
                        }}
                      >
                        <Icon name="Calendar" style={{ width: 20, height: 20, fill: "var(--primary-color)", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {activities.includes("contact") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                    <Tippy content="Đầu mối làm việc">
                      <div
                        className="container-action"
                        onClick={() => {
                          console.log("item", item);

                          setDataCustomer({
                            name: item.customerName,
                            id: item.customerId,
                            phoneMasked: item.customerPhone,
                            address: item.customerAddress,
                            employeeName: item.employeeName,
                            coyId: item.id,
                            approachId: item.approachId,
                          });
                          setShowModalContactCampaign(true);
                        }}
                      >
                        <Icon name="ContactCampaign" style={{ width: 20, height: 20, fill: "var(--primary-color)", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  )}

                  {column.id === "done" && !checkSubdomainTNTECO ? (
                    <Tippy content="Tạo đơn hàng">
                      <div
                        className="container-action"
                        onClick={() => {
                          navigate(`/create_sale_add?customerId=${item.customerId}&campaignId=${item.campaignId}`);
                        }}
                      >
                        <Icon name="Bill" style={{ width: 15, height: 15, fill: "var(--primary-text-color)", cursor: "pointer" }} />
                      </div>
                    </Tippy>
                  ) : null}

                  {column.id === "done" && (
                    <Tippy content="Tạo hợp đồng">
                      <div
                        className="container-action"
                        onClick={() => {
                          navigate(`/create_contract?customerId=${item.customerId}&campaignId=${item.campaignId}`, {
                            state: { opportunityId: item.id },
                          });
                        }}
                      >
                        <Icon
                          name="CreateContract"
                          style={{ marginRight: 3, width: 16, height: 16, fill: "var(--primary-text-color)", cursor: "pointer" }}
                        />
                      </div>
                    </Tippy>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 4 }}>
                  <Checkbox
                    checked={opportunityIdList.filter((el) => el.id === item.id).length > 0}
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
                        setOpportunityIdList((oldArray) => [
                          // ...oldArray,
                          {
                            id: item.id,
                            customerId: item.customerId,
                            customerName: item.customerName,
                            customerPhone: item.customerPhone,
                            customerEmail: item.customerEmail,
                            customerAddress: item.customerAddress,
                            employeeName: item.employeeName,
                            approachId: item.approachId,
                          },
                        ]);
                        setCheckColumn({ columnId: column.id });
                      } else {
                        if (checkColumn?.columnId === column.id) {
                          if (opportunityIdList.filter((el) => el.id === item.id).length > 0) {
                            const newArrayOpp = opportunityIdList.filter((el) => el.id !== item.id);
                            setOpportunityIdList(newArrayOpp);

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

                            setOpportunityIdList((oldArray) => [
                              ...oldArray,
                              {
                                id: item.id,
                                customerId: item.customerId,
                                customerName: item.customerName,
                                customerPhone: item.customerPhone,
                                customerEmail: item.customerEmail,
                                customerAddress: item.customerAddress,
                                employeeName: item.employeeName,
                                approachId: item.approachId,
                              },
                            ]);

                            // setOpportunityIdList((oldArray) => [...oldArray, {id: item.id, customerId: item.customerId}]);
                          }
                        } else if (checkColumn !== column.id) {
                          // setOpportunityIdList([{id: item.id, customerId: item.customerId}]);
                          setOpportunityIdList((oldArray) => [
                            {
                              id: item.id,
                              customerId: item.customerId,
                              customerName: item.customerName,
                              customerPhone: item.customerPhone,
                              customerEmail: item.customerEmail,
                              customerAddress: item.customerAddress,
                              employeeName: item.employeeName,
                              approachId: item.approachId,
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
