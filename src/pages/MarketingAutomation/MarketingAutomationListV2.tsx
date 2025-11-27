import React, { Fragment, useState, useEffect, useRef, useContext, useCallback } from "react";
import _, { set } from "lodash";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ICampaignFilterRequest } from "model/campaign/CampaignRequestModel";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { getPermissions, showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import Badge from "components/badge/badge";
import "./MarketingAutomationList.scss";
import { ContextType, UserContext } from "contexts/userContext";
import MarketingAutomationService from "services/MarketingAutomationService";
import ReportMa from "./ReportMa/ReportMa";
import AddMAModalV2 from "./AddMAModal/AddMAModalV2";
import ModalSigner from "./ModalSigner";
import { ExportExcel } from "exports";
import BusinessProcessService from "services/BusinessProcessService";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import WorkOrderService from "services/WorkOrderService";
import { uploadDocumentFormData } from "utils/document";
import InitBpmModalV2 from "./InitBpmModal/indexV2";
import { getListColumns } from "pages/OrderRequestList/partials/getListColumns";
import KanbanBpm from "components/kanbanBpm";
import ProcessedObjectService from "services/ProcessedObjectService";
import KanbanOrderRequestProcess from "pages/OrderRequestList/partials/KanbanOrderRequestProcess";
import KanbanMA from "./KanbanMA";

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

export default function MarketingAutomationListV2() {
  document.title = "Danh sách Marketing Automation V2";


  const navigate = useNavigate();
  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const checkIsKanban = localStorage.getItem("isKanbanBusinessProcess");
  const checkProcessId = localStorage.getItem("processId");
  const checkProcessName = localStorage.getItem("processName");
  const [listStepProcess, setListStepProcess] = useState([]);
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(checkIsKanban ? JSON.parse(checkIsKanban) : false);
  const [processId, setProcessId] = useState(checkProcessId ? JSON.parse(checkProcessId) : -1);
  const [processName, setProcessName] = useState<string>(checkProcessName ? checkProcessName : "Tất cả quy trình");
  const [hasHistorySignature, setHasHistorySignature] = useState<boolean>(false);
  const [listMarketingAutomation, setListMarketingAutomation] = useState([]);
  const [listBusinessProcess, setListBusinessProcess] = useState([]);
  const [idMA, setIdMA] = useState<number>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [showDialogPause, setShowDialogPause] = useState<boolean>(false);
  const [contentDialogPause, setContentDialogPause] = useState<any>(null);
  const [showDialogApprove, setShowDialogApprove] = useState<boolean>(false);
  const [contentDialogApprove, setContentDialogApprove] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailMA, setIsDetailMA] = useState<boolean>(false);
  const [dataMA, setDataMA] = useState(null);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [dataObject, setDataObject] = useState(null);
  const [listObject, setListObject] = useState([]);
  const [showModalInitBpm, setShowModalInitBpm] = useState<boolean>(false);
  const [valueProcess, setValueProcess] = useState(null);
  const [dataBusinessProcess, setDataBusinessProcess] = useState(null);
  const [checkColumn, setCheckColumn] = useState(null);
  const [columnList, setColumnList] = useState(undefined);
  const [idCampaign, setIdCampaign] = useState<number>(null);
  const [isLoadingKanban, setIsLoadingKanban] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("isKanbanBusinessProcess", JSON.stringify(isRegimeKanban));
  }, [isRegimeKanban]);

  useEffect(() => {
    localStorage.setItem("processId", JSON.stringify(processId));
  }, [processId]);

  useEffect(() => {
    localStorage.setItem("processName", processName);
  }, [processName]);

  const [params, setParams] = useState<ICampaignFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch, setListSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách",
      is_active: true,
    },
  ]);

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Chiến dịch",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListMarketingAutomation = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await MarketingAutomationService.list(paramsSearch);

    if (response.code == 0) {
      const result = response.result;
      setListMarketingAutomation(result.items || []);

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
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const getListBusinessProcess = async (paramsSearch: any) => {
    const response = await BusinessProcessService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setListBusinessProcess(result.items);
    }
  };

  const getListProcessedObject = async (paramsSearch) => {
    setIsLoading(true);

    const response = await ProcessedObjectService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListObject(result.items);

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
    //! đoạn này bao giờ có chức năng lọc thì viết vào đây
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListMarketingAutomation(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      //! đoạn này bao giờ có chức năng lọc thì viết vào đây
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const [showReport, setShowReport] = useState<boolean>(false);
  const [itemReport, setItemReport] = useState<any>(null);

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

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
          // {
          //   title: "Quay lại",
          //   icon: <Icon name="ChevronLeft" />,
          //   callback: () => {
          //     setIsRegimeKanban(!isRegimeKanban);
          //     clearKanban();
          //     // setParams({ ...params, approachId: -1 });
          //   },
          // },
        ]
        : [
          permissions["PROCESS_MANAGEMENT_ADD"] == 1 && {
            title: "Thêm mới",
        callback: () => {
           setShowModalAdd(true);
              setDataBusinessProcess(null);
                navigate("/create_marketing_automation_v2");
        },
      },
      ]),
    ],
  };

  const titles = ["STT", "Tên chương trình", "Danh sách khách hàng", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Xem báo cáo"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    <div
      key={item.id}
      className={`action__view--customer`}
      onClick={() => {
        navigate(`/detail_marketing_automation/maId/${item.id}`);
      }}
    >
      <a>Xem thêm</a>
    </div>,
    item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    <Badge key={index} variant={item.status === 1 ? "success" : "secondary"} text={item.status === 1 ? "Đã phê duyệt" : "Chưa phê duyệt"} />,
    <div
      key={item.id}
      className={`action__view--customer`}
      onClick={() => {
        setShowReport(true);
        setItemReport(item);
      }}
    >
      <a>Xem báo cáo</a>
    </div>,
  ];

  const onApprove = async (id, status) => {
    const param = {
      id,
      status: status,
    };
    const response = await MarketingAutomationService.approveMA(param);

    if (response.code === 0) {
      if (status === 1) {
        showToast("Phê duyệt thành công", "success");
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      }
      if (status === 2) {
        showToast("Tạm dừng thành công", "success");
        setShowDialogPause(false);
        setContentDialogPause(null);
      }

      getListMarketingAutomation(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // Hàm riêng cho callback Cài đặt MA
  const handleSetupMACallback = async (item) => {
    setIdCampaign(item.id);
    const detailProcess = await MarketingAutomationService.detail(item.id);
    if (detailProcess && detailProcess.result) {
      setDataObject({
        ...item,
        maId: item.id,
        id: detailProcess.result.id,
        processId: detailProcess.result.processId,
        processName: detailProcess.result.processName,
      });
    } else {
      showToast(detailProcess.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowModalInitBpm(true);
  };

  const actionsTable = (item: any): IAction[] => {
    return [
      ...(item.status !== 1
        ? [
            {
              title: "Phê duyệt",
              icon: <Icon name="FingerTouch" className="icon-warning" style={item.isSetup ? {} : { fill: "var(--extra-color-30)" }} />,
              callback: () => {
                if (item.isSetup) {
                  // onApprove(item.id, 1);
                  showDialogConfirmApprove(item, 1);
                } else {
                  showToast("Vui lòng cài đặt chương trình trước khi phê duyệt", "error");
                }
              },
            },
          ]
        : [
            {
              title: "Tạm dừng",
              icon: <Icon name="Pause" />,
              callback: () => {
                // onApprove(item.id, 2);
                showDialogConfirmPause(item, 2);
              },
            },
          ]),

      {
        title: "Cài đặt MA",
        icon: <Icon name="Settings" style={{ width: 18 }} />,
        callback: () => {
          handleSetupMACallback(item);
        },
      },

      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          navigate(`/edit_marketing_automation_v2/${item.id}`);
        },
      },

      ...(item.status !== 1
        ? [
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : []),
    ];
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        MarketingAutomationService.delete(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xoá chương trình  thành công", "success");
        getListMarketingAutomation(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const onDelete = async (id: number) => {
    const response = await MarketingAutomationService.delete(id);
    if (response.code === 0) {
      showToast("Xóa chương trình thành công", "success");
      getListMarketingAutomation(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICampaignResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "chương trình " : `${listIdChecked.length} chương trình đã chọn`}
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
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const showDialogConfirmPause = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Tạm dừng...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn tạm dừng {item ? "chương trình " : `${listIdChecked.length} chương trình đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogPause(false);
        setContentDialogPause(null);
      },
      defaultText: "Tạm dừng",
      defaultAction: () => {
        onApprove(item.id, status);
      },
    };
    setContentDialogPause(contentDialog);
    setShowDialogPause(true);
  };

  const showDialogConfirmApprove = (item?: any, status?: number) => {
    const contentDialog: IContentDialog = {
      color: "success",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Phê duyệt...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn phê duyệt {item ? "chương trình " : `${listIdChecked.length} chương trình đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}?
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialogApprove(false);
        setContentDialogApprove(null);
      },
      defaultText: "Phê duyệt",
      defaultAction: () => {
        onApprove(item.id, status);
      },
    };
    setContentDialogApprove(contentDialog);
    setShowDialogApprove(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa chương trình",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  //danh sách quy trình
  const loadOptionProcess = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BusinessProcessService.list(param);
    let optionProcess =
      page === 1
        ? [
        ]
        : [];

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length > 0) {
        dataOption.map((item: any) => {
          optionProcess.push({
            value: item.id,
            label: item.name,
            code: item.code,
          });
        });
      }

      return {
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
  }, [listBusinessProcess]);

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
  
  const [dataOfStep, setDataOfStep] = useState([]);
  // const [newDataOfStep, setNewDataOfStep] = useState([]);
  const [dataOfStepStart, setDataOfStepStart] = useState([]);
  const [dataOfStepSuccess, setDataOfStepSuccess] = useState([]);

  const getDataOfStep = async (paramsSearch, stepName) => {
    // const newDataStep = [...newDataOfStep];
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

      // newDataStep.push(newData)
      // setNewDataOfStep(newDataStep);
      // setDataOfApproach(newDataApproach)
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOfStepAction = async (paramsSearch, stepName) => {
    const response = await BusinessProcessService.listWorkFlow(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      let listDataOfStep = [...dataOfStep];
      const indexData = listDataOfStep.findIndex((el) => el.stepId === paramsSearch.workflowId);

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

  // useEffect(() => {
  //   getDataOfStepSpecial(processId, 0);
  //   getDataOfStepSpecial(processId, 2);
  // }, [processId]);

  // const clearKanban = () => {
  //   setColumnList(undefined);
  // };

  const titlesExcelOLA = [
    "STT",
    "Tên nhân viên",
    "Bộ phận",
    "ID công việc",
    "Công việc",
    "Dự án",
    "Gói thầu",
    "Quy trình",
    "OLA phản hồi cài đặt theo quy trình",
    "OLA xử lý cài đặt theo quy trình",
    "Thời điểm xuất hiện công việc",
    "Thời điểm click chuột lần đầu tiên",
    "Thời điểm phản hồi xác nhận/ từ chối công việc",
    "Thời điểm hoàn thành công việc (lần đầu)",
    "Thời điểm hoàn thành công việc lần cuối (trường hợp hồ sơ quay vòng)",
    "Số lần hồ sơ quay vòng (lặp lại)",
    "Thời gian phản hồi thực tế",
    "Thời gian xử lý hoàn thành công việc thực tế",
    "Trạng thái vi phạm OLA phản hồi",
    "Trạng thái vi phạm OLA xử lý",
    "Nguyên nhân vi phạm OLA",
  ];

  const formatExportOLA = [
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
  ];

  const dataMappingArray_OLA_SLA = (item: any, index: number, type?: string) =>
    type === "ola"
      ? [
        index + 1,
        item.employeeName,
        item.departmentName,
        item.potId,
        item.nodeName,
        item.projectName,
        item.bidPackpage,
        item.processName || item.nodeName,
        `${item.planResponseDay || 0} ngày, ${item.planResponseHour < 10 ? `0${item.planResponseHour || 0}` : item.planResponseHour}:${item.planResponseMinute < 10 ? `0${item.planResponseMinute || 0}` : item.planResponseMinute
        }`,
        `${item.planExecutionDay || 0} ngày, ${item.planExecutionHour < 10 ? `0${item.planExecutionHour || 0}` : item.planExecutionHour}:${item.planExecutionMinute < 10 ? `0${item.planExecutionMinute || 0}` : item.planExecutionMinute
        }`,
        item.transitTime ? moment(item.transitTime).format("DD/MM/YYYY HH:mm:ss") : "",
        item.firstSeenTime ? moment(item.firstSeenTime).format("DD/MM/YYYY HH:mm:ss") : "",
        item.receivedTime ? moment(item.receivedTime).format("DD/MM/YYYY HH:mm:ss") : "",
        item.processedTime ? moment(item.processedTime).format("DD/MM/YYYY HH:mm:ss") : "",
        item.lastProcessedTime ? moment(item.lastProcessedTime).format("DD/MM/YYYY HH:mm:ss") : "",
        item.repeatNumber,
        `${item.actualResponseDay || 0} ngày, ${item.actualResponseHour < 10 ? `0${item.actualResponseHour || 0}` : item.actualResponseHour}:${item.actualResponseMinute < 10 ? `0${item.actualResponseMinute}` : item.actualResponseMinute
        }`,
        `${item.actualExecutionDay || 0} ngày, ${item.actualExecutionHour < 10 ? `0${item.actualExecutionHour || 0}` : item.actualExecutionHour}:${item.actualExecutionMinute < 10 ? `0${item.actualExecutionMinute}` : item.actualExecutionMinute
        }`,
        item.responseTimeViolation === 1 ? "Vi phạm" : "",
        item.executionTimeViolation === 1 ? "Vi phạm" : "",
        item.reason,
      ]
      : [
        index + 1,
        item.nodeName,
        item.bidPackpage,
        item.projectName,
        // item.lstSLADepartmentResponse
      ];
  const exportCallback = useCallback(async (data, extension, type) => {
    let response;
    if (type === "ola") {
      response = await WorkOrderService.exportOLA({
        page: 1,
        limit: 10000,
        processId: data.id,
        // employeeId: data.employeeId
      });
    } else if (type === "sla") {
      response = await WorkOrderService.exportSLA({
        page: 1,
        limit: 10000,
        processId: data.id,
        fromTime: "07/01/2025",
        toTime: moment(new Date()).format("DD/MM/YYYY"),
        // employeeId: data.employeeId
      });
    }

    if (response.code === 0) {
      const result = response.result;

      if (type === "sla") {
        const headerFormatSLA: any = [
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
        ];
        const formatExportSLA = ["center", "center", "center", "center"];
        const titleSLA = ["STT", "Mã gói thầu", "Gói thầu", "Dự án"];
        const titleChildSLA = ["", "", "", ""];
        const newtitleSale = result.value && result.value.length > 0 ? result.value.filter((el) => el.parentId) : [];

        newtitleSale.map((item) => {
          titleSLA.push(item.name || item.id.toString(), "", "", "", "", "");
          titleChildSLA.push(
            "SLA phản hồi tiêu chuẩn",
            "SLA phản hồi thực tế",
            "Trạng thái vi phạm SLA phản hồi",
            "SLA xử lý tiêu chuẩn",
            "SLA xử lý thực tế",
            "Trạng thái vi phạm SLA thực tế"
          );
          headerFormatSLA.push(
            {
              merge: {
                col: 6,
              },
            },
            {},
            {},
            {},
            {},
            {}
          );
          formatExportSLA.push("center", "center", "center", "center", "center", "center");
        });

        headerFormatSLA.push({}, {}, {}, {});

        const headerTotalSLA = [headerFormatSLA];
        titleSLA.push("SLA tiêu chuẩn toàn quy trình", "Thời gian bắt đầu", "Thời gian kết thúc", "TAT");
        titleChildSLA.push("", "", "", "");
        const titleTotalSLA = [titleSLA, titleChildSLA];

        formatExportSLA.push("center", "center", "center", "center");

        if (extension === "excel") {
          ExportExcel({
            fileName: "Export SLA",
            title: "Export SLA",
            header: titleTotalSLA,
            formatExcel: formatExportSLA,
            // data: result.key.map((item, idx) => dataMappingArray(item, idx, type)),
            data: result.key.map((item, idx) => {
              const newList = [idx + 1, item.potId || item.nodeName, item.bidPackpage, item.projectName];
              const lstSLADepartmentResponse = item.lstSLADepartmentResponse || [];
              lstSLADepartmentResponse.map((el) => {
                newList.push(
                  `${el.planResponseDay || 0} ngày, ${el.planResponseHour < 10 ? `0${el.planResponseHour || 0}` : el.planResponseHour}:${el.planResponseMinute < 10 ? `0${el.planResponseMinute || 0}` : el.planResponseMinute
                  }`,
                  `${el.actualResponseDay || 0} ngày, ${el.actualResponseHour < 10 ? `0${el.actualResponseHour || 0}` : el.actualResponseHour}:${el.actualResponseMinute < 10 ? `0${el.actualResponseMinute}` : el.actualResponseMinute
                  }`,
                  el.responseTimeViolation === 1 ? "Vi phạm" : "",
                  `${el.planExecutionDay || 0} ngày, ${el.planExecutionHour < 10 ? `0${el.planExecutionHour || 0}` : el.planExecutionHour}:${el.planExecutionMinute < 10 ? `0${el.planExecutionMinute || 0}` : el.planExecutionMinute
                  }`,
                  `${el.actualExecutionDay || 0} ngày, ${el.actualExecutionHour < 10 ? `0${el.actualExecutionHour || 0}` : el.actualExecutionHour}:${el.actualExecutionMinute < 10 ? `0${el.actualExecutionMinute}` : el.actualExecutionMinute
                  }`,
                  el.executionTimeViolation === 1 ? "Vi phạm" : ""
                );
              });
              newList.push(
                `${item.planExecutionDay || 0} ngày, ${item.planExecutionHour < 10 ? `0${item.planExecutionHour || 0}` : item.planExecutionHour}:${item.planExecutionMinute < 10 ? `0${item.planExecutionMinute || 0}` : item.planExecutionMinute
                }`,
                item.startTime ? moment(item.startTime).format("DD/MM/YYYY HH:mm:ss") : "",
                item.endTime ? moment(item.endTime).format("DD/MM/YYYY HH:mm:ss") : "",
                `${item.executionDay || 0} ngày, ${item.executionHour < 10 ? `0${item.executionHour || 0}` : item.executionHour}:${item.executionMinute < 10 ? `0${item.executionMinute || 0}` : item.executionMinute
                }`
              );

              return newList;
              // (
              //   [
              //     idx + 1,
              //     item.nodeName,
              //     item.bidPackpage,
              //     item.projectName,
              //     // item.lstSLADepartmentResponse
              //   ]
              // )
            }),
            info: { name },
            headerFormat: headerTotalSLA,
          });
        }
      }

      if (type === "ola") {
        if (extension === "excel") {
          ExportExcel({
            fileName: "Export OLA",
            title: "Export OLA",
            header: titlesExcelOLA,
            formatExcel: formatExportOLA,
            data: result.map((item, idx) => dataMappingArray_OLA_SLA(item, idx, type)),
            info: { name },
          });
        }
      }

      showToast("Xuất file thành công", "success");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  }, []);

  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);
  const handleUploadDocument = (e) => {
    e.preventDefault();

    const file = e.target.files[0];

    const checkFile = file.type;
    setIsLoadingFile(true);

    if (checkFile.startsWith("application")) {
      uploadDocumentFormData(file, onSuccess, onError, onProgress, "processData");
    }

    e.target.value = ""; // Reset the input value to allow re-uploading the same file
  };

  //* Xử lý tài liệu
  const onSuccess = (data) => {
    if (data) {
      showToast("Import dữ liệu quy trình thành công!", "success");
      const result = {
        fileUrl: data.fileUrl,
        type: data.extension,
        fileName: data.fileName,
        fileSize: data.fileSize,
      };

      setIsLoadingFile(false);
    }
  };

  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
    }
  };


  return (
    <div className={`page-content page-automation-marketing-list${isNoItem ? " bg-white" : ""}`}>
      <div className="container-header">
        <TitleAction title={isRegimeKanban ? "Danh sách đối tượng " : "Danh sách Marketing Automation V2"} />
        <div className="container-left">
          <div className="container-button-header">
            <div
              className={isRegimeKanban ? "style-list-button-inactive" : "style-list-button-active"}
              onClick={() => {
                setIsRegimeKanban(false);
                setHasHistorySignature(false);
              }}
            >
              <Icon name="ListData" />
              <span className="title">Danh sách</span>
            </div>

            <div
              className={isRegimeKanban ? "style-list-button-active" : "style-list-button-inactive"}
              onClick={() => {
                setIsRegimeKanban(true);
                if (processId == -1) {
                  setProcessId(listBusinessProcess && listBusinessProcess.length > 0 && +listBusinessProcess[0].id);
                  setProcessName(listBusinessProcess[0]?.name);
                } else {
                  setProcessId(processId);
                }
              }}
            >
              <Icon name="Kanban" />
              <span className="title">Kanban</span>
            </div>
          </div>
          {isRegimeKanban ? null : (
            <Button
              type="button"
              onClick={() => {
                navigate("/create_marketing_automation_v2");
              }}
            >
              <Icon name="Plus" style={{ width: 13, height: 13 }} />
              Thêm mới
            </Button>
          )}
        </div>
      </div>
      {showReport ? (
        <ReportMa dataMaReport={itemReport} />
      ) : (
        <div className="card-box d-flex flex-column">
          <div className={`${!hasHistorySignature ? (!isRegimeKanban ? "d-none" : "quick__search") : "d-none"}`}>
            <div style={{ width: "45rem" }}>
              <SelectCustom
                id="processId"
                name="processId"
                fill={true}
                required={true}
                options={[]}
                value={valueProcess}
                onChange={(e) => handleChangeValueProcess(e)}
                isAsyncPaginate={true}
                placeholder="Chọn quy trình"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadOptionProcess}
              />
            </div>
          </div>
          <div className={`${isRegimeKanban ? "d-none" : ""}`}>
          <SearchBox
            name="Tên chương trình"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />

          {!isLoading && listMarketingAutomation && listMarketingAutomation.length > 0 ? (
            <BoxTable
              name="Chương trình Marketing Automation V2"
              titles={titles}
              items={listMarketingAutomation}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              isBulkAction={true}
              bulkActionItems={bulkActionList}
              listIdChecked={listIdChecked}
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
                      Hiện tại chưa có chương trình MA nào. <br />
                      Hãy thêm mới chương trình MA đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới chương trình MA"
                  action={() => {
                    // setIdMA(null);
                    // setShowModalAdd(true);
                    navigate("/create_marketing_automation_v2");
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
          </div>

          <div className={`${!hasHistorySignature ? (isRegimeKanban ? "" : "d-none") : "d-none"}`}>
            <KanbanMA 
              // processCode={processId}
              processCode={valueProcess?.code}
            />
          </div>
          <input type="file" accept=".xlsx,.xls" className="d-none" id="ImportData" onChange={(e) => handleUploadDocument(e)} />
        </div>
      )}

      <AddMAModalV2
        onShow={showModalAdd}
        idData={idMA}
        onHide={(reload) => {
          if (reload) {
            getListMarketingAutomation(params);
          }
          setShowModalAdd(false);
        }}
      />
      <ModalSigner
        onShow={hasSignature}
        onHide={(reload) => {
          if (reload) {
            getListProcessedObject(params);
          }
          setDataObject(null);
          setHasSignature(false);
        }}
        data={dataObject}
      />

      <InitBpmModalV2
        onShow={showModalInitBpm}
        idCampaign={idCampaign}
        onHide={(reload) => {
          if (reload) {
            getListMarketingAutomation(params);
          }
          setShowModalInitBpm(false);
          setIdCampaign(null);
        }}
      />
      
      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDialogPause} isOpen={showDialogPause} />
      <Dialog content={contentDialogApprove} isOpen={showDialogApprove} />
    </div>
  );
}
