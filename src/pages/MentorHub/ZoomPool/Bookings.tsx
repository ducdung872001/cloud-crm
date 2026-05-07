// [MH] Zoom Pool — đặt lịch của tôi (booking từ pool / từ peer-borrow approved)
import React, { useEffect, useState } from "react";
import { listMyBookings, cancelBooking, type ZoomBooking } from "@/services/mentorhub/zoomPoolApi";
import "../_shared/styles.scss";
import "./ZoomPool.scss";

const fmtRange = (s: string, e: string) => {
  const ds = new Date(s), de = new Date(e);
  return `${ds.toLocaleDateString("vi-VN")} · ${ds.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}–${de.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
};

export default function MHZoomPoolBookings() {
  document.title = "Đặt lịch Zoom · MentorHub";
  const [bookings, setBookings] = useState<ZoomBooking[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "cancelled" | "completed">("all");
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    try {
      setBookings(await listMyBookings(filter === "all" ? undefined : filter));
    } catch { setToast("Không tải được"); }
  };
  useEffect(() => { void load(); }, [filter]);

  const cancel = async (id: string) => {
    if (!confirm("Huỷ booking? Refund 100% nếu trước H-2, 50% trước H-0, 0% sau giờ bắt đầu.")) return;
    try {
      const r = await cancelBooking(id);
      setToast(`Đã huỷ — refund ${r.refunded} credit`);
      setTimeout(() => setToast(null), 4000);
      await load();
    } catch (e: any) {
      setToast(e?.response?.data?.error ?? "Lỗi");
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">ZOOM POOL · BOOKINGS</div>
        <h1>Đặt <em>lịch</em> Zoom của tôi</h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>
          Tất cả slot Zoom bạn đã book từ pool hoặc qua yêu cầu mượn peer-to-peer.
        </p>
      </div>

      <div className="mh-zp-filter-group" style={{ marginBottom: 16 }}>
        {(["all", "active", "cancelled", "completed"] as const).map((o) => (
          <button
            key={o}
            type="button"
            className={`mh-zp-chip${filter === o ? " is-active" : ""}`}
            onClick={() => setFilter(o)}
          >
            {o === "all" ? "Tất cả" : o === "active" ? "Đang hiệu lực" : o === "cancelled" ? "Đã huỷ" : "Đã xong"}
          </button>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="mh__card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--mh-ink-soft)" }}>Chưa có booking nào.</p>
        </div>
      )}

      <div className="mh-zp-slot-list">
        {bookings.map((b) => (
          <div key={b.id} className="mh-zp-slot-card">
            <div className="mh-zp-slot-card__time">{fmtRange(b.startsAt, b.endsAt)}</div>
            <div className="mh-zp-slot-card__meta">
              <span className={`mh__pill mh__pill--${b.status === "active" ? "green" : b.status === "cancelled" ? "draft" : "upcoming"}`}>{b.status}</span>
              <span style={{ fontSize: 12, color: "var(--mh-ink-soft)" }}>
                {b.creditCost} credit · session {b.sessionId}
                {b.fromBorrowRequestId && ` · từ peer-borrow ${b.fromBorrowRequestId}`}
              </span>
            </div>
            {b.status === "active" && new Date(b.startsAt) > new Date() && (
              <button type="button" className="mh__btn mh__btn--danger" onClick={() => cancel(b.id)}>Huỷ</button>
            )}
          </div>
        ))}
      </div>

      {toast && <div className="mh-zp-toast mh-zp-toast--ok">{toast}</div>}
    </div>
  );
}
