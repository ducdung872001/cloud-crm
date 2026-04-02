import React, { useState } from "react";
import { useApp } from "contexts/AppContext";
import { apiGet, apiPost, apiDelete } from "configs/apiClient";

// ── Types & constants ──────────────────────────────────────────────────
type SubMenu = "bpmn" | "approval_flow" | "default_process" | "components" | "forms" | "objects";

const SUB_MENUS: { key: SubMenu; icon: string; label: string; desc: string }[] = [
  { key: "bpmn",             icon: "⚙️", label: "BPMN Designer",              desc: "Thiết kế quy trình bán theo chuẩn BPMN 2.0" },
  { key: "approval_flow",    icon: "✅", label: "Quy trình phê duyệt",        desc: "Cấu hình luồng duyệt hồ sơ theo cấp" },
  { key: "default_process",  icon: "🔗", label: "Quy trình mặc định",         desc: "Gán quy trình BPMN mặc định cho từng sản phẩm" },
  { key: "components",       icon: "🧩", label: "Thành phần dùng chung",      desc: "Các module, thành phần tái sử dụng trong quy trình" },
  { key: "forms",            icon: "📋", label: "Danh mục biểu mẫu",         desc: "Quản lý form nhập liệu dùng trong từng bước quy trình" },
  { key: "objects",          icon: "📦", label: "Đối tượng quy trình",        desc: "Phân loại đối tượng xử lý: KH, hợp đồng, yêu cầu…" },
];

function Skeleton({ h = 14, w = "80%" }: { h?: number; w?: string }) {
  return <div style={{ height: h, borderRadius: 4, background: "var(--surface-hover)", width: w, marginBottom: 6 }} />;
}

function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="info-banner info-banner--danger" style={{ marginBottom: 12 }}>
      ⚠ {msg} <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: 8 }} onClick={onRetry}>Thử lại</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 1. BPMN DESIGNER
// ═══════════════════════════════════════════════════════════════════════
const PROCESSES = [
  { id: "home-loan", label: "🏦 Vay Mua Nhà",   processKey: "proc_home_loan_v2",  status: "deployed" },
  { id: "card",      label: "💳 Thẻ Tín Dụng",  processKey: "proc_credit_card_v1", status: "deployed" },
  { id: "banca",     label: "🛡 Bancassurance",  processKey: "proc_banca_v1",       status: "draft" },
  { id: "sme",       label: "🏢 Vay DN/SME",    processKey: "proc_sme_v1",         status: "draft" },
];

const BPMN_STEPS: Record<string, any[]> = {
  "home-loan": [
    { id: "start", type: "start", label: "Lead tiếp nhận", lane: "rm" },
    { id: "t1",    type: "user",  label: "Tiếp cận & Phân loại Lead", assignee: "${rm}", docs: "Script tư vấn vay", lane: "rm" },
    { id: "gw1",   type: "gw",    label: "KH tiềm năng?", lane: "rm" },
    { id: "t2",    type: "user",  label: "Tư vấn sản phẩm", assignee: "${rm}", docs: "Bảng lãi suất", lane: "rm" },
    { id: "t3",    type: "user",  label: "Lập hồ sơ & Đề xuất", assignee: "${rm}", docs: "Mẫu hồ sơ vay", lane: "rm" },
    { id: "t4",    type: "svc",   label: "Auto-check điều kiện vay", delegate: "AutoCheckLoan", lane: "system" },
    { id: "t5",    type: "user",  label: "Thẩm định & Phê duyệt", assignee: "credit_officers", lane: "credit" },
    { id: "gw2",   type: "gw",    label: "Phê duyệt?", lane: "credit" },
    { id: "t6",    type: "user",  label: "Thông báo KH & Ký HĐ", assignee: "${rm}", lane: "rm" },
    { id: "end",   type: "end",   label: "Hoàn thành", lane: "rm" },
  ],
  "card": [
    { id: "start", type: "start", label: "Đề xuất mở thẻ", lane: "rm" },
    { id: "t1",    type: "user",  label: "Xác minh danh tính & điều kiện", assignee: "${rm}", lane: "rm" },
    { id: "t2",    type: "svc",   label: "Auto Credit Scoring", delegate: "CreditScoring", lane: "system" },
    { id: "gw1",   type: "gw",    label: "Đủ điều kiện?", lane: "system" },
    { id: "t3",    type: "user",  label: "Tư vấn & Chọn loại thẻ", assignee: "${rm}", lane: "rm" },
    { id: "t4",    type: "user",  label: "Thu thập hồ sơ", assignee: "${rm}", lane: "rm" },
    { id: "t5",    type: "user",  label: "Phê duyệt hạn mức thẻ", assignee: "credit_officers", lane: "credit" },
    { id: "t6",    type: "svc",   label: "Phát hành thẻ & kích hoạt", delegate: "IssueCard", lane: "system" },
    { id: "end",   type: "end",   label: "Hoàn thành", lane: "rm" },
  ],
};

