import { useState } from "react";
import { Modal, Field, Input, Select } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const METRICS = [
  { key: "projects-active", label: "Projects active count" },
  { key: "ai-cost", label: "AI cost ($)" },
  { key: "cycle-time", label: "Cycle time per stage (ngày)" },
  { key: "cp-overdue", label: "Checkpoints quá hạn" },
  { key: "cr-count", label: "Change requests" },
  { key: "bug-count", label: "Bugs mở" },
  { key: "test-coverage", label: "Test coverage %" },
  { key: "ai-vs-human", label: "AI vs Human hours" },
  { key: "cost-per-req", label: "Cost / requirement" },
  { key: "csat", label: "Client CSAT" },
];

const DIMENSIONS = [
  { key: "project", label: "Project" },
  { key: "client", label: "Client" },
  { key: "stage", label: "Stage" },
  { key: "role", label: "Role" },
  { key: "month", label: "Tháng" },
  { key: "week", label: "Tuần" },
];

export default function ReportBuilderModal({ open, onClose }: Props) {
  const [name, setName] = useState("Custom report");
  const [metrics, setMetrics] = useState<string[]>(["ai-cost", "cycle-time"]);
  const [groupBy, setGroupBy] = useState("project");
  const [chart, setChart] = useState<"bar" | "line" | "table" | "pie">("bar");
  const { submitting, submit } = useFormStub("Đã tạo custom report", "Thêm vào dashboard");

  const toggle = (m: string) => setMetrics((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Custom report builder"
      kicker="ANALYTICS · BUILDER"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || metrics.length === 0} onClick={() => submit(onClose)}>
            {submitting ? "Đang tạo..." : "Tạo report"}
          </button>
        </>
      }
    >
      <Field label="Tên report" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Metrics (chọn nhiều)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {METRICS.map((m) => (
            <label
              key={m.key}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                background: metrics.includes(m.key) ? "rgba(20,184,166,0.08)" : "var(--slate-50)",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <input type="checkbox" checked={metrics.includes(m.key)} onChange={() => toggle(m.key)} />
              {m.label}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Group by dimension">
        <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} options={DIMENSIONS.map((d) => ({ value: d.key, label: d.label }))} />
      </Field>

      <Field label="Loại biểu đồ">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {(
            [
              ["bar", "📊 Bar"],
              ["line", "📈 Line"],
              ["pie", "🥧 Pie"],
              ["table", "📋 Table"],
            ] as const
          ).map(([v, l]) => (
            <button key={v} type="button" className={`filter-chip ${chart === v ? "active" : ""}`} onClick={() => setChart(v)}>
              {l}
            </button>
          ))}
        </div>
      </Field>
    </Modal>
  );
}
