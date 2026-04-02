import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_UTILITY_RATES, MOCK_PROJECTS } from "assets/mock/TNPMData";

const fmtMoney = (n: number) => `${(n || 0).toLocaleString("vi-VN")} đ`;

// ─── Tiered electricity editor ────────────────────────────────────────────────
function TieredEditor({ tiers, onChange }: { tiers: any[]; onChange: (t: any[]) => void }) {
  const setTier = (i: number, k: string, v: any) => {
    const next = [...tiers];
    next[i] = { ...next[i], [k]: v === "" ? null : +v };
    onChange(next);
  };
  const addTier = () => onChange([...tiers, { from: tiers.at(-1)?.to ?? 0, to: null, price: 0 }]);
  const removeTier = (i: number) => onChange(tiers.filter((_, idx) => idx !== i));

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 6 }}>
        {["Từ (kWh)", "Đến (kWh)", "Đơn giá (đ/kWh)", ""].map((h) => (
          <div key={h} style={{ fontSize: 11, color: "#8c8c8c", fontWeight: 500 }}>{h}</div>
        ))}
      </div>
      {tiers.map((tier, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 6 }}>
          <input className="form-control" type="number" min={0} value={tier.from ?? ""} style={{ padding: "6px 10px" }}
            onChange={(e) => setTier(i, "from", e.target.value)} />
          <input className="form-control" type="number" min={0} placeholder="∞" value={tier.to ?? ""} style={{ padding: "6px 10px" }}
            onChange={(e) => setTier(i, "to", e.target.value)} />
          <input className="form-control" type="number" min={0} value={tier.price ?? ""} style={{ padding: "6px 10px" }}
            onChange={(e) => setTier(i, "price", e.target.value)} />
          <button onClick={() => removeTier(i)}
            style={{ padding: "6px 10px", border: "1px solid #ffccc7", background: "#fff2f0", borderRadius: 6, cursor: "pointer", color: "#ff4d4f", fontSize: 14 }}>
            ✕
          </button>
        </div>
      ))}
      <button onClick={addTier}
        style={{ border: "1px dashed #1890ff", background: "#f0f7ff", color: "#1890ff", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontSize: 12, marginTop: 4 }}>
        + Thêm bậc
      </button>
    </div>
  );
}

