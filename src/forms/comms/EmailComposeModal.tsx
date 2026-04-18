import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Chips, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  { value: "blank", label: "Blank" },
  { value: "urd-review", label: "URD review request" },
  { value: "uat-invite", label: "UAT invitation" },
  { value: "release", label: "Release note" },
  { value: "cr-sign", label: "CR signature request" },
  { value: "training", label: "Training invite" },
];

export default function EmailComposeModal({ open, onClose }: Props) {
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [template, setTemplate] = useState("blank");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const { submitting, submit } = useFormStub("Email đã gửi");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Soạn email"
      kicker="COMM · EMAIL"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn">
            Lưu draft
          </button>
          <button type="button" className="btn primary" disabled={submitting || to.length === 0 || !subject} onClick={() => submit(onClose)}>
            {submitting ? "Đang gửi..." : "Gửi email"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="From">
          <Select
            defaultValue="noreply"
            options={[
              { value: "noreply", label: "noreply@reborn.vn" },
              { value: "team", label: "team@reborn.vn" },
              { value: "ceo", label: "ceo@reborn.vn" },
            ]}
          />
        </Field>
        <Field label="Template">
          <Select value={template} onChange={(e) => setTemplate(e.target.value)} options={TEMPLATES} />
        </Field>
      </FieldRow>
      <Field label="To" required>
        <Chips value={to} onChange={setTo} placeholder="email@..." />
      </Field>
      {showCc ? (
        <>
          <Field label="Cc">
            <Chips value={cc} onChange={setCc} />
          </Field>
          <Field label="Bcc">
            <Chips value={bcc} onChange={setBcc} />
          </Field>
        </>
      ) : (
        <button type="button" className="btn sm" style={{ marginBottom: 12 }} onClick={() => setShowCc(true)}>
          + Cc / Bcc
        </button>
      )}
      <Field label="Subject" required>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Body">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 200 }} />
      </Field>
      <Field label="Attachments">
        <Chips value={attachments} onChange={setAttachments} placeholder="URD-v1.3.pdf, screenshot.png..." />
      </Field>
    </Modal>
  );
}
