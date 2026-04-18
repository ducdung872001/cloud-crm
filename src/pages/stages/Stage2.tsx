import { useState } from "react";
import { useApp } from "../../context/AppContext";
import UrdEditorModal from "../../forms/stage2/UrdEditorModal";
import RequirementFormModal, { type Requirement } from "../../forms/stage2/RequirementFormModal";
import DiffReviewModal from "../../forms/stage2/DiffReviewModal";
import TraceabilityModal from "../../forms/stage2/TraceabilityModal";
import ExportUrdModal from "../../forms/stage2/ExportUrdModal";
import SendToClientModal from "../../forms/stage2/SendToClientModal";
import SignatureModal from "../../forms/stage2/SignatureModal";
import VersionCompareModal from "../../forms/stage2/VersionCompareModal";

export default function Stage2() {
  const { showToast } = useApp();
  const [urdOpen, setUrdOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sigOpen, setSigOpen] = useState(false);
  const [cmpOpen, setCmpOpen] = useState(false);

  const handleSaveReq = (_r: Requirement) => {
    showToast("success", "Requirement đã lưu");
  };

  return (
    <>
      <div className="diff-stats">
        <div className="diff-stat add">
          <div className="n">+3</div>
          <div className="l">Thêm mới</div>
        </div>
        <div className="diff-stat mod">
          <div className="n">2</div>
          <div className="l">Sửa đổi</div>
        </div>
        <div className="diff-stat del">
          <div className="n">-1</div>
          <div className="l">Hủy bỏ</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Structured diff</div>
            <span className="tag tag-ai">AI analyzed</span>
          </div>
          <div className="diff-wrap" style={{ border: "none", borderRadius: 0 }}>
            <div className="diff-body">
              <div className="diff-section-head">§ 2.1 Screen Inventory Management</div>
              <div className="diff-line diff-ctx">Hệ thống cho phép CRUD màn hình với metadata:</div>
              <div className="diff-line diff-ctx"> vị trí (GPS), resolution, orientation,</div>
              <div className="diff-line diff-del">- store branch, trạng thái online/offline.</div>
              <div className="diff-line diff-add">+ store branch, trạng thái online/offline,</div>
              <div className="diff-line diff-add">+ nhóm phân loại (promotion/brand/info),</div>
              <div className="diff-line diff-add">+ tag theo chiến dịch marketing.</div>

              <div className="diff-section-head">§ 3.2 Reporting (NEW)</div>
              <div className="diff-line diff-add">+ FR-025: Xuất báo cáo định kỳ theo tuần/tháng</div>
              <div className="diff-line diff-add">+ - Format: PDF + Excel</div>
              <div className="diff-line diff-add">+ - Tự động gửi email cho Marketing Lead</div>

              <div className="diff-section-head">§ 4.1 Integration (REMOVED)</div>
              <div className="diff-line diff-del">- FR-018: Tích hợp với hệ thống POS hiện tại</div>
              <div className="diff-line diff-del">- (KH đã quyết định không cần vì POS sẽ</div>
              <div className="diff-line diff-del">- được thay thế trong Q3/2026)</div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <div className="card-title">Nguồn thay đổi (traceability)</div>
            </div>
            <div className="card-body">
              <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 12 }}>Mỗi thay đổi gán với đoạn transcript cụ thể:</div>

              {[
                {
                  color: "var(--emerald-500)",
                  label: "+ Thêm nhóm phân loại màn hình",
                  ts: "[00:12:34] A. Minh:",
                  quote: '"Mình cần phân loại màn hình theo mục đích — promotion khác với brand awareness..."',
                },
                {
                  color: "var(--rose-500)",
                  label: "- Hủy tích hợp POS",
                  ts: "[00:23:18] C. Lan:",
                  quote: '"Phần tích hợp POS bỏ đi nhé, Q3 thay hệ thống POS mới..."',
                },
                {
                  color: "var(--emerald-500)",
                  label: "+ Sparkline 7 ngày cho card Online",
                  ts: "[00:29:42] A. Minh:",
                  quote: '"Card Online nên có trend 7 ngày, số cứng khó nhìn xu hướng..."',
                },
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: "var(--slate-50)",
                    borderRadius: 8,
                    marginBottom: 10,
                    borderLeft: `3px solid ${t.color}`,
                    cursor: "pointer",
                  }}
                  onClick={() => showToast("info", "Mở transcript", t.ts)}
                >
                  <div style={{ fontWeight: 600, fontSize: 12, color: t.color }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: "var(--slate-500)", margin: "4px 0" }}>{t.ts}</div>
                  <div style={{ fontStyle: "italic", fontSize: 12, color: "var(--slate-700)" }}>{t.quote}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Impact analysis</div>
              <span className="tag tag-warn">Minor</span>
            </div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  ["Change type", "MINOR"],
                  ["Client approval", "Không cần", "var(--emerald-500)"],
                  ["Impact stages", "Prototype, FE"],
                  ["Est. timeline", "+2 ngày"],
                  ["Est. cost", "+$320"],
                  ["Feedback resolved", "3/7", "var(--emerald-500)"],
                ].map(([lbl, val, color], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: "var(--slate-500)" }}>{lbl}</div>
                    <div style={{ fontWeight: 600, color: color as string | undefined }}>{val}</div>
                  </div>
                ))}
              </div>
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
        <button type="button" className="btn" onClick={() => setUrdOpen(true)}>
          ✎ Mở URD editor
        </button>
        <button type="button" className="btn" onClick={() => setReqOpen(true)}>
          + Thêm requirement
        </button>
        <button type="button" className="btn" onClick={() => setDiffOpen(true)}>
          📋 Review diff chi tiết
        </button>
        <button type="button" className="btn" onClick={() => setTraceOpen(true)}>
          🔗 Traceability matrix
        </button>
        <button type="button" className="btn" onClick={() => setCmpOpen(true)}>
          ↔ So sánh versions
        </button>
        <button type="button" className="btn" onClick={() => setExportOpen(true)}>
          ↓ Export URD
        </button>
        <button type="button" className="btn" onClick={() => setSendOpen(true)}>
          ✉ Gửi KH review
        </button>
        <button type="button" className="btn" onClick={() => setSigOpen(true)}>
          ✒ Yêu cầu ký
        </button>
      </div>

      <div className="checkpoint">
        <div className="cp-ico">✋</div>
        <div className="cp-text">
          <div className="cp-title">Checkpoint — SA/PM duyệt URD diff trước khi thông báo team</div>
          <div className="cp-sub">
            Sau khi duyệt, hệ thống sẽ: (1) cập nhật URD, (2) thông báo Dev/QA review impact, (3) resolve 3 feedback đã xử lý.
          </div>
        </div>
        <button type="button" className="btn" onClick={() => setDiffOpen(true)}>
          Chỉnh sửa
        </button>
        <button type="button" className="btn primary" onClick={() => showToast("success", "URD v1.3 đã duyệt", "3 feedback resolved")}>
          Duyệt →
        </button>
      </div>

      <UrdEditorModal open={urdOpen} onClose={() => setUrdOpen(false)} />
      <RequirementFormModal open={reqOpen} onClose={() => setReqOpen(false)} requirement={null} onSave={handleSaveReq} />
      <DiffReviewModal open={diffOpen} onClose={() => setDiffOpen(false)} />
      <TraceabilityModal open={traceOpen} onClose={() => setTraceOpen(false)} />
      <ExportUrdModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <SendToClientModal open={sendOpen} onClose={() => setSendOpen(false)} />
      <SignatureModal open={sigOpen} onClose={() => setSigOpen(false)} />
      <VersionCompareModal open={cmpOpen} onClose={() => setCmpOpen(false)} />
    </>
  );
}
