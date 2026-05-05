// MemberDetailPage — hiển thị thông tin thành viên + timeline lịch sử.
// Yc 5/5 mục 3.3: click tháng → activity tháng; click ngày → chi tiết ngày.
//
// Route gợi ý: /ch_members/:id

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { memberStorage } from "./storage";
import type { MemberEntity, MemberHistoryItem, MemberStats } from "./types";

const T = {
  primary: "#1B4D3E",
  primarySoft: "#E6F2EF",
  border: "#E5E7EB",
  bg: "#F9FAFB",
  textMain: "#111827",
  textMuted: "#6B7280",
  danger: "#DC2626",
};

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberEntity | null>(null);
  const [history, setHistory] = useState<MemberHistoryItem[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);

  // Filter UI: theo tháng, theo ngày
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // YYYY-MM
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // YYYY-MM-DD

  useEffect(() => {
    if (!id) return;
    const m = memberStorage.get(id);
    setMember(m);
    setHistory(memberStorage.listHistory(id));
    setStats(memberStorage.computeStats(id));
  }, [id]);

  const monthGroups = useMemo(() => {
    const map: Record<string, MemberHistoryItem[]> = {};
    for (const h of history) {
      const month = h.occurredAt.slice(0, 7);
      (map[month] ??= []).push(h);
    }
    // Sắp xếp tháng giảm dần
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [history]);

  const filteredItems = useMemo(() => {
    if (selectedDay) return history.filter((h) => h.occurredAt.startsWith(selectedDay));
    if (selectedMonth) return history.filter((h) => h.occurredAt.startsWith(selectedMonth));
    return history;
  }, [history, selectedMonth, selectedDay]);

  if (!member) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Không tìm thấy thành viên</h2>
        <button onClick={() => navigate("/ch_members")} style={btnPrimary}>← Về danh sách</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ ...btnGhost, marginBottom: 12 }}>← Quay lại</button>

      {/* Header */}
      <div style={{ display: "flex", gap: 16, padding: 16, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, fontSize: 28, fontWeight: 700 }}>
          {member.fullName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, margin: 0, color: T.textMain }}>{member.fullName}</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <code style={{ fontSize: 14, background: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: 4, fontWeight: 700 }}>
              {member.memberCode}
            </code>
            {member.masterCode && (
              <code style={{ fontSize: 12, background: "#DBEAFE", color: "#1E40AF", padding: "2px 8px", borderRadius: 4 }}>
                {member.masterCode} (Trưởng nhóm)
              </code>
            )}
            <span style={{ fontSize: 12, color: T.textMuted }}>Hạng {member.identity.rank} · Nhóm {member.identity.groupSeq}</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: T.textMain }}>
            📞 {member.phone} {member.email && <>· ✉️ {member.email}</>}
            {member.occupation && <> · 💼 {member.occupation}</>}
          </div>
          {member.roleCodes.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
              {member.roleCodes.map((rc) => (
                <span key={rc.id} style={{ fontSize: 11, padding: "2px 8px", background: T.primarySoft, color: T.primary, borderRadius: 10 }}>
                  {rc.label} ({rc.code})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
          <Stat label="Sự kiện đã tham gia" value={stats.totalEvents} />
          <Stat label="Đã chi" value={`${formatVnd(stats.totalSpent)}đ`} />
          <Stat label="Còn nợ" value={`${formatVnd(stats.totalDebt)}đ`} highlight={stats.totalDebt > 0} />
          <Stat label="Dịch vụ đã dùng" value={stats.totalServices} />
          {stats.averageRating != null && (
            <Stat label="Đánh giá TB" value={`${stats.averageRating.toFixed(1)} ⭐`} />
          )}
          <Stat label="Thành viên từ" value={new Date(stats.memberSince).toLocaleDateString("vi-VN")} />
        </div>
      )}

      {/* Timeline filters */}
      <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: T.textMain }}>📅 Dòng thời gian</h3>
          {(selectedMonth || selectedDay) && (
            <button onClick={() => { setSelectedMonth(null); setSelectedDay(null); }} style={btnGhost}>
              Xem tất cả
            </button>
          )}
        </div>

        {/* Month chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {monthGroups.map(([month, items]) => (
            <button
              key={month}
              onClick={() => { setSelectedMonth(month); setSelectedDay(null); }}
              style={{
                padding: "5px 10px",
                background: selectedMonth === month ? T.primary : "#fff",
                color: selectedMonth === month ? "#fff" : T.textMain,
                border: `1px solid ${selectedMonth === month ? T.primary : T.border}`,
                borderRadius: 14,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {formatMonthLabel(month)} ({items.length})
            </button>
          ))}
        </div>

        {/* Day filter (hiện khi đã chọn tháng) */}
        {selectedMonth && (
          <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {[...new Set(history.filter((h) => h.occurredAt.startsWith(selectedMonth)).map((h) => h.occurredAt.slice(0, 10)))].sort().reverse().map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                style={{
                  padding: "3px 8px",
                  background: selectedDay === day ? T.primarySoft : "#F8FBFA",
                  color: selectedDay === day ? T.primary : T.textMuted,
                  border: `1px solid ${selectedDay === day ? T.primary : T.border}`,
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {day.slice(8, 10)}/{day.slice(5, 7)}
              </button>
            ))}
          </div>
        )}

        {/* Items */}
        {filteredItems.length === 0 ? (
          <p style={{ fontSize: 13, color: T.textMuted, textAlign: "center", padding: 24 }}>
            {selectedMonth || selectedDay ? "Không có hoạt động trong khoảng thời gian này" : "Chưa có lịch sử nào"}
          </p>
        ) : (
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 2, background: T.primarySoft }} />
            {filteredItems.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div style={{
      padding: 12, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8,
      borderLeft: `3px solid ${highlight ? T.danger : T.primary}`,
    }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: highlight ? T.danger : T.textMain }}>{value}</div>
    </div>
  );
}

