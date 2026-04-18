import { useState } from "react";
import { Modal, Field, Input, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import type { Project } from "../../data/projects";

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
}

export default function DuplicateProjectModal({ open, onClose, project }: Props) {
  const [name, setName] = useState(`${project.name} (copy)`);
  const [code, setCode] = useState(`${project.code}-COPY`);
  const [urd, setUrd] = useState(true);
  const [prototype, setPrototype] = useState(true);
  const [team, setTeam] = useState(true);
  const [integrations, setIntegrations] = useState(false);
  const [stack, setStack] = useState(true);
  const { submitting, submit } = useFormStub("Đã duplicate project", "Project mới khởi tạo ở Stage 1");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Duplicate từ template"
      kicker={`TEMPLATE: ${project.code}`}
      sub="Chọn phần nào copy sang project mới."
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !name || !code} onClick={() => submit(onClose)}>
            {submitting ? "Đang duplicate..." : "Duplicate"}
          </button>
        </>
      }
    >
      <Field label="Tên project mới" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Code" required>
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "14px 0 6px" }}>Copy những gì?</div>
      <Checkbox label="URD (structure + requirements)" checked={urd} onChange={setUrd} />
      <Checkbox label="Prototype (HTML + feedback đã resolve)" checked={prototype} onChange={setPrototype} />
      <Checkbox label="Team members + roles" checked={team} onChange={setTeam} />
      <Checkbox label="Tech stack + env variables" checked={stack} onChange={setStack} />
      <Checkbox
        label="Integrations (Git repo, Jira, Slack)"
        help="Cần tạo repo mới nếu integrations bật"
        checked={integrations}
        onChange={setIntegrations}
      />
    </Modal>
  );
}
