import React, { useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import "./index.scss";

interface SyncModalProps {
  open: boolean;
  onClose: () => void;
}

const CHANNELS = [
  {
    icon: "🛍️",
    name: "Shopee",
    status: "connected" as const,
    lastSync: "5 phút trước",
    newOrders: 3,
    badgeClass: "sync-badge--lime",
  },
  {
    icon: "🎵",
    name: "TikTok Shop",
    status: "connected" as const,
    lastSync: "12 phút trước",
    newOrders: 1,
    badgeClass: "sync-badge--orange",
  },
  {
    icon: "🌐",
    name: "Website (WooCommerce)",
    status: "disconnected" as const,
    lastSync: null,
    newOrders: 0,
    badgeClass: "",
  },
];

export default function SyncModal({ open, onClose }: SyncModalProps) {
  const totalNew = CHANNELS.reduce((s, c) => s + c.newOrders, 0);

  const handleSyncAll = () => {
    onClose();
    showToast(`🔄 Đã đồng bộ ${totalNew} đơn hàng mới!`, "success");
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: onClose,
          },
          {
            title: "🔄 Đồng bộ tất cả ngay",
            color: "primary",
            callback: handleSyncAll,
          },
        ],
      },
    }),
    [onClose, totalNew]
  );

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={onClose} className="sync-modal">
      <ModalHeader title="🔄 Đồng bộ đơn hàng Online" toggle={onClose} />

      <ModalBody>
        <div className="sync-modal__channels">
          {CHANNELS.map((ch) => (
            <div key={ch.name} className="sync-channel">
              <span className="sync-channel__icon">{ch.icon}</span>
              <div className="sync-channel__info">
                <div className="sync-channel__name">{ch.name}</div>
                {ch.status === "connected" ? (
                  <div className="sync-channel__meta">
                    <span className="sync-channel__dot sync-channel__dot--online" />
                    Kết nối · Cập nhật lần cuối: {ch.lastSync}
                  </div>
                ) : (
                  <div className="sync-channel__meta sync-channel__meta--off">Chưa kết nối</div>
                )}
              </div>
              <div className="sync-channel__action">
                {ch.status === "connected" && ch.newOrders > 0 && <span className={`sync-badge ${ch.badgeClass}`}>⬇️ {ch.newOrders} đơn mới</span>}
                {ch.status === "connected" && ch.newOrders === 0 && <span className="sync-badge sync-badge--gray">✅ Đã đồng bộ</span>}
                {ch.status === "disconnected" && (
                  <button type="button" className="btn btn--xs btn--outline">
                    + Kết nối
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalNew > 0 && (
          <div className="sync-modal__summary">
            🔔 Có <b>{totalNew} đơn hàng mới</b> cần đồng bộ từ các kênh online
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
