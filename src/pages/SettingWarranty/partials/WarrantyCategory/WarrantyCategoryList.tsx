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
import { IWarrantyCategoryFilterRequest } from "model/warrantyCategory/WarrantyCategoryRequestModel";
import { IWarrantyCategoryResponse } from "model/warrantyCategory/WarrantyCategoryResponseModel";
import WarrantyCategoryService from "services/WarrantyCategoryService";
import { showToast } from "utils/common";
import AddWarrantyCategoryModel from "./partials/AddWarrantyCategoryModel";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";

import "./WarrantyCategoryList.scss";

export default function SettingWarrantyList(props) {
  document.title = "Cài đặt bảo hành";

  const isMounted = useRef(false);

  const { onBackProps } = props;

  const [listSettingWarranty, setListSettingWarranty] = useState<IWarrantyCategoryResponse[]>([]);
  const [dataSettingWarranty, setDataSettingWarranty] = useState<IWarrantyCategoryResponse>(null);
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
  });
  const [params, setParams] = useState<IWarrantyCategoryFilterRequest>({
    name: "",
  });

  useEffect(() => {
    setParams({ ...params });
  }, [tab]);

  const listTabs = [
    {
      title: "Danh mục lý do bảo hành",
      is_active: "tab_one",
      type: 1,
    },
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "cài đặt bảo hành",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListSettingWarranty = async (paramsSearch: IWarrantyCategoryFilterRequest) => {
    setIsLoading(true);

    const response = await WarrantyCategoryService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSettingWarranty(result.items);

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
      getListSettingWarranty(params);
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
      permissions["WARRANTY_CATEGORY_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataSettingWarranty(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const name = "lý do bảo hành";

  useEffect(() => {
    setPagination({ ...pagination, name: name });
  }, [tab]);

  const titles = ["STT", `Tên ${name}`, "Thứ tự hiển thị"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: IWarrantyCategoryResponse, index: number) => [getPageOffset(params) + index + 1, item.name, item.position];

  const actionsTable = (item: IWarrantyCategoryResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      permissions["WARRANTY_CATEGORY_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataSettingWarranty(item);
          setShowModalAdd(true);
          }
        },
      },
      permissions["WARRANTY_CATEGORY_DELETE"] == 1 && {
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
    const response = await WarrantyCategoryService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa danh mục ${name} thành công`, "success");
      getListSettingWarranty(params);
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
      const found = listSettingWarranty.find((item) => item.id === selectedId);
      if (found?.id) {
        return WarrantyCategoryService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} danh mục hỗ trợ bảo hành`, "success");
        getListSettingWarranty(params);
        setListIdChecked([]);
      } else {
        showToast("Không có danh mục hỗ trợ bảo hành nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IWarrantyCategoryResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa danh mục {item ? name : `${listIdChecked.length} ${name} đã chọn`}
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
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
    permissions["WARRANTY_CATEGORY_DELETE"] == 1 && {
      title: `Xóa danh mục ${name}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục hỗ trợ bảo hành",
      is_active: true,
    },
  ]);

  return (
    <div className={`page-content page__warranty--category--support${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first`}
            title="Quay lại"
          >
            Cài đặt bảo hành
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className={`title-last`}>Danh mục hỗ trợ bảo hành</h1>
        </div>
        {<TitleAction title="" titleActions={titleActions} />}
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name={`Tên ${name}`}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          params={params}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listSettingWarranty && listSettingWarranty.length > 0 ? (
          <BoxTable
            name="Cài đặt bảo hành"
            titles={titles}
            items={listSettingWarranty}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            isBulkAction={true}
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
                    Hiện tại chưa có danh mục {name} nào. <br />
                    Hãy thêm mới danh mục {name} đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton={`Thêm mới ${name}`}
                action={() => {
                  setDataSettingWarranty(null);
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
        <AddWarrantyCategoryModel
          onShow={showModalAdd}
          data={dataSettingWarranty}
          onHide={(reload) => {
            if (reload) {
              getListSettingWarranty(params);
            }
            setShowModalAdd(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}
