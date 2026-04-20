// [CH] Community Hub - Quản lý dịch vụ tập trung
import React, { useState } from "react";
import { MOCK_SERVICE_CATALOG, SERVICE_CATEGORIES, type ServiceCategory, type IServiceItem } from "@/mocks/community-hub/service-catalog";
import { formatCurrency } from "reborn-util";
import Icon from "@/components/icon";
import "./index.scss";

const EMPTY_SERVICE: IServiceItem = {
  id: "",
  name: "",
  category: "fnb_space",
  unit: "",
  price: 0,
  sellable: true,
  description: "",
  status: "active",
};

export default function ServiceManagement() {
  document.title = "Quản lý dịch vụ";
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const [services, setServices] = useState(MOCK_SERVICE_CATALOG);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<IServiceItem | null>(null);

  const filtered = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  const countByCategory = (cat: ServiceCategory) =>
    services.filter((s) => s.category === cat && s.status === "active").length;

  const handleAdd = () => {
    setEditingService({ ...EMPTY_SERVICE, id: `SVC-${Date.now()}` });
    setShowForm(true);
  };

  const handleEdit = (svc: IServiceItem) => {
    setEditingService({ ...svc });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!editingService || !editingService.name.trim()) return;
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === editingService.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = editingService;
        return next;
      }
      return [...prev, editingService];
    });
    setShowForm(false);
    setEditingService(null);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingService(null);
  };

  return (
    <div className="ch-service-mgmt">
      <div className="ch-service-mgmt__header">
        <div>
          <h2>Quản lý dịch vụ</h2>
          <p className="subtitle">Danh mục tất cả dịch vụ của Hub — dùng để cấu hình gói thành viên & bán lẻ tại POS</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          <Icon name="PlusCircleFill" />
          <span>Thêm dịch vụ</span>
        </button>
      </div>

      {/* Category tabs */}
      <div className="ch-service-mgmt__categories">
        <button
          className={`cat-tab ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          Tất cả <span className="count">{services.filter((s) => s.status === "active").length}</span>
        </button>
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`cat-tab ${activeCategory === cat.key ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            <span className="cat-icon">{cat.icon}</span>
            {cat.label}
            <span className="count">{countByCategory(cat.key)}</span>
          </button>
        ))}
      </div>

      {/* Services table */}
      <div className="ch-service-mgmt__table">
        <table>
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Nhóm ngành</th>
              <th>Đơn vị</th>
              <th>Giá bán lẻ</th>
              <th>Bán lẻ?</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((svc) => {
              const cat = SERVICE_CATEGORIES.find((c) => c.key === svc.category);
              return (
                <tr key={svc.id}>
                  <td>
                    <div className="svc-name">{svc.name}</div>
                    <div className="svc-desc">{svc.description}</div>
                  </td>
                  <td>
                    <span className="cat-badge">
                      <span className="cat-badge-icon">{cat?.icon}</span>
                      {cat?.label}
                    </span>
                  </td>
                  <td>{svc.unit}</td>
                  <td>{svc.price > 0 ? `${formatCurrency(svc.price, ".", "")}đ` : <span className="free">Miễn phí</span>}</td>
                  <td>
                    <span className={`sell-badge ${svc.sellable ? "yes" : "no"}`}>
                      {svc.sellable ? "Có" : "Chỉ trong gói"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot ${svc.status}`} />
                    {svc.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                  </td>
                  <td>
                    <button className="btn-action" title="Sửa" onClick={() => handleEdit(svc)}><Icon name="Edit" /></button>
                    <button
                      className="btn-action toggle"
                      title={svc.status === "active" ? "Tạm ngưng" : "Kích hoạt"}
                      onClick={() => {
                        setServices((prev) =>
                          prev.map((s) =>
                            s.id === svc.id
                              ? { ...s, status: s.status === "active" ? "inactive" as const : "active" as const }
                              : s,
                          ),
                        );
                      }}
                    >
                      <Icon name={svc.status === "active" ? "EyeSlash" : "Eye"} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty">Không có dịch vụ nào trong nhóm này</div>
        )}
      </div>

      {/* ── Modal Thêm / Sửa dịch vụ ── */}
      {showForm && editingService && (
        <div className="svc-modal-overlay" onClick={handleClose}>
          <div className="svc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal__header">
              <h3>{services.some((s) => s.id === editingService.id) ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h3>
              <button className="btn-close" onClick={handleClose}>✕</button>
            </div>

            <div className="svc-modal__body">
              <div className="form-group">
                <label>Tên dịch vụ <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="VD: Massage 60 phút, Co-working..."
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Nhóm ngành <span className="req">*</span></label>
                <select
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value as ServiceCategory })}
                >
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Đơn vị tính <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="lần, giờ, buổi, kg..."
                  value={editingService.unit}
                  onChange={(e) => setEditingService({ ...editingService, unit: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Giá bán lẻ (VNĐ)</label>
                <input
                  type="number"
                  placeholder="0 = Miễn phí"
                  value={editingService.price || ""}
                  onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Cho phép bán lẻ?</label>
                <div className="toggle-row">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={editingService.sellable}
                      onChange={(e) => setEditingService({ ...editingService, sellable: e.target.checked })}
                    />
                    <span>{editingService.sellable ? "Có — hiển thị trên POS" : "Không — chỉ dùng trong gói"}</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả ngắn về dịch vụ..."
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                />
              </div>
            </div>

            <div className="svc-modal__footer">
              <button className="btn-cancel" onClick={handleClose}>Hủy</button>
              <button
                className="btn-save"
                disabled={!editingService.name.trim() || !editingService.unit.trim()}
                onClick={handleSave}
              >
                Lưu dịch vụ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
