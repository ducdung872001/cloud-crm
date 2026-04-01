import React, { useState, useEffect, useRef } from "react";
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
  const [voucher, setVoucher]   = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggestingFee, setIsSuggestingFee] = useState(false);

  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponDiscount, setCouponDiscount]     = useState(0);
  const [couponMessage, setCouponMessage]       = useState("");
  const [couponError, setCouponError]           = useState("");

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
        setCouponError(payload?.message ?? "Mã không hợp lệ hoặc đã hết hạn");
      } else if (payload?.code || (res as any)?.success === true) {
        handleCouponDiscountChange(calcDiscount);
        setCouponMessage(calcDiscount > 0
          ? (payload?.message ?? `Áp dụng thành công − ${calcDiscount.toLocaleString("vi")} đ`)
          : (payload?.message ?? "Mã hợp lệ ✓"));
      } else {
        handleCouponDiscountChange(0);
        setCouponError("Mã không hợp lệ hoặc đã hết hạn");
      }
    } catch {
      handleCouponDiscountChange(0);
      setCouponError("Lỗi kết nối khi áp dụng mã");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // ── Tạo đơn ──────────────────────────────────────────────────────────────
  const onCreateInvoice = async () => {
    if (isShipOrder) {
      if (!shippingInfo.receiverName?.trim()) { showToast("Vui lòng nhập tên người nhận", "warning"); return; }
      if (!shippingInfo.receiverPhone?.trim()) { showToast("Vui lòng nhập số điện thoại người nhận", "warning"); return; }
      if (!shippingInfo.receiverAddress?.trim()) { showToast("Vui lòng nhập địa chỉ giao hàng", "warning"); return; }
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
        showToast(invoice.message ?? "Tạo đơn thất bại", "error");
      }
    } catch {
      showToast("Có lỗi khi tạo đơn hàng", "error");
    }
  };

  const onSaveDraft = async () => {
    if (items.length === 0) { showToast("Giỏ hàng trống", "error"); return; }
    setIsSaving(true);
    try {
      const draftRes = await InvoiceService.createInvoice({
        customerId: Number(customer?.id ?? -1),
        ...(note?.trim() ? { note: note.trim() } : {}),
      });
      if (draftRes.code !== 0 || !draftRes?.result?.invoiceId) {
        showToast(draftRes.message ?? "Không thể tạo đơn tạm", "error");
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
        showToast(insertRes.message ?? "Lưu sản phẩm vào đơn tạm thất bại", "error");
        return;
      }
      showToast(`Đã lưu tạm đơn hàng (${items.length} sản phẩm)`, "success");
      onSavedDraft?.();
    } catch {
      showToast("Lỗi kết nối khi lưu tạm", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const ORDER_TYPES: { id: OrderType; label: string }[] = [
    { id: "retail", label: "Lẻ" },
    { id: "wholesale", label: "Buôn" },
    { id: "ship", label: "Ship" },
  ];

  return (
    <div className="cart">
      <div className="cart__header">
        <div className="cart__header-top">
          <div className="cart__title">🛒 Giỏ hàng</div>
          <div className="order-type">
            {ORDER_TYPES.map((ot) => (
              <button key={ot.id} className={`ot${orderType === ot.id ? " active" : ""}`}
                onClick={() => onOrderTypeChange(ot.id)}>{ot.label}</button>
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
                  <div className="cust-pts" style={{ color: "var(--muted)" }}>Không lưu thông tin</div>
                ) : (
                  <div className="cust-pts">
                    ⭐ {(customer.points || 0).toLocaleString("vi")} điểm · Hạng {customer.tier}
                    {isLoyaltyMember && loyaltyWallet!.segmentName && (
                      <span style={{ color: "var(--lime-d)", marginLeft: 4 }}>· {loyaltyWallet!.segmentName}</span>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="cust-placeholder"><p>Chọn khách hàng</p></div>
          )}
        </div>
      </div>

      <div className="cart__items">
        {items.length === 0 && <div className="cart__empty"><span>🛒</span><p>Giỏ hàng trống</p></div>}
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
              <span className="qi">{item.qty}</span>
              <button className="qb" onClick={() => onChangeQty(item.id, 1)}>+</button>
            </div>
            <div className="ci__total">{formatVND(item.price * item.qty)}</div>
            <button className="del-btn" onClick={() => onRemove(item.id)}>✕</button>
          </div>
        ))}
      </div>

      <div className="cart__footer">

        {/* ══ Ship section ══════════════════════════════════════════════════ */}
        {isShipOrder && (
          <div className="ship-section">
            <div className="ship-section__title">🚚 Thông tin giao hàng</div>

            {/* Tên người nhận */}
            <div className="ship-section__row">
              <div className="ship-section__label">Người nhận *</div>
              <input className="ship-section__input"
                placeholder="Họ tên người nhận"
                value={shippingInfo.receiverName}
                onChange={e => onShippingInfoChange({ ...shippingInfo, receiverName: e.target.value })}
              />
            </div>

            {/* SĐT */}
            <div className="ship-section__row">
              <div className="ship-section__label">Số điện thoại *</div>
              <input className="ship-section__input"
                placeholder="0912 345 678"
                value={shippingInfo.receiverPhone}
                onChange={e => onShippingInfoChange({ ...shippingInfo, receiverPhone: e.target.value })}
              />
            </div>

            {/* Tỉnh/Thành → gợi ý phí ship */}
            <div className="ship-section__row">
              <div className="ship-section__label">Tỉnh/Thành</div>
              <input className="ship-section__input"
                placeholder="VD: TP. Hồ Chí Minh, Hà Nội..."
                value={shippingInfo.receiverProvince}
                onChange={e => handleProvinceChange(e.target.value)}
              />
            </div>

            {/* Địa chỉ chi tiết */}
            <div className="ship-section__row">
              <div className="ship-section__label">Địa chỉ giao *</div>
              <input className="ship-section__input"
                placeholder="Số nhà, đường, phường/xã, quận/huyện"
                value={shippingInfo.receiverAddress}
                onChange={e => onShippingInfoChange({ ...shippingInfo, receiverAddress: e.target.value })}
              />
            </div>

            {/* Phí ship + nút gợi ý */}
            <div className="ship-section__row">
              <div className="ship-section__label">
                Phí ship thu khách
                {isSuggestingFee && <span style={{ fontSize: "1rem", color: "#0369a1", marginLeft: 6 }}>⏳ đang tính...</span>}
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
                  title="Tính lại phí dựa trên cấu hình phí vận chuyển"
                >
                  Tính lại
                </button>
              </div>
            </div>

            {/* Bên trả phí ship */}
            <div className="ship-section__row">
              <div className="ship-section__label">Ai trả phí ship?</div>
              <div className="ship-section__bearer">
                <button
                  className={`ship-section__bearer-btn${shippingInfo.shippingFeeBearer === "RECEIVER" ? " active" : ""}`}
                  onClick={() => onShippingInfoChange({ ...shippingInfo, shippingFeeBearer: "RECEIVER" })}
                >
                  Người nhận
                </button>
                <button
                  className={`ship-section__bearer-btn${shippingInfo.shippingFeeBearer === "SENDER" ? " active" : ""}`}
                  onClick={() => onShippingInfoChange({ ...shippingInfo, shippingFeeBearer: "SENDER" })}
                >
                  Cửa hàng
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
              Thu hộ COD ({formatVND(finalTotal)})
            </label>
            {shippingInfo.codAmount > 0 && (
              <div className="ship-section__row">
                <div className="ship-section__label">Số tiền COD</div>
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
              <div className="ship-section__label">Ghi chú cho người ship</div>
              <input className="ship-section__input"
                placeholder="VD: Gọi trước khi giao, để trước cửa..."
                value={shippingInfo.noteForShipper ?? ""}
                onChange={e => onShippingInfoChange({ ...shippingInfo, noteForShipper: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Voucher */}
        <div className="voucher-row">
          <input type="text" placeholder="🏷️ Nhập mã voucher..."
            value={voucher}
            onChange={e => { setVoucher(e.target.value); handleCouponDiscountChange(0); setCouponMessage(""); setCouponError(""); }}
            onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
          />
          <button className="btn btn--outline btn--sm"
            onClick={handleApplyCoupon} disabled={isApplyingCoupon || !voucher.trim()}>
            {isApplyingCoupon ? "..." : "Áp dụng"}
          </button>
        </div>
        {couponMessage && <div style={{ fontSize: 11, color: "#3B6D11", marginTop: 4, paddingLeft: 2 }}>✓ {couponMessage}</div>}
        {couponError   && <div style={{ fontSize: 11, color: "var(--red,#e53e3e)", marginTop: 4, paddingLeft: 2 }}>✕ {couponError}</div>}

        {/* Summary */}
        <div className="summary">
          <div className="sr">
            <span className="sr__k">Tạm tính ({itemCount} sản phẩm)</span>
            <span className="sr__v">{formatVND(subtotal)}</span>
          </div>

          <div className="sr">
            <span className="sr__k">Giảm giá voucher</span>
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
                Có {eligiblePromoCount} khuyến mãi phù hợp
              </span>
              <span style={{ fontSize: 11, background: "#3B6D11", color: "#fff", padding: "2px 8px", borderRadius: "0.4rem" }}>
                Xem ngay
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
            <span className="sr__k">Khuyến mãi</span>
            <span className="sr__v" style={{ color: promoDiscount > 0 ? "#3B6D11" : undefined }}>
              {promoDiscount > 0 ? `−${promoDiscount.toLocaleString("vi")} ₫` : "0 ₫"}
            </span>
          </div>

          {/* Phí ship — chỉ hiện khi orderType === ship */}
          {isShipOrder && (
            <div className="sr">
              <span className="sr__k">
                Phí ship
                {shippingInfo.shippingFeeBearer === "SENDER"
                  ? <span style={{ fontSize: "1rem", color: "#6b7280", marginLeft: 4 }}>(cửa hàng trả)</span>
                  : null}
              </span>
              <span className="sr__v sr__v--ship">
                {shippingInfo.shippingFeeBearer === "SENDER"
                  ? "Miễn phí cho khách"
                  : `+${shippingFee.toLocaleString("vi")} ₫`}
              </span>
            </div>
          )}

          {/* Điểm tích lũy */}
          {isLoyaltyMember ? (
            <div className="sr" style={{ alignItems: "flex-start", gap: 4 }}>
              <span className="sr__k" style={{ paddingTop: 2 }}>
                Điểm tích lũy dùng
                <span style={{ display: "block", fontSize: 11, color: "var(--muted)", fontWeight: 400, marginTop: 2 }}>
                  Số dư: {(loyaltyWallet!.currentBalance || 0).toLocaleString("vi-VN")} điểm (tối đa {(maxPoints || 0).toLocaleString("vi-VN")})
                </span>
              </span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="number" min={0} max={maxPoints} value={pointsToUse}
                    onChange={e => { const v = Math.max(0, Math.min(Number(e.target.value), maxPoints)); onPointsChange?.(v, v * exchangeRate); }}
                    style={{ width: 72, fontSize: 12, textAlign: "right", border: "1.5px solid var(--border)", borderRadius: "0.4rem", padding: "3px 6px", fontFamily: "var(--font-base)", background: "var(--paper)" }}
                  />
                  <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>điểm</span>
                </div>
                <span className="sr__v sr__v--blue">
                  {moneyFromPoints > 0 ? `−${moneyFromPoints.toLocaleString("vi")} ₫` : "0 ₫"}
                </span>
              </div>
            </div>
          ) : customer ? (
            <div className="sr">
              <span className="sr__k" style={{ color: "var(--muted)", fontSize: 11 }}>💡 Khách chưa đăng ký hội viên</span>
            </div>
          ) : null}

          <div className="sr sr--total">
            <span className="sr__k">TỔNG THANH TOÁN</span>
            <span className="sr__v sr__v--lime">{formatVND(finalTotal)}</span>
          </div>
        </div>

        <button className="btn btn--outline"
          style={{ width: "100%", padding: "1rem", marginBottom: "0.8rem", fontWeight: 700, fontSize: "1.4rem", borderRadius: "0.3rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}
          onClick={onSaveDraft} disabled={isSaving || items.length === 0}>
          {isSaving ? "⏳ Đang lưu..." : "💾 Lưu tạm"}
        </button>

        {/* Ghi chú đơn */}
        <div className="cart-note">
          <button className={`cart-note__toggle${note?.trim() ? " has-value" : ""}`}
            onClick={() => { const el = document.getElementById("cart-note-textarea"); if (el) { el.style.display = el.style.display === "none" ? "block" : "none"; if (el.style.display !== "none") (el as HTMLTextAreaElement).focus(); } }}
          >
            <span>📝 Ghi chú đơn hàng</span>
            {note?.trim()
              ? <span className="cart-note__preview">{note.trim().slice(0, 30)}{note.trim().length > 30 ? "…" : ""}</span>
              : <span className="cart-note__hint">Nhấn để thêm ghi chú</span>}
          </button>
          <textarea id="cart-note-textarea" className="cart-note__textarea"
            style={{ display: note?.trim() ? "block" : "none" }}
            placeholder="VD: Giao buổi chiều, không lấy túi nilon, gói quà..."
            rows={3} value={note} onChange={e => onNoteChange?.(e.target.value)}
          />
        </div>

        <button className="pay-btn" onClick={onCreateInvoice} disabled={items.length === 0}>
          {isShipOrder ? "📦 Tạo đơn giao hàng" : "💳 Tạo đơn hàng"}
        </button>
      </div>
    </div>
  );
};

export default Cart;