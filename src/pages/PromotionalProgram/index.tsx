import React, { Fragment, useState } from "react";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import { getPermissions } from "utils/common";
import { getPageOffset } from "reborn-util";
import AddPromotionalModal from "./partials/AddPromotionalModal";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

import "./index.scss";

// Mock Data
const mockPromos = [
  { id: 1, name: "Khuyến mãi tháng 3", type: "Giảm giá", discount: "20%", start: "01/03/2026", end: "31/03/2026", status: "active", used: 145, budget: "50.000.000" },
  { id: 2, name: "Flash Sale cuối tuần", type: "Flash Sale", discount: "30%", start: "14/03/2026", end: "16/03/2026", status: "active", used: 89, budget: "20.000.000" },
  { id: 3, name: "Tết Nguyên Đán 2026", type: "Sự kiện", discount: "15%", start: "25/01/2026", end: "10/02/2026", status: "expired", used: 312, budget: "100.000.000" },
  { id: 4, name: "Sinh nhật khách hàng", type: "Sinh nhật", discount: "10%", start: "01/01/2026", end: "31/12/2026", status: "active", used: 67, budget: "30.000.000" },
  { id: 5, name: "Khuyến mãi hè 2026", type: "Theo mùa", discount: "25%", start: "01/06/2026", end: "31/08/2026", status: "pending", used: 0, budget: "80.000.000" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Đang chạy", className: "promo-badge promo-badge--active" },
  pending: { label: "Chờ duyệt", className: "promo-badge promo-badge--pending" },
  expired: { label: "Hết hạn", className: "promo-badge promo-badge--expired" },
};

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red";
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, trend }) => (
  <div className={`promo-stat-card promo-stat-card--${color}`}>
    <div className="promo-stat-card__body">
      <div className="promo-stat-card__content">
        <p className="promo-stat-card__label">{title}</p>
        <p className="promo-stat-card__value">{value}</p>
        {sub && <p className="promo-stat-card__sub">{sub}</p>}
        {trend !== undefined && (
          <p className={`promo-stat-card__trend ${trend >= 0 ? "promo-stat-card__trend--up" : "promo-stat-card__trend--down"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tháng trước
          </p>
        )}
      </div>
      <div className="promo-stat-card__icon">{icon}</div>
    </div>
  </div>
);

export default function PromotionalProgram(props: any) {
  document.title = "Chương trình khuyến mãi";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataCategoryService, setDataCategoryService] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Chương trình",
    isChooseSizeLimit: true,
    setPage: (page) => setPagination((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setPagination((prev) => ({ ...prev, sizeLimit: limit })),
  });

  const filtered = mockPromos.filter((c) => {
    const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const titles = ["Tên chương trình", "Loại", "Giảm", "Thời gian", "Đã dùng", "Trạng thái"];
  const dataFormat = ["", "", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: typeof mockPromos[0], index: number) => [
    <div className="promo-name-cell">
      <p className="promo-name-cell__title">{item.name}</p>
      <p className="promo-name-cell__budget">NS: {item.budget}đ</p>
    </div>,
    <span className="promo-type-text">{item.type}</span>,
    <span className="promo-discount-text">{item.discount}</span>,
    <div className="promo-time-cell">
      <p>{item.start}</p>
      <p className="promo-time-cell__end">→ {item.end}</p>
    </div>,
    <span className="promo-used-text">{item.used} lượt</span>,
    <span className={statusMap[item.status].className}>
      {statusMap[item.status].label}
    </span>,
  ];

  const titleActions: ITitleActions = {
    actions: [
      (permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
        title: "Tạo chương trình",
        callback: () => {
          setDataCategoryService(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const actionsTable = (item: typeof mockPromos[0]): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Xem",
        icon: <Icon name="Eye" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataCategoryService(item);
            setShowModalAdd(true);
          }
        },
      },
      (permissions["CATEGORY_SERVICE_UPDATE"] == 1 || true) && {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
            setDataCategoryService(item);
            setShowModalAdd(true);
          }
        },
      },
      (permissions["CATEGORY_SERVICE_DELETE"] == 1 || true) && {
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

  const showDialogConfirmDelete = (item?: typeof mockPromos[0]) => {
    const dialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "chương trình khuyến mãi " : `${listIdChecked.length} chương trình đã chọn `}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => {
        setListIdChecked([]);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(dialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    (permissions["CATEGORY_SERVICE_DELETE"] == 1 || true) && {
      title: "Xóa danh mục",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="promo-page page-content">
      <HeaderTabMenu
        title="Chương trình khuyến mãi"
        titleBack="Khuyến mãi"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      <div className="promo-stats-grid">
        <StatCard title="Đang chạy" value="12" icon={<Icon name="Promotion" />} color="green" />
        <StatCard title="Sắp diễn ra" value="3" icon={<Icon name="Clock" />} color="blue" />
        <StatCard title="Chờ duyệt" value="5" icon={<Icon name="CheckedCircle" />} color="orange" />
        <StatCard title="Tổng chương trình" value="45" icon={<Icon name="Tag" />} color="purple" />
      </div>

      <div className="promo-table-card">
        <div className="promo-table-card__toolbar">
          <div className="promo-search-wrap">
            <svg className="promo-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Tìm chương trình..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="promo-search-input"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="promo-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang chạy</option>
            <option value="pending">Chờ duyệt</option>
            <option value="expired">Hết hạn</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="promo-select">
            <option value="all">Tất cả loại</option>
            <option value="Giảm giá">Giảm giá</option>
            <option value="Flash Sale">Flash Sale</option>
            <option value="Sự kiện">Sự kiện</option>
            <option value="Sinh nhật">Sinh nhật</option>
            <option value="Theo mùa">Theo mùa</option>
          </select>
        </div>

        <BoxTable
          name="chương trình khuyến mãi"
          titles={titles}
          items={filtered}
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
      </div>

      <AddPromotionalModal
        onShow={showModalAdd}
        data={dataCategoryService}
        onHide={() => setShowModalAdd(false)}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
