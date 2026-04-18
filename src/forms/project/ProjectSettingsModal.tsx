import { useState } from "react";
import { Modal, Field, FieldRow, Input, Toggle, Segmented } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import type { Project } from "../../data/projects";

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
}

export default function ProjectSettingsModal({ open, onClose, project }: Props) {
  const [tab, setTab] = useState<"ai" | "env" | "danger">("ai");
  const { submitting, submit } = useFormStub("Đã lưu project settings");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Settings · ${project.name}`}
      kicker={project.code}
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Đóng
          </button>
          {tab !== "danger" ? (
            <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          ) : null}
        </>
      }
    >
      <div className="segmented" style={{ marginBottom: 16 }}>
        <button type="button" className={tab === "ai" ? "active" : ""} onClick={() => setTab("ai")}>
          AI & Budget
        </button>
        <button type="button" className={tab === "env" ? "active" : ""} onClick={() => setTab("env")}>
          Env & Integrations
        </button>
        <button type="button" className={tab === "danger" ? "active" : ""} onClick={() => setTab("danger")}>
          Danger zone
        </button>
      </div>

      {tab === "ai" ? (
        <>
          <FieldRow>
            <Field label="Model mặc định">
              <Segmented
                value="opus"
                onChange={() => {}}
                options={[
                  { value: "opus", label: "Opus 4.7" },
                  { value: "sonnet", label: "Sonnet 4.6" },
                  { value: "haiku", label: "Haiku 4.5" },
                ]}
              />
            </Field>
            <Field label="AI budget cap (USD)">
              <Input type="number" defaultValue={project.cost.replace("$", "")} />
            </Field>
          </FieldRow>
          <Toggle label="Auto-retry khi LLM fail" help="Retry tối đa 3 lần với backoff" defaultChecked />
          <Toggle label="Log toàn bộ input/output LLM" help="Tăng debug, tốn storage" />
          <Toggle label="Hard stop khi vượt budget" help="Agent pause cho đến khi tăng cap" defaultChecked />
        </>
      ) : tab === "env" ? (
        <>
          <Field label="Staging URL">
            <Input defaultValue={`https://staging.${project.id}.reborn.vn`} />
          </Field>
          <Field label="Production URL">
            <Input defaultValue={`https://${project.id}.reborn.vn`} />
          </Field>
          <Field label="Env variables (.env format)" help="Mask secret sau khi lưu">
            <textarea
              className="textarea mono"
              defaultValue={`DATABASE_URL=postgres://...\nAPI_KEY=***\nSENTRY_DSN=https://...`}
              style={{ minHeight: 120 }}
            />
          </Field>
          <Toggle label="Override tenant integrations cho project này" />
        </>
      ) : (
        <>
          <div
            style={{
              padding: 14,
              border: "1px solid rgba(225,29,72,0.3)",
              background: "rgba(225,29,72,0.03)",
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--rose-500)", marginBottom: 6 }}>Archive project</div>
            <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 10 }}>
              Project chuyển sang readonly. Có thể khôi phục trong 30 ngày.
            </div>
            <button type="button" className="btn danger">
              Archive project
            </button>
          </div>
          <div
            style={{
              padding: 14,
              border: "1px solid rgba(225,29,72,0.3)",
              background: "rgba(225,29,72,0.03)",
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--rose-500)", marginBottom: 6 }}>Transfer ownership</div>
            <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 10 }}>Chuyển project sang member khác làm PM.</div>
            <button type="button" className="btn">
              Chọn PM mới...
            </button>
          </div>
          <div
            style={{
              padding: 14,
              border: "1px solid rgba(225,29,72,0.5)",
              background: "rgba(225,29,72,0.06)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--rose-500)", marginBottom: 6 }}>Delete vĩnh viễn</div>
            <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 10 }}>Không khôi phục được. Audit log vẫn giữ.</div>
            <button type="button" className="btn destructive">
              Delete project...
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
