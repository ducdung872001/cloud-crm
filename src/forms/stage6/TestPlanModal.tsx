import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TESTS = [
  "TC-001 · Create screen valid data",
  "TC-002 · Reject invalid GPS",
  "TC-003 · Filter by city",
  "TC-004 · Campaign overlap detection",
  "TC-005 · Schedule validation",
  "TC-006 · Uptime DST edge case",
  "TC-007 · RBAC Content Mgr edit",
  "TC-008 · RBAC Store Ops readonly",
  "TC-009 · Export Excel UTF-8",
  "TC-010 · Login Google SSO",
];

export default function TestPlanModal({ open, onClose }: Props) {
  const [name, setName] = useState("Sprint 3 · Regression");
  const [tester, setTester] = useState("qa-thao");
  const [deadline, setDeadline] = useState("");
  const [env, setEnv] = useState("staging");
  const [selected, setSelected] = useState<string[]>(TESTS.slice(0, 5));
  const { submitting, submit } = useFormStub("Đã tạo test plan", "Notify QA");

  const toggle = (tc: string) => setSelected((prev) => (prev.includes(tc) ? prev.filter((x) => x !== tc) : [...prev, tc]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo test plan"
      kicker="STAGE 6 · TEST PLAN"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || selected.length === 0} onClick={() => submit(onClose)}>
            {submitting ? "Đang tạo..." : `Tạo plan (${selected.length} TC)`}
          </button>
        </>
      }
    >
      <Field label="Tên test plan" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Tester">
          <Select
            value={tester}
            onChange={(e) => setTester(e.target.value)}
            options={[
              { value: "qa-thao", label: "Thảo QA" },
              { value: "ai-agent", label: "AI Agent (automation)" },
              { value: "team", label: "Cả team QA" },
            ]}
          />
        </Field>
        <Field label="Environment">
          <Select
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            options={[
              { value: "staging", label: "Staging" },
              { value: "uat", label: "UAT" },
              { value: "prod", label: "Production" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Deadline">
        <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>
        Chọn test cases ({selected.length}/{TESTS.length})
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxHeight: 220,
          overflowY: "auto",
          background: "var(--slate-50)",
          padding: 10,
          borderRadius: 8,
        }}
      >
        {TESTS.map((tc) => (
          <Checkbox key={tc} label={tc} checked={selected.includes(tc)} onChange={() => toggle(tc)} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button type="button" className="btn sm" onClick={() => setSelected(TESTS)}>
          Chọn tất cả
        </button>
        <button type="button" className="btn sm" onClick={() => setSelected([])}>
          Bỏ chọn
        </button>
      </div>
    </Modal>
  );
}
