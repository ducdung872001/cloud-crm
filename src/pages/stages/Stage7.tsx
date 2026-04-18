import { useState } from "react";
import { useApp } from "../../context/AppContext";
import ReleaseNoteModal from "../../forms/stage7/ReleaseNoteModal";
import UatSignoffModal from "../../forms/stage7/UatSignoffModal";
import UserManualModal from "../../forms/stage7/UserManualModal";
import TrainingScheduleModal from "../../forms/stage7/TrainingScheduleModal";
import ProdDeployModal from "../../forms/stage7/ProdDeployModal";

const DELIVERS = [
  { ico: "PDF", icoCls: "ico-doc", name: "Release Note v1.0.0", meta: "AI · 12 trang · VN/EN", tag: "Ready", tagCls: "tag-ok" },
  { ico: "DOC", icoCls: "ico-doc", name: "User Manual — Content Manager", meta: "AI · 34 trang · Có screenshot", tag: "Ready", tagCls: "tag-ok" },
  {
    ico: "PPT",
    icoCls: "",
    icoStyle: { background: "#FEE2E2", color: "#B91C1C" },
    name: "Training Deck (Vietnamese)",
    meta: "AI · 24 slides",
    tag: "Chờ PM",
    tagCls: "tag-warn",
  },
  { ico: "PDF", icoCls: "ico-doc", name: "Biên bản nghiệm thu UAT", meta: "Chờ KH ký", tag: "Human", tagCls: "tag-hu" },
  { ico: "ZIP", icoCls: "ico-code", name: "Source code + Docker images", meta: "GitLab private repo", tag: "Ready", tagCls: "tag-ok" },
];

const PROGRESS = [
  { label: "UAT Test Cases", val: "38/42", pct: 90, green: true },
  { label: "Training buổi", val: "3/4", pct: 75 },
  { label: "Site deployment", val: "118/120 màn hình", pct: 98, green: true },
];

export default function Stage7() {
  const { showToast } = useApp();
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [uatOpen, setUatOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [trainOpen, setTrainOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-head">
          <div className="card-title">Deliverables</div>
          <span className="tag tag-ai">AI + Human</span>
        </div>
        <div className="file-list">
          {DELIVERS.map((d) => (
            <div key={d.name} className="file-item" onClick={() => showToast("info", `Mở ${d.name}`, d.meta)}>
              <div className={`file-ico ${d.icoCls}`} style={"icoStyle" in d ? d.icoStyle : undefined}>
                {d.ico}
              </div>
              <div>
                <div className="file-name">{d.name}</div>
                <div className="file-sub">{d.meta}</div>
              </div>
              <span className={`tag ${d.tagCls}`}>{d.tag}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div className="card-title">UAT Progress</div>
          </div>
          <div className="card-body">
            {PROGRESS.map((p, i) => (
              <div key={p.label} style={{ marginBottom: i === PROGRESS.length - 1 ? 0 : 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 6,
                  }}
                >
                  <span>{p.label}</span>
                  <strong>{p.val}</strong>
                </div>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${p.pct}%`,
                      background: p.green ? "linear-gradient(90deg, var(--emerald-500), var(--emerald-400))" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Retrospective</div>
            <span className="tag tag-ai">Auto</span>
          </div>
          <div className="card-body">
            <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--slate-700)" }}>
              <p>
                <strong style={{ color: "var(--emerald-500)" }}>✓ What worked</strong>
              </p>
              <p style={{ marginTop: 4 }}>Pipeline AI-first rút ngắn 47% thời gian. URD review loop chỉ 2 vòng (trung bình 4).</p>
              <p style={{ marginTop: 10 }}>
                <strong style={{ color: "var(--amber-500)" }}>⚠ Cần cải thiện</strong>
              </p>
              <p style={{ marginTop: 4 }}>Stage 5 loop với Stage 4 nhiều lần do contract API thay đổi. Nên freeze contract sau CP3.</p>
              <p style={{ marginTop: 10 }}>
                <strong style={{ color: "var(--teal-500)" }}>◆ Metrics</strong>
              </p>
              <p style={{ marginTop: 4 }}>AI cost: $284.50 · Human-hour: 186h · CSAT: 9.2/10</p>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <button type="button" className="btn" onClick={() => setReleaseOpen(true)}>
          📝 Release note
        </button>
        <button type="button" className="btn" onClick={() => setManualOpen(true)}>
          📖 Sinh User Manual
        </button>
        <button type="button" className="btn" onClick={() => setTrainOpen(true)}>
          📅 Đặt training
        </button>
        <button type="button" className="btn primary" onClick={() => setUatOpen(true)}>
          ✒ Ký UAT
        </button>
        <button type="button" className="btn destructive" onClick={() => setDeployOpen(true)}>
          🚀 Deploy Production
        </button>
      </div>

      <ReleaseNoteModal open={releaseOpen} onClose={() => setReleaseOpen(false)} />
      <UatSignoffModal open={uatOpen} onClose={() => setUatOpen(false)} />
      <UserManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
      <TrainingScheduleModal open={trainOpen} onClose={() => setTrainOpen(false)} />
      <ProdDeployModal open={deployOpen} onClose={() => setDeployOpen(false)} />
    </div>
  );
}