function BpmnDesigner() {
  const { openModal, showToast } = useApp();
  const [activeProcess, setActiveProcess] = useState("home-loan");
  const [selectedEl,    setSelectedEl]    = useState<any>(null);
  const [saving,        setSaving]        = useState(false);
  const steps = BPMN_STEPS[activeProcess] || BPMN_STEPS["home-loan"];
  const proc  = PROCESSES.find(p => p.id === activeProcess)!;

  const handleDeploy = async () => {
    setSaving(true);
    try {
      await apiPost("/bpmapi/kafka/activateProcess", { processKey: proc.processKey, xml: "<definitions/>" });
      showToast(`Đã deploy ${proc.processKey} lên BPM Engine!`, "success");
    } catch (e: any) {
      showToast("Lỗi deploy: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const exportXml = async () => {
    try {
      const res = await apiGet("/bpmapi/process/export", { processKey: proc.processKey });
      showToast("Đã xuất BPMN XML thành công", "success");
    } catch { showToast("Lỗi xuất XML", "error"); }
  };

  return (
    <div>
      {/* Sub-header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 4 }}>QUY TRÌNH:</span>
          {PROCESSES.map(p => (
            <button key={p.id} onClick={() => { setActiveProcess(p.id); setSelectedEl(null); }} style={{
              padding: "6px 14px", borderRadius: 20, border: "1.5px solid",
              borderColor: activeProcess === p.id ? "var(--accent)" : "var(--border)",
              background: activeProcess === p.id ? "var(--accent-soft)" : "none",
              color: activeProcess === p.id ? "var(--accent-bright)" : "var(--text-secondary)",
              fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font)",
            }}>{p.label}</button>
          ))}
          <button onClick={() => openModal("modal-bpmn-new")} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px dashed var(--border)", background: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)" }}>+ Mới</button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: proc.status === "deployed" ? "var(--success-soft)" : "var(--warning-soft)", color: proc.status === "deployed" ? "var(--success)" : "var(--warning)", fontWeight: 600 }}>
            {proc.status === "deployed" ? "● Deployed v2.1" : "○ Draft"}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {proc.processKey}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 280px", gap: 0, background: "var(--navy-mid)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", minHeight: 460 }}>
        {/* Palette */}
        <div style={{ width: 60, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 4 }}>
          {[
            { type: "start", color: "#4CAF50", label: "Start", shape: "circle" },
            { type: "end",   color: "#F44336", label: "End",   shape: "circle" },
            { type: "user",  color: "var(--accent)", label: "User", shape: "rect" },
            { type: "svc",   color: "var(--purple)", label: "Svc", shape: "rect" },
            { type: "gw",    color: "var(--gold)", label: "XOR", shape: "diamond" },
            { type: "and",   color: "var(--warning)", label: "AND", shape: "diamond" },
          ].map(item => (
            <div key={item.type} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "grab", padding: "6px 4px", borderRadius: 6, width: 52 }} title={item.label}>
              {item.shape === "circle" && <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${item.color}`, background: `${item.color}22` }} />}
              {item.shape === "rect"   && <div style={{ width: 32, height: 22, borderRadius: 6, border: `2px solid ${item.color}`, background: `${item.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: item.color, fill: "none", strokeWidth: 2 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>}
              {item.shape === "diamond"&& <div style={{ width: 26, height: 26, background: `${item.color}22`, border: `2px solid ${item.color}`, transform: "rotate(45deg)" }} />}
              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ padding: 20, overflowX: "auto" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {["Undo","Redo","Fit","Grid","Validate"].map(action => (
              <button key={action} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font)" }}
                onClick={() => showToast(`${action}`, "info")}>{action}</button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
              <span style={{ fontSize: 11, color: "var(--success)" }}>Valid BPMN 2.0</span>
            </div>
          </div>

          {/* Lane diagram */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", minHeight: 300 }}>
            {/* RM Lane */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 100, minWidth: 100, background: "rgba(33,150,243,0.06)", borderRight: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 11, color: "var(--accent-bright)", fontWeight: 600, letterSpacing: 1, padding: "10px 6px" }}>
                RM (Relationship Manager)
              </div>
              <div style={{ flex: 1, padding: "14px 16px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minHeight: 90 }}>
                {steps.filter(s => s.lane === "rm" || !s.lane).map((step, i, arr) => (
                  <React.Fragment key={step.id}>
                    <div onClick={() => setSelectedEl(step)} style={{
                      cursor: "pointer", userSelect: "none",
                      ...(step.type === "start" || step.type === "end" ? {
                        width: 40, height: 40, borderRadius: "50%", border: `3px solid ${step.type === "start" ? "#4CAF50" : "#F44336"}`,
                        background: step.type === "start" ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      } : step.type === "gw" ? {
                        width: 36, height: 36, background: "rgba(245,166,35,0.15)", border: `2px solid var(--gold)`,
                        transform: "rotate(45deg)", flexShrink: 0,
                        boxShadow: selectedEl?.id === step.id ? "0 0 0 2px var(--gold)" : undefined,
                      } : {
                        padding: "8px 12px", borderRadius: 8, flexShrink: 0, maxWidth: 130, textAlign: "center",
                        background: step.type === "svc" ? "rgba(156,39,176,0.12)" : "rgba(33,150,243,0.12)",
                        border: `1.5px solid ${step.type === "svc" ? "var(--purple)" : "var(--accent)"}`,
                        boxShadow: selectedEl?.id === step.id ? `0 0 0 2px ${step.type === "svc" ? "var(--purple)" : "var(--accent)"}` : undefined,
                      }),
                    }}>
                      {step.type !== "gw" && (
                        <div style={{ fontSize: step.type === "start" || step.type === "end" ? 10 : 11, fontWeight: 500, color: "var(--text-primary)", ...(step.type === "start" || step.type === "end" ? {} : {}) }}>
                          {step.type === "start" ? "▶" : step.type === "end" ? "■" : step.label}
                        </div>
                      )}
                      {step.type === "gw" && (
                        <div style={{ transform: "rotate(-45deg)", fontSize: 10, fontWeight: 600, color: "var(--gold)", whiteSpace: "nowrap" }}>✕</div>
                      )}
                    </div>
                    {i < arr.length - 1 && <div style={{ color: "var(--text-muted)", fontSize: 14, flexShrink: 0 }}>→</div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* System Lane */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 100, minWidth: 100, background: "rgba(156,39,176,0.06)", borderRight: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 11, color: "var(--purple)", fontWeight: 600, letterSpacing: 1, padding: "10px 6px" }}>
                System / Auto
              </div>
              <div style={{ flex: 1, padding: "14px 16px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minHeight: 70 }}>
                {steps.filter(s => s.lane === "system").map((step, i, arr) => (
                  <React.Fragment key={step.id}>
                    <div onClick={() => setSelectedEl(step)} style={{
                      padding: "8px 12px", borderRadius: 8, flexShrink: 0, maxWidth: 140, textAlign: "center",
                      background: "rgba(156,39,176,0.12)", border: "1.5px solid var(--purple)", cursor: "pointer",
                      boxShadow: selectedEl?.id === step.id ? "0 0 0 2px var(--purple)" : undefined,
                    }}>
                      <div style={{ fontSize: 10, color: "var(--purple)", marginBottom: 2 }}>⚙ Service Task</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>{step.label}</div>
                    </div>
                    {i < arr.length - 1 && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>→</div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Credit Lane */}
            <div style={{ display: "flex" }}>
              <div style={{ width: 100, minWidth: 100, background: "rgba(245,166,35,0.06)", borderRight: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: 1, padding: "10px 6px" }}>
                Credit Team
              </div>
              <div style={{ flex: 1, padding: "14px 16px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minHeight: 70 }}>
                {steps.filter(s => s.lane === "credit").map((step, i, arr) => (
                  <React.Fragment key={step.id}>
                    <div onClick={() => setSelectedEl(step)} style={{
                      padding: "8px 12px", borderRadius: 8, flexShrink: 0, maxWidth: 140, textAlign: "center",
                      background: "rgba(245,166,35,0.12)", border: "1.5px solid var(--gold)", cursor: "pointer",
                      boxShadow: selectedEl?.id === step.id ? "0 0 0 2px var(--gold)" : undefined,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>{step.label}</div>
                    </div>
                    {i < arr.length - 1 && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>→</div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button className="btn btn--ghost btn--sm" onClick={() => openModal("modal-bpmn-import")}>
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import XML
            </button>
            <button className="btn btn--ghost btn--sm" onClick={exportXml}>
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export XML
            </button>
            <button className="btn btn--primary btn--sm" onClick={handleDeploy} disabled={saving}>
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
              {saving ? "Deploying…" : "Deploy BPM Engine"}
            </button>
          </div>
        </div>

        {/* Properties panel */}
        <div style={{ borderLeft: "1px solid var(--border)", padding: 16, overflowY: "auto" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Properties</div>
          {selectedEl ? (
            <div>
              <div className="surface-box" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Element ID</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--accent-bright)" }}>{selectedEl.id}</div>
              </div>
              <div className="surface-box" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Type</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: selectedEl.type === "svc" ? "var(--purple)" : selectedEl.type === "gw" ? "var(--gold)" : "var(--accent-bright)" }}>
                  {selectedEl.type === "user" ? "User Task" : selectedEl.type === "svc" ? "Service Task" : selectedEl.type === "gw" ? "Gateway (XOR)" : selectedEl.type}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Label</label>
                <input className="form-input" defaultValue={selectedEl.label} style={{ fontSize: 12 }} />
              </div>
              {selectedEl.assignee !== undefined && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Assignee</label>
                  <input className="form-input" defaultValue={selectedEl.assignee} style={{ fontSize: 12 }} />
                </div>
              )}
              {selectedEl.docs && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Tài liệu gắn kèm</label>
                  <textarea className="form-input" defaultValue={selectedEl.docs} rows={2} style={{ fontSize: 12 }} />
                </div>
              )}
              {selectedEl.type === "svc" && selectedEl.delegate && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Java Delegate</label>
                  <input className="form-input" defaultValue={`vn.reborn.crm.bpm.${selectedEl.delegate}`} style={{ fontSize: 11, fontFamily: "monospace" }} />
                </div>
              )}
              <button className="btn btn--ghost btn--sm" style={{ width: "100%", marginTop: 4 }} onClick={() => showToast("Đã lưu thuộc tính", "success")}>Lưu thay đổi</button>
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", marginTop: 40, lineHeight: 1.8 }}>
              Click vào phần tử<br />để xem thuộc tính
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 2. APPROVAL FLOW (quy trình phê duyệt)
// ═══════════════════════════════════════════════════════════════════════
function ApprovalFlowPage() {
  const { showToast } = useApp();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [editItem,  setEditItem]  = useState<any>(null);
  const [form, setForm] = useState({ name: "", type: "approval", level: "1", roles: "", note: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const fetchApprovals = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiGet("/adminapi/approval/list", { page: 1, limit: 20 });
      if (res?.code === 0 || res?.result) {
        setApprovals(res.result?.items || res.result || []);
      } else setError(res?.message || "Không tải được");
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const handleSave = async () => {
    try {
      await apiPost("/adminapi/approvalConfig/update", {
        id: editItem?.id,
        name: form.name,
        type: form.type,
        level: +form.level,
        note: form.note,
      });
      showToast("Đã lưu quy trình phê duyệt!", "success");
      setShowForm(false);
      setEditItem(null);
      fetchApprovals();
    } catch (e: any) { showToast("Lỗi: " + e.message, "error"); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa quy trình phê duyệt này?")) return;
    try {
      await apiDelete("/adminapi/approvalConfig/delete", { id });
      showToast("Đã xóa!", "success");
      fetchApprovals();
    } catch (e: any) { showToast("Lỗi: " + e.message, "error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Quy trình phê duyệt ({approvals.length})</div>
        <button className="btn btn--primary btn--sm" onClick={() => { setEditItem(null); setForm({ name: "", type: "approval", level: "1", roles: "", note: "" }); setShowForm(true); }}>
          + Thêm quy trình
        </button>
      </div>

      {error && <ErrorBanner msg={error} onRetry={fetchApprovals} />}

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--accent-soft)" }}>
          <div className="card__header">
            <span className="card__title">{editItem ? "Chỉnh sửa" : "Thêm mới"} quy trình phê duyệt</span>
            <span className="card__action" onClick={() => setShowForm(false)}>✕</span>
          </div>
          <div className="card__body">
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Tên quy trình *</label><input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="VD: Phê duyệt lãi suất ưu đãi" /></div>
              <div className="form-group"><label className="form-label">Loại đề xuất</label>
                <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
                  <option value="approval">Phê duyệt chung</option>
                  <option value="interest_rate">Lãi suất ưu đãi</option>
                  <option value="credit_limit">Hạn mức tín dụng</option>
                  <option value="extension">Gia hạn khoản vay</option>
                  <option value="restructure">Cơ cấu nợ</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Số cấp duyệt</label>
                <select className="form-select" value={form.level} onChange={e => set("level", e.target.value)}>
                  <option value="1">1 cấp – Branch Manager</option>
                  <option value="2">2 cấp – BM + Credit Team</option>
                  <option value="3">3 cấp – BM + Credit + Regional Director</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Nhóm vai trò duyệt</label><input className="form-input" value={form.roles} onChange={e => set("roles", e.target.value)} placeholder="branch_manager, credit_officer" /></div>
              <div className="form-group form-group--full"><label className="form-label">Ghi chú</label><textarea className="form-input" rows={2} value={form.note} onChange={e => set("note", e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn btn--ghost btn--sm" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="btn btn--primary btn--sm" onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          {loading ? [...Array(4)].map((_,i) => (
            <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}><Skeleton /><Skeleton w="60%" /></div>
          )) : approvals.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <div>Chưa có quy trình phê duyệt. <span style={{ color: "var(--accent-bright)", cursor: "pointer" }} onClick={() => setShowForm(true)}>Tạo mới ngay?</span></div>
            </div>
          ) : approvals.map((item: any) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✅</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name || "Quy trình phê duyệt #" + item.id}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Loại: {item.type || "—"} · Cấp duyệt: {item.level || 1}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-icon-sm" onClick={() => { setEditItem(item); setForm({ name: item.name || "", type: item.type || "approval", level: String(item.level || 1), roles: item.roles || "", note: item.note || "" }); setShowForm(true); }}>Sửa</button>
                <button className="btn-icon-sm" style={{ color: "var(--danger)" }} onClick={() => handleDelete(item.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3. DEFAULT PROCESS (gán quy trình mặc định theo sản phẩm)
// ═══════════════════════════════════════════════════════════════════════
function DefaultProcessPage() {
  const { showToast } = useApp();
  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiGet("/adminapi/contractPipeline/list", { page: 1, limit: 20 });
      if (res?.code === 0 || res?.result) {
        setItems(res.result?.items || res.result || []);
      } else setError(res?.message || "Không tải được");
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSave = async (productType: string, processKey: string) => {
    try {
      await apiPost("/adminapi/contractPipeline/update", { productType, processKey });
      showToast("Đã cập nhật quy trình mặc định!", "success");
      fetch_();
    } catch (e: any) { showToast("Lỗi: " + e.message, "error"); }
  };

  const DEFAULT_PRODUCTS = [
    { label: "🏦 Vay Mua Nhà / Tài sản", type: "home_loan", processKey: "proc_home_loan_v2" },
    { label: "💳 Thẻ Tín Dụng",           type: "credit_card", processKey: "proc_credit_card_v1" },
    { label: "🛡 Bancassurance",            type: "bancassurance", processKey: "" },
    { label: "🏢 Vay DN / SME",            type: "sme_loan", processKey: "" },
    { label: "💰 Tiết kiệm / Tiền gửi",   type: "savings", processKey: "" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Quy trình mặc định theo sản phẩm</div>
        <button className="btn btn--ghost btn--sm" onClick={fetch_}>↻ Làm mới</button>
      </div>

      {error && <ErrorBanner msg={error} onRetry={fetch_} />}

      <div className="info-banner info-banner--blue" style={{ marginBottom: 14 }}>
        Cấu hình quy trình BPMN sẽ tự động được áp dụng khi tạo cơ hội mới cho từng loại sản phẩm.
      </div>

      <div className="card">
        {loading ? [...Array(5)].map((_,i) => (
          <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
            <Skeleton h={36} w="36px" /><div style={{ flex: 1 }}><Skeleton /><Skeleton w="60%" /></div>
          </div>
        )) : DEFAULT_PRODUCTS.map(prod => {
          const current = items.find((it: any) => it.productType === prod.type);
          return (
            <div key={prod.type} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{prod.label.split(" ")[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{prod.label.slice(2)}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Product type: {prod.type}</div>
              </div>
              <select
                className="form-select"
                style={{ width: 240, fontSize: 12 }}
                defaultValue={current?.processKey || prod.processKey}
                onChange={e => handleSave(prod.type, e.target.value)}
              >
                <option value="">-- Chưa cấu hình --</option>
                {PROCESSES.map(p => <option key={p.id} value={p.processKey}>{p.label} ({p.processKey})</option>)}
              </select>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: (current?.processKey || prod.processKey) ? "var(--success-soft)" : "var(--warning-soft)", color: (current?.processKey || prod.processKey) ? "var(--success)" : "var(--warning)", flexShrink: 0, fontWeight: 600 }}>
                {(current?.processKey || prod.processKey) ? "✓ Đã gán" : "Chưa gán"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 4. COMPONENTS (thành phần dùng chung)
// ═══════════════════════════════════════════════════════════════════════
function ComponentsPage() {
  const { showToast } = useApp();
  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiGet("/adminapi/bpmComponent/list", { page: 1, limit: 30 });
      if (res?.code === 0 || res?.result) setItems(res.result?.items || res.result || []);
      else setError(res?.message || "Không tải được");
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSave = async (name: string, type: string, desc: string) => {
    try {
      await apiPost("/adminapi/bpmComponent/update", { name, type, description: desc });
      showToast("Đã lưu thành phần!", "success"); fetch_();
    } catch (e: any) { showToast("Lỗi: " + e.message, "error"); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa thành phần này?")) return;
    try { await apiDelete("/adminapi/bpmComponent/delete", { id }); showToast("Đã xóa!", "success"); fetch_(); }
    catch (e: any) { showToast("Lỗi: " + e.message, "error"); }
  };

  const MOCK_COMPONENTS = [
    { id: 1, name: "Gửi SMS thông báo KH", type: "notification", icon: "📱", desc: "Tự động gửi SMS khi chuyển giai đoạn" },
    { id: 2, name: "Auto Credit Scoring",   type: "service",      icon: "🤖", desc: "Tự động chấm điểm tín dụng qua T24" },
    { id: 3, name: "Gửi Email đề xuất",    type: "notification", icon: "📧", desc: "Gửi email tóm tắt đề xuất cho RM" },
    { id: 4, name: "Kiểm tra điều kiện vay", type: "condition",  icon: "🔍", desc: "Xác minh điều kiện theo policy ngân hàng" },
    { id: 5, name: "Kích hoạt thẻ",        type: "service",      icon: "💳", desc: "Kết nối Core Banking để kích hoạt thẻ" },
  ];

  const displayed = (items.length > 0 ? items : MOCK_COMPONENTS).filter((it: any) =>
    !keyword || (it.name || "").toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Thành phần dùng chung ({displayed.length})</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="form-input" style={{ width: 200 }} placeholder="Tìm thành phần…" value={keyword} onChange={e => setKeyword(e.target.value)} />
          <button className="btn btn--primary btn--sm" onClick={() => handleSave("Thành phần mới", "service", "Mô tả…")}>+ Thêm</button>
        </div>
      </div>
      {error && <ErrorBanner msg={error} onRetry={fetch_} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {loading ? [...Array(4)].map((_,i) => (
          <div key={i} className="card" style={{ padding: 16 }}><Skeleton /><Skeleton w="70%" /></div>
        )) : displayed.map((item: any) => (
          <div key={item.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon || "🧩"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent-bright)", fontWeight: 600 }}>{item.type}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>{item.desc || item.description}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-icon-sm" onClick={() => showToast("Sửa thành phần", "info")}>Sửa</button>
              <button className="btn-icon-sm" style={{ color: "var(--danger)" }} onClick={() => handleDelete(item.id)}>Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 5. FORMS (biểu mẫu)
// ═══════════════════════════════════════════════════════════════════════
function FormsPage() {
  const { showToast } = useApp();
  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiGet("/bpmapi/bpmFormPopup/list", { page: 1, limit: 20 });
      if (res?.code === 0 || res?.result) setItems(res.result?.items || res.result || []);
      else setError(res?.message || "Không tải được");
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa biểu mẫu này?")) return;
    try { await apiDelete("/bpmapi/bpmFormPopup/delete", { id }); showToast("Đã xóa!", "success"); fetch_(); }
    catch (e: any) { showToast("Lỗi: " + e.message, "error"); }
  };

  const MOCK_FORMS = [
    { id: 1, name: "Form lập hồ sơ vay mua nhà",   fields: 18, step: "Lập hồ sơ", product: "Vay TS" },
    { id: 2, name: "Form đề xuất lãi suất ưu đãi", fields: 8,  step: "Phê duyệt", product: "Vay TS" },
    { id: 3, name: "Form mở thẻ tín dụng",         fields: 12, step: "Tiếp cận",  product: "Thẻ TD" },
    { id: 4, name: "Form thẩm định tín dụng",      fields: 24, step: "Thẩm định", product: "Vay TS" },
    { id: 5, name: "Form khách hàng Bancassurance", fields: 10, step: "Tư vấn",   product: "Banca" },
  ];

  const displayed = items.length > 0 ? items : MOCK_FORMS;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Danh mục biểu mẫu ({displayed.length})</div>
        <button className="btn btn--primary btn--sm" onClick={() => showToast("Tạo biểu mẫu mới (Form Builder)", "info")}>+ Tạo biểu mẫu</button>
      </div>
      {error && <ErrorBanner msg={error} onRetry={fetch_} />}
      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          {loading ? [...Array(4)].map((_,i) => (
            <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}><Skeleton /><Skeleton w="60%" /></div>
          )) : displayed.map((item: any) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--success-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📋</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent-bright)" }}>{item.product}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "var(--surface)", color: "var(--text-secondary)" }}>Bước: {item.step}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.fields} trường</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-icon-sm" onClick={() => showToast("Mở Form Builder", "info")}>Sửa</button>
                <button className="btn-icon-sm" onClick={() => showToast("Xem trước form", "info")}>Preview</button>
                <button className="btn-icon-sm" style={{ color: "var(--danger)" }} onClick={() => handleDelete(item.id)}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 6. OBJECTS (đối tượng quy trình)
// ═══════════════════════════════════════════════════════════════════════
function ObjectsPage() {
  const { showToast } = useApp();
  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet("/bpmapi/objectGroup/list", { page: 1, limit: 20 });
      if (res?.code === 0 || res?.result) setItems(res.result?.items || res.result || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const MOCK_OBJECTS = [
    { id: 1, name: "Khách hàng cá nhân",    code: "INDIVIDUAL_CUSTOMER",  icon: "👤", fields: 12, status: "active" },
    { id: 2, name: "Khách hàng doanh nghiệp", code: "CORPORATE_CUSTOMER", icon: "🏢", fields: 18, status: "active" },
    { id: 3, name: "Hợp đồng vay",          code: "LOAN_CONTRACT",        icon: "📄", fields: 24, status: "active" },
    { id: 4, name: "Đề xuất phê duyệt",     code: "APPROVAL_REQUEST",     icon: "✅", fields: 10, status: "active" },
    { id: 5, name: "Cơ hội bán hàng",       code: "OPPORTUNITY",          icon: "💼", fields: 14, status: "active" },
    { id: 6, name: "Bảo hiểm nhân thọ",     code: "LIFE_INSURANCE",       icon: "🛡", fields: 16, status: "draft" },
  ];

  const displayed = items.length > 0 ? items : MOCK_OBJECTS;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Đối tượng quy trình ({displayed.length})</div>
        <button className="btn btn--primary btn--sm" onClick={() => showToast("Tạo loại đối tượng mới", "info")}>+ Thêm đối tượng</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {loading ? [...Array(4)].map((_,i) => (
          <div key={i} className="card" style={{ padding: 16 }}><Skeleton /><Skeleton w="70%" /></div>
        )) : displayed.map((item: any) => (
          <div key={item.id} className="card" style={{ padding: 16, cursor: "pointer" }} onClick={() => showToast(`Xem fields của ${item.name}`, "info")}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon || "📦"}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                <code style={{ fontSize: 10, color: "var(--text-muted)" }}>{item.code}</code>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.fields} thuộc tính</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: item.status === "active" ? "var(--success-soft)" : "var(--warning-soft)", color: item.status === "active" ? "var(--success)" : "var(--warning)", fontWeight: 600 }}>
                {item.status === "active" ? "Active" : "Draft"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN SalesProcess PAGE (sub-menu navigation)
// ═══════════════════════════════════════════════════════════════════════
export default function SalesProcess() {
  const { openModal } = useApp();
  const [subMenu, setSubMenu] = useState<SubMenu | null>(null);

  const handleBack = () => setSubMenu(null);

  // Sub-menu header (visible when inside a sub-page)
  const SubPageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="page-header" style={{ marginBottom: 20 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 4 }} onClick={handleBack}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "currentColor", fill: "none", strokeWidth: 2 }}><polyline points="15 18 9 12 15 6"/></svg>
            Quy trình bán
          </button>
          <span style={{ color: "var(--border-hover)" }}>/</span>
          <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{title}</span>
        </div>
        <div className="page-title">{title}</div>
        <div className="page-subtitle">{subtitle}</div>
      </div>
      <div className="page-header__actions">
        <button className="btn btn--ghost" onClick={() => openModal("modal-bpmn-import")}>
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import XML
        </button>
        <button className="btn btn--ghost" onClick={() => openModal("modal-bpmn-deploy")}>
          <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Deploy BPM Engine
        </button>
        <button className="btn btn--primary" onClick={() => openModal("modal-bpmn-new")}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tạo quy trình mới
        </button>
      </div>
    </div>
  );

  // ── Render sub pages ──────────────────────────────────────────────
  if (subMenu === "bpmn") return (
    <div>
      <SubPageHeader title="BPMN Designer" subtitle="Admin · Thiết kế & Quản lý quy trình bán theo chuẩn BPMN 2.0" />
      <BpmnDesigner />
    </div>
  );
  if (subMenu === "approval_flow") return (
    <div>
      <SubPageHeader title="Quy trình phê duyệt" subtitle="Cấu hình luồng phê duyệt hồ sơ theo cấp" />
      <ApprovalFlowPage />
    </div>
  );
  if (subMenu === "default_process") return (
    <div>
      <SubPageHeader title="Quy trình mặc định" subtitle="Gán quy trình BPMN mặc định cho từng loại sản phẩm" />
      <DefaultProcessPage />
    </div>
  );
  if (subMenu === "components") return (
    <div>
      <SubPageHeader title="Thành phần dùng chung" subtitle="Quản lý module, thành phần tái sử dụng trong quy trình" />
      <ComponentsPage />
    </div>
  );
  if (subMenu === "forms") return (
    <div>
      <SubPageHeader title="Danh mục biểu mẫu" subtitle="Form nhập liệu trong từng bước quy trình" />
      <FormsPage />
    </div>
  );
  if (subMenu === "objects") return (
    <div>
      <SubPageHeader title="Đối tượng quy trình" subtitle="Phân loại đối tượng xử lý: KH, hợp đồng, đề xuất…" />
      <ObjectsPage />
    </div>
  );

  // ── Landing: Sub-menu grid ────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Quy trình bán <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 10, background: "rgba(156,39,176,0.15)", color: "var(--purple)", fontWeight: 600, marginLeft: 8 }}>Admin</span></div>
          <div className="page-subtitle">Thiết kế & Quản lý toàn bộ quy trình bán hàng Banking theo chuẩn BPMN 2.0</div>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setSubMenu("bpmn")}>
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Mở BPMN Designer
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="metric-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 24 }}>
        {[
          { color: "blue",   value: "4",  label: "Quy trình BPMN",    sub: "2 deployed · 2 draft" },
          { color: "green",  value: "2",  label: "Đang chạy (Live)",  sub: "Home Loan + Credit Card" },
          { color: "gold",   value: "12", label: "Biểu mẫu",          sub: "Cho 4 sản phẩm" },
          { color: "purple", value: "5",  label: "Thành phần chung",  sub: "Services & Notifications" },
        ].map(m => (
          <div key={m.label} className={`metric-card metric-card--${m.color}`}>
            <div className="metric-card__top"><div className={`metric-card__icon metric-card__icon--${m.color}`}><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div></div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Sub-menu grid (giống retail TabMenuList) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {SUB_MENUS.map(m => (
          <div
            key={m.key}
            className="card"
            style={{ padding: 20, cursor: "pointer", transition: "all 0.15s", borderColor: "transparent" }}
            onClick={() => setSubMenu(m.key)}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-soft)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 12, color: "var(--accent-bright)", display: "flex", alignItems: "center", gap: 4 }}>
                Mở <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, stroke: "currentColor", fill: "none", strokeWidth: 2.5 }}><polyline points="9 18 15 12 9 6"/></svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
