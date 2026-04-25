// Reborn admin — platform-wide usage & cost monitoring (internal tool)
// Route: /admin/usage (chỉ Reborn admin, không expose trong sidebar mentor)
import React, { useState } from "react";
import { MOCK_PLATFORM_USAGE, PLANS, formatVND, type PlanId, type UsageLogEntry } from "@/mocks/subscription";
import "../../MentorHub/_shared/styles.scss";
import "./admin.scss";

const USD_TO_VND = 25_000; // tỉ giá mock

export default function AdminUsagePage() {
  document.title = "Admin · Platform Usage · Reborn";
  const [filterPlan, setFilterPlan] = useState<PlanId | "all">("all");
  const [sortBy, setSortBy] = useState<"cost" | "sessions" | "margin">("cost");
  const [search, setSearch] = useState("");

  const data = MOCK_PLATFORM_USAGE.map((u) => {
    const totalCostUSD = u.whisperCostUSD + u.claudeCostUSD + u.storageUSD;
    const totalCostVND = totalCostUSD * USD_TO_VND;
    const marginVND = u.revenueVND - totalCostVND;
    const marginPct = u.revenueVND > 0 ? (marginVND / u.revenueVND) * 100 : 0;
    return { ...u, totalCostUSD, totalCostVND, marginVND, marginPct };
  });

  const filtered = data
    .filter((u) => filterPlan === "all" || u.plan === filterPlan)
    .filter((u) => !search || u.mentorName.toLowerCase().includes(search.toLowerCase()) || u.mentorId.toLowerCase().includes(search.toLowerCase()));

  filtered.sort((a, b) => {
    if (sortBy === "cost") return b.totalCostUSD - a.totalCostUSD;
    if (sortBy === "sessions") return b.sessions - a.sessions;
    return b.marginPct - a.marginPct;
  });

  // Aggregate KPIs
  const totalMentors = data.length;
  const activeMentors = data.filter((u) => u.status === "active").length;
  const trialMentors = data.filter((u) => u.status === "trial").length;
  const canceledMentors = data.filter((u) => u.status === "canceled_at_period_end").length;
  const totalSessions = data.reduce((s, u) => s + u.sessions, 0);
  const totalCostUSD = data.reduce((s, u) => s + u.totalCostUSD, 0);
  const totalRevenueVND = data.reduce((s, u) => s + u.revenueVND, 0);
  const totalCostVND = totalCostUSD * USD_TO_VND;
  const grossMarginVND = totalRevenueVND - totalCostVND;
  const grossMarginPct = totalRevenueVND > 0 ? (grossMarginVND / totalRevenueVND) * 100 : 0;

  // Alerts: mentor với quota usage >= 80% (mock — tính từ sessions vs plan limit)
  const alerts = data
    .map((u) => {
      const plan = PLANS.find((p) => p.id === u.plan);
      if (!plan) return null;
      const limit = plan.features.aiSessions;
      if (limit === -1) return null;
      const pct = (u.sessions / limit) * 100;
      if (pct < 80) return null;
      return { ...u, quotaPct: pct, limit };
    })
    .filter(Boolean) as (UsageLogEntry & { quotaPct: number; limit: number; totalCostUSD: number; totalCostVND: number; marginVND: number; marginPct: number })[];

  return (
    <div className="mh admin-usage">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mh__kicker" style={{ color: "var(--mh-amber)" }}>🔒 REBORN ADMIN · INTERNAL</div>
          <h1>Platform <em>Usage & Cost</em></h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>Monitoring cost AI pipeline + subscription revenue · {new Date().toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="mh__btn">↻ Refresh</button>
          <button className="mh__btn">📊 Export Excel</button>
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="mh__grid mh__grid--4" style={{ marginBottom: 24 }}>
        <div className="mh__kpi">
          <div className="mh__kpi-label">TỔNG MENTOR</div>
          <div className="mh__kpi-value">{totalMentors}</div>
          <div className="mh__kpi-delta">
            {activeMentors} active · {trialMentors} trial · {canceledMentors} huỷ
          </div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">SESSIONS AI / THÁNG</div>
          <div className="mh__kpi-value">{totalSessions}</div>
          <div className="mh__kpi-delta">≈ {Math.round(totalSessions * 2)}h audio</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">REVENUE / THÁNG</div>
          <div className="mh__kpi-value" style={{ color: "var(--mh-teal)" }}>{formatVND(totalRevenueVND)}</div>
          <div className="mh__kpi-delta">từ {activeMentors} mentor trả phí</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">GROSS MARGIN</div>
          <div className="mh__kpi-value" style={{ color: grossMarginPct > 70 ? "var(--mh-green)" : grossMarginPct > 40 ? "var(--mh-amber)" : "var(--mh-red)" }}>{grossMarginPct.toFixed(0)}%</div>
          <div className="mh__kpi-delta">= {formatVND(grossMarginVND)}</div>
        </div>
      </div>

      <div className="mh__grid mh__grid--4" style={{ marginBottom: 32 }}>
        <div className="mh__kpi">
          <div className="mh__kpi-label">WHISPER (STT)</div>
          <div className="mh__kpi-value" style={{ fontSize: 24 }}>${data.reduce((s, u) => s + u.whisperCostUSD, 0).toFixed(2)}</div>
          <div className="mh__kpi-delta mh__kpi-delta--down">≈ {formatVND(data.reduce((s, u) => s + u.whisperCostUSD, 0) * USD_TO_VND)}</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">CLAUDE AI</div>
          <div className="mh__kpi-value" style={{ fontSize: 24 }}>${data.reduce((s, u) => s + u.claudeCostUSD, 0).toFixed(2)}</div>
          <div className="mh__kpi-delta mh__kpi-delta--down">≈ {formatVND(data.reduce((s, u) => s + u.claudeCostUSD, 0) * USD_TO_VND)}</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">STORAGE S3</div>
          <div className="mh__kpi-value" style={{ fontSize: 24 }}>${data.reduce((s, u) => s + u.storageUSD, 0).toFixed(2)}</div>
          <div className="mh__kpi-delta mh__kpi-delta--down">≈ {formatVND(data.reduce((s, u) => s + u.storageUSD, 0) * USD_TO_VND)}</div>
        </div>
        <div className="mh__kpi">
          <div className="mh__kpi-label">TOTAL COST</div>
          <div className="mh__kpi-value" style={{ fontSize: 24, color: "var(--mh-red)" }}>${totalCostUSD.toFixed(2)}</div>
          <div className="mh__kpi-delta mh__kpi-delta--down">≈ {formatVND(totalCostVND)}</div>
        </div>
      </div>

      {/* ── Alerts ───────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="mh__card" style={{ marginBottom: 24, background: "#FEF2F2", borderColor: "#FCA5A5" }}>
          <h3 style={{ color: "var(--mh-red)", marginBottom: 12 }}>⚠ {alerts.length} mentor gần đạt/vượt quota gói</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a) => (
              <div key={a.mentorId} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, alignItems: "center", padding: 10, background: "#fff", borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.mentorName}</div>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{a.mentorId} · Gói {a.plan}</div>
                </div>
                <div className="mh__mono" style={{ fontSize: 13, color: a.quotaPct >= 100 ? "var(--mh-red)" : "var(--mh-amber)", fontWeight: 600 }}>
                  {a.sessions}/{a.limit} buổi ({a.quotaPct.toFixed(0)}%)
                </div>
                <button className="mh__btn" style={{ padding: "4px 12px", fontSize: 12 }}>Gửi gợi ý nâng cấp</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter / Search ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input className="mh__input" placeholder="🔍 Tên mentor / ID…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <button className="mh__btn" style={filterPlan === "all" ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)" } : {}} onClick={() => setFilterPlan("all")}>Tất cả ({data.length})</button>
          {(["trial", "starter", "pro", "unlimited"] as PlanId[]).map((p) => (
            <button key={p} className="mh__btn" style={filterPlan === p ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)" } : {}} onClick={() => setFilterPlan(p)}>
              {p} ({data.filter((u) => u.plan === p).length})
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <span className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", alignSelf: "center" }}>SORT:</span>
          {[
            { v: "cost", l: "Cost" },
            { v: "sessions", l: "Sessions" },
            { v: "margin", l: "Margin %" },
          ].map((o) => (
            <button key={o.v} className="mh__btn" style={sortBy === o.v ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)", padding: "6px 12px", fontSize: 12 } : { padding: "6px 12px", fontSize: 12 }} onClick={() => setSortBy(o.v as typeof sortBy)}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Per-mentor table ─────────────────────────────────────────────── */}
      <div className="mh__card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="mh__table">
            <thead>
              <tr>
                <th>Mentor</th>
                <th>Gói</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Sessions</th>
                <th style={{ textAlign: "right" }}>Whisper $</th>
                <th style={{ textAlign: "right" }}>Claude $</th>
                <th style={{ textAlign: "right" }}>Storage $</th>
                <th style={{ textAlign: "right" }}>Total Cost</th>
                <th style={{ textAlign: "right" }}>Revenue</th>
                <th style={{ textAlign: "right" }}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.mentorId}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{u.mentorName}</div>
                    <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)" }}>{u.mentorId}</div>
                  </td>
                  <td><span className={"mh__pill " + (u.plan === "unlimited" ? "mh__pill--amber" : u.plan === "pro" ? "mh__pill--green" : u.plan === "starter" ? "mh__pill--upcoming" : "mh__pill--draft")}>{u.plan}</span></td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      color: u.status === "active" ? "var(--mh-green)" : u.status === "trial" ? "var(--mh-amber)" : u.status === "canceled_at_period_end" ? "var(--mh-red)" : "var(--mh-ink-soft)",
                      fontFamily: "'Geist Mono', monospace",
                    }}>
                      {u.status === "active" ? "● Active" : u.status === "trial" ? "◐ Trial" : u.status === "canceled_at_period_end" ? "⚠ Canceled" : "○ " + u.status}
                    </span>
                  </td>
                  <td className="mh__mono" style={{ textAlign: "right" }}>{u.sessions}</td>
                  <td className="mh__mono" style={{ textAlign: "right", fontSize: 11 }}>${u.whisperCostUSD.toFixed(2)}</td>
                  <td className="mh__mono" style={{ textAlign: "right", fontSize: 11 }}>${u.claudeCostUSD.toFixed(2)}</td>
                  <td className="mh__mono" style={{ textAlign: "right", fontSize: 11 }}>${u.storageUSD.toFixed(2)}</td>
                  <td className="mh__mono" style={{ textAlign: "right", color: "var(--mh-red)", fontWeight: 600 }}>${u.totalCostUSD.toFixed(2)}</td>
                  <td className="mh__mono" style={{ textAlign: "right", color: "var(--mh-teal)", fontWeight: 600 }}>{u.revenueVND > 0 ? formatVND(u.revenueVND) : "—"}</td>
                  <td className="mh__mono" style={{ textAlign: "right", fontWeight: 600, color: u.marginPct >= 70 ? "var(--mh-green)" : u.marginPct >= 40 ? "var(--mh-amber)" : u.marginPct > 0 ? "var(--mh-red)" : "var(--mh-ink-soft)" }}>
                    {u.revenueVND > 0 ? u.marginPct.toFixed(0) + "%" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Plan distribution + billing breakdown ────────────────────────── */}
      <div className="mh__grid mh__grid--2" style={{ gap: 24 }}>
        <div className="mh__card">
          <h3 style={{ marginBottom: 16 }}>Phân bố gói</h3>
          {(["trial", "starter", "pro", "unlimited"] as PlanId[]).map((p) => {
            const count = data.filter((u) => u.plan === p).length;
            const revenue = data.filter((u) => u.plan === p).reduce((s, u) => s + u.revenueVND, 0);
            const pct = (count / totalMentors) * 100;
            const plan = PLANS.find((x) => x.id === p);
            return (
              <div key={p} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--mh-line)" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, textTransform: "capitalize", marginBottom: 4 }}>{plan?.name || "Trial"}</div>
                  <div style={{ height: 6, background: "var(--mh-ivory-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: plan?.color || "var(--mh-ink-soft)" }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mh__mono" style={{ fontSize: 13, fontWeight: 600 }}>{count} mentor</div>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{revenue > 0 ? formatVND(revenue) : "0đ"}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mh__card">
          <h3 style={{ marginBottom: 16 }}>Cost breakdown</h3>
          {[
            { label: "Whisper (Voice-to-text)", usd: data.reduce((s, u) => s + u.whisperCostUSD, 0), color: "#0F766E" },
            { label: "Claude Haiku/Sonnet (AI summary)", usd: data.reduce((s, u) => s + u.claudeCostUSD, 0), color: "#B45309" },
            { label: "Storage S3 (recordings)", usd: data.reduce((s, u) => s + u.storageUSD, 0), color: "#1E40AF" },
          ].map((c) => {
            const pct = (c.usd / totalCostUSD) * 100;
            return (
              <div key={c.label} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--mh-line)" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ height: 6, background: "var(--mh-ivory-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: c.color }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mh__mono" style={{ fontSize: 13, fontWeight: 600 }}>${c.usd.toFixed(2)}</div>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{pct.toFixed(0)}%</div>
                </div>
              </div>
            );
          })}
          <div style={{ padding: 14, background: "var(--mh-ivory-2)", borderRadius: 8, marginTop: 14, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
              <span>Cost per session average</span>
              <span className="mh__mono">${(totalCostUSD / Math.max(1, totalSessions)).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--mh-ink-soft)", marginTop: 6 }}>
              <span>Revenue per active mentor</span>
              <span className="mh__mono">{formatVND(Math.round(totalRevenueVND / Math.max(1, activeMentors)))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
