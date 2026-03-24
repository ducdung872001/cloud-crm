import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import Badge from "components/badge/badge";
import "./ContentTemplatePage.scss";

type Channel = "SMS" | "Zalo" | "Email" | "App";

interface Template {
  id: number;
  name: string;
  channel: Channel;
  category: string;
  content: string;
  usedCount: number;
  lastUsed: string;
}

const MOCK_TEMPLATES: Template[] = [
  { id: 1, name: "Chúc mừng sinh nhật", channel: "SMS", category: "Sinh nhật", content: "{{ten_kh}} ơi, chúc mừng sinh nhật bạn! Tặng bạn ưu đãi 20% hôm nay. Xem chi tiết: {{link}}", usedCount: 45, lastUsed: "15/03/2026" },
  { id: 2, name: "Flash Sale thông báo", channel: "SMS", category: "Khuyến mãi", content: "🔥 FLASH SALE! {{ten_km}} giảm đến {{phan_tram}}%. Áp dụng đến {{ngay_het_han}}. Mua ngay: {{link}}", usedCount: 23, lastUsed: "14/03/2026" },
  { id: 3, name: "Nhắc điểm sắp hết hạn", channel: "Zalo", category: "Loyalty", content: "Xin chào {{ten_kh}}, {{so_diem}} điểm của bạn sẽ hết hạn vào {{ngay_het_han}}. Đổi điểm ngay tại đây: {{link}}", usedCount: 12, lastUsed: "12/03/2026" },
  { id: 4, name: "Chào mừng thành viên mới", channel: "Email", category: "Onboarding", content: "Chào mừng {{ten_kh}} đến với cộng đồng của chúng tôi! Bạn vừa nhận được {{so_diem}} điểm chào mừng.", usedCount: 67, lastUsed: "20/03/2026" },
  { id: 5, name: "Push sale cuối tuần", channel: "App", category: "Khuyến mãi", content: "📣 Weekend Sale! Giảm {{phan_tram}}% cho tất cả sản phẩm. Áp dụng đến hết {{ngay_het_han}}.", usedCount: 8, lastUsed: "08/03/2026" },
  { id: 6, name: "Tái kích hoạt khách cũ", channel: "SMS", category: "Retention", content: "{{ten_kh}} ơi, bạn đã lâu không ghé thăm chúng tôi. Ưu đãi {{phan_tram}}% dành riêng cho bạn hôm nay!", usedCount: 31, lastUsed: "10/03/2026" },
];

const CHANNEL_CONFIG = {
  SMS:   { color: "#15803D", bg: "#DCFCE7" },
  Zalo:  { color: "#1D4ED8", bg: "#DBEAFE" },
  Email: { color: "#C2410C", bg: "#FFEDD5" },
  App:   { color: "#7E22CE", bg: "#F3E8FF" },
};

const CATEGORIES = ["Tất cả", "Sinh nhật", "Khuyến mãi", "Loyalty", "Onboarding", "Retention"];

