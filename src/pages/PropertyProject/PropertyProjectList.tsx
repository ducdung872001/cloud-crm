import React, { useState, useMemo } from "react";
import { MOCK_PROJECTS, PROJECT_TYPE_OPTIONS, STATUS_LABELS, STATUS_COLORS } from "assets/mock/TNPMData";
import AddEditProjectModal from "./partials/AddEditProjectModal/AddEditProjectModal";
import DetailProject from "./partials/DetailProject/DetailProject";
import "./PropertyProject.scss";

export default function PropertyProjectList() {
  document.title = "Quản lý Dự án – TNPM";

  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
      const matchType = !filterType || p.type === filterType;
      return matchSearch && matchType;
    });
  }, [projects, search, filterType]);

  const handleSave = (data) => {
    if (data.id) {
      setProjects((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
    } else {
      setProjects((prev) => [...prev, { ...data, id: Date.now(), occupancyRate: 0, occupiedUnits: 0 }]);
    }
    setShowModal(false);
    setEditingProject(null);
  };

  const handleDelete = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleEdit = (p) => {
    setEditingProject(p);
    setShowModal(true);
  };

  if (detailProject) {
    return <DetailProject project={detailProject} onBack={() => setDetailProject(null)} />;
  }

  return (
    <div className="tnpm-list-page">
      {/* Title & Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏢 Danh sách Dự án</h1>
          <p className="page-sub">Quản lý toàn bộ dự án BĐS trong portfolio TNPM</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingProject(null); setShowModal(true); }}>
          + Thêm dự án
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="🔍 Tìm theo tên, mã dự án..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tất cả loại hình</option>
          {PROJECT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="result-count">{filtered.length} dự án</span>
      </div>

      {/* Grid Cards */}
      <div className="project-grid">
        {filtered.map((p) => (
          <div key={p.id} className="project-card" onClick={() => setDetailProject(p)}>
            <div className="project-card__header">
              <div>
                <span className="project-card__code">{p.code}</span>
                <h3 className="project-card__name">{p.name}</h3>
              </div>
              <span className="project-card__type-badge">{p.typeName}</span>
            </div>

            <div className="project-card__location">📍 {p.location}</div>

            <div className="project-card__stats">
              <div className="stat-item">
                <div className="stat-item__val">{p.totalUnits}</div>
                <div className="stat-item__lbl">Tổng unit</div>
              </div>
              <div className="stat-item">
                <div className="stat-item__val">{p.occupiedUnits}</div>
                <div className="stat-item__lbl">Đang thuê</div>
              </div>
              <div className="stat-item">
                <div className="stat-item__val" style={{ color: p.occupancyRate >= 85 ? "#52c41a" : "#faad14" }}>
                  {p.occupancyRate}%
                </div>
                <div className="stat-item__lbl">Lấp đầy</div>
              </div>
              <div className="stat-item">
                <div className="stat-item__val">{(p.totalArea / 1000).toFixed(0)}k m²</div>
                <div className="stat-item__lbl">Tổng DT</div>
              </div>
            </div>

            {/* Occupancy bar */}
            <div className="project-card__occ-bar">
              <div
                className="project-card__occ-fill"
                style={{
                  width: `${p.occupancyRate}%`,
                  background: p.occupancyRate >= 85 ? "#52c41a" : p.occupancyRate >= 70 ? "#faad14" : "#ff4d4f",
                }}
              />
            </div>

            <div className="project-card__footer">
              <span className="project-card__investor">🏛️ {p.investorName}</span>
              <div className="project-card__actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="action-btn action-btn--edit"
                  onClick={() => handleEdit(p)}
                  title="Chỉnh sửa"
                >✏️</button>
                <button
                  className="action-btn action-btn--delete"
                  onClick={() => setShowDeleteConfirm(p.id)}
                  title="Xóa"
                >🗑️</button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: 48 }}>🏗️</span>
            <p>Không tìm thấy dự án nào</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <AddEditProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProject(null); }}
        />
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa dự án này? Thao tác không thể hoàn tác.</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
