import React, { useState, useMemo } from "react";
import {
  MOCK_METER_READINGS, MOCK_PROJECTS, MOCK_UNITS,
  MOCK_SERVICE_CONTRACTS, MOCK_UTILITY_RATES,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(2)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

// ─── Modal nhập chỉ số cho 1 unit ────────────────────────────────────────────
function InputMeterModal({ reading, onSave, onClose }: any) {
  const rates = MOCK_UTILITY_RATES.find((r) => r.projectId === reading.projectId) || {
    electricUnitPrice: 3500, waterUnitPrice: 15000, managementFeePerM2: 10000,
  };
  const unit = MOCK_UNITS.find((u) => u.id === reading.unitId);

  const [form, setForm] = useState({
    waterCurr: reading.waterCurr || 0,
    electricCurr: reading.electricCurr || 0,
    managementFee: reading.managementFee || (unit ? Math.round(unit.area * rates.managementFeePerM2) : 0),
    parkingFee: reading.parkingFee || 0,
    parkingSlots: Math.round((reading.parkingFee || 0) / 1200000),
    parkingUnitPrice: 1200000,
    otherFees: reading.otherFees || [] as { name: string; amount: number }[],
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-calculate
  const waterUsed = Math.max(0, form.waterCurr - reading.waterPrev);
  const waterAmount = waterUsed * rates.waterUnitPrice;
  const electricUsed = Math.max(0, form.electricCurr - reading.electricPrev);
  const electricAmount = electricUsed * rates.electricUnitPrice;
  const parkingFee = form.parkingSlots * form.parkingUnitPrice;
  const otherTotal = form.otherFees.reduce((a: number, f: any) => a + (+f.amount || 0), 0);
  const totalAmount = waterAmount + electricAmount + form.managementFee + parkingFee + otherTotal;

  const addOtherFee = () =>
    setForm((f) => ({ ...f, otherFees: [...f.otherFees, { name: "", amount: 0 }] }));
  const setOther = (i: number, k: string, v: any) =>
    setForm((f) => {
      const fees = [...f.otherFees];
      fees[i] = { ...fees[i], [k]: v };
      return { ...f, otherFees: fees };
    });
  const removeOther = (i: number) =>
    setForm((f) => ({ ...f, otherFees: f.otherFees.filter((_: any, idx: number) => idx !== i) }));

  const handleSave = () => {
    onSave({
      ...reading,
      waterCurr: form.waterCurr, waterUsed, waterAmount,
      electricCurr: form.electricCurr, electricUsed, electricAmount,
      managementFee: form.managementFee,
      parkingFee, otherFees: form.otherFees,
      totalAmount,
      status: "entered",
      inputBy: "Nhân viên vận hành",
      inputAt: new Date().toLocaleString("vi-VN"),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            📋 Nhập chỉ số tháng – Unit <span style={{ color: "#1890ff" }}>{reading.unitCode}</span>
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Info row */}
          <div style={{ display: "flex", gap: 16, background: "#f0f7ff", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
            <div><span style={{ color: "#8c8c8c" }}>Khách hàng:</span> <b>{reading.customerName}</b></div>
            <div><span style={{ color: "#8c8c8c" }}>Unit:</span> <b>{reading.unitCode}</b></div>
            <div><span style={{ color: "#8c8c8c" }}>Kỳ:</span> <b>{reading.period}</b></div>
            {unit && <div><span style={{ color: "#8c8c8c" }}>Diện tích:</span> <b>{unit.area} m²</b></div>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* NƯỚC */}
            <div style={{ background: "#f6ffed", borderRadius: 12, padding: 18, border: "1px solid #d9f7be" }}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15, color: "#135200" }}>
                💧 Nước
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Chỉ số cũ (m³)</label>
                  <input className="form-control" value={reading.waterPrev} disabled
                    style={{ background: "#f5f5f5", fontWeight: 600, color: "#8c8c8c" }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Chỉ số mới (m³) <span style={{ color: "#ff4d4f" }}>*</span></label>
                  <input className="form-control" type="number" min={reading.waterPrev}
                    value={form.waterCurr || ""}
                    onChange={(e) => set("waterCurr", +e.target.value)}
                    style={{ borderColor: "#52c41a", fontWeight: 700 }}
                    placeholder="Nhập chỉ số mới" />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 12px", background: "#fff", borderRadius: 8 }}>
                <span>Tiêu thụ: <b>{waterUsed} m³</b> × {rates.waterUnitPrice.toLocaleString("vi-VN")} đ/m³</span>
                <b style={{ color: "#52c41a" }}>{fmtMoney(waterAmount)}</b>
              </div>
            </div>

            {/* ĐIỆN */}
            <div style={{ background: "#fffbe6", borderRadius: 12, padding: 18, border: "1px solid #ffe58f" }}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15, color: "#874d00" }}>
                ⚡ Điện
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Chỉ số cũ (kWh)</label>
                  <input className="form-control" value={reading.electricPrev} disabled
                    style={{ background: "#f5f5f5", fontWeight: 600, color: "#8c8c8c" }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Chỉ số mới (kWh) <span style={{ color: "#ff4d4f" }}>*</span></label>
                  <input className="form-control" type="number" min={reading.electricPrev}
                    value={form.electricCurr || ""}
                    onChange={(e) => set("electricCurr", +e.target.value)}
                    style={{ borderColor: "#faad14", fontWeight: 700 }}
                    placeholder="Nhập chỉ số mới" />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 12px", background: "#fff", borderRadius: 8 }}>
                <span>Tiêu thụ: <b>{electricUsed} kWh</b> × {rates.electricUnitPrice.toLocaleString("vi-VN")} đ/kWh</span>
                <b style={{ color: "#faad14" }}>{fmtMoney(electricAmount)}</b>
              </div>
            </div>
          </div>

          {/* PHÍ CỐ ĐỊNH */}
          <div style={{ marginTop: 20, background: "#f5f0ff", borderRadius: 12, padding: 18, border: "1px solid #d3adf7" }}>
            <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15, color: "#531dab" }}>📋 Phí cố định tháng</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12 }}>Phí quản lý (đ/tháng)</label>
                <input className="form-control" type="number" min={0}
                  value={form.managementFee}
                  onChange={(e) => set("managementFee", +e.target.value)} />
                {unit && (
                  <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>
                    {unit.area} m² × {rates.managementFeePerM2.toLocaleString("vi-VN")} đ/m²
                  </div>
                )}
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12 }}>Số chỗ gửi xe</label>
                <input className="form-control" type="number" min={0} max={10}
                  value={form.parkingSlots}
                  onChange={(e) => set("parkingSlots", +e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12 }}>Phí/chỗ/tháng (đ)</label>
                <input className="form-control" type="number" min={0}
                  value={form.parkingUnitPrice}
                  onChange={(e) => set("parkingUnitPrice", +e.target.value)} />
                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>
                  Tổng gửi xe: {fmtMoney(parkingFee)}
                </div>
              </div>
            </div>
          </div>

          {/* PHÍ KHÁC */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#595959" }}>🔧 Phí khác (nếu có)</span>
              <button className="btn btn-outline" style={{ padding: "4px 12px", fontSize: 12 }} onClick={addOtherFee}>
                + Thêm phí
              </button>
            </div>
            {form.otherFees.map((fee: any, i: number) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, marginBottom: 8, alignItems: "center" }}>
                <input className="form-control" value={fee.name}
                  onChange={(e) => setOther(i, "name", e.target.value)}
                  placeholder="Tên khoản phí (VD: phí thang máy ngoài giờ)" />
                <input className="form-control" type="number" min={0} value={fee.amount}
                  onChange={(e) => setOther(i, "amount", +e.target.value)}
                  placeholder="Số tiền" style={{ width: 160 }} />
                <button onClick={() => removeOther(i)}
                  style={{ background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#ff4d4f" }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* TỔNG KẾT */}
          <div style={{ marginTop: 20, background: "#e6f7ff", borderRadius: 12, padding: 18, border: "1px solid #91d5ff" }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15, color: "#003a8c" }}>💰 Tổng hóa đơn tháng {reading.period}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              {[
                { label: "💧 Tiền nước", value: waterAmount },
                { label: "⚡ Tiền điện", value: electricAmount },
                { label: "📋 Phí quản lý", value: form.managementFee },
                { label: "🚗 Gửi xe", value: parkingFee },
                ...form.otherFees.map((f: any) => ({ label: `🔧 ${f.name || "Phí khác"}`, value: +f.amount || 0 })),
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderRadius: 6, background: row.value > 0 ? "rgba(255,255,255,0.6)" : "transparent" }}>
                  <span style={{ color: "#595959" }}>{row.label}</span>
                  <span style={{ fontWeight: 500 }}>{fmtMoney(row.value)}</span>
                </div>
              ))}
              <div style={{ borderTop: "2px solid #1890ff", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
                <span style={{ color: "#003a8c" }}>TỔNG CỘNG</span>
                <span style={{ color: "#1890ff" }}>{fmtMoney(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-default" onClick={() => onSave({ ...reading, status: "draft" })}>
            💾 Lưu nháp
          </button>
          <button className="btn btn-primary" onClick={handleSave}
            disabled={!form.waterCurr || !form.electricCurr}
            style={{ opacity: (!form.waterCurr || !form.electricCurr) ? 0.6 : 1 }}>
            ✅ Lưu & Tạo hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const STATUS_CONF: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Chưa nhập",    color: "#8c8c8c", bg: "#f5f5f5" },
  draft:    { label: "Nháp",         color: "#faad14", bg: "#fffbe6" },
  entered:  { label: "Đã nhập",      color: "#1890ff", bg: "#e6f7ff" },
  invoiced: { label: "Đã lập HĐ",   color: "#52c41a", bg: "#f6ffed" },
};

export default function MeterReadingList() {
  document.title = "Nhập chỉ số tháng – TNPM";

  const [readings, setReadings] = useState(MOCK_METER_READINGS);
  const [filterProject, setFilterProject] = useState("1");
  const [filterPeriod, setFilterPeriod] = useState("2024-04");
  const [filterStatus, setFilterStatus] = useState("");
  const [editReading, setEditReading] = useState<any>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const filtered = useMemo(() =>
    readings.filter((r) =>
      (!filterProject || String(r.projectId) === filterProject) &&
      (!filterPeriod || r.period === filterPeriod) &&
      (!filterStatus || r.status === filterStatus)
    ), [readings, filterProject, filterPeriod, filterStatus]);

  const pending = filtered.filter((r) => r.status === "pending" || r.status === "draft");
  const entered = filtered.filter((r) => r.status === "entered");
  const invoiced = filtered.filter((r) => r.status === "invoiced");

  const handleSave = (data: any) => {
    setReadings((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    setEditReading(null);
  };

  const handleCreateInvoices = () => {
    setReadings((prev) =>
      prev.map((r) =>
        r.status === "entered" &&
        String(r.projectId) === filterProject &&
        r.period === filterPeriod
          ? { ...r, status: "invoiced" }
          : r
      )
    );
    setShowBulkConfirm(false);
  };

  const canCreateInvoices = entered.length > 0;

  // Generate periods (last 6 months)
  const periods = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Nhập chỉ số tháng</h1>
          <p className="page-sub">Nhập điện, nước, phí quản lý, gửi xe → Tự động tính & tạo hóa đơn hàng loạt</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline">📥 Import Excel</button>
          {canCreateInvoices && (
            <button className="btn btn-primary" onClick={() => setShowBulkConfirm(true)}>
              🧾 Tạo hóa đơn hàng loạt ({entered.length} unit)
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <select className="filter-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">Tất cả dự án</option>
          {MOCK_PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="filter-select" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
          <option value="">Tất cả kỳ</option>
          {periods.map((p) => <option key={p} value={p}>Tháng {p}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONF).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <span className="result-count">{filtered.length} unit</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>
            Tiến độ nhập – Tháng {filterPeriod || "…"}
            {filterProject && ` | ${MOCK_PROJECTS.find(p => String(p.id) === filterProject)?.name}`}
          </span>
          <span style={{ color: "#8c8c8c" }}>
            {entered.length + invoiced.length}/{filtered.length} unit đã nhập
          </span>
        </div>
        <div style={{ height: 10, background: "#f0f0f0", borderRadius: 5, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 5,
            width: `${filtered.length ? ((entered.length + invoiced.length) / filtered.length) * 100 : 0}%`,
            background: "linear-gradient(90deg, #1890ff, #52c41a)",
            transition: "width .4s",
          }} />
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 10, fontSize: 12 }}>
          {[
            { label: "Chưa nhập", count: pending.length, color: "#8c8c8c" },
            { label: "Đã nhập", count: entered.length, color: "#1890ff" },
            { label: "Đã lập HĐ", count: invoiced.length, color: "#52c41a" },
          ].map((s) => (
            <span key={s.label} style={{ color: s.color }}>
              ● {s.label}: <b>{s.count}</b>
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Khách hàng</th>
              <th>Kỳ</th>
              <th>Nước cũ→mới (m³)</th>
              <th>Điện cũ→mới (kWh)</th>
              <th style={{ textAlign: "right" }}>Tiền nước</th>
              <th style={{ textAlign: "right" }}>Tiền điện</th>
              <th style={{ textAlign: "right" }}>Phí QL</th>
              <th style={{ textAlign: "right" }}>Gửi xe</th>
              <th style={{ textAlign: "right", fontWeight: 700 }}>Tổng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>
                  Không có dữ liệu cho bộ lọc đã chọn
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              const conf = STATUS_CONF[r.status] || STATUS_CONF.pending;
              const isEntered = r.status === "entered" || r.status === "invoiced";

              return (
                <tr key={r.id} style={{ background: r.status === "pending" ? "#fafafa" : undefined }}>
                  <td>
                    <span className="code-text" style={{ fontSize: 14, fontWeight: 700 }}>{r.unitCode}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.customerName}</td>
                  <td style={{ fontSize: 12, color: "#595959" }}>{r.period}</td>
                  <td style={{ fontSize: 13, fontFamily: "monospace" }}>
                    {r.waterPrev}
                    <span style={{ color: "#8c8c8c", margin: "0 4px" }}>→</span>
                    {isEntered
                      ? <span style={{ fontWeight: 700, color: "#52c41a" }}>{r.waterCurr}</span>
                      : <span style={{ color: "#d9d9d9" }}>—</span>}
                    {isEntered && <span style={{ color: "#8c8c8c", fontSize: 11 }}> ({r.waterUsed}m³)</span>}
                  </td>
                  <td style={{ fontSize: 13, fontFamily: "monospace" }}>
                    {r.electricPrev}
                    <span style={{ color: "#8c8c8c", margin: "0 4px" }}>→</span>
                    {isEntered
                      ? <span style={{ fontWeight: 700, color: "#faad14" }}>{r.electricCurr}</span>
                      : <span style={{ color: "#d9d9d9" }}>—</span>}
                    {isEntered && <span style={{ color: "#8c8c8c", fontSize: 11 }}> ({r.electricUsed}kWh)</span>}
                  </td>
                  <td style={{ textAlign: "right", fontSize: 13 }}>
                    {isEntered ? fmtMoney(r.waterAmount) : "—"}
                  </td>
                  <td style={{ textAlign: "right", fontSize: 13 }}>
                    {isEntered ? fmtMoney(r.electricAmount) : "—"}
                  </td>
                  <td style={{ textAlign: "right", fontSize: 13 }}>
                    {fmtMoney(r.managementFee)}
                  </td>
                  <td style={{ textAlign: "right", fontSize: 13 }}>
                    {r.parkingFee > 0 ? fmtMoney(r.parkingFee) : "—"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: 14, color: isEntered ? "#1890ff" : "#d9d9d9" }}>
                    {isEntered ? fmtMoney(r.totalAmount) : "—"}
                  </td>
                  <td>
                    <span style={{
                      padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: conf.bg, color: conf.color,
                    }}>
                      {conf.label}
                    </span>
                  </td>
                  <td>
                    {r.status !== "invoiced" && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: "5px 14px", fontSize: 12 }}
                        onClick={() => setEditReading(r)}
                      >
                        {r.status === "pending" ? "📋 Nhập" : "✏️ Sửa"}
                      </button>
                    )}
                    {r.status === "invoiced" && (
                      <span style={{ fontSize: 12, color: "#52c41a" }}>✅ Xong</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Footer tổng */}
          {filtered.some((r) => r.status === "entered" || r.status === "invoiced") && (
            <tfoot>
              <tr style={{ background: "#e6f7ff", fontWeight: 700 }}>
                <td colSpan={5} style={{ padding: "12px 14px" }}>
                  TỔNG CỘNG ({filtered.filter(r => r.status !== "pending").length} unit đã nhập)
                </td>
                <td style={{ textAlign: "right", padding: "12px 14px" }}>
                  {fmtMoney(filtered.reduce((a, r) => a + (r.waterAmount || 0), 0))}
                </td>
                <td style={{ textAlign: "right", padding: "12px 14px" }}>
                  {fmtMoney(filtered.reduce((a, r) => a + (r.electricAmount || 0), 0))}
                </td>
                <td style={{ textAlign: "right", padding: "12px 14px" }}>
                  {fmtMoney(filtered.reduce((a, r) => a + (r.managementFee || 0), 0))}
                </td>
                <td style={{ textAlign: "right", padding: "12px 14px" }}>
                  {fmtMoney(filtered.reduce((a, r) => a + (r.parkingFee || 0), 0))}
                </td>
                <td style={{ textAlign: "right", padding: "12px 14px", color: "#1890ff", fontSize: 16 }}>
                  {fmtMoney(filtered.reduce((a, r) => a + (r.totalAmount || 0), 0))}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Input modal */}
      {editReading && (
        <InputMeterModal
          reading={editReading}
          onSave={handleSave}
          onClose={() => setEditReading(null)}
        />
      )}

      {/* Bulk create invoices confirm */}
      {showBulkConfirm && (
        <div className="modal-overlay" onClick={() => setShowBulkConfirm(false)}>
          <div className="confirm-dialog" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3>🧾 Tạo hóa đơn hàng loạt</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>
              Sẽ tạo <b style={{ color: "#1890ff" }}>{entered.length} hóa đơn</b> cho tháng <b>{filterPeriod}</b>
              <br />
              Dự án: <b>{MOCK_PROJECTS.find(p => String(p.id) === filterProject)?.name}</b>
              <br />
              Tổng giá trị:{" "}
              <b style={{ color: "#722ed1" }}>
                {fmtMoney(entered.reduce((a, r) => a + (r.totalAmount || 0), 0))}
              </b>
            </p>
            <p style={{ fontSize: 13, color: "#8c8c8c" }}>
              Hóa đơn sẽ được gửi thông báo đến khách hàng qua SMS / App Timi.
            </p>
            <div className="confirm-dialog__actions">
              <button className="btn btn-outline" onClick={() => setShowBulkConfirm(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleCreateInvoices}>
                ✅ Xác nhận tạo hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
