import React from "react";
import { OrderStatus } from "../../data";

interface OrderSummaryProps {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  orderNote: string;
  orderStatus: OrderStatus;
  orderStatusLabels: Record<OrderStatus, string>;
  hasSentOrderToCustomer: boolean;
  labels: {
    summaryTitle: string;
    subtotalLabel: string;
    shippingFeeLabel: string;
    discountLabel: string;
    totalLabel: string;
    notePlaceholder: string;
    orderStatusLabel: string;
    sentToCustomerLabel: string;
  };
  onNoteChange: (value: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function OrderSummary(props: OrderSummaryProps) {
  const { subtotal, shippingFee, discount, total, orderNote, orderStatus, orderStatusLabels, hasSentOrderToCustomer, labels, onNoteChange } =
    props;

  return (
    <div className="order-card">
      <h3>{labels.summaryTitle}</h3>
      <div className="summary-list">
        <div>
          <span>{labels.subtotalLabel}</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div>
          <span>{labels.shippingFeeLabel}</span>
          <strong>{formatCurrency(shippingFee)}</strong>
        </div>
        <div>
          <span>{labels.discountLabel}</span>
          <strong>{formatCurrency(discount)}</strong>
        </div>
        <div className="is-total">
          <span>{labels.totalLabel}</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>
      {/* <div className="order-status-box">
        <div>
          <span>{labels.orderStatusLabel}</span>
          <strong className={`order-status-badge order-status-badge--${orderStatus}`}>{orderStatusLabels[orderStatus]}</strong>
        </div>
        <div>
          <span>{labels.sentToCustomerLabel}</span>
          <strong>{hasSentOrderToCustomer ? "Đã gửi" : "Chưa gửi"}</strong>
        </div>
      </div> */}
      <textarea value={orderNote} onChange={(e) => onNoteChange(e.target.value)} placeholder={labels.notePlaceholder} rows={3} />
    </div>
  );
}
