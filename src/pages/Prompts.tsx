import { useState } from "react";
import PromptTemplateModal, { type PromptTemplate } from "../forms/prompts/PromptTemplateModal";
import VariablesModal from "../forms/prompts/VariablesModal";
import ABTestModal from "../forms/prompts/ABTestModal";
import VersionHistoryModal from "../forms/prompts/VersionHistoryModal";
import { useApp } from "../context/AppContext";

const TEMPLATES: Omit<PromptTemplate, "system" | "user">[] = [
  {
    id: "1",
    name: "urd-diff",
    category: "Session — Review",
    model: "Opus 4.7",
    description: "So sánh transcript với URD → diff",
    tags: ["urd", "diff", "review"],
  },
  {
    id: "2",
    name: "urd-kickoff",
    category: "Session — Kickoff",
    model: "Opus 4.7",
    description: "Sinh URD v1.0 từ kickoff meeting",
    tags: ["urd", "kickoff"],
  },
  {
    id: "3",
    name: "cr-impact",
    category: "Session — Change Request",
    model: "Sonnet 4.6",
    description: "Phân tích impact CR (timeline, cost)",
    tags: ["cr", "impact"],
  },
  {
    id: "4",
    name: "prototype-gen",
    category: "Stage 3 — Prototype",
    model: "Opus 4.7",
    description: "Sinh HTML prototype từ URD",
    tags: ["prototype", "html"],
  },
  {
    id: "5",
    name: "fe-scaffold",
    category: "Stage 4 — Frontend",
    model: "Opus 4.7",
    description: "Scaffold Next.js project",
    tags: ["fe", "scaffold"],
  },
  {
    id: "6",
    name: "be-scaffold",
    category: "Stage 5 — Backend",
    model: "Opus 4.7",
    description: "Scaffold Spring Boot + JOOQ",
    tags: ["be", "scaffold"],
  },
  { id: "7", name: "testcase-gen", category: "Stage 6 — Test case", model: "Sonnet 4.6", description: "Sinh test case từ URD", tags: ["test", "qa"] },
  {
    id: "8",
    name: "release-note",
    category: "Stage 7 — Release doc",
    model: "Sonnet 4.6",
    description: "Sinh release note từ changelog",
    tags: ["release", "doc"],
  },
];

export default function Prompts() {
  const { showToast } = useApp();
  const [tplOpen, setTplOpen] = useState(false);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [varsOpen, setVarsOpen] = useState(false);
  const [abOpen, setAbOpen] = useState(false);
  const [versOpen, setVersOpen] = useState(false);
  const [versTemplate, setVersTemplate] = useState("urd-diff");

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">✦ PROMPT LIBRARY</div>
          <div className="kicker">{TEMPLATES.length} templates · 3 A/B tests running</div>
          <h1 className="title">Prompt Templates</h1>
          <p className="desc">Version control prompt cho mọi session type + mỗi stage. A/B test trên production traffic, rollback khi regression.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={() => setAbOpen(true)}>
            🧪 Tạo A/B test
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setEditing(null);
              setTplOpen(true);
            }}
          >
            + Tạo template
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Model</th>
              <th>Mô tả</th>
              <th>Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {TEMPLATES.map((t) => (
              <tr key={t.id}>
                <td>
                  <code style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>{t.name}</code>
                </td>
                <td>
                  <span className="tag tag-info">{t.category}</span>
                </td>
                <td style={{ fontSize: 12 }}>{t.model}</td>
                <td style={{ fontSize: 12, color: "var(--slate-600)" }}>{t.description}</td>
                <td>
                  {t.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag" style={{ marginRight: 4, background: "var(--slate-100)" }}>
                      {tag}
                    </span>
                  ))}
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => {
                        setEditing({ ...t, system: "", user: "" });
                        setTplOpen(true);
                      }}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => {
                        setVersTemplate(t.name);
                        setVarsOpen(true);
                      }}
                    >
                      {"{x}"}
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => {
                        setVersTemplate(t.name);
                        setVersOpen(true);
                      }}
                    >
                      ↻
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PromptTemplateModal
        open={tplOpen}
        onClose={() => setTplOpen(false)}
        template={editing}
        onSave={() => showToast("success", "Template đã lưu")}
      />
      <VariablesModal open={varsOpen} onClose={() => setVarsOpen(false)} templateName={versTemplate} />
      <ABTestModal open={abOpen} onClose={() => setAbOpen(false)} />
      <VersionHistoryModal open={versOpen} onClose={() => setVersOpen(false)} templateName={versTemplate} />
    </section>
  );
}
