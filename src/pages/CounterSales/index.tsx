import React, { useState, useCallback } from "react";
import "./index.scss";

// import PayModal from "../../components/modals/PayModal";
// import ReceiptModal from "../../components/modals/ReceiptModal";
// import OrderDetailModal from "../../components/modals/OrderDetailModal";
// import QrScanModal from "../../components/modals/QrScanModal";
// import SyncModal from "../../components/modals/SyncModal";
// import CustomerModal from "../../components/modals/CustomerModal";

import Sidebar from "@/components/sidebar/sidebar";
import Topbar from "./components/Topbar";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import OrderList from "./components/OrderList";
import Report from "./components/Report";
import { CartItem, Customer, TabType } from "./types";
import OrderDetailModal from "./components/modals/OrderDetailModal";
import PayModal from "./components/modals/PayModal";
import ReceiptModal from "./components/modals/ReceiptModal";
import QrScanModal from "./components/modals/QrScanModal";
import SyncModal from "./components/modals/SyncModal";
import CustomerModal from "./components/modals/CustomerModal";

const INITIAL_CART: CartItem[] = [
  // { id: "1", icon: "🥛", name: "Sữa TH True Milk 1L", priceLabel: "32,000 ₫", price: 32000, unit: "hộp", qty: 2 },
  // { id: "3", icon: "🍜", name: "Mì Hảo Hảo Tôm Chua Cay", priceLabel: "4,500 ₫", price: 4500, unit: "gói", qty: 5 },
  // { id: "2", icon: "🥤", name: "Pepsi 330ml", priceLabel: "12,000 ₫", price: 12000, unit: "lon", qty: 3 },
];

const CounterSales: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pos");
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);

  // Modal states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [qrScanModalOpen, setQrScanModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Cart actions
  const handleAddToCart = useCallback((item: Omit<CartItem, "qty">) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const handleChangeQty = useCallback((id: string, delta: number) => {
    setCartItems((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c));
      return updated.filter((c) => c.qty > 0);
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Payment flow
  const handlePayConfirm = useCallback(() => {
    setPayModalOpen(false);
    setReceiptModalOpen(true);
  }, []);

  // Order list callbacks
  const handleViewReceipt = useCallback(() => setReceiptModalOpen(true), []);
  const handleViewDetail = useCallback(() => setOrderDetailModalOpen(true), []);
  const handleConfirmOrder = useCallback(() => {
    setOrderDetailModalOpen(false);
  }, []);

  // QR scan add to cart
  const handleQrAddToCart = useCallback(() => {
    handleAddToCart({ id: "1", icon: "🥛", name: "Sữa TH True Milk 1L", priceLabel: "32,000 ₫", price: 32000, unit: "hộp" });
    setQrScanModalOpen(false);
  }, [handleAddToCart]);

  return (
    <div className="counter-sales">
      <Sidebar />

      <div className="counter-sales__main">
        <Topbar activeTab={activeTab} onTabChange={setActiveTab} onSync={() => setSyncModalOpen(true)} />

        <div className="counter-sales__content">
          {/* POS Tab */}
          {activeTab === "pos" && (
            <div className="counter-sales__screen counter-sales__screen--pos">
              <ProductGrid onAddToCart={handleAddToCart} onQrScan={() => setQrScanModalOpen(true)} />
              <Cart
                items={cartItems}
                onChangeQty={handleChangeQty}
                onRemove={handleRemove}
                onPay={() => setPayModalOpen(true)}
                onSelectCustomer={() => setCustomerModalOpen(true)}
                customer={customer || undefined}
              />
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="counter-sales__screen">
              <OrderList onViewDetail={handleViewDetail} onViewReceipt={handleViewReceipt} onConfirm={handleConfirmOrder} />
            </div>
          )}

          {/* Report Tab */}
          {activeTab === "report" && (
            <div className="counter-sales__screen">
              <Report />
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <PayModal open={payModalOpen} cartItems={cartItems} onClose={() => setPayModalOpen(false)} onConfirm={handlePayConfirm} />

      <ReceiptModal open={receiptModalOpen} cartItems={cartItems} onClose={() => setReceiptModalOpen(false)} />

      <OrderDetailModal
        open={orderDetailModalOpen}
        onClose={() => setOrderDetailModalOpen(false)}
        onPrint={() => {
          setOrderDetailModalOpen(false);
          setReceiptModalOpen(true);
        }}
        onConfirm={handleConfirmOrder}
      />

      <QrScanModal open={qrScanModalOpen} onClose={() => setQrScanModalOpen(false)} onAdd={handleQrAddToCart} />

      <SyncModal open={syncModalOpen} onClose={() => setSyncModalOpen(false)} />

      <CustomerModal open={customerModalOpen} onClose={() => setCustomerModalOpen(false)} onSelect={(customer) => setCustomer(customer)} />
    </div>
  );
};

export default CounterSales;
