import { useState } from "react";
import { Modal } from "../../components/ui";
import { useApp } from "../../context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface PrototypeVersion {
  id: string;
  version: string;
  created: string;
  author: string;
  feedback: number;
  size: string;
  current: boolean;
  notes: string;
}

const VERSIONS: PrototypeVersion[] = [
  {
    id: "v3",
    version: "v3 (current)",
    created: "18/04/2026 15:42",
    author: "AI (Opus 4.7)",
    feedback: 0,
    size: "48 kB",
    current: true,
    notes: "Apply feedback #1-3. Thêm sparkline, filter city, doanh thu ước tính.",
  },
  {
    id: "v2",
    version: "v2",
    created: "16/04/2026 09:18",
    author: "AI (Opus 4.7)",
    feedback: 3,
    size: "45 kB",
    current: false,
    notes: "Refactor lớn từ URD v1.2 — thêm module báo cáo.",
  },
  {
    id: "v1.1",
    version: "v1.1",
    created: "15/04/2026 22:04",
    author: "AI (Sonnet 4.6)",
    feedback: 5,
    size: "32 kB",
    current: false,
    notes: "Fix bug card layout, regenerate map component.",
  },
  {
    id: "v1",
    version: "v1",
    created: "15/04/2026 11:30",
    author: "AI (Sonnet 4.6)",
    feedback: 7,
    size: "28 kB",
    current: false,
    notes: "Bản đầu tiên từ URD v1.0 kickoff.",
  },
];

export default function VersionSwitcherModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [selected, setSelected] = useState("v3");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Versions prototype"
      kicker="STAGE 3 · HISTORY"
      sub="Xem, so sánh, rollback về version cũ"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="btn" onClick={() => showToast("info", "Compare mode", `${selected} vs current`)}>
            ↔ So sánh với current
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={selected === "v3"}
            onClick={() => {
              showToast("warn", `Rollback về ${selected}`, "Version mới được tạo từ version này");
              onClose();
            }}
          >
            ↻ Rollback về {selected}
          </button>
        </>
      }
    >
      <div className="file-list">
        {VERSIONS.map((v) => (
          <div
            key={v.id}
            className="file-item"
            onClick={() => setSelected(v.id)}
            style={{
              background: selected === v.id ? "rgba(20,184,166,0.05)" : undefined,
            }}
          >
            <div
              className="file-ico"
              style={{
                background: v.current ? "var(--teal-500)" : "var(--slate-100)",
                color: v.current ? "#fff" : "var(--slate-500)",
              }}
            >
              {v.version.replace(/[^\d.]/g, "")}
            </div>
            <div>
              <div className="file-name">
                {v.version}
                {v.current ? (
                  <span className="tag tag-ok" style={{ marginLeft: 8 }}>
                    ★ Current
                  </span>
                ) : null}
              </div>
              <div className="file-sub">
                {v.created} · {v.author} · {v.size} · {v.feedback} feedback
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--slate-700)",
                  marginTop: 4,
                  fontStyle: "italic",
                }}
              >
                {v.notes}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className="btn sm"
                onClick={(e) => {
                  e.stopPropagation();
                  showToast("info", `Preview ${v.version}`, "Mở tab mới");
                }}
              >
                👁 Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
