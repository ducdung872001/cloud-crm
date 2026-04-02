import React, { useState } from "react";
import Modal from "components/modal/Modal";
import { useApp } from "contexts/AppContext";

// ── Reusable form helpers ──────────────────────────────
function FormGroup({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`form-group${full ? " form-group--full" : ""}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

// ── NEW LEAD MODAL ─────────────────────────────────────
function ModalNewLead() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-new-lead" title="Tạo Lead mới" size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--ghost" onClick={() => { showToast("Đã lưu bản nháp", "info"); closeModal(); }}>Lưu nháp</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã tạo Lead mới thành công!", "success"); closeModal(); }}>Tạo Lead</button>
        </>
      }>
      <div className="form-grid">
        <FormGroup label="Loại khách hàng *">
          <select className="form-select"><option>Cá nhân</option><option>Doanh nghiệp (SME)</option><option>Doanh nghiệp (Corporate)</option></select>
        </FormGroup>
        <FormGroup label="Sản phẩm quan tâm *">
          <select className="form-select"><option>Vay tài sản (Mua nhà/xe)</option><option>Vay doanh nghiệp</option><option>Thẻ tín dụng</option><option>Tiết kiệm/Tiền gửi</option><option>Bancassurance</option><option>Đa sản phẩm</option></select>
        </FormGroup>
        <FormGroup label="Họ và tên *">
          <input className="form-input" placeholder="Nguyễn Văn A / Tên công ty..." />
        </FormGroup>
        <FormGroup label="Số điện thoại *">
          <input className="form-input" placeholder="0912 345 678" />
        </FormGroup>
        <FormGroup label="Email">
          <input className="form-input" type="email" placeholder="email@company.com" />
        </FormGroup>
        <FormGroup label="Địa chỉ">
          <input className="form-input" placeholder="Quận, Thành phố..." />
        </FormGroup>
        <FormGroup label="Giá trị ước tính">
          <input className="form-input" placeholder="VD: 2.500.000.000" />
        </FormGroup>
        <FormGroup label="Nguồn Lead *">
          <select className="form-select"><option>Web / Landing Page</option><option>Mobile App</option><option>Referral (giới thiệu)</option><option>Telesale outbound</option><option>Chi nhánh trực tiếp</option><option>Partner / Đối tác</option><option>Sự kiện / Hội thảo</option></select>
        </FormGroup>
        <FormGroup label="RM phụ trách">
          <select className="form-select"><option>Nguyễn Hà Thu</option><option>Trần Nguyên</option><option>Vũ Ngọc Anh</option><option>Lê Minh Quân</option><option>Hoàng Văn Đức</option></select>
        </FormGroup>
        <FormGroup label="Hạn follow-up">
          <input className="form-input" type="date" />
        </FormGroup>
        <FormGroup label="Ghi chú" full>
          <textarea className="form-input" rows={3} placeholder="Nhu cầu cụ thể, thông tin thêm về KH..." />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── IMPORT LEAD MODAL ──────────────────────────────────
function ModalImportLead() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-import-lead" title="Import Lead từ file" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đang xử lý file... 247 leads được import", "success"); closeModal(); }}>Import</button>
        </>
      }>
      <div className="upload-zone" onClick={() => showToast("Chọn file Excel/CSV", "info")}>
        <div className="icon">📁</div>
        <div className="title">Kéo thả file vào đây hoặc click để chọn</div>
        <div className="hint">Excel (.xlsx) hoặc CSV · Tối đa 5,000 dòng · 10MB</div>
      </div>
      <div className="info-banner info-banner--blue" style={{ marginBottom: 12 }}>
        Tải <strong style={{ cursor: "pointer" }}>template mẫu</strong> để đảm bảo đúng định dạng cột dữ liệu.
      </div>
      <div className="form-grid">
        <FormGroup label="RM phụ trách mặc định">
          <select className="form-select"><option>Tự động phân công</option><option>Nguyễn Hà Thu</option><option>Trần Nguyên</option><option>Vũ Ngọc Anh</option></select>
        </FormGroup>
        <FormGroup label="Chiến dịch gắn với">
          <select className="form-select"><option>Không gắn</option><option>Vay Mua Nhà Q1/2025</option><option>Mở Thẻ TD – Hoàn Tiền</option></select>
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── NEW OPPORTUNITY MODAL ──────────────────────────────
function ModalNewOpportunity() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-new-opportunity" title="Tạo Cơ hội mới" size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã tạo cơ hội mới trong Pipeline", "success"); closeModal(); }}>Tạo cơ hội</button>
        </>
      }>
      <div className="form-grid">
        <FormGroup label="Khách hàng *" full>
          <input className="form-input" placeholder="Tìm tên KH hoặc nhập mới..." />
        </FormGroup>
        <FormGroup label="Sản phẩm *">
          <select className="form-select"><option>Vay mua nhà</option><option>Vay xe ô tô</option><option>Vay doanh nghiệp</option><option>Thẻ tín dụng</option><option>Tiết kiệm</option><option>Bancassurance</option></select>
        </FormGroup>
        <FormGroup label="Giai đoạn hiện tại">
          <select className="form-select"><option>Tiếp cận</option><option>Tư vấn</option><option>Lập hồ sơ / Đề xuất</option><option>Thẩm định & Duyệt</option><option>Chốt deal / Ký HĐ</option></select>
        </FormGroup>
        <FormGroup label="Giá trị ước tính (VNĐ) *">
          <input className="form-input" placeholder="5.000.000.000" />
        </FormGroup>
        <FormGroup label="Xác suất chốt (%)">
          <input className="form-input" type="number" min={0} max={100} placeholder="60" />
        </FormGroup>
        <FormGroup label="RM phụ trách">
          <select className="form-select"><option>Nguyễn Hà Thu</option><option>Trần Nguyên</option><option>Vũ Ngọc Anh</option><option>Lê Minh Quân</option></select>
        </FormGroup>
        <FormGroup label="Ngày dự kiến chốt">
          <input className="form-input" type="date" />
        </FormGroup>
        <FormGroup label="Chiến dịch liên quan">
          <select className="form-select"><option>Không</option><option>Vay Mua Nhà Q1/2025</option><option>Mở Thẻ TD – Hoàn Tiền</option></select>
        </FormGroup>
        <FormGroup label="Ghi chú" full>
          <textarea className="form-input" rows={3} placeholder="Thông tin bổ sung về cơ hội..." />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── PIPELINE FILTER MODAL ──────────────────────────────
function ModalPipelineFilter() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-pipeline-filter" title="Lọc Pipeline" size="sm"
      footer={
        <>
          <button className="btn btn--ghost" onClick={() => showToast("Đã xóa bộ lọc", "info")}>Xóa lọc</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã áp dụng bộ lọc", "success"); closeModal(); }}>Áp dụng</button>
        </>
      }>
      <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
        <FormGroup label="Sản phẩm">
          <select className="form-select"><option>Tất cả</option><option>Vay tài sản</option><option>Vay doanh nghiệp</option><option>Thẻ tín dụng</option><option>Tiết kiệm</option><option>Bancassurance</option></select>
        </FormGroup>
        <FormGroup label="RM phụ trách">
          <select className="form-select"><option>Tất cả RM</option><option>Nguyễn Hà Thu</option><option>Trần Nguyên</option><option>Vũ Ngọc Anh</option><option>Lê Minh Quân</option></select>
        </FormGroup>
        <FormGroup label="Giai đoạn">
          <select className="form-select"><option>Tất cả</option><option>Tiếp cận</option><option>Tư vấn</option><option>Lập hồ sơ</option><option>Thẩm định</option><option>Chốt deal</option></select>
        </FormGroup>
        <FormGroup label="Giá trị (từ – đến)">
          <div style={{ display: "flex", gap: 8 }}>
            <input className="form-input" placeholder="Từ (tỷ)" />
            <input className="form-input" placeholder="Đến (tỷ)" />
          </div>
        </FormGroup>
        <FormGroup label="Ngày tạo">
          <input className="form-input" type="date" />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── DEAL DETAIL MODAL ─────────────────────────────────
function ModalDealDetail() {
  const { showToast, closeModal, openModal } = useApp();
  const [activeTab, setActiveTab] = useState("info");

  const steps = ["Tiếp cận", "Tư vấn", "Hồ sơ", "Thẩm định", "Chốt HĐ"];
  const currentStep = 2;

  return (
    <Modal id="modal-deal-detail" title="Chi tiết Cơ hội – TNHH Đức Thành" size="xl"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
          <button className="btn btn--ghost" onClick={() => openModal("modal-new-approval")}>Tạo đề xuất</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã chuyển sang bước tiếp theo", "success"); closeModal(); }}>Chuyển bước →</button>
        </>
      }>
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
            {i < steps.length - 1 && (
              <div className={`ws-line${i < currentStep ? " ws-line--done" : i === currentStep ? " ws-line--active" : ""}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Tabs */}
      <div className="modal-tabs">
        {["info", "docs", "tasks", "history"].map((t) => (
          <button key={t} className={`modal-tab${activeTab === t ? " modal-tab--active" : ""}`} onClick={() => setActiveTab(t)}>
            {t === "info" ? "Thông tin" : t === "docs" ? "Hồ sơ & Tài liệu" : t === "tasks" ? "Tasks" : "Lịch sử"}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { l: "Khách hàng", v: "TNHH Đức Thành", c: "" },
              { l: "Sản phẩm", v: "Vay doanh nghiệp", c: "" },
              { l: "Giá trị", v: "12.5 tỷ đồng", c: "var(--accent-bright)" },
              { l: "Xác suất chốt", v: "75%", c: "var(--success)" },
              { l: "RM phụ trách", v: "Lê Minh Quân", c: "" },
              { l: "Ngày tạo", v: "15/03/2025", c: "" },
              { l: "Hạn dự kiến chốt", v: "31/03/2025", c: "var(--warning)" },
              { l: "Chiến dịch", v: "Vay Mua Nhà Q1/2025", c: "" },
            ].map((item) => (
              <div key={item.l} className="surface-box">
                <div className="fs-11 text-secondary">{item.l}</div>
                <div className="fw-600 fs-12" style={{ color: item.c || "var(--text-primary)", marginTop: 3 }}>{item.v}</div>
              </div>
            ))}
          </div>
          <FormGroup label="Ghi chú cơ hội">
            <textarea className="form-input" rows={3} defaultValue="KH có tài sản đảm bảo tốt, doanh thu ổn định ~50 tỷ/năm. Đang cạnh tranh với MB Bank và Techcombank. Ưu đãi lãi suất 7.5% là lợi thế cạnh tranh chính." />
          </FormGroup>
        </div>
      )}

      {activeTab === "docs" && (
        <div>
          <div style={{ marginBottom: 12, fontSize: 12, color: "var(--text-secondary)" }}>Danh sách tài liệu cần thiết cho hồ sơ vay DN</div>
          {[
            { name: "Đăng ký kinh doanh", status: "done", file: "DKKD_DucThanh.pdf" },
            { name: "BCTC 3 năm gần nhất", status: "done", file: "BCTC_2022_2024.xlsx" },
            { name: "Phương án kinh doanh", status: "pending", file: null },
            { name: "Tài sản đảm bảo (sổ đỏ/GCNQSD)", status: "done", file: "TaiSanDB.pdf" },
            { name: "Hợp đồng thế chấp (dự thảo)", status: "pending", file: null },
          ].map((doc) => (
            <div key={doc.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--surface)", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: doc.status === "done" ? "var(--success)" : "var(--warning)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.name}</div>
                {doc.file && <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{doc.file}</div>}
              </div>
              {doc.status === "done"
                ? <button className="btn-icon-sm" onClick={() => showToast("Đang tải tài liệu...", "info")}>Tải</button>
                : <button className="btn-icon-sm" onClick={() => showToast("Chọn file để upload", "info")}>Upload</button>
              }
            </div>
          ))}
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 4 }} onClick={() => showToast("Chọn tài liệu từ thư viện", "info")}>
            + Thêm tài liệu
          </button>
        </div>
      )}

      {activeTab === "tasks" && (
        <div>
          {["Gọi xác nhận thông tin BCTC – Minh Quân", "Lên lịch họp Credit Team review hồ sơ", "Hoàn thiện dự thảo HĐ thế chấp"].map((t, i) => (
            <div key={i} className={`deal-task-item${i === 0 ? " deal-task-item--done" : ""}`}
              onClick={(e) => { const el = e.currentTarget; el.classList.toggle("deal-task-item--done"); }}>
              <div className={`dtask-cb${i === 0 ? " dtask-cb--done" : ""}`}>{i === 0 ? "✓" : ""}</div>
              <span>{t}</span>
            </div>
          ))}
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={() => openModal("modal-new-task")}>+ Thêm task</button>
        </div>
      )}

      {activeTab === "history" && (
        <div className="activity-list">
          {[
            { dot: "deal", text: "Minh Quân tạo cơ hội từ Lead LD005", time: "15/03 08:45" },
            { dot: "call", text: "Hà Thu gọi điện xác nhận nhu cầu KH", time: "16/03 10:00" },
            { dot: "meet", text: "Họp tư vấn tại văn phòng KH – 2 giờ", time: "18/03 14:00" },
            { dot: "syst", text: "Upload BCTC và DKKD vào hồ sơ", time: "19/03 09:30" },
            { dot: "alert", text: "Chuyển sang giai đoạn Lập hồ sơ", time: "19/03 11:00" },
          ].map((a, i) => (
            <div key={i} className="activity-item">
              <div className={`dot dot--${a.dot}`} />
              <div className="text">{a.text}</div>
              <div className="time">{a.time}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ── NEW APPROVAL MODAL ─────────────────────────────────
function ModalNewApproval() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-new-approval" title="Tạo Đề xuất Phê duyệt" size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đề xuất đã được gửi lên cấp duyệt", "success"); closeModal(); }}>Gửi đề xuất</button>
        </>
      }>
      <div className="form-grid">
        <FormGroup label="Khách hàng *" full>
          <input className="form-input" placeholder="Tên KH / Doanh nghiệp..." />
        </FormGroup>
        <FormGroup label="Loại đề xuất *">
          <select className="form-select">
            <option>Lãi suất ưu đãi</option>
            <option>Hạn mức tín dụng đặc biệt</option>
            <option>Gia hạn khoản vay</option>
            <option>Cơ cấu nợ</option>
            <option>Miễn/giảm phí sản phẩm</option>
            <option>Phê duyệt nhanh (Expedited)</option>
          </select>
        </FormGroup>
        <FormGroup label="Giá trị đề xuất">
          <input className="form-input" placeholder="VD: 12.500.000.000 / 7.5%" />
        </FormGroup>
        <FormGroup label="Sản phẩm liên quan">
          <select className="form-select"><option>Vay tài sản</option><option>Vay doanh nghiệp</option><option>Thẻ tín dụng</option><option>Tiết kiệm</option><option>Bancassurance</option></select>
        </FormGroup>
        <FormGroup label="Cấp phê duyệt yêu cầu">
          <select className="form-select">
            <option>Cấp 1 – Branch Manager</option>
            <option>Cấp 2 – Credit Team</option>
            <option>Cấp 3 – Regional Director</option>
          </select>
        </FormGroup>
        <FormGroup label="Hạn xử lý">
          <input className="form-input" type="date" />
        </FormGroup>
        <FormGroup label="Lý do đề xuất *" full>
          <textarea className="form-input" rows={4} placeholder="Nêu rõ lý do, cơ sở và lợi ích của đề xuất này..." />
        </FormGroup>
        <FormGroup label="Tài liệu đính kèm" full>
          <div className="upload-zone" onClick={() => showToast("Chọn tài liệu đính kèm", "info")}>
            <div className="icon" style={{ fontSize: 20 }}>📎</div>
            <div className="title" style={{ fontSize: 12 }}>Click để đính kèm tài liệu hỗ trợ</div>
          </div>
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── APPROVAL DETAIL MODAL ──────────────────────────────
function ModalApprovalDetail() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-approval-detail" title="Chi tiết Đề xuất #PD-2851" size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
          <button className="btn btn--danger" onClick={() => { showToast("Đã từ chối #PD-2851", "error"); closeModal(); }}>Từ chối</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã phê duyệt #PD-2851", "success"); closeModal(); }}>Phê duyệt ✓</button>
        </>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { l: "Khách hàng", v: "TNHH Đức Thành" },
          { l: "Loại đề xuất", v: "Lãi suất ưu đãi 7.5%" },
          { l: "Giá trị", v: "12.5 tỷ đồng", c: "var(--accent-bright)" },
          { l: "Hạn xử lý", v: "22/03/2025", c: "var(--warning)" },
          { l: "RM đề xuất", v: "Lê Minh Quân" },
          { l: "Ngày gửi", v: "19/03/2025 08:45" },
        ].map((item) => (
          <div key={item.l} className="surface-box">
            <div className="fs-11 text-secondary">{item.l}</div>
            <div className="fw-600 fs-12" style={{ color: (item as any).c || "var(--text-primary)", marginTop: 3 }}>{item.v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <div className="form-label" style={{ marginBottom: 6 }}>Lý do đề xuất</div>
        <div className="surface-box" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          KH là đối tác lâu năm, doanh thu ổn định 50+ tỷ/năm. Đề nghị lãi suất ưu đãi 7.5% (thấp hơn 0.5% so với tiêu chuẩn) để giữ chân KH trong bối cảnh cạnh tranh với MB Bank và Techcombank đang tiếp cận.
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div className="form-label" style={{ marginBottom: 8 }}>Tiến trình phê duyệt</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Lê Minh Quân (RM) – Gửi đề xuất", time: "19/03 08:45", type: "done" },
            { label: "Branch Manager – Đang chờ duyệt", time: "Chờ xử lý từ 19/03 09:00", type: "active" },
            { label: "Credit Team – Chờ", time: "Chưa tới lượt", type: "pending" },
          ].map((step) => (
            <div key={step.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: 10,
              background: step.type === "done" ? "var(--success-soft)" : step.type === "active" ? "var(--warning-soft)" : "var(--surface)",
              borderRadius: 8,
              borderLeft: `3px solid ${step.type === "done" ? "var(--success)" : step.type === "active" ? "var(--warning)" : "var(--border)"}`,
              opacity: step.type === "pending" ? 0.5 : 1,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: step.type === "done" ? "var(--success)" : step.type === "active" ? "var(--warning)" : "var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: step.type === "pending" ? "var(--text-muted)" : "white",
              }}>
                {step.type === "done" ? "✓" : step.type === "active" ? "!" : "—"}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{step.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{step.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <FormGroup label="Ghi chú khi duyệt / từ chối">
        <textarea className="form-input" rows={2} placeholder="Nhập ghi chú (không bắt buộc)..." />
      </FormGroup>
    </Modal>
  );
}

// ── APPROVAL FILTER MODAL ──────────────────────────────
function ModalApprovalFilter() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-approval-filter" title="Lọc Đề xuất" size="sm"
      footer={
        <>
          <button className="btn btn--ghost" onClick={() => showToast("Đã xóa bộ lọc", "info")}>Xóa lọc</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã áp dụng", "success"); closeModal(); }}>Áp dụng</button>
        </>
      }>
      <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
        <FormGroup label="Trạng thái">
          <select className="form-select"><option>Tất cả</option><option>Chờ duyệt</option><option>Đang xem xét</option><option>Đã duyệt</option><option>Từ chối</option></select>
        </FormGroup>
        <FormGroup label="Loại đề xuất">
          <select className="form-select"><option>Tất cả</option><option>Lãi suất ưu đãi</option><option>Hạn mức đặc biệt</option><option>Gia hạn</option><option>Cơ cấu nợ</option></select>
        </FormGroup>
        <FormGroup label="RM đề xuất">
          <select className="form-select"><option>Tất cả</option><option>Nguyễn Hà Thu</option><option>Trần Nguyên</option><option>Vũ Ngọc Anh</option><option>Lê Minh Quân</option></select>
        </FormGroup>
        <FormGroup label="Hạn xử lý">
          <input className="form-input" type="date" />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── NEW TASK MODAL ─────────────────────────────────────
function ModalNewTask() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-new-task" title="Tạo Task / Lịch hẹn" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Task đã được tạo thành công", "success"); closeModal(); }}>Tạo Task</button>
        </>
      }>
      <div className="form-grid">
        <FormGroup label="Tiêu đề task *" full>
          <input className="form-input" placeholder="Gọi điện / Họp / Gửi tài liệu..." />
        </FormGroup>
        <FormGroup label="Loại hoạt động">
          <select className="form-select"><option>Gọi điện</option><option>Gặp mặt trực tiếp</option><option>Gửi email</option><option>Gửi SMS</option><option>Video call</option><option>Họp nội bộ</option><option>Khác</option></select>
        </FormGroup>
        <FormGroup label="Độ ưu tiên">
          <select className="form-select"><option>Cao</option><option>Trung bình</option><option>Thấp</option></select>
        </FormGroup>
        <FormGroup label="Khách hàng liên quan">
          <input className="form-input" placeholder="Tìm tên KH..." />
        </FormGroup>
        <FormGroup label="Cơ hội liên quan">
          <input className="form-input" placeholder="Tìm cơ hội..." />
        </FormGroup>
        <FormGroup label="Ngày thực hiện *">
          <input className="form-input" type="date" />
        </FormGroup>
        <FormGroup label="Giờ thực hiện">
          <input className="form-input" type="time" defaultValue="09:00" />
        </FormGroup>
        <FormGroup label="Người thực hiện">
          <select className="form-select"><option>Trần Nguyên (tôi)</option><option>Nguyễn Hà Thu</option><option>Vũ Ngọc Anh</option><option>Lê Minh Quân</option></select>
        </FormGroup>
        <FormGroup label="Ghi chú" full>
          <textarea className="form-input" rows={3} placeholder="Nội dung cần chuẩn bị, lưu ý..." />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── NEW CAMPAIGN MODAL ─────────────────────────────────
