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

const EMPTY_INVOICE = {
  id: 0,
  code: "",
  source: "offline",
  customer: { id: "", name: "", phone: "", points: 0, tier: "", color: "#2563eb", rank: "" },
  paymentMethod: "",
  createdTime: "",
  status: "pending",
  items: [],
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

  // Ưu tiên data từ API; fallback sang customerInfo (từ row danh sách) cho
  // các field BE chưa trả về (SĐT, điểm loyalty, hạng thành viên).
  const dataInvoice = useMemo(() => {
    const base = dataInvoiceApi ?? EMPTY_INVOICE;
    return {
      ...base,
      customer: {
        ...base.customer,
        name: base.customer?.name || customerInfo?.name || "Khách vãng lai",
        phone: base.customer?.phone || customerInfo?.phone || "",
        points: base.customer?.points || customerInfo?.points || 0,
        rank: base.customer?.rank || customerInfo?.tier || "",
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
