import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./index.scss";

import Sidebar from "@/components/sidebar/sidebar";
import Topbar from "./components/Topbar";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
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
import SaleInvoiceList from "../Sell/SaleInvoiceList/SaleInvoiceList";
import { urlsApi } from "configs/urls";
import PromotionModal, { EligiblePromotion, IneligiblePromotion } from "./components/modals/PromotionModal";
import { ContextType, UserContext } from "contexts/userContext";
import WarehouseService from "@/services/WarehouseService";
import { IOption } from "@/model/OtherModel";

const INITIAL_CART: CartItem[] = [];

const CounterSales: React.FC = () => {
  document.title = "Bán hàng tại quầy";
  const location = useLocation();
  const { dataBranch } = React.useContext(UserContext) as ContextType;

  const [activeTab, setActiveTab] = useState<TabType>("pos");
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [invoiceDraftToPaid, setInvoiceDraftToPaid] = useState<any>(null);
  const [method, setMethod] = useState<PayMethod>("cash");
  const [qrCodePro, setQrCodePro] = useState<string | null>(null);

  // ── Tab badge counts ────────────────────────────────────────────────────────
  const [draftCount, setDraftCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [warehouseOptions, setWarehouseOptions] = useState<IOption[]>([]);

  const fetchTabCounts = useCallback(async () => {
    try {
      const branchId = dataBranch?.value ?? 0;
      const res = await fetch(`${urlsApi.invoice.tabCounts}?branchId=${branchId}`);
      const json = await res.json();
      if (json.code === 0 && json.result) {
        setDraftCount(Number(json.result.draftCount ?? 0));
        setOrderCount(Number(json.result.orderCount ?? 0));
      }
    } catch {
      // Badge không hiển thị được cũng không critical — bỏ qua lỗi
    }
  }, [dataBranch]);

  // Gọi khi mount + khi đổi branch
  useEffect(() => { fetchTabCounts(); }, [fetchTabCounts]);

  useEffect(() => {
    let isMounted = true;

    const fetchWarehouses = async () => {
      try {
        const res = await WarehouseService.list({
          page: 1,
          limit: 200,
          ...(dataBranch?.value ? { branchId: Number(dataBranch.value) } : {}),
        });
        if (!isMounted || res.code !== 0) return;

        const items = Array.isArray(res.result)
          ? res.result
          : Array.isArray(res.result?.items)
            ? res.result.items
            : [];

        setWarehouseOptions(items.map((item: any) => ({
          value: Number(item.id),
          label: item.name ?? item.warehouseName ?? `Kho #${item.id}`,
        })));
      } catch {
        setWarehouseOptions([]);
      }
    };

    fetchWarehouses();

    return () => {
      isMounted = false;
    };
  }, [dataBranch]);

  // Refresh badge khi chuyển tab (để cập nhật sau khi tạo/xóa đơn)
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    fetchTabCounts();
  };

  // Modal states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [qrScanModalOpen, setQrScanModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerQuickAdd, setCustomerQuickAdd] = useState(false);
  // ── Loyalty wallet (tầng 3: hội viên) ────────────────────────────────────
  const [loyaltyWallet, setLoyaltyWallet] = useState<any | null>(null);

  // ── Khuyến mãi ───────────────────────────────────────────────────────────
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [eligiblePromos, setEligiblePromos] = useState<EligiblePromotion[]>([]);
  const [ineligiblePromos, setIneligiblePromos] = useState<IneligiblePromotion[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<EligiblePromotion | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);    // ← THÊM
  const [promoDiscount, setPromoDiscount] = useState(0);
  const checkPromoRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(1000);
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [moneyFromPoints, setMoneyFromPoints] = useState<number>(0);
  const [customerPhoneAdd, setCustomerPhoneAdd] = useState("");

  // Khi navigate từ "Tái tạo đơn" → tự động điền giỏ hàng + chuyển sang tab POS
  useEffect(() => {
    const state = location.state as { preloadCart?: CartItem[]; fromInvoiceCode?: string } | null;
    if (state?.preloadCart?.length) {
      setCartItems(state.preloadCart);
      setActiveTab("pos");
      showToast(
        `Đã tải lại ${state.preloadCart.length} sản phẩm từ đơn ${state.fromInvoiceCode ?? ""}`,
        "success"
      );
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Kiểm tra khuyến mãi (debounce 600ms) ────────────────────────────────
  const checkEligiblePromos = React.useCallback((items: CartItem[], cust: typeof customer) => {
    if (checkPromoRef.current) clearTimeout(checkPromoRef.current);
    checkPromoRef.current = setTimeout(async () => {
      const orderAmount = items.reduce((s, c) => s + c.price * c.qty, 0);
      if (orderAmount <= 0) { setEligiblePromos([]); setIneligiblePromos([]); return; }
      try {
        const res = await fetch(urlsApi.ma.promotionCheckEligible, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderAmount,
            customerId: cust ? Number(cust.id) : -1,
            cartItems: items.map(i => ({
              productId: Number(i.id), variantId: Number(i.variantId),
              qty: i.qty, price: i.price,
            })),
          }),
        });
        const json = await res.json();
        // if (json.code === 0 && json.result) {
        //   setEligiblePromos(json.result.eligible ?? []);
        //   setIneligiblePromos(json.result.ineligible ?? []);
        // }

        const eligible = json.result?.eligible ?? [];
        const ineligible = json.result?.ineligible ?? [];

        // ── MOCK DATA — xóa khi BE có dữ liệu thật ──────────────────────────
        const DEV_MOCK = true; // ← đổi thành false để tắt mock
        if (DEV_MOCK && eligible.length === 0) {
          setEligiblePromos([
            {
              id: 901,
              name: "Tặng ốp lưng khi mua iPhone",
              promotionType: 2,            // 2 = Quà tặng
              discountAmount: 0,
              gifts: [
                {
                  productId: 999, productName: "Ốp lưng iPhone 15 chính hãng",
                  avatar: "", unitName: "Cái", qty: 1
                },
              ],
            },
            {
              id: 902,
              name: "Giảm 10% đơn trên 15M",
              promotionType: 1,            // 1 = Giảm giá
              discountType: 1,             // 1 = %
              discount: 10,
              discountAmount: Math.round(orderAmount * 0.1),
              gifts: [],
            },
          ]);
          setIneligiblePromos([
            {
              id: 903,
              name: "Giảm 15% đơn VIP",
              promotionType: 1,
              discount: 15,
              discountType: 1,
              reason: "Khách hàng chưa đạt hạng Vàng (đang hạng Đồng)",
            },
          ]);
          return;
        }
        // ── END MOCK ─────────────────────────────────────────────────────────

        setEligiblePromos(eligible);
        setIneligiblePromos(ineligible);
      } catch {        
        // API chưa sẵn sàng — vẫn chạy mock để test UI
        const DEV_MOCK_FALLBACK = true;
        if (DEV_MOCK_FALLBACK) {
          const orderAmount = items.reduce((s, c) => s + c.price * c.qty, 0);
          setEligiblePromos([
            {
              id: 901,
              name: "Tặng ốp lưng khi mua iPhone",
              promotionType: 2,
              discountAmount: 0,
              gifts: [
                {
                  productId: 999, productName: "Ốp lưng iPhone 15 chính hãng",
                  avatar: "", unitName: "Cái", qty: 1
                },
              ],
            },
            {
              id: 902,
              name: "Giảm 10% đơn trên 15M",
              promotionType: 1, discountType: 1, discount: 10,
              discountAmount: Math.round(orderAmount * 0.1),
              gifts: [],
            },
          ]);
          setIneligiblePromos([
            {
              id: 903,
              name: "Giảm 15% đơn VIP",
              promotionType: 1, discount: 15, discountType: 1,
              reason: "Khách hàng chưa đạt hạng Vàng (đang hạng Đồng)",
            },
          ]);
        }
      }
    }, 600);
  }, []);

  // Cart actions
  const handleAddToCart = useCallback((item: Omit<CartItem, "qty"> & { qty: number }) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.variantId === item.variantId);
      const next = existing
        ? prev.map((c) => (c.variantId === item.variantId ? { ...c, qty: c.qty + item.qty } : c))
        : [...prev, { ...item, qty: item.qty }];
      checkEligiblePromos(next, customer);
      return next;
    });
  }, [customer, checkEligiblePromos]);

  const handleChangeQty = useCallback((id: string, delta: number) => {
    setCartItems((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0);
      checkEligiblePromos(next, customer);
      return next;
    });
  }, [customer, checkEligiblePromos]);

  const handleRemove = useCallback((id: string) => {
    setCartItems((prev) => {
      const next = prev.filter((c) => c.id !== id);
      checkEligiblePromos(next, customer);
      return next;
    });
  }, [customer, checkEligiblePromos]);

  // ── Fetch loyalty wallet khi chọn KH ─────────────────────────────────────
  const fetchLoyaltyWallet = useCallback(async (customerId: string | number) => {
    if (!customerId || Number(customerId) <= 0) {
      setLoyaltyWallet(null); setPointsToUse(0); setMoneyFromPoints(0);
      return;
    }
    try {
      const res = await fetch(`${urlsApi.ma.getWalletByCustomer}?customerId=${customerId}`);
      const json = await res.json();
      if (json.code === 0 && json.result?.isMember) {
        setLoyaltyWallet(json.result.wallet);
        setExchangeRate(json.result.exchangeRate ?? 1000);
      } else {
        setLoyaltyWallet(null);
      }
    } catch { setLoyaltyWallet(null); }
    setPointsToUse(0); setMoneyFromPoints(0);
  }, []);

  // Payment flow
  const handlePayConfirm = async (invoiceId: number | null) => {
    if (invoiceId) {
      try {
        const body = cartItems.map((item: CartItem) => ({
          productId: Number(item.id),
          variantId: Number(item.variantId),
          price: item.price,
          customerId: customer?.id ?? -1,
          qty: item.qty,
          name: item.name,
          avatar: item.avatar,
          unitName: item.unitName,
          ...(warehouseId ? { inventoryId: warehouseId } : {}),
        }));
        const totalDiscount = promoDiscount + moneyFromPoints;
        const paidInvoice = await BoughtProductService.insert(body, {
          invoiceId,
          ...(totalDiscount > 0 ? { moneyUsed: totalDiscount } : {}),
        });
        if (paidInvoice.code == 0) {
          if (method === "qr") {
            try {
              const qrCodeRes = await QrCodeProService.generate({
                content: "DON HANG " + invoiceId,
                orderId: invoiceId,
                amount: cartItems.reduce((s, c) => s + c.price * c.qty, 0) - couponDiscount - promoDiscount,
              });
              if (qrCodeRes.code === 0 && qrCodeRes?.result?.qrCode) {
                setPayModalOpen(false);
                setReceiptModalOpen(true);
                showToast("Tạo hoá đơn thành công.", "success");
                setQrCodePro(qrCodeRes.result.qrCode);
              } else {
                showToast(qrCodeRes.message || "Có lỗi xảy ra khi tạo QR Code Pro.", "error");
              }
            } catch {
              showToast("Có lỗi xảy ra khi tạo QR Code Pro.", "error");
            }
          } else {
            setPayModalOpen(false);
            setReceiptModalOpen(true);
            showToast("Tạo hoá đơn thành công.", "success");
            setQrCodePro(null);
            setMethod("cash");
            // Ghi nhận tiêu điểm nếu có
            if (moneyFromPoints > 0 && customer?.id && loyaltyWallet) {
              fetch(urlsApi.ma.fluctuatePoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customerId: Number(customer.id),
                  point: -pointsToUse,
                  description: `Tiêu điểm đơn hàng #${invoiceId}`,
                }),
              }).catch(() => undefined);
              setLoyaltyWallet(null); setPointsToUse(0); setMoneyFromPoints(0);
              setAppliedPromo(null); setPromoDiscount(0); setEligiblePromos([]);
            }
          }
          // Refresh badge sau khi tạo đơn thành công
          fetchTabCounts();
        } else {
          showToast(paidInvoice.message || "Có lỗi xảy ra khi xử lý thanh toán.", "error");
        }
      } catch {
        showToast("Có lỗi xảy ra khi xử lý thanh toán.", "error");
      }
    }
  };

  const handleConfirmOrder = useCallback(() => setOrderDetailModalOpen(false), []);

  const handleQrAddToCart = useCallback(() => {
    handleAddToCart({
      id: "1", icon: "🥛", name: "Sữa TH True Milk 1L", priceLabel: "32,000 ₫",
      price: 32000, unit: "hộp", qty: 1, variantId: "1",
    });
    setQrScanModalOpen(false);
  }, [handleAddToCart]);

  return (
    <div className="counter-sales">
      <Sidebar />

      <div className="counter-sales__main">
        <Topbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSync={() => setSyncModalOpen(true)}
          draftCount={draftCount}
          orderCount={orderCount}
          warehouses={warehouseOptions}
          warehouseId={warehouseId}
          onWarehouseChange={setWarehouseId}
        />

        <div className="counter-sales__content">
          {activeTab === "pos" && (
            <div className="counter-sales__screen counter-sales__screen--pos">
              <ProductGrid
                onAddToCart={handleAddToCart}
                onQrScan={() => setQrScanModalOpen(true)}
                warehouseId={warehouseId}
              />
              <Cart
                items={cartItems}
                onChangeQty={handleChangeQty}
                onRemove={handleRemove}
                setInvoiceDraftToPaid={setInvoiceDraftToPaid}
                onPay={(invoiceId) => { setInvoiceId(invoiceId); setPayModalOpen(true); }}
                onSelectCustomer={() => setCustomerModalOpen(true)}
                customer={customer || undefined}
                loyaltyWallet={loyaltyWallet}
                exchangeRate={exchangeRate}
                pointsToUse={pointsToUse}
                onPointsChange={(pts, money) => { setPointsToUse(pts); setMoneyFromPoints(money); }}
                eligiblePromoCount={eligiblePromos.length}
                appliedPromo={appliedPromo}
                promoDiscount={promoDiscount}
                onViewPromos={() => setPromoModalOpen(true)}
                onRemovePromo={() => { setAppliedPromo(null); setPromoDiscount(0); }}
                onCouponDiscountChange={setCouponDiscount}
                onSavedDraft={() => {
                  // Xóa giỏ hàng + refresh badge sau khi lưu tạm
                  setCartItems([]);
                  setCustomer(null);
                  fetchTabCounts();
                }}
              />
            </div>
          )}

          {activeTab === "draft" && (
            <div className="counter-sales__screen">
              <DraftOrders
                onContinue={(cartItemsFromDraft, draftLabel) => {
                  // Load thẳng cartItems vào giỏ, chuyển tab POS
                  // (không dùng navigate vì đang ở cùng route /create_sale_add)
                  if (cartItemsFromDraft.length > 0) {
                    setCartItems(cartItemsFromDraft);
                    showToast(
                      `Đã tải ${cartItemsFromDraft.length} sản phẩm từ ${draftLabel}`,
                      "success"
                    );
                  }
                  setActiveTab("pos");
                  fetchTabCounts();
                }}
                onDeleted={() => {
                  setDraftCount(prev => Math.max(0, prev - 1));
                  fetchTabCounts();
                }}
              />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="counter-sales__screen">
              <SaleInvoiceList />
            </div>
          )}

          {activeTab === "report" && (
            <div className="counter-sales__screen">
              <Report />
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <PayModal
        open={payModalOpen} cartItems={cartItems} invoiceId={invoiceId}
        method={method} setMethod={setMethod}
        couponDiscount={couponDiscount}
        promoDiscount={promoDiscount}
        onClose={() => { setInvoiceId(null); setPayModalOpen(false); }}
        onConfirm={(id) => handlePayConfirm(id)}
      />

      <ReceiptModal
        open={receiptModalOpen} cartItems={cartItems}
        customerId={customer?.id ?? -1} invoiceId={invoiceId ?? -1}
        invoiceDraft={invoiceDraftToPaid} method={method} qrCodePro={qrCodePro}
        couponDiscount={couponDiscount}
        promoDiscount={promoDiscount}
        onClose={() => {
          setCartItems([]); setCustomer(null); setInvoiceId(null);
          setReceiptModalOpen(false); setInvoiceDraftToPaid(null);
          setQrCodePro(null); setMethod("cash");
        }}
      />

      <OrderDetailModal
        open={orderDetailModalOpen} onClose={() => setOrderDetailModalOpen(false)}
        invoiceId={-1}
        onPrint={() => { setOrderDetailModalOpen(false); setReceiptModalOpen(true); }}
        onConfirm={handleConfirmOrder}
      />

      <QrScanModal open={qrScanModalOpen} onClose={() => setQrScanModalOpen(false)} onAdd={handleQrAddToCart} />
      <SyncModal open={syncModalOpen} onClose={() => setSyncModalOpen(false)} />

      {/* Khuyến mãi */}
      <PromotionModal
        open={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
        eligible={eligiblePromos}
        ineligible={ineligiblePromos}
        orderAmount={cartItems.reduce((s, c) => s + c.price * c.qty, 0)}
        customerName={customer?.name}
        onApply={(promo) => {
          setAppliedPromo(promo);
          setPromoDiscount(promo ? promo.discountAmount : 0);
        }}
      />

      <CustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSelect={(c) => {
          setCustomer(c);
          fetchLoyaltyWallet(c.id);
          checkEligiblePromos(cartItems, c);
        }}
        onSelectWalkIn={() => {
          // Set object "Khách vãng lai" thay vì null
          // → Cart hiển thị tường minh, không bị mơ hồ "Chọn khách hàng"
          setCustomer({
            id: "-1",
            name: "Khách vãng lai",
            initial: "👤",
            phone: "",
            points: 0,
            tier: "",
            color: "#64748b",
          });
          setLoyaltyWallet(null); setPointsToUse(0); setMoneyFromPoints(0);
          setCustomerModalOpen(false);
        }}
        onQuickAdd={(search) => { setCustomerQuickAdd(true); setCustomerPhoneAdd(search); }}
      />

      <AddCustomerPersonModal
        onShow={customerQuickAdd} phoneQuickAdd={customerPhoneAdd}
        onHide={(reload) => {
          if (reload) { setCustomerModalOpen(false); setTimeout(() => setCustomerModalOpen(true), 300); }
          setCustomerQuickAdd(false); setCustomerPhoneAdd("");
        }}
      />
    </div>
  );
};

export default CounterSales;