import React, { useState } from "react";
import { CartItem, Customer, OrderType } from "../../types";
import "./index.scss";
import InvoiceService from "@/services/InvoiceService";
import BoughtProductService from "@/services/BoughtProductService";
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
  /** Callback sau khi lưu tạm thành công — để refresh badge + xóa giỏ hàng */
  onSavedDraft?: () => void;
}

const Cart: React.FC<CartProps> = ({
  items, onChangeQty, onRemove, onPay,
  onSelectCustomer, customer,
  setInvoiceDraftToPaid,
  onSavedDraft,
}) => {
  const [orderType,   setOrderType]   = useState<OrderType>("retail");
  const [voucher,     setVoucher]     = useState("");
  const [isSaving,    setIsSaving]    = useState(false);  // Trạng thái "Lưu tạm"

  const subtotal  = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.length;

  const formatVND = (n: number) => (n ? n.toLocaleString("vi") + " ₫" : "");

  const ORDER_TYPES: { id: OrderType; label: string }[] = [
    { id: "retail",    label: "Lẻ"   },
    { id: "wholesale", label: "Buôn" },
    { id: "ship",      label: "Ship" },
  ];

  // ── Tạo đơn hàng (thanh toán) ─────────────────────────────────────────────
  const onCreateInvoice = async () => {
    try {
      const invoice = await InvoiceService.createInvoice({
        customerId: customer?.id ?? -1,
      });
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

  // ── Lưu tạm đơn hàng ──────────────────────────────────────────────────────
  // Luồng:
  //  1. GET /invoice/draft/create   → tạo invoice với status=PENDING
  //  2. POST /boughtProduct/insert  → gắn sản phẩm vào invoiceId vừa tạo
  //  3. onSavedDraft()              → xóa giỏ hàng + refresh badge
  const onSaveDraft = async () => {
    if (items.length === 0) {
      showToast("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi lưu tạm.", "error");
      return;
    }

    setIsSaving(true);
    try {
      // Bước 1: Tạo đơn tạm (invoice với status=PENDING)
      const draftRes = await InvoiceService.createInvoice({
        customerId: Number(customer?.id ?? -1),
      });

      if (draftRes.code !== 0 || !draftRes?.result?.invoiceId) {
        showToast(draftRes.message ?? "Không thể tạo đơn tạm", "error");
        return;
      }

      const invoiceId: number = draftRes.result.invoiceId;

      // Bước 2: Gắn sản phẩm vào invoiceId
      const body = items.map((item) => ({
        productId:  Number(item.id),
        variantId:  Number(item.variantId),
        price:      item.price,
        customerId: Number(customer?.id ?? -1),
        qty:        item.qty,
        name:       item.name,
        avatar:     item.avatar ?? "",
        unitName:   item.unitName ?? item.unit ?? "",
        fee:        item.price * item.qty,
      }));

      const insertRes = await BoughtProductService.insert(body, { invoiceId });

      if (insertRes.code !== 0) {
        // Xóa draft vừa tạo nếu gắn sản phẩm thất bại
        await fetch(`${urlsApi.invoice.draftDelete}?id=${invoiceId}`, { method: "DELETE" });
        showToast(insertRes.message ?? "Lưu sản phẩm vào đơn tạm thất bại", "error");
        return;
      }

      showToast(`Đã lưu tạm đơn hàng (${items.length} sản phẩm)`, "success");

      // Bước 3: Gọi callback để xóa giỏ + refresh badge "Đơn tạm"
      onSavedDraft?.();

    } catch (err) {
      showToast("Lỗi kết nối khi lưu tạm", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="cart">
      {/* Header */}
      <div className="cart__header">
        <div className="cart__header-top">
          <div className="cart__title">🛒 Giỏ hàng</div>
          <div className="order-type">
            {ORDER_TYPES.map((ot) => (
              <button
                key={ot.id}
                className={`ot${orderType === ot.id ? " active" : ""}`}
                onClick={() => setOrderType(ot.id)}
              >
                {ot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer */}
        <div className="cust-box cust-box--filled" onClick={onSelectCustomer}>
          {customer ? (
            <>
              <div className="cust-av" style={{ background: customer.color }}>
                {customer.initial}
              </div>
              <div className="cust-info">
                <div className="cust-name">{customer.name}</div>
                <div className="cust-pts">
                  ⭐ {customer.points.toLocaleString("vi")} điểm · Hạng {customer.tier}
                </div>
              </div>
            </>
          ) : (
            <div className="cust-placeholder">
              <p>Chọn khách hàng</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart items */}
      <div className="cart__items">
        {items.length === 0 && (
          <div className="cart__empty">
            <span>🛒</span>
            <p>Giỏ hàng trống</p>
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="ci">
            <div className="ci__icon">
              {item.image
                ? <img src={item.image} alt={item.name} />
                : <span style={{ fontSize: "30px" }}>{item.icon}</span>
              }
            </div>
            <div className="ci__info">
              <div className="ci__name">{item.name}</div>
              <div className="ci__price">
                {formatVND(item.price)}/{item.unitName || item.unit}
              </div>
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

      {/* Cart footer */}
      <div className="cart__footer">
        <div className="voucher-row">
          <input
            type="text"
            placeholder="🏷️ Nhập mã voucher..."
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
          />
          <button className="btn btn--outline btn--sm">Áp dụng</button>
        </div>

        <div className="summary">
          <div className="sr">
            <span className="sr__k">Tạm tính ({itemCount} sản phẩm)</span>
            <span className="sr__v">{formatVND(subtotal)}</span>
          </div>
          <div className="sr">
            <span className="sr__k">Giảm giá voucher</span>
            <span className="sr__v sr__v--red">−0 ₫</span>
          </div>
          <div className="sr">
            <span className="sr__k">Điểm tích lũy dùng</span>
            <span className="sr__v sr__v--blue">−0 ₫</span>
          </div>
          <div className="sr sr--total">
            <span className="sr__k">TỔNG THANH TOÁN</span>
            <span className="sr__v sr__v--lime">{formatVND(subtotal)}</span>
          </div>
        </div>

        {/* ── Nút Lưu tạm — thêm mới ── */}
        <button
          className="btn btn--outline"
          style={{
            width: "100%", padding: "1rem",
            marginBottom: "0.8rem", fontWeight: 700,
            fontSize: "1.4rem", borderRadius: "0.3rem",
          }}
          onClick={onSaveDraft}
          disabled={isSaving || items.length === 0}
        >
          {isSaving ? "⏳ Đang lưu..." : "💾 Lưu tạm"}
        </button>

        {/* ── Nút Tạo đơn hàng (cũ, giữ nguyên) ── */}
        <button
          className="pay-btn"
          onClick={onCreateInvoice}
          disabled={items.length === 0}
        >
          💳 Tạo đơn hàng
        </button>
      </div>
    </div>
  );
};

export default Cart;