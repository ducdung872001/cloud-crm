import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import Badge from "components/badge/badge";
import "./CampaignManagementPage.scss";

interface Segment {
  id: number;
  name: string;
  count: number;
  conditions: string[];
  status: "active" | "pending";
  lastUpdated: string;
}

const MOCK_SEGMENTS: Segment[] = [
  { id: 1, name: "Khách hàng hưu trí", count: 1240, conditions: ["Tuổi > 55", "Tổng chi tiêu > 5M"], status: "active", lastUpdated: "20/03/2026" },
  { id: 2, name: "Khách hàng VIP - Mua thường xuyên", count: 875, conditions: ["Hạng Vàng/Kim Cương", "Tần suất mua ≤ 14 ngày"], status: "active", lastUpdated: "18/03/2026" },
  { id: 3, name: "Khách hàng nguy cơ rời bỏ", count: 175, conditions: ["Ngày không mua ≥ 60", "Đã mua ≥ 2 lần"], status: "active", lastUpdated: "24/03/2026" },
  { id: 4, name: "Sinh nhật tháng 3", count: 234, conditions: ["Tháng sinh nhật = 3"], status: "active", lastUpdated: "01/03/2026" },
  { id: 5, name: "Hội viên mới 30 ngày", count: 612, conditions: ["Ngày đăng ký ≤ 30 ngày trước"], status: "active", lastUpdated: "24/03/2026" },
];

export default function CustomerSegmentBridge({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Phân khúc khách hàng";
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });

  const filtered = MOCK_SEGMENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <TitleAction
        title="Phân khúc khách hàng"
        breadcrumb={[{ title: "Chiến dịch Marketing", onClick: () => onBackProps(true) }]}
        listRightAction={[
          { title: "+ Tạo phân khúc", type: "primary", onClick: () => setShowCreate(true) },
        ]}
      />

      <div className="cs-bridge-note">
        <div className="cs-bridge-note__icon">💡</div>
        <div>
          <strong>Phân khúc được tạo tại đây</strong> sẽ được dùng để chọn đối tượng khi tạo chiến dịch.
          Phân tích chi tiết hơn xem tại <span className="cs-bridge-note__link">Phân tích khách hàng</span>.
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="cs-create-form">
          <div className="cs-create-form__title">Tạo phân khúc mới</div>
          <div className="cs-form-row">
            <div className="cm-field">
              <label>Tên phân khúc *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Khách hàng VIP tháng 3" />
            </div>
            <div className="cm-field">
              <label>Mô tả</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Mô tả ngắn về phân khúc" />
            </div>
          </div>
          <div className="cs-conditions-title">Điều kiện lọc</div>
          <div className="cs-condition-builder">
            <div className="cs-condition-row">
              <select><option>Hạng thành viên</option><option>Tổng chi tiêu</option><option>Ngày không mua</option><option>Tần suất mua</option><option>Khu vực</option><option>Tuổi</option></select>
              <select><option>bằng</option><option>lớn hơn</option><option>nhỏ hơn</option><option>trong nhóm</option></select>
              <input placeholder="Giá trị..." />
              <button className="cs-remove-condition">✕</button>
            </div>
            <button className="cs-add-condition">+ Thêm điều kiện</button>
          </div>
          <div className="cs-form-actions">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Hủy</button>
            <button className="btn-primary" onClick={() => { alert("Đã tạo phân khúc (demo)"); setShowCreate(false); }}>Lưu phân khúc</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="cs-toolbar">
        <input className="re-search" placeholder="Tìm phân khúc..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Segments list */}
      <div className="cs-segments-list">
        {filtered.map(seg => (
          <div className="cs-segment-row" key={seg.id}>
            <div className="cs-segment-row__left">
              <div className="cs-segment-row__name">{seg.name}</div>
              <div className="cs-segment-row__conditions">
                {seg.conditions.map(c => (
                  <span key={c} className="cs-condition-pill">{c}</span>
                ))}
              </div>
              <div className="cs-segment-row__meta">Cập nhật: {seg.lastUpdated}</div>
            </div>
            <div className="cs-segment-row__count">
              <div className="cs-count-num">{seg.count.toLocaleString()}</div>
              <div className="cs-count-label">khách hàng</div>
            </div>
            <div className="cs-segment-row__right">
              <Badge variant="success">Đã phê duyệt</Badge>
              <div className="cs-segment-actions">
                <button className="cm-action-btn">Xem</button>
                <button className="cm-action-btn cm-action-btn--primary" onClick={() => alert(`Tạo chiến dịch cho phân khúc "${seg.name}" (demo)`)}>
                  🚀 Tạo chiến dịch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
