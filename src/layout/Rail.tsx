import { useLocation, useNavigate } from "react-router-dom";
import { INBOX_ITEMS } from "../data/inbox";

type RailKey = "hub" | "inbox" | "analytics" | "prompts" | "team" | "clients" | "settings";

interface RailEntry {
  key: RailKey;
  path: string;
  icon: string;
  title: string;
  badge?: number;
}

const INBOX_COUNT = INBOX_ITEMS.length;

const TOP_ITEMS: RailEntry[] = [
  { key: "hub", path: "/hub", icon: "◫", title: "Projects Hub" },
  { key: "inbox", path: "/inbox", icon: "✉", title: "Inbox", badge: INBOX_COUNT },
  { key: "analytics", path: "/analytics", icon: "📊", title: "Analytics" },
  { key: "prompts", path: "/prompts", icon: "✦", title: "Prompt Library" },
];

const MID_ITEMS: RailEntry[] = [
  { key: "team", path: "/team", icon: "👥", title: "Team" },
  { key: "clients", path: "/clients", icon: "🏢", title: "Clients" },
];

export default function Rail() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const renderItem = (item: RailEntry) => (
    <button
      key={item.key}
      type="button"
      className={`rail-item ${isActive(item.path) ? "active" : ""}`}
      onClick={() => navigate(item.path)}
      title={item.title}
    >
      {item.icon}
      {item.badge ? <span className="rail-badge">{item.badge}</span> : null}
    </button>
  );

  return (
    <aside className="rail">
      <button type="button" className="rail-logo" onClick={() => navigate("/hub")} title="Về Projects Hub">
        R
      </button>
      {TOP_ITEMS.map(renderItem)}
      <div className="rail-sep" />
      {MID_ITEMS.map(renderItem)}

      <div className="rail-bottom">
        <button type="button" className={`rail-item ${isActive("/settings") ? "active" : ""}`} onClick={() => navigate("/settings")} title="Settings">
          ⚙
        </button>
        <div className="rail-avatar" title="Profile">
          RB
        </div>
      </div>
    </aside>
  );
}
