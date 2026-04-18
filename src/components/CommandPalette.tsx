import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PROJECTS } from "../data/projects";
import { PIPELINE } from "../data/pipeline";

type ItemType = "project" | "nav" | "action" | "stage";

interface Item {
  type: ItemType;
  id: string;
  title: string;
  subtitle?: string;
  kb?: string;
  ico: string;
  run: () => void;
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const { switcherOpen, closeSwitcher, openSwitcher, setCurrentProject, currentProject, showToast } = useApp();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSwitcher();
      }
      if (e.key === "Escape") closeSwitcher();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSwitcher, closeSwitcher]);

  useEffect(() => {
    if (!switcherOpen) {
      setQuery("");
      setSelectedIdx(0);
    }
  }, [switcherOpen]);

  const items = useMemo<Item[]>(() => {
    const navItems: Item[] = [
      { type: "nav", id: "/hub", title: "Go to Projects Hub", ico: "◫", run: () => navigate("/hub") },
      { type: "nav", id: "/inbox", title: "Go to Inbox", ico: "✉", run: () => navigate("/inbox") },
      { type: "nav", id: "/analytics", title: "Go to Analytics", ico: "📊", run: () => navigate("/analytics") },
      { type: "nav", id: "/prompts", title: "Go to Prompt Library", ico: "✦", run: () => navigate("/prompts") },
      { type: "nav", id: "/team", title: "Go to Team", ico: "👥", run: () => navigate("/team") },
      { type: "nav", id: "/clients", title: "Go to Clients", ico: "🏢", run: () => navigate("/clients") },
      { type: "nav", id: "/settings", title: "Go to Settings", ico: "⚙", run: () => navigate("/settings") },
    ];
    const projectItems: Item[] = PROJECTS.map((p) => ({
      type: "project",
      id: p.id,
      title: `Open ${p.name}`,
      subtitle: `${p.client} · Stage ${p.stage}`,
      ico: p.initials,
      run: () => {
        setCurrentProject(p.id);
        navigate(`/project/${p.id}/stage/${p.stage}`);
        showToast("info", `Đã mở ${p.name}`);
      },
    }));
    const stageItems: Item[] = PIPELINE.map((s) => ({
      type: "stage",
      id: `stage-${s.num}`,
      title: `Jump to Stage ${s.code} · ${s.label}`,
      subtitle: `${currentProject.name} · ${s.status === "ai" ? "AI-assisted" : "Human checkpoint"}`,
      ico: s.code,
      run: () => navigate(`/project/${currentProject.id}/stage/${s.num}`),
    }));
    const actionItems: Item[] = [
      {
        type: "action",
        id: "new-project",
        title: "Create new project",
        ico: "+",
        run: () => {
          navigate("/hub");
          showToast("info", "Wizard mở từ Hub");
        },
      },
      {
        type: "action",
        id: "new-cr",
        title: "Create change request",
        ico: "⇌",
        run: () => {
          navigate(`/project/${currentProject.id}/changes`);
        },
      },
      { type: "action", id: "upload-audio", title: "Upload meeting audio", ico: "🎙", run: () => navigate(`/project/${currentProject.id}/stage/1`) },
    ];
    return [...projectItems, ...navItems, ...stageItems, ...actionItems];
  }, [currentProject, navigate, setCurrentProject, showToast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => (i.title + " " + (i.subtitle ?? "")).toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const groups: Record<ItemType, Item[]> = {
    project: filtered.filter((i) => i.type === "project"),
    nav: filtered.filter((i) => i.type === "nav"),
    stage: filtered.filter((i) => i.type === "stage"),
    action: filtered.filter((i) => i.type === "action"),
  };

  const flatList = [...groups.project, ...groups.nav, ...groups.stage, ...groups.action];

  const pick = (item: Item) => {
    item.run();
    closeSwitcher();
  };

  if (!switcherOpen) return null;

  return (
    <div
      className="overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSwitcher();
      }}
    >
      <div className="dialog cmdp">
        <div className="dialog-search">
          <span style={{ color: "var(--slate-400)" }}>⌕</span>
          <input
            autoFocus
            placeholder="Chuyển project · nhảy page · tạo mới..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIdx((i) => Math.min(i + 1, flatList.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && flatList[selectedIdx]) {
                pick(flatList[selectedIdx]);
              }
            }}
          />
          <span className="search-kbd">Esc</span>
        </div>
        <div className="dialog-list">
          {flatList.length === 0 ? (
            <div className="empty" style={{ padding: "32px 20px" }}>
              <div className="empty-ico">⌕</div>
              <div className="empty-title">Không khớp</div>
              <div className="empty-desc">Thử từ khóa khác.</div>
            </div>
          ) : (
            (
              [
                ["project", "PROJECTS"],
                ["nav", "NAVIGATION"],
                ["stage", `STAGES · ${currentProject.code}`],
                ["action", "ACTIONS"],
              ] as const
            ).map(([key, label]) =>
              groups[key].length > 0 ? (
                <div key={key}>
                  <div className="cmdp-section">{label}</div>
                  {groups[key].map((item) => {
                    const isActive = flatList[selectedIdx]?.id === item.id;
                    return (
                      <div
                        key={`${key}-${item.id}`}
                        className={`cmdp-item ${isActive ? "active" : ""}`}
                        onClick={() => pick(item)}
                        onMouseEnter={() => setSelectedIdx(flatList.findIndex((x) => x.id === item.id))}
                      >
                        <div className="cmdp-item-ico">{item.ico}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500 }}>{item.title}</div>
                          {item.subtitle ? <div style={{ fontSize: 11, color: "var(--slate-500)", marginTop: 1 }}>{item.subtitle}</div> : null}
                        </div>
                        {item.kb ? <span className="cmdp-item-kb">{item.kb}</span> : null}
                      </div>
                    );
                  })}
                </div>
              ) : null
            )
          )}
        </div>
      </div>
    </div>
  );
}
