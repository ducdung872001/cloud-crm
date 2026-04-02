import React, { useState, useEffect } from "react";
import { useApp } from "contexts/AppContext";
import { apiGet, apiPost, apiDelete } from "configs/apiClient";

// ─── Types ────────────────────────────────────────────────────────────
interface ITipGroup {
  id: number; name: string; product: string; ruleType: "percent" | "fixed" | "tiered";
  ruleValue: number; minDealValue: number; memberCount: number; status: "active" | "inactive";
  totalPaidThisMonth: number;
}
interface ITipUser {
  id: number; employeeId: number; employeeName: string; employeeCode: string; deptName: string;
  product: string; ruleType: "percent" | "fixed"; ruleValue: number; maxPerMonth: number; status: "active" | "inactive";
}
interface ICommissionRecord {
  id: number; employeeName: string; deptName: string; dealId: string;
  customerName: string; product: string; dealValue: number; commissionRate: number;
  commissionAmount: number; paidAt: string; status: "paid" | "pending" | "cancelled";
}
interface ILeaderboard {
  rank: number; name: string; code: string; dept: string;
  deals: number; revenue: number; commission: number; badge?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────
const MOCK_TIP_GROUPS: ITipGroup[] = [
  { id: 1, name: "Nhóm Vay Mua Nhà",    product: "Vay TS",   ruleType: "tiered",  ruleValue: 0.5, minDealValue: 500_000_000,  memberCount: 12, status: "active",   totalPaidThisMonth: 48_500_000 },
  { id: 2, name: "Nhóm Thẻ Tín Dụng",  product: "Thẻ TD",  ruleType: "fixed",   ruleValue: 500_000, minDealValue: 0, memberCount: 8, status: "active",   totalPaidThisMonth: 12_000_000 },
  { id: 3, name: "Nhóm Bancassurance", product: "Banca",   ruleType: "percent", ruleValue: 1.2, minDealValue: 100_000_000, memberCount: 6,  status: "active",   totalPaidThisMonth: 22_800_000 },
  { id: 4, name: "Nhóm Vay Doanh Nghiệp", product: "Vay DN", ruleType: "tiered", ruleValue: 0.3, minDealValue: 1_000_000_000, memberCount: 10, status: "active", totalPaidThisMonth: 63_200_000 },
  { id: 5, name: "Nhóm Tiết Kiệm",     product: "TK",      ruleType: "percent", ruleValue: 0.05,minDealValue: 100_000_000, memberCount: 5,  status: "inactive", totalPaidThisMonth: 0 },
];

const MOCK_TIP_USERS: ITipUser[] = [
  { id: 1, employeeId: 1, employeeName: "Nguyễn Hà Thu",   employeeCode: "NV001", deptName: "SME Banking",   product: "Vay DN", ruleType: "percent", ruleValue: 0.4,  maxPerMonth: 30_000_000, status: "active" },
  { id: 2, employeeId: 2, employeeName: "Trần Nguyên",     employeeCode: "NV002", deptName: "KD Cá nhân",   product: "Vay TS", ruleType: "percent", ruleValue: 0.5,  maxPerMonth: 25_000_000, status: "active" },
  { id: 3, employeeId: 3, employeeName: "Vũ Ngọc Anh",    employeeCode: "NV003", deptName: "KD Cá nhân",   product: "Banca",  ruleType: "percent", ruleValue: 1.0,  maxPerMonth: 20_000_000, status: "active" },
  { id: 4, employeeId: 4, employeeName: "Lê Minh Quân",   employeeCode: "NV004", deptName: "KD Cá nhân",   product: "Vay TS", ruleType: "tiered",  ruleValue: 0.6,  maxPerMonth: 50_000_000, status: "active" },
  { id: 5, employeeId: 5, employeeName: "Phạm Bảo Châu",  employeeCode: "NV005", deptName: "Thẩm định",    product: "Vay DN", ruleType: "fixed",   ruleValue: 800_000, maxPerMonth: 15_000_000, status: "active" },
];

const MOCK_HISTORY: ICommissionRecord[] = [
  { id: 1,  employeeName: "Lê Minh Quân",   deptName: "KD Cá nhân", dealId: "OP-0088", customerName: "TNHH Đức Thành",   product: "Vay DN",  dealValue: 12_500_000_000, commissionRate: 0.6,  commissionAmount: 12_400_000, paidAt: "20/03/2025", status: "paid" },
  { id: 2,  employeeName: "Nguyễn Hà Thu",  deptName: "SME Banking", dealId: "OP-0085", customerName: "Cty CP Minh Phát", product: "Vay DN",  dealValue: 8_200_000_000,  commissionRate: 0.4,  commissionAmount: 9_840_000,  paidAt: "19/03/2025", status: "paid" },
  { id: 3,  employeeName: "Trần Nguyên",    deptName: "KD Cá nhân", dealId: "OP-0090", customerName: "Nguyễn Văn B",     product: "Vay TS",  dealValue: 2_400_000_000,  commissionRate: 0.5,  commissionAmount: 3_600_000,  paidAt: "18/03/2025", status: "paid" },
  { id: 4,  employeeName: "Vũ Ngọc Anh",   deptName: "KD Cá nhân", dealId: "OP-0081", customerName: "Lê Thị Cúc",      product: "Banca",   dealValue: 450_000_000,    commissionRate: 1.0,  commissionAmount: 4_500_000,  paidAt: "17/03/2025", status: "paid" },
  { id: 5,  employeeName: "Đỗ Thị Mai",    deptName: "KD HN Q1",   dealId: "OP-0092", customerName: "Phạm Hồng Khanh",  product: "Thẻ TD",  dealValue: 0,              commissionRate: 0,    commissionAmount: 500_000,    paidAt: "16/03/2025", status: "paid" },
  { id: 6,  employeeName: "Lê Minh Quân",  deptName: "KD Cá nhân", dealId: "OP-0095", customerName: "ABC Corporation",   product: "Vay DN",  dealValue: 18_000_000_000, commissionRate: 0.6,  commissionAmount: 16_200_000, paidAt: "",          status: "pending" },
  { id: 7,  employeeName: "Trần Nguyên",   deptName: "KD Cá nhân", dealId: "OP-0094", customerName: "Nguyễn Thị Dung",  product: "Vay TS",  dealValue: 3_100_000_000,  commissionRate: 0.5,  commissionAmount: 4_650_000,  paidAt: "",          status: "pending" },
];

const MOCK_LEADERBOARD: ILeaderboard[] = [
  { rank: 1, name: "Lê Minh Quân",   code: "NV004", dept: "KD Cá nhân", deals: 14, revenue: 62_400_000_000, commission: 28_600_000, badge: "🥇" },
  { rank: 2, name: "Nguyễn Hà Thu",  code: "NV001", dept: "SME Banking", deals: 11, revenue: 48_200_000_000, commission: 22_400_000, badge: "🥈" },
  { rank: 3, name: "Trần Nguyên",    code: "NV002", dept: "KD Cá nhân", deals: 12, revenue: 38_500_000_000, commission: 18_200_000, badge: "🥉" },
  { rank: 4, name: "Vũ Ngọc Anh",   code: "NV003", dept: "KD Cá nhân", deals: 9,  revenue: 24_300_000_000, commission: 14_100_000 },
  { rank: 5, name: "Đỗ Thị Mai",    code: "NV006", dept: "KD HN Q1",   deals: 8,  revenue: 19_800_000_000, commission: 11_500_000 },
  { rank: 6, name: "Phạm Bảo Châu", code: "NV005", dept: "Thẩm định",  deals: 7,  revenue: 14_200_000_000, commission:  8_400_000 },
];

// ─── Helpers ──────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1e9 ? `${(n / 1e9).toFixed(1)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr` : n.toLocaleString("vi-VN");
const fmtVND = (n: number) => n.toLocaleString("vi-VN") + " đ";
function FormGroup({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`form-group${full ? " form-group--full" : ""}`}><label className="form-label">{label}</label>{children}</div>;
}

// ─── Dashboard / Tổng quan ────────────────────────────────────────────
function IncentiveDashboard() {
  const totalMonth = MOCK_HISTORY.filter(h => h.status === "paid").reduce((s, h) => s + h.commissionAmount, 0);
  const pending    = MOCK_HISTORY.filter(h => h.status === "pending").reduce((s, h) => s + h.commissionAmount, 0);
  const topGroup   = MOCK_TIP_GROUPS.reduce((a, b) => a.totalPaidThisMonth > b.totalPaidThisMonth ? a : b);

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Tổng quan Hoa hồng</div><div className="page-subtitle">Tháng 3/2025 · Toàn hệ thống</div></div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => {}}>Export báo cáo</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "Tổng HH đã chi T3",    value: fmt(totalMonth),   sub: "35 giao dịch thanh toán", color: "var(--success)",      icon: "💰" },
          { label: "HH đang chờ thanh toán", value: fmt(pending),    sub: "7 deal chờ xác nhận",    color: "var(--warning)",      icon: "⏳" },
          { label: "Nhóm chi nhiều nhất",    value: topGroup.name.replace("Nhóm ", ""), sub: fmt(topGroup.totalPaidThisMonth), color: "var(--accent-bright)", icon: "🏆" },
          { label: "NV nhận HH nhiều nhất", value: "Lê Minh Quân",  sub: fmt(28_600_000),          color: "var(--gold)",          icon: "⭐" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div><div className="kpi-card__label">{k.label}</div><div className="kpi-card__value" style={{ color: k.color }}>{k.value}</div><div className="kpi-card__sub">{k.sub}</div></div>
              <div style={{ fontSize: 28 }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Leaderboard */}
        <div className="card">
          <div className="card__header"><span className="card__title">🏆 Bảng xếp hạng Hoa hồng – T3/2025</span></div>
          <div className="card__body" style={{ padding: 0 }}>
            {MOCK_LEADERBOARD.map((l, i) => (
              <div key={l.rank} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)", background: i === 0 ? "rgba(245,166,35,0.05)" : "transparent" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 18 : 12, fontWeight: 700, flexShrink: 0, color: i === 0 ? "var(--gold)" : i === 1 ? "var(--text-secondary)" : i === 2 ? "#CD7F32" : "var(--text-muted)" }}>
                  {l.badge || l.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{l.dept} · {l.deals} deals</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--success)" }}>{fmt(l.commission)}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>DS: {fmt(l.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By product chart */}
        <div className="card">
          <div className="card__header"><span className="card__title">Hoa hồng theo nhóm sản phẩm</span></div>
          <div className="card__body">
            {MOCK_TIP_GROUPS.filter(g => g.status === "active").map(g => {
              const total = MOCK_TIP_GROUPS.filter(x => x.status === "active").reduce((s, x) => s + x.totalPaidThisMonth, 0);
              const pct   = total ? Math.round(g.totalPaidThisMonth / total * 100) : 0;
              const colors: Record<string, string> = { "Vay TS": "var(--accent-bright)", "Vay DN": "var(--success)", "Thẻ TD": "var(--gold)", Banca: "var(--purple)", TK: "var(--text-secondary)" };
              return (
                <div key={g.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>{g.name}</span>
                    <span style={{ color: colors[g.product] || "var(--text-secondary)", fontWeight: 600 }}>{fmt(g.totalPaidThisMonth)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${pct}%`, background: colors[g.product] || "var(--accent)" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{pct}% · {g.memberCount} NV</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Group Incentives (Hoa hồng nhóm) ────────────────────────────────
function GroupIncentive() {
  const { showToast } = useApp();
  const [groups, setGroups] = useState<ITipGroup[]>(MOCK_TIP_GROUPS);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({ name: "", product: "Vay TS", ruleType: "percent", ruleValue: "0.5", minDealValue: "500", maxPerMonth: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const ruleLabel = (g: ITipGroup) => {
    if (g.ruleType === "percent") return `${g.ruleValue}% giá trị deal`;
    if (g.ruleType === "fixed")   return `${fmtVND(g.ruleValue)} / hợp đồng`;
    return `Bậc thang từ ${g.ruleValue}%`;
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Tên nhóm là bắt buộc", "warning"); return; }
    setSaving(true);
    try {
      await apiPost("/adminapi/tipGroup/update", {
        name: form.name, product: form.product, ruleType: form.ruleType,
        ruleValue: parseFloat(form.ruleValue), minDealValue: parseFloat(form.minDealValue) * 1_000_000,
      });
      setGroups(p => [...p, { id: p.length + 1, name: form.name, product: form.product, ruleType: form.ruleType as any, ruleValue: parseFloat(form.ruleValue), minDealValue: parseFloat(form.minDealValue) * 1_000_000, memberCount: 0, status: "active", totalPaidThisMonth: 0 }]);
      setShowAdd(false); showToast("Đã tạo nhóm hoa hồng!", "success");
    } catch { showToast("Lỗi API, lưu cục bộ", "warning"); setGroups(p => [...p, { id: p.length + 1, name: form.name, product: form.product, ruleType: form.ruleType as any, ruleValue: parseFloat(form.ruleValue), minDealValue: parseFloat(form.minDealValue) * 1_000_000, memberCount: 0, status: "active", totalPaidThisMonth: 0 }]); setShowAdd(false); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (id: number) => {
    setGroups(p => p.map(g => g.id === id ? { ...g, status: g.status === "active" ? "inactive" : "active" } : g));
    try { await apiPost("/adminapi/tipGroup/update", { id }); } catch {}
    showToast("Đã cập nhật trạng thái nhóm", "info");
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Hoa hồng theo Nhóm</div><div className="page-subtitle">Cấu hình luật tính hoa hồng chung theo nhóm sản phẩm</div></div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo nhóm mới
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid var(--success)" }}>
          <div className="card__header"><span className="card__title">Tạo nhóm hoa hồng mới</span></div>
          <div className="card__body">
            <div className="form-grid">
              <FormGroup label="Tên nhóm *" full><input className="form-input" placeholder="VD: Nhóm Vay Mua Xe" value={form.name} onChange={e => set("name", e.target.value)} /></FormGroup>
              <FormGroup label="Sản phẩm"><select className="form-select" value={form.product} onChange={e => set("product", e.target.value)}>
                {["Vay TS","Vay DN","Thẻ TD","Banca","TK"].map(p => <option key={p}>{p}</option>)}
              </select></FormGroup>
              <FormGroup label="Loại luật tính HH"><select className="form-select" value={form.ruleType} onChange={e => set("ruleType", e.target.value)}>
                <option value="percent">% giá trị hợp đồng</option>
                <option value="fixed">Cố định / hợp đồng</option>
                <option value="tiered">Bậc thang (tiered)</option>
              </select></FormGroup>
              <FormGroup label={form.ruleType === "fixed" ? "Giá trị cố định (VNĐ)" : "Tỷ lệ (%)"}><input className="form-input" type="number" step="0.1" value={form.ruleValue} onChange={e => set("ruleValue", e.target.value)} /></FormGroup>
              <FormGroup label="Giá trị deal tối thiểu (triệu VNĐ)"><input className="form-input" type="number" placeholder="500" value={form.minDealValue} onChange={e => set("minDealValue", e.target.value)} /></FormGroup>
            </div>

            {/* Tiered rule builder */}
            {form.ruleType === "tiered" && (
              <div style={{ marginTop: 12, padding: 14, background: "var(--surface)", borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--text-secondary)" }}>Cấu hình bậc thang</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["0 – 1 tỷ","0.3%"],["1 – 5 tỷ","0.5%"],["5 – 20 tỷ","0.7%"],["&gt; 20 tỷ","1.0%"]].map(([range, rate]) => (
                    <div key={range} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: range }} />
                      <div style={{ width: 2, height: 14, background: "var(--border)" }} />
                      <input className="form-input" defaultValue={rate} style={{ width: 80, fontSize: 12 }} />
                    </div>
                  ))}
                  <button className="btn btn--ghost btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => {}}>+ Thêm bậc</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn btn--ghost" onClick={() => setShowAdd(false)}>Hủy</button>
              <button className="btn btn--primary" disabled={saving} onClick={handleSave}>{saving ? "Đang lưu…" : "Tạo nhóm"}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map(g => (
          <div key={g.id} className="card" style={{ opacity: g.status === "inactive" ? 0.6 : 1 }}>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--success-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>💰</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</div>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--accent-soft)", color: "var(--accent-bright)", fontWeight: 600 }}>{g.product}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: g.status === "active" ? "var(--success-soft)" : "var(--surface)", color: g.status === "active" ? "var(--success)" : "var(--text-muted)", fontWeight: 600 }}>{g.status === "active" ? "● Đang áp dụng" : "○ Tạm dừng"}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                    Luật: <strong>{ruleLabel(g)}</strong> · Giá trị tối thiểu: {fmt(g.minDealValue)} · {g.memberCount} thành viên
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                    <div><div style={{ color: "var(--text-muted)", fontSize: 10 }}>Chi tháng này</div><div style={{ fontWeight: 700, color: "var(--success)", fontSize: 14 }}>{fmt(g.totalPaidThisMonth)}</div></div>
                    <div><div style={{ color: "var(--text-muted)", fontSize: 10 }}>Thành viên</div><div style={{ fontWeight: 600 }}>{g.memberCount} NV</div></div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="btn-icon-sm" onClick={() => showToast("Quản lý thành viên nhóm", "info")}>Thành viên</button>
                  <button className="btn-icon-sm" onClick={() => showToast("Chỉnh sửa luật HH", "info")}>Sửa luật</button>
                  <button className="btn-icon-sm" onClick={() => toggleStatus(g.id)}>{g.status === "active" ? "Tạm dừng" : "Kích hoạt"}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Individual Incentives ────────────────────────────────────────────
function IndividualIncentive() {
  const { showToast } = useApp();
  const [configs, setConfigs] = useState<ITipUser[]>(MOCK_TIP_USERS);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({ employeeName: "", employeeCode: "", product: "Vay TS", ruleType: "percent", ruleValue: "0.5", maxPerMonth: "20" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.employeeName.trim()) { showToast("Chọn nhân viên", "warning"); return; }
    setSaving(true);
    try {
      await apiPost("/adminapi/tipUser/update", { employeeCode: form.employeeCode, product: form.product, ruleType: form.ruleType, ruleValue: parseFloat(form.ruleValue), maxPerMonth: parseFloat(form.maxPerMonth) * 1_000_000 });
      setConfigs(p => [...p, { id: p.length + 1, employeeId: p.length + 10, employeeName: form.employeeName, employeeCode: form.employeeCode, deptName: "—", product: form.product, ruleType: form.ruleType as any, ruleValue: parseFloat(form.ruleValue), maxPerMonth: parseFloat(form.maxPerMonth) * 1_000_000, status: "active" }]);
      setShowAdd(false); showToast("Đã thiết lập HH cá nhân!", "success");
    } catch { showToast("Lỗi, lưu cục bộ", "warning"); setShowAdd(false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa cấu hình HH này?")) return;
    try { await apiDelete(`/adminapi/tipUser/delete?id=${id}`); } catch {}
    setConfigs(p => p.filter(c => c.id !== id));
    showToast("Đã xóa", "success");
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Hoa hồng Cá nhân</div><div className="page-subtitle">Cấu hình HH riêng từng nhân viên, ghi đè luật nhóm nếu có</div></div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm cấu hình
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid var(--gold)" }}>
          <div className="card__header"><span className="card__title">Cấu hình HH cá nhân</span></div>
          <div className="card__body">
            <div className="form-grid">
              <FormGroup label="Nhân viên *"><input className="form-input" placeholder="Tên hoặc mã NV…" value={form.employeeName} onChange={e => set("employeeName", e.target.value)} /></FormGroup>
              <FormGroup label="Mã NV"><input className="form-input" placeholder="NV001" value={form.employeeCode} onChange={e => set("employeeCode", e.target.value)} /></FormGroup>
              <FormGroup label="Sản phẩm áp dụng"><select className="form-select" value={form.product} onChange={e => set("product", e.target.value)}>
                {["Vay TS","Vay DN","Thẻ TD","Banca","TK","Tất cả"].map(p => <option key={p}>{p}</option>)}
              </select></FormGroup>
              <FormGroup label="Loại luật"><select className="form-select" value={form.ruleType} onChange={e => set("ruleType", e.target.value)}>
                <option value="percent">% giá trị deal</option><option value="fixed">Cố định / deal</option><option value="tiered">Bậc thang</option>
              </select></FormGroup>
              <FormGroup label="Tỷ lệ / Giá trị"><input className="form-input" type="number" step="0.1" value={form.ruleValue} onChange={e => set("ruleValue", e.target.value)} /></FormGroup>
              <FormGroup label="HH tối đa / tháng (triệu)"><input className="form-input" type="number" value={form.maxPerMonth} onChange={e => set("maxPerMonth", e.target.value)} /></FormGroup>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn btn--ghost" onClick={() => setShowAdd(false)}>Hủy</button>
              <button className="btn btn--primary" disabled={saving} onClick={handleSave}>{saving ? "Đang lưu…" : "Lưu cấu hình"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead><tr><th>Nhân viên</th><th>Sản phẩm</th><th>Luật tính HH</th><th>HH tối đa/tháng</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {configs.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="td-name">{c.employeeName}</div>
                    <div className="td-sub">{c.employeeCode} · {c.deptName}</div>
                  </td>
                  <td><span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent-bright)", fontWeight: 600 }}>{c.product}</span></td>
                  <td style={{ fontSize: 12 }}>
                    {c.ruleType === "percent" ? `${c.ruleValue}% giá trị deal` : c.ruleType === "fixed" ? fmtVND(c.ruleValue) + " / HĐ" : `Bậc thang từ ${c.ruleValue}%`}
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)" }}>{fmt(c.maxPerMonth)}</td>
                  <td><span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: c.status === "active" ? "var(--success-soft)" : "var(--surface)", color: c.status === "active" ? "var(--success)" : "var(--text-muted)", fontWeight: 600 }}>{c.status === "active" ? "● Áp dụng" : "○ Tắt"}</span></td>
                  <td><div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-icon-sm" onClick={() => showToast("Chỉnh sửa cấu hình HH", "info")}>Sửa</button>
                    <button className="btn-icon-sm" onClick={() => handleDelete(c.id)}>Xóa</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Payment History ──────────────────────────────────────────────────
function PaymentHistory() {
  const { showToast } = useApp();
  const [records, setRecords] = useState<ICommissionRecord[]>(MOCK_HISTORY);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = records.filter(r => {
    const ms = filterStatus === "all" || r.status === filterStatus;
    const mq = !search || r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.customerName.toLowerCase().includes(search.toLowerCase()) || r.dealId.includes(search);
    return ms && mq;
  });

  const totalFiltered = filtered.filter(r => r.status === "paid").reduce((s, r) => s + r.commissionAmount, 0);

  const handleMarkPaid = async (id: number) => {
    setRecords(p => p.map(r => r.id === id ? { ...r, status: "paid" as const, paidAt: new Date().toLocaleDateString("vi-VN") } : r));
    try { await apiPost("/adminapi/tipUser/update", { id, status: "paid" }); } catch {}
    showToast("Đã xác nhận thanh toán hoa hồng", "success");
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Lịch sử chi trả Hoa hồng</div><div className="page-subtitle">Ghi nhận tự động khi deal chốt thành công</div></div>
        <div className="page-header__actions">
          <button className="btn btn--ghost" onClick={() => showToast("Export lịch sử HH", "success")}>Export Excel</button>
          <button className="btn btn--primary" onClick={() => showToast("Thanh toán hàng loạt các deal pending", "info")}>Thanh toán tất cả chờ</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[["Đã thanh toán", records.filter(r => r.status === "paid").length, "var(--success)"], ["Đang chờ", records.filter(r => r.status === "pending").length, "var(--warning)"]].map(([l, v, c]) => (
          <div key={l as string} className="card" style={{ flex: "none", padding: "12px 20px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: c as string }}>{v}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{l}</div>
          </div>
        ))}
        <div className="card" style={{ flex: "none", padding: "12px 20px", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--success)" }}>{fmt(totalFiltered)}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Tổng HH đã chi</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px" }}>
          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "var(--text-muted)", fill: "none", strokeWidth: 2, flexShrink: 0, strokeLinecap: "round" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 13, flex: 1 }} placeholder="Tìm NV, KH, deal ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả</option><option value="paid">Đã thanh toán</option><option value="pending">Chờ thanh toán</option>
        </select>
      </div>

      <div className="card">
        <div className="card__body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead><tr><th>Nhân viên</th><th>Deal</th><th>Khách hàng</th><th>Sản phẩm</th><th>Giá trị deal</th><th>Tỷ lệ</th><th>Hoa hồng</th><th>Trạng thái</th><th>Ngày</th><th></th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><div className="td-name">{r.employeeName}</div><div className="td-sub">{r.deptName}</div></td>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-bright)" }}>{r.dealId}</td>
                  <td style={{ fontSize: 12 }}>{r.customerName}</td>
                  <td><span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent-bright)", fontWeight: 600 }}>{r.product}</span></td>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{r.dealValue > 0 ? fmt(r.dealValue) : "—"}</td>
                  <td style={{ fontSize: 12 }}>{r.commissionRate > 0 ? `${r.commissionRate}%` : "Cố định"}</td>
                  <td style={{ fontSize: 13, fontWeight: 700, color: "var(--success)" }}>{fmtVND(r.commissionAmount)}</td>
                  <td>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: r.status === "paid" ? "var(--success-soft)" : r.status === "pending" ? "var(--warning-soft)" : "var(--danger-soft)", color: r.status === "paid" ? "var(--success)" : r.status === "pending" ? "var(--warning)" : "var(--danger)" }}>
                      {r.status === "paid" ? "✓ Đã trả" : r.status === "pending" ? "⏳ Chờ" : "✗ Hủy"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.paidAt || "—"}</td>
                  <td>
                    {r.status === "pending" && (
                      <button className="btn-icon-sm" style={{ color: "var(--success)" }} onClick={() => handleMarkPaid(r.id)}>Thanh toán</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Commission Rule Config ────────────────────────────────────────────
function CommissionRuleConfig() {
  const { showToast } = useApp();
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Cấu hình luật tính Hoa hồng</div><div className="page-subtitle">Thiết lập công thức và ngưỡng kích hoạt HH theo từng sản phẩm</div></div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => showToast("Đã lưu cấu hình luật HH", "success")}>Lưu thay đổi</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {["Vay tài sản (Cá nhân)", "Vay Doanh nghiệp (SME)", "Thẻ tín dụng", "Bancassurance", "Tiết kiệm / Tiền gửi"].map((product, idx) => {
          const rates = [["0.3%","0.5%","0.7%","1.0%"],["0.2%","0.4%","0.6%","0.8%"],["—","500k/HĐ","700k/HĐ","—"],["0.8%","1.2%","1.5%","2.0%"],["0.03%","0.05%","0.07%","0.1%"]][idx];
          return (
            <div key={product} className="card">
              <div style={{ padding: "14px 18px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{product}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {["≤ 1 tỷ", "1 – 5 tỷ", "5 – 20 tỷ", "> 20 tỷ"].map((tier, i) => (
                    <div key={tier} style={{ background: "var(--surface)", borderRadius: 8, padding: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>{tier}</div>
                      <input className="form-input" defaultValue={rates[i]} style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "var(--success)", padding: "6px", background: "none", border: "1px solid var(--border)" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Điều kiện áp dụng</label>
                    <select className="form-select"><option>Deal chốt thành công (status = Won)</option><option>Sau ký hợp đồng</option><option>Sau giải ngân</option></select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Thời điểm chi trả</label>
                    <select className="form-select"><option>Ngay khi chốt</option><option>Cuối tháng</option><option>Sau 30 ngày</option></select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">HH tối đa / tháng (NV)</label>
                    <input className="form-input" defaultValue={["50 triệu","80 triệu","5 triệu","30 triệu","10 triệu"][idx]} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN Incentive component ─────────────────────────────────────────
type IncentivePage = "dashboard" | "group" | "individual" | "history" | "config";

const INCENTIVE_TABS: { key: IncentivePage; label: string; icon: string }[] = [
  { key: "dashboard",  label: "Tổng quan",            icon: "📊" },
  { key: "group",      label: "HH theo nhóm",         icon: "👥" },
  { key: "individual", label: "HH cá nhân",           icon: "⭐" },
  { key: "history",    label: "Lịch sử chi trả",      icon: "📋" },
  { key: "config",     label: "Cấu hình luật HH",     icon: "⚙️" },
];

export function Incentive() {
  const [page, setPage] = useState<IncentivePage>("dashboard");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, background: "var(--navy-mid)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "10px 16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          <div style={{ width: 32, height: 32, background: "rgba(245,166,35,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: "var(--gold)", fill: "none", strokeWidth: 2, strokeLinecap: "round" }}>
              <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Hoa hồng Incentive</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Quản lý & Cấu hình hoa hồng nhân viên</div>
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: "var(--border)", flex: "none" }} />
        <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
          {INCENTIVE_TABS.map(t => (
            <button key={t.key} onClick={() => setPage(t.key)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 7,
              border: "none", fontFamily: "var(--font)", fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: page === t.key ? "rgba(245,166,35,0.15)" : "transparent",
              color: page === t.key ? "var(--gold)" : "var(--text-secondary)",
              transition: "all .15s",
            }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {page === "dashboard"  && <IncentiveDashboard />}
      {page === "group"      && <GroupIncentive />}
      {page === "individual" && <IndividualIncentive />}
      {page === "history"    && <PaymentHistory />}
      {page === "config"     && <CommissionRuleConfig />}
    </div>
  );
}