function ModalNewCampaign() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-new-campaign" title="Tạo Chiến dịch mới" size="xl"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--ghost" onClick={() => { showToast("Đã lưu bản nháp", "info"); closeModal(); }}>Lưu nháp</button>
          <button className="btn btn--primary" onClick={() => { showToast("Chiến dịch đã được tạo & kích hoạt!", "success"); closeModal(); }}>Tạo & Kích hoạt</button>
        </>
      }>
      <div className="form-grid">
        <FormGroup label="Tên chiến dịch *" full>
          <input className="form-input" placeholder="VD: Vay Mua Nhà Lãi Suất Ưu Đãi Q2/2025" />
        </FormGroup>
        <FormGroup label="Loại sản phẩm *">
          <select className="form-select"><option>Vay tài sản</option><option>Vay doanh nghiệp</option><option>Thẻ tín dụng</option><option>Tiết kiệm</option><option>Bancassurance</option><option>Đa sản phẩm</option></select>
        </FormGroup>
        <FormGroup label="Quy trình bán áp dụng">
          <select className="form-select"><option>Vay Mua Nhà (chuẩn)</option><option>Thẻ Tín Dụng</option><option>Bancassurance</option><option>Tạo quy trình mới...</option></select>
        </FormGroup>
        <FormGroup label="Ngày bắt đầu *">
          <input className="form-input" type="date" />
        </FormGroup>
        <FormGroup label="Ngày kết thúc *">
          <input className="form-input" type="date" />
        </FormGroup>
        <FormGroup label="Mục tiêu doanh số">
          <input className="form-input" placeholder="VD: 80 tỷ" />
        </FormGroup>
        <FormGroup label="KH mục tiêu">
          <input className="form-input" type="number" placeholder="200" />
        </FormGroup>
        <FormGroup label="Khu vực áp dụng">
          <select className="form-select"><option>Toàn hệ thống</option><option>Chi nhánh HN</option><option>Chi nhánh HCM</option><option>Chọn RM cụ thể</option></select>
        </FormGroup>
        <FormGroup label="Ngân sách marketing">
          <input className="form-input" placeholder="200.000.000đ" />
        </FormGroup>
        <FormGroup label="Mô tả chiến dịch" full>
          <textarea className="form-input" rows={3} placeholder="Mục tiêu, đối tượng KH, ưu đãi đặc biệt..." />
        </FormGroup>
        <FormGroup label="Tài liệu đính kèm" full>
          <div className="form-checkbox-list">
            {["Script tư vấn Vay Mua Nhà", "Bảng lãi suất Q1/2025", "Brochure ưu đãi"].map((d) => (
              <label key={d} className="form-checkbox-item">
                <input type="checkbox" /> {d}
              </label>
            ))}
            <span className="doc-chip" style={{ borderStyle: "dashed" }} onClick={() => showToast("Upload tài liệu mới", "info")}>+ Upload mới</span>
          </div>
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── CAMPAIGN EDIT MODAL ────────────────────────────────
function ModalCampaignEdit() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-campaign-edit" title="Chỉnh sửa Chiến dịch" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Chiến dịch đã được cập nhật", "success"); closeModal(); }}>Lưu thay đổi</button>
        </>
      }>
      <div className="form-grid">
        <FormGroup label="Tên chiến dịch" full>
          <input className="form-input" defaultValue="Vay Mua Nhà Lãi Suất Ưu Đãi Q1/2025" />
        </FormGroup>
        <FormGroup label="Ngày kết thúc">
          <input className="form-input" type="date" defaultValue="2025-03-31" />
        </FormGroup>
        <FormGroup label="Mục tiêu DS (tỷ)">
          <input className="form-input" type="number" defaultValue={80} />
        </FormGroup>
        <FormGroup label="Trạng thái">
          <select className="form-select"><option>Đang chạy</option><option>Tạm dừng</option><option>Kết thúc</option></select>
        </FormGroup>
        <FormGroup label="Khu vực">
          <select className="form-select"><option>Chi nhánh HN</option><option>Toàn hệ thống</option></select>
        </FormGroup>
        <FormGroup label="Ghi chú" full>
          <textarea className="form-input" rows={2} placeholder="Cập nhật nội dung chiến dịch..." />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── NEW DOC MODAL ──────────────────────────────────────
