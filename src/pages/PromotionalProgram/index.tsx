import React, { Fragment, useState, useEffect, useCallback, useRef } from "react";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import { getPermissions, showToast } from "utils/common";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import AddPromotionalModal from "./partials/AddPromotionalModal";
import PromotionService from "services/PromotionService";
import {
  IPromotion,
  PROMOTION_TYPE_LABELS,
  PROMOTION_STATUS_MAP,
} from "model/promotion/PromotionModel";

// Badge variant tương ứng với từng status
const STATUS_BADGE_VARIANT: Record<number, "success"|"warning"|"error"|"secondary"> = {
  0: "warning",    // Chờ duyệt
  1: "success",    // Đang chạy
  2: "error",      // Hết hạn
  3: "secondary",  // Tạm dừng
};

// Danh sách trạng thái có thể chuyển sang
const STATUS_TRANSITIONS: Record<number, { status: number; label: string; icon: string }[]> = {
  0: [  // Chờ duyệt → có thể Duyệt (1) hoặc Từ chối (2)
    { status: 1, label: "Duyệt – Bắt đầu chạy", icon: "CheckedCircle" },
    { status: 2, label: "Từ chối",               icon: "CloseCircle"   },
  ],
  1: [  // Đang chạy → có thể Tạm dừng (3)
    { status: 3, label: "Tạm dừng", icon: "PauseCircle" },
  ],
  2: [], // Hết hạn → không đổi được
  3: [  // Tạm dừng → có thể Tiếp tục (1) hoặc Kết thúc (2)
    { status: 1, label: "Tiếp tục chạy", icon: "CheckedCircle" },
    { status: 2, label: "Kết thúc",      icon: "CloseCircle"   },
  ],
};

import "./index.scss";

