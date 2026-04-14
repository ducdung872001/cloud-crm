import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MOCK_CAM_CHARGES, MOCK_PROJECTS, MOCK_LEASE_CONTRACTS,
} from "assets/mock/TNPMData";
import { PageHeader, KpiRow, ModalShell, StatusBadge, fmtMoney } from "components/tnpm";

const DISTRIBUTION_METHODS = [
  { value: "area_based", label: "Theo diện tích thuê (m²)", icon: "📐" },
  { value: "revenue_based", label: "Theo doanh thu tenant", icon: "💰" },
  { value: "fixed_split", label: "Chia đều cho tất cả tenant", icon: "➗" },
];

// ─── Edit/Add CAM Modal ───────────────────────────────────────────────────
function EditCAMModal({ cam, onClose, onSave }: any) {
  const isEdit = !!cam?.id;
  const [form, setForm] = useState<any>({
    projectId: "", projectName: "",
    effectiveFrom: new Date().toISOString().split("T")[0], effectiveTo: null,
    status: "draft",
    totalCommonAreaM2: 0, totalLeasableAreaM2: 0,
    totalMonthlyCostVND: 0, pricePerM2: 0,
    distributionMethod: "area_based",
    includedItems: [{ code: "", label: "", monthlyCost: 0 }],
    note: "",
    ...cam,
  });

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const totalItemsCost = form.includedItems.reduce((a: number, it: any) => a + (+it.monthlyCost || 0), 0);
  const calcPricePerM2 = form.totalLeasableAreaM2 > 0 ? Math.round(totalItemsCost / form.totalLeasableAreaM2) : 0;

  const addItem = () => set("includedItems", [...form.includedItems, { code: "", label: "", monthlyCost: 0 }]);
  const updateItem = (idx: number, key: string, val: any) => {
    const items = [...form.includedItems];
    items[idx] = { ...items[idx], [key]: val };
    set("includedItems", items);
  };
  const removeItem = (idx: number) => set("includedItems", form.includedItems.filter((_: any, i: number) => i !== idx));

  const handleSave = () => {
    if (!form.projectId) return alert("Vui lòng chọn dự án");
    if (form.totalLeasableAreaM2 <= 0) return alert("Tổng diện tích cho thuê phải > 0");
    const project = MOCK_PROJECTS.find((p: any) => p.id === +form.projectId);
    onSave({
      ...form,
      id: form.id || Date.now(),
      projectId: +form.projectId,
      projectName: project?.name || form.projectName,
      totalMonthlyCostVND: totalItemsCost,
      pricePerM2: calcPricePerM2,
      updatedBy: "Người dùng hiện tại",
      updatedAt: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <ModalShell
      title={isEdit ? "✏️ Sửa cấu hình CAM" : "🏢 Thêm cấu hình CAM cho dự án"}
      onClose={onClose}
      wide
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={handleSave}>💾 Lưu cấu hình CAM</button>
      </>}
    >
      <div style={{ fontWeight: 600, marginBottom: 10, color: "#1890ff" }}>📋 Thông tin dự án</div>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Dự án áp dụng *</label>
              <select className="form-control" value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>
                <option value="">-- Chọn dự án --</option>
                {MOCK_PROJECTS.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Hiệu lực từ *</label>
              <input className="form-control" type="date" value={form.effectiveFrom} onChange={(e) => set("effectiveFrom", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Hiệu lực đến</label>
              <input className="form-control" type="date" value={form.effectiveTo || ""} onChange={(e) => set("effectiveTo", e.target.value || null)} />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="draft">Nháp</option>
                <option value="active">Đang áp dụng</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phương thức phân bổ</label>
              <select className="form-control" value={form.distributionMethod} onChange={(e) => set("distributionMethod", e.target.value)}>
                {DISTRIBUTION_METHODS.map((m) => <option key={m.value} value={m.value}>{m.icon} {m.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 10, color: "#1890ff" }}>📐 Diện tích</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Tổng diện tích khu vực chung (m²)</label>
              <input className="form-control" type="number" value={form.totalCommonAreaM2} onChange={(e) => set("totalCommonAreaM2", +e.target.value)} />
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>Sảnh, hành lang, thang máy công cộng, wc chung...</div>
            </div>
            <div className="form-group">
              <label>Tổng diện tích cho thuê (m²) *</label>
              <input className="form-control" type="number" value={form.totalLeasableAreaM2} onChange={(e) => set("totalLeasableAreaM2", +e.target.value)} />
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>Tổng diện tích các mặt bằng cho tenant thuê</div>
            </div>
          </div>

          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 10, color: "#1890ff" }}>💸 Cấu trúc chi phí CAM hàng tháng</div>
          <div style={{ background: "#fafafa", padding: 12, borderRadius: 8 }}>
            {form.includedItems.map((it: any, idx: number) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr auto", gap: 10, marginBottom: 8 }}>
                <input className="form-control" placeholder="Mã (vd: cleaning_cam)" value={it.code} onChange={(e) => updateItem(idx, "code", e.target.value)} />
                <input className="form-control" placeholder="Tên mục chi phí" value={it.label} onChange={(e) => updateItem(idx, "label", e.target.value)} />
                <input className="form-control" type="number" placeholder="Chi phí/tháng (đ)" value={it.monthlyCost} onChange={(e) => updateItem(idx, "monthlyCost", +e.target.value)} />
                <button className="action-btn action-btn--delete" onClick={() => removeItem(idx)} title="Xóa">🗑️</button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ marginTop: 6 }} onClick={addItem}>+ Thêm mục chi phí</button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, padding: "10px 0", borderTop: "2px solid #e8e8e8", fontWeight: 600 }}>
              <span>Tổng chi phí CAM/tháng:</span>
              <span style={{ color: "#ff4d4f", fontSize: 16 }}>{fmtMoney(totalItemsCost)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 14 }}>
              <span style={{ color: "#8c8c8c" }}>⚙️ Đơn giá CAM tự động tính:</span>
              <strong style={{ color: "#1890ff" }}>{fmtMoney(calcPricePerM2)} / m² / tháng</strong>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Ghi chú</label>
            <textarea className="form-control" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} />
          </div>
    </ModalShell>
  );
}

