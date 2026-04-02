import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { IInventoryLedgerFilterRequest } from "model/inventory/InventoryRequestModel";
import { IInventoryLedgerResponse } from "model/inventory/InventoryResponseModel";
import { showToast } from "utils/common";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import { useSearchParams } from "react-router-dom";
import InventoryService from "services/InventoryService";
import "./InventoryList.scss";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const REF_TYPE_TABS = [
  { label: "Tất cả",    value: "" },
  { label: "Nhập kho",  value: "IMPORT" },
  { label: "Xuất bán",  value: "SALE" },
  { label: "Khách trả", value: "RETURN" },
  { label: "Chuyển kho",value: "TRANSFER" },
  { label: "Điều chỉnh",value: "ADJUSTMENT" },
  { label: "Xuất hủy",  value: "DESTROY" },
];

// Màu badge loại chứng từ
const REF_TYPE_COLOR: Record<string, string> = {
  IMPORT:     "success",   // xanh  — nhập vào
  SALE:       "error",     // đỏ    — xuất bán
  RETURN:     "warning",   // vàng  — khách trả
  TRANSFER:   "primary",   // xanh dương — chuyển kho
  ADJUSTMENT: "warning",   // vàng  — điều chỉnh
  DESTROY:    "secondary", // xám   — xuất hủy
};

// Màu badge trạng thái
const STATUS_COLOR: Record<string, string> = {
  "Hoàn thành":  "success",
  "Đã duyệt":    "success",
  "Chờ duyệt":   "warning",
  "Đã hủy":      "error",
  "Không duyệt": "error",
};

// ─────────────────────────────────────────────────────────────────────────────
// Render helpers — mỗi hàm nhận item, trả JSX hoặc string
// ─────────────────────────────────────────────────────────────────────────────

/** Badge loại chứng từ */
const renderRefType = (item: IInventoryLedgerResponse) => (
  <div className="wbl-cell-center">
    <span className={`status__item--signature status__item--signature-${REF_TYPE_COLOR[item.refType] ?? "secondary"}`}>
      {item.refTypeName ?? item.refType ?? "—"}
    </span>
  </div>
);

/** Mã chứng từ — mỗi refType có nguồn khác nhau */
const renderRefCode = (item: IInventoryLedgerResponse) => {
  const code = item.refCode ?? (item.refId ? `#${item.refId}` : null);
  if (!code) return <span className="wbl-dash">—</span>;
  return <span className="wbl-code">{code}</span>;
};

/**
 * Đối tác — chỉ có với IMPORT (nhà cung cấp) và SALE/RETURN (khách hàng)
 * TRANSFER, ADJUSTMENT, DESTROY không có đối tác → "—"
 */
