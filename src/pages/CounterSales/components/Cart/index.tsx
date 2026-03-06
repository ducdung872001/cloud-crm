import React, { useState } from "react";
import { CartItem, Customer, OrderType } from "../../types";
import "./index.scss";

const MOCK_CUSTOMER: Customer = {
  id: "1",
  name: "Nguyễn Thị Hoa",
  initial: "N",
  phone: "0901 234 567",
  points: 2450,
  tier: "Bạc",
  color: "#3b82f6",
};

interface CartProps {
  items: CartItem[];
  onChangeQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onPay: () => void;
  onSelectCustomer: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onChangeQty, onRemove, onPay, onSelectCustomer }) => {
  const [orderType, setOrderType] = useState<OrderType>("retail");
  const [voucher, setVoucher] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.length;

  const formatVND = (n: number) => n.toLocaleString("vi") + " ₫";

  const ORDER_TYPES: { id: OrderType; label: string }[] = [
    { id: "retail", label: "Lẻ" },
    { id: "wholesale", label: "Buôn" },
    { id: "ship", label: "Ship" },
  ];

  return (
    <div className="cart">
      {/* Header */}
      <div className="cart__header">
        <div className="cart__header-top">
          <div className="cart__title">🛒 Giỏ hàng</div>
          <div className="order-type">
            {ORDER_TYPES.map((ot) => (
              <button key={ot.id} className={`ot${orderType === ot.id ? " active" : ""}`} onClick={() => setOrderType(ot.id)}>
                {ot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer */}
        <div className="cust-box cust-box--filled" onClick={onSelectCustomer}>
          <div className="cust-av" style={{ background: MOCK_CUSTOMER.color }}>
            {MOCK_CUSTOMER.initial}
          </div>
          <div className="cust-info">
            <div className="cust-name">{MOCK_CUSTOMER.name}</div>
            <div className="cust-pts">
              ⭐ {MOCK_CUSTOMER.points.toLocaleString("vi")} điểm · Hạng {MOCK_CUSTOMER.tier}
            </div>
          </div>
          <span className="cust-edit">✏️</span>
        </div>
      </div>

      {/* Cart items */}
      <div className="cart__items">
        {items.length === 0 && (
          <div className="cart__empty">
            <span>🛒</span>
            <p>Giỏ hàng trống</p>
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="ci">
            <div className="ci__icon">{item.icon}</div>
            <div className="ci__info">
              <div className="ci__name">{item.name}</div>
              <div className="ci__price">
                {item.priceLabel}/{item.unit}
              </div>
            </div>
            <div className="ci__qty">
              <button className="qb" onClick={() => onChangeQty(item.id, -1)}>
                −
              </button>
              <span className="qi">{item.qty}</span>
              <button className="qb" onClick={() => onChangeQty(item.id, 1)}>
                +
              </button>
            </div>
            <div className="ci__total">{formatVND(item.price * item.qty)}</div>
            <button className="del-btn" onClick={() => onRemove(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Cart footer */}
      <div className="cart__footer">
        <div className="voucher-row">
          <input type="text" placeholder="🏷️ Nhập mã voucher..." value={voucher} onChange={(e) => setVoucher(e.target.value)} />
          <button className="btn btn--outline btn--sm">Áp dụng</button>
        </div>

        <div className="summary">
          <div className="sr">
            <span className="sr__k">Tạm tính ({itemCount} sản phẩm)</span>
            <span className="sr__v">{formatVND(subtotal)}</span>
          </div>
          <div className="sr">
            <span className="sr__k">Giảm giá voucher</span>
            <span className="sr__v sr__v--red">−0 ₫</span>
          </div>
          <div className="sr">
            <span className="sr__k">Điểm tích lũy dùng</span>
            <span className="sr__v sr__v--blue">−0 ₫</span>
          </div>
          <div className="sr sr--total">
            <span className="sr__k">TỔNG THANH TOÁN</span>
            <span className="sr__v sr__v--lime">{formatVND(subtotal)}</span>
          </div>
        </div>

        <button className="pay-btn" onClick={onPay}>
          💳 Thanh toán · <span>{formatVND(subtotal)}</span>
        </button>
      </div>
    </div>
  );
};

export default Cart;
