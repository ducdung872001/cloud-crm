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
   * Kiem tra kho co giao dich (san pham ton kho) hay khong.
   * Tra ve true = kho da co giao dich → chi cho "Ngung su dung", khong cho xoa cung.
   */
  const checkWarehouseHasTransaction = async (warehouseId: number): Promise<boolean> => {
    try {
      const response = await WarehouseService.productList({ inventoryId: warehouseId, page: 1, size: 1 });
      if (response?.code !== 0 && !response?.result && !response?.items) {
        // API tra loi khong hop le (chua co endpoint) → coi nhu kho trang
        return false;
      }
      const items = response?.result?.items ?? response?.items ?? [];
      return items.length > 0;
    } catch {
      // API loi (404, 500, network) → coi nhu kho trang de cho phep xoa
      // Backend se kiem tra lai truoc khi xoa thuc su (defense in depth)
      return false;
    }
  };

  /** Xoa cung — chi dung cho kho TRANG (chua co giao dich nao) */
  const onHardDelete = async (id: number) => {
    try {
      const response = await WarehouseService.delete(id);
      if (response.code === 0) {
        showToast("Đã xóa kho hàng", "success");
        getListWarehouse(params);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra", "error");
      }
    } catch {
      showToast("Không thể xóa kho hàng", "error");
    } finally {
      setShowDialog(false);
      setContentDialog(null);
    }
  };

  /** Chuyen kho sang "Ngung su dung" — dung cho kho DA CO giao dich */
  const onDeactivate = async (id: number) => {
    try {
      const response = await WarehouseService.deactivate(id);
      if (response.code === 0) {
        showToast("Đã chuyển kho sang trạng thái Ngừng sử dụng", "success");
        getListWarehouse(params);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra", "error");
      }
    } catch {
      showToast("Không thể cập nhật trạng thái kho", "error");
    } finally {
      setShowDialog(false);
      setContentDialog(null);
    }
  };

  /** Xu ly xoa hang loat */
  const onDeleteAll = async () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    try {
      let hardDeleteCount = 0;
      let deactivateCount = 0;

      for (const id of selectedIds) {
        const hasTransaction = await checkWarehouseHasTransaction(id);
        if (hasTransaction) {
          await WarehouseService.deactivate(id).catch(() => {});
          deactivateCount++;
        } else {
          await WarehouseService.delete(id).catch(() => {});
          hardDeleteCount++;
        }
      }

      const messages: string[] = [];
      if (hardDeleteCount > 0) messages.push(`Đã xóa ${hardDeleteCount} kho trống`);
      if (deactivateCount > 0) messages.push(`Đã ngừng sử dụng ${deactivateCount} kho có giao dịch`);
      showToast(messages.join(". "), "success");

      getListWarehouse(params);
      setListIdChecked([]);
    } catch {
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setShowDialog(false);
      setContentDialog(null);
    }
  };

  /**
   * Hien dialog phu hop:
   * - Kho trang → "Xoa vinh vien"
   * - Kho co giao dich → "Ngung su dung"
   */
  const showDialogConfirmDelete = async (item?: IWarehouseResponse) => {
    // Xoa hang loat — khong kiem tra tung cai, xu ly trong onDeleteAll
    if (!item) {
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
            <small>• Kho chưa có giao dịch sẽ bị xóa vĩnh viễn<br />• Kho đã có giao dịch sẽ chuyển sang "Ngừng sử dụng"</small>
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

    // Xoa 1 kho — kiem tra truoc de hien dialog phu hop
    const hasTransaction = await checkWarehouseHasTransaction(item.id);

    if (hasTransaction) {
      // Kho DA CO giao dich → chi cho "Ngung su dung"
      const dialog: IContentDialog = {
        color: "warning",
        className: "dialog-delete",
        isCentered: true,
        isLoading: true,
        title: <Fragment>Ngừng sử dụng kho</Fragment>,
        message: (
          <Fragment>
            Kho <strong>{item.name}</strong> đã có giao dịch nên không thể xóa vĩnh viễn.
            <br /><br />
            Bạn có muốn chuyển sang trạng thái <strong>Ngừng sử dụng</strong>?
            <br />
            <small>Dữ liệu lịch sử sẽ được giữ nguyên.</small>
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => { setShowDialog(false); setContentDialog(null); },
        defaultText: "Ngừng sử dụng",
        defaultAction: () => onDeactivate(item.id),
      };
      setContentDialog(dialog);
      setShowDialog(true);
    } else {
      // Kho TRANG → cho xoa cung
      const dialog: IContentDialog = {
        color: "error",
        className: "dialog-delete",
        isCentered: true,
        isLoading: true,
        title: <Fragment>Xóa kho hàng</Fragment>,
        message: (
          <Fragment>
            Bạn có chắc chắn muốn xóa vĩnh viễn kho <strong>{item.name}</strong>?
            <br />
            <small>Thao tác này không thể khôi phục.</small>
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => { setShowDialog(false); setContentDialog(null); },
        defaultText: "Xóa vĩnh viễn",
        defaultAction: () => onHardDelete(item.id),
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
