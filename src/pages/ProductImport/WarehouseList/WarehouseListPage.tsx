import React, { Fragment, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import WarehouseService from "services/WarehouseService";
import { ContextType, UserContext } from "contexts/userContext";
import { IWarehouseResponse } from "model/warehouse/WarehouseResponseModel";
import { urls } from "configs/urls";

export default function WarehouseListPage() {
  document.title = "Danh sách kho";

  const navigate = useNavigate();
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [listWarehouse, setListWarehouse] = useState<IWarehouseResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const [params, setParams] = useState<{
    name: string;
    page: number;
    limit: number;
    branchId?: number;
  }>({
    name: "",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Kho hàng",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  // =====================
  // API
  // =====================
  const getListWarehouse = async (paramsSearch: typeof params) => {
    setIsLoading(true);
    try {
      const response = await WarehouseService.list(paramsSearch);

      if (response.code === 0) {
        const result = response.result;
        const items: IWarehouseResponse[] = result?.items ?? [];
        setListWarehouse(items);

        const total = +result?.total ?? 0;
        const page = paramsSearch.page ?? 1;
        const limit = paramsSearch.limit ?? 10;
        setPagination((prev) => ({
          ...prev,
          page,
          sizeLimit: limit,
          totalItem: total,
          totalPage: Math.ceil(total / limit),
        }));
        setIsNoItem(total === 0 && page === 1);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } catch (err) {
      console.error("[WarehouseList] fetch exception:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async (id: number) => {
    // TODO: gắn API xóa kho khi có endpoint
    // const response = await WarehouseService.delete(id);
    // if (response.code === 0) {
    //   showToast("Xóa kho hàng thành công", "success");
    //   getListWarehouse(params);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
    showToast("Tính năng xóa kho đang được phát triển", "info");
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    // TODO: gắn API xóa nhiều kho khi có endpoint
    // const arrPromises = selectedIds.map((id) => WarehouseService.delete(id));
    // Promise.all(arrPromises).then((results) => {
    //   const count = results.filter(Boolean)?.length || 0;
    //   if (count > 0) {
    //     showToast(`Xóa thành công ${count} kho hàng`, "success");
    //     getListWarehouse(params);
    //     setListIdChecked([]);
    //   }
    // }).finally(() => {
    //   setShowDialog(false);
    //   setContentDialog(null);
    // });

    showToast("Tính năng xóa kho đang được phát triển", "info");
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IWarehouseResponse) => {
    const dialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa kho hàng</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? (
            <>
              kho hàng <strong>{item.name}</strong>
            </>
          ) : (
            `${listIdChecked.length} kho hàng đã chọn`
          )}
          ? Thao tác này không thể khôi phục.
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
        if (listIdChecked.length > 0) {
          onDeleteAll();
          return;
        }
      },
    };
    setContentDialog(dialog);
    setShowDialog(true);
  };

  // =====================
  // Effects
  // =====================
  useEffect(() => {
    if (dataBranch) {
      setParams((prev) => ({ ...prev, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  useEffect(() => {
    if (!params.branchId) return;
    getListWarehouse(params);
  }, [params]);

  // =====================
  // Table config
  // =====================
  const renderStatus = (status: number) => (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <span
        className={`status__item--signature status__item--signature-${
          status === 1 ? "success" : "secondary"
        }`}
      >
        {status === 1 ? "Hoạt động" : "Ngừng hoạt động"}
      </span>
    </div>
  );

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm phiếu",
        callback: () => {
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên kho", "Mã kho", "Địa chỉ", "Trạng thái"];
  const dataFormat = ["text-center", "", "text-center", "", "text-center"];

  const dataMappingArray = (item: IWarehouseResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <span key={`name-${index}`} className="warehouse__product-name">
      {item.name ?? "—"}
    </span>,
    <span key={`code-${index}`} className="warehouse__code">
      {item.code ?? "—"}
    </span>,
    item.address ?? "—",
    renderStatus(item.status),
  ];

  const actionsTable = (item: IWarehouseResponse): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Xem sổ kho",
        icon: (
          <Icon
            name="Eye"
            className={isCheckedItem ? "icon-disabled" : ""}
          />
        ),
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            navigate(urls.inventory_detail.replace(":id", String(item.id)));
          }
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setShowModalAdd(true);
          }
        },
      },
      {
        title: "Xóa",
        icon: (
          <Icon
            name="Trash"
            className={isCheckedItem ? "icon-disabled" : "icon-error"}
          />
        ),
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            showDialogConfirmDelete(item);
          }
        },
      },
    ];
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa kho hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-warehouse-list${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách kho" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên kho"
          params={params}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listWarehouse.length > 0 ? (
          <BoxTable
            name="Kho hàng"
            titles={titles}
            items={listWarehouse}
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
            {isNoItem ? (
              <SystemNotification
                description={<span>Hiện chưa có kho hàng nào.</span>}
                type="no-item"
              />
            ) : (
              <SystemNotification
                description={<span>Không tìm thấy kho phù hợp.</span>}
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
