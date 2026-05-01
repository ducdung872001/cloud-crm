// MentorHub notification bell — bell icon top-right + slide-up sheet showing notifications.
// Dùng NotificationService.list() và countUnread từ UserContext (đã setup trong CRM core).
import React, { useContext, useEffect, useState, useCallback } from "react";
import Icon from "components/icon";
import { UserContext, ContextType } from "contexts/userContext";
import NotificationService from "services/NotificationService";
import { showToast } from "utils/common";
import { formatDateCustom } from "utils/dateUtils";
import "./MHNotificationBell.scss";

interface NotificationItem {
  id: number;
  messageTitle?: string;
  messageText?: string;
  sentAt?: string;
  unread?: number | null; // 0/null = chưa đọc, 1 = đã đọc
  type?: string;
  [key: string]: unknown;
}

export default function MHNotificationBell() {
  const { countUnread, setCountUnread, newNotificationPayload } = useContext(UserContext) as ContextType;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await NotificationService.list({ limit: 20, page: 1 });
      if (res?.code === 0) {
        setItems(res.result?.items || []);
      } else {
        showToast(res?.message ?? "Không tải được thông báo", "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const res = await NotificationService.countUnread();
      const data = await res.json?.().catch(() => null);
      if (data && typeof data.result === "number") setCountUnread(data.result);
      else if (data && typeof data.result?.total === "number") setCountUnread(data.result.total);
    } catch (e) {
      // silent
    }
  }, [setCountUnread]);

  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  useEffect(() => {
    if (newNotificationPayload) {
      if (open) fetchList();
      fetchCount();
    }
  }, [newNotificationPayload, open, fetchList, fetchCount]);

  const markAllRead = async () => {
    try {
      const res = await NotificationService.updateReadAll({});
      if (res?.code === 0) {
        setItems((arr) => arr.map((n) => ({ ...n, unread: 1 })));
        setCountUnread(0);
      } else {
        showToast(res?.message ?? "Không đánh dấu được", "error");
      }
    } catch {
      showToast("Có lỗi xảy ra", "error");
    }
  };

  // unread: 0 hoặc null = chưa đọc, 1 = đã đọc (theo convention BE)
  const isUnread = (n: NotificationItem) => n.unread === 0 || n.unread === null || n.unread === undefined;

  return (
    <>
      <button
        type="button"
        className="mh-notif-bell"
        aria-label="Xem thông báo"
        onClick={() => setOpen(true)}
      >
        <Icon name="NotifyRox" />
        {countUnread ? (
          <span className="mh-notif-bell__badge">{countUnread > 99 ? "99+" : countUnread}</span>
        ) : null}
      </button>

      {open && (
        <>
          <div className="mh-notif-sheet__backdrop" onClick={() => setOpen(false)} />
          <div className="mh-notif-sheet" role="dialog" aria-label="Danh sách thông báo">
            <header className="mh-notif-sheet__head">
              <h3>Thông báo</h3>
              <div className="mh-notif-sheet__head-actions">
                {items.some(isUnread) && (
                  <button type="button" className="mh-notif-sheet__mark-read" onClick={markAllRead}>
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
                <button type="button" className="mh-notif-sheet__close" onClick={() => setOpen(false)} aria-label="Đóng">
                  ✕
                </button>
              </div>
            </header>
            <div className="mh-notif-sheet__body">
              {loading ? (
                <div className="mh-notif-sheet__empty">Đang tải…</div>
              ) : items.length === 0 ? (
                <div className="mh-notif-sheet__empty">Chưa có thông báo</div>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li key={n.id} className={"mh-notif-item" + (isUnread(n) ? " is-unread" : "")}>
                      <div className="mh-notif-item__title">{n.messageTitle || "Thông báo"}</div>
                      {n.messageText && <div className="mh-notif-item__content">{n.messageText}</div>}
                      {n.sentAt && (
                        <time className="mh-notif-item__time">
                          {formatDateCustom(n.sentAt, "H:mm · dd/MM/yyyy")}
                        </time>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