// ─── Stat Card component ──────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red";
  isLoading?: boolean;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, isLoading }) => (
  <div className={`promo-stat-card promo-stat-card--${color}`}>
    <div className="promo-stat-card__body">
      <div className="promo-stat-card__content">
        <p className="promo-stat-card__label">{title}</p>
        <p className="promo-stat-card__value">{isLoading ? "..." : value}</p>
      </div>
      <div className="promo-stat-card__icon">{icon}</div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────
export default function PromotionalProgram(props: any) {
  document.title = "Chương trình khuyến mãi";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());

  // Dữ liệu
  const [listData, setListData]     = useState<IPromotion[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [stats, setStats]           = useState({ active: 0, upcoming: 0, pending: 0, total: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Filter
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<number>(-1);
  const [typeFilter, setTypeFilter]     = useState<number>(0);

  // UI
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd]   = useState(false);
  const [selectedItem, setSelectedItem]   = useState<IPromotion | null>(null);
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Chương trình",
    isChooseSizeLimit: true,
    // Reset về 0 – tránh DataPaginationDefault hardcode totalPage:10, totalItem:100
    totalPage: 0,
    totalItem: 0,
    setPage:         (page)  => setPagination((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setPagination((prev) => ({ ...prev, sizeLimit: limit, page: 1 })),
  });

  const [statusMenuId, setStatusMenuId] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ─── Load danh sách ─────────────────────────────────────────────
  const loadList = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const res = await PromotionService.list(
        {
          // Chỉ truyền name khi có giá trị - tránh ?name=undefined trên URL
          ...(search.trim() ? { name: search.trim() } : {}),
          status:    statusFilter,
          // Chỉ truyền promotionType khi chọn loại cụ thể (0 = tất cả → bỏ qua)
          ...(typeFilter > 0 ? { promotionType: typeFilter } : {}),
          page:      pagination.page,
          sizeLimit: pagination.sizeLimit,
        },
        abortRef.current.signal
      );
      if (res?.code === 0) {
        const total = res.result?.total ?? 0;
        setListData(res.result?.items ?? []);
        setPagination((prev) => ({
          ...prev,
          totalItem: total,
          totalPage: Math.ceil(total / prev.sizeLimit) || 0,
        }));
      } else {
        showToast(res?.message ?? "Không thể tải dữ liệu", "error");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter, pagination.page, pagination.sizeLimit]);

  // ─── Đổi trạng thái ─────────────────────────────────────────────
  const handleUpdateStatus = async (id: number, status: number) => {
    setStatusMenuId(null);
    const res = await PromotionService.updateStatus(id, status);
    if (res?.code === 0) {
      const label = PROMOTION_STATUS_MAP[status]?.label ?? "trạng thái mới";
      showToast(`Đã chuyển sang "${label}" thành công`, "success");
      loadList();
      loadStats();
    } else {
      showToast(res?.message ?? "Đổi trạng thái thất bại", "error");
    }
  };

  // ─── Load stat cards ─────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [active, upcoming, pending, total] = await Promise.all([
        PromotionService.countByStatus(1),   // Đang chạy
        PromotionService.countByStatus(99),  // Sắp diễn ra (start > now)
        PromotionService.countByStatus(0),   // Chờ duyệt
        PromotionService.countByStatus(-1),  // Tất cả
      ]);
      setStats({ active, upcoming, pending, total });
    } catch {
      /* silent – stat cards không critical */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadStats(); }, []);

  // Đóng status dropdown khi click ngoài
  useEffect(() => {
    const handler = () => setStatusMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ─── Xóa ────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setShowDialog(false);
    setContentDialog(null);
    const res = await PromotionService.delete(id);
    if (res?.code === 0) {
      showToast("Xóa chương trình thành công", "success");
      loadList();
      loadStats();
    } else {
      showToast(res?.message ?? "Xóa thất bại", "error");
    }
  };

  const showDialogConfirmDelete = (item?: IPromotion) => {
    setContentDialog({
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa chương trình khuyến mãi</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc muốn xóa{" "}
          <strong>{item?.name ?? `${listIdChecked.length} chương trình đã chọn`}</strong>?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => handleDelete(item?.id),
    });
    setShowDialog(true);
  };

  // ─── Table helpers ───────────────────────────────────────────────
  const formatMoney = (v?: number) =>
    v ? new Intl.NumberFormat("vi-VN").format(v) : "0";

  const formatDate = (dt?: string) => {
    if (!dt) return "--";
    // "2026-03-01T00:00:00" → "01/03/2026"
    return dt.substring(0, 10).split("-").reverse().join("/");
  };

  const titles       = ["Tên chương trình", "Loại", "Giảm", "Thời gian", "Đã dùng", "Trạng thái"];
  const dataFormat   = ["", "", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: IPromotion) => [
    <div className="promo-name-cell">
      <p className="promo-name-cell__title">{item.name}</p>
      {!!item.budget && (
        <p className="promo-name-cell__budget">NS: {formatMoney(item.budget)}đ</p>
      )}
    </div>,

    <span className="promo-type-text">
      {PROMOTION_TYPE_LABELS[item.promotionType] ?? "--"}
    </span>,

    <span className="promo-discount-text">
      {item.discount ?? 0}{item.discountType === 2 ? "đ" : "%"}
    </span>,

    <div className="promo-time-cell">
      <p>{formatDate(item.startTime)}</p>
      <p className="promo-time-cell__end">→ {formatDate(item.endTime)}</p>
    </div>,

    <span className="promo-used-text">{item.usedCount ?? 0} lượt</span>,

    (() => {
      const st = item.status ?? 0;
      const entry = PROMOTION_STATUS_MAP[st] ?? PROMOTION_STATUS_MAP[0];
      const variant = STATUS_BADGE_VARIANT[st] ?? "warning";
      const transitions = STATUS_TRANSITIONS[st] ?? [];
      return (
        <div className="promo-status-wrap">
          <Badge text={entry.label} variant={variant} />
          {transitions.length > 0 && (
            <span
              className="promo-status-chevron"
              title="Đổi trạng thái"
              onClick={(e) => { e.stopPropagation(); setStatusMenuId(statusMenuId === item.id ? null : item.id); }}
            >
              <Icon name="CaretDown" />
            </span>
          )}
          {statusMenuId === item.id && transitions.length > 0 && (
            <div className="promo-status-dropdown" onClick={(e) => e.stopPropagation()}>
              {transitions.map((t) => (
                <div
                  key={t.status}
                  className="promo-status-dropdown__item"
                  onClick={() => handleUpdateStatus(item.id, t.status)}
                >
                  <Icon name={t.icon} />
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })(),
  ];

  // ─── Actions ─────────────────────────────────────────────────────
  const titleActions: ITitleActions = {
    actions: [
      (permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
        title: "Tạo chương trình",
        callback: () => { setSelectedItem(null); setShowModalAdd(true); },
      },
    ],
  };

  const actionsTable = (item: IPromotion): IAction[] => {
    const isChecked = listIdChecked?.length > 0;
    return [
      {
        title: "Xem",
        icon: <Icon name="Eye" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) { setSelectedItem(item); setShowModalAdd(true); }
        },
      },
      (permissions["CATEGORY_SERVICE_UPDATE"] == 1 || true) && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) { setSelectedItem(item); setShowModalAdd(true); }
        },
      },
      (permissions["CATEGORY_SERVICE_DELETE"] == 1 || true) && {
        title: "Xóa",
        icon: <Icon name="Trash" className={isChecked ? "icon-disabled" : "icon-error"} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const bulkActionList: BulkActionItemModel[] = [
    (permissions["CATEGORY_SERVICE_DELETE"] == 1 || true) && {
      title: "Xóa đã chọn",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="promo-page page-content">
      <HeaderTabMenu
        title="Chương trình khuyến mãi"
        titleBack="Khuyến mãi"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      {/* Stat Cards – lấy số liệu thực từ API */}
      <div className="promo-stats-grid">
        <StatCard
          title="Đang chạy"
          value={stats.active}
          icon={<Icon name="Promotion" />}
          color="green"
          isLoading={statsLoading}
        />
        <StatCard
          title="Sắp diễn ra"
          value={stats.upcoming}
          icon={<Icon name="Clock" />}
          color="blue"
          isLoading={statsLoading}
        />
        <StatCard
          title="Chờ duyệt"
          value={stats.pending}
          icon={<Icon name="CheckedCircle" />}
          color="orange"
          isLoading={statsLoading}
        />
        <StatCard
          title="Tổng chương trình"
          value={stats.total}
          icon={<Icon name="Tag" />}
          color="purple"
          isLoading={statsLoading}
        />
      </div>

      {/* Bảng danh sách */}
      <div className="promo-table-card">
        <div className="promo-table-card__toolbar">
          {/* Tìm kiếm */}
          <div className="promo-search-wrap">
            <svg
              className="promo-search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Tìm chương trình..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="promo-search-input"
            />
          </div>

          {/* Filter trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(Number(e.target.value))}
            className="promo-select"
          >
            <option value={-1}>Tất cả trạng thái</option>
            <option value={1}>Đang chạy</option>
            <option value={0}>Chờ duyệt</option>
            <option value={2}>Hết hạn</option>
            <option value={3}>Tạm dừng</option>
          </select>

          {/* Filter loại */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(Number(e.target.value))}
            className="promo-select"
          >
            <option value={0}>Tất cả loại</option>
            {Object.entries(PROMOTION_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <BoxTable
          name="chương trình khuyến mãi"
          titles={titles}
          items={listData}
          isLoading={isLoading}
          isPagination={true}
          dataPagination={pagination}
          dataMappingArray={(item) => dataMappingArray(item)}
          dataFormat={dataFormat}
          isBulkAction={true}
          listIdChecked={listIdChecked}
          bulkActionItems={bulkActionList}
          striped={true}
          setListIdChecked={(ids) => setListIdChecked(ids)}
          actions={actionsTable}
          actionType="inline"
        />
      </div>

      {/* Modal tạo / sửa */}
      <AddPromotionalModal
        onShow={showModalAdd}
        data={selectedItem}
        onHide={(refresh) => {
          setShowModalAdd(false);
          if (refresh) {
            loadList();
            loadStats();
          }
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}