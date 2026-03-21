import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Order } from "../../types";
import Icon from "components/icon";
import { showToast } from "utils/common";
import "./index.scss";

// ─── Mock orders (only used when listOrder not passed) ───────────────────────
const ORDERS: Order[] = [
  {
    id: "1", code: "#DH-20231021-0042", source: "offline", sourceLabel: "🏪 Tại quầy",
    status: "pending", statusLabel: "⏳ Chờ xử lý", time: "21/10 · 09:45",
    customer: { id: "1", name: "Nguyễn Thị Hoa", initial: "N", phone: "0901 234 567", points: 2450, tier: "Bạc", color: "#7c3aed" },
    items: "3 sản phẩm: Sữa TH, Mì Hảo Hảo, Pepsi...", total: 122500,
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "shipping" | "success" | "cancelled";

export interface StatusCounts {
  all: number;
  pending: number;
  success: number;
  cancelled: number;
}

interface OrderListProps {
  onViewDetail:    (invoiceId: number | null) => void;
  onViewReceipt:   (invoiceId: number | null) => void;
  onConfirm:       (invoiceId: number | null) => void;
  listOrder?:      Order[];
  // Filter props (controlled from parent SaleInvoiceList)
  activeFilter?:      StatusFilter;
  onFilterChange?:    (f: StatusFilter) => void;
  searchText?:        string;
  onSearchChange?:    (v: string) => void;
  fromDate?:          string;
  toDate?:            string;
  onFromDateChange?:  (v: string) => void;
  onToDateChange?:    (v: string) => void;
  onSearch?:          () => void;
  statusCounts?:      StatusCounts;
  totalItem?:         number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending:   "bd-orange",
  shipping:  "bd-blue",
  success:   "bd-lime",
  cancelled: "bd-red",
};

// ─── Component ───────────────────────────────────────────────────────────────

const OrderList: React.FC<OrderListProps> = ({
  onViewDetail, onViewReceipt, onConfirm,
  listOrder = ORDERS,
  // Filter props with fallback to local state if not controlled
  activeFilter: activeFilterProp,
  onFilterChange,
  searchText: searchTextProp,
  onSearchChange,
  fromDate: fromDateProp,
  toDate:   toDateProp,
  onFromDateChange,
  onToDateChange,
  onSearch,
  statusCounts,
  totalItem,
}) => {
  // Local fallback state (when used standalone without parent control)
  const [localFilter,   setLocalFilter]   = useState<StatusFilter>("all");
  const [localSearch,   setLocalSearch]   = useState("");
  const [localFromDate, setLocalFromDate] = useState("2023-10-20");
  const [localToDate,   setLocalToDate]   = useState("2023-10-21");

  const isControlled   = activeFilterProp !== undefined;
  const activeFilter   = isControlled ? activeFilterProp   : localFilter;
  const searchText     = isControlled ? (searchTextProp ?? "") : localSearch;
  const fromDate       = isControlled ? (fromDateProp  ?? "") : localFromDate;
  const toDate         = isControlled ? (toDateProp    ?? "") : localToDate;

  const handleFilterChange = (f: StatusFilter) => {
    if (onFilterChange) onFilterChange(f);
    else setLocalFilter(f);
  };
  const handleSearchChange = (v: string) => {
    if (onSearchChange) onSearchChange(v);
    else setLocalSearch(v);
  };
  const handleFromDateChange = (v: string) => {
    if (onFromDateChange) onFromDateChange(v);
    else setLocalFromDate(v);
  };
  const handleToDateChange = (v: string) => {
    if (onToDateChange) onToDateChange(v);
    else setLocalToDate(v);
  };
  const handleSearch = () => {
    if (onSearch) onSearch();
  };

  const [recreatingId, setRecreatingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const formatVND = (n: number) => (n ? n.toLocaleString("vi") + " ₫" : "");

  const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all",       label: "Tất cả"     },
    { id: "pending",   label: "⏳ Chờ xử lý" },
    { id: "shipping",  label: "🚚 Đang giao"  },
    { id: "success",   label: "✅ Hoàn thành" },
    { id: "cancelled", label: "❌ Đã hủy"     },
  ];

  const getCount = (id: StatusFilter): number => {
    if (!statusCounts) return 0;
    return statusCounts[id] ?? 0;
  };

  // ── Tái tạo đơn đã hủy ──────────────────────────────────────────────────
  const handleRecreateOrder = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setRecreatingId(order.id);
    try {
      const res  = await fetch(`/bizapi/sales/invoiceDetail/get?id=${order.id}`);
      const json = await res.json();
      if (json.code === 0) {
        const result   = json.result ?? {};
        const products: any[] = result.products ?? result.items ?? [];
        if (products.length === 0) {
          showToast("Đơn hàng này không có sản phẩm để tái tạo.", "error");
          return;
        }
        const cartItems = products.map((p: any) => ({
          id:        String(p.productId),
          variantId: String(p.variantId ?? p.productId),
          name:      p.name || p.productName || "Sản phẩm",
          icon:      "📦",
          avatar:    p.productAvatar || "",
          image:     p.productAvatar || "",
          price:     p.price    || 0,
          qty:       p.qty      || 1,
          unit:      p.unitName || "Cái",
          unitName:  p.unitName || "Cái",
        }));
        navigate("/create_sale_add", {
          state: { preloadCart: cartItems, fromInvoiceCode: order.code },
        });
      } else {
        showToast(json.message || json.error || "Không lấy được thông tin đơn hàng.", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi tái tạo đơn hàng.", "error");
    } finally {
      setRecreatingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="order-list">

      {/* Toolbar */}
      <div className="ol-toolbar">
        <div className="ol-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Mã đơn, tên, SĐT..."
            value={searchText}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          {searchText && (
            <button className="ol-search__clear" onClick={() => handleSearchChange("")}>×</button>
          )}
        </div>

        <input
          type="date"
          className="ff"
          value={fromDate}
          onChange={e => handleFromDateChange(e.target.value)}
        />
        <span className="ol-arrow">→</span>
        <input
          type="date"
          className="ff"
          value={toDate}
          onChange={e => handleToDateChange(e.target.value)}
        />

        <button className="btn btn--lime btn--sm" onClick={handleSearch}>
          🔍 Lọc
        </button>

        <div className="ol-toolbar__right">
          <button className="btn btn--outline btn--sm">📥 Xuất Excel</button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="kanban-header">
        {STATUS_FILTERS.map((f) => {
          const count = getCount(f.id);
          return (
            <div
              key={f.id}
              className={`kh${activeFilter === f.id ? " active" : ""}`}
              onClick={() => handleFilterChange(f.id)}
            >
              {f.label}
              {(statusCounts || f.id === "all") && (
                <span className={`kc ${f.id !== "all" ? STATUS_BADGE_CLASS[f.id] : "bd-gray"}`}>
                  {f.id === "all" ? (totalItem ?? getCount("all")) : count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Order cards */}
      <div className="ol-wrap">
        {listOrder.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>
            Không có đơn hàng nào.
          </div>
        )}
        {listOrder.map((order) => (
          <div
            key={order.id}
            className={`order-card${order.status === "cancelled" ? " order-card--cancelled" : ""}`}
            onClick={() => onViewDetail(Number(order.id))}
          >
            <div className="order-card__top">
              <span className="oc-id">{order.code}</span>
              <div className="order-card__meta">
                <span className={`src-badge src-${order.source === "offline" ? "offline" : "online"}`}>{order.sourceLabel}</span>
                <span className={`badge ${STATUS_BADGE_CLASS[order.status]}`}>{order.statusLabel}</span>
                <span className="oc-time">{order.time}</span>
              </div>
            </div>
            <div className="order-card__mid">
              <div className="oc-av" style={{ background: order.customer.color }}>
                {order.customer.initial}
              </div>
              <div>
                <div className="oc-name">{order.customer.name}</div>
                {order.customer.phone && (
                  <div className="oc-phone">{order.customer.phone}</div>
                )}
                <div className={`oc-items${order.status === "cancelled" ? " oc-items--cancelled" : ""}`}>
                  {order.items}
                </div>
              </div>
            </div>
            <div className="order-card__bot" onClick={e => e.stopPropagation()}>
              <div className={`oc-total${order.status === "cancelled" ? " oc-total--cancelled" : ""}`}>
                {formatVND(order.total)}
              </div>
              <div className="oc-actions">
                {order.status !== "cancelled" && (
                  <button className="btn btn--xs btn--outline"
                    onClick={e => { e.stopPropagation(); onViewReceipt(Number(order.id)); }}>
                    🧾 Biên lai
                  </button>
                )}
                {order.status === "pending" && (
                  <button className="btn btn--xs btn--outline"
                    onClick={e => { e.stopPropagation(); navigate(`/add_shipping?invoiceId=${Number(order.id)}`); }}>
                    <Icon name="Send" /> Tạo đơn vận chuyển
                  </button>
                )}
                {order.status === "pending" && (
                  <>
                    <button className="btn btn--xs btn--outline">✏️ Sửa</button>
                    <button className="btn btn--xs btn--confirm"
                      onClick={e => { e.stopPropagation(); onConfirm(Number(order.id)); }}>
                      ✅ Xác nhận
                    </button>
                  </>
                )}
                {order.status === "shipping" && (
                  <button className="btn btn--xs btn--outline">📍 Theo dõi vận chuyển</button>
                )}
                {order.status === "success" && (
                  <button className="btn btn--xs btn--outline"
                    onClick={e => { e.stopPropagation(); navigate(`/invoiceVAT?tab=issue&code=${encodeURIComponent(order.code)}`); }}>
                    📩 Gửi HĐ điện tử
                  </button>
                )}
                {order.status === "cancelled" && (
                  <>
                    <button className="btn btn--xs btn--outline"
                      onClick={() => onViewDetail(Number(order.id))}>
                      Xem chi tiết
                    </button>
                    <button
                      className="btn btn--xs btn--outline"
                      disabled={recreatingId === order.id}
                      onClick={e => handleRecreateOrder(e, order)}
                    >
                      {recreatingId === order.id ? "Đang tải..." : "↩️ Tái tạo đơn"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
