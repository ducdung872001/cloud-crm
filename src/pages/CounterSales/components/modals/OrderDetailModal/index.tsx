import React, { Fragment, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import "./index.scss";
import { useGetDetailInvoice } from "@/hooks/useGetDetailInvoice";
import { formatDateCustom } from "utils/dateUtils";

import { formatCurrency } from "reborn-util";

interface OrderCustomerInfo {
  name?: string;
  phone?: string;
  points?: number;
  tier?: string;
}

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  onConfirm: () => void;
  invoiceId: number | null;
  customerInfo?: OrderCustomerInfo;
}

const TIMELINE = [
  { icon: "✅", label: "Tạo đơn", done: true, active: false },
  { icon: "⏳", label: "Chờ XL", done: false, active: true },
  { icon: "🚚", label: "Đang giao", done: false, active: false },
  { icon: "✅", label: "Hoàn thành", done: false, active: false },
];

const ORDER_ITEMS = [
  { icon: "🥛", name: "Sữa TH True Milk 1L", detail: "2 hộp × 32,000 ₫", total: "64,000 ₫" },
  { icon: "🍜", name: "Mì Hảo Hảo Tôm Chua", detail: "5 gói × 4,500 ₫", total: "22,500 ₫" },
  { icon: "🥤", name: "Pepsi 330ml", detail: "3 lon × 12,000 ₫", total: "36,000 ₫" },
];

const MOCK_DETAIL_INVOICE = {
  id: 123,
  code: "#DH-20231021-0042",
  source: "offline",
  customer: { id: "1", name: "Nguyễn Thị Hoa", phone: "0901 234 567", points: 2450, tier: "Bạc", color: "#d97706", rank: "Bạc" },
  paymentMethod: "Tiền mặt",
  createdTime: "2023-10-21T09:45:00",
  status: "pending",
  items: [
    { icon: "🥛", name: "Sữa TH True Milk 1L", detail: "2 hộp × 32,000 ₫", total: "64,000 ₫" },
    { icon: "🍜", name: "Mì Hảo Hảo Tôm Chua", detail: "5 gói × 4,500 ₫", total: "22,500 ₫" },
    { icon: "🥤", name: "Pepsi 330ml", detail: "3 lon × 12,000 ₫", total: "36,000 ₫" },
  ],
  timeLine: [
    { icon: "✅", label: "Tạo đơn", done: true, active: false },
    { icon: "⏳", label: "Chờ xử lý", done: false, active: true },
    { icon: "🚚", label: "Đang giao", done: false, active: false },
    { icon: "✅", label: "Hoàn thành", done: false, active: false },
  ],
};

export default function OrderDetailModal({ open, onClose, onPrint, onConfirm, invoiceId, customerInfo }: OrderDetailModalProps) {
  const { dataInvoice: dataInvoiceApi, isLoading } = useGetDetailInvoice({
    invoiceId: invoiceId ?? undefined,
    enabled: invoiceId && invoiceId > 0 ? true : false,
  });

  // Merge customer info từ danh sách order vào data invoice
  const dataInvoice = useMemo(() => {
    const base = dataInvoiceApi ?? MOCK_DETAIL_INVOICE;
    if (!customerInfo) return base;
    return {
      ...base,
      customer: {
        ...base.customer,
        name: customerInfo.name || base.customer?.name || "Khách vãng lai",
        phone: customerInfo.phone || base.customer?.phone || "",
        points: customerInfo.points ?? base.customer?.points ?? 0,
        rank: customerInfo.tier || base.customer?.rank || "",
      },
    };
  }, [dataInvoiceApi, customerInfo]);
  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: onClose,
          },
          {
            title: "🧾 In biên lai",
            color: "primary",
            variant: "outline",
            callback: onPrint,
          },
          // {
          //   title: "✅ Xác nhận đơn hàng",
          //   color: "primary",
          //   callback: onConfirm,
          // },
        ],
      },
    }),
    [onClose, onPrint, onConfirm]
  );

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={onClose} className="order-detail-modal">
      <ModalHeader
        title={
          <Fragment>
            <div>📋 Chi tiết đơn hàng</div>
            <div className="order-detail-modal__code">{dataInvoice.code}</div>
          </Fragment>
        }
        toggle={onClose}
        // rightElement={<span className="badge bd-orange">{dataInvoice.timeLine.find(step => step.active)?.label}</span>}
      />

      <ModalBody>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span>Đang tải...</span>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="od-timeline">
              {dataInvoice.timeLine.map((step, i) => (
                <Fragment key={i}>
                  <div className="od-timeline__step">
                    <div
                      className={["od-timeline__dot", step.done ? "od-timeline__dot--done" : "", step.active ? "od-timeline__dot--active" : ""]
                        .join(" ")
                        .trim()}
                    >
                      {step.icon}
                    </div>
                    <div
                      className={["od-timeline__label", step.done ? "od-timeline__label--done" : "", step.active ? "od-timeline__label--active" : ""]
                        .join(" ")
                        .trim()}
                    >
                      {step.label}
                    </div>
                  </div>
                  {i < dataInvoice.timeLine.length - 1 && <div className={`od-timeline__line${step.done ? " od-timeline__line--done" : ""}`} />}
                </Fragment>
              ))}
            </div>

            {/* Info panels */}
            <div className="od-panels">
              <div className="od-panel">
                <div className="od-panel__title">Khách hàng</div>
                <div className="od-panel__name">{dataInvoice.customer.name}</div>
                {dataInvoice.customer.phone && (
                  <div className="od-panel__sub">{dataInvoice.customer.phone}</div>
                )}
                {(dataInvoice.customer.points > 0 || dataInvoice.customer.rank) && (
                  <div className="od-panel__sub">
                    ⭐ {dataInvoice.customer.points} điểm{dataInvoice.customer.rank ? ` · Hạng ${dataInvoice.customer.rank}` : ""}
                  </div>
                )}
              </div>
              <div className="od-panel">
                <div className="od-panel__title">Thông tin đơn</div>
                <div className="od-panel__sub">
                  Nguồn: <b>🏪 Tại quầy</b>
                </div>
                <div className="od-panel__sub">
                  TT: <b>💵 Tiền mặt</b>
                </div>
                <div className="od-panel__sub">
                  Tạo lúc: <b>{dataInvoice?.createdTime ? formatDateCustom(dataInvoice.createdTime, "HH:mm · EEEEEE/MM") : ""}</b>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="od-items">
              <div className="od-items__header">
                <span>Sản phẩm</span>
                <span>Thành tiền</span>
              </div>
              {dataInvoice.items.map((item, i) => (
                <div key={i} className="od-items__row">
                  <span className="od-items__icon">
                    {item.image ? <img loading="lazy" src={item.image} alt={item.name} /> : <span style={{ fontSize: "30px" }}>{item.icon}</span>}
                  </span>
                  <div className="od-items__info">
                    <div className="od-items__name">{item.name}</div>
                    <div className="od-items__detail">{item.detail}</div>
                  </div>
                  <div className="od-items__total">{formatCurrency(item.total)}</div>
                </div>
              ))}
              <div className="od-items__grand">
                <span>TỔNG CỘNG</span>
                <span className="od-items__grand-val">
                  {formatCurrency(dataInvoice.items.reduce((total, item) => total + parseInt(item.total.replace(/[^0-9]/g, "")), 0))}
                </span>
              </div>
            </div>
          </>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
