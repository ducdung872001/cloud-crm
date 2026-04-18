import { useState } from "react";
import { Drawer, Textarea } from "../../components/ui";
import { useApp } from "../../context/AppContext";

interface FileChange {
  path: string;
  op: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
  diff: string;
}

interface Commit {
  sha: string;
  title: string;
  author: string;
  ts: string;
  files: FileChange[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  commit: Commit | null;
}

const SAMPLE_DIFF = `@@ -1,8 +1,12 @@
 import { useState } from "react";
+import { useQuery } from "@tanstack/react-query";

 export function ScreenTable() {
-  const [data, setData] = useState([]);
+  const { data } = useQuery({
+    queryKey: ["screens"],
+    queryFn: () => fetch("/api/screens").then(r => r.json()),
+  });`;

export default function CommitReviewDrawer({ open, onClose, commit }: Props) {
  const { showToast } = useApp();
  const [comment, setComment] = useState("");

  const c = commit ?? {
    sha: "7b4a2f",
    title: "feat: scaffold Next.js + Tailwind + shadcn/ui",
    author: "claude-agent[bot]",
    ts: "18/04 15:42",
    files: [
      { path: "package.json", op: "added" as const, additions: 42, deletions: 0, diff: SAMPLE_DIFF },
      { path: "app/layout.tsx", op: "added" as const, additions: 28, deletions: 0, diff: SAMPLE_DIFF },
      { path: "app/page.tsx", op: "added" as const, additions: 65, deletions: 0, diff: SAMPLE_DIFF },
      { path: "components/ScreenTable.tsx", op: "added" as const, additions: 147, deletions: 0, diff: SAMPLE_DIFF },
      { path: "components/ScreenMap.tsx", op: "added" as const, additions: 92, deletions: 0, diff: SAMPLE_DIFF },
    ],
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={c.title}
      sub={`${c.sha} · ${c.author} · ${c.ts}`}
      wide
      footer={
        <>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              showToast("warn", `Đã revert ${c.sha}`, "Tạo commit revert");
              onClose();
            }}
          >
            ↶ Revert commit
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="btn"
            onClick={() => {
              showToast("warn", `Request changes`, "Gửi comment cho agent regenerate");
              onClose();
            }}
          >
            ✗ Request changes
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              showToast("success", `Approved ${c.sha}`, "Agent tiếp tục stage tiếp theo");
              onClose();
            }}
          >
            ✓ Approve
          </button>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 14,
          padding: 10,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        <div>
          <strong>{c.files.length}</strong> files changed
        </div>
        <span>·</span>
        <div style={{ color: "var(--emerald-500)" }}>+{c.files.reduce((a, f) => a + f.additions, 0)}</div>
        <div style={{ color: "var(--rose-500)" }}>−{c.files.reduce((a, f) => a + f.deletions, 0)}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        {c.files.map((f) => (
          <div key={f.path} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                background: "var(--slate-100)",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
            >
              <span className={`tag ${f.op === "added" ? "tag-ok" : f.op === "deleted" ? "tag-hu" : "tag-warn"}`}>
                {f.op === "added" ? "A" : f.op === "deleted" ? "D" : "M"}
              </span>
              {f.path}
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <span style={{ color: "var(--emerald-500)" }}>+{f.additions}</span>
                <span style={{ color: "var(--rose-500)" }}>−{f.deletions}</span>
              </div>
            </div>
            <pre
              style={{
                background: "var(--slate-900)",
                color: "#E2E8F0",
                padding: 10,
                borderRadius: "0 0 6px 6px",
                fontSize: 11,
                overflow: "auto",
                lineHeight: 1.5,
                marginTop: 2,
              }}
            >
              {f.diff}
            </pre>
          </div>
        ))}
      </div>

      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Review comment</div>
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment cho agent (optional)" />
    </Drawer>
  );
}
