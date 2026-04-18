import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ABTestModal({ open, onClose }: Props) {
  const [name, setName] = useState("URD diff · Opus vs Sonnet");
  const [templateA, setTemplateA] = useState("urd-diff-v3");
  const [templateB, setTemplateB] = useState("urd-diff-v4");
  const [split, setSplit] = useState("50");
  const [metric, setMetric] = useState("cost-quality-ratio");
  const [sampleSize, setSampleSize] = useState("100");
  const [hypothesis, setHypothesis] = useState("Version v4 với instruction cụ thể hơn sẽ giảm cost 30% mà vẫn giữ nguyên quality.");
  const { submitting, submit } = useFormStub("Đã tạo A/B test", "Track qua 100 runs tới");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo A/B test prompt"
      kicker="PROMPT · A/B"
      sub="So sánh 2 phiên bản prompt trên production traffic"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !name} onClick={() => submit(onClose)}>
            {submitting ? "Đang tạo..." : "Bắt đầu A/B test"}
          </button>
        </>
      }
    >
      <Field label="Tên experiment" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Hypothesis">
        <Textarea value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} />
      </Field>

      <FieldRow>
        <Field label="Variant A (control)">
          <Select
            value={templateA}
            onChange={(e) => setTemplateA(e.target.value)}
            options={[
              { value: "urd-diff-v3", label: "urd-diff v3 (current prod)" },
              { value: "urd-diff-v2", label: "urd-diff v2" },
            ]}
          />
        </Field>
        <Field label="Variant B (test)">
          <Select
            value={templateB}
            onChange={(e) => setTemplateB(e.target.value)}
            options={[
              { value: "urd-diff-v4", label: "urd-diff v4 (new draft)" },
              { value: "urd-diff-v5", label: "urd-diff v5 (experimental)" },
            ]}
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Traffic split (% đi vào B)">
          <Input type="number" value={split} onChange={(e) => setSplit(e.target.value)} min="1" max="99" />
        </Field>
        <Field label="Sample size cần thiết">
          <Input type="number" value={sampleSize} onChange={(e) => setSampleSize(e.target.value)} />
        </Field>
      </FieldRow>

      <Field label="Primary metric" required>
        <Select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          options={[
            { value: "cost-quality-ratio", label: "Cost / quality score" },
            { value: "latency", label: "Latency (p50)" },
            { value: "quality-score", label: "Quality score (human rating)" },
            { value: "acceptance-rate", label: "Acceptance rate (không regenerate)" },
          ]}
        />
      </Field>

      <Field label="Guardrail metrics">
        <Input defaultValue="latency_p99 < 30s, hallucination_rate < 2%" />
      </Field>

      <Field label="Thời gian chạy">
        <Select
          defaultValue="7d"
          options={[
            { value: "1d", label: "1 ngày" },
            { value: "7d", label: "7 ngày" },
            { value: "14d", label: "2 tuần" },
            { value: "30d", label: "30 ngày" },
            { value: "until-sig", label: "Đến khi đạt statistical significance" },
          ]}
        />
      </Field>
    </Modal>
  );
}