function ModalNewDoc() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-new-doc" title="Upload Tài liệu bán hàng" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Tài liệu đã được lưu thành công", "success"); closeModal(); }}>Lưu tài liệu</button>
        </>
      }>
      <div className="upload-zone" onClick={() => showToast("Chọn file để upload", "info")}>
        <div className="icon">📁</div>
        <div className="title">Kéo thả file vào đây hoặc click để chọn</div>
        <div className="hint">PDF, Word, Excel, PowerPoint · Tối đa 20MB</div>
      </div>
      <div className="form-grid">
        <FormGroup label="Tên tài liệu *" full>
          <input className="form-input" placeholder="Script tư vấn / Bảng phí / Brochure..." />
        </FormGroup>
        <FormGroup label="Loại tài liệu">
          <select className="form-select"><option>Script tư vấn</option><option>Bảng phí / Lãi suất</option><option>Brochure</option><option>Mẫu biểu / Form</option><option>Hướng dẫn nội bộ</option></select>
        </FormGroup>
        <FormGroup label="Áp dụng chiến dịch">
          <select className="form-select"><option>Tất cả chiến dịch</option><option>Vay Mua Nhà Q1</option><option>Thẻ TD Hoàn Tiền</option></select>
        </FormGroup>
        <FormGroup label="Áp dụng tại bước" full>
          <div className="form-checkbox-list">
            {["Tiếp cận", "Tư vấn", "Lập hồ sơ", "Thẩm định", "Chốt HĐ"].map((step) => (
              <label key={step} className="form-checkbox-item">
                <input type="checkbox" defaultChecked={["Tiếp cận", "Tư vấn"].includes(step)} /> {step}
              </label>
            ))}
          </div>
        </FormGroup>
        <FormGroup label="Ghi chú sử dụng" full>
          <textarea className="form-input" rows={2} placeholder="Hướng dẫn RM sử dụng tài liệu này..." />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── VIEW DOC MODAL ─────────────────────────────────────
