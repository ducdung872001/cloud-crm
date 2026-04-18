import { Modal, Field, FieldRow, Select } from "../../components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
}

const VERSIONS = [
  { value: "1.0", label: "v1.0 — Kickoff (15/04/2026)" },
  { value: "1.1", label: "v1.1 — Review #1 (14/04/2026 - draft)" },
  { value: "1.2", label: "v1.2 — Approved (12/04/2026)" },
  { value: "1.3", label: "v1.3 — Latest draft (18/04/2026)" },
];

const DIFF_PER_PAIR: Record<string, { section: string; change: string }[]> = {
  "1.2->1.3": [
    { section: "§ 2.1", change: "+3 mục nhóm phân loại, +tag chiến dịch" },
    { section: "§ 3.2", change: "+FR-025 Export báo cáo" },
    { section: "§ 4.1", change: "−FR-018 Tích hợp POS" },
    { section: "§ 5.3", change: "+sparkline cho card Online" },
  ],
  "1.1->1.2": [
    { section: "§ 1", change: "Cập nhật scope" },
    { section: "§ 3", change: "+User roles matrix" },
  ],
  "1.0->1.1": [{ section: "§ 2", change: "+5 màn hình mới vào inventory" }],
};

export default function VersionCompareModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="So sánh URD versions"
      kicker="STAGE 2 · VERSIONS"
      size="wide"
      footer={
        <button type="button" className="btn" onClick={onClose}>
          Đóng
        </button>
      }
    >
      <FieldRow>
        <Field label="Version cũ">
          <Select defaultValue="1.2" options={VERSIONS} />
        </Field>
        <Field label="Version mới">
          <Select defaultValue="1.3" options={VERSIONS} />
        </Field>
      </FieldRow>

      <div style={{ marginTop: 12, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Tóm tắt thay đổi</div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Section</th>
              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {DIFF_PER_PAIR["1.2->1.3"].map((d, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{d.section}</td>
                <td>{d.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <button type="button" className="btn">
          ↓ Export diff .docx
        </button>
        <button type="button" className="btn">
          📊 Xem structured diff
        </button>
      </div>
    </Modal>
  );
}
