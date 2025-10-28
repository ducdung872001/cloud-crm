import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
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
import { showToast } from "utils/common";
import "./CampaignMarketingList.scss";
import { SelectOptionData } from "utils/selectCommon";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Grid } from "swiper";
import { useWindowDimensions } from "utils/hookCustom";
import SelectCustom from "components/selectCustom/selectCustom";
// import AddOpportunityAllocation from "./partials/AddOpportunityAllocation";
import { ContextType, UserContext } from "contexts/userContext";
// import Kanban from "./partials/Kanban/Kanban";
// import AddInvoiceModal from "./partials/AddInvoiceModal";
import Badge from "components/badge/badge";
import CampaignMarketingService from "services/CampaignMarketingService";
import ModalAddCampaignMA from "./partials/ModalAddCampaignMA";
import Kanban from "./Kanban/Kanban";
import Image from "components/image";
import ModalAllocateBudget from "./ModalAllocateBudget/ModalAllocateBudget";
import ChangeStatusCampaign from "./ChangeStatusCampaign/ChangeStatusCampaign";
import ModalGiveGoal from "./ModalGiveGoal/ModalGiveGoal";
import MarketingReport from "./MarketingReport/MarketingReport";
import MarketingChannelInternal from "./MarketingChannelInternal/MarketingChannelInternal";
// import ModalDetailSaleInvoice from "./partials/ModalDetailSaleInvoice/ModalDetailSaleInvoice";