function ModalViewDoc() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-view-doc" title="Script tư vấn Vay Mua Nhà" size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
          <button className="btn btn--ghost" onClick={() => showToast("Đã tải xuống tài liệu", "success")}>Tải xuống</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã chia sẻ link cho KH", "success"); closeModal(); }}>Chia sẻ cho KH</button>
        </>
      }>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ fontSize: 36, flexShrink: 0 }}>📄</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Script tư vấn Vay Mua Nhà.pdf</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="doc-tag-chip" style={{ background: "var(--accent-soft)", color: "var(--accent-bright)" }}>Script</span>
            <span className="doc-tag-chip" style={{ background: "rgba(0,200,150,0.1)", color: "var(--success)" }}>Vay Mua Nhà</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>PDF · 2.4 MB · Cập nhật 01/03/2025</span>
          </div>
        </div>
      </div>
      <div style={{ background: "var(--navy)", borderRadius: 10, padding: 20, marginBottom: 14, fontSize: 13, lineHeight: 1.8, color: "var(--text-secondary)", maxHeight: 260, overflowY: "auto" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>SCRIPT TƯ VẤN VAY MUA NHÀ – CRM Banking</div>
        <div style={{ fontWeight: 600, color: "var(--accent-bright)", marginBottom: 6 }}>Bước 1: Mở đầu cuộc gọi / gặp gỡ</div>
        <div style={{ marginBottom: 12 }}>"Chào anh/chị [Tên KH], em là [Tên RM]. Em gọi để chia sẻ về chương trình Vay Mua Nhà lãi suất chỉ từ 7.5%/năm đang có ưu đãi đặc biệt..."</div>
        <div style={{ fontWeight: 600, color: "var(--gold)", marginBottom: 6 }}>Bước 2: Khám phá nhu cầu</div>
        <div style={{ marginBottom: 12 }}>• Anh/chị có kế hoạch mua nhà trong thời gian sắp tới không?<br />• Dự kiến giá trị căn nhà khoảng bao nhiêu?<br />• Anh/chị cần vay khoảng bao nhiêu % giá trị căn nhà?</div>
        <div style={{ fontWeight: 600, color: "var(--success)", marginBottom: 6 }}>Bước 3: Giới thiệu sản phẩm</div>
        <div>"Ngân hàng hiện có gói vay mua nhà với lãi suất ưu đãi 7.5%/năm trong 12 tháng đầu, thời hạn vay lên đến 25 năm, giải ngân trong 5 ngày làm việc..."</div>
      </div>
      <div className="info-banner info-banner--green">Tài liệu được dùng tại bước: <strong>Tiếp cận</strong> và <strong>Tư vấn</strong> trong quy trình Vay Mua Nhà</div>
    </Modal>
  );
}

