import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./index.scss";

import Sidebar from "@/components/sidebar/sidebar";
import Topbar from "./components/Topbar";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import Report from "./components/Report";
import { CartItem, Customer, PayMethod, TabType, ShippingInfo } from "./types";

const DEFAULT_SHIPPING_INFO: ShippingInfo = {
  receiverName: "", receiverPhone: "", receiverAddress: "",
  receiverProvince: "", shippingFee: 0,
  shippingFeeBearer: "RECEIVER", codAmount: 0,
};
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
import { IStorePaymentConfigResponse } from "model/paymentMethod/PaymentMethodModel";
import { useOnboarding } from "hooks/useOnboarding";
import TourOverlay from "components/tourOverlay/TourOverlay";
import DraftOrders from "./components/DraftOrders";
import SaleInvoiceList from "../Sell/SaleInvoiceList/SaleInvoiceList";
import { urlsApi } from "configs/urls";
import PromotionModal, { EligiblePromotion, IneligiblePromotion } from "./components/modals/PromotionModal";
import { ContextType, UserContext } from "contexts/userContext";
import WarehouseService from "@/services/WarehouseService";
import { IOption } from "@/model/OtherModel";
import FixedPriceService from "@/services/FixedPriceService";
import { IFixedPriceEntry } from "model/promotion/PromotionModel";

const INITIAL_CART: CartItem[] = [];

