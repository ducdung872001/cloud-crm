import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_FEE_TYPES = [
  // Phí định kỳ theo diện tích
  { id: 1, code: "PHI-QL", name: "Phí quản lý", category: "management", calcType: "per_m2", unitPrice: 10000, unit: "đ/m²/tháng", applyTo: ["apartment", "office", "industrial", "retail"], status: "active", taxable: false, note: "Tính = Diện tích × đơn giá. Tự động tính khi nhập chỉ số tháng." },
  // Phí tiêu thụ
  { id: 2, code: "PHI-DIEN", name: "Tiền điện", category: "utility", calcType: "meter", unitPrice: 3500, unit: "đ/kWh", applyTo: ["apartment", "office", "industrial", "retail", "villa"], status: "active", taxable: false, note: "Tính theo chỉ số công tơ. Giá điện áp dụng theo bảng giá EVN." },
  { id: 3, code: "PHI-NUOC", name: "Tiền nước", category: "utility", calcType: "meter", unitPrice: 15000, unit: "đ/m³", applyTo: ["apartment", "office", "retail", "villa"], status: "active", taxable: false, note: "Tính theo đồng hồ nước. Giá nước áp dụng theo quy định địa phương." },
  // Phí cố định
  { id: 4, code: "PHI-XE-MAY", name: "Gửi xe máy", category: "parking", calcType: "fixed_per_slot", unitPrice: 200000, unit: "đ/chỗ/tháng", applyTo: ["apartment", "office", "retail", "villa"], status: "active", taxable: false, note: "Phí theo số chỗ đăng ký." },
  { id: 5, code: "PHI-XE-OTO", name: "Gửi xe ô tô", category: "parking", calcType: "fixed_per_slot", unitPrice: 1200000, unit: "đ/chỗ/tháng", applyTo: ["apartment", "office", "retail", "villa"], status: "active", taxable: false, note: "Phí gửi xe ô tô theo tháng." },
  // Phí thương mại
  { id: 6, code: "PHI-THUE", name: "Phí thuê mặt bằng", category: "rent", calcType: "fixed", unitPrice: 0, unit: "đ/tháng", applyTo: ["office", "industrial", "retail", "villa"], status: "active", taxable: true, note: "Theo điều khoản hợp đồng thuê. Giá trị ghi trong HĐ thuê." },
  { id: 7, code: "PHI-CAM", name: "CAM Charges", category: "retail", calcType: "per_m2", unitPrice: 15000, unit: "đ/m²/tháng", applyTo: ["retail"], status: "active", taxable: true, note: "Common Area Maintenance – phân bổ chi phí khu vực chung TTTM." },
  { id: 8, code: "PHI-MKT", name: "Marketing Levy", category: "retail", calcType: "turnover_pct", unitPrice: 3, unit: "% doanh thu", applyTo: ["retail"], status: "active", taxable: true, note: "Phí đóng vào quỹ marketing TTTM, tính theo % doanh thu tenant." },
  // Phí dịch vụ khác
  { id: 9, code: "PHI-DIEU-HOA", name: "Điều hòa ngoài giờ", category: "overtime", calcType: "per_hour", unitPrice: 150000, unit: "đ/giờ/tầng", applyTo: ["office"], status: "active", taxable: false, note: "Phí sử dụng điều hòa ngoài giờ hành chính (trước 7h, sau 18h & cuối tuần)." },
  { id: 10, code: "PHI-DEPOSIT", name: "Tiền đặt cọc", category: "deposit", calcType: "fixed", unitPrice: 0, unit: "đ (theo HĐ)", applyTo: ["apartment", "office", "industrial", "retail", "villa"], status: "active", taxable: false, note: "Thường = 2-3 tháng tiền thuê. Hoàn trả khi kết thúc HĐ." },
  { id: 11, code: "PHI-VSMT", name: "Vệ sinh môi trường", category: "utility", calcType: "fixed", unitPrice: 50000, unit: "đ/căn/tháng", applyTo: ["apartment", "villa"], status: "active", taxable: false, note: "Phí thu gom rác theo quy định." },
  { id: 12, code: "PHI-PCCC", name: "PCCC & Bảo hiểm", category: "insurance", calcType: "per_m2", unitPrice: 2000, unit: "đ/m²/năm", applyTo: ["office", "industrial", "retail"], status: "active", taxable: false, note: "Phí bảo hiểm cháy nổ bắt buộc." },
];

