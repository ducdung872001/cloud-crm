import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _, { set } from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IWorkTypeResponse } from "model/workType/WorkTypeResponseModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import CustomerService from "services/CustomerService";
import "./index.scss";
import ModalAddOpportunity from "./partials/ModalRequestDetail";
import { useSearchParams } from "react-router-dom";
import OrderRequestService from "services/OrderRequestService";
import moment from "moment";
import ModalRequestDetail from "./partials/ModalRequestDetail";
import SelectCustom from "components/selectCustom/selectCustom";
import BusinessProcessService from "services/BusinessProcessService";
import { getListColumns } from "./partials/getListColumns";
import KanbanOrderRequestProcess from "./partials/KanbanOrderRequestProcess";

const statusText = {
  PENDING: "Chờ xác nhận",
  COMPLETED: "Hoàn thành",
  PROCESSING: "Đang xử lý",
  RECOMMENDED: "Đã đề xuất lại",
  STORE_RECOMMENDED: "Cửa hàng đề xuất",
  CUSTOMER_CANCELED: "Đã huỷ",
  STORE_CANCELED: "Cửa hàng hủy",
};
const statusColor = {
  PENDING: "orange",
  COMPLETED: "green",
  PROCESSING: "blue",
  RECOMMENDED: "blue",
  STORE_RECOMMENDED: "purple",
  CUSTOMER_CANCELED: "red",
  STORE_CANCELED: "red",
};

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

