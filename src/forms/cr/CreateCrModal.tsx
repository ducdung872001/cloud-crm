import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateCrModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("meeting");
  const [sourceRef, setSourceRef] = useState("");
  const [description, setDescription] = useState("");
  const [impactType, setImpactType] = useState<"minor" | "major" | "breaking">("minor");
  const [stages, setStages] = useState<string[]>([]);
  const [timelineDays, setTimelineDays] = useState("");
  const [costUsd, setCostUsd] = useState("");
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const { submitting, submit } = useFormStub("Đã tạo Change Request", "Gửi thông báo PM + Tech Lead để đánh giá");

  const toggleStage = (s: string) => setStages((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo Change Request mới"
      kicker="CR · NEW"
      sub="Bất kỳ thay đổi scope sau khi URD đã chốt đều phải đi qua CR workflow"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !title || !description} onClick={() => submit(onClose)}>
            {submitting ? "Đang tạo..." : "Tạo CR"}
          </button>
        </>
      }
    >
      <Field label="Tiêu đề CR" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Thêm multi-language support" autoFocus />
      </Field>
      <FieldRow>
        <Field label="Nguồn yêu cầu">
          <Select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={[
              { value: "meeting", label: "Từ meeting session" },
              { value: "email", label: "Email KH" },
              { value: "call", label: "Gọi điện" },
              { value: "internal", label: "Nội bộ đề xuất" },
              { value: "compliance", label: "Compliance / legal" },
            ]}
          />
        </Field>
        <Field label="Reference">
          <Input value={sourceRef} onChange={(e) => setSourceRef(e.target.value)} placeholder="Session #3 @ 00:24:08" />
        </Field>
      </FieldRow>
      <Field label="Mô tả chi tiết" required>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: 100 }}
          placeholder="KH yêu cầu hệ thống hỗ trợ thêm tiếng Anh cho backend admin + tiếng Hàn cho content màn hình tại chi nhánh có khách du lịch..."
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "14px 0 6px" }}>
        Impact analysis {autoAnalyze ? <span className="tag tag-ai">AI tự tính</span> : null}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 10 }}>
        <input type="checkbox" checked={autoAnalyze} onChange={(e) => setAutoAnalyze(e.target.checked)} />
        AI tự phân tích impact từ URD + repo hiện tại
      </label>
      <FieldRow>
        <Field label="Type">
          <Select
            value={impactType}
            onChange={(e) => setImpactType(e.target.value as typeof impactType)}
            options={[
              { value: "minor", label: "MINOR (1-3 ngày)" },
              { value: "major", label: "MAJOR (> 5 ngày)" },
              { value: "breaking", label: "BREAKING (thay contract API)" },
            ]}
          />
        </Field>
        <Field label="Timeline (+ ngày)">
          <Input
            type="number"
            value={timelineDays}
            onChange={(e) => setTimelineDays(e.target.value)}
            disabled={autoAnalyze}
            placeholder={autoAnalyze ? "AI tính..." : "15"}
          />
        </Field>
      </FieldRow>
      <Field label="Ước tính cost (USD)">
        <Input
          type="number"
          value={costUsd}
          onChange={(e) => setCostUsd(e.target.value)}
          disabled={autoAnalyze}
          placeholder={autoAnalyze ? "AI tính..." : "2400"}
        />
      </Field>
      <Field label="Stages bị ảnh hưởng">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["URD", "Prototype", "FE", "BE", "QA", "Docs"].map((s) => (
            <button key={s} type="button" className={`filter-chip ${stages.includes(s) ? "active" : ""}`} onClick={() => toggleStage(s)}>
              {s}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Attachments (mockup, email, ghi âm)">
        <div className="upload-zone" style={{ padding: 14 }}>
          <div className="field-help">Kéo thả file / ảnh</div>
        </div>
      </Field>
    </Modal>
  );
}
