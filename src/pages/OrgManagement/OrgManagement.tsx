import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "contexts/AppContext";
import { apiGet, apiPost, apiDelete } from "configs/apiClient";
import { EmployeeService } from "services/index";

// ─── Types ────────────────────────────────────────────────────────────
interface IDept  { id: number; name: string; parentId?: number; type: "branch" | "dept" | "team"; headName?: string; memberCount?: number; }
interface IEmployee { id: number; name: string; code: string; email: string; phone: string; deptName: string; roleName: string; status: "active" | "inactive"; joinDate: string; avatar?: string; }
interface IRole { id: number; name: string; code: string; permissions: number; memberCount: number; createdAt: string; }
interface IPermRes { id: number; code: string; name: string; group: string; actions: string[]; }

// ─── Mock helpers (fall back when API unavailable) ─────────────────────
const MOCK_DEPTS: IDept[] = [
  { id: 1,  name: "Chi nhánh Hà Nội – Quận 2",   parentId: 0,  type: "branch", headName: "Nguyễn Văn Đức", memberCount: 42 },
  { id: 2,  name: "Phòng Kinh doanh Cá nhân",    parentId: 1,  type: "dept",   headName: "Lê Minh Quân",   memberCount: 18 },
  { id: 3,  name: "Phòng Kinh doanh Doanh nghiệp",parentId: 1, type: "dept",   headName: "Trần Quốc Hùng", memberCount: 12 },
  { id: 4,  name: "Phòng Thẩm định Tín dụng",    parentId: 1,  type: "dept",   headName: "Vũ Ngọc Lan",    memberCount: 8  },
  { id: 5,  name: "Chi nhánh Hà Nội – Quận 1",   parentId: 0,  type: "branch", headName: "Phạm Thu Hà",    memberCount: 35 },
  { id: 6,  name: "Phòng Kinh doanh Cá nhân",    parentId: 5,  type: "dept",   headName: "Đỗ Thị Mai",     memberCount: 15 },
  { id: 7,  name: "Chi nhánh TP.HCM – Quận 1",   parentId: 0,  type: "branch", headName: "Hoàng Minh Tân", memberCount: 58 },
  { id: 8,  name: "Phòng SME Banking",            parentId: 7,  type: "dept",   headName: "Nguyễn Hà Thu",  memberCount: 20 },
];

const MOCK_EMPLOYEES: IEmployee[] = [
  { id: 1, name: "Nguyễn Hà Thu",   code: "NV001", email: "ha.thu@rebornbank.vn",  phone: "0912 345 678", deptName: "Phòng SME Banking",        roleName: "Relationship Manager", status: "active",   joinDate: "01/02/2022" },
  { id: 2, name: "Trần Nguyên",     code: "NV002", email: "nguyen@rebornbank.vn",   phone: "0923 456 789", deptName: "KD Cá nhân – HN Q2",       roleName: "Relationship Manager", status: "active",   joinDate: "15/03/2021" },
  { id: 3, name: "Vũ Ngọc Anh",    code: "NV003", email: "ngoc.anh@rebornbank.vn", phone: "0934 567 890", deptName: "KD Cá nhân – HN Q2",       roleName: "Senior RM",            status: "active",   joinDate: "10/07/2020" },
  { id: 4, name: "Lê Minh Quân",   code: "NV004", email: "minh.quan@rebornbank.vn",phone: "0945 678 901", deptName: "KD Cá nhân – HN Q2",       roleName: "Branch Sales Manager", status: "active",   joinDate: "01/01/2019" },
  { id: 5, name: "Phạm Bảo Châu",  code: "NV005", email: "bao.chau@rebornbank.vn", phone: "0956 789 012", deptName: "Thẩm định Tín dụng",       roleName: "Credit Officer",       status: "active",   joinDate: "20/09/2021" },
  { id: 6, name: "Đỗ Thị Mai",     code: "NV006", email: "thi.mai@rebornbank.vn",  phone: "0967 890 123", deptName: "KD Cá nhân – HN Q1",       roleName: "Relationship Manager", status: "active",   joinDate: "05/04/2022" },
  { id: 7, name: "Hoàng Minh Tân", code: "NV007", email: "minh.tan@rebornbank.vn", phone: "0978 901 234", deptName: "Chi nhánh HCM Q1",         roleName: "Branch Manager",       status: "active",   joinDate: "12/06/2018" },
  { id: 8, name: "Nguyễn Văn Khánh",code:"NV008", email: "van.khanh@rebornbank.vn",phone: "0989 012 345", deptName: "KD Doanh nghiệp – HN Q2", roleName: "Relationship Manager", status: "inactive", joinDate: "01/11/2020" },
];

