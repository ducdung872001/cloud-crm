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
import ModalAddWarehouse from "./ModalAddWarehouse/ModalAddWarehouse";

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
  const [dataWarehouse, setdataWarehouse] = useState(null);

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

        const total = +result?.total || 0;
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

  /**
   * FE check truoc: kho co ton kho → hien dialog "Ngung su dung"
   *                  kho trang → hien dialog "Xoa vinh vien"
   * BE check lai (defense in depth) khi goi API delete/deactivate
   */
  const checkWarehouseHasStock = async (warehouseId: number): Promise<boolean> => {
    try {
      const response = await WarehouseService.hasStock(warehouseId);
      const items = response?.result?.items ?? response?.items ?? [];
      return items.length > 0;
    } catch {
      return false;
    }
  };

  /** Xoa cung kho trang */
  const onHardDelete = async (id: number, name: string) => {
    try {
      const response = await WarehouseService.delete(id);
      if (response.code === 0) {
        showToast("Đã xóa kho hàng", "success");
        getListWarehouse(params);
      } else {
        // BE reject (defense in depth) — hoi user ngung su dung
        showToast(response.message, "warning");
        setShowDialog(false);
        setContentDialog(null);
        showDeactivateDialog(id, name, response.message);
        return;
      }
    } catch {
      showToast("Không thể xóa kho hàng", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  /** Ngung su dung kho co giao dich */
  const onDeactivate = async (id: number) => {
    try {
      const res = await WarehouseService.deactivate(id);
      if (res.code === 0) {
        showToast("Đã chuyển kho sang Ngừng sử dụng", "success");
        getListWarehouse(params);
      } else {
        showToast(res.message ?? "Có lỗi xảy ra", "error");
      }
    } catch {
      showToast("Không thể cập nhật trạng thái kho", "error");
    } finally {
      setShowDialog(false);
      setContentDialog(null);
    }
  };

  /** Dialog hoi ngung su dung */
  const showDeactivateDialog = (id: number, name: string, reason: string) => {
    const dialog: IContentDialog = {
      color: "warning",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Ngừng sử dụng kho</Fragment>,
      message: (
        <Fragment>
          Kho <strong>{name}</strong> đã có giao dịch nên không thể xóa.
          {reason && <><br /><small>{reason}</small></>}
          <br /><br />
          Bạn có muốn chuyển sang <strong>Ngừng sử dụng</strong>?
          <br /><small>Dữ liệu lịch sử sẽ được giữ nguyên.</small>
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Ngừng sử dụng",
      defaultAction: () => onDeactivate(id),
    };
    setContentDialog(dialog);
    setShowDialog(true);
  };

  /** Xoa hang loat */
  const onDeleteAll = async () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;
    try {
      let deleted = 0, deactivated = 0;
      for (const id of selectedIds) {
        const hasStock = await checkWarehouseHasStock(id);
        if (hasStock) {
          await WarehouseService.deactivate(id).catch(() => {});
          deactivated++;
        } else {
          const res = await WarehouseService.delete(id).catch(() => ({ code: -1 }));
          if (res.code === 0) deleted++;
          else { await WarehouseService.deactivate(id).catch(() => {}); deactivated++; }
        }
      }
      const msgs: string[] = [];
      if (deleted > 0) msgs.push(`Đã xóa ${deleted} kho`);
      if (deactivated > 0) msgs.push(`Đã ngừng sử dụng ${deactivated} kho có giao dịch`);
      showToast(msgs.join(". "), "success");
      getListWarehouse(params);
      setListIdChecked([]);
    } catch {
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setShowDialog(false);
      setContentDialog(null);
    }
  };

  /** FE check truoc → hien dialog phu hop */
  const showDialogConfirmDelete = async (item?: IWarehouseResponse) => {
    if (!item) {
      // Xoa hang loat
      const dialog: IContentDialog = {
        color: "error",
        className: "dialog-delete",
        isCentered: true,
        isLoading: true,
        title: <Fragment>Xóa kho hàng</Fragment>,
        message: (
          <Fragment>
            Bạn có chắc chắn muốn xử lý <strong>{listIdChecked.length} kho hàng</strong> đã chọn?
            <br /><br />
            <small>• Kho trống sẽ bị xóa vĩnh viễn<br />• Kho có giao dịch sẽ chuyển sang Ngừng sử dụng</small>
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => { setShowDialog(false); setContentDialog(null); },
        defaultText: "Xác nhận",
        defaultAction: onDeleteAll,
      };
      setContentDialog(dialog);
      setShowDialog(true);
      return;
    }

    // FE check: kho co ton kho khong?
    const hasStock = await checkWarehouseHasStock(item.id);

    if (hasStock) {
      // Kho CO giao dich → dialog "Ngung su dung"
      showDeactivateDialog(item.id, item.name, "");
    } else {
      // Kho TRANG → dialog "Xoa vinh vien"
      const dialog: IContentDialog = {
        color: "error",
        className: "dialog-delete",
        isCentered: true,
        isLoading: true,
        title: <Fragment>Xóa kho hàng</Fragment>,
        message: (
          <Fragment>
            Bạn có chắc chắn muốn xóa vĩnh viễn kho <strong>{item.name}</strong>?
            <br /><small>Thao tác này không thể khôi phục.</small>
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => { setShowDialog(false); setContentDialog(null); },
        defaultText: "Xóa vĩnh viễn",
        defaultAction: () => onHardDelete(item.id, item.name),
      };
      setContentDialog(dialog);
      setShowDialog(true);
    }
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
      <span className={`status__item--signature status__item--signature-${status === 1 ? "success" : "secondary"}`}>
        {status === 1 ? "Hoạt động" : "Ngừng hoạt động"}
      </span>
    </div>
  );

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm kho",
        callback: () => {
          setShowModalAdd(true);
          setdataWarehouse(null);
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
      {(item.isSelling === 1 || item.is_selling === 1) && " (Kho chính)"}
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
      // {
      //   title: "Xem sổ kho",
      //   icon: (
      //     <Icon
      //       name="Eye"
      //       className={isCheckedItem ? "icon-disabled" : ""}
      //     />
      //   ),
      //   disabled: isCheckedItem,
      //   callback: () => {
      //     if (!isCheckedItem) {
      //       navigate(urls.inventory_detail.replace(":id", String(item.id)));
      //     }
      //   },
      // },
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setShowModalAdd(true);
            setdataWarehouse(item);
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
        <SearchBox name="Tên kho" params={params} updateParams={(paramsNew) => setParams(paramsNew)} />

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
              <SystemNotification description={<span>Hiện chưa có kho hàng nào.</span>} type="no-item" />
            ) : (
              <SystemNotification description={<span>Không tìm thấy kho phù hợp.</span>} type="no-result" />
            )}
          </Fragment>
        )}
      </div>

      <ModalAddWarehouse
        onShow={showModalAdd}
        data={dataWarehouse}
        onHide={(reload) => {
          if (reload) {
            getListWarehouse(params);
          }
          setShowModalAdd(false);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
