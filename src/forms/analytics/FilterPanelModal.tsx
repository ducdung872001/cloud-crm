import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Chips, Checkbox, Segmented } from "../../components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, unknown>) => void;
}

export default function FilterPanelModal({ open, onClose, onApply }: Props) {
  const [dateMode, setDateMode] = useState<"7d" | "30d" | "90d" | "ytd" | "custom">("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [role, setRole] = useState("all");

  const toggleStage = (s: string) => setStages((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filter analytics"
      kicker="ANALYTICS · FILTER"
      size="wide"
      footer={
        <>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setDateMode("30d");
              setProjects([]);
              setStages([]);
              setRole("all");
            }}
          >
            Reset
          </button>
          <div style={{ flex: 1 }} />
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              onApply({ dateMode, from, to, projects, stages, role });
              onClose();
            }}
          >
            Áp dụng filter
          </button>
        </>
      }
    >
      <Field label="Khoảng thời gian">
        <Segmented
          value={dateMode}
          onChange={setDateMode}
          options={[
            { value: "7d", label: "7 ngày" },
            { value: "30d", label: "30 ngày" },
            { value: "90d", label: "90 ngày" },
            { value: "ytd", label: "Năm nay" },
            { value: "custom", label: "Tùy chọn" },
          ]}
        />
      </Field>
      {dateMode === "custom" ? (
        <FieldRow>
          <Field label="Từ">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Đến">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </FieldRow>
      ) : null}

      <Field label="Projects" help="Bỏ trống = tất cả">
        <Chips value={projects} onChange={setProjects} placeholder="MEGAMART-DOOH..." />
      </Field>

      <Field label="Stages">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["1", "2", "3", "4", "5", "6", "7"].map((s) => (
            <button key={s} type="button" className={`filter-chip ${stages.includes(s) ? "active" : ""}`} onClick={() => toggleStage(s)}>
              Stage {s}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Role perspective">
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "pm", label: "PM view" },
            { value: "tech-lead", label: "Tech Lead view" },
            { value: "ba", label: "BA view" },
            { value: "qa", label: "QA view" },
          ]}
        />
      </Field>

      <Checkbox label="So sánh với period trước" />
      <Checkbox label="Loại trừ project archived" defaultChecked />
    </Modal>
  );
}
