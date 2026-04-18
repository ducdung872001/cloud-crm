import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Chips, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BroadcastModal({ open, onClose }: Props) {
  const [scope, setScope] = useState<"all" | "project" | "role" | "custom">("all");
  const [projects, setProjects] = useState<string[]>([]);
  const [role, setRole] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urgency, setUrgency] = useState<"info" | "warn" | "urgent">("info");
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(true);
  const [slack, setSlack] = useState(false);
  const { submitting, submit } = useFormStub("Broadcast đã gửi", "Đã notify toàn bộ đối tượng");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Broadcast announcement"
      kicker="COMM · BROADCAST"
      sub="Gửi thông báo đến nhiều người cùng lúc — maintenance, release, policy..."
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn">
            Preview
          </button>
          <button type="button" className="btn primary" disabled={submitting || !title || !body} onClick={() => submit(onClose)}>
            {submitting ? "Đang gửi..." : "Gửi broadcast"}
          </button>
        </>
      }
    >
      <Field label="Phạm vi">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {(
            [
              ["all", "Toàn workspace"],
              ["project", "Theo project"],
              ["role", "Theo role"],
              ["custom", "Custom users"],
            ] as const
          ).map(([v, l]) => (
            <button key={v} type="button" className={`filter-chip ${scope === v ? "active" : ""}`} onClick={() => setScope(v)}>
              {l}
            </button>
          ))}
        </div>
      </Field>

      {scope === "project" ? (
        <Field label="Projects">
          <Chips value={projects} onChange={setProjects} placeholder="MEGAMART-DOOH..." />
        </Field>
      ) : scope === "role" ? (
        <Field label="Role">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: "all", label: "Tất cả role" },
              { value: "dev", label: "Dev + Tech Lead" },
              { value: "qa", label: "QA" },
              { value: "pm", label: "PM" },
              { value: "ba", label: "BA + SA" },
            ]}
          />
        </Field>
      ) : scope === "custom" ? (
        <Field label="Emails / users">
          <Chips value={projects} onChange={setProjects} placeholder="email1@..., email2@..." />
        </Field>
      ) : null}

      <FieldRow>
        <Field label="Tiêu đề" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Maintenance window 20/04 22:00" />
        </Field>
        <Field label="Mức độ">
          <Select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as typeof urgency)}
            options={[
              { value: "info", label: "ℹ Info" },
              { value: "warn", label: "⚠ Warning" },
              { value: "urgent", label: "🚨 Urgent" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Nội dung" required>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 140 }} />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Channel</div>
      <Checkbox label="In-app banner" checked={inApp} onChange={setInApp} />
      <Checkbox label="Email" checked={email} onChange={setEmail} />
      <Checkbox label="Slack #announcements" checked={slack} onChange={setSlack} />

      <Field label="Lên lịch (tùy chọn)" help="Bỏ trống = gửi ngay">
        <Input type="datetime-local" />
      </Field>
    </Modal>
  );
}
