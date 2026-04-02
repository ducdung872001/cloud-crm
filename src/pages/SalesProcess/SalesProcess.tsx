import React, { useState } from "react";
import { useApp } from "contexts/AppContext";

const PROCESSES = [
  { id: "home-loan", label: "🏦 Vay Mua Nhà" },
  { id: "card",      label: "💳 Thẻ Tín Dụng" },
  { id: "banca",     label: "🛡 Bancassurance" },
  { id: "sme-loan",  label: "🏢 Vay DN/SME" },
];

const BPMN_STEPS: Record<string, any[]> = {
  "home-loan": [
    { id: "start", type: "start", label: "Lead tiếp nhận" },
    { id: "t1",    type: "user",  label: "Tiếp cận & Phân loại Lead", assignee: "${rm}", docs: "Script tư vấn vay" },
    { id: "gw1",   type: "gw",    label: "KH tiềm năng?" },
    { id: "t2",    type: "user",  label: "Tư vấn sản phẩm", assignee: "${rm}", docs: "Bảng lãi suất, Brochure" },
    { id: "t3",    type: "user",  label: "Lập hồ sơ & Gửi đề xuất", assignee: "${rm}", docs: "Mẫu hồ sơ vay" },
    { id: "t4",    type: "service",label: "Auto-check điều kiện vay", delegate: "vn.reborn.crm.bpm.AutoCheckLoan" },
    { id: "t5",    type: "user",  label: "Thẩm định & Phê duyệt", assignee: "credit_officers" },
    { id: "gw2",   type: "gw",    label: "Phê duyệt?" },
    { id: "t6",    type: "user",  label: "Thông báo KH & Ký HĐ", assignee: "${rm}" },
    { id: "end",   type: "end",   label: "Hoàn thành" },
  ],
  "card": [
    { id: "start", type: "start", label: "Lead/Đề xuất mở thẻ" },
    { id: "t1",    type: "user",  label: "Xác minh danh tính & điều kiện", assignee: "${rm}" },
    { id: "t2",    type: "service",label: "Scoring tín dụng tự động", delegate: "vn.reborn.crm.bpm.CreditScoring" },
    { id: "gw1",   type: "gw",    label: "Đủ điều kiện?" },
    { id: "t3",    type: "user",  label: "Tư vấn & Chọn loại thẻ", assignee: "${rm}" },
    { id: "t4",    type: "user",  label: "Thu thập hồ sơ", assignee: "${rm}", docs: "CMND/CCCD, Thu nhập" },
    { id: "t5",    type: "user",  label: "Phê duyệt hạn mức thẻ", assignee: "credit_officers" },
    { id: "t6",    type: "service",label: "Phát hành thẻ & kích hoạt", delegate: "vn.reborn.crm.bpm.IssueCard" },
    { id: "end",   type: "end",   label: "Hoàn thành" },
  ],
};

