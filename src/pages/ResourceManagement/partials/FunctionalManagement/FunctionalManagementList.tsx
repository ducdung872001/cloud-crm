import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
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
import { IAction, ISaveSearch, IFilterItem } from "model/OtherModel";
import { IFunctionalManagementListProps } from "model/functionalManagement/PropsModel";
import { IFunctionalManagementFilterRequest } from "model/functionalManagement/FunctionalManagementRequest";
import { IFunctionalManagementResponse } from "model/functionalManagement/FunctionalManagementResponse";
import FunctionalManagementService from "services/FunctionalManagementService";
import { showToast } from "utils/common";
import AddFunctionalManagementModal from "./partials/AddFunctionalManagementModal";
import { useSearchParams } from "react-router-dom";
import { getPageOffset } from 'reborn-util';

import "./FunctionalManagementList.scss";

export default function FunctionalManagementList(props: IFunctionalManagementListProps) {
  document.title = "Quản trị chức năng";

  const { onBackProps } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const isMounted = useRef(false);

  const [listFunctionalManagement, setListFunctionalManagement] = useState<IFunctionalManagementResponse[]>([]);
  const [dataFunctionalManagement, setDataFunctionalManagement] = useState<IFunctionalManagementResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<IFunctionalManagementFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách chức năng",
      is_active: true,
    },
  ]);

  const resourceFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "app",
        name: "Ứng dụng",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "crm",
            label: "CRM",
          },
          {
            value: "cms",
            label: "CMS",
          },
          {
            value: "market",
            label: "MARKET",
          },
          {
            value: "community",
            label: "COMMUNITY",
          },
        ],
        value: searchParams.get("app") ?? "",
      }
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Chức năng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListFunctionalManagement = async (paramsSearch: IFunctionalManagementFilterRequest) => {
    setIsLoading(true);

    const response = await FunctionalManagementService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListFunctionalManagement(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +params.page === 1) {
        setIsNoItem(true);
      }
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
      getListFunctionalManagement(params);
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
          setDataFunctionalManagement(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên chức năng", "Mã chức năng", "Đường dẫn"];

  const dataFormat = ["text-center", "", "", ""];

  const dataMappingArray = (item: IFunctionalManagementResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name, 
    item.code,
    item.uri
  ];

  const actionsTable = (item: IFunctionalManagementResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.includes(item.id);
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataFunctionalManagement(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"}/>,
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
    const response = await FunctionalManagementService.delete(id);

    if (response.code === 0) {
      showToast("Xóa chức năng thành công", "success");
      getListFunctionalManagement(params);
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
      const found = listFunctionalManagement.find((item) => item.id === selectedId);
      if (found?.id) {
        return FunctionalManagementService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} chức năng`, "success");
        getListFunctionalManagement(params);
        setListIdChecked([]);
      } else {
        showToast("Không có chức năng nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IFunctionalManagementResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "chức năng " : `${listIdChecked.length} chức năng đã chọn`}
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
      title: "Xóa chức năng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-functional-management${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Quản trị tài nguyên
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Quản trị chức năng</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên chức năng"
          params={params}
          isFilter={true}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          listFilterItem={resourceFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listFunctionalManagement && listFunctionalManagement.length > 0 ? (
          <BoxTable
            name="Phân hệ"
            titles={titles}
            items={listFunctionalManagement}
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
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có chức năng nào. <br />
                    Hãy thêm mới chức năng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới chức năng"
                action={() => {
                  setDataFunctionalManagement(null);
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
      <AddFunctionalManagementModal
        onShow={showModalAdd}
        data={dataFunctionalManagement}
        onHide={(reload) => {
          if (reload) {
            getListFunctionalManagement(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
