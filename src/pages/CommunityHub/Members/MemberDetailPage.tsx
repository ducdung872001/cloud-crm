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

/** Sinh mật khẩu tạm 8 ký tự dễ đọc (loại 0/O/1/I/l). */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberEntity | null>(null);
  const [history, setHistory] = useState<MemberHistoryItem[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);

  // Reset password modal state
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [resetPwd, setResetPwd] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState<string | null>(null);

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
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={() => {
              setResetPwd(generateTempPassword());
              setResetError(null);
              setResetDone(null);
              setResetPwdOpen(true);
            }}
            style={{ ...btnGhost, fontSize: 12, whiteSpace: "nowrap" }}
            title="Đặt lại mật khẩu cho thành viên — admin tự gọi báo user"
          >
            🔑 Đặt lại mật khẩu
          </button>
          <span style={{ fontSize: 10, color: T.textMuted, textAlign: "center" }}>
            {member.passwordSet ? "✓ Đã cấp pwd" : "⚠ Chưa cấp pwd"}
          </span>
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

      {/* Reset password modal */}
      {resetPwdOpen && (
        <div
          onClick={() => { if (!resetLoading) setResetPwdOpen(false); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 10, padding: 20, width: 440, maxWidth: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            {!resetDone ? (
              <>
                <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Đặt lại mật khẩu (admin override)</h3>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
                  Cấp mật khẩu mới cho <b>{member.fullName}</b> ({member.memberCode}). Bạn sẽ
                  thấy mật khẩu sau khi đặt lại để gọi báo user.
                </div>
                <div style={{
                  background: "#FEF3C7", border: "1px solid #FDE047", color: "#854D0E",
                  padding: "8px 10px", borderRadius: 6, fontSize: 11, marginBottom: 12, lineHeight: 1.5,
                }}>
                  💡 <b>Khuyến nghị:</b> hướng dẫn user tự dùng <b>"Quên mật khẩu"</b> trên trang đăng nhập
                  để đặt pwd qua Firebase OTP — admin không cần biết pwd. Chỉ dùng admin override
                  khi user không nhận được SMS / không tự thao tác được.
                </div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Mật khẩu tạm
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    style={{ ...inp, flex: 1, fontFamily: "monospace" }}
                    value={resetPwd}
                    onChange={(e) => { setResetPwd(e.target.value); setResetError(null); }}
                  />
                  <button
                    type="button"
                    onClick={() => { setResetPwd(generateTempPassword()); setResetError(null); }}
                    style={{ ...btnGhost, padding: "6px 10px" }}
                    title="Sinh mật khẩu mới"
                  >
                    🎲
                  </button>
                </div>
                {resetError && (
                  <div style={{ fontSize: 12, color: T.danger, marginTop: 8 }}>{resetError}</div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                  <button
                    onClick={() => setResetPwdOpen(false)}
                    disabled={resetLoading}
                    style={btnGhost}
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={async () => {
                      if (resetPwd.length < 6) {
                        setResetError("Mật khẩu phải ít nhất 6 ký tự");
                        return;
                      }
                      setResetLoading(true);
                      setResetError(null);
                      try {
                        // Admin reset — không cần Firebase OTP, dùng admin endpoint.
                        const r = await memberStorage.adminSetPasswordAsync(member.id, resetPwd);
                        if (!r.ok) {
                          setResetError(r.reason || "Đặt mật khẩu thất bại");
                        } else {
                          setResetDone(resetPwd);
                          // Refresh member để passwordSet=true.
                          const fresh = memberStorage.get(member.id);
                          if (fresh) setMember(fresh);
                        }
                      } catch (e: any) {
                        setResetError(e?.message || "Có lỗi xảy ra");
                      } finally {
                        setResetLoading(false);
                      }
                    }}
                    disabled={resetLoading}
                    style={{
                      ...btnPrimary,
                      opacity: resetLoading ? 0.7 : 1,
                      cursor: resetLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {resetLoading ? "Đang đặt..." : "🔑 Đặt mật khẩu mới"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 36 }}>✅</div>
                  <h3 style={{ margin: "6px 0 4px", fontSize: 18 }}>Đã đặt lại mật khẩu</h3>
                  <div style={{ fontSize: 12, color: T.textMuted }}>
                    Gọi <b>{member.fullName}</b> ({member.phone}) báo mật khẩu mới:
                  </div>
                </div>
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: 14, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 110, color: T.textMuted, fontSize: 12, fontWeight: 600 }}>Mật khẩu mới</span>
                    <code style={{
                      flex: 1, padding: "4px 8px", background: "#fff", borderRadius: 4,
                      border: `1px solid ${T.border}`, fontFamily: "monospace",
                      fontSize: 14, fontWeight: 700, color: "#166534",
                    }}>{resetDone}</code>
                    <button
                      onClick={() => navigator.clipboard?.writeText(resetDone)}
                      style={{ ...btnGhost, padding: "4px 8px", fontSize: 11 }}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12 }}>
                  Tính năng gửi tự động qua SMS/Zalo đang phát triển — hiện gọi điện trực tiếp.
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { setResetPwdOpen(false); setResetDone(null); }}
                    style={btnPrimary}
                  >
                    ✓ Đã gọi báo / Xong
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: "8px 10px",
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

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
