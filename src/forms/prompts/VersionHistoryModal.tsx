import { Modal } from "../../components/ui";
import { useState } from "react";
import { useApp } from "../../context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
  templateName?: string;
}

interface Version {
  v: string;
  date: string;
  author: string;
  note: string;
  cost: string;
  quality: string;
  current: boolean;
}

const VERS: Version[] = [
  {
    v: "v5",
    date: "18/04/2026",
    author: "An Đức",
    note: "Siết JSON schema output — ít hallucination hơn",
    cost: "$0.82",
    quality: "9.1/10",
    current: true,
  },
  { v: "v4", date: "10/04/2026", author: "An Đức", note: "Add few-shot examples", cost: "$0.91", quality: "8.7/10", current: false },
  { v: "v3", date: "28/03/2026", author: "An Minh", note: "Tách system prompt khỏi user prompt", cost: "$0.75", quality: "8.2/10", current: false },
  { v: "v2", date: "15/03/2026", author: "An Minh", note: "Viết tiếng Việt", cost: "$0.70", quality: "7.4/10", current: false },
  { v: "v1", date: "01/03/2026", author: "ceo@reborn.vn", note: "Initial", cost: "$0.65", quality: "6.8/10", current: false },
];

export default function VersionHistoryModal({ open, onClose, templateName = "urd-diff" }: Props) {
  const { showToast } = useApp();
  const [selected, setSelected] = useState("v5");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Version history · ${templateName}`}
      kicker="PROMPT · VERSIONS"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="btn" onClick={() => showToast("info", `Diff ${selected} vs current`, "Mở side-by-side")}>
            ↔ So sánh
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={selected === "v5"}
            onClick={() => {
              showToast("warn", `Rollback về ${selected}`, "Version mới sẽ được tạo dựa trên này");
              onClose();
            }}
          >
            ↻ Rollback về {selected}
          </button>
        </>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 70 }}>Version</th>
            <th>Ngày</th>
            <th>Author</th>
            <th>Ghi chú</th>
            <th>Avg cost</th>
            <th>Quality</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {VERS.map((v) => (
            <tr
              key={v.v}
              onClick={() => setSelected(v.v)}
              style={{
                cursor: "pointer",
                background: selected === v.v ? "rgba(20,184,166,0.05)" : undefined,
              }}
            >
              <td>
                <strong>{v.v}</strong>
                {v.current ? (
                  <span className="tag tag-ok" style={{ marginLeft: 6 }}>
                    current
                  </span>
                ) : null}
              </td>
              <td style={{ fontSize: 12 }}>{v.date}</td>
              <td style={{ fontSize: 12 }}>{v.author}</td>
              <td style={{ fontSize: 12, color: "var(--slate-600)" }}>{v.note}</td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{v.cost}</td>
              <td>
                <span
                  style={{
                    color: parseFloat(v.quality) >= 8.5 ? "var(--emerald-500)" : parseFloat(v.quality) >= 7 ? "var(--amber-500)" : "var(--rose-500)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                >
                  {v.quality}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className="btn sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("info", `Xem ${v.v}`);
                  }}
                >
                  👁
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
