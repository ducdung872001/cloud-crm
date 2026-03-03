import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import { showToast, getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import Badge from "components/badge/badge";
import InvoiceVATMockService, {
  IInvoiceVATFilterRequest,
  IInvoiceVATResponse,
} from "../InvoiceVATMock";

import "./style.scss";

// ---- Types ----
type BadgeVariant = "success" | "warning" | "error" | "transparent" | "primary" | "secondary" | "done" | "wait-collect";

type StatusFilter = "all" | "issued" | "pending_sign" | "error";

const STATUS_FILTERS: { key: StatusFilter; label: string; count?: number }[] = [
  { key: "all",          label: "Tất cả" },
  { key: "issued",       label: "Đã phát hành" },
  { key: "pending_sign", label: "Chờ ký số" },
  { key: "error",        label: "Lỗi / Hủy" },
];

const BADGE_MAP: Record<string, { text: string; variant: BadgeVariant }> = {
  issued:       { text: "Đã phát hành", variant: "success" },
  pending_sign: { text: "Chờ ký số",    variant: "warning" },
  error:        { text: "Lỗi / Hủy",   variant: "error" },
};

const formatCurrency = (v: number) => v.toLocaleString("vi-VN") + "đ";
const formatCurrencyHighlight = (v: number) => v.toLocaleString("vi-VN") + "đ";

interface Props {
  onDataChanged?: () => void;
  onGoToExport?: () => void;
  onOpenDetail?: () => void;
}

export default function InvoiceVATList({ onDataChanged, onGoToExport, onOpenDetail }: Props) {
  const isMounted = useRef(false);
  const [list, setList]                   = useState<IInvoiceVATResponse[]>([]);
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>("all");
  const [searchText, setSearchText]       = useState("");
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog | null>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [isNoItem, setIsNoItem]           = useState(false);
  const [permissions]                     = useState(getPermissions());

  // Pagination
  const [page, setPage]           = useState(1);
  const [totalItem, setTotalItem] = useState(0);
  const LIMIT = 6;

  const totalPage = Math.ceil(totalItem / LIMIT);

  const abortRef = useRef<AbortController>(null);

  const fetchList = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    const params: IInvoiceVATFilterRequest = {
      name:   searchText,
      status: statusFilter === "all" ? undefined : statusFilter as any,
      page,
      limit: LIMIT,
    };

    const res = await InvoiceVATMockService.list(params, abortRef.current.signal);
    if (res.code === 0) {
      setList(res.result.items);
      setTotalItem(res.result.total);
      setIsNoItem(res.result.total === 0 && page === 1);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    fetchList();
    return () => abortRef.current?.abort();
  }, [searchText, statusFilter, page]);

  // First load
  useEffect(() => { fetchList(); }, []);

  // Count per status (from full list – mock only)
  const counts: Record<StatusFilter, number> = { all: 128, issued: 124, pending_sign: 3, error: 1 };

  // ---- Delete ----
  const onDelete = async (id: number) => {
    const res = await InvoiceVATMockService.delete(id);
    if (res.code === 0) {
      showToast("Xóa hóa đơn thành công", "success");
      fetchList();
      onDataChanged?.();
    } else {
      showToast(res.message ?? "Có lỗi xảy ra", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDeleteDialog = (item?: IInvoiceVATResponse) => {
    setContentDialog({
      color: "error",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa hóa đơn</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa hóa đơn
          {item ? <strong> {item.invoiceNo}</strong> : ` ${listIdChecked.length} đã chọn`}?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item?.id),
    });
    setShowDialog(true);
  };

  const actionsTable = (item: IInvoiceVATResponse): IAction[] => [
    permissions["INVOICE_UPDATE"] == 1 && {
      title: "Sửa",
      icon: <Icon name="Pencil" />,
      callback: () => {},
    },
    permissions["INVOICE_DELETE"] == 1 && {
      title: "Xóa",
      icon: <Icon name="Trash" className="icon-error" />,
      callback: () => showDeleteDialog(item),
    },
  ].filter(Boolean) as IAction[];

  // ---- Pagination pages ----
  const renderPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPage <= 7) {
      for (let i = 1; i <= totalPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPage - 1, page + 1); i++) pages.push(i);
      if (page < totalPage - 2) pages.push("...");
      pages.push(totalPage);
    }
    return pages;
  };

  return (
    <div className="tab-danh-sach">
      {/* Filters row */}
      <div className="tab-ds__filters">
        <div className="search-box-ds">
          <Icon name="Search" />
          <input
            placeholder="Số HĐ, tên KH, MST..."
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
          />
        </div>

        <div className="month-select">
          <select>
            <option>Tháng 2/2026</option>
            <option>Tháng 1/2026</option>
          </select>
        </div>

        <div className="status-filters">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`status-filter-btn${statusFilter === f.key ? " active" : ""}${f.key === "error" && statusFilter === f.key ? " active-error" : ""}`}
              onClick={() => { setStatusFilter(f.key); setPage(1); }}
            >
              {f.key === "pending_sign" && <Icon name="Clock" />}
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        <button className="btn-filter-adv">
          <Icon name="Filter" /> Bộ lọc nâng cao
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        isNoItem
          ? <SystemNotification type="no-item" description={<span>Hiện tại chưa có hóa đơn nào.</span>} />
          : <SystemNotification type="no-result" description={<span>Không có dữ liệu trùng khớp.</span>} />
      ) : (
        <div className="invoice-table-wrap">
          <table className="invoice-table-ds">
            <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  checked={listIdChecked.length === list.length}
                  onChange={(e) => setListIdChecked(e.target.checked ? list.map((i) => i.id) : [])}
                />
              </th>
              <th>SỐ HÓA ĐƠN</th>
              <th>NGÀY XUẤT</th>
              <th>KHÁCH HÀNG / CÔNG TY</th>
              <th>MST</th>
              <th className="text-right">TIỀN HÀNG</th>
              <th className="text-right">THUẾ GTGT</th>
              <th className="text-right">TỔNG TIỀN</th>
              <th className="text-center">TRẠNG THÁI</th>
              <th className="text-center">THAO TÁC</th>
            </tr>
            </thead>
            <tbody>
            {list.map((item) => {
              const badge = BADGE_MAP[item.status] ?? { text: item.status, variant: "wait-collect" as BadgeVariant };
              const baseAmount = item.totalAmount - item.vatAmount;
              return (
                <tr key={item.id} className={listIdChecked.includes(item.id) ? "row-checked" : ""}>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      checked={listIdChecked.includes(item.id)}
                      onChange={(e) =>
                        setListIdChecked(e.target.checked
                          ? [...listIdChecked, item.id]
                          : listIdChecked.filter((id) => id !== item.id)
                        )
                      }
                    />
                  </td>
                  <td className="col-invoice-no">{item.invoiceNo}</td>
                  <td className="col-date">{item.invoiceDate}</td>
                  <td className="col-customer">
                    <span className="customer-name-ds">{item.customerName}</span>
                  </td>
                  <td className="col-taxcode">{item.taxCode ?? "Cá nhân"}</td>
                  <td className="text-right col-amount">{formatCurrency(baseAmount)}</td>
                  <td className="text-right col-vat">
                    <span className="vat-highlight">{formatCurrencyHighlight(item.vatAmount)}</span>
                  </td>
                  <td className="text-right col-total">
                    <strong>{formatCurrency(item.totalAmount)}</strong>
                  </td>
                  <td className="text-center col-status">
                    <Badge text={badge.text} variant={badge.variant} />
                  </td>
                  <td className="text-center col-actions">
                    {item.status === "pending_sign" && (
                      <button className="btn-sign">Ký số</button>
                    )}
                    {item.status === "error" && (
                      <button className="btn-replace">Thay thế</button>
                    )}
                    {item.status === "issued" && (
                      <>
                        <button className="btn-action-sm">PDF</button>
                        <button className="btn-action-sm">Email</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-row">
            <span className="pagination-info">
              Hiển thị {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalItem)} / {totalItem} hóa đơn
            </span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹ Trước</button>
              {renderPages().map((p, i) =>
                p === "..."
                  ? <span key={`dots-${i}`} className="page-dots">...</span>
                  : <button
                    key={p}
                    className={`page-btn${page === p ? " active" : ""}`}
                    onClick={() => setPage(p as number)}
                  >{p}</button>
              )}
              <button className="page-btn" disabled={page === totalPage} onClick={() => setPage(page + 1)}>Sau ›</button>
            </div>
          </div>
        </div>
      )}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}