import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IInventoryResponse } from "model/inventory/InventoryResponseModel";
import { IInventoryFilterRequest } from "model/inventory/InventoryRequestModel";
import InventoryService from "services/InventoryService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import AddInventoryModal from "./partials/AddInventoryModal";
import { getPageOffset } from "reborn-util";
import { ContextType, UserContext } from "contexts/userContext";

import "./InventoryList.scss";

export default function InventoryList() {
  document.title = "Quản lý kho hàng";

  const navigation = useNavigate();

  const isMounted = useRef(false);
  const checkUserRoot = localStorage.getItem("user.root");
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [searchParams, setSearchParams] = useSearchParams();
  const [listInventory, setListInventory] = useState<IInventoryResponse[]>([]);
  const [dataInventory, setDataInventory] = useState<IInventoryResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState<IInventoryFilterRequest>({
    name: "",
  });

  const customerFilterList = useMemo(
    () =>
      [
        ...(+checkUserRoot == 1
          ? [
              {
                key: "inventoryId",
                name: "Kho hàng",
                type: "select",
                is_featured: true,
                value: searchParams.get("inventoryId") ?? "",
              },
            ]
          : []),
      ] as IFilterItem[],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách kho hàng",
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
    name: "Kho hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListInventory = async (paramsSearch: IInventoryFilterRequest) => {
    setIsLoading(true);

    const response = await InventoryService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListInventory(result);

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
      getListInventory(params);
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
      permissions["INVENTORY_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataInventory(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên kho", "Mã kho", "Địa chỉ kho", "Thủ kho", "Ngày tạo", "Trạng thái", "Thứ tự hiển thị", "Chi nhánh"];

  const dataFormat = ["text-center", "", "text-center", "", "text-center", "text-center", "text-center", "text-center", ""];

  const dataMappingArray = (item: IInventoryResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <a key={item.id} onClick={() => navigation(`/product_inventory?inventoryId=${item.id}`)}>
      {item.name}
    </a>,
    item.code,
    item.address,
    item.employeeName,
    moment(item.createdTime).format("DD/MM/YYYY"),
    BoxViewInventoryStatus(item.status),
    item.position,
    item.branchName,
  ];
  const BoxViewInventoryStatus = (contractStatus) => {
    const getStatus = (code: number) => {
      switch (code) {
        case 0:
          return "Ngưng sử dụng";
        case 1:
          return "Đang sử dụng";
      }
    };

    const getStatusColor = (code: number) => {
      switch (code) {
        case 0:
          return "secondary";
        case 1:
          return "primary";
      }
    };

    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
        <span className={`status__item--signature status__item--signature-${getStatusColor(contractStatus)}`}>{getStatus(contractStatus)}</span>
      </div>
    );
  };

  const actionsTable = (item: IInventoryResponse): IAction[] => {
    return [
      permissions["INVENTORY_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataInventory(item);
          setShowModalAdd(true);
        },
      },
      permissions["INVENTORY_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await InventoryService.delete(id);

    if (response.code === 0) {
      showToast("Xóa kho hàng thành công", "success");
      getListInventory(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IInventoryResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "kho hàng " : `${listIdChecked.length} kho hàng đã chọn`}
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
    permissions["INVENTORY_DELETE"] == 1 && {
      title: "Xóa kho hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-inventory${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Quản lý kho hàng" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên kho hàng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listInventory && listInventory.length > 0 ? (
          <BoxTable
            name="Kho hàng"
            titles={titles}
            items={listInventory}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có kho hàng nào. <br />
                    Hãy thêm mới kho hàng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới kho hàng"
                action={() => {
                  setListInventory(null);
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
      <AddInventoryModal
        onShow={showModalAdd}
        data={dataInventory}
        onHide={(reload) => {
          if (reload) {
            getListInventory(params);
          }
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
