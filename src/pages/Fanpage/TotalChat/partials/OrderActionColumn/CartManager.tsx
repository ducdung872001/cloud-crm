import React from "react";
import { ICartItem } from "../../data";

interface CartManagerProps {
  cartItems: ICartItem[];
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
  const { cartItems, labels, onOpenProductPicker, onRemoveProduct, onQuantityChange } = props;

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
