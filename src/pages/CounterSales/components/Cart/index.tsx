import React, { useState } from "react";
import { CartItem, Customer, OrderType } from "../../types";
import "./index.scss";
import InvoiceService from "@/services/InvoiceService";
import BoughtProductService from "@/services/BoughtProductService";
import CouponService from "@/services/CouponService";
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
  /** Callback sau khi lưu tạm thành công */
  onSavedDraft?: () => void;
  // ── Loyalty ──────────────────────────────────────────────────────────────
  loyaltyWallet?: { currentBalance: number; segmentName?: string } | null;
  exchangeRate?: number;
  pointsToUse?: number;
  onPointsChange?: (points: number, moneyValue: number) => void;
  // ── Khuyến mãi ───────────────────────────────────────────────────────────
  eligiblePromoCount?: number;
  appliedPromo?:       { id: number; name: string; discountAmount: number; promotionType: number; gifts?: any[] } | null;
  promoDiscount?:      number;
  onViewPromos?:       () => void;
  onRemovePromo?:      () => void;
  onCouponDiscountChange?: (discount: number) => void;
  onResetVoucher?: () => void;
  // ── Giảm giá thủ công tại quầy ───────────────────────────────────────────
  manualDiscount?: number;
  onManualDiscountChange?: (discount: number) => void;
}