const CounterSales: React.FC = () => {
  document.title = "Bán hàng tại quầy";
  const location = useLocation();
  const { dataBranch, id: userId } = React.useContext(UserContext) as ContextType;

  // ── Tour hướng dẫn POS ───────────────────────────────────────────────────
  const posTour = useOnboarding({
    userId:    userId ?? "guest",
    tourId:    "pos",
    autoStart: true,
  });

  const [activeTab, setActiveTab] = useState<TabType>("pos");
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [invoiceDraftToPaid, setInvoiceDraftToPaid] = useState<any>(null);
  /** invoiceId (string) của đơn tạm đang được xử lý — xóa sau khi thanh toán thành công */
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [method, setMethod] = useState<PayMethod>("cash");
  const [qrCodePro, setQrCodePro] = useState<string | null>(null);
  const [activePayConfig, setActivePayConfig] = useState<IStorePaymentConfigResponse | null>(null);

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

  // ── Load fixed price map khi chi nhánh thay đổi ──────────────────────────
  // Build Map<"productId" | "productId-variantId", IFixedPriceEntry>
  // POS dùng để override giá khi thêm SP vào giỏ
  useEffect(() => {
    if (!dataBranch?.value) return;
    FixedPriceService.getActiveEntries()
      .then((res) => {
        if (res.code !== 0 || !res.result) return;
        const map = new Map<string, IFixedPriceEntry>();
        res.result.forEach((entry) => {
          // Key theo variantId nếu có, fallback theo productId
          if (entry.variantId) {
            map.set(`${entry.productId}-${entry.variantId}`, entry);
          }
          // Luôn đặt key theo productId (variantId = null = tất cả variant)
          if (!map.has(String(entry.productId))) {
            map.set(String(entry.productId), entry);
          }
        });
        setFixedPriceMap(map);
      })
      .catch(() => setFixedPriceMap(new Map()));
  }, [dataBranch]);

  // Refresh badge khi chuyển tab (để cập nhật sau khi tạo/xóa đơn)
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    fetchTabCounts();
  };

  // Modal states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [paymentSuccessCount, setPaymentSuccessCount] = useState(0);
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

  // ── Fixed price lookup map ────────────────────────────────────────────────
  // key: "productId" hoặc "productId-variantId" → fixedPrice (VND)
  const [fixedPriceMap, setFixedPriceMap] = useState<Map<string, IFixedPriceEntry>>(new Map());
  const [couponDiscount, setCouponDiscount] = useState(0);    // ← THÊM
  const [manualDiscount, setManualDiscount] = useState(0);    // ← giảm giá thủ công
  const [orderNote, setOrderNote]           = useState("");    // ← ghi chú đơn hàng
  const [promoDiscount, setPromoDiscount] = useState(0);

  // ── Loại đơn & thông tin giao hàng ────────────────────────────────────────
  const [orderType, setOrderType] = useState<import("./types").OrderType>("retail");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(DEFAULT_SHIPPING_INFO);
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
    // Kiểm tra đồng giá: ưu tiên variantId, fallback productId
    const fpEntry =
      fixedPriceMap.get(`${item.id}-${item.variantId}`) ??
      fixedPriceMap.get(String(item.id));

    const effectiveItem = fpEntry
      ? {
          ...item,
          price:      fpEntry.fixedPrice,
          // Gắn badge để Cart hiển thị nhãn "Đồng giá"
          fixedPrice: fpEntry.fixedPrice,
          promoName:  fpEntry.promotionName,
        }
      : item;

    setCartItems((prev) => {
      const existing = prev.find((c) => c.variantId === effectiveItem.variantId);
      const next = existing
        ? prev.map((c) =>
            c.variantId === effectiveItem.variantId
              ? { ...c, qty: c.qty + effectiveItem.qty }
              : c
          )
        : [...prev, { ...effectiveItem, qty: effectiveItem.qty }];
      checkEligiblePromos(next, customer);
      return next;
    });
  }, [customer, checkEligiblePromos, fixedPriceMap]);

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

  // ── Trừ điểm sau khi đơn hàng hoàn thành ───────────────────────────────────
  // Gọi sau khi invoiceId đã có (cash và qr đều dùng chung)
  const redeemLoyaltyPoints = (invoiceId: number | null) => {
    if (!(moneyFromPoints > 0 && customer?.id && loyaltyWallet && invoiceId)) return;
    fetch(urlsApi.ma.fluctuatePoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: Number(customer.id),
        point: -pointsToUse,
        description: `Tiêu điểm đơn hàng #${invoiceId}`,
      }),
    }).catch(() => undefined);
    // Reset loyalty state
    setLoyaltyWallet(null);
    setPointsToUse(0);
    setMoneyFromPoints(0);
    setAppliedPromo(null);
    setPromoDiscount(0);
    setEligiblePromos([]);
  };

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
          // ── Nếu là đơn ship → tạo shipment sau khi invoice thành công ──────
          if (orderType === "ship" && shippingInfo.receiverName) {
            try {
              await fetch(urlsApi.shipping.create, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId:    invoiceId,
                  orderCode:  String(invoiceId),
                  receiverName:    shippingInfo.receiverName,
                  receiverPhone:   shippingInfo.receiverPhone,
                  receiverAddress: shippingInfo.receiverAddress,
                  shippingFee:     shippingInfo.shippingFeeBearer === "RECEIVER" ? shippingInfo.shippingFee : 0,
                  codAmount:       shippingInfo.codAmount,
                  noteForShipper:  shippingInfo.noteForShipper ?? "",
                  shippingFeeBearer: shippingInfo.shippingFeeBearer,
                  // Tổng tiền hàng để tham chiếu
                  totalAmount: cartItems.reduce((s, c) => s + c.price * c.qty, 0),
                }),
              });
              // Không block UI nếu tạo shipment lỗi — log lặng
            } catch { /* shipment tạo sau cũng được */ }
          }

          if (method === "qr") {
            try {
              const qrCodeRes = await QrCodeProService.generate({
                content: "DON HANG " + invoiceId,
                orderId: invoiceId,
                amount: cartItems.reduce((s, c) => s + c.price * c.qty, 0) - couponDiscount - promoDiscount - manualDiscount,
              });
              if (qrCodeRes.code === 0 && qrCodeRes?.result?.qrCode) {
                setPayModalOpen(false);
                setReceiptModalOpen(true);
                showToast("Tạo hoá đơn thành công.", "success");
                setQrCodePro(qrCodeRes.result.qrCode);
                redeemLoyaltyPoints(invoiceId);
              } else {
                showToast(qrCodeRes.message || "Có lỗi xảy ra khi tạo QR Code Pro.", "error");
              }
            } catch {
              showToast("Có lỗi xảy ra khi tạo QR Code Pro.", "error");
            }
          } else {
            setPayModalOpen(false);
            setReceiptModalOpen(true);
            showToast(orderType === "ship" ? "Tạo đơn giao hàng thành công." : "Tạo hoá đơn thành công.", "success");
            setQrCodePro(null);
            setMethod("cash");
            redeemLoyaltyPoints(invoiceId);
          }
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

  const handleQrAddToCart = useCallback((item: {
    id: string; variantId: string; name: string;
    price: number; priceLabel: string; unit: string;
    unitName: string; icon: string; qty: number;
  }) => {
    handleAddToCart({
      id: item.id, variantId: item.variantId, name: item.name,
      price: item.price, priceLabel: item.priceLabel,
      unit: item.unit, unitName: item.unitName, icon: item.icon, qty: 1,
    });
    setQrScanModalOpen(false);
  }, [handleAddToCart]);

  return (
    <div className="counter-sales">
      {/* ── Tour hướng dẫn POS ── */}
      <TourOverlay
        active={posTour.active}
        step={posTour.currentStep}
        stepIdx={posTour.stepIdx}
        totalSteps={posTour.totalSteps}
        target={posTour.target}
        isFirst={posTour.isFirst}
        isLast={posTour.isLast}
        onNext={posTour.next}
        onPrev={posTour.prev}
        onSkip={posTour.skip}
      />

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
          onStartTour={posTour.start}
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
                orderType={orderType}
                onOrderTypeChange={(t) => {
                  setOrderType(t);
                  if (t !== "ship") setShippingInfo(DEFAULT_SHIPPING_INFO);
                }}
                shippingInfo={shippingInfo}
                onShippingInfoChange={setShippingInfo}
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
                onManualDiscountChange={setManualDiscount}
                note={orderNote}
                onNoteChange={setOrderNote}
                onResetVoucher={paymentSuccessCount > 0 ? () => {} : undefined}
                onSavedDraft={() => {
                  setCartItems([]);
                  setCustomer(null);
                  setShippingInfo(DEFAULT_SHIPPING_INFO);
                  setOrderType("retail");
                  fetchTabCounts();
                }}
              />
            </div>
          )}

          {activeTab === "draft" && (
            <div className="counter-sales__screen">
              <DraftOrders
                onContinue={(cartItemsFromDraft, draftLabel, draftId) => {
                  // Load thẳng cartItems vào giỏ, chuyển tab POS
                  // (không dùng navigate vì đang ở cùng route /create_sale_add)
                  if (cartItemsFromDraft.length > 0) {
                    setCartItems(cartItemsFromDraft);
                    // Lưu lại draftId để xóa đơn tạm sau khi thanh toán thành công
                    setActiveDraftId(draftId ?? null);
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
        promoDiscount={promoDiscount + manualDiscount}
        shippingFee={orderType === "ship" ? shippingInfo.shippingFee : 0}
        shippingFeeBearer={shippingInfo.shippingFeeBearer}
        onClose={() => { setInvoiceId(null); setPayModalOpen(false); }}
        onConfirm={(id) => handlePayConfirm(id)}
        onConfigChange={setActivePayConfig}
      />

      <ReceiptModal
        open={receiptModalOpen} cartItems={cartItems}
        customerId={customer?.id ?? -1} invoiceId={invoiceId ?? -1}
        invoiceDraft={invoiceDraftToPaid} method={method} qrCodePro={qrCodePro}
        couponDiscount={couponDiscount}
        promoDiscount={promoDiscount + manualDiscount}
        note={orderNote}
        onPaymentSuccess={() => {
          setCouponDiscount(0);
          setPromoDiscount(0);
          setAppliedPromo(null);
          setManualDiscount(0);
          setOrderNote("");
          setShippingInfo(DEFAULT_SHIPPING_INFO);
          setOrderType("retail");
          setPaymentSuccessCount(prev => prev + 1);
          // Tự động xóa đơn tạm nếu đơn này được tải từ tab Đơn tạm
          if (activeDraftId) {
            fetch(`${urlsApi.invoice.draftDelete}?id=${activeDraftId}`, { method: "DELETE" })
              .then((r) => r.json())
              .then((json) => {
                if (json.code === 0) {
                  setActiveDraftId(null);
                  fetchTabCounts(); // Refresh badge số đơn tạm trên Topbar
                }
              })
              .catch(() => {});
          }
        }}
        onClose={() => {
          setCartItems([]); setCustomer(null); setInvoiceId(null);
          setReceiptModalOpen(false); setInvoiceDraftToPaid(null);
          setQrCodePro(null); setMethod("cash");
          setManualDiscount(0);
          setOrderNote("");
          setShippingInfo(DEFAULT_SHIPPING_INFO);
          setOrderType("retail");
        }}
      />

      <OrderDetailModal
        open={orderDetailModalOpen} onClose={() => setOrderDetailModalOpen(false)}
        invoiceId={-1}
        onPrint={() => { setOrderDetailModalOpen(false); setReceiptModalOpen(true); }}
        onConfirm={handleConfirmOrder}
      />

      <QrScanModal open={qrScanModalOpen} onClose={() => setQrScanModalOpen(false)} onAddToCart={handleQrAddToCart} />
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