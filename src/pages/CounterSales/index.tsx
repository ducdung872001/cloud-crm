import React, { useState, useCallback } from "react";
import "./index.scss";

import Sidebar from "@/components/sidebar/sidebar";
import Topbar from "./components/Topbar";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import OrderList from "./components/OrderList";
import Report from "./components/Report";
import { CartItem, Customer, PayMethod, TabType } from "./types";
import OrderDetailModal from "./components/modals/OrderDetailModal";
import PayModal from "./components/modals/PayModal";
import ReceiptModal from "./components/modals/ReceiptModal";
import QrScanModal from "./components/modals/QrScanModal";
import SyncModal from "./components/modals/SyncModal";
import CustomerModal from "./components/modals/CustomerModal";
import BoughtProductService from "@/services/BoughtProductService";
import { showToast } from "@/utils/common";
import AddCustomerPersonModal from "../CustomerPerson/partials/AddCustomerPersonModal";
import QrCodeProService from "@/services/QrCodeProService";
import DraftOrders from "./components/DraftOrders";

const INITIAL_CART: CartItem[] = [];

const CounterSales: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pos");
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [invoiceDraftToPaid, setInvoiceDraftToPaid] = useState<any>(null);
  const [method, setMethod] = useState<PayMethod>("cash");
  const [qrCodePro, setQrCodePro] = useState<string | null>(null);

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
    setCartItems((prev) => {
      const existing = prev.find((c) => c.variantId === item.variantId);
      if (existing) return prev.map((c) => (c.variantId === item.variantId ? { ...c, qty: c.qty + item.qty } : c));
      return [...prev, { ...item, qty: item.qty }];
    });
  }, []);

  const handleChangeQty = useCallback((id: string, delta: number) => {
    setCartItems((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0));
  }, []);

  const handleRemove = useCallback((id: string) => setCartItems((prev) => prev.filter((c) => c.id !== id)), []);

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
        const paidInvoice = await BoughtProductService.insert(body, { invoiceId: invoiceId });
        if (paidInvoice.code == 0) {
          if (method === "qr") {
            try {
              const qrCodeRes = await QrCodeProService.generate({
                content: "DON HANG " + invoiceId,
                orderId: invoiceId,
                amount: cartItems.reduce((s, c) => s + c.price * c.qty, 0),
              });
              if (qrCodeRes.code === 0 && qrCodeRes?.result && qrCodeRes?.result?.qrCode) {
                setPayModalOpen(false);
                setReceiptModalOpen(true);
                showToast("Tạo hoá đơn thành công.", "success");
                setQrCodePro(qrCodeRes.result.qrCode);
              } else {
                showToast(qrCodeRes.message || "Có lỗi xảy ra khi tạo QR Code Pro. Vui lòng thử lại sau.", "error");
              }
            } catch (error) {
              showToast("Có lỗi xảy ra khi tạo QR Code Pro. Vui lòng thử lại sau.", "error");
            }
          } else {
            setPayModalOpen(false);
            setReceiptModalOpen(true);
            showToast("Tạo hoá đơn thành công.", "success");
            setQrCodePro(null);
            setMethod("cash");
          }
        } else {
          showToast(paidInvoice.message || "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.", "error");
        }
      } catch (error) {
        showToast("Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.", "error");
      }
    }
  };

  const handleViewReceipt = useCallback(() => setReceiptModalOpen(true), []);
  const handleViewDetail = useCallback(() => setOrderDetailModalOpen(true), []);
  const handleConfirmOrder = useCallback(() => setOrderDetailModalOpen(false), []);

  const handleQrAddToCart = useCallback(() => {
    handleAddToCart({
      id: "1",
      icon: "🥛",
      name: "Sữa TH True Milk 1L",
      priceLabel: "32,000 ₫",
      price: 32000,
      unit: "hộp",
      qty: 1,
      variantId: "1",
    });
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
                setInvoiceDraftToPaid={setInvoiceDraftToPaid}
                onPay={(invoiceId) => {
                  setInvoiceId(invoiceId);
                  setPayModalOpen(true);
                }}
                onSelectCustomer={() => setCustomerModalOpen(true)}
                customer={customer || undefined}
              />
            </div>
          )}

          {/* Draft Orders Tab */}
          {activeTab === "draft" && (
            <div className="counter-sales__screen">
              <DraftOrders
                onContinue={(draftId) => {
                  console.log("Continue draft", draftId);
                  setActiveTab("pos");
                }}
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
        method={method}
        setMethod={setMethod}
        onClose={() => {
          setInvoiceId(null);
          setPayModalOpen(false);
        }}
        onConfirm={(id) => handlePayConfirm(id)}
      />

      <ReceiptModal
        open={receiptModalOpen}
        cartItems={cartItems}
        customerId={customer?.id ?? -1}
        invoiceId={invoiceId ?? -1}
        invoiceDraft={invoiceDraftToPaid}
        method={method}
        qrCodePro={qrCodePro}
        onClose={() => {
          setCartItems([]);
          setCustomer(null);
          setInvoiceId(null);
          setReceiptModalOpen(false);
          setInvoiceDraftToPaid(null);
          setQrCodePro(null);
          setMethod("cash");
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
            setTimeout(() => setCustomerModalOpen(true), 300);
          }
          setCustomerQuickAdd(false);
          setCustomerPhoneAdd("");
        }}
      />
    </div>
  );
};

export default CounterSales;
