// CH Events — Event detail với 4 tabs: Info · Người đăng ký · Check-in · Chia sẻ
// Route: /ch_events/:id

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventStorage } from "./storage";
import type { EventEntity, EventRegistration, EventStats, RegistrationStatus } from "./types";
import {
  THEME,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  formatDateTime,
  formatVND,
  getEffectiveStatus,
  getShareUrl,
} from "./shared";
import PaymentProofReview from "./components/PaymentProofReview";
import CheckinBoard from "./components/CheckinBoard";
import CheckinServiceTracker from "./components/CheckinServiceTracker";

type TabKey = "info" | "registrants" | "checkin" | "share";

export default function EventDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>("info");
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [evt, regs] = await Promise.all([
        eventStorage.getEventAsync(id),
        eventStorage.listRegistrationsByEventAsync(id),
      ]);
      setEvent(evt);
      setRegistrations(regs);
      // Stats vẫn tính local từ regs (hoặc API nếu có)
      setStats(eventStorage.getEventStats(id));
    } catch {
      setEvent(eventStorage.getEvent(id));
      setRegistrations(eventStorage.listRegistrationsByEvent(id));
      setStats(eventStorage.getEventStats(id));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: THEME.textMuted }}>
        Đang tải...
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: THEME.textMuted }}>
        <h2>Không tìm thấy sự kiện</h2>
        <button
          onClick={() => navigate("/ch_events")}
          style={{
            padding: "8px 14px",
            background: THEME.primary,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const effStatus = getEffectiveStatus(
    event.status,
    event.startDate,
    event.endDate
  );
  const refresh = () => loadData();

  const handleTogglePublish = async () => {
    if (event.status === "draft") {
      await eventStorage.publishEventAsync(event.id);
    } else {
      await eventStorage.unpublishEventAsync(event.id);
    }
    refresh();
  };

  return (
    <div style={{ padding: 20, background: THEME.bg, minHeight: "calc(100vh - 60px)" }}>
      {/* Breadcrumb + actions */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={() => navigate("/ch_events")}
          style={{
            padding: "6px 12px",
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ← Danh sách
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate(`/ch_events/${event.id}/edit`)}
          style={{
            padding: "6px 14px",
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ✏️ Sửa
        </button>
        <button
          onClick={handleTogglePublish}
          style={{
            padding: "6px 14px",
            background: event.status === "draft" ? THEME.success : THEME.warning,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {event.status === "draft" ? "🚀 Công bố" : "⏸ Ẩn khỏi public"}
        </button>
      </div>

      {/* Header card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${THEME.border}`,
          marginBottom: 14,
          display: "flex",
          gap: 0,
        }}
      >
        <div
          style={{
            width: 280,
            background: event.coverImageUrl
              ? `url(${event.coverImageUrl}) center/cover`
              : `linear-gradient(135deg, ${THEME.primarySoft}, ${THEME.primary})`,
            minHeight: 180,
          }}
        />
        <div style={{ padding: 20, flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span
              style={{
                padding: "3px 10px",
                background: EVENT_STATUS_COLORS[effStatus],
                color: "#fff",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {EVENT_STATUS_LABELS[effStatus]}
            </span>
            {event.category && (
              <span
                style={{
                  padding: "3px 10px",
                  background: THEME.primarySoft,
                  color: THEME.primaryDark,
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {event.category}
              </span>
            )}
            {event.ticketPrice === 0 && (
              <span
                style={{
                  padding: "3px 10px",
                  background: THEME.success,
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                MIỄN PHÍ
              </span>
            )}
          </div>
          <h2 style={{ margin: 0, color: THEME.primaryDark }}>{event.title}</h2>
          <p
            style={{
              fontSize: 13,
              color: THEME.textMain,
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            {event.description}
          </p>
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
              fontSize: 12,
              color: THEME.textMuted,
            }}
          >
            <div>
              🕐 <strong style={{ color: THEME.primaryDark }}>Bắt đầu</strong>
              <br />
              {formatDateTime(event.startDate)}
            </div>
            <div>
              🏁 <strong style={{ color: THEME.primaryDark }}>Kết thúc</strong>
              <br />
              {formatDateTime(event.endDate)}
            </div>
            <div>
              📍 <strong style={{ color: THEME.primaryDark }}>Địa điểm</strong>
              <br />
              {event.venue.isOnline ? "Online" : event.venue.name}
            </div>
            <div>
              💰 <strong style={{ color: THEME.primaryDark }}>Giá vé</strong>
              <br />
              {event.ticketPrice
                ? `${formatVND(event.ticketPrice)} đ`
                : "Miễn phí"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <MiniStat label="Tổng đăng ký" value={stats.totalRegistrations} />
          <MiniStat
            label="Chờ xác nhận"
            value={stats.pendingCount}
            tone="warning"
          />
          <MiniStat
            label="Đã xác nhận"
            value={stats.confirmedCount}
            tone="primary"
          />
          <MiniStat
            label="Đã check-in"
            value={stats.checkedInCount}
            tone="info"
          />
          <MiniStat
            label="Đã thành hội viên"
            value={stats.convertedToMemberCount}
            tone="success"
          />
          <MiniStat
            label="Tỉ lệ lấp đầy"
            value={`${Math.round(stats.fillRate * 100)}%`}
            tone="primary"
          />
          {stats.totalRevenue > 0 && (
            <MiniStat
              label="Tổng doanh thu"
              value={`${formatVND(stats.totalRevenue)}đ`}
              tone="success"
            />
          )}
          {stats.paymentPendingCount > 0 && (
            <MiniStat
              label="Chờ duyệt TT"
              value={stats.paymentPendingCount}
              tone="warning"
            />
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {(
          [
            { key: "info", label: "📋 Thông tin chi tiết" },
            {
              key: "registrants",
              label: `👥 Người đăng ký (${registrations.length})`,
            },
            { key: "checkin", label: "✅ Check-in" },
            { key: "share", label: "🔗 Chia sẻ & công bố" },
          ] as { key: TabKey; label: string }[]
        ).map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 16px",
                background: active ? THEME.primarySoft : "#fff",
                color: active ? THEME.primaryDark : THEME.textMuted,
                border: active
                  ? `2px solid ${THEME.primary}`
                  : `1px solid ${THEME.border}`,
                borderRadius: 999,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: active ? 700 : 500,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "info" && <InfoTab event={event} />}
      {tab === "registrants" && (
        <RegistrantsTab
          event={event}
          registrations={registrations}
          onRefresh={refresh}
        />
      )}
      {tab === "checkin" && (
        <Card title="✅ Check-in / Check-out">
          <CheckinBoard
            event={event}
            registrations={registrations}
            onRefresh={refresh}
          />
          {/* ĐẶC THÙ: Service usage tracker */}
          <CheckinServiceTracker
            registrations={registrations}
            onRefresh={refresh}
          />
        </Card>
      )}
      {tab === "share" && <ShareTab event={event} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Info tab
// ═══════════════════════════════════════════════════════════════════════
function InfoTab({ event }: { event: EventEntity }) {
  const hasCoordinates = event.venue.latitude != null && event.venue.longitude != null;
  const venueImages = event.venue.venueImages ?? [];
  const bank = event.bankAccountOverride;
  // QR VietQR động: reuse endpoint /billing/vietqr/api/generate_qr khi thanh toán thật.
  // Hiện hiển thị link Google Chart QR tạm (tránh phụ thuộc backend cho preview).
  const qrPayload = bank && event.ticketPrice
    ? `${bank.bank}|${bank.accountNumber}|${event.ticketPrice}|EVENT-${event.slug}`
    : null;
  const qrImgSrc = qrPayload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrPayload)}`
    : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card title="📝 Nội dung chi tiết">
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: THEME.textMain,
            }}
            dangerouslySetInnerHTML={{
              __html:
                event.content || "<em style='color: #999'>(Chưa có nội dung)</em>",
            }}
          />
        </Card>
        {!event.venue.isOnline && hasCoordinates && (
          <Card title="🗺️ Bản đồ">
            <iframe
              title="Google Maps"
              src={`https://www.google.com/maps?q=${event.venue.latitude},${event.venue.longitude}&z=16&output=embed`}
              style={{ border: 0, width: "100%", height: 280, borderRadius: 6 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${event.venue.latitude},${event.venue.longitude}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "6px 12px",
                background: THEME.primary,
                color: "#fff",
                borderRadius: 4,
                fontSize: 12,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              📍 Chỉ đường tới đây
            </a>
          </Card>
        )}
        {venueImages.length > 0 && (
          <Card title="📷 Ảnh địa điểm">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
              {venueImages.map((url, i) => (
                <img
                  key={i}
                  loading="lazy"
                  src={url}
                  alt={`Ảnh địa điểm ${i + 1}`}
                  style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
                  onClick={() => window.open(url, "_blank")}
                />
              ))}
            </div>
          </Card>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card title="📍 Địa điểm">
          {event.venue.isOnline ? (
            <>
              <Row label="Hình thức" value="Online" />
              <Row
                label="Link"
                value={
                  <a
                    href={event.venue.onlineUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: THEME.primary, wordBreak: "break-all" }}
                  >
                    {event.venue.onlineUrl}
                  </a>
                }
              />
            </>
          ) : (
            <>
              <Row label="Tên" value={event.venue.name} />
              <Row label="Địa chỉ" value={event.venue.address} />
              {event.venue.city && (
                <Row label="Thành phố" value={event.venue.city} />
              )}
              {event.venue.mapUrl && (
                <Row
                  label="Map"
                  value={
                    <a
                      href={event.venue.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: THEME.primary, wordBreak: "break-all" }}
                    >
                      Xem Google Maps ↗
                    </a>
                  }
                />
              )}
            </>
          )}
        </Card>
        {bank && (
          <Card title="💳 Thanh toán qua QR">
            <div style={{ textAlign: "center" }}>
              {qrImgSrc ? (
                <img
                  src={qrImgSrc}
                  alt="QR chuyển khoản"
                  style={{ width: 160, height: 160, margin: "6px auto", display: "block", border: `1px solid ${THEME.border}`, borderRadius: 4 }}
                />
              ) : (
                <div style={{ fontSize: 11, color: THEME.textMuted, fontStyle: "italic", padding: "20px 0" }}>
                  (QR chỉ sinh khi sự kiện có giá vé &gt; 0)
                </div>
              )}
            </div>
            <Row label="Ngân hàng" value={bank.bank} />
            <Row label="Chủ TK" value={bank.holder} />
            <Row label="Số TK" value={<strong>{bank.accountNumber}</strong>} />
            {bank.phone && <Row label="SĐT" value={bank.phone} />}
            {event.ticketPrice ? (
              <Row label="Số tiền" value={<strong style={{ color: THEME.primary }}>{formatVND(event.ticketPrice)} đ</strong>} />
            ) : null}
            <div style={{ marginTop: 8, fontSize: 11, color: THEME.textMuted, fontStyle: "italic" }}>
              Khi tham gia có add-on, tổng tiền cuối sẽ tự tính theo các dịch vụ đã chọn.
            </div>
          </Card>
        )}
        <Card title="📞 Người liên hệ">
          <Row label="Họ tên" value={event.contactPerson.name} />
          {event.contactPerson.role && (
            <Row label="Vai trò" value={event.contactPerson.role} />
          )}
          <Row label="SĐT" value={event.contactPerson.phone} />
          {event.contactPerson.email && (
            <Row label="Email" value={event.contactPerson.email} />
          )}
        </Card>
        <Card title="🎟️ Đăng ký">
          <Row
            label="Mở đăng ký"
            value={formatDateTime(event.registrationOpenDate)}
          />
          <Row
            label="Đóng đăng ký"
            value={formatDateTime(event.registrationCloseDate)}
          />
          <Row
            label="Sức chứa"
            value={
              event.maxAttendees
                ? `${event.maxAttendees} người`
                : "Không giới hạn"
            }
          />
          <Row
            label="Giá vé"
            value={
              event.ticketPrice
                ? `${formatVND(event.ticketPrice)} đ`
                : "Miễn phí"
            }
          />
        </Card>
        {event.tags && event.tags.length > 0 && (
          <Card title="🏷️ Tags">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {event.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "3px 10px",
                    background: THEME.primarySoft,
                    color: THEME.primaryDark,
                    borderRadius: 999,
                    fontSize: 11,
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Registrants tab — với các nút đổi trạng thái + convert → member
// ═══════════════════════════════════════════════════════════════════════
function RegistrantsTab({
  event,
  registrations,
  onRefresh,
}: {
  event: EventEntity;
  registrations: EventRegistration[];
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<RegistrationStatus | "all">("all");

  const filtered =
    filter === "all" ? registrations : registrations.filter((r) => r.status === filter);

  const handleStatusChange = async (reg: EventRegistration, status: RegistrationStatus) => {
    await eventStorage.updateRegistrationStatusAsync(reg.id, status);
    onRefresh();
  };

  const handleConvert = async (reg: EventRegistration) => {
    if (reg.convertedToCustomerId) {
      alert(`Đã chuyển thành hội viên trước đó. ID: ${reg.convertedToCustomerId}`);
      return;
    }
    if (
      !confirm(
        `Tạo hội viên mới từ "${reg.fullName}"?\n\n` +
          `SĐT: ${reg.phone}\n` +
          `Email: ${reg.email ?? "—"}\n\n` +
          `Sau đó bạn có thể bán thêm gói thành viên / dịch vụ cho họ ở phân hệ Sales.`
      )
    )
      return;
    const result = await eventStorage.markConvertedToMemberAsync(reg.id);
    alert(
      `✓ Đã tạo hội viên.\n\nCustomer ID: ${result?.convertedToCustomerId ?? "N/A"}`
    );
    onRefresh();
  };

  const handleIssueTicket = async (reg: EventRegistration) => {
    if (reg.ticketCode) {
      alert(`Vé đã phát hành: ${reg.ticketCode}`);
      return;
    }
    const updated = await eventStorage.updateRegistrationStatusAsync(reg.id, "confirmed");
    alert(
      `🎟️ Đã phát hành vé cho ${reg.fullName}\n\nMã vé: ${updated?.ticketCode ?? "—"}`
    );
    onRefresh();
  };

  const handleExportExcel = async () => {
    try {
      await exportRegistrationsToExcel(event, filtered);
    } catch (err) {
      alert(`Không thể xuất Excel: ${err instanceof Error ? err.message : "lỗi không xác định"}`);
    }
  };

  return (
    <Card title={`Danh sách người đăng ký (${registrations.length})`}>
      {/* Toolbar: filter chips + Export button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["all", "pending", "confirmed", "checked_in", "cancelled"] as const).map(
          (s) => {
            const active = filter === s;
            const label =
              s === "all"
                ? `Tất cả (${registrations.length})`
                : `${REGISTRATION_STATUS_LABELS[s as RegistrationStatus]} (${
                    registrations.filter((r) => r.status === s).length
                  })`;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${
                    active ? THEME.primary : THEME.border
                  }`,
                  background: active ? THEME.primarySoft : "#fff",
                  color: active ? THEME.primaryDark : THEME.textMuted,
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {label}
              </button>
            );
          }
        )}
        </div>
        <button
          onClick={handleExportExcel}
          disabled={filtered.length === 0}
          style={{
            padding: "6px 14px",
            background: filtered.length === 0 ? THEME.border : THEME.primary,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            cursor: filtered.length === 0 ? "not-allowed" : "pointer",
            opacity: filtered.length === 0 ? 0.6 : 1,
          }}
          title="Xuất Excel bảng tổng hợp đăng ký (multi-column theo add-on)"
        >
          📥 Xuất Excel tổng hợp
        </button>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: THEME.textMuted,
            fontSize: 13,
          }}
        >
          Chưa có ai đăng ký hoặc không có kết quả khớp bộ lọc.
          <br />
          <a
            href={`/crm/events/${encodeURIComponent(event.slug)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: THEME.primary, fontSize: 12 }}
          >
            Mở link public để test đăng ký →
          </a>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr
                style={{
                  background: THEME.primarySoft,
                  textAlign: "left",
                }}
              >
                <th style={thStyle}>Họ tên</th>
                <th style={thStyle}>Liên hệ</th>
                <th style={thStyle}>Đăng ký lúc</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Thanh toán</th>
                <th style={thStyle}>Add-on</th>
                <th style={thStyle}>Tổng tiền</th>
                <th style={thStyle}>Vé</th>
                <th style={thStyle}>Hội viên</th>
                <th style={thStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderTop: `1px solid ${THEME.border}` }}
                >
                  <td style={tdStyle}>
                    <strong style={{ color: THEME.primaryDark }}>
                      {r.fullName}
                    </strong>
                    {r.company && (
                      <div
                        style={{ fontSize: 10, color: THEME.textMuted }}
                      >
                        {r.company}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {r.phone}
                    {r.email && (
                      <div style={{ fontSize: 10, color: THEME.textMuted }}>
                        {r.email}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>{formatDateTime(r.registeredAt)}</td>
                  <td style={tdStyle}>
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(
                          r,
                          e.target.value as RegistrationStatus
                        )
                      }
                      style={{
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: `1px solid ${
                          REGISTRATION_STATUS_COLORS[r.status]
                        }`,
                        background: "#fff",
                        color: REGISTRATION_STATUS_COLORS[r.status],
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {(
                        Object.keys(
                          REGISTRATION_STATUS_LABELS
                        ) as RegistrationStatus[]
                      ).map((s) => (
                        <option key={s} value={s}>
                          {REGISTRATION_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Thanh toán */}
                  <td style={tdStyle}>
                    <PaymentProofReview
                      proof={r.paymentProof}
                      onApprove={async () => {
                        await eventStorage.reviewPaymentProofAsync(r.id, true);
                        onRefresh();
                      }}
                      onReject={async (reason) => {
                        await eventStorage.reviewPaymentProofAsync(r.id, false, reason);
                        onRefresh();
                      }}
                    />
                  </td>
                  {/* Add-on */}
                  <td style={tdStyle}>
                    {r.selectedAddOns && r.selectedAddOns.length > 0 ? (
                      <div style={{ fontSize: 10, color: THEME.textMuted }}>
                        {r.selectedAddOns.map((s) => {
                          const item = (event.addOnItems ?? []).find((i) => i.id === s.addOnId);
                          return item ? `${item.name} x${s.qty}` : null;
                        }).filter(Boolean).join(", ")}
                      </div>
                    ) : (
                      <span style={{ color: THEME.textMuted, fontSize: 10 }}>—</span>
                    )}
                  </td>
                  {/* Tổng tiền */}
                  <td style={tdStyle}>
                    {r.totalAmount ? (
                      <span style={{ fontWeight: 700, fontSize: 11, color: THEME.primaryDark }}>
                        {formatVND(r.totalAmount)}đ
                      </span>
                    ) : (
                      <span style={{ color: THEME.textMuted, fontSize: 10 }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {r.ticketCode ? (
                      <code
                        style={{
                          fontSize: 10,
                          background: THEME.primarySoft,
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {r.ticketCode}
                      </code>
                    ) : (
                      <span style={{ color: THEME.textMuted, fontSize: 10 }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {r.convertedToCustomerId ? (
                      <span style={{ color: THEME.success, fontSize: 11, fontWeight: 700 }}>
                        ✓ {r.convertedToCustomerId.slice(0, 10)}…
                      </span>
                    ) : (
                      <span style={{ color: THEME.textMuted, fontSize: 10 }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {!r.ticketCode && (
                        <button
                          onClick={() => handleIssueTicket(r)}
                          style={smallBtn(THEME.primary, "#fff")}
                          title="Xác nhận + phát hành vé"
                        >
                          🎟️ Vé
                        </button>
                      )}
                      {!r.convertedToCustomerId && (
                        <button
                          onClick={() => handleConvert(r)}
                          style={smallBtn(THEME.accent, "#fff")}
                          title="Chuyển thành hội viên"
                        >
                          👤 Hội viên
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Share tab
// ═══════════════════════════════════════════════════════════════════════
function ShareTab({ event }: { event: EventEntity }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(event.slug);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isPublished = event.status === "published" || event.status === "ongoing";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Card title="🔗 Link công khai">
        {!isPublished && (
          <div
            style={{
              padding: "10px 12px",
              background: "#FFFBEB",
              borderLeft: `4px solid ${THEME.warning}`,
              borderRadius: 6,
              fontSize: 12,
              color: "#92400E",
              marginBottom: 10,
            }}
          >
            ⚠ Sự kiện đang ở trạng thái <b>nháp</b>. Công bố trước khi chia sẻ
            để user có thể đăng ký.
          </div>
        )}
        <div
          style={{
            padding: 12,
            background: THEME.bg,
            border: `1px dashed ${THEME.border}`,
            borderRadius: 6,
            fontFamily: "monospace",
            fontSize: 11,
            wordBreak: "break-all",
            color: THEME.primaryDark,
            marginBottom: 10,
          }}
        >
          {shareUrl}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: "10px",
              background: copied ? THEME.success : THEME.primary,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {copied ? "✓ Đã copy" : "📋 Copy link"}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 16px",
              background: "#fff",
              color: THEME.primaryDark,
              border: `1px solid ${THEME.border}`,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ↗ Mở trong tab mới
          </a>
        </div>
      </Card>

      <Card title="📲 Chia sẻ nhanh">
        <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 0 }}>
          Chia sẻ lên kênh có sẵn (prototype — chỉ mở link, chưa tích hợp API
          social).
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <SocialBtn
            label="Facebook"
            icon="📘"
            url={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
          />
          <SocialBtn
            label="Zalo"
            icon="💬"
            url={`https://zalo.me/share?u=${encodeURIComponent(shareUrl)}`}
          />
          <SocialBtn
            label="Email"
            icon="📧"
            url={`mailto:?subject=${encodeURIComponent(
              event.title
            )}&body=${encodeURIComponent(
              `${event.description}\n\nĐăng ký tại: ${shareUrl}`
            )}`}
          />
          <SocialBtn
            label="SMS"
            icon="📱"
            url={`sms:?body=${encodeURIComponent(
              `${event.title} — ${shareUrl}`
            )}`}
          />
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Shared small components
// ═══════════════════════════════════════════════════════════════════════
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: THEME.primaryDark,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
        borderBottom: `1px dashed ${THEME.border}`,
        fontSize: 12,
      }}
    >
      <span style={{ color: THEME.textMuted }}>{label}</span>
      <span
        style={{
          color: THEME.primaryDark,
          fontWeight: 600,
          textAlign: "right",
          maxWidth: "60%",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "primary" | "warning" | "info" | "success";
}) {
  const color = {
    primary: THEME.primary,
    warning: THEME.warning,
    info: THEME.info,
    success: THEME.success,
  }[tone];
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 8,
        padding: "10px 14px",
      }}
    >
      <div style={{ fontSize: 10, color: THEME.textMuted }}>{label}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: THEME.primaryDark,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SocialBtn({ label, icon, url }: { label: string; icon: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        padding: "10px",
        background: THEME.primarySoft,
        color: THEME.primaryDark,
        borderRadius: 6,
        textAlign: "center",
        textDecoration: "none",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {icon} {label}
    </a>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 11,
  color: THEME.primaryDark,
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 12,
  color: THEME.textMain,
  verticalAlign: "top",
};

function smallBtn(bg: string, color: string): React.CSSProperties {
  return {
    padding: "4px 8px",
    background: bg,
    color: color,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 700,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// Excel Export: Bảng tổng hợp đăng ký (multi-column header theo add-on group)
// Match format Excel khách hàng W-House cung cấp ở docs/requirements/other.jpg
// ═══════════════════════════════════════════════════════════════════════
async function exportRegistrationsToExcel(
  event: EventEntity,
  registrations: EventRegistration[]
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const { saveAs } = await import("file-saver");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(event.title.slice(0, 31) || "Đăng ký");

  const addOns = event.addOnItems ?? [];
  // Group add-ons theo field `group` (undefined → "Khác")
  const addOnsByGroup = addOns.reduce<Record<string, typeof addOns>>((acc, a) => {
    const key = a.group ?? "Khác";
    (acc[key] ??= []).push(a);
    return acc;
  }, {});
  const groupEntries = Object.entries(addOnsByGroup);
  const totalAddOnCols = addOns.length;

  // ── Title banner (rows 1-2) ──
  ws.mergeCells(1, 1, 2, 4 + totalAddOnCols + 2);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = `W-HOUSE — ${event.title.toUpperCase()}\nNGÀY ${formatDateTime(event.startDate)}`;
  titleCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  titleCell.font = { size: 14, bold: true, color: { argb: "FF8B0000" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8E6" } };

  // ── Row 3: Group headers + fixed left/right ──
  const fixedLeft = ["STT", "Họ và tên", "Mã số", "Số nhà"];
  let col = 1;
  fixedLeft.forEach((label) => {
    const c = ws.getCell(3, col);
    c.value = label;
    ws.mergeCells(3, col, 4, col);
    col++;
  });
  // Group cells with colspan
  groupEntries.forEach(([groupName, items]) => {
    ws.mergeCells(3, col, 3, col + items.length - 1);
    const c = ws.getCell(3, col);
    c.value = groupName;
    col += items.length;
  });
  const totalCol = col;
  ws.getCell(3, totalCol).value = "Tổng tiền đăng ký";
  ws.mergeCells(3, totalCol, 4, totalCol);
  const proofCol = totalCol + 1;
  ws.getCell(3, proofCol).value = "Ảnh chuyển khoản";
  ws.mergeCells(3, proofCol, 4, proofCol);

  // ── Row 4: Detail headers under each group ──
  col = fixedLeft.length + 1;
  groupEntries.forEach(([, items]) => {
    items.forEach((a) => {
      const c = ws.getCell(4, col);
      c.value = `${a.name}\n${formatVND(a.unitPrice)}đ`;
      c.alignment = { wrapText: true, horizontal: "center", vertical: "middle" };
      col++;
    });
  });

  // Style all header rows 3-4
  [3, 4].forEach((r) => {
    ws.getRow(r).eachCell((c) => {
      c.font = { bold: true, size: 10 };
      c.alignment = { ...c.alignment, horizontal: "center", vertical: "middle", wrapText: true };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDF3D0" } };
      c.border = {
        top:    { style: "thin" },
        left:   { style: "thin" },
        bottom: { style: "thin" },
        right:  { style: "thin" },
      };
    });
  });

  // ── Data rows (from row 5) ──
  registrations.forEach((r, i) => {
    const rowValues: (string | number)[] = [
      i + 1,
      r.customerAttributes?.name ?? r.fullName,
      r.customerAttributes?.mentorCode ?? "",
      r.customerAttributes?.houseNumber ?? "",
    ];
    groupEntries.forEach(([, items]) => {
      items.forEach((a) => {
        const sel = r.selectedAddOns?.find((s) => s.addOnId === a.id);
        rowValues.push(sel ? (sel.qty > 1 ? `✓ x${sel.qty}` : "✓") : "");
      });
    });
    rowValues.push(formatVND(r.totalAmount ?? 0) + "đ");
    // Payment proofs: lấy proofs array (hoặc legacy single proof)
    const proofs = r.paymentProofs ?? (r.paymentProof ? [r.paymentProof] : []);
    rowValues.push(proofs.map((p) => p.imageUrl).join("\n"));

    ws.addRow(rowValues);
    const row = ws.getRow(4 + i + 1);
    row.eachCell((c, colIdx) => {
      c.border = {
        top:    { style: "thin", color: { argb: "FFEEEEEE" } },
        left:   { style: "thin", color: { argb: "FFEEEEEE" } },
        bottom: { style: "thin", color: { argb: "FFEEEEEE" } },
        right:  { style: "thin", color: { argb: "FFEEEEEE" } },
      };
      if (colIdx === 1 || colIdx === totalCol || colIdx === proofCol) {
        c.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        c.alignment = { vertical: "middle", wrapText: true };
      }
    });
  });

  // ── Column widths ──
  ws.columns.forEach((c, i) => {
    if (i === 0) c.width = 5;         // STT
    else if (i === 1) c.width = 22;   // Họ tên
    else if (i === 2) c.width = 10;   // Mã
    else if (i === 3) c.width = 8;    // Nhà
    else if (i === totalCol - 1) c.width = 18;  // Tổng
    else if (i === proofCol - 1) c.width = 30;  // Proof
    else c.width = 13;                // Add-on cols
  });

  // Frozen panes: freeze first 4 cols + header
  ws.views = [{ state: "frozen", xSplit: 4, ySplit: 4 }];

  // Download
  const buf = await wb.xlsx.writeBuffer();
  const filename = `${event.slug || "event"}-dang-ky-${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
}
