import React, { useState, useMemo } from "react";
import { MOCK_STAFF_SCHEDULES, MOCK_PROJECTS } from "assets/mock/TNPMData";
import { PageHeader, KpiRow, TabBar, ModalShell, StatusBadge } from "components/tnpm";

const DEPT_META: Record<string, { label: string; color: string; icon: string }> = {
  security: { label: "Bảo vệ", color: "#ff4d4f", icon: "🛡️" },
  cleaning: { label: "Vệ sinh", color: "#13c2c2", icon: "🧹" },
  technical: { label: "Kỹ thuật", color: "#1890ff", icon: "🔧" },
  reception: { label: "Tiếp tân", color: "#722ed1", icon: "🏨" },
  management: { label: "Quản lý", color: "#faad14", icon: "👔" },
};

const SHIFT_META: Record<string, { label: string; color: string; icon: string }> = {
  morning: { label: "Ca sáng", color: "#faad14", icon: "🌅" },
  afternoon: { label: "Ca chiều", color: "#fa8c16", icon: "☀️" },
  night: { label: "Ca đêm", color: "#722ed1", icon: "🌙" },
  fullday: { label: "Full ngày", color: "#52c41a", icon: "📅" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Đã lên lịch", color: "#1890ff" },
  in_progress: { label: "Đang làm việc", color: "#faad14" },
  completed: { label: "Đã hoàn thành", color: "#52c41a" },
  absent: { label: "Vắng mặt", color: "#ff4d4f" },
  cancelled: { label: "Đã hủy", color: "#8c8c8c" },
};

// ─── Add/Edit Shift Modal ────────────────────────────────────────────────
function ShiftModal({ shift, onClose, onSave }: any) {
  const isEdit = !!shift?.id;
  const [form, setForm] = useState<any>({
    employeeName: "", dept: "security",
    projectId: "", date: new Date().toISOString().split("T")[0],
    shiftType: "morning", startTime: "06:00", endTime: "14:00",
    position: "", status: "scheduled", note: "",
    ...shift,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const applyShiftPreset = (type: string) => {
    const presets: Record<string, [string, string]> = {
      morning: ["06:00", "14:00"],
      afternoon: ["14:00", "22:00"],
      night: ["22:00", "06:00"],
      fullday: ["08:00", "17:00"],
    };
    const [start, end] = presets[type] || ["08:00", "17:00"];
    setForm((f: any) => ({ ...f, shiftType: type, startTime: start, endTime: end }));
  };

  const handleSave = () => {
    if (!form.employeeName) return alert("Vui lòng nhập tên nhân viên");
    if (!form.projectId) return alert("Vui lòng chọn dự án");
    const project = MOCK_PROJECTS.find((p: any) => p.id === +form.projectId);
    onSave({
      ...form,
      id: form.id || Date.now(),
      projectId: +form.projectId,
      projectName: project?.name || form.projectName,
      deptLabel: DEPT_META[form.dept].label,
      shiftLabel: SHIFT_META[form.shiftType].label,
      statusLabel: STATUS_META[form.status].label,
    });
  };

  return (
    <ModalShell
      title={isEdit ? "✏️ Sửa ca làm việc" : "📅 Thêm ca làm việc"}
      onClose={onClose}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={handleSave}>💾 Lưu ca làm việc</button>
      </>}
    >
      <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Tên nhân viên *</label>
              <input className="form-control" value={form.employeeName} onChange={(e) => set("employeeName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bộ phận</label>
              <select className="form-control" value={form.dept} onChange={(e) => set("dept", e.target.value)}>
                {Object.entries(DEPT_META).map(([v, m]) => <option key={v} value={v}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Dự án *</label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>
                <option value="">-- Chọn --</option>
                {MOCK_PROJECTS.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày</label>
              <input className="form-control" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Kiểu ca</label>
              <select className="form-control" value={form.shiftType} onChange={(e) => applyShiftPreset(e.target.value)}>
                {Object.entries(SHIFT_META).map(([v, m]) => <option key={v} value={v}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Bắt đầu</label>
              <input className="form-control" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Kết thúc</label>
              <input className="form-control" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Vị trí làm việc</label>
              <input className="form-control" value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="VD: Cổng chính, MEP tòa nhà..." />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Ghi chú</label>
              <input className="form-control" value={form.note} onChange={(e) => set("note", e.target.value)} />
            </div>
      </div>
    </ModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function StaffScheduleList() {
  document.title = "Lịch làm việc vận hành – TNPM";

  const [shifts, setShifts] = useState<any[]>(MOCK_STAFF_SCHEDULES);
  const [view, setView] = useState<"table" | "byDept">("table");
  const [filterDate, setFilterDate] = useState("2024-04-14");
  const [filterDept, setFilterDept] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);

  const filtered = useMemo(() => {
    return shifts.filter((s: any) => {
      if (filterDate && s.date !== filterDate) return false;
      if (filterDept && s.dept !== filterDept) return false;
      if (filterProject && String(s.projectId) !== filterProject) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      return true;
    });
  }, [shifts, filterDate, filterDept, filterProject, filterStatus]);

  // KPI per date
  const kpi = useMemo(() => {
    const dateShifts = shifts.filter((s: any) => s.date === filterDate);
    return {
      total: dateShifts.length,
      active: dateShifts.filter((s: any) => s.status === "in_progress").length,
      completed: dateShifts.filter((s: any) => s.status === "completed").length,
      scheduled: dateShifts.filter((s: any) => s.status === "scheduled").length,
      absent: dateShifts.filter((s: any) => s.status === "absent").length,
    };
  }, [shifts, filterDate]);

  // Group by dept for view
  const byDept = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((s: any) => {
      if (!groups[s.dept]) groups[s.dept] = [];
      groups[s.dept].push(s);
    });
    return groups;
  }, [filtered]);

  const handleSave = (data: any) => {
    if (shifts.find((s: any) => s.id === data.id)) {
      setShifts((prev: any) => prev.map((s: any) => (s.id === data.id ? data : s)));
    } else {
      setShifts((prev: any) => [...prev, data]);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="📅 Lịch làm việc vận hành"
        subtitle="Phân ca nhân viên vận hành (bảo vệ, vệ sinh, kỹ thuật, tiếp tân, quản lý) theo dự án và ngày"
        actions={<>
          <button className="btn btn-outline">📊 Xuất lịch</button>
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>+ Thêm ca</button>
        </>}
      />

      <KpiRow items={[
        { label: `Tổng ca ${filterDate}`, value: `${kpi.total}`, color: "#1890ff", icon: "📋" },
        { label: "Đang làm việc", value: `${kpi.active}`, color: "#faad14", icon: "⚙️" },
        { label: "Đã hoàn thành", value: `${kpi.completed}`, color: "#52c41a", icon: "✅" },
        { label: "Chưa bắt đầu", value: `${kpi.scheduled}`, color: "#722ed1", icon: "⏳" },
        { label: "Vắng mặt", value: `${kpi.absent}`, color: "#ff4d4f", icon: "🚫" },
      ]} />

      {/* View toggle + filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: "#fff", padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setView("table")}
            style={{
              padding: "6px 14px", border: "none", cursor: "pointer", borderRadius: 6,
              background: view === "table" ? "#1890ff" : "transparent",
              color: view === "table" ? "#fff" : "#595959", fontSize: 12, fontWeight: 600,
            }}
          >📋 Bảng</button>
          <button
            onClick={() => setView("byDept")}
            style={{
              padding: "6px 14px", border: "none", cursor: "pointer", borderRadius: 6,
              background: view === "byDept" ? "#1890ff" : "transparent",
              color: view === "byDept" ? "#fff" : "#595959", fontSize: 12, fontWeight: 600,
            }}
          >🏢 Theo bộ phận</button>
        </div>

        <input className="form-control" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ width: 180 }} />
        <select className="filter-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="">Tất cả bộ phận</option>
          {Object.entries(DEPT_META).map(([v, m]) => <option key={v} value={v}>{m.icon} {m.label}</option>)}
        </select>
        <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">Tất cả dự án</option>
          {MOCK_PROJECTS.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Mọi trạng thái</option>
          {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
      </div>

      {/* Table view */}
      {view === "table" && (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Bộ phận</th>
                <th>Dự án</th>
                <th>Ngày</th>
                <th>Ca</th>
                <th>Giờ</th>
                <th>Vị trí</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có ca làm việc nào phù hợp.</td></tr>
              )}
              {filtered.map((s: any) => {
                const dept = DEPT_META[s.dept];
                const shift = SHIFT_META[s.shiftType];
                const status = STATUS_META[s.status];
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.employeeName}</td>
                    <td><StatusBadge label={dept?.label} color={dept?.color} icon={dept?.icon} /></td>
                    <td style={{ fontSize: 12 }}>{s.projectName}</td>
                    <td style={{ fontSize: 12 }}>{s.date}</td>
                    <td><StatusBadge label={shift?.label} color={shift?.color} icon={shift?.icon} /></td>
                    <td style={{ fontSize: 12, fontFamily: "monospace" }}>{s.startTime} - {s.endTime}</td>
                    <td style={{ fontSize: 12 }}>{s.position}</td>
                    <td><StatusBadge label={status?.label} color={status?.color} /></td>
                    <td style={{ fontSize: 11, color: "#595959", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.note}</td>
                    <td>
                      <button className="action-btn" onClick={() => { setEditTarget(s); setShowModal(true); }}>✏️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* By-dept view */}
      {view === "byDept" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
          {Object.entries(DEPT_META).map(([dKey, dMeta]) => {
            const deptShifts = byDept[dKey] || [];
            return (
              <div key={dKey} style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderTop: `4px solid ${dMeta.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{dMeta.icon} {dMeta.label}</div>
                  <span style={{ background: `${dMeta.color}22`, color: dMeta.color, padding: "2px 10px", borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                    {deptShifts.length} ca
                  </span>
                </div>
                {deptShifts.length === 0 ? (
                  <div style={{ padding: 16, textAlign: "center", color: "#8c8c8c", fontSize: 12 }}>Không có ca nào</div>
                ) : (
                  deptShifts.map((s: any) => {
                    const shift = SHIFT_META[s.shiftType];
                    const status = STATUS_META[s.status];
                    return (
                      <div key={s.id} style={{ padding: 10, background: "#fafafa", borderRadius: 6, marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.employeeName}</div>
                          <span style={{ fontSize: 10, color: status?.color, fontWeight: 600 }}>{status?.label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#595959", display: "flex", gap: 8, marginBottom: 2 }}>
                          <span>{shift?.icon}</span>
                          <span style={{ fontFamily: "monospace" }}>{s.startTime}-{s.endTime}</span>
                          <span>· {s.projectName}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#8c8c8c" }}>📍 {s.position}</div>
                        {s.note && <div style={{ fontSize: 10, color: "#595959", marginTop: 4, padding: 4, background: "#fffbe6", borderRadius: 4 }}>📝 {s.note}</div>}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <ShiftModal shift={editTarget} onClose={() => { setShowModal(false); setEditTarget(null); }} onSave={handleSave} />}
    </div>
  );
}
