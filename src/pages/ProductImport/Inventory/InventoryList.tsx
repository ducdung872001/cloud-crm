// WarehouseBookList.tsx
import React, { Fragment, useState, useEffect } from "react";
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
import { IAction } from "model/OtherModel";
import { showToast, getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import { MOCK_WAREHOUSE_BOOK, IWarehouseBook } from "assets/mock/Product";
import AddWarehouseBookModal from "./partials/AddInventoryModal";
import "./InventoryList.scss";

export default function WarehouseBookList() {
  document.title = "Sổ kho";

  const [listWarehouseBook, setListWarehouseBook] = useState<IWarehouseBook[]>([]);
  const [dataWarehouseBook, setDataWarehouseBook] = useState<IWarehouseBook>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [permissions] = useState(getPermissions());

  const [params, setParams] = useState({
    name: "",
    type: "",
    limit: 10,
    page: 1,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phiếu kho",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  // =====================
  // Lấy danh sách (mock)
  // =====================
  const getListWarehouseBook = (paramsSearch: any) => {
    setIsLoading(true);
    setTimeout(() => {
      let filtered = MOCK_WAREHOUSE_BOOK.filter((item) => {
        const matchName = item.productName.toLowerCase().includes((paramsSearch.name ?? "").toLowerCase());
        const matchType = paramsSearch.type ? item.type === paramsSearch.type : true;
        return matchName && matchType;
      });
      const total = filtered.length;
      const page = paramsSearch.page ?? 1;
      const limit = paramsSearch.limit ?? 10;
      setListWarehouseBook(filtered.slice((page - 1) * limit, page * limit));
      setPagination((prev) => ({
        ...prev,
        page,
        sizeLimit: limit,
        totalItem: total,
        totalPage: Math.ceil(total / limit),
      }));
      setIsNoItem(total === 0 && page === 1);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    getListWarehouseBook(params);
  }, [params]);

  // =====================
  // Render helpers
  // =====================
  const renderType = (type: IWarehouseBook["type"]) => {
    const map = {
      import: { label: "Nhập kho", color: "success" },
      export: { label: "Xuất kho", color: "error" },
      transfer: { label: "Chuyển kho", color: "primary" },
      adjust: { label: "Điều chỉnh", color: "warning" },
      return_from_supplier: { label: "Hoàn nhập - NCC", color: "success" },
      return_to_customer: { label: "Hoàn xuất - KH", color: "warning" },
    };
    const { label, color } = map[type];
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span className={`status__item--signature status__item--signature-${color}`}>{label}</span>
      </div>
    );
  };

  const renderStatus = (status: number) => (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
      <span className={`status__item--signature status__item--signature-${status === 1 ? "success" : "secondary"}`}>
        {status === 1 ? "Hoàn thành" : "Đã hủy"}
      </span>
    </div>
  );

  // =====================
  // Title actions
  // =====================
  const titleActions: ITitleActions = {
    actions: [
      permissions["WAREHOUSE_ADD"] == 1 && {
        title: "Thêm phiếu",
        callback: () => {
          setDataWarehouseBook(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  // =====================
  // Table config
  // =====================
  const titles = [
    "STT",
    "Mã phiếu",
    "Loại phiếu",
    "Ngày tạo",
    "Sản phẩm",
    "Đối tác",
    "Kho",
    "Biến động SL",
    "Tồn trước",
    "Tồn sau",
    "Người thực hiện",
    "Ref tài chính",
    "Trạng thái",
  ];
  const dataFormat = [
    "text-center",
    "",
    "text-center",
    "text-center",
    "",
    "",
    "",
    "text-center",
    "text-center",
    "text-center",
    "",
    "text-center",
    "text-center",
  ];

  const dataMappingArray = (item: IWarehouseBook, index: number) => [
    getPageOffset(params) + index + 1,
    // Mã phiếu
    <span key={`code-${item.id}`} className="warehouse__code">{item.code}</span>,
    // Loại phiếu
    renderType(item.type),
    // Ngày tạo
    moment(item.createdAt).format("DD/MM/YYYY HH:mm"),
    // Sản phẩm (tên + SKU)
    <div key={`product-${item.id}`}>
      <div className="warehouse__product-name">{item.productName}</div>
      <div className="warehouse__product-code">{item.productCode}</div>
    </div>,
    // Đối tác (NCC / KH)
    item.partnerName ? (
      <div key={`partner-${item.id}`} style={{ minWidth: "120px" }}>
        <div className="warehouse__partner-name">{item.partnerName}</div>
        <div className={`warehouse__partner-type warehouse__partner-type--${item.partnerType}`}>
          {item.partnerType === "supplier" ? "Nhà cung cấp" : "Khách hàng"}
        </div>
      </div>
    ) : "—",
    // Kho (nguồn → đích với chuyển kho)
    item.type === "transfer" ? (
      <span key={`wh-${item.id}`} className="warehouse__transfer" style={{ minWidth: "120px" }}>
        {item.warehouseFrom} → {item.warehouseTo}
      </span>
    ) : (
      <span key={`wh-${item.id}`} style={{ minWidth: "120px" }}>{item.warehouseName}</span>
    ),
    // Biến động SL (+/-)
    <span key={`qty-${item.id}`} className={item.quantity > 0 ? "warehouse__qty--positive" : "warehouse__qty--negative"}>
      {item.quantity > 0 ? `+${item.quantity}` : item.quantity} {item.unitName}
    </span>,
    // Tồn trước / sau
    item.stockBefore,
    item.stockAfter,
    // Người thực hiện
    item.createdBy,
    // Ref tài chính (link)
    item.refFinancial ? (
      <a key={`ref-${item.id}`} href={item.refFinancial.url ?? "#"} className="warehouse__ref-link" target="_blank" rel="noreferrer">
        {item.refFinancial.code}
      </a>
    ) : "—",
    // Trạng thái
    renderStatus(item.status),
  ];

  // =====================
  // Actions table
  // =====================
  const actionsTable = (item: IWarehouseBook): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Chi tiết",
        icon: <Icon name="CollectInfo" className={isCheckedItem ? "icon-disabled" : ""} style={{ width: 17 }} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataWarehouseBook(item);
            setShowModalAdd(true);
          }
        },
      },
      item.status === 1 && {
        title: "Hủy phiếu",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) showDialogConfirmCancel(item);
        },
      },
    ].filter(Boolean) as IAction[];
  };

  // =====================
  // Hủy phiếu
  // =====================
  const onCancel = (id: number) => {
    // TODO: gọi API thực tế
    showToast("Hủy phiếu kho thành công", "success");
    getListWarehouseBook(params);
    setShowDialog(false);
    setContentDialog(null);
  };

  const onCancelAll = () => {
    if (!listIdChecked.length) return;
    // TODO: gọi API hủy hàng loạt
    showToast(`Hủy thành công ${listIdChecked.length} phiếu kho`, "success");
    getListWarehouseBook(params);
    setListIdChecked([]);
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmCancel = (item?: IWarehouseBook) => {
    const content: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Hủy phiếu kho</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn hủy{" "}
          {item ? (
            <>
              <strong>{item.code}</strong>
            </>
          ) : (
            <>{listIdChecked.length} phiếu kho đã chọn</>
          )}
          ? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận hủy",
      defaultAction: () => {
        if (item?.id) {
          onCancel(item.id);
          return;
        }
        if (listIdChecked.length > 0) {
          onCancelAll();
          return;
        }
      },
    };
    setContentDialog(content);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Hủy phiếu đã chọn",
      callback: () => showDialogConfirmCancel(),
    },
  ];

  // =====================
  // Filter tabs
  // =====================
  const listTypeTabs = [
    { label: "Tất cả", value: "" },
    { label: "Nhập kho", value: "import" },
    { label: "Xuất kho", value: "export" },
    { label: "Chuyển kho", value: "transfer" },
    { label: "Điều chỉnh", value: "adjust" },
    { label: "Hoàn nhập - NCC", value: "return_from_supplier" },
    { label: "Hoàn xuất - KH", value: "return_to_customer" },
  ];

  return (
    <div className={`page-content page-warehouse-book${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Sổ kho" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        {/* Filter tabs */}
        <div className="warehouse__tabs">
          {listTypeTabs.map((tab) => (
            <div
              key={tab.value}
              className={`warehouse__tab-item ${params.type === tab.value ? "active" : ""}`}
              onClick={() => setParams((prev) => ({ ...prev, type: tab.value, page: 1 }))}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <SearchBox name="Tên sản phẩm" params={params} updateParams={(paramsNew) => setParams(paramsNew)} />

        {!isLoading && listWarehouseBook.length > 0 ? (
          <BoxTable
            name="Phiếu kho"
            titles={titles}
            items={listWarehouseBook}
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
                description={
                  <span>
                    Hiện tại chưa có phiếu kho nào. <br />
                    Hãy thêm phiếu kho đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm phiếu"
                action={() => {
                  setDataWarehouseBook(null);
                  setShowModalAdd(true);
                }}
              />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp. <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>

      <AddWarehouseBookModal
        onShow={showModalAdd}
        data={dataWarehouseBook}
        onHide={(reload) => {
          if (reload) getListWarehouseBook(params);
          setShowModalAdd(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
