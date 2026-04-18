import { useState } from "react";
import { Modal, Field, FieldRow, Input, Textarea, Select } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
  crCode?: string;
}

export default function EditCrModal({ open, onClose, crCode = "CR-003" }: Props) {
  const [title, setTitle] = useState("Thêm multi-language support");
  const [desc, setDesc] = useState("KH yêu cầu hệ thống hỗ trợ thêm tiếng Anh cho backend admin + tiếng Hàn cho content màn hình...");
  const [impactType, setImpactType] = useState("major");
  const [timelineDays, setTimelineDays] = useState("15");
  const [costUsd, setCostUsd] = useState("2400");
  const { submitting, submit } = useFormStub("Đã cập nhật CR");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Sửa ${crCode}`}
      kicker="CR · EDIT"
      sub="Chỉ sửa được khi CR đang pending"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </>
      }
    >
      <Field label="Tiêu đề">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Mô tả">
        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} style={{ minHeight: 100 }} />
      </Field>
      <FieldRow>
        <Field label="Impact type">
          <Select
            value={impactType}
            onChange={(e) => setImpactType(e.target.value)}
            options={[
              { value: "minor", label: "MINOR" },
              { value: "major", label: "MAJOR" },
              { value: "breaking", label: "BREAKING" },
            ]}
          />
        </Field>
        <Field label="Timeline (+ ngày)">
          <Input type="number" value={timelineDays} onChange={(e) => setTimelineDays(e.target.value)} />
        </Field>
      </FieldRow>
      <Field label="Cost (USD)">
        <Input type="number" value={costUsd} onChange={(e) => setCostUsd(e.target.value)} />
      </Field>

      <div
        style={{
          padding: 10,
          background: "rgba(245,158,11,0.05)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--slate-700)",
          marginTop: 10,
        }}
      >
        ⚠ Mọi thay đổi sau khi KH đã ký sẽ reset signature → cần ký lại.
      </div>
    </Modal>
  );
}
