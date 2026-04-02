import React, { useState, useCallback } from "react";
import Modal from "components/modal/Modal";
import { useApp } from "contexts/AppContext";
import LeadService from "services/LeadService";
import PipelineService from "services/PipelineService";
import {
  ApprovalService, TaskService, CampaignService,
  NpsService, BpmService, NotificationService, EmployeeService,
} from "services/index";

// ── Generic helpers ────────────────────────────────────────────────────
function FormGroup({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`form-group${full ? " form-group--full" : ""}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

/** Spinner button that shows loading state */
function SubmitBtn({ loading, label, onClick, variant = "primary" }: { loading: boolean; label: string; onClick: () => void; variant?: string }) {
  return (
    <button
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={loading}
      style={{ opacity: loading ? 0.7 : 1, minWidth: 110 }}
    >
      {loading ? "Đang xử lý…" : label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NEW LEAD
// ═══════════════════════════════════════════════════════════════════════
export function ModalNewLead({ onCreated }: { onCreated?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "individual", product: "vay", name: "", phone: "", email: "",
    address: "", value: "", sourceId: "", rmId: "", deadline: "", note: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (draft = false) => {
    if (!form.name.trim() || !form.phone.trim()) {
      showToast("Vui lòng điền Họ tên và Số điện thoại", "warning"); return;
    }
    setSaving(true);
    try {
      await LeadService.save({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email || undefined,
        address: form.address || undefined,
        estimatedValue: form.value ? parseFloat(form.value) * 1_000_000_000 : undefined,
        customerSourceId: form.sourceId ? +form.sourceId : undefined,
        employeeId: form.rmId ? +form.rmId : undefined,
        note: form.note || undefined,
        productType: form.product,
        deadline: form.deadline || undefined,
      });
      showToast(draft ? "Đã lưu bản nháp" : "Đã tạo Lead mới thành công!", "success");
      onCreated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-new-lead" title="Tạo Lead mới" size="lg"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <button className="btn btn--ghost" onClick={() => handleSubmit(true)} disabled={saving}>Lưu nháp</button>
        <SubmitBtn loading={saving} label="Tạo Lead" onClick={() => handleSubmit(false)} />
      </>}>
      <div className="form-grid">
        <FormGroup label="Loại khách hàng *">
          <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="individual">Cá nhân</option>
            <option value="sme">Doanh nghiệp (SME)</option>
            <option value="corporate">Doanh nghiệp (Corporate)</option>
          </select>
        </FormGroup>
        <FormGroup label="Sản phẩm quan tâm *">
          <select className="form-select" value={form.product} onChange={e => set("product", e.target.value)}>
            <option value="vay">Vay tài sản (Mua nhà/xe)</option>
            <option value="sme">Vay doanh nghiệp</option>
            <option value="the">Thẻ tín dụng</option>
            <option value="tk">Tiết kiệm/Tiền gửi</option>
            <option value="banca">Bancassurance</option>
          </select>
        </FormGroup>
        <FormGroup label="Họ và tên *">
          <input className="form-input" placeholder="Nguyễn Văn A / Tên công ty…" value={form.name} onChange={e => set("name", e.target.value)} />
        </FormGroup>
        <FormGroup label="Số điện thoại *">
          <input className="form-input" placeholder="0912 345 678" value={form.phone} onChange={e => set("phone", e.target.value)} />
        </FormGroup>
        <FormGroup label="Email">
          <input className="form-input" type="email" placeholder="email@company.com" value={form.email} onChange={e => set("email", e.target.value)} />
        </FormGroup>
        <FormGroup label="Địa chỉ">
          <input className="form-input" placeholder="Quận, Thành phố…" value={form.address} onChange={e => set("address", e.target.value)} />
        </FormGroup>
        <FormGroup label="Giá trị ước tính (tỷ VNĐ)">
          <input className="form-input" type="number" step="0.1" placeholder="1.2" value={form.value} onChange={e => set("value", e.target.value)} />
        </FormGroup>
        <FormGroup label="Nguồn Lead *">
          <select className="form-select" value={form.sourceId} onChange={e => set("sourceId", e.target.value)}>
            <option value="">Chọn nguồn…</option>
            <option value="1">Web / Landing Page</option>
            <option value="2">Mobile App</option>
            <option value="3">Referral (giới thiệu)</option>
            <option value="4">Telesale outbound</option>
            <option value="5">Chi nhánh trực tiếp</option>
            <option value="6">Partner / Đối tác</option>
          </select>
        </FormGroup>
        <FormGroup label="RM phụ trách">
          <select className="form-select" value={form.rmId} onChange={e => set("rmId", e.target.value)}>
            <option value="">Tự động phân công</option>
            <option value="1">Nguyễn Hà Thu</option>
            <option value="2">Trần Nguyên</option>
            <option value="3">Vũ Ngọc Anh</option>
            <option value="4">Lê Minh Quân</option>
          </select>
        </FormGroup>
        <FormGroup label="Hạn follow-up">
          <input className="form-input" type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} />
        </FormGroup>
        <FormGroup label="Ghi chú" full>
          <textarea className="form-input" rows={3} placeholder="Nhu cầu cụ thể, thông tin thêm…" value={form.note} onChange={e => set("note", e.target.value)} />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IMPORT LEAD
// ═══════════════════════════════════════════════════════════════════════
export function ModalImportLead({ onDone }: { onDone?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [rmId,   setRmId]   = useState("");
  const [campId, setCampId] = useState("");

  const handleImport = async () => {
    setSaving(true);
    try {
      await LeadService.import({ importType: "excel", fileName: "leads_import.xlsx" });
      showToast("Import thành công! Đang xử lý dữ liệu…", "success");
      onDone?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi import: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-import-lead" title="Import Lead từ file" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Import" onClick={handleImport} />
      </>}>
      <div className="upload-zone" onClick={() => showToast("Chọn file Excel/CSV", "info")}>
        <div className="icon">📁</div>
        <div className="title">Kéo thả file vào đây hoặc click để chọn</div>
        <div className="hint">Excel (.xlsx) hoặc CSV · Tối đa 5,000 dòng · 10MB</div>
      </div>
      <div className="info-banner info-banner--blue" style={{ marginBottom: 12 }}>
        Tải <strong style={{ cursor: "pointer" }}>template mẫu</strong> để đảm bảo đúng định dạng cột.
      </div>
      <div className="form-grid">
        <FormGroup label="RM mặc định">
          <select className="form-select" value={rmId} onChange={e => setRmId(e.target.value)}>
            <option value="">Tự động phân công</option>
            <option value="1">Nguyễn Hà Thu</option>
            <option value="2">Trần Nguyên</option>
            <option value="3">Vũ Ngọc Anh</option>
          </select>
        </FormGroup>
        <FormGroup label="Gắn với chiến dịch">
          <select className="form-select" value={campId} onChange={e => setCampId(e.target.value)}>
            <option value="">Không gắn</option>
            <option value="1">Vay Mua Nhà Q1/2025</option>
            <option value="2">Mở Thẻ TD – Hoàn Tiền</option>
          </select>
        </FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NEW OPPORTUNITY (Deal)
// ═══════════════════════════════════════════════════════════════════════
export function ModalNewOpportunity({ onCreated }: { onCreated?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerId: "", product: "vay", stageId: "1", value: "",
    probability: "60", rmId: "", closeDate: "", campaignId: "", note: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.customerId.trim()) { showToast("Vui lòng nhập tên khách hàng", "warning"); return; }
    setSaving(true);
    try {
      await PipelineService.save({
        customerId: +form.customerId || 0,
        productType: form.product,
        saleStatusId: +form.stageId,
        estimatedValue: form.value ? parseFloat(form.value) * 1_000_000_000 : undefined,
        probability: form.probability ? +form.probability : undefined,
        employeeId: form.rmId ? +form.rmId : undefined,
        expectedCloseDate: form.closeDate || undefined,
        campaignId: form.campaignId ? +form.campaignId : undefined,
        note: form.note || undefined,
      });
      showToast("Đã tạo cơ hội mới trong Pipeline!", "success");
      onCreated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-new-opportunity" title="Tạo Cơ hội mới" size="lg"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Tạo cơ hội" onClick={handleSubmit} />
      </>}>
      <div className="form-grid">
        <FormGroup label="Khách hàng *" full>
          <input className="form-input" placeholder="Tên KH hoặc ID khách hàng…" value={form.customerId} onChange={e => set("customerId", e.target.value)} />
        </FormGroup>
        <FormGroup label="Sản phẩm *">
          <select className="form-select" value={form.product} onChange={e => set("product", e.target.value)}>
            <option value="vay">Vay mua nhà</option><option value="auto">Vay xe ô tô</option>
            <option value="sme">Vay doanh nghiệp</option><option value="the">Thẻ tín dụng</option>
            <option value="tk">Tiết kiệm</option><option value="banca">Bancassurance</option>
          </select>
        </FormGroup>
        <FormGroup label="Giai đoạn">
          <select className="form-select" value={form.stageId} onChange={e => set("stageId", e.target.value)}>
            <option value="1">Tiếp cận</option><option value="2">Tư vấn</option>
            <option value="3">Lập hồ sơ / Đề xuất</option><option value="4">Thẩm định & Duyệt</option>
            <option value="5">Chốt deal / Ký HĐ</option>
          </select>
        </FormGroup>
        <FormGroup label="Giá trị ước tính (tỷ VNĐ) *">
          <input className="form-input" type="number" step="0.1" placeholder="1.2" value={form.value} onChange={e => set("value", e.target.value)} />
        </FormGroup>
        <FormGroup label="Xác suất chốt (%)">
          <input className="form-input" type="number" min={0} max={100} placeholder="60" value={form.probability} onChange={e => set("probability", e.target.value)} />
        </FormGroup>
        <FormGroup label="RM phụ trách">
          <select className="form-select" value={form.rmId} onChange={e => set("rmId", e.target.value)}>
            <option value="">Mặc định (tôi)</option>
            <option value="1">Nguyễn Hà Thu</option><option value="2">Trần Nguyên</option>
            <option value="3">Vũ Ngọc Anh</option><option value="4">Lê Minh Quân</option>
          </select>
        </FormGroup>
        <FormGroup label="Ngày dự kiến chốt">
          <input className="form-input" type="date" value={form.closeDate} onChange={e => set("closeDate", e.target.value)} />
        </FormGroup>
        <FormGroup label="Chiến dịch liên quan">
          <select className="form-select" value={form.campaignId} onChange={e => set("campaignId", e.target.value)}>
            <option value="">Không</option>
            <option value="1">Vay Mua Nhà Q1/2025</option>
            <option value="2">Mở Thẻ TD – Hoàn Tiền</option>
          </select>
        </FormGroup>
        <FormGroup label="Ghi chú" full>
          <textarea className="form-input" rows={3} placeholder="Thông tin bổ sung…" value={form.note} onChange={e => set("note", e.target.value)} />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DEAL DETAIL / STAGE CHANGE
// ═══════════════════════════════════════════════════════════════════════
export function ModalDealDetail({ dealId, onUpdated }: { dealId?: number; onUpdated?: () => void }) {
  const { showToast, closeModal, openModal } = useApp();
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  const steps = ["Tiếp cận", "Tư vấn", "Hồ sơ", "Thẩm định", "Chốt HĐ"];
  const currentStep = 2; // would come from deal data

  const handleNextStage = async () => {
    if (!dealId) { showToast("Chưa có deal ID", "warning"); return; }
    setSaving(true);
    try {
      await PipelineService.changeStage({ id: dealId, saleStatusId: currentStep + 1, note });
      showToast("Đã chuyển sang bước tiếp theo", "success");
      onUpdated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-deal-detail" title="Chi tiết Cơ hội" size="xl"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
        <button className="btn btn--ghost" onClick={() => openModal("modal-new-approval")}>Tạo đề xuất</button>
        <SubmitBtn loading={saving} label="Chuyển bước →" onClick={handleNextStage} />
      </>}>
      {/* Workflow step tracker */}
      <div className="workflow-steps">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="workflow-step">
              <div className={`ws-circle${i < currentStep ? " ws-circle--done" : i === currentStep ? " ws-circle--active" : ""}`}>
                {i < currentStep ? "✓" : i + 1}
              </div>
              <div className="ws-label">{s}</div>
            </div>
            {i < steps.length - 1 && <div className={`ws-line${i < currentStep ? " ws-line--done" : i === currentStep ? " ws-line--active" : ""}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="modal-tabs">
        {["info","docs","tasks","history"].map(t => (
          <button key={t} className={`modal-tab${activeTab === t ? " modal-tab--active" : ""}`} onClick={() => setActiveTab(t)}>
            {t === "info" ? "Thông tin" : t === "docs" ? "Hồ sơ & Tài liệu" : t === "tasks" ? "Tasks" : "Lịch sử"}
          </button>
        ))}
      </div>
      {activeTab === "info" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Khách hàng","TNHH Đức Thành"],["Sản phẩm","Vay doanh nghiệp"],["Giá trị","12.5 tỷ đồng"],["Xác suất chốt","75%"],["RM phụ trách","Lê Minh Quân"],["Hạn chốt","31/03/2025"]].map(([l,v]) => (
              <div key={l} className="surface-box"><div className="fs-11 text-secondary">{l}</div><div className="fw-600 fs-12" style={{ marginTop: 3 }}>{v}</div></div>
            ))}
          </div>
          <FormGroup label="Ghi chú khi chuyển bước">
            <textarea className="form-input" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú về tiến độ, kết quả tư vấn…" />
          </FormGroup>
        </div>
      )}
      {activeTab === "docs" && (
        <div>
          {[["Đăng ký kinh doanh","done","DKKD_DucThanh.pdf"],["BCTC 3 năm gần nhất","done","BCTC_2022_2024.xlsx"],["Phương án kinh doanh","pending",null],["Tài sản đảm bảo","done","TaiSanDB.pdf"],["Hợp đồng thế chấp (dự thảo)","pending",null]].map(([name, status, file]) => (
            <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--surface)", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: status === "done" ? "var(--success)" : "var(--warning)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
                {file && <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{file}</div>}
              </div>
              {status === "done"
                ? <button className="btn-icon-sm" onClick={() => showToast("Đang tải tài liệu…", "info")}>Tải</button>
                : <button className="btn-icon-sm" onClick={() => showToast("Chọn file để upload", "info")}>Upload</button>}
            </div>
          ))}
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 4 }} onClick={() => showToast("Chọn tài liệu từ thư viện", "info")}>+ Thêm tài liệu</button>
        </div>
      )}
      {activeTab === "tasks" && (
        <div>
          {["Gọi xác nhận thông tin BCTC", "Lên lịch họp Credit Team", "Hoàn thiện dự thảo HĐ thế chấp"].map((t, i) => (
            <div key={i} className="deal-task-item" onClick={e => (e.currentTarget as HTMLElement).classList.toggle("deal-task-item--done")}>
              <div className="dtask-cb" />
              <span>{t}</span>
            </div>
          ))}
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={() => openModal("modal-new-task")}>+ Thêm task</button>
        </div>
      )}
      {activeTab === "history" && (
        <div className="activity-list">
          {[["deal","Tạo cơ hội từ Lead LD005","15/03 08:45"],["call","Gọi điện xác nhận nhu cầu KH","16/03 10:00"],["meet","Họp tư vấn tại văn phòng KH","18/03 14:00"],["syst","Upload BCTC vào hồ sơ","19/03 09:30"]].map(([dot,text,time]) => (
            <div key={text as string} className="activity-item">
              <div className={`dot dot--${dot}`} /><div className="text">{text as string}</div><div className="time">{time as string}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NEW APPROVAL
// ═══════════════════════════════════════════════════════════════════════
export function ModalNewApproval({ onCreated }: { onCreated?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerId: "", type: "interest_rate", value: "", product: "vay",
    level: "1", deadline: "", reason: "", attachments: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.customerId.trim() || !form.reason.trim()) {
      showToast("Vui lòng điền Khách hàng và Lý do đề xuất", "warning"); return;
    }
    setSaving(true);
    try {
      await ApprovalService.create({
        customerId: +form.customerId || 0,
        type: form.type,
        value: form.value || undefined,
        productType: form.product,
        approvalLevel: +form.level,
        deadline: form.deadline || undefined,
        reason: form.reason,
        attachments: form.attachments || undefined,
      });
      showToast("Đề xuất đã được gửi lên cấp duyệt!", "success");
      onCreated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-new-approval" title="Tạo Đề xuất Phê duyệt" size="lg"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Gửi đề xuất" onClick={handleSubmit} />
      </>}>
      <div className="form-grid">
        <FormGroup label="Khách hàng *" full>
          <input className="form-input" placeholder="Tên KH / Doanh nghiệp hoặc ID…" value={form.customerId} onChange={e => set("customerId", e.target.value)} />
        </FormGroup>
        <FormGroup label="Loại đề xuất *">
          <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="interest_rate">Lãi suất ưu đãi</option>
            <option value="credit_limit">Hạn mức tín dụng đặc biệt</option>
            <option value="extension">Gia hạn khoản vay</option>
            <option value="restructure">Cơ cấu nợ</option>
            <option value="fee_waiver">Miễn/giảm phí sản phẩm</option>
            <option value="expedited">Phê duyệt nhanh (Expedited)</option>
          </select>
        </FormGroup>
        <FormGroup label="Giá trị đề xuất">
          <input className="form-input" placeholder="VD: 12.500.000.000 / 7.5%" value={form.value} onChange={e => set("value", e.target.value)} />
        </FormGroup>
        <FormGroup label="Sản phẩm liên quan">
          <select className="form-select" value={form.product} onChange={e => set("product", e.target.value)}>
            <option value="vay">Vay tài sản</option><option value="sme">Vay doanh nghiệp</option>
            <option value="the">Thẻ tín dụng</option><option value="tk">Tiết kiệm</option>
            <option value="banca">Bancassurance</option>
          </select>
        </FormGroup>
        <FormGroup label="Cấp phê duyệt yêu cầu">
          <select className="form-select" value={form.level} onChange={e => set("level", e.target.value)}>
            <option value="1">Cấp 1 – Branch Manager</option>
            <option value="2">Cấp 2 – Credit Team</option>
            <option value="3">Cấp 3 – Regional Director</option>
          </select>
        </FormGroup>
        <FormGroup label="Hạn xử lý">
          <input className="form-input" type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} />
        </FormGroup>
        <FormGroup label="Lý do đề xuất *" full>
          <textarea className="form-input" rows={4} placeholder="Nêu rõ lý do, cơ sở và lợi ích…" value={form.reason} onChange={e => set("reason", e.target.value)} />
        </FormGroup>
        <FormGroup label="Tài liệu đính kèm" full>
          <input className="form-input" placeholder="Tên file hoặc link tài liệu…" value={form.attachments} onChange={e => set("attachments", e.target.value)} />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APPROVAL DETAIL (phê duyệt / từ chối)
// ═══════════════════════════════════════════════════════════════════════
export function ModalApprovalDetail({ approvalId, onUpdated }: { approvalId?: number; onUpdated?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving,  setSaving]  = useState(false);
  const [note,    setNote]    = useState("");
  const [action,  setAction]  = useState<"approved" | "rejected" | null>(null);

  const handleAction = async (status: "approved" | "rejected") => {
    setAction(status);
    setSaving(true);
    try {
      await ApprovalService.updateStatus({ id: approvalId || 0, status, note: note || undefined });
      showToast(`Đã ${status === "approved" ? "phê duyệt" : "từ chối"} thành công`, status === "approved" ? "success" : "error");
      onUpdated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); setAction(null); }
  };

  return (
    <Modal id="modal-approval-detail" title="Chi tiết Đề xuất #PD-2851" size="lg"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
        <button className="btn btn--danger" onClick={() => handleAction("rejected")} disabled={saving} style={{ opacity: saving && action === "rejected" ? 0.7 : 1 }}>
          {saving && action === "rejected" ? "Đang xử lý…" : "Từ chối"}
        </button>
        <button className="btn btn--primary" onClick={() => handleAction("approved")} disabled={saving} style={{ opacity: saving && action === "approved" ? 0.7 : 1 }}>
          {saving && action === "approved" ? "Đang xử lý…" : "Phê duyệt ✓"}
        </button>
      </>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[["Khách hàng","TNHH Đức Thành"],["Loại đề xuất","Lãi suất ưu đãi 7.5%"],["Giá trị","12.5 tỷ đồng"],["Hạn xử lý","22/03/2025"],["RM đề xuất","Lê Minh Quân"],["Ngày gửi","19/03/2025"]].map(([l,v]) => (
          <div key={l} className="surface-box">
            <div className="fs-11 text-secondary">{l}</div>
            <div className="fw-600 fs-12" style={{ marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <div className="form-label" style={{ marginBottom: 6 }}>Lý do đề xuất</div>
        <div className="surface-box" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          KH là đối tác lâu năm, doanh thu ổn định 50+ tỷ/năm. Đề nghị lãi suất ưu đãi 7.5% để giữ chân KH trong bối cảnh cạnh tranh với MB Bank và Techcombank.
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div className="form-label" style={{ marginBottom: 8 }}>Tiến trình phê duyệt</div>
        {[["✓","RM – Gửi đề xuất","19/03 08:45","done"],["!","Branch Manager – Đang chờ","Chờ từ 19/03 09:00","active"],["—","Credit Team – Chờ","Chưa tới lượt","pending"]].map(([icon,label,time,type]) => (
          <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: type === "done" ? "var(--success-soft)" : type === "active" ? "var(--warning-soft)" : "var(--surface)", borderRadius: 8, borderLeft: `3px solid ${type === "done" ? "var(--success)" : type === "active" ? "var(--warning)" : "var(--border)"}`, marginBottom: 8, opacity: type === "pending" ? 0.5 : 1 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: type === "done" ? "var(--success)" : type === "active" ? "var(--warning)" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: type === "pending" ? "var(--text-muted)" : "white" }}>{icon}</div>
            <div><div style={{ fontSize: 12, fontWeight: 500 }}>{label as string}</div><div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{time as string}</div></div>
          </div>
        ))}
      </div>
      <FormGroup label="Ghi chú khi duyệt / từ chối">
        <textarea className="form-input" rows={2} placeholder="Nhập ghi chú (không bắt buộc)…" value={note} onChange={e => setNote(e.target.value)} />
      </FormGroup>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NEW TASK
// ═══════════════════════════════════════════════════════════════════════
export function ModalNewTask({ onCreated }: { onCreated?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "call", priority: "high", customerId: "",
    opportunityId: "", assigneeId: "", dueDate: "", dueTime: "09:00", note: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { showToast("Vui lòng nhập tiêu đề task", "warning"); return; }
    setSaving(true);
    try {
      await TaskService.save({
        title: form.title,
        type: form.type,
        priority: form.priority,
        customerId: form.customerId ? +form.customerId : undefined,
        opportunityId: form.opportunityId ? +form.opportunityId : undefined,
        assigneeId: form.assigneeId ? +form.assigneeId : undefined,
        dueDate: form.dueDate || undefined,
        dueTime: form.dueTime || undefined,
        note: form.note || undefined,
      });
      showToast("Task đã được tạo thành công!", "success");
      onCreated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-new-task" title="Tạo Task / Lịch hẹn" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Tạo Task" onClick={handleSubmit} />
      </>}>
      <div className="form-grid">
        <FormGroup label="Tiêu đề task *" full>
          <input className="form-input" placeholder="Gọi điện / Họp / Gửi tài liệu…" value={form.title} onChange={e => set("title", e.target.value)} />
        </FormGroup>
        <FormGroup label="Loại hoạt động">
          <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="call">Gọi điện</option><option value="meet">Gặp mặt trực tiếp</option>
            <option value="email">Gửi email</option><option value="sms">Gửi SMS</option>
            <option value="video">Video call</option><option value="internal">Họp nội bộ</option>
          </select>
        </FormGroup>
        <FormGroup label="Độ ưu tiên">
          <select className="form-select" value={form.priority} onChange={e => set("priority", e.target.value)}>
            <option value="high">Cao</option><option value="medium">Trung bình</option><option value="low">Thấp</option>
          </select>
        </FormGroup>
        <FormGroup label="KH liên quan">
          <input className="form-input" placeholder="Tên KH hoặc ID…" value={form.customerId} onChange={e => set("customerId", e.target.value)} />
        </FormGroup>
        <FormGroup label="Cơ hội liên quan">
          <input className="form-input" placeholder="ID cơ hội…" value={form.opportunityId} onChange={e => set("opportunityId", e.target.value)} />
        </FormGroup>
        <FormGroup label="Ngày thực hiện *">
          <input className="form-input" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
        </FormGroup>
        <FormGroup label="Giờ">
          <input className="form-input" type="time" value={form.dueTime} onChange={e => set("dueTime", e.target.value)} />
        </FormGroup>
        <FormGroup label="Người thực hiện">
          <select className="form-select" value={form.assigneeId} onChange={e => set("assigneeId", e.target.value)}>
            <option value="">Tôi (mặc định)</option>
            <option value="1">Nguyễn Hà Thu</option><option value="2">Trần Nguyên</option>
            <option value="3">Vũ Ngọc Anh</option><option value="4">Lê Minh Quân</option>
          </select>
        </FormGroup>
        <FormGroup label="Ghi chú" full>
          <textarea className="form-input" rows={3} placeholder="Nội dung, tài liệu cần chuẩn bị…" value={form.note} onChange={e => set("note", e.target.value)} />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NEW CAMPAIGN
// ═══════════════════════════════════════════════════════════════════════
export function ModalNewCampaign({ onCreated }: { onCreated?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", product: "vay", processKey: "", startDate: "", endDate: "",
    targetRevenue: "", targetCustomers: "", scope: "all", budget: "", description: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (activate = true) => {
    if (!form.name.trim()) { showToast("Vui lòng nhập tên chiến dịch", "warning"); return; }
    setSaving(true);
    try {
      const res = await CampaignService.save({
        name: form.name,
        productType: form.product,
        processKey: form.processKey || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        targetRevenue: form.targetRevenue ? parseFloat(form.targetRevenue) * 1_000_000_000 : undefined,
        targetCustomers: form.targetCustomers ? +form.targetCustomers : undefined,
        scope: form.scope,
        budget: form.budget ? parseFloat(form.budget) * 1_000_000 : undefined,
        description: form.description || undefined,
      });
      if (activate && res?.result?.id) {
        await CampaignService.updateStatus({ id: res.result.id, status: "active" });
      }
      showToast(activate ? "Chiến dịch đã được tạo & kích hoạt!" : "Đã lưu bản nháp", "success");
      onCreated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-new-campaign" title="Tạo Chiến dịch mới" size="xl"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <button className="btn btn--ghost" onClick={() => handleSubmit(false)} disabled={saving}>Lưu nháp</button>
        <SubmitBtn loading={saving} label="Tạo & Kích hoạt" onClick={() => handleSubmit(true)} />
      </>}>
      <div className="form-grid">
        <FormGroup label="Tên chiến dịch *" full>
          <input className="form-input" placeholder="VD: Vay Mua Nhà Lãi Suất Ưu Đãi Q2/2025" value={form.name} onChange={e => set("name", e.target.value)} />
        </FormGroup>
        <FormGroup label="Loại sản phẩm *">
          <select className="form-select" value={form.product} onChange={e => set("product", e.target.value)}>
            <option value="vay">Vay tài sản</option><option value="sme">Vay doanh nghiệp</option>
            <option value="the">Thẻ tín dụng</option><option value="tk">Tiết kiệm</option>
            <option value="banca">Bancassurance</option><option value="multi">Đa sản phẩm</option>
          </select>
        </FormGroup>
        <FormGroup label="Quy trình bán áp dụng">
          <select className="form-select" value={form.processKey} onChange={e => set("processKey", e.target.value)}>
            <option value="">Tự động theo sản phẩm</option>
            <option value="home_loan">Vay Mua Nhà (chuẩn)</option>
            <option value="credit_card">Thẻ Tín Dụng</option>
            <option value="bancassurance">Bancassurance</option>
          </select>
        </FormGroup>
        <FormGroup label="Ngày bắt đầu *">
          <input className="form-input" type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
        </FormGroup>
        <FormGroup label="Ngày kết thúc *">
          <input className="form-input" type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
        </FormGroup>
        <FormGroup label="Mục tiêu DS (tỷ VNĐ)">
          <input className="form-input" type="number" step="0.1" placeholder="80" value={form.targetRevenue} onChange={e => set("targetRevenue", e.target.value)} />
        </FormGroup>
        <FormGroup label="KH mục tiêu">
          <input className="form-input" type="number" placeholder="200" value={form.targetCustomers} onChange={e => set("targetCustomers", e.target.value)} />
        </FormGroup>
        <FormGroup label="Khu vực áp dụng">
          <select className="form-select" value={form.scope} onChange={e => set("scope", e.target.value)}>
            <option value="all">Toàn hệ thống</option><option value="hn">Chi nhánh HN</option>
            <option value="hcm">Chi nhánh HCM</option><option value="custom">Chọn RM cụ thể</option>
          </select>
        </FormGroup>
        <FormGroup label="Ngân sách marketing (triệu VNĐ)">
          <input className="form-input" type="number" placeholder="200" value={form.budget} onChange={e => set("budget", e.target.value)} />
        </FormGroup>
        <FormGroup label="Mô tả chiến dịch" full>
          <textarea className="form-input" rows={3} placeholder="Mục tiêu, đối tượng KH, ưu đãi đặc biệt…" value={form.description} onChange={e => set("description", e.target.value)} />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CAMPAIGN EDIT
// ═══════════════════════════════════════════════════════════════════════
export function ModalCampaignEdit({ campaignId, onUpdated }: { campaignId?: number; onUpdated?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "Vay Mua Nhà Lãi Suất Ưu Đãi Q1/2025", endDate: "2025-03-31", targetRevenue: "80", status: "active", scope: "hn", note: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { showToast("Tên chiến dịch không được để trống", "warning"); return; }
    setSaving(true);
    try {
      await CampaignService.save({
        id: campaignId,
        name: form.name,
        endDate: form.endDate || undefined,
        targetRevenue: form.targetRevenue ? parseFloat(form.targetRevenue) * 1_000_000_000 : undefined,
        scope: form.scope,
        description: form.note || undefined,
      });
      if (form.status) await CampaignService.updateStatus({ id: campaignId!, status: form.status });
      showToast("Chiến dịch đã được cập nhật!", "success");
      onUpdated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-campaign-edit" title="Chỉnh sửa Chiến dịch" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Lưu thay đổi" onClick={handleSubmit} />
      </>}>
      <div className="form-grid">
        <FormGroup label="Tên chiến dịch" full>
          <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} />
        </FormGroup>
        <FormGroup label="Ngày kết thúc">
          <input className="form-input" type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
        </FormGroup>
        <FormGroup label="Mục tiêu DS (tỷ)">
          <input className="form-input" type="number" value={form.targetRevenue} onChange={e => set("targetRevenue", e.target.value)} />
        </FormGroup>
        <FormGroup label="Trạng thái">
          <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="active">Đang chạy</option><option value="paused">Tạm dừng</option><option value="ended">Kết thúc</option>
          </select>
        </FormGroup>
        <FormGroup label="Khu vực">
          <select className="form-select" value={form.scope} onChange={e => set("scope", e.target.value)}>
            <option value="all">Toàn hệ thống</option><option value="hn">Chi nhánh HN</option><option value="hcm">Chi nhánh HCM</option>
          </select>
        </FormGroup>
        <FormGroup label="Ghi chú" full>
          <textarea className="form-input" rows={2} placeholder="Cập nhật nội dung chiến dịch…" value={form.note} onChange={e => set("note", e.target.value)} />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// UPLOAD DOC
// ═══════════════════════════════════════════════════════════════════════
export function ModalNewDoc({ onUploaded }: { onUploaded?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", type: "script", campaignId: "", steps: [] as string[], note: "" });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const toggleStep = (s: string) => set("steps", form.steps.includes(s) ? form.steps.filter(x => x !== s) : [...form.steps, s]);

  const handleSubmit = async () => {
    if (!form.name.trim()) { showToast("Vui lòng nhập tên tài liệu", "warning"); return; }
    setSaving(true);
    try {
      // POST to /adminapi/artifact/update (multipart in real usage; here we send JSON metadata)
      await fetch("/adminapi/artifact/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${document.cookie.match(/token=([^;]*)/)?.[1] || ""}` },
        body: JSON.stringify({ name: form.name, type: form.type, campaignId: form.campaignId || undefined, steps: form.steps, note: form.note }),
      });
      showToast("Tài liệu đã được lưu thành công!", "success");
      onUploaded?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi upload: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-new-doc" title="Upload Tài liệu bán hàng" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Lưu tài liệu" onClick={handleSubmit} />
      </>}>
      <div className="upload-zone" onClick={() => showToast("Chọn file để upload", "info")}>
        <div className="icon">📁</div>
        <div className="title">Kéo thả file vào đây hoặc click để chọn</div>
        <div className="hint">PDF, Word, Excel, PowerPoint · Tối đa 20MB</div>
      </div>
      <div className="form-grid">
        <FormGroup label="Tên tài liệu *" full>
          <input className="form-input" placeholder="Script tư vấn / Bảng phí / Brochure…" value={form.name} onChange={e => set("name", e.target.value)} />
        </FormGroup>
        <FormGroup label="Loại tài liệu">
          <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="script">Script tư vấn</option><option value="rate">Bảng phí / Lãi suất</option>
            <option value="brochure">Brochure</option><option value="form">Mẫu biểu / Form</option>
            <option value="internal">Hướng dẫn nội bộ</option>
          </select>
        </FormGroup>
        <FormGroup label="Áp dụng chiến dịch">
          <select className="form-select" value={form.campaignId} onChange={e => set("campaignId", e.target.value)}>
            <option value="">Tất cả chiến dịch</option>
            <option value="1">Vay Mua Nhà Q1</option><option value="2">Thẻ TD Hoàn Tiền</option>
          </select>
        </FormGroup>
        <FormGroup label="Áp dụng tại bước" full>
          <div className="form-checkbox-list">
            {["Tiếp cận","Tư vấn","Lập hồ sơ","Thẩm định","Chốt HĐ"].map(s => (
              <label key={s} className="form-checkbox-item">
                <input type="checkbox" checked={form.steps.includes(s)} onChange={() => toggleStep(s)} /> {s}
              </label>
            ))}
          </div>
        </FormGroup>
        <FormGroup label="Ghi chú sử dụng" full>
          <textarea className="form-input" rows={2} placeholder="Hướng dẫn RM sử dụng tài liệu này…" value={form.note} onChange={e => set("note", e.target.value)} />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VIEW DOC (share link via email/SMS)
// ═══════════════════════════════════════════════════════════════════════
export function ModalViewDoc() {
  const { showToast, closeModal } = useApp();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      await LeadService.sendSms({ customerId: 0, content: "Link tài liệu: https://docs.rebornbank.vn/script-vay-nha" });
      showToast("Đã chia sẻ link tài liệu cho KH qua SMS!", "success");
      closeModal();
    } catch (e: any) {
      showToast("Lỗi chia sẻ: " + e.message, "error");
    } finally { setSharing(false); }
  };

  return (
    <Modal id="modal-view-doc" title="Script tư vấn Vay Mua Nhà" size="lg"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
        <button className="btn btn--ghost" onClick={() => showToast("Đang tải xuống…", "info")}>Tải xuống</button>
        <button className="btn btn--primary" onClick={handleShare} disabled={sharing}>{sharing ? "Đang gửi…" : "Chia sẻ cho KH"}</button>
      </>}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ fontSize: 36, flexShrink: 0 }}>📄</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Script tư vấn Vay Mua Nhà.pdf</div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="doc-tag-chip" style={{ background: "var(--accent-soft)", color: "var(--accent-bright)" }}>Script</span>
            <span className="doc-tag-chip" style={{ background: "rgba(0,200,150,0.1)", color: "var(--success)" }}>Vay Mua Nhà</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>PDF · 2.4 MB · 01/03/2025</span>
          </div>
        </div>
      </div>
      <div style={{ background: "var(--navy)", borderRadius: 10, padding: 20, marginBottom: 14, fontSize: 13, lineHeight: 1.8, color: "var(--text-secondary)", maxHeight: 260, overflowY: "auto" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>SCRIPT TƯ VẤN VAY MUA NHÀ – CRM Banking</div>
        <div style={{ fontWeight: 600, color: "var(--accent-bright)", marginBottom: 6 }}>Bước 1: Mở đầu</div>
        <div style={{ marginBottom: 12 }}>"Chào anh/chị [Tên KH], em là [Tên RM]. Em gọi để chia sẻ về chương trình Vay Mua Nhà lãi suất chỉ từ 7.5%/năm…"</div>
        <div style={{ fontWeight: 600, color: "var(--gold)", marginBottom: 6 }}>Bước 2: Khám phá nhu cầu</div>
        <div>• Anh/chị có kế hoạch mua nhà không?<br />• Dự kiến giá trị căn nhà khoảng bao nhiêu?<br />• Anh/chị cần vay bao nhiêu % giá trị?</div>
      </div>
      <div className="info-banner info-banner--green">Áp dụng tại bước: <strong>Tiếp cận</strong> và <strong>Tư vấn</strong></div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SEND NPS SURVEY
// ═══════════════════════════════════════════════════════════════════════
export function ModalSendSurvey({ onSent }: { onSent?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ group: "all", channel: "sms", schedule: "now", message: "Kính gửi Quý khách, Ngân hàng trân trọng mời bạn đánh giá chất lượng dịch vụ (1-2 phút). Cảm ơn!" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSend = async () => {
    setSaving(true);
    try {
      await NpsService.send({
        customerIds: [], // would be filled from selected group
        channel: form.channel,
        message: form.message,
        scheduledAt: form.schedule !== "now" ? new Date().toISOString() : undefined,
      });
      showToast("Đã gửi khảo sát NPS thành công!", "success");
      onSent?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi gửi khảo sát: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-send-survey" title="Gửi Khảo sát NPS" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Gửi khảo sát" onClick={handleSend} />
      </>}>
      <div className="form-grid">
        <FormGroup label="Chọn nhóm KH" full>
          <select className="form-select" value={form.group} onChange={e => set("group", e.target.value)}>
            <option value="all">Tất cả KH tháng này (187)</option>
            <option value="vip">KH VIP Platinum (23)</option>
            <option value="new30">KH mới trong 30 ngày (48)</option>
            <option value="unpolled">KH chưa khảo sát Q1</option>
            <option value="detractor">Detractors cần follow-up (12)</option>
          </select>
        </FormGroup>
        <FormGroup label="Kênh gửi">
          <select className="form-select" value={form.channel} onChange={e => set("channel", e.target.value)}>
            <option value="sms">SMS</option><option value="email">Email</option>
            <option value="zalo">Zalo OA</option><option value="all">Cả ba kênh</option>
          </select>
        </FormGroup>
        <FormGroup label="Thời gian gửi">
          <select className="form-select" value={form.schedule} onChange={e => set("schedule", e.target.value)}>
            <option value="now">Ngay lập tức</option><option value="schedule">Lên lịch hẹn giờ</option>
          </select>
        </FormGroup>
        <FormGroup label="Nội dung tin nhắn" full>
          <textarea className="form-input" rows={3} value={form.message} onChange={e => set("message", e.target.value)} />
        </FormGroup>
      </div>
      <div className="info-banner info-banner--blue">
        Ước tính 187 tin nhắn · Chi phí SMS: ~280.000đ · Tỷ lệ phản hồi dự kiến: 45%
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BPMN MODALS (deploy, import, new process)
// ═══════════════════════════════════════════════════════════════════════
export function ModalBpmnNew({ onCreated }: { onCreated?: () => void }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", product: "vay", copyFrom: "", description: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { showToast("Vui lòng nhập tên quy trình", "warning"); return; }
    setSaving(true);
    try {
      await BpmService.deployProcess({ processKey: `proc_${form.product}_${Date.now()}`, xml: "<definitions/>", name: form.name });
      showToast("Đã tạo quy trình mới, đang mở BPMN editor…", "success");
      onCreated?.();
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-bpmn-new" title="Tạo Quy trình bán mới" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Tạo & Mở Editor" onClick={handleSubmit} />
      </>}>
      <div className="form-grid">
        <FormGroup label="Tên quy trình *" full>
          <input className="form-input" placeholder="VD: Quy trình Vay Tiêu Dùng Tín Chấp" value={form.name} onChange={e => set("name", e.target.value)} />
        </FormGroup>
        <FormGroup label="Sản phẩm áp dụng">
          <select className="form-select" value={form.product} onChange={e => set("product", e.target.value)}>
            <option value="vay">Vay tài sản</option><option value="sme">Vay doanh nghiệp</option>
            <option value="the">Thẻ tín dụng</option><option value="tk">Tiết kiệm</option><option value="banca">Bancassurance</option>
          </select>
        </FormGroup>
        <FormGroup label="Nhân bản từ quy trình có sẵn">
          <select className="form-select" value={form.copyFrom} onChange={e => set("copyFrom", e.target.value)}>
            <option value="">Quy trình mới (trống)</option>
            <option value="home_loan">Vay Mua Nhà (chuẩn)</option>
            <option value="credit_card">Thẻ Tín Dụng</option>
            <option value="bancassurance">Bancassurance</option>
          </select>
        </FormGroup>
        <FormGroup label="Mô tả" full>
          <textarea className="form-input" rows={3} placeholder="Mô tả ngắn về quy trình…" value={form.description} onChange={e => set("description", e.target.value)} />
        </FormGroup>
      </div>
    </Modal>
  );
}

export function ModalBpmnImport() {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);

  const handleImport = async () => {
    setSaving(true);
    try {
      await BpmService.validate({ xml: "<definitions/>" });
      showToast("BPMN hợp lệ – đã import thành công!", "success");
      closeModal();
    } catch (e: any) {
      showToast("Lỗi validate BPMN: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-bpmn-import" title="Import BPMN XML" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Import" onClick={handleImport} />
      </>}>
      <div className="upload-zone" onClick={() => showToast("Chọn file .bpmn hoặc .xml", "info")}>
        <div className="icon">📋</div>
        <div className="title">Kéo thả file .bpmn hoặc click để chọn</div>
        <div className="hint">Định dạng BPMN 2.0 XML · Tối đa 5MB</div>
      </div>
      <div className="info-banner info-banner--blue">Hệ thống sẽ validate BPMN 2.0 sau khi upload.</div>
    </Modal>
  );
}

export function ModalBpmnDeploy({ processKey = "proc_vay_mua_nha_v2" }: { processKey?: string }) {
  const { showToast, closeModal } = useApp();
  const [saving, setSaving] = useState(false);

  const handleDeploy = async () => {
    setSaving(true);
    try {
      await BpmService.deployProcess({ processKey, xml: "<definitions/>", name: processKey });
      showToast(`Đã deploy ${processKey} lên BPM Engine thành công!`, "success");
      closeModal();
    } catch (e: any) {
      showToast("Lỗi deploy: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-bpmn-deploy" title="Deploy lên BPM Engine" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Deploy" onClick={handleDeploy} />
      </>}>
      {[["Process ID", processKey, "monospace"],["Version","v2.1 → v2.2",""],["BPM Engine URL","bpm.rebornbank.vn:8080","monospace"]].map(([l,v,font]) => (
        <div key={l as string} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface)", borderRadius: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l}</span>
          <span style={{ fontSize: font ? 11 : 12, fontFamily: font || "inherit", fontWeight: 600, color: "var(--accent-bright)" }}>{v as string}</span>
        </div>
      ))}
      <div className="info-banner info-banner--warning">Deploy sẽ ảnh hưởng đến tất cả giao dịch mới. Các giao dịch đang xử lý tiếp tục chạy trên v2.1.</div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS (save user profile)
// ═══════════════════════════════════════════════════════════════════════
export function ModalSettings() {
  const { user, showToast, closeModal } = useApp();
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone, branch: user.branchCode });
  const [pwd,  setPwd]  = useState({ current: "", newPwd: "", confirm: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (tab === "security") {
      if (!pwd.current) { showToast("Nhập mật khẩu hiện tại", "warning"); return; }
      if (pwd.newPwd !== pwd.confirm) { showToast("Mật khẩu xác nhận không khớp", "warning"); return; }
    }
    setSaving(true);
    try {
      if (tab === "general") {
        // PATCH user profile — /authenticator/user/admin_update
        await fetch("/authenticator/user/admin_update", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${document.cookie.match(/token=([^;]*)/)?.[1] || ""}` },
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone }),
        });
      } else if (tab === "security") {
        // /authenticator/user/change_pass
        await fetch("/authenticator/user/change_pass", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${document.cookie.match(/token=([^;]*)/)?.[1] || ""}` },
          body: JSON.stringify({ oldPassword: pwd.current, newPassword: pwd.newPwd }),
        });
      }
      showToast("Cài đặt đã được lưu!", "success");
      closeModal();
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal id="modal-settings" title="Cài đặt hệ thống" size="lg"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
        <SubmitBtn loading={saving} label="Lưu thay đổi" onClick={handleSave} />
      </>}>
      <div className="modal-tabs">
        {[["general","Chung"],["notify","Thông báo"],["security","Bảo mật"],["integration","Tích hợp"]].map(([k,l]) => (
          <button key={k} className={`modal-tab${tab === k ? " modal-tab--active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "general" && (
        <div className="form-grid">
          <FormGroup label="Họ tên"><input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} /></FormGroup>
          <FormGroup label="Mã nhân viên"><input className="form-input" value={user.id} readOnly /></FormGroup>
          <FormGroup label="Email"><input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} /></FormGroup>
          <FormGroup label="Điện thoại"><input className="form-input" value={form.phone} onChange={e => set("phone", e.target.value)} /></FormGroup>
          <FormGroup label="Chi nhánh"><select className="form-select" value={form.branch} onChange={e => set("branch", e.target.value)}><option value="HN-Q2">HN – Quận 2</option><option value="HN-Q1">HN – Quận 1</option></select></FormGroup>
          <FormGroup label="Múi giờ"><select className="form-select"><option>GMT+7 (Hà Nội)</option></select></FormGroup>
        </div>
      )}
      {tab === "notify" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[["Nhắc đáo hạn sản phẩm","Trước 3 ngày",true],["Lead mới được phân công","Thông báo ngay",true],["Kết quả phê duyệt hồ sơ","Duyệt / Từ chối",true],["Báo cáo KPI tuần","Mỗi sáng thứ 2",false],["Cảnh báo NPS thấp","Khi KH đánh giá ≤ 6",true]].map(([l,s,on]) => (
            <div key={l as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "var(--surface)", borderRadius: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>{l as string}</div><div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{s as string}</div></div>
              <div style={{ width: 40, height: 22, borderRadius: 20, background: on ? "var(--success)" : "var(--surface-hover)", border: `1px solid ${on ? "var(--success)" : "var(--border)"}`, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: (on as boolean) ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: (on as boolean) ? "white" : "var(--text-muted)", transition: "all 0.2s" }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "security" && (
        <div className="form-grid">
          <FormGroup label="Mật khẩu hiện tại" full><input className="form-input" type="password" placeholder="••••••••" value={pwd.current} onChange={e => setPwd(p => ({...p,current:e.target.value}))} /></FormGroup>
          <FormGroup label="Mật khẩu mới"><input className="form-input" type="password" placeholder="••••••••" value={pwd.newPwd} onChange={e => setPwd(p => ({...p,newPwd:e.target.value}))} /></FormGroup>
          <FormGroup label="Xác nhận mật khẩu"><input className="form-input" type="password" placeholder="••••••••" value={pwd.confirm} onChange={e => setPwd(p => ({...p,confirm:e.target.value}))} /></FormGroup>
          <div style={{ gridColumn: "1/-1" }}><div className="info-banner info-banner--green">Xác thực 2 lớp (2FA) đang bật · Thiết bị được nhận diện: 2</div></div>
        </div>
      )}
      {tab === "integration" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[["Core Banking (T24)","connected","bpm.rebornbank.vn:8080"],["BPM Engine (Camunda)","connected","bpm.rebornbank.vn/engine"],["Zalo OA","connected","OA: @rebornbank"],["Email SMTP","connected","smtp.rebornbank.vn:587"],["SMS Gateway","warning","Cần cập nhật API key"]].map(([name,status,url]) => (
            <div key={name as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "var(--surface)", borderRadius: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div><div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{url}</div></div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: status === "connected" ? "var(--success-soft)" : "var(--warning-soft)", color: status === "connected" ? "var(--success)" : "var(--warning)", fontWeight: 600 }}>
                {status === "connected" ? "● Kết nối" : "⚠ Cảnh báo"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CORE BANKING SYNC
// ═══════════════════════════════════════════════════════════════════════
export function ModalCoreBankingSync() {
  const { showToast, closeModal } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [syncingItem, setSyncingItem] = useState<string | null>(null);

  const syncAll = async () => {
    setSyncing(true);
    try {
      // Trigger sync via notification/system endpoint
      await fetch("/adminapi/customer/reloadData", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${document.cookie.match(/token=([^;]*)/)?.[1] || ""}` },
        body: JSON.stringify({ type: "full" }),
      });
      showToast("Đồng bộ Core Banking thành công – 247 records updated", "success");
      closeModal();
    } catch (e: any) {
      showToast("Lỗi đồng bộ: " + e.message, "error");
    } finally { setSyncing(false); }
  };

  const syncItem = async (type: string) => {
    setSyncingItem(type);
    try {
      await fetch("/adminapi/customer/reloadData", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${document.cookie.match(/token=([^;]*)/)?.[1] || ""}` },
        body: JSON.stringify({ type }),
      });
      showToast(`Đã sync ${type} thành công`, "success");
    } catch (e: any) {
      showToast("Lỗi: " + e.message, "error");
    } finally { setSyncingItem(null); }
  };

  return (
    <Modal id="modal-corebankingsync" title="Core Banking Sync" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
        <SubmitBtn loading={syncing} label="Đồng bộ ngay" onClick={syncAll} />
      </>}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "var(--surface)", borderRadius: 8, marginBottom: 8, alignItems: "center" }}>
          <div><div style={{ fontSize: 13, fontWeight: 500 }}>Trạng thái kết nối</div><div style={{ fontSize: 11, color: "var(--text-secondary)" }}>T24 Core Banking System</div></div>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", fontWeight: 600 }}>● Connected</span>
        </div>
        {[["customer","Thông tin KH","20/03 08:00","1,247 records"],["product","Sản phẩm & Dư nợ","20/03 07:30","3,891 accounts"],["transaction","Giao dịch 30 ngày","20/03 06:00","45,221 txns"],["approval","Phê duyệt tín dụng","20/03 09:15","34 records"]].map(([type,label,last,count]) => (
          <div key={type as string} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface)", borderRadius: 8, marginBottom: 8, alignItems: "center" }}>
            <div><div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Lần cuối: {last as string}</div></div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-bright)" }}>{count}</div>
              <button className="btn-icon-sm" style={{ marginTop: 4 }} disabled={syncingItem === type} onClick={() => syncItem(type as string)}>
                {syncingItem === type ? "…" : "Sync"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="info-banner info-banner--blue">Tần suất tự động: mỗi 30 phút.</div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATIONS (mark read via API)
// ═══════════════════════════════════════════════════════════════════════
export function ModalNotifications() {
  const { closeModal, setActivePage, showToast } = useApp();
  const [notifications] = useState([
    { color: "var(--danger)",  title: "KH Lê Hải Nam sắp đáo hạn thẻ tín dụng", sub: "Hạn còn 2 ngày · 22/03/2025", time: "2p", read: false, id: 1 },
    { color: "var(--success)", title: "Đề xuất #PD-2847 đã được phê duyệt cấp 3", sub: "ABC Corp · Vay 4.8 tỷ", time: "15p", read: false, id: 2 },
    { color: "var(--gold)",    title: "Lead mới từ Website: TNHH Thái Bình Dương", sub: "Vay doanh nghiệp · 8 tỷ", time: "32p", read: false, id: 3 },
    { color: "var(--border-hover)", title: "Trương Bảo Châu gửi NPS 10 điểm", sub: "RM rất nhiệt tình", time: "1g", read: true, id: 4 },
  ]);

  const markReadAll = async () => {
    try {
      await NotificationService.markReadAll();
      showToast("Đã đánh dấu tất cả là đã đọc", "success");
    } catch { showToast("Lỗi cập nhật thông báo", "error"); }
  };

  return (
    <Modal id="modal-notifications" title="Thông báo" size="sm"
      footer={<button className="btn btn--ghost" style={{ width: "100%" }} onClick={() => { setActivePage("tasks"); closeModal(); }}>Xem tất cả hoạt động</button>}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--accent-bright)", cursor: "pointer" }} onClick={markReadAll}>Đánh dấu tất cả đã đọc</span>
      </div>
      {notifications.map((n) => (
        <div key={n.id} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)", cursor: "pointer", opacity: n.read ? 0.6 : 1 }}
          onClick={async () => { try { await NotificationService.markRead(n.id); } catch {} }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, flexShrink: 0, marginTop: 5 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{n.sub}</div>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{n.time}</div>
        </div>
      ))}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PROFILE (quick view, no edit here — use Settings)
// ═══════════════════════════════════════════════════════════════════════
export function ModalProfile() {
  const { user, showToast, closeModal, openModal, setActivePage } = useApp();

  const handleLogout = async () => {
    try {
      await fetch("/authenticator/user/logout", { method: "POST", headers: { "Authorization": `Bearer ${document.cookie.match(/token=([^;]*)/)?.[1] || ""}` } });
    } catch {} finally {
      document.cookie = "token=; Max-Age=0; path=/";
      document.cookie = "user=; Max-Age=0; path=/";
      showToast("Đã đăng xuất tài khoản", "info");
      closeModal();
      window.location.href = "/login";
    }
  };

  return (
    <Modal id="modal-profile" title="Hồ sơ cá nhân" size="sm" footer={null}>
      <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white", margin: "0 auto 12px" }}>{user.initials}</div>
        <div style={{ fontSize: 17, fontWeight: 700 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{user.role} · {user.branch}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", marginTop: 8 }}>● Đang hoạt động</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[["Doanh số T3","3.8 tỷ","var(--success)"],["KPI đạt","95%","var(--accent-bright)"],["Deals tháng","12","var(--gold)"],["Xếp hạng","#2","var(--warning)"]].map(([l,v,c]) => (
          <div key={l as string} className="surface-box" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c as string }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        {[
          { icon: "⚙️", label: "Cài đặt tài khoản", action: () => openModal("modal-settings"), danger: false },
          { icon: "📊", label: "Xem KPI của tôi",    action: () => { setActivePage("kpi"); closeModal(); }, danger: false },
          { icon: "🚪", label: "Đăng xuất",           action: handleLogout, danger: true },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", color: item.danger ? "var(--danger)" : "var(--text-secondary)" }}
            onClick={item.action}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = item.danger ? "var(--danger-soft)" : "var(--surface)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
            <span>{item.icon}</span>
            <span style={{ fontSize: 13 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NPS DETAIL
// ═══════════════════════════════════════════════════════════════════════
export function ModalNpsDetail() {
  const { closeModal, openModal } = useApp();
  return (
    <Modal id="modal-nps-detail" title="Chi tiết phản hồi NPS" size="md"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
        <button className="btn btn--primary" onClick={() => { closeModal(); openModal("modal-new-task"); }}>Tạo task follow-up</button>
      </>}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: 14, background: "var(--success-soft)", borderRadius: 10 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#F5A623,#F57C00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0 }}>TC</div>
        <div><div style={{ fontSize: 15, fontWeight: 600 }}>Trương Bảo Châu</div><div style={{ fontSize: 12, color: "var(--text-secondary)" }}>VIP Platinum · RM: Hà Thu</div></div>
        <div style={{ marginLeft: "auto", textAlign: "center" }}><div style={{ fontSize: 36, fontWeight: 700, color: "var(--success)", lineHeight: 1 }}>10</div><div style={{ fontSize: 11, color: "var(--success)" }}>Promoter</div></div>
      </div>
      <div style={{ marginBottom: 14 }}><div className="form-label" style={{ marginBottom: 6 }}>Nhận xét</div><div className="surface-box" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", fontStyle: "italic" }}>"RM rất nhiệt tình, tư vấn chuyên nghiệp. Thủ tục nhanh gọn, tôi rất hài lòng."</div></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Tốc độ xử lý","5/5"],["Sản phẩm","5/5"],["Thái độ RM","5/5"]].map(([l,v]) => (
          <div key={l} className="surface-box" style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{l}</div><div style={{ fontSize: 18, fontWeight: 700, color: "var(--success)" }}>{v}</div></div>
        ))}
      </div>
      <div className="info-banner info-banner--gold">KH sẵn sàng giới thiệu. Đề xuất chương trình Referral – tặng phí năm đầu thẻ Infinity.</div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CAMPAIGN DETAIL (view only)
// ═══════════════════════════════════════════════════════════════════════
export function ModalCampaignDetail() {
  const { closeModal, openModal, setActivePage } = useApp();
  const [tab, setTab] = useState("docs");
  return (
    <Modal id="modal-campaign-detail" title="Vay Mua Nhà Lãi Suất Ưu Đãi Q1/2025" size="lg"
      footer={<>
        <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
        <button className="btn btn--ghost" onClick={() => openModal("modal-campaign-edit")}>Chỉnh sửa</button>
        <button className="btn btn--primary" onClick={() => { closeModal(); setActivePage("pipeline"); }}>Vào Pipeline</button>
      </>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {[["Doanh số","62.4 tỷ","/ 80 tỷ KH","var(--success)"],["Leads","247","/ 200 KH","var(--accent-bright)"],["HĐ ký","84","34% CVR","var(--gold)"],["Còn lại","11 ngày","Kết thúc 31/03","var(--warning)"]].map(([l,v,s,c]) => (
          <div key={l as string} style={{ background: "var(--surface)", borderRadius: 8, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c as string }}>{v}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s}</div>
          </div>
        ))}
      </div>
      <div className="modal-tabs">
        {[["docs","Tài liệu (3)"],["kpi","KPI"],["process","Quy trình"],["results","Kết quả RM"]].map(([k,l]) => (
          <button key={k} className={`modal-tab${tab === k ? " modal-tab--active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "docs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["📄","Script tư vấn Vay Mua Nhà.pdf","2.4 MB · Bước: Tiếp cận, Tư vấn"],["📊","Bảng lãi suất Q1-2025.xlsx","380 KB · Bước: Tư vấn"],["🖼","Brochure ưu đãi.pptx","5.1 MB · Bước: Tất cả"]].map(([icon,name,meta]) => (
            <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--surface)", borderRadius: 9, cursor: "pointer" }} onClick={() => openModal("modal-view-doc")}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{name as string}</div><div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{meta as string}</div></div>
              <button className="btn-icon-sm" onClick={e => { e.stopPropagation(); }}>Tải</button>
            </div>
          ))}
        </div>
      )}
      {tab === "kpi" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["Doanh số tín dụng","62.4/80 tỷ",78,"var(--success)"],["Số lượng KH","247/200",100,"var(--accent)"],["Hợp đồng ký","84/200 HĐ",42,"var(--gold)"]].map(([l,v,p,c]) => (
            <div key={l as string} className="progress-item">
              <div className="progress-label-row"><span className="progress-label">{l as string}</span><span className="pct" style={{ color: c as string }}>{v as string}</span></div>
              <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${Math.min(p as number,100)}%`, background: c as string }} /></div>
            </div>
          ))}
        </div>
      )}
      {tab === "process" && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {["Tiếp cận","Tư vấn","Đề xuất","Thẩm định","Chốt HĐ"].map((s,i) => (
            <React.Fragment key={s}>
              <div style={{ flexShrink: 0, background: "var(--surface)", borderRadius: 8, padding: "10px 14px", fontSize: 12, textAlign: "center", borderLeft: `3px solid ${["var(--accent)","var(--gold)","var(--purple)","var(--warning)","var(--success)"][i]}` }}>
                <div style={{ fontWeight: 600, color: ["var(--accent-bright)","var(--gold)","var(--purple)","var(--warning)","var(--success)"][i] }}>{s}</div>
              </div>
              {i < 4 && <div style={{ alignSelf: "center", color: "var(--text-muted)" }}>›</div>}
            </React.Fragment>
          ))}
        </div>
      )}
      {tab === "results" && (
        <table className="data-table"><thead><tr><th>RM</th><th>Leads</th><th>Tư vấn</th><th>HĐ ký</th><th>DS (tỷ)</th></tr></thead>
          <tbody>
            {[["Hà Thu",68,52,28,"18.4","var(--success)"],["Trần Nguyên",54,41,22,"14.2","var(--accent-bright)"],["Ngọc Anh",48,35,18,"11.8","var(--gold)"]].map(([n,l,c,h,ds,col]) => (
              <tr key={n as string}><td><div className="td-name">{n as string}</div></td><td style={{ fontWeight: 600 }}>{l}</td><td>{c}</td><td style={{ color: col as string, fontWeight: 600 }}>{h}</td><td style={{ color: col as string, fontWeight: 700 }}>{ds}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APPROVAL FILTER (UI only — filters applied in Approval page)
// ═══════════════════════════════════════════════════════════════════════
export function ModalApprovalFilter() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-approval-filter" title="Lọc Đề xuất" size="sm"
      footer={<>
        <button className="btn btn--ghost" onClick={() => showToast("Đã xóa bộ lọc","info")}>Xóa lọc</button>
        <button className="btn btn--primary" onClick={() => { showToast("Đã áp dụng","success"); closeModal(); }}>Áp dụng</button>
      </>}>
      <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
        <FormGroup label="Trạng thái"><select className="form-select"><option>Tất cả</option><option>Chờ duyệt</option><option>Đang xem xét</option><option>Đã duyệt</option><option>Từ chối</option></select></FormGroup>
        <FormGroup label="Loại đề xuất"><select className="form-select"><option>Tất cả</option><option>Lãi suất ưu đãi</option><option>Hạn mức đặc biệt</option><option>Gia hạn</option></select></FormGroup>
        <FormGroup label="RM đề xuất"><select className="form-select"><option>Tất cả</option><option>Hà Thu</option><option>Trần Nguyên</option><option>Ngọc Anh</option></select></FormGroup>
        <FormGroup label="Hạn xử lý"><input className="form-input" type="date" /></FormGroup>
      </div>
    </Modal>
  );
}

export function ModalPipelineFilter() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-pipeline-filter" title="Lọc Pipeline" size="sm"
      footer={<>
        <button className="btn btn--ghost" onClick={() => showToast("Đã xóa bộ lọc","info")}>Xóa lọc</button>
        <button className="btn btn--primary" onClick={() => { showToast("Đã áp dụng","success"); closeModal(); }}>Áp dụng</button>
      </>}>
      <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
        <FormGroup label="Sản phẩm"><select className="form-select"><option>Tất cả</option><option>Vay TS</option><option>Vay DN</option><option>Thẻ TD</option><option>Tiết kiệm</option><option>Banca</option></select></FormGroup>
        <FormGroup label="RM phụ trách"><select className="form-select"><option>Tất cả RM</option><option>Hà Thu</option><option>Trần Nguyên</option><option>Ngọc Anh</option></select></FormGroup>
        <FormGroup label="Giai đoạn"><select className="form-select"><option>Tất cả</option><option>Tiếp cận</option><option>Tư vấn</option><option>Lập hồ sơ</option><option>Thẩm định</option><option>Chốt</option></select></FormGroup>
        <FormGroup label="Giá trị"><div style={{ display: "flex", gap: 8 }}><input className="form-input" placeholder="Từ (tỷ)" /><input className="form-input" placeholder="Đến (tỷ)" /></div></FormGroup>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MASTER EXPORT — render all modals
// ═══════════════════════════════════════════════════════════════════════
export function AllModals() {
  return (
    <>
      <ModalNewLead />
      <ModalImportLead />
      <ModalNewOpportunity />
      <ModalPipelineFilter />
      <ModalDealDetail />
      <ModalNewApproval />
      <ModalApprovalDetail />
      <ModalApprovalFilter />
      <ModalNewTask />
      <ModalNewCampaign />
      <ModalCampaignDetail />
      <ModalCampaignEdit />
      <ModalNewDoc />
      <ModalViewDoc />
      <ModalBpmnNew />
      <ModalBpmnImport />
      <ModalBpmnDeploy />
      <ModalSendSurvey />
      <ModalNpsDetail />
      <ModalCoreBankingSync />
      <ModalNotifications />
      <ModalProfile />
      <ModalSettings />
    </>
  );
}