// ─── Rate Edit Modal ──────────────────────────────────────────────────────────
function RateModal({ rate, onSave, onClose }: any) {
  const isEdit = !!rate?.id;
  const [form, setForm] = useState({ ...rate });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  // Live preview calculation
  const sampleArea = 70;     // m²
  const sampleWater = 18;    // m³ tiêu thụ
  const sampleElec = 200;    // kWh tiêu thụ

  const calcElec = () => {
    let base = 0;
    if (form.electricFormula === "tiered" && form.electricTiered?.length) {
      let remaining = sampleElec;
      for (const tier of form.electricTiered) {
        const cap = tier.to ? tier.to - tier.from : remaining;
        const used = Math.min(remaining, cap);
        base += used * tier.price;
        remaining -= used;
        if (remaining <= 0) break;
      }
    } else {
      base = sampleElec * (form.electricUnitPrice || 0);
    }
    return Math.round(base * (1 + (form.electricSurcharge || 0) / 100));
  };

  const calcWater = () =>
    Math.round(sampleWater * (form.waterUnitPrice || 0) * (1 + (form.waterSurcharge || 0) / 100));

  const calcMgmt = () => {
    if (form.mgmtFormula === "per_m2") return sampleArea * (form.managementFeePerM2 || 0);
    if (form.mgmtFormula === "flat_per_unit") return form.managementFeeFlat || 0;
    return 0;
  };

  const totalSample = calcElec() + calcWater() + calcMgmt();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 860, maxHeight: "92vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? "✏️ Sửa biểu giá" : "➕ Thêm biểu giá"} — {MOCK_PROJECTS.find(p => p.id === rate.projectId)?.name}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Hiệu lực */}
            <div style={{ background: "#fafafa", borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📅 Hiệu lực</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Áp dụng từ ngày <span className="required">*</span></label>
                  <input className="form-control" type="date" value={form.effectiveFrom || ""}
                    onChange={(e) => set("effectiveFrom", e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Đến ngày (để trống = còn hiệu lực)</label>
                  <input className="form-control" type="date" value={form.effectiveTo || ""}
                    onChange={(e) => set("effectiveTo", e.target.value || null)} />
                </div>
              </div>
            </div>

            {/* Điện */}
            <div style={{ background: "#fffbe6", borderRadius: 10, padding: 16, border: "1px solid #ffe58f" }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "#7c4a03" }}>⚡ Công thức tính Điện</div>
              <div className="form-group" style={{ margin: "0 0 12px" }}>
                <label style={{ fontSize: 12 }}>Loại công thức</label>
                <select className="form-control" value={form.electricFormula}
                  onChange={(e) => set("electricFormula", e.target.value)}>
                  <option value="meter">Đơn giá đồng nhất (đ/kWh)</option>
                  <option value="tiered">Bậc thang (nhiều mức giá)</option>
                  <option value="flat">Khoán cố định/tháng</option>
                </select>
              </div>

              {form.electricFormula === "meter" && (
                <div className="form-group" style={{ margin: "0 0 12px" }}>
                  <label style={{ fontSize: 12 }}>Đơn giá (đ/kWh)</label>
                  <input className="form-control" type="number" min={0} value={form.electricUnitPrice || 0}
                    onChange={(e) => set("electricUnitPrice", +e.target.value)} />
                </div>
              )}
              {form.electricFormula === "tiered" && (
                <div>
                  <label style={{ fontSize: 12, color: "#595959", marginBottom: 6, display: "block" }}>Bảng giá bậc thang</label>
                  <TieredEditor tiers={form.electricTiered || []} onChange={(t) => set("electricTiered", t)} />
                </div>
              )}
              {form.electricFormula === "flat" && (
                <div className="form-group" style={{ margin: "0 0 12px" }}>
                  <label style={{ fontSize: 12 }}>Phí điện cố định/tháng (đ)</label>
                  <input className="form-control" type="number" min={0} value={form.electricUnitPrice || 0}
                    onChange={(e) => set("electricUnitPrice", +e.target.value)} />
                </div>
              )}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12 }}>Phụ thu / hao hụt (%)</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input className="form-control" type="number" min={0} max={50} step={0.5}
                    value={form.electricSurcharge || 0} onChange={(e) => set("electricSurcharge", +e.target.value)} />
                  <span style={{ fontSize: 12, color: "#8c8c8c", whiteSpace: "nowrap" }}>% (VAT, hao hụt đường dây...)</span>
                </div>
              </div>
            </div>

            {/* Nước */}
            <div style={{ background: "#f6ffed", borderRadius: 10, padding: 16, border: "1px solid #d9f7be" }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "#135200" }}>💧 Công thức tính Nước</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Loại công thức</label>
                  <select className="form-control" value={form.waterFormula}
                    onChange={(e) => set("waterFormula", e.target.value)}>
                    <option value="meter">Đơn giá đồng nhất (đ/m³)</option>
                    <option value="flat">Khoán cố định/tháng</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Đơn giá (đ/m³)</label>
                  <input className="form-control" type="number" min={0} value={form.waterUnitPrice || 0}
                    onChange={(e) => set("waterUnitPrice", +e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Phụ thu (%)</label>
                  <input className="form-control" type="number" min={0} max={50} step={0.5}
                    value={form.waterSurcharge || 0} onChange={(e) => set("waterSurcharge", +e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Phí quản lý */}
            <div style={{ background: "#f0f0ff", borderRadius: 10, padding: 16, border: "1px solid #d3adf7" }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "#531dab" }}>⚙️ Công thức tính Phí quản lý</div>
              <div className="form-group" style={{ margin: "0 0 12px" }}>
                <label style={{ fontSize: 12 }}>Loại công thức</label>
                <select className="form-control" value={form.mgmtFormula}
                  onChange={(e) => set("mgmtFormula", e.target.value)}>
                  <option value="per_m2">Theo diện tích (đ/m²/tháng)</option>
                  <option value="flat_per_unit">Cố định theo unit/tháng</option>
                  <option value="pct_rent">% tiền thuê</option>
                </select>
              </div>
              {form.mgmtFormula === "per_m2" && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Đơn giá (đ/m²/tháng)</label>
                  <input className="form-control" type="number" min={0} value={form.managementFeePerM2 || 0}
                    onChange={(e) => set("managementFeePerM2", +e.target.value)} />
                  <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>
                    Phí QL = Diện tích (m²) × {(form.managementFeePerM2 || 0).toLocaleString("vi-VN")} đ
                  </div>
                </div>
              )}
              {form.mgmtFormula === "flat_per_unit" && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Phí cố định / unit / tháng (đ)</label>
                  <input className="form-control" type="number" min={0} value={form.managementFeeFlat || 0}
                    onChange={(e) => set("managementFeeFlat", +e.target.value)} />
                </div>
              )}
              {form.mgmtFormula === "pct_rent" && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Tỷ lệ (% tiền thuê)</label>
                  <input className="form-control" type="number" min={0} max={100} step={0.1}
                    value={form.managementFeePctRent || 0} onChange={(e) => set("managementFeePctRent", +e.target.value)} />
                </div>
              )}
            </div>

            {/* Gửi xe */}
            <div style={{ background: "#fff0f6", borderRadius: 10, padding: 16, border: "1px solid #ffadd2" }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "#9e1068" }}>🚗 Phí gửi xe</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Xe máy (đ/chỗ/tháng)</label>
                  <input className="form-control" type="number" min={0} value={form.parkingMotorbike || 0}
                    onChange={(e) => set("parkingMotorbike", +e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Ô tô (đ/chỗ/tháng)</label>
                  <input className="form-control" type="number" min={0} value={form.parkingCar || 0}
                    onChange={(e) => set("parkingCar", +e.target.value)} />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ background: "linear-gradient(135deg, #e6f7ff, #f0f7ff)", borderRadius: 10, padding: 16, border: "1px solid #91d5ff" }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "#003a8c" }}>
                🧮 Xem trước – Ví dụ tính toán
              </div>
              <div style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 10 }}>
                Căn hộ: <b>{sampleArea}m²</b> | Điện: <b>{sampleElec} kWh</b> | Nước: <b>{sampleWater} m³</b>
              </div>
              {[
                { label: "⚡ Tiền điện", value: calcElec(), color: "#faad14" },
                { label: "💧 Tiền nước", value: calcWater(), color: "#52c41a" },
                { label: "⚙️ Phí quản lý", value: calcMgmt(), color: "#722ed1" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#fff", borderRadius: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#595959" }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.color }}>{fmtMoney(row.value)}</span>
                </div>
              ))}
              <div style={{ borderTop: "2px solid #1890ff", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "#003a8c" }}>Tổng (ví dụ)</span>
                <span style={{ fontWeight: 800, fontSize: 17, color: "#1890ff" }}>{fmtMoney(totalSample)}</span>
              </div>
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 8 }}>* Chưa bao gồm phí gửi xe và phí thuê mặt bằng</div>
            </div>

            {/* Ghi chú */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#595959" }}>📝 Ghi chú / Căn cứ biểu giá</label>
              <textarea className="form-control" rows={3} value={form.note || ""}
                onChange={(e) => set("note", e.target.value)}
                placeholder="VD: Áp dụng theo quyết định số... / Theo hợp đồng khung với CĐT..." />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...rate, ...form })}>
            {isEdit ? "Lưu thay đổi" : "Thêm biểu giá"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingBillingRates() {
  document.title = "Biểu giá & Công thức – TNPM";
  const navigate = useNavigate();

  const [rates, setRates] = useState<any[]>(MOCK_UTILITY_RATES);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSave = (data: any) => {
    if (data.id) setRates((p) => p.map((r) => (r.id === data.id ? data : r)));
    else setRates((p) => [...p, { ...data, id: Date.now(), updatedBy: "Nhân viên", updatedAt: new Date().toLocaleDateString("vi-VN") }]);
    setShowModal(false); setEditing(null);
  };

  const FORMULA_LABELS: Record<string, string> = {
    meter: "Chỉ số đồng hồ", tiered: "Bậc thang", flat: "Khoán cố định",
    per_m2: "Theo m²", flat_per_unit: "Cố định/unit", pct_rent: "% tiền thuê",
  };

  return (
    <div className="tnpm-list-page">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13, color: "#8c8c8c" }}>
        <button onClick={() => navigate("/setting")}
          style={{ border: "none", background: "none", cursor: "pointer", color: "#1890ff", padding: 0, fontSize: 13 }}>
          ⚙️ Cài đặt
        </button>
        <span>›</span>
        <button onClick={() => navigate("/setting/fee-types")}
          style={{ border: "none", background: "none", cursor: "pointer", color: "#1890ff", padding: 0, fontSize: 13 }}>
          Loại phí dịch vụ
        </button>
        <span>›</span>
        <span style={{ color: "#1a1a2e", fontWeight: 500 }}>Biểu giá & Công thức tính</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">🧮 Biểu giá & Công thức tính phí</h1>
          <p className="page-sub">Cấu hình đơn giá điện, nước, phí quản lý, gửi xe <b>theo từng dự án</b> — Hệ thống dùng để tự động tính khi nhập chỉ số tháng</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing({ projectId: null, effectiveFrom: "", electricFormula: "meter", electricUnitPrice: 3500, electricTiered: [], electricSurcharge: 10, waterFormula: "meter", waterUnitPrice: 15000, waterSurcharge: 0, mgmtFormula: "per_m2", managementFeePerM2: 10000, managementFeeFlat: 0, managementFeePctRent: 0, parkingMotorbike: 200000, parkingCar: 1200000, note: "" }); setShowModal(true); }}>
          + Thêm biểu giá
        </button>
      </div>

      {/* Info banner */}
      <div style={{ background: "#f0f7ff", border: "1px solid #91d5ff", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div style={{ fontSize: 13, color: "#003a8c", lineHeight: 1.6 }}>
          <b>Cách hoạt động:</b> Khi nhân viên nhập chỉ số điện/nước tháng tại màn hình <b>"Nhập chỉ số tháng"</b>, hệ thống sẽ tự động tra biểu giá của dự án tương ứng để tính thành tiền.
          Mỗi dự án có thể có biểu giá riêng, và biểu giá có ngày hiệu lực để hỗ trợ điều chỉnh giá theo thời gian.
        </div>
      </div>

      {/* Rate cards by project */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {rates.map((rate) => {
          const project = MOCK_PROJECTS.find((p) => p.id === rate.projectId);
          return (
            <div key={rate.id} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "16px 22px", background: "#fafafa", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>{project?.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 2 }}>
                      📅 Hiệu lực: <b>{rate.effectiveFrom}</b>
                      {rate.effectiveTo ? ` → ${rate.effectiveTo}` : " → Đang áp dụng"}
                      &nbsp;|&nbsp; Cập nhật bởi: <b>{rate.updatedBy}</b> ({rate.updatedAt})
                    </div>
                  </div>
                  <span style={{ padding: "3px 12px", borderRadius: 12, background: "#f6ffed", color: "#52c41a", fontSize: 12, fontWeight: 600, border: "1px solid #d9f7be" }}>
                    ✓ Đang áp dụng
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="action-btn action-btn--edit" onClick={() => { setEditing(rate); setShowModal(true); }} title="Sửa biểu giá">✏️</button>
                  <button className="action-btn action-btn--delete" onClick={() => setDeleteId(rate.id)} title="Xóa">🗑️</button>
                </div>
              </div>

              {/* Formula grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, padding: 0 }}>
                {[
                  {
                    icon: "⚡", title: "Điện", bg: "#fffbe6",
                    rows: [
                      { l: "Công thức", v: FORMULA_LABELS[rate.electricFormula] },
                      rate.electricFormula === "tiered"
                        ? { l: "Bậc thang", v: `${rate.electricTiered?.length || 0} bậc` }
                        : { l: "Đơn giá", v: `${(rate.electricUnitPrice || 0).toLocaleString("vi-VN")} đ/kWh` },
                      { l: "Phụ thu", v: `${rate.electricSurcharge || 0}%` },
                    ],
                  },
                  {
                    icon: "💧", title: "Nước", bg: "#f6ffed",
                    rows: [
                      { l: "Công thức", v: FORMULA_LABELS[rate.waterFormula] },
                      { l: "Đơn giá", v: `${(rate.waterUnitPrice || 0).toLocaleString("vi-VN")} đ/m³` },
                      { l: "Phụ thu", v: `${rate.waterSurcharge || 0}%` },
                    ],
                  },
                  {
                    icon: "⚙️", title: "Phí quản lý", bg: "#f5f0ff",
                    rows: [
                      { l: "Công thức", v: FORMULA_LABELS[rate.mgmtFormula] },
                      { l: "Đơn giá", v: rate.mgmtFormula === "per_m2" ? `${(rate.managementFeePerM2 || 0).toLocaleString("vi-VN")} đ/m²` : rate.mgmtFormula === "flat_per_unit" ? `${(rate.managementFeeFlat || 0).toLocaleString("vi-VN")} đ/unit` : `${rate.managementFeePctRent || 0}% tiền thuê` },
                      { l: "Ví dụ 70m²", v: fmtMoney(rate.mgmtFormula === "per_m2" ? 70 * (rate.managementFeePerM2 || 0) : rate.managementFeeFlat || 0) },
                    ],
                  },
                  {
                    icon: "🚗", title: "Gửi xe", bg: "#fff0f6",
                    rows: [
                      { l: "Xe máy", v: fmtMoney(rate.parkingMotorbike) + "/chỗ" },
                      { l: "Ô tô", v: fmtMoney(rate.parkingCar) + "/chỗ" },
                      { l: "", v: "" },
                    ],
                  },
                ].map((col, ci) => (
                  <div key={ci} style={{ padding: "18px 20px", background: col.bg, borderRight: ci < 3 ? "1px solid #f0f0f0" : "none" }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>{col.icon} {col.title}</div>
                    {col.rows.map((row, ri) => row.l ? (
                      <div key={ri} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#8c8c8c" }}>{row.l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{row.v}</div>
                      </div>
                    ) : null)}
                  </div>
                ))}
              </div>

              {/* Note */}
              {rate.note && (
                <div style={{ padding: "10px 22px", background: "#f9f9f9", borderTop: "1px solid #f0f0f0", fontSize: 12, color: "#8c8c8c" }}>
                  📝 {rate.note}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && editing && (
        <RateModal rate={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Xóa biểu giá</h3>
            <p>Xóa biểu giá này sẽ ảnh hưởng đến việc tính toán hóa đơn tháng tiếp theo. Bạn có chắc?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => { setRates(p => p.filter(r => r.id !== deleteId)); setDeleteId(null); }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
