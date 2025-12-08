import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPageOffset } from 'reborn-util';

import "./CustomerView.scss";
import CustomerViewService from "services/CustomerViewService";
import AddCustomerViewModal from "./partials/AddCustomerViewModal";
import SettingCustomerViewModal from "./SettingCustomerView/SettingCustomerViewModal";

export default function CustomerView(props: any) {
  document.title = "Danh sách cấu trúc";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listCustomerView, setListCustomerView] = useState([]);
  const [dataCustomerView, setDataCustomerView] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isSettingCustomerView, setIsSettingCustomerView] = useState(false);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách cấu trúc",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCustomerView = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await CustomerViewService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCustomerView(result.items);

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
      getListCustomerView(params);
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
          setDataCustomerView(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên cấu trúc",  "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.position,
  ];

  const actionsTable = (item: any): IAction[] => {
        const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      {
        title: "Cài đặt cấu trúc",
        icon: <Icon name="Settings" />,
        callback: () => {
          setIsSettingCustomerView(true);
          setDataCustomerView(item);
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCustomerView(item);
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
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await CustomerViewService.delete(id);

    if (response.code === 0) {
      showToast("Xóa cấu trúc xem thành công", "success");
      getListCustomerView(params);
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
      const found = listCustomerView.find((item) => item.id === selectedId);
      if (found?.id) {
        return CustomerViewService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} cấu trúc xem thông tin khách hàng`, "success");
        getListCustomerView(params);
        setListIdChecked([]);
      } else {
        showToast("Không có cấu trúc xem thông tin khách hàng nào được xóa", "error");
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
          Bạn có chắc chắn muốn xóa {item ? "cấu trúc " : `${listIdChecked.length} cấu trúc đã chọn`}
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
      title: "Xóa cấu trúc",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-customer-view${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt khách hàng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách cấu trúc</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listCustomerView && listCustomerView.length > 0 ? (
          <BoxTable
            name="Cấu trúc xem"
            titles={titles}
            items={listCustomerView}
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
                    Hiện tại chưa có cấu trúc nào. <br />
                    Hãy thêm mới cấu trúc đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới cấu trúc xem thông tin"
                action={() => {
                  setListCustomerView(null);
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
      <AddCustomerViewModal
        onShow={showModalAdd}
        data={dataCustomerView}
        onHide={(reload) => {
          if (reload) {
            getListCustomerView(params);
          }
          setShowModalAdd(false);
        }}
      />
      <SettingCustomerViewModal
        onShow={isSettingCustomerView}
        dataCustomerView={dataCustomerView}
        onHide={(reload) => {
          if (reload) {
            // getListContractEform(params);
          }
          setIsSettingCustomerView(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
