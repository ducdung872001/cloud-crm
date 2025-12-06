import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import WorkOrderService from "services/WorkOrderService";
import { showToast } from "utils/common";
import { IKanbanWorkProps } from "model/workOrder/PropsModel";
import { IUpdateStatusRequest } from "model/workOrder/WorkOrderRequestModel";
import SearchBox from "components/searchBox/searchBox";
import TaskItem from "./partials/TaskItem/TaskItem";
import SupportTaskModal from "./partials/SupportTaskModal/SupportTaskModal";
import "./Kanban.scss";
import ContractService from "services/ContractService";
import { ICampaignOpportunityRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import { ICampaignOpportunityResponseModel } from "model/campaignOpportunity/CampaignOpportunityResponseModel";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import AddChangeProbabilityModal from "../AddChanceProbabilityModal";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import AddCustomerInColumn from "./partials/AddCustomerInColumn/AddCustomerInColumn";
import { ICustomPlaceholderResponse } from "model/customPlaceholder/CustomPlaceholderResponseModel";
import AddPhoneModal from "pages/CallCenter/partials/AddPhoneModal";
import ContentMeetingModal from "../ContentMeetingModal/ContentMeetingModal";
import AddConsultationScheduleModal from "pages/CalendarCommon/partials/AddConsultationScheduleModal/AddConsultationScheduleModal";
import { formatCurrency } from "reborn-util";
import Checkbox from "components/checkbox/checkbox";
import AddCustomerEmailModal from "pages/CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerEmailList/partials/AddCustomerEmailModal";
import AddCustomerSMSModal from "pages/CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerSMSList/partials/AddCustomerSMSModal";
import AddCustomPlaceholderModal from "pages/CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerSMSList/partials/CustomPlaceholder/AddCustomPlaceholderModal";
import AddCustomPlaceholderSmsModal from "../PlaceholderSmsModal/AddCustomPlaceholderSmsModal";
import { useNavigate } from "react-router-dom";
import ExchangeFast from "./partials/ExchangeFast";
import SendEmailModal from "../SendEmailModal/SendEmailModal";
import ContactCampaignModal from "../ContactCampaignModal/ContactCampaignModal";
import CollectInfoModal from "../CollectInfoModal/CollectInfoModal";
import CollectVOC from "../CollectVOC/CollectVOC";
import AddWorkModal from "pages/MiddleWork/partials/ListWork/partials/AddWorkModal/AddWorkModal";

export default function Kanban(props: any) {
  const {
    data,
    kanbanTab,
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

    opportunityIdList,
    setOpportunityIdList,
    customerIdlist,
    setCustomerIdList,
    columnList,
    setColumnList,
    checkColumn,
    setCheckColumn,
    dataCustomerList,
    listConvertRate,
    viewDetailOpp,
    setIdManagementOpportunity,
    idManagementOpportunity,
    setShowModalAdd,
    pipelineId,
  } = props;

  const navigate = useNavigate();

  const marginRight = 12;
  const [columns, setColumns] = useState<any[]>([]);

  const [qualityColum, setQualityColumn] = useState(0);
  const [percentColumn, setPercentColumn] = useState(null);

  //phần trăm gợi ý khi kéo kan ban
  const [percentProp, setPercentProp] = useState(null);

  useEffect(() => {
    if (qualityColum) {
      const newPercent = (100 / qualityColum).toFixed(0);
      setPercentColumn(newPercent);
    }
  }, [qualityColum]);

  const [idEndPoint, setIdEndPoint] = useState<number>(null);
  const [stepEndPoint, setStepEndPoint] = useState<number>(null);

  const [status, setStatus] = useState(null);

  const [dataWork, setDataWork] = useState<ICampaignOpportunityResponseModel>(null);

  const [submitTask, setSubmitTask] = useState<boolean>(false);
  const [showModalSupport, setShowModalSupport] = useState<boolean>(false);
  const [showModalChanceProbability, setShowModalChanceProbability] = useState<boolean>(false);
  const [showModalAddWork, setShowModalAddWork] = useState(false);

  useEffect(() => {
    const resultData = listApproach.map((item) => {
      const convertRate =
        (listConvertRate &&
          listConvertRate.length > 0 &&
          listConvertRate.find((el) => el.approachId === item.value) &&
          listConvertRate.find((el) => el.approachId === item.value).convertRate) ||
        "";

      const slaConfig = item.slaConfig;
      const dayToSecond = (slaConfig?.day || 0) * 24 * 60 * 60 * 1000;
      const hourToSecond = (slaConfig?.hour || 0) * 60 * 60 * 1000;
      const minuteToSecond = (slaConfig?.minute || 0) * 60 * 1000;
      const timeSLA = dayToSecond + hourToSecond + minuteToSecond;

      //lấy ra danh sách các cơ hội thuộc quy trình này
      const newDataItemsApproach = (dataOfApproach?.length > 0 && dataOfApproach.find((element) => element.approachId === item.value)) || null;
      // const newDataItems = (dataOfApproach?.length > 0 && dataOfApproach.find((element) => element.approachId === item.value)?.value) || [];
      const newDataItems = newDataItemsApproach?.value || [];
      const newHasMore = newDataItemsApproach?.hasMore;
      const newPage = newDataItemsApproach?.page;
      //Lọc ra các cơ hội đang hoạt động
      const resultDataItems =
        newDataItems.length > 0 &&
        newDataItems.filter((element) => {
          return element.status !== 2 && element.status !== 4 && element.status !== null;
        });

      if (item.label) {
        return {
          id: item.value,
          title: item.label,
          color: item.color,
          // activities: item.activities,
          lstCampaignActivity: item.lstCampaignActivity,
          campaignId: item.campaignId,
          convertRate: convertRate,
          step: item.step,
          timeSLA: timeSLA,
          // items: data.filter((element) => {
          //   return element.approachId === item.value && element.status !== 2 && element.status !== 4 && element.status !== null;
          // }),
          items: resultDataItems || [],
          hasMore: newHasMore,
          page: newPage,
        };
      }
    });

    setQualityColumn(listApproach.length + 1);

    const result = resultData.filter((el) => el);

    if (result && result.length > 0) {
      result.unshift({
        id: null,
        title: "Chưa bắt đầu",
        color: "#177AD5",
        campaignId: listApproach[0]?.campaignId,
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
          campaignId: listApproach[0]?.campaignId,
          // items: data.filter((el) => {
          //   return el.status === 2;
          // }),
          items: dataSuccess?.items || [],
          hasMore: dataSuccess?.loadMoreAble,
          page: dataSuccess?.page,
        },
        {
          id: "fail",
          title: "Thất bại",
          color: "#ed0f0f",
          campaignId: listApproach[0]?.campaignId,
          // items: data.filter((el) => {
          //   return el.status === 4;
          // }),
          items: dataFail?.item || [],
          hasMore: dataStart?.loadMoreAble,
          page: dataStart?.page,
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

    //check xem bước tiếp theo có đầu mối làm việc không
    const destColumnActivity = destColumn?.lstCampaignActivity?.filter((el) => el.code === "contact");

    const startPoint = sourceColumn.id;
    const endPoint = destColumn.id;
    const endStep = destColumn.step;

    //? đoạn này check đk nếu như id của điểm đầu khác với id của điểm cuối
    //* thì lúc đó mới lấy giá trị điểm bắt đầu và điểm kết thúc
    if (startPoint !== endPoint) {
      if ((startPoint === null && endPoint === "done") || (startPoint === null && endPoint === "fail")) {
        if (endPoint === "done") {
          showToast("Chưa bắt đầu không được kéo sang thành công", "warning");
        } else if (endPoint === "fail") {
          showToast("Chưa bắt đầu không được kéo sang thất bại", "warning");
        }

        return;
      } else if (endPoint === "done") {
        const body = {
          coyId: dragItem.id,
          approachId: sourceColumn.id,
        };

        const response = await CampaignOpportunityService.opportunityCheck(body);

        if (response.code === 0) {
          const result = response.result;

          if (result.code === "email") {
            if (result.required === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa gửi Email cho khách hàng", "error");
            } else if (result.required === 1 && result.hasVoc === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
            }
          }

          if (result.code === "call") {
            if (result.required === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa gọi điện cho khách hàng", "error");
            } else if (result.required === 1 && result.hasVoc === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
            }
          }

          if (result.code === "sms") {
            if (result.required === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa gửi SMS cho khách hàng", "error");
            } else if (result.required === 1 && result.hasVoc === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
            }
          }

          if (result.code === "zalo") {
            if (result.required === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa gửi Zalo cho khách hàng", "error");
            } else if (result.required === 1 && result.hasVoc === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
            }
          }

          if (result.code === "face") {
            if (result.required === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa gặp khách hàng", "error");
            } else if (result.required === 1 && result.hasVoc === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
            }
          }

          if (result.code === "schedule") {
            if (result.required === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa đặt lịch cho khách hàng", "error");
            } else if (result.required === 1 && result.hasVoc === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
            }
          }
          if (result.code === "collectInfo") {
            if (result.required === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa thu thập thông tin khách hàng", "error");
            } else if (result.required === 1 && result.hasVoc === 0) {
              showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
            }
          }

          if (!result.code || result.code === "contact") {
            setShowModalChanceProbability(true);
            setIdEndPoint(dragItem.approachId);
            setStatus("2");
            return;
          }
          // showToast("Chuyển quy trình thành công", "success");
          onReload(true);
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }

        // setShowModalChanceProbability(true);
        // setIdEndPoint(dragItem.approachId);
        // setStatus('2')
      } else if (endPoint === "fail") {
        setShowModalChanceProbability(true);
        setIdEndPoint(dragItem.approachId);
        setStatus("4");
      } else if (endPoint === null) {
        setIdEndPoint(endPoint);
        handleUpdateStatusWork(endPoint, dragItem);
      } else {
        // setIdEndPoint(endPoint);
        // setShowModalChanceProbability(true);
        // setPercentProp(endStep * percentColumn)

        if (sourceColumn.id === null) {
          setIdEndPoint(endPoint);
          setShowModalChanceProbability(true);
          setPercentProp(endStep * percentColumn);
        } else {
          const body = {
            coyId: dragItem.id,
            approachId: sourceColumn.id,
          };

          const response = await CampaignOpportunityService.opportunityCheck(body);

          if (response.code === 0) {
            const result = response.result;
            if (result.code === "email") {
              if (result.required === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa gửi Email cho khách hàng", "error");
              } else if (result.required === 1 && result.hasVoc === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
              }
            }

            if (result.code === "call") {
              if (result.required === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa gọi điện cho khách hàng", "error");
              } else if (result.required === 1 && result.hasVoc === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
              }
            }

            if (result.code === "sms") {
              if (result.required === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa gửi SMS cho khách hàng", "error");
              } else if (result.required === 1 && result.hasVoc === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
              }
            }

            if (result.code === "zalo") {
              if (result.required === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa gửi Zalo cho khách hàng", "error");
              } else if (result.required === 1 && result.hasVoc === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
              }
            }

            if (result.code === "face") {
              if (result.required === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa gặp khách hàng", "error");
              } else if (result.required === 1 && result.hasVoc === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
              }
            }

            if (result.code === "schedule") {
              if (result.required === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa đặt lịch cho khách hàng", "error");
              } else if (result.required === 1 && result.hasVoc === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
              }
            }

            if (result.code === "collectInfo") {
              if (result.required === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa thu thập thông tin khách hàng", "error");
              } else if (result.required === 1 && result.hasVoc === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
              }
            }

            if (result.code === "voc") {
              if (result.required === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa thu thập VOC từ khách hàng", "error");
              } else if (result.required === 1 && result.hasVoc === 0) {
                showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
              }
            }

            // if(result.code === 'contact'){
            //     if(result.required === 0){
            //         showToast("Chưa cập nhật được quy trình vì chưa đặt lịch cho khách hàng", "error");
            //     } else if (result.required === 1 && result.hasVoc === 0){
            //         showToast("Chưa cập nhật được quy trình vì chưa nhận được đánh giá VOC", "error");
            //     }
            // }

            if (!result.code || result.code === "contact") {
              setIdEndPoint(endPoint);
              setStepEndPoint(endStep);
              if (destColumnActivity && destColumnActivity.length > 0 && destColumnActivity[0].required === 1) {
                setShowModalContactCampaign(true);
              } else {
                // setIdEndPoint(endPoint);
                setShowModalChanceProbability(true);
                setPercentProp(endStep * percentColumn);
              }
            }
            // showToast("Chuyển quy trình thành công", "success");
            onReload(true);
          } else {
            showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          }
        }
      }
    }

    // //TODO: đoạn này xử lý logic check đk kéo thả task ở đây

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

  const handleUpdateStatusWork = async (endPoint, dragItem) => {
    const body: ICampaignOpportunityRequestModel = {
      id: dragItem.id,
      employeeId: dragItem.employeeId,
      customerId: dragItem.customerId,
      sourceId: dragItem.sourceId,
      campaignId: dragItem.campaignId,
      refId: dragItem.refId,
      approachId: endPoint,
      expectedRevenue: dragItem.expectedRevenue,
      endDate: dragItem.endDate,
    };

    if (submitTask) {
      return;
    }
    const response = await CampaignOpportunityService.update(body);

    if (response.code === 0) {
      // showToast("Chuyển quy trình thành công", "success");
      onReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleUpdateStatusFail = async (dragItem) => {
    const body: ICampaignOpportunityRequestModel = {
      id: dragItem.id,
      employeeId: dragItem.employeeId,
      customerId: dragItem.customerId,
      sourceId: dragItem.sourceId,
      campaignId: dragItem.campaignId,
      refId: dragItem.refId,
      approachId: dragItem.approachId,
      expectedRevenue: dragItem.expectedRevenue,
      endDate: dragItem.endDate,
    };

    const response = await CampaignOpportunityService.update(body);

    if (response.code === 0) {
      // showToast("Cập nhật tiến trình bán thất bại", "error");
      onReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    const bodyStatus = {
      coyId: dataWork?.id,
      approachId: dragItem.approachId,
      note: "",
      percent: 0,
      status: dragItem.status,
    };

    const responseStatus = await CampaignOpportunityService.opportunityProcessUpdate(bodyStatus);

    if (responseStatus.code !== 0) {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    onReload(true);
  };
  //Đoạn này lấy giá trị rồi cập nhật API, đk cập nhập API là dataWork !== null
  // useEffect(() => {
  //     if (dataWork !== null) {
  //     handleUpdateStatusWork();
  //     }
  // }, [dataWork, idEndPoint, submitTask]);

  const [showAddInColumn, setShowAddInColumn] = useState<boolean>(false);
  const [dataColumn, setDataColumn] = useState(null);
  const [idOpportunity, setIdOpportunity] = useState(null);
  const addCustomerInColumn = (column) => {
    setDataColumn(column);
    setShowAddInColumn(true);
  };

  ///activities

  //email
  const [dataCustomer, setDataCustomer] = useState(null);

  const [showModalSendEmail, setShowModalSendEmail] = useState<boolean>(false);
  const [showModalPlaceholderEmail, setShowModalPlaceholderEmail] = useState<boolean>(false);
  const [codesEmail, setCodesEmail] = useState<ICustomPlaceholderResponse>(null);

  //sms
  const [showModalSendSms, setShowModalSendSms] = useState<boolean>(false);
  const [showModalPlaceholderSms, setShowModalPlaceholderSms] = useState<boolean>(false);
  const [codesSms, setCodesSms] = useState<ICustomPlaceholderResponse>(null);

  //call
  const [showModalPhone, setShowModalPhone] = useState<boolean>(false);

  //face
  const [showModalFace, setShowModalFace] = useState<boolean>(false);

  //schedule
  const [showModalAddConsultationScheduleModal, setShowModalAddConsultationScheduleModal] = useState<boolean>(false);

  //modal exchange
  const [showModalExchange, setShowModalExchange] = useState<boolean>(false);

  //kiểm tra khách hàng nào có email
  const checkEmail = dataCustomerList.filter((el) => el.emailMasked);
  const [listCustomerHasEmail, setListCustomerHasEmail] = useState([]);

  //Thu thập thông tin
  const [isCollectInfoEform, setIsCollectInfoEform] = useState(false);

  //Thu thập VOC
  const [isCollectVOC, setIsCollectVOC] = useState(false);

  useEffect(() => {
    const checkEmail = dataCustomerList.filter((el) => el.emailMasked);
    // const listCustomerHasEmail = checkEmail.map(item => {
    //     return item.id
    // })
    setListCustomerHasEmail(checkEmail);
  }, [dataCustomerList]);

  const [showModalSendEmailCampaign, setShowModalSendEmailCampaign] = useState(false);

  //Đầu mối làm việc
  const [showModalContactCampaign, setShowModalContactCampaign] = useState(false);

  const handleScroll = async (e, itemApproach) => {
    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && itemApproach.hasMore) {
      const param = {
        campaignId: itemApproach.campaignId,
        approachId: itemApproach.id,
        pipelineId: pipelineId,
        limit: 10,
        page: itemApproach.page + 1,
        saleId: params?.saleId || -1,
        customerId: params?.customerId || -1,
      };
      const response = kanbanTab === 1 ? await CampaignOpportunityService.list(param) : await CampaignOpportunityService.listViewSale(param);

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
        campaignId: itemApproach.campaignId,
        limit: 10,
        approachId: -1,
        pipelineId: pipelineId,
        status: status,
        page: itemApproach.page + 1,
        saleId: params?.saleId || -1,
        customerId: params?.customerId || -1,
      };
      const response = kanbanTab === 1 ? await CampaignOpportunityService.list(param) : await CampaignOpportunityService.listViewSale(param);

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
    <div className="wrapper-kanban-Pineline">
      {/* <div className="search__kanban">
                <SearchBox
                    name="Tên chiến dịch"
                    params={params}
                    isFilter={true}
                    listFilterItem={contractFilterList}
                    updateParams={(paramsNew) => setParams(paramsNew)}
                />
            </div> */}
      <div style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
        <Tippy content="Gửi email">
          <div>
            <Icon
              name="EmailFill"
              style={{
                width: 23,
                marginRight: 20,
                fill: customerIdlist.length > 0 && checkEmail.length > 0 ? "var(--primary-color)" : "#AAAAAA",
                cursor: "pointer",
              }}
              onClick={() => {
                if (customerIdlist.length > 0 && checkEmail.length > 0) {
                  setShowModalSendEmailCampaign(true);

                  // if(customerIdlist.length === 1){
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
              }}
            />
          </div>
        </Tippy>

        <Tippy content="Gửi SMS">
          <div>
            <Icon
              name="SMS"
              style={{
                width: 25,
                marginRight: 20,
                marginTop: 3,
                fill: customerIdlist.length > 0 ? "var(--primary-color)" : "#AAAAAA",
                cursor: "pointer",
              }}
              onClick={() => {
                if (customerIdlist.length > 0) {
                  if (customerIdlist.length === 1) {
                    setShowModalSendSms(true);
                  } else {
                    navigate(`/sms_marketting?customerIdlist=${customerIdlist}`);
                  }
                } else {
                  showToast("Vui lòng chọn khách hàng gửi SMS", "warning");
                }
              }}
            />
          </div>
        </Tippy>

        <Tippy content="Nhắn zalo">
          {customerIdlist.length > 0 ? (
            <div>
              <Icon
                name="Zalo"
                style={{ width: 30, marginRight: 20, cursor: "pointer" }}
                onClick={() => {
                  //
                }}
              />
            </div>
          ) : (
            <div>
              <Icon
                name="ZaloFill"
                style={{ width: 28.5, marginRight: 20, fill: "#AAAAAA", cursor: "pointer" }}
                onClick={() => {
                  showToast("Vui lòng chọn khách hàng gửi Zalo", "warning");
                }}
              />
            </div>
          )}
        </Tippy>

        <Tippy content="Gọi điện">
          <div>
            <Icon
              name="PhoneFill"
              style={{ width: 20, height: 20, fill: customerIdlist.length === 1 ? "#1c8cff" : "#AAAAAA", marginRight: 20, cursor: "pointer" }}
              onClick={() => {
                if (customerIdlist.length === 1) {
                  setShowModalPhone(true);
                } else {
                  showToast("Vui lòng chọn 1 khách hàng", "warning");
                }
              }}
            />
          </div>
        </Tippy>

        <Tippy content="Hẹn gặp">
          <div>
            <Icon
              name="Meeting"
              style={{ width: 32, marginRight: 20, fill: customerIdlist.length === 1 ? "var(--primary-color)" : "#AAAAAA", cursor: "pointer" }}
              onClick={() => {
                if (customerIdlist.length === 1) {
                  setShowModalFace(true);
                } else {
                  showToast("Vui lòng chọn 1 khách hàng", "warning");
                }
              }}
            />
          </div>
        </Tippy>

        <Tippy content="Đặt lịch">
          <div>
            <Icon
              name="Calendar"
              style={{ width: 29, marginRight: 20, fill: customerIdlist.length === 1 ? "var(--primary-color)" : "#AAAAAA", cursor: "pointer" }}
              onClick={() => {
                if (customerIdlist.length === 1) {
                  setShowModalAddConsultationScheduleModal(true);
                } else {
                  showToast("Vui lòng chọn 1 khách hàng", "warning");
                }
              }}
            />
          </div>
        </Tippy>

        <Tippy content="Tạo đơn hàng">
          <div>
            <Icon
              name="Bill"
              style={{
                marginRight: 20,
                width: 22,
                height: 22,
                fill: customerIdlist.length === 1 ? "var(--primary-text-color)" : "#AAAAAA",
                cursor: "pointer",
              }}
              onClick={() => {
                if (customerIdlist.length === 1) {
                  navigate(
                    `/create_sale_add?customerId=${dataCustomer ? dataCustomer.id : dataCustomerList[0]?.id}&campaignId=${data[0]?.campaignId}`
                  );
                } else {
                  showToast("Vui lòng chọn 1 khách hàng", "warning");
                }
              }}
            />
          </div>
        </Tippy>
      </div>
      <div style={{ overflow: "auto", minHeight: "25rem" }}>
        <div className="box__task--kanban" style={{ width: `${columns.length >= 5 ? `${columns.length * 210}px` : "100%"}`, marginBottom: "1.5rem" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {columns.map((column, idx) => {
              // const activities = column.activities ? JSON.parse(column.activities) : [];
              const lstCampaignActivity = column.lstCampaignActivity || [];
              const activities = lstCampaignActivity.map((item) => {
                return item.code;
              });

              let sumMoney = 0;
              if (column.items && column.items.length > 0) {
                column.items.map((el) => {
                  sumMoney += el.expectedRevenue;
                });
              }

              return (
                column && (
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
                            <div>
                              {column.convertRate ? (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span className="title-task" style={{ color: "white", width: "65%" }}>
                                    {column.title}
                                  </span>
                                  <Tippy content={"Tỉ lệ chuyển đổi"} delay={[120, 100]} animation="scale" interactive={true}>
                                    <div>
                                      <span style={{ fontSize: 13, fontWeight: "400", color: "white", cursor: "pointer" }}>
                                        {column.convertRate.toFixed(1)}%
                                      </span>
                                    </div>
                                  </Tippy>
                                </div>
                              ) : (
                                <span
                                  className="title-task"
                                  style={{
                                    // backgroundColor: column.id === 'done' || column.id === 'fail' ? column.color : '',
                                    // backgroundColor:'#AEEEEE',
                                    // color: column.colorText
                                    color: "white",
                                  }}
                                >
                                  {column.title}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="title-task-1">
                                {sumMoney ? formatCurrency(sumMoney) : "0đ"} •{" "}
                                <span style={{ fontSize: 13, fontWeight: "400" }}>{column.items?.length} KH</span>
                              </span>
                            </div>

                            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                              <div style={{ display: "flex" }}>
                                {/* {activities.includes("contact") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                                  <Tippy
                                    content="Đầu mối làm việc"
                                    // disabled={checkColumn?.columnId === column.id ? false : true}
                                  >
                                    <div>
                                      <Icon
                                        name="ContactCampaign"
                                        style={{
                                          width: 18,
                                          marginRight: marginRight,
                                          // fill: checkColumn?.columnId === column.id && checkEmail.length > 0 ? 'white' : '#AAAAAA',
                                          fill: "white",
                                          cursor: "pointer",
                                        }}
                                        // onClick={() => {
                                        //     if (checkColumn?.columnId === column.id) {
                                        //         if (customerIdlist.length > 0 && checkEmail.length > 0) {
                                        //             setShowModalSendEmailCampaign(true);
                                        //         } else {
                                        //             showToast("Vui lòng chọn khách hàng gửi email", "warning");
                                        //         }
                                        //     } else {
                                        //         showToast("Vui lòng chọn khách hàng gửi email", "warning");
                                        //     }
                                        // }}
                                      />
                                    </div>
                                  </Tippy>
                                )} */}

                                {activities.includes("email") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                                  <Tippy
                                    content="Gửi email"
                                    // disabled={checkColumn?.columnId === column.id ? false : true}
                                  >
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
                                            if (customerIdlist.length > 0) {
                                              if (checkEmail.length > 0) {
                                                setShowModalSendEmailCampaign(true);
                                              } else {
                                                showToast("Khách hàng chưa có Email", "warning");
                                              }

                                              // if(customerIdlist.length === 1){
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

                                {/* {activities.includes("voc") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                                  <Tippy
                                    content="Thu thập VOC"
                                    // disabled={checkColumn?.columnId === column.id ? false : true}
                                  >
                                    <div>
                                      <Icon
                                        name="VOC"
                                        style={{
                                          width: 17,
                                          marginRight: marginRight,
                                          fill: checkColumn?.columnId === column.id && checkEmail.length > 0 ? "white" : "#AAAAAA",
                                          cursor: "pointer",
                                        }}
                                        onClick={() => {
                                          if (checkColumn?.columnId === column.id) {
                                            if (customerIdlist.length > 0) {
                                              setIsCollectVOC(true);
                                            
                                            } else {
                                              showToast("Vui lòng chọn khách hàng cần thu thập VOC", "warning");
                                            }
                                          } else {
                                            showToast("Vui lòng chọn khách hàng cần thu thập VOC", "warning");
                                          }
                                        }}
                                      />
                                    </div>
                                  </Tippy>
                                )} */}

                                {activities.includes("sms") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                                  <Tippy content="Gửi SMS">
                                    <div>
                                      <Icon
                                        name="SMS"
                                        style={{
                                          width: 18,
                                          marginRight: marginRight,
                                          marginTop: 3,
                                          fill: checkColumn?.columnId === column.id ? "white" : "#AAAAAA",
                                          cursor: "pointer",
                                        }}
                                        onClick={() => {
                                          if (checkColumn?.columnId === column.id) {
                                            if (customerIdlist.length > 0) {
                                              if (customerIdlist.length === 1) {
                                                setShowModalSendSms(true);
                                              } else {
                                                navigate(`/sms_marketting?customerIdlist=${customerIdlist}`);
                                              }
                                            } else {
                                              showToast("Vui lòng chọn khách hàng gửi SMS", "warning");
                                            }
                                          } else {
                                            showToast("Vui lòng chọn khách hàng gửi sms", "warning");
                                          }
                                        }}
                                      />
                                    </div>
                                  </Tippy>
                                )}

                                {/* <Icon name="PhoneFill" style={{ width: 14, height: 14, fill: '#1c8cff', marginRight: 12, cursor: 'pointer' }} /> */}

                                {/* {activities.includes('face') && column.id !== null && column.id !== 'done' && column.id !== 'fail' &&
                                                          <Tippy content="Hẹn gặp">
                                                              <div>
                                                                  <Icon name="Meeting" style={{ width: 20,marginRight: marginRight, fill: 'var(--primary-color)', cursor: 'pointer' }} />
                                                              </div>
                                                          </Tippy>
                                                      } */}

                                {activities.includes("zalo") && column.id !== null && column.id !== "done" && column.id !== "fail" && (
                                  <Tippy content="Nhắn zalo">
                                    {checkColumn?.columnId === column.id ? (
                                      <div>
                                        <Icon name="Zalo" style={{ width: 21, marginRight: marginRight, cursor: "pointer" }} />
                                      </div>
                                    ) : (
                                      <div>
                                        <Icon name="ZaloFill" style={{ width: 20, marginRight: marginRight, fill: "#AAAAAA", cursor: "pointer" }} />
                                      </div>
                                    )}
                                  </Tippy>
                                )}

                                {/* {activities.includes('schedule') && column.id !== null && column.id !== 'done' && column.id !== 'fail' &&
                                                          <Tippy content="Đặt lịch">
                                                              <div>
                                                                  <Icon name="Calendar" style={{width: 18, marginRight: marginRight, fill: 'var(--primary-color)', cursor: 'pointer' }} />
                                                              </div>
                                                          </Tippy>
                                                      } */}

                                {/* {column.id === 'done' &&
                                                          <Tippy content="Tạo đơn hàng">
                                                              <div>
                                                                  <Icon name="Bill" style={{ marginRight: 3, width: 14, height: 14, fill: 'var(--primary-text-color)', cursor: 'pointer' }} />
                                                              </div>
                                                          </Tippy>
                                                      } */}
                              </div>

                              <div style={{ display: "flex" }}>
                                <Checkbox
                                  checked={columnList === column.id}
                                  label=""
                                  onChange={(e) => {
                                    if (columnList === column.id) {
                                      setColumnList(undefined);
                                      setOpportunityIdList([]);
                                      setCheckColumn(null);
                                    } else {
                                      setColumnList(column.id);
                                      setCheckColumn({ columnId: column.id });

                                      if (column.items && column.items.length > 0) {
                                        const newArray = [];
                                        column.items.map((item) => {
                                          newArray.push({
                                            id: item.id,
                                            customerId: item.customerId,
                                            customerName: item.customerName,
                                            customerPhone: item.customerPhone,
                                            customerAddress: item.customerAddress,
                                            employeeName: item.employeeName,
                                          });
                                        });
                                        setOpportunityIdList(newArray);
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </div>

                            {/* <span className="total-task">{column.items?.length}</span> */}
                          </div>

                          {column.id === "done" || column.id === "fail" ? null : (
                            <Tippy content="Thêm mới cơ hội">
                              <div className="button-add-customer" onClick={() => addCustomerInColumn(column)}>
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
                              } else if (column.id === "done") {
                                handleScrollSpecial(e, column, 2);
                              } else if (column.id === "fail") {
                                handleScrollSpecial(e, column, 4);
                              } else {
                                handleScroll(e, column);
                              }
                            }}
                          >
                            {column?.items?.map((item, idx) => {
                              return (
                                item.customerName && (
                                  <TaskItem
                                    key={idx}
                                    item={item}
                                    index={idx}
                                    column={column}
                                    setDataCustomer={setDataCustomer}
                                    setShowModalExchange={setShowModalExchange}
                                    setShowModalAddWork={setShowModalAddWork}
                                    setShowModalPhone={setShowModalPhone}
                                    setShowModalFace={setShowModalFace}
                                    setIsCollectInfoEform={setIsCollectInfoEform}
                                    setIsCollectVOC={setIsCollectVOC}
                                    setShowModalAddConsultationScheduleModal={setShowModalAddConsultationScheduleModal}
                                    customerIdlist={customerIdlist}
                                    setCustomerIdList={setCustomerIdList}
                                    opportunityIdList={opportunityIdList}
                                    setOpportunityIdList={setOpportunityIdList}
                                    checkColumn={checkColumn}
                                    setCheckColumn={setCheckColumn}
                                    setColumnList={setColumnList}
                                    setShowModalContactCampaign={setShowModalContactCampaign}
                                    viewDetailOpp={viewDetailOpp}
                                    setIdManagementOpportunity={setIdManagementOpportunity}
                                    idManagementOpportunity={idManagementOpportunity}
                                    setShowModalAdd={setShowModalAdd}
                                  />
                                )
                              );
                            })}
                          </div>
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                )
              );
            })}
          </DragDropContext>
        </div>
      </div>
      {/* <SupportTaskModal onShow={showModalSupport} onHide={() => setShowModalSupport(false)} /> */}

      <AddChangeProbabilityModal
        onShow={showModalChanceProbability}
        idCampaign={dataWork?.campaignId}
        idData={dataWork?.id}
        idApproach={idEndPoint}
        status={status}
        dataWork={dataWork}
        qualityColum={qualityColum}
        percentProp={percentProp}
        // updateApproach = {() =>handleUpdateStatusWork(idEndPoint, dataWork)}
        onHide={(reload) => {
          onReload(true);
          // if (reload) {
          //     onReload(true)
          // } else {
          //     // handleUpdateStatusFail(dataWork);
          // }
          setShowModalChanceProbability(false);
          setStatus(null);
          setPercentProp(null);
        }}
      />

      <AddCustomerInColumn
        onShow={showAddInColumn}
        idData={idOpportunity}
        dataColumn={dataColumn}
        onHide={(reload) => {
          if (reload) {
            onReload(true);
          }
          setShowAddInColumn(false);
          setDataColumn(null);
        }}
      />

      <AddPhoneModal
        onShow={showModalPhone}
        // dataCustomer={dataCustomer}
        dataCustomer={dataCustomer ? dataCustomer : dataCustomerList[0] || null}
        onHide={() => {
          setShowModalPhone(false);
          setDataCustomer(null);
        }}
      />

      {dataCustomer && showModalExchange && (
        <ExchangeFast
          dataCustomer={dataCustomer}
          onHide={() => {
            setDataCustomer(null);
            setShowModalExchange(false);
          }}
        />
      )}
      {/* <CommentModal
                onShow={showModalExchange} 
                dataCustomer={dataCustomer} 
                // dataCustomer = {dataCustomer ? dataCustomer : (dataCustomerList[0] || null)}
                onHide={() => {
                    setShowModalExchange(false);
                    setDataCustomer(null);
                }} 
            /> */}
      <ContentMeetingModal
        onShow={showModalFace}
        dataCustomer={dataCustomer ? dataCustomer : dataCustomerList[0] || null}
        // dataCustomer={dataCustomer}
        onHide={() => {
          setShowModalFace(false);
          setDataCustomer(null);
        }}
      />

      <AddConsultationScheduleModal
        onShow={showModalAddConsultationScheduleModal}
        idData={null}
        idCustomer={dataCustomer ? dataCustomer?.id : dataCustomerList[0]?.id}
        dataOpp={dataCustomer}
        // idCustomer={dataCustomer?.id}
        startDate={new Date()}
        endDate={new Date(new Date().setMinutes(new Date().getMinutes() + 10))}
        onHide={(reload) => {
          if (reload) {
            // getListSchedule(params);
          }
          setShowModalAddConsultationScheduleModal(false);
          setDataCustomer(null);
        }}
      />

      <AddCustomerEmailModal
        onShow={showModalSendEmail}
        dataCustomer={dataCustomer ? dataCustomer : dataCustomerList[0] || null}
        // dataCustomer={dataCustomer}
        callback={(codes: ICustomPlaceholderResponse) => {
          setCodesEmail(codes);
          setShowModalPlaceholderEmail(true);
        }}
        onHide={(reload) => {
          if (reload) {
            // getListCustomerEmail(params);
            setCustomerIdList([]);
            setOpportunityIdList([]);
            setDataCustomer(null);
          }
          setShowModalSendEmail(false);
        }}
      />

      <AddCustomerSMSModal
        onShow={showModalSendSms}
        idCustomer={dataCustomer ? dataCustomer?.id : dataCustomerList[0]?.id}
        // idCustomer={dataCustomer?.id}
        callback={(codes: ICustomPlaceholderResponse) => {
          setCodesSms(codes);
          setShowModalPlaceholderSms(true);
        }}
        onHide={(reload) => {
          if (reload) {
            // getListCustomerSMS(params);
            setCustomerIdList([]);
            setOpportunityIdList([]);
            setDataCustomer(null);
          }

          setShowModalSendSms(false);
        }}
      />

      <AddCustomPlaceholderModal
        onShow={showModalPlaceholderEmail}
        data={codesEmail}
        onHide={(reload) => {
          // if (reload) {
          //   getListCustomerSMS(params);
          // }
          setShowModalPlaceholderEmail(false);
        }}
      />

      <AddCustomPlaceholderSmsModal
        onShow={showModalPlaceholderSms}
        data={codesSms}
        onHide={(reload) => {
          // if (reload) {
          //   getListCustomerSMS(params);
          // }
          setShowModalPlaceholderSms(false);
        }}
      />

      <SendEmailModal
        onShow={showModalSendEmailCampaign}
        idCampaign={params?.campaignId}
        customerIdlist={listCustomerHasEmail}
        onHide={(reload) => {
          onReload(true);
          // if (reload) {
          //     onReload(true)
          // } else {
          //     // handleUpdateStatusFail(dataWork);
          // }
          setShowModalSendEmailCampaign(false);
          setOpportunityIdList([]);
          // setListCustomerHasEmail([]);
        }}
      />
      <AddWorkModal
        type="opportunity"
        isShowProject={true}
        disableOpportunity={true}
        onShow={showModalAddWork}
        customerId={dataCustomer?.id}
        customerName={dataCustomer?.name}
        idManagement={idManagementOpportunity}
        onHide={(reload) => {
          setShowModalAddWork(false);
          setDataCustomer(null);
        }}
      />

      <ContactCampaignModal
        onShow={showModalContactCampaign}
        dataCustomer={dataCustomer}
        idApproach={idEndPoint}
        dataCoy={dataWork}
        onHide={(reload) => {
          if (reload) {
            onReload(true);
            setShowModalChanceProbability(true);
            setPercentProp(stepEndPoint * percentColumn);
          }
          setShowModalContactCampaign(false);
          setDataCustomer(null);
          setIdEndPoint(null);
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

      <CollectVOC
        onShow={isCollectVOC}
        data={dataCustomer}
        // checkEmail={checkEmail}
        onHide={(reload, type) => {
          if (reload) {
            if (type === "email") {
              setShowModalSendEmailCampaign(true);
              setOpportunityIdList((oldArray) => [
                // ...oldArray,
                {
                  id: dataCustomer.coyId,
                  customerId: dataCustomer.id,
                  customerName: dataCustomer.name,
                  customerPhone: dataCustomer.phoneMasked,
                  customerEmail: dataCustomer.customerEmail,
                  customerAddress: dataCustomer.address,
                  employeeName: dataCustomer.employeeName,
                  approachId: dataCustomer.approachId,
                },
              ]);
            }
          }
          setIsCollectVOC(false);
        }}
      />
    </div>
  );
}
