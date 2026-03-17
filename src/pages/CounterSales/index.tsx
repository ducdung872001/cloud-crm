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
import BoughtProductService from "@/services/BoughtProductService";
import { showToast } from "@/utils/common";
import AddCustomerPersonModal from "../CustomerPerson/partials/AddCustomerPersonModal";

const INITIAL_CART: CartItem[] = [
  // { id: "1", icon: "🥛", name: "Sữa TH True Milk 1L", priceLabel: "32,000 ₫", price: 32000, unit: "hộp", qty: 2 },
  // { id: "3", icon: "🍜", name: "Mì Hảo Hảo Tôm Chua Cay", priceLabel: "4,500 ₫", price: 4500, unit: "gói", qty: 5 },
  // { id: "2", icon: "🥤", name: "Pepsi 330ml", priceLabel: "12,000 ₫", price: 12000, unit: "lon", qty: 3 },
];

const CounterSales: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pos");
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  // Modal states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [qrScanModalOpen, setQrScanModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerQuickAdd, setCustomerQuickAdd] = useState(false);
  const [customerPhoneAdd, setCustomerPhoneAdd] = useState("");

  // Cart actions
  const handleAddToCart = useCallback((item: Omit<CartItem, "qty"> & { qty: number }) => {
    console.log("item to add", item);

    setCartItems((prev) => {
      const existing = prev.find((c) => c.variantId === item.variantId);
      if (existing) {
        return prev.map((c) => (c.variantId === item.variantId ? { ...c, qty: c.qty + item.qty } : c));
      }
      return [...prev, { ...item, qty: item.qty }];
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
  const handlePayConfirm = async (invoiceId: number | null) => {
    if (invoiceId) {
      try {
        let body = cartItems.map((item: CartItem) => ({
          productId: Number(item.id),
          variantId: Number(item.variantId),
          price: item.price,
          customerId: customer?.id ?? -1,
          qty: item.qty,
          name: item.name,
          avatar: item.avatar,
          unitName: item.unitName,
        }));
        const paidInvoice = await BoughtProductService.insert(body, {
          invoiceId: invoiceId,
        });
        if (paidInvoice.code == 0) {
          setPayModalOpen(false);
          setReceiptModalOpen(true);
          showToast("Thanh toán thành công.", "success");
        } else {
          showToast(paidInvoice.message || "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.", "error");
        }
      } catch (error) {
        showToast("Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.", "error");
      }
    }
  };

  // Order list callbacks
  const handleViewReceipt = useCallback(() => setReceiptModalOpen(true), []);
  const handleViewDetail = useCallback(() => setOrderDetailModalOpen(true), []);
  const handleConfirmOrder = useCallback(() => {
    setOrderDetailModalOpen(false);
  }, []);

  // QR scan add to cart
  const handleQrAddToCart = useCallback(() => {
    handleAddToCart({ id: "1", icon: "🥛", name: "Sữa TH True Milk 1L", priceLabel: "32,000 ₫", price: 32000, unit: "hộp", qty: 1, variantId: "1" });
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
                onPay={(invoiceId) => {
                  setInvoiceId(invoiceId);
                  setPayModalOpen(true);
                }}
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
      <PayModal
        open={payModalOpen}
        cartItems={cartItems}
        invoiceId={invoiceId}
        onClose={() => {
          setInvoiceId(null);
          setPayModalOpen(false);
        }}
        onConfirm={(id) => handlePayConfirm(id)}
      />

      <ReceiptModal
        open={receiptModalOpen}
        cartItems={cartItems}
        onClose={() => {
          setCartItems([]);
          setCustomer(null);
          setInvoiceId(null);
          setReceiptModalOpen(false);
        }}
      />

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

      <CustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSelect={(customer) => setCustomer(customer)}
        onQuickAdd={(search) => {
          setCustomerQuickAdd(true);
          setCustomerPhoneAdd(search);
        }}
      />
      <AddCustomerPersonModal
        onShow={customerQuickAdd}
        phoneQuickAdd={customerPhoneAdd}
        onHide={(reload) => {
          if (reload) {
            setCustomerModalOpen(false);
            setTimeout(() => setCustomerModalOpen(true), 300); // Đóng rồi mở lại modal chọn khách để refresh danh sách khách hàng
          }
          setCustomerQuickAdd(false);
          setCustomerPhoneAdd("");
        }}
      />
    </div>
  );
};

export default CounterSales;
