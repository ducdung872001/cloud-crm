import { useState } from "react";
import { useApp } from "../../context/AppContext";
import UploadAudioModal from "../../forms/stage1/UploadAudioModal";
import RecordAudioModal from "../../forms/stage1/RecordAudioModal";
import ScheduleMeetingModal from "../../forms/stage1/ScheduleMeetingModal";
import ManualNoteModal from "../../forms/stage1/ManualNoteModal";
import TranscriptEditorModal from "../../forms/stage1/TranscriptEditorModal";
import ChunkingSettingsModal from "../../forms/stage1/ChunkingSettingsModal";

type SessionType = "kickoff" | "review" | "change" | "uat" | "internal";

const TYPES: {
  key: SessionType;
  icoCls: string;
  name: string;
  desc: string;
  disabled?: boolean;
  badge?: string;
}[] = [
  {
    key: "kickoff",
    icoCls: "kick",
    name: "Kickoff",
    desc: "Meeting đầu tiên. AI sinh URD v1.0 từ đầu.",
    disabled: true,
    badge: "Đã qua",
  },
  {
    key: "review",
    icoCls: "rev",
    name: "Review",
    desc: "KH review prototype/URD. AI sinh URD v+1 với diff từ v hiện tại.",
  },
  {
    key: "change",
    icoCls: "chg",
    name: "Change Request",
    desc: "KH thay đổi scope. AI phân tích impact + cost + timeline.",
  },
  {
    key: "uat",
    icoCls: "uat",
    name: "UAT",
    desc: "Họp nghiệm thu. AI sinh defect list từ buổi test.",
  },
  {
    key: "internal",
    icoCls: "retro",
    name: "Internal Sync",
    desc: "Họp nội bộ. Không ảnh hưởng URD chính thức.",
  },
];

const TYPE_ICONS: Record<SessionType, string> = {
  kickoff: "✦",
  review: "↻",
  change: "⇌",
  uat: "✓",
  internal: "◎",
};

export default function Stage1() {
  const { showToast } = useApp();
  const [selected, setSelected] = useState<SessionType>("review");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [transOpen, setTransOpen] = useState(false);
  const [chunkOpen, setChunkOpen] = useState(false);

  return (
    <div className="grid-2">
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div className="card-title">1. Upload audio</div>
          </div>
          <div className="card-body">
            <div className="upload-zone" onClick={() => setUploadOpen(true)}>
              <div className="upload-ico">🎙</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--slate-900)" }}>Kéo thả audio file vào đây</div>
              <div style={{ fontSize: 12, color: "var(--slate-500)", marginTop: 6 }}>Hỗ trợ .mp3, .m4a, .wav, .webm · Tối đa 500 MB</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 14 }}>
                <button type="button" className="btn ai">
                  ↑ Chọn file
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecordOpen(true);
                  }}
                >
                  ● Ghi trực tiếp
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setScheduleOpen(true);
                  }}
                >
                  📅 Đặt lịch
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteOpen(true);
                  }}
                >
                  ✎ Nhập tay
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn sm" onClick={() => setTransOpen(true)}>
                ✎ Edit transcript
              </button>
              <button type="button" className="btn sm" onClick={() => setChunkOpen(true)}>
                ⚙ Chunking
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">2. Chọn loại meeting session</div>
            <span className="tag tag-info">Tự động đề xuất</span>
          </div>
          <div className="card-body">
            <div
              style={{
                fontSize: 12,
                color: "var(--slate-600)",
                marginBottom: 10,
                padding: 10,
                background: "rgba(59,130,246,0.05)",
                borderRadius: 8,
                borderLeft: "3px solid var(--blue-500)",
              }}
            >
              💡 Dự án này đã có URD v1.2 được duyệt. AI đề xuất chọn <strong>REVIEW</strong> để so sánh thay đổi với URD hiện tại.
            </div>

            <div className="session-types">
              {TYPES.map((t) => (
                <div
                  key={t.key}
                  className={`session-type ${t.disabled ? "disabled" : ""} ${selected === t.key ? "selected" : ""}`}
                  onClick={() => {
                    if (t.disabled) return;
                    setSelected(t.key);
                    showToast("info", `Session type: ${t.name.toUpperCase()}`, "AI sẽ load context tương ứng");
                  }}
                >
                  <div className="st-head">
                    <div className={`st-ico ${t.icoCls}`}>{TYPE_ICONS[t.key]}</div>
                    <div className="st-name">{t.name}</div>
                    {t.badge ? <span className="st-badge">{t.badge}</span> : null}
                  </div>
                  <div className="st-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="card">
          <div className="card-head">
            <div className="card-title">3. Các bước AI sẽ thực hiện</div>
            <span className="tag tag-ai">Auto pipeline</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Whisper bóc tách audio → transcript (Vietnamese + speaker diarization)",
                "Claude so sánh transcript với URD hiện tại → xác định thay đổi",
                "Sinh Meeting Note + URD mới + Diff report",
                "Tự động resolve feedback được đề cập trong meeting",
                "Tạo checkpoint BA review (Human)",
              ].map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      background: i === 4 ? "var(--rose-500)" : "var(--teal-500)",
                      color: "#fff",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>{line}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn ai"
              style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
              onClick={() => showToast("info", "AI đang xử lý...", "Ước tính ~45s · ~$0.82")}
            >
              ✦ Bắt đầu xử lý AI
            </button>
            <div
              style={{
                fontSize: 11,
                color: "var(--slate-500)",
                textAlign: "center",
                marginTop: 8,
                fontFamily: "var(--font-mono)",
              }}
            >
              Ước tính: ~45s · ~$0.82 · claude-opus-4-7
            </div>
          </div>
        </div>
      </div>

      <UploadAudioModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <RecordAudioModal open={recordOpen} onClose={() => setRecordOpen(false)} />
      <ScheduleMeetingModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      <ManualNoteModal open={noteOpen} onClose={() => setNoteOpen(false)} />
      <TranscriptEditorModal open={transOpen} onClose={() => setTransOpen(false)} />
      <ChunkingSettingsModal open={chunkOpen} onClose={() => setChunkOpen(false)} />
    </div>
  );
}
