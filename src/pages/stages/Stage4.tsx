import { Fragment, useState } from "react";
import TechStackPickerModal from "../../forms/stage4/TechStackPickerModal";
import RepoConfigModal from "../../forms/stage4/RepoConfigModal";
import TechLeadPromptModal from "../../forms/stage4/TechLeadPromptModal";
import EnvVarsModal from "../../forms/stage4/EnvVarsModal";
import DeployConfigModal from "../../forms/stage4/DeployConfigModal";
import AgentSessionModal from "../../forms/stage4/AgentSessionModal";
import CommitReviewDrawer from "../../forms/stage4/CommitReviewDrawer";

const COMMITS = [
  { sha: "6a", title: "feat: scaffold Next.js + Tailwind", meta: "Claude Agent · 4m ago · 47 files" },
  { sha: "7b", title: "feat: Screen list & map components", meta: "Claude Agent · 2m ago · 6 files" },
  { sha: "8c", title: "wip: campaign editor", meta: "Claude Agent · 30s ago · đang làm" },
];

export default function Stage4() {
  const [stackOpen, setStackOpen] = useState(false);
  const [repoOpen, setRepoOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [commitOpen, setCommitOpen] = useState(false);

  return (
    <div className="grid-2">
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div className="card-title">Claude Code · Live Session</div>
            <span className="tag tag-ai">Running</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="code-block" style={{ borderRadius: 0, margin: 0 }}>
              <span className="cm"># Session: project-fe @ main{"\n"}</span>
              <span className="cm"># Started: 15:34:12 · Elapsed: 4m 22s{"\n\n"}</span>
              <span className="fn">▶</span> <span className="kw">Reading</span> URD + prototype...{"\n"}
              <span className="fn">▶</span> <span className="kw">Scaffolding</span> Next.js 14 + TypeScript + Tailwind{"\n"}
              {"  ✓ "}
              <span className="str">package.json</span> created{"\n"}
              {"  ✓ "}
              <span className="str">tsconfig.json</span> strict mode enabled{"\n"}
              {"  ✓ "}
              <span className="str">.eslintrc</span>, <span className="str">.prettierrc</span> configured{"\n"}
              <span className="fn">▶</span> <span className="kw">Generating</span> components...{"\n"}
              {"  ✓ "}
              <span className="str">components/ScreenTable.tsx</span> (147 lines){"\n"}
              {"  ✓ "}
              <span className="str">components/ScreenMap.tsx</span> (92 lines){"\n"}
              {"  ⠙ "}
              <span className="str">components/CampaignEditor.tsx</span>...{"\n"}
              <span className="fn">▶</span> <span className="kw">Running</span> <span className="fn">npm run build</span>...
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Git activity</div>
          </div>
          <div className="file-list">
            {COMMITS.map((c) => (
              <div key={c.sha} className="file-item" onClick={() => setCommitOpen(true)}>
                <div className="file-ico ico-code">{c.sha}</div>
                <div>
                  <div className="file-name">{c.title}</div>
                  <div className="file-sub">{c.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div className="card-title">✦ Prompt bổ sung (Tech Lead)</div>
            <span className="tag tag-hu">Checkpoint 3</span>
          </div>
          <div className="card-body">
            <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 8 }}>
              Tech Lead bổ sung constraint trước khi chạy. Prompt được version và audit log.
            </div>
            <textarea
              style={{
                width: "100%",
                minHeight: 120,
                border: "1px solid var(--slate-200)",
                borderRadius: 8,
                padding: "10px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              defaultValue={`TECH STACK:
- Next.js 14 App Router
- Tailwind + shadcn/ui
- React Query + Zustand

CODING RULES:
- Component tối đa 200 lines
- Không hardcode API URL
- ErrorBoundary top-level
- i18n: vi + en`}
            />
            <button
              type="button"
              className="btn primary"
              style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
              onClick={() => setPromptOpen(true)}
            >
              Duyệt & chạy →
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">DevOps Pipeline</div>
          </div>
          <div style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {["✓", "✓", "⠙", ""].map((mark, i) => (
                <Fragment key={i}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: mark === "✓" ? "var(--emerald-500)" : mark === "⠙" ? "var(--teal-500)" : "var(--slate-200)",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {mark}
                  </div>
                  {i < 3 ? (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: i < 1 ? "var(--emerald-500)" : i < 2 ? "var(--teal-500)" : "var(--slate-200)",
                      }}
                    />
                  ) : null}
                </Fragment>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 4,
                fontSize: 10,
                textAlign: "center",
                color: "var(--slate-600)",
              }}
            >
              <div>
                <strong>Lint</strong>
                <br />
                passed
              </div>
              <div>
                <strong>Build</strong>
                <br />
                passed
              </div>
              <div>
                <strong>Deploy</strong>
                <br />
                running
              </div>
              <div>
                <strong>Smoke</strong>
                <br />
                pending
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                padding: 12,
                background: "var(--slate-50)",
                borderRadius: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
            >
              <div style={{ color: "var(--emerald-500)" }}>✓ Lint passed — 0 errors, 3 warnings</div>
              <div style={{ color: "var(--emerald-500)" }}>✓ Build size: 284 KB gzipped</div>
              <div style={{ color: "var(--teal-500)" }}>⠙ Deploying to staging...</div>
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
        <button type="button" className="btn" onClick={() => setStackOpen(true)}>
          ⚙ Tech stack
        </button>
        <button type="button" className="btn" onClick={() => setRepoOpen(true)}>
          🐙 Repo config
        </button>
        <button type="button" className="btn" onClick={() => setEnvOpen(true)}>
          🔐 Env vars
        </button>
        <button type="button" className="btn" onClick={() => setDeployOpen(true)}>
          🚀 Deploy config
        </button>
        <button type="button" className="btn" onClick={() => setPromptOpen(true)}>
          ✎ Prompt (Tech Lead)
        </button>
        <button type="button" className="btn ai" onClick={() => setAgentOpen(true)}>
          ▶ Launch agent
        </button>
        <button type="button" className="btn" onClick={() => setCommitOpen(true)}>
          👁 Review commit
        </button>
      </div>

      <TechStackPickerModal open={stackOpen} onClose={() => setStackOpen(false)} />
      <RepoConfigModal open={repoOpen} onClose={() => setRepoOpen(false)} />
      <TechLeadPromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />
      <EnvVarsModal open={envOpen} onClose={() => setEnvOpen(false)} />
      <DeployConfigModal open={deployOpen} onClose={() => setDeployOpen(false)} />
      <AgentSessionModal open={agentOpen} onClose={() => setAgentOpen(false)} />
      <CommitReviewDrawer open={commitOpen} onClose={() => setCommitOpen(false)} commit={null} />
    </div>
  );
}
