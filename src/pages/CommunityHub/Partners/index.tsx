// [FitPro] Business Owners — 5 profiles (Office/Entrepreneur/Trainer/Ambassador/Gym-Partner)
// Profile thứ 5 (gym_partner) = chủ gym/yoga đồng ý cấy plugin FitPro INSIDE.
import React, { useState } from "react";
import { MOCK_PARTNERS } from "@/mocks/community-hub/partners";
import { formatCurrency } from "reborn-util";
import { showToast } from "@/utils/common";
import "./index.scss";

type Partner = (typeof MOCK_PARTNERS)[number];
type RoleKey = "office" | "entrepreneur" | "trainer" | "ambassador" | "gym_partner";

const ROLE_META: Record<RoleKey, { label: string; icon: string; color: string }> = {
  office: { label: "Dân VP", icon: "💼", color: "#00C9A7" },
  entrepreneur: { label: "Chủ DN", icon: "🚀", color: "#FF8C42" },
  trainer: { label: "PT/Yoga", icon: "🏋️", color: "#722ed1" },
  ambassador: { label: "Đại sứ lối sống", icon: "💚", color: "#E8473B" },
  gym_partner: { label: "Chủ Gym Partner", icon: "🏋️‍♂️", color: "#2563EB" },
};

export default function PartnersPage() {
  document.title = "Business Owners — FitPro";
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS as Partner[]);
  const [activeTab, setActiveTab] = useState<"all" | RoleKey>("all");
  const [detailPartner, setDetailPartner] = useState<Partner | null>(null);
  const [payPartner, setPayPartner] = useState<Partner | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    role: "office" as RoleKey,
    area: "",
    tier: 1,
    stations_owned: 1,
  });

  const filteredPartners = activeTab === "all"
    ? partners
    : partners.filter((p) => p.role === activeTab);

  const handleAddBO = () => {
    if (!addForm.name.trim()) {
      showToast("Vui lòng nhập tên BO", "error");
      return;
    }
    const newBO = {
      id: `BO-${String(partners.length + 1).padStart(3, "0")}`,
      name: addForm.name,
      role: addForm.role,
      roleLabel: ROLE_META[addForm.role].label,
      area: addForm.area || "Chưa rõ",
      avatar: null,
      tier: addForm.tier,
      stations_owned: addForm.stations_owned,
      stations_downline: 0,
      total_members_served: 0,
      commission_this_month_vnd: 0,
      commission_rate: addForm.tier === 1 ? 0.5 : 0.25,
      referrals: 0,
      joined_date: new Date().toISOString().split("T")[0],
      problem: "",
      solution: "",
    } as Partner;
    setPartners([...partners, newBO]);
    setShowAddForm(false);
    setAddForm({ name: "", role: "office", area: "", tier: 1, stations_owned: 1 });
    showToast(`✓ Đã thêm Business Owner ${newBO.name}`, "info");
  };

  const handlePay = () => {
    if (payPartner) {
      showToast(`Đã thanh toán ${payAmount || formatCurrency(payPartner.commission_this_month_vnd, ".", "")}đ hoa hồng cho ${payPartner.name}`, "info");
      setPayPartner(null);
      setPayAmount("");
      setPayNote("");
    }
  };

  const getMeta = (role: string) => ROLE_META[role as RoleKey] || ROLE_META.office;

  return (
    <div className="ch-partners-page">
      <div className="ch-partners-page__header">
        <div>
          <h2>Business Owners (BO)</h2>
          <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
            Mạng lưới chủ trạm MF7 — 5 profiles: Dân VP, Chủ DN, PT/Yoga, Đại sứ lối sống, Chủ Gym Partner (INSIDE)
          </p>
        </div>
        <div className="tab-switch">
          {(["all", "office", "entrepreneur", "trainer", "ambassador", "gym_partner"] as const).map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "Tất cả" : `${ROLE_META[tab].icon} ${ROLE_META[tab].label}`}
            </button>
          ))}
        </div>
      </div>

      <div className="ch-partners-page__grid">
        {filteredPartners.map((partner) => {
          const meta = getMeta(partner.role);
          return (
            <div key={partner.id} className="partner-card" style={{ borderTop: `3px solid ${meta.color}` }}>
              <div className="partner-card__header">
                <div className="partner-avatar">
                  <div className="avatar-placeholder" style={{ background: meta.color, color: "#fff" }}>
                    {meta.icon}
                  </div>
                </div>
                <div className="partner-info">
                  <h3>{partner.name}</h3>
                  <span className="role-badge" style={{ background: `${meta.color}22`, color: meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="area-label">📍 {partner.area} · Tier {partner.tier}</span>
                </div>
              </div>

              <div className="partner-card__stats">
                <div className="stat-item">
                  <span className="stat-label">🏋️ Trạm sở hữu:</span>
                  <span className="stat-value">{partner.stations_owned}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">🌱 Downline:</span>
                  <span className="stat-value">{partner.stations_downline}/7 trạm</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">👥 Thành viên phục vụ:</span>
                  <span className="stat-value">{partner.total_members_served}</span>
                </div>
                <div className="stat-item highlight">
                  <span className="stat-label">💰 Hoa hồng tháng:</span>
                  <span className="stat-value">{formatCurrency(partner.commission_this_month_vnd, ".", "")}đ</span>
                </div>
              </div>

              <div className="partner-card__footer">
                <button className="btn-detail" onClick={() => setDetailPartner(partner)}>Xem chi tiết</button>
                <button className="btn-pay" onClick={() => { setPayPartner(partner); setPayAmount(String(partner.commission_this_month_vnd)); }}>Thanh toán HH</button>
              </div>
            </div>
          );
        })}

        <div className="partner-card partner-card--add" onClick={() => setShowAddForm(true)} style={{ cursor: "pointer" }}>
          <div className="add-content">
            <span className="add-icon">+</span>
            <span>Thêm Business Owner</span>
          </div>
        </div>
      </div>

      {/* ── Modal Chi tiết Business Owner ── */}
      {detailPartner && (
        <div className="ch-modal-overlay" onClick={() => setDetailPartner(null)}>
          <div className="ch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ch-modal__header">
              <h3>Hồ sơ Business Owner</h3>
              <button className="btn-close" onClick={() => setDetailPartner(null)}>✕</button>
            </div>
            <div className="ch-modal__body">
              <div className="detail-profile">
                <div className="detail-avatar" style={{ background: getMeta(detailPartner.role).color, color: "#fff" }}>
                  {getMeta(detailPartner.role).icon}
                </div>
                <div>
                  <h3>{detailPartner.name}</h3>
                  <span className="role-badge" style={{ background: `${getMeta(detailPartner.role).color}22`, color: getMeta(detailPartner.role).color }}>
                    {getMeta(detailPartner.role).label}
                  </span>
                  <span className="area-label">{detailPartner.area} · Tier {detailPartner.tier} · Tham gia {detailPartner.joined_date}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>💡 Vấn đề & Giải pháp FitPro</h4>
                <div style={{ padding: 12, background: "#FFF7E6", borderRadius: 6, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#8B5A00" }}>❗ <strong>Vấn đề:</strong> {(detailPartner as any).problem}</div>
                </div>
                <div style={{ padding: 12, background: "#E4F7F3", borderRadius: 6 }}>
                  <div style={{ fontSize: 12, color: "#0B2E2A" }}>✅ <strong>Giải pháp:</strong> {(detailPartner as any).solution}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>📊 Hoạt động mạng lưới</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Trạm sở hữu trực tiếp</span>
                    <span className="value">{detailPartner.stations_owned}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Downline (max 7)</span>
                    <span className="value">{detailPartner.stations_downline} trạm</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Thành viên phục vụ</span>
                    <span className="value">{detailPartner.total_members_served}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Tỷ lệ chiết khấu</span>
                    <span className="value">{(detailPartner.commission_rate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Hoa hồng tháng này</span>
                    <span className="value accent">{formatCurrency(detailPartner.commission_this_month_vnd, ".", "")}đ</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Giới thiệu (referrals)</span>
                    <span className="value">{detailPartner.referrals}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>💵 Lịch sử hoa hồng (hãng tự trả)</h4>
                <table className="detail-table">
                  <thead>
                    <tr><th>Tháng</th><th>Số tiền</th><th>Trạng thái</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>04/2026</td><td>{formatCurrency(detailPartner.commission_this_month_vnd, ".", "")}đ</td><td><span className="status pending">Hãng xử lý</span></td></tr>
                    <tr><td>03/2026</td><td>{formatCurrency(Math.round(detailPartner.commission_this_month_vnd * 0.9), ".", "")}đ</td><td><span className="status paid">Đã nhận</span></td></tr>
                    <tr><td>02/2026</td><td>{formatCurrency(Math.round(detailPartner.commission_this_month_vnd * 0.7), ".", "")}đ</td><td><span className="status paid">Đã nhận</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Thanh toán hoa hồng ── */}
      {payPartner && (
        <div className="ch-modal-overlay" onClick={() => setPayPartner(null)}>
          <div className="ch-modal ch-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="ch-modal__header">
              <h3>Thanh toán hoa hồng BO</h3>
              <button className="btn-close" onClick={() => setPayPartner(null)}>✕</button>
            </div>
            <div className="ch-modal__body">
              <div className="pay-partner-info">
                <div className="detail-avatar sm" style={{ background: getMeta(payPartner.role).color, color: "#fff" }}>
                  {getMeta(payPartner.role).icon}
                </div>
                <div>
                  <strong>{payPartner.name}</strong>
                  <span className="role-badge" style={{ background: `${getMeta(payPartner.role).color}22`, color: getMeta(payPartner.role).color }}>
                    {getMeta(payPartner.role).label}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Số tiền thanh toán (VNĐ)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                />
                <p className="form-hint">Hoa hồng tháng này: <strong>{formatCurrency(payPartner.commission_this_month_vnd, ".", "")}đ</strong></p>
              </div>

              <div className="form-group">
                <label>Phương thức</label>
                <div className="pay-methods">
                  <label className="pay-method active"><input type="radio" name="method" defaultChecked /> Chuyển khoản</label>
                  <label className="pay-method"><input type="radio" name="method" /> Tiền mặt</label>
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  rows={2}
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Ghi chú thanh toán (nếu có)..."
                />
              </div>
            </div>
            <div className="ch-modal__footer">
              <button className="btn-cancel" onClick={() => setPayPartner(null)}>Hủy</button>
              <button className="btn-confirm" onClick={handlePay} disabled={!payAmount || Number(payAmount) <= 0}>
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Thêm Business Owner ── */}
      {showAddForm && (
        <div className="ch-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="ch-modal ch-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="ch-modal__header">
              <h3>Thêm Business Owner mới</h3>
              <button className="btn-close" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <div className="ch-modal__body">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Nguyễn Văn A..."
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Profile BO *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(Object.keys(ROLE_META) as RoleKey[]).map((k) => {
                    const m = ROLE_META[k];
                    const active = addForm.role === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setAddForm({ ...addForm, role: k })}
                        style={{
                          padding: "10px 12px",
                          border: active ? `2px solid ${m.color}` : "1px solid #d9e0de",
                          background: active ? `${m.color}22` : "#fff",
                          color: active ? m.color : "#6B8A85",
                          borderRadius: 8,
                          fontWeight: active ? 700 : 500,
                          fontSize: 12,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        {m.icon} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label>Khu vực hoạt động</label>
                <input
                  type="text"
                  value={addForm.area}
                  onChange={(e) => setAddForm({ ...addForm, area: e.target.value })}
                  placeholder="VD: Hà Nội, Cầu Giấy..."
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Tier</label>
                  <select
                    value={addForm.tier}
                    onChange={(e) => setAddForm({ ...addForm, tier: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d9e0de" }}
                  >
                    <option value={1}>Tier 1 (trực tiếp Master)</option>
                    <option value={2}>Tier 2 (vệ tinh)</option>
                    <option value={3}>Tier 3 (bùng nổ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Số trạm sở hữu</label>
                  <input
                    type="number"
                    min={0}
                    max={7}
                    value={addForm.stations_owned}
                    onChange={(e) => setAddForm({ ...addForm, stations_owned: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="ch-modal__footer">
              <button className="btn-cancel" onClick={() => setShowAddForm(false)}>Hủy</button>
              <button className="btn-confirm" onClick={handleAddBO} disabled={!addForm.name.trim()}>
                + Thêm BO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
