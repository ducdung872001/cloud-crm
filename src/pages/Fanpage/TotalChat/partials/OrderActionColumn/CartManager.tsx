import React from "react";
import { ICartItem } from "../../data";

interface CartManagerProps {
  cartItems: ICartItem[];
  pendingCartItems: ICartItem[];
  labels: {
    cartTitle: string;
    cartSubtitle: string;
    cartCatalogTitle: string;
    cartAddButton: string;
    cartPickerTitle: string;
    cartRemoveButton: string;
    cartStockLabel: string;
  };
  onOpenProductPicker: () => void;
  onRemovePendingProduct: (id: number) => void;
  onConfirmPendingProduct: (id: number) => void;
  onSendPendingProduct: (id: number) => void;
  onRemoveProduct: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function CartManager(props: CartManagerProps) {
  const {
    cartItems,
    pendingCartItems,
    labels,
    onOpenProductPicker,
    onRemovePendingProduct,
    onConfirmPendingProduct,
    onSendPendingProduct,
    onRemoveProduct,
    onQuantityChange,
  } = props;

  return (
    <div className="order-card">
      <div className="cart-header">
        <div>
          <h3>{labels.cartTitle}</h3>
          <div className="product-search">{labels.cartSubtitle}</div>
        </div>
        <button type="button" className="cart-add-button" onClick={onOpenProductPicker} title={labels.cartCatalogTitle}>
          <span>+</span>
          <span>{labels.cartAddButton}</span>
        </button>
      </div>
      <div className="cart-list">
        {pendingCartItems.map((item) => (
          <div key={item.id} className="cart-item cart-item--pending">
            <div className="cart-item__meta">
              <strong>{item.name}</strong>
              <span>{item.sku}</span>
            </div>
            <div className="cart-item__pending-actions">
              <button type="button" className="cart-item__pending-button cart-item__pending-button--send" onClick={() => onSendPendingProduct(item.id)}>
                Gửi
              </button>
              <button type="button" className="cart-item__pending-button cart-item__pending-button--discard" onClick={() => onRemovePendingProduct(item.id)}>
                X
              </button>
              <button type="button" className="cart-item__pending-button cart-item__pending-button--confirm" onClick={() => onConfirmPendingProduct(item.id)}>
                V
              </button>
            </div>
            <div className="cart-item__price">{formatCurrency(item.price * item.quantity)}</div>
          </div>
        ))}
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item__meta">
              <strong>{item.name}</strong>
              <span>{item.sku}</span>
            </div>
            <div className="cart-item__actions">
              <button type="button" onClick={() => onQuantityChange(item.id, -1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => onQuantityChange(item.id, 1)}>
                +
              </button>
            </div>
            <button type="button" className="cart-item__remove" onClick={() => onRemoveProduct(item.id)}>
              {labels.cartRemoveButton}
            </button>
            <div className="cart-item__price">{formatCurrency(item.price * item.quantity)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
