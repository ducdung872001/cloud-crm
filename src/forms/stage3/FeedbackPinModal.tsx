import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
  coords?: { x: number; y: number; page?: string };
}

export default function FeedbackPinModal({ open, onClose, coords }: Props) {
  const [severity, setSeverity] = useState<"blocking" | "major" | "minor" | "nit">("minor");
  const [category, setCategory] = useState("ui");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState("ai-agent");
  const { submitting, submit } = useFormStub("Đã ghi feedback", "Pin lên prototype + notify team");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pin feedback trên prototype"
      kicker={`STAGE 3 · PIN${coords ? ` @ (${coords.x}, ${coords.y})` : ""}`}
      sub={coords?.page ? `Trang: ${coords.page}` : "Click vào vùng bất kỳ trên preview để pin comment"}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !title} onClick={() => submit(onClose)}>
            {submitting ? "Đang ghi..." : "Pin feedback"}
          </button>
        </>
      }
    >
      <Field label="Tiêu đề" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card Online nên có trend 7 ngày" autoFocus />
      </Field>
      <Field label="Mô tả chi tiết">
        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Severity">
          <Select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as typeof severity)}
            options={[
              { value: "blocking", label: "Blocking" },
              { value: "major", label: "Major" },
              { value: "minor", label: "Minor" },
              { value: "nit", label: "Nit / thẩm mỹ" },
            ]}
          />
        </Field>
        <Field label="Category">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "ui", label: "UI / Design" },
              { value: "content", label: "Content / wording" },
              { value: "logic", label: "Logic / flow" },
              { value: "data", label: "Data / structure" },
              { value: "perf", label: "Performance" },
              { value: "a11y", label: "Accessibility" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Assign">
        <Select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          options={[
            { value: "ai-agent", label: "AI agent (auto fix khi regenerate)" },
            { value: "huong-c", label: "Chị Hương (Dev)" },
            { value: "an-minh", label: "An Minh (BA)" },
            { value: "none", label: "Chưa assign" },
          ]}
        />
      </Field>
      <Field label="Attachments">
        <div className="upload-zone" style={{ padding: 14 }}>
          <div className="field-help">Screenshot / mockup / reference</div>
        </div>
      </Field>
    </Modal>
  );
}
