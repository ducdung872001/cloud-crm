import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PROJECTS, type Project } from "../data/projects";
import ProjectWizardModal from "../forms/project/ProjectWizardModal";
import ImportProjectModal from "../forms/project/ImportProjectModal";

const STATS = [
  { val: "14", unit: "active", label: "Dự án đang sản xuất", delta: "↑ 2 tuần này", cls: "up" },
  { val: "$284", unit: "USD", label: "Chi phí AI tuần này", delta: "↓ 12% vs tuần trước", cls: "dn" },
  {
    val: "8",
    unit: "pending",
    label: "Checkpoint chờ duyệt",
    delta: "● 2 quá hạn",
    deltaStyle: { color: "var(--rose-500)" },
  },
  { val: "47", unit: "%", label: "Time saved vs manual", delta: "↑ 5% MoM", cls: "up" },
] as const;

export default function Hub() {
  const navigate = useNavigate();
  const { setCurrentProject, showToast } = useApp();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const openProject = (p: Project) => {
    setCurrentProject(p.id);
    showToast("info", `Đã mở ${p.name}`, "Workspace của project được load");
    navigate(`/project/${p.id}/stage/${p.stage}`);
  };

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">◫ MULTI-PROJECT HUB</div>
          <div className="kicker">Projects · All active</div>
          <h1 className="title">Projects Hub</h1>
          <p className="desc">Tất cả dự án đang sản xuất song song. Mỗi project là một pipeline độc lập. Click vào project để vào workspace.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={() => showToast("info", "Filter áp dụng", "Đang lọc theo stage đang mở")}>
            ⌕ Filter
          </button>
          <button type="button" className="btn" onClick={() => setImportOpen(true)}>
            ↓ Import
          </button>
          <button type="button" className="btn primary" onClick={() => setWizardOpen(true)}>
            + Tạo project mới
          </button>
        </div>
      </div>

      <div className="stat-row">
        {STATS.map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-val">
              {s.val}
              <span className="stat-unit">{s.unit}</span>
            </div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-delta ${"cls" in s ? s.cls : ""}`} style={"deltaStyle" in s ? s.deltaStyle : undefined}>
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="hub-grid">
        {PROJECTS.map((p) => {
          const cardCls = p.state === "normal" ? "" : p.state;
          const tagCls = p.state === "warn" ? "tag-warn" : p.state === "done" ? "tag-ok" : "tag-ai";
          const tagText = p.state === "warn" ? "Blocked" : p.state === "done" ? "Almost done" : `Stage ${p.stage}`;
          return (
            <div key={p.id} className={`project-card ${cardCls}`} onClick={() => openProject(p)}>
              <div className="pc-head">
                <div>
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-client">{p.client}</div>
                  <div className="pc-code">{p.code}</div>
                </div>
                <span className={`tag ${tagCls}`}>{tagText}</span>
              </div>
              <div className="pc-stages">
                {p.stages.map((s, i) => (
                  <div key={i} className={`pc-stage ${s}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="pc-meta">
                <div>
                  <div className="lbl">Ngày còn</div>
                  <div className="val" style={p.days < 0 ? { color: "var(--rose-500)" } : undefined}>
                    {p.days}
                  </div>
                </div>
                <div>
                  <div className="lbl">AI cost</div>
                  <div className="val">{p.cost}</div>
                </div>
                <div>
                  <div className="lbl">Sessions</div>
                  <div className="val">{p.sessions}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ProjectWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <ImportProjectModal open={importOpen} onClose={() => setImportOpen(false)} />
    </section>
  );
}