// ── BPMN NEW PROCESS MODAL ─────────────────────────────
function ModalBpmnNew() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-bpmn-new" title="Tạo Quy trình bán mới" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã tạo quy trình mới, đang mở BPMN editor...", "success"); closeModal(); }}>Tạo & Mở Editor</button>
        </>
      }>
      <div className="form-grid">
        <FormGroup label="Tên quy trình *" full>
          <input className="form-input" placeholder="VD: Quy trình Vay Tiêu Dùng Tín Chấp" />
        </FormGroup>
        <FormGroup label="Sản phẩm áp dụng">
          <select className="form-select"><option>Vay tài sản</option><option>Vay doanh nghiệp</option><option>Vay tiêu dùng</option><option>Thẻ tín dụng</option><option>Tiết kiệm</option><option>Bancassurance</option></select>
        </FormGroup>
        <FormGroup label="Nhân bản từ quy trình có sẵn">
          <select className="form-select"><option>Quy trình mới (trống)</option><option>Vay Mua Nhà (chuẩn)</option><option>Thẻ Tín Dụng</option><option>Bancassurance</option></select>
        </FormGroup>
        <FormGroup label="Mô tả" full>
          <textarea className="form-input" rows={3} placeholder="Mô tả ngắn về quy trình..." />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ── BPMN IMPORT MODAL ──────────────────────────────────
