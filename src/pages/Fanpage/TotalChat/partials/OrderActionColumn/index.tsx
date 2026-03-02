import React, { useEffect, useMemo, useState } from "react";
import { ICartItem, IProductCatalogItem, OrderStatus } from "../../data";
import CartManager from "./CartManager";
import CreateOrderButton from "./CreateOrderButton";
import CustomerInfoCard from "./CustomerInfoCard";
import OrderSummary from "./OrderSummary";
import VoucherSection from "./VoucherSection";

interface OrderActionColumnProps {
  customerName: string;
  phone: string;
  address: string;
  customerTier: string;
  cartItems: ICartItem[];
  productCatalog: IProductCatalogItem[];
  voucherCode: string;
  orderNote: string;
  shippingFee: number;
  loyaltyPoints: number;
  subtotal: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  orderStatusLabels: Record<OrderStatus, string>;
  hasSentOrderToCustomer: boolean;
  isOrderCreated: boolean;
  labels: {
    title: string;
    customerInfoTitle: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerTier: string;
    cartTitle: string;
    cartSubtitle: string;
    cartCatalogTitle: string;
    cartAddButton: string;
    cartPickerTitle: string;
    cartPickerSearchPlaceholder: string;
    cartRemoveButton: string;
    cartStockLabel: string;
    cartLowStockLabel: string;
    cartEmptyCatalog: string;
    voucherTitle: string;
    voucherPlaceholder: string;
    loyaltyLabel: string;
    summaryTitle: string;
    subtotalLabel: string;
    shippingFeeLabel: string;
    discountLabel: string;
    totalLabel: string;
    notePlaceholder: string;
    orderStatusLabel: string;
    sendToCustomerButton: string;
    sentToCustomerLabel: string;
    createdButton: string;
    createOrderButton: string;
  };
  onCustomerInfoSave: (data: { customerName: string; phone: string; address: string; customerTier: string }) => void;
  onSendOrderToCustomer: () => void;
  onAddProduct: (product: IProductCatalogItem) => void;
  onRemoveProduct: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
  onVoucherChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onCreateOrder: () => void;
}

export default function OrderActionColumn(props: OrderActionColumnProps) {
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const {
    customerName,
    phone,
    address,
    customerTier,
    cartItems,
    productCatalog,
    voucherCode,
    orderNote,
    shippingFee,
    loyaltyPoints,
    subtotal,
    discount,
    total,
    orderStatus,
    orderStatusLabels,
    hasSentOrderToCustomer,
    isOrderCreated,
    labels,
    onCustomerInfoSave,
    onSendOrderToCustomer,
    onAddProduct,
    onRemoveProduct,
    onQuantityChange,
    onVoucherChange,
    onNoteChange,
    onCreateOrder,
  } = props;

  const availableProducts = useMemo(() => {
    const existingSkus = new Set(cartItems.map((item) => item.sku));
    const normalizedSearch = productSearch.trim().toLowerCase();

    return productCatalog.filter((item) => {
      if (existingSkus.has(item.sku)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return item.name.toLowerCase().includes(normalizedSearch) || item.sku.toLowerCase().includes(normalizedSearch);
    });
  }, [cartItems, productCatalog, productSearch]);

  useEffect(() => {
    if (!isProductPickerOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProductPickerOpen(false);
        setProductSearch("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProductPickerOpen]);

  return (
    <section className="omni-panel omni-panel--order">
      {isProductPickerOpen && (
        <div
          className="order-overlay"
          onClick={() => {
            setIsProductPickerOpen(false);
            setProductSearch("");
          }}
        >
          <div className="order-overlay__panel" onClick={(e) => e.stopPropagation()}>
            <div className="order-overlay__header">
              <h3>{labels.cartPickerTitle}</h3>
              <button
                type="button"
                className="order-overlay__close"
                onClick={() => {
                  setIsProductPickerOpen(false);
                  setProductSearch("");
                }}
                aria-label="Đóng"
                title="Đóng"
              >
                ×
              </button>
            </div>
            <div className="order-overlay__search">
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={labels.cartPickerSearchPlaceholder}
              />
            </div>
            <div className="order-overlay__list">
              {availableProducts.length > 0 ? (
                availableProducts.map((item) => {
                  const isLowStock = item.stock <= 10;

                  return (
                    <button
                      key={item.sku}
                      type="button"
                      className={`order-overlay__item${isLowStock ? " is-low-stock" : ""}`}
                      onClick={() => {
                        onAddProduct(item);
                        setIsProductPickerOpen(false);
                        setProductSearch("");
                      }}
                    >
                      <div className="order-overlay__meta">
                        <strong>{item.name}</strong>
                        <span>{item.sku}</span>
                      </div>
                      <div className="order-overlay__values">
                        <strong>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(item.price)}</strong>
                        <span className={isLowStock ? "is-low-stock" : ""}>
                          {labels.cartStockLabel}: {item.stock}
                          {isLowStock ? ` • ${labels.cartLowStockLabel}` : ""}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="order-overlay__empty">{labels.cartEmptyCatalog}</div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="omni-panel__header">
        <div>
          <h2>{labels.title}</h2>
        </div>
      </div>

      <CustomerInfoCard
        customerName={customerName}
        phone={phone}
        address={address}
        customerTier={customerTier}
        labels={labels}
        onSave={onCustomerInfoSave}
      />

      <CartManager
        cartItems={cartItems}
        labels={labels}
        onOpenProductPicker={() => setIsProductPickerOpen(true)}
        onRemoveProduct={onRemoveProduct}
        onQuantityChange={onQuantityChange}
      />

      <VoucherSection voucherCode={voucherCode} loyaltyPoints={loyaltyPoints} labels={labels} onVoucherChange={onVoucherChange} />

      <OrderSummary
        subtotal={subtotal}
        shippingFee={shippingFee}
        discount={discount}
        total={total}
        orderNote={orderNote}
        orderStatus={orderStatus}
        orderStatusLabels={orderStatusLabels}
        hasSentOrderToCustomer={hasSentOrderToCustomer}
        labels={labels}
        onNoteChange={onNoteChange}
      />

      {!isOrderCreated && (
        <button type="button" className="send-order-button" onClick={onSendOrderToCustomer}>
          {labels.sendToCustomerButton}
        </button>
      )}

      <CreateOrderButton
        label={isOrderCreated ? labels.createdButton : labels.createOrderButton}
        disabled={isOrderCreated}
        onCreateOrder={onCreateOrder}
      />
    </section>
  );
}
