import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useApp, type Role } from "../context/AppContext";
import { findStage } from "../data/pipeline";
import ProfileMenu from "./ProfileMenu";

const ROLES: Role[] = ["BA", "Dev", "QA", "PM", "Client"];

const TOP_TITLES: Record<string, string> = {
  "/hub": "Projects Hub",
  "/inbox": "Inbox · Cross-project",
  "/analytics": "Analytics",
  "/prompts": "Prompt Library",
  "/team": "Team",
  "/clients": "Clients",
  "/settings": "Settings",
};

export default function Topbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role, setRole, currentProject, openSwitcher } = useApp();

  const stageMatch = useMatch("/project/:id/stage/:n");
  const sessionsMatch = useMatch("/project/:id/sessions");
  const changesMatch = useMatch("/project/:id/changes");
  const deliverMatch = useMatch("/project/:id/deliverables");

  let crumb = "";
  let inProject = false;

  if (stageMatch) {
    const n = Number(stageMatch.params.n);
    const step = findStage(n);
    crumb = step ? `Stage ${step.code} · ${step.label}` : "Stage";
    inProject = true;
  } else if (sessionsMatch) {
    crumb = "Meeting Sessions";
    inProject = true;
  } else if (changesMatch) {
    crumb = "Change Requests";
    inProject = true;
  } else if (deliverMatch) {
    crumb = "Deliverables";
    inProject = true;
  } else {
    crumb = TOP_TITLES[pathname] ?? "Không tìm thấy";
  }

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span className="crumb-link" onClick={() => navigate("/hub")}>
          Projects
        </span>
        <span>›</span>
        {inProject ? (
          <>
            <span className="crumb-link" onClick={() => navigate(`/project/${currentProject.id}/stage/${currentProject.stage}`)}>
              {currentProject.name}
            </span>
            <span>›</span>
            <strong>{crumb}</strong>
          </>
        ) : (
          <strong>{crumb}</strong>
        )}
      </div>

      <div className="search-box" onClick={openSwitcher}>
        <span style={{ color: "var(--slate-400)" }}>⌕</span>
        <input placeholder="Tìm project, meeting, URD..." readOnly />
        <span className="search-kbd">⌘K</span>
      </div>

      <div className="spacer" />

      <div className="role-switcher">
        {ROLES.map((r) => (
          <button key={r} type="button" className={`role-btn ${role === r ? "active" : ""}`} onClick={() => setRole(r)}>
            {r === "BA" ? "BA/SA" : r}
          </button>
        ))}
      </div>

      <ProfileMenu />
    </header>
  );
}
