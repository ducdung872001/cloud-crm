import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PROJECTS } from "../data/projects";
import { PIPELINE } from "../data/pipeline";

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentProject, openSwitcher } = useApp();
  const stageMatch = useMatch("/project/:id/stage/:n");
  const currentStage = stageMatch ? Number(stageMatch.params.n) : 0;

  const isArtifactActive = (suffix: string) => pathname === `/project/${currentProject.id}/${suffix}`;

  const goArtifact = (suffix: string) => navigate(`/project/${currentProject.id}/${suffix}`);

  return (
    <aside className="sidebar">
      <div className="ws-title">Workspace</div>
      <div className="ws-name">Reborn Forge</div>
      <div className="ws-sub">JSC · {PROJECTS.length} active projects</div>

      <div className="project-switch" onClick={openSwitcher}>
        <div className="proj-dot" style={{ background: currentProject.dotColor }} />
        <div className="proj-info">
          <div className="name">{currentProject.name}</div>
          <div className="client">{currentProject.client}</div>
        </div>
        <span className="proj-switch-ico">⇅</span>
      </div>

      <div className="nav-title">Pipeline</div>
      {PIPELINE.map((step) => {
        const state = step.num < currentStage ? "done" : step.num === currentStage ? "active" : "";
        return (
          <div key={step.num} className={`nav-item ${state}`} onClick={() => navigate(`/project/${currentProject.id}/stage/${step.num}`)}>
            <div className="step-num">{step.code}</div>
            <div className="step-label">{step.label}</div>
            <div className={`step-status ${step.status}`}>{step.status === "ai" ? "AI" : "HU"}</div>
          </div>
        );
      })}

      <div className="nav-title">Artifacts</div>
      <div className={`nav-item ${isArtifactActive("sessions") ? "active" : ""}`} onClick={() => goArtifact("sessions")}>
        <div className="step-num">🎙</div>
        <div className="step-label">Meeting sessions</div>
        <span className="nav-sidebar-count">{currentProject.sessions}</span>
      </div>
      <div className={`nav-item ${isArtifactActive("changes") ? "active" : ""}`} onClick={() => goArtifact("changes")}>
        <div className="step-num">⇌</div>
        <div className="step-label">Change Requests</div>
        <span className="nav-sidebar-count" style={{ color: "var(--amber-400)" }}>
          2
        </span>
      </div>
      <div className={`nav-item ${isArtifactActive("deliverables") ? "active" : ""}`} onClick={() => goArtifact("deliverables")}>
        <div className="step-num">📦</div>
        <div className="step-label">Deliverables</div>
      </div>
    </aside>
  );
}