const CATEGORIES = [
  { value: "management", label: "Phí quản lý", color: "#1890ff" },
  { value: "utility", label: "Tiện ích (Điện/Nước)", color: "#13c2c2" },
  { value: "parking", label: "Gửi xe", color: "#722ed1" },
  { value: "rent", label: "Phí thuê", color: "#52c41a" },
  { value: "retail", label: "Thương mại (TTTM)", color: "#fa8c16" },
  { value: "overtime", label: "Ngoài giờ", color: "#eb2f96" },
  { value: "deposit", label: "Tiền cọc", color: "#8c8c8c" },
  { value: "insurance", label: "Bảo hiểm/PCCC", color: "#ff4d4f" },
];

const CALC_TYPES = [
  { value: "per_m2", label: "Theo diện tích (đ/m²)" },
  { value: "meter", label: "Theo chỉ số đồng hồ" },
  { value: "fixed", label: "Cố định (theo HĐ)" },
  { value: "fixed_per_slot", label: "Cố định/chỗ" },
  { value: "turnover_pct", label: "% Doanh thu" },
  { value: "per_hour", label: "Theo giờ" },
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Chung cư" },
  { value: "office", label: "Văn phòng" },
  { value: "industrial", label: "KCN" },
  { value: "retail", label: "TTTM" },
  { value: "villa", label: "Nhà TT" },
  { value: "government", label: "HC" },
];

