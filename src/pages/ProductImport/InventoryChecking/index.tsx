// InventoryManagement.tsx
import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction } from "model/OtherModel";
import { showToast, getPermissions } from "utils/common";
import { getPageOffset, formatCurrency } from "reborn-util";
import {
  MOCK_STOCK,
  MOCK_IMPORT_ORDERS,
  MOCK_EXPORT_ORDERS,
  MOCK_STOCK_CHECK,
  IStockItem,
  IImportOrder,
  IExportOrder,
  IStockCheckItem,
} from "assets/mock/Product";
// import AddImportOrderModal from "./partials/AddImportOrderModal";
// import AddExportOrderModal from "./partials/AddExportOrderModal";
import "./styles.scss";

type TabType = "stock" | "import" | "export" | "check" | "cost";
type CostMethod = "average" | "fifo";

export default function InventoryManagement() {
  document.title = "Quản lý kho hàng";

  const isMounted = useRef(false);
  const [activeTab, setActiveTab] = useState<TabType>("stock");
  const [costMethod, setCostMethod] = useState<CostMethod>("average");
  const [permissions] = useState(getPermissions());

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [dataImport, setDataImport] = useState<IImportOrder>(null);
  const [dataExport, setDataExport] = useState<IExportOrder>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // =====================
  // Shared
  // =====================
  const [isLoading, setIsLoading] = useState(true);
  const [isNoItem, setIsNoItem] = useState(false);
  const [params, setParams] = useState({ name: "", status: "", limit: 10, page: 1 });
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Mục",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  // =====================
  // Data states
  // =====================
  const [listStock, setListStock] = useState<IStockItem[]>([]);
  const [listImport, setListImport] = useState<IImportOrder[]>([]);
  const [listExport, setListExport] = useState<IExportOrder[]>([]);
  const [listCheck, setListCheck] = useState<IStockCheckItem[]>([]);

  const listTabs = [
    { key: "stock", label: "Tồn kho", icon: "Warehouse" },
    { key: "import", label: "Nhập hàng", icon: "Download" },
    { key: "export", label: "Xuất hàng", icon: "Upload" },
    { key: "check", label: "Kiểm kho", icon: "ClipboardList" },
    { key: "cost", label: "Giá vốn", icon: "Calculator" },
  ];

  // Reset params khi đổi tab
  useEffect(() => {
    setParams({ name: "", status: "", limit: 10, page: 1 });
  }, [activeTab]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    loadData(params);
  }, [params, activeTab]);

  useEffect(() => {
    loadData(params);
  }, []);

  // =====================
  // Load data theo tab
  // =====================
  const loadData = (paramsSearch: any) => {
    setIsLoading(true);
    setTimeout(() => {
      const page = paramsSearch.page ?? 1;
      const limit = paramsSearch.limit ?? 10;
      const name = (paramsSearch.name ?? "").toLowerCase();
      const status = paramsSearch.status;

      let filtered: any[] = [];

      switch (activeTab) {
        case "stock":
          filtered = MOCK_STOCK.filter((i) => i.productName.toLowerCase().includes(name));
          setListStock(filtered.slice((page - 1) * limit, page * limit));
          break;

        case "import":
          filtered = MOCK_IMPORT_ORDERS.filter(
            (i) =>
              (i.code.toLowerCase().includes(name) || i.supplierName.toLowerCase().includes(name)) && (status !== "" ? i.status === +status : true)
          );
          setListImport(filtered.slice((page - 1) * limit, page * limit));
          break;

        case "export":
          filtered = MOCK_EXPORT_ORDERS.filter(
            (i) =>
              (i.code.toLowerCase().includes(name) || i.customerName.toLowerCase().includes(name)) && (status !== "" ? i.status === +status : true)
          );
          setListExport(filtered.slice((page - 1) * limit, page * limit));
          break;

        case "check":
          filtered = MOCK_STOCK_CHECK.filter((i) => i.productName.toLowerCase().includes(name));
          setListCheck(filtered.slice((page - 1) * limit, page * limit));
          break;

        case "cost":
          filtered = MOCK_STOCK.filter((i) => i.productName.toLowerCase().includes(name));
          setListStock(filtered.slice((page - 1) * limit, page * limit));
          break;
      }

      const total = filtered.length;
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

  // =====================
  // Helpers
  // =====================
  const renderStatus = (status: number, type: "order" | "stock" = "order") => {
    const map =
      type === "order"
        ? { 0: { label: "Nháp", color: "secondary" }, 1: { label: "Hoàn thành", color: "success" }, 2: { label: "Đã hủy", color: "error" } }
        : { 0: { label: "Hết hàng", color: "error" }, 1: { label: "Sắp hết", color: "warning" }, 2: { label: "Còn hàng", color: "success" } };
    const { label, color } = map[status] ?? { label: "—", color: "secondary" };
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
        <span className={`status__item--signature status__item--signature-${color}`}>{label}</span>
      </div>
    );
  };

  // Tính giá vốn FIFO
  const calcFIFO = (productId: number, exportQty: number) => {
    const imports = MOCK_IMPORT_ORDERS.filter((o) => o.status === 1)
      .flatMap((o) => o.items.filter((i) => i.productId === productId))
      .map((i) => ({ qty: i.quantity, price: i.priceUnit }));

    let remaining = exportQty;
    let totalCost = 0;
    for (const batch of imports) {
      if (remaining <= 0) break;
      const used = Math.min(remaining, batch.qty);
      totalCost += used * batch.price;
      remaining -= used;
    }
    return exportQty > 0 ? Math.round(totalCost / exportQty) : 0;
  };

  // Tính giá vốn bình quân
  const calcAverage = (currentStock: number, currentAvgCost: number, importQty: number, importPrice: number) => {
    if (currentStock + importQty === 0) return 0;
    return Math.round((currentStock * currentAvgCost + importQty * importPrice) / (currentStock + importQty));
  };

  const getStockStatus = (qty: number) => (qty === 0 ? 0 : qty <= 10 ? 1 : 2);

  // =====================
  // Summary cards
  // =====================
  const renderSummary = () => {
    switch (activeTab) {
      case "stock":
        return (
          <div className="inventory__summary">
            <div className="summary__card">
              <span className="summary__label">Tổng sản phẩm</span>
              <span className="summary__value">{MOCK_STOCK.length}</span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Tổng giá trị tồn</span>
              <span className="summary__value summary__value--primary">
                {formatCurrency(MOCK_STOCK.reduce((s, i) => s + i.currentStock * i.avgCost, 0))}đ
              </span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Sắp hết hàng</span>
              <span className="summary__value summary__value--warning">{MOCK_STOCK.filter((i) => i.currentStock <= 10).length} SP</span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Hết hàng</span>
              <span className="summary__value summary__value--error">{MOCK_STOCK.filter((i) => i.currentStock === 0).length} SP</span>
            </div>
          </div>
        );

      case "import":
        return (
          <div className="inventory__summary">
            <div className="summary__card">
              <span className="summary__label">Tổng phiếu nhập</span>
              <span className="summary__value">{MOCK_IMPORT_ORDERS.length}</span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Tổng tiền nhập</span>
              <span className="summary__value summary__value--primary">
                {formatCurrency(MOCK_IMPORT_ORDERS.filter((o) => o.status === 1).reduce((s, o) => s + o.totalAmount, 0))}đ
              </span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Hoàn thành</span>
              <span className="summary__value summary__value--success">{MOCK_IMPORT_ORDERS.filter((o) => o.status === 1).length} phiếu</span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Đang nháp</span>
              <span className="summary__value summary__value--warning">{MOCK_IMPORT_ORDERS.filter((o) => o.status === 0).length} phiếu</span>
            </div>
          </div>
        );

      case "export":
        return (
          <div className="inventory__summary">
            <div className="summary__card">
              <span className="summary__label">Tổng phiếu xuất</span>
              <span className="summary__value">{MOCK_EXPORT_ORDERS.length}</span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Doanh thu</span>
              <span className="summary__value summary__value--primary">
                {formatCurrency(MOCK_EXPORT_ORDERS.filter((o) => o.status === 1).reduce((s, o) => s + o.totalAmount, 0))}đ
              </span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Lợi nhuận</span>
              <span className="summary__value summary__value--success">
                {formatCurrency(
                  MOCK_EXPORT_ORDERS.filter((o) => o.status === 1)
                    .flatMap((o) => o.items)
                    .reduce((s, i) => s + (i.priceUnit - i.avgCost) * i.quantity, 0)
                )}
                đ
              </span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Tổng SL xuất</span>
              <span className="summary__value">
                {MOCK_EXPORT_ORDERS.filter((o) => o.status === 1)
                  .flatMap((o) => o.items)
                  .reduce((s, i) => s + i.quantity, 0)}{" "}
                SP
              </span>
            </div>
          </div>
        );

      case "check":
        return (
          <div className="inventory__summary">
            <div className="summary__card">
              <span className="summary__label">Tổng SP kiểm</span>
              <span className="summary__value">{MOCK_STOCK_CHECK.length}</span>
            </div>
            <div className="summary__card">
              <span className="summary__label">SP lệch</span>
              <span className="summary__value summary__value--warning">{MOCK_STOCK_CHECK.filter((i) => i.difference !== 0).length} SP</span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Tổng chênh lệch</span>
              <span
                className={`summary__value ${
                  MOCK_STOCK_CHECK.reduce((s, i) => s + i.diffAmount, 0) >= 0 ? "summary__value--success" : "summary__value--error"
                }`}
              >
                {formatCurrency(MOCK_STOCK_CHECK.reduce((s, i) => s + i.diffAmount, 0))}đ
              </span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Khớp số liệu</span>
              <span className="summary__value summary__value--success">{MOCK_STOCK_CHECK.filter((i) => i.difference === 0).length} SP</span>
            </div>
          </div>
        );

      case "cost":
        return (
          <div className="inventory__summary">
            <div className="summary__card">
              <span className="summary__label">Phương pháp</span>
              <span className="summary__value" style={{ fontSize: "1.6rem" }}>
                {costMethod === "average" ? "Bình quân gia quyền" : "FIFO"}
              </span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Tổng giá vốn tồn kho</span>
              <span className="summary__value summary__value--primary">
                {formatCurrency(MOCK_STOCK.reduce((s, i) => s + i.currentStock * i.avgCost, 0))}đ
              </span>
            </div>
            <div className="summary__card">
              <span className="summary__label">Lợi nhuận gộp</span>
              <span className="summary__value summary__value--success">
                {formatCurrency(
                  MOCK_EXPORT_ORDERS.filter((o) => o.status === 1)
                    .flatMap((o) => o.items)
                    .reduce((s, i) => s + (i.priceUnit - i.avgCost) * i.quantity, 0)
                )}
                đ
              </span>
            </div>
          </div>
        );
    }
  };

  // =====================
  // Title actions theo tab
  // =====================
  const titleActions: ITitleActions = {
    actions: [
      activeTab === "import" && {
        title: "Tạo phiếu nhập",
        callback: () => {
          setDataImport(null);
          setShowImportModal(true);
        },
      },
      activeTab === "export" && {
        title: "Tạo phiếu xuất",
        callback: () => {
          setDataExport(null);
          setShowExportModal(true);
        },
      },
      activeTab === "check" && {
        title: "Tạo phiếu kiểm kho",
        callback: () => showToast("Tính năng đang phát triển", "warning"),
      },
    ].filter(Boolean),
  };

  // =====================
  // Table configs theo tab
  // =====================
  const getTableConfig = () => {
    switch (activeTab) {
      case "stock":
        return {
          titles: ["STT", "Sản phẩm", "Kho", "Tồn kho", "Giá vốn BQ", "Giá trị tồn", "Trạng thái"],
          dataFormat: ["text-center", "", "", "text-center", "text-right", "text-right", "text-center"],
          items: listStock,
          dataMappingArray: (item: IStockItem, index: number) => [
            getPageOffset(params) + index + 1,
            <div key={item.id}>
              <div className="inventory__product-name">{item.productName}</div>
              <div className="inventory__product-code">{item.productCode}</div>
            </div>,
            item.warehouseName,
            <span key={`qty-${item.id}`} className={`inventory__qty ${item.currentStock <= 10 ? "inventory__qty--low" : ""}`}>
              {item.currentStock} {item.unitName}
              {item.currentStock <= 10 && item.currentStock > 0 && <span className="inventory__badge--low">Sắp hết</span>}
            </span>,
            formatCurrency(item.avgCost) + "đ",
            formatCurrency(item.currentStock * item.avgCost) + "đ",
            renderStatus(getStockStatus(item.currentStock), "stock"),
          ],
          actions: (_item: IStockItem): IAction[] => [],
        };

      case "import":
        return {
          titles: ["STT", "Mã phiếu", "Nhà cung cấp", "Kho nhập", "Số SP", "Tổng tiền", "Người tạo", "Ngày tạo", "Trạng thái"],
          dataFormat: ["text-center", "", "", "", "text-center", "text-right", "", "text-center", "text-center"],
          items: listImport,
          dataMappingArray: (item: IImportOrder, index: number) => [
            getPageOffset(params) + index + 1,
            <span key={item.id} className="inventory__code">
              {item.code}
            </span>,
            item.supplierName,
            item.warehouseName,
            item.items.reduce((s, i) => s + i.quantity, 0),
            formatCurrency(item.totalAmount) + "đ",
            item.createdBy,
            moment(item.createdAt).format("DD/MM/YYYY HH:mm"),
            renderStatus(item.status),
          ],
          actions: (item: IImportOrder): IAction[] =>
            [
              {
                title: "Chi tiết",
                icon: <Icon name="CollectInfo" style={{ width: 17 }} />,
                callback: () => {
                  setDataImport(item);
                  setShowImportModal(true);
                },
              },
              item.status === 0 && {
                title: "Xác nhận nhập",
                icon: <Icon name="Check" />,
                callback: () => {
                  setContentDialog({
                    color: "primary",
                    isCentered: true,
                    isLoading: true,
                    title: <Fragment>Xác nhận nhập hàng</Fragment>,
                    message: (
                      <Fragment>
                        Xác nhận nhập hàng phiếu <strong>{item.code}</strong>? Tồn kho sẽ được cập nhật.
                      </Fragment>
                    ),
                    cancelText: "Hủy",
                    cancelAction: () => {
                      setShowDialog(false);
                      setContentDialog(null);
                    },
                    defaultText: "Xác nhận",
                    defaultAction: () => {
                      showToast("Nhập hàng thành công!", "success");
                      loadData(params);
                      setShowDialog(false);
                      setContentDialog(null);
                    },
                  });
                  setShowDialog(true);
                },
              },
              item.status === 0 && {
                title: "Hủy phiếu",
                icon: <Icon name="Trash" className="icon-error" />,
                callback: () => {
                  setContentDialog({
                    color: "error",
                    isCentered: true,
                    isLoading: true,
                    title: <Fragment>Hủy phiếu nhập</Fragment>,
                    message: (
                      <Fragment>
                        Bạn có chắc muốn hủy phiếu <strong>{item.code}</strong>?
                      </Fragment>
                    ),
                    cancelText: "Quay lại",
                    cancelAction: () => {
                      setShowDialog(false);
                      setContentDialog(null);
                    },
                    defaultText: "Xác nhận hủy",
                    defaultAction: () => {
                      showToast("Đã hủy phiếu nhập", "success");
                      loadData(params);
                      setShowDialog(false);
                      setContentDialog(null);
                    },
                  });
                  setShowDialog(true);
                },
              },
            ].filter(Boolean) as IAction[],
        };

      case "export":
        return {
          titles: ["STT", "Mã phiếu", "Khách hàng", "Kho xuất", "Số SP", "Doanh thu", "Lợi nhuận", "Người tạo", "Ngày tạo", "Trạng thái"],
          dataFormat: ["text-center", "", "", "", "text-center", "text-right", "text-right", "", "text-center", "text-center"],
          items: listExport,
          dataMappingArray: (item: IExportOrder, index: number) => {
            const profit = item.items.reduce((s, i) => s + (i.priceUnit - i.avgCost) * i.quantity, 0);
            return [
              getPageOffset(params) + index + 1,
              <span key={item.id} className="inventory__code">
                {item.code}
              </span>,
              item.customerName,
              item.warehouseName,
              item.items.reduce((s, i) => s + i.quantity, 0),
              formatCurrency(item.totalAmount) + "đ",
              <span key={`profit-${item.id}`} className={profit >= 0 ? "inventory__profit--positive" : "inventory__profit--negative"}>
                {profit >= 0 ? "+" : ""}
                {formatCurrency(profit)}đ
              </span>,
              item.createdBy,
              moment(item.createdAt).format("DD/MM/YYYY HH:mm"),
              renderStatus(item.status),
            ];
          },
          actions: (item: IExportOrder): IAction[] =>
            [
              {
                title: "Chi tiết",
                icon: <Icon name="CollectInfo" style={{ width: 17 }} />,
                callback: () => {
                  setDataExport(item);
                  setShowExportModal(true);
                },
              },
              item.status === 0 && {
                title: "Xác nhận xuất",
                icon: <Icon name="Check" />,
                callback: () => {
                  setContentDialog({
                    color: "primary",
                    isCentered: true,
                    isLoading: true,
                    title: <Fragment>Xác nhận xuất hàng</Fragment>,
                    message: (
                      <Fragment>
                        Xác nhận xuất hàng phiếu <strong>{item.code}</strong>?
                      </Fragment>
                    ),
                    cancelText: "Hủy",
                    cancelAction: () => {
                      setShowDialog(false);
                      setContentDialog(null);
                    },
                    defaultText: "Xác nhận",
                    defaultAction: () => {
                      showToast("Xuất hàng thành công!", "success");
                      loadData(params);
                      setShowDialog(false);
                      setContentDialog(null);
                    },
                  });
                  setShowDialog(true);
                },
              },
            ].filter(Boolean) as IAction[],
        };

      case "check":
        return {
          titles: ["STT", "Sản phẩm", "Tồn hệ thống", "Tồn thực tế", "Chênh lệch", "Giá vốn", "Giá trị CL", "Kết quả"],
          dataFormat: ["text-center", "", "text-center", "text-center", "text-center", "text-right", "text-right", "text-center"],
          items: listCheck,
          dataMappingArray: (item: IStockCheckItem, index: number) => [
            getPageOffset(params) + index + 1,
            <div key={item.productId}>
              <div className="inventory__product-name">{item.productName}</div>
              <div className="inventory__product-code">{item.productCode}</div>
            </div>,
            `${item.systemStock} ${item.unitName}`,
            `${item.actualStock} ${item.unitName}`,
            <span
              key={`diff-${item.productId}`}
              className={`inventory__diff ${item.difference > 0 ? "positive" : item.difference < 0 ? "negative" : "zero"}`}
            >
              {item.difference > 0 ? `+${item.difference}` : item.difference} {item.unitName}
            </span>,
            formatCurrency(item.avgCost) + "đ",
            <span key={`amt-${item.productId}`} className={`inventory__diff ${item.diffAmount >= 0 ? "positive" : "negative"}`}>
              {item.diffAmount >= 0 ? "+" : ""}
              {formatCurrency(item.diffAmount)}đ
            </span>,
            item.difference === 0 ? (
              <span className="status__item--signature status__item--signature-success">Khớp</span>
            ) : (
              <span className="status__item--signature status__item--signature-warning">Lệch</span>
            ),
          ],
          actions: (_item: IStockCheckItem): IAction[] => [],
        };

      case "cost":
        return {
          titles: ["STT", "Sản phẩm", "Tồn kho", "Giá vốn hiện tại", "Giá trị tồn", "Lần nhập cuối", "Giá vốn mới", "Lợi nhuận/SP"],
          dataFormat: ["text-center", "", "text-center", "text-right", "text-right", "", "text-right", "text-right"],
          items: listStock,
          dataMappingArray: (item: IStockItem, index: number) => {
            const lastImport = MOCK_IMPORT_ORDERS.filter((o) => o.status === 1)
              .flatMap((o) => o.items.filter((i) => i.productId === item.productId))
              .pop();

            const newAvgCost = lastImport
              ? costMethod === "average"
                ? calcAverage(item.currentStock, item.avgCost, lastImport.quantity, lastImport.priceUnit)
                : calcFIFO(item.productId, lastImport.quantity)
              : item.avgCost;

            const lastExport = MOCK_EXPORT_ORDERS.filter((o) => o.status === 1)
              .flatMap((o) => o.items.filter((i) => i.productId === item.productId))
              .pop();

            const profitPerUnit = lastExport ? lastExport.priceUnit - newAvgCost : null;

            return [
              getPageOffset(params) + index + 1,
              <div key={item.id}>
                <div className="inventory__product-name">{item.productName}</div>
                <div className="inventory__product-code">{item.productCode}</div>
              </div>,
              `${item.currentStock} ${item.unitName}`,
              formatCurrency(item.avgCost) + "đ",
              formatCurrency(item.currentStock * item.avgCost) + "đ",
              lastImport ? `${lastImport.quantity} ${item.unitName} × ${formatCurrency(lastImport.priceUnit)}đ` : "—",
              <span
                key={`new-cost-${item.id}`}
                className={newAvgCost > item.avgCost ? "inventory__cost--up" : newAvgCost < item.avgCost ? "inventory__cost--down" : ""}
              >
                {formatCurrency(newAvgCost)}đ {newAvgCost > item.avgCost ? "▲" : newAvgCost < item.avgCost ? "▼" : ""}
              </span>,
              profitPerUnit !== null ? (
                <span key={`profit-${item.id}`} className={profitPerUnit >= 0 ? "inventory__profit--positive" : "inventory__profit--negative"}>
                  {profitPerUnit >= 0 ? "+" : ""}
                  {formatCurrency(profitPerUnit)}đ
                </span>
              ) : (
                "—"
              ),
            ];
          },
          actions: (_item: IStockItem): IAction[] => [],
        };
    }
  };

  const tableConfig = getTableConfig();

  return (
    <div className={`page-content page-inventory-management${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Quản lý kho hàng" titleActions={titleActions} />

      {/* Summary cards */}
      {renderSummary()}

      <div className="card-box d-flex flex-column">
        {/* Main tabs */}
        <div className="inventory__tabs">
          {listTabs.map((tab) => (
            <div
              key={tab.key}
              className={`inventory__tab-item ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key as TabType)}
            >
              <Icon name={tab.icon} style={{ width: 16 }} />
              <span>{tab.label}</span>
            </div>
          ))}
        </div>

        {/* Cost method selector - chỉ hiện ở tab giá vốn */}
        {activeTab === "cost" && (
          <div className="inventory__cost-method">
            <span className="cost-method__label">Phương pháp tính:</span>
            <div className="cost-method__options">
              <div className={`cost-method__item ${costMethod === "average" ? "active" : ""}`} onClick={() => setCostMethod("average")}>
                Bình quân gia quyền
              </div>
              <div className={`cost-method__item ${costMethod === "fifo" ? "active" : ""}`} onClick={() => setCostMethod("fifo")}>
                FIFO
              </div>
            </div>
          </div>
        )}

        {/* Status filter - chỉ hiện ở tab nhập/xuất */}
        {(activeTab === "import" || activeTab === "export") && (
          <div className="inventory__status-tabs">
            {[
              { label: "Tất cả", value: "" },
              { label: "Nháp", value: "0" },
              { label: "Hoàn thành", value: "1" },
              { label: "Đã hủy", value: "2" },
            ].map((tab) => (
              <div
                key={tab.value}
                className={`inventory__status-tab ${params.status === tab.value ? "active" : ""}`}
                onClick={() => setParams((prev) => ({ ...prev, status: tab.value, page: 1 }))}
              >
                {tab.label}
              </div>
            ))}
          </div>
        )}

        <SearchBox
          name={activeTab === "import" ? "Mã phiếu / Nhà cung cấp" : activeTab === "export" ? "Mã phiếu / Khách hàng" : "Tên sản phẩm"}
          params={params}
          updateParams={(p) => setParams(p)}
        />

        {!isLoading && tableConfig.items.length > 0 ? (
          <BoxTable
            name="Kho hàng"
            titles={tableConfig.titles}
            items={tableConfig.items}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => tableConfig.dataMappingArray(item, index)}
            dataFormat={tableConfig.dataFormat}
            striped={true}
            isBulkAction={false}
            actions={tableConfig.actions}
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
                    Không có dữ liệu.
                    <br />
                    Hãy thêm mới nhé!
                  </span>
                }
                type="no-item"
              />
            ) : (
              <SystemNotification description={<span>Không có dữ liệu trùng khớp.</span>} type="no-result" />
            )}
          </Fragment>
        )}
      </div>

      {/* <AddImportOrderModal
        onShow={showImportModal}
        data={dataImport}
        onHide={(reload) => {
          if (reload) loadData(params);
          setShowImportModal(false);
        }}
      /> */}
      {/* <AddExportOrderModal
        onShow={showExportModal}
        data={dataExport}
        onHide={(reload) => {
          if (reload) loadData(params);
          setShowExportModal(false);
        }}
      /> */}
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
