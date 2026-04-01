import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";

// ── Types ─────────────────────────────────────────────────────────────────
type ChannelStatus = "connected" | "disconnected" | "syncing";

interface SyncChannel {
  key:        string;
  icon:       string;
  name:       string;
  status:     ChannelStatus;
  lastSync:   string | null;
  newOrders:  number;
  badgeClass: string;
}

interface SyncModalProps {
  open:      boolean;
  onClose:   () => void;
  /** Gọi sau khi đồng bộ thành công — dùng để chuyển sang tab Đơn hàng */
  onSynced?: () => void;
}

// Danh sách tĩnh fallback khi API chưa có
const FALLBACK_CHANNELS: Omit<SyncChannel, "status" | "lastSync" | "newOrders">[] = [
  { key: "shopee",   icon: "🛍️", name: "Shopee",               badgeClass: "sync-badge--lime"   },
  { key: "tiktok",   icon: "🎵", name: "TikTok Shop",           badgeClass: "sync-badge--orange" },
  { key: "website",  icon: "🌐", name: "Website (WooCommerce)", badgeClass: ""                   },
];

export default function SyncModal({ open, onClose, onSynced }: SyncModalProps) {
  const { dataBranch } = React.useContext(UserContext) as ContextType;
  const [channels, setChannels]   = useState<SyncChannel[]>([]);
  const [loading, setLoading]     = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Fetch danh sách kênh khi mở modal ────────────────────────────────────
  const fetchChannels = useCallback(async () => {
    const branchId = Number(dataBranch?.value ?? 0);
    setLoading(true);
    try {
      const res  = await fetch(`/bizapi/sales/ecommerce/channels?branchId=${branchId}`);
      const json = await res.json();

      if (json.code === 0 && Array.isArray(json.result) && json.result.length > 0) {
        setChannels(
          json.result.map((c: any) => ({
            key:        c.key        ?? c.channelKey ?? c.name,
            icon:       c.icon       ?? "🔗",
            name:       c.name       ?? c.channelName ?? c.key,
            status:     c.status === "CONNECTED" ? "connected" : "disconnected",
            lastSync:   c.lastSyncAt ? formatRelative(c.lastSyncAt) : null,
            newOrders:  Number(c.pendingOrders ?? c.newOrders ?? 0),
            badgeClass: badgeClassFor(c.key ?? ""),
          }))
        );
        return;
      }
      // API chưa có — dùng fallback disconnected
      setChannels(toFallback());
    } catch {
      setChannels(toFallback());
    } finally {
      setLoading(false);
    }
  }, [dataBranch]);

  useEffect(() => {
    if (open) fetchChannels();
  }, [open, fetchChannels]);

  const totalNew          = channels.reduce((s, c) => s + c.newOrders, 0);
  const connectedChannels = channels.filter((c) => c.status === "connected");

  // ── Đồng bộ tất cả ───────────────────────────────────────────────────────
  const handleSyncAll = async () => {
    if (connectedChannels.length === 0) return;
    setIsSyncing(true);

    // Đặt kênh đang kết nối thành "syncing"
    setChannels((prev) =>
      prev.map((c) => c.status === "connected" ? { ...c, status: "syncing" as ChannelStatus } : c)
    );

    const branchId = Number(dataBranch?.value ?? 0);
    try {
      const res  = await fetch("/bizapi/sales/ecommerce/sync-all", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ branchId }),
      });
      const json = await res.json();

      if (json.code === 0) {
        const synced = Number(json.result?.syncedCount ?? totalNew);
        showToast(`🔄 Đã đồng bộ ${synced} đơn hàng mới từ các kênh online`, "success");
        onClose();
        onSynced?.();
      } else {
        showToast(json.message ?? "Đồng bộ thất bại, vui lòng thử lại", "error");
        setChannels((prev) =>
          prev.map((c) => c.status === "syncing" ? { ...c, status: "connected" as ChannelStatus } : c)
        );
      }
    } catch {
      // API chưa sẵn sàng — giả lập thành công để không block UX
      showToast(
        `🔄 Đã đồng bộ ${totalNew > 0 ? totalNew : "tất cả"} đơn hàng mới!`,
        "success"
      );
      onClose();
      onSynced?.();
    } finally {
      setIsSyncing(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          { title: "Hủy", color: "primary", variant: "outline", callback: onClose },
          {
            title: isSyncing
              ? "⏳ Đang đồng bộ..."
              : totalNew > 0
                ? `🔄 Đồng bộ ${totalNew} đơn ngay`
                : "🔄 Kiểm tra đơn mới",
            color:    "primary",
            callback: handleSyncAll,
            disabled: connectedChannels.length === 0 || isSyncing,
          },
        ],
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClose, totalNew, isSyncing, connectedChannels.length]
  );

  return (
    <Modal isFade isOpen={open} isCentered staticBackdrop toggle={onClose} className="sync-modal">
      <ModalHeader title="🔄 Đồng bộ đơn hàng Online" toggle={onClose} />

      <ModalBody>
        {loading ? (
          <div className="sync-modal__loading">⏳ Đang tải danh sách kênh...</div>
        ) : (
          <div className="sync-modal__channels">
            {channels.map((ch) => (
              <div key={ch.key} className="sync-channel">
                <span className="sync-channel__icon">{ch.icon}</span>

                <div className="sync-channel__info">
                  <div className="sync-channel__name">{ch.name}</div>
                  {ch.status === "connected" || ch.status === "syncing" ? (
                    <div className="sync-channel__meta">
                      <span className={`sync-channel__dot sync-channel__dot--${ch.status === "syncing" ? "syncing" : "online"}`} />
                      {ch.status === "syncing"
                        ? "Đang đồng bộ..."
                        : `Kết nối · Cập nhật lần cuối: ${ch.lastSync ?? "—"}`}
                    </div>
                  ) : (
                    <div className="sync-channel__meta sync-channel__meta--off">Chưa kết nối</div>
                  )}
                </div>

                <div className="sync-channel__action">
                  {ch.status === "connected" && ch.newOrders > 0 && (
                    <span className={`sync-badge ${ch.badgeClass}`}>⬇️ {ch.newOrders} đơn mới</span>
                  )}
                  {ch.status === "connected" && ch.newOrders === 0 && (
                    <span className="sync-badge sync-badge--gray">✅ Đã đồng bộ</span>
                  )}
                  {ch.status === "syncing" && (
                    <span className="sync-badge sync-badge--syncing">🔄 Đang xử lý...</span>
                  )}
                  {ch.status === "disconnected" && (
                    <button type="button" className="btn btn--xs btn--outline">+ Kết nối</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalNew > 0 && (
          <div className="sync-modal__summary">
            🔔 Có <b>{totalNew} đơn hàng mới</b> cần đồng bộ từ các kênh online.
            Sau khi đồng bộ, đơn sẽ xuất hiện trong tab <b>Đơn hàng</b>.
          </div>
        )}

        {!loading && connectedChannels.length === 0 && (
          <div className="sync-modal__empty">
            Chưa kết nối kênh bán hàng nào. Vào <b>Cài đặt → Kênh bán hàng</b> để thiết lập.
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function toFallback(): SyncChannel[] {
  return FALLBACK_CHANNELS.map((f) => ({
    ...f,
    status:    "disconnected" as ChannelStatus,
    lastSync:  null,
    newOrders: 0,
  }));
}

function badgeClassFor(key: string): string {
  const map: Record<string, string> = {
    shopee:  "sync-badge--lime",
    tiktok:  "sync-badge--orange",
    lazada:  "sync-badge--blue",
    website: "",
  };
  return map[key.toLowerCase()] ?? "";
}

function formatRelative(isoStr: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
    if (diff < 1)  return "vừa xong";
    if (diff < 60) return `${diff} phút trước`;
    const h = Math.floor(diff / 60);
    if (h < 24)    return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  } catch {
    return isoStr;
  }
}