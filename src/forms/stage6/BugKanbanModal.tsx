import { Modal } from "../../components/ui";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Bug {
  id: string;
  title: string;
  severity: "blocker" | "critical" | "major" | "minor";
  assignee: string;
  status: "new" | "fixing" | "retest" | "closed";
}

const INIT: Bug[] = [
  { id: "BUG-101", title: "Filter city không apply", severity: "major", assignee: "Hương C", status: "new" },
  { id: "BUG-102", title: "Campaign overlap detection sai logic", severity: "critical", assignee: "Đức A", status: "fixing" },
  { id: "BUG-103", title: "Uptime DST edge case", severity: "minor", assignee: "Đức A", status: "fixing" },
  { id: "BUG-104", title: "Login button màu sai trên Safari", severity: "minor", assignee: "Hương C", status: "retest" },
  { id: "BUG-105", title: "Export Excel lỗi encoding UTF-8", severity: "major", assignee: "Hương C", status: "closed" },
  { id: "BUG-106", title: "Campaign schedule timezone sai", severity: "critical", assignee: "Đức A", status: "closed" },
];

const COLUMNS: { key: Bug["status"]; title: string; ico: string }[] = [
  { key: "new", title: "NEW", ico: "✨" },
  { key: "fixing", title: "FIXING", ico: "🔧" },
  { key: "retest", title: "RETEST", ico: "🧪" },
  { key: "closed", title: "CLOSED", ico: "✓" },
];

export default function BugKanbanModal({ open, onClose }: Props) {
  const [bugs, setBugs] = useState(INIT);

  const move = (id: string, to: Bug["status"]) => setBugs((prev) => prev.map((b) => (b.id === id ? { ...b, status: to } : b)));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bug tracker — Kanban"
      kicker="STAGE 6 · BUGS"
      sub={`${bugs.length} bugs · ${bugs.filter((b) => b.status !== "closed").length} open`}
      size="xwide"
      footer={
        <button type="button" className="btn" onClick={onClose}>
          Đóng
        </button>
      }
    >
      <div className="kanban">
        {COLUMNS.map((col) => {
          const items = bugs.filter((b) => b.status === col.key);
          return (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-head">
                <span>
                  {col.ico} {col.title}
                </span>
                <span>{items.length}</span>
              </div>
              {items.map((b) => {
                const sevColor =
                  b.severity === "blocker" || b.severity === "critical"
                    ? "var(--rose-500)"
                    : b.severity === "major"
                      ? "var(--amber-500)"
                      : "var(--slate-500)";
                const next = col.key === "new" ? "fixing" : col.key === "fixing" ? "retest" : col.key === "retest" ? "closed" : null;
                return (
                  <div key={b.id} className="kanban-card">
                    <strong>{b.id}</strong>
                    <div style={{ marginBottom: 6 }}>{b.title}</div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        fontSize: 10,
                      }}
                    >
                      <span
                        style={{
                          color: sevColor,
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {b.severity}
                      </span>
                      <span>·</span>
                      <span style={{ color: "var(--slate-500)" }}>{b.assignee}</span>
                    </div>
                    {next ? (
                      <button type="button" className="btn sm" style={{ marginTop: 6, fontSize: 10 }} onClick={() => move(b.id, next)}>
                        → {next}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
