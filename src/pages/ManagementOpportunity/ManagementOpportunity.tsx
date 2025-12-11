import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _, { last, set } from "lodash";
import Tippy from "@tippyjs/react";
import moment from "moment";
import { isDifferenceObj, formatCurrency, getPageOffset, getSearchParameters, trimContent } from "reborn-util";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { ICampaignOpportunityFilterRequest } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import { ICampaignOpportunityResponseModel } from "model/campaignOpportunity/CampaignOpportunityResponseModel";
import { showToast } from "utils/common";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import AddManagementOpportunityModal from "./partials/AddManagementOpportunityModal";
import AddChangeProbabilityModal from "./partials/AddChanceProbabilityModal";
import DetailManagementOpportunity from "./partials/DetailManagementOpportunity";
import "./ManagementOpportunity.scss";
import { SelectOptionData } from "utils/selectCommon";
import CampaignApproachService from "services/CampaignApproachService";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Grid } from "swiper";
import { useWindowDimensions } from "utils/hookCustom";
import Kanban from "./partials/Kanban/Kanban";
import { ICampaignApproachFilterRequest } from "model/campaignApproach/CampaignApproachRequestModel";
import { ICustomPlaceholderResponse } from "model/customPlaceholder/CustomPlaceholderResponseModel";
import AddCustomerEmailModal from "pages/CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerEmailList/partials/AddCustomerEmailModal";
import AddCustomerSMSModal from "pages/CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerSMSList/partials/AddCustomerSMSModal";
import AddCustomPlaceholderModal from "pages/CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerEmailList/partials/CustomPlaceholder/AddCustomPlaceholderModal";
import AddCustomPlaceholderSmsModal from "./partials/PlaceholderSmsModal/AddCustomPlaceholderSmsModal";
import AddPhoneModal from "pages/CallCenter/partials/AddPhoneModal";
import ContentMeetingModal from "./partials/ContentMeetingModal/ContentMeetingModal";
import AddConsultationScheduleModal from "pages/CalendarCommon/partials/AddConsultationScheduleModal/AddConsultationScheduleModal";
import { ICampaignFilterRequest } from "model/campaign/CampaignRequestModel";
import CampaignService from "services/CampaignService";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import SelectCustom from "components/selectCustom/selectCustom";
import AddOpportunityAllocation from "./partials/AddOpportunityAllocation";
import KanbanCompany from "./partials/KanbanCompany/KanbanCompany";
import { ContextType, UserContext } from "contexts/userContext";
import CampaignPipelineService from "services/CampaignPipelineService";
import ImageThirdGender from "assets/images/third-gender.png";
import ReportOpportunity from "pages/OpportunityList/partials/ReportOpportunity";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import CustomerService from "services/CustomerService";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import SelectTree from "components/selectTree/selectTree";