function ModalBpmnImport() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-bpmn-import" title="Import BPMN XML" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã import BPMN thành công", "success"); closeModal(); }}>Import</button>
        </>
      }>
      <div className="upload-zone" onClick={() => showToast("Chọn file .bpmn hoặc .xml", "info")}>
        <div className="icon">📋</div>
        <div className="title">Kéo thả file .bpmn hoặc click để chọn</div>
        <div className="hint">Định dạng BPMN 2.0 XML · Tối đa 5MB</div>
      </div>
      <div className="info-banner info-banner--blue">Hệ thống sẽ validate BPMN 2.0 sau khi upload. Các element không hỗ trợ sẽ được highlight.</div>
    </Modal>
  );
}

// ── BPMN DEPLOY MODAL ─────────────────────────────────
function ModalBpmnDeploy() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-bpmn-deploy" title="Deploy lên BPM Engine" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã deploy proc_vay_mua_nha_v2 lên BPM Engine", "success"); closeModal(); }}>Deploy</button>
        </>
      }>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface)", borderRadius: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Process ID</span>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--accent-bright)" }}>proc_vay_mua_nha_v2</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface)", borderRadius: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Version</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>v2.1 → v2.2</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface)", borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>BPM Engine URL</span>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)" }}>bpm.rebornbank.vn:8080</span>
        </div>
      </div>
      <div className="info-banner info-banner--warning">
        Deploy sẽ ảnh hưởng đến tất cả giao dịch mới. Các giao dịch đang xử lý sẽ tiếp tục chạy trên v2.1.
      </div>
    </Modal>
  );
}

// ── SEND SURVEY (NPS) MODAL ────────────────────────────
function ModalSendSurvey() {
  const { showToast, closeModal } = useApp();
  return (
    <Modal id="modal-send-survey" title="Gửi Khảo sát NPS" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Đã gửi 187 khảo sát NPS", "success"); closeModal(); }}>Gửi khảo sát</button>
        </>
      }>
      <div className="form-grid">
        <FormGroup label="Chọn nhóm KH" full>
          <select className="form-select">
            <option>Tất cả KH tháng này (187)</option>
            <option>KH VIP Platinum (23)</option>
            <option>KH mới trong 30 ngày (48)</option>
            <option>KH chưa được khảo sát Q1</option>
            <option>Detractors cần follow-up (12)</option>
          </select>
        </FormGroup>
        <FormGroup label="Kênh gửi">
          <select className="form-select"><option>SMS</option><option>Email</option><option>Zalo OA</option><option>Cả ba kênh</option></select>
        </FormGroup>
        <FormGroup label="Thời gian gửi">
          <select className="form-select"><option>Ngay lập tức</option><option>Lên lịch hẹn giờ</option></select>
        </FormGroup>
        <FormGroup label="Nội dung tin nhắn" full>
          <textarea className="form-input" rows={3} defaultValue="Kính gửi Quý khách, Ngân hàng trân trọng mời bạn đánh giá chất lượng dịch vụ (1-2 phút). Cảm ơn sự hợp tác!" />
        </FormGroup>
      </div>
      <div className="info-banner info-banner--blue">
        Ước tính 187 tin nhắn · Chi phí SMS: ~280.000đ · Tỷ lệ phản hồi dự kiến: 45%
      </div>
    </Modal>
  );
}

// ── NPS DETAIL MODAL ───────────────────────────────────
function ModalNpsDetail() {
  const { showToast, closeModal, openModal } = useApp();
  return (
    <Modal id="modal-nps-detail" title="Chi tiết phản hồi NPS" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
          <button className="btn btn--primary" onClick={() => { closeModal(); openModal("modal-new-task"); }}>Tạo task follow-up</button>
        </>
      }>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: 14, background: "var(--success-soft)", borderRadius: 10 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#F5A623,#F57C00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0 }}>TC</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Trương Bảo Châu</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>VIP Platinum · RM: Hà Thu</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: "var(--success)", lineHeight: 1 }}>10</div>
          <div style={{ fontSize: 11, color: "var(--success)" }}>Promoter</div>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div className="form-label" style={{ marginBottom: 6 }}>Nhận xét của khách hàng</div>
        <div className="surface-box" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", fontStyle: "italic" }}>
          "RM rất nhiệt tình, am hiểu sản phẩm, tư vấn chuyên nghiệp. Thủ tục nhanh gọn, tôi rất hài lòng với dịch vụ."
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Tốc độ xử lý", "5/5"], ["Sản phẩm", "5/5"], ["Thái độ RM", "5/5"]].map(([l, v]) => (
          <div key={l} className="surface-box" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--success)" }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="info-banner info-banner--gold">
        Cơ hội: KH sẵn sàng giới thiệu. Đề xuất chương trình Referral – tặng phí năm đầu thẻ Infinity.
      </div>
    </Modal>
  );
}

// ── CORE BANKING SYNC MODAL ────────────────────────────
function ModalCoreBankingSync() {
  const { showToast, closeModal } = useApp();
  const [syncing, setSyncing] = useState(false);
  return (
    <Modal id="modal-corebankingsync" title="Core Banking Sync" size="md"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
          <button className="btn btn--primary" onClick={() => {
            setSyncing(true);
            setTimeout(() => { setSyncing(false); showToast("Đồng bộ Core Banking thành công – 247 records updated", "success"); closeModal(); }, 1800);
          }}>
            {syncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
          </button>
        </>
      }>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "var(--surface)", borderRadius: 8, marginBottom: 8, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Trạng thái kết nối</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>T24 Core Banking System</div>
          </div>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", fontWeight: 600 }}>● Connected</span>
        </div>
        {[
          { label: "Thông tin KH", last: "20/03/2025 08:00", count: "1,247 records" },
          { label: "Sản phẩm & Dư nợ", last: "20/03/2025 07:30", count: "3,891 accounts" },
          { label: "Giao dịch 30 ngày", last: "20/03/2025 06:00", count: "45,221 txns" },
          { label: "Phê duyệt tín dụng", last: "20/03/2025 09:15", count: "34 records" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface)", borderRadius: 8, marginBottom: 8, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Lần cuối: {item.last}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-bright)" }}>{item.count}</div>
              <button className="btn-icon-sm" style={{ marginTop: 4 }} onClick={() => showToast(`Đang sync ${item.label}...`, "info")}>Sync</button>
            </div>
          </div>
        ))}
      </div>
      <div className="info-banner info-banner--blue">
        Tần suất tự động: mỗi 30 phút. Cấu hình tại <strong>Cài đặt → Tích hợp hệ thống</strong>.
      </div>
    </Modal>
  );
}