export default function ContentTemplatePage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Mẫu nội dung";

  const [filterChannel, setFilterChannel] = useState<Channel | "all">("all");
  const [filterCategory, setFilterCategory] = useState("Tất cả");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", channel: "SMS" as Channel, category: "", content: "" });
  const [preview, setPreview] = useState<Template | null>(null);

  const filtered = MOCK_TEMPLATES.filter(t => {
    if (filterChannel !== "all" && t.channel !== filterChannel) return false;
    if (filterCategory !== "Tất cả" && t.category !== filterCategory) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-content">
      <TitleAction
        title="Mẫu nội dung"
        breadcrumb={[{ title: "Chiến dịch Marketing", onClick: () => onBackProps(true) }]}
        listRightAction={[
          { title: "+ Tạo mẫu mới", type: "primary", onClick: () => setShowCreate(true) },
        ]}
      />

      {/* Create form */}
      {showCreate && (
        <div className="ct-create-form">
          <div className="ct-create-form__title">Tạo mẫu nội dung mới</div>
          <div className="ct-form-row">
            <div className="cm-field">
              <label>Tên mẫu *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Chúc mừng sinh nhật SMS" />
            </div>
            <div className="cm-field">
              <label>Kênh *</label>
              <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value as Channel})}>
                <option value="SMS">SMS</option>
                <option value="Zalo">Zalo / OTT</option>
                <option value="Email">Email</option>
                <option value="App">Push Notification</option>
              </select>
            </div>
            <div className="cm-field">
              <label>Danh mục</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="">-- Chọn danh mục --</option>
                <option>Sinh nhật</option>
                <option>Khuyến mãi</option>
                <option>Loyalty</option>
                <option>Onboarding</option>
                <option>Retention</option>
                <option>Thông báo</option>
              </select>
            </div>
          </div>
          <div className="cm-field">
            <label>Nội dung mẫu *</label>
            <textarea
              rows={form.channel === "Email" ? 8 : 4}
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})}
              placeholder="Nhập nội dung. Dùng {{ten_kh}}, {{so_diem}}, {{link}} để chèn dữ liệu động..."
            />
          </div>
          <div className="ct-placeholder-hint">
            Biến động: <code>{"{{ten_kh}}"}</code> <code>{"{{so_diem}}"}</code> <code>{"{{phan_tram}}"}</code> <code>{"{{ngay_het_han}}"}</code> <code>{"{{link}}"}</code>
          </div>
          <div className="ct-form-actions">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Hủy</button>
            <button className="btn-primary" onClick={() => { alert("Đã lưu mẫu (demo)"); setShowCreate(false); }}>Lưu mẫu</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="ct-filters">
        <input className="re-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mẫu nội dung..." />
        <div className="ct-filter-channels">
          {(["all", "SMS", "Zalo", "Email", "App"] as const).map(ch => (
            <button
              key={ch}
              className={`cm-filter-btn ${filterChannel === ch ? "cm-filter-btn--active" : ""}`}
              onClick={() => setFilterChannel(ch as any)}
            >
              {ch === "all" ? "Tất cả kênh" : ch}
            </button>
          ))}
        </div>
        <div className="ct-filter-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`ct-cat-btn ${filterCategory === cat ? "ct-cat-btn--active" : ""}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div className="ct-template-grid">
        {filtered.map(t => {
          const chCfg = CHANNEL_CONFIG[t.channel];
          return (
            <div className="ct-template-card" key={t.id}>
              <div className="ct-template-card__header">
                <span className="ct-channel-pill" style={{ background: chCfg.bg, color: chCfg.color }}>{t.channel}</span>
                <span className="ct-category-pill">{t.category}</span>
              </div>
              <div className="ct-template-card__name">{t.name}</div>
              <div className="ct-template-card__content">{t.content}</div>
              <div className="ct-template-card__footer">
                <span className="ct-template-card__usage">Đã dùng: {t.usedCount} lần</span>
                <span className="ct-template-card__date">{t.lastUsed}</span>
              </div>
              <div className="ct-template-card__actions">
                <button className="cm-action-btn" onClick={() => setPreview(t)}>Xem trước</button>
                <button className="cm-action-btn">Chỉnh sửa</button>
                <button className="cm-action-btn cm-action-btn--primary" onClick={() => alert(`Dùng mẫu "${t.name}" cho chiến dịch (demo)`)}>
                  Dùng mẫu
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="ct-preview-overlay" onClick={() => setPreview(null)}>
          <div className="ct-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="ct-preview-modal__title">Xem trước: {preview.name}</div>
            <div className="ct-preview-phone">
              <div className="ct-preview-phone__screen">
                <div className="ct-preview-bubble">{preview.content}</div>
              </div>
            </div>
            <button className="btn-secondary ct-preview-close" onClick={() => setPreview(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
