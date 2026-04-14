import React, { useState, useMemo } from "react";
import { MOCK_PARTNERS, MOCK_PARTNER_CONTRACTS } from "assets/mock/TNPMData";
import { PageHeader, KpiRow, TabBar, ModalShell, ConfirmDialog, StatusBadge, fmtMoney } from "components/tnpm";

const PARTNER_TYPES = [
  { value: "strategic", label: "Đối tác chiến lược", color: "#722ed1", icon: "🏆" },
  { value: "referrer", label: "Đối tác giới thiệu", color: "#1890ff", icon: "🤝" },
  { value: "consultant", label: "Đối tác tư vấn", color: "#13c2c2", icon: "💼" },
  { value: "distributor", label: "Đối tác phân phối", color: "#faad14", icon: "📦" },
  { value: "other", label: "Khác", color: "#8c8c8c", icon: "🏢" },
];

const getTypeMeta = (t: string) => PARTNER_TYPES.find((x) => x.value === t) || PARTNER_TYPES[PARTNER_TYPES.length - 1];

// ─── Add/Edit Modal ──────────────────────────────────────────────────────
function AddEditPartnerModal({ partner, onClose, onSave }: any) {
  const isEdit = !!partner?.id;
  const [form, setForm] = useState<any>({
    code: "", name: "", shortName: "", type: "strategic",
    taxCode: "", businessField: "",
    contactName: "", contactTitle: "", phone: "", email: "",
    address: "", city: "Hà Nội",
    relationshipLevel: "tier2", relationshipLevelLabel: "Tier 2 - Dịch vụ",
    status: "active", rating: 4.0,
    totalContracts: 0, activeContracts: 0, totalValue: 0,
    notes: "",
    ...partner,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name) return alert("Vui lòng nhập tên đối tác");
    if (!form.contactName) return alert("Vui lòng nhập người liên hệ");
    const meta = getTypeMeta(form.type);
    onSave({
      ...form,
      typeLabel: meta.label,
      code: form.code || `DT-${String(Date.now()).slice(-3).padStart(3, "0")}`,
      id: form.id || Date.now(),
      createdAt: form.createdAt || new Date().toISOString().split("T")[0],
      createdBy: form.createdBy || "Người dùng hiện tại",
      lastInteractionAt: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <ModalShell
      title={isEdit ? "✏️ Sửa đối tác" : "🏢 Thêm đối tác mới"}
      onClose={onClose}
      wide
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={handleSave}>💾 Lưu đối tác</button>
      </>}
    >
          {/* Basic info */}
          <div style={{ fontWeight: 600, marginBottom: 10, color: "#1890ff" }}>📋 Thông tin cơ bản</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Mã đối tác</label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="Tự động nếu để trống" />
            </div>
            <div className="form-group">
              <label>Loại đối tác *</label>
              <select className="form-control" value={form.type} onChange={(e) => set("type", e.target.value)}>
                {PARTNER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Tên đối tác *</label>
              <input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ví dụ: Công ty CP ABC" />
            </div>
            <div className="form-group">
              <label>Tên viết tắt</label>
              <input className="form-control" value={form.shortName} onChange={(e) => set("shortName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Mã số thuế</label>
              <input className="form-control" value={form.taxCode} onChange={(e) => set("taxCode", e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Lĩnh vực hoạt động</label>
              <input className="form-control" value={form.businessField} onChange={(e) => set("businessField", e.target.value)} placeholder="VD: Môi giới BĐS, Tư vấn pháp lý, Bảo hiểm..." />
            </div>
          </div>

          {/* Contact */}
          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 10, color: "#1890ff" }}>👤 Người liên hệ</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Họ tên *</label>
              <input className="form-control" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Chức vụ</label>
              <input className="form-control" value={form.contactTitle} onChange={(e) => set("contactTitle", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Điện thoại</label>
              <input className="form-control" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Địa chỉ</label>
              <input className="form-control" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Thành phố</label>
              <input className="form-control" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>

          {/* Level & rating */}
          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 10, color: "#1890ff" }}>⭐ Phân cấp & đánh giá</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Mức độ quan hệ</label>
              <select className="form-control" value={form.relationshipLevel} onChange={(e) => {
                const val = e.target.value;
                const label = val === "tier1" ? "Tier 1 - Chủ đầu tư/Chiến lược" : val === "tier2" ? "Tier 2 - Dịch vụ thường xuyên" : "Tier 3 - Phụ trợ";
                set("relationshipLevel", val);
                set("relationshipLevelLabel", label);
              }}>
                <option value="tier1">Tier 1 - Chủ đầu tư / Chiến lược</option>
                <option value="tier2">Tier 2 - Dịch vụ thường xuyên</option>
                <option value="tier3">Tier 3 - Phụ trợ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Đang hợp tác</option>
                <option value="inactive">Tạm dừng</option>
                <option value="blacklist">Blacklist</option>
              </select>
            </div>
            <div className="form-group">
              <label>Đánh giá (0-5)</label>
              <input className="form-control" type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => set("rating", +e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Ghi chú</label>
              <textarea className="form-control" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Ghi chú về lịch sử hợp tác, ưu đãi đặc biệt..." />
            </div>
          </div>
    </ModalShell>
  );
}

// ─── Detail Drawer ───────────────────────────────────────────────────────
function DetailDrawer({ partner, onClose, onEdit }: any) {
  const contracts = MOCK_PARTNER_CONTRACTS.filter((c: any) => c.partnerId === partner.id);
  const meta = getTypeMeta(partner.type);
  return (
    <ModalShell
      title={`${meta.icon} ${partner.name}`}
      onClose={onClose}
      wide
      maxWidth={900}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Đóng</button>
        <button className="btn btn-primary" onClick={onEdit}>✏️ Sửa đối tác</button>
      </>}
    >
          {/* Header block */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <div style={{ flex: 2, background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#8c8c8c", fontSize: 13 }}>Mã</span>
                <span className="code-text">{partner.code}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#8c8c8c", fontSize: 13 }}>Loại</span>
                <span style={{ color: meta.color, fontWeight: 600 }}>{partner.typeLabel}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#8c8c8c", fontSize: 13 }}>Mức độ quan hệ</span>
                <span>{partner.relationshipLevelLabel}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#8c8c8c", fontSize: 13 }}>Lĩnh vực</span>
                <span>{partner.businessField}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#8c8c8c", fontSize: 13 }}>MST</span>
                <span>{partner.taxCode || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8c8c8c", fontSize: 13 }}>Địa chỉ</span>
                <span style={{ textAlign: "right", maxWidth: "60%" }}>{partner.address}</span>
              </div>
            </div>
            <div style={{ flex: 1, background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
              <div style={{ color: "#8c8c8c", fontSize: 12, marginBottom: 6 }}>Người liên hệ</div>
              <div style={{ fontWeight: 600 }}>{partner.contactName}</div>
              <div style={{ fontSize: 12, color: "#595959" }}>{partner.contactTitle}</div>
              <div style={{ marginTop: 10, fontSize: 12 }}>📞 {partner.phone}</div>
              <div style={{ fontSize: 12 }}>✉️ {partner.email}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Đánh giá", value: `${partner.rating} ⭐`, color: "#faad14" },
              { label: "Tổng HĐ", value: `${partner.totalContracts}`, color: "#1890ff" },
              { label: "HĐ đang có hiệu lực", value: `${partner.activeContracts}`, color: "#52c41a" },
              { label: "Tổng giá trị", value: fmtMoney(partner.totalValue), color: "#722ed1" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {partner.notes && (
            <div style={{ padding: 12, background: "#fffbe6", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
              📝 <strong>Ghi chú:</strong> {partner.notes}
            </div>
          )}

          {/* Contracts table */}
          <div style={{ fontWeight: 600, marginBottom: 10 }}>📄 Hợp đồng với đối tác này ({contracts.length})</div>
          {contracts.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#8c8c8c", background: "#fafafa", borderRadius: 8 }}>Chưa có hợp đồng nào.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Loại</th>
                  <th>Tiêu đề</th>
                  <th>Giá trị</th>
                  <th>Hiệu lực</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c: any) => (
                  <tr key={c.id}>
                    <td><span className="code-text">{c.code}</span></td>
                    <td style={{ fontSize: 12 }}>{c.contractTypeLabel}</td>
                    <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{c.title}</td>
                    <td className="amount-text">{fmtMoney(c.value)}</td>
                    <td style={{ fontSize: 12 }}>{c.startDate} → {c.endDate}</td>
                    <td>
                      <StatusBadge
                        label={c.status === "active" ? "Có hiệu lực" : c.status === "expired" ? "Hết hạn" : "Tạm dừng"}
                        color={c.status === "active" ? "#52c41a" : c.status === "expired" ? "#ff4d4f" : "#8c8c8c"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
    </ModalShell>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function PartnerList() {
  document.title = "Quản lý Đối tác – TNPM";

  const [partners, setPartners] = useState<any[]>(MOCK_PARTNERS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [detailTarget, setDetailTarget] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return partners.filter((p: any) => {
      const q = search.toLowerCase();
      if (search && !p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.contactName.toLowerCase().includes(q)) return false;
      if (filterType !== "all" && p.type !== filterType) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      return true;
    });
  }, [partners, search, filterType, filterStatus]);

  // KPI
  const totalPartners = partners.length;
  const activePartners = partners.filter((p: any) => p.status === "active").length;
  const totalValue = partners.reduce((a: number, p: any) => a + p.totalValue, 0);
  const activeContracts = partners.reduce((a: number, p: any) => a + p.activeContracts, 0);

  const handleSave = (data: any) => {
    if (partners.find((p: any) => p.id === data.id)) {
      setPartners((prev: any) => prev.map((p: any) => (p.id === data.id ? data : p)));
    } else {
      setPartners((prev: any) => [...prev, data]);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = (id: number) => {
    setPartners((prev: any) => prev.filter((p: any) => p.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="🤝 Quản lý Đối tác"
        subtitle="Quản lý đối tác chiến lược, môi giới, tư vấn và các bên hợp tác với TNPM"
        actions={<>
          <button className="btn btn-outline">📊 Xuất Excel</button>
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>+ Thêm đối tác</button>
        </>}
      />

      <KpiRow columns={4} items={[
        { label: "Tổng đối tác", value: `${totalPartners}`, color: "#1890ff", icon: "🏢" },
        { label: "Đang hợp tác", value: `${activePartners}`, color: "#52c41a", icon: "✅" },
        { label: "HĐ đang có hiệu lực", value: `${activeContracts}`, color: "#722ed1", icon: "📄" },
        { label: "Tổng giá trị HĐ", value: fmtMoney(totalValue), color: "#faad14", icon: "💰" },
      ]} />

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 16px" }}>
        {[{ key: "all", label: `Tất cả (${partners.length})` }, ...PARTNER_TYPES.map((t) => ({ key: t.value, label: `${t.icon} ${t.label} (${partners.filter((p: any) => p.type === t.value).length})` }))].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterType(t.key)}
            style={{
              padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 12, fontWeight: filterType === t.key ? 600 : 400,
              color: filterType === t.key ? "#1890ff" : "#8c8c8c",
              borderBottom: filterType === t.key ? "2px solid #1890ff" : "2px solid transparent",
              whiteSpace: "nowrap",
            }}
          >{t.label}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
          <input className="search-input" style={{ width: 220 }} placeholder="🔍 Tìm tên, mã, người LH..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hợp tác</option>
            <option value="inactive">Tạm dừng</option>
            <option value="blacklist">Blacklist</option>
          </select>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên đối tác</th>
              <th>Loại</th>
              <th>Người liên hệ</th>
              <th>Điện thoại</th>
              <th>Mức độ</th>
              <th>HĐ</th>
              <th>Tổng giá trị</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có đối tác nào phù hợp.</td></tr>
            )}
            {filtered.map((p: any) => {
              const meta = getTypeMeta(p.type);
              return (
                <tr key={p.id}>
                  <td><span className="code-text">{p.code}</span></td>
                  <td style={{ fontWeight: 500, maxWidth: 220 }}>
                    <div>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{p.businessField}</div>
                  </td>
                  <td>
                    <StatusBadge label={meta.label} color={meta.color} icon={meta.icon} />
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{p.contactName}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{p.contactTitle}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{p.phone}</td>
                  <td style={{ fontSize: 11 }}>{p.relationshipLevelLabel}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.activeContracts}/{p.totalContracts}</div>
                    <div style={{ fontSize: 10, color: "#8c8c8c" }}>đang/tổng</div>
                  </td>
                  <td className="amount-text">{fmtMoney(p.totalValue)}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ color: "#faad14", fontWeight: 600 }}>{p.rating}</span>
                    <span style={{ fontSize: 11, color: "#8c8c8c" }}> /5</span>
                  </td>
                  <td>
                    <StatusBadge
                      label={p.status === "active" ? "Đang hợp tác" : p.status === "inactive" ? "Tạm dừng" : "Blacklist"}
                      color={p.status === "active" ? "#52c41a" : p.status === "inactive" ? "#8c8c8c" : "#ff4d4f"}
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="action-btn" onClick={() => setDetailTarget(p)} title="Xem chi tiết">👁</button>
                      <button className="action-btn" onClick={() => { setEditTarget(p); setShowModal(true); }} title="Sửa">✏️</button>
                      <button className="action-btn action-btn--delete" onClick={() => setDeleteId(p.id)} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <AddEditPartnerModal partner={editTarget} onClose={() => { setShowModal(false); setEditTarget(null); }} onSave={handleSave} />}
      {detailTarget && !showModal && (
        <DetailDrawer
          partner={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null); setShowModal(true); }}
        />
      )}
      {deleteId && (
        <ConfirmDialog
          title="Xóa đối tác"
          message="Bạn có chắc muốn xóa đối tác này? Hành động không thể khôi phục."
          confirmLabel="Xóa"
          danger
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
        />
      )}
    </div>
  );
}