export default function CampaignMarketingList() {
  document.title = "Chiến dịch Marketing";

  const navigate = useNavigate();
  const checkIsKanban = localStorage.getItem("isKanbanCampaignMA");

//   const checkSaleflowId = localStorage.getItem("saleflowId");
  // console.log("checkCampaignId", checkCampaignId);
//   const checkSaleflowName = localStorage.getItem("saleflowName");
  // console.log("checkCampaignName", checkCampaignName);

  const isMounted = useRef(false);
  const swiperPipelineRef = useRef(null);
  const swiperRelationshipRef = useRef(null);
  const { width } = useWindowDimensions();
  const takeParamsUrl = getSearchParameters();

  const [searchParams, setSearchParams] = useSearchParams();
  const [listCampaignMA, setListCampaignMA] = useState([]);
  // console.log('listManagementOpportunity', listManagementOpportunity);

  const [idCampaignMA, setIdCampaignMA] = useState<number>(null);
  const [dataCampaignMA, setDataCampaignMA] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [isDetailCampaignMA, setIsDetailCampaignMA] = useState<boolean>(false);

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    status: -1,
    page: 1
  });

  const [status, setStatus] = useState<number>(() => {
    return takeParamsUrl?.status ? takeParamsUrl?.status : -1;
  });

  useEffect(() => {
    setParams({ ...params, status: status });
  }, [status])
  

  ///activities

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

  const listApproach = [
    {
        value: 1,
        label: 'Chiến dịch',
        color: "#E98E4C"
    },
    {
        value: 2,
        label: 'Phân bổ ngân sách',
        color:  "#ED6665"
    },
    {
        value: 3,
        label: 'Giao chỉ tiêu',
        color: "#FFBF00"
    },
    {
        value: 4,
        label: 'Theo dõi thực hiện',
        color: "#9966CC"
    },
    {
        value: 5,
        label: 'Báo cáo',
        color: "#6A5ACD"
    },
    {
        value: 6,
        label: 'Kết thúc',
        color: "#007FFF"
    },
  ]

  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(checkIsKanban ? JSON.parse(checkIsKanban) : false);
  useEffect(() => {
    localStorage.setItem("isKanbanCampaignMA", JSON.stringify(isRegimeKanban));
  }, [isRegimeKanban]);

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
        key: "employeeId",
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

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Chiến dịch Marketing",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "chiến dịch",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCampaignMA= async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await CampaignMarketingService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCampaignMA(result.items);

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



  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListCampaignMA(params);
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
        setSearchParams(paramsTemp as any);
      }
    }
    //tạm ẩn đi
    // return () => {
    //   abortController.abort();
    // };
  }, [params]);

  const { dataBranch } = useContext(UserContext) as ContextType;

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
            {
              title: "Quay lại",
              icon: <Icon name="ChevronLeft" />,
              callback: () => {
                setIsRegimeKanban(!isRegimeKanban);
                clearKanban();
              },
            },
          ]
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setShowModalAdd(true);
                setIdCampaignMA(null);
                setDataCampaignMA(null);
              },
            },

            {
              title: "Kanban",
              // icon: <Icon name="Fullscreen" />,
              callback: () => {
                setIsRegimeKanban(true);
                setStatus(-1);
              },
            },
          ]),
    ],
  };

  const titles = ["STT", "Ảnh chiến dịch", "Tên chiến dịch", "Mã chiến dịch", "Ngày bắt đầu", "Ngày kết thúc", "Tổng ngân sách", "Trạng thái"];
  const dataFormat = ["text-center", "text-center", "", "", "text-center", "text-center", "text-right", "text-center"];


  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    <Image key={item.id} src={item.cover} alt={item.name} />,
    item.name,
    item.code,
    item.startDate ? moment(item.startDate).format('DD/MM/YYYY') : '',
    item.endDate ? moment(item.endDate).format('DD/MM/YYYY') : '',
    formatCurrency(item.totalBudget || 0),
    <Badge
        key={item.id}
        text={item.statusOther === 1 || item.statusOther === 0 ? "Đang thực hiện" : item.statusOther === 2 ? "Hoàn thành" : "Tạm dừng"}
        variant={item.statusOther === 1 || item.statusOther === 0 ? "primary" : item.statusOther === 2 ? "success" : "warning"}
    />,
  ];

  const actionsTable = (item: any): IAction[] => {

    return [
    
      // {
      //   title: "Xem chi tiết",
      //   icon: <Icon name="Eye" />,
      //   callback: () => {
      //     setIdCampaignMA(item.id);
      //     setDataCampaignMA(item);
      //   },
      // },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" style={{ width: 18 }} />,
        callback: () => {
          setIdCampaignMA(item.id);
          setDataCampaignMA(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" style={{ width: 19 }} />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDeleteChannel = async (id: number) => {
    const response = await CampaignMarketingService.deleteMABudget(id);

    if (response.code === 0) {
      showToast("Xóa kênh Marketing thành công", "success");
      reloadListChannel();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };


  const onDelete = async (id: number) => {
    const response = await CampaignMarketingService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chiến dịch Marketing thành công", "success");
      reLoadListCampaignMA();
      reloadListChannel();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAllCampaignMA = () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        CampaignMarketingService.delete(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa chiến dịch Marketing thành công", "success");
        reLoadListCampaignMA();
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "chiến dịch Marketing " : `${listIdChecked.length} chiến dịch Marketing đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
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
          onDeleteAllCampaignMA();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const showDialogConfirmDeleteChannel = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "kênh Marketing " : `${listIdChecked.length} kênh Marketing đã chọn`}
          {item ? <strong>{item.channelName}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        onDeleteChannel(item.id);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const [isOpportunityAllocation, setIsOpportunityAllocation] = useState<boolean>(false);

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa chiến dịch",
      callback: () => showDialogConfirmDelete(),
    },
    // {
    //   title: "Giao cơ hội",
    //   callback: () => setIsOpportunityAllocation(true),
    // },
  ];

  //danh sách quy trinhf



  const [campaignMaIdList, setCampaignMAIdList] = useState([]);
  // console.log('opportunityIdList', opportunityIdList);

  const [customerIdlist, setCustomerIdList] = useState([]);
  // console.log('customerIdlist', customerIdlist);

  const [dataCustomerList, setDataCustomerList] = useState([]);
  console.log("dataCustomerList", dataCustomerList);

  const [columnList, setColumnList] = useState(undefined);
  // console.log('columnList', columnList);

  const [checkColumn, setCheckColumn] = useState(null);
  // console.log('checkColumn', checkColumn);

  useEffect(() => {
    if (campaignMaIdList && campaignMaIdList.length > 0) {
      let checkCustomerList = [];
      let checkDataCustomerList = [];
      campaignMaIdList.map((item) => {
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
              coyId: item.id
            });
          }
        }
      });
      setCustomerIdList(checkCustomerList);
      setDataCustomerList(checkDataCustomerList);
    } else if (campaignMaIdList && campaignMaIdList.length === 0) {
      setCustomerIdList([]);
      setDataCustomerList([]);
    }
  }, [campaignMaIdList]);

  const handlClickOptionStatus = (e, value) => {

    if (value == status) {
      setStatus(-1);
      // setParams({ ...params, status: -1 });
    } else {
      setStatus(value);
      // setParams({ ...params, status: value });
    }
  };

  const clearKanban = () => {
    setCampaignMAIdList([]);
    setCustomerIdList([]);
    setDataCustomerList([]);
    setColumnList(undefined);
    setCheckColumn(null);
  };

  //1 - là list ra danh sách chiến dịch
  const [dataOfStatus_1, setDataOfStatus_1] = useState([]);
  // thay đổi trạng thái chiến dịch
  const [isChangeStatusCampaign, setIsChangeStatusCampaign] = useState(false);

  // từ 2 -> 6 list ra danh sách các kênh trong chiến dịch
  const [dataOfStatus_2, setDataOfStatus_2] = useState([]);
  const [dataOfStatus_3, setDataOfStatus_3] = useState([]);
  const [dataOfStatus_4, setDataOfStatus_4] = useState([]);
  const [dataOfStatus_5, setDataOfStatus_5] = useState([]);
  const [dataOfStatus_6, setDataOfStatus_6] = useState([]);

  const getDataOfStatus = async (status) => {
    const param = {
      limit: 10,
      page: 1,
      status: status,
    };
    const response = await CampaignMarketingService.list(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      if (status === 1) {
        setDataOfStatus_1(result);
      } 
      // else if (status === 2) {
      //   setDataOfStatus_2(result);
      // } else if (status === 3) {
      //   setDataOfStatus_3(result);
      // } else if (status === 4) {
      //   setDataOfStatus_4(result);
      // } else if(status === 5){
      //   setDataOfStatus_5(result);
      // } else {
      //   setDataOfStatus_6(result);
      // }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getDataOfStatus(1);
    // getDataOfStatus(2);
    // getDataOfStatus(3);
    // getDataOfStatus(4);
    // getDataOfStatus(5);
    // getDataOfStatus(6);

    getListChannel(2);
    getListChannel(3);
    getListChannel(4);
    getListChannel(5);
    getListChannel(6);
  }, []);

  const reLoadListCampaignMA = () => {
    getListCampaignMA(params);
    getDataOfStatus(1);
  }

  const reloadListChannel = () => {
    getListChannel(2);
    getListChannel(3);
    getListChannel(4);
    getListChannel(5);
    getListChannel(6);
  }

  const [isModalAllocateBudget, setIsModalAllocateBudget] = useState(false);
  const [isModalGiveGoal, setIsModalGiveGoal] = useState(false);
  const [channelItemData, setChannelItemData] = useState(null);

  const getListChannel = async (status) => {
    const param = {
      limit: 10,
      page: 1,
      status: status,
    };
    const response = await CampaignMarketingService.listMABudget(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      if (status === 2) {
        setDataOfStatus_2(result);
      } else if (status === 3) {
        setDataOfStatus_3(result);
      } else if (status === 4) {
        setDataOfStatus_4(result);
      } else if(status === 5){
        setDataOfStatus_5(result);
      } else {
        setDataOfStatus_6(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [isModalReport, setIsModalReport] = useState(false);
  const [isMarketingChannelInternal, setIsMarketingChannelInternal] = useState(false);


  return (
    <div className={`page-content page__campaign-marketing${isNoItem ? " bg-white" : ""}`}>
      {!isDetailCampaignMA && <TitleAction title="Chiến dịch Marketing" titleActions={titleActions} />}

        <div className="card-box d-flex flex-column">
        

          <div className={`${isRegimeKanban ? "d-none" : "quick__search"}`}>
            
            <div className={`${isRegimeKanban ? "d-none" : "quick__search--right"}`}>
              {/* {width < 1920 && width > 768 && listApproach.length > 4 ? (
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
                          className={`item-relationship ${item.value == status ? "active__item-block" : ""}`}
                          style={{ backgroundColor: item.color, color: 'white' }}
                          onClick={(e) => {
                            e && e.preventDefault();
                            handlClickOptionStatus(e, item.value);
                          }}
                        >
                          {item.label}
                        </div>
                      </SwiperSlide>
                    ) : null;
                  })}
                </Swiper>
              ) : ( */}
                <div className="list__relationship">
                  {listApproach.map((item, idx) => {
                    return item.label ? (
                      <div
                        key={idx}
                        className={`relationship-item ${item.value == status ? "active__relationship--item" : ""}`}
                        style={{ backgroundColor: item.color, color: 'white' }}
                        onClick={(e) => {
                          e && e.preventDefault();
                          handlClickOptionStatus(e, item.value);
                        }}
                      >
                        {item.label}
                      </div>
                    ) : null;
                  })}
                </div>
              {/* )} */}
            </div>
            
          </div>
          <div className={`${isRegimeKanban ? "d-none" : ""}`}>
            <SearchBox
              name="Tên chiến dịch marketing"
              params={params}
              isSaveSearch={true}
              listSaveSearch={listSaveSearch}
              isFilter={false}
              listFilterItem={customerFilterList}
              updateParams={(paramsNew) => setParams(paramsNew)}
            />

            {!isLoading && listCampaignMA && listCampaignMA.length > 0 ? (
              <BoxTable
                name="Danh sách chiến dịch marketing"
                titles={titles}
                items={listCampaignMA}
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
                        Hiện tại chưa có chiến dịch Marketing nào. <br />
                        Hãy thêm mới chiến dịch Marketing đầu tiên nhé!
                      </span>
                    }
                    type="no-item"
                    titleButton="Thêm mới chiến dịch Marketing"
                    action={() => {
                      setShowModalAdd(true);
                      setIdCampaignMA(null);
                      setDataCampaignMA(null);
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
          </div>

          <div className={`${isRegimeKanban ? "" : "d-none"}`}>
              <Kanban
                params={params}
                setParams={setParams}
                contractFilterList={customerFilterList}
                listApproach={listApproach}
                data={listCampaignMA}

                dataOfStatus_1={dataOfStatus_1}
                setDataOfStatus_1={setDataOfStatus_1}
                dataOfStatus_2={dataOfStatus_2}
                setDataOfStatus_2={setDataOfStatus_2}
                dataOfStatus_3={dataOfStatus_3}
                setDataOfStatus_3={setDataOfStatus_3}
                dataOfStatus_4={dataOfStatus_4}
                setDataOfStatus_4={setDataOfStatus_4}
                dataOfStatus_5={dataOfStatus_5}
                setDataOfStatus_5={setDataOfStatus_5}
                dataOfStatus_6={dataOfStatus_6}
                setDataOfStatus_6={setDataOfStatus_6}

                onReload={(reload, idStartPoint, idEndPoint) => {
                  if (reload) {
                    // getListCampaignMA(params)
    
                    // if (idStartPoint === 1 || idEndPoint === 1) {
                    //   getDataOfStatus(1);
                    // }
                    if (idStartPoint === 2 || idEndPoint === 2) {
                      getListChannel(2);
                    }
                    if (idStartPoint === 3 || idEndPoint === 3) {
                      getListChannel(3);
                    }
                    if (idStartPoint === 4 || idEndPoint === 4) {
                      getListChannel(4);
                    }
                    if (idStartPoint === 5 || idEndPoint === 5) {
                      getListChannel(5);
                    }
                    if (idStartPoint === 6 || idEndPoint === 6) {
                      getListChannel(6);
                    }

                  }
                }}
                campaignMaIdList={campaignMaIdList}
                setCampaignMAIdList={setCampaignMAIdList}
                customerIdlist={customerIdlist}
                setCustomerIdList={setCustomerIdList}
                columnList={columnList}
                setColumnList={setColumnList}
                checkColumn={checkColumn}
                setCheckColumn={setCheckColumn}
                dataCustomerList={dataCustomerList}
                setShowModalAdd={setShowModalAdd}
                setIsModalAllocateBudget={setIsModalAllocateBudget}
                setIsModalGiveGoal={setIsModalGiveGoal}
                setDataCampaignMA={setDataCampaignMA}
                setChannelItemData={setChannelItemData}
                showDialogConfirmDeleteChannel={showDialogConfirmDeleteChannel}
                showDialogConfirmDelete={showDialogConfirmDelete}
                setIsChangeStatusCampaign={setIsChangeStatusCampaign}
                setIsModalReport={setIsModalReport}
                setIsMarketingChannelInternal={setIsMarketingChannelInternal}
              />
          </div>

        
        </div>

        <ModalAddCampaignMA
            onShow={showModalAdd}
            idData={idCampaignMA}
            onHide={(reload) => {
              if (reload) {
                reLoadListCampaignMA();
              }
              setShowModalAdd(false);
              setIdCampaignMA(null);
            }}
        />

        <ModalAllocateBudget
            onShow={isModalAllocateBudget}
            idData={channelItemData?.id}
            idCampaign={dataCampaignMA?.id || channelItemData?.marketingId}
            onHide={(reload) => {
              if (reload) {
                getListChannel(2);
              }
              setIsModalAllocateBudget(false);
              setChannelItemData(null);
              setIdCampaignMA(null);
              setDataCampaignMA(null);
            }}
        />

        <ModalGiveGoal
          onShow={isModalGiveGoal}
          idData={channelItemData?.id}
          idCampaign={channelItemData?.marketingId}
          onHide={(reload) => {
            if (reload) {
              getListChannel(2);
              getListChannel(3);
            }
            setIsModalGiveGoal(false);
            setChannelItemData(null);
            setIdCampaignMA(null);
            setDataCampaignMA(null);
          }}
        />

        <ChangeStatusCampaign
          onShow={isChangeStatusCampaign}
          data={dataCampaignMA}
          onHide={(reload) => {
            if (reload) {
              getListCampaignMA(params);
              reLoadListCampaignMA();
            }
            setIsChangeStatusCampaign(false);
            setDataCampaignMA(null);
          }}
        />

        <MarketingReport
          onShow={isModalReport}
          data={channelItemData}
          onHide={(reload) => {
            if (reload) {
              // getListContractEform(params);
            }
            setIsModalReport(false);
            setChannelItemData(null);
          }}
        />
        
      <MarketingChannelInternal
        onShow={isMarketingChannelInternal}
        data={channelItemData}
        // checkEmail={checkEmail}
        onHide={(reload, type, mbtId) => {
          if (reload) {
            if(type === 'email'){
              navigate(`/email_marketting?mbtId=${mbtId}`)
            } 

            if(type === 'sms'){
              navigate(`/sms_marketting?mbtId=${mbtId}`)
            } 

            if(type === 'marketing_automation'){
              navigate(`/create_marketing_automation?mbtId=${mbtId}`)
            } 
          }
          setIsMarketingChannelInternal(false);
        }}
      />
    
        <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
