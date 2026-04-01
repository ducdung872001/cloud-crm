import React, { useState, useEffect } from "react";
import { PROJECT_TYPE_OPTIONS } from "assets/mock/TNPMData";

interface Props {
  project?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function AddEditProjectModal({ project, onSave, onClose }: Props) {
  const isEdit = !!project?.id;

  const [form, setForm] = useState({
    code: "", name: "", type: "apartment", location: "",
    totalUnits: 0, totalArea: 0, investorName: "", managerName: "",
    phone: "", startDate: "", status: "active", note: "",
  });

  useEffect(() => {
    if (project) setForm({ ...form, ...project });
  }, [project]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...project, ...form });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Chỉnh sửa dự án" : "🏢 Thêm dự án mới"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Mã dự án <span className="required">*</span></label>
                <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="VD: GOLD-001" required />
              </div>
              <div className="form-group">
                <label>Loại hình BĐS <span className="required">*</span></label>
                <select className="form-control" value={form.type} onChange={(e) => set("type", e.target.value)} required>
                  {PROJECT_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group form-group--full">
                <label>Tên dự án <span className="required">*</span></label>
                <input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nhập tên đầy đủ của dự án" required />
              </div>

              <div className="form-group form-group--full">
                <label>Địa chỉ / Vị trí</label>
                <input className="form-control" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="VD: Cầu Giấy, Hà Nội" />
              </div>

              <div className="form-group">
                <label>Tổng số unit / căn</label>
                <input className="form-control" type="number" min={0} value={form.totalUnits} onChange={(e) => set("totalUnits", +e.target.value)} />
              </div>
              <div className="form-group">
                <label>Tổng diện tích (m²)</label>
                <input className="form-control" type="number" min={0} value={form.totalArea} onChange={(e) => set("totalArea", +e.target.value)} />
              </div>

              <div className="form-group">
                <label>Chủ đầu tư (CĐT)</label>
                <input className="form-control" value={form.investorName} onChange={(e) => set("investorName", e.target.value)} placeholder="Tên CĐT" />
              </div>
              <div className="form-group">
                <label>Quản lý dự án</label>
                <input className="form-control" value={form.managerName} onChange={(e) => set("managerName", e.target.value)} placeholder="Tên QLDA" />
              </div>

              <div className="form-group">
                <label>Số điện thoại liên hệ</label>
                <input className="form-control" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0901234567" />
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu vận hành</label>
                <input className="form-control" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                  <option value="pending">Chuẩn bị vận hành</option>
                </select>
              </div>

              <div className="form-group form-group--full">
                <label>Ghi chú</label>
                <textarea className="form-control" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Thông tin bổ sung..." />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">{isEdit ? "Lưu thay đổi" : "Thêm dự án"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
