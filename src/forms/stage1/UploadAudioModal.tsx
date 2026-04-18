import { useState } from "react";
import { Modal, Field, Select } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadAudioModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [sessionType, setSessionType] = useState("review");
  const { submitting, submit } = useFormStub("Đã upload audio", "Chuyển sang transcript...");

  const simulateProgress = () => {
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          return 100;
        }
        return p + 8;
      });
    }, 80);
  };

  const pickFile = (f: File | null) => {
    setFile(f);
    if (f) simulateProgress();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload audio meeting"
      kicker="STAGE 1 · MEETING"
      sub="Kéo thả file hoặc click chọn. Tối đa 500 MB."
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !file || progress < 100} onClick={() => submit(onClose)}>
            {submitting ? "Đang xử lý..." : "Tiếp tục → Xử lý AI"}
          </button>
        </>
      }
    >
      <label className="upload-zone" style={{ display: "block", cursor: "pointer" }}>
        <input
          type="file"
          accept=".mp3,.m4a,.wav,.webm,audio/*"
          style={{ display: "none" }}
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        <div className="upload-ico">🎙</div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{file ? file.name : "Kéo thả audio file vào đây"}</div>
        <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 6 }}>
          {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ${file.type || "audio"}` : "Hỗ trợ .mp3, .m4a, .wav, .webm — tối đa 500 MB"}
        </div>
      </label>

      {file ? (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            <span>Upload progress</span>
            <strong>{progress}%</strong>
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <Field label="Loại session" help="AI sẽ dùng để quyết định prompt template">
        <Select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          options={[
            { value: "kickoff", label: "Kickoff — URD từ đầu" },
            { value: "review", label: "Review — so sánh với URD hiện tại" },
            { value: "change", label: "Change Request — impact analysis" },
            { value: "uat", label: "UAT — defect list" },
            { value: "internal", label: "Internal Sync — không đổi URD" },
          ]}
        />
      </Field>
    </Modal>
  );
}
