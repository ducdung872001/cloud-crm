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
import AddTemplateFSQuote from "pages/Common/AddTemplateFSQuote";
import AddSignerFSAndQuote from "pages/Common/AddSignerFSAndQuote";
import ViewHistorySignature from "pages/Common/ViewHistorySignature";
import { CustomExportReport } from "exports/customExportReport";
import { useSearchParams } from "react-router-dom";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";

import "./index.scss";

export default function Quotations() {
  document.title = "Danh sách báo giá";

  const isMounted = useRef(false);

  const { name, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const takeParamsUrl = getSearchParameters();

  const [searchParams, setSearchParams] = useSearchParams();
  const [listQuote, setListQuote] = useState([]);
  const [dataQuote, setDataQuote] = useState(null);
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

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách báo giá",
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
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Tải xuống file báo giá",
        icon: <Icon name="Download" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          if(item.quoteType === 1){
            let fieldName = convertToId(item.name) || "";
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
        }
        },
      },
      ...(item.status
        ? [
            {
              title: "Xem lịch sử ký",
              icon: <Icon name="ImpactHistory" className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataQuote({
                  ...item,
                  template: item.quoteAttachment
                });
                setHasHistorySignature(true);
              }
              },
            },
          ]
        : []),
      ...(!item.status
        ? [
            {
              title: "Trình ký",
              icon: <Icon name="FingerTouch" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataQuote(item);
                if(item.quoteType === 2){
                  handleCheckValidateSignature(item, "signature");
                } else {
                  setHasSignature(true);
                }
              }
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
              icon: <Icon name="Settings" className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataQuote(item);
                item.sheetId ? setShowModalSetingQuote(true) : setShowModalChooseTemplate(true);
                }
              },
            },
            {
              title: "Sửa",
              icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setShowModalAdd(true);
                setDataQuote(item);
                }
              },
            },
            {
              title: "Xóa",
              icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                  showDialogConfirmDelete(item);
                }
              },
            },
          ]
        : item.status === 1
        ? [
            {
              title: "Tạm dừng trình ký",
              icon: <Icon name="WarningCircle" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                showDialogConfirmStatus(item, "pending");
                }
              },
            },
          ]
        : item.status === 4
        ? [
            {
              title: "Tiếp tục trình ký",
              icon: <Icon name="InfoCircle" className={isCheckedItem?"icon-disabled" : "icon-success"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                showDialogConfirmStatus(item, "play");
                }
              },
            },
            {
              title: "Trình ký lại",
              icon: <Icon name="FingerTouch" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                showDialogConfirmStatus(item, "inital");
                }
              },
            },
          ]
        : []),
      ...(item.status === 2 && item.quoteType === 2
        ? [
            {
              title: "Cấu hình báo giá",
              icon: <Icon name="Settings" className={isCheckedItem ? "icon-disabled" : ""}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataQuote(item);
                item.sheetId ? setShowModalSetingQuote(true) : setShowModalChooseTemplate(true);
                }
              },
            },
          ]
        : []),
      ...(dataInfoEmployee && dataInfoEmployee.isOwner === 1 && (item.status === 2 || item.status === 3)
        ? [
            {
              title: "Xóa",
              icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                  showDialogConfirmDelete(item);
                }
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

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    const arrPromises = selectedIds.map((selectedId) => {
      const found = listQuote.find((item) => item.id === selectedId);
      if (found?.id) {
        return QuoteService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} báo giá`, "success");
        getListQuote(params);
        setListIdChecked([]);
      } else {
        showToast("Không có báo giá nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

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
      defaultAction: () => {
        if (item?.id) {
          onDelete(item.id);
          return;
        }
        if (listIdChecked.length>0) {
          onDeleteAll();
          return;
        }
      }
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
      <div className="action-navigation">
        <div className="action-backup" style={showModalSetingQuote || hasHistorySignature ? { marginBottom: "1.6rem" } : {}}>
          <h1
            onClick={() => {
              setShowModalSetingQuote(false);
              setHasHistorySignature(false);
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách báo giá
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
        </div>
        {!showModalSetingQuote && !hasHistorySignature && <TitleAction title="" titleActions={titleActions} />}
      </div>

      <div className="card-box d-flex flex-column">
        <div className={`${showModalSetingQuote || hasHistorySignature ? "d-none" : ""}`}>
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

        <div className={`${hasHistorySignature ? "" : "d-none"}`}>
          {dataQuote && 
            (dataQuote.quoteType === 1 &&  dataQuote.quoteAttachment ? 
              <ViewHistorySignature 
                type="quote" 
                onShow={hasHistorySignature} 
                data={dataQuote} 
                fsAttachment={true}
                onHide={() => setHasHistorySignature(false)} 
                buttonDownload = {true}
              />
              :
              <ViewHistorySignature 
                type="quote" 
                onShow={hasHistorySignature} 
                data={dataQuote} 
                onHide={() => setHasHistorySignature(false)} 
              />
            )
            
          }
        </div>
      </div>
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
      <AddSignerFSAndQuote
        onShow={hasSignature}
        onHide={(reload) => {
          if (reload) {
            getListQuote(params);
          }

          setHasSignature(false);
        }}
        dataProps={{
          objectId: dataQuote?.id,
          objectType: 2,
        }}
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
}