const MOCK_ROLES: IRole[] = [
  { id: 1, name: "System Admin",         code: "SYSADMIN",  permissions: 48, memberCount: 2,  createdAt: "01/01/2024" },
  { id: 2, name: "Branch Manager",       code: "BM",        permissions: 32, memberCount: 4,  createdAt: "01/01/2024" },
  { id: 3, name: "Credit Officer",       code: "CO",        permissions: 18, memberCount: 8,  createdAt: "01/01/2024" },
  { id: 4, name: "Relationship Manager", code: "RM",        permissions: 24, memberCount: 35, createdAt: "01/01/2024" },
  { id: 5, name: "Senior RM",            code: "SENIOR_RM", permissions: 28, memberCount: 12, createdAt: "15/02/2024" },
  { id: 6, name: "Compliance Officer",   code: "COMP",      permissions: 14, memberCount: 3,  createdAt: "01/03/2024" },
];

const PERM_GROUPS = [
  {
    group: "Lead & Pipeline",
    resources: [
      { code: "lead",     name: "Lead Management",  actions: ["view","create","edit","delete"] },
      { code: "pipeline", name: "Pipeline",          actions: ["view","create","edit","delete"] },
    ],
  },
  {
    group: "Chiến dịch",
    resources: [
      { code: "campaign", name: "Chiến dịch",        actions: ["view","create","edit","delete","activate"] },
    ],
  },
  {
    group: "Phê duyệt & Tín dụng",
    resources: [
      { code: "approval", name: "Phê duyệt",        actions: ["view","create","approve","reject"] },
      { code: "credit",   name: "Hồ sơ tín dụng",  actions: ["view","create","edit","export"] },
    ],
  },
  {
    group: "Quy trình & Cấu hình",
    resources: [
      { code: "process",  name: "Quy trình BPMN",   actions: ["view","create","edit","deploy"] },
      { code: "incentive",name: "Hoa hồng",         actions: ["view","manage"] },
    ],
  },
  {
    group: "Hệ thống",
    resources: [
      { code: "org",      name: "Tổ chức & NV",     actions: ["view","create","edit","delete"] },
      { code: "role",     name: "Phân quyền",       actions: ["view","manage"] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function FormGroup({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`form-group${full ? " form-group--full" : ""}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, sub, btnLabel, onBtn }: { icon: string; title: string; sub: string; btnLabel?: string; onBtn?: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{sub}</div>
      {btnLabel && <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={onBtn}>{btnLabel}</button>}
    </div>
  );
}

// ─── Department Tab ───────────────────────────────────────────────────
function DeptTab() {
  const { showToast } = useApp();
  const [depts, setDepts] = useState<IDept[]>(MOCK_DEPTS);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1, 5, 7]));
  const [editing, setEditing] = useState<IDept | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", parentId: "0", type: "dept" as IDept["type"], headName: "" });
  const [saving, setSaving] = useState(false);

  const toggle = (id: number) => setExpanded(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const branches = depts.filter(d => d.type === "branch");
  const children = (parentId: number) => depts.filter(d => d.parentId === parentId);

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Tên phòng ban không được để trống", "warning"); return; }
    setSaving(true);
    try {
      await apiPost("/adminapi/department/update", { name: form.name, parentId: +form.parentId || null, type: form.type, headName: form.headName || undefined });
      const newId = depts.length + 1;
      setDepts(p => [...p, { id: newId, name: form.name, parentId: +form.parentId || 0, type: form.type, headName: form.headName || undefined, memberCount: 0 }]);
      setShowAdd(false);
      setForm({ name: "", parentId: "0", type: "dept", headName: "" });
      showToast("Đã tạo phòng ban mới thành công!", "success");
    } catch { showToast("Lỗi, sẽ dùng dữ liệu cục bộ", "warning"); const newId = depts.length + 1; setDepts(p => [...p, { id: newId, name: form.name, parentId: +form.parentId || 0, type: form.type, headName: form.headName || undefined, memberCount: 0 }]); setShowAdd(false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa phòng ban này?")) return;
    try {
      await apiDelete(`/adminapi/department/delete?id=${id}`);
      setDepts(p => p.filter(d => d.id !== id));
      showToast("Đã xóa", "success");
    } catch { setDepts(p => p.filter(d => d.id !== id)); showToast("Đã xóa (local)", "info"); }
  };

  const typeIcon = (type: IDept["type"]) => type === "branch" ? "🏦" : type === "team" ? "👥" : "🏢";
  const typeLabel = (type: IDept["type"]) => type === "branch" ? "Chi nhánh" : type === "team" ? "Nhóm NV" : "Phòng ban";

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Cơ cấu tổ chức</div><div className="page-subtitle">Chi nhánh · Phòng ban · Nhóm nhân viên</div></div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm phòng ban
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid var(--accent)" }}>
          <div className="card__header"><span className="card__title">Tạo phòng ban / chi nhánh mới</span></div>
          <div className="card__body">
            <div className="form-grid">
              <FormGroup label="Tên *"><input className="form-input" placeholder="Tên phòng ban…" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormGroup>
              <FormGroup label="Loại"><select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}>
                <option value="branch">Chi nhánh</option><option value="dept">Phòng ban</option><option value="team">Nhóm nhân viên</option>
              </select></FormGroup>
              <FormGroup label="Trực thuộc"><select className="form-select" value={form.parentId} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}>
                <option value="0">— Cấp cao nhất —</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select></FormGroup>
              <FormGroup label="Trưởng bộ phận"><input className="form-input" placeholder="Tên người phụ trách…" value={form.headName} onChange={e => setForm(p => ({ ...p, headName: e.target.value }))} /></FormGroup>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn btn--ghost" onClick={() => setShowAdd(false)}>Hủy</button>
              <button className="btn btn--primary" disabled={saving} onClick={handleSave}>{saving ? "Đang lưu…" : "Tạo phòng ban"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          {branches.map(branch => (
            <React.Fragment key={branch.id}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: expanded.has(branch.id) ? "rgba(33,150,243,0.04)" : "transparent" }}
                onClick={() => toggle(branch.id)}
              >
                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "var(--text-muted)", fill: "none", strokeWidth: 2, flexShrink: 0, transform: expanded.has(branch.id) ? "rotate(90deg)" : "none", transition: ".15s" }}><polyline points="9 18 15 12 9 6"/></svg>
                <span style={{ fontSize: 18 }}>{typeIcon(branch.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{branch.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Trưởng: {branch.headName} · {branch.memberCount} nhân viên</div>
                </div>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--accent-soft)", color: "var(--accent-bright)", fontWeight: 600 }}>{typeLabel(branch.type)}</span>
                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button className="btn-icon-sm" onClick={() => showToast("Mở chỉnh sửa chi nhánh", "info")}>Sửa</button>
                  <button className="btn-icon-sm" onClick={() => handleDelete(branch.id)}>Xóa</button>
                </div>
              </div>
              {expanded.has(branch.id) && children(branch.id).map(dept => (
                <div key={dept.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px 11px 54px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
                  <span style={{ fontSize: 14 }}>{typeIcon(dept.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{dept.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{dept.headName} · {dept.memberCount} NV</div>
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--surface-hover)", color: "var(--text-secondary)", fontWeight: 600 }}>{typeLabel(dept.type)}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-icon-sm" onClick={() => showToast("Mở chỉnh sửa phòng ban", "info")}>Sửa</button>
                    <button className="btn-icon-sm" onClick={() => handleDelete(dept.id)}>Xóa</button>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Employee Tab ─────────────────────────────────────────────────────
function EmployeeTab() {
  const { showToast } = useApp();
  const [employees, setEmployees] = useState<IEmployee[]>(MOCK_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IEmployee | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", email: "", phone: "", deptName: "", roleName: "Relationship Manager", joinDate: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept   = filterDept === "all" || e.deptName.includes(filterDept);
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { showToast("Họ tên và Email là bắt buộc", "warning"); return; }
    setSaving(true);
    try {
      await EmployeeService.update({ name: form.name, code: form.code, email: form.email, phone: form.phone, deptName: form.deptName, roleName: form.roleName });
      if (editing) {
        setEmployees(p => p.map(e => e.id === editing.id ? { ...e, ...form, status: e.status } : e));
        showToast("Đã cập nhật nhân viên!", "success");
      } else {
        setEmployees(p => [...p, { id: p.length + 1, ...form, status: "active", joinDate: form.joinDate || new Date().toLocaleDateString("vi-VN") }]);
        showToast("Đã thêm nhân viên mới!", "success");
      }
      setShowAdd(false); setEditing(null);
      setForm({ name: "", code: "", email: "", phone: "", deptName: "", roleName: "Relationship Manager", joinDate: "" });
    } catch {
      showToast("Lỗi API, lưu cục bộ", "warning");
      setEmployees(p => [...p, { id: p.length + 1, ...form, status: "active", joinDate: form.joinDate || "Hôm nay" }]);
      setShowAdd(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa nhân viên "${name}"?`)) return;
    try {
      await EmployeeService.delete(id);
      setEmployees(p => p.filter(e => e.id !== id));
      showToast(`Đã xóa ${name}`, "success");
    } catch { setEmployees(p => p.filter(e => e.id !== id)); showToast("Đã xóa (local)", "info"); }
  };

  const openEdit = (e: IEmployee) => {
    setEditing(e);
    setForm({ name: e.name, code: e.code, email: e.email, phone: e.phone, deptName: e.deptName, roleName: e.roleName, joinDate: e.joinDate });
    setShowAdd(true);
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Danh sách Nhân viên</div><div className="page-subtitle">{employees.filter(e => e.status === "active").length} đang hoạt động · {employees.length} tổng</div></div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => showToast("Export danh sách nhân viên", "info")}>Export</button>
          <button className="btn btn--primary" onClick={() => { setEditing(null); setForm({ name: "", code: "", email: "", phone: "", deptName: "", roleName: "Relationship Manager", joinDate: "" }); setShowAdd(true); }}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm nhân viên
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 16, border: `1px solid ${editing ? "var(--gold)" : "var(--accent)"}` }}>
          <div className="card__header"><span className="card__title">{editing ? `Chỉnh sửa: ${editing.name}` : "Thêm nhân viên mới"}</span></div>
          <div className="card__body">
            <div className="form-grid">
              <FormGroup label="Họ và tên *"><input className="form-input" placeholder="Nguyễn Văn A" value={form.name} onChange={e => set("name", e.target.value)} /></FormGroup>
              <FormGroup label="Mã nhân viên"><input className="form-input" placeholder="NV009" value={form.code} onChange={e => set("code", e.target.value)} /></FormGroup>
              <FormGroup label="Email *"><input className="form-input" type="email" placeholder="email@rebornbank.vn" value={form.email} onChange={e => set("email", e.target.value)} /></FormGroup>
              <FormGroup label="Điện thoại"><input className="form-input" placeholder="0912 345 678" value={form.phone} onChange={e => set("phone", e.target.value)} /></FormGroup>
              <FormGroup label="Phòng ban"><select className="form-select" value={form.deptName} onChange={e => set("deptName", e.target.value)}>
                <option value="">Chọn phòng ban…</option>
                {MOCK_DEPTS.filter(d => d.type !== "branch").map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select></FormGroup>
              <FormGroup label="Vai trò / Chức danh"><select className="form-select" value={form.roleName} onChange={e => set("roleName", e.target.value)}>
                {MOCK_ROLES.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select></FormGroup>
              <FormGroup label="Ngày vào làm"><input className="form-input" type="date" value={form.joinDate} onChange={e => set("joinDate", e.target.value)} /></FormGroup>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn btn--ghost" onClick={() => { setShowAdd(false); setEditing(null); }}>Hủy</button>
              <button className="btn btn--primary" disabled={saving} onClick={handleSave}>{saving ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Thêm nhân viên"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px" }}>
          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "var(--text-muted)", fill: "none", strokeWidth: 2, flexShrink: 0, strokeLinecap: "round" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, flex: 1 }} placeholder="Tìm theo tên, mã, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option><option value="active">Đang làm</option><option value="inactive">Đã nghỉ</option>
        </select>
      </div>

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead><tr><th>Nhân viên</th><th>Mã NV</th><th>Liên hệ</th><th>Phòng ban</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày vào</th><th></th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#1565C0,var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                        {e.name.split(" ").map(w => w[0]).slice(-2).join("")}
                      </div>
                      <div className="td-name">{e.name}</div>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{e.code}</td>
                  <td><div style={{ fontSize: 12 }}>{e.email}</div><div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{e.phone}</div></td>
                  <td><div style={{ fontSize: 12 }}>{e.deptName}</div></td>
                  <td><div style={{ fontSize: 12 }}>{e.roleName}</div></td>
                  <td><span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: e.status === "active" ? "var(--success-soft)" : "var(--surface)", color: e.status === "active" ? "var(--success)" : "var(--text-muted)", fontWeight: 600 }}>{e.status === "active" ? "● Đang làm" : "○ Đã nghỉ"}</span></td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.joinDate}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-icon-sm" onClick={() => openEdit(e)}>Sửa</button>
                      <button className="btn-icon-sm" onClick={() => handleDelete(e.id, e.name)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon="👤" title="Không tìm thấy nhân viên" sub="Thử thay đổi bộ lọc tìm kiếm" />}
        </div>
      </div>
    </div>
  );
}

