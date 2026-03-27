import React, { useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { CartItem, PayMethod } from "../../../types";
import { IActionModal } from "model/OtherModel";
import { IStorePaymentConfigResponse } from "model/paymentMethod/PaymentMethodModel";
import { StorePaymentConfigService } from "services/PaymentMethodService";
import ImageMomo    from "assets/images/MOMO-Logo-App.png";
import ImageZaloPay from "assets/images/zalopay.png";
import "./index.scss";

// ── Partner → PayMethod id ────────────────────────────────────────────────
export const PARTNER_TO_PAY_METHOD: Record<string, PayMethod> = {
  CASH:          "cash",
  BANK_TRANSFER: "transfer",
  QR_PRO:        "qr",
  MOMO:          "momo",
  ZALOPAY:       "zalo_pay",
  VNPAY:         "zalo_pay",
  CREDIT_CARD:   "credit_card",
  OTHER:         "cash",
};

const PARTNER_ICON: Record<string, string> = {
  CASH: "💵", BANK_TRANSFER: "🏦", QR_PRO: "📷",
  MOMO: "🟣", ZALOPAY: "🔵", VNPAY: "🔴",
  CREDIT_CARD: "💳", OTHER: "⚙️",
};

// Fallback tĩnh khi API chưa có dữ liệu
export const PAY_METHODS: { id: PayMethod; icon: string; label: string; image?: string }[] = [
  { id: "cash",        icon: "💵", label: "Tiền mặt" },
  { id: "transfer",    icon: "🏦", label: "Chuyển khoản" },
  { id: "qr",          icon: "📷", label: "QR Pro" },
  { id: "momo",        icon: "🟣", label: "Momo",        image: ImageMomo },
  { id: "zalo_pay",    icon: "🔵", label: "ZaloPay",     image: ImageZaloPay },
  { id: "credit_card", icon: "💳", label: "Thẻ tín dụng" },
];

interface PayModalProps {
  open:            boolean;
  cartItems:       CartItem[];
  onClose:         () => void;
  onConfirm:       (invoiceId: number | null) => void;
  invoiceId:       number | null;
  method:          PayMethod;
  setMethod:       (method: PayMethod) => void;
  couponDiscount?: number;
  promoDiscount?:  number;
  /** Truyền activeConfig ra ngoài để CounterSales/index.tsx dùng khi generate QR */
  onConfigChange?: (cfg: IStorePaymentConfigResponse | null) => void;
}

export default function PayModal({
  open, cartItems, onClose, onConfirm, invoiceId,
  method, setMethod, couponDiscount = 0, promoDiscount = 0,
  onConfigChange,
}: PayModalProps) {
  const [customerPaid, setCustomerPaid]     = useState(0);
  const [configs, setConfigs]               = useState<IStorePaymentConfigResponse[]>([]);
  const [loaded, setLoaded]                 = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);

  // ── Fetch store_payment_config 1 lần ─────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    StorePaymentConfigService.list()
      .then((res) => {
        if (res.code === 0 && Array.isArray(res.result) && res.result.length > 0) {
          setConfigs(res.result.filter((c: IStorePaymentConfigResponse) => c.isActive));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [loaded]);

  // ── Config đang active (để render section chi tiết) ───────────────────────
  const activeConfig: IStorePaymentConfigResponse | null = useMemo(() => {
    if (selectedConfigId !== null) {
      return configs.find((c) => c.id === selectedConfigId) ?? null;
    }
    return configs.find(
      (c) => PARTNER_TO_PAY_METHOD[c.template?.partner ?? "OTHER"] === method
    ) ?? null;
  }, [selectedConfigId, configs, method]);

  useEffect(() => { onConfigChange?.(activeConfig); }, [activeConfig]);

  const subtotal = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = couponDiscount + promoDiscount;
  const total    = subtotal - discount;
  const change   = Math.max(0, customerPaid - total);
  const fmt      = (n: number) => n.toLocaleString("vi") + " ₫";

  // ── Khi mở modal ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setCustomerPaid(Math.ceil(total / 1000) * 1000);
    const defaultCfg = configs.find((c) => c.isDefault && c.isActive);
    if (defaultCfg) {
      setMethod(PARTNER_TO_PAY_METHOD[defaultCfg.template?.partner ?? "OTHER"] ?? "cash");
      setSelectedConfigId(defaultCfg.id);
    } else {
      setMethod("cash");
      setSelectedConfigId(null);
    }
  }, [open]);

  // ── Build danh sách nút PTTT ──────────────────────────────────────────────
  const displayMethods = useMemo(() => {
    if (!loaded || configs.length === 0) return PAY_METHODS;
    return [...configs]
      .sort((a, b) => (a.isDefault === b.isDefault ? a.position - b.position : a.isDefault ? -1 : 1))
      .map((cfg) => {
        const partner = cfg.template?.partner ?? "OTHER";
        const logo    = cfg.template?.logoUrl
          ?? (partner === "MOMO" ? ImageMomo : partner === "ZALOPAY" ? ImageZaloPay : undefined);
        return {
          id:       PARTNER_TO_PAY_METHOD[partner] ?? "cash",
          icon:     PARTNER_ICON[partner] ?? "💳",
          label:    cfg.displayName,
          image:    logo,
          cfgId:    cfg.id,
        };
      });
  }, [configs, loaded]);

  const actions: IActionModal = useMemo(() => ({
    actions_right: {
      buttons: [
        { title: "Hủy", color: "primary", variant: "outline", callback: onClose },
        { title: "✅ Tạo hoá đơn", color: "primary", callback: () => onConfirm(invoiceId) },
      ],
    },
  }), [invoiceId, onClose, onConfirm]);

  // ── Switch: render section chi tiết theo method ───────────────────────────
  const renderSection = () => {
    switch (method) {

      case "cash":
        return (
          <>
            <div className="pay-modal__field">
              <label>Khách đưa (₫)</label>
              <input
                type="text"
                value={customerPaid.toLocaleString("vi")}
                onChange={(e) => setCustomerPaid(Number(e.target.value.replace(/[^0-9]/g, "")))}
              />
              <div className="pay-modal__quick-btns">
                {[50000, 100000, 150000, 200000, 500000].map((v) => (
                  <button key={v} type="button" className="pay-modal__quick-btn"
                    onClick={() => setCustomerPaid(v)}>
                    {(v / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
            <div className="pay-modal__change">
              <span>Tiền thối lại</span>
              <span className="pay-modal__change-val">{fmt(change)}</span>
            </div>
          </>
        );

      case "transfer":
        return (
          <div className="pay-modal__transfer">
            {activeConfig ? (
              <>
                {activeConfig.bankName && (
                  <div className="pay-modal__transfer-row">
                    <span>Ngân hàng</span>
                    <b>{activeConfig.bankName}</b>
                  </div>
                )}
                {activeConfig.accountNumber && (
                  <div className="pay-modal__transfer-row">
                    <span>Số tài khoản</span>
                    <b className="pay-modal__account">{activeConfig.accountNumber}</b>
                  </div>
                )}
                {activeConfig.accountHolderName && (
                  <div className="pay-modal__transfer-row">
                    <span>Chủ tài khoản</span>
                    <b>{activeConfig.accountHolderName}</b>
                  </div>
                )}
                <div className="pay-modal__transfer-row">
                  <span>Nội dung CK</span>
                  <b>DH {invoiceId ?? "..."}</b>
                </div>
              </>
            ) : (
              <p style={{ fontSize: "1.3rem", color: "var(--muted)", lineHeight: 1.6 }}>
                Chưa cấu hình tài khoản chuyển khoản.<br />
                Vào <b>Cài đặt → Phương thức thanh toán</b> để thiết lập.
              </p>
            )}
          </div>
        );

      // QR Pro: generate QR được xử lý ở CounterSales/index.tsx sau khi tạo invoice
      // activeConfig được truyền ra ngoài qua onConfigChange để CounterSales dùng
      case "qr":
        return (
          <div className="pay-modal__transfer" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
            <div className="pay-modal__transfer-row">
              <span>Phương thức</span>
              <b>{activeConfig?.displayName ?? "QR Pro (VietQR)"}</b>
            </div>
            <div className="pay-modal__transfer-row">
              <span>Số tiền</span>
              <b style={{ color: "var(--lime-d)", fontSize: "1.6rem" }}>{fmt(total)}</b>
            </div>
            <p style={{ fontSize: "1.2rem", color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>
              Mã QR sẽ được tạo sau khi bấm "Tạo hoá đơn"
            </p>
          </div>
        );

      // Momo / ZaloPay: chưa tích hợp API, nhân viên xác nhận thủ công
      case "momo":
      case "zalo_pay":
        return (
          <div className="pay-modal__transfer" style={{ background: "#faf5ff", borderColor: "#d8b4fe" }}>
            <div className="pay-modal__transfer-row">
              <span>Phương thức</span>
              <b>{activeConfig?.displayName ?? (method === "momo" ? "Momo" : "ZaloPay")}</b>
            </div>
            {activeConfig?.accountNumber && (
              <div className="pay-modal__transfer-row">
                <span>SĐT ví</span>
                <b>{activeConfig.accountNumber}</b>
              </div>
            )}
            <p style={{ fontSize: "1.2rem", color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>
              Khách thanh toán qua ví, nhân viên xác nhận sau khi nhận được tiền
            </p>
          </div>
        );

      // Thẻ tín dụng: POS vật lý xử lý, hệ thống chỉ ghi nhận
      case "credit_card":
        return (
          <div className="pay-modal__transfer" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
            <div className="pay-modal__transfer-row">
              <span>Phương thức</span>
              <b>{activeConfig?.displayName ?? "Thẻ tín dụng / Quẹt thẻ"}</b>
            </div>
            <p style={{ fontSize: "1.2rem", color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>
              Khách quẹt thẻ qua máy POS, xác nhận sau khi giao dịch thành công
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isFade isOpen={open} isCentered staticBackdrop toggle={onClose} className="pay-modal">
      <ModalHeader title="💳 Chọn phương thức thanh toán" toggle={onClose} />

      <ModalBody>
        {/* Danh sách PTTT */}
        <div className="pay-modal__methods">
          {displayMethods.map((m) => {
            const isSelected = method === m.id &&
              (selectedConfigId === null || selectedConfigId === m.cfgId);
            return (
              <div key={m.cfgId ?? m.id}
                className={`pms${isSelected ? " pms--selected" : ""}`}
                onClick={() => { setMethod(m.id); setSelectedConfigId(m.cfgId ?? null); }}>
                <div className="pms__icon">
                  {m.image
                    ? <img src={m.image} alt={m.label} className="pms__image" />
                    : m.icon}
                </div>
                <div className="pms__label">{m.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tổng tiền */}
        <div className="pay-modal__summary">
          <div className="pay-modal__summary-row">
            <span>Tổng tiền hàng</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="pay-modal__summary-row">
              <span>Giảm giá</span>
              <span className="pay-modal__discount">−{fmt(discount)}</span>
            </div>
          )}
          <div className="pay-modal__summary-row pay-modal__summary-row--total">
            <span>TỔNG THANH TOÁN</span>
            <span className="pay-modal__total-val">{fmt(total)}</span>
          </div>
        </div>

        {/* Section chi tiết theo method */}
        {renderSection()}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}