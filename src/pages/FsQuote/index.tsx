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
import { convertToId, getPageOffset, isDifferenceObj, removeAccents } from "reborn-util";
import FSQuoteService from "services/FSQuoteService";
import { ContextType, UserContext } from "contexts/userContext";
import AddFS from "./partials/AddFs";
import AddFsFormQuote from "./partials/AddFsFormQuoteBackup";
import AddTemplateFSQuote from "pages/Common/AddTemplateFSQuote";
import CopyItemModal from "./partials/CopyItemModal";
import AddSignerFSAndQuote from "pages/Common/AddSignerFSAndQuote";
import ViewHistorySignature from "pages/Common/ViewHistorySignature";
import { CustomExportReport } from "exports/customExportReport";
import { useSearchParams } from "react-router-dom";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";

import "./index.scss";

export default function FsQuote() {
  document.title = "Danh sách FS";

  const isMounted = useRef(false);

  const { name, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [listFsQuote, setListFsQuote] = useState([]);
  const [dataFsQuote, setDataFsQuote] = useState(null);
  console.log("dataFsQuote", dataFsQuote);

  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalSetingFS, setShowModalSetingFS] = useState<boolean>(false);
  const [showModalChooseTemplate, setShowModalChooseTemplate] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [hasCopyQuote, setHasCopyQuote] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [hasHistorySignature, setHasHistorySignature] = useState<boolean>(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách FS",
      is_active: true,
    },
  ]);

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

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "FS",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListFsQuote = async (paramsSearch) => {
    setIsLoading(true);

    const response = await FSQuoteService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListFsQuote(result.items);

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
      getListFsQuote(params);
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
      ...(!showModalSetingFS || !hasHistorySignature
        ? [
            {
              title: "Sao chép mẫu",
              disabled: !isLoading && listFsQuote.length === 0,
              callback: () => {
                setHasCopyQuote(true);
              },
            },
          ]
        : []),
      {
        title: !showModalSetingFS || !hasHistorySignature ? "Thêm mới" : "Quay lại",
        callback: () => {
          if (showModalAdd) {
            setShowModalAdd(false);
          } else {
            setDataFsQuote(null);
            setShowModalAdd(true);
          }
        },
      },
    ],
  };

  const titles = ["STT", "Tên FS", "Ngày tạo", "Ngày ban hành", "Người lập", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "", "text-center"];

  const dataMappingArray = (item, index: number) => [
    getPageOffset(params) + index + 1,
    <span
      onClick={() => {
        setDataFsQuote({
          ...item,
          template: item.fsAttachment,
        });
        setHasHistorySignature(true);
      }}
      style={{ cursor: "pointer" }}
      className="btn__navigation"
    >
      {item.name}
    </span>,
    item.createdDate ? moment(item.createdDate).format("DD/MM/YYYY") : "",
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
      fsId: item.id,
    };

    const response = await FSQuoteService.fsFormLst(params);

    if (response.code === 0) {
      const result = response.result;

      if (result.length === 0) {
        showToast("Không hợp lệ để trình ký. Vui lòng cung cấp dữ liệu cho cấu hình FS và thử lại !", "warning");
      } else {
        if (result[0]["dataTbody"]) {
          if (type === "signature") {
            setHasSignature(true);
          } else {
            handleExportDataFS(result, item);
          }
        } else {
          showToast(`Không hợp lệ để ${type === "export" ? "tải xuống" : "trình ký"}. Dữ liệu cấu hình fs không được để trống !`, "warning");
        }
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  const actionsTable = (item): IAction[] => {
    return [
      ...(item?.fsAttachment
        ? [
            {
              title: "Tải xuống file FS",
              icon: <Icon name="Download" />,
              callback: () => {
                if (item.fsType === 1) {
                  let fieldName = convertToId(item.name) || "";
                  const name = `${fieldName}.xlsx`;
                  handDownloadFileOrigin(item.fsAttachment, name);
                } else {
                  handleCheckValidateSignature(item, "export");
                }
              },
            },
          ]
        : []),
      ...(item.status
        ? [
            {
              title: "Xem lịch sử ký",
              icon: <Icon name="ImpactHistory" />,
              callback: () => {
                setDataFsQuote({
                  ...item,
                  template: item.fsAttachment,
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
                setDataFsQuote(item);
                if (item.fsType === 2) {
                  handleCheckValidateSignature(item, "signature");
                } else {
                  setHasSignature(true);
                }
              },
            },

            ...(item.fsType === 2
              ? [
                  {
                    title: "Cấu hình FS",
                    icon: <Icon name="Settings" />,
                    callback: () => {
                      setDataFsQuote(item);
                      if (item.sheetId) {
                        setShowModalSetingFS(true);
                      } else {
                        setShowModalChooseTemplate(true);
                      }
                    },
                  },
                ]
              : []),

            {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setDataFsQuote(item);
                setShowModalAdd(true);
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
        : []),
      ...(item.status === 1
        ? [
            {
              title: "Tạm dừng trình ký",
              icon: <Icon name="WarningCircle" className="icon-warning" />,
              callback: () => {
                showDialogConfirmStatus(item, "pending");
              },
            },
          ]
        : []),
      ...(item.status === 4
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
      ...(item.status === 2 && item.fsType === 2
        ? [
            {
              title: "Cấu hình FS",
              icon: <Icon name="Settings" />,
              callback: () => {
                setDataFsQuote(item);
                if (item.sheetId) {
                  setShowModalSetingFS(true);
                } else {
                  setShowModalChooseTemplate(true);
                }
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
    const response = await FSQuoteService.delete(id);

    if (response.code === 0) {
      showToast("Xóa fs thành công", "success");
      getListFsQuote(params);
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
          Bạn có chắc chắn muốn xóa {item ? "fs " : `${listIdChecked.length} fs đã chọn`}
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

    const response = await FSQuoteService.updateStatus(body);

    if (response.code === 0) {
      showToast(`${status == 1 ? "Tiếp tục" : "Tạm dừng"} thành công`, "success");
      getListFsQuote(params);
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
      objectType: 1,
    };

    const response = await FSQuoteService.resetSignature(param);

    if (response.code === 0 && response.result > 0) {
      showToast(`Trình lại trình ký thành công`, "success");
      getListFsQuote(params);

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
          {item ? "fs " : `${listIdChecked.length} fs đã chọn`}
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
      title: "Xóa fs",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page__fs${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup" style={showModalSetingFS || hasHistorySignature ? { marginBottom: "1.6rem" } : {}}>
          <h1
            onClick={() => {
              setShowModalSetingFS(false);
              setHasHistorySignature(false);
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách FS
          </h1>
          {showModalSetingFS && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setShowModalSetingFS(false);
                }}
              />
              <h1 className="title-last">Cấu hình FS</h1>
            </Fragment>
          )}
          {hasHistorySignature && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setHasHistorySignature(false);
                  setDataFsQuote(null);
                }}
              />
              <h1 className="title-last">Xem lịch sử ký</h1>
            </Fragment>
          )}
        </div>
        {!showModalSetingFS && !hasHistorySignature && <TitleAction title="" titleActions={titleActions} />}
      </div>

      <div className="card-box d-flex flex-column">
        <div className={`${showModalSetingFS || hasHistorySignature ? "d-none" : ""}`}>
          <SearchBox
            name="Tên FS"
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            isFilter={true}
            listFilterItem={customerFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {!isLoading && listFsQuote && listFsQuote.length > 0 ? (
            <BoxTable
              name="FS"
              titles={titles}
              items={listFsQuote}
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
                      Hiện tại chưa có fs nào. <br />
                      Hãy thêm mới fs đầu tiên nhé!
                    </span>
                  }
                  type="no-item"
                  titleButton="Thêm mới fs"
                  action={() => {
                    setDataFsQuote(null);
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

        <div className={`${showModalSetingFS ? "" : "d-none"}`}>
          <AddFsFormQuote
            onShow={showModalSetingFS}
            onHide={(reload) => {
              if (reload) {
                getListFsQuote(params);
              }

              setShowModalSetingFS(false);
            }}
            disable={dataFsQuote?.status === 2 ? true : false}
            idFS={dataFsQuote?.id}
            dataFsQuote={dataFsQuote}
          />
        </div>

        <div className={`${hasHistorySignature ? "" : "d-none"}`}>
          {dataFsQuote &&
            (dataFsQuote.fsType === 1 && dataFsQuote.fsAttachment ? (
              <ViewHistorySignature
                type="fs"
                onShow={hasHistorySignature}
                data={dataFsQuote}
                fsAttachment={true}
                onHide={() => setHasHistorySignature(false)}
                buttonDownload={true}
              />
            ) : (
              <ViewHistorySignature type="fs" onShow={hasHistorySignature} data={dataFsQuote} onHide={() => setHasHistorySignature(false)} />
            ))}
        </div>
      </div>
      <AddFS
        onShow={showModalAdd}
        onHide={(reload) => {
          if (reload) {
            getListFsQuote(params);
          }

          setShowModalAdd(false);
          setDataFsQuote(null);
        }}
        data={dataFsQuote}
      />
      <CopyItemModal
        onShow={hasCopyQuote}
        lstData={listFsQuote}
        onHide={(reload) => {
          if (reload) {
            getListFsQuote(params);
          }
          setHasCopyQuote(false);
        }}
      />
      <AddSignerFSAndQuote
        onShow={hasSignature}
        onHide={(reload) => {
          if (reload) {
            getListFsQuote(params);
          }

          setHasSignature(false);
        }}
        dataProps={{
          objectId: dataFsQuote?.id,
          objectType: 1,
        }}
      />
      <AddTemplateFSQuote
        onShow={showModalChooseTemplate}
        data={dataFsQuote}
        type="fs"
        onHide={(reload) => {
          if (reload) {
            setShowModalSetingFS(true);
          }

          setShowModalChooseTemplate(false);
        }}
        callBack={(data) => {
          const updateData = listFsQuote.map((item) => {
            return {
              ...item,
              sheetId: item.id === data.id ? data.sheetId : item.sheetId,
            };
          });
          setListFsQuote(updateData);
          setDataFsQuote(data);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