// ─── Modal thêm/sửa ───────────────────────────────────────────────────────────
function FeeTypeModal({ feeType, onSave, onClose }: any) {
  const isEdit = !!feeType?.id;
  const [form, setForm] = useState({
    code: "", name: "", category: "management", calcType: "per_m2",
    unitPrice: 0, unit: "", applyTo: [] as string[],
    status: "active", taxable: false, note: "",
    ...feeType,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleApply = (v: string) =>
    setForm((f) => ({
      ...f,
      applyTo: f.applyTo.includes(v) ? f.applyTo.filter((x: string) => x !== v) : [...f.applyTo, v],
    }));

  const cat = CATEGORIES.find((c) => c.value === form.category);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? "✏️ Sửa loại phí" : "➕ Thêm loại phí dịch vụ"}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã phí <span className="required">*</span></label>
              <input className="form-control" value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="VD: PHI-QL" />
            </div>
            <div className="form-group">
              <label>Tên loại phí <span className="required">*</span></label>
              <input className="form-control" value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="VD: Phí quản lý" />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select className="form-control" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Cách tính phí</label>
              <select className="form-control" value={form.calcType} onChange={(e) => set("calcType", e.target.value)}>
                {CALC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Đơn giá mặc định</label>
              <input className="form-control" type="number" min={0} step={0.1}
                value={form.unitPrice} onChange={(e) => set("unitPrice", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Đơn vị tính</label>
              <input className="form-control" value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="VD: đ/m²/tháng" />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Đang áp dụng</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 28 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", margin: 0 }}>
                <input type="checkbox" checked={form.taxable} onChange={(e) => set("taxable", e.target.checked)}
                  style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: 13 }}>Chịu thuế VAT</span>
              </label>
            </div>
          </div>

          {/* Apply to property types */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#595959", display: "block", marginBottom: 10 }}>
              Áp dụng cho loại hình BĐS <span className="required">*</span>
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PROPERTY_TYPES.map((t) => {
                const selected = form.applyTo.includes(t.value);
                return (
                  <label key={t.value}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                      padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                      background: selected ? `${cat?.color}22` : "#f5f5f5",
                      border: `1.5px solid ${selected ? cat?.color : "#d9d9d9"}`,
                      color: selected ? cat?.color : "#595959",
                      transition: "all .15s",
                    }}>
                    <input type="checkbox" checked={selected} onChange={() => toggleApply(t.value)}
                      style={{ display: "none" }} />
                    {selected ? "✓" : "○"} {t.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-group form-group--full" style={{ marginTop: 16 }}>
            <label>Ghi chú / Hướng dẫn áp dụng</label>
            <textarea className="form-control" rows={3} value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Mô tả cách tính, điều kiện áp dụng..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary"
            disabled={!form.code || !form.name || form.applyTo.length === 0}
            style={{ opacity: (!form.code || !form.name || form.applyTo.length === 0) ? 0.6 : 1 }}
            onClick={() => onSave({ ...feeType, ...form })}>
            {isEdit ? "Lưu thay đổi" : "Thêm loại phí"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingFeeTypes() {
  document.title = "Cấu hình Loại phí – TNPM";
  const navigate = useNavigate();

  const [feeTypes, setFeeTypes] = useState(INITIAL_FEE_TYPES);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() =>
    feeTypes.filter((f) =>
      (!search || f.name.toLowerCase().includes(search.toLowerCase()) || f.code.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCat || f.category === filterCat)
    ), [feeTypes, search, filterCat]);

  const handleSave = (data: any) => {
    if (data.id) setFeeTypes((p) => p.map((f) => (f.id === data.id ? data : f)));
    else setFeeTypes((p) => [...p, { ...data, id: Date.now() }]);
    setShowModal(false); setEditing(null);
  };

  const toggleStatus = (id: number) => {
    setFeeTypes((p) => p.map((f) => f.id === id ? { ...f, status: f.status === "active" ? "inactive" : "active" } : f));
  };

  // Group by category
  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: filtered.filter((f) => f.category === cat.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="tnpm-list-page">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13, color: "#8c8c8c" }}>
        <button onClick={() => navigate("/setting")}
          style={{ border: "none", background: "none", cursor: "pointer", color: "#1890ff", padding: 0, fontSize: 13 }}>
          ⚙️ Cài đặt
        </button>
        <span>›</span>
        <span style={{ color: "#1a1a2e", fontWeight: 500 }}>Loại phí dịch vụ</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Cấu hình Loại phí Dịch vụ</h1>
          <p className="page-sub">Định nghĩa các loại phí áp dụng trong hóa đơn — Phí QL, Điện, Nước, Gửi xe, CAM, Turnover...</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          + Thêm loại phí
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Tổng loại phí", value: feeTypes.length, color: "#1890ff" },
          { label: "Đang áp dụng", value: feeTypes.filter(f => f.status === "active").length, color: "#52c41a" },
          { label: "Tạm dừng", value: feeTypes.filter(f => f.status === "inactive").length, color: "#8c8c8c" },
          { label: "Chịu VAT", value: feeTypes.filter(f => f.taxable).length, color: "#fa8c16" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Tìm tên phí, mã phí..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <span className="result-count">{filtered.length} loại phí</span>
      </div>

      {/* Grouped by category */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {byCategory.map((group) => (
          <div key={group.value} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
            {/* Group header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 12, background: `${group.color}08`, borderLeft: `4px solid ${group.color}` }}>
              <span style={{ fontSize: 18 }}>
                {{ management: "⚙️", utility: "💡", parking: "🚗", rent: "🏢", retail: "🛍️", overtime: "🕐", deposit: "🏦", insurance: "🛡️" }[group.value] || "📋"}
              </span>
              <span style={{ fontWeight: 700, fontSize: 15, color: group.color }}>{group.label}</span>
              <span style={{ fontSize: 12, color: "#8c8c8c" }}>{group.items.length} loại phí</span>
            </div>

            {/* Fee items */}
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Mã phí</th>
                  <th>Tên loại phí</th>
                  <th>Cách tính</th>
                  <th style={{ textAlign: "right" }}>Đơn giá mặc định</th>
                  <th>Đơn vị</th>
                  <th>Áp dụng cho</th>
                  <th style={{ textAlign: "center" }}>VAT</th>
                  <th style={{ textAlign: "center" }}>Trạng thái</th>
                  <th style={{ textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((fee) => {
                  const calcLabel = CALC_TYPES.find(t => t.value === fee.calcType)?.label || fee.calcType;
                  const isExpanded = expandedId === fee.id;
                  return (
                    <React.Fragment key={fee.id}>
                      <tr style={{ opacity: fee.status === "inactive" ? 0.6 : 1 }}>
                        <td>
                          <span className="code-text" style={{ fontSize: 13 }}>{fee.code}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>{fee.name}</div>
                          {fee.note && (
                            <button onClick={() => setExpandedId(isExpanded ? null : fee.id)}
                              style={{ border: "none", background: "none", color: "#1890ff", fontSize: 11, cursor: "pointer", padding: 0, marginTop: 2 }}>
                              {isExpanded ? "▲ Thu gọn" : "▼ Xem ghi chú"}
                            </button>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: "#595959" }}>{calcLabel}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: group.color }}>
                          {fee.unitPrice > 0 ? fee.unitPrice.toLocaleString("vi-VN") : "Theo HĐ"}
                        </td>
                        <td style={{ fontSize: 12, color: "#595959" }}>{fee.unit}</td>
                        <td>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {fee.applyTo.map((t) => (
                              <span key={t} style={{ padding: "2px 8px", borderRadius: 10, background: `${group.color}18`, color: group.color, fontSize: 11, fontWeight: 500 }}>
                                {PROPERTY_TYPES.find(p => p.value === t)?.label || t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {fee.taxable
                            ? <span style={{ color: "#fa8c16", fontSize: 13, fontWeight: 600 }}>VAT</span>
                            : <span style={{ color: "#d9d9d9" }}>—</span>}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div onClick={() => toggleStatus(fee.id)}
                              style={{
                                width: 38, height: 20, borderRadius: 10, cursor: "pointer", transition: "background .2s",
                                background: fee.status === "active" ? "#52c41a" : "#d9d9d9",
                                position: "relative",
                              }}>
                              <div style={{
                                position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%",
                                background: "#fff", transition: "left .2s",
                                left: fee.status === "active" ? 20 : 2,
                                boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                              }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button className="action-btn action-btn--edit"
                              onClick={() => { setEditing(fee); setShowModal(true); }} title="Sửa">✏️</button>
                            <button className="action-btn action-btn--delete"
                              onClick={() => setDeleteId(fee.id)} title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} style={{ padding: "0 20px 14px 20px", background: "#fafafa" }}>
                            <div style={{ padding: "10px 14px", background: "#f0f7ff", borderRadius: 8, fontSize: 13, color: "#595959", borderLeft: "3px solid #1890ff" }}>
                              💡 {fee.note}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {byCategory.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: 48 }}>💰</span>
            <p>Không tìm thấy loại phí nào</p>
          </div>
        )}
      </div>

      {/* Tip */}
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#f0f7ff", borderRadius: 10, fontSize: 13, color: "#595959", border: "1px solid #91d5ff" }}>
        💡 <b>Lưu ý:</b> Các loại phí ở đây là danh mục mặc định. Khi nhập chỉ số tháng hoặc tạo hóa đơn, hệ thống sẽ tự động gợi ý các khoản phí phù hợp theo loại hình BĐS và hợp đồng dịch vụ của từng unit.
      </div>

      {showModal && (
        <FeeTypeModal feeType={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Xóa loại phí</h3>
            <p>Xóa loại phí này sẽ ảnh hưởng đến các hóa đơn chưa tạo. Bạn có chắc?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger"
                onClick={() => { setFeeTypes(p => p.filter(f => f.id !== deleteId)); setDeleteId(null); }}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
