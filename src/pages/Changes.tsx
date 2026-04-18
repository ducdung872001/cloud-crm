import { useState } from "react";
import { CHANGES } from "../data/sessions";
import CreateCrModal from "../forms/cr/CreateCrModal";
import CrApprovalModal from "../forms/cr/CrApprovalModal";
import EditCrModal from "../forms/cr/EditCrModal";
import LinkUrdModal from "../forms/cr/LinkUrdModal";

export default function Changes() {
  const [createOpen, setCreateOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">⇌ CHANGE REQUESTS</div>
          <div className="kicker">Project · {CHANGES.length} CR</div>
          <h1 className="title">Yêu cầu thay đổi</h1>
          <p className="desc">Thay đổi scope sau khi URD đã chốt. Mỗi CR cần PM duyệt + KH ký.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn primary" onClick={() => setCreateOpen(true)}>
            + Tạo CR mới
          </button>
        </div>
      </div>

      <div className="grid-2">
        {CHANGES.map((c) => (
          <div key={c.id} className="card">
            <div style={{ padding: 18, borderBottom: "1px solid var(--slate-100)" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--slate-400)" }}>{c.code}</div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {c.title}
                  </div>
                </div>
                <span className={`tag ${c.status === "approved" ? "tag-ok" : "tag-warn"}`}>{c.status === "approved" ? "Approved" : "Chờ KH ký"}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--slate-700)", lineHeight: 1.6 }}>{c.description}</div>
            </div>
            <div style={{ padding: 18, background: "var(--slate-50)" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--slate-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                }}
              >
                Impact analysis
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--slate-500)" }}>Type</div>
                  <div style={{ fontWeight: 600, color: c.impact.typeColor }}>{c.impact.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--slate-500)" }}>Timeline</div>
                  <div style={{ fontWeight: 600, color: c.impact.timelineColor }}>{c.impact.timeline}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--slate-500)" }}>Cost</div>
                  <div style={{ fontWeight: 600, color: c.impact.costColor }}>{c.impact.cost}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--slate-500)" }}>Stages</div>
                  <div style={{ fontWeight: 600 }}>{c.impact.stages}</div>
                </div>
              </div>
              {c.status === "pending" ? (
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button type="button" className="btn sm" onClick={() => setEditOpen(true)}>
                    ✎ Sửa
                  </button>
                  <button type="button" className="btn sm" onClick={() => setLinkOpen(true)}>
                    🔗 Link URD
                  </button>
                  <button type="button" className="btn sm primary" onClick={() => setApproveOpen(true)}>
                    Duyệt / gửi KH ký →
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <CreateCrModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CrApprovalModal open={approveOpen} onClose={() => setApproveOpen(false)} />
      <EditCrModal open={editOpen} onClose={() => setEditOpen(false)} />
      <LinkUrdModal open={linkOpen} onClose={() => setLinkOpen(false)} />
    </section>
  );
}
