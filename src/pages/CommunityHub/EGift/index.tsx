// [FitPro Phase 2.2] EGIFT — quà tặng Phygital cá nhân hoá
// URD: docs/urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-egift
import React, { useState } from "react";
import {
  MOCK_GIFT_CATALOG, MOCK_GIFT_ASSIGNMENTS, EGIFT_STATS, MILESTONE_LABELS,
  GiftCatalogItem, GiftAssignment, GiftType, GiftStatus,
} from "@/mocks/community-hub/egift";
import { formatCurrency } from "reborn-util";

const STATUS_META: Record<GiftStatus, { label: string; bg: string; color: string }> = {
  queued:  { label: "Chờ xử lý",  bg: "#FEF3C7", color: "#92400E" },
  shipped: { label: "Đã gửi",    bg: "#E0EBFF", color: "#1E40AF" },
  claimed: { label: "Đã nhận",   bg: "#D1FAE5", color: "#065F46" },
  expired: { label: "Hết hạn",   bg: "#FEE2E2", color: "#991B1B" },
};

export default function EGiftPage() {
  document.title = "EGIFT — Quà tặng Phygital | FitPro";
  const [tab, setTab] = useState<"catalog" | "assignments">("assignments");
  const [catalog, setCatalog] = useState<GiftCatalogItem[]>(MOCK_GIFT_CATALOG);
  const [assignments] = useState<GiftAssignment[]>(MOCK_GIFT_ASSIGNMENTS);
  const f = (v: number) => formatCurrency(v, ".", "");

  const toggleGift = (id: string) => {
    setCatalog(catalog.map((g) => g.id === id ? { ...g, isActive: !g.isActive } : g));
  };

  return (
    <div style={{ padding: 20, background: "#F5F9F8", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#0B2E2A" }}>🎁 EGIFT — Quà tặng Phygital cá nhân hoá</h2>
        <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
          Văn hoá EGIFT — trao quà <strong>vật lý + digital</strong> theo milestones Hành trình 90 ngày để tăng retention + cảm xúc wow.
          Quà auto-trigger theo rule (baseline → ebook, month-1 → bình nước, renew → voucher 30%). (PDF trang 8-9)
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Mẫu quà đang bật", value: `${EGIFT_STATS.activeCount}/${EGIFT_STATS.catalogCount}`, color: "#00C9A7" },
          { label: "Kho vật lý còn", value: `${EGIFT_STATS.totalStockQty.toLocaleString("vi-VN")}`, color: "#2563EB" },
          { label: "Đã gán tháng này", value: `${EGIFT_STATS.assignedThisMonth}`, color: "#F59E0B" },
          { label: "Đã gửi", value: `${EGIFT_STATS.shippedThisMonth}`, color: "#6366F1" },
          { label: "Đã nhận", value: `${EGIFT_STATS.claimedThisMonth}`, color: "#10B981" },
          { label: "Tổng giá trị quà", value: `${f(EGIFT_STATS.totalGiftValueVnd)}đ`, color: "#E85D4B" },
        ].map((k) => (
          <div key={k.label} style={{ background: "#fff", borderRadius: 10, padding: 14, borderLeft: `4px solid ${k.color}`, boxShadow: "0 2px 8px rgba(11,46,42,0.05)" }}>
            <div style={{ fontSize: 11, color: "#6B8A85", textTransform: "uppercase", letterSpacing: 0.4 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0B2E2A", marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setTab("assignments")} style={tabStyle(tab === "assignments")}>
          📬 Lịch sử trao quà ({assignments.length})
        </button>
        <button onClick={() => setTab("catalog")} style={tabStyle(tab === "catalog")}>
          🎁 Catalog quà ({catalog.length})
        </button>
      </div>

      {tab === "assignments" && (
        <div style={{ background: "#fff", borderRadius: 10, padding: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F5F9F8", textAlign: "left" }}>
                <th style={thStyle}>Mã gán</th>
                <th style={thStyle}>Hội viên</th>
                <th style={thStyle}>Quà</th>
                <th style={thStyle}>Milestone trigger</th>
                <th style={thStyle}>Ngày gán</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Tracking</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const meta = STATUS_META[a.status];
                return (
                  <tr key={a.id} style={{ borderTop: "1px solid #E0E8E5" }}>
                    <td style={tdStyle}><code>{a.id}</code></td>
                    <td style={tdStyle}><strong>{a.memberName}</strong><div style={{ fontSize: 11, color: "#6B8A85" }}>{a.memberId}</div></td>
                    <td style={tdStyle}>
                      {a.giftType === "physical" ? "📦" : "💻"} {a.giftName}
                      <div style={{ fontSize: 11, color: "#6B8A85" }}>{a.giftId}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#F5F9F8", color: "#6B8A85" }}>
                        {MILESTONE_LABELS[a.triggerMilestone]}
                      </span>
                    </td>
                    <td style={tdStyle}>{new Date(a.assignedAt).toLocaleDateString("vi-VN")}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: "3px 10px", borderRadius: 999, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={tdStyle}>{a.trackingNumber || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "catalog" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {catalog.map((g) => (
            <div key={g.id} style={{
              background: "#fff", borderRadius: 12, padding: 16,
              border: g.isActive ? "2px solid #00C9A7" : "2px solid #E0E8E5",
              opacity: g.isActive ? 1 : 0.65,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{g.type === "physical" ? "📦" : "💻"}</span>
                <div style={{
                  padding: "2px 8px", borderRadius: 4,
                  background: g.type === "physical" ? "#FEF3C7" : "#E0EBFF",
                  color: g.type === "physical" ? "#92400E" : "#1E40AF",
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                }}>
                  {g.type === "physical" ? "Vật lý" : "Digital"}
                </div>
              </div>
              <h4 style={{ margin: 0, color: "#0B2E2A" }}>{g.name}</h4>
              <p style={{ fontSize: 12, color: "#6B8A85", marginTop: 6, marginBottom: 10 }}>{g.description}</p>
              <div style={{ fontSize: 12, color: "#0B2E2A", marginBottom: 6 }}>
                🏷️ Giá trị: <strong>{f(g.valueVnd)}đ</strong>
              </div>
              <div style={{ fontSize: 12, color: "#0B2E2A", marginBottom: 6 }}>
                🎯 Trigger: <strong>{MILESTONE_LABELS[g.triggerMilestone]}</strong>
              </div>
              {g.type === "physical" && (
                <div style={{ fontSize: 12, color: "#0B2E2A", marginBottom: 10 }}>
                  📦 Tồn kho: <strong>{g.stockQty}</strong> (Inventory SKU auto-pull)
                </div>
              )}
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", marginTop: 12 }}>
                <input type="checkbox" checked={g.isActive} onChange={() => toggleGift(g.id)} />
                {g.isActive ? "Đang bật trigger" : "Đã tắt (không auto-gán)"}
              </label>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, padding: 16, background: "#EEF3FF", border: "1px solid #B8C9E8", borderRadius: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1E3A8A", marginBottom: 6 }}>🔗 Tích hợp với các phân hệ khác</div>
        <div style={{ fontSize: 12, color: "#1E3A8A", lineHeight: 1.7 }}>
          • Milestone trigger đọc từ <strong>Hành trình 90 ngày</strong> (Part 14) — khi hội viên chuyển giai đoạn, event publish → EGIFT auto-assign.<br/>
          • Quà vật lý pull stock từ <strong>Kho</strong> (Part 10) + ship qua <strong>Logistics service</strong>.<br/>
          • Quà digital (voucher) đồng bộ với <strong>Phễu marketing</strong> và áp dụng vào đơn hàng mới.<br/>
          • Push notification khi quà mới đến tay hội viên — qua <strong>Notification service</strong>.
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "8px 10px", fontSize: 11, color: "#6B8A85", textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: "10px", fontSize: 13, color: "#0B2E2A", verticalAlign: "top" };

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 16px", borderRadius: 999,
    border: active ? "2px solid #00C9A7" : "1px solid #d9e0de",
    background: active ? "#E4F7F3" : "#fff",
    color: active ? "#0B2E2A" : "#6B8A85",
    fontWeight: 700, cursor: "pointer",
  };
}
