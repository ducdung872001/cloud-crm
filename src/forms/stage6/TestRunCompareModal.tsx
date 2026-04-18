import { Modal, Field, FieldRow, Select } from "../../components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROWS = [
  { tc: "TC-001", run1: "pass", run2: "pass", delta: 0 },
  { tc: "TC-002", run1: "pass", run2: "pass", delta: 0 },
  { tc: "TC-003", run1: "pass", run2: "pass", delta: 0 },
  { tc: "TC-014", run1: "fail", run2: "pass", delta: 1 },
  { tc: "TC-015", run1: "pass", run2: "pass", delta: 0 },
  { tc: "TC-008", run1: "pass", run2: "fail", delta: -1 },
  { tc: "TC-009", run1: "fail", run2: "fail", delta: 0 },
];

export default function TestRunCompareModal({ open, onClose }: Props) {
  const improved = ROWS.filter((r) => r.delta === 1).length;
  const regressed = ROWS.filter((r) => r.delta === -1).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="So sánh test runs"
      kicker="STAGE 6 · RUNS"
      size="wide"
      footer={
        <button type="button" className="btn" onClick={onClose}>
          Đóng
        </button>
      }
    >
      <FieldRow>
        <Field label="Run A">
          <Select
            defaultValue="r21"
            options={[
              { value: "r21", label: "Run #21 · 17/04 23:30 · 142/148 pass" },
              { value: "r20", label: "Run #20 · 17/04 18:12 · 138/148 pass" },
              { value: "r19", label: "Run #19 · 17/04 14:40 · 135/148 pass" },
            ]}
          />
        </Field>
        <Field label="Run B">
          <Select
            defaultValue="r22"
            options={[
              { value: "r22", label: "Run #22 · 18/04 09:45 · 143/148 pass (latest)" },
              { value: "r21", label: "Run #21 · 17/04 23:30" },
            ]}
          />
        </Field>
      </FieldRow>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
        <div className="stat" style={{ background: "rgba(16,185,129,0.05)" }}>
          <div className="stat-val">
            +{improved}
            <span className="stat-unit"> improved</span>
          </div>
          <div className="stat-label">Pass thêm ở Run B</div>
        </div>
        <div className="stat" style={{ background: "rgba(225,29,72,0.05)" }}>
          <div className="stat-val">
            −{regressed}
            <span className="stat-unit"> regression</span>
          </div>
          <div className="stat-label">Fail ở Run B nhưng pass Run A</div>
        </div>
        <div className="stat">
          <div className="stat-val">
            {ROWS.filter((r) => r.delta === 0).length}
            <span className="stat-unit"> stable</span>
          </div>
          <div className="stat-label">Không đổi</div>
        </div>
      </div>

      <table className="table" style={{ marginTop: 14 }}>
        <thead>
          <tr>
            <th>Test case</th>
            <th style={{ textAlign: "center" }}>Run A</th>
            <th style={{ textAlign: "center" }}>Run B</th>
            <th style={{ textAlign: "center" }}>Delta</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr
              key={r.tc}
              style={{
                background: r.delta === -1 ? "rgba(225,29,72,0.04)" : r.delta === 1 ? "rgba(16,185,129,0.04)" : undefined,
              }}
            >
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{r.tc}</td>
              <td style={{ textAlign: "center" }}>
                <span className={`tag ${r.run1 === "pass" ? "tag-ok" : "tag-hu"}`}>{r.run1}</span>
              </td>
              <td style={{ textAlign: "center" }}>
                <span className={`tag ${r.run2 === "pass" ? "tag-ok" : "tag-hu"}`}>{r.run2}</span>
              </td>
              <td style={{ textAlign: "center" }}>{r.delta === 1 ? "✓ fixed" : r.delta === -1 ? "✗ regression" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
