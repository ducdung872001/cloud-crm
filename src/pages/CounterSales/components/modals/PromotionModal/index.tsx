import React, { useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { formatCurrency } from "reborn-util";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EligiblePromotion {
  id:             number;
  name:           string;
  promotionType:  number; // 1=Giảm giá, 2=Quà tặng, 3=Hội viên
  discountType?:  number; // 1=%, 2=VNĐ
  discount?:      number;
  discountAmount: number; // tiền giảm đã tính sẵn
  gifts?:         GiftProduct[];
}

export interface IneligiblePromotion {
  id:            number;
  name:          string;
  promotionType: number;
  discount?:     number;
  discountType?: number;
  reason:        string;
}

export interface GiftProduct {
  productId:   number;
  productName: string;
  avatar?:     string;
  unitName?:   string;
  qty:         number;
}

interface Props {
  open:        boolean;
  onClose:     () => void;
  eligible:    EligiblePromotion[];
  ineligible:  IneligiblePromotion[];
  orderAmount: number;
  customerName?: string;
  /** Gọi khi nhân viên xác nhận chọn KM */
  onApply: (promo: EligiblePromotion | null) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + " đ";

const promotionTypeLabel = (type: number) => {
  if (type === 2) return "Quà tặng";
  return "Giảm giá";
};

const promotionTypeColor = (type: number): React.CSSProperties => {
  if (type === 2) return { background: "#E6F1FB", color: "#185FA5" };
  return { background: "#EAF3DE", color: "#3B6D11" };
};

// ─── Component ───────────────────────────────────────────────────────────────

const PromotionModal: React.FC<Props> = ({
  open, onClose, eligible, ineligible, orderAmount, customerName, onApply,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = eligible.find(p => p.id === selectedId) ?? null;

  const handleApply = () => {
    onApply(selected);
    setSelectedId(null);
    onClose();
  };

  const handleSkip = () => {
    onApply(null);
    setSelectedId(null);
    onClose();
  };

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Bỏ qua",
          color: "primary",
          variant: "outline",
          callback: handleSkip,
        },
        {
          title: selectedId ? "Áp dụng khuyến mãi" : "Không áp dụng",
          color: "primary",
          variant: selectedId ? "default" : "outline",
          callback: handleApply,
        },
      ],
    },
  };

  return (
    <Modal
      isFade={true} isOpen={open} isCentered={true}
      staticBackdrop={true} toggle={onClose}
      className="promotion-modal"
      style={{ maxWidth: 560 }}
    >
      <ModalHeader title="Khuyến mãi áp dụng được" toggle={onClose} />

      <ModalBody>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
          Đơn hàng {fmtVnd(orderAmount)}
          {customerName ? ` · Khách: ${customerName}` : ""}
        </div>

        {/* ── Eligible ── */}
        {eligible.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "var(--muted)",
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8,
            }}>
              Có thể áp dụng ({eligible.length})
            </div>

            {eligible.map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(isSelected ? null : p.id)}
                  style={{
                    border: isSelected ? "1.5px solid #3B6D11" : "0.5px solid var(--border)",
                    background: isSelected ? "#EAF3DE" : "var(--white)",
                    borderRadius: "0.9rem",
                    padding: "12px 14px",
                    marginBottom: 8,
                    cursor: "pointer",
                    position: "relative",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  {/* Checkmark */}
                  {isSelected && (
                    <div style={{
                      position: "absolute", top: 10, right: 12,
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#3B6D11", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#fff", fontWeight: 700,
                    }}>✓</div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "2px 8px",
                      borderRadius: "0.4rem", ...promotionTypeColor(p.promotionType),
                    }}>
                      {promotionTypeLabel(p.promotionType)}
                    </span>
                  </div>

                  {p.promotionType !== 2 && p.discountAmount > 0 && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#3B6D11" }}>
                      Tiết kiệm: {fmtVnd(p.discountAmount)}
                      {p.discountType === 1 && p.discount
                        ? ` (${p.discount}% đơn hàng)`
                        : ""}
                    </div>
                  )}

                  {p.promotionType === 2 && (p.gifts ?? []).length > 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      Tặng: {p.gifts!.map(g => `${g.productName} ×${g.qty}`).join(", ")}
                    </div>
                  )}
                  {p.promotionType === 2 && (p.gifts ?? []).length === 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      Quà tặng kèm theo đơn
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Empty eligible ── */}
        {eligible.length === 0 && (
          <div style={{
            textAlign: "center", padding: "24px 0",
            color: "var(--muted)", fontSize: 13,
          }}>
            Không có khuyến mãi nào phù hợp với đơn hàng này
          </div>
        )}

        {/* ── Ineligible ── */}
        {ineligible.length > 0 && (
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "var(--muted)",
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8,
            }}>
              Chưa đủ điều kiện ({ineligible.length})
            </div>

            {ineligible.map((p) => (
              <div key={p.id} style={{
                background: "var(--paper)", borderRadius: "0.9rem",
                padding: "10px 14px", marginBottom: 8, opacity: 0.7,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)" }}>{p.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "2px 8px",
                    borderRadius: "0.4rem", opacity: 0.6, ...promotionTypeColor(p.promotionType),
                  }}>
                    {promotionTypeLabel(p.promotionType)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#A32D2D" }}>
                  Thiếu: {p.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
};

export default PromotionModal;