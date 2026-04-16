// CH Events — Danh sách sự kiện trong CRM (community-hub).
// Route: /ch_events

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventStorage } from "./storage";
import type { EventEntity, EventStatus } from "./types";
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

  useEffect(() => { loadEvents(); }, [loadEvents]);

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

  return (
    <div style={{ padding: 20, background: THEME.bg, minHeight: "calc(100vh - 60px)" }}>
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
