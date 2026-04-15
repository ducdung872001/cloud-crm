// [FitPro] F3 — 90-day Journey Tracker
// Theo dõi hành trình 90 ngày: intake → baseline test → tập → re-test → outcome
import React, { useState } from "react";

interface IJourneyMember {
  id: string;
  name: string;
  plan: string;
  station: string;
  start_date: string;
  day: number; // 0-90
  phase: "intake" | "baseline" | "execution" | "retest" | "outcome";
  sessions_done: number;
  sessions_target: number;
  last_checkin: string;
  body_metrics?: {
    weight_start: number;
    weight_current: number;
    bmi_start: number;
    bmi_current: number;
  };
}

const MOCK_JOURNEYS: IJourneyMember[] = [
  { id: "M001", name: "Trần Thị Hương", plan: "FitPro VIP", station: "FP-HN-001", start_date: "2026-02-01", day: 73, phase: "retest", sessions_done: 24, sessions_target: 30, last_checkin: "2026-04-14 06:15", body_metrics: { weight_start: 68, weight_current: 62.5, bmi_start: 26.5, bmi_current: 24.3 } },
  { id: "M002", name: "Lê Văn Đức", plan: "FitPro Pro", station: "FP-HN-001", start_date: "2026-03-01", day: 45, phase: "execution", sessions_done: 15, sessions_target: 30, last_checkin: "2026-04-15 06:00", body_metrics: { weight_start: 82, weight_current: 79.1, bmi_start: 27.0, bmi_current: 26.1 } },
  { id: "M003", name: "Phạm Thị Lan", plan: "FitPro Plus", station: "FP-HN-002", start_date: "2026-04-01", day: 14, phase: "execution", sessions_done: 5, sessions_target: 30, last_checkin: "2026-04-15 06:05" },
  { id: "M004", name: "Nguyễn Minh", plan: "FitPro Cơ Bản", station: "FP-HN-002", start_date: "2026-04-10", day: 5, phase: "baseline", sessions_done: 2, sessions_target: 30, last_checkin: "2026-04-15 07:30" },
  { id: "M005", name: "Hoàng An", plan: "FitPro Super VIP", station: "FP-HN-002", start_date: "2026-04-14", day: 1, phase: "intake", sessions_done: 0, sessions_target: 30, last_checkin: "2026-04-14 06:30" },
  { id: "M006", name: "Dương Thùy Linh", plan: "FitPro VIP", station: "FP-HCM-001", start_date: "2026-01-15", day: 90, phase: "outcome", sessions_done: 30, sessions_target: 30, last_checkin: "2026-04-14 06:00", body_metrics: { weight_start: 72, weight_current: 65, bmi_start: 28.1, bmi_current: 25.4 } },
];

const PHASE_META = {
  intake: { label: "Nhập cuộc", color: "#8E9BAE", icon: "📝", range: "Ngày 1-3" },
  baseline: { label: "Xét nghiệm cơ sở", color: "#FF8C42", icon: "🩺", range: "Ngày 4-7" },
  execution: { label: "Tập luyện & Dinh dưỡng", color: "#00C9A7", icon: "💪", range: "Ngày 8-82" },
  retest: { label: "Re-test", color: "#722ed1", icon: "🔬", range: "Ngày 83-87" },
  outcome: { label: "Kết quả & Renewal", color: "#E8473B", icon: "🎯", range: "Ngày 88-90" },
};