// ── NOTIFICATIONS MODAL ────────────────────────────────
function ModalNotifications() {
  const { closeModal, setActivePage } = useApp();
  const notifications = [
    { color: "var(--danger)", title: "KH Lê Hải Nam sắp đáo hạn thẻ tín dụng", sub: "Hạn thanh toán còn 2 ngày · 22/03/2025", time: "2p", read: false },
    { color: "var(--success)", title: "Đề xuất #PD-2847 đã được phê duyệt cấp 3", sub: "Công ty ABC Corp · Vay 4.8 tỷ", time: "15p", read: false },
    { color: "var(--gold)", title: "Lead mới từ Website: TNHH Thái Bình Dương", sub: "Vay doanh nghiệp · 8 tỷ · Chờ phân công RM", time: "32p", read: false },
    { color: "var(--border-hover)", title: "Trương Bảo Châu gửi NPS 10 điểm", sub: "RM rất nhiệt tình, tư vấn chuyên nghiệp", time: "1g", read: true },
    { color: "var(--border-hover)", title: "Nhắc nhở: Họp KPI tháng 3 lúc 16:00", sub: "Ngày mai 21/03 · Phòng họp A1", time: "3g", read: true },
  ];
  return (
    <Modal id="modal-notifications" title="Thông báo" size="sm"
      footer={
        <button className="btn btn--ghost" style={{ width: "100%" }} onClick={() => { setActivePage("tasks"); closeModal(); }}>
          Xem tất cả hoạt động
        </button>
      }>
      <div style={{ padding: "0 0" }}>
        {notifications.map((n, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)", cursor: "pointer", opacity: n.read ? 0.6 : 1 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{n.sub}</div>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{n.time}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── PROFILE MODAL ──────────────────────────────────────
function ModalProfile() {
  const { user, showToast, closeModal, openModal, setActivePage } = useApp();
  return (
    <Modal id="modal-profile" title="Hồ sơ cá nhân" size="sm"
      footer={null}>
      <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white", margin: "0 auto 12px" }}>
          {user.initials}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{user.role} · {user.branch}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--success-soft)", color: "var(--success)", marginTop: 8 }}>● Đang hoạt động</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[["Doanh số T3", "3.8 tỷ", "var(--success)"], ["KPI đạt", "95%", "var(--accent-bright)"], ["Deals tháng", "12", "var(--gold)"], ["Xếp hạng", "#2", "var(--warning)"]].map(([l, v, c]) => (
          <div key={l} className="surface-box" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c as string }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        {[
          { icon: "⚙️", label: "Cài đặt tài khoản", action: () => openModal("modal-settings") },
          { icon: "📊", label: "Xem KPI của tôi", action: () => { setActivePage("kpi"); closeModal(); } },
          { icon: "🚪", label: "Đăng xuất", action: () => { showToast("Đã đăng xuất tài khoản", "info"); closeModal(); }, danger: true },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s", color: (item as any).danger ? "var(--danger)" : "var(--text-secondary)" }}
            onClick={item.action}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = (item as any).danger ? "var(--danger-soft)" : "var(--surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}>
            <span>{item.icon}</span>
            <span style={{ fontSize: 13 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── SETTINGS MODAL ─────────────────────────────────────
function ModalSettings() {
  const { showToast, closeModal } = useApp();
  const [tab, setTab] = useState("general");
  return (
    <Modal id="modal-settings" title="Cài đặt hệ thống" size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn--primary" onClick={() => { showToast("Cài đặt đã được lưu", "success"); closeModal(); }}>Lưu thay đổi</button>
        </>
      }>
      <div className="modal-tabs">
        {[["general", "Chung"], ["notify", "Thông báo"], ["security", "Bảo mật"], ["integration", "Tích hợp"]].map(([k, l]) => (
          <button key={k} className={`modal-tab${tab === k ? " modal-tab--active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "general" && (
        <div className="form-grid">
          <FormGroup label="Họ tên"><input className="form-input" defaultValue="Trần Nguyên" /></FormGroup>
          <FormGroup label="Mã nhân viên"><input className="form-input" defaultValue="RM-HN-042" readOnly /></FormGroup>
          <FormGroup label="Email"><input className="form-input" type="email" defaultValue="t.nguyen@rebornbank.vn" /></FormGroup>
          <FormGroup label="Điện thoại"><input className="form-input" defaultValue="0912 345 678" /></FormGroup>
          <FormGroup label="Chi nhánh">
            <select className="form-select"><option>HN – Quận 2</option><option>HN – Quận 1</option><option>HN – Quận 3</option></select>
          </FormGroup>
          <FormGroup label="Múi giờ">
            <select className="form-select"><option>GMT+7 (Hà Nội)</option></select>
          </FormGroup>
        </div>
      )}
      {tab === "notify" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["Nhắc đáo hạn sản phẩm", "Trước 3 ngày", true],
            ["Lead mới được phân công", "Thông báo ngay lập tức", true],
            ["Kết quả phê duyệt hồ sơ", "Duyệt / Từ chối đề xuất", true],
            ["Báo cáo KPI tuần", "Mỗi sáng thứ 2", false],
            ["Cảnh báo NPS thấp", "Khi KH đánh giá ≤ 6", true],
          ].map(([label, sub, on]) => (
            <div key={label as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "var(--surface)", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{label as string}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{sub as string}</div>
              </div>
              <div style={{ width: 40, height: 22, borderRadius: 20, background: on ? "var(--success)" : "var(--surface-hover)", border: `1px solid ${on ? "var(--success)" : "var(--border)"}`, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: on ? "white" : "var(--text-muted)", transition: "all 0.2s" }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "security" && (
        <div className="form-grid">
          <FormGroup label="Mật khẩu hiện tại" full><input className="form-input" type="password" placeholder="••••••••" /></FormGroup>
          <FormGroup label="Mật khẩu mới"><input className="form-input" type="password" placeholder="••••••••" /></FormGroup>
          <FormGroup label="Xác nhận mật khẩu"><input className="form-input" type="password" placeholder="••••••••" /></FormGroup>
          <div style={{ gridColumn: "1/-1" }}>
            <div className="info-banner info-banner--green">Xác thực 2 lớp (2FA) đang bật · Thiết bị được nhận diện: 2</div>
          </div>
        </div>
      )}
      {tab === "integration" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { name: "Core Banking (T24)", status: "connected", url: "bpm.rebornbank.vn:8080" },
            { name: "BPM Engine (Camunda)", status: "connected", url: "bpm.rebornbank.vn:8080/engine" },
            { name: "Zalo OA", status: "connected", url: "OA: @rebornbank" },
            { name: "Email SMTP", status: "connected", url: "smtp.rebornbank.vn:587" },
            { name: "SMS Gateway", status: "warning", url: "Cần cập nhật API key" },
          ].map((item) => (
            <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "var(--surface)", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{item.url}</div>
              </div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: item.status === "connected" ? "var(--success-soft)" : "var(--warning-soft)", color: item.status === "connected" ? "var(--success)" : "var(--warning)", fontWeight: 600 }}>
                {item.status === "connected" ? "● Kết nối" : "⚠ Cảnh báo"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ── CAMPAIGN DETAIL MODAL ─────────────────────────────
function ModalCampaignDetail() {
  const { showToast, closeModal, setActivePage } = useApp();
  const [tab, setTab] = useState("docs");
  return (
    <Modal id="modal-campaign-detail" title="Vay Mua Nhà Lãi Suất Ưu Đãi Q1/2025" size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={closeModal}>Đóng</button>
          <button className="btn btn--ghost" onClick={() => { closeModal(); }}>Chỉnh sửa</button>
          <button className="btn btn--primary" onClick={() => { closeModal(); setActivePage("pipeline"); }}>Vào Pipeline</button>
        </>
      }>
      {/* KPI Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { l: "Doanh số", v: "62.4 tỷ", s: "/ 80 tỷ KH", c: "var(--success)" },
          { l: "Leads", v: "247", s: "/ 200 KH", c: "var(--accent-bright)" },
          { l: "HĐ ký", v: "84", s: "34% CVR", c: "var(--gold)" },
          { l: "Còn lại", v: "11 ngày", s: "Kết thúc 31/03", c: "var(--warning)" },
        ].map((item) => (
          <div key={item.l} style={{ background: "var(--surface)", borderRadius: 8, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 3 }}>{item.l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: item.c }}>{item.v}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{item.s}</div>
          </div>
        ))}
      </div>
      <div className="modal-tabs">
        {[["docs","Tài liệu (3)"],["kpi","Mục tiêu KPI"],["process","Quy trình"],["results","Kết quả RM"]].map(([k,l]) => (
          <button key={k} className={`modal-tab${tab === k ? " modal-tab--active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "docs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["📄", "Script tư vấn Vay Mua Nhà.pdf", "2.4 MB · Bước: Tiếp cận, Tư vấn"],
            ["📊", "Bảng lãi suất Q1-2025.xlsx", "380 KB · Bước: Tư vấn"],
            ["🖼", "Brochure ưu đãi.pptx", "5.1 MB · Bước: Tất cả"],
          ].map(([icon, name, meta]) => (
            <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--surface)", borderRadius: 9, cursor: "pointer" }}
              onClick={() => {}}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{meta}</div>
              </div>
              <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); showToast("Đã tải xuống", "success"); }}>Tải</button>
            </div>
          ))}
          <button className="btn btn--ghost btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => {}}>+ Đính kèm thêm</button>
        </div>
      )}
      {tab === "kpi" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { l: "Doanh số tín dụng", v: "62.4/80 tỷ", p: 78, c: "var(--success)" },
            { l: "Số lượng KH", v: "247/200", p: 100, c: "var(--accent)" },
            { l: "Hợp đồng ký", v: "84/200 HĐ", p: 42, c: "var(--gold)" },
          ].map((item) => (
            <div key={item.l} className="progress-item">
              <div className="progress-label-row">
                <span className="progress-label">{item.l}</span>
                <span className="pct" style={{ color: item.c }}>{item.v}</span>
              </div>
              <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${Math.min(item.p,100)}%`, background: item.c }} /></div>
            </div>
          ))}
        </div>
      )}
      {tab === "process" && (
        <div>
          <div style={{ background: "var(--success-soft)", borderRadius: 8, padding: 12, fontSize: 12, color: "var(--success)", marginBottom: 12 }}>
            Áp dụng quy trình: <strong>Vay Mua Nhà (chuẩn)</strong> · 5 bước · 14 tasks
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {["Tiếp cận","Tư vấn","Đề xuất","Thẩm định","Chốt HĐ"].map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ flexShrink: 0, background: "var(--surface)", borderRadius: 8, padding: "10px 14px", fontSize: 12, textAlign: "center", borderLeft: `3px solid ${["var(--accent)","var(--gold)","var(--purple)","var(--warning)","var(--success)"][i]}` }}>
                  <div style={{ fontWeight: 600, color: ["var(--accent-bright)","var(--gold)","var(--purple)","var(--warning)","var(--success)"][i] }}>{s}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 2 }}>{[3,4,3,2,2][i]} tasks</div>
                </div>
                {i < 4 && <div style={{ alignSelf: "center", color: "var(--text-muted)" }}>›</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      {tab === "results" && (
        <table className="data-table">
          <thead><tr><th>RM</th><th>Leads</th><th>Tư vấn</th><th>HĐ ký</th><th>DS (tỷ)</th></tr></thead>
          <tbody>
            {[["Hà Thu",68,52,28,"18.4","var(--success)"],["Trần Nguyên",54,41,22,"14.2","var(--accent-bright)"],["Ngọc Anh",48,35,18,"11.8","var(--gold)"],["Minh Quân",45,32,12,"10.2","var(--warning)"],["Văn Đức",32,22,4,"7.8","var(--danger)"]].map(([name,l,c,h,ds,col]) => (
              <tr key={name as string}>
                <td><div className="td-name">{name}</div></td>
                <td style={{ fontWeight: 600 }}>{l}</td><td>{c}</td>
                <td style={{ color: col as string, fontWeight: 600 }}>{h}</td>
                <td style={{ color: col as string, fontWeight: 700 }}>{ds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

// ── MAIN AllModals COMPONENT ───────────────────────────
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

// This needs to be exported separately and added - just making sure export is complete
