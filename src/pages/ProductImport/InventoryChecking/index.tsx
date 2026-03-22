// Quản lý kho — index.tsx
// Tab "Tồn kho"     → API: GET /inventoryBalance/stockProduct/list   ✅
// Tab "Phiếu nhập"  → API: GET /invoice/import/list                  ✅
// Tab "Chuyển kho"  → API: GET /stockTransfer/list                   ✅
// Tab "Xuất hủy"    → stockAdjust type=DESTROY (coming soon)         ⏳
// Tab "Phiếu kiểm"  → API: GET /stockAdjust/list                     ✅
// Tab "Giá vốn"     → coming soon                                    ⏳

import React, { Fragment, useState, useEffect, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
import InventoryService from "services/InventoryService";
import InvoiceService from "services/InvoiceService";
import AdjustmentSlipService from "services/AdjustmentSlipService";
import urls from "@/configs/urls";
import "./styles.scss";

type TabType = "stock" | "import" | "export" | "transfer" | "destroy" | "check" | "cost";

// ── Response shapes ───────────────────────────────────────────────────────
interface IStockProductItem {
  inventoryBalanceId: number;
  productId: number;
  variantId?: number;
  warehouseId: number;
  productName: string;
  productCode?: string;
  batchNo?: string;
  expiryDate?: string;
  unitName: string;
  quantity: number;
  warehouseName: string;
  avgCost?: number;
  stockStatus?: number;
  updatedTime?: string;
}

interface IImportInvoiceItem {
  id: number;
  invoiceCode?: string;
  code?: string;
  supplierName?: string;
  warehouseName?: string;
  totalAmount?: number;
  createdBy?: string;
  createdTime?: string;
  status?: number; // 0: nháp, 1: hoàn thành, 2: hủy
}

interface IStockTransferItem {
  id: number;
  code?: string;
  fromWarehouseId?: number;
  fromWarehouseName?: string;
  toWarehouseId?: number;
  toWarehouseName?: string;
  status?: number; // 0: chờ duyệt, 1: hoàn thành, 2: hủy
  note?: string;
  createdTime?: string;
  createdBy?: string;
}

interface IStockAdjustItem {
  id: number;
  code?: string;
  inventoryId?: number;
  inventoryName?: string;
  status?: number; // 0: chờ duyệt, 1: hoàn thành, 2: từ chối
  createdTime?: string;
  creatorName?: string;
}

export default function InventoryManagement() {
  document.title = "Quản lý kho";

  const navigate = useNavigate();
  const isMounted = useRef(false);
  const [activeTab, setActiveTab] = useState<TabType>("stock");
  const [permissions] = useState(getPermissions());

  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // ── Shared state ─────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isNoItem, setIsNoItem] = useState(false);
  const [params, setParams] = useState<{
    keyword: string;
    status: string;
    warehouseId?: string;
    limit: number;
    page: number;
  }>({ keyword: "", status: "", limit: 10, page: 1 });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Mục",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  // ── Per-tab data ──────────────────────────────────────────────────────────
  const [listStock,    setListStock]    = useState<IStockProductItem[]>([]);
  const [listImport,   setListImport]   = useState<IImportInvoiceItem[]>([]);
  const [listTransfer, setListTransfer] = useState<IStockTransferItem[]>([]);
  const [listCheck,    setListCheck]    = useState<IStockAdjustItem[]>([]);

  // ── Summary counters ──────────────────────────────────────────────────────
  const [stockSummary, setStockSummary] = useState({
    total: 0, totalValue: 0, lowStock: 0, outOfStock: 0,
  });
  const [importSummary, setImportSummary] = useState({
    totalSlip: 0, totalAmount: 0, completed: 0, draft: 0,
  });
  const [transferSummary, setTransferSummary] = useState({
    total: 0, pending: 0, completed: 0, cancelled: 0,
  });
  const [checkSummary, setCheckSummary] = useState({
    total: 0, pending: 0, completed: 0, rejected: 0,
  });

  const listTabs: { key: TabType; label: string; icon: string }[] = [
    { key: "stock",    label: "Tồn kho",    icon: "Warehouse" },
    { key: "import",   label: "Phiếu nhập", icon: "Download" },
    { key: "export",   label: "Phiếu xuất", icon: "Upload" },
    { key: "transfer", label: "Chuyển kho", icon: "ArrowLeftRight" },
    { key: "destroy",  label: "Xuất hủy",   icon: "Trash2" },
    { key: "check",    label: "Phiếu kiểm", icon: "ClipboardList" },
    { key: "cost",     label: "Giá vốn",    icon: "Calculator" },
  ];

  useEffect(() => {
    setParams({ keyword: "", status: "", limit: 10, page: 1 });
  }, [activeTab]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      loadData(params);
      return;
    }
    loadData(params);
  }, [params, activeTab]);

  // ── Load data theo tab ────────────────────────────────────────────────────
  const loadData = async (p: typeof params) => {
    setIsLoading(true);
    const abortCtrl = new AbortController();
    const pageIdx = Math.max((p.page ?? 1) - 1, 0);
    const size = p.limit ?? 10;

    try {
      switch (activeTab) {

        // ── Tồn kho → /inventoryBalance/stockProduct/list ──────────────────
        case "stock": {
          const stockParams: Record<string, any> = { page: pageIdx, size };
          if (p.keyword)       stockParams.keyword     = p.keyword;
          if (p.warehouseId)   stockParams.warehouseId = +p.warehouseId;
          if (p.status !== "") stockParams.stockStatus  = +p.status;
          const res = await InventoryService.stockProductList(stockParams as any, abortCtrl.signal);
          if (res.code === 0 || res.status === 1) {
            const result = res.result ?? res.data ?? {};
            const items: IStockProductItem[] = result.items ?? result.content ?? result.data ?? [];
            const total = +(result.total ?? result.totalElements ?? items.length ?? 0);
            setListStock(items);
            setStockSummary({
              total,
              totalValue: items.reduce((s, i) => s + (i.quantity ?? 0) * (i.avgCost ?? 0), 0),
              lowStock:   items.filter((i) => (i.quantity ?? 0) <= 10 && (i.quantity ?? 0) > 0).length,
              outOfStock: items.filter((i) => (i.quantity ?? 0) === 0).length,
            });
            setPaginationMeta(total, p.page, size);
            setIsNoItem(total === 0 && p.page === 1);
          } else {
            showToast(res.message ?? "Không tải được dữ liệu tồn kho", "error");
          }
          break;
        }

        // ── Phiếu nhập → /invoice/import/list ─────────────────────────────
        case "import": {
          const importParams: Record<string, any> = { page: pageIdx, size };
          if (p.keyword)       importParams.keyword = p.keyword;
          if (p.status !== "") importParams.status  = +p.status;
          const res = await InvoiceService.importList(importParams);
          if (res.code === 0 || res.status === 1) {
            const result = res.result ?? res.data ?? {};
            const items: IImportInvoiceItem[] = result.items ?? result.content ?? result.data ?? [];
            const total = +(result.total ?? result.totalElements ?? items.length ?? 0);
            setListImport(items);
            setImportSummary({
              totalSlip:   total,
              totalAmount: items.filter((i) => i.status === 1).reduce((s, i) => s + (i.totalAmount ?? 0), 0),
              completed:   items.filter((i) => i.status === 1).length,
              draft:       items.filter((i) => i.status === 0).length,
            });
            setPaginationMeta(total, p.page, size);
            setIsNoItem(total === 0 && p.page === 1);
          } else {
            showToast(res.message ?? "Không tải được danh sách phiếu nhập", "error");
          }
          break;
        }

        // ── Chuyển kho → /stockTransfer/list ──────────────────────────────
        case "transfer": {
          const transferParams: Record<string, any> = { page: pageIdx, size };
          if (p.status !== "") transferParams.status = +p.status;
          const res = await InventoryService.stockTransferList(transferParams as any, abortCtrl.signal);
          if (res.code === 0 || res.status === 1) {
            const result = res.result ?? res.data ?? {};
            const items: IStockTransferItem[] = result.items ?? result.content ?? result.data ?? [];
            const total = +(result.total ?? result.totalElements ?? items.length ?? 0);
            setListTransfer(items);
            setTransferSummary({
              total,
              pending:   items.filter((i) => i.status === 0).length,
              completed: items.filter((i) => i.status === 1).length,
              cancelled: items.filter((i) => i.status === 2).length,
            });
            setPaginationMeta(total, p.page, size);
            setIsNoItem(total === 0 && p.page === 1);
          } else {
            showToast(res.message ?? "Không tải được danh sách phiếu chuyển kho", "error");
          }
          break;
        }

        // ── Phiếu kiểm → /stockAdjust/list ────────────────────────────────
        case "check": {
          const checkParams: Record<string, any> = { page: pageIdx, limit: size };
          if (p.keyword)       checkParams.name   = p.keyword;
          if (p.status !== "") checkParams.status = +p.status;
          const res = await AdjustmentSlipService.list(checkParams as any, abortCtrl.signal);
          if (res.code === 0 || res.status === 1) {
            const result = res.result ?? res.data ?? {};
            const items: IStockAdjustItem[] = result.items ?? result.content ?? result.data ?? [];
            const total = +(result.total ?? result.totalElements ?? items.length ?? 0);
            setListCheck(items);
            setCheckSummary({
              total,
              pending:  items.filter((i) => i.status === 0).length,
              completed: items.filter((i) => i.status === 1).length,
              rejected:  items.filter((i) => i.status === 2).length,
            });
            setPaginationMeta(total, p.page, size);
            setIsNoItem(total === 0 && p.page === 1);
          } else {
            showToast(res.message ?? "Không tải được danh sách phiếu kiểm kho", "error");
          }
          break;
        }

        // ── Phiếu xuất / Xuất hủy / Giá vốn → chưa có API ─────────────────
        case "export":
        case "destroy":
        case "cost":
          setIsNoItem(true);
          setPaginationMeta(0, 1, size);
          break;
      }
    } catch (err) {
      if ((err as any)?.name !== "AbortError") {
        showToast("Có lỗi xảy ra khi tải dữ liệu", "error");
      }
    } finally {
      setIsLoading(false);
    }

    return () => abortCtrl.abort();
  };

  const setPaginationMeta = (total: number, page: number, size: number) => {
    setPagination((prev) => ({
      ...prev, page, sizeLimit: size,
      totalItem: total,
      totalPage: Math.ceil(total / size),
    }));
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const renderBadge = (
    status: number,
    map: Record<number, { label: string; color: string }>
  ) => {
    const { label, color } = map[status] ?? { label: "—", color: "secondary" };
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
        <span className={`status__item--signature status__item--signature-${color}`}>{label}</span>
      </div>
    );
  };

  const ORDER_STATUS_MAP = {
    0: { label: "Nháp",       color: "secondary" },
    1: { label: "Hoàn thành", color: "success" },
    2: { label: "Đã hủy",     color: "error" },
  };

  const TRANSFER_STATUS_MAP = {
    0: { label: "Chờ duyệt",  color: "warning" },
    1: { label: "Hoàn thành", color: "success" },
    2: { label: "Đã hủy",     color: "error" },
  };

  const CHECK_STATUS_MAP = {
    0: { label: "Chờ duyệt",  color: "warning" },
    1: { label: "Hoàn thành", color: "success" },
    2: { label: "Từ chối",    color: "error" },
  };

  const renderStockStatus = (qty: number) => {
    const { label, color } =
      qty === 0   ? { label: "Hết hàng", color: "error" }
      : qty <= 10 ? { label: "Sắp hết",  color: "warning" }
                  : { label: "Còn hàng", color: "success" };
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
        <span className={`status__item--signature status__item--signature-${color}`}>{label}</span>
      </div>
    );
  };

  const confirmDialog = (
    title: string | React.ReactElement,
    message: string | React.ReactElement,
    color: "success" | "error" | "warning",
    onConfirm: () => void,
    confirmText = "Xác nhận"
  ) => {
    setContentDialog({
      color, isCentered: true, isLoading: true, title, message,
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: confirmText,
      defaultAction: () => { onConfirm(); setShowDialog(false); setContentDialog(null); },
    });
    setShowDialog(true);
  };

  // ── Summary cards ─────────────────────────────────────────────────────────
  const renderSummary = () => {
    const card = (label: string, value: React.ReactNode) => (
      <div className="summary__card">
        <span className="summary__label">{label}</span>
        <span className="summary__value">{value}</span>
      </div>
    );

    switch (activeTab) {
      case "stock":
        return (
          <div className="inventory__summary">
            {card("Tổng sản phẩm", stockSummary.total)}
            {card("Tổng giá trị tồn", <span className="summary__value--primary">{formatCurrency(stockSummary.totalValue)}đ</span>)}
            {card("Sắp hết hàng",    <span className="summary__value--warning">{stockSummary.lowStock} SP</span>)}
            {card("Hết hàng",        <span className="summary__value--error">{stockSummary.outOfStock} SP</span>)}
          </div>
        );
      case "import":
        return (
          <div className="inventory__summary">
            {card("Tổng phiếu nhập", importSummary.totalSlip)}
            {card("Tổng tiền nhập",  <span className="summary__value--primary">{formatCurrency(importSummary.totalAmount)}đ</span>)}
            {card("Hoàn thành",      <span className="summary__value--success">{importSummary.completed} phiếu</span>)}
            {card("Đang nhập",       <span className="summary__value--warning">{importSummary.draft} phiếu</span>)}
          </div>
        );
      case "transfer":
        return (
          <div className="inventory__summary">
            {card("Tổng phiếu chuyển", transferSummary.total)}
            {card("Chờ duyệt",  <span className="summary__value--warning">{transferSummary.pending} phiếu</span>)}
            {card("Hoàn thành", <span className="summary__value--success">{transferSummary.completed} phiếu</span>)}
            {card("Đã hủy",     <span className="summary__value--error">{transferSummary.cancelled} phiếu</span>)}
          </div>
        );
      case "check":
        return (
          <div className="inventory__summary">
            {card("Tổng phiếu kiểm", checkSummary.total)}
            {card("Chờ duyệt",  <span className="summary__value--warning">{checkSummary.pending} phiếu</span>)}
            {card("Hoàn thành", <span className="summary__value--success">{checkSummary.completed} phiếu</span>)}
            {card("Từ chối",    <span className="summary__value--error">{checkSummary.rejected} phiếu</span>)}
          </div>
        );
      default:
        return null;
    }
  };

  // ── Title actions theo tab ────────────────────────────────────────────────
  const titleActions: ITitleActions = {
    actions: [
      activeTab === "import" && permissions["WAREHOUSE_ADD"] == 1 && {
        title: "Tạo phiếu nhập",
        callback: () => navigate(urls.create_inventory),
      },
      activeTab === "transfer" && permissions["WAREHOUSE_ADD"] == 1 && {
        title: "Tạo phiếu chuyển kho",
        callback: () => navigate(urls.inventory_transfer_document),
      },
      activeTab === "destroy" && permissions["WAREHOUSE_ADD"] == 1 && {
        title: "Tạo phiếu xuất hủy",
        callback: () => showToast("Tính năng đang phát triển", "warning"),
      },
      activeTab === "check" && permissions["WAREHOUSE_ADD"] == 1 && {
        title: "Tạo phiếu kiểm kho",
        callback: () => navigate(urls.adjustment_slip),
      },
    ].filter(Boolean),
  };

  // ── Table config theo tab ─────────────────────────────────────────────────
  const getTableConfig = () => {
    switch (activeTab) {

      // ── Tồn kho ──────────────────────────────────────────────────────────
      case "stock":
        return {
          titles: ["STT", "Sản phẩm", "Kho", "Tồn kho", "Giá vốn BQ", "Giá trị tồn", "Trạng thái"],
          dataFormat: ["text-center", "", "", "text-center", "text-right", "text-right", "text-center"],
          items: listStock,
          dataMappingArray: (item: IStockProductItem, index: number) => [
            getPageOffset(params) + index + 1,
            <div key={item.inventoryBalanceId}>
              <div className="inventory__product-name">{item.productName}</div>
              {item.productCode && <div className="inventory__product-code">{item.productCode}</div>}
              {item.batchNo    && <div className="inventory__product-code">Lô: {item.batchNo}</div>}
            </div>,
            item.warehouseName ?? "—",
            <span key={`qty-${item.inventoryBalanceId}`}
              className={`inventory__qty ${(item.quantity ?? 0) <= 10 ? "inventory__qty--low" : ""}`}>
              {item.quantity ?? 0} {item.unitName}
              {(item.quantity ?? 0) <= 10 && (item.quantity ?? 0) > 0 && (
                <span className="inventory__badge--low">Sắp hết</span>
              )}
            </span>,
            item.avgCost ? formatCurrency(item.avgCost) + "đ" : "—",
            item.avgCost ? formatCurrency((item.quantity ?? 0) * item.avgCost) + "đ" : "—",
            renderStockStatus(item.quantity ?? 0),
          ],
          actions: (_: IStockProductItem): IAction[] => [],
        };

      // ── Phiếu nhập ───────────────────────────────────────────────────────
      case "import":
        return {
          titles: ["STT", "Mã phiếu", "Nhà cung cấp", "Kho nhập", "Tổng tiền", "Người tạo", "Ngày tạo", "Trạng thái"],
          dataFormat: ["text-center", "", "", "", "text-right", "", "text-center", "text-center"],
          items: listImport,
          dataMappingArray: (item: IImportInvoiceItem, index: number) => [
            getPageOffset(params) + index + 1,
            <span key={item.id} className="inventory__code">{item.invoiceCode ?? item.code ?? `#${item.id}`}</span>,
            item.supplierName ?? "—",
            item.warehouseName ?? "—",
            item.totalAmount ? formatCurrency(item.totalAmount) + "đ" : "—",
            item.createdBy ?? "—",
            item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "—",
            renderBadge(item.status ?? 0, ORDER_STATUS_MAP),
          ],
          actions: (item: IImportInvoiceItem): IAction[] => [
            {
              title: "Chi tiết",
              icon: <Icon name="CollectInfo" style={{ width: 17 }} />,
              callback: () => navigate(`${urls.create_inventory}?invoiceId=${item.id}`),
            },
            ...(item.status === 0 ? [
              {
                title: "Xác nhận nhập",
                icon: <Icon name="Check" />,
                callback: () => confirmDialog(
                  <Fragment>Xác nhận nhập hàng</Fragment>,
                  <Fragment>Xác nhận phiếu <strong>{item.invoiceCode ?? item.code}</strong>? Tồn kho sẽ được cập nhật.</Fragment>,
                  "success",
                  async () => {
                    const res = await InvoiceService.importApprove(item.id);
                    if (res.code === 0 || res.status === 1) { showToast("Nhập hàng thành công!", "success"); loadData(params); }
                    else showToast(res.message ?? "Xác nhận thất bại", "error");
                  }
                ),
              },
              {
                title: "Hủy phiếu",
                icon: <Icon name="Trash" className="icon-error" />,
                callback: () => confirmDialog(
                  <Fragment>Hủy phiếu nhập</Fragment>,
                  <Fragment>Bạn có chắc muốn hủy phiếu <strong>{item.invoiceCode ?? item.code}</strong>?</Fragment>,
                  "error",
                  async () => {
                    const res = await InvoiceService.importCancel(item.id);
                    if (res.code === 0 || res.status === 1) { showToast("Đã hủy phiếu nhập", "success"); loadData(params); }
                    else showToast(res.message ?? "Hủy thất bại", "error");
                  },
                  "Xác nhận hủy"
                ),
              },
            ] : []),
          ],
        };

      // ── Chuyển kho ───────────────────────────────────────────────────────
      case "transfer":
        return {
          titles: ["STT", "Mã phiếu", "Kho nguồn", "Kho đích", "Người tạo", "Ngày tạo", "Ghi chú", "Trạng thái"],
          dataFormat: ["text-center", "", "", "", "", "text-center", "", "text-center"],
          items: listTransfer,
          dataMappingArray: (item: IStockTransferItem, index: number) => [
            getPageOffset(params) + index + 1,
            <span key={item.id} className="inventory__code">{item.code ?? `#${item.id}`}</span>,
            item.fromWarehouseName ?? "—",
            item.toWarehouseName   ?? "—",
            item.createdBy         ?? "—",
            item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "—",
            item.note ?? "—",
            renderBadge(item.status ?? 0, TRANSFER_STATUS_MAP),
          ],
          actions: (item: IStockTransferItem): IAction[] => [
            {
              title: "Chi tiết",
              icon: <Icon name="CollectInfo" style={{ width: 17 }} />,
              callback: () => navigate(`${urls.inventory_transfer_document}?id=${item.id}`),
            },
            ...(item.status === 0 ? [
              {
                title: "Duyệt chuyển kho",
                icon: <Icon name="Check" />,
                callback: () => confirmDialog(
                  <Fragment>Duyệt phiếu chuyển kho</Fragment>,
                  <Fragment>Duyệt phiếu <strong>{item.code}</strong>? Tồn kho 2 kho sẽ được cập nhật.</Fragment>,
                  "success",
                  async () => {
                    const res = await InventoryService.stockTransferApprove(item.id);
                    if (res.code === 0 || res.status === 1) { showToast("Đã duyệt phiếu chuyển kho!", "success"); loadData(params); }
                    else showToast(res.message ?? "Duyệt thất bại", "error");
                  }
                ),
              },
              {
                title: "Hủy phiếu",
                icon: <Icon name="Trash" className="icon-error" />,
                callback: () => confirmDialog(
                  <Fragment>Hủy phiếu chuyển kho</Fragment>,
                  <Fragment>Bạn có chắc muốn hủy phiếu <strong>{item.code}</strong>?</Fragment>,
                  "error",
                  async () => {
                    const res = await InventoryService.stockTransferCancel(item.id);
                    if (res.code === 0 || res.status === 1) { showToast("Đã hủy phiếu chuyển kho", "success"); loadData(params); }
                    else showToast(res.message ?? "Hủy thất bại", "error");
                  },
                  "Xác nhận hủy"
                ),
              },
            ] : []),
          ],
        };

      // ── Phiếu kiểm ───────────────────────────────────────────────────────
      case "check":
        return {
          titles: ["STT", "Mã phiếu", "Kho kiểm", "Người tạo", "Ngày tạo", "Trạng thái"],
          dataFormat: ["text-center", "", "", "", "text-center", "text-center"],
          items: listCheck,
          dataMappingArray: (item: IStockAdjustItem, index: number) => [
            getPageOffset(params) + index + 1,
            <span key={item.id} className="inventory__code">{item.code ?? `#${item.id}`}</span>,
            item.inventoryName ?? "—",
            item.creatorName   ?? "—",
            item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "—",
            renderBadge(item.status ?? 0, CHECK_STATUS_MAP),
          ],
          actions: (item: IStockAdjustItem): IAction[] => [
            {
              title: "Chi tiết",
              icon: <Icon name="CollectInfo" style={{ width: 17 }} />,
              callback: () => navigate(`${urls.adjustment_slip}?id=${item.id}`),
            },
            ...(item.status === 0 ? [
              {
                title: "Duyệt phiếu",
                icon: <Icon name="Check" />,
                callback: () => confirmDialog(
                  <Fragment>Duyệt phiếu kiểm kho</Fragment>,
                  <Fragment>Duyệt phiếu <strong>{item.code}</strong>? Tồn kho sẽ được cập nhật theo số thực tế.</Fragment>,
                  "success",
                  async () => {
                    const res = await AdjustmentSlipService.approved(item.id);
                    if (res.code === 0 || res.status === 1) { showToast("Đã duyệt phiếu kiểm kho", "success"); loadData(params); }
                    else showToast(res.message ?? "Duyệt thất bại", "error");
                  }
                ),
              },
              {
                title: "Từ chối",
                icon: <Icon name="Trash" className="icon-error" />,
                callback: () => confirmDialog(
                  <Fragment>Từ chối phiếu kiểm kho</Fragment>,
                  <Fragment>Từ chối phiếu <strong>{item.code}</strong>?</Fragment>,
                  "error",
                  async () => {
                    const res = await AdjustmentSlipService.cancel(item.id);
                    if (res.code === 0 || res.status === 1) { showToast("Đã từ chối phiếu kiểm kho", "success"); loadData(params); }
                    else showToast(res.message ?? "Từ chối thất bại", "error");
                  },
                  "Từ chối"
                ),
              },
            ] : []),
          ],
        };

      default:
        return null;
    }
  };

  const tableConfig = getTableConfig();

  // ── Sub status filter config theo tab ─────────────────────────────────────
  const getStatusFilterTabs = () => {
    switch (activeTab) {
      case "import":
        return [
          { label: "Tất cả",    value: "" },
          { label: "Nháp",      value: "0" },
          { label: "Hoàn thành",value: "1" },
          { label: "Đã hủy",    value: "2" },
        ];
      case "transfer":
        return [
          { label: "Tất cả",    value: "" },
          { label: "Chờ duyệt", value: "0" },
          { label: "Hoàn thành",value: "1" },
          { label: "Đã hủy",    value: "2" },
        ];
      case "check":
        return [
          { label: "Tất cả",    value: "" },
          { label: "Chờ duyệt", value: "0" },
          { label: "Hoàn thành",value: "1" },
          { label: "Từ chối",   value: "2" },
        ];
      default:
        return null;
    }
  };

  const statusFilterTabs = getStatusFilterTabs();

  // ── Coming-soon panel ──────────────────────────────────────────────────────
  const renderComingSoon = () => (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", padding:"60px 20px",
                  color:"var(--extra-color-50)", gap: 12 }}>
      <Icon name="Construction" style={{ width: 48, opacity: 0.4 }} />
      <span style={{ fontSize:"1.5rem", fontWeight: 600 }}>Tính năng đang được phát triển</span>
      <span style={{ fontSize:"1.3rem" }}>
        {activeTab === "export"
          ? "Phiếu xuất sẽ được đồng bộ tự động từ đơn bán hàng. Tính năng đang phát triển."
          : activeTab === "destroy"
          ? "Xuất hủy sẽ sớm được bổ sung vào hệ thống."
          : "Báo cáo giá vốn (FIFO / Bình quân gia quyền) sẽ sớm ra mắt."}
      </span>
    </div>
  );

  const isComingSoon = activeTab === "export" || activeTab === "destroy" || activeTab === "cost";

  return (
    <div className={`page-content page-inventory-management${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Quản lý kho" titleActions={titleActions} />

      {renderSummary()}

      <div className="card-box d-flex flex-column">
        {/* Main tabs */}
        <div className="inventory__tabs">
          {listTabs.map((tab) => (
            <div key={tab.key}
              className={`inventory__tab-item ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}>
              <Icon name={tab.icon} style={{ width: 16 }} />
              <span>{tab.label}</span>
            </div>
          ))}
        </div>

        {/* Sub status filter */}
        {statusFilterTabs && (
          <div className="inventory__status-tabs">
            {statusFilterTabs.map((tab) => (
              <div key={tab.value}
                className={`inventory__status-tab ${params.status === tab.value ? "active" : ""}`}
                onClick={() => setParams((prev) => ({ ...prev, status: tab.value, page: 1 }))}>
                {tab.label}
              </div>
            ))}
          </div>
        )}

        {/* SearchBox */}
        {!isComingSoon && (
          <SearchBox
            name={
              activeTab === "import"   ? "Mã phiếu / Nhà cung cấp" :
              activeTab === "transfer" ? "Mã phiếu chuyển kho" :
              activeTab === "check"    ? "Mã phiếu kiểm" :
              "Tên sản phẩm"
            }
            params={params}
            updateParams={(p) => setParams(p)}
          />
        )}

        {/* Content */}
        {isComingSoon
          ? renderComingSoon()
          : isLoading
          ? <Loading />
          : tableConfig && tableConfig.items.length > 0
          ? (
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
          )
          : (
            <Fragment>
              {isNoItem
                ? <SystemNotification description={<span>Không có dữ liệu.<br />Hãy thêm mới nhé!</span>} type="no-item" />
                : <SystemNotification description={<span>Không có dữ liệu trùng khớp.</span>} type="no-result" />
              }
            </Fragment>
          )
        }
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
