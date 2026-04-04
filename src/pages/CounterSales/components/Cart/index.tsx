import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CartItem, Customer, OrderType, ShippingInfo } from "../../types";
import "./index.scss";
import InvoiceService from "@/services/InvoiceService";
import BoughtProductService from "@/services/BoughtProductService";
import CouponService from "@/services/CouponService";
import ShippingFeeConfigService from "@/services/ShippingFeeConfigService";
import { showToast } from "utils/common";
import { urlsApi } from "configs/urls";

interface CartProps {
  items: CartItem[];
  onChangeQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onPay: (invoiceId: number) => void;
  onSelectCustomer: () => void;
  customer?: Customer;
  setInvoiceDraftToPaid: (invoice: any) => void;
  onSavedDraft?: () => void;
  // ── Loại đơn & ship ──────────────────────────────────────────────────────
  orderType: OrderType;
  onOrderTypeChange: (t: OrderType) => void;
  shippingInfo: ShippingInfo;
  onShippingInfoChange: (info: ShippingInfo) => void;
  // ── Loyalty ──────────────────────────────────────────────────────────────
  loyaltyWallet?: { currentBalance: number; segmentName?: string } | null;
  exchangeRate?: number;
  pointsToUse?: number;
  onPointsChange?: (points: number, moneyValue: number) => void;
  // ── Khuyến mãi ───────────────────────────────────────────────────────────
  eligiblePromoCount?: number;
  appliedPromo?: { id: number; name: string; discountAmount: number; promotionType: number; gifts?: any[] } | null;
  promoDiscount?: number;
  onViewPromos?: () => void;
  onRemovePromo?: () => void;
  onCouponDiscountChange?: (discount: number) => void;
  onManualDiscountChange?: (discount: number) => void;
  onResetVoucher?: () => void;
  // ── Ghi chú ──────────────────────────────────────────────────────────────
  note?: string;
  onNoteChange?: (note: string) => void;
}

