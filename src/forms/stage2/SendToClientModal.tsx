import { useState } from "react";
import { Modal, Field, FieldRow, Input, Chips, Select, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SendToClientModal({ open, onClose }: Props) {
  const [to, setTo] = useState<string[]>(["minh.a@megamart.vn"]);
  const [cc, setCc] = useState<string[]>(["lan.c@megamart.vn"]);
  const [template, setTemplate] = useState("urd-review");
  const [subject, setSubject] = useState("[MEGAMART-DOOH] URD v1.3 — Mời review");
  const [body, setBody] = useState(
    "Chào anh/chị,\n\nTeam Reborn đã sinh URD v1.3 dựa trên buổi họp ngày 18/04. Mời anh/chị review và feedback tại link đính kèm.\n\nDeadline: 22/04/2026\n\nTrân trọng,\nReborn Team"
  );
  const [deadline, setDeadline] = useState("");
  const { submitting, submit } = useFormStub("Đã gửi URD cho KH", "Link portal kèm signature request");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gửi URD cho khách hàng"
      kicker="STAGE 2 · SEND"
      sub="Email + tạo link portal review + signature request"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn">
            Preview email
          </button>
          <button type="button" className="btn primary" disabled={submitting || to.length === 0} onClick={() => submit(onClose)}>
            {submitting ? "Đang gửi..." : "Gửi → KH"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="To" required>
          <Chips value={to} onChange={setTo} />
        </Field>
        <Field label="Cc">
          <Chips value={cc} onChange={setCc} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Template">
          <Select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            options={[
              { value: "urd-review", label: "Gửi URD review" },
              { value: "urd-final", label: "Gửi URD chính thức (ký)" },
              { value: "custom", label: "Tùy chỉnh" },
            ]}
          />
        </Field>
        <Field label="Deadline review">
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
      </FieldRow>
      <Field label="Subject" required>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Body">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 160 }} />
      </Field>

      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 10,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        <span className="tag tag-info">📎 URD-v1.3.pdf</span>
        <span className="tag tag-info">🔗 Portal link</span>
        <span className="tag tag-warn">✒ Signature request</span>
      </div>
    </Modal>
  );
}