const renderPartner = (item: IInventoryLedgerResponse) => {
  const hasPartner = ["IMPORT", "SALE", "RETURN"].includes(item.refType);
  if (!hasPartner) return <span className="wbl-dash">—</span>;

  const name = item.partnerName && item.partnerName !== "Không xác định"
    ? item.partnerName : null;

  // ── Export Excel ────────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const base64 = await InventoryService.exportLedger({
        refType:     params.refType     || undefined,
        warehouseId: params.warehouseId ? +params.warehouseId : undefined,
        keyword:     params.keyword     || undefined,
      });
      const binary = atob(base64);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `so_kho_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Xuất Excel thành công!", "success");
    } catch (e: any) {
      showToast(e?.message ?? "Xuất Excel thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="wbl-partner">
      <div className="wbl-partner__name">
        {name ?? <span className="wbl-unknown">{item.partnerType ?? "—"}</span>}
      </div>
      {item.partnerType && name && (
        <div className="wbl-partner__type">{item.partnerType}</div>
      )}
    </div>
  );
};

/**
 * Kho — TRANSFER hiện "Kho A → Kho B", các loại khác hiện tên kho đơn
 */
const renderWarehouse = (item: IInventoryLedgerResponse) => {
  if (item.refType === "TRANSFER") {
    return (
      <div className="wbl-transfer">
        <span className="wbl-transfer__from">{item.fromWarehouseName ?? "—"}</span>
        <span className="wbl-transfer__arrow">→</span>
        <span className="wbl-transfer__to">{item.toWarehouseName ?? "—"}</span>
      </div>
    );
  }
  return <span>{item.warehouseName ?? "—"}</span>;
};

/**
 * Biến động số lượng — + xanh, - đỏ, 0 xám
 * ADJUSTMENT có thể + hoặc -
 */
const renderQuantity = (item: IInventoryLedgerResponse) => {
  const qty = item.quantityChange ?? item.quantity ?? 0;
  const formatted = qty > 0
    ? `+${qty.toLocaleString("vi-VN")}`
    : qty.toLocaleString("vi-VN");
  const cls = qty > 0 ? "wbl-qty--pos" : qty < 0 ? "wbl-qty--neg" : "wbl-qty--zero";
  return (
    <span className={`wbl-qty ${cls}`}>
      {formatted}{item.unitName ? ` ${item.unitName}` : ""}
    </span>
  );
};

/**
 * Ghi chú — ý nghĩa khác nhau theo refType:
 *   IMPORT:     Số lô (batchNo) — thông tin lô hàng nhập
 *   SALE/RETURN: — (không có ghi chú riêng)
 *   TRANSFER:   Ghi chú phiếu (reason)
 *   ADJUSTMENT: Lý do điều chỉnh (reason)
 *   DESTROY:    — (lý do hủy chưa có field riêng)
 */
const renderNote = (item: IInventoryLedgerResponse) => {
  if (item.refType === "IMPORT" && item.batchNo) {
    return <span className="wbl-batchno" title={`Số lô: ${item.batchNo}`}>Lô: {item.batchNo}</span>;
  }
  if ((item.refType === "ADJUSTMENT" || item.refType === "TRANSFER") && item.reason) {
    return (
      <span className="wbl-reason" title={item.reason}>
        {item.reason.length > 30 ? `${item.reason.slice(0, 30)}…` : item.reason}
      </span>
    );
  }
  return <span className="wbl-dash">—</span>;
};

/**
 * Ref tài chính — ý nghĩa theo refType:
 *   IMPORT:     Mã hóa đơn nhập (import_invoice_code)
 *   SALE/RETURN:Mã hóa đơn bán (sale_invoice_code)
 *   ADJUSTMENT: Mã phiếu kiểm kho (adjust_audit_code → KK-xxxx)
 *   TRANSFER:   — (không có ref tài chính)
 *   DESTROY:    — (không có ref tài chính riêng)
 */
const renderRefFinance = (item: IInventoryLedgerResponse) => {
  if (!item.refFinanceCode || item.refType === "TRANSFER") {
    return <span className="wbl-dash">—</span>;
  }
  const label = item.refType === "ADJUSTMENT" ? "KK" : "HĐ";
  return (
    <span className="wbl-reffinance" title={`${label}: ${item.refFinanceCode}`}>
      {item.refFinanceCode}
    </span>
  );
};

/** Trạng thái */
const renderStatus = (item: IInventoryLedgerResponse) => {
  const name = item.statusName;
  if (!name || name === "Không xác định") return <span className="wbl-dash">—</span>;
  const color = STATUS_COLOR[name] ?? "secondary";
  return (
    <div className="wbl-cell-center">
      <span className={`status__item--signature status__item--signature-${color}`}>{name}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function WarehouseBookList() {
  document.title = "Sổ kho";

  const isMounted = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [listData, setListData]     = useState<IInventoryLedgerResponse[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isNoItem, setIsNoItem]     = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [listWarehouse, setListWarehouse] = useState<{ value: string; label: string }[]>([]);

  const [params, setParams] = useState<{
    keyword:     string;
    refType:     string;
    warehouseId: string;
    fromTime:    string;
    toTime:      string;
    page:        number;
    limit:       number;
  }>({
    keyword: "", refType: "", warehouseId: "",
    fromTime: "", toTime: "", limit: 10, page: 1,
  });

  const [filterList, setFilterList] = useState<IFilterItem[]>([
    {
      key: "warehouseId", name: "Kho hàng", type: "select",
      is_featured: true, value: searchParams.get("warehouseId") ?? "",
      list: [],
    },
    {
      key: "time_range", name: "Khoảng thời gian", type: "date-two",
      param_name: ["fromTime", "toTime"], is_featured: true,
      value: searchParams.get("fromTime") ?? "",
      value_extra: searchParams.get("toTime") ?? "",
      is_fmt_text: true,
    },
  ]);

  // Cập nhật options kho vào filter khi listWarehouse thay đổi
  useEffect(() => {
    if (listWarehouse.length === 0) return;
    setFilterList(prev => prev.map(f =>
      f.key === "warehouseId" ? { ...f, list: listWarehouse } : f
    ));
  }, [listWarehouse]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    { key: "all", name: "Sổ kho", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "giao dịch",
    isChooseSizeLimit: true,
    setPage:        (page)  => setParams(p => ({ ...p, page })),
    chooseSizeLimit:(limit) => setParams(p => ({ ...p, limit, page: 1 })),
  });

  const abortController = new AbortController();

  const fetchData = async (p: typeof params) => {
    setIsLoading(true);
    const req: IInventoryLedgerFilterRequest & Record<string, any> = {};
    if (p.keyword)     req.keyword     = p.keyword;
    if (p.refType)     req.refType     = p.refType;
    if (p.warehouseId) req.warehouseId = +p.warehouseId;
    if (p.fromTime)    req.fromTime    = p.fromTime;
    if (p.toTime)      req.toTime      = p.toTime;
    req.page  = p.page ?? 1;
    req.size  = p.limit ?? DataPaginationDefault.sizeLimit;
    req.limit = p.limit ?? DataPaginationDefault.sizeLimit;

    const res = await InventoryService.ledgerList(req, abortController.signal);
    if (res.code === 0 || res.status === 1) {
      const result = res.result ?? res.data ?? {};
      const items  = result.items ?? result.content ?? result.data ?? [];
      const total  = +(result.total ?? result.totalElements ?? items.length ?? 0);
      const curPage = +(result.page ?? req.page ?? 1);
      setListData(items);
      setPagination(prev => ({
        ...prev,
        page: curPage,
        sizeLimit: p.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: total,
        totalPage: Math.ceil(total / (p.limit ?? DataPaginationDefault.sizeLimit)),
      }));
      setIsNoItem(total === 0 && curPage === 1);
    } else {
      showToast(res.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  // Sync URL params on mount + load danh sách kho cho filter
  useEffect(() => {
    const tmp = _.cloneDeep(params);
    searchParams.forEach((v, k) => { tmp[k] = v; });
    setParams(prev => ({ ...prev, ...tmp }));

    // Load warehouse list cho filter dropdown
    InventoryService.list({ page: 1, limit: 200 }).then(res => {
      if (res.code === 0) {
        const data = Array.isArray(res.result) ? res.result
          : Array.isArray(res.result?.items) ? res.result.items : [];
        setListWarehouse(data.map((i: any) => ({ value: String(i.id), label: i.name })));
      }
    });
  }, []);

  // Fetch + sync URL on param change
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    fetchData(params);

    const tmp = _.cloneDeep(params) as Record<string, any>;
    if (tmp.limit === 10) delete tmp.limit;
    Object.keys(tmp).forEach(k => { if (tmp[k] === "" || tmp[k] == null) delete tmp[k]; });
    if (tmp.page === 1) delete tmp.page;

    if (isDifferenceObj(searchParams, tmp)) {
      const sp: Record<string, string> = {};
      Object.keys(tmp).forEach(k => { if (tmp[k] != null) sp[k] = String(tmp[k]); });
      setSearchParams(sp);
    }
    return () => abortController.abort();
  }, [params]);

  // ── Table columns ──────────────────────────────────────────────────────────
  // Dùng chung cho tất cả tabs — các cell render đã xử lý null/N/A theo refType

  const titles = [
    "STT", "Mã chứng từ", "Loại", "Thời gian",
    "Sản phẩm", "Đối tác", "Kho",
    "Biến động", "Tồn trước", "Tồn sau",
    "Ghi chú", "Số phiếu/HĐ",
    "Người TH", "Trạng thái",
  ];

  const dataFormat = [
    "text-center", "",          "text-center", "text-center",
    "",            "",          "",
    "text-right",  "text-right","text-right",
    "",            "",
    "",            "text-center",
  ];

  const titleActions: ITitleActions = {
    actions: [
      {
        title: isExporting ? "Đang xuất..." : "Xuất Excel",
        color: "primary",
        disabled: isExporting,
        callback: handleExportExcel,
      },
    ],
  };

  const mapRow = (item: IInventoryLedgerResponse, index: number) => [
    getPageOffset(params) + index + 1,
    renderRefCode(item),
    renderRefType(item),
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "—",
    // Sản phẩm: tên + SKU/lô phụ
    <div key={`prod-${item.id}`}>
      <div className="wbl-prod-name">{item.productName ?? "—"}</div>
      {(item.variantSku ?? item.productSku) && (
        <div className="wbl-prod-sku">{item.variantSku ?? item.productSku}</div>
      )}
    </div>,
    renderPartner(item),
    renderWarehouse(item),
    renderQuantity(item),
    (item.prevQuantity  ?? 0).toLocaleString("vi-VN"),
    (item.afterQuantity ?? 0).toLocaleString("vi-VN"),
    renderNote(item),
    renderRefFinance(item),
    (item.employeeName && item.employeeName !== "Không xác định")
      ? item.employeeName : "—",
    renderStatus(item),
  ];

  return (
    <div className={`page-content page-warehouse-book${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Sổ kho" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        {/* ── Tabs ── */}
        <div className="wbl-tabs">
          {REF_TYPE_TABS.map(tab => (
            <div
              key={tab.value}
              className={`wbl-tab${params.refType === tab.value ? " wbl-tab--active" : ""}`}
              onClick={() => setParams(p => ({ ...p, refType: tab.value, page: 1 }))}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* ── Search + filter ── */}
        <SearchBox
          name="Tên sản phẩm / mã chứng từ"
          params={params}
          isSaveSearch={false}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={filterList}
          updateParams={p => setParams(p)}
        />

        {/* ── Table / Loading / Empty ── */}
        {!isLoading && listData.length > 0 ? (
          <BoxTable
            name="Sổ kho"
            titles={titles}
            items={listData}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, idx) => mapRow(item, idx)}
            dataFormat={dataFormat}
            striped={true}
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isNoItem ? (
              <SystemNotification
                description={<span>Chưa có giao dịch kho nào{params.refType ? ` loại "${REF_TYPE_TABS.find(t => t.value === params.refType)?.label}"` : ""}.</span>}
                type="no-item"
              />
            ) : (
              <SystemNotification
                description={<span>Không tìm thấy dữ liệu khớp. Thử thay đổi bộ lọc nhé!</span>}
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
}