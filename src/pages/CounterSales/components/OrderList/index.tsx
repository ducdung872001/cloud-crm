import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Order } from "../../types";
import Icon from "components/icon";
import "./index.scss";

const ORDERS: Order[] = [
  {
    id: "1",
    code: "#DH-20231021-0042",
    source: "offline",
    sourceLabel: "🏪 Tại quầy",
    status: "pending",
    statusLabel: "⏳ Chờ xử lý",
    time: "21/10 · 09:45",
    customer: { id: "1", name: "Nguyễn Thị Hoa", initial: "N", phone: "0901 234 567", points: 2450, tier: "Bạc", color: "#7c3aed" },
    items: "3 sản phẩm: Sữa TH, Mì Hảo Hảo, Pepsi...",
    total: 122500,
  },
  {
    id: "2",
    code: "#DH-20231021-0041",
    source: "shopee",
    sourceLabel: "🛍️ Shopee",
    status: "shipping",
    statusLabel: "🚚 Đang giao",
    time: "21/10 · 08:22",
    customer: { id: "2", name: "Trần Văn Bình", initial: "T", phone: "0912 456 789", points: 850, tier: "Đồng", color: "#059669" },
    items: "5 sản phẩm · Giao GHTK · Phí ship 30,000 ₫",
    total: 285000,
  },
  {
    id: "3",
    code: "#DH-20231021-0040",
    source: "tiktok",
    sourceLabel: "🎵 TikTok Shop",
    status: "success",
    statusLabel: "✅ Hoàn thành",
    time: "20/10 · 16:10",
    customer: { id: "3", name: "Lê Thị Minh", initial: "L", phone: "0978 654 321", points: 1200, tier: "Bạc", color: "#d97706" },
    items: "2 sản phẩm · Đã thanh toán QR · Hoàn thành 20/10",
    total: 89000,
  },
  {
    id: "4",
    code: "#DH-20231020-0038",
    source: "offline",
    sourceLabel: "🏪 Tại quầy",
    status: "cancelled",
    statusLabel: "❌ Đã hủy",
    time: "20/10 · 14:30",
    customer: { id: "4", name: "Phạm Quốc Huy", initial: "P", phone: "0965 111 222", points: 0, tier: "", color: "#dc2626" },
    items: "Lý do hủy: Khách đổi ý",
    total: 156000,
    cancellationReason: "Khách đổi ý",
  },
];

const STATUS_FILTERS = [
  { id: "all", label: "Tất cả", count: 42 },
  { id: "pending", label: "⏳ Chờ xử lý", count: 8 },
  { id: "shipping", label: "🚚 Đang giao", count: 12 },
  { id: "success", label: "✅ Hoàn thành", count: 18 },
  { id: "cancelled", label: "❌ Đã hủy", count: 4 },
];

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: "bd-orange",
  shipping: "bd-blue",
  success: "bd-lime",
  cancelled: "bd-red",
};

interface OrderListProps {
  onViewDetail: (invoiceId: number | null) => void;
  onViewReceipt: (invoiceId: number | null) => void;
  onConfirm: (invoiceId: number | null) => void;
  listOrder?: Order[];
}

const OrderList: React.FC<OrderListProps> = ({ onViewDetail, onViewReceipt, onConfirm, listOrder = ORDERS }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  const formatVND = (n: number) => (n ? n.toLocaleString("vi") + " ₫" : "");

  return (
    <div className="order-list">
      {/* Toolbar */}
      <div className="ol-toolbar">
        <div className="ol-search">
          <span>🔍</span>
          <input type="text" placeholder="Mã đơn, tên, SĐT..." />
        </div>
        <select className="ff">
          <option>Tất cả trạng thái</option>
          <option>Chờ xử lý</option>
          <option>Đang giao</option>
          <option>Hoàn thành</option>
          <option>Đã hủy</option>
        </select>
        <select className="ff">
          <option>Nguồn đơn (tất cả)</option>
          <option>Offline - Tại quầy</option>
          <option>Shopee</option>
          <option>TikTok Shop</option>
        </select>
        <input type="date" className="ff" defaultValue="2023-10-20" />
        <span className="ol-arrow">→</span>
        <input type="date" className="ff" defaultValue="2023-10-21" />
        <button className="btn btn--lime btn--sm">🔍 Lọc</button>
        <div className="ol-toolbar__right">
          <button className="btn btn--outline btn--sm">📥 Xuất Excel</button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="kanban-header">
        {STATUS_FILTERS.map((f) => (
          <div key={f.id} className={`kh${activeFilter === f.id ? " active" : ""}`} onClick={() => setActiveFilter(f.id)}>
            {f.label}
            <span className={`kc ${f.id !== "all" ? STATUS_BADGE_CLASS[f.id] : "bd-gray"}`}>{f.count}</span>
          </div>
        ))}
      </div>

      {/* Order cards */}
      <div className="ol-wrap">
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
                <div className="oc-phone">{order.customer.phone}</div>
                <div className={`oc-items${order.status === "cancelled" ? " oc-items--cancelled" : ""}`}>{order.items}</div>
              </div>
            </div>
            <div className="order-card__bot" onClick={(e) => e.stopPropagation()}>
              <div className={`oc-total${order.status === "cancelled" ? " oc-total--cancelled" : ""}`}>{formatVND(order.total)}</div>
              <div className="oc-actions">
                {order.status !== "cancelled" && (
                  <button
                    className="btn btn--xs btn--outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewReceipt(Number(order.id));
                    }}
                  >
                    🧾 Biên lai
                  </button>
                )}
                {order.status === "pending" && (
                  <button
                    className="btn btn--xs btn--outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/add_shipping?invoiceId=${Number(order.id)}`);
                    }}
                  >
                    <Icon name="Send" /> Tạo đơn vận chuyển
                  </button>
                )}
                {order.status === "pending" && (
                  <>
                    <button className="btn btn--xs btn--outline">✏️ Sửa</button>
                    <button
                      className="btn btn--xs btn--confirm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirm(Number(order.id));
                      }}
                    >
                      ✅ Xác nhận
                    </button>
                  </>
                )}
                {order.status === "shipping" && <button className="btn btn--xs btn--outline">📍 Theo dõi vận chuyển</button>}
                {order.status === "success" && <button className="btn btn--xs btn--outline">📩 Gửi HĐ điện tử</button>}
                {order.status === "cancelled" && (
                  <>
                    <button className="btn btn--xs btn--outline" onClick={() => onViewDetail(Number(order.id))}>
                      Xem chi tiết
                    </button>
                    <button className="btn btn--xs btn--outline">↩️ Tái tạo đơn</button>
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