export default function SalesProcess() {
  const { openModal, showToast } = useApp();
  const [activeProcess, setActiveProcess] = useState("home-loan");
  const [selectedEl, setSelectedEl] = useState<any>(null);

  const steps = BPMN_STEPS[activeProcess] || BPMN_STEPS["home-loan"];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Quy trình bán – BPMN 2.0</div>
          <div className="page-subtitle">Admin · Thiết kế & Quản lý quy trình bán theo chuẩn BPMN 2.0</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => openModal("modal-bpmn-import")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import XML
          </button>
          <button className="btn btn--ghost" onClick={() => showToast("Đang xuất BPMN XML...", "success")}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export XML
          </button>
          <button className="btn btn--ghost" onClick={() => openModal("modal-bpmn-deploy")}>
            <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Deploy BPM Engine
          </button>
          <button className="btn btn--primary" onClick={() => openModal("modal-bpmn-new")}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo quy trình mới
          </button>
        </div>
      </div>

      {/* Process selector */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quy trình:</span>
        {PROCESSES.map((p) => (
          <div
            key={p.id}
            className={`filter-chip${activeProcess === p.id ? " filter-chip--active" : ""}`}
            onClick={() => { setActiveProcess(p.id); setSelectedEl(null); }}
          >{p.label}</div>
        ))}
        <div className="filter-chip filter-chip--dashed" onClick={() => openModal("modal-bpmn-new")}>+ Mới</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", fontWeight: 600 }}>● Deployed v2.1</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: proc_{activeProcess.replace("-","_")}_v2</span>
        </div>
      </div>

      {/* BPMN Editor Layout */}
      <div style={{ display: "flex", gap: 12, height: "calc(100vh - 320px)", minHeight: 500 }}>
        {/* Palette */}
        <div style={{ width: 56, flexShrink: 0, background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0", gap: 4 }}>
          <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6, textAlign: "center" }}>Palette</div>
          {[
            { label: "Start", svg: <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="var(--success)" strokeWidth="2"/></svg> },
            { label: "End",   svg: <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="var(--danger)" strokeWidth="3"/></svg> },
            { label: "User",  svg: <svg width="28" height="28" viewBox="0 0 28 28"><rect x="3" y="5" width="22" height="18" rx="3" fill="none" stroke="var(--accent-bright)" strokeWidth="1.8"/><path d="M8 10a3 3 0 116 0M5 20c0-3 2-5 6-5h6c4 0 6 2 6 5" fill="none" stroke="var(--accent-bright)" strokeWidth="1.5"/></svg> },
            { label: "Svc",   svg: <svg width="28" height="28" viewBox="0 0 28 28"><rect x="3" y="5" width="22" height="18" rx="3" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"/><circle cx="14" cy="14" r="4" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"/></svg> },
            { label: "XOR",   svg: <svg width="28" height="28" viewBox="0 0 28 28"><polygon points="14,3 25,14 14,25 3,14" fill="none" stroke="var(--gold)" strokeWidth="1.8"/><line x1="9" y1="9" x2="19" y2="19" stroke="var(--gold)" strokeWidth="2"/><line x1="19" y1="9" x2="9" y2="19" stroke="var(--gold)" strokeWidth="2"/></svg> },
            { label: "AND",   svg: <svg width="28" height="28" viewBox="0 0 28 28"><polygon points="14,3 25,14 14,25 3,14" fill="none" stroke="var(--accent-bright)" strokeWidth="1.8"/><line x1="14" y1="8" x2="14" y2="20" stroke="var(--accent-bright)" strokeWidth="2"/><line x1="8" y1="14" x2="20" y2="14" stroke="var(--accent-bright)" strokeWidth="2"/></svg> },
          ].map((item) => (
            <div key={item.label} className="bpmn-pal-item" onClick={() => showToast(`Tool: ${item.label}`, "info")}>
              {item.svg}
              <div className="bpmn-pal-label">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
            {["Undo","Redo","Fit","Grid","Validate"].map((btn) => (
              <button key={btn} className="bpmn-tb-btn" onClick={() => showToast(btn, "info")}>{btn}</button>
            ))}
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
              <span style={{ color: "var(--success)" }}>●</span> Valid BPMN 2.0
            </span>
          </div>

          {/* SVG Canvas */}
          <div style={{ flex: 1, overflow: "auto", padding: 20, cursor: "default", position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 980 320" style={{ minWidth: 780 }}>
              {/* Grid */}
              <defs>
                <pattern id="grid-pat" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pat)"/>

              {/* Pool label */}
              <rect x="10" y="10" width="960" height="280" rx="6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
              <rect x="10" y="10" width="30" height="280" rx="6 0 0 6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
              <text x="25" y="155" textAnchor="middle" fill="var(--text-muted)" fontSize="10" transform="rotate(-90,25,155)">Sales Process</text>

              {/* Lane */}
              <rect x="40" y="10" width="930" height="130" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              <text x="48" y="80" fill="var(--text-muted)" fontSize="9">RM (Relationship Manager)</text>
              <rect x="40" y="140" width="930" height="150" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              <text x="48" y="220" fill="var(--text-muted)" fontSize="9">Credit Team / System</text>

              {/* Start event */}
              <g style={{ cursor: "pointer" }} onClick={() => setSelectedEl({ type: "start", name: "Lead tiếp nhận" })}>
                <circle cx="80" cy="75" r="18" fill="none" stroke="var(--success)" strokeWidth="2"/>
                <text x="80" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">Lead tiếp nhận</text>
              </g>

              {/* Arrows */}
              <line x1="98" y1="75" x2="140" y2="75" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <line x1="270" y1="75" x2="310" y2="75" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <line x1="440" y1="75" x2="480" y2="75" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <line x1="530" y1="90" x2="530" y2="160" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arr)" strokeDasharray="4"/>
              <line x1="610" y1="190" x2="670" y2="190" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <line x1="800" y1="190" x2="840" y2="190" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <line x1="870" y1="175" x2="870" y2="90" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arr)"/>
              <line x1="890" y1="75" x2="930" y2="75" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arr)"/>

              <defs>
                <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="var(--text-muted)"/>
                </marker>
              </defs>

              {/* Task 1: Tiếp cận */}
              <g style={{ cursor: "pointer" }} onClick={() => setSelectedEl({ type: "user-task", name: "Tiếp cận & Phân loại Lead" })}>
                <rect x="140" y="45" width="130" height="60" rx="5" fill="rgba(33,150,243,0.08)" stroke="var(--accent)" strokeWidth="1.5"/>
                <text x="205" y="72" textAnchor="middle" fill="var(--accent-bright)" fontSize="9" fontWeight="600">Tiếp cận &</text>
                <text x="205" y="84" textAnchor="middle" fill="var(--accent-bright)" fontSize="9" fontWeight="600">Phân loại Lead</text>
                <circle cx="153" cy="53" r="6" fill="none" stroke="var(--accent)" strokeWidth="1"/>
                <path d="M150 53 a3 3 0 1 0 6 0M148 58c0-2 1.5-3 5-3s5 1 5 3" fill="none" stroke="var(--accent)" strokeWidth="1"/>
              </g>

              {/* Task 2: Tư vấn */}
              <g style={{ cursor: "pointer" }} onClick={() => setSelectedEl({ type: "user-task", name: "Tư vấn sản phẩm" })}>
                <rect x="310" y="45" width="130" height="60" rx="5" fill="rgba(33,150,243,0.08)" stroke="var(--accent)" strokeWidth="1.5"/>
                <text x="375" y="78" textAnchor="middle" fill="var(--accent-bright)" fontSize="9" fontWeight="600">Tư vấn sản phẩm</text>
                <circle cx="323" cy="53" r="6" fill="none" stroke="var(--accent)" strokeWidth="1"/>
                <path d="M320 53 a3 3 0 1 0 6 0M318 58c0-2 1.5-3 5-3s5 1 5 3" fill="none" stroke="var(--accent)" strokeWidth="1"/>
              </g>

              {/* Gateway 1 */}
              <g style={{ cursor: "pointer" }} onClick={() => setSelectedEl({ type: "exclusive-gw", name: "KH tiềm năng?" })}>
                <polygon points="480,55 510,75 480,95 450,75" fill="rgba(245,166,35,0.1)" stroke="var(--gold)" strokeWidth="1.8"/>
                <line x1="465" y1="60" x2="495" y2="90" stroke="var(--gold)" strokeWidth="1.5"/>
                <line x1="495" y1="60" x2="465" y2="90" stroke="var(--gold)" strokeWidth="1.5"/>
                <text x="480" y="108" textAnchor="middle" fill="var(--gold)" fontSize="8.5">KH tiềm năng?</text>
              </g>

              {/* Service task: Auto-check */}
              <g style={{ cursor: "pointer" }} onClick={() => setSelectedEl({ type: "service-task", name: "Auto-check điều kiện vay" })}>
                <rect x="480" y="160" width="130" height="60" rx="5" fill="rgba(195,155,211,0.08)" stroke="var(--purple)" strokeWidth="1.5"/>
                <text x="545" y="186" textAnchor="middle" fill="var(--purple)" fontSize="9" fontWeight="600">Auto-check</text>
                <text x="545" y="198" textAnchor="middle" fill="var(--purple)" fontSize="9" fontWeight="600">điều kiện vay</text>
                <circle cx="493" cy="168" r="5" fill="none" stroke="var(--purple)" strokeWidth="1"/>
                <circle cx="493" cy="168" r="2" fill="var(--purple)"/>
              </g>

              {/* Task: Thẩm định */}
              <g style={{ cursor: "pointer" }} onClick={() => setSelectedEl({ type: "user-task", name: "Thẩm định & Phê duyệt" })}>
                <rect x="670" y="160" width="130" height="60" rx="5" fill="rgba(33,150,243,0.08)" stroke="var(--accent)" strokeWidth="1.5"/>
                <text x="735" y="186" textAnchor="middle" fill="var(--accent-bright)" fontSize="9" fontWeight="600">Thẩm định &</text>
                <text x="735" y="198" textAnchor="middle" fill="var(--accent-bright)" fontSize="9" fontWeight="600">Phê duyệt</text>
                <circle cx="683" cy="168" r="6" fill="none" stroke="var(--accent)" strokeWidth="1"/>
                <path d="M680 168 a3 3 0 1 0 6 0M678 173c0-2 1.5-3 5-3s5 1 5 3" fill="none" stroke="var(--accent)" strokeWidth="1"/>
              </g>

              {/* Gateway 2 */}
              <g style={{ cursor: "pointer" }} onClick={() => setSelectedEl({ type: "exclusive-gw", name: "Phê duyệt?" })}>
                <polygon points="870,55 900,75 870,95 840,75" fill="rgba(245,166,35,0.1)" stroke="var(--gold)" strokeWidth="1.8"/>
                <line x1="855" y1="60" x2="885" y2="90" stroke="var(--gold)" strokeWidth="1.5"/>
                <line x1="885" y1="60" x2="855" y2="90" stroke="var(--gold)" strokeWidth="1.5"/>
                <text x="870" y="108" textAnchor="middle" fill="var(--gold)" fontSize="8.5">Phê duyệt?</text>
              </g>

              {/* End event */}
              <g style={{ cursor: "pointer" }} onClick={() => setSelectedEl({ type: "end", name: "Hoàn thành" })}>
                <circle cx="950" cy="75" r="18" fill="none" stroke="var(--danger)" strokeWidth="3"/>
                <text x="950" y="105" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">Hoàn thành</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Properties panel */}
        <div id="bpmn-props" style={{ width: 220, flexShrink: 0, background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600 }}>Properties</div>
          <div style={{ padding: 12, flex: 1, overflowY: "auto", fontSize: 12 }}>
            {selectedEl ? (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "var(--accent-soft)", color: "var(--accent-bright)", fontWeight: 600 }}>
                    {selectedEl.type === "user-task" ? "User Task" : selectedEl.type === "service-task" ? "Service Task" : selectedEl.type === "exclusive-gw" ? "Exclusive GW (XOR)" : selectedEl.type === "start" ? "Start Event" : "End Event"}
                  </span>
                </div>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label">Name</label>
                  <input className="form-input" defaultValue={selectedEl.name} style={{ fontSize: 12, padding: "6px 10px" }}/>
                </div>
                {selectedEl.type === "user-task" && (
                  <>
                    <div className="form-group" style={{ marginBottom: 10 }}>
                      <label className="form-label">Assignee</label>
                      <input className="form-input" defaultValue="${rm}" style={{ fontSize: 12, padding: "6px 10px" }}/>
                    </div>
                    <div className="form-group" style={{ marginBottom: 10 }}>
                      <label className="form-label">Tài liệu đính kèm</label>
                      <input className="form-input" placeholder="doc.pdf, sheet.xlsx" style={{ fontSize: 12, padding: "6px 10px" }}/>
                    </div>
                  </>
                )}
                {selectedEl.type === "service-task" && (
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Java Delegate</label>
                    <input className="form-input" defaultValue="vn.reborn.crm.bpm.AutoCheck" style={{ fontSize: 11, padding: "6px 10px", fontFamily: "monospace" }}/>
                  </div>
                )}
                <button className="btn btn--ghost" style={{ width: "100%", fontSize: 12, height: 30, marginTop: 4 }} onClick={() => showToast("Đã lưu thuộc tính", "success")}>Lưu thay đổi</button>
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: 11, textAlign: "center", marginTop: 40 }}>
                Click vào phần tử để xem thuộc tính
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
