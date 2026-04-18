import { useState } from "react";
import { useApp } from "../../context/AppContext";
import TestCaseFormModal, { type TestCase } from "../../forms/stage6/TestCaseFormModal";
import BugReportModal from "../../forms/stage6/BugReportModal";
import TestExecutionModal from "../../forms/stage6/TestExecutionModal";
import BugKanbanModal from "../../forms/stage6/BugKanbanModal";
import ChecklistTemplateModal from "../../forms/stage6/ChecklistTemplateModal";
import TestPlanModal from "../../forms/stage6/TestPlanModal";
import TestRunCompareModal from "../../forms/stage6/TestRunCompareModal";

const TESTS = [
  { ok: true, label: "SCR-001 · Create screen valid data", time: "124ms" },
  { ok: true, label: "SCR-002 · Reject invalid GPS", time: "87ms" },
  { ok: true, label: "SCR-003 · Filter by city", time: "156ms" },
  { ok: false, label: "CMP-014 · Campaign overlap detection", time: "203ms" },
  { ok: true, label: "CMP-015 · Schedule validation", time: "142ms" },
  { ok: false, label: "RPT-008 · Uptime DST edge case", time: "312ms" },
  { ok: true, label: "AUTH-001 · RBAC Content Mgr edit", time: "98ms" },
  { ok: true, label: "AUTH-002 · RBAC Store Ops readonly", time: "102ms" },
];

const CHECKLIST = [
  { label: "Smoke test staging env", checked: true },
  { label: "UX review với design", checked: true },
  { label: "Cross-browser test", checked: false },
  { label: "Performance audit", checked: false },
  { label: "Security scan OWASP", checked: false },
];

export default function Stage6() {
  const { showToast } = useApp();
  const [tcOpen, setTcOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const [execOpen, setExecOpen] = useState(false);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [cmpOpen, setCmpOpen] = useState(false);

  return (
    <>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card metric">
          <div className="metric-val">
            87<span className="metric-unit">%</span>
          </div>
          <div className="metric-label">Code coverage</div>
          <div className="bar" style={{ marginTop: 10 }}>
            <div
              className="bar-fill"
              style={{
                width: "87%",
                background: "linear-gradient(90deg, var(--emerald-500), var(--emerald-400))",
              }}
            />
          </div>
        </div>
        <div className="card metric">
          <div className="metric-val">142/148</div>
          <div className="metric-label">Test case pass</div>
          <div className="metric-delta" style={{ color: "var(--rose-500)" }}>
            ● 6 failed
          </div>
        </div>
        <div className="card metric">
          <div className="metric-val">
            23<span className="metric-unit">s</span>
          </div>
          <div className="metric-label">Suite duration</div>
          <div className="metric-delta up">↓ 4s vs last run</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Test scenarios</div>
            <span className="tag tag-ai">{TESTS.length} scenarios</span>
          </div>
          <div style={{ padding: "4px 0", maxHeight: 380, overflowY: "auto" }}>
            {TESTS.map((t, i) => (
              <div key={i} className="test-row">
                <div className={t.ok ? "test-ok" : "test-fail"}>{t.ok ? "✓" : "✗"}</div>
                <div>{t.label}</div>
                <div className="test-time">{t.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">QA review — chờ action</div>
            <span className="tag tag-hu">QA Role</span>
          </div>
          <div className="card-body">
            <div
              style={{
                background: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: 8,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--rose-500)" }}>✗ CMP-014 — Campaign overlap</div>
              <div style={{ fontSize: 12, color: "var(--slate-700)", marginTop: 6 }}>
                AI sinh test case 2 campaign trùng khung giờ, nhưng logic backend chưa xử lý overlap một phần.
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="button" className="btn sm" onClick={() => setBugOpen(true)}>
                  🐛 Tạo bug
                </button>
                <button type="button" className="btn sm" onClick={() => setExecOpen(true)}>
                  📝 Ghi kết quả
                </button>
                <button type="button" className="btn sm" onClick={() => showToast("warn", "Đã skip test")}>
                  ⏭ Skip
                </button>
              </div>
            </div>

            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--slate-500)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              QA Checklist manual
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CHECKLIST.map((c) => (
                <label key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked={c.checked} />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <button type="button" className="btn" onClick={() => setTcOpen(true)}>
          + Test case
        </button>
        <button type="button" className="btn" onClick={() => setBugOpen(true)}>
          🐛 Report bug
        </button>
        <button type="button" className="btn" onClick={() => setExecOpen(true)}>
          ▶ Ghi kết quả run
        </button>
        <button type="button" className="btn" onClick={() => setKanbanOpen(true)}>
          📊 Bug Kanban
        </button>
        <button type="button" className="btn" onClick={() => setPlanOpen(true)}>
          📅 Test plan
        </button>
        <button type="button" className="btn" onClick={() => setChecklistOpen(true)}>
          ✎ Checklist template
        </button>
        <button type="button" className="btn" onClick={() => setCmpOpen(true)}>
          ↔ So sánh runs
        </button>
      </div>

      <TestCaseFormModal
        open={tcOpen}
        onClose={() => setTcOpen(false)}
        tc={null}
        onSave={(_tc: TestCase) => showToast("success", "Test case đã lưu")}
      />
      <BugReportModal open={bugOpen} onClose={() => setBugOpen(false)} />
      <TestExecutionModal open={execOpen} onClose={() => setExecOpen(false)} />
      <BugKanbanModal open={kanbanOpen} onClose={() => setKanbanOpen(false)} />
      <ChecklistTemplateModal open={checklistOpen} onClose={() => setChecklistOpen(false)} />
      <TestPlanModal open={planOpen} onClose={() => setPlanOpen(false)} />
      <TestRunCompareModal open={cmpOpen} onClose={() => setCmpOpen(false)} />
    </>
  );
}