const Cart: React.FC<CartProps> = ({
  items, onChangeQty, onRemove, onPay,
  onSelectCustomer, customer,
  setInvoiceDraftToPaid,
  onSavedDraft,
  loyaltyWallet, exchangeRate = 1000, pointsToUse = 0, onPointsChange,
  eligiblePromoCount = 0, appliedPromo, promoDiscount = 0,
  onViewPromos, onRemovePromo, onCouponDiscountChange, onResetVoucher,
  manualDiscount = 0, onManualDiscountChange,
}) => {
  const [orderType, setOrderType] = useState<OrderType>("retail");
  const [voucher, setVoucher]     = useState("");
  const [isSaving, setIsSaving]   = useState(false);

  // ── Ship address (chỉ dùng khi orderType === "ship") ─────────────────────
  const [shipAddress, setShipAddress] = useState("");

  // ── Giảm giá thủ công ────────────────────────────────────────────────────
  const [discountInput, setDiscountInput] = useState("");   // giá trị người dùng gõ
  const [discountMode, setDiscountMode]   = useState<"amount" | "percent">("amount");

  // ── Coupon state ──────────────────────────────────────────────────────────
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponDiscount, setCouponDiscount]     = useState(0);
  const [couponMessage, setCouponMessage]       = useState("");
  const [couponError, setCouponError]           = useState("");

  // Helper: set coupon discount và notify parent
  const handleCouponDiscountChange = (discount: number) => {
    setCouponDiscount(discount);
    onCouponDiscountChange?.(discount);
  };

  const subtotal  = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.length;
  const formatVND = (n: number) => (n ? n.toLocaleString("vi") + " ₫" : "");

  // Reset voucher khi thanh toán thành công
  React.useEffect(() => {
    const handleReset = () => {
      setVoucher("");
      setCouponDiscount(0);
      setCouponMessage("");
      setCouponError("");
    };
    
    if (onResetVoucher) {
      handleReset();
    }
  }, [onResetVoucher]);

  // ── Loyalty ───────────────────────────────────────────────────────────────
  const isLoyaltyMember = !!loyaltyWallet;
  const maxPoints = isLoyaltyMember
    ? Math.min(loyaltyWallet!.currentBalance, Math.floor(subtotal / exchangeRate))
    : 0;
  const discount        = 0;
  const moneyFromPoints = (pointsToUse ?? 0) * exchangeRate;
  const finalTotal      = Math.max(
    0,
    subtotal - discount - moneyFromPoints - promoDiscount - couponDiscount - manualDiscount,
  );

  const ORDER_TYPES: { id: OrderType; label: string }[] = [
    { id: "retail",    label: "Lẻ"   },
    { id: "wholesale", label: "Buôn" },
    { id: "ship",      label: "Ship" },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Áp dụng mã coupon — gọi POST /bizapi/market/coupon/apply */
  const handleApplyCoupon = async () => {
    const code = voucher.trim();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const res = await CouponService.apply(code, subtotal);

      // ── Trích discountAmount từ response ──────────────────────────────────
      // Hỗ trợ cả 3 format:
      //   1. Flat:      { code, orderAmount, discountAmount?, finalAmount? }
      //   2. Data wrap: { success, data: { discountAmount, finalAmount, ... } }
      //   3. Result:    { code: 0, message, result: { code, discountAmount, ... } }
      const payload = (res as any)?.result ?? (res as any)?.data ?? res;

      // discountAmount: lấy trực tiếp nếu có, nếu không tính từ finalAmount
      let calcDiscount: number = 0;
      if (typeof payload?.discountAmount === "number" && payload.discountAmount > 0) {
        calcDiscount = payload.discountAmount;
      } else if (
        typeof payload?.finalAmount === "number" &&
        typeof payload?.orderAmount === "number"
      ) {
        calcDiscount = Math.max(0, payload.orderAmount - payload.finalAmount);
      }

      // Kiểm tra response hợp lệ: phải có code khớp hoặc không có lỗi
      const hasError = payload?.error || payload?.message?.toLowerCase().includes("không hợp lệ")
                    || payload?.message?.toLowerCase().includes("invalid")
                    || payload?.message?.toLowerCase().includes("expired")
                    || (res as any)?.success === false;

      if (hasError) {
        handleCouponDiscountChange(0);
        setCouponError(payload?.message ?? payload?.error ?? "Mã không hợp lệ hoặc đã hết hạn");
      } else if (payload?.code || (res as any)?.success === true) {
        // Response hợp lệ — có thể không có discountAmount nếu API chưa implement
        handleCouponDiscountChange(calcDiscount);
        if (calcDiscount > 0) {
          setCouponMessage(
            payload?.message ?? `Áp dụng thành công − ${calcDiscount.toLocaleString("vi")} đ`
          );
        } else {
          // API confirm mã hợp lệ nhưng chưa trả discountAmount
          // Hiển thị thông báo xác nhận, không trừ tiền (chờ backend cập nhật)
          handleCouponDiscountChange(0);
          setCouponMessage(payload?.message ?? "Mã hợp lệ ✓ (giá trị giảm sẽ áp dụng khi tạo đơn)");
        }
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

  // ── Xử lý giảm giá thủ công ──────────────────────────────────────────────
  const handleDiscountInput = (raw: string) => {
    // Chỉ cho phép số và dấu chấm/phẩy
    const cleaned = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    setDiscountInput(cleaned);
    const num = parseFloat(cleaned) || 0;
    const computed = discountMode === "percent"
      ? Math.round(subtotal * Math.min(num, 100) / 100)
      : Math.min(num, subtotal);
    onManualDiscountChange?.(computed);
  };

  const handleDiscountModeToggle = () => {
    const nextMode = discountMode === "amount" ? "percent" : "amount";
    setDiscountMode(nextMode);
    // Recompute khi đổi mode
    const num = parseFloat(discountInput) || 0;
    const computed = nextMode === "percent"
      ? Math.round(subtotal * Math.min(num, 100) / 100)
      : Math.min(num, subtotal);
    onManualDiscountChange?.(computed);
  };

  const handleDiscountClear = () => {
    setDiscountInput("");
    onManualDiscountChange?.(0);
  };

  const onCreateInvoice = async () => {
    try {
      const invoice = await InvoiceService.createInvoice({ customerId: customer?.id ?? -1 });
      if (invoice.code === 0 && invoice?.result?.invoiceId) {
        setInvoiceDraftToPaid(invoice.result.invoice);
        onPay(invoice.result.invoiceId);
      } else {
        console.error("Tạo hóa đơn thất bại", invoice);
      }
    } catch (error) {
      console.error("Có lỗi khi tạo hóa đơn", error);
    }
  };

  const onSaveDraft = async () => {
    if (items.length === 0) {
      showToast("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi lưu tạm.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const draftRes = await InvoiceService.createInvoice({ customerId: Number(customer?.id ?? -1) });
      if (draftRes.code !== 0 || !draftRes?.result?.invoiceId) {
        showToast(draftRes.message ?? "Không thể tạo đơn tạm", "error");
        return;
      }
      const invoiceId: number = draftRes.result.invoiceId;
      const body = items.map((item) => ({
        productId: Number(item.id),
        variantId: Number(item.variantId),
        price:     item.price,
        customerId: Number(customer?.id ?? -1),
        qty:       item.qty,
        name:      item.name,
        avatar:    item.avatar ?? "",
        unitName:  item.unitName ?? item.unit ?? "",
        fee:       item.price * item.qty,
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

  return (
    <div className="cart">
      <div className="cart__header">
        <div className="cart__header-top">
          <div className="cart__title">🛒 Giỏ hàng</div>
          <div className="order-type">
            {ORDER_TYPES.map((ot) => (
              <button key={ot.id} className={`ot${orderType === ot.id ? " active" : ""}`}
                onClick={() => setOrderType(ot.id)}>{ot.label}</button>
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
                  <div className="cust-pts" style={{ color: "var(--muted)" }}>
                    Không lưu thông tin
                  </div>
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
              <div className="ci__name">{item.name}</div>
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
        {/* ── Voucher ── */}
        <div className="voucher-row">
          <input
            type="text"
            placeholder="🏷️ Nhập mã voucher..."
            value={voucher}
            onChange={(e) => {
              setVoucher(e.target.value);
              // Reset khi người dùng chỉnh mã
              handleCouponDiscountChange(0);
              setCouponMessage("");
              setCouponError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
          />
          <button
            className="btn btn--outline btn--sm"
            onClick={handleApplyCoupon}
            disabled={isApplyingCoupon || !voucher.trim()}
          >
            {isApplyingCoupon ? "..." : "Áp dụng"}
          </button>
        </div>

        {/* Feedback áp dụng coupon */}
        {couponMessage && (
          <div style={{ fontSize: 11, color: "#3B6D11", marginTop: 4, marginBottom: 2, paddingLeft: 2 }}>
            ✓ {couponMessage}
          </div>
        )}
        {couponError && (
          <div style={{ fontSize: 11, color: "var(--red, #e53e3e)", marginTop: 4, marginBottom: 2, paddingLeft: 2 }}>
            ✕ {couponError}
          </div>
        )}

        {/* ── Giảm giá thủ công ── */}
        <div className="manual-discount">
          <div className="manual-discount__label">
            <span>🏷️ Giảm giá trực tiếp</span>
            {manualDiscount > 0 && (
              <button className="manual-discount__clear" onClick={handleDiscountClear}>✕ Bỏ</button>
            )}
          </div>
          <div className="manual-discount__row">
            <input
              className="manual-discount__input"
              type="text"
              inputMode="decimal"
              placeholder={discountMode === "amount" ? "Nhập số tiền..." : "Nhập %..."}
              value={discountInput}
              onChange={(e) => handleDiscountInput(e.target.value)}
            />
            <button
              className={`manual-discount__mode${discountMode === "percent" ? " active" : ""}`}
              onClick={handleDiscountModeToggle}
              title="Chuyển đổi giữa số tiền và %"
            >
              {discountMode === "amount" ? "₫" : "%"}
            </button>
          </div>
          {manualDiscount > 0 && (
            <div className="manual-discount__preview">
              Giảm: <strong>−{manualDiscount.toLocaleString("vi")} ₫</strong>
              {discountMode === "percent" && discountInput && (
                <span className="manual-discount__pct"> ({discountInput}%)</span>
              )}
            </div>
          )}
        </div>

        <div className="summary">
          <div className="sr">
            <span className="sr__k">Tạm tính ({itemCount} sản phẩm)</span>
            <span className="sr__v">{formatVND(subtotal)}</span>
          </div>

          {/* Giảm giá voucher — hiển thị couponDiscount từ API */}
          <div className="sr">
            <span className="sr__k">Giảm giá voucher</span>
            <span className="sr__v sr__v--red">
              {couponDiscount > 0 ? `−${couponDiscount.toLocaleString("vi")} ₫` : "0 ₫"}
            </span>
          </div>

          {/* Giảm giá trực tiếp tại quầy */}
          {manualDiscount > 0 && (
            <div className="sr">
              <span className="sr__k">Giảm trực tiếp</span>
              <span className="sr__v sr__v--red">−{manualDiscount.toLocaleString("vi")} ₫</span>
            </div>
          )}

          {/* ── Banner khuyến mãi ── */}
          {!appliedPromo && eligiblePromoCount > 0 && (
            <div
              onClick={onViewPromos}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", background: "#EAF3DE",
                borderRadius: "0.6rem", cursor: "pointer",
                marginBottom: 6, marginTop: 2,
              }}
            >
              <span style={{ fontSize: 12, color: "#3B6D11", fontWeight: 600, flex: 1 }}>
                Có {eligiblePromoCount} khuyến mãi phù hợp
              </span>
              <span style={{
                fontSize: 11, background: "#3B6D11", color: "#fff",
                padding: "2px 8px", borderRadius: "0.4rem",
              }}>Xem ngay</span>
            </div>
          )}

          {/* ── Khuyến mãi đã chọn ── */}
          {appliedPromo && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 10px", background: "#EAF3DE",
              borderRadius: "0.6rem", marginBottom: 6, marginTop: 2,
            }}>
              <span style={{ flex: 1, fontSize: 12, color: "#3B6D11", fontWeight: 600 }}>
                {appliedPromo.name}
              </span>
              <button
                onClick={onRemovePromo}
                style={{ background: "none", border: "none", color: "#3B6D11",
                         cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
              >✕</button>
            </div>
          )}

          {/* ── Dòng giảm giá KM ── */}
          <div className="sr">
            <span className="sr__k">Khuyến mãi</span>
            <span className="sr__v" style={{ color: promoDiscount > 0 ? "#3B6D11" : undefined }}>
              {promoDiscount > 0 ? `−${promoDiscount.toLocaleString("vi")} ₫` : "0 ₫"}
            </span>
          </div>

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
                  <input
                    type="number" min={0} max={maxPoints} value={pointsToUse}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(Number(e.target.value), maxPoints));
                      onPointsChange?.(v, v * exchangeRate);
                    }}
                    style={{
                      width: 72, fontSize: 12, textAlign: "right",
                      border: "1.5px solid var(--border)", borderRadius: "0.4rem",
                      padding: "3px 6px", fontFamily: "var(--font-base)", background: "var(--paper)",
                    }}
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
              <span className="sr__k" style={{ color: "var(--muted)", fontSize: 11 }}>
                💡 Khách chưa đăng ký hội viên
              </span>
            </div>
          ) : null}

          <div className="sr sr--total">
            <span className="sr__k">TỔNG THANH TOÁN</span>
            <span className="sr__v sr__v--lime">{formatVND(finalTotal)}</span>
          </div>
        </div>

        <button
          className="btn btn--outline"
          style={{ width: "100%", padding: "1rem", marginBottom: "0.8rem",
                   fontWeight: 700, fontSize: "1.4rem", borderRadius: "0.3rem",
                   display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem" }}
          onClick={onSaveDraft}
          disabled={isSaving || items.length === 0}
        >
          {isSaving ? "⏳ Đang lưu..." : "💾 Lưu tạm"}
        </button>

        <button className="pay-btn" onClick={onCreateInvoice} disabled={items.length === 0}>
          💳 Tạo đơn hàng
        </button>
      </div>
    </div>
  );
};

export default Cart;