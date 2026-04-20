import React from "react";
import { useTranslation } from "react-i18next";
import { DraftOrder, CartItemForDraft } from "../types";
import DraftItemsTable from "./DraftItemsTable";
import DraftSummary from "./DraftSummary";

type Props = {
  order:      DraftOrder | null;
  onDelete:   (id: string) => void;
  /**
   * Truyền cartItems + label đơn tạm lên để CounterSales load vào giỏ.
   * Không dùng navigate() vì đang ở cùng route với CounterSales.
   */
  onContinue?: (cartItems: CartItemForDraft[], draftLabel: string, draftId: string, customerInfo?: { customerId: number; customerName: string }) => void;
  deleting?:  string | null;
};

const DraftDetailPanel: React.FC<Props> = ({ order, onDelete, onContinue, deleting }) => {
  const { t } = useTranslation();
  if (!order) {
    return (
      <div className="draft-right">
        <div className="empty-state">
          <div className="ei">🗂️</div>
          <div className="et">{t("pageCounterSales.draftSelectHint")}</div>
          <div className="ed">
            {t("pageCounterSales.draftSelectHintSub")}
          </div>
        </div>
      </div>
    );
  }

  const isDeleting = deleting === order.id;

  const handleContinue = () => {
    const cartItems: CartItemForDraft[] = order.cartItems ?? [];
    if (cartItems.length === 0) return;
    // order.id = invoiceId dạng string — dùng để xóa đơn tạm sau khi thanh toán
    onContinue?.(cartItems, order.tenDon, order.id, {
      customerId: order.customerId,
      customerName: order.khachHang,
    });
  };

  return (
    <div className="draft-right">
      <div className="draft-right__head">
        <div className="title-wrap">
          <div className="title">
            {order.tenDon} <span className="pill">{order.id}</span>
          </div>
          <div className="sub">
            {order.ngay} · {order.thoiGian}
          </div>
        </div>

        <div className="acts">
          <button
            className="btn btn--outline btn--sm"
            onClick={() => onDelete(order.id)}
            disabled={isDeleting}
            style={{ opacity: isDeleting ? 0.5 : 1 }}
          >
            {isDeleting ? `⏳ ${t("pageCounterSales.draftDeleting")}` : `🗑️ ${t("pageCounterSales.draftDelete")}`}
          </button>

          <button
            className="btn btn--ink btn--sm"
            onClick={handleContinue}
            disabled={isDeleting || (order.cartItems ?? []).length === 0}
          >
            ⚡ {t("pageCounterSales.draftContinue")}
          </button>
        </div>
      </div>

      <div className="draft-right__body">
        <div className="info-grid">
          <div className="info-card">
            <div className="l">👤 {t("common.customer")}</div>
            <div className="v">{order.khachHang}</div>
          </div>
          <div className="info-card">
            <div className="l">🏷️ {t("common.name")}</div>
            <div className="v">{order.nhanVien}</div>
          </div>
          <div className="info-card">
            <div className="l">📦 {t("common.product")}</div>
            <div className="v">{order.sanPhams.length} mặt hàng</div>
          </div>
        </div>

        <div className="sec-ttl">📋 Danh sách sản phẩm</div>

        <DraftItemsTable items={order.sanPhams} />
        <DraftSummary items={order.sanPhams} />
      </div>
    </div>
  );
};

export default DraftDetailPanel;