export default function JourneyTrackerPage() {
  document.title = "Hành trình 90 ngày — FitPro";
  const [selected, setSelected] = useState<IJourneyMember | null>(MOCK_JOURNEYS[0]);
  const [filterPhase, setFilterPhase] = useState<string>("all");

  const filtered = filterPhase === "all" ? MOCK_JOURNEYS : MOCK_JOURNEYS.filter((m) => m.phase === filterPhase);

  const summary = {
    total: MOCK_JOURNEYS.length,
    intake: MOCK_JOURNEYS.filter((m) => m.phase === "intake").length,
    execution: MOCK_JOURNEYS.filter((m) => m.phase === "execution").length,
    outcome: MOCK_JOURNEYS.filter((m) => m.phase === "outcome").length,
    ready_renewal: MOCK_JOURNEYS.filter((m) => m.day >= 75).length,
  };

  return (
    <div style={{ padding: 20, background: "#F5F9F8", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: "#0B2E2A" }}>📅 Hành trình 90 ngày</h2>
        <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
          Theo dõi chu kỳ lột xác của thành viên: intake → baseline test → execution → re-test → outcome
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { l: "Tổng thành viên", v: `${summary.total}`, c: "#1890ff", i: "👥" },
          { l: "Giai đoạn intake", v: `${summary.intake}`, c: "#8E9BAE", i: "📝" },
          { l: "Đang tập luyện", v: `${summary.execution}`, c: "#00C9A7", i: "💪" },
          { l: "Đã hoàn thành", v: `${summary.outcome}`, c: "#E8473B", i: "🏆" },
          { l: "Cần nhắc gia hạn", v: `${summary.ready_renewal}`, c: "#FF8C42", i: "🔔" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 2px 8px rgba(11,46,42,.06)", borderLeft: `4px solid ${s.c}` }}>
            <div style={{ fontSize: 18 }}>{s.i}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.c, marginTop: 4 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Phase filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilterPhase("all")}
          style={{
            padding: "6px 14px", borderRadius: 20, border: filterPhase === "all" ? "2px solid #00C9A7" : "1px solid #d9e0de",
            background: filterPhase === "all" ? "#E4F7F3" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}
        >
          Tất cả ({MOCK_JOURNEYS.length})
        </button>
        {Object.entries(PHASE_META).map(([k, m]) => (
          <button
            key={k}
            onClick={() => setFilterPhase(k)}
            style={{
              padding: "6px 14px", borderRadius: 20,
              border: filterPhase === k ? `2px solid ${m.color}` : "1px solid #d9e0de",
              background: filterPhase === k ? `${m.color}22` : "#fff",
              color: filterPhase === k ? m.color : "#6B8A85",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>
        {/* Members list */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(11,46,42,.06)" }}>
          <h4 style={{ marginTop: 0, color: "#0B2E2A" }}>Thành viên ({filtered.length})</h4>
          {filtered.map((m) => {
            const phase = PHASE_META[m.phase];
            const pct = Math.round((m.day / 90) * 100);
            return (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  background: selected?.id === m.id ? "#E4F7F3" : "#F5F9F8",
                  borderRadius: 8,
                  cursor: "pointer",
                  borderLeft: `3px solid ${phase.color}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <strong style={{ fontSize: 13, color: "#0B2E2A" }}>{m.name}</strong>
                  <span style={{ fontSize: 11, color: phase.color, fontWeight: 600 }}>
                    {phase.icon} {phase.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#6B8A85", marginBottom: 6 }}>
                  {m.plan} · {m.station} · Ngày {m.day}/90
                </div>
                <div style={{ height: 6, background: "#fff", borderRadius: 3 }}>
                  <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${phase.color} 0%, #00C9A7 100%)`,
                    borderRadius: 3,
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected detail */}
        {selected && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(11,46,42,.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: "#0B2E2A" }}>{selected.name}</h3>
                <div style={{ fontSize: 12, color: "#6B8A85", marginTop: 4 }}>
                  {selected.plan} · {selected.station}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#FF8C42" }}>Ngày {selected.day}</div>
                <div style={{ fontSize: 11, color: "#6B8A85" }}>/ 90 ngày</div>
              </div>
            </div>

            {/* Progress timeline */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                {Object.entries(PHASE_META).map(([k, m]) => {
                  const isActive = selected.phase === k;
                  const isPast = Object.keys(PHASE_META).indexOf(selected.phase) > Object.keys(PHASE_META).indexOf(k);
                  return (
                    <div key={k} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: isActive ? m.color : isPast ? "#00C9A7" : "#E0E8E5",
                        color: isActive || isPast ? "#fff" : "#8E9BAE",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700,
                        border: isActive ? "3px solid #FF8C42" : "none",
                      }}>
                        {isPast ? "✓" : m.icon}
                      </div>
                      <div style={{ fontSize: 10, color: isActive ? m.color : "#6B8A85", marginTop: 4, fontWeight: isActive ? 700 : 400 }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: 9, color: "#8E9BAE" }}>{m.range}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sessions + body metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: 14, background: "#F5F9F8", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#6B8A85", marginBottom: 6 }}>💪 Buổi tập đã hoàn thành</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#00C9A7" }}>
                  {selected.sessions_done}/{selected.sessions_target}
                </div>
                <div style={{ height: 6, background: "#E0E8E5", borderRadius: 3, marginTop: 8 }}>
                  <div style={{
                    width: `${(selected.sessions_done / selected.sessions_target) * 100}%`,
                    height: "100%",
                    background: "#00C9A7",
                    borderRadius: 3,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 6 }}>
                  Check-in gần nhất: {selected.last_checkin}
                </div>
              </div>

              {selected.body_metrics && (
                <div style={{ padding: 14, background: "#FFF7E6", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#8B5A00", marginBottom: 6 }}>🩺 Chỉ số cơ thể (baseline → hiện tại)</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#6B8A85" }}>Cân nặng:</span>
                    <strong style={{ fontSize: 13 }}>
                      {selected.body_metrics.weight_start} → {selected.body_metrics.weight_current} kg
                      <span style={{ color: "#00C9A7", marginLeft: 6 }}>
                        (-{(selected.body_metrics.weight_start - selected.body_metrics.weight_current).toFixed(1)})
                      </span>
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6B8A85" }}>BMI:</span>
                    <strong style={{ fontSize: 13 }}>
                      {selected.body_metrics.bmi_start} → {selected.body_metrics.bmi_current}
                      <span style={{ color: "#00C9A7", marginLeft: 6 }}>
                        (-{(selected.body_metrics.bmi_start - selected.body_metrics.bmi_current).toFixed(1)})
                      </span>
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {selected.day >= 75 && (
              <div style={{ marginTop: 16, padding: 14, background: "linear-gradient(135deg, #FFF7E6 0%, #FFE0C4 100%)", borderRadius: 8, borderLeft: "4px solid #FF8C42" }}>
                <strong style={{ color: "#8B5A00" }}>🔔 Nhắc gia hạn!</strong>
                <div style={{ fontSize: 12, color: "#6B4A00", marginTop: 4 }}>
                  Thành viên đã đến giai đoạn outcome — gợi ý gia hạn gói 90 ngày tiếp theo.
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => alert(`📨 Đã gửi SMS + Zalo nhắc gia hạn cho ${selected.name}`)}
                    style={{ padding: "8px 14px", background: "#FF8C42", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    📨 Gửi nhắc gia hạn
                  </button>
                  <button
                    onClick={() => alert(`✓ Đã tạo đơn gia hạn 90 ngày tiếp theo cho ${selected.name}. Chuyển tới trang thanh toán...`)}
                    style={{ padding: "8px 14px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    ✓ Tạo đơn gia hạn ngay
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons — always visible */}
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => alert(`🩺 Đã đặt lịch xét nghiệm Medlatec cho ${selected.name}`)}
                style={{ padding: "8px 14px", background: "#722ed1", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                🩺 Đặt lịch xét nghiệm
              </button>
              <button
                onClick={() => alert(`📝 Đã cập nhật chỉ số cơ thể cho ${selected.name}`)}
                style={{ padding: "8px 14px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                📝 Cập nhật chỉ số
              </button>
              <button
                onClick={() => alert(`💬 Đã mở cửa sổ chat với ${selected.name}`)}
                style={{ padding: "8px 14px", background: "#1890ff", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                💬 Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
