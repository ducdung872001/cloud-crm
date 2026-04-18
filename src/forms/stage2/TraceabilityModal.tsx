import { Modal } from "../../components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface TraceRow {
  fr: string;
  frTitle: string;
  source: string;
  testCases: string[];
  stages: string[];
}

const ROWS: TraceRow[] = [
  {
    fr: "FR-001",
    frTitle: "CRUD màn hình",
    source: "Kickoff @ 00:08:42",
    testCases: ["TC-101", "TC-102", "TC-103"],
    stages: ["FE", "BE", "QA"],
  },
  {
    fr: "FR-002",
    frTitle: "Phân loại màn hình",
    source: "Review #2 @ 00:12:34",
    testCases: ["TC-104"],
    stages: ["FE", "BE"],
  },
  {
    fr: "FR-025",
    frTitle: "Export báo cáo tuần/tháng",
    source: "Review #2 @ 00:29:42",
    testCases: [],
    stages: ["FE"],
  },
  {
    fr: "FR-018",
    frTitle: "Tích hợp POS (REMOVED)",
    source: "Review #2 @ 00:23:18",
    testCases: [],
    stages: ["REMOVED"],
  },
];

export default function TraceabilityModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Traceability matrix"
      kicker="STAGE 2 · RTM"
      sub="Gắn requirement ↔ source ↔ test case ↔ stage phụ thuộc"
      size="xwide"
      footer={
        <button type="button" className="btn" onClick={onClose}>
          Đóng
        </button>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Requirement</th>
            <th>Nguồn</th>
            <th>Test cases</th>
            <th>Impacted stages</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => {
            const covered = r.testCases.length > 0;
            return (
              <tr key={r.fr}>
                <td>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--slate-500)" }}>{r.fr}</div>
                  <div style={{ fontWeight: 500 }}>{r.frTitle}</div>
                </td>
                <td style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--slate-600)" }}>{r.source}</td>
                <td>
                  {r.testCases.length > 0 ? (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {r.testCases.map((tc) => (
                        <span key={tc} className="tag tag-info">
                          {tc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="tag tag-warn">Chưa có TC</span>
                  )}
                </td>
                <td>
                  {r.stages.map((s) => (
                    <span key={s} className={`tag ${s === "REMOVED" ? "tag-hu" : "tag-scope"}`} style={{ marginRight: 4 }}>
                      {s}
                    </span>
                  ))}
                </td>
                <td>
                  {r.stages.includes("REMOVED") ? (
                    <span className="tag">—</span>
                  ) : covered ? (
                    <span className="tag tag-ok">✓</span>
                  ) : (
                    <span className="tag tag-warn">Thiếu</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 14,
          padding: 12,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--slate-600)",
        }}
      >
        <strong>Coverage:</strong> {ROWS.filter((r) => !r.stages.includes("REMOVED") && r.testCases.length > 0).length}/
        {ROWS.filter((r) => !r.stages.includes("REMOVED")).length} requirement có test case.
      </div>
    </Modal>
  );
}
