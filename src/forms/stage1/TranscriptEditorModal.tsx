import { useState } from "react";
import { Modal, Field, Input } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Line {
  ts: string;
  speaker: string;
  text: string;
}

const SAMPLE: Line[] = [
  { ts: "00:00:12", speaker: "A. Minh", text: "OK chào team, hôm nay mình review prototype v1 nhé." },
  { ts: "00:01:45", speaker: "Speaker 2", text: "Em có mấy điểm muốn trao đổi về card Online..." },
  { ts: "00:03:20", speaker: "C. Lan", text: "Card Online hiện cứng, mình cần trend 7 ngày." },
  { ts: "00:05:10", speaker: "A. Minh", text: "Còn phần tích hợp POS thì bỏ đi, Q3 thay hệ thống POS mới." },
  { ts: "00:08:42", speaker: "Speaker 2", text: "Em cần phân loại màn hình theo mục đích — promotion khác với brand awareness." },
];

export default function TranscriptEditorModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [lines, setLines] = useState<Line[]>(SAMPLE);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [newSpeaker, setNewSpeaker] = useState("");
  const [renameFrom, setRenameFrom] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState("");
  const { submitting, submit } = useFormStub("Đã lưu transcript");

  const uniqueSpeakers = Array.from(new Set(lines.map((l) => l.speaker)));

  const renameSpeaker = () => {
    if (!renameFrom) return;
    setLines((prev) => prev.map((l) => (l.speaker === renameFrom ? { ...l, speaker: renameTo } : l)));
    setRenameFrom(null);
    setRenameTo("");
    showToast("success", `Đã đổi ${renameFrom} → ${renameTo}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transcript editor"
      kicker="STAGE 1 · TRANSCRIPT"
      sub="Sửa lỗi Whisper, rename speaker, split segments"
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn" onClick={() => showToast("info", "Export VTT", "subtitle.vtt")}>
            ↓ Export VTT
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu transcript"}
          </button>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 14,
          padding: 12,
          background: "var(--slate-50)",
          borderRadius: 8,
        }}
      >
        <div className="field-help" style={{ alignSelf: "center" }}>
          Speakers:
        </div>
        {uniqueSpeakers.map((s) => (
          <button
            key={s}
            type="button"
            className="filter-chip"
            onClick={() => {
              setRenameFrom(s);
              setRenameTo(s);
            }}
          >
            {s}
          </button>
        ))}
        <button type="button" className="btn sm" onClick={() => setNewSpeaker("Speaker " + (uniqueSpeakers.length + 1))}>
          + Speaker
        </button>
      </div>

      {renameFrom ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 10,
            background: "rgba(20,184,166,0.06)",
            borderRadius: 8,
            marginBottom: 14,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12 }}>
            Đổi <strong>{renameFrom}</strong> thành
          </span>
          <Input value={renameTo} onChange={(e) => setRenameTo(e.target.value)} style={{ width: 200 }} />
          <button type="button" className="btn sm primary" onClick={renameSpeaker}>
            Đổi
          </button>
          <button type="button" className="btn sm" onClick={() => setRenameFrom(null)}>
            Hủy
          </button>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 140px 1fr",
              gap: 10,
              padding: 8,
              borderRadius: 6,
              alignItems: "start",
              background: editIdx === i ? "rgba(20,184,166,0.04)" : "transparent",
            }}
            onClick={() => setEditIdx(i)}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--slate-500)",
                paddingTop: 4,
              }}
            >
              {l.ts}
            </div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{l.speaker}</div>
            {editIdx === i ? (
              <Field>
                <textarea
                  className="textarea"
                  autoFocus
                  defaultValue={l.text}
                  onBlur={(e) => {
                    setLines((prev) => prev.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)));
                    setEditIdx(null);
                  }}
                  style={{ minHeight: 60 }}
                />
              </Field>
            ) : (
              <div style={{ fontSize: 13 }}>{l.text}</div>
            )}
          </div>
        ))}
      </div>

      <Input type="hidden" value={newSpeaker} readOnly />
    </Modal>
  );
}
