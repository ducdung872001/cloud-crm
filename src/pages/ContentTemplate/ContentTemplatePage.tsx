import React, { useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
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
  { id: 1, name: "Chúc mừng sinh nhật",     channel: "SMS",   category: "Sinh nhật",  content: "{{ten_kh}} ơi, chúc mừng sinh nhật! Tặng bạn ưu đãi 20% hôm nay. Xem: {{link}}", usedCount: 45, lastUsed: "15/03/2026" },
  { id: 2, name: "Flash Sale thông báo",    channel: "SMS",   category: "Khuyến mãi", content: "🔥 FLASH SALE! {{ten_km}} giảm {{phan_tram}}%. Mua ngay: {{link}}", usedCount: 23, lastUsed: "14/03/2026" },
  { id: 3, name: "Nhắc điểm sắp hết hạn",  channel: "Zalo",  category: "Loyalty",    content: "{{ten_kh}} ơi, {{so_diem}} điểm sắp hết hạn vào {{ngay_het_han}}. Đổi ngay: {{link}}", usedCount: 12, lastUsed: "12/03/2026" },
  { id: 4, name: "Chào mừng thành viên",    channel: "Email", category: "Onboarding", content: "Chào mừng {{ten_kh}}! Bạn vừa nhận {{so_diem}} điểm chào mừng.", usedCount: 67, lastUsed: "20/03/2026" },
  { id: 5, name: "Push sale cuối tuần",     channel: "App",   category: "Khuyến mãi", content: "📣 Weekend Sale! Giảm {{phan_tram}}% hết {{ngay_het_han}}.", usedCount: 8,  lastUsed: "08/03/2026" },
  { id: 6, name: "Tái kích hoạt khách cũ", channel: "SMS",   category: "Retention",  content: "{{ten_kh}} ơi, lâu rồi chưa gặp! Ưu đãi {{phan_tram}}% dành riêng cho bạn hôm nay!", usedCount: 31, lastUsed: "10/03/2026" },
];

const CH_CFG = {
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
  const [search, setSearch]   = useState("");
  const [showCreate, setCreate] = useState(false);
  const [preview, setPreview] = useState<Template | null>(null);
  const [form, setForm]       = useState({ name: "", channel: "SMS" as Channel, category: "", content: "" });

  const titleActions: ITitleActions = {
    actions: [{ title: "+ Tạo mẫu mới", color: "primary", callback: () => setCreate(true) }],
  };

  const filtered = MOCK_TEMPLATES.filter(t => {
    if (filterChannel !== "all" && t.channel !== filterChannel) return false;
    if (filterCategory !== "Tất cả" && t.category !== filterCategory) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Mẫu nội dung"
        titleBack="Chiến dịch Marketing"
        titleActions={showCreate ? undefined : titleActions}
        onBackProps={onBackProps}
      />

      {/* Create form */}
      {showCreate && (
        <div className="ct-form-card">
          <div className="ct-form-card__title">Tạo mẫu nội dung mới</div>
          <div className="ct-form-row">
            <div className="cm-field">
              <label>Tên mẫu *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Chúc mừng sinh nhật SMS" />
            </div>
            <div className="cm-field">
              <label>Kênh *</label>
              <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value as Channel })}>
                <option value="SMS">SMS</option>
                <option value="Zalo">Zalo / OTT</option>
                <option value="Email">Email</option>
                <option value="App">Push Notification</option>
              </select>
            </div>
            <div className="cm-field">
              <label>Danh mục</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">-- Chọn danh mục --</option>
                {CATEGORIES.filter(c => c !== "Tất cả").map(c => <option key={c}>{c}</option>)}
                <option>Thông báo</option>
              </select>
            </div>
          </div>
          <div className="cm-field">
            <label>Nội dung mẫu *</label>
            <textarea rows={form.channel === "Email" ? 7 : 4} value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Dùng {{ten_kh}}, {{so_diem}}, {{phan_tram}}, {{ngay_het_han}}, {{link}} để chèn dữ liệu động..." />
          </div>
          <div className="ct-placeholder-hint">
            Biến động: <code>{"{{ten_kh}}"}</code> <code>{"{{so_diem}}"}</code> <code>{"{{phan_tram}}"}</code> <code>{"{{ngay_het_han}}"}</code> <code>{"{{link}}"}</code>
          </div>
          <div className="ct-form-actions">
            <button className="cm-btn cm-btn--secondary" onClick={() => setCreate(false)}>Hủy</button>
            <button className="cm-btn cm-btn--primary" onClick={() => { alert("Đã lưu mẫu (demo)"); setCreate(false); }}>Lưu mẫu</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="ct-filters">
        <div className="cm-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input placeholder="Tìm mẫu nội dung..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="ct-filter-row">
          {(["all", "SMS", "Zalo", "Email", "App"] as const).map(ch => (
            <button key={ch} className={`cm-filter-btn ${filterChannel === ch ? "cm-filter-btn--active" : ""}`}
              onClick={() => setFilterChannel(ch as any)}>
              {ch === "all" ? "Tất cả kênh" : ch}
            </button>
          ))}
        </div>
        <div className="ct-filter-row">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`ct-cat-btn ${filterCategory === cat ? "ct-cat-btn--active" : ""}`}
              onClick={() => setFilterCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div className="ct-template-grid">
        {filtered.map(t => {
          const cfg = CH_CFG[t.channel];
          return (
            <div className="ct-template-card" key={t.id}>
              <div className="ct-template-card__header">
                <span className="ct-channel-pill" style={{ background: cfg.bg, color: cfg.color }}>{t.channel}</span>
                <span className="ct-cat-pill">{t.category}</span>
              </div>
              <div className="ct-template-card__name">{t.name}</div>
              <div className="ct-template-card__content">{t.content}</div>
              <div className="ct-template-card__footer">
                <span>Đã dùng: {t.usedCount} lần</span>
                <span>{t.lastUsed}</span>
              </div>
              <div className="ct-template-card__actions">
                <button className="cm-btn cm-btn--secondary cm-btn--sm" onClick={() => setPreview(t)}>Xem trước</button>
                <button className="cm-btn cm-btn--secondary cm-btn--sm">Chỉnh sửa</button>
                <button className="cm-btn cm-btn--primary cm-btn--sm" onClick={() => alert(`Dùng mẫu "${t.name}" (demo)`)}>Dùng mẫu</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview overlay */}
      {preview && (
        <div className="ct-preview-overlay" onClick={() => setPreview(null)}>
          <div className="ct-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="ct-preview-modal__title">Xem trước: {preview.name}</div>
            <div className="ct-preview-phone">
              <div className="ct-preview-phone__screen">
                <div className="ct-preview-bubble">{preview.content}</div>
              </div>
            </div>
            <button className="cm-btn cm-btn--secondary" style={{ width: "100%" }} onClick={() => setPreview(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