export default function ManagementOpportunity() {
  document.title = "Chăm sóc cơ hội";
  const { name, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const navigate = useNavigate();
  const checkIsKanban = localStorage.getItem("isKanbanCampaign");
  const checkKanbanTab = localStorage.getItem("kanbanTabOpportunity");
  const checkCampaignId = localStorage.getItem("campaignId");

  const checkCampaignName = localStorage.getItem("campaignName");

  const checkCampaignType = localStorage.getItem("campaignType");

  const isMounted = useRef(false);
  const swiperPipelineRef = useRef(null);
  const swiperRelationshipRef = useRef(null);
  const { width } = useWindowDimensions();

  const [searchParams, setSearchParams] = useSearchParams();
  const [listManagementOpportunity, setListManagementOpportunity] = useState<ICampaignOpportunityResponseModel[]>([]);

  const [idManagementOpportunity, setIdManagementOpportunity] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [idCampaign, setIdCampaign] = useState<number>(null);
  const [isDetailManagementOpportunity, setIsDetailManagementOpportunity] = useState<boolean>(false);
  const [showModalChanceProbability, setShowModalChanceProbability] = useState<boolean>(false);

  // const [params, setParams] = useState<ICampaignOpportunityFilterRequest>({
  //   name: "",
  // });

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

  const colorData = [
    "#E98E4C",
    "#ED6665",
    "#FFBF00",
    "#9966CC",
    "#6A5ACD",
    "#007FFF",
    "#993300",
    "#F0DC82",
    "#CC5500",
    "#C41E3A",
    "#ACE1AF",
    "#7FFF00",
    "#FF7F50",
    "#BEBEBE",
    "#FF00FF",
    "#C3CDE6",
    "#FFFF00",
    "#40826D",
    "#704214",
  ];

  const takeParamsUrl = getSearchParameters();
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(checkIsKanban ? JSON.parse(checkIsKanban) : false);
  useEffect(() => {
    localStorage.setItem("isKanbanCampaign", JSON.stringify(isRegimeKanban));
  }, [isRegimeKanban]);

  const [kanbanTab, setKanbanTab] = useState(checkKanbanTab ? JSON.parse(checkKanbanTab) : 1);
  useEffect(() => {
    localStorage.setItem("kanbanTabOpportunity", JSON.stringify(kanbanTab));
  }, [kanbanTab]);

  const [listCampaign, setListCampaign] = useState<IOption[]>([]);
  const [listPipeline, setListPipeline] = useState([]);

  const [listApproach, setListApproach] = useState([]);

  const [listConvertRate, setListConvertList] = useState([]);

  // const [contractType, setContractType] = useState<number>(() => {
  //   return takeParamsUrl?.campaignId ? takeParamsUrl?.campaignId : -1;
  //   // return -1;
  // });

  const [contractType, setContractType] = useState(checkCampaignId ? JSON.parse(checkCampaignId) : -1);

  useEffect(() => {
    localStorage.setItem("campaignId", JSON.stringify(contractType));
  }, [contractType]);

  const [campaignName, setCampaignName] = useState<string>(checkCampaignName ? checkCampaignName : "Tất cả chiến dịch");

  useEffect(() => {
    localStorage.setItem("campaignName", campaignName);
  }, [campaignName]);

  const [campaignType, setCampaignType] = useState<string>(checkCampaignType ? checkCampaignType : null);

  useEffect(() => {
    localStorage.setItem("campaignType", campaignType);
  }, [campaignType]);

  const [pipelineId, setPipelineId] = useState<number>(() => {
    return takeParamsUrl?.pipelineId ? takeParamsUrl?.pipelineId : -1;
  });

  const [approachId, setApproachId] = useState<number>(() => {
    return takeParamsUrl?.approachId ? takeParamsUrl?.approachId : -1;
  });

  useEffect(() => {
    setParams({ ...params, campaignId: contractType, approachId: -1, page: 1 });

    setApproachId(-1);
    setValueApproach(null);

    setValueCampaign({
      value: contractType,
      label: campaignName,
    });

    if (contractType === -1) {
      setListPipeline([]);
      setListApproach([]);
      setListConvertList([]);
    } else {
      getOptionPipeline(contractType);
      getOptionApproach(contractType);
      getListConvertRate(contractType);
    }
  }, [contractType]);

  const [params, setParams] = useState<ICampaignOpportunityFilterRequest>({
    name: "",
    campaignId: -1,
    approachId: -1,
    pipelineId: -1,
    limit: 10,
    saleId: -1,
    customerId: -1,
  });

  const [dataOfApproach, setDataOfApproach] = useState([]);

  const [dataOfApproachStart, setDataOfApproachStart] = useState([]);
  const [dataOfApproachFail, setDataOfApproachFail] = useState([]);
  const [dataOfApproachSuccess, setDataOfApproachSuccess] = useState([]);

  const getDataOfApproach = async (paramsSearch, kanbanTab, approachName) => {
    const response =
      kanbanTab === 1
        ? await CampaignOpportunityService.list(paramsSearch, abortController.signal)
        : await CampaignOpportunityService.listViewSale(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const newData = {
        approachId: paramsSearch.approachId,
        approachName: approachName,
        value: result?.items,
        hasMore: result?.loadMoreAble,
        page: result?.page,
      };
      setDataOfApproach((oldArray) => [...oldArray, newData]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOfApproachSpecial = async (kanbanTab, campaignId, pipelineId, status) => {
    const param = {
      campaignId: campaignId,
      limit: 10,
      page: 1,
      approachId: -1,
      pipelineId: pipelineId || -1,
      status: status,
      saleId: dataEmployee?.value || -1,
      customerId: detailCustomer?.value || -1,
    };
    const response =
      kanbanTab === 1
        ? await CampaignOpportunityService.list(param, abortController.signal)
        : await CampaignOpportunityService.listViewSale(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      if (status === 2) {
        setDataOfApproachSuccess(result);
      } else if (status === 4) {
        setDataOfApproachFail(result);
      } else {
        setDataOfApproachStart(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [detailCustomer, setDetailCustomer] = useState(null);
  const [dataEmployee, setDataEmployee] = useState(null);

  useEffect(() => {
    if (listApproach && listApproach.length > 0) {
      setDataOfApproach([]);
      listApproach.map((item) => {
        const param = {
          // name: "",
          campaignId: contractType,
          limit: 10,
          approachId: item.value,
          pipelineId: pipelineId || -1,
          page: 1,
          saleId: dataEmployee?.value || -1,
          customerId: detailCustomer?.value || -1,
        };
        getDataOfApproach(param, kanbanTab, item.label);
      });
    }
  }, [listApproach, kanbanTab, contractType, pipelineId, dataEmployee, detailCustomer]);

  useEffect(() => {
    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 2);
    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 4);
    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 0);
  }, [kanbanTab, contractType, pipelineId, dataEmployee, detailCustomer]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      // {
      //   key: "campaignId",
      //   name: "Chiến dịch",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("campaignId") ?? "",
      // },
      {
        // key: "employeeId",
        key: "saleId",
        name: "Nhân viên bán",
        type: "select",
        is_featured: true,
        value: searchParams.get("employeeId") ?? "",
      },
      {
        key: "customerId",
        name: "Khách hàng",
        type: "select",
        is_featured: true,
        value: searchParams.get("customerId") ?? "",
      },
    ],
    [searchParams]
  );

  const [listSaveSearch, setListSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Chăm sóc cơ hội",
      is_active: true,
    },
    {
      key: "report",
      name: "Báo cáo cơ hội",
      is_active: false,
    },
  ]);

  const [tabActive, setTabActive] = useState("all");

  useEffect(() => {
    setListSaveSearch(
      listSaveSearch.map((item) => {
        return {
          ...item,
          is_active: item.key === tabActive,
        };
      })
    );
  }, [tabActive]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Cơ hội",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListManagementOpportunity = async (paramsSearch: ICampaignOpportunityFilterRequest, kanbanTab) => {
    setIsLoading(true);

    const response =
      kanbanTab === 1
        ? await CampaignOpportunityService.list(paramsSearch, abortController.signal)
        : await CampaignOpportunityService.listViewSale(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListManagementOpportunity(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params?.name && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  // useEffect(() => {
  //   const paramsTemp = _.cloneDeep(params);
  //   searchParams.forEach(async (key, value) => {
  //     paramsTemp[value] = key;
  //   });

  //   // setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  //   setContractType(+paramsTemp.campaignId)
  // }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListManagementOpportunity(params, kanbanTab);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
    //tạm ẩn đi
    // return () => {
    //   abortController.abort();
    // };
  }, [params, kanbanTab]);

  const { dataBranch } = useContext(UserContext) as ContextType;

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
            {
              title: "Quay lại",
              icon: <Icon name="ChevronLeft" />,
              callback: () => {
                setTabActive("all");
                setIsRegimeKanban(!isRegimeKanban);
                setApproachId(-1);
                clearKanban();
                // if(kanbanTab === 2){
                //   setContractType(listCampaign && listCampaign.length > 0 && +listCampaign[0].value);
                //   setCampaignName(listCampaign[0]?.label.toString());
                // }else {
                setParams({ ...params, approachId: -1 });
                // }

                // localStorage.removeItem("keep_position_kanban_contract");
              },
            },
            ...(contractType !== -1
              ? [
                  {
                    title: "Kết quả chiến dịch",
                    callback: () => {
                      // navigate(`/sales_campaign?detail=true&campaignId=${contractType}`)
                      navigate(`/sales_campaign?branchId=${dataBranch?.value}&campaignId=${contractType}&detail=true`);
                      localStorage.setItem(
                        "backupCampaign",
                        JSON.stringify(`/sales_campaign?branchId=${dataBranch?.value}&campaignId=${contractType}&detail=true`)
                      );
                    },
                  },
                ]
              : []),
          ]
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setShowModalAdd(true);
                setIdManagementOpportunity(null);
              },
            },

            {
              title: "Kanban",
              // icon: <Icon name="Fullscreen" />,
              callback: () => {
                setIsRegimeKanban(true);
                if (contractType == -1) {
                  if (listCampaign && listCampaign.length > 0) {
                    setContractType(listCampaign && listCampaign.length > 0 && +listCampaign[0].value);
                    setCampaignName(listCampaign[0]?.label.toString());
                    setCampaignType(listCampaign[0]?.type.toString());
                  } else {
                    showToast("Không thể chuyển Kanban, vì chưa có chiến dịch nào. Vui lòng thêm chiến dịch và thử lại sau!", "error");
                  }
                } else {
                  setContractType(contractType);
                  setValueApproach(null);
                  setParams({ ...params, campaignId: contractType, approachId: -1 });
                }
              },
            },
          ]),
    ],
  };

  const titles = ["STT", "Tên chiến dịch", "Ngày kết thúc", "Khách hàng", "Người bán", "Doanh thu dự kiến", "Xác suất thành công"];

  const dataFormat = ["text-center", "", "text-center", "", "", "text-right", "text-center"];

  const dataMappingArray = (item: ICampaignOpportunityResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.campaignName,
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    item.customerName,
    item.saleName,
    formatCurrency(item.expectedRevenue || "0"),
    <div
      key={item.id}
      className="percent__finish--opportunity"
      onClick={() => {
        // if (item?.status == 1 || item?.status == 4) {
        setShowModalChanceProbability(true);
        setIdCampaign(item.campaignId);
        setIdManagementOpportunity(item.id);
        // }
      }}
    >
      <CircularProgressbar value={item.percent || 0} text={`${item.percent || 0}%`} className="value-percent" />
    </div>,
  ];

  const actionsTable = (item: ICampaignOpportunityResponseModel): IAction[] => {
    const activities = item.activities ? JSON.parse(item.activities) : [];
    const isCheckedItem = listIdChecked?.length > 0;


    return [
      ...(activities.includes("email") && item.status === 1
        ? [
            {
              title: "Gửi email",
              icon: <Icon name="EmailFill" style={{ width: 16, marginRight: 5 }} className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataCustomer({
                  name: item.customerName,
                  id: item.customerId,
                });
                setShowModalSendEmail(true);
              }
              },
            },
          ]
        : []),

      ...(activities.includes("sms") && item.status === 1
        ? [
            {
              title: "Gửi SMS",
              icon: <Icon name="SMS" style={{ width: 17, marginRight: 5, marginTop: 3 }} className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataCustomer({
                  name: item.customerName,
                  id: item.customerId,
                });
                setShowModalSendSms(true);
              }
              },
            },
          ]
        : []),

      ...(activities.includes("call") && item.status === 1
        ? [
            {
              title: "Gọi điện",
              icon: <Icon name="PhoneFill" style={{ width: 14, fill: "#1c8cff", marginRight: 3 }} className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataCustomer({
                  name: item.customerName,
                  id: item.customerId,
                  phoneMasked: item.customerPhone,
                  address: item.customerAddress,
                  employeeName: item.employeeName,
                });
                setShowModalPhone(true);
              }
              },
            },
          ]
        : []),

      ...(activities.includes("face") && item.status === 1
        ? [
            {
              title: "Hẹn gặp",
              icon: <Icon name="Meeting" style={{ marginRight: 3 }} className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataCustomer({
                  name: item.customerName,
                  id: item.customerId,
                });
                setShowModalFace(true);
              }
              },
            },
          ]
        : []),

      ...(activities.includes("zalo") && item.status === 1
        ? [
            {
              title: "Nhắn zalo",
              icon: <Icon name="Zalo" style={{ marginRight: 3 }} className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                // setDataCustomer({
                //   name: item.customerName,
                //   id: item.customerId
                // })
                // setShowModalFace(true);
                }
              },
            },
          ]
        : []),

      ...(activities.includes("schedule") && item.status === 1
        ? [
            {
              title: "Đặt lịch",
              icon: <Icon name="Calendar" style={{ marginRight: 3 }} className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataCustomer({
                  name: item.customerName,
                  id: item.customerId,
                });
                setShowModalAddConsultationScheduleModal(true);
              }
              },
            },
          ]
        : []),

      ...(item.status === 2
        ? [
            {
              title: "Tạo đơn hàng",
              icon: <Icon name="Bill" className={isCheckedItem ? "icon-disabled" :"icon-invoice"} style={{ marginRight: 3 }} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                navigate(`/create_sale_add?customerId=${item.customerId}&campaignId=${item.campaignId}`);
                }
              },
            },
            {
              title: "Tạo hợp đồng",
              icon: <Icon name="CreateContract" className={isCheckedItem ? "icon-disabled" :"icon-invoice"} style={{ marginRight: 3 }} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                navigate(`/create_contract?customerId=${item.customerId}&campaignId=${item.campaignId}`);
                }
              },
            },
          ]
        : []),
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setIdCampaign(item.campaignId);
          setIdManagementOpportunity(item.id);
          setIsDetailManagementOpportunity(true);
          }
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" style={{ width: 18 }} className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setIdManagementOpportunity(item.id);
          setShowModalAdd(true);
          }
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem? "icon-disabled":"icon-error"} style={{ width: 19 }} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item);
          }
        },
      },
    ];
  };

  const viewDetailOpp = (campaignId, id) => {
    setIdCampaign(campaignId);
    setIdManagementOpportunity(id);
    setIsDetailManagementOpportunity(true);
  };

  const onDelete = async (id: number) => {
    const response = await CampaignOpportunityService.delete(id);

    if (response.code === 0) {
      showToast("Xóa cơ hội thành công", "success");
      getListManagementOpportunity(params, kanbanTab);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllManagementOpportunity = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        CampaignOpportunityService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa cơ hội thành công", "success");
        getListManagementOpportunity(params, kanbanTab);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: ICampaignOpportunityResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "cơ hội của chiến dịch " : `${listIdChecked.length} cơ hội của chiến dịch`}
          {item ? <strong>{item.campaignName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAllManagementOpportunity();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [isOpportunityAllocation, setIsOpportunityAllocation] = useState<boolean>(false);

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa cơ hội",
      callback: () => showDialogConfirmDelete(),
    },
    {
      title: "Giao cơ hội",
      callback: () => setIsOpportunityAllocation(true),
    },
  ];

  //danh sách chiến dịch

  const [valueCampaign, setValueCampaign] = useState(null);

  const loadOptionCampaign = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      campaignType: 2, // 0 - Lọc lấy chiến dịch cha, 1, - Lọc lấy chiến dịch con, 2- Lọc chiến dịch lấy con và độc lập
    };
    const response = await CampaignService.list(param);
    const optionCampaign =
      page === 1
        ? [
            {
              value: -1,
              label: "Tất cả chiến dịch",
              type: null,
            },
          ]
        : [];

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length > 0) {
        dataOption.map((item: ICampaignResponseModel) => {
          optionCampaign.push({
            value: item.id,
            label: item.name,
            type: item.type,
          });
        });
      }

      return {
        // options: [
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item: ICampaignResponseModel) => {
        //         return {
        //           value: item.id,
        //           label: item.name,
        //         };
        //       })
        //     : []),
        // ],
        options: optionCampaign,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueCampaign = (e) => {
    setValueCampaign(e);
    setContractType(+e.value);
    setCampaignName(e.label);
    setCampaignType(e.type);
    if (e.value === -1) {
      setIsRegimeKanban(false);
      setTabActive("all");
    }
    clearKanban();
  };

  const getCampaignList = async () => {
    if (!listCampaign || listCampaign.length === 0) {
      const param: ICampaignFilterRequest = {
        limit: 1000,
      };
      const response = await CampaignService.list(param);
      const optionCampaign = [];

      if (response.code === 0) {
        const dataOption = response.result.items;
        if (dataOption.length > 0) {
          dataOption.map((item: ICampaignResponseModel) => {
            optionCampaign.push({
              value: item.id,
              label: item.name,
              type: item.type,
            });
          });
        }
      }

      setListCampaign(optionCampaign);

      // const dataOption = await SelectOptionData("campaignId");
      // const newOptionArray = [];
      // if (dataOption && dataOption.length > 0) {
      //   dataOption.map((item) => {
      //     newOptionArray.push(item);
      //   });
      //   setListCampaign(newOptionArray);
      // }
    }
  };

  useEffect(() => {
    getCampaignList();
  }, []);
  //lấy danh sách pha (pipeline)
  const getOptionPipeline = async (campaignId) => {
    const body: any = {
      campaignId,
    };

    const response = await CampaignPipelineService.list(body);
    if (response.code === 0) {
      const result = response.result;
      setListPipeline([
        ...(result.length > 0
          ? result.map((item, index) => {
              return {
                value: item.id,
                label: item.name,
                color: colorData[index],
                campaignId: item.campaignId,
              };
            })
          : []),
      ]);
    }
  };

  const handlClickOptionPipeline = (e, value) => {
    if (value == pipelineId) {
      setPipelineId(-1);
      // setParams({ ...params, approachId: -1 });
    } else {
      setPipelineId(value);
      // setParams({ ...params, approachId: value });
    }
  };

  //call danh sách quy trình (approach)
  const [valueApproach, setValueApproach] = useState(null);
  const getOptionApproach = async (campaignId) => {
    const body: ICampaignApproachFilterRequest = {
      campaignId,
    };

    const response = await CampaignApproachService.list(body);
    console.log("getOptionApproach>>>>", response);

    if (response.code === 0) {
      const dataOption = response.result;
      // const optionApproach = dataOption.filter(el => el.name);

      // trường hợp dùng select
      // if(optionApproach.length > 0){
      //   const arrayApproach = []
      //   optionApproach.map((item, index) => {
      //     arrayApproach.push({value: item.id, label: item.name, color: colorData[index], activities: item.activities, campaignId: item.campaignId});
      //     setListApproach(arrayApproach)
      //   })
      // }
      /////////

      setListApproach([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                value: item.id,
                label: item.name,
                color: colorData[index],
                // activities: item.activities,
                lstCampaignActivity: item.lstCampaignActivity,
                campaignId: item.campaignId,
                step: item.step,
                slaConfig: item.slaConfig ? JSON.parse(item.slaConfig).processTime : null,
                updateTime: item.updateTime,
              };
            })
          : []),
      ]);
    }
  };

  const handlClickOptionApproach = (e, value) => {
    // trường hợp dùng select
    // setApproachId(e.value);
    // setValueApproach(e)
    // setParams({ ...params, approachId: e.value });
    /////////

    if (value == approachId) {
      setApproachId(-1);
      setParams({ ...params, approachId: -1 });
    } else {
      setApproachId(value);
      setParams({ ...params, approachId: value });
    }
  };

  const [opportunityIdList, setOpportunityIdList] = useState([]);

  const [customerIdlist, setCustomerIdList] = useState([]);

  const [dataCustomerList, setDataCustomerList] = useState([]);

  const [columnList, setColumnList] = useState(undefined);

  const [checkColumn, setCheckColumn] = useState(null);

  useEffect(() => {
    if (opportunityIdList && opportunityIdList.length > 0) {
      const checkCustomerList = [];
      const checkDataCustomerList = [];
      opportunityIdList.map((item) => {
        if (checkCustomerList.length === 0) {
          checkCustomerList.push(item.customerId);
          checkDataCustomerList.push({
            name: item.customerName,
            id: item.customerId,
            phoneMasked: item.customerPhone,
            emailMasked: item.customerEmail,
            address: item.customerAddress,
            employeeName: item.employeeName,
            coyId: item.id,
            approachId: item.approachId,
          });
        } else {
          if (!checkCustomerList.includes(item.customerId)) {
            checkCustomerList.push(item.customerId);
            checkDataCustomerList.push({
              name: item.customerName,
              id: item.customerId,
              phoneMasked: item.customerPhone,
              emailMasked: item.customerEmail,
              address: item.customerAddress,
              employeeName: item.employeeName,
              coyId: item.id,
              approachId: item.approachId,
            });
          }
        }
      });
      setCustomerIdList(checkCustomerList);
      setDataCustomerList(checkDataCustomerList);
    } else if (opportunityIdList && opportunityIdList.length === 0) {
      setCustomerIdList([]);
      setDataCustomerList([]);
    }
  }, [opportunityIdList]);

  const clearKanban = () => {
    setOpportunityIdList([]);
    setCustomerIdList([]);
    setDataCustomerList([]);
    setColumnList(undefined);
    setCheckColumn(null);
    setKanbanTab(1);
  };

  const getListConvertRate = async (campaignId) => {
    const response = await CampaignService.listConvertRate(campaignId);

    if (response.code === 0) {
      const result = response.result;
      setListConvertList(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const listKanbanTab = [
    {
      value: 1,
      name: "Chiến dịch tôi phụ trách",
    },
    {
      value: 2,
      name: "Chiến dịch tôi tham gia",
    },
  ];

  const [listCampaignViewSale, setListCampaignViewSale] = useState([]);

  const getListCampaignViewSale = async () => {
    const response = await CampaignService.listViewSale({ limit: 1000 });

    if (response.code == 0) {
      const result = response.result;
      setListCampaignViewSale(result.items);

      // setPagination({
      //   ...pagination,
      //   page: +result.page,
      //   sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
      //   totalItem: +result.total,
      //   totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      // });

      // if (+result.total === 0 && !params?.name && +result.page === 1) {
      //   setIsNoItem(true);
      // }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getListCampaignViewSale();
  }, []);

  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  // lấy người phụ trách
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    if (e?.value) {
      setCheckFieldEmployee(false);
      setDataEmployee(e);
      setParams({
        ...params,
        saleId: e.value,
      });
    } else {
      setDataEmployee(null);
      setParams({
        ...params,
        saleId: -1,
      });
    }
  };

  // khách hàng
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: `${item.name} - ${item.phoneMasked}`,
                  avatar: item.avatar,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCustomer = (e) => {
    if (e?.value) {
      setCheckFieldCustomer(false);
      setDetailCustomer(e);
      setParams({
        ...params,
        customerId: e.value,
      });
    } else {
      setDetailCustomer(null);
      setParams({
        ...params,
        customerId: -1,
      });
    }
  };

  //Start - Đoạn này để test dữ liệu cho tree
  const [valueCampaignTest, setValueCampaignTest] = useState("child4-4");
  // const [valueCampaignTest, setValueCampaignTest] = useState({
  //   value: 285,
  //   label: "Chiến dịch cha 1",
  // });
  const dataTreeTest = [
    {
      label: "Chiến dịch cha 1",
      value: "parent1",
      disabled: true,
      isExpand: false,
      children: [
        { label: "Child 1-1", value: "child1-1", disabled: false },
        { label: "Child 1-2", value: "child1-2", disabled: false },
      ],
    },
    {
      label: "Chiến dịch cha 2",
      value: "parent2",
      disabled: true,
      isExpand: false,
      children: [
        { label: "Child 2-1", value: "child2-1", disabled: false },
        { label: "Child 2-2", value: "child2-2", disabled: false },
        { label: "Child 2-3 Child 2-3 Child 2-3 Child 2-3 Child 2-3", value: "child2-3", disabled: false },
        { label: "Child 2-4", value: "child2-4", disabled: false },
      ],
    },
    {
      label: "Chiến dịch cha 3",
      value: "parent3",
      disabled: true,
      isExpand: false,
      children: [
        { label: "Child 3-1", value: "child3-1", disabled: false },
        { label: "Child 3-2", value: "child3-2", disabled: false },
        { label: "Child 3-3 Child 3-3 Child 3-3 Child 3-3 Child 3-3 Child 3-3", value: "child3-3", disabled: false },
        { label: "Child 3-4", value: "child3-4", disabled: false },
      ],
    },
    {
      label: "Chiến dịch cha 4",
      value: "parent4",
      disabled: true,
      isExpand: false,
      children: [
        { label: "Child 4-1", value: "child4-1", disabled: false },
        { label: "Child 4-2", value: "child4-2", disabled: false },
        { label: "Child 4-3 Child 4-3 Child 4-3 Child 4-3 Child 4-3 Child 4-3", value: "child4-3", disabled: false },
        { label: "Child 4-4", value: "child4-4", disabled: false },
      ],
    },
  ];

  // console.log("valueCampaignTest>>", valueCampaignTest);

  //End - Đoạn này để test dữ liệu cho tree

  return (
    <div className={`page-content page__management--opportunity${isNoItem ? " bg-white" : ""}`}>
      {!isDetailManagementOpportunity && <TitleAction title="Chăm sóc cơ hội" titleActions={titleActions} />}

      {!isDetailManagementOpportunity ? (
        <div className="card-box d-flex flex-column">
          <div className={`${isRegimeKanban ? "kanban_view_sale" : "d-none"}`}>
            <div className="kanban_tab">
              {listKanbanTab.map((item, index) => (
                <div
                  key={index}
                  className="box_tab"
                  style={
                    kanbanTab === item.value
                      ? { borderBottom: "2px solid #015aa4" }
                      : {
                          borderBottom: "2px solid var(--extra-color-10)",
                          color: listCampaignViewSale && listCampaignViewSale.length > 0 ? "" : "var(--extra-color-20)",
                        }
                  }
                  onClick={() => {
                    if (item.value === 2) {
                      if (listCampaignViewSale && listCampaignViewSale.length > 0) {
                        setContractType(+listCampaignViewSale[0].id);
                        setCampaignName(listCampaignViewSale[0]?.name);
                        setCampaignType(listCampaignViewSale[0]?.type);
                        setKanbanTab(item.value);
                      } else {
                        showToast("Bạn chưa tham gia chiến dịch nào", "warning");
                      }
                    } else if (item.value === 1) {
                      setKanbanTab(item.value);
                      // setContractType(listCampaign && listCampaign.length > 0 && +listCampaign[0].value);
                      // setCampaignName(listCampaign[0]?.label.toString());
                    }
                  }}
                >
                  <span>{item.name}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: "0 2rem 0 2rem" }}>
              {listCampaignViewSale.length > 0 && kanbanTab === 2 ? (
                <ul className="quick__search--left-swiper" style={{ width: "100%" }}>
                  <Swiper
                    onInit={(core: SwiperCore) => {
                      swiperPipelineRef.current = core.el;
                    }}
                    className="relationship-slider"
                    grid={{
                      rows: 1,
                    }}
                    navigation={true}
                    modules={[Grid, Navigation]}
                    slidesPerView={5}
                    spaceBetween={10}
                  >
                    {listCampaignViewSale &&
                      listCampaignViewSale.length > 0 &&
                      listCampaignViewSale.map((item, idx) => {
                        return (
                          <SwiperSlide key={idx} className="list__relationship--slide">
                            {item.name.length > 30 ? (
                              <Tippy content={item.name}>
                                <li
                                  key={idx}
                                  className={`${item.id == contractType ? "active" : "unactive"}`}
                                  onClick={(e) => {
                                    e && e.preventDefault();
                                    setContractType(+item.id);
                                    setCampaignName(item.name);
                                  }}
                                >
                                  {trimContent(item.name, 30, true, true)}
                                </li>
                              </Tippy>
                            ) : (
                              <li
                                key={idx}
                                className={`${item.id == contractType ? "active" : "unactive"}`}
                                onClick={(e) => {
                                  e && e.preventDefault();
                                  setContractType(+item.id);
                                  setCampaignName(item.name);
                                }}
                              >
                                {item.name}
                              </li>
                            )}
                            {/* <li
                              key={idx}
                              className={`${item.id == contractType ? "active" : "unactive"}`}
                              onClick={(e) => {
                                e && e.preventDefault();
                                setContractType(+item.id);
                                setCampaignName(item.name);
                              }}
                            >
                              {item.name.length > 30 ? (
                                <Tippy content={item.name}>
                                  <span>{trimContent(item.name, 30, true, true)}</span>
                                </Tippy>
                              ) : (
                                item.name
                              )}
                            </li> */}
                          </SwiperSlide>
                        );
                      })}
                  </Swiper>
                </ul>
              ) : null}
            </div>
          </div>

          <div className="quick__search">
            {/* {listPipeline.length > 0 && !isRegimeKanban ? (
              <ul className="quick__search--left-swiper" style={contractType == -1 || listApproach.length === 0 ? { width: "100%" } : { maxWidth: "38%" }}>
                <Swiper
                  onInit={(core: SwiperCore) => {
                    swiperPipelineRef.current = core.el;
                  }}
                  className="relationship-slider"
                  grid={{
                    rows: 1,
                  }}
                  navigation={true}
                  modules={[Grid, Navigation]}
                  slidesPerView={contractType == -1 || listApproach.length === 0 ? 5 : 2}
                  spaceBetween={10}
                >
                  <SwiperSlide className="list__relationship--slide-first">
                    <li
                      className={`${isRegimeKanban ? "d-none" : contractType == -1 ? "active" : "unactive"}`}
                      onClick={(e) => {
                        e && e.preventDefault();
                        setContractType(-1);
                      }}
                    >
                      {"Tất cả"}
                    </li>
                  </SwiperSlide>
                  {listPipeline &&
                    listPipeline.length > 0 &&
                    listPipeline.map((item, idx) => {
                      return (
                        <SwiperSlide key={idx} className="list__relationship--slide">
                          <li
                            key={idx}
                            className={`${item.value == contractType ? "active" : "unactive"}`}
                            onClick={(e) => {
                              e && e.preventDefault();
                              setContractType(+item.value);
                            }}
                          >
                            {item.label}
                          </li>
                        </SwiperSlide>
                      );
                    })}
                </Swiper>
              </ul>
            ) : (
              <ul className="quick__search--left" style={isRegimeKanban ? { width: "100%" } : {}}>
                {listPipeline &&
                  listPipeline.length > 0 &&
                  listPipeline.map((item, idx) => {
                    return (
                      <li
                        key={idx}
                        className={`${item.value == contractType ? "active" : "unactive"}`}
                        onClick={(e) => {
                          e && e.preventDefault();
                          setContractType(+item.value);
                        }}
                      >
                        {item.label}
                      </li>
                    );
                  })}
              </ul>
            )} */}
            {kanbanTab === 1 && tabActive != "report" ? (
              <>
                <div style={{ width: "20%" }}>
                  <SelectCustom
                    label={isRegimeKanban ? "Chiến dịch" : ""}
                    id="campaignId"
                    name="campaignId"
                    fill={true}
                    // required={true}
                    options={[]}
                    value={valueCampaign}
                    onChange={(e) => handleChangeValueCampaign(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn chiến dịch"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadOptionCampaign}
                  />
                </div>
                {/* <div style={{ width: "20%" }}>
                  <SelectTree
                    // isClearable={true}
                    label={isRegimeKanban ? "Chiến dịch" : ""}
                    // label={"Chiến dịch"}
                    id="campaignId"
                    name="campaignId"
                    fill={true}
                    // required={true}
                    options={dataTreeTest}
                    value={valueCampaignTest}
                    chooseParent={true}
                    onChange={(e) => setValueCampaignTest(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn chiến dịch"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadOptionCampaign}
                  />
                </div> */}
                {isRegimeKanban ? (
                  <>
                    <div style={{ width: "30rem" }}>
                      <SelectCustom
                        id="saleId"
                        name="saleId"
                        label="Người phụ trách"
                        options={[]}
                        fill={true}
                        value={dataEmployee}
                        // required={true}
                        isClearable={true}
                        isShowDropdownIcon={dataEmployee?.value ? false : true}
                        onChange={(e) => handleChangeValueEmployee(e)}
                        isAsyncPaginate={true}
                        isFormatOptionLabel={true}
                        placeholder="Tất cả nhân viên"
                        additional={{
                          page: 1,
                        }}
                        loadOptionsPaginate={loadedOptionEmployee}
                        formatOptionLabel={formatOptionLabelEmployee}
                      />
                    </div>
                    <div style={{ width: "30rem" }}>
                      <SelectCustom
                        id="customerId"
                        name="customerId"
                        label="Khách hàng"
                        options={[]}
                        fill={true}
                        value={detailCustomer}
                        // required={true}
                        isClearable={true}
                        isShowDropdownIcon={detailCustomer?.value ? false : true}
                        onChange={(e) => handleChangeValueCustomer(e)}
                        isAsyncPaginate={true}
                        isFormatOptionLabel={true}
                        placeholder="Tất cả khách hàng"
                        additional={{
                          page: 1,
                        }}
                        loadOptionsPaginate={loadedOptionCustomer}
                        formatOptionLabel={formatOptionLabelCustomer}
                        error={checkFieldCustomer}
                        message="Khách hàng không được bỏ trống"
                      />
                    </div>
                  </>
                ) : null}
              </>
            ) : null}

            {tabActive != "report" ? (
              <div className={`${isRegimeKanban ? "d-none" : "quick__search--right"}`} style={contractType == -1 ? { width: "0%" } : {}}>
                {width < 1920 && width > 768 && listApproach.length > 4 ? (
                  <Swiper
                    onInit={(core: SwiperCore) => {
                      swiperRelationshipRef.current = core.el;
                    }}
                    className="relationship-slider"
                    grid={{
                      rows: 1,
                    }}
                    navigation={true}
                    modules={[Grid, Navigation]}
                    slidesPerView={4}
                    spaceBetween={5}
                  >
                    {listApproach.map((item, idx) => {
                      return item.label ? (
                        <SwiperSlide key={idx} className="list__relationship--slide">
                          <div
                            className={`item-relationship ${item.value == approachId ? "active__item-block" : ""}`}
                            style={{ backgroundColor: item.color, color: item.colorText }}
                            onClick={(e) => {
                              e && e.preventDefault();
                              handlClickOptionApproach(e, item.value);
                            }}
                          >
                            {item.label}
                          </div>
                        </SwiperSlide>
                      ) : null;
                    })}
                  </Swiper>
                ) : (
                  <div className="list__relationship" style={isRegimeKanban ? { marginTop: "24px" } : {}}>
                    {listApproach.map((item, idx) => {
                      return item.label ? (
                        <div
                          key={idx}
                          className={`relationship-item ${item.value == approachId ? "active__relationship--item" : ""}`}
                          style={{ backgroundColor: item.color, color: item.colorText }}
                          onClick={(e) => {
                            e && e.preventDefault();
                            handlClickOptionApproach(e, item.value);
                          }}
                        >
                          {item.label}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {listPipeline && listPipeline.length > 0 ? (
              <div className={`${isRegimeKanban ? "quick__search--right" : "d-none"}`} style={contractType == -1 ? { width: "0%" } : {}}>
                {width < 1920 && width > 768 && listPipeline.length > 4 ? (
                  <Swiper
                    onInit={(core: SwiperCore) => {
                      swiperRelationshipRef.current = core.el;
                    }}
                    className="relationship-slider"
                    grid={{
                      rows: 1,
                    }}
                    navigation={true}
                    modules={[Grid, Navigation]}
                    slidesPerView={4}
                    spaceBetween={5}
                  >
                    {listPipeline.map((item, idx) => {
                      return item.label ? (
                        <SwiperSlide key={idx} className="list__relationship--slide">
                          <div
                            className={`item-relationship ${item.value == pipelineId ? "active__item-block" : ""}`}
                            style={{ backgroundColor: item.color, color: item.colorText }}
                            onClick={(e) => {
                              e && e.preventDefault();
                              handlClickOptionPipeline(e, item.value);
                            }}
                          >
                            {item.label}
                          </div>
                        </SwiperSlide>
                      ) : null;
                    })}
                  </Swiper>
                ) : (
                  <div className="list__relationship" style={isRegimeKanban ? { marginTop: "24px" } : {}}>
                    {listPipeline.map((item, idx) => {
                      return item.label ? (
                        <div
                          key={idx}
                          className={`relationship-item ${item.value == pipelineId ? "active__relationship--item" : ""}`}
                          style={{ backgroundColor: item.color, color: item.colorText }}
                          onClick={(e) => {
                            e && e.preventDefault();
                            handlClickOptionPipeline(e, item.value);
                          }}
                        >
                          {item.label}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ) : null}
            {/* {contractType !== -1 && listApproach.length > 0 && !isRegimeKanban? 
              <div style={{width: '30rem', marginLeft: 15}}>
                <SelectCustom
                  fill={true}
                  options={listApproach}
                  special={true}
                  value={valueApproach}
                  placeholder="Chọn quy trình"
                  onChange={(e) => handlClickOptionApproach(e)}
                />
              </div>
            : null} */}
          </div>
          <div className={`${isRegimeKanban ? "d-none" : ""}`}>
            <SearchBox
              name="Tên chiến dịch"
              setTabActive={setTabActive}
              params={params}
              isSaveSearch={true}
              listSaveSearch={listSaveSearch}
              isFilter={tabActive == "all" ? true : false}
              isHiddenSearch={tabActive == "all" ? false : true}
              listFilterItem={customerFilterList}
              updateParams={(paramsNew) => setParams(paramsNew)}
            />
            {tabActive == "all" ? (
              <>
                {!isLoading && listManagementOpportunity && listManagementOpportunity.length > 0 ? (
                  <BoxTable
                    name="Danh sách cơ hội"
                    titles={titles}
                    items={listManagementOpportunity}
                    isPagination={true}
                    dataPagination={pagination}
                    dataMappingArray={(item, index) => dataMappingArray(item, index)}
                    dataFormat={dataFormat}
                    striped={true}
                    isBulkAction={true}
                    bulkActionItems={bulkActionList}
                    listIdChecked={listIdChecked}
                    setListIdChecked={(listId) => setListIdChecked(listId)}
                    actions={actionsTable}
                    actionType="inline"
                  />
                ) : isLoading ? (
                  <Loading />
                ) : (
                  <Fragment>
                    {isNoItem ? (
                      <SystemNotification
                        description={
                          <span>
                            Hiện tại chưa có cơ hội nào. <br />
                            Hãy thêm mới cơ hội đầu tiên nhé!
                          </span>
                        }
                        type="no-item"
                        titleButton="Thêm mới cơ hội"
                        action={() => {
                          setShowModalAdd(true);
                          setIdManagementOpportunity(null);
                        }}
                      />
                    ) : (
                      <SystemNotification
                        description={
                          <span>
                            Không có dữ liệu trùng khớp. <br />
                            Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                          </span>
                        }
                        type="no-result"
                      />
                    )}
                  </Fragment>
                )}
              </>
            ) : (
              <>
                <ReportOpportunity />
              </>
            )}
          </div>

          <div className={`${isRegimeKanban ? "" : "d-none"}`}>
            {campaignType === "biz" ? (
              <KanbanCompany
                params={params}
                setParams={setParams}
                kanbanTab={kanbanTab}
                contractFilterList={customerFilterList}
                data={listManagementOpportunity}
                dataOfApproach={dataOfApproach}
                setDataOfApproach={setDataOfApproach}
                dataStart={dataOfApproachStart}
                setDataStart={setDataOfApproachStart}
                dataFail={dataOfApproachFail}
                setDataFail={setDataOfApproachFail}
                dataSuccess={dataOfApproachSuccess}
                setDataSuccess={setDataOfApproachSuccess}
                listApproach={listApproach}
                onReload={(reload) => {
                  if (reload) {
                    getListManagementOpportunity(params, kanbanTab);
                    setDataOfApproach([]);
                    if (listApproach && listApproach.length > 0) {
                      listApproach.map((item) => {
                        const param = {
                          // name: "",
                          campaignId: contractType,
                          limit: 10,
                          page: 1,
                          approachId: item.value,
                        };
                        getDataOfApproach(param, kanbanTab, item.label);
                      });
                    }
                    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 2);
                    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 4);
                    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 0);
                  }
                }}
                idManagementOpportunity={idManagementOpportunity}
                opportunityIdList={opportunityIdList}
                setOpportunityIdList={setOpportunityIdList}
                customerIdlist={customerIdlist}
                setCustomerIdList={setCustomerIdList}
                columnList={columnList}
                setColumnList={setColumnList}
                checkColumn={checkColumn}
                f
                setCheckColumn={setCheckColumn}
                dataCustomerList={dataCustomerList}
                listConvertRate={listConvertRate}
                viewDetailOpp={viewDetailOpp}
                setIdManagementOpportunity={setIdManagementOpportunity}
                setShowModalAdd={setShowModalAdd}
                pipelineId={pipelineId}
              />
            ) : (
              <Kanban
                params={params}
                setParams={setParams}
                kanbanTab={kanbanTab}
                contractFilterList={customerFilterList}
                data={listManagementOpportunity}
                dataOfApproach={dataOfApproach}
                setDataOfApproach={setDataOfApproach}
                dataStart={dataOfApproachStart}
                setDataStart={setDataOfApproachStart}
                dataFail={dataOfApproachFail}
                setDataFail={setDataOfApproachFail}
                dataSuccess={dataOfApproachSuccess}
                setDataSuccess={setDataOfApproachSuccess}
                listApproach={listApproach}
                onReload={(reload) => {
                  if (reload) {
                    getListManagementOpportunity(params, kanbanTab);
                    setDataOfApproach([]);
                    if (listApproach && listApproach.length > 0) {
                      listApproach.map((item) => {
                        const param = {
                          // name: "",
                          campaignId: contractType,
                          limit: 10,
                          page: 1,
                          approachId: item.value,
                        };
                        getDataOfApproach(param, kanbanTab, item.label);
                      });
                    }
                    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 2);
                    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 4);
                    getDataOfApproachSpecial(kanbanTab, contractType, pipelineId, 0);
                  }
                }}
                idManagementOpportunity={idManagementOpportunity}
                opportunityIdList={opportunityIdList}
                setOpportunityIdList={setOpportunityIdList}
                customerIdlist={customerIdlist}
                setCustomerIdList={setCustomerIdList}
                columnList={columnList}
                setColumnList={setColumnList}
                checkColumn={checkColumn}
                setCheckColumn={setCheckColumn}
                dataCustomerList={dataCustomerList}
                listConvertRate={listConvertRate}
                viewDetailOpp={viewDetailOpp}
                setIdManagementOpportunity={setIdManagementOpportunity}
                setShowModalAdd={setShowModalAdd}
                pipelineId={pipelineId}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="detail__management--opportunity">
          <div className="action-navigation">
            <div className="action-backup">
              <h1
                onClick={() => {
                  setIsDetailManagementOpportunity(false);
                  setTabActive("all");
                }}
                className="title-first"
                title="Quay lại"
              >
                Chăm sóc cơ hội
              </h1>
              <Icon name="ChevronRight" />
              <h1 className="title-last">Lịch sử cơ hội</h1>
            </div>
          </div>

          <DetailManagementOpportunity
            idData={idManagementOpportunity}
            idCampaign={idCampaign}
            onShow={isDetailManagementOpportunity}
            onHide={(reload) => {
              if (reload) {
                getListManagementOpportunity(params, kanbanTab);
              }
              setShowModalAdd(false);
            }}
          />
        </div>
      )}
      <AddManagementOpportunityModal
        onShow={showModalAdd}
        idData={idManagementOpportunity}
        onHide={(reload) => {
          if (reload) {
            getListManagementOpportunity(params, kanbanTab);
          }
          setShowModalAdd(false);
        }}
      />

      <AddCustomerEmailModal
        onShow={showModalSendEmail}
        dataCustomer={dataCustomer}
        callback={(codes: ICustomPlaceholderResponse) => {
          setCodesEmail(codes);
          setShowModalPlaceholderEmail(true);
        }}
        onHide={(reload) => {
          // if (reload) {
          //   getListCustomerEmail(params);
          // }
          setShowModalSendEmail(false);
        }}
      />

      <AddCustomerSMSModal
        onShow={showModalSendSms}
        idCustomer={dataCustomer?.id}
        callback={(codes: ICustomPlaceholderResponse) => {
          setCodesSms(codes);
          setShowModalPlaceholderSms(true);
        }}
        onHide={(reload) => {
          // if (reload) {
          //   getListCustomerSMS(params);
          // }
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

      <AddPhoneModal onShow={showModalPhone} dataCustomer={dataCustomer} onHide={() => setShowModalPhone(false)} />

      <ContentMeetingModal onShow={showModalFace} dataCustomer={dataCustomer} onHide={() => setShowModalFace(false)} />

      <AddConsultationScheduleModal
        onShow={showModalAddConsultationScheduleModal}
        idData={null}
        idCustomer={dataCustomer?.id}
        startDate={new Date()}
        endDate={new Date(new Date().setMinutes(new Date().getMinutes() + 10))}
        onHide={(reload) => {
          if (reload) {
            // getListSchedule(params);
          }
          setShowModalAddConsultationScheduleModal(false);
        }}
      />

      {/* <AddChangeProbabilityModal
        onShow={showModalChanceProbability}
        idCampaign={idCampaign}
        idData={idManagementOpportunity}
        onHide={(reload) => {
          if (reload) {
            getListManagementOpportunity(params);
          }
          setShowModalChanceProbability(false);
        }}
      /> */}

      {/* Giao cơ hội */}
      <AddOpportunityAllocation
        onShow={isOpportunityAllocation}
        onHide={(reload) => {
          if (reload) {
            //
          }

          setIsOpportunityAllocation(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
