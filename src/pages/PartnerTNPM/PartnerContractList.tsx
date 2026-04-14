import React, { useState, useMemo } from "react";
import { MOCK_PARTNERS, MOCK_PARTNER_CONTRACTS } from "assets/mock/TNPMData";
import { PageHeader, KpiRow, TabBar, ModalShell, ConfirmDialog, StatusBadge, fmtMoney, daysUntil } from "components/tnpm";

const CONTRACT_TYPES = [
  { value: "strategic_cooperation", label: "Hợp tác chiến lược", color: "#722ed1", icon: "🏆" },
  { value: "referral_commission", label: "Hoa hồng giới thiệu", color: "#1890ff", icon: "🤝" },
  { value: "consultancy", label: "Tư vấn", color: "#13c2c2", icon: "💼" },
  { value: "distribution", label: "Phân phối", color: "#faad14", icon: "📦" },
  { value: "service_purchase", label: "Mua dịch vụ", color: "#fa8c16", icon: "🛒" },
];

const getTypeMeta = (t: string) => CONTRACT_TYPES.find((x) => x.value === t) || CONTRACT_TYPES[0];

const PAYMENT_TERMS = [
  { value: "onetime", label: "Một lần" },
  { value: "monthly", label: "Hàng tháng" },
  { value: "quarterly", label: "Hàng quý" },
  { value: "annual", label: "Hàng năm" },
  { value: "milestone", label: "Theo cột mốc" },
  { value: "per_deal", label: "Theo giao dịch" },
  { value: "per_po", label: "Theo đơn hàng" },
];