export default function OrderRequestList() {
  document.title = "Danh sách yêu cầu mua hàng";

  const isMounted = useRef(false);

  const [listOpportunity, setLisOpportunity] = useState([]);
  const [dataOpportunity, setDataOpportunity] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);

  //Kanban BPM
  const checkProcessId = (localStorage.getItem("processOrderRequestId") && JSON.parse(localStorage.getItem("processOrderRequestId"))) || -1;
  const checkProcessName = localStorage.getItem("processOrderRequestName");
  // const [processId, setProcessId] = useState(() => {
  //   return checkProcessId ? checkProcessId : -1;
  // });
  const [processId, setProcessId] = useState(1518);
  const [processName, setProcessName] = useState<string>(checkProcessName ? checkProcessName : "Chọn quy trình");
  const [dataOfStep, setDataOfStep] = useState([]);
  const [dataOfStepStart, setDataOfStepStart] = useState([]);
  const [dataOfStepSuccess, setDataOfStepSuccess] = useState([]);
  const [dataObject, setDataObject] = useState(null);
  const [listStepProcess, setListStepProcess] = useState([]);
  const [columnList, setColumnList] = useState(undefined);
  const [checkColumn, setCheckColumn] = useState(null);
  const [isLoadingKanban, setIsLoadingKanban] = useState<boolean>(false);
  const [hasHistorySignature, setHasHistorySignature] = useState<boolean>(false);

  const isCreate = searchParams.get("isCreate") || null;

  useEffect(() => {
    if (isCreate) {
      setDataOpportunity(null);
      setShowModalAdd(true);
    }
  }, [isCreate]);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch, setListSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách yêu cầu mua hàng",
      is_active: true,
    },
    // {
    //   key: "report",
    //   name: "Báo cáo yêu cầu đặt hàng",
    //   is_active: false,
    // },
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

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      // {
      //   key: "customerId",
      //   name: "Khách hàng",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("customerId") ?? "",
      // },
      // {
      //   key: "employeeId",
      //   name: "Nhân viên",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("employeeId") ?? "",
      // },
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "yêu cầu đặt hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListOpportunity = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await OrderRequestService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setLisOpportunity(result.items || []);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListOpportunity(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
            {
              title: "Danh sách yêu cầu",
              callback: () => {
                // hiển thị chế độ kanban
                setIsRegimeKanban(!isRegimeKanban);
              },
            },
          ]
        : [
            // {
            //   title: "Thêm mới",
            //   callback: () => {
            //     setDataClaim(null);
            //     setShowModalAdd(true);
            //   },
            // },
            {
              title: "Kanban",
              callback: () => {
                setIsRegimeKanban(true);
              },
            },
          ]),
    ],
  };

  const titles = ["STT", "Tên đại lý", "Tên khách hàng", "Sản phẩm", "Ngày đặt", "Nơi đặt", "Ghi chú", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "", "text-center", "", "", "text-center"];

  const [showModalRequestDetail, setShowModalRequestDetail] = useState<boolean>(false);
  const [dataRequestDetail, setDataRequestDetail] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item?.beautySalonName || item.bsnId,
    item?.customerInfo ? JSON.parse(item.customerInfo).name : "",
    <a
      onClick={(e) => {
        if (item?.orderInfo && JSON.parse(item?.orderInfo) && JSON.parse(item?.orderInfo)?.items?.length > 0) {
          setShowModalRequestDetail(true);
          setDataRequestDetail(JSON.parse(item.orderInfo).items);
          setCustomerInfo(item?.customerInfo ? JSON.parse(item.customerInfo) : null);
        }
      }}
    >
      {"Xem " + (item?.orderInfo ? JSON.parse(item.orderInfo)?.items?.length : "0") + " sản phẩm"}
    </a>,
    item?.createdAt ? moment(item.createdAt).format("DD/MM/YYYY") : "",
    item?.src || "",
    item?.note || "",
    <div
      className={`status-table status-${statusColor[item.status]}`}
      style={{
        fontWeight: 500,
        fontSize: 14,
        color: `${statusColor[item.status]}`,
        border: `1px solid ${statusColor[item.status]}`,
        padding: "4px 8px",
        borderRadius: "8px",
        // minWidth: "132px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {statusText[item.status]}
    </div>,
  ];

  const actionsTable = (item: IWorkTypeResponse): IAction[] => {
    return [
      // {
      //   title: "Sửa",
      //   icon: <Icon name="Pencil" />,
      //   callback: () => {
      //     setDataOpportunity(item);
      //     setShowModalAdd(true);
      //   },
      // },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await OrderRequestService.delete(id);

    if (response.code === 0) {
      showToast("Xóa loại yêu cầu đặt hàng thành công", "success");
      getListOpportunity(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IWorkTypeResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "yêu cầu đặt hàng " : `${listIdChecked.length} yêu cầu đặt hàng đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa loại yêu cầu đặt hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  useEffect(() => {
    setValueProcess({
      value: processId,
      label: processName,
    });

    if (processId === -1) {
    } else {
      getListStepProcess(processId);
    }
  }, [processId]);

  const [valueProcess, setValueProcess] = useState(null);

  const loadOptionProcess = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      type: 3,
    };
    const response = await BusinessProcessService.list(param);
    const optionProcess =
      page === 1
        ? [
            // {
            //   value: -1,
            //   label: "Tất cả quy trình",
            // },
          ]
        : [];

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length > 0) {
        dataOption.map((item: any) => {
          optionProcess.push({
            value: item.id,
            label: item.name,
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
        options: optionProcess,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  useEffect(() => {
    loadOptionProcess("", undefined, { page: 1 });
  }, []);

  const handleChangeValueProcess = (e) => {
    getListColumns(+e.value);
    setDataOfStep([]);
    setValueProcess(e);
    setProcessId(+e.value);
    setProcessName(e.label);
    if (e.value === -1) {
      setIsRegimeKanban(false);
    }
    clearKanban();
  };
  const clearKanban = () => {
    // setContractIdList([]);
    // setCustomerIdList([]);
    // setDataCustomerList([]);
    setColumnList(undefined);
    setCheckColumn(null);
  };
  //lấy danh sách bước của quy trình
  const [listColumn, setListColumn] = useState([]);

  const getListStepProcess = async (processId) => {
    const body: any = {
      processId,
      limit: 100,
    };

    const response = await BusinessProcessService.listStep(body);
    if (response.code === 0) {
      const dataOption = response.result.items;

      setListStepProcess([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                value: item.id,
                label: item.stepName,
                color: colorData[index],
                processId: item.processId,
                step: item.stepNumber,
              };
            })
          : []),
      ]);
      setListColumn([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                id: item.id,
                title: item.stepName,
                color: colorData[index],
                processId: item.processId,
                step: item.stepNumber,
              };
            })
          : []),
        {
          id: "done",
          title: "Hoàn thành",
          color: "#1bc10d",
          processId: processId || listStepProcess[0]?.processId,
          items: [],
          hasMore: false,
          page: 1,
        },
      ]);
      console.log("Ok1234>>", [
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => {
              return {
                id: item.id,
                title: item.stepName,
                color: colorData[index],
                processId: item.processId,
                step: item.stepNumber,
              };
            })
          : []),
        {
          id: "done",
          title: "Hoàn thành",
          color: "#1bc10d",
          processId: processId || listStepProcess[0]?.processId,
          items: [],
          hasMore: false,
          page: 1,
        },
      ]);
      setIsLoadingKanban(false);
    }
  };

  const getDataOfStep = async (paramsSearch, stepName) => {
    return;
    const response = await BusinessProcessService.listWorkFlow(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const newData = {
        stepId: paramsSearch.workflowId,
        stepName: stepName,
        value: result?.items,
        hasMore: result?.loadMoreAble,
        page: result?.page,
      };

      setDataOfStep((oldArray) => [...oldArray, newData]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOfStepSpecial = async (processId, status) => {
    const param = {
      processId: processId,
      limit: 10,
      page: 1,
      workflowId: -1,
      status: status,
    };
    const response = await BusinessProcessService.listWorkFlow(param, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      if (status === 2) {
        setDataOfStepSuccess(result);
      } else {
        setDataOfStepStart(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };
  const getDataOfStepAction = async (paramsSearch, stepName) => {
    const response = await BusinessProcessService.listWorkFlow(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      const listDataOfStep = [...dataOfStep];
      const indexData = listDataOfStep?.findIndex((el) => el.stepId === paramsSearch.workflowId);

      if (indexData !== -1) {
        const newData = {
          stepId: paramsSearch.workflowId,
          stepName: stepName,
          value: result?.items,
          hasMore: result?.loadMoreAble,
          page: result?.page,
        };

        listDataOfStep[indexData] = newData;
      }
      setDataOfStep(listDataOfStep);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (listStepProcess && listStepProcess.length > 0 && processId && processId !== -1) {
      listStepProcess.map((item, index) => {
        const param = {
          processId: processId,
          workflowId: item.value,
          // workflowId: -1,
          limit: 10,
          page: 1,
        };
        getDataOfStep(param, item.label);
      });
    }
  }, [listStepProcess, processId]);

  return (
    <div className={`page-content page-opportunity-list${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách yêu cầu mua hàng" titleActions={titleActions} />
      <div className={`${isRegimeKanban ? "d-none" : ""}`}>
        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Tên yêu cầu đặt hàng"
            setTabActive={setTabActive}
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            // isFilter={true}
            isFilter={tabActive == "all" ? true : false}
            isHiddenSearch={tabActive == "all" ? false : true}
            listFilterItem={customerFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {tabActive == "all" ? (
            <>
              {!isLoading && listOpportunity && listOpportunity.length > 0 ? (
                <BoxTable
                  name="Danh sách yêu cầu mua hàng"
                  titles={titles}
                  items={listOpportunity}
                  isPagination={true}
                  dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  isBulkAction={true}
                  listIdChecked={listIdChecked}
                  bulkActionItems={bulkActionList}
                  striped={true}
                  setListIdChecked={(listId) => setListIdChecked(listId)}
                  actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <Fragment>
                  {isPermissions ? (
                    <SystemNotification type="no-permission" />
                  ) : isNoItem ? (
                    <SystemNotification
                      description={
                        <span>
                          Hiện tại chưa có yêu cầu đặt hàng nào. <br />
                          Hãy thêm mới loại công việc đầu tiên nhé!
                        </span>
                      }
                      type="no-item"
                      titleButton="Thêm mới yêu cầu đặt hàng"
                      action={() => {
                        setDataOpportunity(null);
                        setShowModalAdd(true);
                      }}
                    />
                  ) : (
                    <SystemNotification
                      description={
                        <span>
                          Không có dữ liệu trùng khớp.
                          <br />
                          Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                        </span>
                      }
                      type="no-result"
                    />
                  )}
                </Fragment>
              )}
            </>
          ) : null}
        </div>
      </div>
      <div className={`${!isRegimeKanban ? "d-none" : ""}`}>
        {/* <div style={{ width: "45rem", paddingTop: "2rem", paddingRight: "2rem", paddingLeft: "2rem" }}>
          <SelectCustom
            id="processId"
            name="processId"
            fill={true}
            required={true}
            options={[]}
            value={valueProcess}
            onChange={(e) => {
              if (e.value !== processId) {
                setIsLoadingKanban(true);
                handleChangeValueProcess(e);
              }
            }}
            isAsyncPaginate={true}
            placeholder="Chọn quy trình"
            additional={{
              page: 1,
            }}
            loadOptionsPaginate={loadOptionProcess}
          />
        </div> */}
        <div className={`${isLoadingKanban ? "" : "d-none"}`}>
          <Loading />
        </div>
        <div className={`${!isLoadingKanban ? "" : "d-none"}`}>
          <KanbanOrderRequestProcess processId={processId} />
          {/* <KanbanOrderRequestProcess
            processType="claim"
            params={params}
            setIsLoading={setIsLoadingKanban}
            setParams={setParams}
            processId={processId}
            listColumn={listColumn}
            // data={listManagementInvoice}
            dataOfStep={dataOfStep}
            setDataOfStep={setDataOfStep}
            dataStart={dataOfStepStart}
            setDataStart={setDataOfStepStart}
            dataSuccess={dataOfStepSuccess}
            listStepProcess={listStepProcess}
            callbackHistory={(e) => {
              setHasHistorySignature(true);
              setDataObject(e);
            }}
            onReload={(reload, itemObject) => {
              if (reload) {
                if (itemObject?.status === 0 || itemObject?.status === 2) {
                  getDataOfStepSpecial(processId, itemObject?.status);
                }
                if (itemObject?.status === 1) {
                  if (listStepProcess && listStepProcess.length > 0) {
                    const dataChoosedStep = listStepProcess?.find((el) => el.value === itemObject.workflowId);

                    const param = {
                      processId: processId,
                      workflowId: dataChoosedStep.value,
                      limit: 10,
                      page: 1,
                    };
                    getDataOfStepAction(param, dataChoosedStep.label);
                  }
                }
              }
            }}
          /> */}
        </div>
      </div>

      <ModalRequestDetail
        onShow={showModalRequestDetail}
        data={dataRequestDetail}
        customerInfo={customerInfo}
        onHide={(reload) => {
          if (reload) {
          }
          setShowModalRequestDetail(false);
          setDataRequestDetail(null);
          setCustomerInfo(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
