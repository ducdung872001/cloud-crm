import React, { Fragment, useState, useEffect, useRef, useContext, useMemo } from "react";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Badge from "components/badge/badge";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, getPageOffset, getSearchParameters, isDifferenceObj, removeAccents } from "reborn-util";
import QuoteService from "services/QuoteService";
import { ContextType, UserContext } from "contexts/userContext";
import AddQuote from "./partials/AddQuote";
import AddFormQuote from "./partials/AddFormQuoteBackup";
import ViewDetailFsModal from "./partials/ViewDetailFS";
import CopyItemModal from "./partials/CopyItemModal";
import ProcessedObjectService from "services/ProcessedObjectService";
import AddTemplateFSQuote from "pages/Common/AddTemplateFSQuote";
import ModelSinger from "pages/SettingProcess/partials/ProcessedObjectList/partials/ModalSigner/index";
import ViewHistorySignature from "pages/Common/ViewHistorySignature";
import { CustomExportReport } from "exports/customExportReport";
import { useSearchParams } from "react-router-dom";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";
import SelectCustom from "components/selectCustom/selectCustom";
import BusinessProcessService from "services/BusinessProcessService";
import Kanban from "pages/BPM/BusinessProcessList/Kanban/Kanban";
import SaleFlowService from "services/SaleFlowService";
import SaleflowApproachService from "services/SaleflowApproachService";
import SaleflowInvoiceService from "services/SaleflowInvoiceService";
import KanbanOrderRequestProcess from "pages/OrderRequestList/partials/KanbanOrderRequestProcess";
import KanbanSale from "pages/ManagementSale/partials/Kanban/Kanban";
import HistoryProcess from "pages/BPM/BusinessProcessList/HistoryProcess/index"; 
import Button from "components/button/button";

import "./index.scss";

// thêm
const colorData = [
  "#E98E4C", "#ED6665", "#FFBF00", "#9966CC", "#6A5ACD", "#007FFF",
  "#993300", "#F0DC82", "#CC5500", "#C41E3A", "#ACE1AF", "#7FFF00",
  "#FF7F50", "#BEBEBE", "#FF00FF", "#C3CDE6", "#FFFF00", "#40826D", "#704214",
];

