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
import CopyItemModal from "./partials/CopyItemModal";
import AddTemplateFSQuote from "pages/Common/AddTemplateFSQuote";
import ModelSinger from "pages/SettingProcess/partials/ProcessedObjectList/partials/ModalSigner/index";
import ViewHistorySignature from "pages/Common/ViewHistorySignature";
import { CustomExportReport } from "exports/customExportReport";
import { useSearchParams } from "react-router-dom";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";
import SelectCustom from "components/selectCustom/selectCustom";
import BusinessProcessService from "services/BusinessProcessService";
import KanbanQuotationsProcess from "./KanbanQuotationsProcess";

import "./index.scss";

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
  const [contractId, setContractId] = useState<number>(() => {
    return takeParamsUrl?.contractId ? takeParamsUrl?.contractId : null;
  });

  // Kanban for Order Request: states and helpers
  const checkProcessQuotationId = (localStorage.getItem("processQuotationId") && JSON.parse(localStorage.getItem("processQuotationId"))) || -1;
  const checkProcessQuotationName = localStorage.getItem("processQuotationName");

  const [processQuotationId, setProcessQuotationId] = useState<number>(1518);
  const [processQuotationName, setProcessQuotationName] = useState<string>(
    checkProcessQuotationName ? checkProcessQuotationName : "Chọn quy trình"
  );
  const [isLoadingKanbanQuotation, setIsLoadingKanbanQuotation] = useState<boolean>(false);
  const [valueProcessQuotation, setValueProcessQuotation] = useState<any>(null);




  // Async options loader for select (order request processes). Uses type:3 as requested.
  const loadOptionProcessQuotation = async (search, loadedOptions, { page }) => {
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

  // Handler when selecting a process for order-request Kanban
  const handleChangeValueProcessQuotation = (e) => {
    setIsLoadingKanbanQuotation(true);
    setValueProcessQuotation(e);
    setProcessQuotationId(+e.value);
    setProcessQuotationName(e.label);

    // Persist selection
    localStorage.setItem("processQuotationId", JSON.stringify(+e.value));
    localStorage.setItem("processQuotationName", e.label);
    
    setTimeout(() => setIsLoadingKanbanQuotation(false), 500);
  };

  useEffect(() => {
    setValueProcessQuotation({ value: processQuotationId, label: processQuotationName });
  }, [processQuotationId]);

  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(
    checkIsKanban ? JSON.parse(checkIsKanban) : false
  );
  

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
      ...(!showModalSetingQuote && !hasHistorySignature
        ? [
            {
              title: isRegimeKanban ? "Danh sách" : "Kanban",
              color: "primary",
              callback: () => {
                setIsRegimeKanban((prev) => !prev);
              },
            },
          ]
        : []),
    ],
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
                // Lấy thông tin quy trình từ Quản lý quy trình (select trong Kanban)
                setDataObject({
                  ...item,
                  processId: processQuotationId || null,
                  processName: processQuotationName || null
                });
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
        
        {/* Breadcrumb */}
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
      </div>
      {!showModalSetingQuote && !hasHistorySignature && <TitleAction title="" titleActions={titleActions} />}
    </div>

    <div className="card-box d-flex flex-column">

      {/* List View - Danh sách báo giá */}
      <div className={`${isRegimeKanban || showModalSetingQuote || hasHistorySignature ? "d-none" : ""}`}>
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
        <div style={{ width: "45rem", padding: "2rem" }}>
          <SelectCustom
            id=""
            name="name"
            fill={true}
            required={true}
            options={[]}
            value={valueProcessQuotation}
            onChange={(e) => {
              if (e.value !== processQuotationId) {
                setIsLoadingKanbanQuotation(true);
                handleChangeValueProcessQuotation(e);
              }
            }}
            isAsyncPaginate={true}
            placeholder="Chọn quy trình"
            additional={{ page: 1 }}
            loadOptionsPaginate={loadOptionProcessQuotation}
          />
        </div>

        {/* Loading khi đổi quy trình */}
        <div className={`${isLoadingKanbanQuotation ? "" : "d-none"}`}>
          <Loading />
        </div>

        {/* Hiển thị Kanban */}
        <div className={`${!isLoadingKanbanQuotation ? "" : "d-none"}`}>
          <KanbanQuotationsProcess 
            processId={processQuotationId} 
            processCode={valueProcessQuotation?.code}
          />
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

    <Dialog content={contentDialog} isOpen={showDialog} />
  </div>
);
};