const Cart: React.FC<CartProps> = ({
  items, onChangeQty, onRemove, onPay,
  onSelectCustomer, customer,
  setInvoiceDraftToPaid, onSavedDraft,
  orderType, onOrderTypeChange, shippingInfo, onShippingInfoChange,
  loyaltyWallet, exchangeRate = 1000, pointsToUse = 0, onPointsChange,
  eligiblePromoCount = 0, appliedPromo, promoDiscount = 0,
  onViewPromos, onRemovePromo, onCouponDiscountChange, onManualDiscountChange, onResetVoucher,
  note = "", onNoteChange,
}) => {
  const { t } = useTranslation();
  const [voucher, setVoucher]   = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggestingFee, setIsSuggestingFee] = useState(false);

  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponDiscount, setCouponDiscount]     = useState(0);
  const [couponMessage, setCouponMessage]       = useState("");
  const [couponError, setCouponError]           = useState("");

  // draft qty: lưu giá trị đang nhập tạm theo itemId
  const [qtyDraft, setQtyDraft] = useState<Record<string, string>>({});

  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCouponDiscountChange = (discount: number) => {
    setCouponDiscount(discount);
    onCouponDiscountChange?.(discount);
  };

  const subtotal  = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.length;
  const formatVND = (n: number) => n ? n.toLocaleString("vi") + " ₫" : "0 ₫";

  const isShipOrder = orderType === "ship";

  // ── Tính tổng ─────────────────────────────────────────────────────────────
  const isLoyaltyMember = !!loyaltyWallet;
  const maxPoints       = isLoyaltyMember
    ? Math.min(loyaltyWallet!.currentBalance, Math.floor(subtotal / exchangeRate))
    : 0;
  const moneyFromPoints = (pointsToUse ?? 0) * exchangeRate;
  const shippingFee     = isShipOrder ? (shippingInfo.shippingFee ?? 0) : 0;

  const finalTotal = Math.max(
    0,
    subtotal
    - moneyFromPoints
    - promoDiscount
    - couponDiscount
    + shippingFee,   // phí ship CỘNG vào (thu của khách)
  );

  // ── Gợi ý phí ship khi province thay đổi ─────────────────────────────────
  const suggestShippingFee = async (province: string) => {
    if (!province.trim()) return;
    setIsSuggestingFee(true);
    try {
      const res = await ShippingFeeConfigService.suggest({
        provinceName: province,
        orderValue: subtotal,
      });
      if (res?.code === 0 && res?.result != null) {
        onShippingInfoChange({ ...shippingInfo, receiverProvince: province, shippingFee: res.result });
      }
    } catch {
      // gợi ý thất bại → không thay đổi giá trị
    } finally {
      setIsSuggestingFee(false);
    }
  };

  // Debounce suggest khi gõ tỉnh
  const handleProvinceChange = (province: string) => {
    onShippingInfoChange({ ...shippingInfo, receiverProvince: province });
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => suggestShippingFee(province), 600);
  };

  // Gợi ý lại khi subtotal thay đổi (nếu đã có tỉnh)
  useEffect(() => {
    if (isShipOrder && shippingInfo.receiverProvince?.trim()) {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
      suggestTimer.current = setTimeout(() => suggestShippingFee(shippingInfo.receiverProvince), 400);
    }
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
  }, [subtotal, isShipOrder]);

  useEffect(() => {
    const handleReset = () => {
      setVoucher(""); setCouponDiscount(0); setCouponMessage(""); setCouponError("");
    };
    if (onResetVoucher) handleReset();
  }, [onResetVoucher]);

  // ── Coupon ────────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = voucher.trim();
    if (!code) return;
    setIsApplyingCoupon(true);
    setCouponError(""); setCouponMessage("");
    try {
      const res = await CouponService.apply(code, subtotal);
      const payload = (res as any)?.result ?? (res as any)?.data ?? res;
      let calcDiscount = 0;
      if (typeof payload?.discountAmount === "number" && payload.discountAmount > 0) {
        calcDiscount = payload.discountAmount;
      } else if (typeof payload?.finalAmount === "number" && typeof payload?.orderAmount === "number") {
        calcDiscount = Math.max(0, payload.orderAmount - payload.finalAmount);
      }
      const hasError = payload?.error || (res as any)?.success === false;
      if (hasError) {
        handleCouponDiscountChange(0);
        setCouponError(payload?.message ?? t("pageCounterSales.voucherInvalid"));
      } else if (payload?.code || (res as any)?.success === true) {
        handleCouponDiscountChange(calcDiscount);
        setCouponMessage(calcDiscount > 0
          ? (payload?.message ?? `${t("pageCounterSales.voucherSuccess")} − ${calcDiscount.toLocaleString("vi")} đ`)
          : (payload?.message ?? `${t("pageCounterSales.voucherSuccess")} ✓`));
      } else {
        handleCouponDiscountChange(0);
        setCouponError(t("pageCounterSales.voucherInvalid"));
      }
    } catch {
      handleCouponDiscountChange(0);
      setCouponError(t("pageCounterSales.voucherConnectionError"));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // ── Tạo đơn ──────────────────────────────────────────────────────────────
  const onCreateInvoice = async () => {
    if (isShipOrder) {
      if (!shippingInfo.receiverName?.trim()) { showToast(t("pageCounterSales.requireReceiverName"), "warning"); return; }
      if (!shippingInfo.receiverPhone?.trim()) { showToast(t("pageCounterSales.requireReceiverPhone"), "warning"); return; }
      if (!shippingInfo.receiverAddress?.trim()) { showToast(t("pageCounterSales.requireReceiverAddress"), "warning"); return; }
    }
    try {
      const invoice = await InvoiceService.createInvoice({
        customerId: customer?.id ?? -1,
        ...(note?.trim() ? { note: note.trim() } : {}),
      });
      if (invoice.code === 0 && invoice?.result?.invoiceId) {
        setInvoiceDraftToPaid(invoice.result.invoice);
        onPay(invoice.result.invoiceId);
      } else {
        showToast(invoice.message ?? t("pageCounterSales.createOrderFailed"), "error");
      }
    } catch {
      showToast(t("pageCounterSales.createOrderFailed"), "error");
    }
  };

  const onSaveDraft = async () => {
    if (items.length === 0) { showToast(t("pageCounterSales.emptyCart"), "error"); return; }
    setIsSaving(true);
    try {
      const draftRes = await InvoiceService.createInvoice({
        customerId: Number(customer?.id ?? -1),
        ...(note?.trim() ? { note: note.trim() } : {}),
      });
      if (draftRes.code !== 0 || !draftRes?.result?.invoiceId) {
        showToast(draftRes.message ?? t("pageCounterSales.draftSaveFailed"), "error");
        return;
      }
      const invoiceId: number = draftRes.result.invoiceId;
      const body = items.map((item) => ({
        productId: Number(item.id), variantId: Number(item.variantId),
        price: item.price, customerId: Number(customer?.id ?? -1),
        qty: item.qty, name: item.name, avatar: item.avatar ?? "",
        unitName: item.unitName ?? item.unit ?? "", fee: item.price * item.qty,
      }));
      const insertRes = await BoughtProductService.insert(body, { invoiceId });
      if (insertRes.code !== 0) {
        await fetch(`${urlsApi.invoice.draftDelete}?id=${invoiceId}`, { method: "DELETE" });
        showToast(insertRes.message ?? t("pageCounterSales.draftProductFailed"), "error");
        return;
      }
      showToast(`${t("pageCounterSales.draftSaved")} (${items.length} ${t("common.product")})`, "success");
      onSavedDraft?.();
    } catch {
      showToast(t("common.error"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const ORDER_TYPES: { id: OrderType; labelKey: string }[] = [
    { id: "retail", labelKey: "pageCounterSales.retail" },
    { id: "wholesale", labelKey: "pageCounterSales.wholesale" },
    { id: "ship", labelKey: "pageCounterSales.ship" },
  ];

  return (
    <div className="cart">
      <div className="cart__header">
        <div className="cart__header-top">
          <div className="cart__title">🛒 {t("pageCounterSales.cart")}</div>
          <div className="order-type">
            {ORDER_TYPES.map((ot) => (
              <button key={ot.id} className={`ot${orderType === ot.id ? " active" : ""}`}
                onClick={() => onOrderTypeChange(ot.id)}>{t(ot.labelKey)}</button>
            ))}
          </div>
        </div>
        <div className="cust-box cust-box--filled" onClick={onSelectCustomer}>
          {customer ? (
            <>
              <div className="cust-av" style={{ background: customer.color }}>
                {customer.id === "-1" ? "👤" : customer.initial}
              </div>
              <div className="cust-info">
                <div className="cust-name">{customer.name}</div>
                {customer.id === "-1" ? (
                  <div className="cust-pts" style={{ color: "var(--muted)" }}>{t("pageCounterSales.noCustomerInfo")}</div>
                ) : (
                  <div className="cust-pts">
                    ⭐ {(customer.points || 0).toLocaleString("vi")} {t("pageCounterSales.loyaltyPoints")} · {t("pageCounterSales.tier")} {customer.tier}
                    {isLoyaltyMember && loyaltyWallet!.segmentName && (
                      <span style={{ color: "var(--lime-d)", marginLeft: 4 }}>· {loyaltyWallet!.segmentName}</span>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="cust-placeholder"><p>{t("pageCounterSales.chooseCustomer")}</p></div>
          )}
        </div>
      </div>

      <div className="cart__items">
        {items.length === 0 && <div className="cart__empty"><span>🛒</span><p>{t("pageCounterSales.cartEmpty")}</p></div>}
        {items.map((item) => (
          <div key={item.id} className="ci">
            <div className="ci__icon">
              {item.image ? <img src={item.image} alt={item.name} /> : <span style={{ fontSize: "30px" }}>{item.icon}</span>}
            </div>
            <div className="ci__info">
              <div className="ci__name">
                {item.name}
                {item.fixedPrice && (
                  <span style={{
                    marginLeft: 6, fontSize: 10, fontWeight: 700,
                    background: "#6366f1", color: "#fff",
                    padding: "1px 6px", borderRadius: 99,
                    verticalAlign: "middle",
                  }}>
                    Đồng giá
                  </span>
                )}
              </div>
              <div className="ci__price">{formatVND(item.price)}/{item.unitName || item.unit}</div>
            </div>
            <div className="ci__qty">
              <button className="qb" onClick={() => onChangeQty(item.id, -1)}>−</button>
              <input
                type="number"
                className="qi"
                value={qtyDraft[item.id] !== undefined ? qtyDraft[item.id] : item.qty}
                min={1}
                onFocus={() => setQtyDraft(prev => ({ ...prev, [item.id]: String(item.qty) }))}
                onChange={(e) => {
                  const raw = e.target.value;
                  setQtyDraft(prev => ({ ...prev, [item.id]: raw }));
                  const v = Number(raw);
                  if (raw !== "" && v >= 1) {
                    onChangeQty(item.id, v - item.qty);
                  }
                  // nếu trống hoặc 0: chỉ cập nhật draft, không gọi onChangeQty
                }}
                onBlur={() => {
                  const raw = qtyDraft[item.id];
                  const v = Number(raw);
                  if (!raw || v < 1) {
                    // reset về 1 nếu bỏ trống hoặc nhập 0
                    onChangeQty(item.id, 1 - item.qty);
                  }
                  setQtyDraft(prev => { const n = { ...prev }; delete n[item.id]; return n; });
                }}
              />
              <button className="qb" onClick={() => onChangeQty(item.id, 1)}>+</button>
            </div>
            {(() => {
              const draft = qtyDraft[item.id];
              const displayQty = draft !== undefined ? Math.max(0, Number(draft) || 0) : item.qty;
              return <div className="ci__total">{formatVND(item.price * displayQty)}</div>;
            })()}
            <button className="del-btn" onClick={() => onRemove(item.id)}>✕</button>
          </div>
        ))}
      </div>

      <div className="cart__footer">

        {/* ══ Ship section ══════════════════════════════════════════════════ */}
        {isShipOrder && (
          <div className="ship-section">
            <div className="ship-section__title">🚚 {t("pageCounterSales.shippingTitle")}</div>

            {/* Tên người nhận */}
            <div className="ship-section__row">
              <div className="ship-section__label">{t("pageCounterSales.receiverName")} *</div>
              <input className="ship-section__input"
                placeholder={t("pageCounterSales.receiverNamePlaceholder")}
                value={shippingInfo.receiverName}
                onChange={e => onShippingInfoChange({ ...shippingInfo, receiverName: e.target.value })}
              />
            </div>

            {/* SĐT */}
            <div className="ship-section__row">
              <div className="ship-section__label">{t("pageCounterSales.receiverPhone")} *</div>
              <input className="ship-section__input"
                placeholder={t("pageCounterSales.receiverPhonePlaceholder")}
                value={shippingInfo.receiverPhone}
                onChange={e => onShippingInfoChange({ ...shippingInfo, receiverPhone: e.target.value })}
              />
            </div>

            {/* Tỉnh/Thành → gợi ý phí ship */}
            <div className="ship-section__row">
              <div className="ship-section__label">{t("pageCounterSales.receiverProvince")}</div>
              <input className="ship-section__input"
                placeholder={t("pageCounterSales.receiverProvincePlaceholder")}
                value={shippingInfo.receiverProvince}
                onChange={e => handleProvinceChange(e.target.value)}
              />
            </div>

            {/* Địa chỉ chi tiết */}
            <div className="ship-section__row">
              <div className="ship-section__label">{t("pageCounterSales.receiverAddress")} *</div>
              <input className="ship-section__input"
                placeholder={t("pageCounterSales.receiverAddressPlaceholder")}
                value={shippingInfo.receiverAddress}
                onChange={e => onShippingInfoChange({ ...shippingInfo, receiverAddress: e.target.value })}
              />
            </div>

            {/* Phí ship + nút gợi ý */}
            <div className="ship-section__row">
              <div className="ship-section__label">
                {t("pageCounterSales.shippingFeeLabel")}
                {isSuggestingFee && <span style={{ fontSize: "1rem", color: "#0369a1", marginLeft: 6 }}>⏳ {t("pageCounterSales.shippingCalculating")}</span>}
              </div>
              <div className="ship-section__fee-row">
                <input
                  className="ship-section__fee-input"
                  type="number" min={0} step={1000}
                  value={shippingInfo.shippingFee}
                  onChange={e => onShippingInfoChange({ ...shippingInfo, shippingFee: Number(e.target.value) || 0 })}
                />
                <span className="ship-section__fee-unit">đ</span>
                <button
                  className="ship-section__suggest-btn"
                  disabled={isSuggestingFee || !shippingInfo.receiverProvince?.trim()}
                  onClick={() => suggestShippingFee(shippingInfo.receiverProvince)}
                  title={t("pageCounterSales.shippingRecalculate")}
                >
                  {t("pageCounterSales.shippingRecalculate")}
                </button>
              </div>
            </div>

            {/* Bên trả phí ship */}
            <div className="ship-section__row">
              <div className="ship-section__label">{t("pageCounterSales.shippingBearer")}</div>
              <div className="ship-section__bearer">
                <button
                  className={`ship-section__bearer-btn${shippingInfo.shippingFeeBearer === "RECEIVER" ? " active" : ""}`}
                  onClick={() => onShippingInfoChange({ ...shippingInfo, shippingFeeBearer: "RECEIVER" })}
                >
                  {t("pageCounterSales.shippingReceiver")}
                </button>
                <button
                  className={`ship-section__bearer-btn${shippingInfo.shippingFeeBearer === "SENDER" ? " active" : ""}`}
                  onClick={() => onShippingInfoChange({ ...shippingInfo, shippingFeeBearer: "SENDER" })}
                >
                  {t("pageCounterSales.shippingSender")}
                </button>
              </div>
            </div>

            {/* COD */}
            <label className="ship-section__cod-toggle">
              <input
                type="checkbox"
                checked={shippingInfo.codAmount > 0}
                onChange={e => onShippingInfoChange({
                  ...shippingInfo,
                  codAmount: e.target.checked ? finalTotal : 0,
                })}
              />
              {t("pageCounterSales.codLabel")} ({formatVND(finalTotal)})
            </label>
            {shippingInfo.codAmount > 0 && (
              <div className="ship-section__row">
                <div className="ship-section__label">{t("pageCounterSales.codAmount")}</div>
                <div className="ship-section__fee-row">
                  <input
                    className="ship-section__fee-input"
                    type="number" min={0} step={1000}
                    value={shippingInfo.codAmount}
                    onChange={e => onShippingInfoChange({ ...shippingInfo, codAmount: Number(e.target.value) || 0 })}
                  />
                  <span className="ship-section__fee-unit">đ</span>
                </div>
              </div>
            )}

            {/* Ghi chú giao hàng */}
            <div className="ship-section__row">
              <div className="ship-section__label">{t("pageCounterSales.shipperNote")}</div>
              <input className="ship-section__input"
                placeholder={t("pageCounterSales.shipperNotePlaceholder")}
                value={shippingInfo.noteForShipper ?? ""}
                onChange={e => onShippingInfoChange({ ...shippingInfo, noteForShipper: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Voucher */}
        <div className="voucher-row">
          <input type="text" placeholder={`🏷️ ${t("pageCounterSales.voucherPlaceholder")}`}
            value={voucher}
            onChange={e => { setVoucher(e.target.value); handleCouponDiscountChange(0); setCouponMessage(""); setCouponError(""); }}
            onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
          />
          <button className="btn btn--outline btn--sm"
            onClick={handleApplyCoupon} disabled={isApplyingCoupon || !voucher.trim()}>
            {isApplyingCoupon ? t("pageCounterSales.voucherApplying") : t("pageCounterSales.voucherApply")}
          </button>
        </div>
        {couponMessage && <div style={{ fontSize: 11, color: "#3B6D11", marginTop: 4, paddingLeft: 2 }}>✓ {couponMessage}</div>}
        {couponError   && <div style={{ fontSize: 11, color: "var(--red,#e53e3e)", marginTop: 4, paddingLeft: 2 }}>✕ {couponError}</div>}

        {/* Summary */}
        <div className="summary">
          <div className="sr">
            <span className="sr__k">{t("pageCounterSales.subtotal")} ({itemCount} {t("common.product")})</span>
            <span className="sr__v">{formatVND(subtotal)}</span>
          </div>

          <div className="sr">
            <span className="sr__k">{t("pageCounterSales.voucherDiscount")}</span>
            <span className="sr__v sr__v--red">
              {couponDiscount > 0 ? `−${couponDiscount.toLocaleString("vi")} ₫` : "0 ₫"}
            </span>
          </div>

          {/* Banner KM */}
          {!appliedPromo && eligiblePromoCount > 0 && (
            <div onClick={onViewPromos} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
              background: "#EAF3DE", borderRadius: "0.6rem", cursor: "pointer",
              marginBottom: 6, marginTop: 2,
            }}>
              <span style={{ fontSize: 12, color: "#3B6D11", fontWeight: 600, flex: 1 }}>
                {eligiblePromoCount} {t("pageCounterSales.promoMatchCount")}
              </span>
              <span style={{ fontSize: 11, background: "#3B6D11", color: "#fff", padding: "2px 8px", borderRadius: "0.4rem" }}>
                {t("pageCounterSales.promoViewNow")}
              </span>
            </div>
          )}

          {appliedPromo && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 10px",
              background: "#EAF3DE", borderRadius: "0.6rem", marginBottom: 6, marginTop: 2,
            }}>
              <span style={{ flex: 1, fontSize: 12, color: "#3B6D11", fontWeight: 600 }}>{appliedPromo.name}</span>
              <button onClick={onRemovePromo} style={{ background: "none", border: "none", color: "#3B6D11", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
            </div>
          )}

          <div className="sr">
            <span className="sr__k">{t("pageCounterSales.promotion")}</span>
            <span className="sr__v" style={{ color: promoDiscount > 0 ? "#3B6D11" : undefined }}>
              {promoDiscount > 0 ? `−${promoDiscount.toLocaleString("vi")} ₫` : "0 ₫"}
            </span>
          </div>

          {/* Phí ship — chỉ hiện khi orderType === ship */}
          {isShipOrder && (
            <div className="sr">
              <span className="sr__k">
                {t("pageCounterSales.shippingFee")}
                {shippingInfo.shippingFeeBearer === "SENDER"
                  ? <span style={{ fontSize: "1rem", color: "#6b7280", marginLeft: 4 }}>({t("pageCounterSales.shippingSender")})</span>
                  : null}
              </span>
              <span className="sr__v sr__v--ship">
                {shippingInfo.shippingFeeBearer === "SENDER"
                  ? t("pageCounterSales.freeShipping")
                  : `+${shippingFee.toLocaleString("vi")} ₫`}
              </span>
            </div>
          )}

          {/* Điểm tích lũy */}
          {isLoyaltyMember ? (
            <div className="sr" style={{ alignItems: "flex-start", gap: 4 }}>
              <span className="sr__k" style={{ paddingTop: 2 }}>
                {t("pageCounterSales.loyaltyPointsUsed")}
                <span style={{ display: "block", fontSize: 11, color: "var(--muted)", fontWeight: 400, marginTop: 2 }}>
                  {t("pageCounterSales.pointBalance")}: {(loyaltyWallet!.currentBalance || 0).toLocaleString("vi-VN")} {t("pageCounterSales.points")} ({t("pageCounterSales.pointMax")} {(maxPoints || 0).toLocaleString("vi-VN")})
                </span>
              </span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="number" min={0} max={maxPoints} value={pointsToUse}
                    onChange={e => { const v = Math.max(0, Math.min(Number(e.target.value), maxPoints)); onPointsChange?.(v, v * exchangeRate); }}
                    style={{ width: 72, fontSize: 12, textAlign: "right", border: "1.5px solid var(--border)", borderRadius: "0.4rem", padding: "3px 6px", fontFamily: "var(--font-base)", background: "var(--paper)" }}
                  />
                  <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{t("pageCounterSales.points")}</span>
                </div>
                <span className="sr__v sr__v--blue">
                  {moneyFromPoints > 0 ? `−${moneyFromPoints.toLocaleString("vi")} ₫` : "0 ₫"}
                </span>
              </div>
            </div>
          ) : customer ? (
            <div className="sr">
              <span className="sr__k" style={{ color: "var(--muted)", fontSize: 11 }}>💡 {t("pageCounterSales.notLoyaltyMember")}</span>
            </div>
          ) : null}

          <div className="sr sr--total">
            <span className="sr__k">{t("pageCounterSales.totalPayment")}</span>
            <span className="sr__v sr__v--lime">{formatVND(finalTotal)}</span>
          </div>
        </div>

        <button className="btn btn--outline"
          style={{ width: "100%", padding: "1rem", marginBottom: "0.8rem", fontWeight: 700, fontSize: "1.4rem", borderRadius: "0.3rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}
          onClick={onSaveDraft} disabled={isSaving || items.length === 0}>
          {isSaving ? `⏳ ${t("pageCounterSales.saving")}` : `💾 ${t("pageCounterSales.saveDraft")}`}
        </button>

        {/* Ghi chú đơn */}
        <div className="cart-note">
          <button className={`cart-note__toggle${note?.trim() ? " has-value" : ""}`}
            onClick={() => { const el = document.getElementById("cart-note-textarea"); if (el) { el.style.display = el.style.display === "none" ? "block" : "none"; if (el.style.display !== "none") (el as HTMLTextAreaElement).focus(); } }}
          >
            <span>📝 {t("pageCounterSales.orderNote")}</span>
            {note?.trim()
              ? <span className="cart-note__preview">{note.trim().slice(0, 30)}{note.trim().length > 30 ? "…" : ""}</span>
              : <span className="cart-note__hint">{t("pageCounterSales.orderNoteHint")}</span>}
          </button>
          <textarea id="cart-note-textarea" className="cart-note__textarea"
            style={{ display: note?.trim() ? "block" : "none" }}
            placeholder={t("pageCounterSales.orderNotePlaceholder")}
            rows={3} value={note} onChange={e => onNoteChange?.(e.target.value)}
          />
        </div>

        <button className="pay-btn" onClick={onCreateInvoice} disabled={items.length === 0}>
          {isShipOrder ? `📦 ${t("pageCounterSales.createShipOrder")}` : `💳 ${t("pageCounterSales.createOrder")}`}
        </button>
      </div>
    </div>
  );
};

export default Cart;