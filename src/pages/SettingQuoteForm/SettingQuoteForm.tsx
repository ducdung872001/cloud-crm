import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import SheetQuoteFormService from "services/SheetQuoteFormService";
import AddQuoteForm from "./partials/AddQuoteForm/AddQuoteForm";
import AddTemplateQuote from "./partials/AddTemplateQuote/AddTemplateQuote";

export default function SettingQuoteForm() {
  document.title = "Cài đặt mẫu báo giá";

  const isMounted = useRef(false);

  const [listQuoteForm, setListQuoteForm] = useState([]);
  const [dataQuoteForm, setDataQuoteForm] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showModalAddConfig, setShowModalAddConfig] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách mẫu báo giá",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Mẫu báo giá",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListQuoteForm = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await SheetQuoteFormService.lst(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListQuoteForm(result.items);

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
      getListQuoteForm(params);
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
      {
        title: "Thêm mới",
        callback: () => {
          setDataQuoteForm(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên mẫu báo giá", "Mô tả mẫu báo giá", "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [getPageOffset(params) + index + 1, item.name, item.description, item.position];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      {
        title: "Cấu hình",
        icon: <Icon name="Settings" />,
        callback: () => {
          setDataQuoteForm(item);
          setShowModalAddConfig(true);
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataQuoteForm(item);
          setShowModalAdd(true);
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
    ];
  };

  const onDelete = async (id: number) => {
    const response = await SheetQuoteFormService.delete(id);

    if (response.code === 0) {
      showToast("Xóa mẫu báo giá thành công", "success");
      getListQuoteForm(params);
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
      const found = listQuoteForm.find((item) => item.id === selectedId);
      if (found?.id) {
        return SheetQuoteFormService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} mẫu báo giá`, "success");
        getListQuoteForm(params);
        setListIdChecked([]);
      } else {
        showToast("Không có mẫu báo giá nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "mẫu báo giá " : `${listIdChecked.length} mẫu báo giá đã chọn`}
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

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa mẫu báo giá",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-setting-quote-form${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Cài đặt mẫu báo giá" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên tên mẫu báo giá"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listQuoteForm && listQuoteForm.length > 0 ? (
          <BoxTable
            name="Mẫu báo giá"
            titles={titles}
            items={listQuoteForm}
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
                    Hiện tại chưa có mẫu báo giá nào. <br />
                    Hãy thêm mới mẫu báo giá đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới mẫu báo giá"
                action={() => {
                  setDataQuoteForm(null);
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
      <AddQuoteForm
        onShow={showModalAdd}
        data={dataQuoteForm}
        onHide={(reload) => {
          if (reload) {
            getListQuoteForm(params);
          }
          setShowModalAdd(false);
        }}
      />
      <AddTemplateQuote onShow={showModalAddConfig} data={dataQuoteForm} onHide={() => setShowModalAddConfig(false)} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