// ─── Allocation Preview Modal ─────────────────────────────────────────────
function AllocationPreviewModal({ cam, onClose }: any) {
  // Tính phí CAM cho tất cả tenant thuộc dự án này (lấy từ MOCK_LEASE_CONTRACTS)
  const tenants = MOCK_LEASE_CONTRACTS.filter((c: any) => c.projectId === cam.projectId && c.status === "active");

  // Mock diện tích tenant (mỗi tenant được mock ngẫu nhiên trong khoảng hợp lý)
  const tenantArea: Record<number, number> = { 1: 80, 2: 220, 3: 5000, 4: 120 };

  const rows = tenants.map((t: any) => {
    const area = tenantArea[t.id] || 100;
    const camAmount = area * cam.pricePerM2;
    return { ...t, leasedArea: area, camAmount };
  });

  const totalArea = rows.reduce((a: number, r: any) => a + r.leasedArea, 0);
  const totalCam = rows.reduce((a: number, r: any) => a + r.camAmount, 0);

  return (
    <ModalShell
      title={`🧮 Preview phân bổ CAM — ${cam.projectName}`}
      onClose={onClose}
      wide
      footer={<button className="btn btn-primary" onClick={onClose}>Đóng</button>}
    >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Tổng chi phí CAM/tháng", value: fmtMoney(cam.totalMonthlyCostVND), color: "#ff4d4f" },
              { label: "Đơn giá CAM", value: `${fmtMoney(cam.pricePerM2)}/m²`, color: "#1890ff" },
              { label: "Tổng DT thuê", value: `${totalArea.toLocaleString("vi-VN")} m²`, color: "#722ed1" },
              { label: "Tổng CAM thu về", value: fmtMoney(totalCam), color: "#52c41a" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fafafa", padding: 12, borderRadius: 8, borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {totalCam < cam.totalMonthlyCostVND && (
            <div style={{ padding: 10, background: "#fff7e6", borderRadius: 6, fontSize: 12, color: "#ad6800", marginBottom: 14 }}>
              ⚠ <strong>Thiếu hụt:</strong> CAM thu về ({fmtMoney(totalCam)}) &lt; chi phí thực tế ({fmtMoney(cam.totalMonthlyCostVND)}). Chênh lệch: {fmtMoney(cam.totalMonthlyCostVND - totalCam)}. Có thể do một phần diện tích chưa cho thuê.
            </div>
          )}

          <div style={{ fontWeight: 600, marginBottom: 10 }}>📊 Phân bổ cho tenant (active leases)</div>
          {rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#8c8c8c", background: "#fafafa", borderRadius: 8 }}>
              Chưa có tenant nào active cho dự án này.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã HĐ thuê</th>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Diện tích (m²)</th>
                  <th>Đơn giá CAM</th>
                  <th>CAM/tháng</th>
                  <th>% tổng</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id}>
                    <td><span className="code-text">{r.code}</span></td>
                    <td style={{ fontWeight: 500 }}>{r.customerName}</td>
                    <td><span className="code-text">{r.unitCode}</span></td>
                    <td style={{ textAlign: "right" }}>{r.leasedArea.toLocaleString("vi-VN")}</td>
                    <td className="amount-text" style={{ fontSize: 12 }}>{fmtMoney(cam.pricePerM2)}/m²</td>
                    <td className="amount-text" style={{ color: "#ff4d4f", fontWeight: 600 }}>{fmtMoney(r.camAmount)}</td>
                    <td style={{ textAlign: "right", fontSize: 12 }}>{((r.camAmount / totalCam) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 14, fontSize: 11, color: "#8c8c8c", fontStyle: "italic" }}>
            💡 CAM sẽ được tự động thêm vào hóa đơn định kỳ của từng tenant khi tạo billing tháng. Có thể override thủ công trong hợp đồng thuê.
          </div>
    </ModalShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function SettingCAMCharges() {
  document.title = "CAM Charges – TNPM";
  const navigate = useNavigate();

  const [cams, setCams] = useState<any[]>(MOCK_CAM_CHARGES);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [previewTarget, setPreviewTarget] = useState<any>(null);

  const handleSave = (data: any) => {
    if (cams.find((c: any) => c.id === data.id)) {
      setCams((prev: any) => prev.map((c: any) => (c.id === data.id ? data : c)));
    } else {
      setCams((prev: any) => [...prev, data]);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const totalCamProjects = cams.filter((c: any) => c.status === "active").length;
  const totalMonthly = cams.filter((c: any) => c.status === "active").reduce((a: number, c: any) => a + c.totalMonthlyCostVND, 0);

  return (
    <div className="tnpm-list-page">
      <PageHeader
        title="🏢 CAM Charges (Common Area Maintenance)"
        subtitle="Cấu hình phí khu vực chung cho TTTM, Văn phòng, KCN — phân bổ theo diện tích / doanh thu"
        backLink={{ label: "Cài đặt", onClick: () => navigate("/setting") }}
        actions={<button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>+ Thêm cấu hình CAM</button>}
      />

      <KpiRow columns={3} items={[
        { label: "Dự án áp dụng CAM", value: `${totalCamProjects}/${cams.length}`, color: "#1890ff", icon: "🏢" },
        { label: "Tổng CAM/tháng (active)", value: fmtMoney(totalMonthly), color: "#ff4d4f", icon: "💸" },
        { label: "Dự án có cấu hình", value: `${cams.length} config`, color: "#722ed1", icon: "⚙️" },
      ]} />

      {/* CAM cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))", gap: 16 }}>
        {cams.map((c: any) => {
          const method = DISTRIBUTION_METHODS.find((m) => m.value === c.distributionMethod);
          return (
            <div key={c.id} style={{
              background: "#fff", borderRadius: 12, padding: 18,
              boxShadow: "0 2px 8px rgba(0,0,0,.06)",
              borderLeft: `4px solid ${c.status === "active" ? "#52c41a" : c.status === "draft" ? "#faad14" : "#8c8c8c"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{c.projectName}</div>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                    Hiệu lực từ {c.effectiveFrom}
                    {c.effectiveTo && ` → ${c.effectiveTo}`}
                  </div>
                </div>
                <StatusBadge
                  label={c.status === "active" ? "Đang áp dụng" : c.status === "draft" ? "Nháp" : "Tạm dừng"}
                  color={c.status === "active" ? "#52c41a" : c.status === "draft" ? "#faad14" : "#8c8c8c"}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ background: "#f5f7fa", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Đơn giá CAM</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1890ff" }}>{fmtMoney(c.pricePerM2)}/m²</div>
                </div>
                <div style={{ background: "#f5f7fa", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>Tổng CAM/tháng</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#ff4d4f" }}>{fmtMoney(c.totalMonthlyCostVND)}</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#595959", marginBottom: 8 }}>
                📐 Diện tích chung: <strong>{c.totalCommonAreaM2.toLocaleString("vi-VN")} m²</strong> · Cho thuê: <strong>{c.totalLeasableAreaM2.toLocaleString("vi-VN")} m²</strong>
              </div>
              <div style={{ fontSize: 12, color: "#595959", marginBottom: 10 }}>
                {method?.icon} Phân bổ: <strong>{method?.label}</strong>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#8c8c8c", marginBottom: 4 }}>Cấu trúc chi phí ({c.includedItems.length} mục)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {c.includedItems.slice(0, 4).map((it: any, i: number) => (
                    <span key={i} style={{ fontSize: 10, padding: "3px 8px", background: "#e6f7ff", color: "#1890ff", borderRadius: 10 }}>
                      {it.label.length > 22 ? it.label.slice(0, 20) + "..." : it.label}
                    </span>
                  ))}
                  {c.includedItems.length > 4 && (
                    <span style={{ fontSize: 10, color: "#8c8c8c" }}>+{c.includedItems.length - 4} khác</span>
                  )}
                </div>
              </div>

              {c.note && (
                <div style={{ fontSize: 11, color: "#8c8c8c", fontStyle: "italic", marginBottom: 10 }}>{c.note}</div>
              )}

              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-primary" style={{ flex: 1, padding: "6px 12px", fontSize: 12 }} onClick={() => setPreviewTarget(c)}>🧮 Preview phân bổ</button>
                <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => { setEditTarget(c); setShowModal(true); }}>✏️ Sửa</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <EditCAMModal cam={editTarget} onClose={() => { setShowModal(false); setEditTarget(null); }} onSave={handleSave} />}
      {previewTarget && <AllocationPreviewModal cam={previewTarget} onClose={() => setPreviewTarget(null)} />}
    </div>
  );
}
