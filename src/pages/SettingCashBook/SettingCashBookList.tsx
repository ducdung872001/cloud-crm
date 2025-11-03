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
import { IAction } from "model/OtherModel";
import { ICategoryFilterRequest } from "model/category/CategoryResquestModel";
import { ICategoryResponse } from "model/category/CategoryResponse";
import { showToast } from "utils/common";
import CategoryService from "services/CategoryService";
import SettingAddCashBookModal from "./partials/SettingAddCashBookModal";
import { getPermissions } from "utils/common";
import { getPageOffset } from 'reborn-util';

import "./SettingCashBookList.scss";

export default function SettingCashBookList() {
  document.title = "Cài đặt tài chính";
  const isMounted = useRef(false);

  const [listCashBook, setListCashBook] = useState<ICategoryResponse[]>([]);
  const [dataCashBook, setDataCashBook] = useState<ICategoryResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [tab, setTab] = useState({
    name: "tab_one",
    type: 1,
  });

  const [params, setParams] = useState<ICategoryFilterRequest>({
    name: "",
    limit: 10,
    type: tab.type,
  });

  const nameCommon = tab.type === 1 ? "thu" : "chi";

  useEffect(() => {
    //Note: đoạn set lại state này với mục đích là khi mà mình chuyển tab thì nó sẽ tự update lại type
    setParams({ ...params, type: tab.type });
  }, [tab]);

  const listTabs = [
    {
      title: "Danh sách loại thu",
      is_active: "tab_one",
      type: 1,
    },
    {
      title: "Danh sách loại chi",
      is_active: "tab_two",
      type: 2,
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: `Loại ${nameCommon}`,
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  // đoạn này làm với mục đích khi mà tab thay đổi thì
  // tên ở dưới chân phần phân trang thay đổi theo
  useEffect(() => {
    setPagination({ ...pagination, name: `Loại ${nameCommon}` });
  }, [tab]);

  const abortController = new AbortController();
  const getListCashBook = async (paramsSearch: ICategoryFilterRequest) => {
    setIsLoading(true);

    const response = await CategoryService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCashBook(result);

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
      getListCashBook(params);
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
      permissions["CATEGORY_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataCashBook(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", `Tên loại ${nameCommon}`, "Loại", "Mã loại", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-center", "", "text-center"];

  const dataMappingArray = (item: ICategoryResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.type === 1 ? "Thu" : "Chi",
    item.code,
    item.position,
  ];

  const actionsTable = (item: ICategoryResponse): IAction[] => {
    return [
      permissions["CATEGORY_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataCashBook(item);
          setShowModalAdd(true);
        },
      },
      permissions["CATEGORY_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await CategoryService.delete(id);

    if (response.code === 0) {
      showToast(`Xóa danh mục ${nameCommon} thành công`, "success");
      getListCashBook(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICategoryResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? `danh mục ${item.type === 1 ? "thu " : "chi "}` : `${listIdChecked.length} danh mục ${item.type === 1 ? "thu " : "chi "} đã chọn`}
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
    permissions["CATEGORY_DELETE"] == 1 && {
      title: `Xóa danh mục ${nameCommon}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-cashBook${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Cài đặt tài chính" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) => (
                <li
                  key={idx}
                  className={item.is_active == tab.name ? "active" : ""}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setTab({ name: item.is_active, type: item.type });
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <SearchBox name={`Tên loại ${nameCommon}`} params={params} updateParams={(paramsNew) => setParams(paramsNew)} />

        {!isLoading && listCashBook && listCashBook.length > 0 ? (
          <BoxTable
            name="Loại thu/chi"
            titles={titles}
            items={listCashBook}
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
                    Hiện tại chưa có danh mục thu chi nào. <br />
                    Hãy thêm mới danh mục thu chi đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới danh mục thu chi"
                action={() => {
                  setDataCashBook(null);
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
      <SettingAddCashBookModal
        onShow={showModalAdd}
        data={dataCashBook}
        tab={tab.type}
        onHide={(reload) => {
          if (reload) {
            getListCashBook(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