function TimelineItem({ item }: { item: MemberHistoryItem }) {
  const icon = ICON_BY_KIND[item.kind] ?? "•";
  const color = COLOR_BY_KIND[item.kind] ?? T.primary;
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 12, position: "relative" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: color, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
        flexShrink: 0, position: "relative", zIndex: 1,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, padding: 10, background: "#F8FBFA", borderRadius: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 13, color: T.textMain }}>{item.title}</strong>
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {new Date(item.occurredAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
          </span>
        </div>
        {item.description && <div style={{ fontSize: 12, color: T.textMain, marginTop: 4 }}>{item.description}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 11, color: T.textMuted, flexWrap: "wrap" }}>
          {item.amountVnd != null && <span>💰 {formatVnd(item.amountVnd)}đ</span>}
          {item.variant && <span>📦 {item.variant}</span>}
          {item.refStatus && <span>📋 {item.refStatus}</span>}
          {item.rating && <span>⭐ {item.rating}</span>}
        </div>
      </div>
    </div>
  );
}

const ICON_BY_KIND: Record<string, string> = {
  event_checkin: "🎟",
  service_used: "🧖",
  product_bought: "🛒",
  course_completed: "🎓",
  role_issued: "🆔",
  payment_in: "💵",
  debt_recorded: "📌",
  debt_settled: "✅",
  rating_given: "⭐",
  note: "📝",
};

const COLOR_BY_KIND: Record<string, string> = {
  event_checkin: "#1B4D3E",
  service_used: "#0EA5E9",
  product_bought: "#16A34A",
  course_completed: "#D97706",
  role_issued: "#7C3AED",
  payment_in: "#10B981",
  debt_recorded: "#DC2626",
  debt_settled: "#059669",
  rating_given: "#F59E0B",
  note: "#6B7280",
};

function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `T${parseInt(m, 10)}/${y}`;
}

function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

const btnPrimary: React.CSSProperties = { padding: "8px 16px", background: T.primary, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 };
const btnGhost: React.CSSProperties = { padding: "6px 12px", background: "transparent", color: T.primary, border: `1px solid ${T.primary}`, borderRadius: 6, cursor: "pointer", fontSize: 12 };
