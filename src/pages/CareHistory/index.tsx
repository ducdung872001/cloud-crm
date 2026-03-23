import React, { Fragment, useState } from "react";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import { getPermissions } from "utils/common";
import AddCareHistoryModal from "./partials/AddCareHistoryModal";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

import "./index.scss";

// Mock Data for Care History
const mockCares = [
  { id: 1, typeLabel: "phone", customer: "Nguyễn Thị Lan", avatar: "N", content: "Tư vấn sản phẩm mới", staff: "Minh Anh", duration: "5p", result: "Quan tâm SP A", date: "15/03 10:30" },
  { id: 2, typeLabel: "zalo", customer: "Trần Văn Minh", avatar: "T", content: "Tư vấn qua Zalo", staff: "Thu Hà", duration: "15p", result: "Đặt đơn hàng", date: "14/03 15:20" },
  { id: 3, typeLabel: "message", customer: "Lê Thị Hoa", avatar: "L", content: "Gửi thông tin bảo hành", staff: "Quốc Huy", duration: "-", result: "Đã đọc", date: "13/03 09:15" },
  { id: 4, typeLabel: "store", customer: "Phạm Quốc Bảo", avatar: "P", content: "Khách đến cửa hàng", staff: "Minh Anh", duration: "30p", result: "Mua hàng 2.5M", date: "12/03 14:45" },
  { id: 5, typeLabel: "phone", customer: "Hoàng Thị Mai", avatar: "H", content: "Giải đáp khiếu nại", staff: "Thu Hà", duration: "12p", result: "Đồng ý đổi hàng", date: "11/03 11:00" },
];

const careTypeIconMap: Record<string, { icon: React.ReactNode; className: string }> = {
  phone: { icon: <Icon name="Phone" />, className: "care-type-icon care-type-icon--phone" },
  zalo: { icon: <Icon name="Zalo" />, className: "care-type-icon care-type-icon--zalo" },
  message: { icon: <Icon name="ChatText" />, className: "care-type-icon care-type-icon--message" },
  store: { icon: <Icon name="House" />, className: "care-type-icon care-type-icon--store" },
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

export default function CareHistory(props: any) {
  document.title = "Lịch sử chăm sóc KH";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataCategoryService, setDataCategoryService] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Lịch sử",
    isChooseSizeLimit: true,
    setPage: (page) => setPagination((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setPagination((prev) => ({ ...prev, sizeLimit: limit })),
  });

  const filtered = mockCares.filter((c) => {
    const matchSearch = search === "" || c.customer.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.typeLabel === typeFilter;
    return matchSearch && matchType;
  });

  const titles = ["Loại", "Khách hàng", "Nội dung", "NV phụ trách", "Thời lượng", "Kết quả", "Ngày"];
  const dataFormat = ["", "", "", "", "", "", ""];

  const dataMappingArray = (item: typeof mockCares[0], index: number) => {
    const typeDef = careTypeIconMap[item.typeLabel] || careTypeIconMap.phone;

    return [
      <div className={typeDef.className}>{typeDef.icon}</div>,
      <div className="care-customer-cell">
        <span className="care-customer-cell__avatar">{item.avatar}</span>
        <span>{item.customer}</span>
      </div>,
      <span className="care-text">{item.content}</span>,
      <span className="care-text">{item.staff}</span>,
      <span className="care-text">{item.duration}</span>,
      <span className="care-badge">{item.result}</span>,
      <span className="care-text">{item.date}</span>,
    ];
  };

  const titleActions: ITitleActions = {
    actions: [
      (permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
        title: "Ghi nhận CSKH",
        callback: () => {
          setDataCategoryService(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const actionsTable = (item: typeof mockCares[0]): IAction[] => {
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

  const showDialogConfirmDelete = (item?: typeof mockCares[0]) => {
    const dialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "lịch sử chăm sóc này " : `${listIdChecked.length} mục đã chọn `}
          {item ? <strong>{item.customer}</strong> : ""}? Thao tác này không thể khôi phục.
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
      title: "Xóa đánh mục",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className="promo-page page-content">
      <HeaderTabMenu
        title="Lịch sử chăm sóc KH"
        titleBack="Chăm sóc khách hàng"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />
      <div style={{ marginTop: "-16px", marginBottom: "24px", paddingLeft: "4px" }}>
      </div>

      <div className="promo-stats-grid">
        <StatCard title="Tương tác tháng này" value="245" trend={8} icon={<Icon name="Connect" fill="currentColor" />} color="blue" />
        <StatCard title="Cuộc gọi" value="89" icon={<Icon name="Phone" fill="currentColor" />} color="green" />
        <StatCard title="Tin nhắn" value="124" icon={<Icon name="ChatText" fill="currentColor" />} color="purple" />
        <StatCard title="Tỷ lệ hài lòng" value="94%" trend={2} icon={<Icon name="Happy" fill="currentColor" />} color="orange" />
      </div>

      <div className="promo-table-card">
        <div className="promo-table-card__toolbar">
          <div className="promo-search-wrap">
            <svg className="promo-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Tìm khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="promo-search-input"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="promo-select">
            <option value="all">Tất cả loại</option>
            <option value="phone">Cuộc gọi</option>
            <option value="zalo">Zalo</option>
            <option value="message">Tin nhắn</option>
            <option value="store">Tại cửa hàng</option>
          </select>
        </div>

        <BoxTable
          name="lịch sử chăm sóc"
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

      <AddCareHistoryModal
        onShow={showModalAdd}
        data={dataCategoryService}
        onHide={() => setShowModalAdd(false)}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
