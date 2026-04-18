import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import type { Project } from "../../data/projects";

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
}

export default function EditProjectModal({ open, onClose, project }: Props) {
  const [name, setName] = useState(project.name);
  const [client, setClient] = useState(project.client);
  const [days, setDays] = useState(String(project.days));
  const [state, setState] = useState(project.state);
  const { submitting, submit } = useFormStub("Đã cập nhật project");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sửa thông tin project"
      kicker={project.code}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <Field label="Tên project" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Khách hàng">
        <Input value={client} onChange={(e) => setClient(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Deadline còn (ngày)">
          <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
        </Field>
        <Field label="Trạng thái">
          <Select
            value={state}
            onChange={(e) => setState(e.target.value as typeof state)}
            options={[
              { value: "normal", label: "Normal" },
              { value: "warn", label: "Warning" },
              { value: "danger", label: "Danger / blocked" },
              { value: "done", label: "Done" },
            ]}
          />
        </Field>
      </FieldRow>
    </Modal>
  );
}
