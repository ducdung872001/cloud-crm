// [CH] Community Hub - Quản lý gói thành viên (Cài đặt)
import React, { useState } from "react";
import { MOCK_MEMBERSHIP_PLANS } from "@/mocks/community-hub/membership-plans";
import { MOCK_SERVICE_CATALOG } from "@/mocks/community-hub/service-catalog";
import { formatCurrency } from "reborn-util";
import Icon from "@/components/icon";
import "./index.scss";

// [CH] Danh sách dịch vụ để chọn vào gói — sau này thay bằng API ServiceService.list()
const SERVICE_OPTIONS = MOCK_SERVICE_CATALOG.filter((s) => s.status === "active");

interface ServiceQuota {
  service: string;
  quota: number | null;
  unit: string;
}

interface PlanForm {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  description: string;
  color: string;
  includes: ServiceQuota[];
}

const EMPTY_PLAN: PlanForm = {
  id: "",
  name: "",
  price: 0,
  duration_months: 1,
  description: "",
  color: "#2D6A5A",
  includes: [{ service: "", quota: null, unit: "" }],
};

const COLORS = ["#2D6A5A", "#D4A574", "#6B8078", "#3D9E6A", "#E8922A", "#D64B3A"];

export default function MembershipPlanSettings() {
  document.title = "Quản lý gói thành viên";

  const [plans, setPlans] = useState(MOCK_MEMBERSHIP_PLANS);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanForm | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ── Mở form thêm mới ──
  const handleAdd = () => {
    setEditingPlan({ ...EMPTY_PLAN, id: `PLAN-${Date.now()}` });
    setShowForm(true);
  };

  // ── Mở form sửa ──
  const handleEdit = (plan: typeof plans[number]) => {
    setEditingPlan({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      duration_months: plan.duration_months,
      description: plan.description,
      color: plan.color,
      includes: plan.includes.map((inc) => ({ ...inc })),
    });
    setShowForm(true);
  };

  // ── Lưu (thêm / sửa) ──
  const handleSave = () => {
    if (!editingPlan || !editingPlan.name.trim() || editingPlan.price <= 0) return;

    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === editingPlan.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...editingPlan } as typeof plans[number];
        return next;
      }
      return [...prev, editingPlan as typeof plans[number]];
    });
    setShowForm(false);
    setEditingPlan(null);
  };

  // ── Xóa ──
  const handleDelete = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(null);
  };

  // ── Thêm dòng dịch vụ vào form ──
  const addServiceRow = () => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      includes: [...editingPlan.includes, { service: "", quota: null, unit: "" }],
    });
  };

  // ── Xóa dòng dịch vụ ──
  const removeServiceRow = (idx: number) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      includes: editingPlan.includes.filter((_, i) => i !== idx),
    });
  };

  // ── Cập nhật dòng dịch vụ ──
  const updateServiceRow = (idx: number, field: keyof ServiceQuota, value: string | number | null) => {
    if (!editingPlan) return;
    const next = [...editingPlan.includes];
    next[idx] = { ...next[idx], [field]: value };
    setEditingPlan({ ...editingPlan, includes: next });
  };

  // ── Chọn dịch vụ từ dropdown → auto-fill tên + đơn vị ──
  const handleSelectService = (idx: number, serviceId: string) => {
    if (!editingPlan) return;
    const svc = SERVICE_OPTIONS.find((s) => s.id === serviceId);
    if (!svc) return;
    const next = [...editingPlan.includes];
    next[idx] = { ...next[idx], service: svc.name, unit: `${svc.unit}/tháng` };
    setEditingPlan({ ...editingPlan, includes: next });
  };

  return (
    <div className="ch-plan-settings">
      {/* ── Header ── */}
      <div className="ch-plan-settings__header">
        <div>
          <h2>Quản lý gói thành viên</h2>
          <p className="subtitle">Định nghĩa các gói thẻ thành viên, giá, thời hạn và dịch vụ bao gồm</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          <Icon name="PlusCircleFill" />
          <span>Thêm gói mới</span>
        </button>
      </div>

      {/* ── Danh sách gói ── */}
      <div className="ch-plan-settings__grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-setting-card" style={{ borderTopColor: plan.color }}>
            <div className="plan-setting-card__header">
              <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
              <div className="plan-actions">
                <button className="btn-edit" onClick={() => handleEdit(plan)} title="Sửa">
                  <Icon name="PencilSimpleLine" />
                </button>
                <button className="btn-delete" onClick={() => setShowDeleteConfirm(plan.id)} title="Xóa">
                  <Icon name="Trash" />
                </button>
              </div>
            </div>

            <div className="plan-setting-card__price">
              {formatCurrency(plan.price, ".", "")}đ
              <span className="duration">/ {plan.duration_months} tháng</span>
            </div>

            <p className="plan-setting-card__desc">{plan.description}</p>

            <div className="plan-setting-card__services">
              <div className="services-title">Dịch vụ bao gồm:</div>
              {plan.includes.map((inc, i) => (
                <div key={i} className="service-row">
                  <span className="service-name">{inc.service}</span>
                  <span className="service-quota">
                    {inc.quota ? `${inc.quota} ${inc.unit}` : inc.unit}
                  </span>
                </div>
              ))}
            </div>

            {"popular" in plan && (plan as Record<string, unknown>).popular && (
              <span className="plan-tag popular">Phổ biến</span>
            )}
            {"badge" in plan && (plan as Record<string, unknown>).badge && (
              <span className="plan-tag promo">{(plan as Record<string, unknown>).badge as string}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Modal xóa ── */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-delete" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa gói <strong>{plans.find((p) => p.id === showDeleteConfirm)?.name}</strong>?</p>
            <p className="warning-text">Thành viên đang dùng gói này sẽ không bị ảnh hưởng cho đến khi hết hạn.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(null)}>Hủy</button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(showDeleteConfirm)}>Xóa gói</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form thêm/sửa gói ── */}
      {showForm && editingPlan && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-form__header">
              <h3>{plans.some((p) => p.id === editingPlan.id) ? "Sửa gói thành viên" : "Thêm gói thành viên mới"}</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="modal-form__body">
              {/* Tên gói */}
              <div className="form-group">
                <label>Tên gói <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="VD: Standard, Premium..."
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                />
              </div>

              {/* Giá + Thời hạn */}
              <div className="form-row">
                <div className="form-group">
                  <label>Giá (VNĐ) <span className="required">*</span></label>
                  <input
                    type="number"
                    placeholder="2500000"
                    value={editingPlan.price || ""}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Thời hạn (tháng)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingPlan.duration_months}
                    onChange={(e) => setEditingPlan({ ...editingPlan, duration_months: Number(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  placeholder="Mô tả ngắn về gói..."
                  rows={2}
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                />
              </div>

              {/* Màu */}
              <div className="form-group">
                <label>Màu hiển thị</label>
                <div className="color-picker">
                  {COLORS.map((c) => (
                    <div
                      key={c}
                      className={`color-swatch ${editingPlan.color === c ? "active" : ""}`}
                      style={{ background: c }}
                      onClick={() => setEditingPlan({ ...editingPlan, color: c })}
                    />
                  ))}
                </div>
              </div>

              {/* Dịch vụ bao gồm */}
              <div className="form-group">
                <label>Dịch vụ bao gồm</label>
                <div className="service-rows">
                  {editingPlan.includes.map((inc, idx) => (
                    <div key={idx} className="service-form-row">
                      <select
                        value={SERVICE_OPTIONS.find((s) => s.name === inc.service)?.id || ""}
                        onChange={(e) => handleSelectService(idx, e.target.value)}
                        className="input-service"
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        {SERVICE_OPTIONS.map((svc) => (
                          <option key={svc.id} value={svc.id}>{svc.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quota (trống = ∞)"
                        value={inc.quota ?? ""}
                        onChange={(e) => updateServiceRow(idx, "quota", e.target.value ? Number(e.target.value) : null)}
                        className="input-quota"
                      />
                      <input
                        type="text"
                        placeholder="Đơn vị"
                        value={inc.unit}
                        onChange={(e) => updateServiceRow(idx, "unit", e.target.value)}
                        className="input-unit"
                        readOnly
                      />
                      <button className="btn-remove-row" onClick={() => removeServiceRow(idx)} title="Xóa dòng">✕</button>
                    </div>
                  ))}
                  <button className="btn-add-row" onClick={addServiceRow}>+ Thêm dịch vụ</button>
                </div>
              </div>
            </div>

            <div className="modal-form__footer">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
              <button
                className="btn-save"
                disabled={!editingPlan.name.trim() || editingPlan.price <= 0}
                onClick={handleSave}
              >
                Lưu gói
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
