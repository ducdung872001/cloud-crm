import React, { useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
import Badge from "components/badge/badge";
import "./CampaignManagementPage.scss";

interface Audience {
  id: number;
  name: string;
  count: number;
  conditions: string[];
  lastUpdated: string;
}

const MOCK_AUDIENCES: Audience[] = [
  { id: 1, name: "Khách hàng VIP – Mua thường xuyên", count: 875,  conditions: ["Hạng Vàng/Kim Cương", "Tần suất mua ≤ 14 ngày"], lastUpdated: "18/03/2026" },
  { id: 2, name: "Sinh nhật tháng 3",                  count: 234,  conditions: ["Tháng sinh nhật = 3"], lastUpdated: "01/03/2026" },
  { id: 3, name: "Nguy cơ rời bỏ",                    count: 175,  conditions: ["Ngày không mua ≥ 60", "Đã mua ≥ 2 lần"], lastUpdated: "24/03/2026" },
  { id: 4, name: "Hội viên mới 30 ngày",              count: 612,  conditions: ["Ngày đăng ký ≤ 30 ngày trước"], lastUpdated: "24/03/2026" },
  { id: 5, name: "Chi tiêu cao – Chưa mua lại",       count: 143,  conditions: ["Tổng chi tiêu > 5M", "Ngày không mua ≥ 45"], lastUpdated: "20/03/2026" },
];

export default function AudienceManagementPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Đối tượng chiến dịch";

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch]         = useState("");
  const [form, setForm]             = useState({ name: "", description: "" });
  const [conditions, setConditions] = useState([{ field: "", operator: "", value: "" }]);

  const filtered = MOCK_AUDIENCES.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const titleActions: ITitleActions = {
    actions: [{ title: "+ Tạo đối tượng", color: "primary", callback: () => setShowCreate(true) }],
  };

  const addCondition = () => setConditions(prev => [...prev, { field: "", operator: "", value: "" }]);
  const removeCondition = (idx: number) => setConditions(prev => prev.filter((_, i) => i !== idx));
  const updateCondition = (idx: number, key: string, val: string) =>
    setConditions(prev => prev.map((c, i) => i === idx ? { ...c, [key]: val } : c));

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Đối tượng chiến dịch"
        titleBack="Chiến dịch Marketing"
        titleActions={showCreate ? undefined : titleActions}
        onBackProps={onBackProps}
      />

      {/* Context note */}
      <div className="cm-context-note">
        <strong>Đây là danh sách đối tượng để gửi chiến dịch.</strong>
        {" "}Để xem phân tích hiệu quả từng phân khúc, vào{" "}
        <em>Phân tích khách hàng → Phân khúc khách hàng</em>.
      </div>

      {/* Stats */}
      <div className="promo-stats-grid">
        {[
          { label: "Tổng đối tượng",       value: String(MOCK_AUDIENCES.length), color: "purple" },
          { label: "Tổng khách hàng cover", value: "2.039",                       color: "blue"   },
          { label: "Chiến dịch tháng này", value: "7",                            color: "green"  },
          { label: "Đối tượng mới tháng",  value: "2",                            color: "orange" },
        ].map(s => (
          <div key={s.label} className={`promo-stat-card promo-stat-card--${s.color}`}>
            <div className="promo-stat-card__body">
              <div className="promo-stat-card__content">
                <p className="promo-stat-card__label">{s.label}</p>
                <p className="promo-stat-card__value">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="cm-form-card">
          <div className="cm-form-card__title">Tạo đối tượng mới</div>
          <div className="cm-form-grid">
            <div className="cm-field">
              <label>Tên đối tượng *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Khách hàng VIP tháng 3" />
            </div>
            <div className="cm-field">
              <label>Mô tả</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn về nhóm đối tượng" />
            </div>
          </div>
          <div className="cm-conditions-title">Điều kiện lọc</div>
          {conditions.map((c, idx) => (
            <div className="cm-condition-row" key={idx}>
              <select value={c.field} onChange={e => updateCondition(idx, "field", e.target.value)}>
                <option value="">-- Chọn trường --</option>
                <option>Hạng thành viên</option>
                <option>Tổng chi tiêu</option>
                <option>Ngày không mua</option>
                <option>Tần suất mua</option>
                <option>Khu vực</option>
                <option>Tháng sinh nhật</option>
                <option>Số đơn hàng</option>
              </select>
              <select value={c.operator} onChange={e => updateCondition(idx, "operator", e.target.value)}>
                <option value="">-- Toán tử --</option>
                <option>bằng</option>
                <option>lớn hơn</option>
                <option>nhỏ hơn</option>
                <option>trong nhóm</option>
              </select>
              <input value={c.value} onChange={e => updateCondition(idx, "value", e.target.value)} placeholder="Giá trị..." />
              {conditions.length > 1 && (
                <button className="cm-remove-btn" onClick={() => removeCondition(idx)}>✕</button>
              )}
            </div>
          ))}
          <button className="cm-add-condition" onClick={addCondition}>+ Thêm điều kiện</button>
          <div className="cm-form-actions">
            <button className="cm-btn cm-btn--secondary" onClick={() => setShowCreate(false)}>Hủy</button>
            <button className="cm-btn cm-btn--primary" onClick={() => { alert("Đã tạo đối tượng (demo)"); setShowCreate(false); }}>Lưu đối tượng</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="cm-toolbar">
        <div className="cm-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input placeholder="Tìm đối tượng..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Audience list */}
      <div className="cm-audience-list">
        {filtered.map(a => (
          <div className="cm-audience-row" key={a.id}>
            <div className="cm-audience-row__left">
              <div className="cm-audience-row__name">{a.name}</div>
              <div className="cm-audience-row__conditions">
                {a.conditions.map(c => (
                  <span key={c} className="cm-condition-pill">{c}</span>
                ))}
              </div>
              <div className="cm-audience-row__meta">Cập nhật: {a.lastUpdated}</div>
            </div>
            <div className="cm-audience-count">
              <div className="cm-audience-count__num">{a.count.toLocaleString()}</div>
              <div className="cm-audience-count__lbl">khách hàng</div>
            </div>
            <div className="cm-audience-row__actions">
              <button className="cm-btn cm-btn--secondary cm-btn--sm">Chỉnh sửa</button>
              <button
                className="cm-btn cm-btn--primary cm-btn--sm"
                onClick={() => alert(`Tạo chiến dịch cho "${a.name}" (demo)`)}
              >
                🚀 Tạo chiến dịch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
