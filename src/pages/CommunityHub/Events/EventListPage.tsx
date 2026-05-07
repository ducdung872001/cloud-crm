// CH Events — Danh sách sự kiện trong CRM (community-hub).
// Route: /ch_events
//
// TODO: wire up real API (EventService). Mock chỉ inject vào React state khi
// user bấm "Xem trước" — KHÔNG ghi localStorage để tránh ô nhiễm data tenant thật.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventStorage } from "./storage";
import { MOCK_EVENTS } from "@/mocks/community-hub/events";
import type { EventEntity, EventStatus } from "./types";
import { ComingSoonBlock, PreviewBanner } from "../_shared/ComingSoon";
import { showToast } from "@/utils/common";
import { uploadDocumentFormData } from "utils/document";
import { portalSettings, type PortalSettings } from "./portalSettings";
import {
  THEME,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  formatDateTime,
  formatVND,
  getEffectiveStatus,
} from "./shared";

export default function EventListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<EventStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [isPreview, setIsPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<PortalSettings>({});
  const [bannerUploading, setBannerUploading] = useState(false);

  useEffect(() => {
    let alive = true;
    portalSettings.getAsync().then((s) => { if (alive) setSettings(s); });
    return () => { alive = false; };
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await eventStorage.listEventsAsync();
      setEvents(list);
      // Load reg counts
      const counts: Record<string, number> = {};
      for (const e of list) {
        const regs = await eventStorage.listRegistrationsByEventAsync(e.id);
        counts[e.id] = regs.filter((r) => r.status !== "cancelled").length;
      }
      setRegCounts(counts);
    } catch {
      setEvents(eventStorage.listEvents());
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (!isPreview) loadEvents(); }, [loadEvents, isPreview]);

  const enterPreview = () => {
    setIsPreview(true);
    setEvents(MOCK_EVENTS as EventEntity[]);
    // Fake reg counts cho demo — 0 hoặc số nhỏ
    const counts: Record<string, number> = {};
    (MOCK_EVENTS as EventEntity[]).forEach((e) => { counts[e.id] = 0; });
    setRegCounts(counts);
    setLoading(false);
    showToast("Đang ở chế độ xem trước với dữ liệu demo", "info");
  };

  const exitPreview = () => {
    setIsPreview(false);
    // useEffect sẽ tự gọi lại loadEvents() vì isPreview đổi
  };

  const filtered = useMemo(() => {
    let list = [...events];
    if (filterStatus !== "all") {
      list = list.filter(
        (e) => getEffectiveStatus(e.status, e.startDate, e.endDate) === filterStatus
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return list.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [events, filterStatus, search]);

  const stats = useMemo(() => {
    const totalRegistrations = Object.values(regCounts).reduce((s, c) => s + c, 0);
    return {
      total: events.length,
      published: events.filter(
        (e) => getEffectiveStatus(e.status, e.startDate, e.endDate) === "published"
      ).length,
      ongoing: events.filter(
        (e) => getEffectiveStatus(e.status, e.startDate, e.endDate) === "ongoing"
      ).length,
      draft: events.filter((e) => e.status === "draft").length,
      totalRegistrations,
    };
  }, [events, regCounts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xoá sự kiện "${title}"?\n\nTất cả đăng ký liên quan cũng sẽ bị xoá.`)) return;
    await eventStorage.deleteEventAsync(id);
    loadEvents();
  };

  const handleTogglePublish = async (event: EventEntity) => {
    if (event.status === "draft") {
      await eventStorage.publishEventAsync(event.id);
    } else {
      await eventStorage.unpublishEventAsync(event.id);
    }
    loadEvents();
  };

  // Empty state khi chưa preview VÀ chưa có sự kiện nào
  if (!isPreview && !loading && events.length === 0) {
    return (
      <div style={{ padding: 20, background: THEME.bg, minHeight: "calc(100vh - 60px)" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: THEME.primaryDark }}>🎟️ Quản lý sự kiện</h2>
          <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
            Tạo sự kiện, công bố công khai và thu lead thành hội viên
          </p>
        </div>
        <ComingSoonBlock
          title="Chưa có sự kiện nào"
          description="Tạo sự kiện đầu tiên để công bố công khai, nhận đăng ký và theo dõi check-in của thành viên."
          onPreview={enterPreview}
        />
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={() => navigate("/ch_events/create")}
            style={{
              padding: "10px 18px",
              background: THEME.primary,
              color: "#fff",
              border: 0,
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            + Tạo sự kiện mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, background: THEME.bg, minHeight: "calc(100vh - 60px)" }}>
      {isPreview && <PreviewBanner onExit={exitPreview} />}
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: THEME.primaryDark }}>
            🎟️ Quản lý sự kiện
          </h2>
          <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
            Tạo sự kiện, công bố công khai và thu lead thành hội viên — phễu
            bán Community Hub
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowSettings(true)}
            title="Cấu hình banner / hiển thị trang public"
            style={{
              padding: "10px 14px",
              background: "#fff",
              color: THEME.primaryDark,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            ⚙️ Cài đặt portal
          </button>
          <button
            onClick={() => navigate("/ch_events/create")}
            style={{
              padding: "10px 18px",
              background: THEME.primary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            + Tạo sự kiện mới
          </button>
        </div>
      </div>

      {showSettings && (
        <PortalSettingsModal
          settings={settings}
          uploading={bannerUploading}
          onUploadBanner={(file) => {
            setBannerUploading(true);
            uploadDocumentFormData(
              file,
              async (data: any) => {
                const url = data?.fileUrl ?? data?.url;
                if (url) {
                  const next = { ...settings, bannerImageUrl: url };
                  setSettings(next);
                  // Yc 7/5 bug 1: await BE upsert để báo đúng trạng thái sync
                  // cross-device — trước đây fire-and-forget nên admin thấy
                  // toast success nhưng máy khác vẫn lấy banner cũ khi BE fail.
                  const r = await portalSettings.setAsync(next);
                  if (r.ok) showToast("Đã cập nhật banner — đồng bộ tự động", "success");
                  else showToast(r.error ?? "Banner chưa lưu được lên máy chủ", "error");
                } else {
                  showToast("Upload thành công nhưng không nhận được URL", "error");
                }
                setBannerUploading(false);
              },
              () => {
                showToast("Lỗi upload banner", "error");
                setBannerUploading(false);
              },
            );
          }}
          onChange={async (patch) => {
            const next = { ...settings, ...patch };
            setSettings(next);
            const r = await portalSettings.setAsync(next);
            if (!r.ok) showToast(r.error ?? "Chưa lưu được cài đặt lên máy chủ", "error");
          }}
          onClear={async () => {
            setSettings({});
            const r = await portalSettings.setAsync({});
            if (!r.ok) showToast(r.error ?? "Chưa lưu được cài đặt lên máy chủ", "error");
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* KPI tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <KpiTile label="Tổng sự kiện" value={stats.total} icon="📅" />
        <KpiTile label="Đang công bố" value={stats.published} icon="🟢" tone="success" />
        <KpiTile label="Đang diễn ra" value={stats.ongoing} icon="🔵" tone="info" />
        <KpiTile label="Nháp" value={stats.draft} icon="📝" tone="muted" />
        <KpiTile label="Tổng đăng ký" value={stats.totalRegistrations} icon="👥" tone="accent" />
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          alignItems: "center",
          flexWrap: "wrap",
          background: "#fff",
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
        }}
      >
        <input
          placeholder="🔍 Tìm theo tên, mô tả, tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 220,
            padding: "8px 12px",
            border: `1px solid ${THEME.border}`,
            borderRadius: 6,
            fontSize: 13,
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{
            padding: "8px 12px",
            border: `1px solid ${THEME.border}`,
            borderRadius: 6,
            fontSize: 13,
            background: "#fff",
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="published">Đang công bố</option>
          <option value="ongoing">Đang diễn ra</option>
          <option value="ended">Đã kết thúc</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
        <div style={{ fontSize: 12, color: THEME.textMuted }}>
          {filtered.length} / {events.length} sự kiện
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: THEME.textMuted }}>
          Đang tải...
        </div>
      )}

      {/* Grid events */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((e) => {
            const effStatus = getEffectiveStatus(e.status, e.startDate, e.endDate);
            const activeCount = regCounts[e.id] ?? 0;
            return (
              <div
                key={e.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: `1px solid ${THEME.border}`,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(11,46,42,0.06)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Cover */}
                <div
                  style={{
                    height: 140,
                    background: e.coverImageUrl
                      ? `url(${e.coverImageUrl}) center/cover`
                      : `linear-gradient(135deg, ${THEME.primarySoft}, ${THEME.primary})`,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      padding: "4px 10px",
                      background: EVENT_STATUS_COLORS[effStatus],
                      color: "#fff",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {EVENT_STATUS_LABELS[effStatus]}
                  </span>
                  {e.ticketPrice === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        padding: "4px 10px",
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
                {/* Body */}
                <div
                  style={{
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15,
                      color: THEME.primaryDark,
                      fontWeight: 700,
                    }}
                  >
                    {e.title}
                  </h3>
                  <div
                    style={{
                      fontSize: 11,
                      color: THEME.textMuted,
                      marginTop: 4,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <span>🕐 {formatDateTime(e.startDate)}</span>
                    <span>📍 {e.venue.isOnline ? "Online" : e.venue.name}</span>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: THEME.textMain,
                      marginTop: 8,
                      lineHeight: 1.45,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {e.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 10,
                      fontSize: 11,
                      color: THEME.textMuted,
                    }}
                  >
                    <span>
                      👥{" "}
                      <strong style={{ color: THEME.primaryDark }}>
                        {activeCount}
                        {e.maxAttendees ? `/${e.maxAttendees}` : ""}
                      </strong>{" "}
                      đăng ký
                    </span>
                    <span>
                      💰{" "}
                      <strong style={{ color: THEME.primaryDark }}>
                        {e.ticketPrice ? `${formatVND(e.ticketPrice)}đ` : "Free"}
                      </strong>
                    </span>
                  </div>
                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => navigate(`/ch_events/${e.id}`)}
                      style={actionBtnStyle(THEME.primary, "#fff")}
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => navigate(`/ch_events/${e.id}/edit`)}
                      style={actionBtnStyle("#fff", THEME.primaryDark, THEME.border)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleTogglePublish(e)}
                      style={actionBtnStyle(
                        e.status === "draft" ? THEME.success : "#fff",
                        e.status === "draft" ? "#fff" : THEME.warning,
                        THEME.warning
                      )}
                    >
                      {e.status === "draft" ? "🚀 Công bố" : "⏸ Ẩn"}
                    </button>
                    <button
                      onClick={() => handleDelete(e.id, e.title)}
                      style={actionBtnStyle("#fff", THEME.danger, THEME.danger)}
                      title="Xoá"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: THEME.textMuted,
            fontSize: 14,
          }}
        >
          Không có sự kiện nào khớp bộ lọc
        </div>
      )}
    </div>
  );
}

function actionBtnStyle(
  bg: string,
  color: string,
  border?: string
): React.CSSProperties {
  return {
    padding: "6px 12px",
    background: bg,
    color: color,
    border: `1px solid ${border ?? bg}`,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
  };
}

function PortalSettingsModal({
  settings,
  uploading,
  onUploadBanner,
  onChange,
  onClear,
  onClose,
}: {
  settings: PortalSettings;
  uploading: boolean;
  onUploadBanner: (file: File) => void;
  onChange: (patch: Partial<PortalSettings>) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 10, maxWidth: 560, width: "100%",
          padding: 20, boxShadow: "0 18px 40px rgba(0,0,0,.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, color: THEME.primaryDark }}>⚙️ Cài đặt portal sự kiện</h3>
          <button onClick={onClose} style={{ border: 0, background: "transparent", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 14px" }}>
          Cấu hình hiển thị trang public <code>/crm/events</code>. Đồng bộ tự động qua máy chủ theo tenant — admin máy khác chỉ cần reload trang là thấy thay đổi.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: THEME.textMain }}>
            Banner ảnh đầu trang
          </label>
          <p style={{ fontSize: 11, color: THEME.textMuted, margin: "0 0 8px" }}>
            Nên dùng ảnh có chứa text branding (VD “W.HOUSE — NÂNG TẦM GIÁ TRỊ SỐNG”) để chặn trình duyệt auto-translate. Tỉ lệ gợi ý 4:1, tối thiểu 1600px chiều rộng.
          </p>
          {settings.bannerImageUrl ? (
            <div style={{ marginBottom: 8 }}>
              <img
                src={settings.bannerImageUrl}
                alt="Banner preview"
                style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 6, border: `1px solid ${THEME.border}` }}
              />
            </div>
          ) : (
            <div style={{
              padding: 20, textAlign: "center", color: THEME.textMuted, fontSize: 12,
              border: `1px dashed ${THEME.border}`, borderRadius: 6, marginBottom: 8,
            }}>
              Chưa có banner — trang public hiển thị hero default.
            </div>
          )}
          <label
            style={{
              display: "inline-block", padding: "8px 14px", background: THEME.primarySoft,
              color: THEME.primaryDark, border: `1px dashed ${THEME.primary}`, borderRadius: 6,
              cursor: uploading ? "wait" : "pointer", fontSize: 12, fontWeight: 600,
            }}
          >
            {uploading ? "Đang upload..." : settings.bannerImageUrl ? "Đổi ảnh" : "Upload banner"}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadBanner(f);
                e.target.value = "";
              }}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: THEME.textMain }}>
            Link click banner (tuỳ chọn)
          </label>
          <input
            type="url"
            value={settings.bannerLinkUrl ?? ""}
            onChange={(e) => onChange({ bannerLinkUrl: e.target.value || undefined })}
            placeholder="https://... (để trống = banner không click)"
            style={{
              width: "100%", padding: "8px 10px", border: `1px solid ${THEME.border}`,
              borderRadius: 6, fontSize: 13, boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 14 }}>
          <button
            onClick={onClear}
            disabled={!settings.bannerImageUrl && !settings.bannerLinkUrl}
            style={{
              padding: "8px 14px", background: "#fff", color: THEME.danger,
              border: `1px solid ${THEME.danger}`, borderRadius: 6, cursor: "pointer",
              fontSize: 12, fontWeight: 600, opacity: !settings.bannerImageUrl && !settings.bannerLinkUrl ? 0.4 : 1,
            }}
          >
            Xoá cấu hình
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px", background: THEME.primary, color: "#fff",
              border: 0, borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700,
            }}
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: number;
  icon: string;
  tone?: "primary" | "success" | "info" | "muted" | "accent";
}) {
  const toneColor = {
    primary: THEME.primary,
    success: THEME.success,
    info: THEME.info,
    muted: THEME.textMuted,
    accent: THEME.accent,
  }[tone];
  return (
    <div
      style={{
        background: "#fff",
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${THEME.border}`,
        borderLeft: `4px solid ${toneColor}`,
      }}
    >
      <div style={{ fontSize: 11, color: THEME.textMuted }}>
        {icon} {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: THEME.primaryDark,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
