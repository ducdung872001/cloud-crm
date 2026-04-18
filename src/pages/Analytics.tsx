import { useState } from "react";
import FilterPanelModal from "../forms/analytics/FilterPanelModal";
import ReportBuilderModal from "../forms/analytics/ReportBuilderModal";
import ExportReportModal from "../forms/analytics/ExportReportModal";

export default function Analytics() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">📊 ANALYTICS</div>
          <div className="kicker">Workspace · Last 30 days</div>
          <h1 className="title">Analytics Dashboard</h1>
          <p className="desc">Chi phí AI, cycle time, bug density xuyên suốt các dự án. Filter + custom report builder.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={() => setFilterOpen(true)}>
            ⌕ Filter
          </button>
          <button type="button" className="btn" onClick={() => setBuilderOpen(true)}>
            ✎ Custom report
          </button>
          <button type="button" className="btn primary" onClick={() => setExportOpen(true)}>
            ↓ Export
          </button>
        </div>
      </div>

      <div className="stat-row">
        {[
          { v: "$284", u: "USD", l: "AI cost · tuần này", d: "↓ 12%", cls: "up" },
          { v: "47%", u: "", l: "Time saved vs manual", d: "↑ 5% MoM", cls: "up" },
          { v: "18", u: "ngày", l: "Cycle time TB / project", d: "↓ 4 ngày", cls: "up" },
          { v: "9.2", u: "/10", l: "Client CSAT", d: "↑ 0.3", cls: "up" },
        ].map((s) => (
          <div key={s.l} className="stat">
            <div className="stat-val">
              {s.v}
              <span className="stat-unit">{s.u}</span>
            </div>
            <div className="stat-label">{s.l}</div>
            <div className={`stat-delta ${s.cls}`}>{s.d}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <div className="card-title">AI cost by project (30d)</div>
            <span className="tag tag-info">6 projects</span>
          </div>
          <div style={{ padding: 16 }}>
            {[
              { n: "MSB FXDealing DR", c: 67.8, pct: 100 },
              { n: "TPBank CRM", c: 42.1, pct: 62 },
              { n: "Rox Key BPM", c: 31.2, pct: 46 },
              { n: "Mega Mart DOOH", c: 18.4, pct: 27 },
              { n: "StaffX MKP", c: 12.3, pct: 18 },
              { n: "TNG Archive", c: 4.2, pct: 6 },
            ].map((r) => (
              <div key={r.n} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>{r.n}</span>
                  <strong>${r.c}</strong>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Cycle time per stage</div>
            <span className="tag tag-info">Avg across projects</span>
          </div>
          <div style={{ padding: 16 }}>
            {[
              { s: "01 · Meeting", d: 0.5, pct: 8 },
              { s: "02 · URD", d: 2.2, pct: 34 },
              { s: "03 · Prototype", d: 3.1, pct: 48 },
              { s: "04 · Frontend", d: 4.8, pct: 74 },
              { s: "05 · Backend", d: 6.5, pct: 100 },
              { s: "06 · QA", d: 3.4, pct: 52 },
              { s: "07 · Handover", d: 1.2, pct: 18 },
            ].map((r) => (
              <div key={r.s} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>{r.s}</span>
                  <strong>{r.d} ngày</strong>
                </div>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${r.pct}%`,
                      background: r.pct > 80 ? "linear-gradient(90deg, var(--amber-500), var(--rose-500))" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FilterPanelModal open={filterOpen} onClose={() => setFilterOpen(false)} onApply={() => {}} />
      <ReportBuilderModal open={builderOpen} onClose={() => setBuilderOpen(false)} />
      <ExportReportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </section>
  );
}