// ─── Add/Edit Contract Modal ─────────────────────────────────────────────
function AddEditContractModal({ contract, onClose, onSave }: any) {
  const isEdit = !!contract?.id;
  const [form, setForm] = useState<any>({
    code: "", partnerId: "", partnerName: "",
    contractType: "strategic_cooperation",
    title: "", description: "",
    value: 0, paymentTerms: "monthly",
    startDate: "", endDate: "", signedDate: "",
    status: "active", autoRenew: false, renewalNotice: 60,
    signedBy: "", partnerSigner: "",
    attachments: 0, note: "",
    ...contract,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title) return alert("Vui lòng nhập tiêu đề hợp đồng");
    if (!form.partnerId) return alert("Vui lòng chọn đối tác");
    if (!form.startDate || !form.endDate) return alert("Vui lòng chọn ngày bắt đầu & kết thúc");
    if (+form.value <= 0) return alert("Giá trị hợp đồng phải lớn hơn 0");

    const partner = MOCK_PARTNERS.find((p: any) => p.id === +form.partnerId);
    const typeMeta = getTypeMeta(form.contractType);

    onSave({
      ...form,
      id: form.id || Date.now(),
      code: form.code || `HĐ-DT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      partnerId: +form.partnerId,
      partnerName: partner?.shortName || partner?.name || form.partnerName,
      partnerType: partner?.type || form.partnerType,
      contractTypeLabel: typeMeta.label,
      value: +form.value,
    });
  };

  return (
    <ModalShell
      title={isEdit ? "✏️ Sửa hợp đồng đối tác" : "📄 Tạo hợp đồng đối tác"}
      onClose={onClose}
      wide
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={handleSave}>💾 Lưu hợp đồng</button>
      </>}
    >
      <div style={{ fontWeight: 600, marginBottom: 10, color: "#1890ff" }}>📋 Thông tin chung</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Mã HĐ</label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="Tự động nếu để trống" />
            </div>
            <div className="form-group">
              <label>Loại hợp đồng *</label>
              <select className="form-control" value={form.contractType} onChange={(e) => set("contractType", e.target.value)}>
                {CONTRACT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Đối tác *</label>
              <select className="form-control" value={form.partnerId} onChange={(e) => set("partnerId", e.target.value)}>
                <option value="">-- Chọn đối tác --</option>
                {MOCK_PARTNERS.filter((p: any) => p.status === "active").map((p: any) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Tiêu đề *</label>
              <input className="form-control" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="VD: Hợp đồng quản lý vận hành Tòa A 2024-2026" />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Mô tả</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>

          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 10, color: "#1890ff" }}>💰 Giá trị & thanh toán</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Giá trị HĐ *</label>
              <input className="form-control" type="number" value={form.value} onChange={(e) => set("value", +e.target.value)} />
              <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{fmtMoney(+form.value || 0)}</div>
            </div>
            <div className="form-group">
              <label>Điều khoản thanh toán</label>
              <select className="form-control" value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)}>
                {PAYMENT_TERMS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 10, color: "#1890ff" }}>📅 Hiệu lực</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Ngày ký</label>
              <input className="form-control" type="date" value={form.signedDate} onChange={(e) => set("signedDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Ngày bắt đầu *</label>
              <input className="form-control" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc *</label>
              <input className="form-control" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="draft">Nháp</option>
                <option value="active">Có hiệu lực</option>
                <option value="expired">Hết hạn</option>
                <option value="terminated">Chấm dứt sớm</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" checked={form.autoRenew} onChange={(e) => set("autoRenew", e.target.checked)} />
                {" "}Tự động gia hạn
              </label>
            </div>
            <div className="form-group">
              <label>Thông báo trước (ngày)</label>
              <input className="form-control" type="number" value={form.renewalNotice} onChange={(e) => set("renewalNotice", +e.target.value)} />
            </div>
          </div>

          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 10, color: "#1890ff" }}>✍️ Người ký</div>
          <div className="form-grid">
            <div className="form-group">
              <label>TNPM đại diện</label>
              <input className="form-control" value={form.signedBy} onChange={(e) => set("signedBy", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Đối tác đại diện</label>
              <input className="form-control" value={form.partnerSigner} onChange={(e) => set("partnerSigner", e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Ghi chú</label>
              <textarea className="form-control" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} />
            </div>
          </div>
    </ModalShell>
  );
}

// ─── Detail Modal ────────────────────────────────────────────────────────
function ContractDetailModal({ contract, onClose, onEdit }: any) {
  const meta = getTypeMeta(contract.contractType);
  const days = daysUntil(contract.endDate) ?? 0;
  return (
    <ModalShell
      title={`${meta.icon} ${contract.code}`}
      onClose={onClose}
      wide
      maxWidth={780}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Đóng</button>
        <button className="btn btn-primary" onClick={onEdit}>✏️ Sửa HĐ</button>
      </>}
    >
          <div style={{ background: `${meta.color}11`, borderLeft: `4px solid ${meta.color}`, padding: 14, borderRadius: 6, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", fontWeight: 600 }}>{contract.contractTypeLabel}</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{contract.title}</div>
            <div style={{ fontSize: 13, color: "#595959", marginTop: 6 }}>{contract.description}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Đối tác</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{contract.partnerName}</div>
            </div>
            <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Giá trị</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#722ed1", marginTop: 4 }}>{fmtMoney(contract.value)}</div>
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>{PAYMENT_TERMS.find((p) => p.value === contract.paymentTerms)?.label}</div>
            </div>
            <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Hiệu lực</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{contract.startDate} → {contract.endDate}</div>
              <div style={{ fontSize: 11, marginTop: 4, color: days < 0 ? "#ff4d4f" : days < 30 ? "#faad14" : "#52c41a" }}>
                {days < 0 ? `Đã hết hạn ${Math.abs(days)} ngày` : days === 0 ? "Hết hạn hôm nay" : `Còn ${days} ngày`}
              </div>
            </div>
            <div style={{ background: "#f5f7fa", padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Ngày ký</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{contract.signedDate || "—"}</div>
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>
                {contract.autoRenew ? `🔄 Auto-renew, báo trước ${contract.renewalNotice} ngày` : "❌ Không tự gia hạn"}
              </div>
            </div>
          </div>

          <div style={{ background: "#fffbe6", padding: 14, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 6 }}>Người ký</div>
            <div style={{ fontSize: 13, marginBottom: 4 }}><strong>TNPM:</strong> {contract.signedBy || "—"}</div>
            <div style={{ fontSize: 13 }}><strong>Đối tác:</strong> {contract.partnerSigner || "—"}</div>
          </div>

          {contract.note && (
            <div style={{ padding: 12, background: "#f5f7fa", borderRadius: 6, fontSize: 13 }}>
              📝 <strong>Ghi chú:</strong> {contract.note}
            </div>
          )}

          <div style={{ marginTop: 16, padding: 12, border: "1px dashed #d9d9d9", borderRadius: 6, color: "#8c8c8c", fontSize: 12, textAlign: "center" }}>
            📎 {contract.attachments || 0} file đính kèm (prototype — upload chưa hoạt động)
          </div>
    </ModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function PartnerContractList() {
  document.title = "Hợp đồng Đối tác – TNPM";

  const [contracts, setContracts] = useState<any[]>(MOCK_PARTNER_CONTRACTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPartner, setFilterPartner] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [detailTarget, setDetailTarget] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return contracts.filter((c: any) => {
      const q = search.toLowerCase();
      if (search && !c.title.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q) && !c.partnerName.toLowerCase().includes(q)) return false;
      if (filterType !== "all" && c.contractType !== filterType) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterPartner && String(c.partnerId) !== filterPartner) return false;
      return true;
    });
  }, [contracts, search, filterType, filterStatus, filterPartner]);

  // KPI
  const totalValue = contracts.reduce((a: number, c: any) => a + c.value, 0);
  const activeValue = contracts.filter((c: any) => c.status === "active").reduce((a: number, c: any) => a + c.value, 0);
  const expiringSoon = contracts.filter((c: any) => {
    const d = daysUntil(c.endDate) ?? -1;
    return c.status === "active" && d >= 0 && d <= 60;
  }).length;
  const expiredCount = contracts.filter((c: any) => c.status === "expired" || (daysUntil(c.endDate) ?? 0) < 0).length;

  const handleSave = (data: any) => {
    if (contracts.find((c: any) => c.id === data.id)) {
      setContracts((prev: any) => prev.map((c: any) => (c.id === data.id ? data : c)));
    } else {
      setContracts((prev: any) => [...prev, data]);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = (id: number) => {
    setContracts((prev: any) => prev.filter((c: any) => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="📄 Hợp đồng Đối tác"
        subtitle="Quản lý tất cả hợp đồng hợp tác, hoa hồng, tư vấn và phân phối với đối tác"
        actions={<>
          <button className="btn btn-outline">📊 Xuất Excel</button>
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>+ Tạo hợp đồng</button>
        </>}
      />

      <KpiRow columns={4} items={[
        { label: "Tổng giá trị HĐ", value: fmtMoney(totalValue), color: "#722ed1", icon: "💰" },
        { label: "HĐ đang hiệu lực", value: fmtMoney(activeValue), color: "#52c41a", icon: "✅" },
        { label: "Sắp hết hạn (≤60 ngày)", value: `${expiringSoon} HĐ`, color: "#faad14", icon: "⚠️" },
        { label: "Đã hết hạn", value: `${expiredCount} HĐ`, color: "#ff4d4f", icon: "⏱️" },
      ]} />

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 16px", flexWrap: "wrap" }}>
        {[{ key: "all", label: `Tất cả (${contracts.length})` }, ...CONTRACT_TYPES.map((t) => ({ key: t.value, label: `${t.icon} ${t.label} (${contracts.filter((c: any) => c.contractType === t.value).length})` }))].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterType(t.key)}
            style={{
              padding: "12px 14px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 12, fontWeight: filterType === t.key ? 600 : 400,
              color: filterType === t.key ? "#1890ff" : "#8c8c8c",
              borderBottom: filterType === t.key ? "2px solid #1890ff" : "2px solid transparent",
              whiteSpace: "nowrap",
            }}
          >{t.label}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
          <input className="search-input" style={{ width: 220 }} placeholder="🔍 Tìm mã, tiêu đề, đối tác..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={filterPartner} onChange={(e) => setFilterPartner(e.target.value)}>
            <option value="">Tất cả đối tác</option>
            {MOCK_PARTNERS.map((p: any) => <option key={p.id} value={p.id}>{p.shortName || p.name}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Mọi trạng thái</option>
            <option value="active">Có hiệu lực</option>
            <option value="expired">Hết hạn</option>
            <option value="terminated">Chấm dứt</option>
            <option value="draft">Nháp</option>
          </select>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Đối tác</th>
              <th>Giá trị</th>
              <th>Điều khoản</th>
              <th>Hiệu lực</th>
              <th>Còn lại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>Không có hợp đồng nào.</td></tr>
            )}
            {filtered.map((c: any) => {
              const meta = getTypeMeta(c.contractType);
              const days = daysUntil(c.endDate) ?? 0;
              const dayLabel = days < 0 ? `Quá ${Math.abs(days)} ngày` : days === 0 ? "Hôm nay" : `${days} ngày`;
              const dayColor = days < 0 ? "#ff4d4f" : days <= 30 ? "#faad14" : days <= 60 ? "#fa8c16" : "#52c41a";
              return (
                <tr key={c.id}>
                  <td><span className="code-text">{c.code}</span></td>
                  <td style={{ fontWeight: 500, maxWidth: 240 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description}</div>
                  </td>
                  <td>
                    <StatusBadge label={meta.label} color={meta.color} icon={meta.icon} />
                  </td>
                  <td style={{ fontSize: 13, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.partnerName}</td>
                  <td className="amount-text" style={{ fontWeight: 600 }}>{fmtMoney(c.value)}</td>
                  <td style={{ fontSize: 11 }}>{PAYMENT_TERMS.find((p) => p.value === c.paymentTerms)?.label || c.paymentTerms}</td>
                  <td style={{ fontSize: 11 }}>
                    <div>{c.startDate}</div>
                    <div>→ {c.endDate}</div>
                  </td>
                  <td style={{ fontSize: 12, color: dayColor, fontWeight: 500 }}>
                    {dayLabel}
                    {c.autoRenew && <div style={{ fontSize: 10, color: "#1890ff" }}>🔄 Auto-renew</div>}
                  </td>
                  <td>
                    <StatusBadge
                      label={c.status === "active" ? "Có hiệu lực" : c.status === "expired" ? "Hết hạn" : c.status === "draft" ? "Nháp" : "Chấm dứt"}
                      color={c.status === "active" ? "#52c41a" : c.status === "expired" ? "#ff4d4f" : c.status === "draft" ? "#1890ff" : "#8c8c8c"}
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="action-btn" onClick={() => setDetailTarget(c)} title="Xem chi tiết">👁</button>
                      <button className="action-btn" onClick={() => { setEditTarget(c); setShowModal(true); }} title="Sửa">✏️</button>
                      <button className="action-btn action-btn--delete" onClick={() => setDeleteId(c.id)} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <AddEditContractModal contract={editTarget} onClose={() => { setShowModal(false); setEditTarget(null); }} onSave={handleSave} />}
      {detailTarget && !showModal && (
        <ContractDetailModal
          contract={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null); setShowModal(true); }}
        />
      )}
      {deleteId && (
        <ConfirmDialog
          title="Xóa hợp đồng"
          message="Bạn có chắc muốn xóa hợp đồng này?"
          confirmLabel="Xóa"
          danger
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
        />
      )}
    </div>
  );
}