// ─── Roles & Permissions Tab ──────────────────────────────────────────
function RolesTab() {
  const { showToast } = useApp();
  const [roles, setRoles]     = useState<IRole[]>(MOCK_ROLES);
  const [view, setView]       = useState<"list" | "matrix">("list");
  const [selRole, setSelRole] = useState<IRole | null>(null);
  const [saving, setSaving]   = useState(false);

  // Permission matrix: role -> resource_action -> bool
  const [permMatrix, setPermMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const m: Record<string, Record<string, boolean>> = {};
    MOCK_ROLES.forEach(r => {
      m[r.code] = {};
      PERM_GROUPS.forEach(g => g.resources.forEach(res => res.actions.forEach(a => {
        // Default: sysadmin has all, BM has most, RM has basic
        const hasAll  = r.code === "SYSADMIN";
        const hasMost = ["SYSADMIN","BM","SENIOR_RM"].includes(r.code);
        const hasBasic= true;
        m[r.code][`${res.code}_${a}`] = hasAll || (hasMost && !["delete","deploy","manage"].includes(a)) || (r.code === "RM" && ["view","create"].includes(a));
      })));
    });
    return m;
  });

  const togglePerm = (roleCode: string, key: string) => {
    setPermMatrix(p => ({ ...p, [roleCode]: { ...p[roleCode], [key]: !p[roleCode]?.[key] } }));
  };

  const handleSavePerm = async () => {
    setSaving(true);
    try {
      await apiPost("/adminapi/rolePermission/add", { matrix: permMatrix });
      showToast("Đã lưu cấu hình phân quyền!", "success");
    } catch { showToast("Lỗi API, đã lưu cục bộ", "warning"); }
    finally { setSaving(false); }
  };

  const handleDeleteRole = async (role: IRole) => {
    if (!confirm(`Xóa nhóm quyền "${role.name}"? Toàn bộ thành viên sẽ mất quyền này.`)) return;
    try {
      await apiDelete(`/adminapi/role/delete?id=${role.id}`);
      setRoles(p => p.filter(r => r.id !== role.id));
      showToast("Đã xóa nhóm quyền", "success");
    } catch { setRoles(p => p.filter(r => r.id !== role.id)); showToast("Đã xóa (local)", "info"); }
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Nhóm quyền & Vai trò</div><div className="page-subtitle">Cấu hình quyền truy cập theo từng vai trò trong hệ thống</div></div>
        <div className="page-header__actions">
          <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            {[["list","📋 Danh sách"],["matrix","🔐 Ma trận quyền"]].map(([v, l]) => (
              <button key={v} onClick={() => setView(v as any)} style={{ padding: "6px 14px", border: "none", fontFamily: "var(--font)", fontSize: 12, cursor: "pointer", background: view === v ? "var(--accent)" : "transparent", color: view === v ? "white" : "var(--text-secondary)", fontWeight: view === v ? 600 : 400 }}>{l}</button>
            ))}
          </div>
          {view === "list" && (
            <button className="btn btn--primary" onClick={() => showToast("Mở form tạo nhóm quyền mới", "info")}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tạo nhóm quyền
            </button>
          )}
          {view === "matrix" && (
            <button className="btn btn--primary" disabled={saving} onClick={handleSavePerm}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button>
          )}
        </div>
      </div>

      {view === "list" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {roles.map(role => (
            <div key={role.id} className="card" style={{ cursor: "pointer", transition: "border-color .15s", border: selRole?.id === role.id ? "1px solid var(--accent)" : "1px solid var(--border)" }}
              onClick={() => setSelRole(selRole?.id === role.id ? null : role)}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, var(--accent-soft), rgba(33,150,243,0.05))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--accent)" }}>
                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "var(--accent-bright)", fill: "none", strokeWidth: 2, strokeLinecap: "round" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button className="btn-icon-sm" onClick={() => showToast("Chỉnh sửa nhóm quyền", "info")}>Sửa</button>
                    <button className="btn-icon-sm" onClick={() => handleDeleteRole(role)}>Xóa</button>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{role.name}</div>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)", marginBottom: 10 }}>{role.code}</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                  {[["Quyền",`${role.permissions}`],["Thành viên",`${role.memberCount}`],["Tạo",role.createdAt]].map(([l,v]) => (
                    <div key={l}><div style={{ color: "var(--text-muted)", fontSize: 10 }}>{l}</div><div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Permission matrix */
        <div className="card">
          <div className="card__body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ width: 200 }}>Tài nguyên / Quyền</th>
                  {roles.map(r => <th key={r.id} style={{ textAlign: "center", fontSize: 11 }}>{r.name.split(" ").map(w => w[0]).join("")}<div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-muted)" }}>{r.code}</div></th>)}
                </tr>
              </thead>
              <tbody>
                {PERM_GROUPS.map(group => (
                  <React.Fragment key={group.group}>
                    <tr><td colSpan={roles.length + 1} style={{ background: "var(--surface)", fontSize: 10, fontWeight: 700, color: "var(--accent-bright)", textTransform: "uppercase", letterSpacing: 0.8, padding: "8px 14px" }}>{group.group}</td></tr>
                    {group.resources.map(res => res.actions.map(action => {
                      const key = `${res.code}_${action}`;
                      return (
                        <tr key={key}>
                          <td style={{ paddingLeft: 24 }}><div style={{ fontSize: 12 }}>{res.name}</div><div style={{ fontSize: 10, color: "var(--text-muted)" }}>{action}</div></td>
                          {roles.map(r => (
                            <td key={r.id} style={{ textAlign: "center" }}>
                              <input type="checkbox" style={{ accentColor: "var(--accent)", width: 15, height: 15, cursor: "pointer" }} checked={!!permMatrix[r.code]?.[key]} onChange={() => togglePerm(r.code, key)} />
                            </td>
                          ))}
                        </tr>
                      );
                    }))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN OrgManagement ────────────────────────────────────────────────
const TABS = [
  { key: "dept",     label: "Chi nhánh & Phòng ban", icon: "🏦" },
  { key: "employee", label: "Nhân viên",              icon: "👤" },
  { key: "roles",    label: "Nhóm quyền & Vai trò",  icon: "🔐" },
];

export function OrgManagement() {
  const [activeTab, setActiveTab] = useState("dept");
  const { showToast } = useApp();

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div className="page-title">Tổ chức & Phân quyền</div>
          <div className="page-subtitle">Quản lý cơ cấu tổ chức, nhân viên và quyền truy cập hệ thống</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, margin: "16px 0", background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "6px 8px", width: "fit-content" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: "var(--radius)",
            border: "none", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: activeTab === t.key ? 600 : 400,
            background: activeTab === t.key ? "var(--accent-soft)" : "transparent",
            color: activeTab === t.key ? "var(--accent-bright)" : "var(--text-secondary)",
            transition: "all .15s",
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {activeTab === "dept"     && <DeptTab />}
      {activeTab === "employee" && <EmployeeTab />}
      {activeTab === "roles"    && <RolesTab />}
    </div>
  );
}