export default function QuotationsNew() {
  document.title = "Danh sách báo giá mới";

  const isMounted = useRef(false);
  const checkIsKanban = localStorage.getItem("isKanbanBusinessProcess");

  const { name, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const takeParamsUrl = getSearchParameters();

  const [searchParams, setSearchParams] = useSearchParams();
  const [listQuote, setListQuote] = useState([]);
  const [dataQuote, setDataQuote] = useState(null);
  const [dataObject, setDataObject] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalSetingQuote, setShowModalSetingQuote] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalChooseTemplate, setShowModalChooseTemplate] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [hasCopyQuote, setHasCopyQuote] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [hasHistorySignature, setHasHistorySignature] = useState<boolean>(false);
  const [viewType, setViewType] = useState<'list' | 'kanban'>('list');
  const [contractId, setContractId] = useState<number>(() => {
    return takeParamsUrl?.contractId ? takeParamsUrl?.contractId : null;
  });

  // Kanban for Order Request: states and helpers
  const checkProcessOrderRequestId = (localStorage.getItem("processOrderRequestId") && JSON.parse(localStorage.getItem("processOrderRequestId"))) || -1;
  const checkProcessOrderRequestName = localStorage.getItem("processOrderRequestName");

  const [processOrderRequestId, setProcessOrderRequestId] = useState<number>(1518);
  const [processOrderRequestName, setProcessOrderRequestName] = useState<string>(
    checkProcessOrderRequestName ? checkProcessOrderRequestName : "Chọn quy trình"
  );
  const [dataOfStepOrderRequest, setDataOfStepOrderRequest] = useState([]);
  const [columnListOrderRequest, setColumnListOrderRequest] = useState<any>(undefined);
  const [checkColumnOrderRequest, setCheckColumnOrderRequest] = useState<any>(null);
  const [isLoadingKanbanOrderRequest, setIsLoadingKanbanOrderRequest] = useState<boolean>(false);
  const [valueProcessOrderRequest, setValueProcessOrderRequest] = useState<any>(null);

  // Local helper to fetch columns for an order-request process. Attempts a service call
  // if available, otherwise clears columns and stops loading.
  const getListColumnsOrderRequest = async (procId: number) => {
    try {
      // If a service method exists on BusinessProcessService to get columns, call it.
      if ((BusinessProcessService as any).getColumns) {
        const resp = await (BusinessProcessService as any).getColumns({ processId: procId });
        if (resp && resp.code === 0) {
          setColumnListOrderRequest(resp.result || undefined);
        } else {
          setColumnListOrderRequest(undefined);
        }
      } else {
        // fallback: clear columns (caller can implement real fetch elsewhere)
        setColumnListOrderRequest(undefined);
      }
    } catch (err) {
      setColumnListOrderRequest(undefined);
    } finally {
      setIsLoadingKanbanOrderRequest(false);
    }
  };

  // Async options loader for select (order request processes). Uses type:3 as requested.
  const loadOptionProcessOrderRequest = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      type: 3,
    };
    const response = await BusinessProcessService.list(param);
    const optionProcess: any[] = page === 1 ? [] : [];

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
        options: optionProcess,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  // Handler when selecting a process for order-request Kanban
  const handleChangeValueProcessOrderRequest = (e) => {
    setIsLoadingKanbanOrderRequest(true);
    getListColumnsOrderRequest(+e.value);
    setDataOfStepOrderRequest([]);
    setValueProcessOrderRequest(e);
    setProcessOrderRequestId(+e.value);
    setProcessOrderRequestName(e.label);

    // Persist selection
    localStorage.setItem("processOrderRequestId", JSON.stringify(+e.value));
    localStorage.setItem("processOrderRequestName", e.label);

    if (e.value === -1) {
      // if -1, switch off Kanban mode
      // keep existing isRegimeKanban handling in component
    }
    // Keep local columns cleared until fetch completes
  };

  useEffect(() => {
    setValueProcessOrderRequest({ value: processOrderRequestId, label: processOrderRequestName });
  }, [processOrderRequestId]);

  useEffect(() => {
    // Warm the select options (non-blocking)
    loadOptionProcessOrderRequest("", undefined, { page: 1 });
  }, []);

    // Thêm vào sau các state hiện tại
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(
    checkIsKanban ? JSON.parse(checkIsKanban) : false
  );
  const checkProcessId = localStorage.getItem("processId");
  const checkProcessName = localStorage.getItem("processName");

  const [processId, setProcessId] = useState(
    checkProcessId ? JSON.parse(checkProcessId) : -1
  );
  const [processName, setProcessName] = useState<string>(
    checkProcessName ? checkProcessName : "Tất cả quy trình"
  );
  const [valueProcess, setValueProcess] = useState(null);
  const [listStepProcess, setListStepProcess] = useState([]);
  const [dataOfStep, setDataOfStep] = useState([]);
  const [dataOfStepStart, setDataOfStepStart] = useState([]);
  const [dataOfStepSuccess, setDataOfStepSuccess] = useState([]);
  const [columnList, setColumnList] = useState(undefined);
  // --- ManagementSale Kanban state (copied) ---
  const checkIsKanbanSale = localStorage.getItem("isKanbanSaleflow");
  const checkSaleflowId = localStorage.getItem("saleflowId");
  const checkSaleflowName = localStorage.getItem("saleflowName");

  const [listPipelineSale, setListPipelineSale] = useState<any[]>([]);
  const [valueSaleflowSale, setValueSaleflowSale] = useState(null);
  const [listApproachSale, setListApproachSale] = useState<any[]>([]);
  const [listConvertRateSale, setListConvertListSale] = useState<any[]>([]);

  const [saleflowIdSale, setSaleflowIdSale] = useState<number>(checkSaleflowId ? JSON.parse(checkSaleflowId) : -1);
  useEffect(() => {
    localStorage.setItem("saleflowId", JSON.stringify(saleflowIdSale));
  }, [saleflowIdSale]);

  const [saleflowNameSale, setSaleflowNameSale] = useState<string>(checkSaleflowName ? checkSaleflowName : "Tất cả quy trình");
  useEffect(() => {
    localStorage.setItem("saleflowName", saleflowNameSale);
  }, [saleflowNameSale]);

  const [approachIdSale, setApproachIdSale] = useState<number>(() => {
    return -1;
  });

  const [paramsSale, setParamsSale] = useState<any>({
    name: "",
    saleflowId: -1,
    approachId: -1,
    limit: 10,
    page: 1,
  });

  const [dataOfApproachSale, setDataOfApproachSale] = useState<any[]>([]);
  const [dataOfApproachStartSale, setDataOfApproachStartSale] = useState<any[]>([]);
  const [dataOfApproachFailSale, setDataOfApproachFailSale] = useState<any[]>([]);
  const [dataOfApproachSuccessSale, setDataOfApproachSuccessSale] = useState<any[]>([]);
  const [newDataOfApproachSale, setNewDataOfApproachSale] = useState<any[]>([]);

  const getPipelineListSale = async () => {
    if (!listPipelineSale || listPipelineSale.length === 0) {
      const param: any = { limit: 1000 };
      const response = await SaleFlowService.list(param);
      const optionSaleflow: any[] = [];

      if (response.code === 0) {
        const dataOption = response.result.items;
        if (dataOption.length > 0) {
          dataOption.map((item: any) => {
            optionSaleflow.push({ value: item.id, label: item.name });
          });
        }
      }

      setListPipelineSale(optionSaleflow);
    }
  };

  const loadOptionSaleflowSale = async (search, loadedOptions, { page }) => {
    const param: any = { name: search, page: page, limit: 10 };
    const response = await SaleFlowService.list(param);
    const optionSaleflow = page === 1 ? [{ value: -1, label: "Tất cả quy trình" }] : [];

    if (response.code === 0) {
      const dataOption = response.result.items;
      if (dataOption.length > 0) {
        dataOption.map((item: any) => {
          optionSaleflow.push({ value: item.id, label: item.name });
        });
      }

      return { options: optionSaleflow, hasMore: response.result.loadMoreAble, additional: { page: page + 1 } };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueSaleflowSale = (e) => {
    setValueSaleflowSale(e);
    setSaleflowIdSale(+e.value);
    setSaleflowNameSale(e.label);
    if (e.value === -1) {
      setIsRegimeKanban(false);
    }
    clearKanbanSale();
  };

  const getOptionApproachSale = async (saleflowId) => {
    const body: any = { saleflowId };
    const response = await SaleflowApproachService.list(body);
    if (response.code === 0) {
      const dataOption = response.result;
      setListApproachSale([
        ...(dataOption.length > 0
          ? dataOption.map((item, index) => ({
              value: item.id,
              label: item.name,
              color: colorData[index],
              lstSaleflowActivity: item.lstSaleflowActivity,
              saleflowId: item.saleflowId,
              step: item.step,
            }))
          : []),
      ]);
    }
  };

  const getDataOfApproachSale = async (paramsSearch, approachName) => {
    const newDataApproach = [...newDataOfApproachSale];
    const response = await SaleflowInvoiceService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      const newData = {
        approachId: paramsSearch.approachId,
        approachName: approachName,
        value: result?.items,
        hasMore: result?.loadMoreAble,
        page: result?.page,
      };

      setDataOfApproachSale((oldArray) => [...oldArray, newData]);

      newDataApproach.push(newData);
      setNewDataOfApproachSale(newDataApproach);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOfApproachSpecialSale = async (saleflowId, status) => {
    const param = { saleflowId: saleflowId, limit: 10, page: 1, approachId: -1, status: status };
    const response = await SaleflowInvoiceService.list(param);

    if (response.code === 0) {
      const result = response.result;
      if (status === 1) {
        setDataOfApproachSuccessSale(result);
      } else if (status === 3) {
        setDataOfApproachFailSale(result);
      } else {
        setDataOfApproachStartSale(result);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDataOneApproachSale = async (param, approachName) => {
    const response = await SaleflowInvoiceService.list(param);
    if (response.code === 0) {
      const result = response.result;
      const newDataOfApproach = [...dataOfApproachSale];
      const indexApproach = dataOfApproachSale.findIndex((el) => el.approachId === param.approachId);
      if (indexApproach !== -1) {
        const newData = { approachId: param.approachId, approachName: approachName, value: result?.items, hasMore: result?.loadMoreAble, page: result?.page };
        newDataOfApproach[indexApproach] = newData;
        setDataOfApproachSale(newDataOfApproach);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getPipelineListSale();
  }, []);

  // When saleflowIdSale changes, load approaches and reset params similar to ManagementSale
  useEffect(() => {
    setParamsSale((prev) => ({ ...prev, saleflowId: saleflowIdSale, approachId: -1 }));
    setApproachIdSale(-1);
    if (saleflowIdSale === -1) {
      setListApproachSale([]);
      setListConvertListSale([]);
    } else {
      getOptionApproachSale(saleflowIdSale);
    }
  }, [saleflowIdSale]);

  useEffect(() => {
    if (listApproachSale && listApproachSale.length > 0) {
      listApproachSale.map((item, index) => {
        const param = { saleflowId: saleflowIdSale, approachId: item.value, limit: 10, page: 1 };
        getDataOfApproachSale(param, item.label);
        if (index === listApproachSale.length - 1) {
          setNewDataOfApproachSale([]);
        }
      });
    }
  }, [listApproachSale, saleflowIdSale]);

  useEffect(() => {
    getDataOfApproachSpecialSale(saleflowIdSale, 0);
    getDataOfApproachSpecialSale(saleflowIdSale, 1);
    getDataOfApproachSpecialSale(saleflowIdSale, 3);
  }, [saleflowIdSale]);

  const [invoiceIdListSale, setInvoiceIdListSale] = useState<any[]>([]);
  const [customerIdlistSale, setCustomerIdListSale] = useState<any[]>([]);
  const [dataCustomerListSale, setDataCustomerListSale] = useState<any[]>([]);
  const [columnListSale, setColumnListSale] = useState<any>(undefined);
  const [checkColumnSale, setCheckColumnSale] = useState<any>(null);

  useEffect(() => {
    if (invoiceIdListSale && invoiceIdListSale.length > 0) {
      const checkCustomerList: any[] = [];
      const checkDataCustomerList: any[] = [];
      invoiceIdListSale.map((item) => {
        if (checkCustomerList.length === 0) {
          checkCustomerList.push(item.customerId);
          checkDataCustomerList.push({ name: item.customerName, id: item.customerId, phoneMasked: item.customerPhone, emailMasked: item.customerEmail, address: item.customerAddress, employeeName: item.employeeName, coyId: item.id });
        } else {
          if (!checkCustomerList.includes(item.customerId)) {
            checkCustomerList.push(item.customerId);
            checkDataCustomerList.push({ name: item.customerName, id: item.customerId, phoneMasked: item.customerPhone, emailMasked: item.customerEmail, address: item.customerAddress, employeeName: item.employeeName, coyId: item.id });
          }
        }
      });
      setCustomerIdListSale(checkCustomerList);
      setDataCustomerListSale(checkDataCustomerList);
    } else if (invoiceIdListSale && invoiceIdListSale.length === 0) {
      setCustomerIdListSale([]);
      setDataCustomerListSale([]);
    }
  }, [invoiceIdListSale]);

  const clearKanbanSale = () => {
    setInvoiceIdListSale([]);
    setCustomerIdListSale([]);
    setDataCustomerListSale([]);
    setColumnListSale(undefined);
    setCheckColumnSale(null);
  };
  // --- end ManagementSale Kanban state ---
  

  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const customerFilterList = useMemo(
    () =>
      [
        {
          key: "creatorId",
          name: "Người lập",
          type: "select",
          is_featured: true,
          value: searchParams.get("creatorId") ?? "",
        },
        {
          key: "status",
          name: "Trạng thái",
          type: "select",
          list: [
            { value: "-1", label: "Tất cả" },
            { value: "0", label: "Chưa phê duyệt" },
            { value: "1", label: "Đang xử lý" },
            { value: "2", label: "Đã phê duyệt" },
            { value: "3", label: "Từ chối duyệt" },
            { value: "4", label: "Tạm dừng" },
          ],
          is_featured: true,
          value: searchParams.get("status") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  useEffect(() => {
    if (contractId) {
      setParams((prevParams) => ({ ...prevParams, contractId: contractId }));
      setShowModalAdd(true);
    }
  }, [contractId]);

  // LocalStorage sync cho Kanban
useEffect(() => {
  localStorage.setItem("isKanbanBusinessProcess", JSON.stringify(isRegimeKanban));
}, [isRegimeKanban]);

useEffect(() => {
  localStorage.setItem("processId", JSON.stringify(processId));
}, [processId]);

useEffect(() => {
  localStorage.setItem("processName", processName);
}, [processName]);

// Load step process khi processId thay đổi
useEffect(() => {
  setValueProcess({
    value: processId,
    label: processName,
  });

  if (processId !== -1) {
    getListStepProcess(processId);
  }
}, [processId]);

// Load data cho từng step
useEffect(() => {
  if (listStepProcess && listStepProcess.length > 0) {
    listStepProcess.map((item) => {
      const param = {
        processId: processId,
        workflowId: item.value,
        limit: 10,
        page: 1,
      };
      getDataOfStep(param, item.label);
    });
  }
}, [listStepProcess, processId]);

// Load data special (start/success)
useEffect(() => {
  if (processId !== -1) {
    getDataOfStepSpecial(processId, 0);
    getDataOfStepSpecial(processId, 2);
  }
}, [processId]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách báo giá mới",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Báo giá",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListQuote = async (paramsSearch) => {
    setIsLoading(true);

    const response = await QuoteService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListQuote(result.items);

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
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListQuote(params);
      const paramsTemp: any = _.cloneDeep(params);
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
  }, [params, hasHistorySignature]);

  const titleActions: ITitleActions = {
    actions: [
      ...(!showModalSetingQuote || !hasHistorySignature
        ? [
            {
              title: "Sao chép mẫu",
              disabled: !isLoading && listQuote.length === 0,
              callback: () => {
                setHasCopyQuote(true);
              },
            },
          ]
        : []),
      {
        title: !showModalSetingQuote || !hasHistorySignature ? "Thêm mới" : "Quay lại",
        callback: () => {
          if (showModalAdd) {
            setShowModalAdd(false);
          } else {
            setDataQuote(null);
            setShowModalAdd(true);
          }
        },
      },
    ],
  };

  // Lấy danh sách bước của quy trình
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
  }
};

// Load options cho select process
const loadOptionProcess = async (search, loadedOptions, { page }) => {
  const param: any = {
    name: search,
    page: page,
    limit: 10,
  };
  const response = await BusinessProcessService.list(param);
  const optionProcess: any[] = page === 1 ? [] : [];

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
      options: optionProcess,
      hasMore: response.result.loadMoreAble,
      additional: {
        page: page + 1,
      },
    };
  }

  return { options: [], hasMore: false };
};

// Handle change value process
const handleChangeValueProcess = (e) => {
  setValueProcess(e);
  setProcessId(+e.value);
  setProcessName(e.label);
  if (e.value === -1) {
    setIsRegimeKanban(false);
  }
  clearKanban();
};

// Get data of step
const getDataOfStep = async (paramsSearch, stepName) => {
  const abortController = new AbortController();
  const response = await BusinessProcessService.listWorkFlow(
    paramsSearch,
    abortController.signal
  );

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
    showToast(
      response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau",
      "error"
    );
  }
};

// Get data of step action
const getDataOfStepAction = async (paramsSearch, stepName) => {
  const abortController = new AbortController();
  const response = await BusinessProcessService.listWorkFlow(
    paramsSearch,
    abortController.signal
  );

  if (response.code === 0) {
    const result = response.result;
    const listDataOfStep = [...dataOfStep];
    const indexData = listDataOfStep.findIndex(
      (el) => el.stepId === paramsSearch.workflowId
    );

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
    showToast(
      response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau",
      "error"
    );
  }
};

// Get data of step special
const getDataOfStepSpecial = async (processId, status) => {
  const abortController = new AbortController();
  const param = {
    processId: processId,
    limit: 10,
    page: 1,
    workflowId: -1,
    status: status,
  };
  const response = await BusinessProcessService.listWorkFlow(
    param,
    abortController.signal
  );

  if (response.code === 0) {
    const result = response.result;
    if (status === 2) {
      setDataOfStepSuccess(result);
    } else {
      setDataOfStepStart(result);
    }
  } else {
    showToast(
      response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau",
      "error"
    );
  }
};

// Clear kanban
const clearKanban = () => {
  setColumnList(undefined);
  setDataOfStep([]);
};

  const titles = ["STT", "Tên báo giá", "Ngày tạo", "Ngày hết hạn", "Ngày ban hành", "Người lập", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "", "text-center"];

  const dataMappingArray = (item, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.quoteDate ? moment(item.quoteDate).format("DD/MM/YYYY") : "",
    item.expiredDate ? moment(item.expiredDate).format("DD/MM/YYYY") : "",
    item.approvedDate ? moment(item.approvedDate).format("DD/MM/YYYY") : "",
    item.employeeName,
    <Badge
      key={item.id}
      text={
        !item.status
          ? "Chưa phê duyệt"
          : item.status === 1
          ? "Đang xử lý"
          : item.status === 2
          ? "Đã phê duyệt"
          : item.status === 4
          ? "Tạm dừng"
          : "Từ chối duyệt"
      }
      variant={!item.status ? "secondary" : item.status === 1 ? "primary" : item.status === 2 ? "success" : item.status === 4 ? "warning" : "error"}
    />,
  ];

  const [viewDetailFs, setViewDetailFs] = useState<boolean>(false);

  const handleTitleExport = async (sheetId: number) => {
    const params = {
      sheetId: sheetId,
      limit: 20,
    };

    const response = await SheetFieldQuoteFormService.lst(params);

    if (response.code === 0) {
      const result = response.result.items;

      const changeResult = result.map((item) => {
        const newItem: any = {
          [item.code]: "",
          type: item.type,
          placeholder: item.name.toLowerCase(),
          formula: item.formula,
          id: null,
        };

        if (item.type === "select") {
          newItem.options = JSON.parse(item.options);
        }

        return newItem;
      });

      const resultTitle = result.map((item) => item.name);

      return resultTitle;
    }
  };
  const removePunctuationAndCamelCase = (str) => {
    str = removeAccents(str);

    return str
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  };

  const handleExportDataFS = async (data, item: any) => {
    const changeName = removePunctuationAndCamelCase(item.name);
    const titleExport = await handleTitleExport(item.sheetId);

    CustomExportReport({
      fileName: changeName,
      title: item.name,
      header: titleExport,
      data: [],
      info: { name },
    });
  };

  const handleCheckValidateSignature = async (item: any, type: "export" | "signature") => {
    if (!item) return;

    const params = {
      quoteId: item.id,
    };

    const response = await QuoteService.quoteFormLst(params);

    if (response.code === 0) {
      const result = response.result;

      if (result.length === 0) {
        showToast("Không hợp lệ để trình ký. Vui lòng cung cấp dữ liệu cho cấu hình báo giá và thử lại !", "warning");
      } else {
        if (result[0]["dataTbody"]) {
          if (type === "signature") {
            setHasSignature(true);
          } else {
            handleExportDataFS(result, item);
          }
        } else {
          showToast(`Không hợp lệ để ${type === "export" ? "tải xuống" : "trình ký"}. Dữ liệu cấu hình báo giá không được để trống !`, "warning");
        }
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: "Tải xuống file báo giá",
        icon: <Icon name="Download" />,
        callback: () => {
          if(item.quoteType === 1){
            const fieldName = convertToId(item.name) || "";
            const type = item.quoteAttachment?.includes(".docx")
                  ? "docx"
                  : item.quoteAttachment?.includes(".xlsx")
                  ? "xlsx"
                  : item.quoteAttachment?.includes(".pdf")
                  ? "pdf"
                  : item.quoteAttachment?.includes(".pptx")
                  ? "pptx"
                  : item.quoteAttachment?.includes(".zip")
                  ? "zip"
                  : "rar";
            const name = `${fieldName}.${type}`;
            handDownloadFileOrigin(item.quoteAttachment, name);
            
          } else {
            handleCheckValidateSignature(item, "export");
          }
        },
      },
      ...(item.status
        ? [
            {
              title: "Xem lịch sử ký",
              icon: <Icon name="ImpactHistory" />,
              callback: () => {
                setDataQuote({
                  ...item,
                  template: item.quoteAttachment
                });
                setHasHistorySignature(true);
              },
            },
          ]
        : []),
      ...(!item.status
        ? [
            {
              title: "Trình ký",
              icon: <Icon name="FingerTouch" className="icon-warning" />,
              callback: () => {
                setDataObject(item);
                setHasSignature(true);
                // handleCheckValidateSignature(item, "signature");
              },
            },
          ]
        : []),
      // {
      //   title: "Xem chi tiết FS",
      //   icon: <Icon name="Eye" />,
      //   callback: () => {
      //     setDataQuote(item);
      //     setViewDetailFs(true);
      //   },
      // },
      ...(!item.status
        ? [
            item.quoteType === 2 &&
            {
              title: "Cấu hình báo giá",
              icon: <Icon name="Settings" />,
              callback: () => {
                setDataQuote(item);
                item.sheetId ? setShowModalSetingQuote(true) : setShowModalChooseTemplate(true);
              },
            },
            {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setShowModalAdd(true);
                setDataQuote(item);
              },
            },
            {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : item.status === 1
        ? [
            {
              title: "Tạm dừng trình ký",
              icon: <Icon name="WarningCircle" className="icon-warning" />,
              callback: () => {
                showDialogConfirmStatus(item, "pending");
              },
            },
          ]
        : item.status === 4
        ? [
            {
              title: "Tiếp tục trình ký",
              icon: <Icon name="InfoCircle" className="icon-success" />,
              callback: () => {
                showDialogConfirmStatus(item, "play");
              },
            },
            {
              title: "Trình ký lại",
              icon: <Icon name="FingerTouch" className="icon-warning" />,
              callback: () => {
                showDialogConfirmStatus(item, "inital");
              },
            },
          ]
        : []),
      ...(item.status === 2 && item.quoteType === 2
        ? [
            {
              title: "Cấu hình báo giá",
              icon: <Icon name="Settings" />,
              callback: () => {
                setDataQuote(item);
                item.sheetId ? setShowModalSetingQuote(true) : setShowModalChooseTemplate(true);
              },
            },
          ]
        : []),
      ...(dataInfoEmployee && dataInfoEmployee.isOwner === 1 && (item.status === 2 || item.status === 3)
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

  const onDelete = async (id: number) => {
    const response = await QuoteService.delete(id);

    if (response.code === 0) {
      showToast("Xóa báo giá thành công", "success");
      getListQuote(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "báo giá " : `${listIdChecked.length} báo giá đã chọn`}
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

  const handUpdateStatus = async (item, status) => {
    if (!item) return;

    const body = {
      id: item.id,
      status: status,
    };

    const response = await QuoteService.updateStatus(body);

    if (response.code === 0) {
      showToast(`${status == 1 ? "Tiếp tục" : "Tạm dừng"} thành công`, "success");
      getListQuote(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const handResetSignature = async (item) => {
    if (!item) return;

    const param = {
      objectId: item.id,
      objectType: 2,
    };

    const response = await QuoteService.resetSignature(param);

    if (response.code === 0 && response.result > 0) {
      showToast(`Trình lại trình ký thành công`, "success");
      getListQuote(params);

      setTimeout(() => {
        setHasSignature(true);
      }, 300);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmStatus = (item?, status?: "pending" | "play" | "inital") => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{`${status == "play" ? "Tiếp tục" : status == "inital" ? "Trình lại" : "Tạm dừng"} trình ký...`}</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn {status == "play" ? "tiếp tục" : status == "inital" ? "trình lại" : "tạm dừng"} trình ký{" "}
          {item ? "báo giá " : `${listIdChecked.length} báo giá đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        if (status == "play") {
          handUpdateStatus(item, 1);
        } else if (status == "pending") {
          handUpdateStatus(item, 4);
        } else {
          handResetSignature(item);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa báo giá",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
  <div className={`page-content page__quote${isNoItem ? " bg-white" : ""}`}>
    {/* Header với nút chuyển đổi List/Kanban */}
    <div className="action-navigation">
      <div className="action-backup" style={showModalSetingQuote || hasHistorySignature ? { marginBottom: "1.6rem" } : {}}>
        
        {/* Breadcrumb - chỉ hiện khi không ở chế độ Kanban */}
        {!isRegimeKanban && (
          <>
            <h1
              onClick={() => {
                setShowModalSetingQuote(false);
                setHasHistorySignature(false);
              }}
              className="title-first"
              title="Quay lại"
            >
              Danh sách báo giá mới
            </h1>
            {showModalSetingQuote && (
              <Fragment>
                <Icon
                  name="ChevronRight"
                  onClick={() => {
                    setShowModalSetingQuote(false);
                  }}
                />
                <h1 className="title-last">Cấu hình báo giá</h1>
              </Fragment>
            )}
            {hasHistorySignature && (
              <Fragment>
                <Icon
                  name="ChevronRight"
                  onClick={() => {
                    setHasHistorySignature(false);
                  }}
                />
                <h1 className="title-last">Xem lịch sử ký</h1>
              </Fragment>
            )}
          </>
        )}

        {/* Right-side action box with Kanban toggle button */}
        <div className={`header-right-action ${isRegimeKanban ? 'active' : ''}`}>
          <Button
            type="button"
            className="kanban-toggle-btn"
            color={isRegimeKanban ? "secondary" : "primary"}
            size="slim"
            onClick={() => {
              setIsRegimeKanban(!isRegimeKanban);
              setHasHistorySignature(false);
            }}
          >
            {isRegimeKanban ? "Danh sách" : "Kanban"}
          </Button>
        </div>
      </div>
    </div>

    <div className="card-box d-flex flex-column">
      {/* SaleFlow selector */}
      <div className={`${!hasHistorySignature ? (!isRegimeKanban ? "d-none" : "quick__search") : "d-none"}`}>
        <div style={{ width: "30rem" }}>
          <SelectCustom
            id="saleflowIdSale"
            name="saleflowIdSale"
            fill={true}
            required={true}
            options={[]}
            value={valueSaleflowSale}
            onChange={(e) => handleChangeValueSaleflowSale(e)}
            isAsyncPaginate={true}
            placeholder="Chọn quy trình bán hàng"
            additional={{
              page: 1,
            }}
            loadOptionsPaginate={loadOptionSaleflowSale}
          />
        </div>
      </div>

      {/* List View - Danh sách báo giá */}
      <div className={`${isRegimeKanban ? "d-none" : ""} ${showModalSetingQuote || hasHistorySignature ? "d-none" : ""}`}>
        <SearchBox
          name="Tên báo giá"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listQuote && listQuote.length > 0 ? (
          <BoxTable
            name="Báo giá"
            titles={titles}
            items={listQuote}
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
                    Hiện tại chưa có báo giá nào. <br />
                    Hãy thêm mới báo giá đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới báo giá"
                action={() => {
                  setDataQuote(null);
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
      </div>

      {/* Kanban View (Order Request Kanban) */}
      <div className={`${!hasHistorySignature ? (isRegimeKanban ? "" : "d-none") : "d-none"}`}>
        {/* Select quy trình (nếu muốn hiển thị) - đang bị comment trong code gốc */}
        {/*
        <div style={{ width: "45rem", padding: "2rem" }}>
          <SelectCustom
            id="processOrderRequestId"
            name="processOrderRequestId"
            fill={true}
            required={true}
            value={valueProcessOrderRequest}
            onChange={(e) => {
              if (e.value !== processOrderRequestId) {
                setIsLoadingKanbanOrderRequest(true);
                handleChangeValueProcessOrderRequest(e);
              }
            }}
            isAsyncPaginate={true}
            placeholder="Chọn quy trình"
            additional={{ page: 1 }}
            loadOptionsPaginate={loadOptionProcessOrderRequest}
          />
        </div>
        */}

        {/* Loading khi đổi quy trình */}
        <div className={`${isLoadingKanbanOrderRequest ? "" : "d-none"}`}>
          <Loading />
        </div>

        {/* Hiển thị Kanban */}
        <div className={`${!isLoadingKanbanOrderRequest ? "" : "d-none"}`}>
          <KanbanOrderRequestProcess processId={processOrderRequestId} />
        </div>
      </div>

      {/* Cấu hình báo giá */}
      <div className={`${showModalSetingQuote ? "" : "d-none"}`}>
        <AddFormQuote
          onShow={showModalSetingQuote}
          onHide={(reload) => {
            if (reload) {
              getListQuote(params);
            }
            setShowModalSetingQuote(false);
          }}
          disable={dataQuote?.status === 2 ? true : false}
          idQuote={dataQuote?.id}
          dataQuote={dataQuote}
        />
      </div>

      {/* Xem lịch sử ký */}
      <div className={`${hasHistorySignature ? "" : "d-none"}`}>
        {dataQuote &&
          (dataQuote.quoteType === 1 && dataQuote.quoteAttachment ? (
            <ViewHistorySignature
              type="quote"
              onShow={hasHistorySignature}
              data={dataQuote}
              fsAttachment={true}
              onHide={() => setHasHistorySignature(false)}
              buttonDownload={true}
            />
          ) : (
            <ViewHistorySignature
              type="quote"
              onShow={hasHistorySignature}
              data={dataQuote}
              onHide={() => setHasHistorySignature(false)}
            />
          ))}
      </div>
    </div>

    {/* Modals */}
    <AddQuote
      onShow={showModalAdd}
      contractId={contractId}
      onHide={(reload) => {
        if (reload) {
          getListQuote(params);
        }
        setShowModalAdd(false);
      }}
      data={dataQuote}
    />

    <CopyItemModal
      onShow={hasCopyQuote}
      lstData={listQuote}
      onHide={(reload) => {
        if (reload) {
          getListQuote(params);
        }
        setHasCopyQuote(false);
      }}
    />

    <ModelSinger
      onShow={hasSignature}
      onHide={(reload) => {
        if (reload) {
          getListQuote(params);
        }
        setHasSignature(false);
      }}
      data={dataObject}
    />

    <AddTemplateFSQuote
      onShow={showModalChooseTemplate}
      data={dataQuote}
      type="quote"
      onHide={(reload) => {
        if (reload) {
          setShowModalSetingQuote(true);
        }
        setShowModalChooseTemplate(false);
      }}
      callBack={(data) => {
        const updateData = listQuote.map((item) => {
          return {
            ...item,
            sheetId: item.id === data.id ? data.sheetId : item.sheetId,
          };
        });

        setListQuote(updateData);
        setDataQuote(data);
      }}
    />

    <ViewDetailFsModal
      onShow={viewDetailFs}
      data={dataQuote}
      onHide={() => {
        setDataQuote(null);
        setViewDetailFs(false);
      }}
    />

    <Dialog content={contentDialog} isOpen={showDialog} />
  </div>
);
};
